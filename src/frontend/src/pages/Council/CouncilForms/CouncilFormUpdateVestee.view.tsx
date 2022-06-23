import { AvatarStyle } from '../../../app/App.components/Avatar/Avatar.style'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { Input } from '../../../app/App.components/Input/Input.controller'
import { Button } from '../../../app/App.components/Button/Button.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'

// style
import { CouncilFormStyled } from './CouncilForms.style'

export const CouncilFormUpdateVestee = () => {
  return (
    <CouncilFormStyled>
      <a className="info-link" href="https://mavryk.finance/litepaper#mavryk-council" target="_blank" rel="noreferrer">
        <Icon id="question" />
      </a>
      <h1 className="form-h1">Update Vestee</h1>
      <p>Please enter valid function parameters for adding a vestee</p>
      <div className="form-grid">
        <div>
          <label>Vestee Address</label>
          <Input type="text" value={''} onChange={() => null} onBlur={() => {}} />
        </div>

        <div>
          <label>Total Allocated Amount</label>
          <Input type="text" value={''} onChange={() => null} onBlur={() => {}} />
        </div>

        <div>
          <label>
            New Cliff Period <small>(in months)</small>
          </label>
          <Input type="text" value={''} onChange={() => null} onBlur={() => {}} />
        </div>

        <div>
          <label>
            New Vesting Period <small>(in months)</small>
          </label>
          <Input type="text" value={''} onChange={() => null} onBlur={() => {}} />
        </div>
      </div>
      <div className="btn-group">
        <Button
          text="Update Vestee"
          className="plus-btn fill"
          kind={'actionPrimary'}
          icon="upload"
          onClick={() => null}
        />
      </div>
    </CouncilFormStyled>
  )
}
