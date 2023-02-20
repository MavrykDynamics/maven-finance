-- More info about candlestick data generation with TimescaleDB
-- https://docs.timescale.com/timescaledb/latest/tutorials/financial-tick-data/
-- Prepare the table to be a hypertable

ALTER TABLE
    liquidity_baking_history_data DROP CONSTRAINT liquidity_baking_history_data_pkey;

ALTER TABLE
    liquidity_baking_history_data
ADD PRIMARY KEY (id, timestamp);

-- Create a hypertable

SELECT
    create_hypertable(
        'liquidity_baking_history_data',
        'timestamp'
    );

-- Create a view to aggregate data every minutes for a day

CREATE MATERIALIZED VIEW LIQUIDITY_BAKING_ONE_DAY_CANDLE 
WITH(TIMESCALEDB.CONTINUOUS) AS 
	SELECT
	    time_bucket('1 day', timestamp) AS bucket,
	    FIRST(token_price, timestamp) AS "open",
	    MAX(token_price) AS high,
	    MIN(token_price) AS low,
	    LAST(token_price, timestamp) AS "close",
        SUM(xtz_qty) AS xtz_volume,
        SUM(token_qty) AS token_volume,
        COUNT(id) AS trades
	FROM
	    liquidity_baking_history_data
	GROUP BY
BUCKET; 

-- Create a refresh policy for the view

SELECT
    add_continuous_aggregate_policy(
        'LIQUIDITY_BAKING_ONE_DAY_CANDLE',
        start_offset => INTERVAL '3 days',
        end_offset => INTERVAL '1 day',
        schedule_interval => INTERVAL '1 day'
    );