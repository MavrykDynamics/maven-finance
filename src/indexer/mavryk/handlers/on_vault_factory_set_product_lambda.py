from mavryk.utils.error_reporting import save_error_report
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

    try:
        # Persist lambda
        await persist_lambda(models.VaultFactory, models.VaultFactoryVaultLambda, set_product_lambda)

    except BaseException as e:
         await save_error_report(e)

