import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { getDate_MDY_Format } from 'pages/FinacialRequests/FinancialRequests.helpers'
import { Feed } from 'pages/Satellites/helpers/Satellites.types'
import { Link } from 'react-router-dom'

import { SatelliteItemStyle } from './SatelliteCard.style'

export const DataFeedCard = ({ feed }: { feed: Feed }) => {
  return (
    <Link to={`/satellites/feed-details/${feed.address}`}>
      <SatelliteItemStyle>
        <div className="item with-img">
          <img
            src={`//logo.chainbit.xyz/${feed.token_1_symbol.toLowerCase()}`}
            alt={`${feed.token_1_symbol.toLowerCase()} logo`}
          />
          <h5>Feed</h5>
          <var>
            {feed.token_1_symbol}/{feed.token_0_symbol}
          </var>
        </div>
        <div className="item">
          <h5>Answer</h5>
          <var>
            <CommaNumber beginningText="$" value={feed.last_completed_round_price} />
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
    </Link>
  )
}
