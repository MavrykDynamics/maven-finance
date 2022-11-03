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


    a {
    &.disabled {
      opacity: 0.6;
      pointer-events: none;
    }
  }
`

export const NavigationLinkItem = styled.div<{
  selected: boolean
  isMobMenuExpanded: boolean
  theme: MavrykTheme
  disabled?: boolean
}>`
  width: 100%;

  ${({ disabled }) =>
    disabled
      ? css`
          cursor: not-allowed;
        `
      : ''}

  > a {
    display: flex;
    margin-left: 20px;

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
  width: 35px;
  cursor: pointer;
  text-align: center;
  font-weight: bold;
  margin-right: 10px;

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
export const SubNavLink = styled.div<{ theme: MavrykTheme; disabled?: boolean }>`
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;

  > a {
    display: flex;
    align-items: center;
    margin-left: 75px;
  }

  ${({ disabled }) =>
    disabled
      ? css`
          cursor: not-allowed;
        `
      : ''}
`

export const SubLinkText = styled.p<{ selected: boolean; theme: MavrykTheme }>`
  font-size: 14px;
  line-height: 17px;
  font-weight: 500;
  text-align: left;
  position: relative;
  transition: 0.3s all;
  color: ${({ theme }) => theme.navTitleColor};

  ${(props) =>
    props.selected &&
    css`
      &:before {
        position: absolute;
        bottom: -1px;
        left: 50%;
        transform: translateX(-50%);
        transition: 0.3s all;
        content: '';
        width: 30px;
        height: 1px;
        background-color: ${({ theme }) => theme.navLinkSubTitleActive};
      }

      color: ${({ theme }) => theme.navLinkSubTitleActive};
    `}

  &:hover:not(.disabled) {
    &:before {
      position: absolute;
      bottom: -1px;
      left: 50%;
      transform: translateX(-50%);
      transition: 0.3s all;
      content: '';
      width: 30px;
      height: 1px;
      background-color: ${({ theme }) => theme.navLinkSubTitleActive};
    }

    color: ${({ theme }) => theme.navLinkSubTitleActive};
  }
`
