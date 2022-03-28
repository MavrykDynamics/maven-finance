
from dipdup.context import HandlerContext
from mavryk.types.farm_factory.parameter.track_farm import TrackFarmParameter
from mavryk.types.farm_factory.storage import FarmFactoryStorage
from dipdup.models import Transaction, Contract
import mavryk.models as models

async def on_farm_factory_track_farm(
    ctx: HandlerContext,
    track_farm: Transaction[TrackFarmParameter, FarmFactoryStorage],
) -> None:
    # Get operation values
    trackedFarmAddress = track_farm.parameter.__root__
    trackedFarm = await models.Farm.get_or_none(address=trackedFarmAddress)
    farmIndexedContract = await Contract.get_or_none(address=trackedFarmAddress)

    # Index farm if it does not exist in the db yet
    if trackedFarm is None and farmIndexedContract is None:
        # Prepare farm
        farmFactoryAddress  = track_farm.data.target_address
        farmFactory         = await models.FarmFactory.get(address=farmFactoryAddress)
        farm, _             = await models.Farm.get_or_create(
            address = trackedFarmAddress
        )
        farm.farm_factory   = farmFactory
        await farm.save()

        # Create a contract and index it
        await ctx.add_contract(
            name=trackedFarmAddress + 'contract',
            address=trackedFarmAddress,
            typename="farm"
        )
        await ctx.add_index(
            name=trackedFarmAddress + 'index',
            template="farm_template",
            values=dict(
                farm_contract=trackedFarmAddress + 'contract'
            )
        )
