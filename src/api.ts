export const API_BASE_URL = import.meta.env.VITE_API_URL;

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const token = sessionStorage.getItem('token');
  
  const headers: Record<string, string> = {
    ...options.headers,
  } as any;

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    sessionStorage.removeItem('token');
    window.dispatchEvent(new Event('auth-error'));
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'API Error');
  }

  if (response.status !== 204) {
    return response.json();
  }
};
