import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  List,
  ListItem,
  Pagination,
  Typography,
} from '@mui/material'
import { useState } from 'react'

import { useHistoricalChanges } from '@/api/analytics'

const ITEMS_PER_PAGE = 5
const CARD_HEIGHT = 400 // Fixed height in pixels

export default function RecentChanges() {
  const [page, setPage] = useState(1)

  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0] as string

  const { changes, changesLoading } = useHistoricalChanges('all', startDate)

  if (changesLoading) return <div>Loading...</div>

  const sortedChanges = [...changes].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const totalPages = Math.ceil(sortedChanges.length / ITEMS_PER_PAGE)
  const currentPageChanges = sortedChanges.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value)
  }

  return (
    <Card sx={{ height: CARD_HEIGHT, display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: '0 0 auto' }}>
        <Typography variant="h6" gutterBottom>
          Recent Changes
        </Typography>
      </CardContent>

      <Box
        sx={{
          flex: '1 1 auto',
          overflowY: 'auto',
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
        <List>
          {currentPageChanges.map((change, index) => (
            <ListItem
              key={`${change.date}-${change.section}-${index}`}
              divider={index !== currentPageChanges.length - 1}
              sx={{ flexDirection: 'column', alignItems: 'flex-start' }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1">
                    {change.title} CFR {change.section}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.primary">
                    Agency:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatSlug(change.agencySlug)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Date: {new Date(change.date).toLocaleDateString()}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2">{change.summary}</Typography>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      size="small"
                      label={change.changeType}
                      color={
                        // eslint-disable-next-line no-nested-ternary
                        change.changeType === 'addition'
                          ? 'success'
                          : change.changeType === 'removal'
                            ? 'error'
                            : 'primary'
                      }
                    />
                    <Chip size="small" label={`Words Added: ${change.wordsAdded}`} color="info" />
                    <Chip
                      size="small"
                      label={`Words Removed: ${change.wordsRemoved}`}
                      color="warning"
                    />
                    {change.significantChange && (
                      <Chip size="small" label="Significant Change" color="error" />
                    )}
                  </Box>
                </Grid>
              </Grid>
            </ListItem>
          ))}
        </List>
      </Box>

      {totalPages > 1 && (
        <Box
          sx={{
            flex: '0 0 auto',
            display: 'flex',
            justifyContent: 'center',
            p: 2,
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
        </Box>
      )}
    </Card>
  )
}

const formatSlug = (slug: string) =>
  slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
