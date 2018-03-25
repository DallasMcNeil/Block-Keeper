/**
 * [jQuery-clickout]{@link https://github.com/emn178/jquery-clickout}
 *
 * @version 0.1.3
 * @author Chen, Yi-Cyuan [emn178@gmail.com]
 * @copyright Chen, Yi-Cyuan 2015-2017
 * @license MIT
 */
(function ($) {
  'use strict';

  var KEY = 'jquery-clickout';
  var SELECTOR = ':' + KEY;
  var observations = $();

  $.expr[':'][KEY] = function (element) {
    return !!$(element).data(KEY);
  };

  function onClickDocument(e) {
    observations = observations.filter(SELECTOR);
    observations.each(function (index, element) {
      if (element !== e.target && !$.contains(element, e.target)) {
        var handlers = $(element).data(KEY);
        for (var i = 0;i < handlers.length;++i) {
          handlers[i].call($(element), $.Event('clickout', { target: e.target }));
        }
      }
    });
  }

  function bind(handleObj) {
    var element = $(this);
    var handlers = element.data(KEY);
    if (!handlers) {
      handlers = [];
      element.data(KEY, handlers);
      observations = observations.add(element);
    }
    handlers.push(handleObj.handler);
  }

  function unbind(handleObj) {
    var handlers = $(this).data(KEY);
    if (!$.isArray(handlers)) {
      return;
    }
    handlers.splice(handlers.indexOf(handleObj.handler), 1)
    if (!handlers.length) {
      $(this).removeData(KEY);
    }
  }

  $.event.special.clickout = { add: bind, remove: unbind };

  $(document).bind('click touchend', onClickDocument);

  $(document).on('page:before-unload', function (e) {
    observations.each(function () {
      $(this).unbind('clickout');
    });
  });

  $.fn.clickout = function (data, fn) {
    return arguments.length > 0 ? this.bind('clickout', data, fn) : this.trigger('clickout');
  };
})(jQuery);
