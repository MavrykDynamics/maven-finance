import { useDispatch, useSelector } from 'react-redux'

// components
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { Button } from '../../../app/App.components/Button/Button.controller'

// helpers
import { getSeparateCamelCase } from '../../../utils/parse'

// actions
import { sign } from '../Council.actions'

// style
import { CouncilPendingStyled } from './CouncilPending.style'

type Props = {
  executed_datetime: string
  action_type: string
  initiator_id: string
  signers_count: number
  num_council_members: number
  id: number
}

export const CouncilPendingView = (props: Props) => {
  const dispatch = useDispatch()
  const { executed_datetime, action_type, signers_count, num_council_members, initiator_id, id } = props

  const handleSign = () => {
    if (id) {
      dispatch(sign(id))
    }
  }

  return (
    <CouncilPendingStyled>
      <h3>{getSeparateCamelCase(action_type)}</h3>
      <div className="parameters">
        <p>Parameters</p>
        <p>Signed</p>
        <TzAddress tzAddress={initiator_id} hasIcon={false} />
        <div>
          {signers_count}/{num_council_members}
        </div>
      </div>
      <Button text="Sign" className="sign-btn" kind={'actionPrimary'} icon="sign" onClick={handleSign} />
    </CouncilPendingStyled>
  )
}
