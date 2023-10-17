from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.break_glass.tezos_parameters.council_action_remove_member import CouncilActionRemoveMemberParameter
from mavryk.types.break_glass.tezos_storage import BreakGlassStorage
from mavryk.utils.persisters import persist_break_glass_action
from mavryk.utils.error_reporting import save_error_report
import mavryk.models as models

async def council_action_remove_member(
    ctx: HandlerContext,
    council_action_remove_member: TzktTransaction[CouncilActionRemoveMemberParameter, BreakGlassStorage],
) -> None:

    try:
        await persist_break_glass_action(ctx, council_action_remove_member)

        # Save the old member in a temp record in case the action is executed
        break_glass_address                 = council_action_remove_member.data.target_address
        old_council_member_address          = council_action_remove_member.parameter.__root__
        break_glass                         = await models.BreakGlass.get(network=ctx.datasource.name.replace('tzkt_',''), address=break_glass_address)
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
