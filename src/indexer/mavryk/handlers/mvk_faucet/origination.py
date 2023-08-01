from mavryk.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models import Origination
from mavryk.types.mvk_faucet.storage import MvkFaucetStorage
import mavryk.models as models

async def origination(
    ctx: HandlerContext,
    mvk_faucet_origination: Origination[MvkFaucetStorage],
) -> None:

    try:    
        # Get operation values
        address             = mvk_faucet_origination.data.originated_contract_address
        mvk_token_address   = mvk_faucet_origination.storage.mvkTokenAddress
        amount_per_user     = float(mvk_faucet_origination.storage.amountPerUser)
    
        # Create record
        mvk_faucet          = models.MVKFaucet(
            address             = address,
            network             = ctx.datasource.network,
            mvk_token_address   = mvk_token_address,
            amount_per_user     = amount_per_user
        )
        await mvk_faucet.save()

    except BaseException as e:
        await save_error_report(e)

