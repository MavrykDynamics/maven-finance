import styled from 'styled-components/macro'
import { headerColor, cyanColor } from 'styles'

export const CarouselStyle = styled.div`
  position: relative;
  margin-left: auto;
  margin-right: auto;

  .selected {
    position: absolute;
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
    color: ${headerColor};
    right: 16px;
    top: -54px;
  }
`

export const CarouselViewport = styled.div`
  overflow: hidden;
  width: 100%;
`

export const CarouselContainer = styled.div`
  display: flex;
  user-select: none;
`

export const CarouselButton = styled.button`
  outline: 0;
  cursor: pointer;
  background-color: var(--carousel-button-bg);
  touch-action: manipulation;
  position: absolute;
  z-index: 1;
  top: 50%;
  transform: translateY(-50%);
  border: 1px solid #503eaa;
  width: var(--carousel-button-size);
  height: var(--carousel-button-size);
  justify-content: center;
  align-items: center;
  padding: 0;
  fill: transparent;
  border-radius: 50px;
  display: flex;

  svg {
    width: 64%;
    height: 64%;
    stroke: ${cyanColor};
    transform: rotate(90deg);
    margin-right: 3px;
  }

  &:disabled {
    cursor: default;
    opacity: 0.3;
  }

  &.button--prev {
    left: var(--carousel-button-indent);
  }

  &.button--next {
    right: var(--carousel-button-indent);

    svg {
      transform: rotate(270deg);
      margin: 0;
      margin-left: 3px;
    }
  }
`
