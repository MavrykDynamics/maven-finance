
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

    # Persist lambda
    await persist_lambda(models.Farm, models.FarmLambda, set_lambda)
