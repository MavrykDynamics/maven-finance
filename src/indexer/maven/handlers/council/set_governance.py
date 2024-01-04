from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from maven.utils.persisters import persist_governance
from maven.types.council.tezos_storage import CouncilStorage
from dipdup.models.tezos_tzkt import TzktTransaction
from maven.types.council.tezos_parameters.set_governance import SetGovernanceParameter
import maven.models as models

async def set_governance(
    ctx: HandlerContext,
    set_governance: TzktTransaction[SetGovernanceParameter, CouncilStorage],
) -> None:

    try:

        # Persist new governance
        await persist_governance(ctx, models.Council, set_governance)

    except BaseException as e:
        await save_error_report(e)

