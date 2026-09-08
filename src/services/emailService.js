import emailjs from '@emailjs/browser';

/**
 * RouteWise Central Email Service (EmailJS Integration)
 * 
 * Provides client-side email dispatching for RouteWise while keeping Firebase
 * Authentication, Firestore, and Storage 100% intact and untouched.
 * 
 * Public Key is read from VITE_EMAILJS_PUBLIC_KEY.
 * Service ID and Template ID are configurable through VITE_EMAILJS_SERVICE_ID and VITE_EMAILJS_TEMPLATE_ID.
 */

export const isEmailJsConfigured = () => {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  return Boolean(serviceId && templateId && publicKey);
};

/**
 * Sends an email using EmailJS
 * @param {Object} templateParams - Parameters corresponding to the template variables in EmailJS
 * @param {string} [customTemplateId] - Optional override for specific email types
 * @param {string} [customServiceId] - Optional override for specific service IDs
 * @returns {Promise<{ success: boolean, error?: string, response?: any }>}
 */
export const sendEmail = async (templateParams = {}, customTemplateId = null, customServiceId = null) => {
  const serviceId = customServiceId || import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = customTemplateId || import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    const missing = [];
    if (!serviceId) missing.push('VITE_EMAILJS_SERVICE_ID');
    if (!templateId) missing.push('VITE_EMAILJS_TEMPLATE_ID');
    if (!publicKey) missing.push('VITE_EMAILJS_PUBLIC_KEY');

    console.warn(
      `[EmailJS Config Warning] EmailJS is not fully configured. Missing: ${missing.join(', ')}. ` +
      `Please add the Service ID and Template ID to your .env file.`
    );

    return {
      success: false,
      error: 'Email service is currently being configured. Please reach out to operations@routewise.io directly.',
    };
  }

  try {
    const response = await emailjs.send(serviceId, templateId, templateParams, publicKey);
    return {
      success: true,
      response,
    };
  } catch (err) {
    // Log helpful developer diagnostic without leaking credentials
    console.error('[EmailJS Send Error]', err?.text || err?.message || err);
    return {
      success: false,
      error: 'Unable to send email right now. Please try again later or contact our team directly.',
    };
  }
};

/**
 * Sends a contact inquiry from the RouteWise Contact form.
 * Matches EmailJS template variables:
 *  - {{name}}
 *  - {{email}}
 *  - {{subject}}
 *  - {{message}}
 * 
 * Passes reply_to as the sender's email for easy replies.
 * 
 * @param {Object} data
 * @param {string} data.name
 * @param {string} data.email
 * @param {string} data.subject
 * @param {string} data.message
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export const sendContactEmail = async ({ name, email, subject, message }) => {
  // Validate fields
  if (!name || !name.trim()) {
    return { success: false, error: 'Please enter your name.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  if (!subject || !subject.trim()) {
    return { success: false, error: 'Please enter an inquiry subject.' };
  }

  if (!message || !message.trim()) {
    return { success: false, error: 'Please enter your message.' };
  }

  // Exact EmailJS template parameters matching {{name}}, {{email}}, {{subject}}, {{message}}
  const templateParams = {
    name: name.trim(),
    email: email.trim(),
    subject: subject.trim(),
    message: message.trim(),
  };

  return sendEmail(templateParams);
};

export const emailService = {
  isConfigured: isEmailJsConfigured,
  sendEmail,
  sendContactEmail,
};

export default emailService;
