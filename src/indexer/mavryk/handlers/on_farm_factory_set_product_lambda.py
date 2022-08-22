
from dipdup.models import Transaction
from mavryk.utils.persisters import persist_lambda
from mavryk.types.farm_factory.storage import FarmFactoryStorage
from mavryk.types.farm_factory.parameter.set_product_lambda import SetProductLambdaParameter
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_farm_factory_set_product_lambda(
    ctx: HandlerContext,
    set_product_lambda: Transaction[SetProductLambdaParameter, FarmFactoryStorage],
) -> None:

    # Persist lambda
    await persist_lambda(models.FarmFactory, models.FarmFactoryProductLambda, set_product_lambda)
