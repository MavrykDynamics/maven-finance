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

const FORM_DATA = new Map<string, Record<string, string>>([
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
  console.log('%c ||||| variant', 'color:yellowgreen', variant)

  const content = FORM_DATA.get(variant)

  console.log('%c ||||| content', 'color:yellowgreen', content)

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
          <h1>{content?.title}</h1>
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
          <Button
            className={variant}
            icon={content?.btnIcon || ''}
            kind="actionPrimary"
            text={content?.btnText || ''}
            onClick={() => null}
          />
        </div>
      </div>
    </AvailableActionsStyle>
  )
}
