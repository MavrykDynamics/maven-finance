import styled from 'styled-components/macro'

export const SatellitesStyled = styled.div`
  background-image: url('/images/satellite-bg.svg');
  background-position: center;
  background-repeat: no-repeat;
  text-align: center;

  padding: 100px 20px 300px 20px;
  margin: -100px auto -200px auto;

  max-width: 100vw;
  width: 1280px;
  position: relative;
`

export const SatellitesImage = styled.div`
  background-image: url('/images/satellites.svg');
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
  height: 400px;

  @media (max-width: 500px) {
    background-image: url('/images/satellites-mobile.svg');
    height: 650px;
  }
`
