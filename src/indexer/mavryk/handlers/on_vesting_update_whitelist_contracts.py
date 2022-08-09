
from mavryk.utils.persisters import persist_whitelist_contract
from mavryk.types.vesting.storage import VestingStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.vesting.parameter.update_whitelist_contracts import UpdateWhitelistContractsParameter

async def on_vesting_update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: Transaction[UpdateWhitelistContractsParameter, VestingStorage],
) -> None:

    # Persist whitelist contract
    await persist_whitelist_contract(update_whitelist_contracts)