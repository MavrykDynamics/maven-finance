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
  return !(input?.length > 0 && input?.replace(/\s/g, '').length === 0) && input?.length > 0
}

export function isHexadecimalByteString(input: string) {
  const a = parseInt(input, 16)
  return a.toString(16) === input
}

export function isValidNumberValue(input: number, minValue?: number, maxValue?: number) {
  if (minValue && !maxValue) {
    return input >= minValue
  } else if (!minValue && maxValue) {
    return input <= maxValue
  } else if (minValue && maxValue) {
    return input >= minValue && input <= maxValue
  } else {
    return input > 0
  }
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

export function validateFormAndThrowErrors(dispatch: any, validForm: AllValidFormTypes): boolean {
  const { errors, errorMessage } = getFormErrors(validForm)
  if (errors.length === 0) return true
  else {
    const errorTitle = 'Invalid fields'
    dispatch(showToaster(ERROR, errorTitle, errorMessage, 3000))
    return false
  }
}

export function mathRoundTwoDigit(digit: string | number | undefined): number | '' {
  return digit ? Math.round(+digit * 100) / 100 : 0
}

export const containsCode = (str: string) => /<[a-z][\s\S]*>/i.test(str) || /eval/i.test(str)

export function isValidLength(input: string, minLength: number, maxLength: number) {
  return input.length >= minLength && input.length <= maxLength
}
