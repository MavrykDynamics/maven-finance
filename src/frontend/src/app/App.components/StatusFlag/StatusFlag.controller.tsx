import * as React from 'react'

import { StatusFlagStyle, UP, DOWN, PRIMARY, INFO } from './StatusFlag.constants'
import { ProposalStatus } from '../../../pages/Governance/mockProposals'
import { StatusFlagView } from './StatusFlag.view'

type StatusFlagProps = {
  text: string
  status: ProposalStatus | undefined
}

export const StatusFlag = ({ text, status }: StatusFlagProps) => {
  let kind: StatusFlagStyle
  switch (status) {
    case ProposalStatus.EXECUTED:
      kind = UP
      break
    case ProposalStatus.DEFEATED:
      kind = DOWN
      break
    case ProposalStatus.ONGOING:
      kind = PRIMARY
      break
    default:
      kind = INFO
      break
  }
  return <StatusFlagView kind={kind} text={text} />
}
StatusFlag.defaultProps = {
  text: 'DISCOVERY',
  status: ProposalStatus.DISCOVERY,
}
