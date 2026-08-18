export const fetchAutenticado = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true', // <-- Necessário para o Ngrok liberar requisições fetch da API
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  // Garante que a URL base aponte corretamente para o seu backend via Ngrok ou ambiente
  const baseUrl = import.meta.env.VITE_API_URL || '';
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
};