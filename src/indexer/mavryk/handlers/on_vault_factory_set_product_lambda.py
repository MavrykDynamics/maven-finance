
from mavryk.types.vault_factory.storage import VaultFactoryStorage
from mavryk.types.vault_factory.parameter.set_product_lambda import SetProductLambdaParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction

async def on_vault_factory_set_product_lambda(
    ctx: HandlerContext,
    set_product_lambda: Transaction[SetProductLambdaParameter, VaultFactoryStorage],
) -> None:
    ...