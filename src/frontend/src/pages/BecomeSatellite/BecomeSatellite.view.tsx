import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { Input } from 'app/App.components/Input/Input.controller'
import { useEffect, useState } from 'react'
import * as React from 'react'
import { useDispatch } from 'react-redux'
import { Page, PageContent } from 'styles'

import { ACTION_PRIMARY, ACTION_SECONDARY } from '../../app/App.components/Button/Button.constants'
// components
import Icon from '../../app/App.components/Icon/Icon.view'
import { IPFSUploader } from '../../app/App.components/IPFSUploader/IPFSUploader.controller'
import { PRIMARY } from '../../app/App.components/PageHeader/PageHeader.constants'
import { PageHeader } from '../../app/App.components/PageHeader/PageHeader.controller'
import { TextArea } from '../../app/App.components/TextArea/TextArea.controller'
import { SatelliteRecord } from '../../utils/TypesAndInterfaces/Delegation'

import {
  RegisterAsSatelliteForm,
  RegisterAsSatelliteFormInputStatus,
  ValidRegisterAsSatelliteForm,
} from '../../utils/TypesAndInterfaces/Forms'
import { isNotAllWhitespace, validateFormAndThrowErrors } from '../../utils/validatorFunctions'
import { SatelliteSideBar } from '../Satellites/SatelliteSideBar/SatelliteSideBar.controller'
import { unregisterAsSatellite } from './BecomeSatellite.actions'

import {
  BecomeSatelliteButttons,
  BecomeSatelliteForm,
  BecomeSatelliteFormBalanceCheck,
  BecomeSatelliteFormHorizontal,
  BecomeSatelliteFormTitle,
} from './BecomeSatellite.style'
import InputWithPersent from 'app/App.components/InputWithPersent/InputWithPersent'

type BecomeSatelliteViewProps = {
  loading: boolean
  myTotalStakeBalance: number
  minimumStakedMvkBalance: number
  accountPkh?: string
  registerCallback: (form: RegisterAsSatelliteForm) => void
  updateSatelliteCallback: (form: RegisterAsSatelliteForm) => void
  usersSatellite: SatelliteRecord
}

const FORM_DEFAULT = {
  name: '',
  description: '',
  website: '',
  fee: 0,
  image: '',
}
const FORM_VALID_DEFAULT = {
  name: false,
  description: false,
  website: false,
  fee: false,
  image: false,
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
  const updateSatellite = usersSatellite?.address !== ''
  const [form, setForm] = useState<RegisterAsSatelliteForm>(FORM_DEFAULT)
  const [validForm, setValidForm] = useState<ValidRegisterAsSatelliteForm>(FORM_VALID_DEFAULT)
  const [formInputStatus, setFormInputStatus] = useState<RegisterAsSatelliteFormInputStatus>({
    name: '',
    description: '',
    website: '',
    fee: '',
    image: '',
  })
  const handleValidateLoad = (formFields: RegisterAsSatelliteForm) => {
    setFormInputStatus({
      name: isNotAllWhitespace(formFields.name) ? 'success' : 'error',
      description: isNotAllWhitespace(formFields.description) ? 'success' : 'error',
      website: isNotAllWhitespace(formFields.website) ? 'success' : 'error',
      fee: formFields.fee >= 0 ? 'success' : 'error',
      image: isNotAllWhitespace(formFields.image || '') ? 'success' : 'error',
    })
    setValidForm({
      name: isNotAllWhitespace(formFields.name),
      description: isNotAllWhitespace(formFields.description),
      website: isNotAllWhitespace(formFields.website),
      fee: formFields.fee >= 0,
      image: isNotAllWhitespace(formFields.image || ''),
    })
  }

  useEffect(() => {
    setForm(FORM_DEFAULT)
    setValidForm(FORM_VALID_DEFAULT)
    setFormInputStatus({
      name: '',
      description: '',
      website: '',
      fee: '',
      image: '',
    })
    if (updateSatellite && usersSatellite) {
      const data = {
        name: usersSatellite?.name,
        description: usersSatellite?.description,
        website: usersSatellite?.website,
        fee: Number(usersSatellite?.satelliteFee),
        image: usersSatellite?.image,
      }
      setForm(data)
      handleValidateLoad(data)
    }
  }, [updateSatellite, usersSatellite])

  useEffect(() => {
    if (!accountPkh && myTotalStakeBalance >= minimumStakedMvkBalance) {
      setBalanceOk(true)
    }
  }, [accountPkh, myTotalStakeBalance, minimumStakedMvkBalance])

  useEffect(() => {
    handleValidate('FEE')
  }, [form.fee])

  const handleValidate = (formField: string) => {
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
        setFormInputStatus({
          ...formInputStatus,
          description: updatedState.description ? 'success' : 'error',
        })
        break
      case 'WEBSITE':
        validityCheckResult = isNotAllWhitespace(form.website)
        setValidForm({ ...validForm, website: validityCheckResult })
        updatedState = { ...validForm, website: validityCheckResult }
        setFormInputStatus({
          ...formInputStatus,
          website: updatedState.website ? 'success' : 'error',
        })
        break
      case 'FEE':
        setValidForm({
          ...validForm,
          fee: form.fee >= 0 && form.fee <= 100,
        })
        updatedState = { ...validForm, fee: form.fee >= 0 && form.fee <= 100 }
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
      <PageContent>
        <BecomeSatelliteForm>
          {updateSatellite ? (
            <BecomeSatelliteFormTitle>Edit Satellite Profile</BecomeSatelliteFormTitle>
          ) : (
            <BecomeSatelliteFormTitle>Become a Satellite</BecomeSatelliteFormTitle>
          )}
          <CommaNumber
            className="label"
            value={Number(minimumStakedMvkBalance)}
            beginningText={'1- Stake at least'}
            endingText={'MVK'}
          />
          <BecomeSatelliteFormBalanceCheck balanceOk={balanceOk}>
            {!accountPkh ? (
              <>
                <Icon id="check-stroke" />
                <CommaNumber
                  value={Number(myTotalStakeBalance)}
                  beginningText={'Currently staking'}
                  endingText={'MVK'}
                />
              </>
            ) : (
              <div>
                <Icon id="close-stroke" />
                Please connect your wallet
              </div>
            )}
          </BecomeSatelliteFormBalanceCheck>
          <BecomeSatelliteFormHorizontal>
            <article>
              {updateSatellite ? (
                <label className="label">2- Edit your name</label>
              ) : (
                <label className="label">2- Enter your name</label>
              )}
              <Input
                type="text"
                placeholder="Name"
                required
                disabled={!balanceOk}
                value={form.name}
                onChange={(e: any) => {
                  setForm({ ...form, name: e.target.value })
                  handleValidate('NAME')
                }}
                onBlur={(e: any) => handleValidate('NAME')}
                inputStatus={formInputStatus.name}
              />
            </article>
            <article>
              {updateSatellite ? (
                <label className="label">3- Edit your website</label>
              ) : (
                <label className="label">3- Enter your website</label>
              )}
              <Input
                type="text"
                placeholder="Website"
                disabled={!balanceOk}
                value={form.website}
                onChange={(e: any) => {
                  setForm({ ...form, website: e.target.value })
                  handleValidate('WEBSITE')
                }}
                onBlur={(e: any) => handleValidate('WEBSITE')}
                inputStatus={formInputStatus.website}
              />
            </article>
          </BecomeSatelliteFormHorizontal>
          {updateSatellite ? (
            <label className="label">4- Edit description</label>
          ) : (
            <label className="label">4- Enter your description</label>
          )}
          {/*<TextEditor onChange={handleTextEditorChange} initialValue={form.description} />*/}
          <TextArea
            placeholder="Your description here..."
            value={form.description}
            disabled={!balanceOk}
            onChange={(e: any) => {
              setForm({ ...form, description: e.target.value })
              handleValidate('DESCRIPTION')
            }}
            onBlur={(e: any) => handleValidate('DESCRIPTION')}
            inputStatus={formInputStatus.description}
          />
          {updateSatellite ? (
            <label className="label">5- Edit your fee (%)</label>
          ) : (
            <label className="label">5- Enter your fee (%)</label>
          )}
          <div className="input-fee-wrap">
            <InputWithPersent
              type="text"
              placeholder="Fee"
              disabled={!balanceOk}
              value={form.fee}
              onBlur={(e: any) => handleValidate('FEE')}
              inputStatus={formInputStatus.fee}
              onChange={(feeNumber: number) => setForm({ ...form, fee: feeNumber })}
            />
          </div>
          <IPFSUploader
            disabled={!balanceOk}
            typeFile="image"
            imageIpfsUrl={form.image}
            setIpfsImageUrl={(e: any) => {
              setForm({ ...form, image: e })
              setValidForm({ ...validForm, image: Boolean(e) })
              setFormInputStatus({ ...formInputStatus, image: Boolean(e) ? 'success' : 'error' })
            }}
            title={'Upload Profile Pic'}
            listNumber={6}
          />
          <BecomeSatelliteButttons>
            {updateSatellite && (
              <Button
                icon="close-stroke"
                kind={ACTION_SECONDARY}
                disabled={!balanceOk}
                text={'Unregister Satellite'}
                loading={loading}
                onClick={handleUnregisterSatellite}
              />
            )}
            <Button
              icon="satellite-stroke"
              text={updateSatellite ? 'Update Satellite Info' : 'Become a satellite'}
              loading={loading}
              disabled={!balanceOk}
              kind={ACTION_PRIMARY}
              onClick={handleSubmit}
            />
          </BecomeSatelliteButttons>
        </BecomeSatelliteForm>
        <SatelliteSideBar isButton={false} />
      </PageContent>
    </Page>
  )
}
