from dipdup.models import Model, fields
from mavryk.sql_model.parents import LinkedContract, ContractLambda, MavrykContract
from mavryk.sql_model.enums import GovernanceRecordStatus, GovernanceVoteType

###
# Governance Financial Tables
###

class GovernanceFinancial(MavrykContract, Model):
    governance                              = fields.ForeignKeyField('models.Governance', related_name='governance_financials')
    fin_req_approval_percentage             = fields.SmallIntField(default=0)
    fin_req_duration_in_days                = fields.SmallIntField(default=0)
    fin_req_counter                         = fields.BigIntField(default=0)

    class Meta:
        table = 'governance_financial'

class GovernanceFinancialLambda(ContractLambda, Model):
    contract                                = fields.ForeignKeyField('models.GovernanceFinancial', related_name='lambdas')

    class Meta:
        table = 'governance_financial_lambda'

class GovernanceFinancialGeneralContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.GovernanceFinancial', related_name='general_contracts')

    class Meta:
        table = 'governance_financial_general_contract'

class GovernanceFinancialWhitelistContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.GovernanceFinancial', related_name='whitelist_contracts')

    class Meta:
        table = 'governance_financial_whitelist_contract'

class GovernanceFinancialWhitelistTokenContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.GovernanceFinancial', related_name='whitelist_token_contracts')

    class Meta:
        table = 'governance_financial_whitelist_token_contract'

class GovernanceFinancialRequestRecord(Model):
    id                                      = fields.BigIntField(pk=True)
    governance_financial                    = fields.ForeignKeyField('models.GovernanceFinancial', related_name='request_records')
    treasury                                = fields.ForeignKeyField('models.Treasury', related_name='governance_financial_request_records')
    requester                               = fields.ForeignKeyField('models.MavrykUser', related_name='governance_financial_requests_requester')
    token                                   = fields.ForeignKeyField('models.Token', related_name='governance_financial_requests_token', null=True)
    request_type                            = fields.CharField(max_length=255)
    status                                  = fields.IntEnumField(enum_type=GovernanceRecordStatus, default=GovernanceRecordStatus.ACTIVE)
    executed                                = fields.BooleanField()
    token_amount                            = fields.FloatField(default=0.0)
    request_purpose                         = fields.TextField(default="")
    key_hash                                = fields.TextField(default="", null=True)
    yay_vote_smvk_total                     = fields.FloatField(default=0.0)
    nay_vote_smvk_total                     = fields.FloatField(default=0.0)
    pass_vote_smvk_total                    = fields.FloatField(default=0.0)
    smvk_percentage_for_approval            = fields.SmallIntField(default=0)
    snapshot_smvk_total_supply              = fields.FloatField(default=0.0)
    smvk_required_for_approval              = fields.FloatField(default=0.0)
    execution_datetime                      = fields.DatetimeField(null=True)
    expiration_datetime                     = fields.DatetimeField(null=True)
    requested_datetime                      = fields.DatetimeField(null=True)

    class Meta:
        table = 'governance_financial_request_record'

class GovernanceFinancialRequestRecordVote(Model):
    id                                      = fields.BigIntField(pk=True)
    governance_financial_request            = fields.ForeignKeyField('models.GovernanceFinancialRequestRecord', related_name='votes')
    voter                                   = fields.ForeignKeyField('models.MavrykUser', related_name='governance_financial_requests_votes')
    satellite_snapshot                      = fields.ForeignKeyField('models.GovernanceSatelliteSnapshotRecord', related_name='governance_financial_requests_votes', null=True)
    timestamp                               = fields.DatetimeField(null=True)
    vote                                    = fields.IntEnumField(enum_type=GovernanceVoteType, default=GovernanceVoteType.YAY)

    class Meta:
        table = 'governance_financial_request_vote'