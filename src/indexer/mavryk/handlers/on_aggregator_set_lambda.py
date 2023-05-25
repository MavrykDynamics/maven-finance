from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from mavryk.utils.persisters import persist_lambda
from mavryk.types.aggregator.storage import AggregatorStorage
from mavryk.types.aggregator.parameter.set_lambda import SetLambdaParameter
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_aggregator_set_lambda(
    ctx: HandlerContext,
    set_lambda: Transaction[SetLambdaParameter, AggregatorStorage],
) -> None:

    try:
        # Persist lambda
        await persist_lambda(ctx, models.Aggregator, models.AggregatorLambda, set_lambda)

    except BaseException as e:
         await save_error_report(e)

