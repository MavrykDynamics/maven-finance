from unittest import TestCase
import unittest
from contextlib import contextmanager
from copy import deepcopy
from pytezos import ContractInterface, pytezos, MichelsonRuntimeError

alice = 'tz1hNVs94TTjZh6BZ1PM5HL83A7aiZXkQ8ur'
admin = 'tz1fABJ97CJMSP2DKrQx2HAFazh6GgahQ7ZK'
bob = 'tz1c6PPijJnZYjKiSQND4pMtGMg6csGeAiiF'
fa12 = "KT19zwqygyrypvE4nGW5ktQMD8iUExo9p1zG"
initial_storage = ContractInterface.from_file("pascaligo/staking.tz").storage.dummy()
initial_storage["maxValuesNb"] = 1
initial_storage["admin"] = admin
initial_storage["reserve"] = admin
initial_storage["contract"] = fa12
unittest.TestLoader.sortTestMethodsUsing = None


class StakingContractTest(TestCase):

    @classmethod
    def setUpClass(cls):
        cls.staking = ContractInterface.from_file('pascaligo/staking.tz')
        cls.maxDiff = None

    @contextmanager
    def raisesMichelsonError(self, error_message):
        with self.assertRaises(MichelsonRuntimeError) as r:
            yield r

        error_msg = r.exception.format_stdout()
        if "FAILWITH" in error_msg:
            self.assertEqual(f"FAILWITH: '{error_message}'", r.exception.format_stdout())
        else:
            self.assertEqual(f"'{error_message}': ", r.exception.format_stdout())

    def test_set_contract(self):
        init_storage = deepcopy(initial_storage)
        res = self.staking.setContract(bob).interpret(storage=init_storage, source=admin)
        self.assertEqual(bob, res.storage["contract"])
        self.assertEqual([], res.operations)
        with self.raisesMichelsonError('Access denied'):
            self.staking.setContract(bob).interpret(storage=init_storage, source=alice)

    def test_createStakingOption(self):
        init_storage = deepcopy(initial_storage)
        staking_option = {
            "id": 1,
            "pack": {
                "rate": 200,
                "maxStake": 300000000000,
                "minStake": 1,
                "stakingPeriod": 0
            }
        }
        with self.raisesMichelsonError('Access denied'):
            self.staking.createStakingOpt(staking_option).interpret(storage=init_storage, source=bob)

        res = self.staking.createStakingOpt(staking_option).interpret(storage=init_storage, source=admin)
        expected_stakingOptions = {
            1: {
                "rate": 200,
                "maxStake": 300000000000,
                "minStake": 1,
                "stakingPeriod": 0
            }
        }
        self.assertEqual(res.storage["stakingOptions"], expected_stakingOptions)
        self.assertEqual(res.operations, [])

        init_storage["votingContract"] = alice
        res2 = self.staking.createStakingOpt(staking_option).interpret(storage=init_storage, source=alice)
        self.assertEqual(res2.storage["stakingOptions"], expected_stakingOptions)
        self.assertEqual(res2.operations, [])
        with self.raisesMichelsonError("Pack already exists"):
            self.staking.createStakingOpt(staking_option).interpret(storage=res2.storage, source=admin)

    def test_set_max_val(self):
        init_storage = deepcopy(initial_storage)
        with self.raisesMichelsonError("Access denied"):
            self.staking.setMaxValue(2).interpret(storage=init_storage, source=bob)
        res = self.staking.setMaxValue(2).interpret(storage=init_storage, source=admin)
        self.assertEqual(res.storage["maxValuesNb"], 2)
        self.assertEqual(res.operations, [])

    def test_stake_lock(self):
        init_storage = deepcopy(initial_storage)
        with self.raisesMichelsonError("Pack doesn't exists"):
            self.staking.stakeLocked({
                "am": 100000,
                "pack": 1
            }).interpret(storage=init_storage, source=bob)
        with self.raisesMichelsonError("Can't stake lock with pack 0"):
            self.staking.stakeLocked({
                "am": 100000,
                "pack": 0
            }).interpret(storage=init_storage, source=bob)
        stake_opt = {
            0: {
                "rate": 200,
                "maxStake": 300000000000,
                "minStake": 1,
                "stakingPeriod": 0
            },
            1: {
                "rate": 200,
                "maxStake": 300000000000,
                "minStake": 1,
                "stakingPeriod": 100000
            }
        }
        user_stake_lock = {
            bob: {
                1: {
                    0: {
                        'time': 0,
                        'period': 100000,
                        'rate': 200,
                        'amount': 100000
                    }
                }
            }
        }
        operation = {
            'kind': 'transaction',
            'source': 'KT1BEqzn5Wx8uJrZNvuS9DVHmLvG9td3fDLi',
            'destination': 'KT19zwqygyrypvE4nGW5ktQMD8iUExo9p1zG',
            'amount': '0',
            'parameters': {
                'entrypoint': 'transfer',
                'value': {
                    'prim': 'Pair',
                    'args': [
                        {
                            'string': 'tz1c6PPijJnZYjKiSQND4pMtGMg6csGeAiiF'
                        },
                        {
                            'string': 'tz1fABJ97CJMSP2DKrQx2HAFazh6GgahQ7ZK'
                        },
                        {
                            'int': '100000'
                        }
                    ]
                }
            }
        }
        init_storage["stakingOptions"] = stake_opt.copy()
        res = self.staking.stakeLocked({
            "am": 100000,
            "pack": 1
        }).interpret(storage=init_storage, source=bob)
        self.assertDictEqual(res.storage['userStakeLockPack'], user_stake_lock)
        self.assertDictEqual(res.operations.pop(), operation)

        with self.raisesMichelsonError("Amount too high"):
            self.staking.stakeLocked({
                "am": 300000000001,
                "pack": 1
            }).interpret(storage=init_storage, source=bob)
        with self.raisesMichelsonError("Amount too low"):
            self.staking.stakeLocked({
                "am": 0,
                "pack": 1
            }).interpret(storage=init_storage, source=bob)

        init_storage["userStakeLockPack"] = user_stake_lock.copy()
        user_stake_lock[alice] = {
            1: {
                0: {
                    'amount': 100000,
                    'rate': 200,
                    'period': 100000,
                    'time': 0
                }
            }
        }
        operation2 = {
            'kind': 'transaction',
            'source': 'KT1BEqzn5Wx8uJrZNvuS9DVHmLvG9td3fDLi',
            'destination': 'KT19zwqygyrypvE4nGW5ktQMD8iUExo9p1zG',
            'amount': '0',
            'parameters': {
                'entrypoint': 'transfer',
                'value': {
                    'prim': 'Pair',
                    'args': [
                        {
                            'string': 'tz1hNVs94TTjZh6BZ1PM5HL83A7aiZXkQ8ur'
                        },
                        {
                            'string': 'tz1fABJ97CJMSP2DKrQx2HAFazh6GgahQ7ZK'
                        },
                        {
                            'int': '100000'
                        }
                    ]
                }
            }
        }
        res2 = self.staking.stakeLocked({
            "am": 100000,
            "pack": 1
        }).interpret(storage=init_storage, source=alice)
        self.assertDictEqual(res2.storage['userStakeLockPack'], user_stake_lock)
        self.assertDictEqual(res2.operations.pop(), operation2)

    def test_unstake_lock(self):
        init_storage = deepcopy(initial_storage)
        with self.raisesMichelsonError("User never staked"):
            self.staking.unstakeLocked({
                "pack": 1,
                "index": 0
            }).interpret(storage=init_storage, source=bob)
        user_stake_lock = {
            bob: {
                1: {
                    2: {
                        'time': 0,
                        'period': 3153600,
                        'rate': 200,
                        'amount': 100000
                    },
                    1: {
                        'time': 0,
                        'period': 3153600,
                        'rate': 200,
                        'amount': 100000
                    }
                },
                2: {
                    3: {
                        'time': 0,
                        'period': 3153600,
                        'rate': 200,
                        'amount': 100000
                    }
                }
            }
        }
        operation = {
            'kind': 'transaction',
            'source': 'KT1BEqzn5Wx8uJrZNvuS9DVHmLvG9td3fDLi',
            'destination': 'KT19zwqygyrypvE4nGW5ktQMD8iUExo9p1zG',
            'amount': '0',
            'parameters': {
                'entrypoint': 'transfer',
                'value': {
                    'prim': 'Pair',
                    'args': [{
                        'string': 'tz1fABJ97CJMSP2DKrQx2HAFazh6GgahQ7ZK'
                    }, {
                        'string': 'tz1c6PPijJnZYjKiSQND4pMtGMg6csGeAiiF'
                    }, {
                        'int': '120000'
                    }]
                }
            }
        }
        init_storage["userStakeLockPack"] = deepcopy(user_stake_lock)

        with self.raisesMichelsonError("Invalid staking index"):
            self.staking.unstakeLocked({
                "pack": 1,
                "index": 0
            }).interpret(storage=init_storage, source=bob)
        with self.raisesMichelsonError("User never used this pack"):
            self.staking.unstakeLocked({
                "pack": 3,
                "index": 0
            }).interpret(storage=init_storage, source=bob)
        res = self.staking.unstakeLocked({
            "pack": 1,
            "index": 1
        }).interpret(storage=init_storage, source=bob, now=31536000)
        expected_user_stake_lock = deepcopy(user_stake_lock)
        expected_user_stake_lock[bob][1].pop(1)
        self.assertDictEqual(res.storage["userStakeLockPack"], expected_user_stake_lock)
        self.assertDictEqual(res.operations.pop(), operation)

        res2 = self.staking.unstakeLocked({
            "pack": 2,
            "index": 3
        }).interpret(storage=init_storage, source=bob, now=31536000)
        user_stake_lock[bob][2] = {}
        self.assertDictEqual(res2.storage["userStakeLockPack"], user_stake_lock)
        self.assertDictEqual(res2.operations.pop(), operation)

        operation = {
            'kind': 'transaction',
            'source': 'KT1BEqzn5Wx8uJrZNvuS9DVHmLvG9td3fDLi',
            'destination': 'KT19zwqygyrypvE4nGW5ktQMD8iUExo9p1zG',
            'amount': '0',
            'parameters': {
                'entrypoint': 'transfer',
                'value': {
                    'prim': 'Pair',
                    'args': [{
                        'string': 'tz1fABJ97CJMSP2DKrQx2HAFazh6GgahQ7ZK'
                    }, {
                        'string': 'tz1c6PPijJnZYjKiSQND4pMtGMg6csGeAiiF'
                    }, {
                        'int': '100000'
                    }]
                }
            }
        }
        res3 = self.staking.unstakeLocked({
            "pack": 1,
            "index": 1
        }).interpret(storage=init_storage, source=bob, now=10)
        self.assertDictEqual(res3.storage["userStakeLockPack"], expected_user_stake_lock)
        self.assertDictEqual(res3.operations.pop(), operation)

    def test_unstake_flex(self):
        init_storage = deepcopy(initial_storage)
        stake_flex = {
            0: {
                "rate": 200,
                "maxStake": 300000000000,
                "minStake": 1,
                "stakingPeriod": 0
            }
        }
        user_stake_flex = {
            0: {
                bob: {
                    'amount': 100000,
                    'rate': 200,
                    'reward': 0,
                    'time': 0
                }
            }
        }
        address_id = {
            bob: 0
        }
        expected_user_stake_flex = {
            0: {
                bob: {
                    'amount': 0,
                    'rate': 200,
                    'reward': 200000,
                    'time': 31536000
                }
            }
        }
        operation = {
            'kind': 'transaction',
            'source': 'KT1BEqzn5Wx8uJrZNvuS9DVHmLvG9td3fDLi',
            'destination': 'KT19zwqygyrypvE4nGW5ktQMD8iUExo9p1zG',
            'amount': '0',
            'parameters': {
                'entrypoint': 'transfer',
                'value': {
                    'prim': 'Pair',
                    'args': [{
                        'string': 'tz1fABJ97CJMSP2DKrQx2HAFazh6GgahQ7ZK'
                    },
                        {
                            'string': 'tz1c6PPijJnZYjKiSQND4pMtGMg6csGeAiiF'
                        },
                        {
                            'int': '100000'
                        }]
                }
            }
        }
        init_storage["stakingOptions"] = stake_flex.copy()
        init_storage["userStakeFlexPack"] = user_stake_flex.copy()
        init_storage["addressId"] = address_id.copy()

        with self.raisesMichelsonError("Can't withdraw more than staked"):
            self.staking.unstakeFlexed(1000000000).interpret(storage=init_storage, source=bob, now=31536000)

        res = self.staking.unstakeFlexed(100000).interpret(storage=init_storage, source=bob, now=31536000)
        self.assertDictEqual(res.storage["userStakeFlexPack"], expected_user_stake_flex)
        self.assertEqual(res.operations.pop(), operation)

    def test_staking_flex(self):
        init_storage = deepcopy(initial_storage)
        with self.raisesMichelsonError("Pack doesn't exists"):
            self.staking.stakeFlexed(int(1000)).interpret(storage=init_storage, source=bob)

        stake_flex = {
            0: {
                "rate": 200,
                "maxStake": 300000000000,
                "minStake": 1,
                "stakingPeriod": 0
            }
        }
        user_stake_flex = {
            0: {
                bob: {
                    'amount': 100000,
                    'rate': 200,
                    'reward': 0,
                    'time': 0
                }
            }
        }
        address_id = {
            bob: 0
        }
        operation = {
            'kind': 'transaction',
            'source': 'KT1BEqzn5Wx8uJrZNvuS9DVHmLvG9td3fDLi',
            'destination': 'KT19zwqygyrypvE4nGW5ktQMD8iUExo9p1zG',
            'amount': '0',
            'parameters': {
                'entrypoint': 'transfer',
                'value': {
                    'prim': 'Pair',
                    'args': [
                        {
                            'string': 'tz1c6PPijJnZYjKiSQND4pMtGMg6csGeAiiF'
                        },
                        {
                            'string': 'tz1fABJ97CJMSP2DKrQx2HAFazh6GgahQ7ZK'
                        },
                        {
                            'int': '100000'
                        }
                    ]
                }
            }
        }
        init_storage["stakingOptions"] = stake_flex.copy()
        res = self.staking.stakeFlexed(100000).interpret(storage=init_storage, source=bob)
        self.assertDictEqual(res.storage['userStakeFlexPack'], user_stake_flex)
        self.assertEqual(res.storage['stakeFlexLength'], 1)
        self.assertDictEqual(res.storage['addressId'], address_id)
        self.assertDictEqual(res.operations.pop(), operation)

        with self.raisesMichelsonError("Amount too high"):
            self.staking.stakeFlexed(300000000001).interpret(storage=init_storage, source=bob)
        with self.raisesMichelsonError("Amount too low"):
            self.staking.stakeFlexed(0).interpret(storage=init_storage, source=bob)

        init_storage["userStakeFlexPack"] = user_stake_flex.copy()
        init_storage["addressId"] = address_id.copy()
        user_stake_flex = {
            0: {
                bob: {
                    'amount': 101000,
                    'rate': 200,
                    'reward': 200000,
                    'time': 31536000
                }
            }
        }
        operation2 = {
            'kind': 'transaction',
            'source': 'KT1BEqzn5Wx8uJrZNvuS9DVHmLvG9td3fDLi',
            'destination': 'KT19zwqygyrypvE4nGW5ktQMD8iUExo9p1zG',
            'amount': '0',
            'parameters': {
                'entrypoint': 'transfer',
                'value': {
                    'prim': 'Pair',
                    'args': [
                        {
                            'string': 'tz1c6PPijJnZYjKiSQND4pMtGMg6csGeAiiF'
                        },
                        {
                            'string': 'tz1fABJ97CJMSP2DKrQx2HAFazh6GgahQ7ZK'
                        },
                        {
                            'int': '1000'
                        }
                    ]
                }
            }
        }
        res2 = self.staking.stakeFlexed(1000).interpret(storage=init_storage, source=bob, now=31536000)
        self.assertDictEqual(res2.storage['userStakeFlexPack'], user_stake_flex)
        self.assertEqual(res2.storage['stakeFlexLength'], 1)
        self.assertDictEqual(res2.storage['addressId'], address_id)
        self.assertDictEqual(res2.operations.pop(), operation2)

        init_storage["userStakeFlexPack"] = user_stake_flex.copy()
        address_id[alice] = 1
        user_stake_flex[1] = {
            alice: {
                'amount': 100000,
                'rate': 200,
                'reward': 0,
                'time': 0
            }
        }
        operation3 = {
            'kind': 'transaction',
            'source': 'KT1BEqzn5Wx8uJrZNvuS9DVHmLvG9td3fDLi',
            'destination': 'KT19zwqygyrypvE4nGW5ktQMD8iUExo9p1zG',
            'amount': '0',
            'parameters': {
                'entrypoint': 'transfer',
                'value': {
                    'prim': 'Pair',
                    'args': [
                        {
                            'string': 'tz1hNVs94TTjZh6BZ1PM5HL83A7aiZXkQ8ur'
                        },
                        {
                            'string': 'tz1fABJ97CJMSP2DKrQx2HAFazh6GgahQ7ZK'
                        },
                        {
                            'int': '100000'
                        }
                    ]
                }
            }
        }

        res3 = self.staking.stakeFlexed(100000).interpret(storage=init_storage, source=alice)
        self.assertDictEqual(res3.storage['userStakeFlexPack'], user_stake_flex)
        self.assertEqual(res3.storage['stakeFlexLength'], 2)
        self.assertDictEqual(res3.storage['addressId'], address_id)
        self.assertDictEqual(res3.operations.pop(), operation3)

    def test_claim_reward_flex(self):
        init_storage = deepcopy(initial_storage)
        stake_flex = {
            0: {
                "rate": 200,
                "maxStake": 300000000000,
                "minStake": 1,
                "stakingPeriod": 0
            }
        }
        address_id = {
            bob: 0
        }
        user_stake_flex = {
            0: {
                bob: {
                    'amount': 0,
                    'rate': 200,
                    'reward': 200000,
                    'time': 31536000
                }
            }
        }
        operation = {
            'kind': 'transaction',
            'source': 'KT1BEqzn5Wx8uJrZNvuS9DVHmLvG9td3fDLi',
            'destination': 'KT19zwqygyrypvE4nGW5ktQMD8iUExo9p1zG',
            'amount': '0',
            'parameters': {
                'entrypoint': 'transfer',
                'value': {
                    'prim': 'Pair',
                    'args': [{
                        'string': 'tz1fABJ97CJMSP2DKrQx2HAFazh6GgahQ7ZK'
                    }, {
                        'string': 'tz1c6PPijJnZYjKiSQND4pMtGMg6csGeAiiF'
                    }, {
                        'int': '200000'
                    }]
                }
            }
        }
        init_storage["stakingOptions"] = stake_flex.copy()
        init_storage["userStakeFlexPack"] = user_stake_flex.copy()
        init_storage["addressId"] = address_id.copy()
        res = self.staking.claimRewardFlexed().interpret(storage=init_storage, source=bob, now=2 * 31536000)
        self.assertDictEqual(res.storage["userStakeFlexPack"], {
            0: None
        })
        self.assertDictEqual(res.storage["addressId"], {})
        self.assertDictEqual(res.operations.pop(), operation)
        user_stake_flex = {
            0: {
                bob: {
                    'amount': 10,
                    'rate': 200,
                    'reward': 200000,
                    'time': 31536000
                }
            }
        }
        expected_user_stake_flex = {
            0: {
                bob: {
                    'amount': 10,
                    'rate': 200,
                    'reward': 0,
                    'time': 31536000
                }
            }
        }
        operation = {
            'kind': 'transaction',
            'source': 'KT1BEqzn5Wx8uJrZNvuS9DVHmLvG9td3fDLi',
            'destination': 'KT19zwqygyrypvE4nGW5ktQMD8iUExo9p1zG',
            'amount': '0',
            'parameters': {
                'entrypoint': 'transfer',
                'value': {
                    'prim': 'Pair',
                    'args': [{
                        'string': 'tz1fABJ97CJMSP2DKrQx2HAFazh6GgahQ7ZK'
                    }, {
                        'string': 'tz1c6PPijJnZYjKiSQND4pMtGMg6csGeAiiF'
                    }, {
                        'int': '200020'
                    }]
                }
            }
        }
        init_storage["userStakeFlexPack"] = user_stake_flex.copy()
        res2 = self.staking.claimRewardFlexed().interpret(storage=init_storage, source=bob, now=2 * 31536000)
        self.assertDictEqual(res2.storage["userStakeFlexPack"], expected_user_stake_flex)
        self.assertDictEqual(res2.storage["addressId"], address_id)
        self.assertDictEqual(res2.operations.pop(), operation)
        with self.raisesMichelsonError('User not found in address id'):
            self.staking.claimRewardFlexed().interpret(storage=init_storage, source=alice, now=2 * 31536000)
