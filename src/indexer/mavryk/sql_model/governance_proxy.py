from tortoise import Model, fields
from mavryk.sql_model.parents import LinkedContract, ContractLambda, MavrykContract

###
# Governance Proxy Tables
###

class GovernanceProxy(MavrykContract, Model):
    governance                              = fields.ForeignKeyField('models.Governance', related_name='governance_proxies')
    
    class Meta:
        table = 'governance_proxy'

class GovernanceProxyLambda(ContractLambda, Model):
    contract                                = fields.ForeignKeyField('models.GovernanceProxy', related_name='lambdas')

    class Meta:
        table = 'governance_proxy_lambda'

class GovernanceProxyProxyLambda(ContractLambda, Model):
    contract                                = fields.ForeignKeyField('models.GovernanceProxy', related_name='proxy_lambdas')

    class Meta:
        table = 'governance_proxy_proxy_lambda'

class GovernanceProxyGeneralContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.GovernanceProxy', related_name='general_contracts')

    class Meta:
        table = 'governance_proxy_general_contract'

class GovernanceProxyWhitelistContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.GovernanceProxy', related_name='whitelist_contracts')

    class Meta:
        table = 'governance_proxy_whitelist_contract'

class GovernanceProxyWhitelistTokenContract(LinkedContract, Model):
    contract                                 = fields.ForeignKeyField('models.GovernanceProxy', related_name='whitelist_token_contracts')

    class Meta:
        table = 'governance_proxy_whitelist_token_contract'