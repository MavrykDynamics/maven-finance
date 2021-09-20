import * as React from 'react'

import { TimerStyled } from './Timer.style'

type TimerViewProps = {
  seconds: number
  minutes: number
  hours: number
  days: number
}

export const TimerView = ({ seconds, minutes, hours, days }: TimerViewProps) => {
  return (
    <TimerStyled>
      <ul>
        <li>
          <span id="days"></span>
          {days}d
        </li>
        <li>
          <span id="hours"></span>
          {hours}h
        </li>
        <li>
          <span id="minutes"></span>
          {minutes}m
        </li>
        <li>
          <span id="seconds"></span>
          {seconds}s
        </li>
      </ul>
    </TimerStyled>
  )
}

TimerView.propTypes = {}

TimerView.defaultProps = {}
