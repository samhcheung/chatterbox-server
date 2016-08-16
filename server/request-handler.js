var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

var fs = require('fs');
var path = require('path');

/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
var initialize = false;
var resultsObject = {results: [{objectId: '0', roomname: 'lobby', username: 'DEFAULT', text: 'DEFAULT'}]};
var objectid = 1;


var requestHandler = function(request, response) {
  if (!initialize) {
    console.log('get here?')
    var dataStorageFile = '';
    fs.readFile(__dirname + '/data.json', function(error, data) {
      dataStorageFile += data;
      var dataStorage = JSON.parse('[' + dataStorageFile + ']' );
      resultsObject = {results: dataStorage};
    }); //
    // setInterval ( fs.writeFile(__dirname + '/data.txt', JSON.stringify(resultsObject.results).slice(1, -1), function(error) {

    // }), 3000)   ;


    initialize = true;
  }
  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/
  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  console.log('Serving request type ' + request.method + ' for url ' + request.url);
  // The outgoing status.
  var statusCode = 200;
  // See the note below about CORS headers.
  var headers = defaultCorsHeaders;

  // Tell the client we are sending them plain text.
  //
  // You will need to change this if you are sending something
  // other than plain text, like JSON or HTML.
  headers['Content-Type'] = 'application/json';

  if ( request.url === '/classes/messages') {
    if (request.method === 'OPTIONS') {
      response.writeHead(statusCode, headers);
      response.end();
    } else if (request.method === 'GET') {

      response.writeHead(statusCode, headers);
      response.end(JSON.stringify(resultsObject));
    } else if (request.method === 'POST') {
      statusCode = 201;
      response.writeHead(statusCode, headers);
      var requestBody = '';
      request.on('data', function (data) {
        requestBody += data;
        // fs write to the file
      });
      request.on('end', function() {
        var newMessageObj = JSON.parse(requestBody);
        newMessageObj['objectId'] = objectid;
        objectid++;
        resultsObject.results.push(newMessageObj);
        fs.appendFile(__dirname + '/data.json', ',' + JSON.stringify(newMessageObj), function(error) {
          if (error) {
            console.log('error appendFile');
          } else {
            console.log('success appendFile')
          }
        });
        response.end(JSON.stringify(resultsObject));
      });
    } //end else for POST

  } else if ( request.url === '/index' || request.url === '/' || request.url.indexOf('?') !== -1 ) {
    if (request.method === 'OPTIONS') {
      response.writeHead(statusCode, headers);
      response.end();
    } else if ( request.method === 'GET') {

      fs.readFile(__dirname + '/../client/index.html', function(error, data) {
        headers['Content-Type'] = 'text/html';

        response.writeHead(statusCode, headers);
        response.write(data);
        response.end();
      });
    }
  } else {
    var filePath = __dirname + '/../client' + request.url;

    var extname = path.extname(filePath);
    fs.exists(filePath, function(exists) {
      if (exists) {
        fs.readFile(filePath, function(error, data) {
          if (error) {
            response.writeHead(500, headers);
            response.end();
          } else {
            console.log('at end extname', extname)
            if ( extname === '.js' ) {
              headers['Content-Type'] = 'text/javascript';
            } else if (extname === '.css') {
              headers['Content-Type'] = 'text/css';
            }
            console.log('headers', headers['Content-Type']);
            console.log('extname before write', extname)
            response.writeHead(statusCode, headers);
            response.write(data);
            response.end();
          }
        }); //fs.readFile
      } else {
        statusCode = 404;
        response.writeHead(statusCode, headers); 
        response.end();
      }

    });

    // statusCode = 404;
    // response.writeHead(statusCode, headers);
    // response.end(JSON.stringify(resultsObject));
  }

  // response.writeHead(statusCode, headers);

  // //console.log(response);

  // // Make sure to always call response.end() - Node may not send
  // // anything back to the client until you do. The string you pass to
  // // response.end() will be the body of the response - i.e. what shows
  // // up in the browser.
  // //
  // // Calling .end "flushes" the response's internal buffer, forcing
  // // node to actually send all the data over to the client.
  // console.log(resultsObject);
  // response.end(JSON.stringify(resultsObject));
};



exports.requestHandler = requestHandler;
// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.



  // .writeHead() writes to the request line and headers of the response,
  // which includes the status and all headers.

  // if (request.method === 'POST') {
  //   var requestBody = '';
  //   request.on('data', function(data) {
  //     requestBody += data;
  //   });
  //   request.on('end', function() {
  //     console.log(requestBody)
  //     response.writeHead(statusCode, headers);      
  //     response.end(JSON.stringify(requestBody));
  //   });
  // }
