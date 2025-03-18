from maven.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosTransaction
from maven.types.treasury.tezos_parameters.set_baker import SetBakerParameter
from maven.types.treasury.tezos_storage import TreasuryStorage
from maven import models as models

async def set_baker(
    ctx: HandlerContext,
    set_baker: TezosTransaction[SetBakerParameter, TreasuryStorage],
) -> None:

    try:
        # Get operation info
        treasury_address    = set_baker.data.target_address
        baker_address       = set_baker.parameter.root
    
        # Update record
        baker               = None
        if baker_address:
            baker   = await models.maven_user_cache.get(network='atlasnet', address=baker_address)
        await models.Treasury.filter(network='atlasnet', address= treasury_address).update(
            baker   = baker
        )

    except BaseException as e:
        await save_error_report(e)

