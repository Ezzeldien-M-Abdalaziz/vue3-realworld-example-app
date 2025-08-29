/// <reference types="vitest-dom/extend-expect" />
import 'vitest-dom/extend-expect'
import { CONFIG } from './config'

// https://github.com/mswjs/msw/issues/1415#issuecomment-1650562700
location.href = CONFIG.API_HOST || 'https://api.realworld.io/'
