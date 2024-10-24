from maven.utils.error_reporting import save_error_report
from maven.utils.persisters import persist_council_action
from maven.types.council.tezos_parameters.council_action_remove_member import CouncilActionRemoveMemberParameter
from maven.types.council.tezos_storage import CouncilStorage
from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction
import maven.models as models

async def council_action_remove_member(
    ctx: HandlerContext,
    council_action_remove_member: TezosTransaction[CouncilActionRemoveMemberParameter, CouncilStorage],
) -> None:

    try:
        await persist_council_action(ctx, council_action_remove_member)

        # Save the old member in a temp record in case the action is executed
        council_address                 = council_action_remove_member.data.target_address
        old_council_member_address      = council_action_remove_member.parameter.root
        council                         = await models.Council.get(network='atlasnet', address=council_address)
        council_action_id               = council.action_counter - 1
        council_action                  = await models.CouncilAction.get(
            internal_id = council_action_id,
            council     = council
        )
        council_temp_member_parameter   = models.CouncilActionTempMemberParameter(
            council_action              = council_action,
            old_council_member_address  = old_council_member_address
        )
        await council_temp_member_parameter.save()
    except BaseException as e:
        await save_error_report(e)

