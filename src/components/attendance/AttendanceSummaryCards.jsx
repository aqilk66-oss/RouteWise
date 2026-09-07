import React from 'react';
import { Users, CheckCircle2, Clock, AlertCircle, UserCheck } from 'lucide-react';
import Card from '../ui/Card';

export const AttendanceSummaryCards = ({
  expected = 0,
  boarded = 0,
  droppedOff = 0,
  absent = 0,
  pending = 0,
  loading = false,
  className = ''
}) => {
  if (loading) {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-5 gap-3 ${className}`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 rounded-2xl bg-white border border-border shadow-soft animate-pulse h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-5 gap-3 ${className}`}>
      {/* 1. Expected Students */}
      <Card className="p-4 space-y-1 bg-white border border-border shadow-soft">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-slate">Expected</span>
          <Users className="w-4 h-4 text-brand-navy" />
        </div>
        <p className="text-2xl font-black text-brand-navy leading-tight">{expected}</p>
        <p className="text-[11px] text-brand-slate">Total assigned run</p>
      </Card>

      {/* 2. Boarded */}
      <Card className="p-4 space-y-1 bg-blue-50/60 border border-blue-100 shadow-soft">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-blue">Boarded</span>
          <UserCheck className="w-4 h-4 text-brand-blue" />
        </div>
        <p className="text-2xl font-black text-brand-blue leading-tight">{boarded}</p>
        <p className="text-[11px] text-blue-700">Currently on bus</p>
      </Card>

      {/* 3. Dropped Off */}
      <Card className="p-4 space-y-1 bg-emerald-50/60 border border-emerald-100 shadow-soft">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Dropped Off</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        </div>
        <p className="text-2xl font-black text-emerald-800 leading-tight">{droppedOff}</p>
        <p className="text-[11px] text-emerald-700">Safely arrived</p>
      </Card>

      {/* 4. Absent */}
      <Card className="p-4 space-y-1 bg-rose-50/60 border border-rose-100 shadow-soft">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Absent</span>
          <AlertCircle className="w-4 h-4 text-rose-600" />
        </div>
        <p className="text-2xl font-black text-rose-800 leading-tight">{absent}</p>
        <p className="text-[11px] text-rose-700">Reported away</p>
      </Card>

      {/* 5. Pending / Unresolved */}
      <Card className={`p-4 space-y-1 shadow-soft col-span-2 sm:col-span-1 border ${
        pending > 0 
          ? 'bg-amber-50/60 border-amber-200' 
          : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-bold uppercase tracking-wider ${
            pending > 0 ? 'text-amber-800' : 'text-slate-500'
          }`}>
            Pending
          </span>
          <Clock className={`w-4 h-4 ${pending > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
        </div>
        <p className={`text-2xl font-black leading-tight ${
          pending > 0 ? 'text-amber-900' : 'text-slate-700'
        }`}>
          {pending}
        </p>
        <p className={`text-[11px] ${pending > 0 ? 'text-amber-700 font-semibold' : 'text-slate-500'}`}>
          {pending > 0 ? 'Awaiting check-in' : 'All resolved'}
        </p>
      </Card>
    </div>
  );
};

export default AttendanceSummaryCards;
