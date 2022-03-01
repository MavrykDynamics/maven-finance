import styled, { keyframes } from 'styled-components/macro'

import { MavrykTheme } from '../../../styles/interfaces'

export const GridSheetStyled = styled.div<{ theme: MavrykTheme }>`
  border-radius: 10px;
  width: 100%;

  > button {
    max-width: 200px;
  }
`

export const GridSheetButtonContainer = styled.div<{ theme: MavrykTheme }>`
  display: flex;
`
export const GridSheetButtons = styled.div<{ theme: MavrykTheme }>`
  margin: 15px 20px 20px 0;

  > button {
    width: 35px;
    height: 35px;
    border-radius: 10px;
    margin-right: 10px;

    > div > svg {
      margin-right: 0;
    }
  }
`

export const GridStyled = styled.div`
  padding: 1rem;

  table {
    border-spacing: 0;
    border: 1px solid black;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid black;
      border-right: 1px solid black;

      :last-child {
        border-right: 0;
      }

      input {
        font-size: 1rem;
        padding: 0;
        margin: 0;
        border: 0;
      }
    }
  }

  .pagination {
    padding: 0.5rem;
  }
`
