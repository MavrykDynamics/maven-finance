import styled from 'styled-components/macro'
import { MavrykTheme } from '../../styles/interfaces'
import { Card } from 'styles'

export const AdminStyled = styled(Card)`
  margin-top: 30px;
  display: flex;
  width: 100%;
  flex-direction: column;
  padding-top: 16px;
  padding-bottom: 16px;
  border-radius: 10px;

  > button {
    max-width: 33%;
    margin: 15px auto;
  }
`
