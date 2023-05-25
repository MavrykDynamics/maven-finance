from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from mavryk.utils.persisters import persist_lambda
from mavryk.types.aggregator_factory.storage import AggregatorFactoryStorage
from mavryk.types.aggregator_factory.parameter.set_lambda import SetLambdaParameter
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_aggregator_factory_set_lambda(
    ctx: HandlerContext,
    set_lambda: Transaction[SetLambdaParameter, AggregatorFactoryStorage],
) -> None:

    try:
        # Persist lambda
        await persist_lambda(ctx, models.AggregatorFactory, models.AggregatorFactoryLambda, set_lambda)

    except BaseException as e:
         await save_error_report(e)

