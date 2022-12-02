import styled from 'styled-components/macro'
import { boxShadowColor, cyanColor } from 'styles'

import { MavrykTheme } from './interfaces'

export const Page = styled.div<{ theme: MavrykTheme }>`
  margin: auto;
  padding: 40px;
  width: 100%;
  position: relative;
  height: 100%;
  min-height: 100vh;
  width: 1170px;
  max-width: 1170px;
  padding-top: 112px;

  .oracle-list-wrapper {
    position: relative;

    .see-all-link {
      display: flex;
      align-items: center;
      position: absolute;
      right: 0;
      top: 15px;
      font-weight: 400;
      font-size: 14px;
      line-height: 21px;
      text-decoration-line: underline;
      color: #8d86eb;
      cursor: pointer;
      transition: 0.5s all;

      &:hover {
        color: #86d4c9;
        svg {
          stroke: #86d4c9;
        }
      }

      svg {
        margin-left: 5px;
        height: 13px;
        width: 18px;
        transform: rotate(180deg);
        stroke: #8d86eb;
        transition: 0.5s all;
      }
    }
  }
`

export const GridPage = styled.div`
  margin: 30px;
  position: relative;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-gap: 30px;
  max-width: 1270px;

  @media (max-width: 1900px) {
    grid-template-columns: repeat(5, 1fr);
  }

  @media (max-width: 1400px) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 800px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 500px) {
    grid-template-columns: repeat(1, 1fr);
  }
`

export const Message = styled.div`
  text-align: center;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  height: 50vh;
`

export const Card = styled.div<{ theme: MavrykTheme }>`
  margin-top: 30px;
  background-color: ${({ theme }) => theme.containerColor};
  border-radius: 10px;
  padding: 25px 35px;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.subTextColor};
  border: 1px solid ${({ theme }) => theme.cardBorderColor};
`

export const CardHover = styled(Card)`
  &:hover {
    border-color: ${cyanColor};
    box-shadow: 0px 4px 4px ${boxShadowColor};
  }
`

export const CardHeader = styled.h2<{ theme: MavrykTheme }>`
  font-weight: 700;
  font-size: 14px;
  line-height: 21px;
  color: ${({ theme }) => theme.textColor};
`

export const PageContent = styled.section`
  display: grid;
  grid-template-columns: 1fr 310px;
  grid-gap: 30px;
  align-items: baseline;
  align-items: start;
  padding-top: 30px;
`
