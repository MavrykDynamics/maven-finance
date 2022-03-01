import * as React from 'react'
import { VotingBarView } from './VotingBar.view'
import { VoteStatistics } from '../../Governance.controller'

interface VotingBarProps {
  loading: boolean
  totalMVKVoted: number
  voteStatistics: VoteStatistics
  totalCirculatingMVKSupply: number
}
export const VotingBar = (props: VotingBarProps) => {
  return <VotingBarView {...props} />
}
