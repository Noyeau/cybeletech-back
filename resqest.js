const https = require('https');

https.get('https://comp123_antony:q9KSFxjMb7s3Z@api.meteomatics.com/2020-04-15T00:00:00ZP7D:P1D/t_2m:C,relative_humidity_2m:p/france:100x100/json', (resp) => {
  let data = '';

  // A chunk of data has been recieved.
  resp.on('data', (chunk) => {
    data += chunk;
  });

  // The whole response has been received. Print out the result.
  resp.on('end', () => {
    console.log(JSON.parse(data));
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});