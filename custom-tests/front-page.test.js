describe('Basic pages', function() {
    it('check the front page loads', function(browser) {
      browser
        .navigateTo('http://localhost:3000')   // Navigates to the front page
        .waitForElementVisible('body');       // Waits for the <body> element to be visible
    });
});

