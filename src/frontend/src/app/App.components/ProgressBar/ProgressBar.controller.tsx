import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

import { updateProgressBar } from './ProgressBar.actions'
import { ProgressBarView } from './ProgressBar.view'

export const ProgressBar = () => {
  const status = useSelector((state: State) => state.progressBar?.status)
  const { isLoading } = useSelector((state: State) => state.loading)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(updateProgressBar())
  }, [isLoading])

  return <ProgressBarView status={status} />
}
