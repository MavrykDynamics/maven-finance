import { AvatarStyle } from '../../../app/App.components/Avatar/Avatar.style'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { Input } from '../../../app/App.components/Input/Input.controller'
import { Button } from '../../../app/App.components/Button/Button.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'

// style
import { CouncilFormStyled } from './CouncilForms.style'

export const CouncilFormToggleVesteeLock = () => {
  return (
    <CouncilFormStyled>
      <a className="info-link" href="https://mavryk.finance/litepaper#mavryk-council" target="_blank" rel="noreferrer">
        <Icon id="question" />
      </a>
      <h1 className="form-h1">Toggle Vestee Lock</h1>
      <p>Please enter valid function parameters for adding a vestee</p>
      <div className="form-grid" style={{ paddingBottom: '4px' }}>
        <div>
          <label>Vestee Address</label>
          <Input type="text" value={''} onChange={() => null} onBlur={() => {}} />
        </div>
        <div className="button-aligment">
          <Button
            text="Toggle Vestee Lock"
            className="plus-btn"
            kind={'actionPrimary'}
            icon="lock"
            onClick={() => null}
          />
        </div>
      </div>
    </CouncilFormStyled>
  )
}
