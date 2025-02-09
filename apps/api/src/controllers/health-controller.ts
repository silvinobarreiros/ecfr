import { Router, Request, Response } from 'express'
import Controller from './controller'
import Environment from '../environment'

const SECONDS_IN_MILLIS = 1000

class HealthController implements Controller {
  readonly router: Router

  constructor(private readonly environment: Environment) {
    this.router = Router()
    this.router.get('/health', this.health)
  }

  private health = (_req: Request, res: Response): void => {
    const { startup } = this.environment
    const now = new Date()
    const uptime = (Number(now) - Number(startup)) / SECONDS_IN_MILLIS

    res.set('Content-Type', 'application/health+json')
    res.json({
      status: 'pass',
      details: {
        uptime: [
          {
            componentType: 'system',
            metricValue: uptime,
            metricUnit: 's',
            status: 'pass',
            time: now.toISOString(),
          },
        ],
      },
    })
  }
}

export default HealthController
