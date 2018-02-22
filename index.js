var Resource = require('deployd/lib/resource'),
  util = require('util'),
  nodemailer = require('nodemailer'),
  smtpTransport = require('nodemailer-smtp-transport')


function Mail(name, options) {
  Resource.apply(this, arguments);

  var authParams = null;
  //If an empty string needs to be passed as username, use the environment variable
  if (this.config.username !== '') {
    authParams = {
      user: this.config.username,
      pass: this.config.password
    };
  }

  this.transport = nodemailer.createTransport(smtpTransport({
    host: this.config.host || "localhost",
    port: parseInt(this.config.port, 10) || 25,
    secure: this.config.ssl,
    auth: authParams,
    requireTLS: true,
    tls: {
      rejectUnauthorized: false
    }
  }));



  //this.transport.use('compile', htmlToText({}) );
}
util.inherits(Mail, Resource); //aplicar herencia al recurso
module.exports = Mail; //generar el recurso

Mail.prototype.clientGeneration = true; //habilitar al cliente para generar el recurso


//Se crea el panel de control con los campos para guardar en configuracion
Mail.basicDashboard = {
  settings: [{
    name: 'host',
    type: 'text',
    description: 'Host name of your SMTP provider. Defaults to \'localhost\'.'
  }, {
    name: 'port',
    type: 'number',
    description: 'Port number of your SMTP provider. Defaults to 25'
  }, {
    name: 'ssl',
    type: 'checkbox',
    description: 'Use SSL.'
  }, {
    name: 'username',
    type: 'text',
    description: 'SMTP username.'
  }, {
    name: 'password',
    type: 'text',
    description: 'SMTP password.'
  }, {
    name: 'defaultFromAddress',
    type: 'text',
    description: 'Optional; if not provided you will need to provide a \'from\' address in every request'
  }, {
    name: 'internalOnly',
    type: 'checkbox',
    description: 'Only allow internal scripts to send email'
  }, {
    name: 'secret',
    type: 'text',
    description: 'secret key or password to make external requests, only for external calls, will be ignored for internal calls'
  }, {
      name: 'async',
      type: 'checkbox',
      description: 'make the email request asynchronous'
    }]
};


Mail.prototype.handle = function(ctx, next) { //Comportamiento al llamar funcion

  if (ctx.req && ctx.req.method !== 'POST') {
    return next();
  }


  //check for internal only flag
  if (!ctx.req.internal && this.config.internalOnly) {
    return ctx.done({
      statusCode: 403,
      message: 'Forbidden'
    });
  }

  //check for secretKey
  if (this.config.secret !== ctx.body.secret && !ctx.req.internal) {
    {
      return ctx.done({
        statusCode: 401,
        message: 'Unauthorized: Access is denied due to invalid credentials'
      });
    }
  }


  var options = ctx.body;
  options.from = options.from || this.config.defaultFromAddress;

  var errors = {};
  if (!options.to) {
    errors.to = '\'to\' is required';
  }
  if (!options.from) {
    errors.from = '\'from\' is required';
  }
  if (!options.text && !options.html) {
    errors.text = '\'text\' or \'html\' is required';
  }

  if (Object.keys(errors).length) {
    return ctx.done({
      statusCode: 400,
      errors: errors
    });
  }

  // trim
  options.subject = options.subject.trim();
  options.text = options.text.trim();

  var that = this;

  that.transport.sendMail(
    options,
    function(err, response) {
      if (err) {
        console.log(err)
        return ctx.done(err);
      }
      ctx.done(null, {
        message: response.message
      });
    }
  );
  
  if(this.config.async) {
    ctx.done(null, {
      message: 'email is queued for sending'
    });
  }

}
