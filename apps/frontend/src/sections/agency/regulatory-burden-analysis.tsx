'use client'

import { Box, Card, CardContent, Grid, Paper, Stack, Typography } from '@mui/material'
import { ArcElement, CategoryScale, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

import { RegulatoryBurden } from '@/types/analytics'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale)

interface MetricCardProps {
  label: string
  value: number | string
  unit?: string
}

const CARD_HEIGHT = 750

function MetricCard({ label, value, unit }: MetricCardProps) {
  return (
    <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
      <Typography color="text.secondary" variant="subtitle2" gutterBottom>
        {label}
      </Typography>
      <Typography variant="h4" component="div" sx={{ fontWeight: 'medium' }}>
        {value.toLocaleString()}
        {unit && (
          <Typography component="span" variant="subtitle1" sx={{ ml: 1 }}>
            {unit}
          </Typography>
        )}
      </Typography>
    </Paper>
  )
}

export default function RegulatoryBurdenAnalysis({ data }: { data: RegulatoryBurden }) {
  const chartData = {
    labels: ['Penalties', 'Inspections', 'Audits'],
    datasets: [
      {
        data: [
          data.enforcementMetrics.penaltyProvisions,
          data.enforcementMetrics.inspectionRequirements,
          data.enforcementMetrics.auditRequirements,
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 206, 86, 0.8)',
        ],
        borderColor: ['rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)', 'rgba(255, 206, 86, 1)'],
        borderWidth: 1,
      },
    ],
  }

  return (
    <Card sx={{ height: CARD_HEIGHT, display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: '1 1 auto', overflow: 'auto' }}>
        <Typography variant="h6" gutterBottom>
          Regulatory Burden Analysis
        </Typography>

        <Grid container spacing={3} sx={{ minHeight: 'min-content' }}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Key Metrics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard label="Restriction Words" value={data.restrictionWords} unit="words" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard label="Exception Words" value={data.exceptionWords} unit="words" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard label="Form Requirements" value={data.formRequirements} unit="forms" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  label="Deadline Mentions"
                  value={data.deadlineMentions}
                  unit="deadlines"
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Enforcement Distribution
            </Typography>
            <Box sx={{ height: 300 }}>
              <Doughnut
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right' as const,
                      align: 'center' as const,
                      labels: {
                        color: '#ffffff',
                        padding: 20,
                      },
                    },
                  },
                }}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Interagency Complexity
            </Typography>
            <Stack spacing={2}>
              <MetricCard
                label="Overlapping Jurisdictions"
                value={data.interagencyComplexity.overlappingJurisdictions}
                unit="agencies"
              />
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '300px', // Fixed height for consistency
                }}
              >
                <Typography color="text.default" variant="subtitle1" gutterBottom>
                  Agency References
                </Typography>
                <Box
                  sx={{
                    flex: '1 1 auto',
                    overflow: 'auto',
                    '&::-webkit-scrollbar': {
                      width: '0.4em',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'rgba(0,0,0,0.1)',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      borderRadius: '4px',
                    },
                  }}
                >
                  <Grid container spacing={1}>
                    {data.interagencyComplexity.agencyReferences.map((agency, index) => (
                      <Grid item xs={12} key={index}>
                        <Paper
                          elevation={1}
                          sx={{
                            p: 1,
                            cursor: 'default',
                            backgroundColor: 'background.default',
                            '&:hover': {
                              backgroundColor: 'action.hover',
                            },
                          }}
                        >
                          <Typography variant="body2">{agency}</Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}
