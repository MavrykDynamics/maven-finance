import {
  TOGGLE_RPC_NODE_POPUP,
  SELECT_NEW_RPC_APP_NODE,
  SET_RPC_NODES,
} from 'app/App.components/SettingsPopup/SettingsPopup.actions'
import { ThemeType, TOGGLE_DARK_THEME } from '../app/App.components/DarkThemeProvider/DarkThemeProvider.actions'
import { GET_HEAD_DATA, TOGGLE_SIDEBAR } from '../app/App.components/Menu/Menu.actions'
import { getItemFromStorage } from '../utils/storage'
import type { Action } from '../utils/TypesAndInterfaces/ReduxTypes'

export type HeadDataType = {
  knownLevel: number
  level: number
}

export type RPCNodeType = {
  url: string
  title: string
  nodeLogoUrl?: string
  isUser?: boolean
}

export interface PreferencesState {
  themeSelected: ThemeType
  headData?: HeadDataType
  changeNodePopupOpen: boolean
  RPC_NODES: Array<RPCNodeType>
  REACT_APP_RPC_PROVIDER: string
  sidebarOpened: boolean
}

export const preferencesDefaultState: PreferencesState = {
  themeSelected: getItemFromStorage('theme') || 'dark',
  changeNodePopupOpen: false,
  sidebarOpened: false,
  RPC_NODES: [
    { title: 'MARIGOLD', url: 'https://ghostnet.tezos.marigold.dev/', nodeLogoUrl: 'marigold_logo.png' },
    { title: 'ECADLABS', url: 'https://ghostnet.smartpy.io', nodeLogoUrl: 'ECAD_logo.png' },
  ],
  REACT_APP_RPC_PROVIDER: 'https://ghostnet.tezos.marigold.dev/',
}

export function preferences(state = preferencesDefaultState, action: Action) {
  switch (action.type) {
    case TOGGLE_DARK_THEME:
      return { ...state, themeSelected: action.newThemeSelected }
    case GET_HEAD_DATA:
      return { ...state, headData: action.headData }
    case TOGGLE_RPC_NODE_POPUP:
      return { ...state, changeNodePopupOpen: action.isOpened }
    case SELECT_NEW_RPC_APP_NODE:
      return { ...state, REACT_APP_RPC_PROVIDER: action.newRPCNode }
    case SET_RPC_NODES:
      return { ...state, RPC_NODES: action.newRPCNodes }
    case TOGGLE_SIDEBAR:
      return { ...state, sidebarOpened: action.sidebarOpened }
    default:
      return state
  }
}
