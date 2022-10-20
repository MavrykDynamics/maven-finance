
from dipdup.models import Transaction
from mavryk.utils.persisters import persist_lambda
from mavryk.types.vault.storage import VaultStorage
from dipdup.context import HandlerContext
from mavryk.types.vault.parameter.set_lambda import SetLambdaParameter
import mavryk.models as models

async def on_vault_set_lambda(
    ctx: HandlerContext,
    set_lambda: Transaction[SetLambdaParameter, VaultStorage],
) -> None:

    # Persist lambda
    await persist_lambda(models.Vault, models.VaultLambda, set_lambda)
