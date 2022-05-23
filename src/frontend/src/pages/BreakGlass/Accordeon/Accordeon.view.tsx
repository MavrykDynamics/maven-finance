import Icon from 'app/App.components/Icon/Icon.view';
import * as React from 'react';
import {
  AccordeonWrapper,
  AccordeonItem,
  AccordeonToggler,
  AccordeonContent,
} from './Accordeon.style';

type AccordeonViewProps = {
  accordeonId: string;
  isExpanded: boolean;
  accordeonData: Array<{ name: string; status: string }>;
  accordeonClickHandler: (accId: string) => void;
};

export const BGAccordeon = ({
  accordeonData,
  accordeonClickHandler,
  accordeonId,
  isExpanded,
}: AccordeonViewProps) => (
  <AccordeonWrapper>
    <AccordeonToggler onClick={() => accordeonClickHandler(accordeonId)}>
      Methods {<Icon className="accordeon-icon" id={isExpanded ? 'arrow-up' : 'arrow-down'} />}
    </AccordeonToggler>
    <AccordeonContent className={isExpanded ? 'expaned' : ''}>
      {accordeonData.map(({ name, status }) => (
        <AccordeonItem key={name} status={status === 'LIVE'}>
          {name}
        </AccordeonItem>
      ))}
    </AccordeonContent>
  </AccordeonWrapper>
);
