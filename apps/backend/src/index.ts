import { Hono } from 'hono'
import type { Env, Variables } from './types'
import { setupCors, setupRequestCounter } from './middleware'
import { setupPublicRoutes } from './routes/public'
import { setupProtectedRoutes } from './routes/todos'

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

setupCors(app)
setupRequestCounter(app)

setupPublicRoutes(app)
setupProtectedRoutes(app)

export default app
