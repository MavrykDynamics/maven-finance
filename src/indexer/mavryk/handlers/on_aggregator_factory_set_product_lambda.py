
from dipdup.models import Transaction
from mavryk.utils.persisters import persist_lambda
from mavryk.types.aggregator_factory.parameter.set_product_lambda import SetProductLambdaParameter
from mavryk.types.aggregator_factory.storage import AggregatorFactoryStorage
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_aggregator_factory_set_product_lambda(
    ctx: HandlerContext,
    set_product_lambda: Transaction[SetProductLambdaParameter, AggregatorFactoryStorage],
) -> None:

    # Persist lambda
    await persist_lambda(models.AggregatorFactory, models.AggregatorFactoryAggregatorLambda, set_product_lambda)
