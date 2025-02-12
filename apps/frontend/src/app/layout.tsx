import 'src/global.css'

// ----------------------------------------------------------------------

import ThemeProvider from 'src/theme'
import { primaryFont } from 'src/theme/typography'

import ProgressBar from 'src/components/progress-bar'
import { MotionLazy } from 'src/components/animate/motion-lazy'
import SnackbarProvider from 'src/components/snackbar/snackbar-provider'
import { SettingsProvider } from 'src/components/settings'

// ----------------------------------------------------------------------

export const viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata = {
  title: 'Doge Demo',
  description: 'Doge Demo',
  keywords: 'doge',
  manifest: '/manifest.json',
  icons: [
    { rel: 'icon', url: '/favicon/favicon.ico' },
    { rel: 'icon', type: 'image/png', sizes: '16x16', url: '/favicon/favicon-16x16.png' },
    { rel: 'icon', type: 'image/png', sizes: '32x32', url: '/favicon/favicon-32x32.png' },
    { rel: 'apple-touch-icon', sizes: '180x180', url: '/favicon/apple-touch-icon.png' },
  ],
}

type Props = {
  children: React.ReactNode
}

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en" className={primaryFont.className}>
      <body>
        <SettingsProvider
          defaultSettings={{
            themeMode: 'dark', // 'light' | 'dark'
            themeDirection: 'ltr', //  'rtl' | 'ltr'
            themeContrast: 'default', // 'default' | 'bold'
            themeLayout: 'vertical', // 'vertical' | 'horizontal' | 'mini'
            themeColorPresets: 'default', // 'default' | 'cyan' | 'purple' | 'blue' | 'orange' | 'red'
            themeStretch: false,
          }}
        >
          <ThemeProvider>
            <MotionLazy>
              <SnackbarProvider>
                <ProgressBar />
                {children}
              </SnackbarProvider>
            </MotionLazy>
          </ThemeProvider>
        </SettingsProvider>
      </body>
    </html>
  )
}
