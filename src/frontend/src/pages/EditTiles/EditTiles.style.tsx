import styled, { css, keyframes } from 'styled-components/macro'
import { backgroundTextColor, borderColor, subTextColor, textColor } from 'styles'

export const EditTilesStyled = styled.div``

export const EditTilesMenu = styled.div`
  margin-top: 60px;
  display: grid;
  grid-template-columns: 140px 100px 90px 10px 90px 100px 250px 200px;
  grid-gap: 20px;

  > div {
    line-height: 36px;
    color: ${subTextColor};
  }

  > div:nth-child(2),
  div:nth-child(6) {
    text-align: right;
  }
`

export const EditTilesCanvas = styled.div<{ width: number }>`
  margin-top: 40px;
  display: grid;
  grid-template-columns: 50px ${({ width }) => width}px 50px;
`

export const EditTilesCanvasTop = styled.div<{ width: number }>`
  width: ${({ width }) => width}px;
  height: 50px;
  border: 1px solid ${borderColor};
  box-sizing: border-box;
  cursor: pointer;
  text-align: center;
  border-radius: 10px 10px 0 0;

  > img {
    margin: 14px auto;
  }
`

export const EditTilesCanvasBottom = styled.div<{ width: number }>`
  width: ${({ width }) => width}px;
  height: 50px;
  border: 1px solid ${borderColor};
  box-sizing: border-box;
  cursor: pointer;
  text-align: center;
  border-radius: 0 0 10px 10px;

  > img {
    margin: 14px auto;
    transform: rotate(180deg);
  }
`

export const EditTilesCanvasLeft = styled.div<{ height: number }>`
  margin-top: 50px;
  width: 50px;
  height: ${({ height }) => height}px;
  border: 1px solid ${borderColor};
  box-sizing: border-box;
  cursor: pointer;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-radius: 10px 0 0 10px;

  > img {
    margin: auto 14px;
    transform: rotate(270deg);
  }
`

export const EditTilesCanvasRight = styled.div<{ height: number }>`
  margin-top: 50px;
  width: 50px;
  height: ${({ height }) => height}px;
  border: 1px solid ${borderColor};
  box-sizing: border-box;
  cursor: pointer;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: space-around;
  border-radius: 0 10px 10px 0;

  > img {
    margin: auto 14px;
    transform: rotate(90deg);
  }
`

export const EditTilesCanvasMiddle = styled.div<{ tileWidth: number; canvasWidth: number }>`
  display: grid;
  grid-template-columns: repeat(${({ canvasWidth }) => canvasWidth}, ${({ tileWidth }) => tileWidth}px);
`

export const EditTilesTile = styled.div<{ width: number; height: number; showGrid: boolean }>`
  width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
  box-sizing: border-box;
  position: relative;
  font-weight: bold;

  ${({ showGrid }) =>
    showGrid &&
    css`
      outline: 1px solid ${borderColor};
    `}

  > div {
    position: absolute;
    width: ${({ width }) => width}px;
    height: ${({ height }) => height}px;
    background-color: #000000a0;
    opacity: 0;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;

    p {
      margin: 0;
    }

    &:hover {
      opacity: 1;
    }
  }

  > img {
    width: ${({ width }) => width}px;
    height: ${({ height }) => height}px;
  }
`

export const UploaderFileSelector = styled.div`
  margin: 15px 0;
  cursor: pointer;

  > input {
    width: 86px;
  }
`

export const UploaderLabel = styled.label`
  border: 1px dashed ${textColor};
  box-sizing: border-box;
  border-radius: 5px;
  cursor: pointer;
  user-select: none;
  color: ${textColor};
  font-weight: bold;
  padding: 10px;

  > svg {
    width: 24px;
    height: 24px;
    stroke: ${textColor};
    margin-right: 10px;
    margin-bottom: -8px;
  }
`

const turn = keyframes`
  100% {
      transform: rotate(-360deg);
  }
`

export const EditTilesLoading = styled.div`
  > div {
    display: inline-block;
  }

  > svg {
    animation: ${turn} 1.6s linear infinite forwards;
    display: inline-block;
    width: 24px;
    height: 24px;
    stroke: ${textColor};
    margin-right: 10px;
    margin-bottom: -8px;
  }
`

export const TileVoting = styled.div`
  margin: 10px 0;
`

export const TileVotingButtons = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  grid-gap: 10px;
  margin: 10px 0;
  cursor: pointer;
`
