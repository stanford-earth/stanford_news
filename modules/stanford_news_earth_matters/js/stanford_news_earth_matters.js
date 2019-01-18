(function ($) {

  /**
   * Set active class on Views AJAX filter.
   *
   * On selected category.
   */
  Drupal.behaviors.EarthMatters = {
    attach: function (context, settings) {

      var view = $('.earth-matters-listing.news-list', context);
      $(".masonry-blocks", context).masonry({});

      $(context).imagesLoaded()
        .progress( function( instance ) {
          $(".masonry-blocks", context).masonry('layout');
        });

      /**
       * Set the view filter value in the select.
       */
      function setFilter(value, filter) {
        filter.val(value);
        $(filter).trigger('change');
        refreshViews();
      }

      /**
       * Clean the string to make a url friendly string.
       */
      function cleanString(string) {
        string = string.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase().replace(' ', '-');
        while (string.indexOf('--') != -1) {
          string = string.replace('--', '-');
        }
        return string;
      }

      /**
       * Remove empty values in array like array_filter() in PHP.
       */
      function cleanArray(actual) {
        var newArray = [];
        for (var i = 0; i < actual.length; i++) {
          if (actual[i]) {
            newArray.push(actual[i]);
          }
        }
        return newArray;
      }

      /**
       * Reload the view contents.
       */
      function refreshViews() {
        var views = settings.views.ajaxViews;
        $.each(views, function (i, view) {
          var dom_id = view.view_dom_id;
          var selector = '.js-view-dom-id-' + dom_id;
          var args = [];
          if ($(selector).find('select').val()) {
            args = $(selector).find('select').val().join('+');
          }
          settings.views.ajaxViews['views_dom_id:' + dom_id].view_args = args;
          $(selector).triggerHandler('RefreshView');
          $(selector).masonry('layout');
        });
      }

      /**
       * Set the filter click listener.
       */
      function setFilterClick(element, view) {
        if ($(element).hasClass('filterClickProcessed')) {
          return;
        }

        $(element).on('click', function (e) {
          e.preventDefault();
          $(this).parent().toggleClass('active');

          var tid = $(this).attr('data-tid');
          if (!tid) {
            tid = $(this).attr('rel');
          }
          var filter = $(view).find('select');
          setPushState($(this).text());

          setFilter(tid, filter);
        }).addClass('filterClickProcessed');
      }

      /**
       * Push the new url with new filters to the browser.
       */
      function setPushState(string) {
        string = cleanString(string);
        if (string !== "all") {
          var current_path = "/earth-matters/" + string;
        }
        else {
          var current_path = "/earth-matters";
        }
        history.pushState(null, null, current_path + window.location.search + window.location.hash);
      }

      // Creates the click event on each item in order to filter by group.
      $(view).find('a.filter-tab, .masonry-block__tags .tag-item').each(function () {
        setFilterClick(this, view);
      });
    },

    /**
     * Set active classes based on the arguments from the view.
     */
    setActives: function () {
      $.each(Drupal.views.instances, function (i, view) {
        if (view.settings.view_args) {
          $.each(view.settings.view_args.split('+'), function (j, value) {
            $('a[data-tid="' + value + '"]').parent().addClass('active');
            $('a[rel="' + value + '"]').addClass('active');
          })
        }
        else {
          $('a[data-tid="0"]').parent().addClass('active');
        }
      });
    }

  };

  $(document).ajaxComplete(Drupal.behaviors.EarthMatters.setActives);
  Drupal.behaviors.EarthMatters.setActives();

})(jQuery);
