import {
  FormSubTitle,
  FormTitleContainer,
  FormTitleAndFeeContainer,
  FormTitleEntry,
  FormButtonContainer,
} from '../ProposalSubmission.style'
import { Input } from '../../../app/App.components/Input/Input.controller'
import { Button } from '../../../app/App.components/Button/Button.controller'
import { ProposalUpdateFormInputStatus, ProposalUpdateForm } from '../../../utils/TypesAndInterfaces/Forms'

type StageTwoFormViewProps = {
  loading: boolean
  form: ProposalUpdateForm
  setForm: (form: ProposalUpdateForm) => void
  formInputStatus: ProposalUpdateFormInputStatus
  handleOnBlur: () => void
  handleUpdateProposal: () => void
  handleLockProposal: () => void
}
export const StageTwoFormView = ({
  loading,
  form,
  setForm,
  formInputStatus,
  handleOnBlur,
  handleUpdateProposal,
  handleLockProposal,
}: StageTwoFormViewProps) => {
  return (
    <>
      <h1>Stage 2</h1>
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
      <FormSubTitle>3- Enter Proposal Bytes data</FormSubTitle>
      <Input
        type="text"
        placeholder="Proposal Bytes Data"
        value={form.proposalBytes}
        onChange={(e: any) => setForm({ ...form, proposalBytes: e.target.value })}
        onBlur={handleOnBlur}
        inputStatus={formInputStatus.proposalBytes}
      />
      <FormButtonContainer>
        <Button icon="hammer" text={'Update Proposal Data'} loading={loading} onClick={handleUpdateProposal} />
        <Button icon="hammer" text={'Lock Proposal'} loading={loading} kind="secondary" onClick={handleLockProposal} />
      </FormButtonContainer>
    </>
  )
}
