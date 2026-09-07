/**
 * Maps raw Firebase authentication error codes to user-friendly, secure messages.
 * Prevents account enumeration and exposes clean actionable feedback.
 */
export const getAuthErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred. Please try again.';

  const code = typeof error === 'string' ? error : error.code;

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password. Please verify your credentials.';
    
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists.';

    case 'auth/weak-password':
      return 'Password is too weak. Please choose at least 6 characters with letters and numbers.';

    case 'auth/invalid-email':
      return 'Please enter a valid email address format.';

    case 'auth/user-disabled':
      return 'This account has been deactivated. Please contact your school administrator.';

    case 'auth/too-many-requests':
      return 'Too many unsuccessful attempts. Access is temporarily locked for security. Please try again in a few minutes.';

    case 'auth/network-request-failed':
      return 'Network connection failed. Please check your internet connection.';

    case 'auth/requires-recent-login':
      return 'This operation is sensitive and requires recent authentication. Please log in again.';

    case 'auth/popup-closed-by-user':
      return 'Authentication window was closed before completion.';

    default:
      return error.message || 'Authentication request could not be completed. Please try again.';
  }
};

export default getAuthErrorMessage;
