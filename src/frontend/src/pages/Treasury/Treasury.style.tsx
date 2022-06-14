import styled from 'styled-components/macro'

import { Card, cyanColor, skyColor, headerColor, whiteColor, containerColor } from 'styles'

export const TreasuryViewStyle = styled(Card)`
  display: grid;
  grid-template-columns: auto 254px 184px;
  gap: 50px;
  padding-bottom: 33px;

  header {
    display: flex;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 3px;
    padding-bottom: 16px;

    h1 {
      margin: 0;
    }
  }

  var {
    color: ${cyanColor};
    font-style: normal;
    font-weight: 600;
    font-size: 18px;
    line-height: 18px;
    padding-bottom: 13px;
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
      margin: 0;
      margin-top: 37px;
    }
  }

  .right-text {
    text-align: right;
    padding-right: 20px;
  }

  .asset-name {
    font-weight: 600;
    font-size: 16px;
    line-height: 16px;
    color: ${skyColor};
    margin: 0;
    margin-top: 4px;
  }

  .assets-block-tvl {
    padding-top: 4px;
    margin: 0;

    .asset-name {
      margin: 0;
      margin-top: 0px;
    }

    .asset-value {
      margin-top: 0;
    }
  }

  .assets-block-map {
    margin-top: 7px;
    margin-bottom: 11px;
  }

  .asset-value {
    font-weight: 600;
    font-size: 16px;
    line-height: 16px;
    color: ${cyanColor};
    margin: 0;
    margin-top: 4px;
  }

  .asset-lables {
    padding-top: 20px;
    max-height: 248px;
    overflow: auto;
    padding-right: 16px;
  }

  .asset-lable {
    background: linear-gradient(90deg, #0d61ff 0%, rgba(133, 211, 200, 0) 100%);
    padding-top: 1px;
    padding-bottom: 1px;
    border-bottom-left-radius: 6px;
    border-top-left-radius: 6px;
    margin: 11px 0;
  }

  .asset-lable-text {
    font-weight: 600;
    font-size: 18px;
    line-height: 18px;
    color: ${whiteColor};
    background-color: ${containerColor};
    margin: 0;
    margin-left: 8px;
    line-height: 40px;
    padding-left: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .asset-persent {
      font-size: 16px;
      line-height: 24px;
      color: ${skyColor};
    }
  }

  .assets-map {
    max-height: 132px;
    overflow: auto;
  }
` //TreasuryViewStyle

export const TreasuryActiveStyle = styled.section`` //TreasuryActiveStyle
export const TreasurySelectStyle = styled(Card)<{ isSelectedTreasury?: boolean }>`
  display: flex;
  border-bottom-left-radius: ${({ isSelectedTreasury }) => (isSelectedTreasury ? 0 : '10px')};
  border-bottom-right-radius: ${({ isSelectedTreasury }) => (isSelectedTreasury ? 0 : '10px')};
  align-items: center;
  margin-top: 20px;
  padding-top: 17px;
  padding-bottom: 17px;

  & + div {
    margin-top: 0;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-top: none;
  }

  h2 {
    font-weight: 600;
    font-size: 22px;
    line-height: 22px;
    color: ${headerColor};

    & + div {
      width: 502px;
      margin-left: auto;
      margin-right: 0;
    }
  }
` //TreasurySelectStyle
