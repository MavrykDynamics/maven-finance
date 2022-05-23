import styled from 'styled-components/macro';
import { MavrykTheme } from '../../styles/interfaces';

import { downColor, upColor, skyColor, headerColor, darkCianColor } from '../../styles/colors';

export const BGStyled = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  width: 100%;
  flex-direction: column;
  font-family: 'Metropolis';
`;

export const BGTop = styled.div<{ theme: MavrykTheme }>`
  width: 100%;
  display: flex;
  padding-top: 30px;
  justify-content: space-between;
`;

const BGBlockBaseStyles = styled.div<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
  border: 1px solid ${darkCianColor};
  border-radius: 10px;
`;

export const BGStatusIndicator = styled(BGBlockBaseStyles)<{ theme: MavrykTheme }>`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 300px;
  height: 115px;
  padding: 0 40px;

  .status-indicator-wrapper {
    width: 100%;
    display: flex;
    justify-content: space-between;
    font-weight: 600;
    font-size: 16px;
    color: ${headerColor};
    margin: 12px 0;
  }

  .color-red {
    font-weight: 700;
    font-size: 14px;
    text-transform: uppercase;
    color: ${downColor};
  }

  .color-green {
    font-weight: 700;
    font-size: 14px;
    text-transform: uppercase;
    color: ${upColor};
  }
`;

export const BGMiddleWrapper = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  justify-content: space-between;
  margin-top: 45px;
`;

export const BGInfo = styled(BGBlockBaseStyles)<{ theme: MavrykTheme }>`
  max-width: 758px;
  max-height: 115px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 22px;
  padding-top: 21px;

  p {
    margin: 0;
    font-size: 14px;
    line-height: 21px;
    color: ${skyColor};
  }

  a {
    text-decoration: none;
  }
`;

export const BGCardsWrapper = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-wrap: wrap;
  column-gap: calc((100% - (31% * 3)) / 2);
  row-gap: 25px;
  margin-top: 23px;
`;

export const BGTitle = styled.h1<{ theme: MavrykTheme }>`
  color: ${headerColor};
  font-weight: 700;
  font-size: 24px;
  margin: 0;
`;
