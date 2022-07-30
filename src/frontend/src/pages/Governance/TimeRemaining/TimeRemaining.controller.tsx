import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { State } from 'reducers'

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
  const outputMinutes = deltaMinutes - Math.floor(deltaHours) * 60

  const handleGetTimestampByLevel = async (level: number) => {
    const res = await getTimestampByLevel(level)
    setVotingEnding(res)
    // setVotingEnding('2022-07-30T15:11:25Z')
  }

  useEffect(() => {
    handleGetTimestampByLevel(endLevel ?? 0)
  }, [endLevel])

  return (
    <>
      {isEndedVotingTime ? (
        <MoveToNextRound />
      ) : (
        <TimeLeftAreaWrap>
          {deltaDays >= 1 ? (
            <TimeLeftArea>{Math.ceil(deltaDays)} days remaining</TimeLeftArea>
          ) : (
            <TimeLeftArea>
              {Math.floor(deltaHours) > 0 ? `${Math.floor(deltaHours)} hours` : ''}{' '}
              {outputMinutes >= 0 ? `${Math.floor(outputMinutes)} minutes` : ''} remaining
            </TimeLeftArea>
          )}
        </TimeLeftAreaWrap>
      )}
    </>
  )
}
