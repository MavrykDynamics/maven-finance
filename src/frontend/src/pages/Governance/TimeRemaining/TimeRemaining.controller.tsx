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
import { COLON_VIEW } from 'app/App.components/Timer/Timer.view'

export default function TimeRemaining() {
  const { currentRoundEndLevel = 0 } = useSelector((state: State) => state.governance.governanceStorage)
  const [timerDeadline, setTimerDeadline] = useState(0)
  const [timerActive, setTimerActive] = useState(false)

  useEffect(() => {
    ;(async () => {
      const duration = await getTimestampByLevel(currentRoundEndLevel)
      setTimerDeadline(new Date(duration).getTime())
      setTimerActive(Boolean(currentRoundEndLevel) && timerDeadline > Date.now())
    })()
  }, [currentRoundEndLevel])

  return (
    <TimeLeftAreaWrap showBorder={timerActive}>
      {!timerActive ? (
        <MoveToNextRound />
      ) : (
        <>
          <Timer
            timestamp={timerDeadline}
            options={{
              showZeros: true,
              shownParts: ['h', 'm', 's'],
              timerView: COLON_VIEW,
              showFullDay: true,
              endText: 'remaining',
              defaultColor: '#77A4F2',
            }}
          />
        </>
      )}
    </TimeLeftAreaWrap>
  )
}
