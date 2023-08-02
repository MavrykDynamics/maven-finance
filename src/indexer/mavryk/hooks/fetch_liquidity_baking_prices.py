
from dipdup.context import HookContext
import mavryk.models as models

async def fetch_liquidity_baking_prices(
    ctx: HookContext,
    datasource: str,
    batch_size: int,
) -> None:

    # Print in console
    print("Fetching XTZUSD prices for liquidity baking history data")

    # Set USD Prices for records
    history_data    = await models.LiquidityBakingHistoryData.filter(token_price_usd=None).order_by('level').all()
    if len(history_data) > 0:
        first_level     = history_data[0].level
        last_level      = history_data[-1].level
        tzkt            = None

        try:
            tzkt            = ctx.get_tzkt_datasource(datasource)
        except BaseException as e:
            ...

        if tzkt:
            # Fetch quotes
            quotes          = await tzkt.get_quotes(
                first_level = first_level,
                last_level  = last_level,
                limit       = batch_size
            )
            
            while (len(history_data) > 0):
                # Set quote for current batch
                for quote in quotes:
                    level               = quote.level
                    xtz_usd             = float(quote.usd)

                    # Update history data prices
                    data_sub_set        = await models.LiquidityBakingHistoryData.filter(token_price_usd=None, level=level).order_by('level').all()
                    for data in data_sub_set:
                        data.token_price_usd    = data.token_price * xtz_usd
                        await data.save()
                
                # Reset vars
                history_data    = await models.LiquidityBakingHistoryData.filter(token_price_usd=None).order_by('level').all()
                if len(history_data) > 0:
                    first_level     = history_data[0].level
                    last_level      = history_data[-1].level
                    tzkt            = None
                    
                    try:
                        tzkt            = ctx.get_tzkt_datasource(datasource)
                    except BaseException as e:
                        ...

                    if tzkt:
                        quotes          = await tzkt.get_quotes(
                            first_level = first_level,
                            last_level  = last_level,
                            limit       = batch_size
                        )
