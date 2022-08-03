import styled from 'styled-components'
import { cyanColor, silverColor } from 'styles'

export const TopBarLinksStyled = styled.div`
  margin: 0 25px;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;

  @media screen and (max-width: 1360px) {
    margin: 0 15px;
  }

  .group-name {
    font-size: 20px;
    line-height: 0;
    transition: 0.35s all;
    cursor: pointer;
    color: ${silverColor};
    display: flex;
    align-items: center;

    svg {
      width: 20px;
      height: 17px;
      margin-left: 10px;
      transform: rotate(-90deg);
      transition: 0.35s all;
      display: block;
      stroke: ${silverColor};
    }

    &:hover {
      color: ${cyanColor};

      svg {
        stroke: ${cyanColor};
      }
    }

    @media screen and (max-width: 1360px) {
      font-size: 18px;
    }
  }

  &:hover {
    .group-links {
      opacity: 1;
    }

    .group-name {
      color: ${cyanColor};

      svg {
        stroke: ${cyanColor};
      }
    }
  }

  .group-links {
    position: absolute;
    top: 80px;
    opacity: 0;
    z-index: 10;
    padding: 20px 35px 20px 25px;
    background-color: #160e3f;
    border-radius: 10px;
    border: 1px solid #503eaa;
    transition: 0.6s all;
    display: flex;
    flex-direction: column;
    row-gap: 15px;
    width: fit-content;
    color: ${silverColor};

    a {
      text-transform: capitalize;
      white-space: nowrap;
      font-size: 18px;
      transition: 0.35s all;
      color: ${silverColor};
      &:hover {
        color: ${cyanColor};
      }
    }
  }
`
