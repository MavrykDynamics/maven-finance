import styled, { css } from 'styled-components'
import { cyanColor, headerColor } from 'styles'

export const UserDetailsStyled = styled.div`
  display: flex;
  justify-content: space-between;
  background: #160e3f;
  border: 1px solid #503eaa;
  border-radius: 10px;
  margin: 30px auto;
  padding: 30px 40px;

  .top-wrapper {
    display: flex;
    align-items: center;

    .img-wrapper {
      width: 40px;
      height: 40px;
      border: 1px solid ${headerColor};
      margin-right: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .left-side-wrapper {
    margin-left: 140px;
    display: flex;
    flex-direction: column;
    row-gap: 40px;

    .bottom {
      display: flex;
      column-gap: 80px;
      align-items: center;
    }
  }

  .item {
    h5 {
      color: ${headerColor};
      font-weight: 400;
      font-size: 14px;
      line-height: 21px;
      margin-top: 0;
      margin-bottom: 6px;

      svg {
        stroke: ${headerColor};
        width: 13px;
        height: 13px;
        margin-left: 3px;
        transition: 0.5s all;
      }

      &:hover {
        svg {
          stroke: ${cyanColor};
        }
      }
    }

    var {
      font-style: normal;
      color: ${cyanColor};
      font-weight: 700;
      font-size: 14px;
      line-height: 14px;

      svg {
        stroke: ${cyanColor};
        width: 13px;
        height: 13px;
      }
    }
  }
`
