"use strict";

(function ($, window) {
  "use strict";
  var wb;
  wb = {
    setup: {
      test: function test() {
        return true;
      },
      run: function run() {
        wb.w_width = $(window).width();
        wb.w_height = $(window).height();
        wb.breakpoints = {};
        wb.breakpoints.xsmall = 0;
        wb.breakpoints.small = 560;
        wb.breakpoints.medium = 1000;
        wb.breakpoints.large = 1280;
        wb.breakpoints.xlarge = 1440;
        wb.touch_test = Modernizr.touch;
      }
    },
    insights_subcribe: {
      test: function test() {
        return $(".insights-popup").length;
      },
      run: function run() {
        var subscribe_status = Cookies.get("subscribe_status");

        if (!(subscribe_status === "subscriber" || subscribe_status === "postponed")) {
          setTimeout(function () {
            $(".insights-popup").show();
          }, 5000);
        }

        $(".close-insights-popup").click(function () {
          $(".insights-popup").hide();
          Cookies.set("subscribe_status", "postponed", { expires: 7 });
        });
      }
    },
    workScroll: {
      test: function test() {
        return $(".work__featured-case-studies").length && !Modernizr.touch;
      },
      run: function run() {
        var $w = $(window),
            case_study_images = $(".case-study-header>.case-study-header__img"),
            case_study_content = $(".case-study-header>.case-study-header__inner"),
            case_study_bar = $(".case-study__location-bar"),
            indicator = $(".case-study__indicator"),
            iquad = $(".i-quad");
        function handleScroll() {
          var sTop = $w.scrollTop();
          var panelLocation = sTop / wb.w_height;
          case_study_images.each(function (i, el) {
            var loc = panelLocation - i;
            $(el).css({
              "transform": "translateY(" + loc * 40 + "%) scale(" + (1 + Math.max(0, loc * .2)) + ") translateZ(0)"
              // "opacity" : `${(100 - (Math.max((loc - .3), 0) * 80)) / 100}`
            });
            $(el).next().css({
              "opacity": "" + (0 + Math.max(loc - .3, 0) * 80) / 100
            });
          });
          case_study_content.each(function (i, el) {
            var loc = panelLocation - i;
            $(el).css({
              "opacity": "" + (1.9 - loc * 3),
              "transform": "translate3d(0, -" + (loc * 80 + 100) + "%, 0)"
            });
          });
          // case_study_bar.css({
          //   height : `${panelLocation * 33.333}%`
          // });
          indicator.removeClass("currIndex-0 currIndex-1 currIndex-2").addClass("currIndex-" + Math.floor(panelLocation + .8));
          if (panelLocation >= 2.5) {
            iquad.addClass("animate");
          } else {
            iquad.removeClass("animate");
          }
        }
        $w.on("scroll", function () {
          window.requestAnimationFrame(handleScroll);
        }).trigger("scroll");
      }
    },
    load_bg_images: {
      test: function test() {
        return $("[data-bg-image-xsmall], [data-bg-image-small], [data-bg-image-medium], [data-bg-image-large], [data-bg-image-full]").length;
      },
      run: function run() {
        $("[data-bg-image-small]").each(function (i, e) {
          // xsmall = 0, small = 560, medium = 1000, large = 1280, full = 1920
          var image_xsmall = $(e).attr("data-bg-image-xsmall"),
              image_small = $(e).attr("data-bg-image-small"),
              image_medium = $(e).attr("data-bg-image-medium"),
              image_large = $(e).attr("data-bg-image-large"),
              w_width = $(window).width();

          if (w_width > 1440 && image_large) {
            $(e).css("background-image", "url(" + image_large + ")");
          } else if (w_width > 1024 && image_medium) {
            $(e).css("background-image", "url(" + image_medium + ")");
          } else if (w_width > 640 && image_small) {
            $(e).css("background-image", "url(" + image_small + ")");
          } else if (image_xsmall) {
            $(e).css("background-image", "url(" + image_xsmall + ")");
          }
        });
      }
    },
    load_images: {
      test: function test() {
        return $("[data-image-xsmall], [data-image-small], [data-image-medium], [data-image-large], [data-image-full]").length;
      },
      run: function run() {
        $("[data-image-xsmall]").each(function (i, e) {
          // small = 600, medium = 1000, large = 1440, full = 1920
          var image_xsmall = $(e).attr("data-image-xsmall"),
              image_small = $(e).attr("data-image-small"),
              image_medium = $(e).attr("data-image-medium"),
              image_large = $(e).attr("data-image-large"),
              w_width = $(window).width();

          if (w_width > 1440 && image_large) {
            $(e).attr("src", image_large);
          } else if (w_width > 1000 && image_medium) {
            $(e).attr("src", image_medium);
          } else if (w_width > 600 && image_small) {
            $(e).attr("src", image_small);
          } else if (image_xsmall) {
            $(e).attr("src", image_xsmall);
          }
        });
      }
    },
    full_screen: {
      test: function test() {
        return wb.w_width >= wb.breakpoints.medium && $(".full-screen").length;
      },
      run: function run() {
        wb.w = $(window).width();
        wb.h = $(window).height();
        $(".full-screen").css({ "width": wb.w, "height": wb.h });
      }
    },
    nav_trigger: {
      test: function test() {
        return true;
      },
      run: function run() {
        var body = $("body");
        var html = $("html");
        var nav_drawer = $(".nav-drawer-wrap");
        var click_event = wb.touch_test ? "touchstart" : "click";
        $(document).on(click_event, ".nav-trigger", function (e) {
          e.preventDefault();
          html.toggleClass("no-scroll");
          body.toggleClass("nav-active");

          if (nav_drawer.hasClass("put-me-on-top")) {
            setTimeout(function () {
              nav_drawer.removeClass("put-me-on-top");
            }, 400);
          } else {
            nav_drawer.addClass("put-me-on-top");
          }
        });
      }
    },
    resize: {
      test: function test() {
        if (wb.w_width >= wb.breakpoints.medium && $(".full-screen").length) {
          return true;
        }
      },
      run: function run() {
        $(window).on("resize", function () {
          wb.full_screen.run();
        });
      }
    },
    scroller: {
      test: function test() {
        return true;
      },
      run: function run() {
        $("body").on("click", "[data-scroll-target]", function (e) {
          e.preventDefault();
          var target = $($(this).attr("data-scroll-target"));
          var scroll_distance = target.offset().top - 40;
          $("body, html").animate({ scrollTop: scroll_distance }, 500);
        });
      }
    },
    scroll_checker: {
      test: function test() {
        // return !Modernizr.touch;
        return true;
      },
      run: function run() {
        wb.s_top = 0;
        var footerOffset = $(".footer__wrap").offset().top,
            windowHeight = $(window).height();

        $(window).on("scroll", function () {
          wb.s_top = $(window).scrollTop();

          if (wb.s_top > 300) {
            $("body").addClass("scrolled");
          } else {
            $("body").removeClass("scrolled");
          }

          if (wb.s_top > footerOffset - windowHeight && !$(".work-with-us").hasClass("no-show")) {
            $(".work-with-us").addClass("no-show");
          } else if ($(".work-with-us").hasClass("no-show")) {
            $(".work-with-us").removeClass("no-show");
          }
        });
      }
    },
    build_share_urls: {
      test: function test() {
        return true;
      },
      run: function run() {
        $("[data-share-platform='pinterest']").each(function (i, e) {
          var share_image;
          if ($(e).attr("data-share-image") !== false) {
            share_image = encodeURIComponent($(e).attr("data-share-image"));
          }

          var share_msg = document.title;
          if ($(e).attr("data-share-message")) {
            share_msg = $(e).attr("data-share-message");
          }

          var page_url = encodeURIComponent(window.location);
          $(this).attr({
            "href": "http://pinterest.com/pin/create/button/?url=" + page_url + "&media=" + share_image + "&description=" + share_msg
          });
        });

        $("[data-share-platform='facebook']").each(function (i, e) {
          var share_url = $(e).attr("data-share-url");
          if (!share_url) {
            share_url = window.location.href;
          }
          var share_msg = document.title;
          if ($(e).attr("data-share-message")) {
            share_msg = $(e).attr("data-share-message");
          }
          $(e).attr({
            "href": "http://facebook.com/sharer.php?u=" + share_url + "&m=" + encodeURIComponent(share_msg)
          });
        });

        $("[data-share-platform='twitter']").each(function (i, e) {
          var share_msg = document.title;
          if ($(e).attr("data-share-message")) {
            share_msg = $(e).attr("data-share-message");
          }
          var share_url = window.location.href;
          if ($(e).attr("data-share-url")) {
            share_url = $(e).attr("data-share-url");
          }

          var href_string = "http://twitter.com/intent/tweet?text=" + encodeURIComponent(share_msg) + "&amp;url=" + encodeURIComponent(share_url) + "&amp;via=compassion";

          $(e).attr({
            "href": href_string
          });
        });

        $("[data-share-platform='linkedin']").each(function (i, e) {
          var share_msg = document.title;
          var share_url = window.location.href;
          if ($(e).attr("data-share-url")) {
            share_url = $(e).attr("data-share-url");
          }

          $(e).attr({
            "href": "https://www.linkedin.com/shareArticle?mini=true&url=" + encodeURIComponent(share_url) + "&summary=" + encodeURIComponent(share_msg)
          });
        });

        $("[data-share-platform='email']").each(function (i, e) {
          var share_url = $(e).attr("data-share-url");
          if (!share_url) {
            share_url = window.location.href;
          }
          var share_msg = encodeURIComponent(document.title);
          if ($(e).attr("data-share-message")) {
            share_msg = encodeURIComponent($(e).attr("data-share-message"));
          }
          var subject = $(e).attr("data-email-subject");
          if (!subject) {
            subject = "Help save the bees!";
          }
          $(e).attr({
            "href": "mailto:emailaddress@example.com?subject=" + subject + "&body=" + encodeURIComponent(share_msg + "\n \n") + share_url,
            "target": "_blank"
          });
        });
      }
    },
    share_click: {
      test: function test() {
        return $("[data-share-platform]").length;
      },
      run: function run() {
        $("body").on("click", "[data-share-platform]", function (e) {
          e.preventDefault();
          var platform = $(this).attr("data-share-platform");
          var href = $(this).attr("href");

          function open_popup(url) {
            var top_offset = (screen.height - 320) / 2;
            var left_offset = (screen.width - 750) / 2;

            if (platform === "facebook") {
              window.open(url, "Share on Facebook", "status = 1, height = 320, width = 750, resizeable = 0, left = " + left_offset + ", top = " + top_offset);
            } else if (platform === "twitter") {
              window.open(url, "Share on Twitter", "status = 1, height = 320, width = 750, resizeable = 0, left = " + left_offset + ", top = " + top_offset);
            } else if (platform === "pinterest") {
              window.open(url, "Share on Pinterest", "status = 1, height = 320, width = 750, resizeable = 0, left = " + left_offset + ", top = " + top_offset);
            } else if (platform === "email") {
              window.location.href = url;
            }
          }

          open_popup(href);
        });
      }
    },
    video_player_creator: {
      test: function test() {
        return false;
        // only runs when called
      },
      run: function run(e, i) {
        // where $e is the element and i is the id subsector
        // if it"s a touch device
        var mp4_url = $(e).attr("data-video-bg-mpfour");
        // var webm_url = $(e).attr("data-video-bg-webm");
        var poster_url = $(e).attr("data-poster");

        var autoplay = $(e).attr("data-autoplay");

        // var start_play = true;
        var start_play = false;

        var video_loop = true;

        var markup = "";

        markup = "<div class='abs-full'>";
        markup += "<div class='video-container'>";
        markup += "<video id='video-" + i + "' class='full-video' controls>";
        // markup += "<source src=""+webm_url+"" type="video/webm"/>";
        markup += "<source src='" + mp4_url + "' type='video/mp4' />";
        markup += "</video>";
        markup += "</div>";
        markup += "</div>";

        var video_container = $(e);
        video_container.append(markup);

        videojs("video-" + i, { "controls": false, "autoplay": start_play, "preload": "auto", "loop": video_loop, "poster": poster_url, "techOrder": ["html5", "flash"] }, function () {
          // Player (this) is initialized and ready.
          var player = this;
          if (autoplay) {
            player.play();
          }
        });
      }
    },
    video_bgs: {
      test: function test() {
        return $("[data-video-bg-mpfour]").length;
      },
      run: function run() {
        var video_bgs = $("[data-video-bg-mpfour]");

        video_bgs.each(function (i, e) {
          var background = $(e).attr("data-poster");
          var mp4 = $(e).attr("data-video-bg-mpfour");
          if (wb.touch_test === true || mp4 === undefined) {
            // if it"s a touch device
            $(e).css("background-image", "url(" + background + ")");
          } else {
            wb.video_player_creator.run(e, i);
          }
        });
      }
    },
    home_landing_video: {
      test: function test() {
        if (!wb.touch_test && $(".home__landing").length) {
          return true;
        } else {
          return false;
        }
      },
      run: function run() {
        videojs("video-0").ready(function () {
          wb.landing_player = this;
          wb.landing_player.play();
        });
      }
    },
    homeLanding: {
      test: function test() {
        return $(".home__landing").length;
      },
      run: function run() {
        var big_words = $(".home__landing-big-word");

        var phrases = ["<span class='highlight-letter normal'>m</span><span class='highlight-letter normal'>a</span><span class='highlight-letter normal'>k</span><span class='highlight-letter normal'>e</span><span class='highlight-letter'> </span><span class='highlight-letter normal'>i</span><span class='highlight-letter normal'>t</span><span class='highlight-letter'> </span><span class='highlight-letter'>m</span><span class='highlight-letter'>e</span><span class='highlight-letter'>a</span><span class='highlight-letter'>n</span><span class='highlight-letter'>i</span><span class='highlight-letter'>n</span><span class='highlight-letter'>g</span><span class='highlight-letter'>f</span><span class='highlight-letter'>u</span><span class='highlight-letter'>l</span><span class='highlight-letter'>.</span>", "<span class='highlight-letter normal'>m</span><span class='highlight-letter normal'>a</span><span class='highlight-letter normal'>k</span><span class='highlight-letter normal'>e</span><span class='highlight-letter'> </span><span class='highlight-letter normal'>i</span><span class='highlight-letter normal'>t</span><span class='highlight-letter'> </span><span class='highlight-letter'>a</span><span class='highlight-letter'>w</span><span class='highlight-letter'>e</span><span class='highlight-letter'>s</span><span class='highlight-letter'>o</span><span class='highlight-letter'>m</span><span class='highlight-letter'>e</span><span class='highlight-letter'>.</span>", "<span class='highlight-letter normal'>m</span><span class='highlight-letter normal'>a</span><span class='highlight-letter normal'>k</span><span class='highlight-letter normal'>e</span><span class='highlight-letter'> </span><span class='highlight-letter normal'>i</span><span class='highlight-letter normal'>t</span><span class='highlight-letter'> </span><span class='highlight-letter'>l</span><span class='highlight-letter'>a</span><span class='highlight-letter'>s</span><span class='highlight-letter'>t</span><span class='highlight-letter'>.</span>"];

        var active_phrase = 0;

        function play_letters(callback) {
          var element = $(".home__landing-big-word");
          var play_delay = 0;
          var highlight_letters = $(element).find(".highlight-letter");
          highlight_letters.each(function (i, e) {
            play_delay = 60 * i;
            setTimeout(function () {
              $(e).addClass("active");
            }, play_delay);
          });
          setTimeout(function () {
            if (typeof callback === "function") {
              callback();
            }
          }, highlight_letters.length * 60);
        }

        function rewind_letters(callback) {
          var element = $(".highlight__black").first().find(".highlight-text");
          var rewind_time = 0;
          var highlight_letters = $(element).find(".highlight-letter");
          var max_rewind_time = highlight_letters.length * 60;
          highlight_letters.each(function (i, e) {
            rewind_time = i * 60;
            setTimeout(function () {
              // $(e).fadeOut(50);
              $(e).removeClass("active");
            }, rewind_time);
          });
          setTimeout(function () {
            if (typeof callback === "function") {
              callback();
            }
          }, max_rewind_time);
        }

        function change_line_size() {
          // dynamically changes size of yellow highlight line
          var new_phrase_width = $(".home__landing-big-word").width();
          $(".home__landing-phrase .highlight__yellow").css("width", new_phrase_width + "px");
          $(".home__landing-phrase .highlight__yellow__bar").css("width", new_phrase_width * .975 + "px");
        }

        function advance_phrase() {
          var current_phrase = $(".highlight__black").first().find(".highlight-text");
          var current_big_word = $(".home__landing-big-word.active");
          current_big_word.removeClass("active");
          setTimeout(function () {
            rewind_letters(function () {
              current_phrase.html("");
              if (active_phrase === phrases.length - 1) {
                active_phrase = 0;
              } else {
                active_phrase++;
              }
              $(".home__landing-big-word .highlight-text").append(phrases[active_phrase]);
              change_line_size();
              big_words.eq(active_phrase).addClass("active");
              setTimeout(function () {
                play_letters(function () {});
              }, 750);
            });
          }, 500);
        }

        var int;
        function startHomepagePhrases() {
          stopHomepagePhrases();
          int = setInterval(function () {
            advance_phrase(0);
          }, 5000);
        }
        function stopHomepagePhrases() {
          clearInterval(int);
        }

        function playCaseStudyText(text) {
          stopHomepagePhrases();
          var revisedString = "<span class=\"highlight-letter\">";
          for (var i = 0; i < text.length; i++) {
            revisedString += text.slice(i, i + 1) + "</span><span class=\"highlight-letter\">";
          }
          revisedString += "</span>";

          rewind_letters(function () {
            var letterElement = $(".home__landing-big-word .highlight-text");
            letterElement.html(revisedString);
            play_letters();
          });
        }

        function stopCaseStudyText() {
          active_phrase = 2;
          advance_phrase();
          startHomepagePhrases();
        }

        if (!wb.touch && wb.w_width > 1024) {
          videojs("video-1").ready(function () {
            wb.caseStudyPlayer = this;
          });
        }

        $("body").on("mouseenter", ".home__landing", function () {
          wb.pause_screencasts();
          $(".home__case-studies-link").removeClass("active");
          if (wb.landing_player) {
            wb.landing_player.play();
          }
        });

        var clipElement = $(".home__landing-background-overlay--media--image");
        var clipSpeed = 1;
        var clipInt = 100;
        var allowIn = true;
        var allowOut = false;

        function animateClipIn() {
          if (clipInt >= 0 && allowIn === true) {
            allowOut = false;
            setTimeout(function () {
              clipInt--;
              clipElement.css("-webkit-clip-path", "polygon(0% 100%, " + 60 / 100 * clipInt + "% " + clipInt + "%, 100% " + 80 / 100 * clipInt + "%, 100% 100%)");
              animateClipIn();
            }, clipSpeed);
          } else {
            allowOut = true;
          }
        }

        function animateClipOut() {
          if (clipInt <= 100 && allowOut === true) {
            allowIn = false;
            setTimeout(function () {
              clipInt++;
              clipElement.css("-webkit-clip-path", "polygon(0% 100%, " + 60 / 100 * clipInt + "% " + clipInt + "%, 100% " + 80 / 100 * clipInt + "%, 100% 100%)");
              animateClipOut();
            }, clipSpeed);
          } else {
            allowIn = true;
          }
        }

        var showingCaseStudy = false;
        $(".home__landing-background-overlay--media").hover(function () {
          animateClipIn();
          wb.landing_player.pause();
          if (wb.caseStudyPlayer) {
            wb.caseStudyPlayer.play();
          }
        }, function () {
          animateClipOut();
          wb.landing_player.play();
          if (wb.caseStudyPlayer) {
            wb.caseStudyPlayer.pause();
          }
        });

        setTimeout(function () {
          $("body").addClass("ready");
          big_words.first().addClass("active");
          setTimeout(function () {
            setTimeout(function () {
              play_letters();
              startHomepagePhrases();
            }, 1000);
            setTimeout(function () {
              change_line_size();
            }, 500);
          }, 500);
        }, 100);

        setTimeout(function () {
          $("body").addClass("ready-2");
        }, 5000);
      }
    },
    home_active_case_study: {
      test: function test() {
        return $("[data-activate-case-study]").length;
      },
      run: function run() {
        $("body").on("click", "[data-activate-case-study]", function (e) {
          e.preventDefault();
          $("body").addClass("activate-case-study");
        });
      }
    },
    home_case_study_interactions: {
      test: function test() {
        return $(".home__case-studies").length;
      },
      run: function run() {
        var t,
            case_study_links = $(".home__case-studies-link");
        // add index to case study links
        case_study_links.each(function (i, e) {
          $(e).attr("data-index", i);
        });

        function pause_screencasts() {
          // pause any playing screencast video
          case_study_links.each(function (i, e) {
            var el = $(e);
            var player_id = $(el).find("video").first().attr("id");
            videojs(player_id).pause();
          });
        }

        wb.pause_screencasts = pause_screencasts;

        function play_this_screencast(element) {
          // pause the landing video
          if (wb.caseStudyPlayer) {
            wb.caseStudyPlayer.pause();
          }

          // pause screencasts
          pause_screencasts();

          // wait half a second and play this screencast
          setTimeout(function () {
            var this_video = $(element).find("video").first().attr("id");
            var player = videojs(this_video);
            player.play();
          }, 500);
        }

        case_study_links.each(function (i, e) {
          var el = $(e);
          var bg_url = el.attr("data-bg-poster");
          $(".home__case-studies-backgrounds").append("<div class='home__case-studies-background' style='background-image: url(" + bg_url + ");'></div>");
        });

        function change_bg(i) {
          $(".home__case-studies-background").removeClass("active");
          setTimeout(function () {
            $(".home__case-studies-background").eq(i).addClass("active");
          }, 10);
        }

        function change_endorsement(i) {
          $(".home__case-studies__endorsement").fadeOut(250, function () {
            setTimeout(function () {
              $(".home__case-studies__endorsement").eq(i).fadeIn(300);
            }, 350);
          });
        }

        $("body").on("mouseenter", ".home__case-studies-link", function () {
          var el = $(this);
          case_study_links.removeClass("active");
          el.addClass("active");
          play_this_screencast(this);
          //var bg_url = $(this).attr("data-bg-poster");
          clearTimeout(t);
          t = setTimeout(function () {
            change_bg(el.attr("data-index"));
            change_endorsement(el.attr("data-index"));
          }, 10);
        });

        $("body").on("mouseleave", ".home__case-studies-link", function () {
          clearTimeout(t);
        });
      }
    },
    // homeFeaturedCaseStudyTransition: {
    //   test: function () {
    //     return $(".home__landing").length;
    //   },
    //   run: function () {
    //     $("body").on("click", ".home__landing-link", function(e){
    //       e.preventDefault();
    //       wb.caseStudyPlayer.pause();
    //       $("body").addClass("case-study-transition");
    //     });
    //   }
    // },
    save_the_orphans: {
      test: function test() {
        return $("[data-save-the-orphans]").length;
      },
      run: function run() {
        $("[data-save-the-orphans]").each(function (ind, e) {
          var num_words = $(e).attr("data-save-the-orphans");
          var text = $(e).text();
          for (var i = num_words; i > 0; i--) {
            var last_space_pos = text.lastIndexOf(" ");
            if (last_space_pos >= 0) {
              text = text.substr(0, last_space_pos) + "&nbsp;" + text.substr(last_space_pos + 1, text.length);
            }
          }
          $(e).html(text);
        });
      }
    },
    office_slider: {
      test: function test() {
        return $(".office-gallery-slider").length;
      },
      run: function run() {
        $(".office-gallery-slider").slick({
          infinite: true,
          autoplay: true,
          autoplayspeed: 3000,
          speed: 1500,
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: true
        });
      }
    },
    values_slider: {
      test: function test() {
        return $(".values-slider").length;
      },
      run: function run() {
        $(".values-slider").slick({
          infinite: false,
          centerPadding: "0",
          asNavFor: ".values-title-slider"
        });
        $(".values-title-slider").slick({
          slidesToShow: 4,
          slidesToScroll: 1,
          asNavFor: ".values-slider",
          responsive: [{
            breakpoint: 767,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1,
              infinite: false,
              centerMode: true,
              centerPadding: "80px"
            }
          }]
        });

        // On before slide change
        $(".values-slider").on("beforeChange", function (event, slick, currentSlide, nextSlide) {
          $(".values-title-slider .values-title").removeClass("values-title--active");
          $(".values-title-slider .values-title:nth-child(" + (nextSlide + 1) + ")").addClass("values-title--active");
        });

        $(".values-title-slider .values-title").on("click", function () {
          $(".values-slider").slick("slickGoTo", $(this).index());
        });
      }
    },
    news_slider: {
      test: function test() {
        return $(".news-slider").length;
      },
      run: function run() {

        $(".news-slider").on("init", function (slick) {
          var thisHeight = $(".news-slider").height();

          $(".news-slider .slick-slide").each(function () {
            $(this).height(thisHeight);
          });
        });

        $(".news-slider").slick({
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: false,
          dots: true,
          responsive: [{
            breakpoint: 959,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 2
            }
          }, {
            breakpoint: 767,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1
            }
          }]
        });
      }
    },
    team_member_slider: {
      test: function test() {
        return $(".team-member-slider").length;
      },
      run: function run() {
        $(".team-member-slider").slick({
          slidesToShow: 1,
          infinite: false,
          centerMode: true,
          centerPadding: "160px",
          arrows: true,
          prevArrow: "<div class='slick-prev slider-nav'><i class='fa fa-angle-left'></i></div>",
          nextArrow: "<div class='slick-next slider-nav'><i class='fa fa-angle-right'></i></div>",
          responsive: [{
            breakpoint: 959,
            settings: {
              centerPadding: "60px"
            }
          }, {
            breakpoint: 767,
            settings: {
              centerPadding: "40px"
            }
          }, {
            breakpoint: 559,
            settings: {
              centerPadding: "20px"
            }
          }]
        });

        $(".team-grid-item").on("click", function () {
          $("html").addClass("no-scroll");
          $(".team-bio-modal").addClass("team-bio-modal--open");
          $(".team-member-slider").slick("slickGoTo", $(this).index());
          $(".nav-trigger").toggle();
          $(".nav--social-icons").toggle();
          $(".work-with-us").addClass("no-show");
        });

        $(".team-bio-modal--close").on("click", function () {
          $("html").removeClass("no-scroll");
          $(".team-bio-modal").removeClass("team-bio-modal--open");
          $(".nav-trigger").toggle();
          $(".nav--social-icons").toggle();
          $(".work-with-us").removeClass("no-show");
        });
      }
    },
    screenshot_slider_desktop: {
      test: function test() {
        return $(".screenshot-slider--container").length;
      },
      run: function run() {
        $(".screenshot-slider--container").each(function (i, e) {
          var slider = $(e).find(".screenshot-slider");
          var $sliderTitles = $(e).find(".screenshot-slider--controls-container .screenshot-slider-title");

          slider.on("init", function (slick) {
            if ($(e).find(".screenshot-slider--controls-container").children().length) {
              $(e).find(".screenshot-slider--wrap .slick-dots").hide();
              $(e).find(".screenshot-slider--wrap").removeClass("vp-xs-top-6").addClass("vp-xs-top-3");
            }
          });

          slider.slick({
            dots: true,
            slidesToShow: 1,
            slidesToScroll: 1,
            speed: 500,
            adaptiveHeight: true,
            arrows: false,
            infinite: false
          });

          $sliderTitles.on("click", function () {
            var scrollWhere = $(this).data("scrollto");
            var whichSlide = $("[data-screenshot-title=\"" + scrollWhere + "\"]");
            var newSlideIndex = whichSlide.index();

            slider.slick("slickGoTo", newSlideIndex);
            $(e).find(".screenshot-nav-item").removeClass("active");
            $(e).find(".screenshot-nav-item").eq(i).addClass("active");
            $sliderTitles.removeClass("active-title");
            $(this).addClass("active-title");
          });

          $(e).on("click", ".screenshot-slide:not(.slick-active)", function (event) {
            event.preventDefault();
            var ind = $(this).index();
            slider.slick("slickGoTo", ind);
            $(e).find(".screenshot-nav-item").removeClass("active");
            $(e).find(".screenshot-nav-item").eq(i).addClass("active");
          });

          $("body").on("click", ".screenshot-gallery--panel-control", function (e2) {
            e2.preventDefault();
            $(".screenshot-gallery--panel-control").removeClass("active");
            $(this).addClass("active");
            if ($(this).hasClass("control--desktop")) {
              $(".screenshot-slider--container--desktop").show();
              $(".screenshot-slider--container--mobile").hide();
            } else {
              $(".screenshot-slider--container--mobile").show();
              $(".screenshot-slider--container--desktop").hide();
            }
          });

          setTimeout(function () {
            $(".screenshot-slider--container--mobile").hide();
          }, 400);
        });
      }
    },
    case_study_nav: {
      test: function test() {
        return $(".case-study--nav").length;
      },
      run: function run() {
        $(".case-study--section-title").each(function (i, e) {
          var slug = $(e).text().replace(" ", "").toLowerCase();
          $(e).attr("id", slug);
          $(".case-study--nav").append("<span class='case-study--nav--item' data-scroll-target='#" + slug + "'>" + $(e).text() + "</span>");
        });
      }
    },
    LandingFeatureTransition: {
      test: function test() {
        return $(".home__landing-case-study-intros").length;
      },
      run: function run() {

        $(".home__landing-case-study-intros a").hover(function () {
          $("body").addClass("home__landing-active");
        }, function () {
          $("body").removeClass("home__landing-active");
        });
      }
    }
  };

  for (var key in wb) {
    if (wb[key].test()) {
      wb[key].run();
    }
  }
})(jQuery, window);