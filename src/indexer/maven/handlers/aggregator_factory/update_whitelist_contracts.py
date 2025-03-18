from maven.utils.error_reporting import save_error_report

from dipdup.models.tezos import TezosTransaction
from maven.utils.persisters import persist_linked_contract
from maven.types.aggregator_factory.tezos_storage import AggregatorFactoryStorage
from maven.types.aggregator_factory.tezos_parameters.update_whitelist_contracts import UpdateWhitelistContractsParameter
from dipdup.context import HandlerContext
from maven import models as models

async def update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: TezosTransaction[UpdateWhitelistContractsParameter, AggregatorFactoryStorage],
) -> None:

    try:
        # Persist whitelist contract
        await persist_linked_contract(ctx, models.AggregatorFactory, models.AggregatorFactoryWhitelistContract, update_whitelist_contracts)

    except BaseException as e:
        await save_error_report(e)

