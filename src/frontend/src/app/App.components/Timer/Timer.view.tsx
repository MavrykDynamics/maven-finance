import * as React from 'react'
import { downColor, headerColor } from 'styles'

import { TimerStyled } from './Timer.style'

type TimerViewProps = {
  seconds: number
  minutes: number
  hours: number
  days: number
  options: {
    showZeros?: boolean
    negativeColor?: string
    defaultColor?: string
  }
}

export const TimerView = ({
  seconds,
  minutes,
  hours,
  days,
  options: { showZeros = true, negativeColor = downColor, defaultColor = headerColor },
}: TimerViewProps) => {
  return (
    <TimerStyled negativeColor={negativeColor} defaultColor={defaultColor}>
      <ul>
        {showZeros ? (
          <>
            <li className={days < 0 ? 'negative' : ''}>
              <span id="days"></span>
              {days}d
            </li>
            <li className={hours < 0 ? 'negative' : ''}>
              <span id="hours"></span>
              {hours}h
            </li>
            <li className={minutes < 0 ? 'negative' : ''}>
              <span id="minutes"></span>
              {minutes}m
            </li>
            <li className={seconds < 0 ? 'negative' : ''}>
              <span id="seconds"></span>
              {seconds}s
            </li>
          </>
        ) : (
          <>
            {days !== 0 && (
              <li className={days < 0 ? 'negative' : ''}>
                <span id="days"></span>
                {days}d
              </li>
            )}
            {hours !== 0 && (
              <li className={hours < 0 ? 'negative' : ''}>
                <span id="hours"></span>
                {hours}h
              </li>
            )}
            {minutes !== 0 && (
              <li className={minutes < 0 ? 'negative' : ''}>
                <span id="minutes"></span>
                {minutes}m
              </li>
            )}
            {seconds !== 0 && (
              <li className={seconds < 0 ? 'negative' : ''}>
                <span id="seconds"></span>
                {seconds}s
              </li>
            )}
          </>
        )}
      </ul>
    </TimerStyled>
  )
}

TimerView.propTypes = {}

TimerView.defaultProps = {}
