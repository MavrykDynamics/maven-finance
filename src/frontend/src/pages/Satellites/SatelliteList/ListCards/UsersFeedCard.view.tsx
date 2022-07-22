import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { Feed } from 'pages/Satellites/helpers/Satellites.types'
import { SatelliteItemStyle } from './SatelliteCard.style'
import { getDate_MDY_Format } from 'pages/FinacialRequests/FinancialRequests.helpers'
import { useHistory } from 'react-router'
// TODO: category, network
export const UserDataFeedCard = ({ feed }: { feed: Feed }) => {
  const history = useHistory()
  return (
    <SatelliteItemStyle onClick={() => history.push(`/feed-details/${feed.address}/`)} className="userFeed">
      <div className="item">
        <h5>Feed</h5>
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
        <h5>Network</h5>
        <var>network</var>
      </div>

      <div className="item">
        <h5>Category</h5>
        <var>Cryptocurrency(USD pairs)</var>
      </div>

      <div className="item">
        <h5>Date</h5>
        <var>{getDate_MDY_Format(feed.creation_timestamp)}</var>
      </div>
    </SatelliteItemStyle>
  )
}
