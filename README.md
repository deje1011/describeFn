# describeFn
A super simple testing utility, mostly useful for pure functions.


# Example

The function we want to test

    /*
      concatenates 2 strings with an optional character in between.
      concat({stringA: 'A', stringB: 'B'}) => AB
      concat({stringA: 'A', stringB: 'B', concatChar: '-'}) => A-B
      
      Maybe not super useful but pure and testable.
    */
    var concat = function (params) {
        if (params.stringA === undefined || params.stringB === undefined) {
            throw new Error('Invalid params');
        }
        if (params.concatChar === undefined) {
            params.concatChar = '';
        }
        return params.stringA + params.concatChar + params.stringB;
    };

The tests

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
    });
    
Test results
    
    /*
      The function concat,
       returns one string containing both passed strings. √,
       inserts the concatChar in the middle of both strings. √,
       throws an error if we dont pass enough strings. √
    */
    
    
 For more examples, see examples/describeFnExample.js and tests/tests.js (which runs tests on describeFn itself using describeFn).
