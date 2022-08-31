import styled, { css } from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'
import { CardHover, headerColor, royalPurpleColor } from 'styles'

export const ExpandStyled = styled(CardHover)`
  margin: 0;
  padding: 0;

  .expand-header {
    display: grid;
    grid-template-columns: auto 120px;
    align-items: center;
    min-height: 73px;
    cursor: pointer;
  }

  .arrow-wrap {
    display: flex;
    justify-content: center;
    align-items: center;

    span {
      font-weight: 400;
      font-size: 14px;
      line-height: 21px;
      color: ${headerColor};
      margin-right: 8px;
    }

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

  &.expand-satellite-governance {
    margin-bottom: 16px;

    .expand-header {
      padding-left: 40px;
      padding-right: 20px;
      grid-template-columns: 1fr 260px 1fr 1fr 110px 110px;
    }
  }
`

export const ExpandArticleStyled = styled.article<{ show?: boolean; theme: MavrykTheme }>`
  width: 100%;
  max-height: 0;
  height: fit-content;
  cursor: pointer;
  transition: 0.6s all;
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

  ${({ show }) =>
    show
      ? css`
          max-height: 100%;
        `
      : ''}
`
