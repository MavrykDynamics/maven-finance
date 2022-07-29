import * as React from 'react'
import { Page } from 'styles'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// types
import type { ProposalDataType, ProposalPaymentType } from '../../utils/TypesAndInterfaces/Governance'

// hooks
import useGovernence from '../Governance/UseGovernance'

// view
import { PRIMARY } from '../../app/App.components/PageHeader/PageHeader.constants'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { GovernancePhase } from '../../reducers/governance'
import { ProposalSubmissionForm } from './ProposalSubmission.style'
import { PropSubmissionTopBar } from './PropSubmissionTopBar/PropSubmissionTopBar.controller'
import { StageOneForm } from './StageOneForm/StageOneForm.controller'
import { StageThreeForm } from './StageThreeForm/StageThreeForm.controller'
import { StageTwoForm } from './StageTwoForm/StageTwoForm.controller'
import { Info } from '../../app/App.components/Info/Info.view'

import '@silevis/reactgrid/styles.css'

type ProposalSubmissionViewProps = {
  loading: boolean
  accountPkh?: string
  governancePhase: GovernancePhase
  isInEmergencyGovernance: boolean
  activeTab: number
  handleChangeTab: (tabId: number) => void
  locked: boolean
  proposalId: number | undefined
  proposalTitle: string
  proposalData: ProposalDataType[] | undefined
  proposalPayments: ProposalPaymentType[] | undefined
}
export const ProposalSubmissionView = ({
  locked,
  activeTab,
  handleChangeTab,
  proposalId,
  proposalTitle,
  proposalData,
  proposalPayments,
}: ProposalSubmissionViewProps) => {
  const { watingProposals } = useGovernence()
  const { governancePhase } = useSelector((state: State) => state.governance)
  const isEditing = governancePhase === 'PROPOSAL' && !watingProposals.length
  return (
    <Page>
      <PageHeader page={'proposal submission'} kind={PRIMARY} />
      <PropSubmissionTopBar value={activeTab} valueCallback={handleChangeTab} />
      {!isEditing ? (
        <Info
          className="no-edit-info"
          text="Editing of information will be available only after submission of your proposal.........."
          type="error"
        />
      ) : null}

      <ProposalSubmissionForm>
        {activeTab === 1 && <StageOneForm locked={locked} proposalId={proposalId} />}
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
