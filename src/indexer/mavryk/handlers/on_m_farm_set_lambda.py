from mavryk.utils.error_reporting import save_error_report
from mavryk.utils.persisters import persist_lambda
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.m_farm.parameter.set_lambda import SetLambdaParameter
from mavryk.types.m_farm.storage import MFarmStorage
import mavryk.models as models

async def on_m_farm_set_lambda(
    ctx: HandlerContext,
    set_lambda: Transaction[SetLambdaParameter, MFarmStorage],
) -> None:

    try:
        # Persist lambda
        await persist_lambda(ctx, models.Farm, models.FarmLambda, set_lambda)

    except BaseException as e:
         await save_error_report(e)
