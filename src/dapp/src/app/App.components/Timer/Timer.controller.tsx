import * as PropTypes from 'prop-types'
import * as React from 'react'
import { useEffect, useState } from 'react'

import { TimerView } from './Timer.view'

type TimerProps = {
  deadline: string
}

export const Timer = ({ deadline }: TimerProps) => {
  const toSecond = 1000,
    toMinute = toSecond * 60,
    toHour = toMinute * 60,
    toDay = toHour * 24

  const [strings, setStrings] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  const countDown = new Date(deadline).getTime()

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime()
      const distance = countDown - now

      setStrings({
        days: Math.floor(distance / toDay),
        hours: Math.floor((distance % toDay) / toHour),
        minutes: Math.floor((distance % toHour) / toMinute),
        seconds: Math.floor((distance % toMinute) / toSecond),
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return <TimerView seconds={strings.seconds} minutes={strings.minutes} hours={strings.hours} days={strings.days} />
}

Timer.propTypes = {
  deadline: PropTypes.string.isRequired,
}

Timer.defaultProps = {
  deadline: undefined,
}
