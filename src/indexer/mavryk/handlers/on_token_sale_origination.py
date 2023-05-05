from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Origination
from mavryk.utils.persisters import persist_contract_metadata
from mavryk.types.token_sale.storage import TokenSaleStorage
from dipdup.context import HandlerContext
import mavryk.models as models
from dateutil import parser

async def on_token_sale_origination(
    ctx: HandlerContext,
    token_sale_origination: Origination[TokenSaleStorage],
) -> None:

    try:    
        # Get operation info
        token_sale_address          = token_sale_origination.data.originated_contract_address
        admin                       = token_sale_origination.storage.admin
        governance_address          = token_sale_origination.storage.governanceAddress
        vesting_period_duration_sec = int(token_sale_origination.storage.config.vestingPeriodDurationSec)
        whitelist_start_timestamp   = parser.parse(token_sale_origination.storage.whitelistStartTimestamp)
        whitelist_end_timestamp     = parser.parse(token_sale_origination.storage.whitelistEndTimestamp)
        end_timestamp               = parser.parse(token_sale_origination.storage.tokenSaleEndTimestamp)
        end_block_level             = int(token_sale_origination.storage.tokenSaleEndBlockLevel)
        started                     = token_sale_origination.storage.tokenSaleHasStarted
        ended                       = token_sale_origination.storage.tokenSaleHasEnded
        paused                      = token_sale_origination.storage.tokenSalePaused
        buy_options                 = token_sale_origination.storage.config.buyOptions
        timestamp                   = token_sale_origination.data.timestamp
    
        # Persist contract metadata
        await persist_contract_metadata(
            ctx=ctx,
            contract_address=token_sale_address
        )
        
        # Get or create governance record
        governance, _ = await models.Governance.get_or_create(address=governance_address)
        await governance.save();
    
        # Create record
        token_sale = models.TokenSale(
            address                                 = token_sale_address,
            admin                                   = admin,
            last_updated_at                         = timestamp,
            governance                              = governance,
            vesting_period_duration_sec             = vesting_period_duration_sec,
            whitelist_start_timestamp               = whitelist_start_timestamp,
            whitelist_end_timestamp                 = whitelist_end_timestamp,
            end_timestamp                           = end_timestamp,
            end_block_level                         = end_block_level,
            started                                 = started,
            ended                                   = ended,
            paused                                  = paused
        )
        await token_sale.save()
    
        # Create buy option records
        for buy_option_index in buy_options:
            # Get values from storage
            buy_option_storage              = buy_options[buy_option_index]
            max_amount_per_wallet_total     = float(buy_option_storage.maxAmountPerWalletTotal)
            whitelist_max_amount_total      = float(buy_option_storage.whitelistMaxAmountTotal)
            max_amount_cap                  = float(buy_option_storage.maxAmountCap)
            vesting_periods                 = int(buy_option_storage.vestingPeriods)
            token_xtz_price                 = float(buy_option_storage.tokenXtzPrice)
            min_mvk_amount                  = float(buy_option_storage.minMvkAmount)
            total_bought                    = float(buy_option_storage.totalBought)
    
            # Save record
            buy_option          = models.TokenSaleBuyOption(
                internal_id                             = int(buy_option_index),
                token_sale                              = token_sale,
                max_amount_per_wallet_total             = max_amount_per_wallet_total,
                whitelist_max_amount_total              = whitelist_max_amount_total,
                max_amount_cap                          = max_amount_cap,
                vesting_periods                         = vesting_periods,
                token_xtz_price                         = token_xtz_price,
                min_mvk_amount                          = min_mvk_amount,
                total_bought                            = total_bought
            )
            await buy_option.save()

    except BaseException as e:
         await save_error_report(e)

