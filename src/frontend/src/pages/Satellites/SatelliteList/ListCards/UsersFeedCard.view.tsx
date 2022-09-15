import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { getDate_MDY_Format } from 'pages/FinacialRequests/FinancialRequests.helpers'
import { FeedGQL } from 'pages/Satellites/helpers/Satellites.types'
import { Link } from 'react-router-dom'

import { SatelliteItemStyle } from './SatelliteCard.style'

export const UserDataFeedCard = ({ feed }: { feed: FeedGQL }) => {
  return (
    <Link to={`/satellites/feed-details/${feed.address}`}>
      <SatelliteItemStyle className="userFeed">
        <div className="item">
          <h5>FeedGQL</h5>
          <var>
            {feed.token_1_symbol}/{feed.token_0_symbol}
          </var>
        </div>

        <div className="item">
          <h5>Contact address</h5>
          <var>
            <TzAddress tzAddress={feed.address} hasIcon={false} />
          </var>
        </div>

        <div className="item">
          <h5>Network (fix)</h5>
          <var>{'network'}</var>
        </div>

        <div className="item">
          <h5>Category (fix)</h5>
          <var>{'category'}</var>
        </div>

        <div className="item">
          <h5>Date</h5>
          <var>{getDate_MDY_Format(feed.last_completed_price_datetime || Date.now().toLocaleString())}</var>
        </div>
      </SatelliteItemStyle>
    </Link>
  )
}
