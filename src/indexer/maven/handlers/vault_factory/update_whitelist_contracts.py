from maven.utils.error_reporting import save_error_report
from maven.utils.persisters import persist_linked_contract
from maven.types.vault_factory.tezos_parameters.update_whitelist_contracts import UpdateWhitelistContractsParameter
from maven.types.vault_factory.tezos_storage import VaultFactoryStorage
from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
import maven.models as models

async def update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: TzktTransaction[UpdateWhitelistContractsParameter, VaultFactoryStorage],
) -> None:

    try:
        # Persist whitelist contract
        await persist_linked_contract(ctx, models.VaultFactory, models.VaultFactoryWhitelistContract, update_whitelist_contracts)

    except BaseException as e:
        await save_error_report(e)

