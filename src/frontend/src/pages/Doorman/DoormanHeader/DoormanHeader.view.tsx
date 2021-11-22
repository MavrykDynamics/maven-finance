import { gsap } from 'gsap'
import { Fragment, useEffect, useState } from 'react'
import { Controls, PlayState, Timeline, Tween } from 'react-gsap'
// prettier-ignore
import { useSelector } from "react-redux";
import { State } from 'reducers'

//prettier-ignore
import { DoormanHeaderAnimation, DoormanHeaderPortal, DoormanHeaderShip, DoormanHeaderShipComing, DoormanHeaderShipFlamePart, DoormanHeaderShipGoing, DoormanHeaderShipMainPart, DoormanHeaderStyled } from './DoormanHeader.style'

type DoormanHeaderViewProps = {}

export const DoormanHeaderView = ({}: DoormanHeaderViewProps) => {
  const loading = useSelector((state: State) => state.loading)

  return (
    <DoormanHeaderStyled>
      <h1>Doorman your MVK</h1>
      <p>Lock your MVK to earn rewards from loan income</p>
      <DoormanHeaderPortal>
        <img src="/images/portal.svg" alt="portal" />
      </DoormanHeaderPortal>
      <DoormanHeaderAnimation>
        <Timeline
          playState={loading ? PlayState.play : PlayState.stop}
          target={
            <Fragment>
              <DoormanHeaderShipGoing>
                <DoormanHeaderShip>
                  <DoormanHeaderShipFlamePart src="/images/part-flame-going.svg" />
                  <DoormanHeaderShipMainPart src="/images/part-ship-going.svg" />
                </DoormanHeaderShip>
              </DoormanHeaderShipGoing>
              <DoormanHeaderShipComing>
                <DoormanHeaderShip>
                  <DoormanHeaderShipFlamePart src="/images/part-flame-coming.svg" />
                  <DoormanHeaderShipMainPart src="/images/part-ship-coming.svg" />
                </DoormanHeaderShip>
              </DoormanHeaderShipComing>
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
      </DoormanHeaderAnimation>
    </DoormanHeaderStyled>
  )
}
