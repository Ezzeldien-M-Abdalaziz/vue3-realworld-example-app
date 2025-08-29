console.log('VITE_API_HOST:', import.meta.env.VITE_API_HOST)
console.log('All env vars:', import.meta.env)

export const CONFIG = {
  API_HOST: String(import.meta.env.VITE_API_HOST) || 'http://127.0.0.1:8000',
}
