'use client'

import { Card, CardContent, Typography, Box } from '@mui/material'

import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

import { HistoricalChange } from '@/types/analytics'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface HistoricalChangesChartProps {
  changes: HistoricalChange[]
}

export default function HistoricalChangesChart({ changes }: HistoricalChangesChartProps) {
  // Process data for the chart
  const processedData = changes
    .reduce((acc: any[], change) => {
      const { date } = change
      const existing = acc.find((item) => item.date === date)

      if (existing) {
        existing.wordsAdded += change.wordsAdded
        existing.wordsRemoved += change.wordsRemoved
        existing.totalChanges += 1
      } else {
        acc.push({
          date,
          wordsAdded: change.wordsAdded,
          wordsRemoved: change.wordsRemoved,
          totalChanges: 1,
        })
      }

      return acc
    }, [])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const chartData = {
    labels: processedData.map((d) => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Words Added',
        data: processedData.map((d) => d.wordsAdded),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        tension: 0.1,
      },
      {
        label: 'Words Removed',
        data: processedData.map((d) => d.wordsRemoved),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.1,
      },
      {
        label: 'Total Changes',
        data: processedData.map((d) => d.totalChanges),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label(context: any) {
            return `${context.dataset.label}: ${context.parsed.y.toLocaleString()}`
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Historical Changes Over Time
        </Typography>

        <Box sx={{ height: 400, mt: 2 }}>
          <Line data={chartData} options={options} />
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Total Changes: {changes.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Significant Changes: {changes.filter((c) => c.significantChange).length}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}
