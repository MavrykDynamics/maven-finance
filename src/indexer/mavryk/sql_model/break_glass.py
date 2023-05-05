from dipdup.models import Model, fields
from mavryk.sql_model.parents import LinkedContract, ContractLambda, MavrykContract
from mavryk.sql_model.enums import ActionStatus

###
# Break Glass Tables
###

class BreakGlass(MavrykContract, Model):
    governance                              = fields.ForeignKeyField('models.Governance', related_name='break_glasses')
    threshold                               = fields.SmallIntField(default=0)
    action_expiry_days                      = fields.SmallIntField(default=0)
    council_member_name_max_length          = fields.SmallIntField(default=0)
    council_member_website_max_length       = fields.SmallIntField(default=0)
    council_member_image_max_length         = fields.SmallIntField(default=0)
    glass_broken                            = fields.BooleanField(default=False)
    action_counter                          = fields.BigIntField(default=0)

    class Meta:
        table = 'break_glass'

class BreakGlassLambda(ContractLambda, Model):
    contract                                 = fields.ForeignKeyField('models.BreakGlass', related_name='lambdas')

    class Meta:
        table = 'break_glass_lambda'

class BreakGlassGeneralContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.BreakGlass', related_name='general_contracts')

    class Meta:
        table = 'break_glass_general_contract'

class BreakGlassWhitelistContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.BreakGlass', related_name='whitelist_contracts')

    class Meta:
        table = 'break_glass_whitelist_contract'

class BreakGlassCouncilMember(Model):
    id                                      = fields.BigIntField(pk=True)
    user                                    = fields.ForeignKeyField('models.MavrykUser', related_name='break_glass_council_members', index=True)
    break_glass                             = fields.ForeignKeyField('models.BreakGlass', related_name='council_members')
    name                                    = fields.TextField(default="")
    website                                 = fields.TextField(default="")
    image                                   = fields.TextField(default="")

    class Meta:
        table = 'break_glass_council_member'

class BreakGlassAction(Model):
    id                                      = fields.BigIntField(pk=True)
    internal_id                             = fields.BigIntField(default=0)
    break_glass                             = fields.ForeignKeyField('models.BreakGlass', related_name='actions')
    initiator                               = fields.ForeignKeyField('models.MavrykUser', related_name='break_glass_actions_initiator', index=True)
    start_datetime                          = fields.DatetimeField(null=True, index=True)
    execution_datetime                      = fields.DatetimeField(null=True, index=True)
    execution_level                         = fields.BigIntField(default=0, index=True)
    expiration_datetime                     = fields.DatetimeField(null=True, index=True)
    action_type                             = fields.CharField(max_length=48)
    status                                  = fields.IntEnumField(enum_type=ActionStatus, index=True)
    executed                                = fields.BooleanField(default=False, index=True)
    signers_count                           = fields.SmallIntField(default=1)
    council_size_snapshot                   = fields.SmallIntField(default=0)

    class Meta:
        table = 'break_glass_action'

class BreakGlassActionSigner(Model):
    id                                      = fields.BigIntField(pk=True)
    break_glass_action                      = fields.ForeignKeyField('models.BreakGlassAction', related_name='signers', index=True)
    signer                                  = fields.ForeignKeyField('models.MavrykUser', related_name='break_glass_action_signers', index=True)

    class Meta:
        table = 'break_glass_action_signer'

class BreakGlassActionParameter(Model):
    id                                      = fields.BigIntField(pk=True)
    break_glass_action                      = fields.ForeignKeyField('models.BreakGlassAction', related_name='parameters', index=True)
    name                                    = fields.TextField(default="")
    value                                   = fields.TextField(default="")

    class Meta:
        table = 'break_glass_action_parameter'
