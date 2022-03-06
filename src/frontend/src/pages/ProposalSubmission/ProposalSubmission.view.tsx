import * as React from 'react'
import { Page } from 'styles'
import { PRIMARY } from '../../app/App.components/PageHeader/PageHeader.constants'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import '@silevis/reactgrid/styles.css'
// prettier-ignore
import {
  ProposalSubmissionForm,
} from './ProposalSubmission.style'

import { PropSubmissionTopBar } from './PropSubmissionTopBar/PropSubmissionTopBar.controller'
import { GovernancePhase } from '../../reducers/governance'
import { StageOneForm } from './StageOneForm/StageOneForm.controller'
import { StageTwoForm } from './StageTwoForm/StageTwoForm.controller'
import { StageThreeForm } from './StageThreeForm/StageThreeForm.controller'

type ProposalSubmissionViewProps = {
  loading: boolean
  accountPkh?: string
  governancePhase: GovernancePhase
  isInEmergencyGovernance: boolean
  activeTab: number
  handleChangeTab: (tabId: number) => void
}
export const ProposalSubmissionView = ({ loading, activeTab, handleChangeTab }: ProposalSubmissionViewProps) => {
  return (
    <Page>
      <PageHeader page={'governance'} kind={PRIMARY} loading={loading} />
      <PropSubmissionTopBar value={activeTab} valueCallback={handleChangeTab} />
      <ProposalSubmissionForm>
        {activeTab === 1 && <StageOneForm loading={loading} />}
        {activeTab === 2 && <StageTwoForm loading={loading} />}
        {activeTab === 3 && <StageThreeForm loading={loading} />}
      </ProposalSubmissionForm>
    </Page>
  )
}
