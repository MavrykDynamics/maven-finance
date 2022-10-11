import { ProposalUpdateFormProposalBytes } from 'utils/TypesAndInterfaces/Forms'
import { ProposalDataType } from 'utils/TypesAndInterfaces/Governance'

export const checkWtheterBytesIsValid = (bytes: Array<ProposalUpdateFormProposalBytes>): boolean => {
  return bytes.every(({ bytes }) => Boolean(bytes))
}

export const getBytesPairValidationStatus = (
  newText: string,
  fieldToValidate: 'validTitle' | 'validBytes',
  currentByteId: number,
  proposalData?: Array<ProposalDataType>,
): 'success' | 'error' => {
  const isExistTitleInServer = proposalData?.some(({ id }) => id === currentByteId)

  if (fieldToValidate === 'validTitle') {
    return Boolean(newText) && !isExistTitleInServer ? 'success' : 'error'
  } else {
    return Boolean(newText) ? 'success' : 'error'
  }
}
