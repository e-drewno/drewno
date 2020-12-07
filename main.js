$(document).ready(function() {

  $('#SortAuctions > .column').on('click', (function() {
    if ($('.active-sort').length) {
      $('.active-sort').removeClass('active-sort');
    }
    $(this).addClass('active-sort');
    if ($('.desc').length) {
      $('.desc').removeClass('desc');
      $(this).addClass('asc');
    }
    else {
      $(this).removeClass('asc');
      $(this).addClass('desc');
    }
  }));

  
  let observeAndPopup = function(el, type){
    let element = $(el.target);
    let popup = $(document.createElement('div'));
    popup.attr('id', 'Popup');
    if($('.logged').length){
      if(type === 'search'){
        if (element.hasClass('observed')) {
          element.removeClass('observed');
          popup.html("Usunięto kryteria wyszukiwania.<br> Zarządzanie obserwowanymi wyszukiwaniami znajdują się w panelu użytkownika w zakładce <b>OBSERWOWANE WYSZUKIWANIA</b>")
        }
        else {
          element.addClass('observed');
          popup.html("Dodano kryteria wyszukiwań do obserwowanych.<br> Zarządzanie obserwowanymi wyszukiwaniami znajdują się w panelu użytkownika w zakładce <b>OBSERWOWANE WYSZUKIWANIA</b>");
        }
      }
      else if(type === 'auction'){
        let parent = element.parent();
        console.log(parent);
        console.log(parent.hasClass('observed'));
        if (parent.hasClass('observed')) {
          parent.removeClass('observed');
          popup.html("Usunięto z obserwowanych");
        }
        else{
          parent.addClass('observed');
          popup.html("<p>Dodano aukcję do obserwowanych.</p><p>Zarządzanie obserwowanymi aukcjami znajduje się w panelu użytkownika w zakładce <a href=\"#\">OBSERWOWANE AUKCJE</a>.");
        }
      }

      $(popup).hide().appendTo('body').css('opacity', 0)
      .slideDown('slow')
      .animate(
        { opacity: 1 },
        { queue: false, duration: 'slow' }
      );
      
      setTimeout(function(){
        $(popup).fadeOut(function(){
          $(this).remove();
        });
      }, 5000);
    }
    else{
      if(type === 'search'){
        popup.html("Aby dodać do obserwowanych <a href=\"#\">zaloguj się</a>. Nie masz konta? <a href=\"#\">Zarejestruj się</a>.");
      }
      else if(type === 'auction'){
        popup.html("<p>Aby dodać aukcję do obserwowanych <a href=\"#\">zaloguj się</a></p><p>Dzięki tej opcji będziesz orzymywać powiadomienia o zmianach w aukcji (pojawienie się nowej oferty w aukcji, zmiana ceny)<br>Otrzymasz również powiadomienie przed zakończeniem aukcji, aby jej nie przegapić.");
      }
      let button = $(document.createElement('button'));
      popup.append(button);
      button.on('click', function() {
        $('#Popup').fadeOut(function(){
          $(this).remove();
        });
      });
      $(popup).hide().appendTo('body').css('opacity', 0)
      .slideDown('slow')
      .animate(
        { opacity: 1 },
        { queue: false, duration: 'slow' }
      );
    }
  }


  $('.observe').on('click', function(e) {
    observeAndPopup(e, 'auction');
  });


  $('#SafeSearch').on('click', function(e) {
    observeAndPopup(e, 'search');
  });


  $('.filter > label').on('click', function (e) {
    $(this).next('.filter-content').slideToggle('slow');
  });


  $('.item-menu a:contains("Logowanie / Rejestracja")').on('click', function(){
    if($('.logged').length){
      $(this).text('Logowanie / Rejestracja');
      $('body').removeClass('logged');
    }
    else{
      $(this).text('Wyloguj');
      $('body').addClass('logged');
    }
  });

});
