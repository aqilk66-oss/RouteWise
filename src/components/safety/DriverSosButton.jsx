import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Phone, 
  Radio, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  X,
  Send
} from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { EMERGENCY_DISCLAIMER } from '../../constants/incidentConstants';

/**
 * DriverSosButton
 * Prominent, high-contrast emergency control with two-step confirmation modal.
 * Transmits trip context and existing GPS position without starting a continuous loop.
 */
export const DriverSosButton = ({
  activeTrip = null,
  assignedBus = null,
  assignedRoute = null,
  onTriggerSos,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState('Critical Safety / Vehicle Emergency');
  const [confirmedCheck, setConfirmedCheck] = useState(false);

  const handleOpenModal = () => {
    setConfirmedCheck(false);
    setIsOpen(true);
  };

  const handleConfirmSos = async () => {
    if (!confirmedCheck) return;
    setSubmitting(true);
    try {
      if (onTriggerSos) {
        await onTriggerSos({
          reason: emergencyReason,
          trip: activeTrip,
          bus: assignedBus,
          route: assignedRoute,
        });
      }
      setIsOpen(false);
    } catch (err) {
      console.error('SOS dispatch error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className={`p-6 rounded-3xl bg-gradient-to-br from-rose-900 via-rose-950 to-slate-950 text-white border-2 border-rose-500/60 shadow-xl ${className}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-rose-600/30 text-rose-300 border border-rose-500/40 animate-pulse">
              <ShieldAlert className="w-8 h-8 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded-md border border-rose-800">
                  Priority Safety Control
                </span>
              </div>
              <h2 className="text-lg font-black text-white tracking-tight mt-1">
                Emergency SOS Broadcast
              </h2>
              <p className="text-xs text-rose-200/80 mt-0.5">
                Instant high-priority distress alert to transportation dispatch & campus response.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenModal}
            disabled={disabled}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-black text-sm tracking-wide uppercase shadow-lg shadow-rose-900/50 transition-all flex items-center justify-center gap-2 border border-rose-400 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Initiate Emergency SOS"
          >
            <ShieldAlert className="w-5 h-5" />
            <span>Trigger SOS</span>
          </button>
        </div>

        {/* Disclaimer Note */}
        <p className="text-[11px] text-rose-300/70 mt-4 pt-3 border-t border-rose-800/60 leading-relaxed">
          {EMERGENCY_DISCLAIMER}
        </p>
      </div>

      {/* Deliberate Confirmation Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => !submitting && setIsOpen(false)}
        title="Confirm Emergency SOS Broadcast"
        size="md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">You are initiating a high-priority emergency alert.</p>
              <p className="text-[11px] text-rose-700 mt-1 leading-relaxed">
                This will immediately broadcast a critical distress notification to School Transport Central, alerting all dispatch monitors with your vehicle info and last recorded GPS location.
              </p>
            </div>
          </div>

          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-brand-navy">
            <div>
              <span className="text-slate-400 block text-[11px]">Active Transit Run</span>
              <strong className="text-xs">{activeTrip?.routeName || assignedRoute?.name || 'Assigned Corridor'}</strong>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 block text-[11px]">Bus Vehicle</span>
                <strong className="text-xs">{activeTrip?.busNumber || assignedBus?.busNumber || 'Fleet Bus'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Assigned Driver</span>
                <strong className="text-xs">{activeTrip?.driverName || 'Current Operator'}</strong>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-brand-navy mb-1">
              Select Nature of Emergency
            </label>
            <select
              value={emergencyReason}
              onChange={(e) => setEmergencyReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs font-medium focus:ring-2 focus:ring-rose-500/30 outline-none"
            >
              <option value="Critical Safety / Vehicle Emergency">Critical Safety / Vehicle Emergency</option>
              <option value="Traffic Collision / Accident">Traffic Collision / Accident</option>
              <option value="Passenger Medical Emergency">Passenger Medical Emergency</option>
              <option value="Physical Obstruction / Hostile Road Hazard">Physical Obstruction / Road Hazard</option>
              <option value="Security / Threat Incident">Security / Threat Incident</option>
            </select>
          </div>

          {/* Deliberate Acknowledgment Checkbox */}
          <label className="flex items-start gap-2.5 p-3 rounded-xl border border-border bg-white cursor-pointer hover:bg-slate-50">
            <input
              type="checkbox"
              checked={confirmedCheck}
              onChange={(e) => setConfirmedCheck(e.target.checked)}
              className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
            />
            <span className="text-brand-slate font-medium text-[11px]">
              I confirm this is an active operational safety emergency requiring immediate administrative response.
            </span>
          </label>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={Send}
              onClick={handleConfirmSos}
              loading={submitting}
              disabled={!confirmedCheck || submitting}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-5"
            >
              Send Emergency Alert
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default DriverSosButton;
