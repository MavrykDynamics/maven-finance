import styled, { createGlobalStyle } from 'styled-components/macro';
import { MavrykTheme } from 'styles/interfaces';

export const GlobalStyle = createGlobalStyle`
  body {
    min-width: unset !important;
  }
`;

export const MobilePlugBackground = styled.div`
  width: 100vw;
  height: fit-content;
  min-height: 100vh;
  background-image: url('./mobile-plug-background.png');
  background-size: cover;
  background-position: center center;
`;

export const MobilePlugWrapper = styled.div`
  width: 100%;
  max-width: 540px;
  height: fit-content;
  min-height: 100vh;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  align-items: center;
  padding: 85px 0;
  margin: 0 auto;
  @media only screen and (max-width: 565px) {
    width: 100vw;
    padding: 85px 35px 30px 35px;
  }

  @media only screen and (max-width: 425px) {
    width: 100vw;
    padding: 85px 20px 30px 20px;
  }

  @media only screen and (min-height: 890px) and (min-width: 650px) {
    justify-content: space-between;
  }
`;

export const MobilePlugBottomWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  align-items: center;
`;

export const MobilePLugLogo = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

export const MobilePlugLogoWrapper = styled.div`
  width: 70vw;
  max-width: 500px;
  max-height: 120px;
`;

export const MobilePlugText = styled.div<{
  textColor: string;
  textSize: string;
  topMargin?: string;
  topMarginMobile?: string;
  fontWeight?: string;
}>`
  text-align: center;
  font-weight: ${({ fontWeight = 600 }) => fontWeight};
  color: ${({ textColor }) => textColor};
  font-size: ${({ textSize }) => textSize};
  margin-top: ${({ topMargin = 0 }) => topMargin};

  @media only screen and (max-height: 800px) {
    margin-top: ${({ topMarginMobile = 0, topMargin }) => topMarginMobile || topMargin};
  }

  @media only screen and (max-width: 320px) {
    font-size: 16px;
  }
`;

export const SocialIconsWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 322px;
  margin-top: 166px;
  @media only screen and (max-height: 800px) {
    margin-top: 80px;
  }
`;

export const SocialIconLink = styled.a``;
