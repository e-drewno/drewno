// pseudo baza
let db = [],
    regions = [],
    rdlps = [],
    inspectorates = [];
      
$(document).ready(function() {

  // skrypt strony głównej - można rozdzielić na poszczególne podstrony
  if($('.home'.length)){

    const sortHeader = $('#SortAuctions');
    const auctions = $('#Auctions');
    const tableAuctions = $('#TableAuctions');
    // wymiar dla nagłówka sortującego
    sortHeader.width(auctions.width());
    let form = $('#Filters');

    // sortowanie wyników kolumnami
    $('#SortAuctions > .column').bind('click', (function(e) {
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
  
    // popup-y do obserwowanych aukcji i do zapisywania parametrów wyszukiwania
    let observeAndPopup = function(el, type){
      let element = $(el.target);
      if($('#Popup').length){
        $('#Popup').remove();
      }
      let popup = $(document.createElement('div'));
      popup.attr('id', 'Popup');
      // popup wyświetlany tylko dla zalogowanych z automatycznym znikaniem
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
          let parent = element.parent().parent();
          if (parent.hasClass('observed')) {
            parent.removeClass('observed');
            popup.html("Usunięto z obserwowanych");
          }
          else{
            parent.addClass('observed');
            popup.html("<p>Dodano aukcję do obserwowanych.</p><p>Zarządzanie obserwowanymi aukcjami znajduje się w panelu użytkownika w zakładce <a href=\"#\">OBSERWOWANE AUKCJE</a>.");
          }
        }
        
        // animacja popupa
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
      // popup dla niezalogowanych
      else{
        if(type === 'search'){
          popup.html("Aby dodać do obserwowanych <a href=\"#\">zaloguj się</a>. Nie masz konta? <a href=\"#\">Zarejestruj się</a>.");
        }
        else if(type === 'auction'){
          popup.html("<p>Aby dodać aukcję do obserwowanych <a href=\"#\">zaloguj się</a></p><p>Dzięki tej opcji będziesz orzymywać powiadomienia o zmianach w aukcji (pojawienie się nowej oferty w aukcji, zmiana ceny)<br>Otrzymasz również powiadomienie przed zakończeniem aukcji, aby jej nie przegapić.");
        }
        let button = $(document.createElement('button'));
        popup.append(button);
        button.bind('click', function(e) {
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
  
    // akcja dla kliknięcia gwiazdki obserwowanych aukcji
    $('.observe').bind('click', function(e) {
      observeAndPopup(e, 'auction');
    });
  
    // akcja dla kliknięcia w zapis wyników wyszukiwania
    $('#SafeSearch').bind('click', function(e) {
      showResults();
      observeAndPopup(e, 'search');
    });
  
    // zwijanie/rozwijanie filtra + ikona
    $('.filter > label').bind('click', function (e) {
      $(this).parent().toggleClass('open');
      $(this).next('.filter-content').slideToggle('slow');
    });
  
    //tymczasowe do testów logowania się
    $('.item-menu a:contains("Logowanie / Rejestracja")').bind('click', function(e){
      if($('.logged').length){
        $(this).text('Logowanie / Rejestracja');
        $('body').removeClass('logged');
      }
      else{
        $(this).text('Wyloguj');
        $('body').addClass('logged');
      }
    });

    // wyświetlanie wyników
    let showResults = () => {
      // json do symulowania pobierania danych
      fetch('./test-auctions.json')
      .then(response => response.json())
      .then(() => {
        let formElements = form[0].elements; 
        let resetButton = $('#ResetButton');
        if(!resetButton.length){
          resetButton = $(document.createElement('a'));
          resetButton.attr('id', 'ResetButton');
          resetButton.text('Wyczyść');
          resetButton.bind('click', function(e){
            resetForm();
          })
          $('.form-header').append(resetButton);
        }
        let filters = [];
        for (let i=0; i<formElements.length; i++){
          let el = formElements[i];
          if( (el.checked && (el.type == 'checkbox' || el.type == 'radio')) ||
            ( el.value && (el.type == 'number' || el.type == 'text' || el.type == 'date' || el.type == 'search')) ){
            if(el.parentNode.classList.value !== 'heading'){
              filters.push(`{${el.id}: ${el.value}}`);
            };
          }
        }

        if(filters.length){
          // zapytanie do bazy
          console.log(filters);
        }
        else{
          // zapytanie do bazy
          console.log('Pokaż najnowsze');
          resetButton.remove();
        }        
      })   
    }

    let resetForm = () => {
      form[0].reset();
      showResults();
      createInspectoratesSearch();
    }

    //zaznaczanie wszystkich checkboksów z grupy
    let clickHeading = (e) => {
      // sprawdzanie czy nie kliknięty span
      if(e.target.type == 'checkbox'){
        let label = $(e.currentTarget.control.checked);
        let inputs = $(e.currentTarget).parent().children().find('input');
        if(label[0] === true){ 
          inputs.each(function(){
            $(this)[0].checked = true;
          });
        }
        else{
          inputs.each(function(){
            $(this)[0].checked = false;
          });
        }
        showResults();
      }
      else{
        return false;
      }
    }

    // zaznaczanie wszystkich checkboksów z kilku podgrup (w stylu wszystkie aktualnie dostępne) lub z jednej podgrupy
    $('.double-heading, .heading').bind('click', function(e){
      clickHeading(e);
    });

    // wyłączone wysyłanie formularza
    form.bind('submit' ,function(e){
      e.preventDefault();
      showResults();
    });

    // zbindowane akcje do filtrów niegenerowanych w trakcie
    $('input[type="text"], input[type="number"], input[type="date"]').bind('input', function(e){
      showResults();
    });

    $('input[type="checkbox"]').bind('click', function(e){
      if(!$(e.currentTarget).parent().hasClass('heading') && !$(e.currentTarget).parent().hasClass('double-heading')){
        showResults();
      }
     
    });

    // przyklejanie sortowalnego nagłówka do górnej krawędzi
    $(window).bind('scroll', function(e){
      fixedSortHeader();
    });

    // ustawianie szerokości sortowalnego nagłówka
    $(window).bind('resize', function(e){
      sortHeader.width(auctions.width());
    })

    // przyklejanie sortowalnego nagłówka do górnej krawędzi
    let fixedSortHeader = () => {
      if(window.scrollY >= tableAuctions.position().top){
        sortHeader.addClass('fixed');
      }
      else{
        sortHeader.removeClass('fixed');
      }
    }

    // wyszukiwarka nadleśnictw jeśli nie wybrany region/rdlp
    let createInspectoratesSearch = () => {
      let searchContainer = $('#FilterInspectorate');
      if($('#FilterInspectorate .filter-group').length){
        searchContainer.html('');
      }
      let filterGroup = $(document.createElement('div'));
      filterGroup.addClass('filter-group');
      let search = $(document.createElement('input'));
      search.attr({
        "id": "Search",
        "list": "SearchResults",
        "type": "search", 
        "name": "Search",
        "placeholder": "Wyszukaj Nadleśnictwo"
      });
      let results = $(document.createElement('datalist'));
      let lowerCaseArray = [];
      results.attr('id', 'SearchResults');
      inspectorates.forEach(insp => {
        let option = $(document.createElement('option'));
        option.val(insp);
        option.appendTo(results);
        lowerCaseArray.push(insp.toLowerCase());
      });
      search.appendTo(filterGroup);
      search.bind('input', function(e){
        let value = e.target.value;
        let waitAMoment = setTimeout(function(){
          if(value == e.target.value){
            if(lowerCaseArray.includes(value.toLowerCase()) || !value.length){
              
              let searchLabel = $(document.createElement('label'));
              searchLabel.attr('for', value);
              let searchInput = $(document.createElement('input'));
              searchInput.attr({
                'id': value,
                'type': 'checkbox', 
                'name': value,
                'checked':'checked'
              });
              searchLabel.text(value);
              searchInput.prependTo(searchLabel);
              searchLabel.appendTo(searchContainer);
              searchLabel.bind('click', function(e){
                $(e.currentTarget).remove();
                showResults();
              })
              e.target.value = '';
              showResults();
            }
          }
          else{
            clearTimeout(waitAMoment);
          }
        }, 300);
      });
      results.appendTo(filterGroup);
      filterGroup.appendTo(searchContainer);
   }

    // generowanie nadleśnictw po wybraniu rdlp
    let showInspectorates = (checkedInputs) => {
      const inspectoratesContainer = $('#FilterInspectorate');
      inspectoratesContainer.html('');
      if(checkedInputs.length){
        checkedInputs.each((index, inspectorate) => {
          let labelName = inspectorate.id;
          let filterGroup = $(document.createElement('div'));
          filterGroup.addClass('filter-group hidden');
          let rdlpLabel = $(document.createElement('label'));
          if(!$(inspectorate).parent().hasClass('heading')){
            rdlpLabel.attr({
              // dodany "Sub-" żeby nie kolidował z rdlp z filtra regiony
              'for': 'Sub-'+labelName,
              'class': 'heading' 
            });
            rdlpLabel.bind('click', function(e){
              clickHeading(e);
            });
          }
          else{
            return
          }

          let filterInput = $(document.createElement('input'));
          filterInput.attr({
            // dodany "Sub-" żeby nie kolidował z rdlp z filtra regiony
            'id': 'Sub-'+labelName,
            'type': 'checkbox',
            'value': labelName
          });
          filterInput.appendTo(rdlpLabel);
          let spanLabel = $(document.createElement('span'));
          spanLabel.html(labelName);
          spanLabel.appendTo(rdlpLabel);
          rdlpLabel.appendTo(filterGroup);
          let showMoreButton = $(document.createElement('a'));
          let buttonText = '+ więcej';
          showMoreButton.text(buttonText);
          showMoreButton.addClass('show-more');
          showMoreButton.bind('click', function(e){
            e.preventDefault();
            let moreContainer = $(this).prev();
            if(moreContainer.hasClass('hidden')){
              moreContainer.toggleClass('hidden').css('opacity', 0)
              .slideDown('slow')
              .animate(
                { opacity: 1 },
                { queue: false, duration: 'slow' }
              );
              showMoreButton.text('- mniej');
            }
            else{
              moreContainer.toggleClass('hidden').css('opacity', 1)
              .slideUp('slow')
              .animate(
                { opacity: 0 },
                { queue: false, duration: 'slow' }
              );
              showMoreButton.text('+ więcej')
            }
          })
          
          $(db).each((index, region) => {
            region['RDLPs'].forEach(rdlp => {
              if(rdlp['RDLP'] === labelName){
                let moreContainer = $(document.createElement('div'));
                moreContainer.addClass('more-container hidden');
                rdlp['Inspectorates'].forEach((insp, i) => {
                  let inspLabel = $(document.createElement('label'));
                  let inspectorate = insp;
                  inspLabel.attr('for', inspectorate);
                  
                  let filterInput = $(document.createElement('input'));
                  filterInput.attr({
                    'id': inspectorate,
                    'type': 'checkbox',
                    'value': inspectorate
                  });
                  filterInput.appendTo(inspLabel);
                  inspLabel.bind('click', function(e){
                    showResults();
                  })
                  let spanLabel = $(document.createElement('span'));
                  spanLabel.html(inspectorate);
                  spanLabel.appendTo(inspLabel);
                  if(i < 5){
                    inspLabel.appendTo(filterGroup);
                  }
                  else{
                    moreContainer.append(inspLabel);
                  }
                })
                moreContainer.appendTo(filterGroup);
              }
            })
          });
          showMoreButton.appendTo(filterGroup);
          filterGroup.appendTo(inspectoratesContainer);
        })
      }
      else{
        createInspectoratesSearch();
      }
    }
  
    // pobieranie pseudobazy
    fetch('./drewno.json')
    .then(response => response.json())
    .then(arr => db = arr)
    .then(() => createTables())
    .then(() => fillRegionFilter())
    .then(() => createInspectoratesSearch());

    let fillRegionFilter = () => {
      let filterRegion = document.getElementById('FilterRegion');

      filterRegion.innerText = '';
    
      $(db).each((index, region) => {
        let filterGroup = $(document.createElement('div'));
        filterGroup.addClass('filter-group');
        const regionNumber = region['Region'];
        let regionLabel = $(document.createElement('label'));
        regionLabel.attr({
          'class': 'heading', 
          'for': 'Region' + regionNumber
        });
        let filterInput = $(document.createElement('input'));
        filterInput.attr({
          'id': 'Region'+ regionNumber,
          'type': 'checkbox',
          'value': 'Region'+ regionNumber
        });
        filterInput.appendTo(regionLabel);
        let spanLabel = $(document.createElement('span'));
        spanLabel.html('Region ' + regionNumber);
        spanLabel.appendTo(regionLabel);
        regionLabel.bind('click', function(e){
          clickHeading(e);
          let checkedInputs = $('#FilterRegion input:checked');
          showInspectorates(checkedInputs);
        });
        regionLabel.appendTo(filterGroup);
        filterGroup.appendTo(filterRegion);
        let rdlps = region['RDLPs'];

        if(rdlps.length){
          rdlps.forEach(rdlp => {
            let rdlpLabel = $(document.createElement('label'));
            let rdlpName = rdlp['RDLP'];
            rdlpLabel.attr('for', rdlpName);
          
            let filterInput = $(document.createElement('input'));
            filterInput.attr({
              'id': rdlpName,
              'type': 'checkbox',
              'value': rdlpName
            });
            filterInput.appendTo(rdlpLabel);
            let spanLabel = $(document.createElement('span'));
            spanLabel.html(rdlpName);
            spanLabel.appendTo(rdlpLabel);
            rdlpLabel.bind('click', function(e){
              let checkedInputs = $('#FilterRegion input:checked');
              showInspectorates(checkedInputs);
              showResults();
            });
            rdlpLabel.appendTo(filterGroup);
          })
        };
      });
    }

    //tablice do szybszego wyszukiwania - póki co wyszukiwanie zrobione na html datalist
    let createTables = () => {
      db.forEach(region => {
        regions.push(region['Region']);
        region['RDLPs'].forEach(rs => {
          rdlps.push(rs['RDLP']);
          rs['Inspectorates'].forEach(insp => {
            inspectorates.push(insp);
          })
        })
      })
    }
  }
});  
