// components
import { Button } from '../../../app/App.components/Button/Button.controller'

// style
import { CouncilPendingStyled, CouncilPendingReviewStyled } from './CouncilPending.style'

type Props = {
  onClick: () => void
}

export const CouncilPendingReviewView = ({ onClick }: Props) => {
  return (
    <CouncilPendingReviewStyled>
      <div className="review-text">
        <p>Review Past Council Actions</p>
      </div>
      <Button text="Review" className="review-btn" kind={'actionSecondary'} onClick={onClick} />
    </CouncilPendingReviewStyled>
  )
}
