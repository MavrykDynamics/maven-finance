from mavryk.utils.error_reporting import save_error_report
from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.vault_factory.parameter.update_whitelist_contracts import UpdateWhitelistContractsParameter
from mavryk.types.vault_factory.storage import VaultFactoryStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
import mavryk.models as models

async def on_vault_factory_update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: Transaction[UpdateWhitelistContractsParameter, VaultFactoryStorage],
) -> None:

    try:
        # Persist whitelist contract
        await persist_linked_contract(models.VaultFactory, models.VaultFactoryWhitelistContract, update_whitelist_contracts)

    except BaseException:
         await save_error_report()

