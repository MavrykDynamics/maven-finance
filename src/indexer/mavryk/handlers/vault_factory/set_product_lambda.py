from mavryk.utils.error_reporting import save_error_report
from mavryk.utils.persisters import persist_lambda
from mavryk.types.vault_factory.tezos_storage import VaultFactoryStorage
from mavryk.types.vault_factory.tezos_parameters.set_product_lambda import SetProductLambdaParameter
from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
import mavryk.models as models

async def set_product_lambda(
    ctx: HandlerContext,
    set_product_lambda: TzktTransaction[SetProductLambdaParameter, VaultFactoryStorage],
) -> None:

    try:
        # Persist lambda
        await persist_lambda(ctx, models.VaultFactory, models.VaultFactoryVaultLambda, set_product_lambda)

    except BaseException as e:
        await save_error_report(e)

