import * as React from 'react'

import { ColoredLineStyle, SECONDARY } from './ColoredLine.constants'
import { ColoredLineStyled } from './ColoredLine.style'

type ColoredLineProps = {
  kind: ColoredLineStyle
  color?: string
}

export const ColoredLine = ({ kind }: ColoredLineProps) => {
  let coloredLineClasses = kind
  return <ColoredLineStyled className={coloredLineClasses} />
}
ColoredLine.defaultProps = {
  kind: SECONDARY,
}
