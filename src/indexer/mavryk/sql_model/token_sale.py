from mavryk.sql_model.parents import MavrykContract
from dipdup.models import Model, fields

###
# Token Sale Tables
###

class TokenSale(MavrykContract, Model):
    governance                              = fields.ForeignKeyField('models.Governance', related_name='token_sales')
    vesting_period_duration_sec             = fields.BigIntField(default=0)
    whitelist_start_timestamp               = fields.DatetimeField(null=True)
    whitelist_end_timestamp                 = fields.DatetimeField(null=True)
    end_timestamp                           = fields.DatetimeField(null=True)
    end_block_level                         = fields.BigIntField(default=0)
    started                                 = fields.BooleanField(default=False)
    ended                                   = fields.BooleanField(default=False)
    paused                                  = fields.BooleanField(default=False)

    class Meta:
        table = 'token_sale'

class TokenSaleBuyOption(Model):
    id                                      = fields.BigIntField(pk=True)
    buy_option_internal_id                  = fields.SmallIntField(default=0)
    token_sale                              = fields.ForeignKeyField('models.TokenSale', related_name='token_sale_buy_options')
    max_amount_per_wallet_total             = fields.FloatField(default=0.0)
    whitelist_max_amount_total              = fields.FloatField(default=0.0)
    max_amount_cap                          = fields.FloatField(default=0.0)
    vesting_periods                         = fields.SmallIntField(default=0)
    token_xtz_price                         = fields.BigIntField(default=0)
    min_mvk_amount                          = fields.FloatField(default=0.0)
    total_bought                            = fields.FloatField(default=0.0)

    class Meta:
        table = 'token_sale_buy_option'

class TokenSaleWhitelistedUser(Model):
    id                                      = fields.BigIntField(pk=True)
    token_sale                              = fields.ForeignKeyField('models.TokenSale', related_name='token_sale_whitelist_accounts')
    whitelisted_user                        = fields.ForeignKeyField('models.MavrykUser', related_name='token_sale_whitelist_accounts')

    class Meta:
        table = 'token_sale_whitelisted_account'

class TokenSaleBuyerRecord(Model):
    id                                      = fields.BigIntField(pk=True)
    token_sale                              = fields.ForeignKeyField('models.TokenSale', related_name='token_sale_buyer_records')
    buyer                                   = fields.ForeignKeyField('models.MavrykUser', related_name='token_sale_buyer_records')

    class Meta:
        table = 'token_sale_buyer_record'

class TokenSaleBuyerRecordOption(Model):
    id                                      = fields.BigIntField(pk=True)
    buy_option                              = fields.ForeignKeyField('models.TokenSaleBuyOption', related_name='buyer_record_options')
    buyer_record                            = fields.ForeignKeyField('models.TokenSaleBuyerRecord', related_name='options')
    token_bought                            = fields.FloatField(default=0.0)
    token_claimed                           = fields.FloatField(default=0.0)
    claim_counter                           = fields.SmallIntField(default=0)
    last_claim_timestamp                    = fields.DatetimeField(null=True)
    last_claim_level                        = fields.BigIntField(default=0)

    class Meta:
        table = 'token_sale_buyer_record_option'