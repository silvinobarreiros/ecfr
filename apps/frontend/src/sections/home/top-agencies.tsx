import { useAgencies } from '@/api/analytics'
import { CFRReference } from '@/types/analytics'
import ClearIcon from '@mui/icons-material/Clear'
import FilterListIcon from '@mui/icons-material/FilterList'
import SearchIcon from '@mui/icons-material/Search'
import {
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  MenuItem,
  Pagination,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import Link from 'next/link'
import { useMemo, useState } from 'react'

const ITEMS_PER_PAGE = 5
const CARD_HEIGHT = 800

interface SearchFilters {
  name: string
  title?: string
  chapter?: string
  hasChildren: boolean
}

function HighlightedText({ text, highlight }: { text: string; highlight: string }) {
  if (!highlight.trim()) return <>{text}</>

  const parts = text.split(new RegExp(`(${highlight})`, 'gi'))
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <Box component="span" key={i} sx={{ backgroundColor: 'warning.light' }}>
            {part}
          </Box>
        ) : (
          part
        )
      )}
    </>
  )
}

function SearchControls({
  filters,
  onFilterChange,
  onClear,
}: {
  filters: SearchFilters
  onFilterChange: (filters: SearchFilters) => void
  onClear: () => void
}) {
  const titles = Array.from({ length: 50 }, (_, i) => (i + 1).toString())
  const chapters = Array.from({ length: 20 }, (_, i) => (i + 1).toString())

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search agencies..."
          value={filters.name}
          onChange={(e) => onFilterChange({ ...filters, name: e.target.value })}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: filters.name && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={onClear}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid item xs={6}>
        <FormControl size="small" fullWidth>
          <InputLabel>Title</InputLabel>
          <Select
            value={filters.title || ''}
            onChange={(e) => onFilterChange({ ...filters, title: e.target.value })}
            label="Title"
          >
            <MenuItem value="">All</MenuItem>
            {titles.map((title) => (
              <MenuItem key={title} value={title}>
                Title {title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={6}>
        <FormControl size="small" fullWidth>
          <InputLabel>Chapter</InputLabel>
          <Select
            value={filters.chapter || ''}
            onChange={(e) => onFilterChange({ ...filters, chapter: e.target.value })}
            label="Chapter"
          >
            <MenuItem value="">All</MenuItem>
            {chapters.map((chapter) => (
              <MenuItem key={chapter} value={chapter}>
                Chapter {chapter}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  )
}

export default function TopAgencies() {
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<SearchFilters>({
    name: '',
    title: '',
    chapter: '',
    hasChildren: false,
  })
  const { agencies, agenciesLoading } = useAgencies()

  const filteredAndSortedAgencies = useMemo(
    () =>
      agencies
        .filter((agency) => {
          const fullName = agency.name.toLowerCase().includes(filters.name.toLowerCase())
          const shortName = agency.shortName
            ? agency.shortName.toLowerCase().includes(filters.name.toLowerCase())
            : false

          const nameMatch = fullName || shortName

          const titleMatch =
            !filters.title ||
            agency.cfrReferences.some((ref) => ref.title.toString() === filters.title)

          const chapterMatch =
            !filters.chapter || agency.cfrReferences.some((ref) => ref.chapter === filters.chapter)

          const childrenMatch =
            !filters.hasChildren || (agency.children && agency.children.length > 0)

          return nameMatch && titleMatch && chapterMatch && childrenMatch
        })
        .sort((a, b) => b.cfrReferences.length - a.cfrReferences.length),
    [agencies, filters]
  )

  const totalPages = Math.ceil(filteredAndSortedAgencies.length / ITEMS_PER_PAGE)
  const currentPageAgencies = filteredAndSortedAgencies.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  const handleClearFilters = () => {
    setFilters({
      name: '',
      title: '',
      chapter: '',
      hasChildren: false,
    })
    setPage(1)
  }

  if (agenciesLoading) return <Box>Loading...</Box>

  return (
    <Card sx={{ height: CARD_HEIGHT, display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: '0 0 auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Agencies</Typography>
          <Tooltip title="Clear filters">
            <IconButton onClick={handleClearFilters} size="small">
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <SearchControls
          filters={filters}
          onFilterChange={setFilters}
          onClear={handleClearFilters}
        />
      </CardContent>

      <Box sx={{ flex: '1 1 auto', overflowY: 'auto' }}>
        {currentPageAgencies.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No agencies found matching the current filters
            </Typography>
          </Box>
        ) : (
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
                      <Typography variant="subtitle1">
                        <HighlightedText text={agency.name} highlight={filters.name} />
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <HighlightedText text={agency.shortName ?? ''} highlight={filters.name} />
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
                                label={`Title ${title}, Chapters: (${Array.from(chapters).sort().join(', ')})`}
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
        )}
      </Box>

      {totalPages > 1 && (
        <Box
          sx={{
            flex: '0 0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {filteredAndSortedAgencies.length} agencies found
          </Typography>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            size="small"
          />
        </Box>
      )}
    </Card>
  )
}

function groupCFRReferences(references: CFRReference[]) {
  return references.reduce(
    (acc, ref) => {
      if (!ref.chapter) return acc

      let ac = acc[ref.title]

      if (!ac) {
        ac = new Set<string>()
      }

      ac.add(ref.chapter)
      acc[ref.title] = ac

      return acc
    },
    {} as Record<number, Set<string>>
  )
}
