#Quiz app for preschoolers

#To run:
```
npm install
gulp
```
#To make a minified build:
```
gulp dist
```
#Features:
1. Offline first web app (uses service worker)
2. Send push notification using GCM
3. Installs to home screen
4. Uses speech synthesis api so young users don't have to read

#To test for push notification:
1. Click on the "parents" link in the landing page and click on the "Subscribe" button.
2. Visit https://mangalambigai.github.io/quiz/#/pushtest.
3. Copy the curl command and run it in your terminal.
4. You should see the notification even if the page is not open. If the browser is not open, the notification should show up next time when you open the browser.