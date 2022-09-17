import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

// types
import { State } from 'reducers'
import { DropDown, DropdownItemType } from '../../../app/App.components/DropDown/DropDown.controller'
import { UserType } from '../../../utils/TypesAndInterfaces/User'

// view
import UserDetailsView from './UsersDetails.view'

import { usersData } from '../users.const'
import { FeedGQL } from 'pages/Satellites/helpers/Satellites.types'

const UserDetails = () => {
  const dispatch = useDispatch()
  const isLoading = useSelector((state: State) => Boolean(state.loading))

  let { userId } = useParams<{ userId: string }>()

  let [selectedUser, setSelectedUser] = useState<null | UserType>(null)
  const { feeds } = useSelector((state: State) => state.oracles.oraclesStorage)
  const feedsForUser = useCallback(
    //@ts-ignore
    () => feeds.filter(({ address }) => !selectedUser?.feeds.contains(address)),
    [selectedUser, feeds],
  )

  const [filteredFeedsList, setFilteredFeedsList] = useState<FeedGQL[]>(feedsForUser)

  useEffect(() => {
    setFilteredFeedsList(feeds)
  }, [feeds])

  const handleSelect = (selectedOption: DropdownItemType) => {
    const sortLabel = selectedOption.text,
      sortValue = selectedOption.value

    if (sortValue !== '') {
      setFilteredFeedsList((data: FeedGQL[]) => {
        const dataToSort = data ? [...data] : []

        dataToSort.sort((a, b) => {
          let res = 0
          switch (sortLabel) {
            case 'Lowest Fee':
              //@ts-ignore
              res = Number(a[sortValue]) - Number(b[sortValue])
              break
            case 'Highest Fee':
            case 'Delegated MVK':
            case 'Participation':
            default:
              //@ts-ignore
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
    if (userId) setSelectedUser(usersData.find((user) => user.id === userId) || null)
  }, [dispatch, userId])

  return (
    <UserDetailsView user={selectedUser} isLoading={isLoading} feeds={filteredFeedsList} handleSelect={handleSelect} />
  )
}

export default UserDetails
