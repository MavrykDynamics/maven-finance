import * as React from 'react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { State } from 'reducers'

import { hideProgressBar, updateProgressBar } from './ProgressBar.actions'
import { ProgressBarView } from './ProgressBar.view'

export const ProgressBar = () => {
  const status = useSelector((state: State) => state.progressBar?.status)
  const loading = useSelector((state: State) => state.loading)
  const dispatch = useDispatch()
  const { pathname } = useLocation()

  useEffect(() => {
    dispatch(updateProgressBar())
  }, [loading, dispatch])

  useEffect(() => {
    dispatch(hideProgressBar())
  }, [pathname, dispatch])

  return <ProgressBarView status={status} />
  // return <>{status !== ProgressBarStatus.NO_DISPLAY && <ProgressBarView status={status} />}</>
}
