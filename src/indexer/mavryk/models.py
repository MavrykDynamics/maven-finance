from tortoise import Model, fields


class MVKToken(Model):
    address                         = fields.CharField(pk=True, max_length=36)
    maximum_supply                  = fields.BigIntField(default=0)
    total_supply                    = fields.BigIntField(default=0)

    class Meta:
        table = 'mvk_token'

class User(Model):
    address                         = fields.CharField(pk=True, max_length=36)
    mvk_balance                     = fields.BigIntField(default=0)
    smvk_balance                    = fields.BigIntField(default=0)
    participation_fees_per_share    = fields.BigIntField(default=0)

    class Meta:
        table = 'user'

class TransferRecord(Model):
    id = fields.BigIntField(pk=True)
    timestamp                       = fields.DatetimeField()
    token_address                   = fields.ForeignKeyField('models.MVKToken', related_name='transfer_records')
    from_                           = fields.ForeignKeyField('models.User', related_name='transfer_sender')
    to_                             = fields.ForeignKeyField('models.User', related_name='transfer_receiver')
    amount                          = fields.BigIntField(default=0)

    class Meta:
        table = 'transfer_record'