from mavryk.utils.error_reporting import save_error_report

from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.utils.persisters import persist_lambda
from mavryk.types.aggregator_factory.tezos_parameters.set_product_lambda import SetProductLambdaParameter
from mavryk.types.aggregator_factory.tezos_storage import AggregatorFactoryStorage
from dipdup.context import HandlerContext
import mavryk.models as models

async def set_product_lambda(
    ctx: HandlerContext,
    set_product_lambda: TzktTransaction[SetProductLambdaParameter, AggregatorFactoryStorage],
) -> None:

    try:
        # Persist lambda
        await persist_lambda(ctx, models.AggregatorFactory, models.AggregatorFactoryAggregatorLambda, set_product_lambda)

    except BaseException as e:
        await save_error_report(e)

