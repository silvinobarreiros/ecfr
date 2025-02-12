import { forwardRef, useEffect, useState } from 'react'
// @mui
import Link from '@mui/material/Link'
import Box, { BoxProps } from '@mui/material/Box'
// routes
import { RouterLink } from 'src/routes/components'
import { useAuthContext } from '@/auth/hooks'
import { useSettingsContext } from '../settings'

// ----------------------------------------------------------------------

export interface LogoProps extends BoxProps {
  disabledLink?: boolean
}

const Logo = forwardRef<HTMLDivElement, LogoProps>(
  ({ disabledLink = false, sx, height = 40, width = 40, ...other }, ref) => {
    const settings = useSettingsContext()
    const [image, setImage] = useState<string>(
      settings.themeMode === 'light' ? '/logo/logo-light.svg' : '/logo/logo-dark.svg'
    )
    const { authenticated } = useAuthContext()

    const [route, setRoute] = useState<string>('/')

    useEffect(() => {
      if (authenticated) {
        setRoute('/dashboard')
      }
    }, [authenticated, setRoute])

    useEffect(() => {
      setImage(settings.themeMode === 'light' ? '/logo/logo-light.svg' : '/logo/logo-dark.svg')
    }, [settings.themeMode])

    const logo = (
      <Box component="img" src={image} sx={{ width, height, cursor: 'pointer', ...sx }} />
    )

    if (disabledLink) {
      return logo
    }

    return (
      <Link component={RouterLink} href={route} sx={{ display: 'contents' }}>
        {logo}
      </Link>
    )
  }
)

export default Logo
