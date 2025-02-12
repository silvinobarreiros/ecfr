import { Router, Request, Response } from 'express'
import Controller from './controller'
import asyncHandler from '@/middleware/async-handler'
import { INTERNAL_SERVER_ERROR, BAD_REQUEST, ok } from './response'
import logger from '@/logger'
import { ECFRAnalytics } from '@/services/analysis/ecrf-analytics'
import { HistoricalChange } from '@/types/analytics'

class AnalyticsController implements Controller {
  readonly router: Router

  constructor(private readonly ecrfAnalysisClient: ECFRAnalytics) {
    this.router = Router()

    // Base analytics endpoints
    this.router.get('/overview', asyncHandler(this.getOverview))
    this.router.get('/agencies', asyncHandler(this.getAgencies))
    this.router.get('/titles', asyncHandler(this.getTitles))

    // Agency specific endpoints
    this.router.get('/agencies/:slug', asyncHandler(this.getAgencyAnalytics))
    this.router.get('/agencies/:slug/historical', asyncHandler(this.getAgencyHistoricalChanges))
    this.router.get('/agencies/:slug/word-counts', asyncHandler(this.getAgencyWordCounts))
    this.router.get('/agencies/:slug/burden', asyncHandler(this.getAgencyRegulatoryBurden))

    // Title specific endpoints
    this.router.get('/titles/:number', asyncHandler(this.getTitleAnalytics))
    this.router.get('/titles/:number/complexity', asyncHandler(this.getTitleComplexity))
    this.router.get('/titles/:number/advanced', asyncHandler(this.getTitleAdvancedMetrics))
  }

  private getOverview = async (req: Request, res: Response): Promise<void> => {
    try {
      const titles = this.ecrfAnalysisClient.getAllTitlesInfo()
      const agencies = this.ecrfAnalysisClient.getAgencies()

      ok(res, {
        totalTitles: titles.length,
        totalAgencies: agencies.length,
        lastUpdated: new Date().toISOString(),
      })
    } catch (error) {
      logger.error('Failed to get overview', error)
      INTERNAL_SERVER_ERROR(res)
    }
  }

  private getAgencies = async (req: Request, res: Response): Promise<void> => {
    try {
      const agencies = this.ecrfAnalysisClient.getAgencies()
      ok(res, agencies)
    } catch (error) {
      logger.error('Failed to get agencies', error)
      INTERNAL_SERVER_ERROR(res)
    }
  }

  private getTitles = async (req: Request, res: Response): Promise<void> => {
    try {
      const titles = this.ecrfAnalysisClient.getAllTitlesInfo()
      ok(res, titles)
    } catch (error) {
      logger.error('Failed to get titles', error)
      INTERNAL_SERVER_ERROR(res)
    }
  }

  private getAgencyAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const { slug } = req.params

      if (slug === undefined) {
        logger.error('Invalid agency slug')
        return BAD_REQUEST(res)
      }

      const wordCountsCache = await this.ecrfAnalysisClient.getAgencyWordCounts(slug)
      const burdenCache = await this.ecrfAnalysisClient.getRegulatoryBurden(slug)

      if (wordCountsCache) {
        logger.info('Using cached word counts')
      }

      if (burdenCache) {
        logger.info('Using cached regulatory burden')
      }

      const wordCounts =
        wordCountsCache ?? (await this.ecrfAnalysisClient.getAgencyWordCounts(slug))
      const burden = burdenCache ?? (await this.ecrfAnalysisClient.getRegulatoryBurden(slug))

      return ok(res, { wordCounts, burden })
    } catch (error) {
      logger.error('Failed to get agency analytics', error)
      return INTERNAL_SERVER_ERROR(res)
    }
  }

  private getAgencyHistoricalChanges = async (req: Request, res: Response): Promise<void> => {
    try {
      const { slug } = req.params
      const { startDate = '2023-01-01' } = req.query

      if (typeof startDate !== 'string') {
        logger.error('Invalid date range')
        return BAD_REQUEST(res)
      }

      if (slug === undefined) {
        logger.error('Invalid agency slug')
        return BAD_REQUEST(res)
      }

      const changes: HistoricalChange[] = []

      if (slug === 'all') {
        let agencies = this.ecrfAnalysisClient.getAgencies()
        agencies = agencies.slice(0, 2)

        for await (const agency of agencies) {
          const agencyChanges = await this.ecrfAnalysisClient.getHistoricalChanges(
            agency.slug,
            startDate
          )

          changes.push(...agencyChanges)
        }
      } else {
        const agencyChanges = await this.ecrfAnalysisClient.getHistoricalChanges(slug, startDate)
        changes.push(...agencyChanges)
      }

      return ok(res, changes)
    } catch (error) {
      logger.error('Failed to get historical changes', error)
      return INTERNAL_SERVER_ERROR(res)
    }
  }

  private getAgencyWordCounts = async (req: Request, res: Response): Promise<void> => {
    try {
      const { slug } = req.params

      if (slug === undefined) {
        logger.error('Invalid agency slug')
        return BAD_REQUEST(res)
      }

      const wordCounts = await this.ecrfAnalysisClient.getAgencyWordCounts(slug)
      return ok(res, wordCounts)
    } catch (error) {
      logger.error('Failed to get agency word counts', error)
      return INTERNAL_SERVER_ERROR(res)
    }
  }

  private getAgencyRegulatoryBurden = async (req: Request, res: Response): Promise<void> => {
    try {
      const { slug } = req.params

      if (slug === undefined) {
        logger.error('Invalid agency slug')
        return BAD_REQUEST(res)
      }

      const burden = await this.ecrfAnalysisClient.getRegulatoryBurden(slug)
      return ok(res, burden)
    } catch (error) {
      logger.error('Failed to get regulatory burden', error)
      return INTERNAL_SERVER_ERROR(res)
    }
  }

  private getTitleAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const num = req.params.number

      if (num === undefined) {
        logger.error('Invalid title number')
        return BAD_REQUEST(res)
      }

      const titleNumber = parseInt(num, 10)

      if (Number.isNaN(titleNumber)) {
        logger.error('Invalid title number')
        return BAD_REQUEST(res)
      }

      const [complexity, advanced] = await Promise.all([
        this.ecrfAnalysisClient.getComplexityMetrics(titleNumber),
        this.ecrfAnalysisClient.getAdvancedTextMetrics(titleNumber),
      ])

      return ok(res, { complexity, advanced })
    } catch (error) {
      logger.error('Failed to get title analytics', error)
      return INTERNAL_SERVER_ERROR(res)
    }
  }

  private getTitleComplexity = async (req: Request, res: Response): Promise<void> => {
    try {
      const num = req.params.number

      if (num === undefined) {
        logger.error('Invalid title number')
        return BAD_REQUEST(res)
      }

      const titleNumber = parseInt(num, 10)

      if (Number.isNaN(titleNumber)) {
        logger.error('Invalid title number')
        return BAD_REQUEST(res)
      }

      const complexity = await this.ecrfAnalysisClient.getComplexityMetrics(titleNumber)
      return ok(res, complexity)
    } catch (error) {
      logger.error('Failed to get title complexity', error)
      return INTERNAL_SERVER_ERROR(res)
    }
  }

  private getTitleAdvancedMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      const num = req.params.number

      if (num === undefined) {
        logger.error('Invalid title number')
        return BAD_REQUEST(res)
      }

      const titleNumber = parseInt(num, 10)

      if (Number.isNaN(titleNumber)) {
        logger.error('Invalid title number')
        return BAD_REQUEST(res)
      }

      const metrics = await this.ecrfAnalysisClient.getAdvancedTextMetrics(titleNumber)
      return ok(res, metrics)
    } catch (error) {
      logger.error('Failed to get advanced metrics', error)
      return INTERNAL_SERVER_ERROR(res)
    }
  }
}

export default AnalyticsController
