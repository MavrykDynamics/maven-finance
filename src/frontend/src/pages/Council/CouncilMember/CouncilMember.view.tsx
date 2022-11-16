import { useSelector } from 'react-redux'
import { State } from 'reducers'

import { Link } from 'react-router-dom'
import { AvatarStyle } from '../../../app/App.components/Avatar/Avatar.style'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { Button } from '../../../app/App.components/Button/Button.controller'

// style
import { CouncilMemberStyled } from './CouncilMember.style'

type Props = {
  image: string
  name: string
  userId: string
  openModal: () => void
  showUpdateInfo?: boolean
}

export const CouncilMemberView = (props: Props) => {
  const { accountPkh } = useSelector((state: State) => state.wallet)
  const {
    delegationStorage: { activeSatellites },
  } = useSelector((state: State) => state.delegation)

  const { image, name, userId, openModal, showUpdateInfo = true } = props
  const href = `/satellites/satellite-details/${userId}`
  const isSatellite = activeSatellites.find(({ address }) => address === userId)

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

  if (!isSatellite) {
    return (
      <a
        className="icon-send"
        target="_blank"
        href={`https://${
          process.env.NODE_ENV === 'development' ? process.env.REACT_APP_NETWORK + '.' : ''
        }tzkt.io/${userId}/operations/`}
        rel="noreferrer"
      >
        {content}
      </a>
    )
  }

  return <Link to={href}>{content}</Link>
}
