import React, { useState } from 'react';
import { 
  Bus, 
  ClipboardCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  FileText, 
  ArrowRight,
  ChevronRight,
  Shield,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../../layouts/DashboardLayout';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { useDriverTransport } from '../../../context/DriverTransportContext';

export const DriverVehicleHubPage = () => {
  const { assignedBus, assignedRoute, driverProfile, loading } = useDriverTransport();

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="p-6 bg-white border border-border rounded-3xl shadow-soft">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-teal-50 text-brand-teal border border-teal-200">
              Driver Vehicle Operations
            </span>
          </div>
          <h2 className="text-2xl font-black text-brand-navy">My Assigned Vehicle</h2>
          <p className="text-xs text-brand-slate mt-1">
            Review your assigned school coach, submit daily pre-trip walkaround audits, and report vehicle issues.
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-brand-teal border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-brand-slate">Loading vehicle data...</p>
          </div>
        ) : !assignedBus ? (
          <div className="p-10 text-center bg-white border border-border rounded-3xl shadow-soft">
            <Bus className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-brand-navy">No Vehicle Assigned</h3>
            <p className="text-xs text-brand-slate mt-1">
              You are currently not assigned to an active school bus. Contact the Transport Manager dispatch terminal.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Vehicle Overview Card */}
            <div className="p-6 bg-white border border-border rounded-3xl shadow-soft">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-teal-50 text-brand-teal rounded-2xl">
                    <Bus className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black text-brand-navy">Bus {assignedBus.busNumber}</h3>
                      <Badge variant={
                        assignedBus.status === 'available' || assignedBus.status === 'assigned' ? 'success' :
                        assignedBus.status === 'maintenance' ? 'warning' : 'danger'
                      }>
                        {assignedBus.status || 'operational'}
                      </Badge>
                    </div>
                    <span className="text-xs text-brand-slate">
                      License Plate: <strong className="text-slate-700">{assignedBus.registrationNumber}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link to="/driver/vehicle/inspection">
                    <Button variant="primary" size="sm" icon={ClipboardCheck}>
                      Pre-Trip Inspection
                    </Button>
                  </Link>
                  <Link to="/driver/vehicle/issues">
                    <Button variant="danger" size="sm" icon={ShieldAlert}>
                      Report Defect
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Capacity</span>
                  <strong className="text-brand-navy text-sm font-black">{assignedBus.capacity || 30} Seats</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Manufacturer</span>
                  <strong className="text-brand-navy text-sm font-bold">{assignedBus.manufacturer || 'Volvo'}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Model Year</span>
                  <strong className="text-brand-navy text-sm font-bold">{assignedBus.year || '2024'}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Route</span>
                  <strong className="text-brand-navy text-sm font-bold truncate block">{assignedRoute?.name || 'Assigned'}</strong>
                </div>
              </div>
            </div>

            {/* Quick Driver Checklists & Safety Guidelines */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link 
                to="/driver/vehicle/inspection"
                className="p-5 bg-white border border-border rounded-3xl shadow-soft hover:border-brand-teal transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="p-2.5 bg-teal-50 text-brand-teal rounded-2xl w-fit mb-3">
                    <ClipboardCheck className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-brand-navy text-sm">Daily Pre-Trip Inspection</h4>
                  <p className="text-xs text-brand-slate mt-1">
                    Conduct your mandatory safety walkaround checklist covering brakes, tires, lights, mirrors, and doors.
                  </p>
                </div>
                <div className="mt-4 text-xs font-bold text-brand-teal flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Start Inspection</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </Link>

              <Link 
                to="/driver/vehicle/issues"
                className="p-5 bg-white border border-border rounded-3xl shadow-soft hover:border-rose-300 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl w-fit mb-3">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-brand-navy text-sm">Report Vehicle Defect</h4>
                  <p className="text-xs text-brand-slate mt-1">
                    Encountered a mechanical or safety issue during route operations? Report defects directly to the fleet garage.
                  </p>
                </div>
                <div className="mt-4 text-xs font-bold text-rose-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Report Issue</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DriverVehicleHubPage;
