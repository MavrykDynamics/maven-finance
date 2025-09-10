from maven.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction
from maven.types.aggregator.tezos_parameters.update_oracle import UpdateOracleParameter
from maven.types.aggregator.tezos_storage import AggregatorStorage
from maven import models as models

async def update_oracle(
    ctx: HandlerContext,
    update_oracle: TezosTransaction[UpdateOracleParameter, AggregatorStorage],
) -> None:

    try:
        # Get operation info
        aggregator_address      = update_oracle.data.target_address
        oracle_address          = update_oracle.data.sender_address
        oracle_storage          = update_oracle.storage.oracleLedger[oracle_address]
        oracle_pk               = oracle_storage.oraclePublicKey
        oracle_peer_id          = oracle_storage.oraclePeerId
    
        # Create record
        oracle                  = await models.get_user(network='atlasnet', address=oracle_address)
        aggregator              = await models.Aggregator.get(network='atlasnet', address=aggregator_address)
        await models.AggregatorOracle.filter(
            aggregator  = aggregator,
            user        = oracle
        ).update(
            peer_id       = oracle_peer_id,
            public_key    = oracle_pk
        )

    except BaseException as e:
        await save_error_report(e)

