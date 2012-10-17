At the #hackmtl hackathon [hackmtl.github.com](http://hackmtl.github.com/) held this weekend at Montreal's [Notman House](http://notman.org/en/), I was able to work on some new middlewares for Lozigo. If you have not read the article about Lozigo, be sure to [check it out](http://alexangelini.com/#posts/YnT2n54LCdE). The middleware I built is a web interface to be able to watch all my production logs in a single browser window. I used to do this with an iTerm instance split in 8 and each connected to a different machine, but as you can imagine it wasn't very pretty and I rarely noticed when something went wrong.

The project is open-source and hosted on github at: [https://github.com/SoapyIllusions/lozigo-web](https://github.com/SoapyIllusions/lozigo-web). I think it is a really great demonstration of how simple a middleware system can make your code. The entire Node.js server is only 30 lines long:

    // Constants
    var BACKUP = 'backup.txt';

    // Requires
    var connect = require('connect');
    var lozigo = require('lozigo');

    // Connect Server
    var app = connect.createServer();
    app.use(connect['static'](__dirname));
    app.use(connect.favicon());
    app.listen(3010);

    // Lozigo Server
    var logs = lozigo.createServer();
    logs.use(lozigo.keywords());

    logs.use(lozigo.logger({
      file_path: BACKUP,
      include_meta: false,
      log_title: true
    }));

    logs.use(function(entry, acc, next) {
      acc.web = entry;
      acc.web.keywords = acc.keywords;
      next(entry, acc);
    });

    logs.connect(app, BACKUP);
    logs.listen(3020);

And really all it does is create a static file server using connect, sets up a lozigo server and connects the two together. When you call lozigo.connect() it will spin up a socket.io instance which will emit a 'lozigo' event along with any information included in the acc['web']. Then client side I have simple backbone.js application which interprets these events and prints them on the screen. I also added the keywords array to acc['web'] to allow me to build a client-side notification system anytime the word error appeared in the array. This allows me to leave the lozigo-web tab open while I work and refer back to it anytime it picks up an error.

I also added a very simple search function to the client. Anytime there is a 'search' message sent over socket.io, the server will run a grep on the search file and return the results. My search file in this case is an accumulation of all the log data from any server. This allows me to very quickly run a search across every connected log, something that was a real pain beforehand. The interface for how the search works is extremely trivial right now, as it was thrown together at an 8-hour hackathon, but I plan on improving it in the near future.

I hope this tool can help others in the same way it has helped me, and be sure to contact me if you have any features you would love to see added.

Also if you are looking to work full time in Node.js be sure to check out Wavo.me, [they are hiring](http://blog.wavo.me/wavo-me-seeks-developers/)