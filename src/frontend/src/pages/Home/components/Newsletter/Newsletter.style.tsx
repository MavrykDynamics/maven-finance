import styled from 'styled-components/macro'
import { backgroundColor, downColor, Page, primaryColor, upColor } from 'styles'

export const NewsletterStyled = styled(Page)`
  background: url('./images/newsletter-bg.svg'), radial-gradient(65.55% 65.55% at 50% 40.11%, #60558b 0%, #53487f 100%);
  background-repeat: no-repeat;
  background-position: bottom right;
  background-size: fill;
  border-radius: 10px;
  padding: 60px;
  text-align: center;
  margin: 200px auto 100px auto;

  @media (max-width: 700px) {
    padding: 20px;
    margin: 0 auto 100px auto;
  }

  > h1 {
    color: ${backgroundColor};
    margin: auto;
  }
`

export const NewsletterGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 3fr;
  grid-gap: 60px;

  > img {
    width: 100%;
    padding: 30px;
  }

  @media (max-width: 700px) {
    grid-template-columns: auto;
    grid-gap: 0px;
  }
`

export const NewsletterForm = styled.form`
  margin-top: 60px;

  @media (max-width: 700px) {
    margin-top: 40px;
  }

  input {
    background: ${primaryColor}65;
    border-radius: 10px;
    border: none;
    height: 50px;
    line-height: 50px;
    width: 100%;
    padding: 0 0 0 20px;
    margin: 0 0 30px 0;
    box-sizing: border-box;
    color: ${backgroundColor};
    font-size: 16px;
    font-weight: bold;

    @media (max-width: 700px) {
      margin: 0 0 20px 0;
    }

    &::placeholder {
      font-size: 16px;
      color: #ffffff64;
    }
  }
`

export const NewsletterButton = styled.button`
  height: 50px;
  line-height: 50px;
  font-size: 16px;
  font-weight: bold;
  color: ${primaryColor};
  text-align: center;
  background-color: ${backgroundColor};
  border-radius: 10px;
  cursor: pointer;
  width: 200px;
  float: right;
  border: none;
`

export const NewsletterStatus = styled.div`
  float: right;
  line-height: 60px;

  .loading {
    color: ${backgroundColor};
  }

  .success {
    color: ${upColor};
  }

  .error {
    color: ${downColor};
  }
`
