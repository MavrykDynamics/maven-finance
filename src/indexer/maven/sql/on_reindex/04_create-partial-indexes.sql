-- Maven Finance Performance-Optimized Indexes
-- Contains partial indexes (with WHERE clauses) and materialized view indexes
-- Standard indexes have been moved to Tortoise ORM model definitions

-- =========================================================
-- PARTIAL INDEXES (Cannot be defined in Tortoise ORM models)
-- =========================================================

-- === Maven User Indexes ===
-- Partial indexes for filtering users with positive balances
-- OPTIMIZED: Combine both balance conditions into one index for better performance
CREATE INDEX IF NOT EXISTS idx_maven_user_balances_gt_0 
ON maven_user (address, mvn_balance, smvn_balance) WHERE (mvn_balance > 0 OR smvn_balance > 0);

-- === M Token Account Indexes ===
-- Partial indexes for accounts with positive balances
-- OPTIMIZED: Covering index with all commonly queried fields
CREATE INDEX IF NOT EXISTS idx_m_token_account_balance_gt_0
ON m_token_account (user_id, m_token_id, balance, rewards_earned) WHERE (balance > 0);

-- OPTIMIZED: Removed redundant index for rewards_gt_0, covered by the one above

-- === Lending Controller Vault Indexes ===
-- OPTIMIZED: Combined several small indexes into covering indexes
CREATE INDEX IF NOT EXISTS idx_lending_controller_vault_active
ON lending_controller_vault (owner_id, loan_token_id, loan_outstanding_total, open) 
WHERE (open = true);

CREATE INDEX IF NOT EXISTS idx_lending_controller_vault_loan_outstanding
ON lending_controller_vault (owner_id, vault_id, loan_token_id, loan_outstanding_total) 
WHERE (loan_outstanding_total > 0);

-- OPTIMIZED: Better covering index for sorting operations
CREATE INDEX IF NOT EXISTS idx_lending_controller_vault_open_loan_sort
ON lending_controller_vault (open, loan_outstanding_total DESC, owner_id, loan_token_id)
WHERE open = TRUE;

-- === Lending Controller Vault Collateral Balance Indexes ===
-- OPTIMIZED: Added related fields to prevent table lookups
CREATE INDEX IF NOT EXISTS idx_lcv_collateral_balance_gt_0
ON lending_controller_vault_collateral_balance (lending_controller_vault_id, collateral_token_id, balance) 
WHERE (balance > 0);

-- === Farm Indexes ===
-- OPTIMIZED: Combined farm indexes with relevant fields
CREATE INDEX IF NOT EXISTS idx_farm_active
ON farm (unpaid_rewards, open, lp_token_balance) 
WHERE (unpaid_rewards > 0 OR (open = TRUE AND lp_token_balance > 0));

-- === Farm Account Indexes ===
-- OPTIMIZED: Condensed into a single covering index
CREATE INDEX IF NOT EXISTS idx_farm_account_active
ON farm_account (user_id, farm_id, deposited_amount, unclaimed_rewards) 
WHERE (deposited_amount > 0 OR unclaimed_rewards > 0);

-- === Satellite Indexes ===
-- OPTIMIZED: Combined satellite indexes
CREATE INDEX IF NOT EXISTS idx_satellite_active
ON satellite (currently_registered, total_delegated_amount, name) 
WHERE currently_registered = TRUE AND total_delegated_amount > 0;

-- === Satellite Rewards Indexes ===
-- OPTIMIZED: Single index for unpaid rewards
CREATE INDEX IF NOT EXISTS idx_satellite_rewards_unpaid
ON satellite_rewards (user_id, unpaid) 
WHERE unpaid > 0;

-- =========================================================
-- DESCENDING INDEXES (Ordered indexes that can't be defined in ORM)
-- =========================================================

-- OPTIMIZED: Added covering fields to prevent additional lookups
CREATE INDEX IF NOT EXISTS idx_m_token_account_user_rewards_desc 
ON m_token_account (user_id, rewards_earned DESC, m_token_id, balance);

-- OPTIMIZED: Added covering fields
CREATE INDEX IF NOT EXISTS idx_farm_account_user_farm_rewards_desc
ON farm_account (user_id, farm_id, claimed_rewards DESC, deposited_amount, unclaimed_rewards);

-- OPTIMIZED: Used INCLUDE for additional fields to avoid sorting
CREATE INDEX IF NOT EXISTS idx_lending_controller_vault_outstanding_desc
ON lending_controller_vault (owner_id, open, loan_outstanding_total DESC)
INCLUDE (loan_token_id, vault_id, borrow_index);

-- OPTIMIZED: Used INCLUDE for non-sorting fields
CREATE INDEX IF NOT EXISTS idx_loan_token_borrowed_desc
ON lending_controller_loan_token (total_borrowed DESC)
INCLUDE (token_id, m_token_id, utilisation_rate, current_interest_rate, paused);

-- OPTIMIZED: Added covering fields for timestamp-based searches
CREATE INDEX IF NOT EXISTS idx_lc_history_data_timestamp_desc
ON lending_controller_history_data (timestamp DESC, type, amount)
INCLUDE (loan_token_id, sender_id);

-- OPTIMIZED: Added commonly queried fields
CREATE INDEX IF NOT EXISTS idx_lcv_collateral_balance_desc
ON lending_controller_vault_collateral_balance (balance DESC, lending_controller_vault_id, collateral_token_id);

-- =========================================================
-- MATERIALIZED VIEW INDEXES
-- =========================================================

-- === loan_token_view Indexes ===
CREATE INDEX IF NOT EXISTS loan_token_view_market_data_idx 
ON loan_token_view (token_address, paused, token_id, current_interest_rate, utilisation_rate);

CREATE INDEX IF NOT EXISTS loan_token_view_stats_desc_idx 
ON loan_token_view (depositors_count DESC, total_borrowed DESC, utilisation_rate DESC);

-- === vault_collateral_view Indexes ===
CREATE INDEX IF NOT EXISTS vault_collateral_view_owner_idx 
ON vault_collateral_view (owner_address, vault_address, token_address, balance, loan_outstanding_total);

CREATE INDEX IF NOT EXISTS vault_collateral_view_stats_desc_idx 
ON vault_collateral_view (balance DESC, loan_outstanding_total DESC);

-- === user_dashboard Indexes ===
CREATE INDEX IF NOT EXISTS user_dashboard_stats_idx 
ON user_dashboard (user_address, user_id, total_borrowed DESC, vaults_count DESC, active_vaults_count DESC);

CREATE INDEX IF NOT EXISTS user_dashboard_tokens_idx 
ON user_dashboard USING GIN (m_tokens);