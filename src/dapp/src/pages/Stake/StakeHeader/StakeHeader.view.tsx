// prettier-ignore
import {  StakeHeaderPortal, StakeHeaderShip, StakeHeaderAnimation, StakeHeaderShipFlamePart, StakeHeaderShipMainPart, StakeHeaderStyled, StakeHeaderShipComing, StakeHeaderShipGoing } from "./StakeHeader.style";

type StakeHeaderViewProps = {}

export const StakeHeaderView = ({}: StakeHeaderViewProps) => {
  return (
    <StakeHeaderStyled>
      <h1>Stake your MVK</h1>
      <p>Lock your MVK to earn rewards from loan income</p>
      <StakeHeaderPortal>
        <img src="/images/portal.svg" alt="portal" />
      </StakeHeaderPortal>
      <StakeHeaderAnimation>
        <StakeHeaderShipGoing>
          <StakeHeaderShip>
            <StakeHeaderShipFlamePart src="/images/flame-part.svg" />
            <StakeHeaderShipMainPart src="/images/ship-part.svg" />
          </StakeHeaderShip>
        </StakeHeaderShipGoing>
        <StakeHeaderShipComing>
          <StakeHeaderShip>
            <StakeHeaderShipFlamePart src="/images/flame-part-red.svg" />
            <StakeHeaderShipMainPart src="/images/ship-part-red.svg" />
          </StakeHeaderShip>
        </StakeHeaderShipComing>
      </StakeHeaderAnimation>
    </StakeHeaderStyled>
  )
}
