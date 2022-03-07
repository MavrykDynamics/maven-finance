import styled from 'styled-components/macro'
import { backgroundColor, containerColor, subTextColor } from 'styles'
import { MavrykTheme } from './interfaces'

export const Page = styled.div<{ theme: MavrykTheme }>`
  margin: auto;
  padding: 40px;
  width: 100%;
  position: relative;
  background-color: ${({ theme }) => theme.containerColor};
  height: 100%;
  min-height: 100vh;
`

export const GridPage = styled.div`
  margin: 30px;
  position: relative;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-gap: 30px;

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
  background-color: ${({ theme }) => theme.backgroundColor};
  border-radius: 10px;
  padding: 35px;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.subTextColor};
`

export const PageContent = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  grid-gap: 20px;
`
