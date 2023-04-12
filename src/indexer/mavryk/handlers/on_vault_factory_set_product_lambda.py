from mavryk.utils.persisters import persist_lambda
from mavryk.types.vault_factory.storage import VaultFactoryStorage
from mavryk.types.vault_factory.parameter.set_product_lambda import SetProductLambdaParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
import mavryk.models as models

async def on_vault_factory_set_product_lambda(
    ctx: HandlerContext,
    set_product_lambda: Transaction[SetProductLambdaParameter, VaultFactoryStorage],
) -> None:

    # Persist lambda
    await persist_lambda(models.VaultFactory, models.VaultFactoryVaultLambda, set_product_lambda)
