import { MavrykTheme } from '../../../styles/interfaces'
import styled from 'styled-components/macro'
import { Card, headerColor, cyanColor } from 'styles'

export const FarmTopBarStyled = styled(Card)<{ theme: MavrykTheme }>`
  margin-bottom: 20px;
  display: flex;
  padding: 17px 23px;

  .change-view {
    display: flex;
    gap: 12px;
    flex-shrink: 0;
    margin-left: 20px;

    svg {
      width: 20px;
      height: 20px;
      fill: ${cyanColor};
    }

    .btn-vertical {
      transform: rotate(90deg);
    }
  }

  &.vertical .change-view .btn-vertical svg,
  &.horizontal .change-view .btn-horizontal svg {
    fill: ${headerColor};
  }

  .order-by {
    margin-left: 30px;

    .drop-down {
      min-width: 290px;
    }
  }

  .tab-bar {
    margin-right: 15px;
  }

  .farm-toggle {
    flex-shrink: 0;
    margin-right: 15px;
  }
`
