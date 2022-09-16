const axios = require('axios').default

// const network = process.env.REACT_APP_API_NETWORK
const network = 'ghostnet'

export async function getContractBigmapKeys(contractAddress: string, name: string) {
  return await axios
    .get(`https://api.${network}.tzkt.io/v1/contracts/${contractAddress}/bigmaps/${name}/keys`)
    .then((response: { data: object }) => {
      return response.data
    })
}

export async function getContractStorage(contractAddress: string) {
  return await axios
    .get(`https://api.${network}.tzkt.io/v1/contracts/${contractAddress}/storage`)
    .then((response: { data: object }) => {
      return response.data
    })
}

export async function getChainInfo() {
  return await axios.get(`https://api.${network}.tzkt.io/v1/head`).then((response: { data: object }) => {
    return response.data
  })
}

export async function getTreasuryDataByAddress(treasuryAddress: string) {
  return await axios
    .get(`https://api.${network}.tzkt.io/v1/tokens/balances?account.eq=${treasuryAddress}`)
    .then((response: { data: object }) => {
      return response.data
    })
    .catch((error: Error) => console.error('getTreasuryDataByAddress error: ', error))
}
