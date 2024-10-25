from maven.utils.error_reporting import save_error_report

from dipdup.models.tezos_tzkt import TzktTransaction
from maven.utils.persisters import persist_lambda
from maven.types.council.tezos_parameters.set_lambda import SetLambdaParameter
from maven.types.council.tezos_storage import CouncilStorage
from dipdup.context import HandlerContext
import maven.models as models

async def set_lambda(
    ctx: HandlerContext,
    set_lambda: TzktTransaction[SetLambdaParameter, CouncilStorage],
) -> None:

    try:
        # Persist lambda
        await persist_lambda(ctx, models.Council, models.CouncilLambda, set_lambda)

    except BaseException as e:
        await save_error_report(e)

