from mavryk.utils.error_reporting import save_error_report
from mavryk.utils.persisters import persist_council_action
from mavryk.types.council.tezos_storage import CouncilStorage
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.council.tezos_parameters.council_action_add_member import CouncilActionAddMemberParameter
from dipdup.context import HandlerContext

async def council_action_add_member(
    ctx: HandlerContext,
    council_action_add_member: TzktTransaction[CouncilActionAddMemberParameter, CouncilStorage],
) -> None:

    try:
        await persist_council_action(ctx, council_action_add_member)
    except BaseException as e:
        await save_error_report(e)

