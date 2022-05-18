
from mavryk.utils.persisters import persist_whitelist_contract
from mavryk.types.mvk.parameter.update_whitelist_contracts import UpdateWhitelistContractsParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.mvk.storage import MvkStorage

async def on_mvk_update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: Transaction[UpdateWhitelistContractsParameter, MvkStorage],
) -> None:

    # Persist whitelist contract
    await persist_whitelist_contract(update_whitelist_contracts)