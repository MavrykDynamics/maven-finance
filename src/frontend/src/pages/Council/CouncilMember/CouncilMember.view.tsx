import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

import { Link, useLocation } from 'react-router-dom'
import { AvatarStyle } from '../../../app/App.components/Avatar/Avatar.style'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { Button } from '../../../app/App.components/Button/Button.controller'

// types
import { CouncilMember } from 'utils/TypesAndInterfaces/Council'

// style
import { CouncilMemberStyled } from './CouncilMember.style'

type Props = {
  image: string
  name: string
  userId: string
  website: string
  openModal: () => void
  showUpdateInfo?: boolean
}

export const memberIsFirstOfList = (list: CouncilMember[], address?: string) => {
    const indexOfMember = list.findIndex((item) => item.userId === address)

    if (indexOfMember === -1) {
      return list
    }

    const updatedList = [list[indexOfMember]].concat(list.filter(({userId}) => userId !== address))

    return updatedList
  }

export const CouncilMemberView = (props: Props) => {
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { image, name, userId, website, openModal, showUpdateInfo = true } = props
  const href = website?.length ? website : `/satellites/satellite-details/${userId}`

  const isMe = userId === accountPkh
  const content = (
    <CouncilMemberStyled className={isMe ? 'is-me' : ''}>
      <div className="inner">
        <AvatarStyle>
          <img
            src={image}
            alt={name}
            onError={({ currentTarget }) => {
              currentTarget.onerror = null
              currentTarget.style.opacity = '0'
            }}
          />
        </AvatarStyle>
        <figcaption>
          <h4>{name}</h4>
          {userId ? <TzAddress tzAddress={userId} hasIcon={false} /> : null}
        </figcaption>
      </div>
      {isMe && showUpdateInfo ? (
        <Button text="Update Info" className="fill" icon="spiner" kind="actionSecondary" onClick={openModal} />
      ) : null}
    </CouncilMemberStyled>
  )
  if (isMe) {
    return content
  }
  if (website) {
    return (
      <a target="_blank" rel="noreferrer" href={href}>
        {content}
      </a>
    )
  }
  return <Link to={href}>{content}</Link>
}
