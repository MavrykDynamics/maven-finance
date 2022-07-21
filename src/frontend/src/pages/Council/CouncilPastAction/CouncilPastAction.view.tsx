/* @ts-ignore */
import Time from 'react-pure-time'

// view
import Icon from '../../../app/App.components/Icon/Icon.view'

// helpers
import { getSeparateCamelCase } from '../../../utils/parse'

// style
import { CouncilPastActionStyled } from './CouncilPastAction.style'

type Props = {
  executed_datetime: string
  action_type: string
  signers_count: number
  num_council_members: number
  council_id: string
}

export const CouncilPastActionView = (props: Props) => {
  const { executed_datetime, action_type, signers_count, num_council_members, council_id } = props
  return (
    <CouncilPastActionStyled>
      <div>
        <p>Date</p>
        <h4>
          <Time value={executed_datetime} format="M d\t\h, Y" />
        </h4>
      </div>
      <div>
        <p>Purpose</p>
        <h4>{getSeparateCamelCase(action_type)}</h4>
      </div>
      <div>
        <p>Multi-sig Approval</p>
        <h4>
          {signers_count}/{num_council_members}
        </h4>
      </div>
      <figure>
        <a
          target="_blank"
          href={`https://${
            process.env.NODE_ENV === 'development' ? process.env.REACT_APP_NETWORK + '.' : ''
          }tzkt.io/${council_id}/operations/`}
          rel="noreferrer"
        >
          <Icon id="send" />
        </a>
      </figure>
    </CouncilPastActionStyled>
  )
}
