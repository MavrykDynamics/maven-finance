import { AvatarStyle } from '../../../app/App.components/Avatar/Avatar.style'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { Input } from '../../../app/App.components/Input/Input.controller'

// style
import { CouncilFormStyled } from './CouncilForms.style'

export const CouncilFormAddVestee = () => {
  return (
    <CouncilFormStyled>
      <h1>Add Vestee</h1>
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
            Cliff Period <small>(in months)</small>
          </label>
          <Input type="text" value={''} onChange={() => null} onBlur={() => {}} />
        </div>

        <div>
          <label>
            Vesting Period <small>(in months)</small>
          </label>
          <Input type="text" value={''} onChange={() => null} onBlur={() => {}} />
        </div>
      </div>
    </CouncilFormStyled>
  )
}
