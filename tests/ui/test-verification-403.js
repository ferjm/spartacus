var helpers = require('../helpers');

helpers.startCasper({
  setUp: function(){
    helpers.fakeLogout();
    helpers.fakeVerification({statusCode: 403});
    helpers.spyOnMozPaymentProvider();
  },
});

casper.test.begin('Denied verification should only have cancel option.', {

  test: function(test) {

    helpers.doLogin();

    casper.waitForSelector('.full-error', function() {
      helpers.assertErrorCode('VERIFY_DENIED');
      test.assertElementCount('.full-error .button', 1, 'Should only be one button for cancelling the flow');
      casper.click('.full-error .button');
    });

    helpers.waitForMozPayment(function(mozPayProviderSpy) {
      test.assertEqual(mozPayProviderSpy.paymentFailed.firstCall.args,
                       ['VERIFY_DENIED']);
    });

    casper.run(function() {
      test.done();
    });

  },
});
