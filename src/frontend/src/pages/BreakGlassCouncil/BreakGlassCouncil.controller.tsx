import React, { FC } from 'react'

// components
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { Button } from 'app/App.components/Button/Button.controller'
import { CouncilPastActionView } from 'pages/Council/CouncilPastAction/CouncilPastAction.view'
import Carousel from '../../app/App.components/Carousel/Carousel.view'
import { CouncilPendingView } from '../Council/CouncilPending/CouncilPending.view'

// helpers
import { ACTION_SECONDARY } from '../../app/App.components/Button/Button.constants'

// styles
import { Page, BreakGlassCouncilStyled, ReviewPastCouncilActionsCard } from './BreakGlassCouncil.style'

// TODO: change mock to valid data
const mockCards = [
  {
    execution_datetime: `${new Date()}`,
    id: 1,
    action_type: 'Sign Action',
    signers_count: 233,
    initiator_id: '3',
    num_council_members: 3423,
    councilPendingActionsLength: 3255,
    parameters: [],
  },
  {
    execution_datetime: `${new Date()}`,
    id: 2,
    action_type: 'Add Council Member',
    signers_count: 233,
    initiator_id: '3',
    num_council_members: 3423,
    councilPendingActionsLength: 3255,
    parameters: [],
  },
  {
    execution_datetime: `${new Date()}`,
    id: 3,
    action_type: 'Change Council Member',
    signers_count: 233,
    initiator_id: '3',
    num_council_members: 3423,
    councilPendingActionsLength: 3255,
    parameters: [],
  },
  {
    execution_datetime: `${new Date()}`,
    id: 4,
    action_type: 'Update Council Member',
    signers_count: 233,
    initiator_id: '3',
    num_council_members: 3423,
    councilPendingActionsLength: 3255,
    parameters: [],
  },
  {
    execution_datetime: `${new Date()}`,
    id: 5,
    action_type: 'Remove Council Member',
    signers_count: 233,
    initiator_id: 'rlejjtewjiorweiojtiowrjieojrtiow',
    num_council_members: 3423,
    councilPendingActionsLength: 3255,
    parameters: [],
  },
]
// TODO: change mock to valid data
const mockHistory = [
  {
    execution_datetime: `${new Date()}`,
    id: 1,
    action_type: 'Change Council Member',
    signers_count: 4,
    num_council_members: 2,
    council_id: '6',
  },
  {
    execution_datetime: `${new Date()}`,
    id: 3,
    action_type: 'Change Council Member',
    signers_count: 4,
    num_council_members: 2,
    council_id: '4',
  },
  {
    execution_datetime: `${new Date()}`,
    id: 2,
    action_type: 'Change Council Member',
    signers_count: 4,
    num_council_members: 2,
    council_id: '1',
  },
]

export const BreakGlassCouncil: FC = () => {
  return (
    <Page>
      <PageHeader page={'break glass council'} />
      <h1>Pending Signature</h1>

      <BreakGlassCouncilStyled>
        <div className='left-block'>
          <article className="pending">
            <div className="pending-items">
              <Carousel itemLength={mockCards.length} key={1} >
                {mockCards.map((item) => (
                  <CouncilPendingView
                    execution_datetime={item.execution_datetime}
                    key={item.id}
                    id={item.id}
                    action_type={item.action_type}
                    signers_count={item.signers_count}
                    initiator_id={item.initiator_id}
                    num_council_members={item.num_council_members}
                    councilPendingActionsLength={item.councilPendingActionsLength}
                    parameters={item.parameters || []}
                  />
                ))}
              </Carousel>
            </div>
          </article>

          <h1>My Past Council Actions</h1>

          {mockHistory.map((item) => (
            <CouncilPastActionView
              execution_datetime={item.execution_datetime}
              key={item.id}
              action_type={item.action_type}
              signers_count={item.signers_count}
              num_council_members={item.num_council_members}
              council_id={item.council_id}
            />
          ))}
        </div>

        <div className='right-block'>
          <ReviewPastCouncilActionsCard>
            <h2>Review Past Council Actions</h2>

            <Button
              text="Review"
              kind={ACTION_SECONDARY}
              onClick={() => {}}
            />
          </ReviewPastCouncilActionsCard>

          <h1>Break Glass Council</h1>
          
        </div>
      </BreakGlassCouncilStyled>
    </Page>
  )
}
