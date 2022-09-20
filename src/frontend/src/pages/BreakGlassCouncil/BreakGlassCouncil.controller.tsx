import React, { FC } from 'react'

// components
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { Button } from 'app/App.components/Button/Button.controller'
import { PendingSignatureCard } from './PendingSignatureCard/PendingSignatureCard.controller'
import { CouncilPastActionView } from 'pages/Council/CouncilPastAction/CouncilPastAction.view'

// helpers
import { ACTION_SECONDARY } from '../../app/App.components/Button/Button.constants'

// styles
import { Page, BreakGlassCouncilStyled, ReviewPastCouncilActionsCard } from './BreakGlassCouncil.style'

// TODO: change mock to valid data
const mockCards = [
  {
    id: 1,
    title: 'Sign Action',
    addressName: 'Vestee address',
    address: 'tz1Vdsjfdjksjfoda;apgjsdiojcjb',
    signed: '3/8',
    onClick: () => {},
  },
  {
    id: 2,
    title: 'Add Council Member',
    addressName: 'Vestee address',
    address: 'tz1Vdsjfdjksjfoda;apgjsdiojcjb',
    signed: '3/8',
    onClick: () => {},
  },
  {
    id: 3,
    title: 'Change Council Member',
    addressName: 'Vestee address',
    address: 'tz1Vdsjfdjksjfoda;apgjsdiojcjb',
    signed: '3/8',
    onClick: () => {},
  },
  // {
  //   id: 4,
  //   title: 'Update Council Member',
  //   addressName: 'Vestee address',
  //   address: 'tz1Vdsjfdjksjfoda;apgjsdiojcjb',
  //   signed: '3/8',
  //   onClick: () => {},
  // },
  // {
  //   id: 5,
  //   title: 'Remove Council Member',
  //   addressName: 'Vestee address',
  //   address: 'tz1Vdsjfdjksjfoda;apgjsdiojcjb',
  //   signed: '3/8',
  //   onClick: () => {},
  // },
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
          <div className='pending-signature'>
            {mockCards.map((item) => (
              <PendingSignatureCard key={item.id} {...item} />
            ))}
          </div>

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
