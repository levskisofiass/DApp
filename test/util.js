const util = {
    expectThrow: async promise => {
        try {
            let result = await promise;
        } catch (error) {
            const invalidJump = error.message.search('invalid JUMP') >= 0
            const invalidOpcode = error.message.search('invalid opcode') >= 0
            const outOfGas = error.message.search('out of gas') >= 0
            const revert = error.message.search('revert') >= 0
            assert(invalidJump || invalidOpcode || outOfGas || revert, "Expected throw, got '" + error + "' instead")
            return
        }
        assert.fail('Expected throw not received')
    },

    getTimestampPlusSeconds: (seconds) => {
        let date = new Date();
        date.setSeconds(date.getSeconds() + seconds)
        let timestamp = +date;
        timestamp = Math.ceil(timestamp / 1000);
        return timestamp;
    },

    toBytes32: (i) => {
        const stringed = "0000000000000000000000000000000000000000000000000000000000000000" + i.toString(16);
        return "0x" + stringed.substring(stringed.length - 64, stringed.length);
    },

    getTimeoutPromise: (secondsTimeout) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve()
            }, (secondsTimeout + 1) * 1000)
        })
    },

    getTransactionReceiptMined: async (txnHash, interval) => {
        var transactionReceiptAsync;
        interval = interval ? interval : 500;
        transactionReceiptAsync = function (txnHash, resolve, reject) {
            try {
                var receipt = web3.eth.getTransactionReceipt(txnHash);
                if (receipt == null) {
                    setTimeout(function () {
                        transactionReceiptAsync(txnHash, resolve, reject);
                    }, interval);
                } else {
                    resolve(receipt);
                }
            } catch (e) {
                reject(e);
            }
        };

        if (Array.isArray(txnHash)) {
            var promises = [];
            txnHash.forEach(function (oneTxHash) {
                promises.push(this(oneTxHash, interval));
            });
            return Promise.all(promises);
        } else {
            return new Promise(function (resolve, reject) {
                transactionReceiptAsync(txnHash, resolve, reject);
            });
        }
    },

    getFutureTimestamp: async (minutes) => {
        let date = new Date();
        date.setMinutes(date.getMinutes() + minutes)
        let timestamp = +date;
        timestamp = Math.ceil(timestamp / 1000);
        return timestamp;
    },

    web3Now: (web3) => {
        return web3.eth.getBlock(web3.eth.blockNumber).timestamp;
    },

    timeTravel: (web3, seconds) => {
        return new Promise((resolve, reject) => {
            web3.currentProvider.sendAsync({
                jsonrpc: "2.0",
                method: "evm_increaseTime",
                params: [seconds], // 86400 seconds in a day
                id: new Date().getTime()
            }, (err, result) => {
                if (err) {
                    reject(err);
                }
                web3.currentProvider.sendAsync({
                    jsonrpc: "2.0",
                    method: "evm_mine",
                    id: new Date().getTime()
                }, function (err, result) {
                    if (err) {
                        reject(err);
                    }
                    resolve(result);
                });

            });
        })
    }
}


module.exports = util;