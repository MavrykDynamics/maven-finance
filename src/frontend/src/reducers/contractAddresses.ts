import { getItemFromStorage } from "../utils/storage";
import { GET_CONTRACT_ADDRESSES } from "../app/App.actions";

export interface ContractAddressesState {
  [key: string]: { address: string };
}

const contractAddressesDefaultState: ContractAddressesState = {};

export function contractAddresses(
  state = contractAddressesDefaultState,
  action: any
): ContractAddressesState {
  switch (action.type) {
    case GET_CONTRACT_ADDRESSES:
      return action.addresses;
    default:
      return state;
  }
}
