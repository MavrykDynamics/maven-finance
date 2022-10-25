import styled from 'styled-components'
import { boxShadowColor, cyanColor } from 'styles'
import { MavrykTheme } from '../../../styles/interfaces'

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

        .name-part {
          padding-left: 55px;
          position: relative;

          a {
            font-weight: 600;
            font-size: 12px;
            line-height: 18px;
            color: #8d86eb;
            display: flex;
            align-items: center;
          }

          .img-wrapper {
            position: absolute;
            height: 90%;
            max-width: 45px;
            left: 0;
            font-size: 14px;

            img,
            svg {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }
        }

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
        grid-template-columns: 1fr 1.1fr 1.1fr 1.1fr;
        grid-template-rows: minmax(auto, 85px);
        padding: 5px 40px 30px;
        column-gap: 5px;
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
        align-items: center;
        margin-top: 10px;
      }

      .adresses-info,
      .register-pair-wrapper {
        background: #160e3f;
        border: 1px solid #503eaa;
        border-radius: 10px;
        padding: 0 30px 10px 30px;
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

export const DataFeedInfoBlock = styled.div<{ justifyContent?: string }>`
  display: flex;
  flex-direction: column;
  padding-top: 15px;
  justify-content: ${({ justifyContent }) => justifyContent || 'flex-start'};
  min-height: 85px;
`

export const DataFeedsTitle = styled.div<{ fontWeidth?: number; fontSize?: number }>`
  font-weight: ${({ fontWeidth }) => fontWeidth || 400};
  font-size: ${({ fontSize }) => (fontSize ? `${fontSize}px` : '12px')};
  color: #8d86eb;
  text-transform: capitalize;
  display: flex;
  align-items: center;
  padding: 2px 0 3px 0;

  &.margin-r {
    margin-right: 20px;
  }

  &.title {
    margin: 0 auto;
    margin-bottom: 45px;
  }

  &.link {
    transition: 0.25s all;
    cursor: pointer;
    &:hover {
      color: ${cyanColor};
    }
  }
`

export const DataFeedSubTitleText = styled.div<{ fontWeidth?: number; fontSize?: number }>`
  font-weight: ${({ fontWeidth }) => fontWeidth || 400};
  font-size: ${({ fontSize }) => (fontSize ? `${fontSize}px` : '12px')};
  color: #77a4f2;
  padding: 3px 0 4px 0;
  display: flex;
  align-items: center;

  &.title {
    margin: 0 auto;
    margin-bottom: 20px;
  }

  &.descr {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`

export const DataFeedValueText = styled.div<{ fontWeidth?: number; fontSize?: number }>`
  font-weight: ${({ fontWeidth }) => fontWeidth || 400};
  font-size: ${({ fontSize }) => (fontSize ? `${fontSize}px` : '12px')};
  line-height: 25px;
  color: #86d4c9;
  display: flex;

  p {
    margin: 0;
  }

  svg {
    width: 22px;
    height: 22px;
    margin-right: 7px;
  }
`

export const UsersListWrapper = styled.div`
  margin-top: 30px;

  .see-all-link {
    right: 45px !important;
  }
`

export const UsersListCardsWrapper = styled.div`
  display: flex;
  column-gap: 20px;
  margin-top: 30px;
  overflow: hidden;
`

export const UserSmallCard = styled.div`
  display: flex;
  align-items: center;
  background: #160e3f;
  border: 1px solid #503eaa;
  border-radius: 10px;
  padding: 20px 35px;
  transition: 0.6s all;

  .img-wrapper {
    width: 40px;
    height: 40px;
    border: 1px solid #8d86eb;
    margin-right: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &:hover {
    border-color: ${cyanColor};
    box-shadow: 0px 4px 4px ${boxShadowColor};
    cursor: pointer;
  }
`
