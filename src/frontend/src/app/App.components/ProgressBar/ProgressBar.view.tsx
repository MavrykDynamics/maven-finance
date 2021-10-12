import * as PropTypes from 'prop-types'
import * as React from 'react'
import { ProgressBarStatus } from './ProgressBar.constants'

import { ProgressBarStyled } from './ProgressBar.style'

type ProgressBarViewProps = { status: ProgressBarStatus }

export const ProgressBarView = ({ status }: ProgressBarViewProps) => <ProgressBarStyled status={status} />

ProgressBarView.propTypes = {
  status: PropTypes.string,
}

ProgressBarView.defaultProps = {
  status: ProgressBarStatus.NO_DISPLAY,
}
