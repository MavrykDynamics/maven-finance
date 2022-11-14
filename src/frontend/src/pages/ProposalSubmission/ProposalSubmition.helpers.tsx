import BigNumber from 'bignumber.js'

import { INPUT_STATUS_ERROR, INPUT_STATUS_SUCCESS } from 'app/App.components/Input/Input.constants'
import { Governance_Proposal } from 'utils/generated/graphqlTypes'
import { ValidSubmitProposalForm, SubmitProposalFormInputStatus } from 'utils/TypesAndInterfaces/Forms'
import { CurrentRoundProposalsStorageType, ProposalRecordType } from 'utils/TypesAndInterfaces/Governance'
import { PaymentsDataChangesType, ProposalDataChangesType, StageThreeValidityItem } from './ProposalSybmittion.types'
import { State } from 'reducers'

export const checkWhetherBytesIsValid = (proposalData: ProposalRecordType['proposalData']): boolean => {
  return proposalData.every(({ encoded_code, title }) => Boolean(encoded_code) && Boolean(title))
}

export const getBytesPairValidationStatus = (
  newText: string,
  fieldToValidate: 'validTitle' | 'validBytes',
): typeof INPUT_STATUS_SUCCESS | typeof INPUT_STATUS_ERROR => {
  if (fieldToValidate === 'validTitle') {
    return Boolean(newText) ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR
  } else {
    return Boolean(newText) ? INPUT_STATUS_SUCCESS : INPUT_STATUS_ERROR
  }
}

export const getValidityStageThreeTable = (valueName: StageThreeValidityItem, value: string | number): boolean => {
  switch (valueName) {
    case 'token_amount':
      if (Number(value) < 0) return false
      break
    case 'to__id':
      if (!value) return false
      break
    case 'title':
      if (!value) return false
      break
  }
  return true
}

export const checkBytesPairExists = (proposalDataItem: ProposalRecordType['proposalData'][number]): boolean => {
  return proposalDataItem.title !== null && proposalDataItem.encoded_code !== null
}

export const checkPaymentExists = (proposalPaymentMethod: ProposalRecordType['proposalPayments'][number]): boolean => {
  return (
    proposalPaymentMethod.title !== null &&
    proposalPaymentMethod.to__id !== null &&
    proposalPaymentMethod.to__id !== null
  )
}

export const getBytesDiff = (
  originalData: ProposalRecordType['proposalData'],
  updatedData: ProposalRecordType['proposalData'],
): ProposalDataChangesType => {
  // we need to irerate the arr, that has more elements, and secondaryArr is the array we will take elements to compare and give appropriate change el
  const arrayToIterate = originalData.length <= updatedData.length ? updatedData : originalData
  const secondaryArr = originalData.length <= updatedData.length ? originalData : updatedData

  const changes = arrayToIterate
    .map((item1, idx) => {
      const item2 = secondaryArr?.[idx]

      // if we have more items on client than on server, when we reach end of the items that stored on client array, just add everything to the end
      if (!item2 && originalData.length <= updatedData.length) {
        return {
          addOrSetProposalData: {
            title: item1.title,
            encodedCode: item1.encoded_code,
            codeDescription: '',
          },
        }
      }

      // if we have more items on server than on client, when we reach end of the items that stored on client array, just add removing change to the end
      if (!item2 && originalData.length > updatedData.length) {
        return {
          removeProposalData: String(idx),
        }
      }

      if (item2.title !== item1.title || item2.encoded_code !== item1.encoded_code) {
        return {
          addOrSetProposalData: {
            title: item1.title,
            encodedCode: item1.encoded_code,
            codeDescription: '',
            index: idx,
          },
        }
      }

      return null
    })
    .filter(Boolean) as ProposalDataChangesType

  return changes
}

export const getPaymentsDiff = (
  originalData: ProposalRecordType['proposalPayments'],
  updatedData: ProposalRecordType['proposalPayments'],
  paymentMethods: Array<{ symbol: string; address: string; id: number }>,
  dipDupTokens: State['tokens']['dipDupTokens'],
): PaymentsDataChangesType => {
  // we need to irerate the arr, that has more elements, and secondaryArr is the array we will take elements to compare and give appropriate change el
  const arrayToIterate = originalData.length <= updatedData.length ? updatedData : originalData
  const secondaryArr = originalData.length <= updatedData.length ? originalData : updatedData

  const changes = arrayToIterate
    .map((item1, idx) => {
      const item2 = secondaryArr?.[idx]

      // if we have more items on client than on server, when we reach end of the items that stored on client array, just add everything to the end
      if (!item2 && originalData.length <= updatedData.length) {
        const paymentSymbol = paymentMethods.find(({ address }) => address === item1.token_address)?.symbol ?? 'MVK'
        const decimals = Number(
          dipDupTokens.find(({ contract }) => contract === item1.token_address)?.metadata?.decimals,
        )
        return {
          addOrSetPaymentData: {
            title: item1.title,
            transaction: {
              to_: item1.to__id ?? '',
              token: {
                [paymentSymbol]: {
                  tokenContractAddress: item1.token_address,
                  tokenId: item1.token_id,
                },
              },
              amount: new BigNumber(item1.token_amount ?? 0).multipliedBy(10 ^ decimals),
            },
          },
        }
      }

      // if we have more items on server than on client, when we reach end of the items that stored on client array, just add removing change to the end
      if (!item2 && originalData.length > updatedData.length) {
        return {
          removeProposalData: String(idx),
        }
      }

      if (item2.title !== item1.title || item2.to__id !== item1.to__id || item2.token_address !== item1.token_address) {
        const paymentSymbol = paymentMethods.find(({ address }) => address === item1.token_address)?.symbol ?? 'MVK'
        const decimals = Number(
          dipDupTokens.find(({ contract }) => contract === item1.token_address)?.metadata?.decimals,
        )
        return {
          addOrSetPaymentData: {
            title: item1.title,
            transaction: {
              to_: item1.to__id ?? '',
              token: {
                [paymentSymbol]: {
                  tokenContractAddress: item1.token_address,
                  tokenId: item1.token_id,
                },
              },
              amount: new BigNumber(item1.token_amount ?? 0).multipliedBy(10 ^ decimals),
            },
            index: idx,
          },
        }
      }

      return null
    })
    .filter(Boolean) as PaymentsDataChangesType

  return changes
}

export const PROPOSAL_BYTE = {
  encoded_code: '',
  id: 1,
  internal_id: 0,
  title: '',
  code_description: '',
  order: 1,
  isUnderTheDrop: false,
  isLocalBytes: true,
  governance_proposal: {} as Governance_Proposal,
  governance_proposal_id: 0,
}

export const DEFAULT_PROPOSAL: CurrentRoundProposalsStorageType[number] = {
  id: -1,
  proposerId: '',
  status: 0,
  title: '',
  description: '',
  invoice: '',
  successReward: 0,
  startDateTime: '',
  executed: false,
  locked: false,
  sourceCode: '',
  passVoteMvkTotal: 0,
  upvoteMvkTotal: 0,
  downvoteMvkTotal: 0,
  abstainMvkTotal: 0,
  minProposalRoundVoteRequirement: 0,
  minProposalRoundVotePercentage: 0,
  minQuorumPercentage: 0,
  minQuorumMvkTotal: 0,
  quorumMvkTotal: 0,
  currentRoundProposal: true,
  currentCycleStartLevel: 0,
  currentCycleEndLevel: 0,
  cycle: 0,
  proposalData: [],
  proposalPayments: [],
  governanceId: '',
  paymentProcessed: false,
}

// stage 1 default values
export const DEFAULT_VALIDITY: ValidSubmitProposalForm = {
  title: false,
  description: false,
  ipfs: true,
  successMVKReward: true,
  invoiceTable: true,
  sourceCode: false,
}

export const DEFAULT_INPUT_STATUSES: SubmitProposalFormInputStatus = {
  title: '',
  description: '',
  ipfs: '',
  successMVKReward: '',
  invoiceTable: 'success',
  sourceCode: '',
}

export const PAYMENTS_TYPES = ['XTZ', 'MVK']
export const INIT_TABLE_HEADERS = ['Address', 'Purpose', 'Amount', 'Payment Type (XTZ/MVK)', '-', '-']
export const INIT_TABLE_DATA = [INIT_TABLE_HEADERS, ['', '', '', PAYMENTS_TYPES[0], '-', '-']]
export const MAX_ROWS = 10
