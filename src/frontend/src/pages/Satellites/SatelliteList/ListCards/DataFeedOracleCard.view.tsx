import { TzAddress } from 'app/App.components/TzAddress/TzAddress.view'
import { DataFeedSubTitleText } from 'pages/DataFeeds/details/DataFeedsDetails.style'
import { getDate_MDY_Format } from 'pages/FinacialRequests/FinancialRequests.helpers'
import { getOracleStatus, ORACLE_STATUSES_MAPPER } from 'pages/Satellites/helpers/Satellites.consts'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { State } from 'reducers'
import { SatelliteRecord } from 'utils/TypesAndInterfaces/Delegation'

import { SatelliteItemStyle, SatelliteOracleStatusComponent } from './SatelliteCard.style'

// TODO: date and answer
export const OracleCard = ({ oracle }: { oracle: SatelliteRecord }) => {
  const { feeds } = useSelector((state: State) => state.oracles.oraclesStorage)
  const oracleStatusType = getOracleStatus(oracle, feeds)

  return (
    <Link to={`/satellites/satellite-details/${oracle.address}`}>
      <SatelliteItemStyle oracle>
        <div className="item">
          <DataFeedSubTitleText fontSize={14} fontWeidth={600}>
            Oracle
          </DataFeedSubTitleText>
          <TzAddress tzAddress={oracle.address} hasIcon type="secondary" />
        </div>
        <div className="item">
          <DataFeedSubTitleText fontSize={14} fontWeidth={600}>
            Answer
          </DataFeedSubTitleText>
          <var>$ priceeee</var>
        </div>
        <div className="item">
          <DataFeedSubTitleText fontSize={14} fontWeidth={600}>
            Date
          </DataFeedSubTitleText>
          <var>{getDate_MDY_Format(oracle.unregisteredDateTime?.toString() || '')}</var>
        </div>
        <div className="item center-v">
          <SatelliteOracleStatusComponent statusType={oracleStatusType}>
            {ORACLE_STATUSES_MAPPER[oracleStatusType]}
          </SatelliteOracleStatusComponent>
        </div>
        <div className="svg-wrapper">
          <svg>
            <use xlinkHref="/icons/sprites.svg#openLink" />
          </svg>
        </div>
      </SatelliteItemStyle>
    </Link>
  )
}
