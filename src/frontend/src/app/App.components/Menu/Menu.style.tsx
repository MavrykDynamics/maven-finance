import styled, { css, keyframes } from 'styled-components/macro'

export const moveDown = keyframes`
  from {
    transform: translateY(-5rem);
  }
  to {
    transform: translateY(0rem);
  }
`
export const MenuStyled = styled.div`
  position: relative;
  text-align: center;
  width: 270px;
  height: 100vh;
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  > div {
    width: 100%;
    max-width: 270px;
  }
`

export const MenuTopSection = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;
  background-image: url('/images/menu-bg.svg');
  background-position: top left;
  background-repeat: no-repeat;
`
export const MenuLogo = styled.img`
  margin: 17px auto 25px auto;
  z-index: 1;
  width: 175px;
`

export const MenuGrid = styled.div`
  //display: grid;
  //grid-template-columns: 50px 50px;
  //grid-gap: 20px 60px;
  display: flex;
  align-items: start;
  flex-direction: column;
  justify-content: space-evenly;
  width: 100%;
`

export const MenuBottomSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 1;
`

export const MenuBanner = styled.img`
  margin: 0 auto 15px auto;
`

export const MenuFooter = styled.div`
  margin: 15px auto 15px auto;
  font-size: 11px;
  font-weight: 600;

  > p {
    display: inline-block;
    font-weight: 500;
  }
`

export const ThemeToggleIcon = styled.svg`
  width: inherit;
  height: inherit;
`
