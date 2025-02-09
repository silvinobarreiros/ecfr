import { Router } from 'express'
import HealthController from '@controllers/health-controller'
import Environment from '@/environment'
import authHandler from '@/middleware/auth-handler'

export default (environment: Environment): Router[] => {
  const { repositories, config } = environment

  // auth layer
  const authMiddleware = authHandler(environment)

  const authenticatedControllers = [].map((controller) => {
    const router = Router()

    router.use(authMiddleware)
    router.use(controller)
    return router
  })

  return [new HealthController(environment).router, ...authenticatedControllers]
}
