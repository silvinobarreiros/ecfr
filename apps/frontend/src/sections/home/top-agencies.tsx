import {
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material'
import Link from 'next/link'
import { useAgencies } from '@/api/analytics'

export default function TopAgencies() {
  const { agencies, agenciesLoading } = useAgencies()

  if (agenciesLoading) return <Box>Loading...</Box>

  const topAgencies = agencies.slice(0, 5)

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Top Agencies
        </Typography>
        <List>
          {topAgencies.map((agency) => (
            <ListItem key={agency.slug} disablePadding>
              <ListItemButton component={Link} href={`/agency/${agency.slug}`}>
                <ListItemText
                  primary={agency.name}
                  secondary={`${agency.shortName} - ${agency.cfrReferences.length} CFR References`}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  )
}
