import styled, { css } from 'styled-components/macro'
import { Card, cyanColor, headerColor, boxShadowColor, skyColor } from 'styles'
import { MavrykTheme } from 'styles/interfaces'

export const SatelliteItemStyle = styled(Card)<{ oracle?: boolean }>`
  margin-top: 0;
  margin-bottom: 10px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 16px 40px;
  transition: 0.5s all;

  &.userFeed {
    grid-template-columns: 0.75fr 1fr 0.75fr 1.5fr 0.75fr;
    padding: 25px 40px;
  }

  .item {
    &.with-img {
      padding-left: 45px;
      position: relative;

      img,
      svg {
        display: block;
        position: absolute;
        max-height: 32px;
        max-width: 32px;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        font-size: 12px;
      }
    }
    h5 {
      color: ${skyColor};
      font-weight: 400;
      font-size: 14px;
      line-height: 21px;
      margin-top: 0;
      margin-bottom: 6px;
    }

    var {
      font-style: normal;
      color: ${cyanColor};
      font-weight: 700;
      font-size: 14px;
      line-height: 14px;
      display: flex;
      column-gap: 10px;

      div {
        line-height: 100%;
      }

      p {
        margin: 0;
      }
    }

    &.center-v {
      display: flex;
      align-items: center;
    }

    .secondary {
      color: ${cyanColor};
      font-weight: 600;
      stroke: ${cyanColor};
    }
  }

  .svg-wrapper {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    svg {
      width: 16px;
      height: 16px;
      fill: ${headerColor};
      stroke: ${headerColor};
      transition: 0.5s all;
    }
  }

  &:hover {
    border-color: ${cyanColor};
    box-shadow: 0px 4px 4px ${boxShadowColor};
    cursor: pointer;

    .svg-wrapper {
      svg {
        fill: ${cyanColor};
        stroke: ${cyanColor};
      }
    }
  }

  ${({ oracle }) =>
    oracle
      ? css`
          grid-template-columns: repeat(4, 1fr) 75px;
        `
      : ''}
`

export const SatelliteOracleStatusComponent = styled.div<{ statusType: 'responded' | 'noResponse' | 'awaiting' }>`
  padding: 8px 12px;
  text-transform: uppercase;
  border: 1px solid
    ${({ statusType }) =>
      statusType === 'responded' ? '#27AE60' : statusType === 'noResponse' ? '#FF4343' : '#FFCA43'};
  border-radius: 10px;
  font-weight: 600;
  font-size: 12px;
  line-height: 12px;
  text-align: center;
  max-width: 110px;
  color: ${({ statusType }) =>
    statusType === 'responded' ? '#27AE60' : statusType === 'noResponse' ? '#FF4343' : '#FFCA43'};
`

export const SatelliteCard = styled(Card)<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
  border-radius: 10px;
  padding: 0;

  margin: 30px 0;

  &.iterable {
    margin-top: 20px;
  }
`

export const SatelliteCardTopRow = styled.div<{ isExtendedListItem?: boolean }>`
  width: 100%;
  column-gap: 20px;
  display: grid;
  grid-template-columns: ${({ isExtendedListItem }) => (isExtendedListItem ? '1fr 1fr 1fr 1fr' : '1.75fr 1fr 1.3fr')};
`

export const SatelliteCardInner = styled.div`
  display: flex;
  padding: 25px 0 17px 25px;

  .rows-wrapper {
    display: flex;
    flex-direction: column;
    width: 80%;
    row-gap: 17px;
  }
`

export const SatelliteCardButtons = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  padding-right: 24px;
  width: 204px;
  flex-shrink: 0;
`

export const SatelliteCardRow = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  padding: 15px;
  justify-content: center;
  font-weight: 400;
  font-size: 12px;
  line-height: 12px;
  color: ${({ theme }) => theme.headerColor};
  border-top: 1px solid ${({ theme }) => theme.cardBorderColor};
`

export const SatelliteProfileImageContainer = styled.div`
  display: flex;
  justify-content: space-around;
  height: 50px;
  width: 50px;
  margin-right: 10px;
`

export const SatelliteProfileImage = styled.div`
  background-image: ${({ src }: { src: string }) => `url(${src})`};
  background-size: cover;
  background-position: center;
  border-radius: 50%;
  width: 100%;
  height: 100%;
`

export const SideBySideImageAndText = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-right: 10px;
`

export const SatelliteTextGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-around;

  &.voted {
    margin-left: 70px;
  }
`

export const SatelliteMainText = styled.div<{ theme: MavrykTheme }>`
  color: ${({ theme }) => theme.headerSkyColor};
  font-weight: 600;
  line-height: 21px;
  font-size: 14px;
  margin-bottom: 2px;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;

  * {
    margin: 0;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`

export const SatelliteSubText = styled.div<{ theme: MavrykTheme }>`
  color: ${({ theme }) => theme.valueColor};
  font-weight: 700;
  font-size: 14px;
  line-height: 14px;
  white-space: nowrap;

  &.toClick {
    cursor: copy;
  }

  p {
    margin: 0;
  }
`

export const SatelliteProfileDetails = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  justify-content: center;
  margin-right: 15px;
  button.transparent {
    color: ${({ theme }) => theme.headerSkyColor};
    font-weight: 600;
    font-size: 14px;
    line-height: 14px;

    svg {
      stroke: ${({ theme }) => theme.headerSkyColor};
      margin-right: 0;
    }

    &:hover {
      color: ${cyanColor};

      svg {
        stroke: ${cyanColor};
      }
    }
  }
`
