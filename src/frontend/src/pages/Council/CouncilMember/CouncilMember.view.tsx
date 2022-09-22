import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

import { Link, useLocation } from 'react-router-dom'
import { AvatarStyle } from '../../../app/App.components/Avatar/Avatar.style'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { Button } from '../../../app/App.components/Button/Button.controller'

// style
import { CouncilMemberStyled } from './CouncilMember.style'

type Props = {
  image: string
  name: string
  user_id: string
  website: string
  openModal: () => void
}

export const CouncilMemberView = (props: Props) => {
  console.log("🚀 ~ file: CouncilMember.view.tsx ~ line 21 ~ CouncilMemberView ~ props", props)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)
  const { image, name, user_id, website, openModal } = props
  const href = website?.length ? website : `/satellites/satellite-details/${user_id}`

  const isMe = user_id === accountPkh
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
          {user_id ? <TzAddress tzAddress={user_id} hasIcon={false} /> : null}
        </figcaption>
      </div>
      {isMe ? (
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
