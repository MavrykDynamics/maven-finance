import * as React from 'react'
import { GovernanceStyled } from './Governance.style'
import { useDispatch, useSelector } from 'react-redux'
import { State } from '../../reducers'
import { useEffect } from 'react'
import { getBreakGlassStorage, getEmergencyGovernanceStorage, getGovernanceStorage } from './Governance.actions'
import { Page } from 'styles'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { PRIMARY } from '../../app/App.components/PageHeader/PageHeader.constants'

export const Governance = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { governanceStorage } = useSelector((state: State) => state.governance)
  const { emergencyGovernanceStorage } = useSelector((state: State) => state.emergencyGovernance)
  const { breakGlassStorage } = useSelector((state: State) => state.breakGlass)

  useEffect(() => {
    dispatch(getGovernanceStorage())
    dispatch(getEmergencyGovernanceStorage())
    dispatch(getBreakGlassStorage())
  }, [dispatch])

  return (
    <Page>
      <GovernanceStyled>
        <PageHeader page={'governance'} kind={PRIMARY} loading={loading} />
        <div>Here on the Governance Page</div>
      </GovernanceStyled>
    </Page>
  )
}
