import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'
import { Card, skyColor, cyanColor, headerColor, royalPurpleColor, boxShadowColor } from 'styles'

export const FarmCardStyled = styled(Card)`
  margin: 0;
  padding: 0;

  .farm-info {
    h3 {
      font-weight: 400;
      font-size: 14px;
      line-height: 21px;
      color: ${skyColor};
    }

    var {
      font-weight: 700;
      font-size: 14px;
      color: ${cyanColor};
      font-style: normal;

      p {
        margin: 0;
      }
    }
  }

  .farm-card-section {
    margin-left: 16px;
    padding-top: 12px;
    padding-bottom: 12px;

    h3 {
      font-weight: 600;
      font-size: 22px;
      color: ${cyanColor};
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      max-width: 210px;
    }

    p {
      font-weight: 400;
      font-size: 11px;
      line-height: 11px;
      color: ${headerColor};
      margin: 3px 0;
    }

    .subtitle {
      margin-top: 3px;
      font-weight: 400;
      font-size: 11px;
      text-align: right;
      color: ${({ theme }) => theme.headerColor};
    }
  }

  .farm-card-header {
    display: flex;
    align-items: center;
    margin-right: 32px;
  }

  .links-block {
    a {
      display: flex;
      align-items: center;
      color: ${headerColor};
      font-weight: 400;
      font-size: 14px;
      line-height: 14px;
      margin-top: 8px;
      margin-bottom: 10px;

      svg {
        fill: none;
        stroke: ${headerColor};
        width: 16px;
        height: 16px;
        margin-left: 8px;
      }
    }
  }

  &.horizontal {
    position: relative;
    border: none;
    align-items: baseline;

    .expand-header {
      grid-template-columns: 300px 1fr 1fr 1fr 1fr 100px;
      padding-left: 40px;
    }

    .farm-info {
      .btn-info {
        position: relative;
        width: fit-content;
        .calc-button {
          position: absolute;
          right: -23px;
          margin: 0;
        }
      }
    }

    .farm-card-section {
      p {
        display: none;
      }
    }

    .farm-card-header {
      figure {
        right: 12px;
        flex-shrink: 0;
      }
    }

    .horizontal-expand {
      .farm-info {
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
    }
  } //horizontal

  &.vertical {
    position: relative;
    .farm-info-vertical {
      padding-left: 40px;
      padding-right: 40px;
      margin-bottom: 31px;

      .farm-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }
    .farm-card-header {
      margin: 0;
      display: flex;
      justify-content: space-between;
      text-align: right;
      padding-left: 20px;
      padding-right: 40px;
      padding-top: 40px;
      margin-bottom: 25px;
    }

    .expand-header {
      grid-template-columns: 1fr;
      border-top: 1px solid ${royalPurpleColor};
      min-height: 47px;
    }

    .vertical-expand {
      border: none;

      .farm-info-vertical {
        margin-top: 7px;
        margin-bottom: 19px;
      }

      .links-block {
        padding-left: 40px;
        margin-bottom: 40px;
      }

      article::before {
        display: none;
      }
    }

    .vertical-harvest {
      padding: 20px;
      padding-top: 0;

      .farm-harves {
        padding: 20px;
      }

      .start-farming {
        padding: 70px 20px 56px 20px;
        flex-direction: column;
        row-gap: 27px;
        align-items: center;
        margin-bottom: 10px;
        border: 1px solid ${({ theme }) => theme.cardBorderColor};
        border-radius: 10px;

        h3 {
          margin-bottom: 13px;
          margin-top: 3px;
        }

        div {
          margin: 0;
          width: 100%;
          max-width: 100%;
        }

        button {
          margin: 0;
          width: 100%;
        }
      }
    }
  } //vertical

  .btn-info {
    display: flex;
    align-items: center;

    button {
      margin-left: 8px;
    }
  }

  .horizontal-expand {
    display: grid;
    align-items: center;
    grid-template-columns: auto auto 170px;
    padding: 20px;
    margin: 0;
    gap: 20px;

    .farm-stake {
      flex-direction: row;
      padding: 20px;

      .circle-buttons {
        flex-direction: row;
        padding-top: 0;
        flex: 1;
      }
    }

    .farm-harvest {
      padding: 20px;
    }
  }

  .start-farming {
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding-left: 40px;
    border: 1px solid ${({ theme }) => theme.cardBorderColor};
    border-radius: 10px;
    height: 100%;

    div {
      margin: 0;
      width: fit-content;
    }

    h3 {
      font-weight: 400;
      font-size: 14px;
      line-height: 21px;
      color: ${skyColor};
      margin-right: 10px;
    }
  }

  .calc-button {
    svg {
      width: 19px;
      height: 19px;
      fill: ${headerColor};
      transition: 0.3s fill;

      &:hover {
        fill: ${cyanColor};
      }
    }
  }

  &.opened {
    border: 1px solid ${cyanColor};
    box-shadow: 0px 4px 4px ${boxShadowColor};
  }

  &.opened {
    .prevent-hover {
      &:hover {
        border-color: transparent;
        box-shadow: unset;
      }
    }
  }
` // CARD

export const FarmHarvestStyled = styled(Card)`
  display: flex;
  align-items: center;
  padding: 18px 30px;
  margin: 0;
  justify-content: space-between;

  .farm-info {
    flex-shrink: 0;
    margin-right: 20px;
  }
`

export const FarmStakeStyled = styled(Card)`
  display: flex;
  padding: 18px 30px;
  margin: 0;
  flex-direction: column;

  .farm-info {
    flex-shrink: 0;
    margin-right: 20px;
  }

  .circle-buttons {
    display: flex;
    flex-shrink: 0;
    gap: 10px;
    flex-direction: column;
    padding-top: 24px;
  }
`

export const FarmCardTopSection = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: max-content;
  margin-bottom: 30px;
  padding: 0 10px;
`

export const FarmCardContentSection = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  > div > p {
    font-size: 14px;
    font-weight: 600;
  }

  div:nth-child(2) {
    text-align: right;
  }
`
export const FarmTitleSection = styled.div<{ theme: MavrykTheme }>`
  width: max-content;
  text-align: right;

  > h3 {
    font-weight: 600;
    font-size: 18px;
    line-height: 18px;
    color: ${cyanColor};
  }
  > p {
    font-size: 14px;
    font-weight: 400;
    color: ${({ theme }) => theme.primaryColor};
  }
`
export const FarmInputSection = styled.form`
  width: 300px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;

  input {
    padding-right: 174px;
    height: 50px;
    font-size: 18px;
    margin-bottom: 6px;
  }

  .with-text {
    right: 150px;
    top: 18px;
  }

  .input-info {
    font-size: 12px;
    line-height: 12px;
    color: ${skyColor};
    font-weight: 400;
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
    padding: 0 8px;
    width: 100%;

    p {
      margin: 0;
      font-weight: 600;
    }
  }

  .farm-button {
    width: 262px;
    margin-top: auto;
    margin-bottom: 10px;
  }

  .farm-modal-input {
    .pinned-text {
      font-size: 14px;
    }
    .with-text {
      right: -25px;
    }
  }
`
