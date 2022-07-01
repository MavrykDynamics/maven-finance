
from mavryk.types.treasury.parameter.transfer import TransferParameter, TokenItem as fa12, TokenItem1 as fa2, TokenItem2 as tez
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.treasury.storage import TreasuryStorage
import mavryk.models as models

async def on_treasury_transfer(
    ctx: HandlerContext,
    transfer: Transaction[TransferParameter, TreasuryStorage],
) -> None:
    
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
        token_type              = models.TokenType.OTHER
        token_contract_address  = ""
        token_id                = 0

        if type(token) == fa12:
            token_type              = models.TokenType.FA12
            token_contract_address  = token.fa12
        elif type(token) == fa2:
            token_type              = models.TokenType.FA2
            token_contract_address  = token.fa2.tokenContractAddress
            token_id                = int(token.fa2.tokenId)
        elif type(token) == tez:
            token_type              = models.TokenType.XTZ

        receiver, _             = await models.MavrykUser.get_or_create(address = receiver_address)
        await receiver.save()

        treasury_transfer_data  = models.TreasuryTransferHistoryData(
            timestamp                       = timestamp,
            treasury                        = treasury,
            to_                             = receiver,
            type                            = token_type,
            token_contract_address          = token_contract_address,
            token_id                        = token_id,
            amount                          = amount
        )
        await treasury_transfer_data.save()
