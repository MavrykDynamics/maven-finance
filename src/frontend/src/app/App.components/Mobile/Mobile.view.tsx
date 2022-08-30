import {
  GlobalStyle,
  MobilePlugBackground,
  SocialIconLink,
  MobilePlugWrapper,
  MobilePLugLogo,
  MobilePlugLogoWrapper,
  MobilePlugText,
  SocialIconsWrapper,
  MobilePlugBottomWrapper,
} from './Mobile.style'

import { containerColor, darkPurpleColor } from 'styles/colors'
import Icon from '../Icon/Icon.view'

export default function Mobile() {
  return (
    <MobilePlugBackground>
      <GlobalStyle />
      <MobilePlugWrapper>
        <MobilePlugLogoWrapper>
          <MobilePLugLogo src="./mobile-plug-logo.png" />
        </MobilePlugLogoWrapper>
        <MobilePlugText textSize={'22px'} textColor={containerColor} topMargin={'125px'} topMarginMobile={'60px'}>
          Mobile and tablet version of our dapp is not available at this time.
        </MobilePlugText>
        <MobilePlugText textSize={'22px'} textColor={containerColor} topMargin={'10px'}>
          Please open on a desktop screen or laptop.
        </MobilePlugText>
        <MobilePlugBottomWrapper>
          <SocialIconsWrapper>
            <SocialIconLink href="https://twitter.com/Mavryk_Finance" id="twitter">
              <Icon id="twitter" />
            </SocialIconLink>
            <SocialIconLink href="https://discord.com/invite/7VXPR4gkT6" id="discord">
              <Icon id="discord" />
            </SocialIconLink>
            <SocialIconLink href="https://t.me/Mavryk_Finance" id="telegram">
              <Icon id="telegram" />
            </SocialIconLink>
            <SocialIconLink href="https://medium.com/@Mavryk_Finance" id="medium">
              <Icon id="medium" />
            </SocialIconLink>
            <SocialIconLink href="https://github.com/mavrykfinance/" id="gitHub">
              <Icon id="gitHub" />
            </SocialIconLink>
          </SocialIconsWrapper>
          <MobilePlugText textSize={'18px'} textColor={darkPurpleColor} topMargin={'60px'} topMarginMobile={'35px'}>
            Mavryk is a DAO operated financial ecosystem that lets users borrow and earn on their terms, while
            participating in the governance of the platform.
          </MobilePlugText>

          <MobilePlugText
            textSize={'18px'}
            textColor={darkPurpleColor}
            topMargin={'61px'}
            topMarginMobile={'35px'}
            fontWeight={'400'}
          >
            © Mavryk Finance 2022
          </MobilePlugText>
        </MobilePlugBottomWrapper>
      </MobilePlugWrapper>
    </MobilePlugBackground>
  )
}
