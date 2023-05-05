from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.treasury_factory.storage import TreasuryFactoryStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.treasury_factory.parameter.update_whitelist_contracts import UpdateWhitelistContractsParameter
import mavryk.models as models

async def on_treasury_factory_update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: Transaction[UpdateWhitelistContractsParameter, TreasuryFactoryStorage],
) -> None:

    try:
        # Persist whitelist contract
        await persist_linked_contract(models.TreasuryFactory, models.TreasuryFactoryWhitelistContract, update_whitelist_contracts)

    except BaseException as e:
         await save_error_report(e)

