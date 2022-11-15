import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

// types
import { State } from 'reducers'
import { UserType } from '../../../utils/TypesAndInterfaces/User'

// view
import UserDetailsView from './UsersDetails.view'

import { usersData } from '../users.const'
import { FeedGQL } from 'pages/Satellites/helpers/Satellites.types'

const UserDetails = () => {
  const dispatch = useDispatch()
  const isLoading = useSelector((state: State) => Boolean(state.loading))
  const { oraclesStorage: { feedCategories } } = useSelector((state: State) => state.oracles)
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
        const dataToSort = data ? [...data] : []

        dataToSort.sort((a, b) => {
          // sort by category
          if (!a.category) return 1

          if (a.category === selectedOption && b.category === selectedOption) {
            return 0
          }

          if (a.category === selectedOption) {
            return -1
          }

          // sort by alfabet
          if (!b.category) return -1

          if (a.category < b.category) {
            return -1
          }

          if (a.category > b.category) {
            return 1
          }

          return 1
        })

        return dataToSort
      })
    }
  }

  useEffect(() => {
    if (userId) setSelectedUser(usersData.find((user) => user.id === userId) || null)
  }, [dispatch, userId])

  return (
    <UserDetailsView user={selectedUser} isLoading={isLoading} feeds={sortedFeeds} handleSelect={handleSelect} categories={feedCategories} />
  )
}

export default UserDetails
