from mavryk.utils.error_reporting import save_error_report

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

    try:
        # Persist lambda
        await persist_lambda(models.AggregatorFactory, models.AggregatorFactoryAggregatorLambda, set_product_lambda)

    except BaseException as e:
         await save_error_report(e)

