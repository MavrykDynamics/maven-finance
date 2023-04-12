
from dipdup.models import Transaction
from mavryk.utils.persisters import persist_lambda
from mavryk.types.treasury_factory.storage import TreasuryFactoryStorage
from mavryk.types.treasury_factory.parameter.set_product_lambda import SetProductLambdaParameter
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_treasury_factory_set_product_lambda(
    ctx: HandlerContext,
    set_product_lambda: Transaction[SetProductLambdaParameter, TreasuryFactoryStorage],
) -> None:

    # Persist lambda
    await persist_lambda(models.TreasuryFactory, models.TreasuryFactoryTreasuryLambda, set_product_lambda)
