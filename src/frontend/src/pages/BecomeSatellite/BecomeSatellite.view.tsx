import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { Input } from 'app/App.components/Input/Input.controller'
import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Page } from 'styles'

import { unregisterAsSatellite } from './BecomeSatellite.actions'
// prettier-ignore
import {
  BecomeSatelliteForm,
  BecomeSatelliteFormBalanceCheck,
  BecomeSatelliteFormTitle,
} from './BecomeSatellite.style'
import { PRIMARY } from '../../app/App.components/PageHeader/PageHeader.constants'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import * as React from 'react'
import { SatelliteRecord } from '../../utils/TypesAndInterfaces/Delegation'
import { IPFSUploader } from '../../app/App.components/IPFSUploader/IPFSUploader.controller'
import { TextArea } from '../../app/App.components/TextArea/TextArea.controller'
import {
  RegisterAsSatelliteForm,
  RegisterAsSatelliteFormInputStatus,
  ValidRegisterAsSatelliteForm,
} from '../../utils/TypesAndInterfaces/Forms'
import { isNotAllWhitespace, validateFormAndThrowErrors } from '../../utils/validatorFunctions'

type BecomeSatelliteViewProps = {
  loading: boolean
  myTotalStakeBalance: number
  minimumStakedMvkBalance: number
  accountPkh?: string
  registerCallback: (form: RegisterAsSatelliteForm) => void
  updateSatelliteCallback: (form: RegisterAsSatelliteForm) => void
  usersSatellite: SatelliteRecord
}

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
  const updateSatellite = usersSatellite.address !== ''
  const [form, setForm] = useState<RegisterAsSatelliteForm>({
    name: '',
    description: '',
    fee: 0,
    image: '',
  })
  const [validForm, setValidForm] = useState<ValidRegisterAsSatelliteForm>({
    name: false,
    description: false,
    fee: false,
    image: false,
  })
  const [formInputStatus, setFormInputStatus] = useState<RegisterAsSatelliteFormInputStatus>({
    name: '',
    description: '',
    fee: '',
    image: '',
  })
  useEffect(() => {
    if (accountPkh && myTotalStakeBalance >= minimumStakedMvkBalance) {
      setBalanceOk(true)
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

  const handleOnBlur = (e: any, formField: string) => {
    let updatedState, validityCheckResult
    switch (formField) {
      case 'NAME':
        validityCheckResult = isNotAllWhitespace(form.name)
        setValidForm({ ...validForm, name: validityCheckResult })
        updatedState = { ...validForm, name: validityCheckResult }
        setFormInputStatus({ ...formInputStatus, name: updatedState.name ? 'success' : 'error' })
        break
      case 'DESCRIPTION':
        validityCheckResult = isNotAllWhitespace(form.description)
        setValidForm({ ...validForm, description: validityCheckResult })
        updatedState = { ...validForm, description: validityCheckResult }
        setFormInputStatus({ ...formInputStatus, description: updatedState.description ? 'success' : 'error' })
        break
      case 'FEE':
        setValidForm({ ...validForm, fee: form.fee >= 0 && form.fee <= 100 })
        updatedState = { ...validForm, fee: form.fee >= 0 }
        setFormInputStatus({
          ...formInputStatus,
          fee: updatedState.fee ? 'success' : 'error',
        })
        break
    }
  }

  const handleSubmit = () => {
    const formIsValid = validateFormAndThrowErrors(dispatch, validForm)
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
          onBlur={(e: any) => handleOnBlur(e, 'NAME')}
          inputStatus={formInputStatus.name}
        />
        {updateSatellite ? <p>3- Update description</p> : <p>3- Enter your description</p>}
        {/*<TextEditor onChange={handleTextEditorChange} initialValue={form.description} />*/}
        <TextArea
          placeholder="Your description here..."
          value={form.description}
          onChange={(e: any) => setForm({ ...form, description: e.target.value })}
          onBlur={(e: any) => handleOnBlur(e, 'DESCRIPTION')}
          inputStatus={formInputStatus.description}
        />
        {updateSatellite ? <p>4- Update your fee (%)</p> : <p>4- Enter your fee (%)</p>}
        <Input
          type="number"
          placeholder="Fee"
          value={form.fee}
          onChange={(e: any) => setForm({ ...form, fee: Number(e.target.value) })}
          onBlur={(e: any) => handleOnBlur(e, 'FEE')}
          inputStatus={formInputStatus.fee}
        />
        <IPFSUploader
          imageIpfsUrl={form.image}
          setIpfsImageUrl={(e: any) => setForm({ ...form, image: e })}
          title={'Upload a profile picture'}
          listNumber={5}
        />
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
