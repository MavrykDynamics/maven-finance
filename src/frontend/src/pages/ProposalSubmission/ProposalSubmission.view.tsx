import * as React from 'react'
import { useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Button } from 'app/App.components/Button/Button.controller'
import { Input, InputStatusType } from 'app/App.components/Input/Input.controller'
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR } from 'app/App.components/Toaster/Toaster.constants'
import { create } from 'ipfs-http-client'
import { Page } from 'styles'
import { PRIMARY } from '../../app/App.components/PageHeader/PageHeader.constants'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { GridSheet } from '../../app/App.components/GridSheet/GridSheet.controller'
import '@silevis/reactgrid/styles.css'
// prettier-ignore
import {
  FormTitle,
  FormTitleAndFeeContainer,
  ProposalSubmissionForm,
  ProposalSubmissionInvoiceImage,
  UploaderFileSelector,
  UploadIcon,
  UploadIconContainer,
} from './ProposalSubmission.style'
import { SubmitProposalForm } from './ProposalSubmission.actions'

import { isJsonString, isNotAllWhitespace, isValidHttpUrl, isValidIPFSUrl } from '../../utils/validatorFunctions'

type ValidSubmitProposalForm = {
  title: boolean | undefined
  description: boolean | undefined
  ipfs: boolean | undefined
  successMVKReward: boolean | undefined
  invoiceTable: boolean | undefined
  sourceCodeLink: boolean | undefined
}

type FormInputStatus = {
  title: InputStatusType
  description: InputStatusType
  ipfs: InputStatusType
  successMVKReward: InputStatusType
  invoiceTable: InputStatusType
  sourceCodeLink: InputStatusType
}
type ProposalSubmissionViewProps = {
  loading: boolean
  accountPkh?: string
  submitProposalCallback: (form: SubmitProposalForm) => void
}

const client = create({ url: 'https://ipfs.infura.io:5001/api/v0' })

export const ProposalSubmissionView = ({
  loading,
  accountPkh,
  submitProposalCallback,
}: ProposalSubmissionViewProps) => {
  const dispatch = useDispatch()
  const [form, setForm] = useState<SubmitProposalForm>({
    title: '',
    description: '',
    ipfs: '',
    successMVKReward: 0,
    invoiceTable: '',
    sourceCodeLink: '',
  })
  const [validForm, setValidForm] = useState<ValidSubmitProposalForm>({
    title: false,
    description: false,
    ipfs: false,
    successMVKReward: false,
    invoiceTable: false,
    sourceCodeLink: false,
  })
  const [formInputStatus, setFormInputStatus] = useState<FormInputStatus>({
    title: '',
    description: '',
    ipfs: '',
    successMVKReward: '',
    invoiceTable: '',
    sourceCodeLink: '',
  })
  const [isUploading, setIsUploading] = useState(false)
  const [isUploaded, setIsUploaded] = useState(false)
  const [tableJson, setTableJson] = useState()
  const inputFile = useRef<HTMLInputElement>(null)

  async function handleUpload(file: any) {
    try {
      setIsUploading(true)
      const added = await client.add(file)
      const invoice = `https://ipfs.infura.io/ipfs/${added.path}`
      setForm({ ...form, ipfs: invoice })
      let validityCheckResult = isValidIPFSUrl(form.ipfs)
      setValidForm({ ...validForm, ipfs: validityCheckResult })
      let updatedState = { ...validForm, ipfs: validityCheckResult }
      setFormInputStatus({ ...formInputStatus, ipfs: updatedState.ipfs ? 'success' : 'error' })
      setIsUploading(false)
      setIsUploaded(!isUploading)
    } catch (error: any) {
      dispatch(showToaster(ERROR, error.message, ''))
      console.error(error)

      setIsUploading(false)
      setIsUploaded(false)
    }
  }

  const handleIconClick = () => {
    inputFile?.current?.click()
  }

  // const handleTextEditorChange = (editorState: any) => {
  //   setForm({ ...form, description: editorState })
  // }

  const handleOnBlur = (e: any, formField: string) => {
    let updatedState, validityCheckResult
    switch (formField) {
      case 'TITLE':
        validityCheckResult = isNotAllWhitespace(form.title)
        setValidForm({ ...validForm, title: validityCheckResult })
        updatedState = { ...validForm, title: validityCheckResult }
        setFormInputStatus({ ...formInputStatus, title: updatedState.title ? 'success' : 'error' })
        break
      case 'DESCRIPTION':
        validityCheckResult = isNotAllWhitespace(form.description)
        setValidForm({ ...validForm, description: validityCheckResult })
        updatedState = { ...validForm, description: validityCheckResult }
        setFormInputStatus({ ...formInputStatus, description: updatedState.description ? 'success' : 'error' })
        break
      case 'SUCCESS_MVK_REWARD':
        setValidForm({ ...validForm, successMVKReward: form.successMVKReward >= 0 })
        updatedState = { ...validForm, successMVKReward: form.successMVKReward >= 0 }
        setFormInputStatus({
          ...formInputStatus,
          successMVKReward: updatedState.successMVKReward ? 'success' : 'error',
        })
        break
      // case 'INVOICE_TABLE':
      //   validityCheckResult = isJsonString(form.invoiceTable)
      //   setValidForm({ ...validForm, invoiceTable: validityCheckResult })
      //   updatedState = { ...validForm, invoiceTable: validityCheckResult }
      //   setFormInputStatus({ ...formInputStatus, invoiceTable: updatedState.invoiceTable ? 'success' : 'error' })
      //   break
      case 'SOURCE_CODE_LINK':
        validityCheckResult = isValidHttpUrl(form.sourceCodeLink)
        setValidForm({ ...validForm, sourceCodeLink: validityCheckResult })
        updatedState = { ...validForm, invoiceTable: validityCheckResult }
        setFormInputStatus({ ...formInputStatus, sourceCodeLink: updatedState.sourceCodeLink ? 'success' : 'error' })
        break
    }
  }
  const handleSubmit = () => {
    const formIsValid = validateForm()
    if (formIsValid) submitProposalCallback(form)
  }

  const handleLockProposal = () => {
    console.log('Here in lock proposal')
  }

  const validateForm = () => {
    const errors: any[] = []
    let errorMessage = 'Please correct:'
    Object.entries(validForm).forEach((k) => {
      if (!k[1]) {
        errors.push(k)
        errorMessage += ` ${k[0].charAt(0).toUpperCase() + k[0].substr(1)},`
      }
    })
    if (errors.length === 0) return true
    else {
      const errorTitle = 'Invalid fields'
      errorMessage = errorMessage.substring(0, errorMessage.length - 1)
      dispatch(showToaster(ERROR, errorTitle, errorMessage, 3000))
      return false
    }
  }

  return (
    <Page>
      <PageHeader page={'governance'} kind={PRIMARY} loading={loading} />
      <ProposalSubmissionForm>
        <h1>Governance Proposal Submission</h1>
        <FormTitleAndFeeContainer>
          <FormTitle>
            <p>1- Enter the title of your proposal</p>
            <Input
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={(e: any) => setForm({ ...form, title: e.target.value })}
              onBlur={(e: any) => handleOnBlur(e, 'TITLE')}
              inputStatus={formInputStatus.title}
            />
          </FormTitle>
          <div>
            <p>2- Enter the MVK success reward</p>
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
        <p>3- Enter your description</p>
        <Input
          type="text"
          placeholder="Proposal Description"
          value={form.description}
          onChange={(e: any) => setForm({ ...form, description: e.target.value })}
          onBlur={(e: any) => handleOnBlur(e, 'DESCRIPTION')}
          inputStatus={formInputStatus.description}
        />
        <p>4- Please add a link to the source code changes (if you have)</p>
        <Input
          type="text"
          placeholder="Link to Source Code"
          value={form.sourceCodeLink}
          onChange={(e: any) => setForm({ ...form, sourceCodeLink: e.target.value })}
          onBlur={(e: any) => handleOnBlur(e, 'SOURCE_CODE_LINK')}
          inputStatus={formInputStatus.sourceCodeLink}
        />
        {/*<TextEditor onChange={handleTextEditorChange} initialValue={form.description} />*/}
        <GridSheet loading={loading} setTableJson={setTableJson} />
        <p>4- Upload invoice for governance proposal and required expense report</p>
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
                  e.target && e.target.files && e.target.files[0] && handleUpload(e.target.files[0])
                }}
              />
              <UploadIconContainer onClick={handleIconClick}>
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
        <Button icon="hammer" text={'Submit Governance Proposal'} loading={loading} onClick={handleSubmit} />
        <Button icon="hammer" text={'Lock Proposal'} loading={loading} kind="secondary" onClick={handleLockProposal} />
      </ProposalSubmissionForm>
    </Page>
  )
}
