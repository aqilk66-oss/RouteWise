import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Plus, 
  Building, 
  ShieldCheck, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  ArrowLeft,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../../layouts/DashboardLayout';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import incidentService from '../../../services/safety/incidentService';
import { EMERGENCY_DISCLAIMER } from '../../../constants/incidentConstants';

export const EmergencyContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // New Contact Form
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    phone: '',
    type: 'School Office',
    hours: '08:00 AM – 05:00 PM',
  });

  const loadContacts = async () => {
    try {
      setLoading(true);
      const data = await incidentService.getEmergencyContacts();
      setContacts(data);
    } catch (err) {
      console.warn('Load emergency contacts note:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;

    setSubmitting(true);
    try {
      await incidentService.addEmergencyContact(formData);
      setToastMessage('Emergency contact recorded in directory.');
      setIsModalOpen(false);
      setFormData({
        name: '',
        role: '',
        phone: '',
        type: 'School Office',
        hours: '08:00 AM – 05:00 PM',
      });
      await loadContacts();
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      alert(`Error saving contact: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Emergency Contacts & Responder Directory">
      <div className="space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/admin/safety"
            className="text-xs font-bold text-brand-blue hover:underline flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Safety Center</span>
          </Link>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-navy hover:bg-slate-800 text-white font-bold"
          >
            Add Contact
          </Button>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold text-xs rounded-2xl flex items-center gap-2.5 animate-fade-in shadow-soft">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Disclaimer Banner */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {EMERGENCY_DISCLAIMER}
          </p>
        </div>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="h-36 bg-white rounded-3xl border border-border animate-pulse p-6" />
            ))
          ) : contacts.map(c => (
            <Card key={c.id} className="p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-slate">
                    {c.type}
                  </span>
                  <Badge variant={c.isUrgent ? 'danger' : 'neutral'} size="sm">
                    {c.hours || 'Active'}
                  </Badge>
                </div>
                <h3 className="text-sm font-bold text-brand-navy">{c.name}</h3>
                <p className="text-xs text-brand-slate mt-0.5">{c.role}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={`tel:${c.phone}`}
                  className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-brand-blue hover:text-white font-mono font-bold text-xs text-brand-navy flex items-center gap-2 transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{c.phone}</span>
                </a>
              </div>
            </Card>
          ))}
        </div>

        {/* Add Contact Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add Emergency Contact"
          size="md"
        >
          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-brand-navy mb-1">Contact Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. County Dispatch Coordinator"
                className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-brand-navy mb-1">Organization / Role *</label>
              <input
                type="text"
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g. District Operations Desk"
                className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-brand-navy mb-1">Telephone Number *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-brand-navy mb-1">Contact Category</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-white font-medium focus:ring-2 focus:ring-brand-blue/30 outline-none"
                >
                  <option value="School Office">School Office</option>
                  <option value="Emergency Service">Emergency Service</option>
                  <option value="Medical">Medical / Health</option>
                  <option value="Security">Security / Police</option>
                  <option value="Other">Other Authority</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-brand-navy mb-1">Operational Hours</label>
                <input
                  type="text"
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                  placeholder="e.g. 24/7 or 08:00 - 17:00"
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-2 focus:ring-brand-blue/30 outline-none font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={submitting} className="bg-brand-navy font-bold">
                Save Contact
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default EmergencyContactsPage;
