'use client'

import { Box, Container, Grid, Typography } from '@mui/material'

import { useAgencyAnalytics, useHistoricalChanges } from '@/api/analytics'

import WordCountAnalysis from '../word-count-analysis'

import AgencyHeader from '../agency-header'
import RegulatoryBurdenAnalysis from '../regulatory-burden-analysis'
import HistoricalChangesChart from '../historical-changes-chart'

type Props = {
  slug: string
}

export default function AgencyView({ slug }: Props) {
  const { wordCounts, regulatoryBurden, agencyLoading } = useAgencyAnalytics(slug)
  const { changes, changesLoading } = useHistoricalChanges(slug, '2023-01-01')

  if (agencyLoading || changesLoading) {
    return <Box>Loading...</Box>
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 5, mb: 4 }}>
      <AgencyHeader
        name={wordCounts.agencyName}
        totalWords={wordCounts.totalWords}
        sectionsCount={wordCounts.sectionsCount}
      />

      <Grid container spacing={3} sx={{ mt: 4 }}>
        <Grid item xs={12} md={6}>
          <WordCountAnalysis data={wordCounts} />
        </Grid>
        <Grid item xs={12} md={6}>
          <RegulatoryBurdenAnalysis data={regulatoryBurden} />
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <HistoricalChangesChart changes={changes} />
      </Box>
    </Container>
  )
}
