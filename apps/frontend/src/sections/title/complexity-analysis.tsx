'use client'

import { Card, CardContent, Grid, Typography } from '@mui/material'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { ComplexityMetrics } from '@/types/analytics'
import { MetricCard } from './metric-card'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface ComplexityAnalysisProps {
  data: ComplexityMetrics
}

export default function ComplexityAnalysis({ data }: ComplexityAnalysisProps) {
  const technicalTerms = Object.entries(data.technicalTermFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)

  const chartData = {
    labels: technicalTerms.map(([term]) => term),
    datasets: [
      {
        label: 'Frequency',
        data: technicalTerms.map(([, count]) => count),
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
      },
    ],
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Complexity Analysis
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <MetricCard
              label="Average Sentence Length"
              value={data.averageSentenceLength.toFixed(1)}
              unit="words"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <MetricCard
              label="Average Word Length"
              value={data.averageWordLength.toFixed(1)}
              unit="characters"
            />
          </Grid>
          <Grid item xs={12}>
            <MetricCard
              label="Flesch-Kincaid Score"
              value={data.fleschKincaidScore.score.toFixed(1)}
              unit={data.fleschKincaidScore.message}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              Most Common Technical Terms
            </Typography>
            <div style={{ height: 300 }}>
              <Bar
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  indexAxis: 'y' as const,
                  scales: {
                    x: {
                      ticks: {
                        color: '#ffffff', // or any color you want
                      },
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)', // optional: for grid lines
                      },
                    },
                    y: {
                      ticks: {
                        color: '#ffffff', // or any color you want
                      },
                      grid: {
                        color: 'rgba(255, 255, 255, 0.1)', // optional: for grid lines
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      labels: {
                        color: '#ffffff', // This changes the legend text color
                      },
                    },
                  },
                }}
              />
            </div>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}
