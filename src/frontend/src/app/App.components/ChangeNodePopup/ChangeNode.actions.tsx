import { RPCNodeType } from 'reducers/preferences'
import { showToaster } from '../Toaster/Toaster.actions'
import { SUCCESS } from '../Toaster/Toaster.constants'

export const TOGGLE_RPC_NODE_POPUP = 'TOGGLE_RPC_NODE_POPUP'
export const toggleRPCNodePopup = (isOpened: boolean) => (dispatch: any, getState: any) => {
  dispatch({
    type: TOGGLE_RPC_NODE_POPUP,
    isOpened,
  })
}

export const SELECT_NEW_RPC_APP_NODE = 'SET_NEW_RPC_APP_NODE'
export const selectNewRPCNode = (newRPCNode: string) => (dispatch: any, getState: any) => {
  dispatch({
    type: SELECT_NEW_RPC_APP_NODE,
    newRPCNode,
  })
  dispatch(showToaster(SUCCESS, 'New RPC link selected', 'The new RPC link has been selected in the DAPP', 3000))
}

export const SET_RPC_NODES = 'SET_RPC_NODES'
export const setNewRPCNodes = (newRPCNodes: Array<RPCNodeType>) => (dispatch: any, getState: any) => {
  dispatch({
    type: SET_RPC_NODES,
    newRPCNodes,
  })
  dispatch(showToaster(SUCCESS, 'New RPC link added', 'The new RPC link has been added in the DAPP', 3000))
}
