import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { State } from 'reducers'

// components
import MoveToNextRound from '../MoveNextRound/MoveNextRound.controller'

// actions
import { getTimestampByLevel } from '../../Governance/Governance.actions'

// styles
import { Timer } from 'app/App.components/Timer/Timer.controller'
import { TimeLeftAreaWrap } from './TimeRemaining.style'

export default function TimeRemaining() {
  const { currentRoundEndLevel = 0 } = useSelector((state: State) => state.governance.governanceStorage)
  const [timerDeadline, setTimerDeadline] = useState(0)

  useEffect(() => {
    ;(async () => {
      const duration = await getTimestampByLevel(currentRoundEndLevel)
      setTimerDeadline(new Date(duration).getTime())
    })()
  }, [currentRoundEndLevel])

  const timerActive = Boolean(currentRoundEndLevel) && timerDeadline > Date.now()

  return (
    <TimeLeftAreaWrap showBorder={timerActive}>
      {!timerActive ? <MoveToNextRound /> : <Timer timestamp={timerDeadline} options={{ showZeros: true }} />}
    </TimeLeftAreaWrap>
  )
}
