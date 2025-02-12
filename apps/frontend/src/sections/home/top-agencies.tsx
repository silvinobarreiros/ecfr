import { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemButton,
  Typography,
  Pagination,
  Chip,
  Grid,
} from '@mui/material'
import Link from 'next/link'
import { useAgencies } from '@/api/analytics'
import { CFRReference } from '@/types/analytics'

const ITEMS_PER_PAGE = 5
const CARD_HEIGHT = 400

export default function TopAgencies() {
  const [page, setPage] = useState(1)
  const { agencies, agenciesLoading } = useAgencies()

  if (agenciesLoading) return <Box>Loading...</Box>

  const sortedAgencies = [...agencies].sort(
    (a, b) => b.cfrReferences.length - a.cfrReferences.length
  )

  const totalPages = Math.ceil(sortedAgencies.length / ITEMS_PER_PAGE)
  const currentPageAgencies = sortedAgencies.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value)
  }

  return (
    <Card sx={{ height: CARD_HEIGHT, display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: '0 0 auto' }}>
        <Typography variant="h6" gutterBottom>
          Agencies by CFR References
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
          {currentPageAgencies.map((agency, index) => (
            <ListItem
              key={agency.slug}
              disablePadding
              divider={index !== currentPageAgencies.length - 1}
            >
              <ListItemButton
                component={Link}
                href={`/agency/${agency.slug}`}
                sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 2 }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">{agency.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {agency.shortName}
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        size="small"
                        label={`${agency.cfrReferences.length} CFR References`}
                        color="primary"
                      />
                      {(agency.children ?? []).length > 0 && (
                        <Chip
                          size="small"
                          label={`${(agency.children ?? []).length} Sub-agencies`}
                          color="info"
                        />
                      )}
                    </Box>
                  </Grid>

                  {agency.cfrReferences.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        CFR Coverage:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {Object.entries(groupCFRReferences(agency.cfrReferences))
                          .sort(([titleA], [titleB]) => Number(titleA) - Number(titleB))
                          .map(([title, chapters]) => (
                            <Chip
                              key={title}
                              size="small"
                              label={`Title ${title} (${Array.from(chapters).sort().join(', ')})`}
                              color="secondary"
                              sx={{ mb: 1 }}
                            />
                          ))}
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </ListItemButton>
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

function groupCFRReferences(references: CFRReference[]) {
  return references.reduce(
    (acc, ref) => {
      if (!acc[ref.title]) {
        acc[ref.title] = new Set<string>()
      }
      acc[ref.title].add(ref.chapter)
      return acc
    },
    {} as Record<number, Set<string>>
  )
}
