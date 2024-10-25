from maven.utils.error_reporting import save_error_report

from maven.types.farm_factory.tezos_storage import FarmFactoryStorage
from dipdup.models.tezos_tzkt import TzktTransaction
from maven.types.farm_factory.tezos_parameters.untrack_farm import UntrackFarmParameter
from dipdup.context import HandlerContext
import maven.models as models

async def untrack_farm(
    ctx: HandlerContext,
    untrack_farm: TzktTransaction[UntrackFarmParameter, FarmFactoryStorage],
) -> None:

    try:
        # Get operation info
        farm_factory_address    = untrack_farm.data.target_address
        farm_address            = untrack_farm.parameter.__root__
    
        # Update record
        farm_factory            = await models.FarmFactory.get(
            network             = ctx.datasource.name.replace('mvkt_',''),
            address             = farm_factory_address
        )
        farm            = await models.Farm.get(
            network = ctx.datasource.name.replace('mvkt_',''),
            factory = farm_factory,
            address = farm_address
        )
        farm.factory    = None
        await farm.save()

    except BaseException as e:
        await save_error_report(e)

