import styled from 'styled-components/macro'
import { cyanColor, darkColor, headerColor, royalPurpleColor } from 'styles'
import { MavrykTheme } from '../../../styles/interfaces'

export const TableGridWrap = styled.div<{ theme: MavrykTheme }>`
  position: relative;

  table {
    width: 100%;
    border-collapse: collapse;
  }

  td {
    background-color: ${darkColor};
    height: 40px;
    border: 1px solid ${royalPurpleColor};
    &:first-child {
      border-left: none;
    }

    &:last-child {
      border-right: none;
    }

    &.active-td {
      background-color: ${headerColor};

      input {
        color: ${darkColor}!important;
      }
    }
  }

  input {
    color: ${cyanColor};
    background-color: transparent;
    width: 100%;
    text-align: center;
    height: 100%;
    padding-left: 8px;
    padding-right: 8px;
    border: none;
    font-size: 14px;
  }

  button {
    color: ${headerColor};
    font-size: 24px;

    &.btn-add-row {
      position: absolute;
      left: -20px;
      bottom: -6px;
    }

    &:hover {
      color: ${cyanColor};
    }
  }

  tr {
    &:first-child {
      td {
        border-top: none;
      }

      input {
        font-weight: 700;
        color: ${headerColor};
      }
    }

    &:last-child {
      td {
        border-bottom: none;
      }
    }
  }

  .btn-add-wrap {
    display: flex;
    justify-content: flex-end;
    margin-top: -16px;
  }

  .table-wrap {
    border: 1px solid ${royalPurpleColor};
    border-radius: 10px;
    overflow: hidden;
  }

  .tooltip {
    background-color: ${cyanColor};
  }
`
