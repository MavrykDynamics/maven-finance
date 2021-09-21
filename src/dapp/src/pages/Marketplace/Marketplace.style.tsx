import styled from 'styled-components/macro'
import { backgroundColor, borderColor, textColor } from 'styles'

export const MarketplaceStyled = styled.div`
  margin: 20px auto;
`

export const MarketplaceContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 290px);
  grid-gap: 20px;
  margin: 0 auto 40px auto;
`

export const MarketplaceCanvas = styled.div`
  width: 290px;
  height: 330px;
  background-color: ${backgroundColor};
  color: ${textColor};
  border: 1px solid ${borderColor};
  border-radius: 10px;
  padding: 10px;
`

export const MarketplaceCanvasTiles = styled.div`
  width: 270px;
  height: 200px;
  border: 1px solid ${borderColor};
  border-radius: 5px;
  overflow: hidden;
  position: relative;
`

export const MarketplaceCanvasTileCount = styled.div`
  margin-top: 10px;

  > svg {
    width: 24px;
    height: 24px;
    stroke: ${borderColor};
    display: inline-block;
  }

  > div {
    display: inline-block;
    line-height: 24px;
    margin-left: 10px;
    vertical-align: top;
  }
`

export const MarketplaceCanvasTileExpiry = styled.div`
  margin-top: 5px;

  > svg {
    width: 24px;
    height: 24px;
    stroke: ${borderColor};
    display: inline-block;
  }

  > div {
    display: inline-block;
    line-height: 24px;
    margin-left: 10px;
    vertical-align: top;
  }
`

export const MarketplaceCanvasTileContribute = styled.div`
  width: 270px;
  height: 32px;
  background-color: ${backgroundColor};
  color: ${textColor};
  border: 1px solid ${borderColor};
  font-weight: bold;
  border-radius: 5px;
  overflow: hidden;
  text-align: center;
  line-height: 32px;
  margin-top: 10px;
  cursor: pointer;
`

export const MarketplaceCanvasTileSold = styled.div`
  width: 270px;
  height: 32px;
  background-color: ${backgroundColor};
  color: ${textColor};
  font-weight: bold;
  border-radius: 5px;
  overflow: hidden;
  text-align: center;
  line-height: 32px;
  margin-top: 10px;
`

export const MarketplaceCanvasTileScaler = styled.div<{ scale: number }>`
  position: absolute;
  top: 0;
  left: 0;
  transform: scale(${(props) => props.scale});
  transform-origin: top left;
`

export const MarketplaceCanvasTileContainer = styled.div<{ tileWidth: number; canvasWidth: number }>`
  display: grid;
  grid-template-columns: repeat(${({ canvasWidth }) => canvasWidth}, ${({ tileWidth }) => tileWidth}px);
`

export const MarketplaceCanvasTile = styled.div<{ width: number; height: number }>`
  width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
  box-sizing: border-box;
  position: relative;

  > img {
    width: ${({ width }) => width}px;
    height: ${({ height }) => height}px;
  }
`

export const MarketplaceCanvasLayer = styled.div<{ layer: number; width: number; height: number }>`
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
