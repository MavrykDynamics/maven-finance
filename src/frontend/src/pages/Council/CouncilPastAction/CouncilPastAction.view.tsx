/* @ts-ignore */
import Time from 'react-pure-time'
import { Link } from 'react-router-dom'

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
}

export const CouncilPastActionView = (props: Props) => {
  const { executed_datetime, action_type, signers_count, num_council_members } = props
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
        <p>Approved / vetoed</p>
        <h4>
          {signers_count}/{num_council_members}
        </h4>
      </div>
      <figure>
        <a target="_blank" href="https://tzkt.io/" rel="noreferrer">
          <Icon id="send" />
        </a>
      </figure>
    </CouncilPastActionStyled>
  )
}
