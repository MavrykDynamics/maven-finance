import { useSelector } from 'react-redux'
import { State } from 'reducers'

import { ProgressBarStatus } from './ProgressBar.constants'
import { ProgressBarStyled } from './ProgressBar.style'

export const ProgressBar = () => {
  const { isLoading } = useSelector((state: State) => state.loading)

  return <ProgressBarStyled status={isLoading ? ProgressBarStatus.MOVING : ProgressBarStatus.NO_DISPLAY} />
}
