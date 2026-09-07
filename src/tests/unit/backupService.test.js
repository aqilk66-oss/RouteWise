import { describe, it, expect } from 'vitest';
import { backupManifestService } from '../../services/backup/backupManifestService';

describe('Stage 26: Backup Manifest & Age Health Engine', () => {
  describe('evaluateBackupAgeHealth', () => {
    it('identifies backup as current when <= 24 hours old', () => {
      const fiveHoursAgo = Date.now() - (5 * 60 * 60 * 1000);
      const res = backupManifestService.evaluateBackupAgeHealth(fiveHoursAgo);
      expect(res.status).toBe('current');
      expect(res.hoursSince).toBe(5);
    });

    it('identifies backup as aging when between 24 and 72 hours old', () => {
      const thirtyHoursAgo = Date.now() - (30 * 60 * 60 * 1000);
      const res = backupManifestService.evaluateBackupAgeHealth(thirtyHoursAgo);
      expect(res.status).toBe('aging');
      expect(res.hoursSince).toBe(30);
    });

    it('identifies backup as overdue when > 72 hours old', () => {
      const fourDaysAgo = Date.now() - (96 * 60 * 60 * 1000);
      const res = backupManifestService.evaluateBackupAgeHealth(fourDaysAgo);
      expect(res.status).toBe('overdue');
      expect(res.hoursSince).toBe(96);
    });

    it('handles missing or null timestamps gracefully as overdue', () => {
      const res = backupManifestService.evaluateBackupAgeHealth(null);
      expect(res.status).toBe('overdue');
      expect(res.hoursSince).toBeNull();
    });
  });
});
