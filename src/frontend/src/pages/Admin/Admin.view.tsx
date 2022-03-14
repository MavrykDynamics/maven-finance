import * as React from 'react'
import { AdminStyled } from './Admin.style'
import { Button } from '../../app/App.components/Button/Button.controller'

type AdminViewProps = {
  handleChangeGovernancePeriod: (period: string) => void
  handleTrackFarm: () => void
}

export const AdminView = ({ handleChangeGovernancePeriod, handleTrackFarm }: AdminViewProps) => {
  return (
    <AdminStyled>
      <Button text={'Change to Proposal Period'} onClick={() => handleChangeGovernancePeriod('PROPOSAL')} />
      <Button text={'Change to Voting Period'} onClick={() => handleChangeGovernancePeriod('VOTING')} />
      <Button text={'Change to Time-lock Period'} onClick={() => handleChangeGovernancePeriod('TIME_LOCK')} />
      <Button text={'Track Farm'} onClick={handleTrackFarm} />
    </AdminStyled>
  )
}
