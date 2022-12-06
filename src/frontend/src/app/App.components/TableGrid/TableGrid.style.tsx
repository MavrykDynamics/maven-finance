import styled from 'styled-components/macro'
import { cyanColor, darkColor, headerColor, royalPurpleColor } from 'styles'
import { MavrykTheme } from '../../../styles/interfaces'

export const TableGridWrap = styled.div<{ theme: MavrykTheme }>`
  position: relative;

  table {
    width: 100%;
    border-collapse: collapse;
  }

  tr:hover {
    .delete-button {
      display: block;
    }
  }

  td {
    position: relative;
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

  td,
  input {
    color: ${({ theme }) => theme.dataColor};
    padding-left: 8px;
    padding-right: 8px;
    font-size: 14px;
    text-align: center;
  }

  input {
    background-color: transparent;
    width: 100%;
    height: 100%;
    border: none;

    &:disabled {
      opacity: 0.6;
    }
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

    &:disabled {
      cursor: not-allowed;
      color: ${headerColor};
    }
  }

  tr {
    &:first-child {
      td {
        border-top: none;
        font-weight: 700;
        color: ${({ theme }) => theme.textColor};

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
    height: 100%;
    width: 0;
    position: absolute;
    top: 0;
    right: 0;
  }

  .delete-button {
    width: 40px;
    margin-top: 0;
    position: absolute;
    right: -34px;
    transform: translateY(-50%);
    top: 50%;
    display: none;

    svg {
      width: 11px;
      height: 11px;
      fill: ${cyanColor};
      margin-bottom: 4px;
      display: inline-block;
    }

    &:disabled {
      cursor: not-allowed;

      svg {
        color: ${headerColor};
      }
    }
  }

  .table-drop {
    position: relative;
  }

  .table-drop-btn-cur {
    color: inherit;
    font-size: inherit;
    position: relative;

    & + div {
      top: 16px;
      z-index: 2;
    }

    &::after {
      content: '';
      width: 0;
      height: 0;
      border-style: solid;
      border-width: 4px 4px 0 4px;
      border-color: ${cyanColor} transparent transparent transparent;
      position: absolute;
      right: -16px;
      top: 6px;
    }
  }
`
