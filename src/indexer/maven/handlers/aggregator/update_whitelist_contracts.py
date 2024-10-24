from maven.utils.error_reporting import save_error_report

from maven.utils.persisters import persist_linked_contract
from maven.types.aggregator.tezos_parameters.update_whitelist_contracts import UpdateWhitelistContractsParameter
from maven.types.aggregator.tezos_storage import AggregatorStorage
from dipdup.models.tezos import TezosTransaction
from dipdup.context import HandlerContext
import maven.models as models

async def update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: TezosTransaction[UpdateWhitelistContractsParameter, AggregatorStorage],
) -> None:

    try:
        # Persist whitelist contract
        await persist_linked_contract(ctx, models.Aggregator, models.AggregatorWhitelistContract, update_whitelist_contracts)

    except BaseException as e:
        await save_error_report(e)

