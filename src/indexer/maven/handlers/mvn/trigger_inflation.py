from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from maven.types.mvn_token.tezos_parameters.trigger_inflation import TriggerInflationParameter
from dipdup.models.tezos_tzkt import TzktTransaction
from maven.types.mvn_token.tezos_storage import MvnTokenStorage
import maven.models as models
from dateutil import parser

async def trigger_inflation(
    ctx: HandlerContext,
    trigger_inflation: TzktTransaction[TriggerInflationParameter, MvnTokenStorage],
) -> None:

    try:    
        # Get operation info
        mvn_address                 = trigger_inflation.data.target_address
        maximum_supply              = float(trigger_inflation.storage.maximumSupply)
        next_inflation_timestamp    = parser.parse(trigger_inflation.storage.nextInflationTimestamp)
    
        # Update record
        await models.MVNToken.filter(network=ctx.datasource.name.replace('tzkt_',''), address= mvn_address).update(
            maximum_supply            = maximum_supply,
            next_inflation_timestamp  = next_inflation_timestamp
        )
    except BaseException as e:
        await save_error_report(e)

