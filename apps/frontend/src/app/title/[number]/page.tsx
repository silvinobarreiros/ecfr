import { TitleView } from '@/sections/title/view'

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Title',
}

type Props = {
  params: {
    number: number
  }
}

export default function RecipeViewPage({ params }: Props) {
  const { number } = params

  return <TitleView number={number} />
}
