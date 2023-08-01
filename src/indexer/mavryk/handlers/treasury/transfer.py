from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.contracts import get_contract_token_metadata, get_token_standard
from mavryk.types.treasury.tezos_parameters.transfer import TransferParameter, TokenItem as fa12, TokenItem1 as fa2, TokenItem2 as tez
from dipdup.models.tezos_tzkt import TzktTransaction
from dipdup.context import HandlerContext
from mavryk.types.treasury.tezos_storage import TreasuryStorage
import mavryk.models as models

async def transfer(
    ctx: HandlerContext,
    transfer: TzktTransaction[TransferParameter, TreasuryStorage],
) -> None:

    try:
        # Get operation info
        treasury_address    = transfer.data.target_address
        txs                 = transfer.parameter.__root__
        timestamp           = transfer.data.timestamp
        treasury            = await models.Treasury.get(network=ctx.datasource.network, address= treasury_address)
        await treasury.save()
    
        # Create records
        for tx in txs:
            receiver_address        = tx.to_
            token                   = tx.token
            amount                  = float(tx.amount)
            token_contract_address  = ""
            token_id                = 0
            token_standard          = None
    
            if type(token) == fa12:
                token_contract_address  = token.fa12
            elif type(token) == fa2:
                token_contract_address  = token.fa2.tokenContractAddress
                token_id                = int(token.fa2.tokenId)
            elif type(token) == tez:
                token_contract_address  = "tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg"

            token_standard = await get_token_standard(
                ctx,
                token_contract_address
            )

            # Get the whitelisted token to check if the token can be added
            whitelisted             = await models.TreasuryWhitelistTokenContract.exists(
                contract            = treasury,
                contract_address    = token_contract_address
            )
            if token_standard == "tez":
                whitelisted         = True
    
            # Persist Token Metadata
            token_contract_metadata = await get_contract_token_metadata(
                ctx=ctx,
                token_address=token_contract_address,
                token_id=str(token_id)
            )
    
            receiver                = await models.mavryk_user_cache.get(network=ctx.datasource.network, address=receiver_address)
            treasury_transfer_data  = models.TreasuryTransferHistoryData(
                timestamp                       = timestamp,
                treasury                        = treasury,
                to_                             = receiver,
                token_address                   = token_contract_address,
                amount                          = amount
            )
            await treasury_transfer_data.save()

            # Get the related token
            token, _                = await models.Token.get_or_create(
                token_address   = token_contract_address,
                token_id        = token_id,
                network         = ctx.datasource.network
            )
            if token_contract_metadata:
                token.metadata          = token_contract_metadata
            token.token_standard    = token_standard
            await token.save()

            # Update the treasury balance record
            treasury_balance, _ = await models.TreasuryBalance.get_or_create(
                treasury        = treasury,
                token           = token
            )
            treasury_balance.balance        -= amount
            treasury_balance.whitelisted    = whitelisted
            await treasury_balance.save()

    except BaseException as e:
        await save_error_report(e)

