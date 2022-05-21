import { Button } from '../../../app/App.components/Button/Button.controller'
// components
import Icon from '../../../app/App.components/Icon/Icon.view'
import { Input } from '../../../app/App.components/Input/Input.controller'
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { TextArea } from '../../../app/App.components/TextArea/TextArea.controller'
import { ProposalUpdateForm, ProposalUpdateFormInputStatus } from '../../../utils/TypesAndInterfaces/Forms'
// const
import { ProposalStatus } from '../../../utils/TypesAndInterfaces/Governance'
// styles
// prettier-ignore
import { FormButtonContainer, FormHeaderGroup, FormTitleAndFeeContainer, FormTitleContainer, FormTitleEntry } from '../ProposalSubmission.style'

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
      <FormHeaderGroup>
        <h1>Stage 2</h1>
        {/* TODO Need condition */}
        <StatusFlag text="UNLOCKED" status={ProposalStatus.EXECUTED} />
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
          <label>2 - Proposal Sucess Reward</label>
          <FormTitleEntry>{form.proposalId} MVK</FormTitleEntry>
        </div>
      </FormTitleAndFeeContainer>
      <label>3- Enter Proposal Bytes data</label>
      <TextArea
        type="text"
        className="step-2-textarea"
        value={form.proposalBytes}
        onChange={(e: any) => setForm({ ...form, proposalBytes: e.target.value })}
        onBlur={handleOnBlur}
        inputStatus={formInputStatus.proposalBytes}
      />
      <FormButtonContainer>
        <Button
          icon="lock"
          className="lock"
          text={'Lock Proposal'}
          loading={loading}
          onClick={handleLockProposal}
          kind="actionSecondary"
        />
        <Button
          icon="bytes"
          className="bytes"
          text="Submit Bytes"
          kind="actionPrimary"
          loading={loading}
          onClick={handleUpdateProposal}
        />
      </FormButtonContainer>
    </>
  )
}
