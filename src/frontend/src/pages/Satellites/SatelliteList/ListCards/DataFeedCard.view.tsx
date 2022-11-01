import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { CoinsLogo } from 'app/App.components/Icon/CoinsIcons.view'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { FeedGQL } from 'pages/Satellites/helpers/Satellites.types'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { State } from 'reducers'
import { parseDate } from 'utils/time'

import { SatelliteItemStyle } from './SatelliteCard.style'

export const DataFeedCard = ({ feed }: { feed: FeedGQL }) => {
  const { dipDupTokens } = useSelector((state: State) => state.tokens)
  const imageLink = dipDupTokens.find(({ contract }) => contract === feed.address)?.metadata?.icon
  return (
    <Link to={`/satellites/feed-details/${feed.address}`}>
      <SatelliteItemStyle className="feed">
        <div className="item with-img">
          <CoinsLogo imageLink={imageLink} />
          <h5>Feed</h5>
          <var>
            {/* {feed.token_1_symbol}/{feed.token_0_symbol} */}
            <div className="truncate">{feed.name}</div>
          </var>
        </div>
        <div className="item">
          <h5>Answer</h5>
          <var>
            <CommaNumber beginningText="$" value={feed.last_completed_data} />
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
          <var>{parseDate({ time: feed.last_completed_data_last_updated_at, timeFormat: 'MMM DD, YYYY' })}</var>
        </div>
      </SatelliteItemStyle>
    </Link>
  )
}
