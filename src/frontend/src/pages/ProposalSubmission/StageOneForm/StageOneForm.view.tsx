import {
  FormTitle,
  FormTitleAndFeeContainer,
  ProposalSubmissionInvoiceImage,
  UploaderFileSelector,
} from '../ProposalSubmission.style'
import { loading } from '../../../reducers/loading'
import { GridSheet } from '../../../app/App.components/GridSheet/GridSheet.controller'
import { Input } from '../../../app/App.components/Input/Input.controller'

type StageOneFormViewProps = {}
export const StageOneFormView = ({}: StageOneFormViewProps) => {
  return (
    <>
      <h1>Stage 1</h1>
      {/*<FormTitleAndFeeContainer>*/}
      {/*  <FormTitle>*/}
      {/*    <p>1- Enter the title of your proposal</p>*/}
      {/*    <Input*/}
      {/*      type="text"*/}
      {/*      placeholder="Title"*/}
      {/*      value={form.title}*/}
      {/*      onChange={(e: any) => setForm({ ...form, title: e.target.value })}*/}
      {/*      onBlur={(e: any) => handleOnBlur(e, 'TITLE')}*/}
      {/*      inputStatus={formInputStatus.title}*/}
      {/*    />*/}
      {/*  </FormTitle>*/}
      {/*  <div>*/}
      {/*    <p>2- Enter the MVK success reward</p>*/}
      {/*    <Input*/}
      {/*      type="number"*/}
      {/*      placeholder="Success MVK Reward"*/}
      {/*      value={form.successMVKReward}*/}
      {/*      onChange={(e: any) => setForm({ ...form, successMVKReward: Number(e.target.value) })}*/}
      {/*      onBlur={(e: any) => handleOnBlur(e, 'SUCCESS_MVK_REWARD')}*/}
      {/*      inputStatus={formInputStatus.successMVKReward}*/}
      {/*    />*/}
      {/*  </div>*/}
      {/*</FormTitleAndFeeContainer>*/}
      {/*<p>3- Enter your description</p>*/}
      {/*<Input*/}
      {/*  type="text"*/}
      {/*  placeholder="Proposal Description"*/}
      {/*  value={form.description}*/}
      {/*  onChange={(e: any) => setForm({ ...form, description: e.target.value })}*/}
      {/*  onBlur={(e: any) => handleOnBlur(e, 'DESCRIPTION')}*/}
      {/*  inputStatus={formInputStatus.description}*/}
      {/*/>*/}
      {/*<p>4- Please add a link to the source code changes (if you have)</p>*/}
      {/*<Input*/}
      {/*  type="text"*/}
      {/*  placeholder="Link to Source Code"*/}
      {/*  value={form.sourceCodeLink}*/}
      {/*  onChange={(e: any) => setForm({ ...form, sourceCodeLink: e.target.value })}*/}
      {/*  onBlur={(e: any) => handleOnBlur(e, 'SOURCE_CODE_LINK')}*/}
      {/*  inputStatus={formInputStatus.sourceCodeLink}*/}
      {/*/>*/}
      {/*/!*<TextEditor onChange={handleTextEditorChange} initialValue={form.description} />*!/*/}
      {/*<GridSheet loading={loading} setTableJson={setTableJson} />*/}
      {/*<p>4- Upload invoice for governance proposal and required expense report</p>*/}
      {/*<UploaderFileSelector>*/}
      {/*  {isUploading && !isUploaded ? (*/}
      {/*    <div>Uploading...</div>*/}
      {/*  ) : (*/}
      {/*    <div>*/}
      {/*      <input*/}
      {/*        id="uploader"*/}
      {/*        type="file"*/}
      {/*        accept="image/*"*/}
      {/*        ref={inputFile}*/}
      {/*        onChange={(e: any) => {*/}
      {/*          e.target && e.target.files && e.target.files[0] && handleUpload(e.target.files[0])*/}
      {/*        }}*/}
      {/*      />*/}
      {/*      <UploadIconContainer onClick={handleIconClick}>*/}
      {/*        <UploadIcon>*/}
      {/*          <use xlinkHref={`/icons/sprites.svg#upload`} />*/}
      {/*        </UploadIcon>*/}
      {/*        <div>Upload file</div>*/}
      {/*      </UploadIconContainer>*/}
      {/*    </div>*/}
      {/*  )}*/}
      {/*</UploaderFileSelector>*/}
      {/*{isUploaded && (*/}
      {/*  <ProposalSubmissionInvoiceImage>{form.ipfs && <img src={form.ipfs} alt="" />}</ProposalSubmissionInvoiceImage>*/}
      {/*)}*/}
      {/*<Button icon="hammer" text={'Submit Governance Proposal'} loading={loading} onClick={handleSubmit} />*/}
      {/*<Button icon="hammer" text={'Lock Proposal'} loading={loading} kind="secondary" onClick={handleLockProposal} />*/}
    </>
  )
}
