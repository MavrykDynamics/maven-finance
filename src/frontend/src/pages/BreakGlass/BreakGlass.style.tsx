import styled from 'styled-components/macro'
import { MavrykTheme } from '../../styles/interfaces'

import { downColor, upColor, skyColor, headerColor, royalPurpleColor, cyanColor } from '../../styles/colors'

export const BGStyled = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  width: 100%;
  flex-direction: row;
  font-family: 'Metropolis';
  display: grid;
  column-gap: calc((100% - (31.5% * 3)) / 2);
  row-gap: 25px;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 65px auto;
`

export const BGTop = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: column;
  row-gap: 25px;
  height: fit-content;
  padding-top: 30px;
  grid-column-start: 3;
  grid-column-end: 4;
`

const BGBlockBaseStyles = styled.div<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
  border: 1px solid ${royalPurpleColor};
  border-radius: 10px;
`

export const BGStatusIndicator = styled(BGBlockBaseStyles)<{ theme: MavrykTheme }>`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  padding: 15px 20px;

  .status-indicator-wrapper {
    width: 100%;
    display: flex;
    justify-content: space-between;
    font-weight: 600;
    font-size: 16px;
    color: ${headerColor};
    margin: 6px 0;
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
`

export const BGMiddleWrapper = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
  height: 40px;
  grid-column-start: 1;
  grid-column-end: 3;
  grid-row-start: 1;
  grid-row-end: 2;

  .brake-glass-tabs {
    button {
      height: 100%;
      width: fit-content;
    }
  }
`

export const BGInfo = styled(BGBlockBaseStyles)<{ theme: MavrykTheme }>`
  display: flex;
  height: fit-content;
  flex-direction: column;
  justify-content: center;
  padding: 20px 22px;

  p {
    margin: 0;
    font-size: 14px;
    line-height: 21px;
    color: ${skyColor};
  }

  a {
    text-decoration: none;
  }
`

export const BGCardsWrapper = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-wrap: wrap;
  column-gap: 4%;
  row-gap: 25px;
  margin-top: 23px;
  grid-column-start: 1;
  grid-column-end: 3;
  grid-row-start: 2;
`

export const BGWhitelist = styled(BGBlockBaseStyles)<{ theme: MavrykTheme }>`
  padding: 20px;

  .adress-list {
    margin-top: 10px;

    div {
      color: ${cyanColor};
      font-weight: 500;
      font-size: 14px;
    }

    svg {
      stroke: ${cyanColor};
    }
  }
`

export const BGTitle = styled.h1<{ theme: MavrykTheme }>`
  color: ${headerColor};
  font-weight: 600;
  font-size: 16px;
  margin: 0;
`
