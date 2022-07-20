import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'

import { State } from 'reducers'

// components
import Icon from '../../../app/App.components/Icon/Icon.view'

import { usersData } from '../users.const'

// style
import { SatellitePaginationStyled } from 'pages/Satellites/SatellitePagination/SatellitePagination.style'

const UsersPagination = () => {
  let { userId = '' } = useParams<{ userId: string }>()

  const prevIndex = useMemo(() => {
    return usersData.findIndex((item) => item.id === userId) || 0
  }, [usersData, userId])

  const prevFeed = usersData?.[prevIndex - 1]
  const nextFeed = usersData?.[prevIndex + 1]

  return (
    <SatellitePaginationStyled>
      <Link className="pagination-link back" to="/users">
        <Icon id="arrow-left-stroke" />
        Back to users
      </Link>
      {prevFeed ? (
        <Link className="pagination-link prev" to={`/user-details/${prevFeed.id}`}>
          <Icon id="arrow-obtuse-angle" />
          Previous user
        </Link>
      ) : null}
      {nextFeed ? (
        <Link className="pagination-link next" to={`/user-details/${nextFeed.id}`}>
          Next user
          <Icon id="arrow-obtuse-angle" />
        </Link>
      ) : null}
    </SatellitePaginationStyled>
  )
}

export default UsersPagination
