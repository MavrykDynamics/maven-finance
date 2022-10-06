import styled, { css } from "styled-components/macro";
import { Card, skyColor, cyanColor } from "styles";

import { MavrykTheme } from "../../styles/interfaces";

export const EmergencyGovernanceCard = styled(Card)<{ theme: MavrykTheme }>`
  padding-top: 28px;
  position: relative;

  .inner {
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    color: ${skyColor};
    margin: 0;

    div {
      margin: 8px 0;
      margin-bottom: 13px;
      font-size: 12px;

      a {
        font-size: 14px;
        text-decoration: none;
      }
    }
  }

  h1 {
    margin-top: 0;
    margin-bottom: 0;
  }
`;

export const CardContentLeftSide = styled.div<{ theme: MavrykTheme }>`
  width: 50%;
  align-items: center;
  justify-content: center;

  .voting-ends {
    display: block;
    font-weight: 700;
    font-size: 14px;
    line-height: 21px;
    color: ${cyanColor};
    padding-bottom: 12px;
    padding-top: 2px;
  }
`;
export const CardContent = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  justify-content: center;
`;
export const CardContentRightSide = styled.div<{ theme: MavrykTheme }>`
  width: 50%;
  align-items: center;
  justify-content: flex-end;
  display: flex;

  button {
    max-width: 250px;
  }

  .connect-wallet {
    align-items: center;
    justify-content: flex-end;
    display: flex;
    margin: 0;
  }
`;

export const EmergencyGovernHistory = styled.div<{ theme: MavrykTheme }>`
  padding-top: 39px;

  > h1 {
    margin: 0;
    margin-bottom: 10px;
  }
`;

export const BGTextWithStatus = styled.div<{
  status: boolean;
  theme: MavrykTheme;
}>`
  color: ${({ status, theme }) => (status ? theme.downColor : theme.upColor)};
  font-weight: 600;
  font-size: 22px;
`;

export const CardContentVoiting = styled.div`
  width: 100%;
  padding-left: 40px;

  .voted-label {
    display: none;
  }

  .voted-block {
    padding-top: 0;
  }

  aside {
    margin-top: 33px;
    margin-bottom: 58px;
  }

  article {
    margin-bottom: 30px;
  }
`;
