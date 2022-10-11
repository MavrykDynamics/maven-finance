import { InputStatusType, INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
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
): typeof INPUT_STATUS_SUCCESS | typeof INPUT_STATUS_ERROR => {
  const isExistTitleInServer = proposalData?.some(({ id }) => id === currentByteId)

  if (fieldToValidate === 'validTitle') {
    return Boolean(newText) && !isExistTitleInServer ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR
  } else {
    return Boolean(newText) ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR
  }
}

export const PROPOSAL_BYTE = {
  bytes: '',
  governance_proposal_record_id: 0,
  id: 1,
  record_internal_id: 0,
  title: '',
  validTitle: '' as InputStatusType,
  validBytes: '' as InputStatusType,
  order: 1,
  isUnderTheDrop: false,
}
