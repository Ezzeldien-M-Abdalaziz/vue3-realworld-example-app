export const CONFIG = {
  API_HOST: String(import.meta.env.VITE_API_HOST) || 'https://api.realworld.io',
}

// Debug logging
console.log('CONFIG.API_HOST:', CONFIG.API_HOST)
console.log('import.meta.env.VITE_API_HOST:', import.meta.env.VITE_API_HOST)
