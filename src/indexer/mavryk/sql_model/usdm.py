from dipdup.models import Model, fields
from mavryk.sql_model.parents import LinkedContract, ContractLambda

###
# USDM Tables
###

# class USDMToken(Model):
#     address                                 = fields.CharField(pk=True, max_length=36)
#     admin                                   = fields.CharField(max_length=36)

#     class Meta:
#         table = 'usdm_token'

# class Vault(Model):
#     address                                 = fields.CharField(pk=True, max_length=36)
#     admin                                   = fields.CharField(max_length=36)
#     collateral                              = fields.IntEnumField(enum_type=TokenType, default=TokenType.OTHER)
#     collateral_token_address                = fields.CharField(max_length=36)

#     class Meta:
#         table = 'vault'

# class USDMTokenController(Model):
#     address                                 = fields.CharField(pk=True, max_length=36)
#     admin                                   = fields.CharField(max_length=36)
#     collateral_ratio                        = fields.SmallIntField(default=0)
#     liquidation_ratio                       = fields.SmallIntField(default=0)
#     liquidation_fee                         = fields.FloatField(default=0.0)
#     admin_liquidation_fee                   = fields.FloatField(default=0.0)
#     minimum_loan_fee                        = fields.FloatField(default=0.0)
#     annual_service_loan_fee                 = fields.FloatField(default=0.0)
#     daily_service_loan_fee                  = fields.FloatField(default=0.0)
#     decimals                                = fields.SmallIntField(default=0)
#     vault_counter                           = fields.BigIntField(default=0)

#     class Meta:
#         table = 'usdm_token_controller'

# class CFMM(Model):
#     address                                 = fields.CharField(pk=True, max_length=36)
#     admin                                   = fields.CharField(max_length=36)
#     cash_token_address                      = fields.CharField(max_length=36, default="")
#     cash_token_id                           = fields.SmallIntField(default=0)
#     cash_pool                               = fields.FloatField(default=0.0)
#     lp_token_address                        = fields.CharField(max_length=36, default="")
#     lp_tokens_total                         = fields.FloatField(default=0.0)
#     pending_pool_updates                    = fields.BigIntField(default=0)
#     token_name                              = fields.CharField(max_length=36, default="")
#     token_address                           = fields.CharField(max_length=36, default="")
#     token_id                                = fields.SmallIntField(default=0.0)
#     token_pool                              = fields.FloatField(default=0.0)
#     last_oracle_update                      = fields.BigIntField(default=0)
#     consumer_entrypoint                     = fields.CharField(max_length=36, default="")

#     class Meta:
#         table = 'cfmm'
# class VaultHandle(Model):
#     id                                      = fields.BigIntField(pk=True)
#     vault                                   = fields.ForeignKeyField('models.Vault', related_name='vault_handle')
#     vault_owner                             = fields.ForeignKeyField('models.MavrykUser', related_name='vault_owners', index=True)
#     internal_id                             = fields.BigIntField(default=0)

#     class Meta:
#         table = 'vault_handle'

# class VaultDepositor(Model):
#     id                                      = fields.BigIntField(pk=True)
#     vault                                   = fields.ForeignKeyField('models.Vault', related_name='vault_depositors')
#     depositor                               = fields.ForeignKeyField('models.MavrykUser', related_name='vaults_depositor', index=True)
#     whitelisted                             = fields.BooleanField(default=False)

#     class Meta:
#         table = 'vault_depositor'

# class USDMTokenControllerVault(Model):
#     id                                      = fields.BigIntField(pk=True)
#     usdm_token_controller                   = fields.ForeignKeyField('models.USDMTokenController', related_name='vaults')
#     vault                                   = fields.ForeignKeyField('models.Vault', related_name='usdm_token_controller_vaults')
#     collateral_balance                      = fields.FloatField(default=0.0)
#     usdm_outstanding                        = fields.FloatField(default=0.0)
#     last_mint_block_leve                    = fields.BigIntField(default=0)
#     used                                    = fields.BooleanField(default=True)

#     class Meta:
#         table = 'usdm_token_controller_vault'

# class USDMTokenControllerVaultCollateral(Model):
#     id                                      = fields.BigIntField(pk=True)
#     usdm_token_controller_vault             = fields.ForeignKeyField('models.USDMTokenControllerVault', related_name='collaterals')
#     name                                    = fields.CharField(max_length=36)
#     balance                                 = fields.FloatField(default=0.0)

#     class Meta:
#         table = 'usdm_token_controller_vault_collateral'

# class USDMTokenControllerTarget(Model):
#     id                                      = fields.BigIntField(pk=True)
#     usdm_token_controller                   = fields.ForeignKeyField('models.USDMTokenController', related_name='targets')
#     name                                    = fields.CharField(max_length=36)
#     target_price                            = fields.FloatField(default=0.0)

#     class Meta:
#         table = 'usdm_token_controller_target'

# class USDMTokenControllerDrift(Model):
#     id                                      = fields.BigIntField(pk=True)
#     usdm_token_controller                   = fields.ForeignKeyField('models.USDMTokenController', related_name='drifts')
#     name                                    = fields.CharField(max_length=36)
#     drift                                   = fields.FloatField(default=0.0)

#     class Meta:
#         table = 'usdm_token_controller_drifts'

# class USDMTokenControllerLastDriftUpdate(Model):
#     id                                      = fields.BigIntField(pk=True)
#     usdm_token_controller                   = fields.ForeignKeyField('models.USDMTokenController', related_name='last_drift_updates')
#     name                                    = fields.CharField(max_length=36)
#     timestamp                               = fields.DatetimeField(null=True)

#     class Meta:
#         table = 'usdm_token_controller_last_drift_update'

# class USDMTokenControllerCollateralToken(Model):
#     id                                      = fields.BigIntField(pk=True)
#     usdm_token_controller                   = fields.ForeignKeyField('models.USDMTokenController', related_name='collateral_tokens')
#     name                                    = fields.CharField(max_length=36)
#     token_name                              = fields.CharField(max_length=36)
#     token_contract_address                  = fields.CharField(max_length=36)
#     token_type                              = fields.IntEnumField(enum_type=TokenType)
#     decimals                                = fields.SmallIntField(default=0)
#     oracle_address                          = fields.CharField(max_length=36)

#     class Meta:
#         table = 'usdm_token_controller_collateral_token'

# class USDMTokenControllerPrice(Model):
#     id                                      = fields.BigIntField(pk=True)
#     usdm_token_controller                   = fields.ForeignKeyField('models.USDMTokenController', related_name='prices')
#     name                                    = fields.CharField(max_length=36)
#     price                                   = fields.FloatField(default=0.0)
    
#     class Meta:
#         table = 'usdm_token_controller_price'

# class USDMTokenControllerCFMM(Model):
#     id                                      = fields.BigIntField(pk=True)
#     usdm_token_controller                   = fields.ForeignKeyField('models.USDMTokenController', related_name='cfmms')
#     cfmm                                    = fields.ForeignKeyField('models.CFMM', related_name='usdm_token_controller_cfmms')
#     name                                    = fields.CharField(max_length=36)
    
#     class Meta:
#         table = 'usdm_token_controller_cfmm'