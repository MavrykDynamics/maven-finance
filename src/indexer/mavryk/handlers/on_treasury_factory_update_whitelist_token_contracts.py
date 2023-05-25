from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.treasury_factory.parameter.update_whitelist_token_contracts import UpdateWhitelistTokenContractsParameter
from mavryk.types.treasury_factory.storage import TreasuryFactoryStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
import mavryk.models as models

async def on_treasury_factory_update_whitelist_token_contracts(
    ctx: HandlerContext,
    update_whitelist_token_contracts: Transaction[UpdateWhitelistTokenContractsParameter, TreasuryFactoryStorage],
) -> None:

    try:    
        # Persist whitelist token contract
        await persist_linked_contract(ctx, models.TreasuryFactory, models.TreasuryFactoryWhitelistTokenContract, update_whitelist_token_contracts)

    except BaseException as e:
         await save_error_report(e)

