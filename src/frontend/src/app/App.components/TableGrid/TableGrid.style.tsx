import styled from 'styled-components/macro'
import { cianColor, darkColor, headerColor } from 'styles'
import { MavrykTheme } from '../../../styles/interfaces'

export const TableGridWrap = styled.div<{ theme: MavrykTheme }>`
  table {
    width: 100%;
    border-collapse: collapse;
  }

  td {
    background-color: ${darkColor};
    height: 40px;
    border: 1px solid #503eaa;
  }

  input {
    color: ${cianColor};
    background-color: transparent;
    width: 100%;
    text-align: center;
    height: 100%;
    padding-left: 8px;
    padding-right: 8px;
    border: none;
  }

  button {
    color: ${headerColor};
    font-size: 20px;
    &:hover {
      color: #86d4c9;
    }
  }

  tr {
    &:first-child {
      td {
        border-top: none;
        &:first-child {
          border-left: none;
        }

        &:last-child {
          border-right: none;
        }
      }

      input {
        color: #8d86eb;
      }
    }

    &:last-child {
      td {
        border-bottom: 0;

        &:first-child {
          border-left: none;
        }

        &:last-child {
          border-right: none;
        }
      }
    }
  }

  .btn-add-wrap {
    display: flex;
    justify-content: flex-end;
  }

  .table-wrap {
    border: 1px solid #503eaa;
    border-radius: 10px;
    overflow: hidden;
  }
`
