from maven.utils.error_reporting import save_error_report

from maven.utils.persisters import persist_governance
from maven.types.aggregator.tezos_storage import AggregatorStorage
from dipdup.models.tezos_tzkt import TzktTransaction
from maven.types.aggregator.tezos_parameters.set_governance import SetGovernanceParameter
from dipdup.context import HandlerContext
import maven.models as models

async def set_governance(
    ctx: HandlerContext,
    set_governance: TzktTransaction[SetGovernanceParameter, AggregatorStorage],
) -> None:

    try:

        # Persist new governance
        await persist_governance(ctx, models.Aggregator, set_governance)

    except BaseException as e:
        await save_error_report(e)

