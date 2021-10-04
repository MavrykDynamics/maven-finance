// prettier-ignore
import {  StakeHeaderPortal, StakeHeaderShip, StakeHeaderStyled } from "./StakeHeader.style";

type StakeHeaderViewProps = {}

export const StakeHeaderView = ({}: StakeHeaderViewProps) => {
  return (
    <StakeHeaderStyled>
      <h1>Stake your MVK</h1>
      <p>Lock your MVK to earn rewards from loan income</p>
      <StakeHeaderPortal>
        <img src="/images/portal.svg" alt="portal" />
      </StakeHeaderPortal>
      <StakeHeaderShip src="/images/ship.svg" />
    </StakeHeaderStyled>
  )
}
