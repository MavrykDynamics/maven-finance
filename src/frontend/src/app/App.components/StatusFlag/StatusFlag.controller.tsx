import * as React from 'react'

import { StatusFlagStyle, UP, DOWN, PRIMARY, INFO } from './StatusFlag.constants'

import { StatusFlagView } from './StatusFlag.view'
import { ProposalStatus } from '../../../utils/TypesAndInterfaces/Governance'

type StatusFlagProps = {
  text: string
  status: ProposalStatus | StatusFlagStyle | undefined
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

  if (!Object.values(ProposalStatus).includes(status as ProposalStatus)) {
    kind = status as StatusFlagStyle
  }
  return <StatusFlagView kind={kind} text={text} />
}
StatusFlag.defaultProps = {
  text: 'DISCOVERY',
  status: ProposalStatus.DISCOVERY,
}
