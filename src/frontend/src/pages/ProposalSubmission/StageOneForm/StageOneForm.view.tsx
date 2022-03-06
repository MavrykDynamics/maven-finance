import {
  FormSubTitle,
  FormTitleContainer,
  FormTitleAndFeeContainer,
  ProposalSubmissionInvoiceImage,
  UploaderFileSelector,
  UploadIcon,
  UploadIconContainer,
  FormButtonContainer,
} from '../ProposalSubmission.style'
import { Input } from '../../../app/App.components/Input/Input.controller'
import { Button } from '../../../app/App.components/Button/Button.controller'
import { SubmitProposalFormInputStatus, SubmitProposalForm } from '../../../utils/TypesAndInterfaces/Forms'
import { Ref } from 'react'

type StageOneFormViewProps = {
  loading: boolean
  form: SubmitProposalForm
  setForm: (form: SubmitProposalForm) => void
  formInputStatus: SubmitProposalFormInputStatus
  isUploading: boolean
  isUploaded: boolean
  inputFile: Ref<any>
  handleIPFSUpload: (file: any) => void
  handleIPFSIconClick: () => void
  handleOnBlur: (e: any, formField: string) => void
  handleSubmitProposal: () => void
}
export const StageOneFormView = ({
  loading,
  form,
  setForm,
  formInputStatus,
  isUploading,
  isUploaded,
  inputFile,
  handleIPFSUpload,
  handleIPFSIconClick,
  handleOnBlur,
  handleSubmitProposal,
}: StageOneFormViewProps) => {
  return (
    <>
      <h1>Stage 1</h1>
      <FormTitleAndFeeContainer>
        <FormTitleContainer>
          <FormSubTitle>1- Enter the title of your proposal</FormSubTitle>
          <Input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e: any) => setForm({ ...form, title: e.target.value })}
            onBlur={(e: any) => handleOnBlur(e, 'TITLE')}
            inputStatus={formInputStatus.title}
          />
        </FormTitleContainer>
        <div>
          <FormSubTitle>2- Enter the MVK success reward</FormSubTitle>
          <Input
            type="number"
            placeholder="Success MVK Reward"
            value={form.successMVKReward}
            onChange={(e: any) => setForm({ ...form, successMVKReward: Number(e.target.value) })}
            onBlur={(e: any) => handleOnBlur(e, 'SUCCESS_MVK_REWARD')}
            inputStatus={formInputStatus.successMVKReward}
          />
        </div>
      </FormTitleAndFeeContainer>
      <FormSubTitle>3- Enter your description</FormSubTitle>
      <Input
        type="text"
        placeholder="Proposal Description"
        value={form.description}
        onChange={(e: any) => setForm({ ...form, description: e.target.value })}
        onBlur={(e: any) => handleOnBlur(e, 'DESCRIPTION')}
        inputStatus={formInputStatus.description}
      />
      <FormSubTitle>4- Please add a link to the source code changes (if you have)</FormSubTitle>
      <Input
        type="text"
        placeholder="Link to Source Code"
        value={form.sourceCodeLink}
        onChange={(e: any) => setForm({ ...form, sourceCodeLink: e.target.value })}
        onBlur={(e: any) => handleOnBlur(e, 'SOURCE_CODE_LINK')}
        inputStatus={formInputStatus.sourceCodeLink}
      />
      {/*<TextEditor onChange={handleTextEditorChange} initialValue={form.description} />*/}
      <FormSubTitle>4- Upload invoice for governance proposal and required expense report</FormSubTitle>
      <UploaderFileSelector>
        {isUploading && !isUploaded ? (
          <div>Uploading...</div>
        ) : (
          <div>
            <input
              id="uploader"
              type="file"
              accept="image/*"
              ref={inputFile}
              onChange={(e: any) => {
                e.target && e.target.files && e.target.files[0] && handleIPFSUpload(e.target.files[0])
              }}
            />
            <UploadIconContainer onClick={handleIPFSIconClick}>
              <UploadIcon>
                <use xlinkHref={`/icons/sprites.svg#upload`} />
              </UploadIcon>
              <div>Upload file</div>
            </UploadIconContainer>
          </div>
        )}
      </UploaderFileSelector>
      {isUploaded && (
        <ProposalSubmissionInvoiceImage>{form.ipfs && <img src={form.ipfs} alt="" />}</ProposalSubmissionInvoiceImage>
      )}
      <FormButtonContainer>
        <Button icon="hammer" text={'Submit Governance Proposal'} loading={loading} onClick={handleSubmitProposal} />
      </FormButtonContainer>
    </>
  )
}
