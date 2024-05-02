from maven.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktOrigination
from maven.types.mvn_faucet.tezos_storage import MvnFaucetStorage
import maven.models as models

async def origination(
    ctx: HandlerContext,
    mvn_faucet_origination: TzktOrigination[MvnFaucetStorage],
) -> None:

    try:    
        # Get operation values
        address             = mvn_faucet_origination.data.originated_contract_address
        mvn_token_address   = mvn_faucet_origination.storage.mvnTokenAddress
        amount_per_user     = float(mvn_faucet_origination.storage.amountPerUser)
    
        # Create record
        mvn_faucet          = models.MVNFaucet(
            address             = address,
            network             = ctx.datasource.name.replace('mvkt_',''),
            mvn_token_address   = mvn_token_address,
            amount_per_user     = amount_per_user
        )
        await mvn_faucet.save()

    except BaseException as e:
        await save_error_report(e)

