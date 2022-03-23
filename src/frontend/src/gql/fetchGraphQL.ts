import {
  CONTRACT_ADDRESSES_QUERY,
  CONTRACT_ADDRESSES_QUERY_NAME,
  CONTRACT_ADDRESSES_QUERY_VARIABLE,
  DELEGATION_STORAGE_QUERY,
  DELEGATION_STORAGE_QUERY_NAME,
  DELEGATION_STORAGE_QUERY_VARIABLE,
  DOORMAN_STORAGE_QUERY,
  DOORMAN_STORAGE_QUERY_NAME,
  DOORMAN_STORAGE_QUERY_VARIABLE,
  MVK_TOKEN_STORAGE_QUERY,
  MVK_TOKEN_STORAGE_QUERY_NAME,
  MVK_TOKEN_STORAGE_QUERY_VARIABLE,
  FARM_STORAGE_QUERY,
  FARM_STORAGE_QUERY_NAME,
  FARM_STORAGE_QUERY_VARIABLE,
  EMERGENCY_GOVERNANCE_STORAGE_QUERY,
  EMERGENCY_GOVERNANCE_STORAGE_QUERY_NAME,
  EMERGENCY_GOVERNANCE_STORAGE_QUERY_VARIABLE,
} from './queries'

async function fetchGraphQL(operationsDoc: string, operationName: string, variables: Record<string, any>) {
  // const result = await fetch(process.env.REACT_APP_GRAPHQL_API || 'https://api.mavryk.finance/v1/graphql', {
  //   method: 'POST',
  //   headers: {
  //     'Content-type': 'application/json',
  //     Accept: 'application/json',
  //   },
  //   body: JSON.stringify({
  //     query: operationsDoc,
  //     variables: variables,
  //     operationName: operationName,
  //   }),
  // })
  // return await result.json()
  return new Promise<any>((resolve, reject) => {
    fetch(process.env.REACT_APP_GRAPHQL_API || 'https://api.mavryk.finance/v1/graphql', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query: operationsDoc,
        variables: variables,
        operationName: operationName,
      }),
    })
      .then((res) => resolve(res.json()))
      .catch((err) => reject(err))
  })
}

export async function fetchFromIndexer(operationsDoc: string, operationName: string, variables: Record<string, any>) {
  return await fetchGraphQL(operationsDoc, operationName, variables)
    .then(({ data, errors }: any) => {
      if (errors) {
        console.error(errors)
      }
      return data
    })
    .catch((error: any) => {
      console.error(error)
      return error
    })
}

export async function fetchFromIndexerWithPromise(
  operationsDoc: string,
  operationName: string,
  variables: Record<string, any>,
): Promise<any> {
  return fetchGraphQL(operationsDoc, operationName, variables)
    .then(({ data, errors }: any) => {
      if (errors) {
        console.error(errors)
      }
      return data
    })
    .catch((error: any) => {
      console.error(error)
      return error
    })
}

/**
 * This load all the initial data of the dapp
 */
export async function getInitialData() {
  return await Promise.all([
    fetchFromIndexerWithPromise(
      CONTRACT_ADDRESSES_QUERY,
      CONTRACT_ADDRESSES_QUERY_NAME,
      CONTRACT_ADDRESSES_QUERY_VARIABLE,
    ),
    fetchFromIndexerWithPromise(
      MVK_TOKEN_STORAGE_QUERY,
      MVK_TOKEN_STORAGE_QUERY_NAME,
      MVK_TOKEN_STORAGE_QUERY_VARIABLE,
    ),
    fetchFromIndexerWithPromise(DOORMAN_STORAGE_QUERY, DOORMAN_STORAGE_QUERY_NAME, DOORMAN_STORAGE_QUERY_VARIABLE),
    fetchFromIndexerWithPromise(
      DELEGATION_STORAGE_QUERY,
      DELEGATION_STORAGE_QUERY_NAME,
      DELEGATION_STORAGE_QUERY_VARIABLE,
    ),
    fetchFromIndexerWithPromise(FARM_STORAGE_QUERY, FARM_STORAGE_QUERY_NAME, FARM_STORAGE_QUERY_VARIABLE),
    fetchFromIndexerWithPromise(
      EMERGENCY_GOVERNANCE_STORAGE_QUERY,
      EMERGENCY_GOVERNANCE_STORAGE_QUERY_NAME,
      EMERGENCY_GOVERNANCE_STORAGE_QUERY_VARIABLE,
    ),
  ])
}
