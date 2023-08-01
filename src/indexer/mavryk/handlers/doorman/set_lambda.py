from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from mavryk.utils.persisters import persist_lambda
from mavryk.types.doorman.parameter.set_lambda import SetLambdaParameter
from mavryk.types.doorman.storage import DoormanStorage
from dipdup.context import HandlerContext
import mavryk.models as models

async def set_lambda(
    ctx: HandlerContext,
    set_lambda: Transaction[SetLambdaParameter, DoormanStorage],
) -> None:

    try:
        # Persist lambda
        await persist_lambda(ctx, models.Doorman, models.DoormanLambda, set_lambda)

    except BaseException as e:
        await save_error_report(e)

