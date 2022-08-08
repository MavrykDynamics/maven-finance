
from mavryk.utils.persisters import persist_whitelist_token_contract
from mavryk.types.treasury_factory.parameter.update_whitelist_token_contracts import UpdateWhitelistTokenContractsParameter
from mavryk.types.treasury_factory.storage import TreasuryFactoryStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction

async def on_treasury_factory_update_whitelist_token_contracts(
    ctx: HandlerContext,
    update_whitelist_token_contracts: Transaction[UpdateWhitelistTokenContractsParameter, TreasuryFactoryStorage],
) -> None:
    
    # Persist whitelist token contract
    await persist_whitelist_token_contract(update_whitelist_token_contracts)