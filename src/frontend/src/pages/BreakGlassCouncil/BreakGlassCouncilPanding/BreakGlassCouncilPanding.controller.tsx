import { useDispatch } from 'react-redux'

// components
import { Button } from '../../../app/App.components/Button/Button.controller'

// types
import { BreakGlassAction } from 'utils/TypesAndInterfaces/BreakGlass'

// helpers
import { ACTION_PRIMARY, SUBMIT } from '../../../app/App.components/Button/Button.constants'
import { getSeparateCamelCase } from '../../../utils/parse'
import { getShortTzAddress } from '../../../utils/tzAdress'

// actions
import { signAction } from '../BreakGlassCouncil.actions'

// style
import { BreakGlassCouncilPendingStyled } from './BreakGlassCouncilPanding.style'

type Props = BreakGlassAction[0] & {
  numCouncilMembers: number
  councilPendingActionsLength: number
}

export const BreakGlassCouncilPanding = (props: Props) => {
  const dispatch = useDispatch()

  const { id, actionType, signersCount, initiatorId, numCouncilMembers, councilPendingActionsLength } = props

  const handleSign = () => {
    if (id) {
      dispatch(signAction(id))
    }
  }

  return (
    <BreakGlassCouncilPendingStyled className={`${actionType} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
      <h3>{getSeparateCamelCase(actionType)}</h3>
      <div className="parameters">
        <div>
          <p>Address</p>
          <span className="parameters-value">{getShortTzAddress(initiatorId)}</span>
        </div>

        <div>
          <p>Signed</p>
          <span className="parameters-value">
            {signersCount}/{numCouncilMembers}
          </span>
        </div>
      </div>
      <Button text="Sign" className="sign-btn" kind={ACTION_PRIMARY} icon="sign" onClick={handleSign} />
    </BreakGlassCouncilPendingStyled>
  )
}
