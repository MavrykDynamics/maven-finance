import { useState } from 'react'
import { useDispatch } from 'react-redux'

// view
import Icon from '../../app/App.components/Icon/Icon.view'
import { Input } from '../../app/App.components/Input/Input.controller'
import { TextArea } from '../../app/App.components/TextArea/TextArea.controller'
import { Button } from '../../app/App.components/Button/Button.controller'

// type
import type { InputStatusType } from '../../app/App.components/Input/Input.controller'

// actions
import { suspendSatellite, unsuspendSatellite, banSatellite } from './SatelliteGovernance.actions'

// style
import { AvailableActionsStyle } from './SatelliteGovernance.style'

type Props = {
  variant: string
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
])

export const SatelliteGovernanceForm = ({ variant }: Props) => {
  const dispatch = useDispatch()
  const [form, setForm] = useState({
    satelliteAddress: '',
    purpose: '',
  })
  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    satelliteAddress: '',
    purpose: '',
  })

  console.log('%c ||||| variant', 'color:yellowgreen', variant)

  const { satelliteAddress, purpose } = form

  const content = CONTENT_FORM.get(variant)

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    try {
      if (variant === 'suspendSatellite') await dispatch(suspendSatellite(satelliteAddress, purpose))
      if (variant === 'unsuspendSatellite') await dispatch(unsuspendSatellite(satelliteAddress, purpose))
      if (variant === 'banSatellite') await dispatch(banSatellite(satelliteAddress, purpose))
      setForm({
        satelliteAddress: '',
        purpose: '',
      })
      setFormInputStatus({
        satelliteAddress: '',
        purpose: '',
      })
    } catch (error) {
      console.error(error)
    }
  }

  const handleChange = (e: any) => {
    setForm((prev) => {
      return { ...prev, [e.target.name]: e.target.value }
    })
  }

  const handleBlur = (e: any) => {
    setFormInputStatus((prev) => {
      return { ...prev, [e.target.name]: e.target.value ? 'success' : 'error' }
    })
  }

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
          <p>Please enter a valid tz1 adress of the satellite to take action on</p>
          <div className="satellite-address">
            <label>Satellite Address</label>
            <Input
              value={satelliteAddress}
              name="satelliteAddress"
              required
              onChange={(e) => {
                handleChange(e)
                handleBlur(e)
              }}
              onBlur={(e) => handleBlur(e)}
              inputStatus={formInputStatus.satelliteAddress}
            />
          </div>
          <div>
            <label>Purpose</label>
            <TextArea
              value={purpose}
              name="purpose"
              required
              onChange={(e) => {
                handleChange(e)
                handleBlur(e)
              }}
              onBlur={(e) => handleBlur(e)}
              inputStatus={formInputStatus.purpose}
            />
          </div>
        </div>
        <div className="suspend-satellite-group">
          <Button
            className={variant}
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
