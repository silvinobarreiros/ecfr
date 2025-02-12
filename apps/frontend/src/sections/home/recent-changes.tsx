/* eslint-disable no-nested-ternary */
import { Card, CardContent, Typography, List, ListItem, ListItemText, Chip } from '@mui/material'

import { useHistoricalChanges } from '@/api/analytics'

export default function RecentChanges() {
  // Get last 30 days of changes
  const endDate = new Date().toISOString().split('T')[0] as string
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0] as string

  const { changes, changesLoading } = useHistoricalChanges('all', startDate, endDate)

  if (changesLoading) return <div>Loading...</div>

  // Sort changes by date (most recent first)
  const recentChanges = [...changes]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Recent Changes
        </Typography>

        <List>
          {recentChanges.map((change, index) => (
            <ListItem key={`${change.date}-${change.section}-${index}`} divider>
              <ListItemText
                primary={
                  <Typography variant="subtitle2">
                    {change.title} CFR {change.section}
                  </Typography>
                }
                secondary={
                  <>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(change.date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2">{change.summary}</Typography>
                    <Chip
                      size="small"
                      label={change.changeType}
                      color={
                        change.changeType === 'addition'
                          ? 'success'
                          : change.changeType === 'removal'
                            ? 'error'
                            : 'primary'
                      }
                      sx={{ mt: 1 }}
                    />
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  )
}
