var helpers = require('../helpers');

helpers.startCasper({
  sinon: {
    consumeStack: true
  },
  setUp: function(){
    // As consumeStack is true, responses added with respondWith will be consumed in order.
    helpers.fakeLogout();
    helpers.fakeVerification();
    helpers.fakeStartTransaction();
    helpers.fakePinData({data: {pin: true}});
    helpers.fakePinData({data: {pin: true}, method: 'POST', statusCode: 200, url:'/mozpay/v1/api/pin/check/'});
    helpers.fakeWaitPoll({type: 'start', statusData: 3});
    helpers.fakeWaitPoll({type: 'start', statusData: 4});
  },
});

casper.test.begin('Test wait to start polling failed status.', {
  test: function(test) {

    helpers.doLogin();

    casper.waitForUrl(helpers.url('enter-pin'), function() {
      test.assertVisible('.pinbox', 'Pin entry widget should be displayed');
      this.sendKeys('.pinbox', '1234');
      test.assertExists('.cta:enabled', 'Submit button is enabled');
      this.click('.cta');
    });

    casper.waitForSelector('.throbber', function() {
      // Progress will be shown as we are returning a non-pending state for the first request.
      test.assertVisible('.progress', 'Check progress is shown on wait-to-start');
    });

    casper.waitForSelector('.full-error', function() {
      helpers.assertErrorCode('TRANS_FAILED');
    });

    casper.run(function() {
      test.done();
    });
  },
});
