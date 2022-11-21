import { BreakGlassCouncilMemberGraphQL, BreakGlassActionGraphQL } from 'utils/TypesAndInterfaces/BreakGlass'

type BreakGlassActionProps = {
  break_glass_action: BreakGlassActionGraphQL[]
}

type Options = {
  filterByAddress?: string
  filterWithoutAddress?: string
}

export function normalizeBreakGlassAction(storage: BreakGlassActionProps, options?: Options) {
  const { break_glass_action } = storage
  const filterByAddress = options?.filterByAddress
  const filterWithoutAddress = options?.filterWithoutAddress
  let list: BreakGlassActionGraphQL[] = []

  if (filterByAddress) {
    list = break_glass_action?.filter((item) => item.initiator_id === filterByAddress)
  } else if (filterWithoutAddress) {
    list = break_glass_action?.filter((item) => item.initiator_id !== filterWithoutAddress)
  } else {
    list = break_glass_action
  }

  return list.map((item) => {
    const signers = item?.signers?.length
      ? item.signers.map((signer) => {
          return {
            breakGlassAction: signer.break_glass_action,
            breakGlassActionId: signer.break_glass_action_id,
            id: signer.id,
            signer: signer.signer,
            signerId: signer.signer_id,
          }
        })
      : []

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
      signers,
      signersAggregate: item.signers_aggregate,
      signersCount: item.signers_count,
      startDatetime: item.start_datetime,
      status: item.status,
    }
  })
}

type BreakGlassCouncilMemberProps = {
  break_glass_council_member: BreakGlassCouncilMemberGraphQL[]
}

export function normalizeBreakGlassCouncilMember(storage: BreakGlassCouncilMemberProps) {
  const { break_glass_council_member } = storage

  return break_glass_council_member?.length
    ? break_glass_council_member.map((item) => {
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
    : []
}
