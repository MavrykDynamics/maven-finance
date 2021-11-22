import { shakes } from 'pages/Doorman/DoormanHeader/DoormanHeader.style'
import styled from 'styled-components/macro'
import { backgroundColor } from 'styles'

export const SatellitesHeaderStyled = styled.div`
  background: url('/images/stars.svg'), radial-gradient(33.05% 130.68% at 69.09% 89.38%, #60558b 0%, #53487f 100%);
  background-size: contain;
  background-position: top right;
  background-repeat: no-repeat;
  border-radius: 10px;
  width: 100%;
  height: 150px;
  position: relative;

  > h1 {
    color: ${backgroundColor};
    font-size: 25px;
    margin: 40px 0 0 40px;
  }

  > p {
    color: ${backgroundColor};
    font-size: 14px;
    margin: 0 0 0 40px;
  }

  > img {
    position: absolute;
    top: -40px;
    right: 200px;
    animation: ${shakes} 3s linear infinite;
  }
`
