import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

// types
import type { TableListType } from '../../../app/App.components/TableGrid/TableGrid.types'

import { Button } from '../../../app/App.components/Button/Button.controller'
import { GridSheet } from '../../../app/App.components/GridSheet/GridSheet.controller'
// components
import Icon from '../../../app/App.components/Icon/Icon.view'
import { Input } from '../../../app/App.components/Input/Input.controller'
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import TableGrid from '../../../app/App.components/TableGrid/TableGrid.view'
import { TextArea } from '../../../app/App.components/TextArea/TextArea.controller'
import { lockProposal, updateProposal } from '../ProposalSubmission.actions'
import {
  ProposalFinancialRequestForm,
  ProposalFinancialRequestInputStatus,
} from '../../../utils/TypesAndInterfaces/Forms'
import { ProposalUpdateForm, ProposalUpdateFormInputStatus } from '../../../utils/TypesAndInterfaces/Forms'
// const
import { ProposalStatus } from '../../../utils/TypesAndInterfaces/Governance'
// styles
import {
  FormButtonContainer,
  FormHeaderGroup,
  FormTitleAndFeeContainer,
  FormTitleContainer,
  FormTitleEntry,
  FormTableGrid,
  SubmissionStyled,
} from '../ProposalSubmission.style'

type StageThreeFormViewProps = {
  tableData: TableListType
  setTableData: (arg0: TableListType) => void
  locked: boolean
  form: ProposalFinancialRequestForm
  setForm: (form: ProposalFinancialRequestForm) => void
  formInputStatus: ProposalFinancialRequestInputStatus
  handleOnBlur: (e: any, formField: string) => void
  handleSubmitFinancialRequestData: () => void
  setTableJson: (input: string) => void
  fee: number
  successReward: number
  proposalId: number | undefined
}
export const StageThreeFormView = ({
  tableData,
  setTableData,
  locked,
  form,
  setForm,
  formInputStatus,
  handleOnBlur,
  setTableJson,
  handleSubmitFinancialRequestData,
  fee,
  successReward,
  proposalId,
}: StageThreeFormViewProps) => {
  const { governancePhase } = useSelector((state: State) => state.governance)
  const isProposalRound = governancePhase === 'PROPOSAL'
  const disabled = !isProposalRound || !form.title
  const dispatch = useDispatch()
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)

  const handleLockProposal = () => {
    if (proposalId) dispatch(lockProposal(proposalId, accountPkh as any))
  }

  const enebleSubmit = tableData[1].every((item) => Boolean(item))

  return (
    <SubmissionStyled>
      <FormHeaderGroup>
        <h1>
          Stage 3 {!isProposalRound ? <span className="label">Only accessible during proposal round</span> : null}
        </h1>
        <StatusFlag
          text={locked ? 'LOCKED' : 'UNLOCKED'}
          status={locked ? ProposalStatus.DEFEATED : ProposalStatus.EXECUTED}
        />
        <a className="info-link" href="https://mavryk.finance/litepaper#governance" target="_blank" rel="noreferrer">
          <Icon id="question" />
        </a>
      </FormHeaderGroup>
      <FormTitleAndFeeContainer>
        <FormTitleContainer>
          <label>1- Enter Proposal Title</label>
          <FormTitleEntry>{form.title}</FormTitleEntry>
        </FormTitleContainer>
        <div>
          <label>2- Proposal Success Reward</label>
          <FormTitleEntry>{successReward} MVK</FormTitleEntry>
        </div>
        <div>
          <label>3- Fee</label>
          <FormTitleEntry>{fee}XTZ</FormTitleEntry>
        </div>
      </FormTitleAndFeeContainer>
      <label>3- Enter Proposal Data</label>
      <FormTableGrid className={disabled ? 'disabled' : ''}>
        <TableGrid tableData={tableData} setTableData={setTableData} />
      </FormTableGrid>
      {/* <GridSheet loading={loading} setTableJson={setTableJson} /> */}
      <FormButtonContainer>
        {!locked ? (
          <Button
            icon="lock"
            className="lock"
            text={'Lock Proposal'}
            disabled={!proposalId || disabled}
            onClick={handleLockProposal}
            kind="actionSecondary"
          />
        ) : null}

        <Button
          icon="financial"
          disabled={!enebleSubmit || disabled}
          className="financial"
          kind="actionPrimary"
          text={'Submit Financial Request'}
          onClick={handleSubmitFinancialRequestData}
        />
      </FormButtonContainer>
    </SubmissionStyled>
  )
}
