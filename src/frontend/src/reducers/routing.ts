import { SET_CHOSEN_SATELLITE } from "pages/Satellites/Satellites.actions"

export interface RoutingState {
    chosenSatellite: any
  }
  
  const routingDefaultState: RoutingState = {
    chosenSatellite: undefined
  }
  
  export function routing(state = routingDefaultState, action: any): RoutingState {
    switch (action.type) {
      case SET_CHOSEN_SATELLITE: {
        return {
            chosenSatellite: action.chosenSatellite
        }
      }
      default:
        return state
    }
  }