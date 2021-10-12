import { STAKE_REQUEST } from 'pages/Stake/Stake.actions'

export interface StakeState {
  anim?: boolean
}

const stakeDefaultState: StakeState = {
  anim: false,
}

export function stake(state = stakeDefaultState, action: any): StakeState {
  switch (action.type) {
    case STAKE_REQUEST: {
      //const actionPayload: GetStakeOutputs = action.payload
      return {
        anim: true,
      }
    }
    default:
      return state
  }
}
