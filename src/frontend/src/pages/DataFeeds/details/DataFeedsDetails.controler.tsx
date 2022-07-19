import { Feed } from 'pages/Satellites/helpers/Satellites.types'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { State } from 'reducers'
import DataFeedDetailsView from './DataFeedsDetails.view'

const DataFeedDetails = () => {
  const dispatch = useDispatch()
  const { oraclesStorage } = useSelector((state: State) => state.oracles)
  const { satelliteLedger } = useSelector((state: State) => state.delegation.delegationStorage)
  const isLoading = useSelector((state: State) => state.loading)
  let { feedId } = useParams<{ feedId: string }>()
  let [selectedFeed, setSelectedFeed] = useState<null | Feed>(null)

  useEffect(() => {
    setSelectedFeed(oraclesStorage.feeds.find((feed) => feed.address === feedId) || null)
  }, [dispatch, feedId])

  return <DataFeedDetailsView feed={selectedFeed} isLoading={isLoading} oracles={satelliteLedger} />
}

export default DataFeedDetails
