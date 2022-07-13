// Setup a list of addresses
const userAmount                    = 25n;
const _ = {
    for i := 0 to int(userAmount){
        const newAccount            = Test.new_account();
        const hashedAccount         = (newAccount.0, Crypto.hash_key(newAccount.1));
        Test.log(hashedAccount)
    };
} with(unit)
