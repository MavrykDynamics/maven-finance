import styled, { css } from 'styled-components/macro'
import { primaryColor, subTextColor } from 'styles'

export const JumbotronStyled = styled.div`
  background-image: url('/images/jumbo-bg.svg');
  background-position: top right;
  background-repeat: no-repeat;
  padding: 204px 0px 30px 0px;
  margin: 80px auto 0 auto;

  @media (max-width: 1240px) {
    background-position: top 0 right -200px;
  }

  @media (max-width: 1000px) {
    background-position: top 0 right -300px;
  }

  @media (max-width: 700px) {
    background-position: top -10px right -80px;
    background-size: 90% auto;
  }
`

export const JubontronTitle = styled.div`
  > div {
    font-weight: bold;
    font-size: 64px;
    line-height: 110%;
    letter-spacing: -0.02em;
    color: ${subTextColor};

    &:nth-child(2) {
      color: ${primaryColor};
    }

    @media (max-width: 1240px) {
      font-size: 48px;
    }

    @media (max-width: 1000px) {
      font-size: 36px;
    }

    @media (max-width: 700px) {
      font-size: 24px;
    }
  }
`

export const JubontronSubTitle = styled.div`
  margin: 20px 0 40px 0;
  color: ${subTextColor};
  font-weight: 300;
  font-size: 16px;
  line-height: 160%;

  @media (max-width: 1240px) {
  }

  @media (max-width: 1000px) {
  }

  @media (max-width: 700px) {
    font-size: 14px;
  }
`

export const JubontronContainer = styled.div`
  margin: 0 45% 0 0;

  @media (max-width: 1240px) {
    margin: 0 45% 0 0;
  }

  @media (max-width: 1000px) {
    margin: 0 30% 0 0;
  }

  @media (max-width: 700px) {
    margin: 0 3 0% 0 0;
  }
`

export const JumbotronButtons = styled.div`
  display: grid;
  grid-template-columns: 200px 200px;
  grid-gap: 20px;

  @media (max-width: 700px) {
    grid-template-columns: 150px 150px;
  }
`

export const JumbotronButton = styled.div<{ secondary?: boolean }>`
  height: 56px;
  line-height: 56px;
  font-size: 16px;
  font-weight: bold;
  color: #fff;
  text-align: center;
  background-color: ${primaryColor};
  border-radius: 10px;
  max-width: 200px;

  ${(props) =>
    props.secondary &&
    css`
      color: ${primaryColor};
      background-color: #fff;
      border: 1px solid ${primaryColor};
    `}
`

export const JumbotronSocials = styled.div`
  margin: 50px 0 150px 0;
  display: grid;
  grid-template-columns: 24px 24px 24px 24px;
  grid-gap: 40px;

  svg {
    width: 24px;
    height: 24px;
    fill: ${primaryColor};
  }
`
