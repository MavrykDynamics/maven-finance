from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from ..utils.persisters import persist_lambda
from mavryk.types.vesting.parameter.set_lambda import SetLambdaParameter
from mavryk.types.vesting.storage import VestingStorage
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_vesting_set_lambda(
    ctx: HandlerContext,
    set_lambda: Transaction[SetLambdaParameter, VestingStorage],
) -> None:

    try:
        # Persist lambda
        await persist_lambda(ctx, models.Vesting, models.VestingLambda, set_lambda)

    except BaseException as e:
         await save_error_report(e)

