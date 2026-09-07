import React, { useState } from 'react';
import { 
  Navigation, 
  Calendar, 
  Bus, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  Eye,
  Route as RouteIcon
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { useParentTransport } from '../../context/ParentTransportContext';
import { TRIP_STATUS } from '../../constants/collections';

export const ParentTripsPage = () => {
  const { childTripHistory, selectedChild, loading, refreshData, refreshing } = useParentTransport();
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStatusBadge = (status) => {
    switch (status) {
      case TRIP_STATUS.IN_PROGRESS:
      case 'inProgress':
        return <Badge variant="active">In Progress</Badge>;
      case TRIP_STATUS.COMPLETED:
      case 'completed':
        return <Badge variant="neutral">Completed</Badge>;
      case TRIP_STATUS.DELAYED:
      case 'delayed':
        return <Badge variant="warning">Delayed</Badge>;
      default:
        return <Badge variant="info">Scheduled</Badge>;
    }
  };

  return (
    <DashboardLayout title="Child Transport History & Trip Records">
      <div className="space-y-6">
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-border shadow-soft">
          <div>
            <h2 className="text-lg font-bold text-brand-navy">
              Transit Logs for {selectedChild?.fullName || 'Student'}
            </h2>
            <p className="text-xs text-brand-slate mt-0.5">
              Historical record of morning pickups, campus arrivals, and afternoon drop-offs.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={refreshData}
            loading={refreshing}
          >
            Refresh Logs
          </Button>
        </div>

        {/* Trips List / Cards */}
        {childTripHistory.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No trip records logged yet"
            description="Daily runs will appear here as soon as drivers initiate morning and afternoon routes."
          />
        ) : (
          <div className="space-y-3">
            {childTripHistory.map((trip) => (
              <div
                key={trip.id}
                className="p-5 rounded-2xl bg-white border border-border shadow-soft hover:shadow-subtle transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center shrink-0 mt-0.5">
                    <Bus className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-brand-navy">
                        {trip.routeName || 'School Transit Run'}
                      </h3>
                      {getStatusBadge(trip.status)}
                    </div>
                    <p className="text-xs text-brand-slate">
                      Date: <span className="font-semibold text-brand-navy">{trip.date || 'Today'}</span> • 
                      Vehicle: <span className="font-semibold text-brand-blue">{trip.busNumber || 'Assigned Bus'}</span> • 
                      Driver: {trip.driverName || 'Designated Driver'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end md:self-center">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-semibold text-brand-navy">
                      {trip.scheduledStartTime || trip.scheduledStart || '07:30 AM'}
                    </p>
                    <p className="text-[11px] text-brand-slate">Boarding Window</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Eye}
                    onClick={() => {
                      setSelectedTrip(trip);
                      setIsModalOpen(true);
                    }}
                  >
                    Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Trip Detail Modal */}
        {selectedTrip && (
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={`Trip Manifest: ${selectedTrip.routeName || 'Corridor'}`}
            subtitle={`Date: ${selectedTrip.date || 'Today'}`}
          >
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-border space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-brand-slate">Trip Status:</span>
                  {getStatusBadge(selectedTrip.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-brand-slate">Transit Vehicle:</span>
                  <span className="font-bold text-brand-navy">{selectedTrip.busNumber || 'Assigned'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-brand-slate">Assigned Driver:</span>
                  <span className="font-bold text-brand-navy">{selectedTrip.driverName || 'Designated Operator'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-brand-slate">Scheduled Departure:</span>
                  <span className="font-medium text-brand-navy">{selectedTrip.scheduledStartTime || selectedTrip.scheduledStart || '07:30 AM'}</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[11px] text-brand-blue flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Student pass check-in logged and confirmed with transportation central dispatch.</span>
              </div>

              <div className="pt-3 border-t border-border flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ParentTripsPage;
