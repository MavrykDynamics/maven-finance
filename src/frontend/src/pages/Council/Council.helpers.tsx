// types
import { CouncilGraphQL } from '../../utils/TypesAndInterfaces/Council'

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
    councilActionsLedger,
    councilMembers: storage?.members?.length ? councilMembers : [],
  }
}
