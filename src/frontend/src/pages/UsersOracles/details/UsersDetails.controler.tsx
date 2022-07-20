import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

// types
import { State } from 'reducers'

// view
import UserDetailsView from './UsersDetails.view'

import { usersData } from '../users.const'
import { Feed } from 'pages/Satellites/helpers/Satellites.types'

const UserDetails = () => {
  const dispatch = useDispatch()
  const isLoading = useSelector((state: State) => state.loading)

  let { userId } = useParams<{ userId: string }>()

  let [selectedUser, setSelectedUser] = useState<null | any>(null)
  const { feeds } = useSelector((state: State) => state.oracles.oraclesStorage)
  const feedsForUser = useCallback(
    () => feeds.filter(({ address }) => !selectedUser?.feeds.contains(address)),
    [selectedUser, feeds],
  )

  const [allFeeds, setAllFeeds] = useState<Feed[]>(feedsForUser)
  const [filteredFeedsList, setFilteredFeedsList] = useState<Feed[]>(feedsForUser)

  useEffect(() => {
    setAllFeeds(feeds)
    setFilteredFeedsList(feeds)
  }, [feeds])

  const handleSelect = (selectedOption: any) => {
    const sortLabel = selectedOption.text,
      sortValue = selectedOption.value

    if (sortValue !== '') {
      setFilteredFeedsList((data: Feed[]) => {
        const dataToSort = data ? [...data] : []

        dataToSort.sort((a: any, b: any) => {
          let res = 0
          switch (sortLabel) {
            case 'Lowest Fee':
              res = Number(a[sortValue]) - Number(b[sortValue])
              break
            case 'Highest Fee':
            case 'Delegated MVK':
            case 'Participation':
            default:
              res = Number(b[sortValue]) - Number(a[sortValue])
              break
          }
          return res
        })
        return dataToSort
      })
    }
  }

  useEffect(() => {
    setSelectedUser(usersData.find((user) => user.id === userId) || null)
  }, [dispatch, userId])

  return (
    <UserDetailsView user={selectedUser} isLoading={isLoading} feeds={filteredFeedsList} handleSelect={handleSelect} />
  )
}

export default UserDetails
