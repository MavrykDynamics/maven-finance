const isIPFS = require('is-ipfs')
/**
 * File contains different functions used to validate input throughout the dapp
 */

export function isJsonString(input: string) {
  try {
    JSON.parse(input)
  } catch (e) {
    return false
  }
  return true
}

export function isValidHttpUrl(input: string) {
  let url
  try {
    url = new URL(input)
  } catch (_) {
    return false
  }

  return url.protocol === 'http:' || url.protocol === 'https:'
}

export function isValidIPFSUrl(input: string) {
  return isIPFS.url(input)
}

export function isNotAllWhitespace(input: string) {
  return !(input.length > 0 && input.replace(/\s/g, '').length === 0)
}
