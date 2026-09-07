import createFirestoreService from '../firestore/baseFirestoreService';
import { COLLECTIONS } from '../../constants/collections';
import { auditService } from '../admin/auditService';
import {
  routeService,
  busService,
  driverService,
  studentService,
} from '../firestore';
import { schoolService } from '../admin/schoolService';

const baseService = createFirestoreService(COLLECTIONS.RECOVERY_BIN);

/**
 * Super Admin Recovery Bin & Soft-Delete Recovery Service
 * 
 * Provides controlled un-deletion of archived operational entities
 * with deterministic relational integrity validation.
 */
export const recoveryBinService = {
  ...baseService,

  /**
   * Validate relational integrity before un-deleting/restoring an entity
   * Ensures that referenced parents, buses, drivers, routes, or schools still exist.
   */
  validateEntityRelationships: async (entityType, entityData) => {
    const missingRelations = [];

    try {
      if (entityType === 'routes' || entityType === 'route') {
        if (entityData.assignedBusId) {
          const bus = await busService.getById(entityData.assignedBusId);
          if (!bus) missingRelations.push(`Assigned Bus (${entityData.assignedBusId})`);
        }
        if (entityData.assignedDriverId) {
          const driver = await driverService.getById(entityData.assignedDriverId);
          if (!driver) missingRelations.push(`Assigned Driver (${entityData.assignedDriverId})`);
        }
      } else if (entityType === 'students' || entityType === 'student') {
        if (entityData.routeId) {
          const route = await routeService.getById(entityData.routeId);
          if (!route) missingRelations.push(`Assigned Route (${entityData.routeId})`);
        }
      } else if (entityType === 'buses' || entityType === 'bus') {
        // Buses are independent base entities
      }

      return {
        canRestore: missingRelations.length === 0,
        missingRelations,
        diagnosticMessage: missingRelations.length === 0
          ? 'All relational dependencies verified in active collections.'
          : `Cannot restore cleanly: Missing referenced ${missingRelations.join(', ')}.`,
      };
    } catch (err) {
      return {
        canRestore: false,
        missingRelations: ['Internal check error'],
        diagnosticMessage: err.message,
      };
    }
  },

  /**
   * Send an entity to the recovery bin (soft deletion)
   */
  archiveEntityToRecoveryBin: async ({
    entityType,
    entityId,
    originalData,
    reason = 'Administrative archival',
    actor = { uid: 'system', name: 'Super Admin', role: 'superAdmin' },
  }) => {
    const binItem = {
      entityType,
      entityId,
      originalData,
      reason,
      archivedAt: new Date().toISOString(),
      archivedBy: actor.uid,
      archivedByName: actor.name,
      restored: false,
    };

    const docRef = await baseService.create(binItem);

    await auditService.logEvent({
      actorUserId: actor.uid,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'ENTITY_ARCHIVED_TO_RECOVERY_BIN',
      resourceType: entityType,
      resourceId: entityId,
      description: `Archived ${entityType} [${entityId}] to Recovery Bin. Reason: ${reason}.`,
      severity: 'info',
    });

    return { id: docRef.id, ...binItem };
  },

  /**
   * Restore an archived entity back to active service after validating dependencies
   */
  restoreEntityFromRecoveryBin: async (binRecordId, actor = { uid: 'system', name: 'Super Admin', role: 'superAdmin' }) => {
    const binItem = await baseService.getById(binRecordId);
    if (!binItem) throw new Error(`Recovery bin item [${binRecordId}] not found.`);
    if (binItem.restored) throw new Error('This record has already been restored.');

    // 1. Validate relational integrity
    const validation = await recoveryBinService.validateEntityRelationships(binItem.entityType, binItem.originalData);
    if (!validation.canRestore) {
      throw new Error(validation.diagnosticMessage);
    }

    // 2. Select appropriate domain service to restore
    let domainService = null;
    if (binItem.entityType === 'buses' || binItem.entityType === 'bus') domainService = busService;
    else if (binItem.entityType === 'routes' || binItem.entityType === 'route') domainService = routeService;
    else if (binItem.entityType === 'students' || binItem.entityType === 'student') domainService = studentService;

    if (!domainService) {
      throw new Error(`Restoration for entity type [${binItem.entityType}] is not supported.`);
    }

    // 3. Re-create or reactivate in active domain collection preserving original entity ID
    const restoredPayload = {
      ...binItem.originalData,
      status: 'active',
      restoredAt: new Date().toISOString(),
      restoredBy: actor.uid,
      restoredFromBinId: binRecordId,
    };

    await domainService.createWithId(binItem.entityId, restoredPayload);

    // 4. Mark recovery bin record as restored
    await baseService.update(binRecordId, {
      restored: true,
      restoredAt: new Date().toISOString(),
      restoredBy: actor.uid,
    });

    // 5. Immutable Audit
    await auditService.logEvent({
      actorUserId: actor.uid,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'ENTITY_RESTORED_FROM_RECOVERY_BIN',
      resourceType: binItem.entityType,
      resourceId: binItem.entityId,
      description: `Restored ${binItem.entityType} [${binItem.entityId}] from Recovery Bin back into active fleet operations.`,
      severity: 'info',
      metadata: { binRecordId, entityType: binItem.entityType },
    });

    return { success: true, restoredRecord: restoredPayload };
  },
};

export default recoveryBinService;
