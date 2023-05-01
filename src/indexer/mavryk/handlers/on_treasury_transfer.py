from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_token_metadata
from mavryk.types.treasury.parameter.transfer import TransferParameter, TokenItem as fa12, TokenItem1 as fa2, TokenItem2 as tez
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.treasury.storage import TreasuryStorage
import mavryk.models as models

async def on_treasury_transfer(
    ctx: HandlerContext,
    transfer: Transaction[TransferParameter, TreasuryStorage],
) -> None:

    try:
        # Get operation info
        treasury_address    = transfer.data.target_address
        txs                 = transfer.parameter.__root__
        timestamp           = transfer.data.timestamp
        treasury, _         = await models.Treasury.get_or_create(address   = treasury_address)
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
                token_standard          = "fa12"
            elif type(token) == fa2:
                token_contract_address  = token.fa2.tokenContractAddress
                token_standard          = "fa2"
                token_id                = int(token.fa2.tokenId)
            elif type(token) == tez:
                token_contract_address  = "XTZ"
                token_standard          = "tez"
    
            # Persist Token Metadata
            await persist_token_metadata(
                ctx=ctx,
                token_address=token_contract_address,
                token_id=str(token_id)
            )
    
            receiver                = await models.mavryk_user_cache.get(address=receiver_address)
            treasury_transfer_data  = models.TreasuryTransferHistoryData(
                timestamp                       = timestamp,
                treasury                        = treasury,
                to_                             = receiver,
                token_address                   = token_contract_address,
                amount                          = amount
            )
            await treasury_transfer_data.save()

            # Update the treasury balance record
            treasury_balance, _ = await models.TreasuryBalance.get_or_create(
                treasury        = treasury,
                token_address   = token_contract_address,
                token_id        = token_id
            )
            treasury_balance.token_standard = token_standard
            treasury_balance.balance        -= amount
            await treasury_balance.save()

    except BaseException as e:
         await save_error_report(e)

