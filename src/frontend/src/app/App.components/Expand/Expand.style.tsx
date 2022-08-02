import styled from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'
import { CardHover, headerColor, royalPurpleColor } from 'styles'

export const ExpandStyled = styled(CardHover)`
  margin: 0;
  padding: 0;

  .expand-header {
    display: grid;
    grid-template-columns: auto 120px;
    align-items: center;
    min-height: 75px;
    cursor: pointer;
  }

  .arrow-wrap {
    display: grid;
    place-items: center;

    svg {
      fill: none;
      stroke: ${headerColor};
      stroke-width: 5px;
      height: 12px;
      width: 16px;
      transition: transform 0.3s ease-in-out;
    }

    &.top {
      svg {
        transform: rotate(-180deg);
      }
    }
  }
`

export const ExpandArticleStyled = styled.article<{ height: number; theme: MavrykTheme }>`
  width: 100%;
  height: 0;
  cursor: pointer;
  transition: height 0.3s ease-in-out; /* added */
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    border-top: 1px solid ${royalPurpleColor};
    width: 100%;
    left: 0;
    top: 1px;
  }

  &.show {
    height: ${({ height }) => height}px;
  }
  &.hide {
    height: 0; /* changed */
  }
`
