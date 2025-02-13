import SearchIcon from '@mui/icons-material/Search'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useTitles } from '@/api/analytics'

const CARD_HEIGHT = 600
const PAGE_SIZE = 15

type SortField = 'number' | 'name' | 'latestAmendedOn'
type SortOrder = 'asc' | 'desc'

interface SortConfig {
  field: SortField
  order: SortOrder
}

// Helper function for safe HTML highlighting
function highlightText(text: string, query: string) {
  if (!query.trim()) return text

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'))

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <Box
            key={i}
            component="span"
            sx={{
              backgroundColor: 'warning.dark',
              borderRadius: '2px',
              padding: '0 2px',
            }}
          >
            {part}
          </Box>
        ) : (
          part
        )
      )}
    </>
  )
}

export default function TitleOverview() {
  const { titles, titlesLoading } = useTitles()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE)
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'number', order: 'asc' })
  const [searchQuery, setSearchQuery] = useState('')

  const handleSort = (field: SortField) => {
    setSortConfig((current) => ({
      field,
      order: current.field === field && current.order === 'asc' ? 'desc' : 'asc',
    }))
  }

  const sortedAndFilteredTitles = useMemo(() => {
    const filtered = titles.filter(
      (title) =>
        title.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        title.number.toString().includes(searchQuery)
    )

    return filtered.sort((a, b) => {
      const { field, order } = sortConfig
      let comparison = 0

      // eslint-disable-next-line default-case
      switch (field) {
        case 'number':
          comparison = a.number - b.number
          break
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'latestAmendedOn':
          if (!a.latestAmendedOn || !b.latestAmendedOn) {
            break
          }

          comparison = new Date(a.latestAmendedOn).getTime() - new Date(b.latestAmendedOn).getTime()
          break
      }

      return order === 'asc' ? comparison : -comparison
    })
  }, [titles, sortConfig, searchQuery])

  const currentTitles = sortedAndFilteredTitles.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
    setPage(0)
  }

  if (titlesLoading) return <div>Loading...</div>

  return (
    <Card sx={{ height: CARD_HEIGHT, display: 'flex', flexDirection: 'column' }}>
      {/* Fixed Header Section */}
      <CardContent
        sx={{
          flex: '0 0 auto',
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          position: 'sticky',
          top: 0,
          zIndex: 1,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs>
            <Typography variant="h6">Title Overview</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search titles..."
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </CardContent>

      {/* Scrollable Table Section */}
      <Box
        sx={{
          flex: '1 1 auto',
          overflow: 'auto',
          position: 'relative',
        }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.field === 'number'}
                  direction={sortConfig.field === 'number' ? sortConfig.order : 'asc'}
                  onClick={() => handleSort('number')}
                >
                  Title Number
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.field === 'name'}
                  direction={sortConfig.field === 'name' ? sortConfig.order : 'asc'}
                  onClick={() => handleSort('name')}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.field === 'latestAmendedOn'}
                  direction={sortConfig.field === 'latestAmendedOn' ? sortConfig.order : 'asc'}
                  onClick={() => handleSort('latestAmendedOn')}
                >
                  Last Amended
                </TableSortLabel>
              </TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentTitles.map((title) => (
              <TableRow
                key={title.number}
                hover
                sx={{
                  cursor: 'pointer',
                  textDecoration: 'none',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  '& a': {
                    textDecoration: 'none',
                    color: 'inherit',
                  },
                }}
                component={Link}
                href={`/title/${title.number}`}
              >
                <TableCell>{title.number}</TableCell>
                <TableCell>
                  {searchQuery ? highlightText(title.name, searchQuery) : title.name}
                </TableCell>
                <TableCell>
                  {title.latestAmendedOn
                    ? new Date(title.latestAmendedOn).toLocaleDateString()
                    : ''}
                </TableCell>
                <TableCell>
                  {title.processingInProgress ? (
                    <Chip label="Processing" color="warning" size="small" />
                  ) : (
                    <Chip label="Up to date" color="success" size="small" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      {/* Fixed Footer Section */}
      <TablePagination
        component="div"
        count={sortedAndFilteredTitles.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        sx={{
          flex: '0 0 auto',
          borderTop: 1,
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          position: 'sticky',
          bottom: 0,
          zIndex: 1,
        }}
      />
    </Card>
  )
}
