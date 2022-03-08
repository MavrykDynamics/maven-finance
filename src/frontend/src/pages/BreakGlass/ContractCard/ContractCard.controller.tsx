import { useState, useEffect, useRef } from 'react'
import {
  CardTopSection,
  ContractCardStyled,
  DropDownContainer,
  EntrypointNameWithStatus,
  TitleStatusContainer,
} from './ContractCard.style'
import { BGTextTitle } from '../BreakGlass.style'
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import * as React from 'react'
import { ContractBreakGlass } from '../mockContracts'
import { ProposalStatus } from '../../../utils/TypesAndInterfaces/Governance'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'

type ContractCardProps = {
  contract: ContractBreakGlass
}
export const ContractCard = ({ contract }: ContractCardProps) => {
  const { entrypoints } = contract
  const [expanded, setExpanded] = useState(false)
  const [accordionHeight, setAccordionHeight] = useState(0)
  const ref = useRef(null)
  const conStatus = contract.status === 'LIVE' ? ProposalStatus.EXECUTED : ProposalStatus.DEFEATED

  const open = () => setExpanded(!expanded)

  useEffect(() => {
    // @ts-ignore
    const getHeight = ref.current.scrollHeight
    setAccordionHeight(getHeight)
  }, [expanded])

  return (
    <ContractCardStyled key={contract.address} className={`contractCard accordion${expanded ? 'Show' : 'Hide'}`}>
      <CardTopSection>
        <TitleStatusContainer>
          <BGTextTitle>{contract.name}</BGTextTitle>
          <StatusFlag text={contract.status} status={conStatus} />
        </TitleStatusContainer>
        <TzAddress tzAddress={contract.address} hasIcon={false} />
      </CardTopSection>
      <DropDownContainer onClick={open} className={expanded ? 'show' : 'hide'} height={accordionHeight} ref={ref}>
        <span>
          Entrypoints{' '}
          {expanded ? (
            <svg>
              <use xlinkHref={`/icons/sprites.svg#arrow-up`} />
            </svg>
          ) : (
            <svg>
              <use xlinkHref={`/icons/sprites.svg#arrow-down`} />
            </svg>
          )}
        </span>
        <div className={'accordion ' + `${expanded}`} ref={ref}>
          {entrypoints.map((item, index) => {
            const entryStatus = item.status === 'LIVE'
            return (
              <EntrypointNameWithStatus key={item.name} status={entryStatus}>
                %{item.name}
              </EntrypointNameWithStatus>
            )
          })}
        </div>
      </DropDownContainer>
    </ContractCardStyled>
  )
}
