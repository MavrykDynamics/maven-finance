import { TOGGLE_RPC_NODE_POPUP, SELECT_NEW_RPC_APP_NODE, SET_RPC_NODES } from 'app/App.components/ChangeNodePopup/ChangeNode.actions'
import { TOGGLE_DARK_THEME } from '../app/App.components/DarkThemeProvider/DarkThemeProvider.actions'
import { GET_HEAD_DATA } from '../app/App.components/Menu/Menu.actions'
import { getItemFromStorage } from '../utils/storage'

export type RPCNodeType = {
  url: string
  title: string
  nodeLogoUrl?: string
}

export interface PreferencesState {
  darkThemeEnabled: boolean
  headData?: any
  changeNodePopupOpen: boolean,
  RPC_NODES: Array<RPCNodeType>
  REACT_APP_RPC_PROVIDER: string
}

const preferencesDefaultState: PreferencesState = {
  darkThemeEnabled: getItemFromStorage('theme') || true,
  changeNodePopupOpen: false,
  RPC_NODES: [
    { title: 'MARIGOLD', url: 'https://jakartanet.tezos.marigold.dev/', nodeLogoUrl: 'marigold_logo.png' },
    { title: 'ECADLABS', url: 'https://jakartanet.ecadinfra.com', nodeLogoUrl: 'ECAD_logo.png' },
  ],
  REACT_APP_RPC_PROVIDER: 'https://jakartanet.tezos.marigold.dev/'
}

export function preferences(state = preferencesDefaultState, action: any): PreferencesState {
  switch (action.type) {
    case TOGGLE_DARK_THEME:
      return { ...state, darkThemeEnabled: !state.darkThemeEnabled }
    case GET_HEAD_DATA:
      return { ...state, headData: action.headData }
    case TOGGLE_RPC_NODE_POPUP:
      return { ...state, changeNodePopupOpen: action.isOpened }
    case SELECT_NEW_RPC_APP_NODE:
      return { ...state, REACT_APP_RPC_PROVIDER: action.newRPCNode }
    case SET_RPC_NODES: 
      return {...state, RPC_NODES: action.newRPCNodes}
    default:
      return state
  }
}
