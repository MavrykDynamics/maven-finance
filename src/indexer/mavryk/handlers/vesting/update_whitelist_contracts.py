from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.vesting.tezos_storage import VestingStorage
from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.vesting.tezos_parameters.update_whitelist_contracts import UpdateWhitelistContractsParameter
import mavryk.models as models

async def update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: TzktTransaction[UpdateWhitelistContractsParameter, VestingStorage],
) -> None:

    try:
        # Persist whitelist contract
        await persist_linked_contract(ctx, models.Vesting, models.VestingWhitelistContract, update_whitelist_contracts)
    except BaseException as e:
        await save_error_report(e)

