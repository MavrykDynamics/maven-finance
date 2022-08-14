import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'
import { Card, skyColor, cyanColor, headerColor, royalPurpleColor } from 'styles'

export const RoiCalculatorStyled = styled.section`
  header {
    display: flex;
    align-items: center;
    margin-bottom: 24px;

    h2 {
      color: ${cyanColor};
      font-weight: 600;
      font-size: 18px;
      line-height: 18px;
      padding-left: 18px;
    }
  }

  #input-roi {
    height: 60px;
    padding-bottom: 30px;
  }

  .fieldset-roi {
    margin-bottom: 24px;

    .pinned-text {
      top: 13px;
    }
  }

  .label-roi {
    font-weight: 600;
    font-size: 12px;
    line-height: 18px;
    color: ${skyColor};
    padding-left: 8px;
    padding-bottom: 2px;
  }

  .exchange-roi {
    display: flex;
    justify-content: space-between;
    font-weight: 600;
    font-size: 12px;
    line-height: 18px;
    color: ${skyColor};
    padding: 0 20px;
    margin-top: -24px;
    position: relative;
  }

  .current-rates {
    background: linear-gradient(180deg, #503eaa 0%, rgba(80, 62, 170, 0) 100%);
    border-radius: 10px;
    margin-top: 12px;
    padding: 20px 30px;
    color: ${cyanColor};
    font-weight: 700;
    font-size: 14px;
    line-height: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    h3 {
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 10px;
    }

    p {
      margin: 0;
      font-weight: 400;
      margin-top: 10px;
    }

    button {
      svg {
        width: 24px;
        height: 24px;
        stroke: ${headerColor};
      }
    }
  }

  .tab-block {
    margin-bottom: 32px;

    h4 {
      font-weight: 700;
      font-size: 14px;
      line-height: 14px;
      color: ${headerColor};
      padding-left: 4px;
      margin-bottom: 12px;
    }

    .tab-component {
      display: grid;

      button {
        width: auto;
      }

      &.values-tabs {
        grid-template-columns: repeat(3, 1fr);
      }
      &.staked-tabs {
        grid-template-columns: repeat(5, 1fr);
      }
      &.compounding-tabs {
        grid-template-columns: repeat(4, 1fr);
      }
    }
  }

  .compounding-every {
    display: flex;
    align-items: center;

    .compounding-checkbox {
      display: flex;
      align-items: center;
      margin-right: 22px;
    }

    .compounding-tabs {
      width: 100%;
    }
  }
` // RoiCalculatorStyled
