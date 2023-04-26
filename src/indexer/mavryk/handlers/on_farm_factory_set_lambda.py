from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from mavryk.utils.persisters import persist_lambda
from mavryk.types.farm_factory.storage import FarmFactoryStorage
from mavryk.types.farm_factory.parameter.set_lambda import SetLambdaParameter
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_farm_factory_set_lambda(
    ctx: HandlerContext,
    set_lambda: Transaction[SetLambdaParameter, FarmFactoryStorage],
) -> None:

    try:
        # Persist lambda
        await persist_lambda(models.FarmFactory, models.FarmFactoryLambda, set_lambda)

    except BaseException:
         await save_error_report()

