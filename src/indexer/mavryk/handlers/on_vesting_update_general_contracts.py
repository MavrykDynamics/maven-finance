
from mavryk.utils.persisters import persist_general_contract
from mavryk.types.vesting.storage import VestingStorage
from dipdup.context import HandlerContext
from mavryk.types.vesting.parameter.update_general_contracts import UpdateGeneralContractsParameter
from dipdup.models import Transaction

async def on_vesting_update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: Transaction[UpdateGeneralContractsParameter, VestingStorage],
) -> None:

    # Perists general contract
    await persist_general_contract(update_general_contracts)