import { gsap } from 'gsap'
import { Fragment, useEffect, useState } from 'react'
import { Controls, PlayState, Timeline, Tween } from 'react-gsap'
// prettier-ignore
import { useSelector } from "react-redux";
import { State } from 'reducers'

//prettier-ignore
import { StakeHeaderAnimation, StakeHeaderPortal, StakeHeaderShip, StakeHeaderShipComing, StakeHeaderShipFlamePart, StakeHeaderShipGoing, StakeHeaderShipMainPart, StakeHeaderStyled } from './StakeHeader.style'

type StakeHeaderViewProps = {}

export const StakeHeaderView = ({}: StakeHeaderViewProps) => {
  const loading = useSelector((state: State) => state.loading)

  return (
    <StakeHeaderStyled>
      <h1>Stake your MVK</h1>
      <p>Lock your MVK to earn rewards from loan income</p>
      <StakeHeaderPortal>
        <img src="/images/portal.svg" alt="portal" />
      </StakeHeaderPortal>
      <StakeHeaderAnimation>
        <Timeline
          playState={loading ? PlayState.play : PlayState.stop}
          target={
            <Fragment>
              <StakeHeaderShipGoing>
                <StakeHeaderShip>
                  <StakeHeaderShipFlamePart src="/images/part-flame-going.svg" />
                  <StakeHeaderShipMainPart src="/images/part-ship-going.svg" />
                </StakeHeaderShip>
              </StakeHeaderShipGoing>
              <StakeHeaderShipComing>
                <StakeHeaderShip>
                  <StakeHeaderShipFlamePart src="/images/part-flame-coming.svg" />
                  <StakeHeaderShipMainPart src="/images/part-ship-coming.svg" />
                </StakeHeaderShip>
              </StakeHeaderShipComing>
            </Fragment>
          }
        >
          <Tween to={{ x: '400px', opacity: 1 }} duration={1} target={0} ease="power2.in" />
          <Tween to={{ x: '400px', opacity: 0 }} duration={0.1} target={0} position="-=0.1" />
          <Tween to={{ x: '0px', opacity: 1 }} duration={0.1} target={1} position="+=1" />
          <Tween
            to={{ x: '-400px', opacity: 1 }}
            duration={2}
            target={1}
            ease="elastic.out(0.5,0.3)"
            position="-=0.1"
          />
        </Timeline>
      </StakeHeaderAnimation>
    </StakeHeaderStyled>
  )
}
