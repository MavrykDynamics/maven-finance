// components
import { Button } from '../../../app/App.components/Button/Button.controller'

// style
import { CouncilPendingReviewStyled } from './CouncilPending.style'

// types
import { QueryParameters } from '../Council.controller'

type Props = {
  onClick: (arg: string) => void
  queryParameters: QueryParameters
}

export const CouncilPendingReviewView = ({ onClick, queryParameters }: Props) => {
  return (
    <CouncilPendingReviewStyled>
      <Button
        text="Review Past Actions"
        className="review-btn"
        kind={'actionSecondary'}
        onClick={() => onClick(queryParameters.review)}
      />

      <Button
        text="Review Pending Actions"
        className="review-btn"
        kind={'actionSecondary'}
        onClick={() => onClick(queryParameters.pendingReview)}
      />
    </CouncilPendingReviewStyled>
  )
}
