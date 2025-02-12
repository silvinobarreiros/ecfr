'use client'

import SimpleLayout from '@/layouts/simple'

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode
}

export default function Layout({ children }: Props) {
  return <SimpleLayout>{children}</SimpleLayout>
}
