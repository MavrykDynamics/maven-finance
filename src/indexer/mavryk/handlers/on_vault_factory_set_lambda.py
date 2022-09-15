
from mavryk.types.vault_factory.storage import VaultFactoryStorage
from mavryk.types.vault_factory.parameter.set_lambda import SetLambdaParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction

async def on_vault_factory_set_lambda(
    ctx: HandlerContext,
    set_lambda: Transaction[SetLambdaParameter, VaultFactoryStorage],
) -> None:
    ...