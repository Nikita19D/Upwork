import { AxiosError } from 'axios';

/**
 * Helper function for API error handling
 * @param error The axios error object
 * @returns A user-friendly error message
 */
export const handleApiError = (error: any): string => {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const data = error.response.data;
    
    switch (status) {
      case 400:
        return `Invalid request: ${data.message || 'Please check your input'}`;
      case 401:
        return 'Authentication required. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return data.message || 'Something went wrong. Please try again.';
    }
  } else if (error.request) {
    // Request made but no response received
    return 'Network error. Please check your connection.';
  } else {
    // Error setting up request
    return 'An unexpected error occurred.';
  }
};

/**
 * Extract form validation errors from API response
 * @param error The axios error object
 * @returns An object with field names as keys and error messages as values
 */
export const extractValidationErrors = (error: any): Record<string, string> => {
  const validationErrors: Record<string, string> = {};
  
  if (error.response && error.response.status === 400) {
    const { data } = error.response;
    
    if (data.errors && typeof data.errors === 'object') {
      // Handle structured validation errors
      Object.keys(data.errors).forEach(field => {
        validationErrors[field] = data.errors[field].join(', ');
      });
    }
  }
  
  return validationErrors;
};