import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { Input } from 'app/App.components/Input/Input.controller'
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
import { ERROR } from 'app/App.components/Toaster/Toaster.constants'
import { create } from 'ipfs-http-client'
import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { SatelliteRecord } from 'reducers/delegation'
import { Page } from 'styles'

import { TextEditor } from '../../app/App.components/TextEditor/TextEditor.controller'
import { RegisterAsSatelliteForm, unregisterAsSatellite } from './BecomeSatellite.actions'
// prettier-ignore
import {
  BecomeSatelliteForm,
  BecomeSatelliteFormBalanceCheck,
  BecomeSatelliteFormFeeCheck,
  BecomeSatelliteFormTitle,
  BecomeSatelliteProfilePic,
  UploaderFileSelector,
  UploadIcon,
  UploadIconContainer,
} from './BecomeSatellite.style'
import { PRIMARY } from '../../app/App.components/PageHeader/PageHeader.constants'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import * as React from 'react'

type BecomeSatelliteViewProps = {
  loading: boolean
  myTotalStakeBalance?: string
  minimumStakedMvkBalance?: string
  accountPkh?: string
  registerCallback: (form: RegisterAsSatelliteForm) => void
  updateSatelliteCallback: (form: RegisterAsSatelliteForm) => void
  usersSatellite: SatelliteRecord
}

const client = create({ url: 'https://ipfs.infura.io:5001/api/v0' })

export const BecomeSatelliteView = ({
  loading,
  myTotalStakeBalance,
  minimumStakedMvkBalance,
  accountPkh,
  registerCallback,
  updateSatelliteCallback,
  usersSatellite,
}: BecomeSatelliteViewProps) => {
  const dispatch = useDispatch()
  const [balanceOk, setBalanceOk] = useState(false)
  const [feeOk, setFeeOk] = useState(false)
  const updateSatellite = usersSatellite.address !== ''
  const [form, setForm] = useState<RegisterAsSatelliteForm>({
    name: '',
    description: '',
    fee: 0,
    image: undefined,
  })
  const [isUploading, setIsUploading] = useState(false)
  const [isUploaded, setIsUploaded] = useState(false)
  const inputFile = useRef<HTMLInputElement>(null)

  async function handleUpload(file: any) {
    try {
      setIsUploading(true)
      const added = await client.add(file)
      const image = `https://ipfs.infura.io/ipfs/${added.path}`
      setForm({ ...form, image })
      setIsUploading(false)
      setIsUploaded(!isUploading)
    } catch (error: any) {
      dispatch(showToaster(ERROR, error.message, ''))
      console.error(error)
      setIsUploading(false)
      setIsUploaded(false)
    }
  }

  useEffect(() => {
    if (accountPkh && parseInt(myTotalStakeBalance || '0') >= (minimumStakedMvkBalance || parseInt('10000'))) {
      setBalanceOk(true)
    }
    if (accountPkh && form.fee >= 0 && form.fee <= 100 && form.fee % 1 === 0) {
      setFeeOk(true)
    }
    if (updateSatellite && usersSatellite) {
      setForm({
        name: usersSatellite?.name,
        description: usersSatellite?.description,
        fee: Number(usersSatellite?.satelliteFee),
        image: usersSatellite?.image,
      })
    }
  }, [accountPkh, myTotalStakeBalance, updateSatellite, balanceOk, usersSatellite, minimumStakedMvkBalance, form.fee])

  const handleIconClick = () => {
    inputFile?.current?.click()
  }

  const handleTextEditorChange = (editorState: any) => {
    setForm({ ...form, description: editorState })
  }

  const handleSubmit = () => {
    const formIsValid = validateForm()
    if (formIsValid) {
      if (updateSatellite) {
        updateSatelliteCallback(form)
      } else {
        registerCallback(form)
      }
    }
  }

  const handleUnregisterSatellite = () => {
    dispatch(unregisterAsSatellite())
  }
  const validateForm = () => {
    const validForm = {
      staked: balanceOk,
      name: form.name.length !== 0 && !/\s/g.test(form.name),
      description: form.description.length !== 0 && /<\/?[a-z][\s\S]*>/i.test(form.description),
      fee: feeOk,
      image: form.image !== undefined && form.image.indexOf('ipfs/') > 0,
    }

    const errors: any[] = []
    let errorMessage = 'Please correct:'
    Object.entries(validForm).forEach((k) => {
      if (!k[1]) {
        errors.push(k)
        errorMessage += ` ${k[0] === 'staked' ? 'Wallet' : k[0].charAt(0).toUpperCase() + k[0].substr(1)},`
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
      <PageHeader page={'satellites'} kind={PRIMARY} loading={loading} />
      <BecomeSatelliteForm>
        {updateSatellite ? (
          <BecomeSatelliteFormTitle>Update Satellite Profile</BecomeSatelliteFormTitle>
        ) : (
          <BecomeSatelliteFormTitle>Become a Satellite</BecomeSatelliteFormTitle>
        )}
        <CommaNumber value={Number(minimumStakedMvkBalance)} beginningText={'1- Stake at least'} endingText={'MVK'} />
        <BecomeSatelliteFormBalanceCheck balanceOk={balanceOk}>
          {accountPkh ? (
            <CommaNumber value={Number(myTotalStakeBalance)} beginningText={'Currently staking'} endingText={'MVK'} />
          ) : (
            'Please connect your wallet'
          )}
        </BecomeSatelliteFormBalanceCheck>
        {updateSatellite ? <p>2- Update your name</p> : <p>2- Enter your name</p>}
        <Input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e: any) => setForm({ ...form, name: e.target.value })}
          onBlur={() => {}}
        />
        {updateSatellite ? <p>3- Update description</p> : <p>3- Enter your description</p>}
        <TextEditor onChange={handleTextEditorChange} initialValue={form.description} />
        {updateSatellite ? <p>4- Update your fee (%)</p> : <p>4- Enter your fee (%)</p>}
        <BecomeSatelliteFormFeeCheck feeOk={false}>
          <Input
            type="number"
            placeholder="Fee"
            value={form.fee}
            onChange={(e: any) => setForm({ ...form, fee: Number(e.target.value) })}
            onBlur={() => {}}
          />
        </BecomeSatelliteFormFeeCheck>

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
          {isUploaded && (
            <BecomeSatelliteProfilePic>{form.image && <img src={form.image} alt="" />}</BecomeSatelliteProfilePic>
          )}
        </UploaderFileSelector>
        <Button
          icon="satellite"
          text={updateSatellite ? 'Update Satellite Info' : 'Register as Satellite'}
          loading={loading}
          onClick={handleSubmit}
        />
        {updateSatellite && (
          <Button
            icon="satellite"
            text={'Unregister Satellite'}
            loading={loading}
            kind={'secondary'}
            onClick={handleUnregisterSatellite}
          />
        )}
      </BecomeSatelliteForm>
    </Page>
  )
}
