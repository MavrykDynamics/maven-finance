import { useDispatch, useSelector } from 'react-redux'

// components
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { Button } from '../../../app/App.components/Button/Button.controller'
import { CommaNumber } from '../../../app/App.components/CommaNumber/CommaNumber.controller'

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
  councilPendingActionsLength: number
  council_action_record_parameters: Record<string, string>[]
}

export const CouncilPendingView = (props: Props) => {
  const dispatch = useDispatch()
  const {
    executed_datetime,
    action_type,
    signers_count,
    num_council_members,
    initiator_id,
    id,
    councilPendingActionsLength,
    council_action_record_parameters,
  } = props

  const handleSign = () => {
    if (id) {
      dispatch(sign(id))
    }
  }

  console.log('%c ||||| council_action_record_parameters', 'color:yellowgreen', council_action_record_parameters)

  const isaddVestee = action_type === 'addVestee'
  const vesteeAddress = council_action_record_parameters.find((item) => item.name === 'vesteeAddress')?.value || ''
  const cliffInMonths = council_action_record_parameters.find((item) => item.name === 'cliffInMonths')?.value || ''
  const vestingInMonths = council_action_record_parameters.find((item) => item.name === 'vestingInMonths')?.value || ''
  const totalAllocatedAmount =
    council_action_record_parameters.find((item) => item.name === 'totalAllocatedAmount')?.value || ''

  if (isaddVestee) {
    return (
      <CouncilPendingStyled className={`${action_type} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
        <h3>{getSeparateCamelCase(action_type)}</h3>
        <div className="parameters">
          <article>
            <p>Adress</p>
            <span className="parameters-value">
              <TzAddress tzAddress={vesteeAddress || initiator_id} hasIcon={false} />
            </span>
          </article>
          {totalAllocatedAmount ? (
            <article>
              <p>Total Allocated Amount</p>
              <span className="parameters-value">
                <CommaNumber value={+totalAllocatedAmount} loading={false} endingText={'MVK'} />
              </span>
            </article>
          ) : null}
          <article>
            <p>Signed</p>
            <span className="parameters-value">
              {signers_count}/{num_council_members}
            </span>
          </article>
        </div>

        <div className="parameters">
          {cliffInMonths ? (
            <article>
              <p>Cliff Period</p>
              <span className="parameters-value">{cliffInMonths} months</span>
            </article>
          ) : null}
          {vestingInMonths ? (
            <article>
              <p>Vesting Period</p>
              <span className="parameters-value">{vestingInMonths} months</span>
            </article>
          ) : null}

          <Button text="Sign" className="sign-btn" kind={'actionPrimary'} icon="sign" onClick={handleSign} />
        </div>
      </CouncilPendingStyled>
    )
  }

  return (
    <CouncilPendingStyled className={`${action_type} ${councilPendingActionsLength > 1 ? 'more' : ''}`}>
      <h3>{getSeparateCamelCase(action_type)}</h3>
      <div className="parameters">
        <div>
          <p>Adress</p>
          <span className="parameters-value">
            <TzAddress tzAddress={initiator_id} hasIcon={false} />
          </span>
        </div>
        <div>
          <p>Signed</p>
          <span className="parameters-value">
            {signers_count}/{num_council_members}
          </span>
        </div>
      </div>
      <Button text="Sign" className="sign-btn" kind={'actionPrimary'} icon="sign" onClick={handleSign} />
    </CouncilPendingStyled>
  )
}
