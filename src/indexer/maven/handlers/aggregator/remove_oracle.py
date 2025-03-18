from maven.utils.error_reporting import save_error_report

from maven.types.aggregator.tezos_parameters.remove_oracle import RemoveOracleParameter
from maven.types.aggregator.tezos_storage import AggregatorStorage
from dipdup.models.tezos import TezosTransaction
from dipdup.context import HandlerContext
from maven import models as models

async def remove_oracle(
    ctx: HandlerContext,
    remove_oracle: TezosTransaction[RemoveOracleParameter, AggregatorStorage],
) -> None:

    try:
        # Get operation info
        aggregator_address              = remove_oracle.data.target_address
        oracle_address                  = remove_oracle.parameter.root
    
        # Remove records
        oracle                          = await models.maven_user_cache.get(network='atlasnet', address=oracle_address)
        aggregator                      = await models.Aggregator.get(network='atlasnet', address= aggregator_address)
        aggregator_oracle               = await models.AggregatorOracle.get(
            aggregator  = aggregator,
            user        = oracle
        )
    
        oracle_observations     = await models.AggregatorOracleObservation.filter(oracle = aggregator_oracle).all()
    
        for oracle_observation in oracle_observations:
            await oracle_observation.delete()
    
        await aggregator_oracle.delete()

    except BaseException as e:
        await save_error_report(e)

