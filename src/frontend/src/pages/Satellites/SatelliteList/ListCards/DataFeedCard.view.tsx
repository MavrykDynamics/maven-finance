import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { Feed } from 'pages/Satellites/helpers/Satellites.types'
import { SatelliteItemStyle } from './SatelliteCard.style'
import { getDate_MDY_Format } from 'pages/FinacialRequests/FinancialRequests.helpers'
import { useHistory } from 'react-router'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { InputErrorMessage } from 'app/App.components/Input/Input.style'
// TODO: Answer
export const DataFeedCard = ({ feed }: { feed: Feed }) => {
  const history = useHistory()
  const isTrustedAnswer = feed.last_completed_round_pct_oracle_response >= feed.percent_oracle_threshold

  return (
    <SatelliteItemStyle onClick={() => history.push(`/feed-details/${feed.address}/`)}>
      <div className="item">
        <h5>Feed</h5>
        <var>
          {feed.token_1_symbol}/{feed.token_0_symbol}
        </var>
      </div>
      <div className="item">
        <h5>Answer</h5>
        <var>
          {isTrustedAnswer ? (
            <CommaNumber beginningText="$" value={feed.last_completed_round_price} />
          ) : (
            <>
              <CommaNumber beginningText="$" value={feed.last_completed_round_price} />

              <InputErrorMessage>(Not Trusted)</InputErrorMessage>
            </>
          )}
        </var>
      </div>
      <div className="item">
        <h5>Contact address</h5>
        <var>
          <TzAddress tzAddress={feed.address} hasIcon={false} />
        </var>
      </div>
      <div className="item">
        <h5>Date</h5>
        <var>{getDate_MDY_Format(feed.creation_timestamp)}</var>
      </div>
    </SatelliteItemStyle>
  )
}
