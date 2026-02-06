export const config = {
  // Vertex AI Generative Language API (Gemini on Vertex)
  vertexApiKey: import.meta.env.VITE_VERTEX_AI_API_KEY || '',
  vertexProjectId: import.meta.env.VITE_VERTEX_AI_PROJECT_ID || '',
  vertexLocation: import.meta.env.VITE_VERTEX_AI_LOCATION || 'us-central1',
  vertexEndpointId: import.meta.env.VITE_VERTEX_AI_ENDPOINT_ID || '',

  // Optional: Google Translate or other Google APIs
  googleTranslateApiKey: import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY || '',

  // Backend REST API (your own server)
  // In dev mode, use relative path to leverage Vite proxy
  // In production, use full URL
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '' : 'http://localhost:8000'),

  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;

export const validateConfig = (): void => {
  if (!config.vertexApiKey) {
    console.warn('VITE_VERTEX_AI_API_KEY is not set');
  }

  if (!config.vertexProjectId) {
    console.warn('VITE_VERTEX_AI_PROJECT_ID is not set');
  }

  if (!config.vertexLocation) {
    console.warn('VITE_VERTEX_AI_LOCATION is not set');
  }
};
