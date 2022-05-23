import React, { useState } from 'react';

import { ContractCardWrapper, ContractCardTopSection } from './ContractCard.style';
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller';
import { ContractBreakGlass } from '../mockContracts';
import { ProposalStatus } from '../../../utils/TypesAndInterfaces/Governance';
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view';
import { BGAccordeon } from '../Accordeon/Accordeon.view';

type ContractCardProps = {
  contract: ContractBreakGlass;
};
export const ContractCard = ({ contract }: ContractCardProps) => {
  const { entrypoints } = contract;
  const [isExpanded, setExpanded] = useState(false);

  return (
    <ContractCardWrapper key={contract.address}>
      <ContractCardTopSection>
        <div className="card-title">
          <div className="truncate-title">{contract.name}</div>
        </div>

        <div className="card-flag-wrapper">
          <StatusFlag
            text={contract.status}
            status={contract.status === 'LIVE' ? ProposalStatus.EXECUTED : ProposalStatus.DEFEATED}
          />
        </div>

        <div className="card-hash-wrapper">
          <TzAddress tzAddress={contract.address} hasIcon={false} />
        </div>
      </ContractCardTopSection>
      <BGAccordeon
        accordeonId={contract.name}
        isExpanded={isExpanded}
        accordeonData={entrypoints}
        accordeonClickHandler={() => setExpanded(!isExpanded)}
      />
    </ContractCardWrapper>
  );
};
