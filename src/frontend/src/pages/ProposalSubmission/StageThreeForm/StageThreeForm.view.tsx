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
// prettier-ignore
import { ProposalFinancialRequestForm, ProposalFinancialRequestInputStatus } from '../../../utils/TypesAndInterfaces/Forms'
import { ProposalUpdateForm, ProposalUpdateFormInputStatus } from '../../../utils/TypesAndInterfaces/Forms'
// const
import { ProposalStatus } from '../../../utils/TypesAndInterfaces/Governance'
// styles
// prettier-ignore
import { FormButtonContainer, FormHeaderGroup, FormTitleAndFeeContainer, FormTitleContainer, FormTitleEntry } from '../ProposalSubmission.style'

type StageThreeFormViewProps = {
  tableData: TableListType
  setTableData: (arg0: TableListType) => void
  loading: boolean
  form: ProposalFinancialRequestForm
  setForm: (form: ProposalFinancialRequestForm) => void
  formInputStatus: ProposalFinancialRequestInputStatus
  handleOnBlur: (e: any, formField: string) => void
  handleSubmitFinancialRequestData: () => void
  setTableJson: (input: string) => void
}
export const StageThreeFormView = ({
  tableData,
  setTableData,
  loading,
  form,
  setForm,
  formInputStatus,
  handleOnBlur,
  setTableJson,
  handleSubmitFinancialRequestData,
}: StageThreeFormViewProps) => {
  return (
    <>
      <FormHeaderGroup>
        <h1>Stage 3</h1>
        {/* TODO Need condition */}
        <StatusFlag text="LOCKED" status={ProposalStatus.DEFEATED} />
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
          <label>2- Proposal Sucess Reward</label>
          <FormTitleEntry>{form.proposalId}</FormTitleEntry>
        </div>
      </FormTitleAndFeeContainer>
      <label>3- Enter Proposal Bytes Data</label>
      {/* <TableGrid tableData={tableData} setTableData={setTableData} /> */}
      <GridSheet loading={loading} setTableJson={setTableJson} />
      <FormButtonContainer>
        <Button
          icon="financial"
          className="financial"
          kind="actionPrimary"
          text={'Submit Financial Request'}
          loading={loading}
          onClick={handleSubmitFinancialRequestData}
        />
      </FormButtonContainer>
    </>
  )
}
