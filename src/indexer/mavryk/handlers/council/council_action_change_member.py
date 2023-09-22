from mavryk.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from mavryk.utils.persisters import persist_council_action
from mavryk.types.council.tezos_storage import CouncilStorage
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.council.tezos_parameters.council_action_change_member import CouncilActionChangeMemberParameter

async def council_action_change_member(
    ctx: HandlerContext,
    council_action_change_member: TzktTransaction[CouncilActionChangeMemberParameter, CouncilStorage],
) -> None:

    try:
        await persist_council_action(ctx, council_action_change_member)
    except BaseException as e:
        await save_error_report(e)

