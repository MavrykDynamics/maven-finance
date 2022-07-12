import styled, { css } from 'styled-components/macro'

import { MavrykTheme } from '../../../styles/interfaces'

export const PaginationWrapper = styled.div<{ theme: MavrykTheme; side?: string }>`
  display: flex;
  max-height: 36px;
  align-items: center;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  color: #8d86eb;
  width: fit-content;
  margin-left: auto;
  margin-top: 20px;

  ${({ side }) =>
    side === 'right'
      ? css`
          margin-left: auto;
        `
      : ''}

  .input_wrapper {
    max-width: 56px;
    margin: 0 10px;

    input {
      padding: 7.5px 0 7.5px 20px;
    }
  }
`

export const PaginationArrow = styled.div<{ isRight?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px 0px;
  border: 1px solid #86d4c9;
  border-radius: 10px;
  border: 1px solid #503eaa;
  height: 36px;
  width: 36px;
  cursor: pointer;
  transition: 0.5s all;
  margin-left: 10px;
  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;

  ${({ isRight }) =>
    isRight
      ? css`
          transform: rotate(180deg);
        `
      : ''}

  svg {
    height: 24px;
    width: 10px;
  }

  &:hover {
    border: 1px solid #86d4c9;

    svg {
      fill: #86d4c9;
      stroke: #86d4c9;
    }
  }
`
