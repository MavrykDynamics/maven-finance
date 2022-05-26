import styled from 'styled-components/macro'
import { MavrykTheme } from '../../styles/interfaces'

import { Card, cyanColor, skyColor, headerColor, whiteColor } from 'styles'

export const TreasuryViewStyle = styled(Card)`
  display: grid;
  grid-template-columns: auto 254px 184px;
  gap: 50px;

  header {
    display: flex;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  var {
    color: ${cyanColor};
    font-style: normal;
    font-weight: 600;
    font-size: 18px;
    line-height: 18px;
  }

  .assets-block {
    display: grid;
    grid-template-columns: 100px 150px auto;
    gap: 30px;

    h5 {
      font-weight: 400;
      font-size: 12px;
      line-height: 12px;
      color: ${headerColor};
    }
  }

  .right-text {
    text-align: right;
  }

  .asset-name {
    font-weight: 600;
    font-size: 16px;
    line-height: 16px;
    color: ${skyColor};
  }

  .asset-value {
    font-weight: 600;
    font-size: 16px;
    line-height: 16px;
    color: ${cyanColor};
  }

  .asset-lable {
    font-weight: 600;
    font-size: 18px;
    line-height: 18px;
    color: ${whiteColor};
  }
` //TreasuryViewStyle
