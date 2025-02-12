import {
  Button,
  Card,
  CardContent,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import Link from 'next/link'
import { useTitles } from '@/api/analytics'

export default function TitleOverview() {
  const { titles, titlesLoading } = useTitles()

  if (titlesLoading) return <div>Loading...</div>

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Title Overview
        </Typography>

        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title Number</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Last Amended</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {titles.map((title) => (
                <TableRow key={title.number}>
                  <TableCell>{title.number}</TableCell>
                  <TableCell>{title.name}</TableCell>
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
                  <TableCell>
                    <Button
                      component={Link}
                      href={`/title/${title.number}`}
                      variant="outlined"
                      size="small"
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )
}
