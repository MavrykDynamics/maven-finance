import styled from 'styled-components'
import { MavrykTheme } from 'styles/interfaces'

export const SimpletableStyled = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  flex-direction: column;
  row-gap: 13px;

  .row {
    display: flex;
    width: 100%;
    justify-content: space-between;
    position: relative;

    > div {
      color: ${({ theme }) => theme.textColor};
      font-weight: 600;
      flex: 1 1 0;
      width: 0;
      transition: 0.4s all;

      P {
        margin: 0;
      }
    }

    > div:last-child {
      text-align: right;
      padding-right: 8px;
    }

    &:not(.column-names) {
      > div {
        color: ${({ theme }) => theme.dataColor};
      }

      > div:last-child {
        padding-right: 5px;
      }

      &:before {
        position: absolute;
        content: '';
        bottom: -7px;
        width: 100%;
        height: 1px;
        background-color: ${({ theme }) => theme.dataColor};
        transition: 0.4s all;
      }
    }

    &:last-child {
      &:before {
        display: none;
      }
    }

    &:hover {
      > div {
        color: ${({ theme }) => theme.navTitleColor};
      }

      &:before {
        background-color: ${({ theme }) => theme.navTitleColor};
      }
    }
  }

  .table-content {
    display: flex;
    flex-direction: column;
    max-height: 140px;
    overflow-y: auto;
    row-gap: 17px;

    .row-item {
      text-transform: uppercase;
    }
  }

  &.dashboard-st {
    margin-top: 20px;

    &.vaults {
      max-height: 115px;
    }
  }
`
