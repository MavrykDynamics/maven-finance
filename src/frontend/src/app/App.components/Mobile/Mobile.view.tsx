import * as React from 'react';

import {
  MobilePlugBackground,
  MobilePlugWrapper,
  MobilePLugLogo,
  MobilePlugLogoWrapper,
  MobilePlugText,
  SocialIconsWrapper,
  MobilePlugBottomWrapper,
} from './Mobile.style';

import { DiscordIcon, TwitterIcon, TelegramIcon, MediumIcon, GitHubIcon } from './assets/index';

export default function Modile() {
  return (
    <MobilePlugBackground>
      <MobilePlugWrapper>
        <MobilePlugLogoWrapper>
          <MobilePLugLogo src="./mobile-plug-logo.png" />
        </MobilePlugLogoWrapper>
        <MobilePlugText
          textSize={'22px'}
          textColor={'#F7F9FD'}
          topMargin={'125px'}
          topMarginMobile={'60px'}
        >
          Mobile and tablet version of our dapp is not available at this time.
        </MobilePlugText>
        <MobilePlugText textSize={'22px'} textColor={'#F7F9FD'} topMargin={'10px'}>
          Please open on a desktop screen or laptop.
        </MobilePlugText>
        <MobilePlugBottomWrapper>
          <SocialIconsWrapper>
            <TwitterIcon width="48px" height="48px" id="twitter-icon" />
            <GitHubIcon width="32px" height="32px" id="github-icon" />
            <MediumIcon width="36px" height="31px" id="medium-icon" />
            <DiscordIcon width="40px" height="32px" id="discord-icon" />
            <TelegramIcon width="30px" height="30px" id="telegram-icon" />
          </SocialIconsWrapper>
          <MobilePlugText
            textSize={'18px'}
            textColor={'#38237C'}
            topMargin={'60px'}
            topMarginMobile={'35px'}
          >
            Mavryk is a DAO operated financial ecosystem that lets users borrow and earn on their
            terms, while participating in the governance of the platform.
          </MobilePlugText>

          <MobilePlugText
            textSize={'18px'}
            textColor={'#38237C'}
            topMargin={'61px'}
            topMarginMobile={'35px'}
            fontWeight={'400'}
          >
            (c) Mavryk Finance 2022
          </MobilePlugText>
        </MobilePlugBottomWrapper>
      </MobilePlugWrapper>
    </MobilePlugBackground>
  );
}
