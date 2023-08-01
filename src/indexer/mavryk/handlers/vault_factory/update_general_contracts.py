from mavryk.utils.error_reporting import save_error_report
from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.vault_factory.tezos_storage import VaultFactoryStorage
from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.vault_factory.tezos_parameters.update_general_contracts import UpdateGeneralContractsParameter
import mavryk.models as models

async def update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: TzktTransaction[UpdateGeneralContractsParameter, VaultFactoryStorage],
) -> None:

    try:
        # Perists general contract
        await persist_linked_contract(ctx, models.VaultFactory, models.VaultFactoryGeneralContract, update_general_contracts)

    except BaseException as e:
        await save_error_report(e)

