import * as React from 'react'
import { VotingBarView } from './VotingBar.view'

interface VotingBarProps {
  loading: boolean
  forVotes: number
  againstVotes: number
  abstainingVotes: number
  unusedVotes: number
}
export const VotingBar = (props: VotingBarProps) => {
  return <VotingBarView {...props} />
}
