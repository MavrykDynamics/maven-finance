from mavryk.utils.persisters import persist_lambda
from mavryk.types.vault_factory.storage import VaultFactoryStorage
from mavryk.types.vault_factory.parameter.set_lambda import SetLambdaParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
import mavryk.models as models

async def on_vault_factory_set_lambda(
    ctx: HandlerContext,
    set_lambda: Transaction[SetLambdaParameter, VaultFactoryStorage],
) -> None:

    # Persist lambda
    await persist_lambda(models.VaultFactory, models.VaultFactoryLambda, set_lambda)
