import { ACTION_SIMPLE } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'
import { MultyProposalsStyled } from './MultyProposals.style'

export type MultyProposalItem = { text: string; active: boolean; value: number }

type Props = {
  switchItems: MultyProposalItem[]
  switchProposal: (proposalId: number) => void
}

export const MultyProposals = ({ switchItems, switchProposal }: Props) => {
  return (
    <MultyProposalsStyled>
      {switchItems.map(({ text, active, value }) => (
        <Button
          text={text}
          onClick={() => switchProposal(value)}
          kind={ACTION_SIMPLE}
          className={active ? 'active' : ''}
        />
      ))}
    </MultyProposalsStyled>
  )
}
