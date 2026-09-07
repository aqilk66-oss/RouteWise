import { describe, it, expect, vi, beforeEach } from 'vitest';
import { auditService } from '../../services/admin/auditService';
import { db } from '../../firebase/firebaseConfig';
import * as firestore from 'firebase/firestore';

// Mock Firestore modular functions
vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    collection: vi.fn(),
    addDoc: vi.fn(),
    getDocs: vi.fn(),
    getDoc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    serverTimestamp: vi.fn(() => ({ toDate: () => new Date() })),
  };
});

describe('Audit Service & Append-Only Immutability', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should log an event successfully with actor, severity, and metadata', async () => {
    firestore.addDoc.mockResolvedValueOnce({ id: 'mock-audit-123' });

    const auditRecord = await auditService.logEvent({
      actorUserId: 'admin-user-1',
      actorRole: 'admin',
      action: 'USER_ACTIVATED',
      resourceType: 'user',
      resourceId: 'target-student-9',
      description: 'Account activated after verification',
      severity: 'info',
      schoolId: 'campus-1'
    });

    expect(firestore.addDoc).toHaveBeenCalledTimes(1);
    expect(auditRecord).toBeDefined();
    expect(auditRecord.id).toBe('mock-audit-123');
    expect(auditRecord.action).toBe('USER_ACTIVATED');
  });

  it('should guarantee immutability by NOT exporting update or delete methods', () => {
    expect(auditService.updateAuditLog).toBeUndefined();
    expect(auditService.deleteAuditLog).toBeUndefined();
    expect(auditService.modifyLog).toBeUndefined();
    expect(auditService.removeLog).toBeUndefined();
  });

  it('should query audit logs safely with bounded limits', async () => {
    const mockSnap = {
      docs: [
        {
          id: 'log-1',
          data: () => ({
            action: 'SCHOOL_CREATED',
            description: 'New campus registered',
            severity: 'info',
            timestamp: { toDate: () => new Date() }
          })
        }
      ]
    };
    firestore.getDocs.mockResolvedValueOnce(mockSnap);

    const logs = await auditService.getAuditLogs({ pageSize: 10 });
    expect(firestore.getDocs).toHaveBeenCalledTimes(1);
    expect(logs).toHaveLength(1);
    expect(logs[0].id).toBe('log-1');
    expect(logs[0].action).toBe('SCHOOL_CREATED');
  });
});
