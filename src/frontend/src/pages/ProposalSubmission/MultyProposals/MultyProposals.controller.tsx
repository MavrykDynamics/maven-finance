import { ACTION_PRIMARY } from 'app/App.components/Button/Button.constants'
import { Button } from 'app/App.components/Button/Button.controller'
import { SlidingTabButtons, TabItem } from 'app/App.components/SlidingTabButtons/SlidingTabButtons.controller'
import { MultyProposalsStyled } from './MultyProposals.style'

type Props = {
  switchItems: TabItem[]
  switchProposal: (proposalId: number) => void
  createNewProposal: () => void
  isButtonDisabled: boolean
}

export const MultyProposals = ({ switchItems, switchProposal, createNewProposal, isButtonDisabled }: Props) => {
  return (
    <MultyProposalsStyled>
      {switchItems.length ? (
        <SlidingTabButtons onClick={switchProposal} tabItems={switchItems} className="multyProposalsSwitcher" />
      ) : (
        <div className="empty-proposals">You don't have submitted proposals, create 1 below please</div>
      )}

      <Button
        text="Create new proposal"
        onClick={createNewProposal}
        disabled={isButtonDisabled}
        kind={ACTION_PRIMARY}
      />
    </MultyProposalsStyled>
  )
}
