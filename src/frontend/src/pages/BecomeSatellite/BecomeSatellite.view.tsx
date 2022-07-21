import { Button } from 'app/App.components/Button/Button.controller'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { Input } from 'app/App.components/Input/Input.controller'
import * as React from 'react'
import { useEffect, useState } from 'react'
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
import { isNotAllWhitespace, isValidLength, validateFormAndThrowErrors } from '../../utils/validatorFunctions'
import { SatelliteSideBar } from '../Satellites/SatelliteSideBar/SatelliteSideBar.controller'
import { unregisterAsSatellite } from './BecomeSatellite.actions'
import {
  BecomeSatelliteButttons,
  BecomeSatelliteForm,
  BecomeSatelliteFormBalanceCheck,
  BecomeSatelliteFormHorizontal,
  BecomeSatelliteFormTitle,
} from './BecomeSatellite.style'
import InputWithPercent from 'app/App.components/InputWithPercent/InputWithPercent'

type BecomeSatelliteViewProps = {
  loading: boolean
  myTotalStakeBalance: number
  satelliteConfig: any
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
  satelliteConfig,
  accountPkh,
  registerCallback,
  updateSatelliteCallback,
  usersSatellite,
}: BecomeSatelliteViewProps) => {
  const dispatch = useDispatch()
  const [balanceOk, setBalanceOk] = useState(false)
  const updateSatellite = usersSatellite && usersSatellite?.address !== ''

  const [form, setForm] = useState<RegisterAsSatelliteForm>(FORM_DEFAULT)
  const [validForm, setValidForm] = useState<ValidRegisterAsSatelliteForm>(FORM_VALID_DEFAULT)
  const [formInputStatus, setFormInputStatus] = useState<RegisterAsSatelliteFormInputStatus>({
    name: '',
    description: '',
    website: '',
    fee: '',
    image: '',
  })
  const disabled = !balanceOk || !accountPkh
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
    setBalanceOk(myTotalStakeBalance >= satelliteConfig.minimumStakedMvkBalance)
  }, [accountPkh, myTotalStakeBalance, satelliteConfig])

  useEffect(() => {
    handleValidate('FEE')
  }, [form.fee])

  const handleValidate = (formField: string) => {
    let updatedState, validityCheckResult
    switch (formField) {
      case 'NAME':
        validityCheckResult =
          isNotAllWhitespace(form.name) && isValidLength(form.name, 1, satelliteConfig.satelliteNameMaxLength)
        setValidForm({ ...validForm, name: validityCheckResult })
        updatedState = { ...validForm, name: validityCheckResult }
        setFormInputStatus({ ...formInputStatus, name: updatedState.name ? 'success' : 'error' })
        break
      case 'DESCRIPTION':
        validityCheckResult =
          isNotAllWhitespace(form.description) &&
          isValidLength(form.description, 1, satelliteConfig.satelliteDescriptionMaxLength)
        setValidForm({ ...validForm, description: validityCheckResult })
        updatedState = { ...validForm, description: validityCheckResult }
        setFormInputStatus({
          ...formInputStatus,
          description: updatedState.description ? 'success' : 'error',
        })
        break
      case 'WEBSITE':
        validityCheckResult =
          isNotAllWhitespace(form.website) && isValidLength(form.website, 1, satelliteConfig.satelliteWebsiteMaxLength)
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
            value={Number(satelliteConfig.minimumStakedMvkBalance)}
            beginningText={'1 - Stake at least'}
            endingText={'MVK'}
          />

          {accountPkh ? (
            <BecomeSatelliteFormBalanceCheck balanceOk={balanceOk}>
              <Icon id={balanceOk ? 'check-stroke' : 'close-stroke'} />
              <CommaNumber value={Number(myTotalStakeBalance)} beginningText={'Currently staking'} endingText={'MVK'} />
            </BecomeSatelliteFormBalanceCheck>
          ) : (
            <BecomeSatelliteFormBalanceCheck balanceOk={false}>
              <div>
                <Icon id="close-stroke" />
                Please connect your wallet
              </div>
            </BecomeSatelliteFormBalanceCheck>
          )}

          <BecomeSatelliteFormHorizontal>
            <article>
              {updateSatellite ? (
                <label className="label">2 - Edit your name</label>
              ) : (
                <label className="label">2 - Enter your name</label>
              )}
              <Input
                type="text"
                placeholder="Name"
                required
                disabled={disabled}
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
                <label className="label">3 - Edit your website</label>
              ) : (
                <label className="label">3 - Enter your website</label>
              )}
              <Input
                type="text"
                placeholder="Website"
                disabled={disabled}
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
            <label className="label">4 - Edit description</label>
          ) : (
            <label className="label">4 - Enter a description</label>
          )}
          <TextArea
            placeholder="Your description here..."
            value={form.description}
            disabled={disabled}
            onChange={(e: any) => {
              setForm({ ...form, description: e.target.value })
              handleValidate('DESCRIPTION')
            }}
            onBlur={(e: any) => handleValidate('DESCRIPTION')}
            inputStatus={formInputStatus.description}
          />
          {updateSatellite ? (
            <label className="label">5 - Edit your fee (%)</label>
          ) : (
            <label className="label">5 - Enter your fee (%)</label>
          )}
          <div className="input-fee-wrap">
            <InputWithPercent
              type="text"
              placeholder="Fee"
              disabled={disabled}
              value={form.fee}
              onBlur={(e: any) => handleValidate('FEE')}
              inputStatus={formInputStatus.fee}
              onChange={(feeNumber: number) => setForm({ ...form, fee: feeNumber })}
            />
          </div>
          <IPFSUploader
            disabled={disabled}
            typeFile="image"
            imageIpfsUrl={form.image}
            setIpfsImageUrl={(e: any) => {
              setForm({ ...form, image: e })
              setValidForm({ ...validForm, image: Boolean(e) })
              setFormInputStatus({ ...formInputStatus, image: Boolean(e) ? 'success' : 'error' })
            }}
            title={'Upload your photo'}
            listNumber={6}
          />
          <BecomeSatelliteButttons>
            {updateSatellite && (
              <Button
                icon="close-stroke"
                kind={ACTION_SECONDARY}
                disabled={disabled}
                text={'Unregister Satellite'}
                loading={loading}
                onClick={handleUnregisterSatellite}
              />
            )}
            <Button
              icon="satellite-stroke"
              text={updateSatellite ? 'Update Satellite Info' : 'Become a satellite'}
              loading={loading}
              disabled={disabled}
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
