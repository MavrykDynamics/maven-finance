import styled from 'styled-components/macro'
import { backgroundColor, containerColor, subTextColor, textColor } from 'styles'

export const SatelliteListStyled = styled.div`
  background-color: ${containerColor};
`
export const SatelliteSearchFilter = styled.div`
  background-color: ${backgroundColor};
  display: flex;
  align-items: baseline;
  padding: 10px;
  margin-top: 30px;
  border-radius: 10px;
  color: ${subTextColor};

  > * {
    flex: 1;
    margin: 5px;
  }
  > :nth-child(1) {
    flex: 3;
  }
  > :nth-child(2) {
    min-width: max-content;
    flex: 1;
  }
`
export const SelectContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
`

export const SatelliteCard = styled.div`
  margin-top: 30px;
  background-color: ${backgroundColor};
  border-radius: 10px;
`
export const SatelliteCardTopRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(2, 1fr);
  grid-column-gap: 20px;
  grid-row-gap: 20px;
  padding: 35px 35px 20px 35px;
`

export const SatelliteCardRow = styled.div`
  display: flex;
  padding: 15px;
  justify-content: center;
  font-size: 14px;
`
export const SatelliteCardButtonGrid = styled.div`
  margin: 30px auto 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: repeat(2, 1fr);
  grid-gap: 20px;
`

export const SatelliteProfileImageContainer = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 60px;
  width: 60px;
`

export const SatelliteProfileImage = styled.div`
  background-image: ${({ src }: { src: string }) => `url(${src})`};
  background-size: contain;
  background-position: center;
  border-radius: 50%;
  width: 100%;
  height: 100%;
`

export const SideBySideImageAndText = styled.div`
  display: flex;
  flex-direction: row;
`
export const SatelliteTextGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 20px;
`
export const SatelliteMainText = styled.div`
  color: ${textColor};
  font-size: 14px;
  font-weight: 600;
  display: inline-block;
  margin: 8px 0;
`
export const SatelliteSubText = styled.div`
  color: ${subTextColor};
  font-size: 14px;
  font-weight: 600;
  display: inline-block;
  margin: 8px 0;

  &.toClick {
    cursor: copy;
  }
`
