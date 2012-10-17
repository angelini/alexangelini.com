jQuery(function($) {
  $('time.timeago').timeago();

  var $bar = $('.bar');
  var $spacer = $('<div />', {
    class: 'bar-spacer',
    height: $bar.height()
  });

  var hoverFlag = false;

  var addFix = function() { $bar.addClass('fix').before($spacer); }
  var removeFix = function() { $bar.removeClass('fix');
                               $spacer.remove(); }

  $bar.hover(function() { hoverFlag = true; },
             function() { hoverFlag = false; });

  $(document).scroll(function() {
    var below = $(this).scrollTop() >= $bar.height() - 10;

    if ($bar.hasClass('fix')) {
      if (!below) {
        if (hoverFlag) {
          $bar.one('mouseout', removeFix);
        } else {
          removeFix();
        }
      }
    } else if (below) {
      addFix();
    }
  });
});