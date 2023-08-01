from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.aggregator.parameter.update_whitelist_contracts import UpdateWhitelistContractsParameter
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext
import mavryk.models as models

async def update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: Transaction[UpdateWhitelistContractsParameter, AggregatorStorage],
) -> None:

    try:
        # Persist whitelist contract
        await persist_linked_contract(ctx, models.Aggregator, models.AggregatorWhitelistContract, update_whitelist_contracts)

    except BaseException as e:
        await save_error_report(e)

