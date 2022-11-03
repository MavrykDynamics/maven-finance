import styled, { css } from 'styled-components/macro'
import { MavrykTheme } from '../../../styles/interfaces'

export const TrimStyled = styled.div<{ trim?: boolean, theme: MavrykTheme }>`
 ${({ trim }) => trim && css`
    &::after {
      content: '...';
    }
 `}
`
