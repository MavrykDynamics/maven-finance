import styled from 'styled-components/macro'
import { cianColor, darkColor, headerColor, darkCianColor } from 'styles'
import { MavrykTheme } from '../../../styles/interfaces'

export const TableGridWrap = styled.div<{ theme: MavrykTheme }>`
  position: relative;

  table {
    width: 100%;
    border-collapse: collapse;
  }

  td {
    background-color: ${darkColor};
    height: 39px;
    border: 1px solid ${darkCianColor};
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
    color: ${cianColor};
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
      color: ${cianColor};
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
    border: 1px solid ${darkCianColor};
    border-radius: 10px;
  }

  .tooltip {
    background-color: ${cianColor};
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
      fill: ${cianColor};
      margin-bottom: 4px;
      display: inline-block;
    }
  }
` //TableGridWrap
