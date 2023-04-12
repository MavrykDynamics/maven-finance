from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.treasury.parameter.set_baker import SetBakerParameter
from mavryk.types.treasury.storage import TreasuryStorage
import mavryk.models as models

async def on_treasury_set_baker(
    ctx: HandlerContext,
    set_baker: Transaction[SetBakerParameter, TreasuryStorage],
) -> None:

    # Get operation info
    treasury_address    = set_baker.data.target_address
    baker_address       = set_baker.parameter.__root__

    # Update record
    treasury            = await models.Treasury.get(address = treasury_address)
    baker               = None
    if baker_address:
        baker   = await models.mavryk_user_cache.get(address=baker_address)
    treasury.baker      = baker
    await treasury.save()
