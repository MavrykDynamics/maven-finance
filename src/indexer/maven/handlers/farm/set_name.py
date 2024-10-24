from maven.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction
from maven.types.farm.tezos_parameters.set_name import SetNameParameter
from maven.types.farm.tezos_storage import FarmStorage
import maven.models as models

async def set_name(
    ctx: HandlerContext,
    set_name: TezosTransaction[SetNameParameter, FarmStorage],
) -> None:

    try:
        # Get operation info
        farm_address    = set_name.data.target_address
        name            = set_name.parameter.root
    
        # Update contract
        await models.Farm.filter(
            network = 'atlasnet',
            address = farm_address
        ).update(
            name    = name
        )

    except BaseException as e:
        await save_error_report(e)