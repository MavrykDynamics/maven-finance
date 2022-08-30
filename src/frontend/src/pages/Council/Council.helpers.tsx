// types
import { CouncilGraphQL } from '../../utils/TypesAndInterfaces/Council'

export const noralizeCouncilStorage = (storage: CouncilGraphQL) => {
  const councilActionsLedger = storage?.council_action_records?.length
    ? storage?.council_action_records.map((actionRecord) => {
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
          executedDatetime: new Date(actionRecord.executed_datetime as string),
          expirationDatetime: new Date(actionRecord.expiration_datetime as string),
          id: actionRecord.id,
          initiatorId: actionRecord.initiator_id,
          startDatetime: new Date(actionRecord.start_datetime as string),
          status: actionRecord.status,
          signers,
        }
      })
    : []

  return {
    address: storage?.address,
    config: {
      threshold: storage?.threshold,
      actionExpiryDays: storage?.action_expiry_days,
    },
    actionCounter: storage?.action_counter,
    councilActionsLedger,
    councilMembers: storage?.council_council_members?.length ? storage.council_council_members : [],
  }
}
