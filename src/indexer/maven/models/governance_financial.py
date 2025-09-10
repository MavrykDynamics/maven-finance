from dipdup.models import Model, fields
from maven.models.parents import LinkedContract, ContractLambda, MavenContract
from maven.models.enums import GovernanceActionStatus, GovernanceVoteType

###
# Governance Financial Tables
###

class GovernanceFinancial(MavenContract, Model):
    governance                              = fields.ForeignKeyField('models.Governance', related_name='governance_financials')
    approval_percentage                     = fields.SmallIntField(default=0)
    fin_req_duration_in_days                = fields.SmallIntField(default=0)
    fin_req_counter                         = fields.BigIntField(default=0)

    class Meta:
        table = 'governance_financial'

class GovernanceFinancialLambda(ContractLambda, Model):
    contract                                = fields.ForeignKeyField('models.GovernanceFinancial', related_name='lambdas')

    class Meta:
        table = 'governance_financial_lambda'

class GovernanceFinancialGeneralContract(LinkedContract, Model):
    contract                                = fields.ForeignKeyField('models.GovernanceFinancial', related_name='general_contracts')
    contract_name                           = fields.CharField(max_length=36, default="")

    class Meta:
        table = 'governance_financial_general_contract'

class GovernanceFinancialWhitelistContract(LinkedContract, Model):
    contract                                = fields.ForeignKeyField('models.GovernanceFinancial', related_name='whitelist_contracts')

    class Meta:
        table = 'governance_financial_whitelist_contract'

class GovernanceFinancialWhitelistTokenContract(LinkedContract, Model):
    contract                                = fields.ForeignKeyField('models.GovernanceFinancial', related_name='whitelist_token_contracts')
    token                                   = fields.ForeignKeyField('models.Token', related_name='governance_financial_whitelist_token_contracts', index=True)

    class Meta:
        table = 'governance_financial_whitelist_token_contract'

class GovernanceFinancialRequest(Model):
    id                                      = fields.BigIntField(pk=True)
    internal_id                             = fields.BigIntField(default=0)
    governance_financial                    = fields.ForeignKeyField('models.GovernanceFinancial', related_name='requests', index=True)
    treasury                                = fields.ForeignKeyField('models.Treasury', related_name='governance_financial_requests')
    requester                               = fields.ForeignKeyField('models.MavenUser', related_name='governance_financial_requests_requester', index=True)
    receiver                                = fields.ForeignKeyField('models.MavenUser', related_name='governance_financial_requests_receiver', index=True)
    token                                   = fields.ForeignKeyField('models.Token', related_name='governance_financial_requests', index=True)
    request_type                            = fields.CharField(max_length=255)
    status                                  = fields.IntEnumField(enum_type=GovernanceActionStatus, default=GovernanceActionStatus.ACTIVE, index=True)
    executed                                = fields.BooleanField(default=False)
    token_amount                            = fields.FloatField(default=0.0)
    request_purpose                         = fields.TextField(default="")
    yay_vote_smvn_total                     = fields.FloatField(default=0.0)
    nay_vote_smvn_total                     = fields.FloatField(default=0.0)
    pass_vote_smvn_total                    = fields.FloatField(default=0.0)
    smvn_percentage_for_approval            = fields.SmallIntField(default=0)
    snapshot_smvn_total_supply              = fields.FloatField(default=0.0)
    smvn_required_for_approval              = fields.FloatField(default=0.0)
    execution_datetime                      = fields.DatetimeField(null=True)
    expiration_datetime                     = fields.DatetimeField(index=True)
    requested_datetime                      = fields.DatetimeField(index=True)
    governance_cycle_id                     = fields.BigIntField(default=0)
    dropped_datetime                        = fields.DatetimeField(null=True)

    class Meta:
        table = 'governance_financial_request'
        indexes = [
            ("governance_financial", "status"),
            ("requester", "receiver"),
        ]

class GovernanceFinancialRequestVote(Model):
    id                                      = fields.BigIntField(pk=True)
    governance_financial_request            = fields.ForeignKeyField('models.GovernanceFinancialRequest', related_name='votes')
    voter                                   = fields.ForeignKeyField('models.MavenUser', related_name='governance_financial_requests_votes')
    satellite_snapshot                      = fields.ForeignKeyField('models.GovernanceSatelliteSnapshot', related_name='governance_financial_requests_votes')
    timestamp                               = fields.DatetimeField(null=True)
    vote                                    = fields.IntEnumField(enum_type=GovernanceVoteType, default=GovernanceVoteType.YAY)

    class Meta:
        table = 'governance_financial_request_vote'