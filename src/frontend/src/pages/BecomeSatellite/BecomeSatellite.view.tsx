import { Button } from 'app/App.components/Button/Button.controller'
import { Input } from 'app/App.components/Input/Input.controller'
import { SatellitesHeader } from 'pages/Satellites/SatellitesHeader/SatellitesHeader.controller'
import { useState } from 'react'
import { Message, Page } from 'styles'

import { BecomeSatelliteForm, BecomeSatelliteFormBalanceCheck } from './BecomeSatellite.style'

export const BecomeSatelliteView = () => {
  const balanceOk = true
  const [inputAmount, setInputAmount] = useState(0)

  return (
    <Page>
      <SatellitesHeader />
      <BecomeSatelliteForm>
        <p>1- Stake at least 10,000 MVK</p>
        <BecomeSatelliteFormBalanceCheck balanceOk={balanceOk}>
          Currently staking 12,300 MVK
        </BecomeSatelliteFormBalanceCheck>
        <p>2- Enter your name</p>
        <Input
          type="number"
          placeholder="name"
          value={inputAmount}
          onChange={(e: any) => setInputAmount(e.target.value)}
          onBlur={() => {}}
        />
      </BecomeSatelliteForm>
    </Page>
  )
}
