
from dipdup.models import Transaction
from mavryk.types.vault.storage import VaultStorage
from dipdup.context import HandlerContext
from mavryk.types.vault.parameter.set_lambda import SetLambdaParameter

async def on_vault_set_lambda(
    ctx: HandlerContext,
    set_lambda: Transaction[SetLambdaParameter, VaultStorage],
) -> None:
    
    breakpoint()
