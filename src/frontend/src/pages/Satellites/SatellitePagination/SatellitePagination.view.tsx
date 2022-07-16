import { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import { State } from 'reducers'

// components
import Icon from '../../../app/App.components/Icon/Icon.view'
// style
import { SatellitePaginationStyled } from './SatellitePagination.style'

const SatellitePagination = () => {
  const params: { satelliteId: string } = useParams()
  const { delegationStorage } = useSelector((state: State) => state.delegation)
  const satelliteLedger = delegationStorage?.satelliteLedger
  const satelliteId = params?.satelliteId || ''

  const prevIndex = useMemo(() => {
    return satelliteLedger?.length ? satelliteLedger.findIndex((item) => item.address === satelliteId) : 0
  }, [satelliteLedger, satelliteId])

  const prevSatellite = satelliteLedger?.[prevIndex - 1]
  const nextSatellite = satelliteLedger?.[prevIndex + 1]

  return (
    <SatellitePaginationStyled>
      <Link className="pagination-link back" to="/satellites">
        <Icon id="arrow-left-stroke" />
        Back to satellites
      </Link>
      {prevSatellite ? (
        <Link className="pagination-link prev" to={`/satellite-details/${prevSatellite.address}`}>
          <Icon id="arrow-obtuse-angle" />
          Previous satellite
        </Link>
      ) : null}
      {nextSatellite ? (
        <Link className="pagination-link next" to={`/satellite-details/${nextSatellite.address}`}>
          Next satellite
          <Icon id="arrow-obtuse-angle" />
        </Link>
      ) : null}
    </SatellitePaginationStyled>
  )
}

export default SatellitePagination
