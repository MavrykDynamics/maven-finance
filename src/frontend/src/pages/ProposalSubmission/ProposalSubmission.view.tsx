import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { Input } from 'app/App.components/Input/Input.controller'
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR } from 'app/App.components/Toaster/Toaster.constants'
import { create } from 'ipfs-http-client'
import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Page } from 'styles'

import { TextEditor } from '../../app/App.components/TextEditor/TextEditor.controller'
import { SubmitProposalForm } from './ProposalSubmission.actions'
// prettier-ignore
import {
  ProposalSubmissionForm,
  ProposalSubmissionInvoiceImage,
  UploaderFileSelector,
  UploadIcon,
  UploadIconContainer,
} from './ProposalSubmission.style'
import { PRIMARY } from '../../app/App.components/PageHeader/PageHeader.constants'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import * as React from 'react'

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
    ipfsHash: '',
  })
  const [isUploading, setIsUploading] = useState(false)
  const [isUploaded, setIsUploaded] = useState(false)
  const inputFile = useRef<HTMLInputElement>(null)

  async function handleUpload(file: any) {
    try {
      setIsUploading(true)
      const added = await client.add(file)
      const invoice = `https://ipfs.infura.io/ipfs/${added.path}`
      setForm({ ...form, ipfsHash: invoice })
      setIsUploading(false)
      setIsUploaded(!isUploading)
    } catch (error: any) {
      dispatch(showToaster(ERROR, error.message, ''))
      console.error(error)
      setIsUploading(false)
      setIsUploaded(false)
    }
  }

  // useEffect(() => {
  //   if (accountPkh && parseInt(myTotalStakeBalance || '0') >= (minimumStakedMvkBalance || parseInt('10000'))) {
  //     setBalanceOk(true)
  //   }
  // }, [accountPkh, myTotalStakeBalance, updateSatellite, balanceOk, usersSatellite, minimumStakedMvkBalance, form.fee])

  const handleIconClick = () => {
    inputFile?.current?.click()
  }

  const handleTextEditorChange = (editorState: any) => {
    setForm({ ...form, description: editorState })
  }

  const handleSubmit = () => {
    const formIsValid = validateForm()
    if (formIsValid) submitProposalCallback(form)
  }

  const validateForm = () => {
    console.log(form)
    const validForm = {
      title: form.title.length,
      description: form.description.length !== 0 && /<\/?[a-z][\s\S]*>/i.test(form.description),
      ipfsHash: true,
    }

    // const errors: any[] = []
    // let errorMessage = 'Please correct:'
    // Object.entries(validForm).forEach((k) => {
    //   if (!k[1]) {
    //     errors.push(k)
    //     errorMessage += ` ${k[0] === 'staked' ? 'Wallet' : k[0].charAt(0).toUpperCase() + k[0].substr(1)},`
    //   }
    // })
    // if (errors.length === 0)
    return true
    // else {
    //   const errorTitle = 'Invalid fields'
    //   errorMessage = errorMessage.substring(0, errorMessage.length - 1)
    //   dispatch(showToaster(ERROR, errorTitle, errorMessage, 3000))
    //   return false
    // }
  }

  return (
    <Page>
      <PageHeader page={'governance'} kind={PRIMARY} loading={loading} />
      <ProposalSubmissionForm>
        <h2>Governance Proposal Submission</h2>
        <Input
          type="text"
          placeholder="Title"
          value={form.title}
          onChange={(e: any) => setForm({ ...form, title: e.target.value })}
          onBlur={() => {}}
        />
        <p>2- Enter your description</p>
        <TextEditor onChange={handleTextEditorChange} initialValue={form.description} />
        <p>3- Upload invoice for governance proposal and required expense report</p>
        <UploaderFileSelector>
          {isUploading ? (
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
          <ProposalSubmissionInvoiceImage>
            {form.title && <img src={form.title} alt="" />}
          </ProposalSubmissionInvoiceImage>
        )}
        <Button icon="hammer" text={'Submit Governance Proposal'} loading={loading} onClick={handleSubmit} />
      </ProposalSubmissionForm>
    </Page>
  )
}
