import { TrimStyled } from './Trim.style'

type Props = {
  title: string
  size?: number
  className?: string
}

export function Trim({title, size = 11, className}: Props) {
  const isLongTitle = title.length > size
  const displayTitle = isLongTitle ? title.slice(0, size) : title
  
  return <TrimStyled className={className} trim={isLongTitle}>{displayTitle}</TrimStyled>
}
