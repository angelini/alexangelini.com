While working with Node.js, I often find myself building very distributed systems. I build a set of tools to accomplish my problem and let them all communicate to each other over HTTP or TCP. This kind of architecture works really nicely, but is not without it's flaws. One that really bugged me was log analysis. When I worked for Touchtunes we collected so much great information by simply parsing the huge log collection anytime we needed to answer a question, but with a distributed architecture we have logs scattered all over the place, and collecting them all then parsing them is something I really wanted to automate and improve upon.

First of all, I would like to point out other great solutions out there. Namely Nodejitsu's winston/Hook.io combination, which works really well. My only problem with it was that it involves integrating winston into your Node application, which in turn means it only works with Node. As I wanted to monitor logs from many tools (eg. Python, Apache, Nginx and Node) I needed something a little more flexible.

So I built [Lozigo](https://github.com/SoapyIllusions/lozigo) a really easy to install and set up application which provides a client and server. The client is used by simply calling `lozigo /path/to/conf.json`, it will pipe the output of your system's tail command over TCP to your own lozigo server. This was a simple solution which really shines with Node (as it took about 200 lines of code to write the server and client). Here is an example of what the client configuration can look like:

    {
      "client_name": "Example",
      "server_port": "8181",
      "logs": [
        { "name": "First Log",
          "path": "/Users/alexangelini/Local/lozigo/examples/log1.txt" },
        { "name": "Second Log",
          "path": "/Users/alexangelini/Local/lozigo/examples/log2.txt" }
      ]
    }

As for a logging server it needs to be very generic. Some people may choose to send e-mails when certain keywords appear, other may choose to parse and store information in a database, and some may even choose to build a live metrics page displaying results from the logs. However, most people want to do a combination of those things. This is why the server was built just like connect/Express, using a middleware system. For example:

    var lozigo = require('lozigo');
    var app = lozigo.createServer();

    app.use(lozigo.keywords());

    app.use(function(entry, acc, next) {
      console.log('Current entry-->', entry);
    });

    app.listen(8181, function() {
      console.log('Listening on: ' + PORT);
    });

The functions in the middleware receive three arguments. The entry is the log line and associates meta-data received over TCP, the accumulator which is where parse information is stored, and next which is the next middleware to be called.

A few example middlewares are already available including a keyword parser and a backup logger. I will be at a hackathon this weekend and hope to build a few more example middlewares, including a database abstraction and integration with connect.

I would love to hear what you think about the project and if there are any middlewares that you could see being useful, and please try it out with `npm install lozigo` or fork it at [https://github.com/SoapyIllusions/lozigo](https://github.com/SoapyIllusions/lozigo)