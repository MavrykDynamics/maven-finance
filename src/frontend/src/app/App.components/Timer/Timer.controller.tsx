import { useEffect, useMemo, useState } from 'react'
import { TimerView } from './Timer.view'
import { ShortTimer } from './Timer.style'

type TimerProps = {
  deadline?: string
  timestamp?: number
  options?: {
    short?: boolean
    showZeros?: boolean
    negativeColor?: string
    defaultColor?: string
  }
}

const toSecond = 1000,
  toMinute = toSecond * 60,
  toHour = toMinute * 60,
  toDay = toHour * 24

export const Timer = ({ deadline, timestamp, options }: TimerProps) => {
  const [strings, setStrings] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  const countDown = deadline ? new Date(deadline).getTime() : timestamp || Date.now()

  const toShowShortVariant = useMemo(() => {
    return options?.short && Math.abs(strings.days) > 1
  }, [options?.short, strings.days])
  
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

  return (
    <>
      {toShowShortVariant
        ? <ShortTimer>{'> 1d'}</ShortTimer>
        : <TimerView
            seconds={strings.seconds}
            minutes={strings.minutes}
            hours={strings.hours}
            days={strings.days}
            options={options || {}}
          />}
    </>

  )
}
