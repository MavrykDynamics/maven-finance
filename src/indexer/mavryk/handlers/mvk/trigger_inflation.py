from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.types.mvk_token.parameter.trigger_inflation import TriggerInflationParameter
from dipdup.models import Transaction
from mavryk.types.mvk_token.storage import MvkTokenStorage
import mavryk.models as models
from dateutil import parser

async def trigger_inflation(
    ctx: HandlerContext,
    trigger_inflation: Transaction[TriggerInflationParameter, MvkTokenStorage],
) -> None:

    try:    
        # Get operation info
        mvk_address                 = trigger_inflation.data.target_address
        maximum_supply              = float(trigger_inflation.storage.maximumSupply)
        next_inflation_timestamp    = parser.parse(trigger_inflation.storage.nextInflationTimestamp)
    
        # Update record
        await models.MVKToken.filter(network=ctx.datasource.network, address= mvk_address).update(
            maximum_supply            = maximum_supply,
            next_inflation_timestamp  = next_inflation_timestamp
        )
    except BaseException as e:
        await save_error_report(e)

