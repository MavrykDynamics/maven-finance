
from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.mvk_token.parameter.update_whitelist_contracts import UpdateWhitelistContractsParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.mvk_token.storage import MvkTokenStorage
import mavryk.models as models

async def on_mvk_update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: Transaction[UpdateWhitelistContractsParameter, MvkTokenStorage],
) -> None:

    # Persist whitelist contract
    await persist_linked_contract(models.MVKToken, models.MVKTokenWhitelistContract, update_whitelist_contracts)
