const axios = require('axios').default

console.log('%c ||||| process.env.REACT_APP_API_NETWORK', 'color:yellowgreen', process.env.REACT_APP_API_NETWORK);

// const network = process.env.REACT_APP_API_NETWORK
const network = 'jakartanet'

console.log('%c ||||| network', 'color:yellowgreen', network);

export async function getContractBigmapKeys(contractAddress: string, name: string): Promise<any> {
  return await axios
    .get(
      `https://api.${network}.tzkt.io/v1/contracts/${contractAddress}/bigmaps/${name}/keys`,
    )
    .then((response: any) => {
      return response.data
    })
}

export async function getContractStorage(contractAddress: string): Promise<any> {
  return await axios
    .get(`https://api.${network}.tzkt.io/v1/contracts/${contractAddress}/storage`)
    .then((response: any) => {
      return response.data
    })
}

export async function getChainInfo(): Promise<any> {
  return await axios.get(`https://api.${network}.tzkt.io/v1/head`).then((response: any) => {
    return response.data
  })
}

export async function getTreasuryDataByAddress(treasuryAddress: string): Promise<any> {
  return await axios
    .get(
      `https://api.better-call.dev/v1/account/${
        network
      }/${treasuryAddress}/token_balances`,
    )
    .then((response: any) => {
      return response.data
    })
}
