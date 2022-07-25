import React, { useState } from 'react'

import { ContractCardTopSection, ContractCardWrapper } from './ContractCard.style'
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { ProposalStatus } from '../../../utils/TypesAndInterfaces/Governance'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { BGAccordion } from '../Accordeon/Accordeon.view'

type ContractCardProps = {
  contract: Record<string, unknown>
  isActive?: Boolean
  onClick?: () => void
}
export const ContractCard = ({ contract, isActive, onClick }: ContractCardProps) => {
  const [isExpanded, setExpanded] = useState(false)

  const title = contract.title as string
  const address = contract.address as string
  const methods = contract.methods as Record<string, boolean>
  console.log(title)
  const isStatusPaused = methods ? Object.keys(methods).some((method) => methods[method]) : false

  return (
    <ContractCardWrapper className={isActive ? 'active' : ''} onClick={onClick}>
      <ContractCardTopSection>
        <div className="card-title">
          <div className="truncate-title" title={title}>
            {title}
          </div>
        </div>

        <div className="card-flag-wrapper">
          <StatusFlag
            text={isStatusPaused ? 'PAUSED' : 'LIVE'}
            status={isStatusPaused ? ProposalStatus.DEFEATED : ProposalStatus.EXECUTED}
          />
        </div>

        <div className="card-hash-wrapper">
          <TzAddress tzAddress={address} hasIcon />
        </div>
      </ContractCardTopSection>
      <BGAccordion
        accordionId={title}
        isExpanded={isExpanded}
        methods={methods}
        accordionClickHandler={() => setExpanded(!isExpanded)}
      />
    </ContractCardWrapper>
  )
}
