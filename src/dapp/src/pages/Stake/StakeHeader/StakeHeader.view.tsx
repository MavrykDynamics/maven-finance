// prettier-ignore
import { useSelector } from "react-redux";
import { State } from 'reducers'
import { gsap } from 'gsap'

//prettier-ignore
import { StakeHeaderAnimation, StakeHeaderPortal, StakeHeaderShip, StakeHeaderShipComing, StakeHeaderShipFlamePart, StakeHeaderShipGoing, StakeHeaderShipMainPart, StakeHeaderStyled } from './StakeHeader.style'
import { useState, useEffect } from 'react'

type StakeHeaderViewProps = {}

export const StakeHeaderView = ({}: StakeHeaderViewProps) => {
  const loading = useSelector((state: State) => state.loading)

  const reverseCompleteCallback = () => {
    console.log('reverseCompleteCallback')
  }

  const [myTween] = useState(
    gsap.timeline({
      paused: true,
      onReverseComplete: reverseCompleteCallback,
    }),
  )

  let tweenTarget: any = null

  useEffect(() => {
    myTween.to(tweenTarget, { duration: 0.4, rotation: 180 }).reverse()
  }, [])

  useEffect(() => {
    myTween.reversed(!myTween.reversed())
  }, [loading])

  // useEffect(() => {
  //   myTween.eventCallback('onReverseComplete', reverseCompleteCallback)
  // }, [flagA, flagB])

  return (
    <StakeHeaderStyled>
      <h1 ref={(e) => (tweenTarget = e)}>Stake your MVK</h1>
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
