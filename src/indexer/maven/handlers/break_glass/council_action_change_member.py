from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction
from maven.types.break_glass.tezos_parameters.council_action_change_member import CouncilActionChangeMemberParameter
from maven.types.break_glass.tezos_storage import BreakGlassStorage
from maven.utils.persisters import persist_break_glass_action
from maven.utils.error_reporting import save_error_report
import maven.models as models

async def council_action_change_member(
    ctx: HandlerContext,
    council_action_change_member: TezosTransaction[CouncilActionChangeMemberParameter, BreakGlassStorage],
) -> None:

    try:
        await persist_break_glass_action(ctx, council_action_change_member)

        # Save the old member in a temp record in case the action is executed
        break_glass_address                 = council_action_change_member.data.target_address
        old_council_member_address          = council_action_change_member.parameter.oldCouncilMemberAddress
        break_glass                         = await models.BreakGlass.get(network='atlasnet', address=break_glass_address)
        break_glass_action_id               = break_glass.action_counter - 1
        break_glass_action                  = await models.BreakGlassAction.get(
            internal_id = break_glass_action_id,
            break_glass = break_glass
        )
        break_glass_temp_member_parameter   = models.BreakGlassActionTempMemberParameter(
            break_glass_action          = break_glass_action,
            old_council_member_address  = old_council_member_address
        )
        await break_glass_temp_member_parameter.save()

    except BaseException as e:
         await save_error_report(e)
