import styled from 'styled-components/macro'
import { MavrykTheme } from '../../styles/interfaces'

import { downColor, upColor, headerColor } from '../../styles/colors'

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
`

export const BGStatusIndicator = styled(BGBlockBaseStyles)<{ theme: MavrykTheme }>`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;

  padding-bottom: 20px;
  margin-bottom: 25px;
  border-bottom: 1px solid ${({ theme }) => theme.cardBorderColor};

  .status-indicator-wrapper {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }

  .color-red, .color-green {
    font-weight: 600;
    font-size: 16px;
    line-height: 22px;
    text-transform: uppercase;
  }

  .color-red {
    color: ${downColor};
  }

  .color-green {
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
  padding: 30px;

  border: 1px solid ${({ theme }) => theme.cardBorderColor};
  border-radius: 10px;

  font-weight: 500;
  font-size: 14px;
  line-height: 24px;

  color: ${({ theme }) => theme.dashboardTextColor};

  p {
    margin: 0;
  }

  a {
    color: ${({ theme }) => theme.navLinkTextActive}
  }
  
  .line {
    margin: 0 auto;
    width: 44px;
    height: 3px;
    background-color: ${({ theme }) => theme.dashboardTextColor};;
    border-radius: 10px;
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
  padding: 25px 0;
  margin-top: 20px;
  border-top: 1px solid ${({ theme }) => theme.cardBorderColor};

  font-weight: 600;
  font-size: 16px;
  line-height: 22px;

  .adress-list {
    margin-top: 10px;

    div {
      color: ${({ theme }) => theme.dataColor};
    }

    svg {
      position: relative;
      top: 2px;
      stroke: ${({ theme }) => theme.dataColor};
      width: 17px;
      height: 17px;
    }
  }
`

export const BGPrimaryTitle = styled.h1<{ theme: MavrykTheme }>`
  color: ${headerColor};
  margin: 0;

  font-weight: 700;
  font-size: 25px;
  line-height: 30px;
`

export const BGSecondaryTitle = styled(BGPrimaryTitle)`
  font-weight: 600;
  font-size: 16px;
  line-height: 22px;

  &::after{
    display: none;
  }
`
