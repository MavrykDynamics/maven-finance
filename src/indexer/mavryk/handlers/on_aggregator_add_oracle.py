
from mavryk.types.aggregator.parameter.add_oracle import AddOracleParameter
from mavryk.types.aggregator.storage import AggregatorStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_aggregator_add_oracle(
    ctx: HandlerContext,
    add_oracle: Transaction[AddOracleParameter, AggregatorStorage],
) -> None:

    # Get operation info
    aggregator_address      = add_oracle.data.target_address
    oracle_address          = add_oracle.parameter.oracleAddress
    oracle_pk               = add_oracle.parameter.oracleInformation.oraclePublicKey
    oracle_peer_id          = add_oracle.parameter.oracleInformation.oraclePeerId
    init_round              = int(add_oracle.storage.lastCompletedData.round)
    init_epoch              = int(add_oracle.storage.lastCompletedData.epoch)

    # Create record
    oracle, _               = await models.MavrykUser.get_or_create(address   = oracle_address)
    await oracle.save()
    aggregator              = await models.Aggregator.get(address   = aggregator_address)
    aggregator_oracle       = models.AggregatorOracle(
        aggregator  = aggregator,
        user        = oracle,
        public_key  = oracle_pk,
        peer_id     = oracle_peer_id,
        init_round  = init_round,
        init_epoch  = init_epoch
    )
    await aggregator_oracle.save()
