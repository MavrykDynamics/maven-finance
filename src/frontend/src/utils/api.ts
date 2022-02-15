const axios = require('axios').default

export async function getContractBigmapKeys(contractAddress: string, name: string): Promise<any> {
  return await axios
    .get(`https://api.${process.env.REACT_APP_API_NETWORK}.tzkt.io/v1/contracts/${contractAddress}/bigmaps/${name}/keys`)
    .then((response: any) => {
      return response.data
    })
}

export async function getContractStorage(contractAddress: string): Promise<any> {
    return await axios
      .get(`https://api.${process.env.REACT_APP_API_NETWORK}.tzkt.io/v1/contracts/${contractAddress}/storage`)
      .then((response: any) => {
        return response.data
      })
}
