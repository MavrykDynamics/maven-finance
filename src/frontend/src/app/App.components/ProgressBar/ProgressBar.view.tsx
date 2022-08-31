import { ProgressBarStatus } from './ProgressBar.constants'
import { ProgressBarStyled } from './ProgressBar.style'

type ProgressBarViewProps = { status: ProgressBarStatus }

export const ProgressBarView = ({ status }: ProgressBarViewProps) => <ProgressBarStyled status={status} />
