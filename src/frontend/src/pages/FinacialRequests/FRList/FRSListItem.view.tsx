import { ListItem } from '@mui/material'
import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { StatusFlag } from 'app/App.components/StatusFlag/StatusFlag.controller'
import React from 'react'
import { FRListItem, ListItemLeftSide } from './FRList.styles'

const FRSListItem = ({
  id,
  title,
  additionalText,
  dividedPassVoteMvkTotal,
  selected = false,
  onClickHandler,
  status,
}: {
  id: number
  title: string
  additionalText?: string
  onClickHandler?: () => void
  selected?: boolean
  dividedPassVoteMvkTotal?: number
  status: string
}) => {
  return (
    <FRListItem selected={selected} onClick={onClickHandler}>
      <ListItemLeftSide>
        <span>{id + 1}</span>
        <h4>{title}</h4>
      </ListItemLeftSide>
      {additionalText && dividedPassVoteMvkTotal && (
        <CommaNumber className="proposal-voted-mvk" value={dividedPassVoteMvkTotal} endingText={additionalText} />
      )}
      <StatusFlag text={'ONGOING'} status={'primary'} />
    </FRListItem>
  )
}

export default FRSListItem
