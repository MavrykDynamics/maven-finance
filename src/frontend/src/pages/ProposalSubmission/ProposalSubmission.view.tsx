import { useMemo } from 'react'
import { Page } from 'styles'
import { useSelector } from 'react-redux'

// types
import { State } from 'reducers'

// hooks
import useGovernence from '../Governance/UseGovernance'

// view
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { PropSubmissionTopBar } from './PropSubmissionTopBar/PropSubmissionTopBar.controller'
import { StageOneForm } from './StageOneForm/StageOneForm.controller'
import { StageThreeForm } from './StageThreeForm/StageThreeForm.controller'
import { StageTwoForm } from './StageTwoForm/StageTwoForm.controller'
import { Info } from '../../app/App.components/Info/Info.view'
import { MultyProposalItem, MultyProposals } from './MultyProposals/MultyProposals.controller'
import { SubmittedProposalsMapper, ChangeProposalFnType } from './ProposalSubmission.controller'

import { ProposalSubmissionForm } from './ProposalSubmission.style'

import '@silevis/reactgrid/styles.css'

type ProposalSubmissionViewProps = {
  activeTab: number
  handleChangeTab: (tabId?: number) => void
  multyProposalsItems: MultyProposalItem[]
  changeActiveProposal: (proposalId: number) => void
  currentProposalId: number
  userSubmittedProposalsData: SubmittedProposalsMapper['mapper']
  updateLocalProposalData: ChangeProposalFnType
}

export const ProposalSubmissionView = ({
  activeTab,
  handleChangeTab,
  currentProposalId,
  multyProposalsItems,
  changeActiveProposal,
  userSubmittedProposalsData,
  updateLocalProposalData,
}: ProposalSubmissionViewProps) => {
  const { watingProposals } = useGovernence()
  const { governancePhase } = useSelector((state: State) => state.governance)
  const isEditing = governancePhase === 'PROPOSAL' && !watingProposals.length

  const currentProposal = useMemo(
    () => userSubmittedProposalsData[currentProposalId],
    [userSubmittedProposalsData, currentProposalId],
  )

  console.log('currentProposal 1', currentProposal)

  const { locked = false, title = '', proposalData = [], proposalPayments = [] } = currentProposal

  return (
    <Page>
      <PageHeader page={'proposal submission'} />
      <MultyProposals switchItems={multyProposalsItems} switchProposal={changeActiveProposal} />
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
            proposalId={currentProposalId}
            updateLocalProposalData={updateLocalProposalData}
            currentProposal={currentProposal}
          />
        )}
        {activeTab === 2 && (
          <StageTwoForm
            locked={locked}
            proposalId={currentProposalId}
            proposalTitle={title}
            proposalData={proposalData}
            updateLocalProposalData={updateLocalProposalData}
          />
        )}
        {activeTab === 3 && (
          <StageThreeForm
            locked={locked}
            proposalId={currentProposalId}
            proposalTitle={title}
            proposalPayments={proposalPayments}
          />
        )}
      </ProposalSubmissionForm>
    </Page>
  )
}
