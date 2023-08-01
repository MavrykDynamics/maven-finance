from mavryk.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.treasury.tezos_parameters.set_baker import SetBakerParameter
from mavryk.types.treasury.tezos_storage import TreasuryStorage
import mavryk.models as models

async def set_baker(
    ctx: HandlerContext,
    set_baker: TzktTransaction[SetBakerParameter, TreasuryStorage],
) -> None:

    try:
        # Get operation info
        treasury_address    = set_baker.data.target_address
        baker_address       = set_baker.parameter.__root__
    
        # Update record
        baker               = None
        if baker_address:
            baker   = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=baker_address)
        await models.Treasury.filter(network=ctx.datasource.network, address= treasury_address).update(
            baker   = baker
        )

    except BaseException as e:
        await save_error_report(e)

