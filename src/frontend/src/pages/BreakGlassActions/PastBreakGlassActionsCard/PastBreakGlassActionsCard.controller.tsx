import React, { FC, useState, useEffect, useRef } from 'react'
/* @ts-ignore */
import Time from 'react-pure-time'

// components
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { ProposalStatus } from '../../../utils/TypesAndInterfaces/Governance'

// styles
import {
   Card,
   TopSection,
   TitleTextGroup,
   ArrowButton,
   DropDown,
} from "./PastBreakGlassActionsCard.style";

type Props = {
  date: Date;
  action: string;
  target: string;
  button: boolean;
}

export const PastBreakGlassActionsCard: FC<Props> = ({ date, action, target, button }) => {
  const [expanded, setExpanded] = useState(false)
  const [accordionHeight, setAccordionHeight] = useState(0)
  const ref = useRef(null)

  const open = () => setExpanded(!expanded)
  const status = (status: boolean) => status ? ProposalStatus.EXECUTED : ProposalStatus.DROPPED

  useEffect(() => {
    // @ts-ignore
    const getHeight = ref.current.scrollHeight
    setAccordionHeight(getHeight)
  }, [expanded])

  return (
    <Card onClick={open}>
      <TopSection className={expanded ? 'show' : 'hide'} height={accordionHeight} ref={ref}>
        <TitleTextGroup>
          <h3>Date</h3>
          <p className="group-data">
            <Time value={date} format="M d\t\h, Y" />
          </p>
        </TitleTextGroup>

        <TitleTextGroup>
          <h3>Action</h3>
          <p className="group-data">{action}</p>
        </TitleTextGroup>
        
        <TitleTextGroup>
          <h3>Target</h3>
          <div className="group-data">
            <TzAddress tzAddress={target} hasIcon={false} />
          </div>
        </TitleTextGroup>

        <TitleTextGroup>
          <h3>Initiator</h3>
          <div className="group-data">
            <TzAddress tzAddress={target} hasIcon={false} />
          </div>
        </TitleTextGroup>

        <ArrowButton>
          {expanded ? (
            <svg>
              <use xlinkHref={`/icons/sprites.svg#arrow-up`} />
            </svg>
          ) : (
            <svg>
              <use xlinkHref={`/icons/sprites.svg#arrow-down`} />
            </svg>
          )}
        </ArrowButton>
        
        <TitleTextGroup className={'statusFlag'}>
          <StatusFlag status={status(button)} text={status(button)} />
        </TitleTextGroup>
      </TopSection>

      <DropDown onClick={open} className={expanded ? 'show' : 'hide'} height={accordionHeight} ref={ref}>
        <div className={'accordion ' + `${expanded}`} ref={ref}>
          will soon be...
        </div>
      </DropDown>
    </Card>
  )
}