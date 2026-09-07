import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { ATTENDANCE_STATUS } from '../../constants/collections';
import { ShieldAlert, AlertCircle } from 'lucide-react';

export const AttendanceCorrectionModal = ({
  isOpen = false,
  onClose,
  record = null,
  studentName = 'Student',
  onConfirmCorrection,
  loading = false,
}) => {
  const [newStatus, setNewStatus] = useState(record?.status || ATTENDANCE_STATUS.BOARDED);
  const [reason, setReason] = useState('');
  const [error, setError] = useState(null);

  React.useEffect(() => {
    if (record) {
      setNewStatus(record.status || ATTENDANCE_STATUS.BOARDED);
      setReason('');
      setError(null);
    }
  }, [record]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason || reason.trim().length < 5) {
      setError('Please provide a specific operational reason (minimum 5 characters).');
      return;
    }
    setError(null);

    try {
      await onConfirmCorrection({
        attendanceId: record.id,
        newStatus,
        reason: reason.trim(),
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit correction.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Correct Attendance Record"
      subtitle={`Audit-tracked modification for ${studentName}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            Attendance corrections are permanent and recorded in the audit log. The prior state, your user identity, and the operational reason will be preserved.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <span className="text-[10px] font-bold uppercase text-brand-slate">Current Status</span>
            <p className="font-bold text-brand-navy capitalize mt-0.5">
              {record?.status || 'Not Recorded'}
            </p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-brand-slate">Record Date</span>
            <p className="font-bold text-brand-navy mt-0.5">
              {record?.date || 'Today'}
            </p>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-brand-navy mb-1.5">
            Updated Status *
          </label>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-border text-xs text-brand-navy bg-white focus:ring-2 focus:ring-brand-blue/30 outline-none"
          >
            <option value={ATTENDANCE_STATUS.NOT_RECORDED}>Pending / Not Recorded</option>
            <option value={ATTENDANCE_STATUS.BOARDED}>Boarded</option>
            <option value={ATTENDANCE_STATUS.DROPPED_OFF}>Dropped Off</option>
            <option value={ATTENDANCE_STATUS.ABSENT}>Marked Absent</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-brand-navy mb-1.5">
            Operational Correction Reason *
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="E.g., Guardian called dispatch confirming student was picked up at school gate by authorized family member."
            rows={3}
            className="w-full px-3 py-2 rounded-xl border border-border text-xs text-brand-navy focus:ring-2 focus:ring-brand-blue/30 outline-none"
          />
        </div>

        <div className="pt-3 border-t border-border flex items-center justify-end gap-3">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={loading}>
            Save Audit Correction
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AttendanceCorrectionModal;
