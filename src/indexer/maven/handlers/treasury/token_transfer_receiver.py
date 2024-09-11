from maven.utils.contracts import get_token_standard
from maven.utils.error_reporting import save_error_report
from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTokenTransferData
from maven import models as models
import maven.models as models

async def token_transfer_receiver(
    ctx: HandlerContext,
    token_transfer: TzktTokenTransferData,
) -> None:

    try:    
        # Get operation info
        treasury_address    = token_transfer.to_address
        token_address       = token_transfer.contract_address
        token_id            = token_transfer.token_id
        mvkt_token_id       = int(token_transfer.mvkt_token_id)
        standard            = token_transfer.standard
        metadata            = token_transfer.metadata
        amount              = float(token_transfer.amount)

        # Get the token standard
        standard = await get_token_standard(
            ctx,
            token_address
        )

        # Get the related token
        token, _            = await models.Token.get_or_create(
            token_address       = token_address,
            token_id            = token_id,
            network             = ctx.datasource.name.replace('mvkt_','')
        )
        token.token_standard    = standard
        if metadata:
            token.metadata          = metadata
        await token.save()
    
        # Update records
        treasury            = await models.Treasury.get(
            network         = ctx.datasource.name.replace('mvkt_',''),
            address         = treasury_address
        )
        treasury_balance, _ = await models.TreasuryBalance.get_or_create(
            treasury        = treasury,
            token           = token
        )
        treasury_balance.mvkt_token_id  = mvkt_token_id
        treasury_balance.balance        += amount
        treasury_balance.whitelisted    = await models.TreasuryWhitelistTokenContract.exists(
            contract            = treasury,
            contract_address    = token_address
        )
        await treasury_balance.save()

    except BaseException as e:
        await save_error_report(e)

