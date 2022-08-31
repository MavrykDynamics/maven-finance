from mavryk.sql_model.parents import MavrykContract
from tortoise import Model, fields
from mavryk.sql_model.enums import DexType

###
# Liquidity Baking Tables
###

class LiquidityBaking(MavrykContract, Model):
    token_pool                              = fields.BigIntField(default=0)
    xtz_pool                                = fields.BigIntField(default=0)
    lqt_total                               = fields.BigIntField(default=0)
    token_address                           = fields.CharField(max_length=36, default="")
    lqt_address                             = fields.CharField(max_length=36, default="")
    xtz_decimals                            = fields.SmallIntField(default=6)
    token_decimals                          = fields.SmallIntField(default=8)

    class Meta:
        table = 'liquidity_baking'

class LiquidityBakingHistoryData(Model):
    id                                      = fields.BigIntField(pk=True)
    liquidity_baking                        = fields.ForeignKeyField('models.LiquidityBaking', related_name='history_data')
    timestamp                               = fields.DatetimeField()
    type                                    = fields.IntEnumField(enum_type=DexType)
    token_pool                              = fields.BigIntField(default=0)
    xtz_pool                                = fields.BigIntField(default=0)
    lqt_total                               = fields.BigIntField(default=0)
    xtz_token_price                         = fields.FloatField(default=0.0)
    token_xtz_price                         = fields.FloatField(default=0.0)

    class Meta:
        table = 'liquidity_baking_history_data'