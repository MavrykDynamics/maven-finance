import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { BGTitle } from 'pages/BreakGlass/BreakGlass.style'
import React from 'react'
import { DashboardStyled } from './Dashboard.style'

export const DashboardView = ({ tvl }: { tvl: number }) => {
  return (
    <DashboardStyled>
      <div className="top">
        <div className="tvlBlock">
          <BGTitle className="dashboard">Mavryk TVL</BGTitle>
          <CommaNumber beginningText="$" value={tvl} />
        </div>
      </div>
    </DashboardStyled>
  )
}
