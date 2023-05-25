from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.farm_factory.storage import FarmFactoryStorage
from dipdup.context import HandlerContext
from mavryk.types.farm_factory.parameter.update_whitelist_contracts import UpdateWhitelistContractsParameter
from dipdup.models import Transaction
import mavryk.models as models

async def on_farm_factory_update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: Transaction[UpdateWhitelistContractsParameter, FarmFactoryStorage],
) -> None:

    try:
        # Persist whitelist contract
        await persist_linked_contract(ctx, models.FarmFactory, models.FarmFactoryWhitelistContract, update_whitelist_contracts)
    except BaseException as e:
         await save_error_report(e)

