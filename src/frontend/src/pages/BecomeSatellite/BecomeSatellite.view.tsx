import { Button } from 'app/App.components/Button/Button.controller'
import { Input } from 'app/App.components/Input/Input.controller'
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR } from 'app/App.components/Toaster/Toaster.constants'
import { create } from 'ipfs-http-client'
import { SatellitesHeader } from 'pages/Satellites/SatellitesHeader/SatellitesHeader.controller'
import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Page } from 'styles'

import { TextEditor } from '../../app/App.components/TextEditor/TextEditor.controller'
import { RegisterAsSatelliteForm } from './BecomeSatellite.actions'
// prettier-ignore
import { BecomeSatelliteForm, BecomeSatelliteFormBalanceCheck, BecomeSatelliteProfilePic, UploaderFileSelector, UploadIcon, UploadIconContainer } from './BecomeSatellite.style'

type BecomeSatelliteViewProps = {
  myVMvkTokenBalance?: string
  accountPkh?: string
  registerCallback: (form: RegisterAsSatelliteForm) => void
}

const client = create({ url: 'https://ipfs.infura.io:5001/api/v0' })

export const BecomeSatelliteView = ({ myVMvkTokenBalance, accountPkh, registerCallback }: BecomeSatelliteViewProps) => {
  const dispatch = useDispatch()
  const [balanceOk, setBalanceOk] = useState(false)
  const [form, setForm] = useState<RegisterAsSatelliteForm>({
    name: '',
    description: '',
    fee: 0,
    image: undefined,
  })
  const [isUploading, setIsUploading] = useState(false)
  const inputFile = useRef<HTMLInputElement>(null)

  async function handleUpload(file: any) {
    try {
      setIsUploading(true)
      const added = await client.add(file)
      const image = `https://ipfs.infura.io/ipfs/${added.path}`
      setForm({ ...form, image })
      setIsUploading(false)
    } catch (error: any) {
      dispatch(showToaster(ERROR, error.message, ''))
      console.error(error)
      setIsUploading(false)
    }
  }

  useEffect(() => {
    if (accountPkh && parseInt(myVMvkTokenBalance || '0') >= 10000) setBalanceOk(true)
  }, [accountPkh, myVMvkTokenBalance])

  const handleIconClick = () => {
    inputFile?.current?.click()
  }

  const _handleEditorChange = (editorState: any) => {
    setForm({ ...form, description: editorState })
    console.log(editorState)
  }

  return (
    <Page>
      <SatellitesHeader />
      <BecomeSatelliteForm>
        <h3>Become a Satellite</h3>
        <p>1- Stake at least 10000 MVK</p>
        <BecomeSatelliteFormBalanceCheck balanceOk={balanceOk}>
          {accountPkh ? `Currently staking ${myVMvkTokenBalance} MVK` : 'Please connect your wallet'}
        </BecomeSatelliteFormBalanceCheck>
        <p>2- Enter your name</p>
        <Input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e: any) => setForm({ ...form, name: e.target.value })}
          onBlur={() => {}}
        />
        <p>3- Enter your description</p>
        <TextEditor onChange={_handleEditorChange} />
        <p>5- Enter your fee</p>
        <Input
          type="text"
          placeholder="Fee"
          value={form.fee}
          onChange={(e: any) => setForm({ ...form, fee: e.target.value })}
          onBlur={() => {}}
        />
        <p>6- Upload a profile picture</p>
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
          <BecomeSatelliteProfilePic>{form.image && <img src={form.image} alt="" />}</BecomeSatelliteProfilePic>
        </UploaderFileSelector>
        <Button icon="satellite" text="Register as Satellite" onClick={() => registerCallback(form)} />
      </BecomeSatelliteForm>
    </Page>
  )
}
