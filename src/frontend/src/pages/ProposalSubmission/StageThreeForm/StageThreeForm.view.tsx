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
}: StageThreeFormViewProps) => {
  return (
    <SubmissionStyled>
      <FormHeaderGroup>
        <h1>Stage 3</h1>
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
      <label>3- Enter Proposal Bytes Data</label>
      <FormTableGrid>
        <TableGrid tableData={tableData} setTableData={setTableData} />
      </FormTableGrid>
      {/* <GridSheet loading={loading} setTableJson={setTableJson} /> */}
      <FormButtonContainer>
        <Button
          icon="lock"
          className="lock"
          text={'Lock Proposal'}
          //onClick={handleLockProposal}
          onClick={() => null}
          kind="actionSecondary"
        />
        <Button
          icon="financial"
          className="financial"
          kind="actionPrimary"
          text={'Submit Financial Request'}
          onClick={handleSubmitFinancialRequestData}
        />
      </FormButtonContainer>
    </SubmissionStyled>
  )
}
