import styled, { css } from 'styled-components/macro'

import { MavrykTheme } from '../../../../styles/interfaces'

export const NavigationLinkContainer = styled.div<{
  selected: boolean
  isMobMenuExpanded: boolean
  theme: MavrykTheme
}>`
  width: 100%;

  &:nth-of-type(1) {
    svg {
      stroke: ${({ theme }) => theme.navIconColor};
    }
  }

  ${({ isMobMenuExpanded }) =>
    !isMobMenuExpanded
      ? css`
          display: flex;
          justify-content: center;
          align-items: center;

          .navLinkIcon,
          a {
            width: fit-content;
            margin: 0;
          }
        `
      : ''}

  ${(props) =>
    props.selected &&
    css`
      background: ${({ theme }) => theme.navLinkBackgroundActive};
      color: ${({ theme }) => theme.navLinkTextActive};
      border-radius: 0 10px 10px 0;

      &:nth-of-type(1) {
        svg {
          stroke: ${({ theme }) => theme.navLinkTextActive};
        }
      }
    `}
`

export const NavigationLinkItem = styled.div<{
  selected: boolean
  isMobMenuExpanded: boolean
  theme: MavrykTheme
}>`
  width: 100%;

  > a {
    display: flex;
    margin-left: 30px;

    .navLinkTitle {
      font-size: 16px;
      line-height: 31px;
      font-weight: 600;
      color: ${({ theme }) => theme.navTitleColor};
      display: flex;
      align-items: center;
      justify-content: space-around;
    }

    ${(props) =>
      props.selected &&
      css`
        .navLinkTitle {
          color: ${({ theme }) => theme.navLinkTextActive};
        }
      `}
  }

  ${({ isMobMenuExpanded }) =>
    !isMobMenuExpanded
      ? css`
          display: flex;
          justify-content: center;
          align-items: center;

          .navLinkIcon,
          > a {
            width: fit-content;
            margin: 0;
          }
        `
      : ''}
`
export const NavigationLinkIcon = styled.div<{ selected: boolean; theme: MavrykTheme }>`
  width: 50px;
  cursor: pointer;
  text-align: center;
  font-weight: bold;
  margin-right: 4px;

  > svg {
    display: inline-block;
    width: 27px;
    height: 50px;
    fill: ${({ theme }) => theme.navIconColor};
    vertical-align: top;
  }

  ${(props) =>
    props.selected &&
    css`
      > svg {
        fill: ${({ theme }) => theme.navLinkTextActive};
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
    margin-left: 42px;

    > div {
      width: 50px;
      height: 50px;
      margin-right: 4px;
      flex-shrink: 0;
    }
  }
`

export const SubLinkText = styled.p<{ selected: boolean; theme: MavrykTheme }>`
  font-size: 14px;
  line-height: 17px;
  font-weight: 500;
  text-align: left;
  color: ${({ theme }) => theme.subTextColor};
  padding-right: 16px;

  &.navLinkSubTitle {
    color: ${({ theme }) => theme.navTitleColor};
  }

  ${(props) =>
    props.selected &&
    css`
      color: ${({ theme }) => theme.navLinkTextActive};

      &.navLinkSubTitle {
        color: ${({ theme }) => theme.navLinkSubTitleActive};
      }
    `}
`
