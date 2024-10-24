from maven.utils.error_reporting import save_error_report
from maven.utils.persisters import persist_council_action
from maven.types.council.tezos_storage import CouncilStorage
from dipdup.models.tezos import TezosTransaction
from maven.types.council.tezos_parameters.council_action_add_member import CouncilActionAddMemberParameter
from dipdup.context import HandlerContext

async def council_action_add_member(
    ctx: HandlerContext,
    council_action_add_member: TezosTransaction[CouncilActionAddMemberParameter, CouncilStorage],
) -> None:

    try:
        await persist_council_action(ctx, council_action_add_member)
    except BaseException as e:
        await save_error_report(e)

