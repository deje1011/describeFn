var Promise = require('bluebird');
var _ = require('lodash');

var describeFn = require('../src/describeFn');

// An example function to test:
var concat = function (params) {
    if (params.stringA === undefined || params.stringB === undefined) {
        throw new Error('Invalid params');
    }
    if (params.concatChar === undefined) {
        params.concatChar = '';
    }
    return params.stringA + params.concatChar + params.stringB;
};

// A statefull function
var uniqueId = (function () {
    var counter = 0;
    return function () {
        counter += 1;
        return counter;
    };
}());

// A function with side effects
var globalState = {
    foo: 'foo',
    bar: 'bar'
};
var sideEffectFn = function () {
    globalState.foo = 'foo modified';
};

// A function calling another function asynchronously
var runFnAsync = function (params) {
    if (params.timeout === undefined) {
        params.timeout = 10;
    }
    setTimeout(function () {
        params.callback();
    }, params.timeout);
};

// A function with more than 1 argument
var sumOfAllArguments = function () {
    return _.reduce(arguments, function (total, n) {
        return total + n;
    }, 0);
};

Promise.all([

    // Tests for the example function from above:
    describeFn({
        fn: concat,
        fnName: 'concat',
        tests: {
            'returns one string containing both passed strings': {
                params: {
                    stringA: 'A',
                    stringB: 'B'
                },
                result: {equals: 'AB'}
            },
            'inserts the concatChar in the middle of both strings': {
                params: {
                    stringA: 'A',
                    stringB: 'B',
                    concatChar: '-'
                },
                result: {equals: 'A-B'}
            },
            'throws an error if we dont pass enough strings': {
                params: {stringA: 'A'},
                result: {isError: true}
            }
        }
    }),

    // Tests for the statefull function from above
    describeFn({
        fn: function testFnUsingUniqueId () {
            return {
                firstResult: uniqueId(),
                secondResult: uniqueId()
            };
        },
        fnName: 'uniqueId',
        tests: {
            'increments the return value by one on each call': {
                params: [],
                result: {
                    equals: {
                        firstResult: 1,
                        secondResult: 2
                    }
                }
            }
        }
    }),

    // Tests for a function with side effects
    describeFn({
        fn: function testFnUsingSideEffectFn () {
            sideEffectFn();
            return globalState;
        },
        fnName: 'sideEffectFn',
        tests: {
            'modifies the foo property of the global state': {
                params: [],
                result: {contains: {foo: 'foo modified'}}
            }
        }
    }),

    // Tests for a function with an asynchronous callback
    describeFn({
        fn: function (params) {
            var start = new Date();
            return new Promise(function (resolve, reject) {
                runFnAsync({
                    callback: function () {
                        var end = new Date();
                        resolve(end - start);
                    },
                    timeout: params.timeout
                });
            });
        },
        fnName: 'runFnAsync',
        tests: {
            'calls callback after given timeout': {
                params: {timeout: 10},
                result: {'>=': 10}
            }
        }
    }),


    // Tests for a function with more than 1 argument
    describeFn({
        fn: sumOfAllArguments,
        fnName: 'sumOfAllArguments',
        tests: {
            'returns the sum of all arguments': {
                params: [1,2,3,4,5],
                result: {equals: 15}
            }
        }
    })

]).then(function (allResults) {
    var combinedResult = _.reduce(allResults, function (combined, result) {
        combined.logs = combined.logs.concat(result.logs);
        combined.passed += result.passed;
        combined.failed += result.failed;
        return combined;
    }, {logs: [], passed: 0, failed: 0});
    console.log(JSON.stringify(combinedResult, null, 2));
});