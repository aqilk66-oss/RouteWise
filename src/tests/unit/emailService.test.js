import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendEmail, sendContactEmail, isEmailJsConfigured } from '../../services/emailService';

// Mock @emailjs/browser
vi.mock('@emailjs/browser', () => ({
  default: {
    send: vi.fn(),
  },
}));

import emailjs from '@emailjs/browser';

describe('emailService - EmailJS Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Form Validation in sendContactEmail', () => {
    it('fails if name is empty', async () => {
      const res = await sendContactEmail({
        name: '   ',
        email: 'test@school.edu',
        subject: 'Fleet Inquiry',
        message: 'Hello RouteWise',
      });
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/name/i);
    });

    it('fails if email is invalid format', async () => {
      const res = await sendContactEmail({
        name: 'Jane Doe',
        email: 'invalid-email',
        subject: 'Fleet Inquiry',
        message: 'Hello RouteWise',
      });
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/valid email/i);
    });

    it('fails if subject is empty', async () => {
      const res = await sendContactEmail({
        name: 'Jane Doe',
        email: 'jane@school.edu',
        subject: '',
        message: 'Hello RouteWise',
      });
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/subject/i);
    });

    it('fails if message is empty', async () => {
      const res = await sendContactEmail({
        name: 'Jane Doe',
        email: 'jane@school.edu',
        subject: 'Testing',
        message: '   ',
      });
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/message/i);
    });
  });

  describe('Configuration checking & graceful degradation', () => {
    it('returns graceful error when Service ID or Template ID is missing in environment', async () => {
      // In current test env, VITE_EMAILJS_SERVICE_ID is not configured
      const res = await sendContactEmail({
        name: 'Principal Skinner',
        email: 'skinner@springfield.edu',
        subject: 'Bus Routing',
        message: 'Need help routing bus 22.',
      });

      // Does not throw an uncaught exception
      expect(res.success).toBe(false);
      expect(res.error).toBeTruthy();
    });

    it('dispatches properly when configured and returns success: true', async () => {
      emailjs.send.mockResolvedValueOnce({ status: 200, text: 'OK' });

      // Call sendEmail with explicit customServiceId and customTemplateId
      const res = await sendEmail(
        {
          name: 'Jane Doe',
          email: 'jane@school.edu',
          subject: 'Test Subject',
          message: 'Test Message Content',
        },
        'template_mock_123',
        'service_mock_456'
      );

      expect(emailjs.send).toHaveBeenCalledWith(
        'service_mock_456',
        'template_mock_123',
        expect.objectContaining({
          name: 'Jane Doe',
          email: 'jane@school.edu',
          subject: 'Test Subject',
          message: 'Test Message Content',
        }),
        'y-_rXssyEv-47Zbk6'
      );
      expect(res.success).toBe(true);
    });

    it('handles EmailJS network / rejection error gracefully', async () => {
      emailjs.send.mockRejectedValueOnce(new Error('Network error connecting to EmailJS API'));

      const res = await sendEmail(
        { name: 'Test', email: 'test@example.com', subject: 'A', message: 'B' },
        'template_mock_123',
        'service_mock_456'
      );

      expect(res.success).toBe(false);
      expect(res.error).toMatch(/unable to send email/i);
    });
  });
});
