import { Button } from '../../../app/App.components/Button/Button.controller'
// components
import Icon from '../../../app/App.components/Icon/Icon.view'
import { Input } from '../../../app/App.components/Input/Input.controller'
import { IPFSUploader } from '../../../app/App.components/IPFSUploader/IPFSUploader.controller'
import { StatusFlag } from '../../../app/App.components/StatusFlag/StatusFlag.controller'
import { TextArea } from '../../../app/App.components/TextArea/TextArea.controller'
import { SubmitProposalForm, SubmitProposalFormInputStatus } from '../../../utils/TypesAndInterfaces/Forms'
// const
import { ProposalStatus } from '../../../utils/TypesAndInterfaces/Governance'
// styles
import {
  FormButtonContainer,
  FormHeaderGroup,
  FormTitleAndFeeContainer,
  FormTitleContainer,
} from '../ProposalSubmission.style'

type StageOneFormViewProps = {
  loading: boolean
  form: SubmitProposalForm
  setForm: (form: SubmitProposalForm) => void
  formInputStatus: SubmitProposalFormInputStatus
  handleOnBlur: (e: any, formField: string) => void
  handleSubmitProposal: () => void
}
export const StageOneFormView = ({
  loading,
  form,
  setForm,
  formInputStatus,
  handleOnBlur,
  handleSubmitProposal,
}: StageOneFormViewProps) => {
  return (
    <>
      <FormHeaderGroup>
        <h1>Stage 1</h1>
        {/* TODO Need condition */}
        <StatusFlag text="UNLOCKED" status={ProposalStatus.EXECUTED} />
        <a className="info-link" href="https://mavryk.finance/litepaper#governance" target="_blank" rel="noreferrer">
          <Icon id="question" />
        </a>
      </FormHeaderGroup>
      <FormTitleAndFeeContainer>
        <FormTitleContainer>
          <label>1- Enter Proposal Title</label>
          <Input
            type="text"
            value={form.title}
            onChange={(e: any) => setForm({ ...form, title: e.target.value })}
            onBlur={(e: any) => handleOnBlur(e, 'TITLE')}
            inputStatus={formInputStatus.title}
          />
        </FormTitleContainer>
        <div>
          <label>2- Proposal Sucess Reward</label>
          <Input
            type="number"
            value={form.successMVKReward}
            onChange={(e: any) => setForm({ ...form, successMVKReward: Number(e.target.value) })}
            onBlur={(e: any) => handleOnBlur(e, 'SUCCESS_MVK_REWARD')}
            inputStatus={formInputStatus.successMVKReward}
          />
        </div>
      </FormTitleAndFeeContainer>
      <label>3- Enter a description</label>
      <TextArea
        type="text"
        className="description-textarea"
        value={form.description}
        onChange={(e: any) => setForm({ ...form, description: e.target.value })}
        onBlur={(e: any) => handleOnBlur(e, 'DESCRIPTION')}
        inputStatus={formInputStatus.description}
      />
      <label>4- Please add a link to the source code changes (if you have)</label>
      <Input
        type="text"
        value={form.sourceCodeLink}
        onChange={(e: any) => setForm({ ...form, sourceCodeLink: e.target.value })}
        onBlur={(e: any) => handleOnBlur(e, 'SOURCE_CODE_LINK')}
        inputStatus={formInputStatus.sourceCodeLink}
      />
      <div className="document-uploader-wrap">
        <IPFSUploader
          typeFile="document"
          imageIpfsUrl={form.ipfs}
          setIpfsImageUrl={(e: any) => setForm({ ...form, ipfs: e })}
          title={'Upload Invoice Document'}
          listNumber={4}
        />
      </div>
      <FormButtonContainer>
        <Button
          icon="auction"
          kind="actionPrimary"
          text={'Submit Proposal'}
          loading={loading}
          onClick={handleSubmitProposal}
        />
      </FormButtonContainer>
    </>
  )
}
