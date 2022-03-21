import {
  ProposalFinancialRequestForm,
  ProposalFinancialRequestInputStatus,
} from '../../../utils/TypesAndInterfaces/Forms'
import {
  FormSubTitle,
  FormTitleContainer,
  FormTitleAndFeeContainer,
  FormButtonContainer,
  FormTitleEntry,
} from '../ProposalSubmission.style'
import { Button } from '../../../app/App.components/Button/Button.controller'
import { GridSheet } from '../../../app/App.components/GridSheet/GridSheet.controller'

type StageThreeFormViewProps = {
  loading: boolean
  form: ProposalFinancialRequestForm
  setForm: (form: ProposalFinancialRequestForm) => void
  formInputStatus: ProposalFinancialRequestInputStatus
  handleOnBlur: (e: any, formField: string) => void
  handleSubmitFinancialRequestData: () => void
  setTableJson: (input: string) => void
}
export const StageThreeFormView = ({
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
      <h1>Stage 3</h1>
      <FormTitleAndFeeContainer>
        <FormTitleContainer>
          <FormSubTitle>1- Proposal Title</FormSubTitle>
          <FormTitleEntry>{form.title}</FormTitleEntry>
        </FormTitleContainer>
        <div>
          <FormSubTitle>2- Proposal ID</FormSubTitle>
          <FormTitleEntry>{form.proposalId}</FormTitleEntry>
        </div>
      </FormTitleAndFeeContainer>
      <FormSubTitle>3- Enter Financial Request Data</FormSubTitle>
      <GridSheet loading={loading} setTableJson={setTableJson} />
      <FormButtonContainer>
        <Button
          icon="hammer"
          text={'Submit Financial Request Data'}
          loading={loading}
          onClick={handleSubmitFinancialRequestData}
        />
      </FormButtonContainer>
    </>
  )
}
