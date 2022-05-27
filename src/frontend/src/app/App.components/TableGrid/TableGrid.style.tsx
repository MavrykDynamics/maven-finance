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

      .delete-button {
        display: block;
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

        &:first-child {
          border-top-left-radius: 10px;
        }

        &:last-child {
          border-top-right-radius: 10px;
        }
      }

      input {
        font-weight: 700;
        color: ${headerColor};
      }
    }

    &:last-child {
      td {
        border-bottom: none;
        &:first-child {
          border-bottom-left-radius: 10px;
        }

        &:last-child {
          border-bottom-right-radius: 10px;
        }
      }
    }
  }

  .btn-add-wrap {
    position: absolute;
    top: -26px;
    right: 0;
  }

  .table-wrap {
    border: 1px solid ${royalPurpleColor};
    border-radius: 10px;
  }

  .tooltip {
    background-color: ${cyanColor};
  }

  .delete-button-wrap {
    height: 0;
    width: 100%;
  }

  .delete-button {
    width: 100%;

    margin-top: 0;
    display: none;

    svg {
      width: 11px;
      height: 11px;
      fill: ${cyanColor};
      margin-bottom: 4px;
      display: inline-block;
    }
  }
` //TableGridWrap
