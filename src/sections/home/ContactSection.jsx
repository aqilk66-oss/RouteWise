import React, { useState } from 'react';
import Section from '../../components/layout/Section';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Input from '../../components/forms/Input';
import Button from '../../components/ui/Button';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { sendContactEmail } from '../../services/emailService';
import { useToast } from '../../components/feedback/Toast';

export const ContactSection = () => {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent duplicate submissions
    if (loading) return;

    // Frontend validation
    if (!formData.name.trim()) {
      setStatus({ type: 'error', message: 'Please enter your name.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      setStatus({ type: 'error', message: 'Please provide a valid email address.' });
      return;
    }

    if (!formData.subject.trim()) {
      setStatus({ type: 'error', message: 'Please enter an inquiry subject.' });
      return;
    }

    if (!formData.message.trim()) {
      setStatus({ type: 'error', message: 'Please enter your message.' });
      return;
    }

    setLoading(true);
    setStatus({ type: null, message: '' });

    const result = await sendContactEmail({
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
    });

    setLoading(false);

    if (result.success) {
      setStatus({
        type: 'success',
        message: 'Your inquiry has been sent successfully! Our team will respond shortly.',
      });
      addToast({
        title: 'Message Transmitted',
        message: 'Your inquiry was delivered via RouteWise dispatch.',
        type: 'success',
      });
      // Clear form on success
      setFormData({
        name: '',
        email: '',
        phone: '',
        organization: '',
        subject: '',
        message: '',
      });
    } else {
      setStatus({
        type: 'error',
        message: result.error || 'Unable to send your message right now. Please try again later.',
      });
      addToast({
        title: 'Dispatch Notice',
        message: result.error || 'Unable to dispatch message.',
        type: 'warning',
      });
      // User entered form data is preserved upon failure
    }
  };

  return (
    <Section
      id="contact"
      title="Connect with our transportation specialists."
      subtitle="Have questions regarding school district deployment, route optimization, or pilot testing? Send us an inquiry."
      badge={<Badge variant="default">Direct Inquiry</Badge>}
      className="bg-slate-50 border-t border-border"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
        {/* Left Column: Direct Info & Support */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <h3 className="text-h3 text-brand-navy mb-2">School Transit Coordination Hub</h3>
            <p className="text-xs text-brand-slate leading-relaxed">
              RouteWise works closely with school boards, private transport contractors, and parent associations to ensure effortless implementation.
            </p>
          </div>

          <div className="space-y-4 text-xs text-brand-navy">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-border">
              <Mail className="w-4 h-4 text-brand-blue shrink-0" />
              <span>operations@routewise.io</span>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-border">
              <Phone className="w-4 h-4 text-brand-teal shrink-0" />
              <span>+1 (800) 555-ROUTE (Mon-Fri 7am-6pm)</span>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-border">
              <MapPin className="w-4 h-4 text-brand-navy shrink-0" />
              <span>School Transportation Systems HQ, NY</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 border border-brand-blue/20 text-xs text-brand-navy">
            <h5 className="font-bold mb-1">Email Service Dispatch</h5>
            <p className="text-brand-slate text-[11px]">
              Equipped with client-side EmailJS architecture. When credentials are provided in your environment, submissions dispatch immediately.
            </p>
          </div>
        </div>

        {/* Right Column: Interactive Contact Form */}
        <div className="lg:col-span-7">
          <Card variant="elevated" className="border border-border p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {status.type && (
                <div
                  className={`p-4 rounded-xl flex items-start gap-3 text-xs ${
                    status.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {status.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <span>{status.message}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Dr. Robert Vance"
                  required
                />
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@school.edu"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                />
                <Input
                  label="School / Organization"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  placeholder="e.g. Oakridge District"
                />
              </div>

              <Input
                label="Inquiry Subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Fleet Pilot / Integration Inquiry"
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-brand-navy">
                  Message Details <span className="text-status-danger">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  required
                  placeholder="Describe your student transportation requirements or fleet size..."
                  className="w-full rounded-lg text-sm bg-white border border-border p-3 text-brand-navy placeholder:text-brand-slate/60 outline-none hover:border-brand-slate/40 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 transition-all resize-none"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={loading}
                disabled={loading}
                icon={Send}
                iconPosition="right"
                className="w-full"
              >
                {loading ? 'Sending...' : 'Send Inquiry Message'}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </Section>
  );
};

export default ContactSection;
