/************/
/*buildings*/
/***********/
function draw() {
    var cellClass =  Array.from({length: 20}, (x,i) => "class" + i);
    $(".wrap .grid").addClass("slide");
  setTimeout(function(){
    $(".grid .cell").removeClass(cellClass);
    $(".wrap .grid").removeClass("slide");
    $(".grid .cell").each(function() {
      $(this).addClass("class" + Math.floor(Math.random() * 11 + 1));
    });
    $(".grid .cell").each(function() {
      $(this)
        .get(0)
        .style.setProperty("--size", Math.floor(Math.random() * 2 + 1));
      $(this)
        .get(0)
        .style.setProperty("--height", (Math.floor(Math.random() * 50) * 4) + "px");
      $(this)
        .get(0)
        .style.setProperty("--angle", (Math.floor(Math.random() * 4) * 90) + "deg");
      $(this)
        .get(0)
        .style.setProperty("--shift", ((Math.floor(Math.random() * 150) - 50) * 1.5) + "px");
    });
  }, 1600);
}

$(function() {
  draw();
  $("body").on("click", function() {
    draw();
  });
});
setInterval(draw,9000);
/*ここまで*/

/***********/
/*SVG-train*/
/***********/
/************************
TopMain FIX
************************/
jQuery(function($) {
  //$(function(){
  setTopHeight();
  $(window).on("load resize scroll", function() {
      setTopHeight();
  });
  //});
  function setTopHeight() {
      winH = $(window).height();
      winW = $(window).width();
      if (winW <= 736) {
          mainH = winH * 0.55
      } else if (winW <= 950) {
          mainH = winH * 0.7
      } else {
          mainH = winH
      }
      $('#top_main').height(mainH);

      topRatio = mainH / winW
      if (topRatio < 0.596125) {

          $('#top_main > .image').css({
              'width': winW,
              'height': winW * 0.596125
          });
      } else {

          $('#top_main > .image').css({
              'width': mainH * 1.6775,
              'height': mainH
          });
      }
      if (topRatio < 0.555555) {
          $('body').addClass('js-imgWider');

      } else {
          $('body').removeClass('js-imgWider')
      }
      var scrollNum = $(window).scrollTop();

      if ($('#top_main').length) {
          $('#top_main').each(function() {
              var paraVar = ($('.image', this).height() - winH) / winH;
              var transNum = scrollNum * paraVar;
              var headerH = $('#header').outerHeight();
              if (topRatio < 0.555555) {

                  if (scrollNum < mainH - headerH) {
                      $('.image', this).css({
                          'transform': 'translate(0%, -' + transNum + 'px)',
                          '-webkit-transform': 'translate3d(0%, -' + transNum + 'px, 0)'
                      });
                  }
              } else {
                  $('.image', this).css({
                      'transform': 'translate3d(-50%, -50%, 0)',
                      '-webkit-transform': 'translate3d(-50%, -50%, 0)'
                  });
              }
          });
      }
  }
  $(function() {
      var top_main = new fac.TopMain("#top_main > .image");
  });
  /************************
   fac.TopMain
    ************************/
  if (typeof fac === "undefined")
      var fac = function() {};
  $("html").addClass("fac-js-enabled");

  fac.TopMain = function(target) {

      this.initialize(target);
  };
  fac.TopMain.AREA_WIDTH = 6709;
  fac.TopMain.AREA_HEIGHT = 4000;
  fac.TopMain.prototype = {
      self: null,
      target: null,
      trains: null,
      min_width: null,
      is_first: null,
      is_content_full: null,
      initialize: function(target) {
          this.self = $(this);
          this.target = $(target);
          var null_div = $('<div></div>');
          var trains_element = null_div.clone().addClass("trains").appendTo(this.target);
          this.trains = new fac.TopMain.Trains(trains_element);
          var car_element = null_div.clone().addClass("cars").appendTo(this.target);
          this.car = new fac.TopMain.Car(car_element);
      }
  }
  /* fac.TopMain.PathAnimationItem */

  fac.TopMain.PathAnimationItem = function(target, path, options) {
      this.initialize(target, path, options);
  };
  fac.TopMain.PathAnimationItem.prototype = {
      target: null,
      path: null,
      options: {
          speed: null,
          min_degree: null,
          max_degree: null,
          sprites: null,
          max: null,
          offset: [],
      },
      callbacks: {
          end: null,
      },
      count: null,
      position: null,
      position_max: 1000,
      length: null,
      last_point: {
          x: 0,
          y: 0
      },
      timer: null,
      initialize: function(target, path, options) {
          this.target = target;
          this.path = path;
          this.options = $.extend({}, this.options, options);
          this.length = this.path.getTotalLength();
          this.options.sprites = this.options.sprites - 1;
          this.options.max = this.options.max_degree - this.options.min_degree;
          this.callbacks = {
              end: $.Callbacks()
          }
      },
      run: function(delay) {
          this.count = 0;
          this.position = delay !== void 0 ? -delay : 0;
          this.timer = window.requestAnimationFrame(this.animate.bind(this));
      },
      animate: function() {
          this.position += this.options.speed;
          if (this.position < 0) {
              window.requestAnimationFrame(this.animate.bind(this));
              return;
          } else if (parseInt(this.position / this.position_max, 10) === 1) {
              window.cancelAnimationFrame(this.timer);
              this.callbacks.end.fire();
              return;
          }
          this.count++;
          var offset = 0;
          if (typeof this.options.offset === "function") {
              offset = this.options.offset(this.position, this.position_max);
          }
          this.position += offset;
          var point = this.path.getPointAtLength((this.position / this.position_max) * this.length);
          var x = point.x / fac.TopMain.AREA_WIDTH * 100;
          var y = point.y / fac.TopMain.AREA_HEIGHT * 100;
          var z = parseInt(point.y);
          var radian = Math.atan2(this.last_point.y - point.y, this.last_point.x - point.x);
          var degree = radian * (180 / Math.PI);
          degree = (degree + 270) % 360;
          var trim_degree = Math.min(Math.max(degree, this.options.min_degree), this.options.max_degree) - this.options.min_degree;
          var percentage = 1 - (trim_degree / this.options.max);
          var sprite_num = Math.round(percentage * this.options.sprites)
          var sprite_x = sprite_num % 10 * -100;
          var sprite_y = parseInt(sprite_num / 10) * -100;
          this.last_point = point;
          this.target.css({
              left: x + "%",
              top: y + "%",
              zIndex: z,
              backgroundPosition: sprite_x + "% " + sprite_y + "%"
          });
          window.requestAnimationFrame(this.animate.bind(this));
      }
  }
    /* fac.TopMain.Trains */
    fac.TopMain.Trains = function(target) {this.initialize(target);
    };
    fac.TopMain.Trains.Path = $('<svg><path class="st0" d="M-297.1,1645.9c0,0,1094.8,788.2,1429.2,1020.4c288.5,200.3,864.8,231.5,1210.1,113.8c356.8-121.6,761.8-299.6,4761.8-440.6,9761.8-480.6"/></svg>').find("path")[0]
    fac.TopMain.Trains.prototype = {
        target: null,
        front: null,
        middle: null,
        back: null,
        initialize: function(target) {
            this.target = target;
            var options = {
                speed:3.9,//3.5
                min_degree: 60,//60
                max_degree: 125,//125
                sprites: 19,
                offset: this.offset.bind(this)
            }
            var front_element = $('<div></div>').addClass("front").prependTo(this.target);
            var middle_element = $('<div></div>').addClass("middle").prependTo(this.target);
            var back_element = $('<div></div>').addClass("back").prependTo(this.target);
            this.front = new fac.TopMain.PathAnimationItem(front_element,fac.TopMain.Trains.Path,options);
            this.middle = new fac.TopMain.PathAnimationItem(middle_element,fac.TopMain.Trains.Path,options);
            this.back = new fac.TopMain.PathAnimationItem(back_element,fac.TopMain.Trains.Path,options);
            this.back.callbacks.end.add(this.start.bind(this));
            this.start(200);
        },
        start: function(delay) {
            var delay = delay || 100;
            this.front.run(delay);
            this.middle.run(delay + 30);//57
            this.back.run(delay + 30.7 * 2);//57.7*2
        },
        offset: function(position, position_max) {
            var offset = 0;
            var percentage = position / position_max;
            switch (true) {
            case percentage < 0.46:
                offset = -0.7;
                break;
            case percentage < 0.75:
                offset = 0.6;
                break;
            default:
                offset = 0;
            }
            return offset;
        }
    }
  });
/*ここまで*/
/*************/
/*motion_path*/
/*************/
//register the plugin
gsap.registerPlugin(MotionPathPlugin);
// set the element to rotate from it's center
gsap.set(".green_car", {
	xPercent: -50,
	yPercent: -50,
	transformOrigin: "50% 55%"
});
// animate the rocket along the path
gsap.from(".green_car", {
    motionPath: {
        path: "#path",
        align: "#path",
        autoRotate: false,
    },
    duration: 5,
    delay: 0.5,
    repeat: -1,
    ease: "power1.inOut",
    immediateRender: true,
});
gsap.set(".bus", {
	xPercent: -50,
	yPercent: -50,
	transformOrigin: "50% 60%"
});
// animate the rocket along the path
gsap.from(".bus", {
    motionPath: {
        path: "#path",
        align: "#path",
        autoRotate: false,
    },
    duration: 5,
    delay: 1.5,
    repeat: -1,
    ease: "power1.inOut",
    immediateRender: true,
});
gsap.set(".bike", {
	xPercent: -50,
	yPercent: -50,
	transformOrigin: "50% 65%"
});
// animate the rocket along the path
gsap.from(".bike", {
    motionPath: {
        path: "#path",
        align: "#path",
        autoRotate: false,
    },
    duration: 5,
    delay: 2.5,
    repeat: -1,
    ease: "power1.inOut",
    immediateRender: true,
});
gsap.set(".drone", {
	xPercent: -50,
	yPercent: -50,
	transformOrigin: "50% 50%"
});
// animate the rocket along the path
gsap.to(".drone", {
    motionPath: {
        path: "#drone_path",
        align: "#drone_path",
        autoRotate:false,
    },
    duration: 5,
    delay:0,
    repeat: -1,
    ease: "power1.inOut",
    immediateRender: true,
});
/*ここまで*/
