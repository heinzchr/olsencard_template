window.onload=function(){

  /* Bootstrap Carousel */
  $('.carousel').carousel({
     interval: 8000,
     pause: "hover"
  });

  $(".totop").hide();

  $(function(){
    $(window).scroll(function(){
      if ($(this).scrollTop()>300){
        $('.totop').slideDown();
      } 
      else{
        $('.totop').slideUp();
      }
    });
    $('.totop a').click(function (e) {
      e.preventDefault();
      $('body,html').animate({scrollTop: 0}, 500);
    });
  });

  $.getScript("js/ddlevelsmenu.js", function(){
    $.getScript("js/jquery.carouFredSel-6.2.1-packed.js", function(){
      $.getScript("js/jquery.countdown.min.js", function(){
        $(function(){
          launchTime = new Date(); 
          launchTime.setDate(launchTime.getDate() + 365); 
          $("#countdown").countdown({until: launchTime, format: "dHMS"});
        });
  
        $.getScript("js/jquery.navgoco.min.js", function(){
          $.getScript("js/respond.min.js", function(){
            $.getScript("js/filter.js", function(){
              $.getScript("js/html5shiv.js", function(){
                
                $('.sidey .nav').navgoco();
                 
              });
            });
          });
        });
      });
    });
  });
};
