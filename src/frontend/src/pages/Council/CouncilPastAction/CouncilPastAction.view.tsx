import { Link } from 'react-router-dom'

import Icon from '../../../app/App.components/Icon/Icon.view'

// style
import { CouncilPastActionStyled } from './CouncilPastAction.style'

export const CouncilPastActionView = () => {
  return (
    <CouncilPastActionStyled>
      <div>
        <p>Date</p>
        <h4>Nov 11th, 2022</h4>
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
