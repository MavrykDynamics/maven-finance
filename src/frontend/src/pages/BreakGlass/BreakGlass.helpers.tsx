// types
import { BreakGlassGraphQL } from "../../utils/TypesAndInterfaces/BreakGlass";

export const normalizeBreakGlass = (storage: BreakGlassGraphQL) => {
  const actionLedger = storage?.break_glass_action_records?.length
    ? storage?.break_glass_action_records.map((actionRecord) => {
        const signers = actionRecord.signers?.length
          ? actionRecord.signers.map((signer) => {
              return {
                breakGlassActionRecordId: signer.break_glass_action_record_id,
                id: signer.id,
                signerId: signer.signer_id,
              };
            })
          : [];

        return {
          actionType: actionRecord.action_type,
          breakGlassId: actionRecord.break_glass_id,
          executed: actionRecord.executed,
          executedDatetime: new Date(actionRecord.executed_datetime),
          expirationDatetime: new Date(actionRecord.expiration_datetime),
          id: actionRecord.id,
          initiatorId: actionRecord.initiator_id,
          startDatetime: new Date(actionRecord.start_datetime),
          status: actionRecord.status,
          signers,
          executedLevel: actionRecord.executed_level,
          signersCount: actionRecord.signers_count,
        };
      })
    : [];

  return {
    address: storage?.address,
    admin: storage?.admin,
    governanceId: storage?.governance_id,
    config: {
      threshold: storage?.threshold,
      actionExpiryDays: storage?.action_expiry_days,
      councilMemberNameMaxLength: storage?.council_member_name_max_length,
      councilMemberImageMaxLength: storage?.council_member_image_max_length,
      councilMemberWebsiteMaxLength: storage?.council_member_website_max_length,
    },
    actionCounter: storage?.action_counter,
    glassBroken: storage?.glass_broken,
    actionLedger,
  };
};
