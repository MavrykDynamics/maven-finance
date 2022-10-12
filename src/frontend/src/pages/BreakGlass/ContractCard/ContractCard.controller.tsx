import { ContractCardTopSection, ContractCardWrapper } from './ContractCard.style'
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { ProposalStatus } from '../../../utils/TypesAndInterfaces/Governance'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { BGAccordion } from '../Accordeon/Accordeon.view'
import { parseDate } from 'utils/time'

type ContractCardProps = {
  contract: Record<string, unknown>
  isActive?: boolean
  isExpanded: boolean
  onClick?: () => void
  handleExpandAccordeon: (id: string | null) => void
}
export const ContractCard = ({ contract, isActive, onClick, isExpanded, handleExpandAccordeon }: ContractCardProps) => {
  const title = (contract.title as string).replace(/([a-z0-9])([A-Z])/g, '$1 $2')
  const address = contract.address as string
  const lastUpdated = (contract.lastUpdated || '') as string
  const admin = contract.admin as string
  const methods = contract.methods as Record<string, boolean>
  const isStatusPaused = methods ? Object.keys(methods).some((method) => methods[method]) : false

  return (
    <ContractCardWrapper className={isActive ? 'active' : ''} onClick={onClick}>
      <ContractCardTopSection>
        <div className="top-row">
          <div className="card-title">{title}</div>

          <StatusFlag
            text={isStatusPaused ? 'PAUSED' : 'LIVE'}
            status={isStatusPaused ? ProposalStatus.DEFEATED : ProposalStatus.EXECUTED}
          />
        </div>

        <div className="card-info-item">
          Last Update
          <div>{parseDate({ time: lastUpdated, timeFormat: 'MMM DD, YYYY' })}</div>
        </div>

        <div className="card-info-item">
          Contract Address
          <TzAddress tzAddress={address} hasIcon />
        </div>

        <div className="card-info-item">
          Contract Admin
          <TzAddress tzAddress={admin} hasIcon />
        </div>
      </ContractCardTopSection>
      <BGAccordion
        accordionId={title}
        isExpanded={isExpanded}
        methods={methods}
        accordionClickHandler={() => {
          if (isExpanded) {
            handleExpandAccordeon(null)
          } else {
            handleExpandAccordeon(address)
          }
        }}
      />
    </ContractCardWrapper>
  )
}
