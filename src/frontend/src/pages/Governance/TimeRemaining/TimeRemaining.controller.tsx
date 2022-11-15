import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { State } from 'reducers'
/* @ts-ignore */
import Pluralize from 'react-pluralize'

// components
import MoveToNextRound from '../MoveNextRound/MoveNextRound.controller'

// actions
import { getTimestampByLevel } from '../../Governance/Governance.actions'

// styles
import { TimeLeftAreaWrap, TimeLeftArea } from './TimeRemaining.style'

export default function TimeRemaining() {
  const { currentRoundEndLevel = 0 } = useSelector((state: State) => state.governance.governanceStorage)
  const [timerData, setTimerData] = useState({
    days: 0,
    time: 0,
    hours: 0,
    minutes: 0,
  })

  useEffect(() => {
    let timerId: NodeJS.Timer
    ;(async () => {
      const duration = await getTimestampByLevel(currentRoundEndLevel)

      timerId = setInterval(() => {
        const deltaTime = new Date(duration).getTime() - Date.now()
        const deltaHours = deltaTime / 1000 / 60 / 60

        setTimerData({
          time: deltaTime,
          days: Math.round(deltaHours / 24),
          hours: Math.floor(deltaHours),
          minutes: Math.floor(deltaHours * 60 - Math.floor(deltaHours) * 60),
        })
      }, 1000)
    })()

    return () => clearInterval(timerId)
  }, [currentRoundEndLevel])

  return (
    <>
      {!currentRoundEndLevel || timerData.time <= 0 ? (
        <MoveToNextRound />
      ) : (
        <TimeLeftAreaWrap>
          {timerData.days >= 1 ? (
            <TimeLeftArea>
              <Pluralize singular={'day'} count={timerData.days} /> remaining
            </TimeLeftArea>
          ) : (
            <TimeLeftArea>
              <Pluralize singular={'hour'} count={timerData.hours} />{' '}
              <Pluralize singular={'minute'} count={timerData.minutes} /> remaining
            </TimeLeftArea>
          )}
        </TimeLeftAreaWrap>
      )}
    </>
  )
}
