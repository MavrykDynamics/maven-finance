import styled, { css } from 'styled-components'

export const DataFeedsStyled = styled.div`
  display: flex;
  flex-direction: column;

  .top-section-wrapper {
    display: flex;
    justify-content: space-between;
    .left-part {
      max-width: 745px;
      width: 100%;
      background: #160e3f;
      border: 1px solid #503eaa;
      border-radius: 10px;

      .top {
        padding: 30px 40px;
        display: flex;
        justify-content: space-between;
        position: relative;

        .price-part {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        &::before {
          position: absolute;
          content: '';
          bottom: 0;
          left: 0;
          height: 1px;
          background-color: #503eaa;
          width: 100%;
        }
      }

      .bottom {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: minmax(auto, 85px);
        padding: 20px 40px 30px 40px;
        column-gap: 70px;
        row-gap: 30px;
      }
    }

    .right-part {
      max-width: 315px;
      width: 100%;
      row-gap: 20px;
      display: flex;
      flex-direction: column;

      .info-wrapper {
        display: flex;
        justify-content: space-between;
      }

      .adresses-info,
      .register-pair-wrapper {
        background: #160e3f;
        border: 1px solid #503eaa;
        border-radius: 10px;
        padding: 25px 30px;
      }

      .register-pair-wrapper {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      .adresses-info {
        position: relative;
        height: 110px;
        &.registered {
          height: 100%;
          &::before {
            content: '';
            position: absolute;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            height: 3px;
            width: 44px;
            background: #503eaa;
            border-radius: 10px;
          }
        }
      }
    }
  }

  .chart-wrapper {
    margin-top: 30px;
    min-height: 400px;
  }
`

export const DataFeedInfoBlock = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 85px;
`

export const DataFeedsTitle = styled.div<{ fontWeidth?: number; fontSize?: number; svgContent?: string }>`
  font-weight: ${({ fontWeidth }) => fontWeidth || 400};
  font-size: ${({ fontSize }) => (fontSize ? `${fontSize}px` : '12px')};
  line-height: 25px;
  color: #8d86eb;
  position: relative;
  width: fit-content;

  ${({ svgContent }) =>
    svgContent
      ? css`
          &::before {
            position: absolute;
            right: -20px;
            width: 15px;
            height: 15px;
            background-repeat: no-repeat;
            background-size: cover;
            top: 50%;
            transform: translateY(-50%);
            content: '';
            ${svgContent}
          }
        `
      : ''}

  &.margin-r {
    margin-right: 20px;
  }

  &.title {
    margin: 0 auto;
    margin-bottom: 45px;
  }
`

export const DataFeedSubTitleText = styled.div<{ fontWeidth?: number; fontSize?: number }>`
  font-weight: ${({ fontWeidth }) => fontWeidth || 400};
  font-size: ${({ fontSize }) => (fontSize ? `${fontSize}px` : '12px')};
  line-height: 25px;
  color: #77a4f2;
  position: relative;
  width: fit-content;

  &.title {
    margin: 0 auto;
    margin-bottom: 30px;
  }
`

export const DataFeedValueText = styled.div<{ fontWeidth?: number; fontSize?: number }>`
  font-weight: ${({ fontWeidth }) => fontWeidth || 400};
  font-size: ${({ fontSize }) => (fontSize ? `${fontSize}px` : '12px')};
  line-height: 25px;
  color: #86d4c9;
  display: flex;

  svg {
    width: 22px;
    height: 22px;
    margin-right: 7px;
  }
`
