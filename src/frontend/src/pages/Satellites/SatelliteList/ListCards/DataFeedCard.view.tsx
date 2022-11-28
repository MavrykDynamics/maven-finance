import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { CoinsLogo } from 'app/App.components/Icon/CoinsIcons.view'
import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { Trim } from 'app/App.components/Trim/Trim.view'
import { FeedGQL } from 'pages/Satellites/helpers/Satellites.types'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { State } from 'reducers'
import { parseDate } from 'utils/time'

import { SatelliteItemStyle } from './SatelliteCard.style'

export const handleCoinName = (name: string) => {
  const updatedName = name.split('/')?.[1]

  if (!updatedName && name.includes('USD')) {
    return name.slice(3)
  }

  return updatedName
}

export const DataFeedCard = ({ feed }: { feed: FeedGQL }) => {
  const { dipDupTokens } = useSelector((state: State) => state.tokens)
  const imageLink = dipDupTokens.find(({ contract }) => contract === feed.address)?.metadata?.icon

  return (
    <Link to={`/satellites/feed-details/${feed.address}`}>
      <SatelliteItemStyle className="feed">
        <div className="item with-img">
          <CoinsLogo imageLink={imageLink} assetName={handleCoinName(feed.name)} />
          <h5>Feed</h5>
          <var>
            <Trim title={feed.name} />
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
