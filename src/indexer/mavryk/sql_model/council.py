from dipdup.models import Model, fields
from mavryk.sql_model.parents import LinkedContract, ContractLambda, MavrykContract
from mavryk.sql_model.enums import ActionStatus

###
# Council Tables
###

class Council(MavrykContract, Model):
    governance                              = fields.ForeignKeyField('models.Governance', related_name='councils')
    threshold                               = fields.BigIntField(default=0)
    action_expiry_days                      = fields.BigIntField(default=0)
    action_counter                          = fields.BigIntField(default=0)
    council_member_name_max_length          = fields.SmallIntField(default=0)
    council_member_website_max_length       = fields.SmallIntField(default=0)
    council_member_image_max_length         = fields.SmallIntField(default=0)
    request_purpose_max_length              = fields.SmallIntField(default=0)
    request_token_name_max_length           = fields.SmallIntField(default=0)

    class Meta:
        table = 'council'

class CouncilLambda(ContractLambda, Model):
    contract                                 = fields.ForeignKeyField('models.Council', related_name='lambdas')

    class Meta:
        table = 'council_lambda'

class CouncilGeneralContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.Council', related_name='general_contracts')

    class Meta:
        table = 'council_general_contract'

class CouncilWhitelistContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.Council', related_name='whitelist_contracts')

    class Meta:
        table = 'council_whitelist_contract'

class CouncilCouncilMember(Model):
    id                                      = fields.BigIntField(pk=True)
    user                                    = fields.ForeignKeyField('models.MavrykUser', related_name='council_council_members', index=True)
    council                                 = fields.ForeignKeyField('models.Council', related_name='members')
    name                                    = fields.TextField(default="")
    website                                 = fields.TextField(default="")
    image                                   = fields.TextField(default="")

    class Meta:
        table = 'council_council_member'

class CouncilAction(Model):
    id                                      = fields.BigIntField(pk=True)
    internal_id                             = fields.BigIntField(default=0)
    council                                 = fields.ForeignKeyField('models.Council', related_name='actions')
    initiator                               = fields.ForeignKeyField('models.MavrykUser', related_name='council_actions_initiator', index=True)
    start_datetime                          = fields.DatetimeField(index=True)
    execution_datetime                      = fields.DatetimeField(index=True)
    execution_level                         = fields.BigIntField(default=0, index=True)
    expiration_datetime                     = fields.DatetimeField(index=True)
    action_type                             = fields.CharField(max_length=48)
    status                                  = fields.IntEnumField(enum_type=ActionStatus, index=True)
    executed                                = fields.BooleanField(default=False, index=True)
    signers_count                           = fields.SmallIntField(default=1)
    council_size_snapshot                   = fields.SmallIntField(default=0)

    class Meta:
        table = 'council_action'

class CouncilActionSigner(Model):
    id                                      = fields.BigIntField(pk=True)
    council_action                          = fields.ForeignKeyField('models.CouncilAction', related_name='signers', index=True)
    signer                                  = fields.ForeignKeyField('models.MavrykUser', related_name='council_actions_signer', index=True)

    class Meta:
        table = 'council_action_signer'

class CouncilActionParameter(Model):
    id                                      = fields.BigIntField(pk=True)
    council_action                          = fields.ForeignKeyField('models.CouncilAction', related_name='parameters', index=True)
    name                                    = fields.TextField(default="")
    value                                   = fields.TextField(default="")

    class Meta:
        table = 'council_action_parameter'