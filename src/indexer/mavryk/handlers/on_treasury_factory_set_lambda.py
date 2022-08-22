
from dipdup.models import Transaction
from mavryk.utils.persisters import persist_lambda
from mavryk.types.treasury_factory.storage import TreasuryFactoryStorage
from mavryk.types.treasury_factory.parameter.set_lambda import SetLambdaParameter
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_treasury_factory_set_lambda(
    ctx: HandlerContext,
    set_lambda: Transaction[SetLambdaParameter, TreasuryFactoryStorage],
) -> None:

    # Persist lambda
    await persist_lambda(models.TreasuryFactory, models.TreasuryFactoryLambda, set_lambda)
