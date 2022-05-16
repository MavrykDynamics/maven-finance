
from mavryk.types.treasury.storage import TreasuryStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.treasury.parameter.update_whitelist_contracts import UpdateWhitelistContractsParameter

async def on_treasury_update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: Transaction[UpdateWhitelistContractsParameter, TreasuryStorage],
) -> None:
    ...