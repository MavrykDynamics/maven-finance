import styled, { keyframes } from 'styled-components/macro'

import { MavrykTheme } from '../../../styles/interfaces'
import { primaryColor, headerColor, cyanColor } from 'styles'

export const IPFSUploaderStyled = styled.div<{ theme: MavrykTheme }>`
  margin-bottom: 5px;
  margin-top: 19px;

  label {
    margin-bottom: 10px;

    & + div {
    }
  }

  > p {
    font-weight: 700;
    color: ${({ theme }) => theme.textColor};
  }
`

export const UploaderFileSelector = styled.div<{ theme: MavrykTheme }>`
  cursor: pointer;
  height: 107px;
  width: 100%;
  background-color: ${({ theme }) => theme.containerColor};
  display: flex;
  border-radius: 10px;
  justify-content: center;
  align-items: center;
  position: relative;
  background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='10' ry='10' stroke='%23503EAAFF' stroke-width='2' stroke-dasharray='10' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e");

  &.disabled {
    cursor: default;
  }

  &:hover:not(.disabled) {
    background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' rx='10' ry='10' stroke='%2386D4C9FF' stroke-width='2' stroke-dasharray='10' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e");

    figcaption {
      color: ${cyanColor};
    }
  }

  .delete-icon {
    position: absolute;
    fill: ${({ theme }) => theme.headerColor};
    width: 16px;
    height: 16px;
    display: block;
    top: 16px;
    right: 16px;
  }

  > div {
    width: 100%;
    height: 100%;
    position: relative;

    > input {
      all: unset;
      display: inline-block;
      border-radius: 10px;
      outline: none;
      width: 100%;
      height: 100%;
      appearance: initial;
      opacity: 0;
      position: relative;
      -webkit-appearance: none;
    }
  }

  .loading-icon {
    width: 30px;
    height: 30px;
  }

  .uploaded-image {
    position: relative;
    object-fit: cover;
  }
`

export const UploadIconContainer = styled.div<{ theme: MavrykTheme }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  /* width: 50px;
  height: 50px; */
  display: flex;
  flex-direction: column;
  align-items: center;

  .upload-figure {
    font-size: 12px;
    font-weight: 400;
    color: ${({ theme }) => theme.headerColor};
    white-space: nowrap;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0;

    small {
      font-weight: 400;
      padding-top: 4px;
      font-size: 10px;
      line-height: 10px;
      color: ${primaryColor};
    }
  }

  .icon-wrap {
    height: 39px;
  }

  .upload-icon {
    stroke: ${({ theme }) => theme.headerColor};
    width: 24px;
    height: 24px;
    display: block;
  }

  .pencil-wrap {
    width: 16px;
    height: 16px;
    background-color: ${({ theme }) => theme.headerColor};
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    position: absolute;
    right: 0;
    bottom: 0px;

    svg {
      width: 10px;
      height: 10px;
      stroke: ${({ theme }) => theme.containerColor};
    }
  }
`
const zoomIn = keyframes`
  from {
    transform:scale(.2);
    opacity:0
  }
  to {
    transform:scale(1);
    opacity:1
  }
`

export const IPFSUploaderStatus = styled.div`
  display: block;
  position: absolute;
  top: 25px;
  right: 10px;
  z-index: 1;
  margin-top: -10px;
  line-height: 13px;
  text-align: center;
  visibility: visible;
  pointer-events: none;
  will-change: transform, opacity;

  &.error {
    background-image: url('/icons/input-error.svg');
    animation: ${zoomIn} 0.3s cubic-bezier(0.12, 0.4, 0.29, 1.46);
    height: 15px;
    width: 15px;
  }

  &.success {
    background-image: url('/icons/input-success.svg');
    animation: ${zoomIn} 0.3s cubic-bezier(0.12, 0.4, 0.29, 1.46);
    height: 12px;
    width: 17px;
  }
`

export const IpfsUploadedImageContainer = styled.figure`
  margin: 0;
  position: relative;
  width: 50px;
  height: 50px;

  > img {
    height: 50px;
    width: 50px;
    border-radius: 50%;
  }

  .uploaded-document {
    width: 20px;
    height: 20px;
    stroke: ${headerColor};
    margin-top: 12px;
  }
`

export const TextAreaIcon = styled.svg<{ theme: MavrykTheme }>`
  display: block;
  position: absolute;
  top: 20px;
  left: 10px;
  z-index: 1;
  width: 20px;
  height: 20px;
  margin-top: -10px;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
  visibility: visible;
  pointer-events: none;
  stroke: ${({ theme }) => theme.backgroundTextColor};
`

const slideDown = keyframes`
  from {
    transform: translate3d(0, -10px, 0);
    opacity:0
  }
  to {
    transform: translate3d(0, 0px, 0);
    opacity:1
  }
`

export const IPFSUploaderErrorMessage = styled.div<{ theme: MavrykTheme }>`
  color: ${({ theme }) => theme.downColor};
  line-height: 24px;
  will-change: transform, opacity;
  animation: ${slideDown} 0.3s cubic-bezier(0.12, 0.4, 0.29, 1.46);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:first-letter {
    text-transform: uppercase;
  }
`
