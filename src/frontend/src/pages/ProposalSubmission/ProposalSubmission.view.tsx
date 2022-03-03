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

import { isNotAllWhitespace, isValidHttpUrl, isValidIPFSUrl } from '../../utils/validatorFunctions'
import { PropSubmissionTopBar } from './PropSubmissionTopBar/PropSubmissionTopBar.controller'
import { GovernancePhase } from '../../reducers/governance'
import { StageOneForm } from './StageOneForm/StageOneForm.controller'
import { StageTwoForm } from './StageTwoForm/StageTwoForm.controller'
import { StageThreeForm } from './StageThreeForm/StageThreeForm.controller'

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
  governancePhase: GovernancePhase
  isInEmergencyGovernance: boolean
  activeTab: number
  handleChangeTab: (tabId: number) => void
}

const client = create({ url: 'https://ipfs.infura.io:5001/api/v0' })

export const ProposalSubmissionView = ({
  loading,
  submitProposalCallback,
  activeTab,
  handleChangeTab,
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
      <PropSubmissionTopBar value={activeTab} valueCallback={handleChangeTab} />
      <ProposalSubmissionForm>
        {activeTab === 1 && <StageOneForm id={1} label={'StageOneForm'} />}
        {activeTab === 2 && <StageTwoForm id={2} label={'StageTwoForm'} />}
        {activeTab === 3 && <StageThreeForm id={3} label={'StageThreeForm'} />}
      </ProposalSubmissionForm>
    </Page>
  )
}
