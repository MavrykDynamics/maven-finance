import { AvatarStyle } from '../../../app/App.components/Avatar/Avatar.style'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'

// style
import { CouncilMemberStyled } from './CouncilMember.style'

export const CouncilMemberView = () => {
  return (
    <CouncilMemberStyled>
      <AvatarStyle>
        <img
          src="https://www.iheartradio.ca/image/policy:1.15731844:1627581512/rick.jpg?f=default&$p$f=20c1bb3"
          alt=""
        />
      </AvatarStyle>
      <figcaption>
        <h4>Jeff Stone Jeff Stone Jeff Stone Jeff Stone</h4>
        <TzAddress tzAddress={'tz1ezDb77a9jaFMHDWs8QXrKEDkpgGdgsjPD'} hasIcon={false} />
      </figcaption>
    </CouncilMemberStyled>
  )
}
