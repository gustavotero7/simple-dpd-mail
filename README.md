# dpd-mail
Simple integration of nodemailer with deployd.

# Install 
`npm install dpd-mail --save`

# Usage
Go to your dashboard and create Mail resource and enter the requested info.

* host: Host name of your SMTP provider. Defaults to 'localhost'.
* port: Port number of your SMTP provider. Defaults to 25
* ssl: Use SSL.
* username: SMTP username.
* password: SMTP password.
* defaultFromAddress: Optional; if not provided you will need to provide a 'from' address in every request.
* internalOnly: Only allow internal scripts to send email.
* secret: secret key or password to make external requests, only for external calls, will be ignored for internal calls

To send an email just call the post method of the mail resource you have created.

```javascript
dpd.mail.post({
  from: '"FROM" <no-reply@example>',
  to: 'to@example',
  subject: 'Your subject',
  html: '<b>Html Content</b>',
  text: 'Text Content',
  secret: 'aisufdy6das827d'
}, function(result, error) {
  console.log(error); //Delete the log calls if you want
  console.log(result);
});
```
Change *mail* with your resource name.

# Support
For any help post an issue or write to gustavo@chimera.digital
