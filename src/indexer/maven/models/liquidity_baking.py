from maven.models.parents import MavenContract
from dipdup.models import Model, fields
from maven.models.enums import DexType

###
# Liquidity Baking Tables
###

class LiquidityBaking(MavenContract, Model):
    token_pool                              = fields.BigIntField(default=0)
    xtz_pool                                = fields.BigIntField(default=0)
    lqt_total                               = fields.BigIntField(default=0)
    token_address                           = fields.CharField(max_length=36, default="")
    lqt_address                             = fields.CharField(max_length=36, default="")
    share_price                             = fields.FloatField(default=0.0)
    xtz_decimals                            = fields.SmallIntField(default=6)
    token_decimals                          = fields.SmallIntField(default=8)

    class Meta:
        table = 'liquidity_baking'

class LiquidityBakingPosition(Model):
    id                                      = fields.BigIntField(pk=True)
    liquidity_baking                        = fields.ForeignKeyField('models.LiquidityBaking', related_name='positions')
    trader                                  = fields.ForeignKeyField('models.MavenUser', related_name='liquidity_baking_positions')
    shares_qty                              = fields.FloatField(default=0.0)
    avg_share_price                         = fields.FloatField(default=0.0)
    realized_pl                             = fields.FloatField(default=0.0)

    class Meta:
        table = 'liquidity_baking_position'

class LiquidityBakingHistoryData(Model):
    id                                      = fields.BigIntField(pk=True)
    liquidity_baking                        = fields.ForeignKeyField('models.LiquidityBaking', related_name='history_data')
    trader                                  = fields.ForeignKeyField('models.MavenUser', related_name='liquidity_baking_trades')
    timestamp                               = fields.DatetimeField(use_tz=True)
    level                                   = fields.BigIntField()
    type                                    = fields.IntEnumField(enum_type=DexType, index=True)
    token_price                             = fields.FloatField(default=0.0)
    token_price_usd                         = fields.FloatField(null=True)
    xtz_qty                                 = fields.FloatField(default=0.0)
    token_qty                               = fields.FloatField(default=0.0)
    lqt_qty                                 = fields.FloatField(default=0.0)
    slippage                                = fields.FloatField(default=0.0)
    token_pool                              = fields.BigIntField(default=0)
    xtz_pool                                = fields.BigIntField(default=0)
    lqt_total                               = fields.BigIntField(default=0)

    class Meta:
        table = 'liquidity_baking_history_data'