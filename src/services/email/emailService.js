import emailService, { sendEmail, sendContactEmail, isEmailJsConfigured } from '../emailService';

/**
 * Re-exporting from central emailService for modularity and backwards compatibility
 */
export {
  emailService,
  sendEmail,
  sendContactEmail,
  isEmailJsConfigured,
};

export default emailService;
