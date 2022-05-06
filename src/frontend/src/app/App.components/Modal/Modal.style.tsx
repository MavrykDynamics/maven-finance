import styled, { keyframes } from 'styled-components/macro'

import { whiteColor } from '../../../styles'

export const PageHeaderStyled = styled.div<{ backgroundImageSrc: string }>`
  background-image: url(${({ backgroundImageSrc }) => backgroundImageSrc});
  background-size: cover;
  background-position: top right;
  background-repeat: no-repeat;
  border-radius: 24px;
  width: 100%;
  height: 150px;
  position: relative;
`

export const PageHeaderTextArea = styled.div`
  margin: 40px 0 0 40px;
  position: absolute;
  max-width: 35%;
  > h1 {
    color: ${whiteColor};
    font-size: 25px;
    margin: 0;
  }

  > p {
    color: ${whiteColor};
    font-size: 14px;
    margin: 0;
  }
`

export const PageHeaderForegroundImageContainer = styled.div`
  width: 100%;
  height: 150px;
  display: flex;
  justify-content: flex-end;
  overflow: visible;
`
