import styled, { css, keyframes } from 'styled-components/macro'
import { backgroundTextColor, borderColor, subTextColor, textColor } from 'styles'

export const EditLayersStyled = styled.div``

export const EditLayersMenu = styled.div`
  margin-top: 60px;
  display: grid;
  grid-template-columns: 100px 90px 10px 90px 100px 250px 200px;
  grid-gap: 20px;

  > div {
    line-height: 36px;
    color: ${subTextColor};
  }

  > div:nth-child(1),
  div:nth-child(5) {
    text-align: right;
  }
`

export const EditLayersCanvas = styled.div``

export const EditLayersCanvasTop = styled.div`
  width: 200px;
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

export const EditLayersCanvasBottom = styled.div<{ width: number }>`
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

export const EditLayersCanvasLeft = styled.div<{ height: number }>`
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

export const EditLayersCanvasRight = styled.div<{ height: number }>`
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

export const EditLayersTile = styled.div<{ width: number; height: number }>`
  width: ${({ width }) => width}px;
  min-height: 150px;
  max-width: 200px;
  max-height: 500px;
  box-sizing: border-box;
  position: relative;
  font-weight: bold;
  outline: 1px solid ${borderColor};

  > div {
    position: absolute;
    width: ${({ width }) => width}px;
    height: 100%;
    max-width: 200px;
    max-height: 500px;
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
    max-width: 200px;
    max-height: 500px;
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

export const EditLayersLoading = styled.div`
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

export const EditLayersGrid = styled.div`
  display: grid;
  margin-top: 40px;
  grid-template-columns: 200px auto;
  grid-gap: 20px;
`

export const EditLayersResult = styled.div`
  position: relative;
`

export const EditLayersResultLayer = styled.div<{ layer: number; width: number; height: number }>`
  width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
  box-sizing: border-box;
  position: absolute;
  top: 0;
  left: 0;

  > img {
    width: ${({ width }) => width}px;
    height: ${({ height }) => height}px;
  }
`
