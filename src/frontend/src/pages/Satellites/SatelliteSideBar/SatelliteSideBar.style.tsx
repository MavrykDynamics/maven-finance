import styled from 'styled-components/macro'
import { primaryColor, backgroundColor, subTextColor } from 'styles'

export const SatelliteSideBarStyled = styled.div`
  background-color: ${backgroundColor};
  padding: 20px;
  margin-top: 30px;
  border-radius: 10px;
  height: fit-content;
`

export const SideBarSection = styled.div`
  margin: 20px 0 40px;

  h2 {
    margin: 10px 0;
    font-size: 18px;
    font-weight: 600;
    color: ${subTextColor};
  }
  h3 {
    margin: 10px 0;
    font-size: 12px;
    font-weight: 600;
    color: ${subTextColor};
  }

  div {
    display: flex;
    justify-content: space-between;
  }
`

export const FAQLink = styled.div`
  font-size: 12px;
  color: ${primaryColor};
  margin: 8px 0;
`
