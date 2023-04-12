from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.m_farm.parameter.update_whitelist_contracts import UpdateWhitelistContractsParameter
from mavryk.types.m_farm.storage import MFarmStorage
import mavryk.models as models

async def on_m_farm_update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: Transaction[UpdateWhitelistContractsParameter, MFarmStorage],
) -> None:

    # Persist whitelist contract
    await persist_linked_contract(models.Farm, models.FarmWhitelistContract, update_whitelist_contracts)
