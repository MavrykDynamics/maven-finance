import * as React from 'react'

import { PartnersGrid, PartnersStyled } from './Partners.style'

export const PartnersView = () => {
  return (
    <PartnersStyled>
      <h1>Partners</h1>
      <PartnersGrid>
        <a href="https://tezos.co.il/" target="_blank" rel="noreferrer">
          <img alt="partner" src="/images/tezos-israel.png" />
        </a>
        <a href="https://tzbaker.co.il/" target="_blank" rel="noreferrer">
          <img alt="partner" src="/images/bakery-il.png" />
        </a>
        <a href="https://blockchase.com/" target="_blank" rel="noreferrer">
          <img alt="partner" src="/images/blockchase.png" />
        </a>
        <a href="https://www.ebnlaw.co.il/" target="_blank" rel="noreferrer">
          <img alt="partner" src="/images/ebn-go.png" />
        </a>
        <div />
        <a href="https://www.wentworthhall.com/" target="_blank" rel="noreferrer">
          <img alt="partner" src="/images/wentworth-hall.png" />
        </a>
        <a href="https://www.evg.co/" target="_blank" rel="noreferrer">
          <img alt="partner" src="/images/everest-block-ventures.png" />
        </a>
        <div />
      </PartnersGrid>
    </PartnersStyled>
  )
}
