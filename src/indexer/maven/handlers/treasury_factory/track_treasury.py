from maven.utils.error_reporting import save_error_report

from maven.types.treasury_factory.tezos_parameters.track_treasury import TrackTreasuryParameter
from maven.types.treasury_factory.tezos_storage import TreasuryFactoryStorage
from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
import maven.models as models

async def track_treasury(
    ctx: HandlerContext,
    track_treasury: TzktTransaction[TrackTreasuryParameter, TreasuryFactoryStorage],
) -> None:

    try:
        # Get operation info
        treasury_address            = track_treasury.parameter.__root__
        treasury_factory_address    = track_treasury.data.target_address
    
        # Update record
        treasury_factory    = await models.TreasuryFactory.get(
            network = ctx.datasource.name.replace('tzkt_',''),
            address = treasury_factory_address
        )
        await models.Treasury.filter(
            network = ctx.datasource.name.replace('tzkt_',''),
            address = treasury_address
        ).update(
            factory        = treasury_factory
        )

    except BaseException as e:
        await save_error_report(e)

