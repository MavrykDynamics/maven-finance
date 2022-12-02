import { Fragment } from 'react'
import { PlayState, Timeline, Tween } from 'react-gsap'
import { useSelector } from 'react-redux'
import { State } from 'reducers'
import {
  DoormanHeaderAnimation,
  DoormanHeaderPortal,
  DoormanHeaderShip,
  DoormanHeaderShipComing,
  DoormanHeaderShipFlamePart,
  DoormanHeaderShipGoing,
  DoormanHeaderShipMainPart,
  DoormanHeaderStyled,
} from './DoormanHeader.style'

type DoormanHeaderViewProps = {}

export const DoormanHeaderView = ({}: DoormanHeaderViewProps) => {
  const loading = useSelector((state: State) => state.loading.isLoading)

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
          <Tween to={{ x: '300px', opacity: 1 }} duration={1} target={0} ease="power2.in" />
          <Tween to={{ x: '300px', opacity: 0 }} duration={0.1} target={0} position="-=0.1" />
          <Tween to={{ x: '0px', opacity: 1 }} duration={0.1} target={1} position="+=1" />
          <Tween
            to={{ x: '-300px', opacity: 1 }}
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
