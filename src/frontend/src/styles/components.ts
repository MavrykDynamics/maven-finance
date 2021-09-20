import styled from 'styled-components/macro'

export const Page = styled.div`
  margin: auto;
  padding: 0 20px;
  max-width: calc(100vw - 40px);
  width: 1280px;
  position: relative;
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
