from maven.utils.error_reporting import save_error_report

from maven.utils.persisters import persist_admin
from maven.types.aggregator_factory.tezos_parameters.set_admin import SetAdminParameter
from dipdup.models.tezos_tzkt import TzktTransaction
from maven.types.aggregator_factory.tezos_storage import AggregatorFactoryStorage
from dipdup.context import HandlerContext
import maven.models as models

async def set_admin(
    ctx: HandlerContext,
    set_admin: TzktTransaction[SetAdminParameter, AggregatorFactoryStorage],
) -> None:

    try:

        # Persist new admin
        await persist_admin(ctx, models.AggregatorFactory, set_admin)

    except BaseException as e:
        await save_error_report(e)

