import React from 'react';
import { CheckCircle2, Clock, MapPin, Bus, AlertCircle } from 'lucide-react';
import { ATTENDANCE_STATUS } from '../../constants/collections';

export const JourneyTimeline = ({
  attendanceRecord = null,
  trip = null,
  pickupStop = 'Morning Stop',
  dropoffStop = 'Campus Drop-off',
  className = ''
}) => {
  const status = attendanceRecord?.status || ATTENDANCE_STATUS.NOT_RECORDED;
  const isBoarded = status === ATTENDANCE_STATUS.BOARDED;
  const isDroppedOff = status === ATTENDANCE_STATUS.DROPPED_OFF;
  const isAbsent = status === ATTENDANCE_STATUS.ABSENT;

  const boardedTimeStr = attendanceRecord?.boardedAt 
    ? new Date(attendanceRecord.boardedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  const droppedOffTimeStr = attendanceRecord?.droppedOffAt 
    ? new Date(attendanceRecord.droppedOffAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  if (isAbsent) {
    return (
      <div className={`p-5 rounded-2xl bg-rose-50/80 border border-rose-200 text-rose-900 ${className}`}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-rose-950">Marked Absent for this Journey</h4>
            <p className="text-xs text-rose-800 mt-1">
              Reason: <span className="font-semibold">{attendanceRecord?.absenceReason || 'Absence recorded by driver'}</span>
            </p>
            <p className="text-[11px] text-rose-700 mt-1">
              Recorded at: {attendanceRecord?.updatedAt ? new Date(attendanceRecord.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    {
      title: 'Awaiting Boarding',
      subtitle: `Pickup at ${attendanceRecord?.pickupStopName || pickupStop}`,
      time: boardedTimeStr || (trip?.scheduledStartTime ? `Scheduled: ${trip.scheduledStartTime}` : 'Pending arrival'),
      state: isBoarded || isDroppedOff ? 'complete' : 'pending',
      icon: MapPin,
    },
    {
      title: 'Boarded Bus',
      subtitle: attendanceRecord?.busId ? `Vehicle: ${attendanceRecord.busId}` : 'Onboard designated fleet bus',
      time: isBoarded || isDroppedOff ? (boardedTimeStr || 'Recorded') : 'Awaiting check-in',
      state: isBoarded || isDroppedOff ? 'complete' : 'waiting',
      icon: Bus,
    },
    {
      title: 'Dropped Off at Destination',
      subtitle: `Arrival at ${attendanceRecord?.dropoffStopName || dropoffStop}`,
      time: isDroppedOff ? (droppedOffTimeStr || 'Recorded') : (isBoarded ? 'En route to stop' : 'Pending'),
      state: isDroppedOff ? 'complete' : 'waiting',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className={`p-5 rounded-3xl bg-white border border-border shadow-soft ${className}`}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-brand-navy">Today's Journey Progress</h3>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
          isDroppedOff 
            ? 'bg-emerald-100 text-emerald-800' 
            : isBoarded 
            ? 'bg-blue-100 text-blue-800 animate-pulse' 
            : 'bg-slate-100 text-slate-700'
        }`}>
          {isDroppedOff ? 'Journey Complete' : isBoarded ? 'En Route' : 'Awaiting Transit'}
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {steps.map((step, idx) => {
          const isDone = step.state === 'complete';
          const Icon = step.icon;

          return (
            <div key={idx} className="relative flex items-start justify-between gap-4">
              <div
                className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white ${
                  isDone
                    ? 'bg-brand-teal text-white shadow-soft'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                <Icon className="w-2.5 h-2.5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className={`text-xs font-bold ${isDone ? 'text-brand-navy' : 'text-slate-600'}`}>
                  {step.title}
                </p>
                <p className="text-[11px] text-brand-slate truncate">{step.subtitle}</p>
              </div>

              <div className="text-right shrink-0">
                <span className={`text-xs font-semibold ${isDone ? 'text-brand-blue' : 'text-slate-400'}`}>
                  {step.time}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JourneyTimeline;
