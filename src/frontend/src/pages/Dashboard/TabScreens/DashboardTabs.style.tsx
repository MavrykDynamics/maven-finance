import styled from 'styled-components'
import { cyanColor } from 'styles'
import { MavrykTheme } from 'styles/interfaces'

export const TabWrapperStyled = styled.div<{ theme: MavrykTheme; backgroundImage?: string }>`
  padding: 24px 32px 40px 32px;
  background: ${({ theme }) => theme.containerColor};

  background: ${({ backgroundImage, theme }) =>
    backgroundImage ? `url(images/dashboard/${backgroundImage}), ${theme.containerColor}` : theme.containerColor};
  background-size: auto;
  background-repeat: no-repeat;
  background-position: right bottom;
  border-radius: 10px;
  height: 530px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  .top {
    display: flex;
    width: 100%;
    justify-content: space-between;

    button {
      width: fit-content;
      padding: 0 50px;
    }

    h1 {
      color: ${({ theme }) => theme.dashboardTextColor};

      &:after {
        background-color: ${({ theme }) => theme.dashboardTextColor};
      }
    }
  }

  .descr {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    row-gap: 8px;
    max-width: 600px;

    .title {
      font-weight: 700;
      font-size: 18px;
      line-height: 18px;
      color: ${({ theme }) => theme.dashboardTextColor};
    }

    .text {
      font-weight: 500;
      font-size: 14px;
      line-height: 21px;

      a {
        color: ${cyanColor};
        text-decoration: underline;
      }
    }
  }

  &.oracles {
    .descr {
      max-width: 720px;
    }
  }

  &.vaults {
    .descr {
      max-width: 100%;
    }
  }
`

export const LendingContentStyled = styled.div<{ theme: MavrykTheme }>`
  display: flex;
  justify-content: space-between;
  padding: 0 25px;
  column-gap: 48px;
  margin-bottom: 40px;
  position: relative;

  .spacer {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: -25px;
    height: 280px;
    width: 1px;
    background-color: ${({ theme }) => theme.footerColor};
  }

  .left,
  .right {
    padding-top: 30px;
    width: 45%;
  }

  .left,
  .right {
    .stats-row {
      margin-top: 54px;
      display: flex;
      justify-content: space-between;
    }
  }
`

export const SatellitesContentStyled = styled.div<{ theme: MavrykTheme }>`
  display: grid;
  grid-template-columns: repeat(3, auto);
  flex-direction: column;
  margin-top: 42px;
  row-gap: 20px;
  column-gap: 50px;
  max-width: 600px;
`
