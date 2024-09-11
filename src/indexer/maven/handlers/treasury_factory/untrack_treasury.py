from maven.utils.error_reporting import save_error_report

from maven.types.treasury_factory.tezos_storage import TreasuryFactoryStorage
from dipdup.context import HandlerContext
from maven.types.treasury_factory.tezos_parameters.untrack_treasury import UntrackTreasuryParameter
from dipdup.models.tezos_tzkt import TzktTransaction
import maven.models as models

async def untrack_treasury(
    ctx: HandlerContext,
    untrack_treasury: TzktTransaction[UntrackTreasuryParameter, TreasuryFactoryStorage],
) -> None:

    try:
        # Get operation info
        treasury_factory_address    = untrack_treasury.data.target_address
        treasury_address            = untrack_treasury.parameter.__root__
    
        # Update record
        treasury_factory            = await models.TreasuryFactory.get(
            network             = ctx.datasource.name.replace('mvkt_',''),
            address             = treasury_factory_address
        )
        treasury                    = await models.Treasury.get(
            network = ctx.datasource.name.replace('mvkt_',''),
            factory = treasury_factory,
            address = treasury_address
        )
        treasury.factory            = None
        await treasury.save()

    except BaseException as e:
        await save_error_report(e)

