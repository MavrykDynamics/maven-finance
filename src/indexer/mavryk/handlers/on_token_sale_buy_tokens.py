from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from mavryk.types.token_sale.parameter.buy_tokens import BuyTokensParameter
from mavryk.types.token_sale.storage import TokenSaleStorage
from dipdup.context import HandlerContext
import mavryk.models as models
from dateutil import parser

async def on_token_sale_buy_tokens(
    ctx: HandlerContext,
    buy_tokens: Transaction[BuyTokensParameter, TokenSaleStorage],
) -> None:

    try:
        # Get operation values
        token_sale_address  = buy_tokens.data.target_address
        buyer_address       = buy_tokens.data.sender_address
        buy_record_storage  = buy_tokens.storage.tokenSaleLedger[buyer_address]
    
        # Create records
        token_sale          = await models.TokenSale.get(
            address = token_sale_address
        )
        buyer               = await models.mavryk_user_cache.get(address=buyer_address)
        for buy_option_index in buy_record_storage:
            buy_record_option       = buy_record_storage[buy_option_index]
            token_bought            = float(buy_record_option.tokenBought)
            token_claimed           = float(buy_record_option.tokenClaimed)
            claim_counter           = int(buy_record_option.claimCounter)
            last_claim_timestamp    = parser.parse(buy_record_option.lastClaimTimestamp)
            last_claim_level        = int(buy_record_option.lastClaimLevel)
    
            buy_option              = await models.TokenSaleBuyOption.filter(
                internal_id             = int(buy_option_index),
                token_sale              = token_sale
            ).first()
    
            buyer_record, _         = await models.TokenSaleBuyer.get_or_create(
                token_sale  = token_sale,
                buyer       = buyer
            )
            await buyer_record.save()
    
            buyer_record_option, _  = await models.TokenSaleBuyerOption.get_or_create(
                buy_option      = buy_option,
                buyer           = buyer_record
            )
            buyer_record_option.token_bought            = token_bought
            buyer_record_option.token_claimed           = token_claimed
            buyer_record_option.claim_counter           = claim_counter
            buyer_record_option.last_claim_timestamp    = last_claim_timestamp
            buyer_record_option.last_claim_level        = last_claim_level
            await buyer_record_option.save()

    except BaseException:
         await save_error_report()

