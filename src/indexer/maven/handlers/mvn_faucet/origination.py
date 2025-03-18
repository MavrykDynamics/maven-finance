from maven.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models.tezos import TezosOrigination
from maven.types.mvn_faucet.tezos_storage import MvnFaucetStorage
from maven import models as models

async def origination(
    ctx: HandlerContext,
    mvn_faucet_origination: TezosOrigination[MvnFaucetStorage],
) -> None:

    try:    
        # Get operation values
        address                     = mvn_faucet_origination.data.originated_contract_address
        mvn_token_address           = mvn_faucet_origination.storage.mvnTokenAddress
        fake_usdt_token_address     = mvn_faucet_origination.storage.fakeUsdtTokenAddress
        mvn_amount_per_user         = float(mvn_faucet_origination.storage.mvnAmountPerUser)
        fake_usdt_amount_per_user   = float(mvn_faucet_origination.storage.fakeUsdtAmountPerUser)
    
        # Create record
        mvn_faucet          = models.MVNFaucet(
            address                     = address,
            network                     = 'atlasnet',
            mvn_token_address           = mvn_token_address,
            fake_usdt_token_address     = fake_usdt_token_address,
            mvn_amount_per_user         = mvn_amount_per_user,
            fake_usdt_amount_per_user   = fake_usdt_amount_per_user
        )
        await mvn_faucet.save()

    except BaseException as e:
        await save_error_report(e)

