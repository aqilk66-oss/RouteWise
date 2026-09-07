import createFirestoreService from './baseFirestoreService';
import { COLLECTIONS, DOCUMENT_STATUS } from '../../constants/collections';

const baseService = createFirestoreService(COLLECTIONS.VEHICLE_DOCUMENTS);

/**
 * Evaluates document validity based on expiry date
 */
export const evaluateDocumentExpiry = (expiresAt) => {
  if (!expiresAt) return DOCUMENT_STATUS.MISSING;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiresAt);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      status: DOCUMENT_STATUS.EXPIRED,
      daysRemaining: diffDays,
      label: 'Expired',
      message: `Expired ${Math.abs(diffDays)} day(s) ago.`,
    };
  }

  if (diffDays <= 30) {
    return {
      status: DOCUMENT_STATUS.EXPIRING_SOON,
      daysRemaining: diffDays,
      label: 'Expiring Soon',
      message: `Expires in ${diffDays} day(s).`,
    };
  }

  return {
    status: DOCUMENT_STATUS.VALID,
    daysRemaining: diffDays,
    label: 'Valid',
    message: `Valid for ${diffDays} day(s).`,
  };
};

/**
 * Vehicle Document Management Firestore Service
 */
export const vehicleDocumentService = {
  ...baseService,

  evaluateDocumentExpiry,

  /**
   * Create document record with auto-calculated status
   */
  createDocument: async (data) => {
    if (!data.busId || !data.documentType) {
      throw new Error('Document requires busId and documentType.');
    }

    const expiryEval = evaluateDocumentExpiry(data.expiresAt);

    const docRecord = {
      documentId: data.documentId || `DOC-${Date.now().toString().slice(-6)}`,
      busId: data.busId,
      documentType: data.documentType, // 'Registration', 'Insurance', 'Inspection Certificate', 'Permit'
      documentNumber: data.documentNumber || '',
      issuedAt: data.issuedAt || new Date().toISOString().split('T')[0],
      expiresAt: data.expiresAt || null,
      status: expiryEval.status,
      fileURL: data.fileURL || null,
      uploadedBy: data.uploadedBy || 'Admin',
      notes: data.notes || '',
      schoolId: data.schoolId || 'main-campus',
    };

    return baseService.create(docRecord);
  },

  /**
   * Query documents by Bus ID
   */
  getByBusId: async (busId) => {
    return baseService.getAll({
      filters: [['busId', '==', busId]],
      sortBy: 'expiresAt',
      sortDirection: 'asc',
    });
  },
};

export default vehicleDocumentService;
