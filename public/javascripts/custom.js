/* JS */

function scrollToBottom() {
  if ($(".error-log").length > 0) {
    $(".error-log").animate({ scrollTop: $('.error-log')[0].scrollHeight}, 100);
  }
}

/* Navigation */
function createNofitication(header, body) {
  var unique_id = $.gritter.add({
      title: header,
      text: body,
      sticky: false,
      time: '',
      class_name: 'gritter-custom'
  });  
}

function submitRequestAjax(url, params, callback) {
  $.ajax({
    method: "POST",
    url: url,
    data: params,
    async: false,
    success: callback
  });
}

function submitRequest(url, params, conf, callback) {
  if (typeof callback === 'undefined') {
    if (typeof conf === 'undefined') {
      var conf = function(){};
    }

    var callback = conf;
    var conf = null;
  }

  if (conf) {
    if (confirm('' + conf)) {
      submitRequestAjax(url, params, callback);
    }
  } else {
    submitRequestAjax(url, params, callback);
  }
}

$(document).on("click", ".modalSpawn", function(e) {
  e.preventDefault();

  var _self      = $(this);
  var player     = $('#player_name');
  var playerText = $('.player_name');

  player.val(_self.data('name'));
  playerText.text(_self.data('name'));
  $(_self.attr('href')).modal('show');
});

$(document).on("click", ".modalSubmit", function(e) {
  e.preventDefault();

  var playerName = $('#player_name').val();
  var _self      = $(this);
  var modal      = _self.closest('.modal');

  if (_self.data('type') == 'ban') {
    submitRequest('/ban', {
      player: playerName,
      reason: $('#ban_reason').val()
    }, "You really wanna ban player [" + playerName + "]?", function() {
      modal.modal('hide');
    });
  }else if(_self.data('type') == 'give') {
    submitRequest('/give', {
      player: playerName,
      item: $('#give_item').val(),
      quantity: $('#give_quantity').val()
    });
  }else if(_self.data('type') == 'topos') {
    submitRequest('/topos', {
      player: playerName,
      posx: $('#teleport_x').val(),
      posy: $('#teleport_y').val(),
      posz: $('#teleport_z').val()
    }, function() {
      modal.modal('hide');
    });    
  }else if(_self.data('type') == 'toplayer') {
    submitRequest('/toplayer', {
      player1: playerName,
      player2: $('#teleport_player').val()
    }, function() {
      modal.modal('hide');
    });        
  }else if(_self.data('type') == 'topreset') {
    submitRequest('/topreset', {
      player: playerName,
      preset: $('#teleport_preset').val()
    }, function() {
      modal.modal('hide');
    });
  }

  // modal.find('input').val();
  // modal.find('select').val();
});

$(document).on("click", ".ajaxRequest", function(e) {
  e.preventDefault();

  var _self = $(this);
  var type  = _self.data('type');

  if (type == 'kick') {
    var playerName = _self.data('name');

    submitRequest('/kick', {
      player: playerName
    }, 'Do you really wanna kick [' + playerName + ']?', function() {
      createNofitication('Kick', 'Player ' + playerName + ' kicked!');
    });
  }else if (type == 'send') {
    submitRequest('/execute', {
      command: $('#send_command').val()
    }, function() {
      $('#send_command').val('');
    });    
  }else if (type == 'banid') {
    submitRequest('/banid', {
      steamid: $('#banid_steamid').val(),
      reason: $('#banid_reason').val()
    }, 'Do you really wanna ban STEAMID [' + $('#banid_steamid').val() + ']?', function() {
        $('#banid_steamid').val('');
        $('#banid_reason').val('');
    });
  }else if (type == 'giveall') {
    submitRequest('/giveall', {
      item: $('#giveall_item').val(),
      quantity: $('#giveall_quantity').val()
    }, 'Do you really wanna give to all [' + $('#giveall_item').val() + 'x' + $('#giveall_quantity').val() + ']?', function() {
        $('#giveall_item').val('');
        $('#giveall_quantity').val('');
    });
  }
});

$(document).on("click", ".formGenerate", function(e) {
  e.preventDefault();
  var _self = $(this);
  var page    = _self.data('page');
  var confirm = _self.data('confirm');
  var params  = _self.data('params');

  submitRequest(page, params, confirm, function(result) {
    console.log(result);
    if (result.error.length > 0) {
      alert(result.error);
    } else {
      location.reload();
    }
  });
});

$(document).on("click", "#restart", function(e) {
  e.preventDefault();

  if (confirm('You really wanna restart server?')) {
    $.get('/restart', function(result) {
      alert('Server is restarting now!');
    });
  }
});

$(document).on("click", "#connect", function(e) {
  e.preventDefault();
  $.get('/connect', function(result) {
    $.get('/status', function(result) {
      $('#server_status').html(result);
    });
  });
});

$(document).on("click", "#disconnect", function(e) {
  e.preventDefault();
  $.get('/disconnect', function(result) {
    $.get('/status', function(result) {
      $('#server_status').html(result);
    });
  });
});

$(document).ready(function(){
  scrollToBottom(); 

  $(window).resize(function()
  {
    if($(window).width() >= 765){
      $(".sidebar .sidebar-inner").slideDown(350);
    }
    else{
      $(".sidebar .sidebar-inner").slideUp(350); 
    }
  });

});

$(document).ready(function(){
  $(".sidebar-dropdown a").on('click',function(e){
      e.preventDefault();

      if(!$(this).hasClass("dropy")) {
        // hide any open menus and remove all other classes
        $(".sidebar .sidebar-inner").slideUp(350);
        $(".sidebar-dropdown a").removeClass("dropy");
        
        // open our new menu and add the dropy class
        $(".sidebar .sidebar-inner").slideDown(350);
        $(this).addClass("dropy");
      }
      
      else if($(this).hasClass("dropy")) {
        $(this).removeClass("dropy");
        $(".sidebar .sidebar-inner").slideUp(350);
      }
  });

});

/* Widget close */

$('.wclose').click(function(e){
  e.preventDefault();
  var $wbox = $(this).parent().parent().parent();
  $wbox.hide(100);
});

/* Widget minimize */

$('.wminimize').click(function(e){
  e.preventDefault();
  var $wcontent = $(this).parent().parent().next('.widget-content');
  if($wcontent.is(':visible')) 
  {
    $(this).children('i').removeClass('icon-chevron-up');
    $(this).children('i').addClass('icon-chevron-down');
  }
  else 
  {
    $(this).children('i').removeClass('icon-chevron-down');
    $(this).children('i').addClass('icon-chevron-up');
  }            
  $wcontent.toggle(500);
}); 


$(".totop").hide();

$(function(){
  $(window).scroll(function(){
    if ($(this).scrollTop()>300)
    {
      $('.totop').slideDown();
    } 
    else
    {
      $('.totop').slideUp();
    }
  });

  $('.totop a').click(function (e) {
    e.preventDefault();
    $('body,html').animate({scrollTop: 0}, 500);
  });

});

/* Modal fix */

$('.modal').appendTo($('body'));


/* Notification box */

$('.slide-box-head').click(function() {
    var $slidebtn=$(this);
    var $slidebox=$(this).parent().parent();
    if($slidebox.css('right')=="-252px"){
      $slidebox.animate({
        right:0
      },500);
      $slidebtn.children("i").removeClass().addClass("icon-chevron-right");
    }
    else{
      $slidebox.animate({
        right:-252
      },500);
      $slidebtn.children("i").removeClass().addClass("icon-chevron-left");
    }
}); 

$(document).ready(function(){
  console.log('done loading');
  $(".has_submenu > a").click(function(e){
    console.log('submenu');
    e.preventDefault();
    var menu_li = $(this).parent("li");
    var menu_ul = $(this).next("ul");

    if(menu_li.hasClass("open")){
      menu_ul.slideUp(350);
      menu_li.removeClass("open")
    }
    else{
      $(".navi > li > ul").slideUp(350);
      $(".navi > li").removeClass("open");
      menu_ul.slideDown(350);
      menu_li.addClass("open");
    }
  });

});

$('.sclose').click(function(e){
  e.preventDefault();
  var $wbox = $(this).parent().parent().parent();
  $wbox.hide(0);
});


$('.sminimize').click(function(e){
  e.preventDefault();
  var $wcontent = $(this).parent().parent().next('.slide-content');
  if($wcontent.is(':visible')) 
  {
    $(this).children('i').removeClass('icon-chevron-down');
    $(this).children('i').addClass('icon-chevron-up');
  }
  else 
  {
    $(this).children('i').removeClass('icon-chevron-up');
    $(this).children('i').addClass('icon-chevron-down');
  }            
  $wcontent.toggle(0);
}); 

/* Send chat command */
$('#send_chat').closest('form').submit(function(event){
  $('#send_chat').trigger('click');
  event.preventDefault();
});

$('#send_chat').click(function() {
  var form = $(this).closest('form');
  $.ajax({
    method: "POST",
    url: "/chat",
    data: form.serialize(),
    async: false,
    success: function() {
      form.find('input[type=text]').val('');
      scrollToBottom();
    }
  });
});

/* Send execute command from dashboard */
$('#send_execute').closest('form').submit(function(event){
  $('#send_execute').trigger('click');
  event.preventDefault();
});

$('#send_execute').click(function() {
  var form = $(this).closest('form');
  submitRequest('/execute', form.serialize(),  function() {
    form.find('input').val('');
    scrollToBottom();
  });
});
  