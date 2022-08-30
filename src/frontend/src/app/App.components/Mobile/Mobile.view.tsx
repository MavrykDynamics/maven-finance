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

import { DiscordIcon, TwitterIcon, TelegramIcon, MediumIcon, GitHubIcon } from './assets/index'
import { containerColor, darkPurpleColor } from 'styles/colors'

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
            <SocialIconLink href="https://twitter.com/Mavryk_Finance">
              <TwitterIcon width="48px" height="48px" id="twitter-icon" />
            </SocialIconLink>
            <SocialIconLink href="https://discord.com/invite/7VXPR4gkT6">
              <DiscordIcon width="40px" height="32px" id="discord-icon" />
            </SocialIconLink>
            <SocialIconLink href="https://t.me/Mavryk_Finance">
              <TelegramIcon width="30px" height="30px" id="telegram-icon" />
            </SocialIconLink>
            <SocialIconLink href="https://medium.com/@Mavryk_Finance">
              <MediumIcon width="36px" height="31px" id="medium-icon" />
            </SocialIconLink>
            <SocialIconLink href="https://github.com/mavrykfinance/">
              <GitHubIcon width="32px" height="32px" id="github-icon" />
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
