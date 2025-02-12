'use client'

import { useEffect, useState } from 'react'

import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'

import { useTitleAnalytics, useTitles } from '@/api/analytics'
import { TitleInfo } from '@/types/analytics'
import AdvancedMetrics from '../advanced-metrics'
import ComplexityAnalysis from '../complexity-analysis'
import TitleHeader from '../header'

type Props = {
  number: number
}

export default function TitleView({ number }: Props) {
  const { titles, titlesLoading } = useTitles()
  const { complexity, advanced, titleLoading } = useTitleAnalytics(number)

  const [title, setTitle] = useState<TitleInfo | undefined>(undefined)

  useEffect(() => {
    if (!titlesLoading && title === undefined) {
      const title = titles.find((t) => t.number.toString() === number.toString())

      setTitle(title)
    }
  }, [number, title, titles, titlesLoading])

  if (titleLoading || title === undefined) {
    return <div>Loading...</div>
  }

  if (title) {
    return (
      <Container maxWidth="xl" sx={{ mt: 5, mb: 4 }}>
        <TitleHeader title={title} />

        <Grid container spacing={3} sx={{ mt: 4 }}>
          <Grid item xs={12} md={6}>
            <ComplexityAnalysis data={complexity} />
          </Grid>
          <Grid item xs={12} md={6}>
            <AdvancedMetrics data={advanced} />
          </Grid>
        </Grid>
      </Container>
    )
  }
}
