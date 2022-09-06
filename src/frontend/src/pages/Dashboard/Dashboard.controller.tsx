import * as React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from '../../reducers'
import { useEffect } from 'react'
import { DashboardStyled } from './Dashboard.style'
import { getVestingStorage } from '../Treasury/Treasury.actions'
import { Page } from 'styles'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { DashboardView } from './Dashboard.view'

export const Dashboard = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getVestingStorage())
  }, [dispatch])

  return (
    <Page>
      <PageHeader page={'dashboard'} />
      <DashboardView tvl={38545844} />
    </Page>
  )
}
