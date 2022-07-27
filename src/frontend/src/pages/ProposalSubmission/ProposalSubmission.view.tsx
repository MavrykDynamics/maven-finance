import * as React from 'react'
import { Page } from 'styles'

// types
import type { ProposalDataType, ProposalPaymentType } from '../../utils/TypesAndInterfaces/Governance'

import { PRIMARY } from '../../app/App.components/PageHeader/PageHeader.constants'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { GovernancePhase } from '../../reducers/governance'
import { ProposalSubmissionForm } from './ProposalSubmission.style'
import { PropSubmissionTopBar } from './PropSubmissionTopBar/PropSubmissionTopBar.controller'
import { StageOneForm } from './StageOneForm/StageOneForm.controller'
import { StageThreeForm } from './StageThreeForm/StageThreeForm.controller'
import { StageTwoForm } from './StageTwoForm/StageTwoForm.controller'

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
}
export const ProposalSubmissionView = ({
  locked,
  activeTab,
  handleChangeTab,
  proposalId,
  proposalTitle,
  proposalData,
}: ProposalSubmissionViewProps) => {
  return (
    <Page>
      <PageHeader page={'proposal submission'} kind={PRIMARY} />
      <PropSubmissionTopBar value={activeTab} valueCallback={handleChangeTab} />
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
        {activeTab === 3 && <StageThreeForm locked={locked} proposalId={proposalId} proposalTitle={proposalTitle} />}
      </ProposalSubmissionForm>
    </Page>
  )
}
