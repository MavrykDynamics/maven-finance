import {
  BREAK_GLASS_STORAGE_QUERY,
  BREAK_GLASS_STORAGE_QUERY_NAME,
  BREAK_GLASS_STORAGE_QUERY_VARIABLE,
  CONTRACT_ADDRESSES_QUERY,
  CONTRACT_ADDRESSES_QUERY_NAME,
  CONTRACT_ADDRESSES_QUERY_VARIABLE,
  COUNCIL_STORAGE_QUERY,
  COUNCIL_STORAGE_QUERY_NAME,
  COUNCIL_STORAGE_QUERY_VARIABLE,
  DELEGATION_STORAGE_QUERY,
  DELEGATION_STORAGE_QUERY_NAME,
  DELEGATION_STORAGE_QUERY_VARIABLE,
  DOORMAN_STORAGE_QUERY,
  DOORMAN_STORAGE_QUERY_NAME,
  DOORMAN_STORAGE_QUERY_VARIABLE,
  EMERGENCY_GOVERNANCE_STORAGE_QUERY,
  EMERGENCY_GOVERNANCE_STORAGE_QUERY_NAME,
  EMERGENCY_GOVERNANCE_STORAGE_QUERY_VARIABLE,
  FARM_STORAGE_QUERY,
  FARM_STORAGE_QUERY_NAME,
  FARM_STORAGE_QUERY_VARIABLE,
  GOVERNANCE_STORAGE_QUERY,
  GOVERNANCE_STORAGE_QUERY_NAME,
  GOVERNANCE_STORAGE_QUERY_VARIABLE,
  MVK_TOKEN_STORAGE_QUERY,
  MVK_TOKEN_STORAGE_QUERY_NAME,
  MVK_TOKEN_STORAGE_QUERY_VARIABLE,
  VESTING_STORAGE_QUERY,
  VESTING_STORAGE_QUERY_NAME,
  VESTING_STORAGE_QUERY_VARIABLE,
  ORACLE_STORAGE_QUERY,
  ORACLE_STORAGE_QUERY_NAME,
  ORACLE_STORAGE_QUERY_VARIABLE,
  BREAK_GLASS_COUNCIL_MEMBER_QUERY,
  BREAK_GLASS_COUNCIL_MEMBER_QUERY_NAME,
  BREAK_GLASS_COUNCIL_MEMBER_QUERY_VARIABLE,
  BREAK_GLASS_ACTION_QUERY,
  BREAK_GLASS_ACTION_QUERY_NAME,
  BREAK_GLASS_ACTION_QUERY_VARIABLE
} from './queries'

async function fetchGraphQL(operationsDoc: string, operationName: string, variables: Record<string, object | string>) {
  const developmentAPI = process.env.REACT_APP_DEV_GRAPHQL_API || 'https://api.mavryk.finance/v1/graphql'

  const prodictionAPI = process.env.REACT_APP_GRAPHQL_API || 'https://api.mavryk.finance/v1/graphql'
  const gqlAPINetwork = process.env.NODE_ENV === 'development' ? developmentAPI : prodictionAPI

  return new Promise((resolve, reject) => {
    fetch(gqlAPINetwork, {
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

export async function fetchFromIndexer(
  operationsDoc: string,
  operationName: string,
  variables: Record<string, object | string>,
) {
  return await fetchGraphQL(operationsDoc, operationName, variables)
    .then((res) => {
      const { data, errors } = res as { data: Record<string, object>; errors: Record<string, object> }

      if (errors) {
        console.error(errors)
      }
      return data
    })
    .catch((error) => {
      console.error(error)
      return error
    })
}

export async function fetchFromIndexerWithPromise(
  operationsDoc: string,
  operationName: string,
  variables: Record<string, object | string>,
) {
  return fetchGraphQL(operationsDoc, operationName, variables)
    .then((res) => {
      const { data, errors } = res as { data: Record<string, object>; errors: Record<string, object> }
      if (errors) {
        console.error(errors)
      }
      return data
    })
    .catch((error) => {
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
    fetchFromIndexerWithPromise(
      BREAK_GLASS_STORAGE_QUERY,
      BREAK_GLASS_STORAGE_QUERY_NAME,
      BREAK_GLASS_STORAGE_QUERY_VARIABLE,
    ),
    fetchFromIndexerWithPromise(COUNCIL_STORAGE_QUERY, COUNCIL_STORAGE_QUERY_NAME, COUNCIL_STORAGE_QUERY_VARIABLE),
    fetchFromIndexerWithPromise(VESTING_STORAGE_QUERY, VESTING_STORAGE_QUERY_NAME, VESTING_STORAGE_QUERY_VARIABLE),
    fetchFromIndexerWithPromise(
      GOVERNANCE_STORAGE_QUERY,
      GOVERNANCE_STORAGE_QUERY_NAME,
      GOVERNANCE_STORAGE_QUERY_VARIABLE,
    ),
    fetchFromIndexerWithPromise(ORACLE_STORAGE_QUERY, ORACLE_STORAGE_QUERY_NAME, ORACLE_STORAGE_QUERY_VARIABLE),
    fetchFromIndexerWithPromise(BREAK_GLASS_COUNCIL_MEMBER_QUERY, BREAK_GLASS_COUNCIL_MEMBER_QUERY_NAME, BREAK_GLASS_COUNCIL_MEMBER_QUERY_VARIABLE),
    fetchFromIndexerWithPromise(BREAK_GLASS_ACTION_QUERY, BREAK_GLASS_ACTION_QUERY_NAME, BREAK_GLASS_ACTION_QUERY_VARIABLE),
  ])
}
