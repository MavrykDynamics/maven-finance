import { BreakGlassCouncilMemberGraphQL, BreakGlassActionGraphQL } from "utils/TypesAndInterfaces/BreakGlassActions"

type BreakGlassCouncilMemberProps = {
  break_glass_council_member: BreakGlassCouncilMemberGraphQL[]
}

export function normalizeBreakGlassCouncilMember(storage: BreakGlassCouncilMemberProps) {
  const { break_glass_council_member } = storage;

  return break_glass_council_member?.map((item) => {
    return {
      breakGlassId: item.break_glass_id,
      breakGlass: item.break_glass,
      id: item.id,
      image: item.image,
      name: item.name,
      user: item.user,
      userId: item.user_id,
      website: item.website,
    }
  })
}

type BreakGlassActionProps = {
  break_glass_action: BreakGlassActionGraphQL[]
}

export function normalizeBreakGlassAction(storage: BreakGlassActionProps) {
  const { break_glass_action } = storage;

  return break_glass_action?.map((item) => {
    return {
      actionType: item.action_type,
      breakGlass: item.break_glass,
      breakGlassId: item.break_glass_id,
      executed: item.executed,
      executionDatetime: item.execution_datetime,
      executionLevel: item.execution_level,
      expirationDatetime: item.expiration_datetime,
      id: item.id,
      initiator: item.initiator,
      initiatorId: item.initiator_id,
      parameters: item.parameters,
      parametersAggregate: item.parameters_aggregate,
      signers: item.signers,
      signersAggregate: item.signers_aggregate,
      signersCount: item.signers_count,
      startDatetime: item.start_datetime,
      status: item.status,
    }
  })
}