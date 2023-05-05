from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from mavryk.utils.persisters import persist_lambda
from mavryk.types.farm.storage import FarmStorage
from mavryk.types.farm.parameter.set_lambda import SetLambdaParameter
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_farm_set_lambda(
    ctx: HandlerContext,
    set_lambda: Transaction[SetLambdaParameter, FarmStorage],
) -> None:

    try:
        # Persist lambda
        await persist_lambda(models.Farm, models.FarmLambda, set_lambda)

    except BaseException as e:
         await save_error_report(e)

