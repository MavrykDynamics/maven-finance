import styled, { css } from 'styled-components/macro'
import { Page, secondaryColor, subTextColor } from 'styles'

export const LitepaperStyled = styled(Page)`
  font-size: 16px;
  color: ${subTextColor};
  margin: 100px auto;

  p,
  li {
    line-height: 27px;
  }

  table {
    width: 100%;
    margin-bottom: 10px;
    text-align: left;

    th,
    tr {
      height: 36px;
    }
  }

  a {
    color: ${secondaryColor};
    /* text-decoration: underline; */
  }

  h2 {
    margin: 50px 0 20px 0;
    font-size: 24px;
    font-weight: bold;
    padding-bottom: 10px;
    /* border-bottom: 1px solid #eee; */

    &::after {
      content: '';
      display: block;
      width: 60px;
      height: 3px;
      background-color: #7068aa;
      margin: 7px 0 10px 1px;
    }
  }

  h3 {
    margin: 40px 0 20px 0;
    font-size: 22px;
    font-weight: bold;
    padding-bottom: 10px;
    /* border-bottom: 1px solid #eee; */

    &::after {
      content: '';
      display: block;
      width: 60px;
      height: 3px;
      background-color: #7068aa;
      margin: 7px 0 10px 1px;
    }
  }

  img {
    max-width: 100%;
    margin-bottom: 10px;
  }

  footer > div {
    margin-top: 10px;
  }
`

export const LitepaperGrid = styled.div`
  display: grid;
  grid-template-columns: 260px auto;
  grid-gap: 30px;

  @media (max-width: 700px) {
    grid-template-columns: auto;
  }
`

export const LitepaperIndex = styled.ul`
  font-size: 14px;
  line-height: 14px;
  margin-top: 0;
  position: fixed;
  width: 260px;
  padding-left: 0;

  @media (max-width: 700px) {
    display: none;

    > div {
      width: calc(100vw - 70px);
    }
  }

  li {
    display: block;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-top: 10px;
  }

  li a {
    font-size: 12px;
    color: #7068aa;
    text-decoration: none;
  }

  li ul {
    padding-left: 20px;
  }
`

export const LitepaperRef = styled.a<{ selected?: boolean }>`
  padding-left: 5px;

  ${(props) =>
    props.selected &&
    css`
      font-weight: bold;
      border-left: 2px solid ${subTextColor};
    `}
`
