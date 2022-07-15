import styled, { css } from 'styled-components/macro'
import { boxShadowColor, Card, cyanColor } from 'styles'

import { MavrykTheme } from '../../../../styles/interfaces'

export const SatelliteCard = styled(Card)<{ theme: MavrykTheme }>`
  background-color: ${({ theme }) => theme.containerColor};
  border-radius: 10px;
  padding: 0;
  margin-top: 0;

  &.iterable {
    margin-top: 20px;
  }
`
export const SatelliteCardTopRow = styled.div<{ isExtendedListItem?: boolean }>`
  display: grid;
  grid-template-columns: repeat(${({ isExtendedListItem }) => (isExtendedListItem ? 4 : 3)}, auto);
  grid-template-rows: repeat(2, auto);
  grid-column-gap: 0;
  grid-row-gap: 9px;
  padding: 25px;
  width: 100%;
  padding-bottom: 17px;
`
export const SatelliteCardInner = styled.div`
  display: flex;
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
  align-items: center;
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
`
export const SatelliteTextGroup = styled.div<{ oracle?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 10px;
  width: 112px;
  justify-content: center;

  &.voted {
    margin-left: 70px;
  }

  ${({ oracle }) =>
    oracle
      ? css`
          width: 100%;
        `
      : ''}
`
export const SatelliteMainText = styled.div<{ theme: MavrykTheme; oracle?: boolean }>`
  color: ${({ theme }) => theme.valueColor};
  font-weight: 700;
  font-size: 14px;
  line-height: 14px;
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

  ${({ oracle, theme }) =>
    oracle
      ? css`
          color: ${theme.headerSkyColor};
          font-weight: 600;
          line-height: 21px;
        `
      : ''}
`
export const SatelliteSubText = styled.div<{ theme: MavrykTheme; oracle?: boolean }>`
  color: ${({ theme }) => theme.headerSkyColor};
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  white-space: nowrap;

  &.toClick {
    cursor: copy;
  }

  p {
    margin: 0;
  }

  ${({ oracle, theme }) =>
    oracle
      ? css`
          color: ${theme.valueColor};
          font-weight: 700;
          font-size: 14px;
          line-height: 14px;
        `
      : ''}
`

export const SatelliteProfileDetails = styled.div<{ theme: MavrykTheme }>`
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
