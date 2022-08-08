
from mavryk.utils.persisters import persist_whitelist_contract
from mavryk.types.farm_factory.storage import FarmFactoryStorage
from dipdup.context import HandlerContext
from mavryk.types.farm_factory.parameter.update_whitelist_contracts import UpdateWhitelistContractsParameter
from dipdup.models import Transaction

async def on_farm_factory_update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: Transaction[UpdateWhitelistContractsParameter, FarmFactoryStorage],
) -> None:

    # Persist whitelist contract
    await persist_whitelist_contract(update_whitelist_contracts)