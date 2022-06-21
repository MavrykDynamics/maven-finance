// components
import { Button } from '../../../app/App.components/Button/Button.controller'

// style
import { CouncilPendingStyled, CouncilPendingReviewStyled } from './CouncilPending.style'

export const CouncilPendingReviewView = () => {
  return (
    <CouncilPendingReviewStyled>
      <div className="review-text">
        <p>Review Past Council Actions</p>
      </div>
      <Button text="Review" className="review-btn" kind={'actionSecondary'} onClick={() => null} />
    </CouncilPendingReviewStyled>
  )
}
