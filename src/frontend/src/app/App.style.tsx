import styled from 'styled-components/macro'

import { MavrykTheme } from '../styles/interfaces'

export const AppStyled = styled.div<{ theme: MavrykTheme }>`
  min-height: 100vh;
  display: grid;
  grid-template-columns: 270px auto;
`
export const LoaderStyled = styled.div<{ theme: MavrykTheme }>`
  position: fixed;
  inset: 0;
  transition: background-color 0.15s ease-in-out;
  background-color: #00000070;
  display: flex;
  z-index: 6;
  justify-content: center;
  align-items: center;
`

export const AppBg = styled.div<{ theme: MavrykTheme }>`
  position: fixed;
  top: 0;
  left: 0;
  min-width: 100vw;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.containerColor};
  /* background-image: url('/images/bg.png');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover; */
`

export const AppWrapper = styled.div`
  position: absolute;
  width: 100vw;
  top: 0;
  background: url('/images/grid.svg') repeat center top;
  /* height: 100vh; */
  will-change: transform, opacity;
`
export const EmptyContainer = styled.figure<{ theme: MavrykTheme }>`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0;
  color: ${({ theme }) => theme.headerColor};
  font-size: 18px;
  font-weight: 800;
  flex-direction: column;
  padding-top: 16px;

  & ~ figure {
    display: none;
  }
`
