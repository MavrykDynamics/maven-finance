import { ColoredLineStyle, SECONDARY } from './ColoredLine.constants'
import { ColoredLineStyled } from './ColoredLine.style'

type ColoredLineProps = {
  kind: ColoredLineStyle
  color?: string
}

export const ColoredLine = ({ kind = SECONDARY, color = '' }: ColoredLineProps) => (
  <ColoredLineStyled className={`${kind} ${color}`} />
)
