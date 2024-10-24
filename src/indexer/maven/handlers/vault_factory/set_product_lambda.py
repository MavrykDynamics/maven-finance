from maven.utils.error_reporting import save_error_report
from maven.utils.persisters import persist_lambda
from maven.types.vault_factory.tezos_storage import VaultFactoryStorage
from maven.types.vault_factory.tezos_parameters.set_product_lambda import SetProductLambdaParameter
from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction
import maven.models as models

async def set_product_lambda(
    ctx: HandlerContext,
    set_product_lambda: TezosTransaction[SetProductLambdaParameter, VaultFactoryStorage],
) -> None:

    try:
        # Persist lambda
        await persist_lambda(ctx, models.VaultFactory, models.VaultFactoryVaultLambda, set_product_lambda)

    except BaseException as e:
        await save_error_report(e)

