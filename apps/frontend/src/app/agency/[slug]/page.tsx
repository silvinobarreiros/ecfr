import { AgencyView } from '@/sections/agency/view'

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Agency',
}

type Props = {
  params: {
    slug: string
  }
}

export default function RecipeViewPage({ params }: Props) {
  const { slug } = params

  return <AgencyView slug={slug} />
}
