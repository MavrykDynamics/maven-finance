// view
import Icon from '../../app/App.components/Icon/Icon.view'
import { Input } from '../../app/App.components/Input/Input.controller'
import { TextArea } from '../../app/App.components/TextArea/TextArea.controller'
import { Button } from '../../app/App.components/Button/Button.controller'

// style
import { AvailableActionsStyle } from './SatelliteGovernance.style'

type Props = {
  variant: string
}

export const SatelliteGovernanceForm = ({ variant }: Props) => {
  console.log('%c ||||| variant', 'color:yellowgreen', variant)

  if (!variant) return null

  return (
    <AvailableActionsStyle>
      <div className="inputs-block">
        <a
          className="info-link"
          href="https://mavryk.finance/litepaper#satellites-governance-and-the-decentralized-oracle"
          target="_blank"
          rel="noreferrer"
        >
          <Icon id="question" />
        </a>
        <div>
          <h1>Suspend Satellite</h1>
          <p>Please enter a valid tz1 adress of the satellite to take action on</p>
          <div className="satellite-address">
            <label>Satellite Address</label>
            <Input value="" onChange={() => null} onBlur={() => null} inputStatus="" />
          </div>
          <div>
            <label>Purpose</label>
            <TextArea value="" onChange={() => null} onBlur={() => null} inputStatus="" />
          </div>
        </div>
        <div className="suspend-satellite-group">
          <Button icon="minus" kind="actionPrimary" text="Suspend Satellite" onClick={() => null} />
        </div>
      </div>
    </AvailableActionsStyle>
  )
}
