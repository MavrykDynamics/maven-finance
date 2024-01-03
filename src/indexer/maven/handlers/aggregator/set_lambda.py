from maven.utils.error_reporting import save_error_report

from dipdup.models.tezos_tzkt import TzktTransaction
from maven.utils.persisters import persist_lambda
from maven.types.aggregator.tezos_storage import AggregatorStorage
from maven.types.aggregator.tezos_parameters.set_lambda import SetLambdaParameter
from dipdup.context import HandlerContext
import maven.models as models

async def set_lambda(
    ctx: HandlerContext,
    set_lambda: TzktTransaction[SetLambdaParameter, AggregatorStorage],
) -> None:

    try:
        # Persist lambda
        await persist_lambda(ctx, models.Aggregator, models.AggregatorLambda, set_lambda)

    except BaseException as e:
        await save_error_report(e)

