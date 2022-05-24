
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.farm_factory.storage import FarmFactoryStorage
from mavryk.types.farm_factory.parameter.create_farm import CreateFarmParameter

async def on_farm_factory_create_farm(
    ctx: HandlerContext,
    create_farm: Transaction[CreateFarmParameter, FarmFactoryStorage],
) -> None:
    # Get transaction info
    # farmAddress = create_farm.data.storage['trackedFarms'][0]

    # # Create a contract and index it
    # await ctx.add_contract(
    #     name=farmAddress + 'contract',
    #     address=farmAddress,
    #     typename="farm"
    # )
    # await ctx.add_index(
    #     name=farmAddress + 'index',
    #     template="farm_template",
    #     values=dict(
    #         farm_contract=farmAddress + 'contract'
    #     )
    # )
    ...