from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_governance
from mavryk.types.aggregator_factory.parameter.set_governance import SetGovernanceParameter
from dipdup.models import Transaction
from mavryk.types.aggregator_factory.storage import AggregatorFactoryStorage
from dipdup.context import HandlerContext
import mavryk.models as models

async def set_governance(
    ctx: HandlerContext,
    set_governance: Transaction[SetGovernanceParameter, AggregatorFactoryStorage],
) -> None:

    try:

        # Persist new governance
        await persist_governance(ctx, models.AggregatorFactory, set_governance)

    except BaseException as e:
        await save_error_report(e)

