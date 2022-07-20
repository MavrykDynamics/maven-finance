import styled from 'styled-components'

export const UsersStyled = styled.div`
  margin-top: 30px;
`

export const UsersListWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 30px;
`

export const UserCardWrapper = styled.div`
  padding: 30px 40px;
  display: flex;
  flex-direction: column;
  row-gap: 10px;
  background: #160e3f;
  border: 1px solid #503eaa;
  border-radius: 10px;

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
`
