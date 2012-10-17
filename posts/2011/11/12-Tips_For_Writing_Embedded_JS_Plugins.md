So today I wrote my first embedded javascript plugin for bloggers using Wavo.me technology, and I would like to share some things I learned.

###Inject your main Javascript file.

Your main embed code should be short and sweet, you don't want bloggers to be copying in 1,500 lines of Javascript to get your pretty picture wheel, just put the code necessary to load up your plugin. The simplest form is how Disqus does it:

    (function() {
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'http://my.cool.picture.wheel.js'

      var holder = document.getElementsByTagName('script')[0]
      holder.parentNode.insertBefore(script, holder);
    })();

Within that script all your application logic should be included. You should also have your CSS injection code (much like the Javascript injection code) in that file to add your own styles for your plugin. Be sure to namespace your CSS rules as to not crush something on the host site.

###Give the user a hook div

If you would like your users to choose whereabout on the page your plugin will be, include a div in your embed code so they can simply copy paste it anywhere in their HTML. If there will be only one instance of your plugin, feel free to use an ID for the hook div, but be careful, as Disqus is limited to one instance a page because of this, and sometimes people want more than one instance.

###Use HTML5 data attributes for options

The Wavo.me plugin can appear many times on a page and each instance has different options. Using HTML5 data options, users can simply add data-wavo-height="50" to the hook div and the plugin will be 50 pixels wide. Remember to make most, if not all these options completely optional, with some sane defaults, for example:

var width = $(this).data('wavo-width') || 60;

###Do not re-inject common JS scripts

The Wavo.me plugin needs jQuery as it needs to do Ajax calls on any browser, as well as use custom events, and re-implementing all that can be long and painful. As jQuery is included on about 38% of websites chances are they may already have it loaded. I implemented it in the following manner:

    function loadEmbed() {
      // Do not load the script twice
      if(!window._wavo_loaded) {
        loadParallel('wavo-embed.js', 'text/javascript', true, function() {
          window._wavo_loaded = true;
        });
      }
    }

    if(!window.jQuery) {
      loadParallel('https://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js', loadEmbed);
    } else {
      loadEmbed();
    }

This code is using the loadEmbed function from my last post to load scripts asynchronously and call a callback.

###Do not load your code twice

As you may have noticed in the past piece of code, I set a global variable to true when my script is loaded. I do this because most bloggers will simply copy paste your embed code multiple times on a page which can really start to become a problem.

That's all I came across today. If you made it this far thanks for reading.