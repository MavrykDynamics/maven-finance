import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { CoinsLogo } from 'app/App.components/Icon/CoinsIcons.view'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { getDate_MDY_Format } from 'pages/FinacialRequests/FinancialRequests.helpers'
import { FeedGQL } from 'pages/Satellites/helpers/Satellites.types'
import { Link } from 'react-router-dom'

import { SatelliteItemStyle } from './SatelliteCard.style'

export const DataFeedCard = ({ feed }: { feed: FeedGQL }) => {
  return (
    <Link to={`/satellites/feed-details/${feed.address}`}>
      <SatelliteItemStyle className="feed">
        <div className="item with-img">
          <CoinsLogo assetName={feed.token_1_symbol} />
          <h5>Feed</h5>
          <var>
            {feed.token_1_symbol}/{feed.token_0_symbol}
          </var>
        </div>
        <div className="item">
          <h5>Answer</h5>
          <var>
            <CommaNumber beginningText="$" value={feed.last_completed_price} />
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
          <var>{getDate_MDY_Format(feed.last_completed_price_datetime)}</var>
        </div>
      </SatelliteItemStyle>
    </Link>
  )
}
