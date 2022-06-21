// components
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { Button } from '../../../app/App.components/Button/Button.controller'

// style
import { CouncilPendingStyled } from './CouncilPending.style'

export const CouncilPendingView = () => {
  return (
    <CouncilPendingStyled>
      <h3>Add Vestee</h3>
      <div className="parameters">
        <p>Parameters</p>
        <p>Signed</p>
        <TzAddress tzAddress={'tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD'} hasIcon={false} />
        <div>3/8</div>
      </div>
      <Button text="Sign" className="sign-btn" kind={'actionPrimary'} icon="sign" onClick={() => null} />
    </CouncilPendingStyled>
  )
}
