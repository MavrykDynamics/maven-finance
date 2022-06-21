// components
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'

// style
import { CouncilPendingStyled } from './CouncilPending.style'

export const CouncilPendingView = () => {
  return (
    <CouncilPendingStyled>
      <h3>Add Vestee</h3>
      <div>
        <p>Parameters</p>
        <p>Signed</p>
      </div>
      <div>
        <TzAddress tzAddress={'tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD'} hasIcon={false} />
        <p>3/8</p>
      </div>
    </CouncilPendingStyled>
  )
}
