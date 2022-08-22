
from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.treasury.parameter.update_whitelist_token_contracts import UpdateWhitelistTokenContractsParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.treasury.storage import TreasuryStorage
import mavryk.models as models

async def on_treasury_update_whitelist_token_contracts(
    ctx: HandlerContext,
    update_whitelist_token_contracts: Transaction[UpdateWhitelistTokenContractsParameter, TreasuryStorage],
) -> None:
    
    # Persist whitelist token contract
    await persist_linked_contract(models.Treasury, models.TreasuryWhitelistTokenContract, update_whitelist_token_contracts)