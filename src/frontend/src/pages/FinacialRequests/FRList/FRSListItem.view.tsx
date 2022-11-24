import { CommaNumber } from 'app/App.components/CommaNumber/CommaNumber.controller'
import { StatusFlag } from 'app/App.components/StatusFlag/StatusFlag.controller'

import { FRListItemProps } from '../FinancialRequests.types'
import { FRListItem, ListItemLeftSide } from './FRList.styles'

const FRSListItem = ({
  id,
  title,
  dividedPassVoteMvkTotal,
  selected = false,
  onClickHandler,
  status,
}: FRListItemProps) => {
  return (
    <FRListItem selected={selected} onClick={onClickHandler}>
      <ListItemLeftSide className="financial-request">
        <span>{id}</span>
        <h4>{title}</h4>
      </ListItemLeftSide>
      <CommaNumber className="proposal-voted-mvk" value={dividedPassVoteMvkTotal} endingText={'voted'} />
      <StatusFlag text={status} status={status} />
    </FRListItem>
  )
}

export default FRSListItem
