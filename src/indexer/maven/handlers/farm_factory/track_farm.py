from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from maven.types.farm_factory.tezos_parameters.track_farm import TrackFarmParameter
from maven.types.farm_factory.tezos_storage import FarmFactoryStorage
from dipdup.models.tezos import TezosTransaction
import maven.models as models

async def track_farm(
    ctx: HandlerContext,
    track_farm: TezosTransaction[TrackFarmParameter, FarmFactoryStorage],
) -> None:

    try:
        # Get operation info
        farm_address            = track_farm.parameter.root
        farm_factory_address    = track_farm.data.target_address
    
        # Update record
        farm_factory    = await models.FarmFactory.get(
            network = 'atlasnet',
            address = farm_factory_address
        )
        await models.Farm.filter(
            network = 'atlasnet',
            address = farm_address
        ).update(
            factory    = farm_factory
        )

    except BaseException as e:
        await save_error_report(e)

