import { showToaster } from '../app/App.components/Toaster/Toaster.actions'
import { ERROR } from '../app/App.components/Toaster/Toaster.constants'
import { AllValidFormTypes } from './TypesAndInterfaces/Forms'

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

export function isHexadecimalByteString(input: string) {
  const a = parseInt(input, 16)
  return a.toString(16) === input
}

export function getFormErrors(form: AllValidFormTypes) {
  const errors: any[] = []
  let errorMessage = 'Please correct:'
  Object.entries(form).forEach((k) => {
    if (!k[1]) {
      errors.push(k)
      errorMessage += ` ${k[0].charAt(0).toUpperCase() + k[0].substr(1)},`
    }
  })
  errorMessage = errorMessage.substr(0, errorMessage.length - 1)
  return { errors, errorMessage: errorMessage }
}
