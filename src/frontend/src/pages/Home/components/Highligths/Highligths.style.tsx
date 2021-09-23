import styled from 'styled-components/macro'
import { backgroundColor, Page, selectedColor } from 'styles'

export const HighligthsStyled = styled.div`
  padding: 100px 0 200px 0;
  background-image: url('/images/highligths-bg.svg');
  background-position: -200px left;
  background-repeat: no-repeat;
  background-size: contain;
`

export const HighligthsContainer = styled(Page)``

export const HighligthsGrid = styled.div`
  margin-top: 30px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 50px;
`

export const HighligthsSelector = styled.div`
  background: #ffffff;
  box-shadow: 0 1px 0 rgb(34 37 49 / 8%), 0 8px 8px rgb(34 37 49 / 4%);
  border-radius: 10px;
  overflow: hidden;
`

export const HighligthsItem = styled.div<{ selected?: boolean }>`
  padding: 16px 24px;
  display: grid;
  grid-template-columns: 56px auto;
  grid-gap: 30px;
  background-color: ${(props) => (props.selected ? selectedColor : backgroundColor)};
  cursor: pointer;
  font-size: 24px;
  line-height: 56px;
  font-weight: 500;
  text-align: left;
`

export const HighligthsContent = styled.div`
  padding: 10px;

  > h2 {
    font-size: 32px;
    font-weight: 500;
  }

  > p {
    margin-top: 20px;
    font-size: 16px;
    line-height: 22px;
    text-align: left;
    white-space: pre-wrap;
  }
`
