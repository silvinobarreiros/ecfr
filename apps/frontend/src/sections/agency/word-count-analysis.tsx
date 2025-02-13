import { Box, Card, CardContent, Typography } from '@mui/material'
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

import { AgencyWordCount } from '@/types/analytics'

type Props = {
  data: AgencyWordCount
}

const CARD_HEIGHT = 750

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function WordCountAnalysis({ data }: Props) {
  const chartData = {
    labels: data.titles.map((t) => `Title ${t.titleNumber}`),
    datasets: [
      {
        label: 'Word Count',
        data: data.titles.map((t) => t.wordCount),
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#ffffff', // This changes the legend text color
        },
      },
      tooltip: {
        callbacks: {
          label(context: any) {
            return `Words: ${context.parsed.y.toLocaleString()}`
          },
        },
      },
    },
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
        beginAtZero: true,
        ticks: {
          callback(value: any) {
            return value.toLocaleString()
          },
          color: '#ffffff', // or any color you want
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)', // optional: for grid lines
        },
      },
    },
  }

  return (
    <Card sx={{ height: CARD_HEIGHT, display: 'flex', flexDirection: 'column' }}>
      <CardContent
        sx={{
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden', // Prevent scrolling at container level
        }}
      >
        <Typography variant="h6" gutterBottom>
          Word Count Analysis
        </Typography>

        <Box
          sx={{
            flex: '1 1 auto',
            minHeight: 0, // Important for flex child to scroll
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
          <Box sx={{ height: '100%', minHeight: '300px' }}>
            <Bar data={chartData} options={options} />
          </Box>
        </Box>

        <Typography
          variant="body2"
          color="text.default"
          sx={{
            mt: 2,
            pt: 1,
            borderTop: 1,
            borderColor: 'divider',
            flex: '0 0 auto', // Prevent shrinking
          }}
        >
          Average words per section: {Math.round(data.averageWordsPerSection).toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  )
}
