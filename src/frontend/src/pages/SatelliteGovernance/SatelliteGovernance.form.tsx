import { useState } from 'react'
import { useDispatch } from 'react-redux'

// view
import Icon from '../../app/App.components/Icon/Icon.view'
import { Input } from '../../app/App.components/Input/Input.controller'
import { TextArea } from '../../app/App.components/TextArea/TextArea.controller'
import { Button } from '../../app/App.components/Button/Button.controller'

// type
import type { InputStatusType } from '../../app/App.components/Input/Input.constants'

// actions
import {
  suspendSatellite,
  unsuspendSatellite,
  banSatellite,
  unbanSatellite,
  removeOracles,
  removeOracleInAggregator,
  addOracleToAggregator,
  restoreSatellite,
  setAggregatorMaintainer,
  updateAggregatorStatus,
} from './SatelliteGovernance.actions'

// style
import { AvailableActionsStyle } from './SatelliteGovernance.style'

// helpers
import { validateFormField } from 'utils/validatorFunctions' 

type Props = {
  variant: string
  maxLength: {[k:string]: number }
}

const CONTENT_FORM = new Map<string, Record<string, string>>([
  [
    'suspendSatellite',
    {
      title: 'Suspend Satellite',
      btnText: 'Suspend Satellite',
      btnIcon: 'minus',
    },
  ],
  [
    'unsuspendSatellite',
    {
      title: 'Unsuspend Satellite',
      btnText: 'Unsuspend Satellite',
      btnIcon: 'plus',
    },
  ],
  [
    'banSatellite',
    {
      title: 'Ban Satellite',
      btnText: 'Ban Satellite',
      btnIcon: 'close-stroke',
    },
  ],
  [
    'unbanSatellite',
    {
      title: 'Unban Satellite',
      btnText: 'Unban Satellite',
      btnIcon: 'plus',
    },
  ],
  [
    'removeOracles',
    {
      title: 'Remove all Oracles from Satellite',
      btnText: 'Remove Oracles',
      btnIcon: 'close-stroke',
    },
  ],
  [
    'removeFromAggregator',
    {
      title: 'Remove from Aggregator',
      btnText: 'Remove from Aggregator',
      btnIcon: 'close-stroke',
    },
  ],
  [
    'addToAggregator',
    {
      title: 'Add Oracle to Aggregator',
      btnText: 'Add to Aggregator',
      btnIcon: 'plus',
    },
  ],
  [
    'restoreSatellite',
    {
      title: 'Restore Satellite',
      btnText: 'Restore Satellite',
      btnIcon: 'plus',
    },
  ],
  [
    'setAggregatorMaintainer',
    {
      title: 'Set Aggregator Maintainer',
      btnText: 'Set Aggregator Maintainer',
      btnIcon: 'plus',
    },
  ],
  [
    'updateAggregatorStatus',
    {
      title: 'Update Aggregator Status',
      btnText: 'Update Aggregator Status',
      btnIcon: 'plus',
    },
  ],
])

export const SatelliteGovernanceForm = ({ variant, maxLength }: Props) => {
  const dispatch = useDispatch()
  const [form, setForm] = useState({
    oracleAddress: '',
    satelliteAddress: '',
    purpose: '',
  })
  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    oracleAddress: '',
    satelliteAddress: '',
    purpose: '',
  })

  const { oracleAddress, satelliteAddress, purpose } = form

  const content = CONTENT_FORM.get(variant)

  const isFieldOracleAddress =
    variant === 'removeFromAggregator' ||
    variant === 'addToAggregator' ||
    variant === 'setAggregatorMaintainer' ||
    variant === 'updateAggregatorStatus'

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      if (variant === 'suspendSatellite') await dispatch(suspendSatellite(satelliteAddress, purpose))
      if (variant === 'unsuspendSatellite') await dispatch(unsuspendSatellite(satelliteAddress, purpose))
      if (variant === 'banSatellite') await dispatch(banSatellite(satelliteAddress, purpose))
      if (variant === 'unbanSatellite') await dispatch(unbanSatellite(satelliteAddress, purpose))
      if (variant === 'removeOracles') await dispatch(removeOracles(satelliteAddress, purpose))
      if (variant === 'restoreSatellite') await dispatch(restoreSatellite(satelliteAddress, purpose))
      if (variant === 'removeFromAggregator')
        await dispatch(removeOracleInAggregator(oracleAddress, satelliteAddress, purpose))
      if (variant === 'addToAggregator') await dispatch(addOracleToAggregator(oracleAddress, satelliteAddress, purpose))
      if (variant === 'restoreSatellite')
        await dispatch(addOracleToAggregator(oracleAddress, satelliteAddress, purpose))
      if (variant === 'setAggregatorMaintainer')
        await dispatch(setAggregatorMaintainer(oracleAddress, satelliteAddress, purpose))
      if (variant === 'updateAggregatorStatus')
        await dispatch(updateAggregatorStatus(oracleAddress, satelliteAddress, purpose))
      setForm({
        oracleAddress: '',
        satelliteAddress: '',
        purpose: '',
      })
      setFormInputStatus({
        oracleAddress: '',
        satelliteAddress: '',
        purpose: '',
      })
    } catch (error) {
      console.error(error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const handleBlur = validateFormField(setFormInputStatus)

  if (!variant) return null

  return (
    <AvailableActionsStyle>
      <form onSubmit={handleSubmit} className="inputs-block">
        <a
          className="info-link"
          href="https://mavryk.finance/litepaper#satellites-governance-and-the-decentralized-oracle"
          target="_blank"
          rel="noreferrer"
        >
          <Icon id="question" />
        </a>
        <div>
          <h1>{content?.title}</h1>
          <p>Please enter a valid tz1 address of the satellite to take action on</p>
          <fieldset>
            <div className="satellite-address">
              <label>
                {variant === 'setAggregatorMaintainer'
                  ? 'Maintainer Address'
                  : variant === 'updateAggregatorStatus'
                  ? 'Status'
                  : 'Satellite Address'}
              </label>
              <Input
                value={satelliteAddress}
                name="satelliteAddress"
                required
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handleChange(e)
                  handleBlur(e)
                }}
                onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e)}
                inputStatus={formInputStatus.satelliteAddress}
              />
            </div>
            {isFieldOracleAddress ? (
              <div className="satellite-address">
                <label>
                  {variant === 'setAggregatorMaintainer' || variant === 'updateAggregatorStatus'
                    ? 'Aggregator Address'
                    : 'Oracle Address'}
                </label>
                <Input
                  value={oracleAddress}
                  name="oracleAddress"
                  required
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    handleChange(e)
                    handleBlur(e)
                  }}
                  onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e)}
                  inputStatus={formInputStatus.oracleAddress}
                />
              </div>
            ) : (
              <div />
            )}
          </fieldset>
          <div>
            <label>Purpose</label>
            <TextArea
              value={purpose}
              name="purpose"
              required
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                handleChange(e)
                handleBlur(e, maxLength.purposeMaxLength)
              }}
              onBlur={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleBlur(e, maxLength.purposeMaxLength)}
              inputStatus={formInputStatus.purpose}
            />
          </div>
        </div>
        <div className="suspend-satellite-group">
          <Button
            className={`${variant} fill`}
            icon={content?.btnIcon || ''}
            kind="actionPrimary"
            text={content?.btnText || ''}
            type="submit"
          />
        </div>
      </form>
    </AvailableActionsStyle>
  )
}
