import { Link, useLocation } from 'react-router-dom'
import { AvatarStyle } from '../../../app/App.components/Avatar/Avatar.style'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'

// style
import { CouncilMemberStyled } from './CouncilMember.style'

type Props = {
  image: string
  name: string
  user_id: string
  website: string
}

export const CouncilMemberView = (props: Props) => {
  const { image, name, user_id, website } = props
  const href = website?.length ? website : `/satellites/satellite-details/${user_id}`
  const content = (
    <CouncilMemberStyled>
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
    </CouncilMemberStyled>
  )
  if (website) {
    return (
      <a target="_blank" rel="noreferrer" href={href}>
        {content}
      </a>
    )
  }
  return <Link to={href}>{content}</Link>
}
