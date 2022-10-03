import { useState } from 'react'
import { useDispatch } from 'react-redux'

// view
import Icon from '../../app/App.components/Icon/Icon.view'
import { Input } from '../../app/App.components/Input/Input.controller'
import { Button } from '../../app/App.components/Button/Button.controller'
import TableGridFix from '../../app/App.components/TableGrid/TableGridFix.view'

// type
import type { InputStatusType } from '../../app/App.components/Input/Input.constants'
import type { TableListType } from '../../app/App.components/TableGrid/TableGrid.types'
import { SatelliteGovernanceTransfer } from '../../utils/TypesAndInterfaces/Delegation'

// actions
import { registerAggregator } from './SatelliteGovernance.actions'

// style
import { AvailableActionsStyle } from './SatelliteGovernance.style'

export const RegisterAggregatorForm = () => {
  const dispatch = useDispatch()

  const [form, setForm] = useState({
    aggregatorPair: '',
    aggregatorAddress: '',
  })
  const [formInputStatus, setFormInputStatus] = useState<Record<string, InputStatusType>>({
    aggregatorPair: '',
    aggregatorAddress: '',
  })

  const { aggregatorPair, aggregatorAddress } = form

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      dispatch(registerAggregator(aggregatorPair, aggregatorAddress))
      setForm({
        aggregatorPair: '',
        aggregatorAddress: '',
      })
      setFormInputStatus({
        aggregatorPair: '',
        aggregatorAddress: '',
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

  const handleBlur = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormInputStatus((prev) => {
      return { ...prev, [e.target.name]: e.target.value ? 'success' : 'error' }
    })
  }

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
          <h1>Register Aggregator</h1>
          <p>Please enter a valid tz1 address of the satellite to take action on</p>
          <fieldset>
            <div className="satellite-address">
              <label>Aggregator Pair</label>
              <Input
                value={aggregatorPair}
                name="aggregatorPair"
                required
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handleChange(e)
                  handleBlur(e)
                }}
                onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e)}
                inputStatus={formInputStatus.aggregatorPair}
              />
            </div>
            <div className="satellite-address">
              <label>Aggregator Address</label>
              <Input
                value={aggregatorAddress}
                name="aggregatorAddress"
                required
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handleChange(e)
                  handleBlur(e)
                }}
                onBlur={(e: React.ChangeEvent<HTMLInputElement>) => handleBlur(e)}
                inputStatus={formInputStatus.aggregatorAddress}
              />
            </div>
          </fieldset>
        </div>

        <div className="suspend-satellite-group">
          <Button
            // className={variant}
            icon="plus"
            kind="actionPrimary"
            text={'Register Aggregator'}
            type="submit"
          />
        </div>
      </form>
    </AvailableActionsStyle>
  )
}
