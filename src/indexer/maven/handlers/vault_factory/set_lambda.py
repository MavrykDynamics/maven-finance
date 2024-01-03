from maven.utils.error_reporting import save_error_report
from maven.utils.persisters import persist_lambda
from maven.types.vault_factory.tezos_storage import VaultFactoryStorage
from maven.types.vault_factory.tezos_parameters.set_lambda import SetLambdaParameter
from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
import maven.models as models

async def set_lambda(
    ctx: HandlerContext,
    set_lambda: TzktTransaction[SetLambdaParameter, VaultFactoryStorage],
) -> None:

    try:
        # Persist lambda
        await persist_lambda(ctx, models.VaultFactory, models.VaultFactoryLambda, set_lambda)

    except BaseException as e:
        await save_error_report(e)

