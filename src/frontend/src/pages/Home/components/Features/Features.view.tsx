import * as React from 'react'

import { FeaturesComponent, FeaturesGrid, FeaturesStyled } from './Features.style'

export const FeaturesView = () => {
  return (
    <FeaturesStyled>
      <FeaturesGrid>
        <FeaturesComponent>
          <img alt="feature" src="/images/money.svg" />
          <div>A Stablecoin You Control</div>
          <p>zUSD is pegged to the dollar, giving you freedom from volatility.</p>
        </FeaturesComponent>
        <FeaturesComponent>
          <img alt="feature" src="/images/piggy.svg" />
          <div>zUSD Savings Rate</div>
          <p>Lock your zUSD to earn the Dynamic Savings Rate.</p>
        </FeaturesComponent>
        <FeaturesComponent>
          <img alt="feature" src="/images/plant.svg" />
          <div>Yield Farming</div>
          <p>Stake your LP tokens to earn more MVK.</p>
        </FeaturesComponent>
      </FeaturesGrid>
    </FeaturesStyled>
  )
}
