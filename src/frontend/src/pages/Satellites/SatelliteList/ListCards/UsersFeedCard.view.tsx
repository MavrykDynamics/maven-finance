import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { FeedGQL } from 'pages/Satellites/helpers/Satellites.types'
import { Link } from 'react-router-dom'
import { parseDate } from 'utils/time'

import { SatelliteItemStyle } from './SatelliteCard.style'

export const UserDataFeedCard = ({ feed }: { feed: FeedGQL }) => {
  return (
    <Link to={`/satellites/feed-details/${feed.address}`}>
      <SatelliteItemStyle className="userFeed">
        <div className="item">
          <h5>FeedGQL</h5>
          <var>{feed.name}</var>
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
          <var>{parseDate({ time: feed.last_completed_data_last_updated_at, timeFormat: 'MMM DD, YYYY' })}</var>
        </div>
      </SatelliteItemStyle>
    </Link>
  )
}
