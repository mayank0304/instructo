/**
 * Authentication utilities for managing tokens and authenticated requests
 */

// Get the JWT token from localStorage
export const getToken = (): string | null => {
  return localStorage.getItem('jwt');
};

// Check if the user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Add authentication headers to fetch options
export const addAuthHeaders = (options: RequestInit = {}): RequestInit => {
  const token = getToken();
  
  if (!token) {
    return options;
  }

  return {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  };
};

// Authenticated fetch function
export const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const authOptions = addAuthHeaders(options);
  return fetch(url, authOptions);
};

// Logout the user by clearing the JWT token
export const logout = (): void => {
  localStorage.removeItem('jwt');
  // You could add additional cleanup here if needed
}; 