import * as React from 'react'

import { TokenomicsImage, TokenomicsStyled } from './Tokenomics.style'

export const TokenomicsView = () => {
  return (
    <TokenomicsStyled id="tokenomics">
      <h1>Tokenomics</h1>
      <TokenomicsImage />
    </TokenomicsStyled>
  )
}
