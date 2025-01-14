const Test = (__brunoTestResults, chai) => (description, callback) => {
  try {
    callback();
    __brunoTestResults.addResult({ description, status: 'pass' });
  } catch (error) {
    console.log(chai.AssertionError);
    if (error instanceof chai.AssertionError) {
      const { message, actual, expected } = error;
      __brunoTestResults.addResult({
        description,
        status: 'fail',
        error: message,
        actual,
        expected
      });
    } else {
      __brunoTestResults.addResult({
        description,
        status: 'fail',
        error: error.message || 'An unexpected error occurred.'
      });
    }
    console.log(error);
  }
};

module.exports = Test;
