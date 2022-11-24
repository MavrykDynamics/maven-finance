// view
import Icon from '../../../app/App.components/Icon/Icon.view'

// helpers
import { parseDate } from 'utils/time'
import { getSeparateCamelCase } from '../../../utils/parse'

// style
import { CouncilPastActionStyled } from './CouncilPastAction.style'

type Props = {
  executionDatetime: string
  actionType: string
  signersCount: number
  numCouncilMembers: number
  councilId: string
}

export const CouncilPastActionView = (props: Props) => {
  const { executionDatetime, actionType, signersCount, numCouncilMembers, councilId } = props
  const isMoreThanHalf = numCouncilMembers / 2 < signersCount

  return (
    <CouncilPastActionStyled>
      <div>
        <p>Date</p>
        <h4>{parseDate({ time: executionDatetime, timeFormat: 'MMM Do, YYYY' })}</h4>
      </div>
      <div>
        <p>Purpose</p>
        <h4>{getSeparateCamelCase(actionType)}</h4>
      </div>
      <div>
        <p>Multisig Approval</p>
        <h4 className={`${isMoreThanHalf ? 'is-green' : 'is-red'}`}>
          {signersCount}/{numCouncilMembers}
        </h4>
      </div>
      <figure>
        <a
          className="icon-send"
          target="_blank"
          href={`https://${
            process.env.NODE_ENV === 'development' ? process.env.REACT_APP_NETWORK + '.' : ''
          }tzkt.io/${councilId}/operations/`}
          rel="noreferrer"
        >
          <Icon id="send" />
        </a>
      </figure>
    </CouncilPastActionStyled>
  )
}
