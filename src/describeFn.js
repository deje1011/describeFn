// TODO: Warning for parameters that are not accepted (misspelled "parans" instead of "params" for example)

var Promise = require('bluebird');
var _ = require('lodash');

Promise.config({
    warnings: true,
    longStackTraces: true,
    cancellation: true,
    monitoring: true
});

var describeFn = function (config) {

    if (!config.fn) {
        throw new Error('fn is required');
    }

    config = _.defaults(config, {
        fmName: config.fn.name || 'anonymous'
    });

    var describeFnResult = {
        logs: [
            '---------------------',
            'The function ' + config.fnName
        ],
        passed: 0,
        failed: 0,
        fnName: config.fnName
    };

    var stringify = function (anything) {
        if (_.isString(anything)) {
            return anything;
        }
        if (anything instanceof Error) {
            return anything.toString();
        }
        return JSON.stringify(anything);//, null, 2);
    };

    var compareFns = {
        contains: function (params) {
            /*
                params:
                    container <Object/Array/String>
                    toBeContained <Object/Array/String>
            */

            if (_.isArray(params.container) || _.isString(params.container)) {
                return _.includes(params.container, params.toBeContained);
            }

            if (_.isObject(params.container)) {
                return _.isEqual(
                    _.pick.apply(_, [params.container].concat(_.keys(params.toBeContained))),
                    params.toBeContained
                );
            }
        }
    };

    var testPromises = Promise.map(_.keys(config.tests), function (testName) {

        var testConfig = config.tests[testName];
        var promise;

        testConfig = _.defaults(testConfig, {
            maxDuration: 1000
        });

        try {
            promise = Promise.resolve(config.fn.apply(undefined, [].concat(testConfig.params || [])));
        } catch (error) {
            promise = Promise.reject(error);
        }

        var FAIL_LOG_PREFIX = '    =>    ';

        var validateResult = function (result) {

            var logs = [];
            var failedSubTests = 0;

            if (testConfig.result.hasOwnProperty('equals')) {
                if (_.isEqual(result, testConfig.result.equals) === false) {
                    logs.push(
                        FAIL_LOG_PREFIX +
                        'Expected result (' + stringify(result) + ')' +
                        ' to equal ' + stringify(testConfig.result.equals)
                    );
                    failedSubTests += 1;
                }
            }

            if (testConfig.result.hasOwnProperty('contains')) {
                (function () {
                    var containsPassed = compareFns.contains({
                        container: result,
                        toBeContained: testConfig.result.contains
                    });
                    if (!containsPassed) {
                        logs.push(
                            FAIL_LOG_PREFIX +
                            'Expected result (' + stringify(result) + ')' +
                            ' to contain ' + stringify(testConfig.result.contains)
                        );
                        failedSubTests += 1;
                    }
                }());
            }

            _.each(['>', '>=', '<', '<=', '==='], function (operator) {

                var operatorTestPassed = true;

                if (testConfig.result.hasOwnProperty(operator)) {

                    if (operator === '>') {
                        operatorTestPassed = result > testConfig.result[operator];
                    } else if (operator === '>=') {
                        operatorTestPassed = result >= testConfig.result[operator];
                    } else if (operator === '<') {
                        operatorTestPassed = result < testConfig.result[operator];
                    } else if (operator === '<=') {
                        operatorTestPassed = result <= testConfig.result[operator];
                    } else if (operator === '===') {
                        operatorTestPassed = result === testConfig.result[operator];
                    }

                    if (!operatorTestPassed) {
                        logs.push(
                            FAIL_LOG_PREFIX +
                            'Expected result (' + stringify(result) + ')' +
                            ' to be ' + operator +
                            stringify(testConfig.result.equals)
                        );
                        failedSubTests += 1;
                    }
                }

                return operatorTestPassed;
            });

            if (failedSubTests === 0) {
                logs.unshift('  ' + testName + '. √');
            } else {
                logs.unshift('  ' + testName + '. X');
            }

            return {
                passed: (failedSubTests === 0),
                logs: logs
            };
        };

        var transformResult = function (result) {
            if (_.isFunction(testConfig.transformResult)) {
                result = testConfig.transformResult(result);
            }
            return result;
        };

        var onError = function (error) {
            var isErrorPassed = !!testConfig.result.isError;
            var testData = validateResult(error);

            if (!isErrorPassed) {
                testData.logs.push(
                    FAIL_LOG_PREFIX + 'Unexpected error: ' + stringify(error)
                );
                testData.passed = false;
            }

            return testData;
        };

        var addTestDataToDescribeFnResult = function (testData) {
            describeFnResult.logs = describeFnResult.logs.concat(testData.logs);
            if (testData.passed) {
                describeFnResult.passed += 1;
            } else {
                describeFnResult.failed += 1;
            }
        };

        return promise
            .timeout(testConfig.maxDuration, 'Test >>' + testName + '<< took too long to complete.')
            .then(transformResult)
            .then(validateResult)
            .catch(onError)
            .then(addTestDataToDescribeFnResult);
    });

    return Promise.all(testPromises).return(describeFnResult);
};

module.exports = describeFn;

if (typeof window !== 'undefined') {
    window.describeFn = describeFn;
}