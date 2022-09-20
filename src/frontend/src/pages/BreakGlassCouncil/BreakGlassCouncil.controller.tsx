import React, { FC } from 'react'

// components
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { Button } from 'app/App.components/Button/Button.controller'
import { PendingSignatureCard } from './PendingSignatureCard/PendingSignatureCard.controller'

// helpers
import { ACTION_SECONDARY } from '../../app/App.components/Button/Button.constants'

// styles
import { Page, BreakGlassCouncilStyled, ReviewPastCouncilActionsCard } from './BreakGlassCouncil.style'

// TODO: change mock to valid data
const mock = [
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

export const BreakGlassCouncil: FC = () => {
  return (
    <Page>
      <PageHeader page={'break glass council'} />
      <h1>Pending Signature</h1>

      <BreakGlassCouncilStyled>
        <div className='left-block'>
          <div className='pending-signature'>
            {mock.map((item) => (
              <PendingSignatureCard key={item.id} {...item} />
            ))}
          </div>
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
