import emailjs from '@emailjs/browser';

/**
 * RouteWise Client-Side Email Service (EmailJS)
 * Strictly adheres to non-fabricated credentials policy.
 * When real credentials are provided via VITE_EMAILJS_SERVICE_ID,
 * VITE_EMAILJS_TEMPLATE_ID, and VITE_EMAILJS_PUBLIC_KEY, it dispatches live messages.
 */
export const emailService = {
  isConfigured: () => {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    return !!(serviceId && templateId && publicKey);
  },

  sendInquiry: async ({ name, email, phone, organization, subject, message }) => {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    // Check if real credentials have been provided by user
    if (!serviceId || !templateId || !publicKey) {
      // In development mode without credentials provided yet, simulate a short delay
      // and reject with explicit configuration notification.
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error("EmailJS configuration missing: Service ID, Template ID, and Public Key are not set."));
        }, 800);
      });
    }

    const templateParams = {
      from_name: name,
      reply_to: email,
      phone_number: phone || 'Not provided',
      organization: organization || 'Not provided',
      subject: subject || 'RouteWise Institutional Inquiry',
      message: message,
      sent_at: new Date().toLocaleString(),
    };

    return emailjs.send(serviceId, templateId, templateParams, publicKey);
  },
};

export default emailService;
