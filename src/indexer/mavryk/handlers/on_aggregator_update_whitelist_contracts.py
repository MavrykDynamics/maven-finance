
from mavryk.utils.persisters import persist_whitelist_contract
from mavryk.types.aggregator.parameter.update_whitelist_contracts import UpdateWhitelistContractsParameter
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext

async def on_aggregator_update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: Transaction[UpdateWhitelistContractsParameter, AggregatorStorage],
) -> None:

    # Persist whitelist contract
    await persist_whitelist_contract(update_whitelist_contracts)
