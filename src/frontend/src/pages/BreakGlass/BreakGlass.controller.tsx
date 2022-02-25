import * as React from 'react'
import { BreakGlassStyled } from './BreakGlass.style'
import { useDispatch, useSelector } from 'react-redux'
import { State } from '../../reducers'
import { useEffect, useState } from 'react'
import { getBreakGlassStorage } from './BreakGlass.actions'
import { Page } from 'styles'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { PRIMARY } from '../../app/App.components/PageHeader/PageHeader.constants'
import { BreakGlassView } from './BreakGlass.view'
import { getEmergencyGovernanceStorage } from '../Governance/Governance.actions'

export const BreakGlass = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { emergencyGovernanceStorage } = useSelector((state: State) => state.emergencyGovernance)
  const { breakGlassStorage } = useSelector((state: State) => state.breakGlass)

  useEffect(() => {
    dispatch(getEmergencyGovernanceStorage())
    dispatch(getBreakGlassStorage())
  }, [dispatch])

  const handleVoteForProposal = () => {
    console.log('Here in Vote for Proposal')
  }
  return (
    <Page>
      <PageHeader page={'break glass'} kind={PRIMARY} loading={loading} />
      <BreakGlassView />
    </Page>
  )
}
