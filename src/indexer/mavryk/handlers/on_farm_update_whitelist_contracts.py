
from mavryk.utils.persisters import persist_whitelist_contract
from mavryk.types.farm.parameter.update_whitelist_contracts import UpdateWhitelistContractsParameter
from dipdup.context import HandlerContext
from mavryk.types.farm.storage import FarmStorage
from dipdup.models import Transaction

async def on_farm_update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: Transaction[UpdateWhitelistContractsParameter, FarmStorage],
) -> None:

    # Persist whitelist contract
    await persist_whitelist_contract(update_whitelist_contracts)