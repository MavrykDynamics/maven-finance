import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

// types
import { State } from 'reducers'
import { UserType } from '../../../utils/TypesAndInterfaces/User'
import { FeedGQL } from 'pages/Satellites/helpers/Satellites.types'

// view
import UserDetailsView from './UsersDetails.view'

// helpers
import { sortByCategory } from 'utils/sortByCategory'
import { usersData } from '../users.const'

const UserDetails = () => {
  const dispatch = useDispatch()
  const isLoading = useSelector((state: State) => state.loading.isLoading)
  const {
    oraclesStorage: { feedCategories },
  } = useSelector((state: State) => state.oracles)
  let { userId } = useParams<{ userId: string }>()

  let [selectedUser, setSelectedUser] = useState<null | UserType>(null)
  const { feeds } = useSelector((state: State) => state.oracles.oraclesStorage)
  const feedsForUser = useCallback(
    //@ts-ignore
    () => feeds.filter(({ address }) => !selectedUser?.feeds.contains(address)),
    [selectedUser, feeds],
  )
  const [sortedFeeds, setSortedFeeds] = useState<FeedGQL[]>(feedsForUser)

  const handleSelect = (selectedOption: string) => {
    if (selectedOption !== '') {
      setSortedFeeds((data: FeedGQL[]) => {
        return sortByCategory(data, selectedOption)
      })
    }
  }

  useEffect(() => {
    if (userId) setSelectedUser(usersData.find((user) => user.id === userId) || null)
  }, [dispatch, userId])

  return (
    <UserDetailsView
      user={selectedUser}
      isLoading={isLoading}
      feeds={sortedFeeds}
      handleSelect={handleSelect}
      categories={feedCategories}
    />
  )
}

export default UserDetails
