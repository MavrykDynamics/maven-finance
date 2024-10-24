from maven.utils.error_reporting import save_error_report

from maven.utils.persisters import persist_governance
from maven.types.aggregator_factory.tezos_parameters.set_governance import SetGovernanceParameter
from dipdup.models.tezos import TezosTransaction
from maven.types.aggregator_factory.tezos_storage import AggregatorFactoryStorage
from dipdup.context import HandlerContext
import maven.models as models

async def set_governance(
    ctx: HandlerContext,
    set_governance: TezosTransaction[SetGovernanceParameter, AggregatorFactoryStorage],
) -> None:

    try:

        # Persist new governance
        await persist_governance(ctx, models.AggregatorFactory, set_governance)

    except BaseException as e:
        await save_error_report(e)

