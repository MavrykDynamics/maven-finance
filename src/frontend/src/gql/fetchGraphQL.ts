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
