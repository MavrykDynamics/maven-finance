from maven.utils.error_reporting import save_error_report

from dipdup.models.tezos import TezosTransaction
from maven.utils.persisters import persist_lambda
from maven.types.vesting.tezos_parameters.set_lambda import SetLambdaParameter
from maven.types.vesting.tezos_storage import VestingStorage
from dipdup.context import HandlerContext
from maven import models as models

async def set_lambda(
    ctx: HandlerContext,
    set_lambda: TezosTransaction[SetLambdaParameter, VestingStorage],
) -> None:

    try:
        # Persist lambda
        await persist_lambda(ctx, models.Vesting, models.VestingLambda, set_lambda)

    except BaseException as e:
        await save_error_report(e)

