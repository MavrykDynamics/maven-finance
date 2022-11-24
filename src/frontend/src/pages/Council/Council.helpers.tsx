// types
import { CouncilGraphQL, CouncilActionRecordhQL, CouncilStorage } from '../../utils/TypesAndInterfaces/Council'

export const noralizeCouncilStorage = (storage: CouncilGraphQL) => {
  const councilActionsLedger = storage?.actions?.length
    ? storage?.actions.map((actionRecord) => {
        const signers = actionRecord.signers?.length
          ? actionRecord.signers.map((signer) => {
              return {
                id: signer.id,
                signerId: signer.signer_id,
              }
            })
          : []

        return {
          actionType: actionRecord.action_type,
          councilId: actionRecord.council_id,
          executed: actionRecord.executed,
          expirationDatetime: new Date(actionRecord.expiration_datetime as string),
          id: actionRecord.id,
          initiatorId: actionRecord.initiator_id,
          startDatetime: new Date(actionRecord.start_datetime as string),
          status: actionRecord.status,
          signers,
        }
      })
    : []

  const councilMembers = storage?.members.map((member) => {
    return {
      id: member.id,
      name: member.name,
      image: member.image,
      userId: member.user_id,
      website: member.website,
    }
  }) 

  return {
    address: storage?.address,
    config: {
      threshold: storage?.threshold,
      actionExpiryDays: storage?.action_expiry_days,
    },
    actionCounter: storage?.action_counter,
    councilMemberImageMaxLength: storage?.council_member_image_max_length || 400,
    councilMemberNameMaxLength: storage?.council_member_name_max_length || 400,
    councilMemberWebsiteMaxLength: storage?.council_member_website_max_length || 400,
    requestPurposeMaxLength: storage?.request_purpose_max_length || 500,
    requestTokenNameMaxLength: storage?.request_token_name_max_length || 400,
    councilActionsLedger,
    councilMembers: storage?.members?.length ? councilMembers : [],
  }
}

type CouncilActionProps = {
  council_action: CouncilActionRecordhQL[]
}

type Options = {
  filterByAddress?: string
  filterWithoutAddress?: string
}

export const normalizeCouncilActions = (storage: CouncilActionProps, options?: Options) => {
  const { council_action } = storage
  if (!council_action?.length) return []

  const filterByAddress = options?.filterByAddress
  const filterWithoutAddress = options?.filterWithoutAddress
  let list: CouncilActionRecordhQL[] = []

  if (filterByAddress) {
    list = council_action.filter((item) => item.initiator_id === filterByAddress)
  } else if (filterWithoutAddress) {
    list = council_action.filter((item) => item.initiator_id !== filterWithoutAddress)
  } else {
    list = council_action
  }

  const result = list.map(item => (
    {
      actionType: item.action_type,
      councilId: item.council_id,
      executed: item.executed,
      executionDatetime: item.execution_datetime,
      expirationDatetime: item.execution_datetime,
      id: item.id,
      initiatorId: item.initiator_id,
      startDatetime: item.start_datetime,
      status: item.status,
      parameters: item.parameters?.map((param) => (
        {
          id: param.id,
          name: param.name,
          value: param.value,
        }
      )) || [],
      signersCount: item.signers_count,
      signers: item.signers?.map((signer) => (
        {
          council_action: signer.council_action,
          council_action_id: signer.council_action_id,
          id: signer.id,
          signer: signer.signer,
          signer_id: signer.signer_id,
        }
      )) || [],
    }
  ))

  return result
}

type CouncilMember = CouncilStorage['councilMembers']

export const memberIsFirstOfList = (list: CouncilMember, address?: string) => {
  const indexOfMember = list.findIndex((item) => item.userId === address)

  if (indexOfMember === -1) {
    return list
  }

  const updatedList = [list[indexOfMember]].concat(list.filter(({userId}) => userId !== address))

  return updatedList
}

