import { BreakGlassCouncilMemberGraphQL } from "utils/TypesAndInterfaces/BreakGlass"

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
