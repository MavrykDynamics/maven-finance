from maven.utils.error_reporting import save_error_report

from maven.utils.persisters import persist_governance
from maven.types.vesting.tezos_parameters.set_governance import SetGovernanceParameter
from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
from maven.types.vesting.tezos_storage import VestingStorage
import maven.models as models

async def set_governance(
    ctx: HandlerContext,
    set_governance: TzktTransaction[SetGovernanceParameter, VestingStorage],
) -> None:

    try:

        # Persist new governance
        await persist_governance(ctx, models.Vesting, set_governance)

    except BaseException as e:
        await save_error_report(e)

