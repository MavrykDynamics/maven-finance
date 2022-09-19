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

export async function getTreasuryAssetsByAddress(treasuryAddress: string) {
  try {
    const treasuryAssets =
      (await axios.get(`https://api.${network}.tzkt.io/v1/tokens/balances?account.eq=${treasuryAddress}`)).data ?? []

    const xtzTreasuryAsset = (await axios.get(`https://api.${network}.tzkt.io/v1/accounts/${treasuryAddress}/balance`))
      .data

    const xtzAssetObject = {
      account: { address: treasuryAddress },
      balance: xtzTreasuryAsset,
      token: {
        metadata: { symbol: 'tezos', name: 'XTZ', decimals: 6 },
      },
    }

    return [...treasuryAssets, xtzAssetObject]
  } catch (e) {
    console.error('getTreasuryAssetsByAddress error: ', e)
    return []
  }
}
