import styled, { css } from 'styled-components/macro'
import { MavrykTheme } from '../../../../styles/interfaces'

export const NavigationLinkContainer = styled.div<{ theme: MavrykTheme }>`
  width: 100%;
`

export const NavigationLinkItem = styled.div<{ selected: boolean; theme: MavrykTheme }>`
  width: 100%;
  margin: 5px 0;
  > a {
    display: flex;
    margin-left: 50px;

    #navLinkTitle {
      font-size: 13px;
      line-height: 31px;
      font-weight: 600;
      color: ${({ theme }) => theme.subTextColor};
      display: flex;
      align-items: center;
      justify-content: space-around;
    }

    #navLinkIcon {
      margin-right: 15px;
    }
  }
`
export const NavigationLinkIcon = styled.div<{ selected: boolean; theme: MavrykTheme }>`
  width: 50px;
  height: 50px;
  cursor: pointer;
  background: ${({ theme }) => theme.containerColor};
  border-radius: 10px;
  color: ${({ theme }) => theme.subTextColor};
  text-align: center;
  font-weight: bold;
  line-height: 50px;

  > svg {
    display: inline-block;
    width: 24px;
    height: 24px;
    margin: 14px 9px 13px 8px;
    stroke: ${({ theme }) => theme.subTextColor};
    vertical-align: top;
  }

  ${(props) =>
    props.selected &&
    css`
      background: ${({ theme }) => theme.primaryColor};
      color: ${({ theme }) => theme.backgroundColor};
      box-shadow: 2px 4px 4px rgba(112, 104, 170, 0.3);

      > div {
        color: ${({ theme }) => theme.text};
      }

      > svg {
        stroke: ${({ theme }) => theme.backgroundColor};
      }
    `}
`

export const NavigationSubLinks = styled.div<{ theme: MavrykTheme }>`
  background: ${({ theme }) => theme.backgroundColor};
`
export const SubNavLink = styled.div<{ selected: boolean; theme: MavrykTheme }>`
  color: ${({ theme }) => theme.backgroundColor};

  display: flex;
  align-items: center;

  > div {
    width: 50px;
    height: 50px;
    margin-right: 15px;
  }

  ${(props) =>
    props.selected &&
    css`
      background: ${({ theme }) => theme.primaryColor};
      color: ${({ theme }) => theme.backgroundColor};

      > p {
        color: ${({ theme }) => theme.backgroundTextColor};
      }

      > svg {
        stroke: ${({ theme }) => theme.backgroundColor};
      }
    `}
`

export const SubLinkText = styled.p<{ theme: MavrykTheme }>`
  color: ${({ theme }) => theme.primaryColor};
`
