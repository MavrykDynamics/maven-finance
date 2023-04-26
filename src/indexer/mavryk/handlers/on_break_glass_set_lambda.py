from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from mavryk.utils.persisters import persist_lambda
from mavryk.types.break_glass.storage import BreakGlassStorage
from mavryk.types.break_glass.parameter.set_lambda import SetLambdaParameter
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_break_glass_set_lambda(
    ctx: HandlerContext,
    set_lambda: Transaction[SetLambdaParameter, BreakGlassStorage],
) -> None:

    try:
        # Persist lambda
        await persist_lambda(models.BreakGlass, models.BreakGlassLambda, set_lambda)

    except BaseException:
         await save_error_report()

