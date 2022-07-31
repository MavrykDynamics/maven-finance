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
  const { governanceStorage } = useSelector((state: State) => state.governance)
  const endLevel = governanceStorage?.currentRoundEndLevel
  const [votingEnding, setVotingEnding] = useState<string>('')

  const timeNow = Date.now()
  const votingTime = new Date(votingEnding).getTime()

  const deltaTime = votingTime - timeNow
  const deltaHours = deltaTime / 1000 / 60 / 60
  const deltaMinutes = deltaHours * 60
  const deltaDays = deltaHours / 24
  const isEndedVotingTime = votingTime < timeNow
  const floorDeltaHours = Math.floor(deltaHours)
  const outputMinutes = Math.floor(deltaMinutes - floorDeltaHours * 60)

  const handleGetTimestampByLevel = async (level: number) => {
    const res = await getTimestampByLevel(level)
    setVotingEnding(res)
    // setVotingEnding('2022-07-31T18:44Z')
  }

  useEffect(() => {
    handleGetTimestampByLevel(endLevel ?? 0)
  }, [endLevel])

  return (
    <>
      {!votingEnding || isEndedVotingTime ? (
        <MoveToNextRound />
      ) : (
        <TimeLeftAreaWrap>
          {deltaDays >= 1 ? (
            <TimeLeftArea>
              <Pluralize singular={'day'} count={Math.round(deltaDays)} /> remaining
            </TimeLeftArea>
          ) : (
            <TimeLeftArea>
              <Pluralize singular={'hour'} count={floorDeltaHours} />{' '}
              <Pluralize singular={'minute'} count={outputMinutes} /> remaining
            </TimeLeftArea>
          )}
        </TimeLeftAreaWrap>
      )}
    </>
  )
}
