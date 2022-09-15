
from mavryk.types.vault_factory.parameter.toggle_pause_entrypoint import TogglePauseEntrypointParameter
from mavryk.types.vault_factory.storage import VaultFactoryStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction

async def on_vault_factory_toggle_pause_entrypoint(
    ctx: HandlerContext,
    toggle_pause_entrypoint: Transaction[TogglePauseEntrypointParameter, VaultFactoryStorage],
) -> None:
    ...