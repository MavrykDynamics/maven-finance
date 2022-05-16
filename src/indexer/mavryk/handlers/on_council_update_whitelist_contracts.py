
from mavryk.types.council.parameter.update_whitelist_contracts import UpdateWhitelistContractsParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.council.storage import CouncilStorage

async def on_council_update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: Transaction[UpdateWhitelistContractsParameter, CouncilStorage],
) -> None:
    ...