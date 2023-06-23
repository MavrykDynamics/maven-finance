from mavryk.utils.error_reporting import save_error_report

from mavryk.types.aggregator.parameter.add_oracle import AddOracleParameter
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_aggregator_add_oracle(
    ctx: HandlerContext,
    add_oracle: Transaction[AddOracleParameter, AggregatorStorage],
) -> None:

    try:
        # Get operation info
        aggregator_address              = add_oracle.data.target_address
        oracle_address                  = add_oracle.parameter.__root__
        oracle_storage                  = add_oracle.storage.oracleLedger[oracle_address]
        oracle_ledger_size              = int(add_oracle.storage.oracleLedgerSize)
        oracle_pk                       = oracle_storage.oraclePublicKey
        oracle_peer_id                  = oracle_storage.oraclePeerId
        init_round                      = int(add_oracle.storage.lastCompletedData.round)
        init_epoch                      = int(add_oracle.storage.lastCompletedData.epoch)
    
        # Create record
        oracle                          = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=oracle_address)
        aggregator                      = await models.Aggregator.get(network=ctx.datasource.network,address=aggregator_address)
        aggregator.oracle_ledger_size   = oracle_ledger_size
        await aggregator.save()
        aggregator_oracle               = models.AggregatorOracle(
            aggregator  = aggregator,
            user        = oracle,
            public_key  = oracle_pk,
            peer_id     = oracle_peer_id,
            init_round  = init_round,
            init_epoch  = init_epoch
        )
        await aggregator_oracle.save()

    except BaseException as e:
         await save_error_report(e)

