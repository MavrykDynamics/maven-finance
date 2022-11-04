// types
import { CouncilGraphQL, CouncilMember } from '../../utils/TypesAndInterfaces/Council'
import { InputStatusType } from 'app/App.components/Input/Input.constants'

// helpers
import { checkMaxLength } from 'utils/validation'

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
    councilMemberImageMaxLength: storage?.council_member_image_max_length || 0,
    councilMemberNameMaxLength: storage?.council_member_name_max_length || 0,
    councilMemberWebsiteMaxLength: storage?.council_member_website_max_length || 0,
    requestPurposeMaxLength: storage?.request_purpose_max_length || 0,
    requestTokenNameMaxLength: storage?.request_token_name_max_length || 0,
    councilActionsLedger,
    councilMembers: storage?.members?.length ? councilMembers : [],
  }
}

export const memberIsFirstOfList = (list: CouncilMember[], address?: string) => {
  const indexOfMember = list.findIndex((item) => item.userId === address)

  if (indexOfMember === -1) {
    return list
  }

  const updatedList = [list[indexOfMember]].concat(list.filter(({userId}) => userId !== address))

  return updatedList
}

export const validateForm = (setFormInputStatus: (value: React.SetStateAction<Record<string, InputStatusType>>) => void) => (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>, maxLength?: number) => {
  setFormInputStatus((prev) => {
    const { value, name } = e.target

    const checkMaxLengthField = maxLength ? checkMaxLength(value, maxLength) ? 'success' : 'error' : 'success'
    const checkEmptyField = value ? checkMaxLengthField : 'error'

    return { ...prev, [name]: checkEmptyField }
  })
}
