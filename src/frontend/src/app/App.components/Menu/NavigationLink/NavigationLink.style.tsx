import styled, { css } from 'styled-components/macro'
import { MavrykTheme } from '../../../../styles/interfaces'

export const NavigationLinkContainer = styled.div<{ selected: boolean; theme: MavrykTheme }>`
  width: 100%;

  ${(props) =>
    props.selected &&
    css`
      background: ${({ theme }) => theme.navLinkBackgroundActive};
      color: ${({ theme }) => theme.navLinkTextActive};
      border-radius: 0 10px 10px 0;
    `}
`

export const NavigationLinkItem = styled.div<{ selected: boolean; theme: MavrykTheme }>`
  width: 100%;
  margin: 5px 0;
  > a {
    display: flex;
    margin-left: 50px;

    #navLinkTitle {
      font-size: 14px;
      line-height: 31px;
      font-weight: 600;
      color: ${({ theme }) => theme.subTextColor};
      display: flex;
      align-items: center;
      justify-content: space-around;
    }

    ${(props) =>
      props.selected &&
      css`
        #navLinkTitle {
          color: ${({ theme }) => theme.navLinkTextActive};
        }
      `}
  }
`
export const NavigationLinkIcon = styled.div<{ selected: boolean; theme: MavrykTheme }>`
  width: 50px;
  height: 50px;
  cursor: pointer;
  text-align: center;
  font-weight: bold;
  line-height: 50px;
  margin-right: 15px;

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
      > svg {
        stroke: ${({ theme }) => theme.navLinkTextActive};
      }
    `}
`

export const NavigationSubLinks = styled.div<{ theme: MavrykTheme }>`
  background: ${({ theme }) => theme.backgroundColor};
`
export const SubNavLink = styled.div<{ theme: MavrykTheme }>`
  width: 100%;

  > a {
    display: flex;
    align-items: center;
    margin-left: 50px;
    > div {
      width: 50px;
      height: 50px;
      margin-right: 15px;
    }
  }
`

export const SubLinkText = styled.p<{ selected: boolean; theme: MavrykTheme }>`
  font-size: 14px;
  line-height: 31px;
  font-weight: 500;
  text-align: left;
  color: ${({ theme }) => theme.subTextColor};

  ${(props) =>
    props.selected &&
    css`
      color: ${({ theme }) => theme.navLinkTextActive};
    `}
`
