import { Tooltip } from '@mui/material'
import styled from 'styled-components'
import { cyanColor, darkColor } from 'styles'

export const StyledTooltip = styled((props) => <Tooltip classes={{ popper: props.className }} {...props} />)`
  & .MuiTooltip-tooltip {
    background-color: ${cyanColor};
    color: ${darkColor};
    margin-bottom: 0 !important;
  }
`
