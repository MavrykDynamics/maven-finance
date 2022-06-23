/* @ts-ignore */
import Time from 'react-pure-time'
import { Link } from 'react-router-dom'

import Icon from '../../../app/App.components/Icon/Icon.view'

// style
import { CouncilPastActionStyled } from './CouncilPastAction.style'

type Props = {
  executed_datetime: string
}

export const CouncilPastActionView = (props: Props) => {
  const { executed_datetime } = props
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
        <h4>Change Council Member</h4>
      </div>
      <div>
        <p>Approved / vetoed</p>
        <h4>5/9</h4>
      </div>
      <figure>
        <Link to="/">
          <Icon id="send" />
        </Link>
      </figure>
    </CouncilPastActionStyled>
  )
}
