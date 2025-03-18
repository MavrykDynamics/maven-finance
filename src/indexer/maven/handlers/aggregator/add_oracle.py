from maven.utils.error_reporting import save_error_report

from maven.types.aggregator.tezos_parameters.add_oracle import AddOracleParameter
from maven.types.aggregator.tezos_storage import AggregatorStorage
from dipdup.models.tezos import TezosTransaction
from dipdup.context import HandlerContext
from maven import models as models

async def add_oracle(
    ctx: HandlerContext,
    add_oracle: TezosTransaction[AddOracleParameter, AggregatorStorage],
) -> None:

    try:
        # Get operation info
        aggregator_address              = add_oracle.data.target_address
        oracle_address                  = add_oracle.parameter.root
        oracle_storage                  = add_oracle.storage.oracleLedger[oracle_address]
        oracle_pk                       = oracle_storage.oraclePublicKey
        oracle_peer_id                  = oracle_storage.oraclePeerId
        init_round                      = int(add_oracle.storage.lastCompletedData.round)
        init_epoch                      = int(add_oracle.storage.lastCompletedData.epoch)
    
        # Create record
        oracle                          = await models.maven_user_cache.get(network='atlasnet', address=oracle_address)
        aggregator                      = await models.Aggregator.get(network='atlasnet',address=aggregator_address)
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

