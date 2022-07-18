import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { Feed } from 'pages/Satellites/helpers/Satellites.types'
import { SatelliteItemStyle } from './SatelliteCard.style'
import { getDate_MDY_Format } from 'pages/FinacialRequests/FinancialRequests.helpers'

export const DataFeedCard = ({ feed }: { feed: Feed }) => {
  return (
    <SatelliteItemStyle>
      <div className="item">
        <h5>Feed</h5>
        <var>
          {feed.token_1_symbol}/{feed.token_0_symbol}
        </var>
      </div>
      <div className="item">
        <h5>Answer</h5>
        <var>$ {feed.reward_amount_smvk / 0.25}</var>
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
