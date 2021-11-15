import { DoormanCallback } from './Doorman.controller'
import { DoormanStyled } from './Doorman.style'

type DoormanViewProps = {
  stakeCallback: (stakeProps: DoormanCallback) => Promise<any>
  connectedUser: string
  loading: boolean
}

export const DoormanView = ({ stakeCallback, connectedUser, loading }: DoormanViewProps) => {
  // Remove if unecessary
  return <DoormanStyled></DoormanStyled>
}
