import * as React from 'react'

import { PRIMARY, StatusFlagStyle } from './StatusFlag.constants'
import { StatusFlagStyled } from './StatusFlag.style'

type StatusFlagViewProps = {
  kind: StatusFlagStyle
  text: string | undefined
}

export const StatusFlagView = ({ kind, text }: StatusFlagViewProps) => {
  return <StatusFlagStyled className={kind}>{text}</StatusFlagStyled>
}
