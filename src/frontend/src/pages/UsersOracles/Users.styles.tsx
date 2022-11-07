import styled from 'styled-components'
import { cyanColor, boxShadowColor } from 'styles'

export const UsersStyled = styled.div`
  margin-top: 30px;
`

export const UsersListWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 20px;
`

export const UserCardWrapper = styled.div`
  padding: 30px 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  row-gap: 10px;
  background: #160e3f;
  border: 1px solid #503eaa;
  border-radius: 10px;
  height: 185px;
  transition: 0.6s all;

  .top-wrapper {
    display: flex;
    align-items: center;

    .img-wrapper {
      width: 40px;
      height: 40px;
      border: 1px solid #8d86eb;
      margin-right: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  &:hover {
    border-color: ${cyanColor};
    box-shadow: 0px 4px 4px ${boxShadowColor};
    cursor: pointer;
  }
`
