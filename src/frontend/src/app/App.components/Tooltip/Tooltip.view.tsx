import { Tooltip } from '@mui/material'
import styled from 'styled-components'
import { cyanColor, darkColor } from 'styles'
import Icon from '../Icon/Icon.view'

export const StyledTooltip = styled((props) => <Tooltip classes={{ popper: props.className }} {...props} />)`
  & .MuiTooltip-tooltip {
    background-color: ${cyanColor};
    color: ${darkColor};
    margin-bottom: 0 !important;
  }
`

export const TooltipStyled = styled.div<{ defaultStrokeColor?: string }>`
  margin-left: 5px;
  cursor: pointer;
  position: relative;
  display: inline;
  width: 16px;
  height: 16px;

  svg {
    width: 16px;
    height: 16px;
    fill: ${({ defaultStrokeColor }) => defaultStrokeColor || '#8d86eb'};
  }

  .text {
    font-size: 12px;
    position: absolute;
    bottom: 150%;
    left: 50%;
    transform: translateX(-50%);
    display: block;
    white-space: pre-line;
    padding: 3px 5px;
    border-radius: 3px;
    line-height: 15px;
    background: #503eaa;
    color: #9ea9e8;
    opacity: 0;
    transition: 0.3s all;
    visibility: hidden;
    width: max-content;
    max-width: 330px;
  }

  .text::after {
    content: ' ';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #503eaa transparent transparent transparent;
  }

  &:hover {
    .text {
      visibility: visible;
      opacity: 1;
    }

    svg {
      fill: ${cyanColor};
    }
  }
`

export const CustomTooltip = ({
  text,
  defaultStrokeColor,
  className = '',
  iconId,
}: {
  text?: string
  defaultStrokeColor?: string
  className?: string
  iconId?: 'info' | 'question'
}) => (
  <TooltipStyled className={className} defaultStrokeColor={defaultStrokeColor}>
    {iconId ? <Icon id={iconId} /> : null}
    {text && <div className="text">{text}</div>}
  </TooltipStyled>
)
