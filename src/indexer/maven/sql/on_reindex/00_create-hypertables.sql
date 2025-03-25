-- Check and create hypertables if not already created
ALTER TABLE aggregator_oracle_observation DROP CONSTRAINT aggregator_oracle_observation_pkey;
ALTER TABLE aggregator_oracle_observation ADD PRIMARY KEY (id, timestamp);
SELECT create_hypertable('aggregator_oracle_observation', 'timestamp', if_not_exists => TRUE);

ALTER TABLE aggregator_history_data DROP CONSTRAINT aggregator_history_data_pkey;
ALTER TABLE aggregator_history_data ADD PRIMARY KEY (id, timestamp);
SELECT create_hypertable('aggregator_history_data', 'timestamp', if_not_exists => TRUE);

ALTER TABLE dipdup_exception DROP CONSTRAINT dipdup_exception_pkey;
ALTER TABLE dipdup_exception ADD PRIMARY KEY (id, timestamp);
SELECT create_hypertable('dipdup_exception', 'timestamp', if_not_exists => TRUE);

ALTER TABLE stake_history_data DROP CONSTRAINT stake_history_data_pkey;
ALTER TABLE stake_history_data ADD PRIMARY KEY (id, timestamp);
SELECT create_hypertable('stake_history_data', 'timestamp', if_not_exists => TRUE);

ALTER TABLE smvn_history_data DROP CONSTRAINT smvn_history_data_pkey;
ALTER TABLE smvn_history_data ADD PRIMARY KEY (id, timestamp);
SELECT create_hypertable('smvn_history_data', 'timestamp', if_not_exists => TRUE);

ALTER TABLE emergency_governance_vote DROP CONSTRAINT emergency_governance_vote_pkey;
ALTER TABLE emergency_governance_vote ADD PRIMARY KEY (id, timestamp);
SELECT create_hypertable('emergency_governance_vote', 'timestamp', if_not_exists => TRUE);

ALTER TABLE governance_financial_request_vote DROP CONSTRAINT governance_financial_request_vote_pkey;
ALTER TABLE governance_financial_request_vote ADD PRIMARY KEY (id, timestamp);
SELECT create_hypertable('governance_financial_request_vote', 'timestamp', if_not_exists => TRUE);

ALTER TABLE governance_satellite_action_vote DROP CONSTRAINT governance_satellite_action_vote_pkey;
ALTER TABLE governance_satellite_action_vote ADD PRIMARY KEY (id, timestamp);
SELECT create_hypertable('governance_satellite_action_vote', 'timestamp', if_not_exists => TRUE);

ALTER TABLE governance_proposal_vote DROP CONSTRAINT governance_proposal_vote_pkey;
ALTER TABLE governance_proposal_vote ADD PRIMARY KEY (id, timestamp);
SELECT create_hypertable('governance_proposal_vote', 'timestamp', if_not_exists => TRUE);

ALTER TABLE lending_controller_history_data DROP CONSTRAINT lending_controller_history_data_pkey;
ALTER TABLE lending_controller_history_data ADD PRIMARY KEY (id, timestamp);
SELECT create_hypertable('lending_controller_history_data', 'timestamp', if_not_exists => TRUE);

ALTER TABLE m_token_account_history_data DROP CONSTRAINT m_token_account_history_data_pkey;
ALTER TABLE m_token_account_history_data ADD PRIMARY KEY (id, timestamp);
SELECT create_hypertable('m_token_account_history_data', 'timestamp', if_not_exists => TRUE);

ALTER TABLE mvn_transfer_history_data DROP CONSTRAINT mvn_transfer_history_data_pkey;
ALTER TABLE mvn_transfer_history_data ADD PRIMARY KEY (id, timestamp);
SELECT create_hypertable('mvn_transfer_history_data', 'timestamp', if_not_exists => TRUE);

ALTER TABLE treasury_transfer_history_data DROP CONSTRAINT treasury_transfer_history_data_pkey;
ALTER TABLE treasury_transfer_history_data ADD PRIMARY KEY (id, timestamp);
SELECT create_hypertable('treasury_transfer_history_data', 'timestamp', if_not_exists => TRUE);
