const axios = require('axios').default

// const network = process.env.REACT_APP_API_NETWORK
export const network = 'ghostnet'

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

export async function getTreasuryAssetsByAddress(treasuryAddress: string) {
  try {
    const [{ data: treasuryAssets }, { data: xtzTreasuryAsset }] = await Promise.all([
      axios.get(`https://api.${network}.tzkt.io/v1/tokens/balances?account.eq=${treasuryAddress}`),
      axios.get(`https://api.${network}.tzkt.io/v1/accounts/${treasuryAddress}/balance`),
    ])

    const xtzAssetObject = {
      account: { address: treasuryAddress },
      balance: xtzTreasuryAsset,
      token: {
        metadata: { symbol: 'tezos', name: 'XTZ', decimals: 6 },
      },
    }

    return [...treasuryAssets].concat(xtzTreasuryAsset ? [xtzAssetObject] : [])
  } catch (e) {
    console.error('getTreasuryAssetsByAddress error: ', e)
    return []
  }
}
