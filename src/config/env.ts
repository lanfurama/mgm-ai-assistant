export const config = {
  // Vertex AI Generative Language API (Gemini on Vertex)
  vertexApiKey: import.meta.env.VITE_VERTEX_AI_API_KEY || '',
  vertexProjectId: import.meta.env.VITE_VERTEX_AI_PROJECT_ID || '',
  vertexLocation: import.meta.env.VITE_VERTEX_AI_LOCATION || 'us-central1',
  vertexEndpointId: import.meta.env.VITE_VERTEX_AI_ENDPOINT_ID || '',

  // Optional: Google Translate or other Google APIs
  googleTranslateApiKey: import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY || '',

  // Backend REST API (your own server)
  // Use relative path by default - works with Vite proxy in dev and reverse proxy in production
  // Only use absolute URL if explicitly set via VITE_API_BASE_URL
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '',

  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;

export const validateConfig = (): void => {
  console.log('Vertex AI Config:', {
    hasApiKey: !!config.vertexApiKey,
    projectId: config.vertexProjectId,
    location: config.vertexLocation,
    endpointId: config.vertexEndpointId,
  });

  if (!config.vertexApiKey) {
    console.error('❌ VITE_VERTEX_AI_API_KEY is not set');
  }

  if (!config.vertexProjectId) {
    console.error('❌ VITE_VERTEX_AI_PROJECT_ID is not set');
  }

  if (!config.vertexLocation) {
    console.error('❌ VITE_VERTEX_AI_LOCATION is not set');
  }
};
