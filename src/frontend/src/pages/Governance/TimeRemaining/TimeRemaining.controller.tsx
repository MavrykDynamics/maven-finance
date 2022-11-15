import { useEffect, useState } from 'react'
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
  const { currentRoundEndLevel } = useSelector((state: State) => state.governance.governanceStorage)
  const [endDate, setEndDate] = useState('')
  const [timerData, setTimerData] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
  })

  const handleGetTimestampByLevel = async (level: number) => {
    setEndDate(await getTimestampByLevel(level))
  }

  useEffect(() => {
    handleGetTimestampByLevel(currentRoundEndLevel ?? 0)
  }, [currentRoundEndLevel])

  useEffect(() => {
    const interval = setInterval(() => {
      const deltaTime = new Date(endDate).getTime() - Date.now()
      const deltaHours = deltaTime / 1000 / 60 / 60

      setTimerData({
        days: Math.round(deltaHours / 24),
        hours: Math.floor(deltaHours),
        minutes: Math.floor(deltaHours * 60 - Math.floor(deltaHours) * 60),
      })
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  console.log(endDate, timerData)

  return (
    <>
      {!endDate || (!timerData.days && !timerData.hours && !timerData.minutes) ? (
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
