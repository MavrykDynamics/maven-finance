import { Page } from 'styles'
import { useSelector } from 'react-redux'
import { State } from 'reducers'

// types
import type { CurrentRoundProposalsStorageType } from '../../utils/TypesAndInterfaces/Governance'
import type { TabItem } from 'app/App.components/SlidingTabButtons/SlidingTabButtons.controller'

// hooks
import useGovernence from '../Governance/UseGovernance'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { ProposalSubmissionForm } from './ProposalSubmission.style'
import { PropSubmissionTopBar } from './PropSubmissionTopBar/PropSubmissionTopBar.controller'
import { StageOneForm } from './StageOneForm/StageOneForm.controller'
import { StageThreeForm } from './StageThreeForm/StageThreeForm.controller'
import { StageTwoForm } from './StageTwoForm/StageTwoForm.controller'
import { Info } from '../../app/App.components/Info/Info.view'
import { MultyProposals } from './MultyProposals/MultyProposals.controller'

import '@silevis/reactgrid/styles.css'

type ProposalSubmissionViewProps = {
  activeTab: number
  handleChangeTab: (tabId?: number) => void
  multyProposalsItems: TabItem[]
  createNewProposalHander: () => void
  changeActiveProposal: (proposalId: number) => void
  userCreatedProposals: CurrentRoundProposalsStorageType
  currentProposal?: CurrentRoundProposalsStorageType[number]
}

export const ProposalSubmissionView = ({
  activeTab,
  handleChangeTab,
  currentProposal,
  multyProposalsItems,
  createNewProposalHander,
  changeActiveProposal,
  userCreatedProposals,
}: ProposalSubmissionViewProps) => {
  const { watingProposals } = useGovernence()
  const { governancePhase } = useSelector((state: State) => state.governance)
  const isEditing = governancePhase === 'PROPOSAL' && !watingProposals.length

  const {
    locked = false,
    id: proposalId,
    title: proposalTitle = '',
    proposalData = [],
    description: proposalDescription = '',
    sourceCode: proposalSourceCode = '',
    proposalPayments = [],
  } = currentProposal || {}

  return (
    <Page>
      <PageHeader page={'proposal submission'} />
      <MultyProposals
        switchItems={multyProposalsItems}
        switchProposal={changeActiveProposal}
        createNewProposal={createNewProposalHander}
        isButtonDisabled={userCreatedProposals.length >= 2 || !currentProposal}
      />
      <PropSubmissionTopBar value={activeTab} valueCallback={handleChangeTab} />
      {!isEditing ? (
        <Info
          className="no-edit-info"
          text="Editing of information will be available only after submission of your proposal.........."
          type="error"
        />
      ) : null}

      <ProposalSubmissionForm>
        {activeTab === 1 && (
          <StageOneForm
            locked={locked}
            proposalId={proposalId}
            proposalTitle={proposalTitle}
            proposalDescription={proposalDescription}
            proposalSourceCode={proposalSourceCode}
          />
        )}
        {activeTab === 2 && (
          <StageTwoForm
            locked={locked}
            proposalId={proposalId}
            proposalTitle={proposalTitle}
            proposalData={proposalData}
          />
        )}
        {activeTab === 3 && (
          <StageThreeForm
            locked={locked}
            proposalId={proposalId}
            proposalTitle={proposalTitle}
            proposalPayments={proposalPayments}
          />
        )}
      </ProposalSubmissionForm>
    </Page>
  )
}
