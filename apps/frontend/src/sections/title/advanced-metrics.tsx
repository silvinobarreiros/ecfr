'use client'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useState } from 'react'

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardContent,
  Grid,
  Pagination,
  Paper,
  Typography,
} from '@mui/material'

import { AdvancedTextMetrics } from '@/types/analytics'
import { MetricCard } from './metric-card'

interface AmbiguousTermCardProps {
  term: string
  count: number
  contexts: string[]
}

function AmbiguousTermCard({ term, count, contexts }: AmbiguousTermCardProps) {
  const [contextsPage, setContextsPage] = useState(1)
  const contextsPerPage = 3

  const totalContextPages = Math.ceil(contexts.length / contextsPerPage)
  const currentContexts = contexts.slice(
    (contextsPage - 1) * contextsPerPage,
    contextsPage * contextsPerPage
  )

  const handleContextsPageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setContextsPage(value)
  }

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs>
            <Typography variant="subtitle1">{term}</Typography>
          </Grid>
          <Grid item>
            <Typography variant="body2" color="text.secondary">
              {count} occurrences
            </Typography>
          </Grid>
        </Grid>
      </AccordionSummary>
      <AccordionDetails>
        <Typography variant="subtitle2" gutterBottom>
          Usage Contexts ({contexts.length} total):
        </Typography>

        <Box sx={{ mb: 2 }}>
          {currentContexts.map((context, index) => (
            <Paper
              key={index}
              elevation={0}
              sx={{
                p: 1,
                mb: 1,
                backgroundColor: 'background.default',
                borderLeft: 3,
                borderColor: 'primary.main',
              }}
            >
              <Typography variant="body2">{context}</Typography>
            </Paper>
          ))}
        </Box>

        {totalContextPages > 1 && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              pt: 2,
              borderTop: 1,
              borderColor: 'divider',
            }}
          >
            <Pagination
              count={totalContextPages}
              page={contextsPage}
              onChange={handleContextsPageChange}
              color="primary"
              size="small"
            />
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  )
}

interface AdvancedMetricsProps {
  data: AdvancedTextMetrics
}

export default function AdvancedMetrics({ data }: AdvancedMetricsProps) {
  const [ambiguousTermsPage, setAmbiguousTermsPage] = useState(1)
  const termsPerPage = 5

  const { ambiguousTerms } = data.ambiguityScore.details
  const totalTermPages = Math.ceil(ambiguousTerms.length / termsPerPage)
  const currentTerms = ambiguousTerms.slice(
    (ambiguousTermsPage - 1) * termsPerPage,
    ambiguousTermsPage * termsPerPage
  )

  const handleTermsPageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setAmbiguousTermsPage(value)
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Advanced Metrics
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <MetricCard
              label="Text Entropy"
              value={data.entropy.score.toFixed(2)}
              message={data.entropy.message} // Moved to message prop
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <MetricCard
              label="Legal Clarity"
              value={data.legaClarityScore.score.toFixed(2)}
              message={data.legaClarityScore.message} // Moved to message prop
            />
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2, mt: 2, bgcolor: 'background.default' }}>
              <Typography variant="h6" gutterBottom color="default">
                Ambiguity Analysis
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <MetricCard
                    label="Ambiguity Score"
                    value={data.ambiguityScore.score.toFixed(2)}
                    message={`Severity: ${data.ambiguityScore.details.severityLevel}`}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <MetricCard
                    label="Total Words Analyzed"
                    value={data.ambiguityScore.details.totalWords}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <MetricCard
                    label="Ambiguous Terms Found"
                    value={data.ambiguityScore.details.ambiguousTerms.length}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ color: 'default' }}>
                  Detailed Term Analysis ({ambiguousTerms.length} terms)
                </Typography>
                <Box sx={{ mb: 2 }}>
                  {currentTerms.map((term, index) => (
                    <AmbiguousTermCard
                      key={index}
                      term={term.term}
                      count={term.count}
                      contexts={term.contexts}
                    />
                  ))}
                </Box>
                {totalTermPages > 1 && (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      pt: 2,
                      borderTop: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <Pagination
                      count={totalTermPages}
                      page={ambiguousTermsPage}
                      onChange={handleTermsPageChange}
                      color="primary"
                      size="small"
                    />
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2, mt: 2, bgcolor: 'background.default' }}>
              <Typography variant="h6" gutterBottom color="default">
                Definition Coverage
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <MetricCard
                    label="Coverage Rate"
                    value={`${(data.definitionCoverage.coverage * 100).toFixed(1)}%`}
                    message={`${data.definitionCoverage.definedTerms.length} terms have been defined in this document`}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ color: 'default' }}>
                  Defined Terms
                </Typography>
                <Grid container spacing={1}>
                  {data.definitionCoverage.definedTerms.map((term, index) => (
                    <Grid item key={index}>
                      <Paper
                        elevation={1}
                        sx={{
                          p: 1.5,
                          backgroundColor: 'primary',
                          cursor: 'default',
                          '&:hover': { backgroundColor: 'action.hover' },
                        }}
                      >
                        <Typography variant="body2">{term}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}
