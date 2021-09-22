import * as React from 'react'

import { FeaturesComponent, FeaturesGrid, FeaturesStyled } from './Features.style'

export const FeaturesView = () => {
  return (
    <FeaturesStyled>
      <h1>Why Mavryk?</h1>
      <FeaturesGrid>
        <FeaturesComponent>
          <img alt="feature" src="/images/icon1.png" />
          <div>A Stablecoin You Control</div>
          <p>zUSD is pegged to the dollar, giving you freedom from volatility.</p>
        </FeaturesComponent>
        <FeaturesComponent>
          <img alt="feature" src="/images/icon2.png" />
          <div>zUSD Savings Rate</div>
          <p>Lock your zUSD to earn the Dynamic Savings Rate.</p>
        </FeaturesComponent>
        <FeaturesComponent>
          <img alt="feature" src="/images/icon3.png" />
          <div>Yield Farming</div>
          <p>Stake your LP tokens to earn more MVK.</p>
        </FeaturesComponent>
      </FeaturesGrid>
    </FeaturesStyled>
  )
}
