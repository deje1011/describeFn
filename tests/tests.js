var Promise = require('bluebird');
var describeFn = require('../src/describeFn');

var referenceForEqualityOperatorTest = {foo: 'bar'};

describeFn({
    fn: describeFn,
    fnName: 'describeFn',
    tests: {

        /*
                Success
            */

        'lets tests pass if the result is equal to the expected result': {
            params: {
                fn: function foo () { return 'bar'; },
                tests: {
                    'returns bar': {
                        params: [],
                        result: {equals: 'bar'}
                    }
                }
            },
            result: {
                contains: {
                    passed: 1,
                    failed: 0
                }
            }
        },

        'lets tests pass if the result is eventually equal to the expected result': {
            params: {
                fn: function foo () {
                    return new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            resolve('bar');
                        }, 100);
                    });
                },
                tests: {
                    'returns bar': {
                        params: [],
                        result: {equals: 'bar'}
                    }
                }
            },
            result: {
                contains: {
                    passed: 1,
                    failed: 0
                }
            }
        },

        'lets tests pass if the result object contains the expected values': {
            params: {
                fn: function foo () { return {bar: 'bar', baz: 'baz'} },
                tests: {
                    'includes bar': {
                        params: [],
                        result: {contains: {bar: 'bar'}}
                    }
                }
            },
            result: {
                contains: {
                    passed: 1,
                    failed: 0
                }
            }
        },

        'lets tests pass if the result array contains the expected values': {
            params: {
                fn: function foo () { return ['bar', 'baz'] },
                tests: {
                    'includes bar': {
                        params: [],
                        result: {contains: 'bar'}
                    }
                }
            },
            result: {
                contains: {
                    passed: 1,
                    failed: 0
                }
            }
        },

        'lets tests pass if the result string contains the expected value': {
            params: {
                fn: function foo () { return 'foobarbaz' },
                tests: {
                    'includes bar': {
                        params: [],
                        result: {contains: 'bar'}
                    }
                }
            },
            result: {
                contains: {
                    passed: 1,
                    failed: 0
                }
            }
        },

        'lets tests pass if the function throws an expected error': {
            params: {
                fn: function foo () { throw new Error('expected error message'); },
                tests: {
                    'returns bar': {
                        params: [],
                        result: {
                            isError: true
                        }
                    }
                }
            },
            result: {
                contains: {
                    passed: 1,
                    failed: 0
                }
            }
        },

        /*
                Operators
            */

        'can handle the === operator for results': {
            params: {
                fn: function foo () { return referenceForEqualityOperatorTest },
                tests: {
                    'returns bar': {
                        result: {'===': referenceForEqualityOperatorTest}
                    }
                }
            },
            result: {
                contains: {
                    passed: 1,
                    failed: 0
                }
            }
        },

        'can handle the > operator for results': {
            params: {
                fn: function foo () { return 42 },
                tests: {
                    'is greater than 1': {
                        result: {'>': 1}
                    },
                    'is greater than 50': {
                        result: {'>': 50}
                    }
                }
            },
            result: {
                contains: {
                    passed: 1,
                    failed: 1
                }
            }
        },

        'can handle the < operator for results': {
            params: {
                fn: function foo () { return 42 },
                tests: {
                    'is less than 1': {
                        result: {'<': 1}
                    },
                    'is less than 50': {
                        result: {'<': 50}
                    }
                }
            },
            result: {
                contains: {
                    passed: 1,
                    failed: 1
                }
            }
        },

        /*
                Failure
            */

        'lets tests fail if the result is not equal to the expected result': {
            params: {
                fn: function foo () { return 'bar'; },
                tests: {
                    'returns bar': {
                        params: [],
                        result: {equals: 'not bar'}
                    }
                }
            },
            result: {
                contains: {
                    passed: 0,
                    failed: 1
                }
            }
        },

        'lets tests fail if the function throws an unexpected error': {
            params: {
                fn: function foo () { throw new Error('Didnt expect this, did you?'); },
                tests: {
                    'returns bar': {
                        params: [],
                        result: {equals: 'bar'}
                    }
                }
            },
            result: {
                contains: {
                    passed: 0,
                    failed: 1
                }
            }
        },

        'lets tests fail if the result is eventually returns a rejected promise': {
            params: {
                fn: function foo () {
                    return new Promise(function (resolve, reject) {
                        setTimeout(function () {
                            reject(new Error('bar'));
                        }, 100);
                    });
                },
                tests: {
                    'returns bar': {
                        params: [],
                        result: {contains: {message:'bar'}}
                    }
                }
            },
            result: {
                contains: {
                    passed: 0,
                    failed: 1
                }
            }
        },

        'rejects with a timeout error if a test never finishes': {
            params: {
                fn: function foo () {
                    return new Promise(function (resolve, reject) {});
                },
                tests: {
                    'returns bar': {
                        maxDuration: 10,
                        params: [],
                        result: {equals: 'bar'}
                    }
                }
            },
            result: {isError: true},
            maxDuration: 11
        }
    }
}).then(function (testResults) {
    console.log(JSON.stringify(testResults.logs, null, 2));
});