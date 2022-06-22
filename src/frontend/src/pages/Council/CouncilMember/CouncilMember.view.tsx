import { AvatarStyle } from '../../../app/App.components/Avatar/Avatar.style'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'

// style
import { CouncilMemberStyled } from './CouncilMember.style'

type Props = {
  image: string
  name: string
  user_id: string
}

export const CouncilMemberView = (props: Props) => {
  const { image, name, user_id } = props
  return (
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
}
