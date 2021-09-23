import styled from 'styled-components/macro'
import { backgroundColor, containerColor, Page, primaryColor } from 'styles'

export const CalculatorStyled = styled(Page)`
  margin-bottom: 100px;
`

export const CalculatorCointainer = styled.div`
  background-color: ${containerColor};
  display: grid;
  grid-template-columns: 60% 40%;
  grid-gap: 10px;
  border-radius: 10px;
`

export const CalculatorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 20px;
  padding: 50px 50px 30px 50px;
`

export const CalculatorGrid2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  grid-gap: 20px;
  padding: 0 50px 30px 50px;
`

export const CalculatorInput = styled.div<{ shift?: boolean }>`
  position: relative;

  div {
    font-size: 14px;
    line-height: 14px;
    color: ${primaryColor};
  }

  select,
  input {
    background: ${backgroundColor};
    border-radius: 10px;
    border: none;
    height: 50px;
    line-height: 50px;
    width: 100%;
    padding: ${(props) => (props.shift ? '0 0 0 40px' : '0 0 0 20px')};
    margin: 8px 0;
    box-sizing: border-box;
    color: ${primaryColor};
    cursor: pointer;
    font-size: 20px;
    font-weight: bold;
  }

  select {
    appearance: none;
    background-image: linear-gradient(45deg, transparent 50%, ${primaryColor} 50%),
      linear-gradient(135deg, ${primaryColor} 50%, transparent 50%);
    background-position: calc(100% - 20px) calc(1em + 2px), calc(100% - 15px) calc(1em + 2px), 100% 0;
    background-size: 5px 5px, 5px 5px, 2.5em 2.5em;
    background-repeat: no-repeat;
  }

  input[type='range'] {
    -webkit-appearance: none;
    width: 100%;
    height: 10px;
    margin-top: 27px;
    background: ${backgroundColor};
    outline: none;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 23px;
      height: 23px;
      border-radius: 100%;
      background: ${primaryColor};
      cursor: pointer;
    }
  }

  > p {
    position: absolute;
    top: 13px;
    left: 17px;
    line-height: 50px;
    color: ${primaryColor};
    font-size: 20px;
    font-weight: bold;
  }
`

export const CalculatorResults = styled.div`
  background: url('./images/calculator-bg.svg'), radial-gradient(65.55% 65.55% at 50% 40.11%, #60558b 0%, #53487f 100%);
  background-repeat: no-repeat;
  background-position: bottom right;
  border-radius: 0px 10px 10px 0px;
  padding: 15px 35px;
  text-align: center;
`

export const CalculatorResult = styled.div`
  margin-top: 30px;

  > div {
    font-size: 14px;
    line-height: 14px;
    color: ${backgroundColor};
    font-weight: 500;
  }

  > p {
    font-size: 50px;
    line-height: 50px;
    color: ${backgroundColor};
    font-weight: bold;
  }
`

export const CalculatorResultFee = styled.div`
  margin-top: 40px;
  font-size: 14px;
  line-height: 14px;
  font-weight: 500;
  color: ${backgroundColor};
  opacity: 0.8;
`

export const CalculatorButton = styled.div`
  height: 50px;
  line-height: 50px;
  font-size: 16px;
  font-weight: bold;
  color: ${backgroundColor};
  text-align: center;
  background-color: ${primaryColor};
  border-radius: 10px;
  cursor: pointer;
`
