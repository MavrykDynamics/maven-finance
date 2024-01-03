from maven.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
from maven.types.farm.tezos_parameters.set_name import SetNameParameter
from maven.types.farm.tezos_storage import FarmStorage
import maven.models as models

async def set_name(
    ctx: HandlerContext,
    set_name: TzktTransaction[SetNameParameter, FarmStorage],
) -> None:

    try:
        # Get operation info
        farm_address    = set_name.data.target_address
        name            = set_name.parameter.__root__
    
        # Update contract
        await models.Farm.filter(
            network = ctx.datasource.name.replace('tzkt_',''),
            address = farm_address
        ).update(
            name    = name
        )

    except BaseException as e:
        await save_error_report(e)