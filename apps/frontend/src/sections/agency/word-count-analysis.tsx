import { Card, CardContent, Typography } from '@mui/material'
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
      y: {
        beginAtZero: true,
        ticks: {
          callback(value: any) {
            return value.toLocaleString()
          },
        },
      },
    },
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Word Count Analysis
        </Typography>

        <div style={{ height: '300px' }}>
          <Bar data={chartData} options={options} />
        </div>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Average words per section: {Math.round(data.averageWordsPerSection).toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  )
}
