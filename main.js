// pseudo baza
let db = [],
  regions = [],
  rdlps = [],
  inspectorates = [],
  inspNames = [],
  manualSearched = [],
  params = {
    "FilterEnd": "",
    "FilterMaxPrice": "",
    "FilterMaxQtyMin": "",
    "FilterMaxQuantity": "",
    "FilterMaxReceiptDate": "",
    "FilterMaxStartPrice": "",
    "FilterMinPrice": "",
    "FilterMinQtyMin": "",
    "FilterMinQuantity": "",
    "FilterMinStartPrice": "",
    "FilterReceiptDate": "",
    "FilterStart": "",
    "actionParams": "",
    "actionType": "",
    "ajaxRequest": "",
    "assortments[]": [],
    "commercialGroups[]": [],
    "currentPage": "",
    "expectedPage": "",
    "inspectorates[]": [],
    "rdlps[]": [],
    "sortColumn": "",
    "sortOrder": "",
    "types[]": []
  };


$(document).ready(function () {

  // skrypt strony głównej - można rozdzielić na poszczególne podstrony
  if ($('.home'.length)) {

    const sortHeader = $('#SortAuctions');
    const auctions = $('#Auctions');
    const tableAuctions = $('#TableAuctions');
    const mainContainer = $('#Main');
    // wymiar dla nagłówka sortującego
    sortHeader.width(auctions.width());
    let form = $('#Filters');

    let sort = (column, order) => {
      params['sortColumn'] = column;
      params['sortOrder'] = order;
      showResults('sort');
    }

    // odświeżanie wyników
    $('#Refresh').bind('click', function (e) {
      showResults('refresh');
    })

    // sortowanie wyników kolumnami
    $('#SortAuctions > .column:not(.unsortable)').bind('click', (function (e) {
      if ($('.active-sort').length) {
        $('.active-sort').removeClass('active-sort');
      }
      let order;
      let type = $(this).attr('data-type');
      $(this).addClass('active-sort');
      if ($('.desc').length) {
        $('.desc').removeClass('desc');
        order = 'asc';
      }
      else {
        $(this).removeClass('asc');
        order = 'desc';
      }
      $(this).addClass(order);
      $('#sortColumn').val(type);
      $('#sortOrder').val(order);
      sort(type, order);
    }));

    // popup-y do obserwowanych aukcji i do zapisywania parametrów wyszukiwania
    let observeAndPopup = function (el, type) {
      let element = $(el.target);
      if ($('#Popup').length) {
        $('#Popup').remove();
      }

      let showPopup = (popup, type) => {
        if (type === 'autoclose') {
          // animacja popupa
          $(popup).hide().appendTo('body').css('opacity', 0)
            .slideDown('slow')
            .animate(
              { opacity: 1 },
              { queue: false, duration: 'slow' }
            );

          setTimeout(function () {
            $(popup).fadeOut(function () {
              $(this).remove();
            });
          }, 5000);
        }
        else {
          let button = $(document.createElement('button'));
          button.attr('id', 'ExitPopup');
          popup.append(button);
          button.bind('click', function (e) {
            $('#Popup').fadeOut(function () {
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

      let popup = $(document.createElement('div'));
      popup.attr('id', 'Popup');
      if ($('.logged').length) {
        if (type === 'search') {
          if (element.parent().hasClass('observed')) {
            element.text('Obserwowuj wyszukiwanie');
            element.parent().removeClass('observed');
            popup.html("Usunięto kryteria wyszukiwania.<br> Zarządzanie obserwowanymi wyszukiwaniami znajdują się w panelu użytkownika w zakładce <b>OBSERWOWANE WYSZUKIWANIA</b>")
            showPopup(popup, 'autoclose');
            showResults('removeSaved', $('#actionParams').val());
          }
          else {
            let popupContent = $(document.createElement('div'));
            let popupText = 'Wpisz nazwę obserwowanego wyszukiwania';
            let saveNameInput = $(document.createElement('input'));
            saveNameInput.attr('type', 'text');
            let submitButton = $(document.createElement('button'));
            submitButton.attr('id', 'SaveName')
            submitButton.text('Zapisz');
            submitButton.attr('disabled', true)
            let saveName = '';
            saveNameInput.on('input', (e) => {
              saveName = e.currentTarget.value;
              saveName.length ? submitButton.attr('disabled', false) : submitButton.attr('disabled', true);
            })
            submitButton.on('click', () => {
              element.parent().addClass('observed');
              element.text('Usuń z obserwowanych');
              $('#Popup').fadeOut(function () {
                $(this).remove();
              });
              $('#SaveSearchName span').text(saveName);
              showResults('addToSaved', saveName);
              editSearch();
            });
            popupContent.append(popupText);
            popupContent.append(saveNameInput);
            popupContent.append(submitButton);
            popup.append(popupContent);
            showPopup(popup);
          }
        }
        else if (type === 'auction') {
          let parent = element.parent().parent();
          if (parent.hasClass('observed')) {
            parent.removeClass('observed');
            popup.html("Usunięto z obserwowanych");
          }
          else {
            parent.addClass('observed');
            popup.html("<p>Dodano aukcję do obserwowanych.</p><p>Zarządzanie obserwowanymi aukcjami znajduje się w panelu użytkownika w zakładce <a href=\"#\">OBSERWOWANE AUKCJE</a>.");
          }
          showPopup(popup, 'autoclose');
        }
      }
      // popup dla niezalogowanych
      else {
        if (type === 'search') {
          popup.html('Aby dodać do obserwowanych <a class="login-button" href=\"#\">zaloguj się</a>. Nie masz konta? <a href=\"#\">Zarejestruj się</a>.');
        }
        else if (type === 'auction') {
          popup.html('<p>Aby dodać aukcję do obserwowanych <a class="login-button" href=\"#\">zaloguj się</a></p><p>Dzięki tej opcji będziesz orzymywać powiadomienia o zmianach w aukcji (pojawienie się nowej oferty w aukcji, zmiana ceny)<br>Otrzymasz również powiadomienie przed zakończeniem aukcji, aby jej nie przegapić.');
        }
        showPopup(popup);
      }
    }
    
    // akcja dla kliknięcia w zapis wyników wyszukiwania
    $('#SaveSearch').bind('click', function (e) {
      observeAndPopup(e, 'search');
    });

    // zwijanie/rozwijanie filtra + ikona
    $('.filter > label').bind('click', function (e) {
      $(this).parent().toggleClass('open');
      $(this).next('.filter-content').slideToggle('slow');
    });

    // zwijanie/rozwijanie obserwowane + ikona
    $('.observed-searches:not(.empty) h4').bind('click', function (e) {
      $(this).parent().toggleClass('open');
      $(this).next('.observed-search-container').slideToggle('slow');
    });

    // wyświetl zapisane wyszukiwanie
    $('.observed-search').bind('click', function (e) {
      showResults('showSaved', e.target.attributes['data-search'].value);
    });

    // wyświetl Ustawienia powiadomień email
    $('.notifications-settings').bind('click', function (e) {
      showResults('notificationsSettings');
    });

    // wyświetl obserwowane aukcje
    $('.observed-auctions').bind('click', function (e) {
      showResults('showObserved');
    });

    $('#Return').bind('click', function (e) {
      resetForm();
    });

    $('.login-button').bind('click', function (e) {
      let loginPopupContainer = $(document.createElement('div'));
      loginPopupContainer.attr('id', 'Popup');
      let formBody = `
      <form id="LoginForm" action="" method="post">
        <input type="email" autocomplete="username" class="form-control" name="email" value="" placeholder="E-mail" required="">
       <input type="password" autocomplete="current-password" class="form-control" name="password" placeholder="Hasło" required="">
       <div class="form-check">
          <input type="checkbox" class="form-check-input" name="remember" value="1">
          Zapamiętaj mnie
        </div>
        <a href="/register">Zarejestruj się</a>
        <a href="/passwordRecover">Zapomiałeś hasła?</a>
        <button type="submit" id="LoginButton">Zaloguj się</button>
      </form>`
      loginPopupContainer.html(formBody);
      let button = $(document.createElement('button'));
      button.attr('id', 'ExitPopup');
      loginPopupContainer.append(button);
      button.bind('click', function (e) {
        $('#Popup').fadeOut(function () {
          $(this).remove();
        });
      });
      $(loginPopupContainer).hide().appendTo('body').css('opacity', 0)
        .slideDown('slow')
        .animate(
          { opacity: 1 },
          { queue: false, duration: 'slow' }
      );
    })

    //tymczasowe do testów logowania się
    $('.item-menu a:contains("Logowanie / Rejestracja")').bind('click', function (e) {
      if ($('.logged').length) {
        $(this).text('Logowanie / Rejestracja');
        $('body').removeClass('logged');
      }
      else {
        $(this).text('Wyloguj');
        $('body').addClass('logged');
      }
    });

    // generowanie datalist bez wcześniej wybranych
    let generateNewDatalist = () => {
      if ($('#SearchResults').length) {
        $('#SearchResults').html('');
      }
      inspectorates.filter(inspectorate => !manualSearched.includes(inspectorate.id)).forEach(insp => {
        let option = $(document.createElement('option'));
        option.val(insp.name);
        option.attr('data-id', insp.id);
        option.appendTo($('#SearchResults'));
      });
    }

    // wyświetlanie wyników
    let showResults = (type, param) => {
      clearFilters();
      param ? $('#actionParams').val(param) : $('#actionParams').val('');
      $('#actionType').val(type);


      if (param === 'removeSaved') {
        $('body').removeClass('active-saved');

      }
      else if (param === 'addToSaved') {
        $('body').addClass('active-saved')
      };

      let formElements = form[0].elements;
      let activeFilters = false;

      for (let i = 0; i < formElements.length; i++) {
        let el = formElements[i];
        if (el.checked && (el.type == 'checkbox'||  el.type == 'radio'))  {
          if (el.parentNode.classList.value !== 'heading') {
            params[el.name].push(el.value);
            activeFilters = true;
          };
        }
        else if(el.value && (el.type == 'number' || el.type == 'text' || el.type == 'date' || el.type == 'hidden')) {
          params[el.name] = el.value;
          activeFilters = true;
        }
      }
      generateNewDatalist();

      // jeśli jest aktywny jakiś filtr
      if (activeFilters) {
        let resetButton = $('#ResetButton');
        if (!resetButton.length) {
          resetButton = $(document.createElement('a'));
          resetButton.attr('id', 'ResetButton');
          resetButton.text('Wyczyść');
          resetButton.bind('click', function (e) {
            resetForm();
            manualSearched = [];
            clearFilters();
            resetButton.remove();
          })
          $('.form-header').append(resetButton);
        }
      }
      else{
        resetButton.remove();
      }

      let loading = $(document.createElement('div'));
      loading.addClass('loading');
      // czas odpalanie loadera
      let loadingTimeout = setTimeout(function () {
        loading.appendTo(auctions).css('opacity', 0)
          .animate(
            { opacity: 1 },
            { queue: false, duration: 'slow' }
          );
      }, 5);

      fetch('?' + form.serialize(), {
        method: 'get'
      })
      .then((response) => {
        console.log(response);
        clearTimeout(loadingTimeout);
        if ($('.loading').length) {
          $('.loading').remove();
        };
      });

      observedStarsEvent();
      pagination();
      showResultsButton();
    }

    let resetForm = () => {
      form[0].reset();
      showResults('resetFilters');
      createInspectoratesSearch();
    }

    //zaznaczanie wszystkich checkboksów z grupy
    let clickHeading = (e) => {
      // sprawdzanie czy nie kliknięty span
      if (e.target.type == 'checkbox') {
        let label = $(e.currentTarget.control.checked);
        let inputs = $(e.currentTarget).parent().children().find('input');
        if (label[0] === true) {
          inputs.each(function () {
            $(this)[0].checked = true;
          });
        }
        else {
          inputs.each(function () {
            $(this)[0].checked = false;
          });
        }
        showResults('filter');
      }
      else {
        return false;
      }
    }

    // zaznaczanie wszystkich checkboksów z kilku podgrup (w stylu wszystkie aktualnie dostępne) lub z jednej podgrupy
    $('.double-heading, .heading').bind('click', function (e) {
      clickHeading(e);
    });

    // zbindowane akcje do filtrów niegenerowanych w trakcie
    $('input[type="text"], input[type="number"], input[type="date"]').bind('input', function (e) {
      let value = e.target.value;
      let waitAMoment = setTimeout(function () {
        if (value == e.target.value) {
          showResults('filter');
        }
        else if (!value.length) {
          clearTimeout(waitAMoment);
          showResults('filter');
        }
        else {
          clearTimeout(waitAMoment);
        }
      }, 1200);
    });

    $('input[type="checkbox"]').bind('click', function (e) {
      if (!$(e.currentTarget).parent().hasClass('heading') && !$(e.currentTarget).parent().hasClass('double-heading')) {
        showResults('filter');
      }
    });

    // przyklejanie sortowalnego nagłówka do górnej krawędzi
    $(window).bind('scroll', function (e) {
      fixedSortHeader();
      showResultsButton();
    });

    // ustawianie szerokości sortowalnego nagłówka
    $(window).bind('resize', function (e) {
      sortHeader.width(auctions.width());
    })

    // przyklejanie sortowalnego nagłówka do górnej krawędzi
    let fixedSortHeader = () => {
      if (window.scrollY >= tableAuctions.position().top) {
        sortHeader.addClass('fixed');
      }
      else {
        sortHeader.removeClass('fixed');
      }
    }

    // przycisk scroll top pokaż wyniki
    let showResultsButton = () => {
      let resultsButton = $('#ResultsButton');
      if(window.scrollY >= tableAuctions.innerHeight()){
        if(resultsButton.length === 0){
          resultsButton = $(document.createElement('button'));
          resultsButton.attr('id', 'ResultsButton');
          resultsButton.text('Zobacz wyniki')
          resultsButton.bind('click', function (e) {
            $('html, body').animate({scrollTop:0}, 600, 'swing', function() { 
              resultsButton.remove();
           });
          })
          mainContainer.append(resultsButton);
        } 
      }
      else{
        resultsButton.remove();
      }
    }

    // wyszukiwarka nadleśnictw jeśli nie wybrany region/rdlp
    let createInspectoratesSearch = () => {
      let searchContainer = $('#FilterInspectorate');
      if ($('#FilterInspectorate .filter-group').length) {
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
      results.attr('id', 'SearchResults');

      inspectorates.filter(inspectorate => !manualSearched.includes(inspectorate.id)).forEach(insp => {
        inspNames.push(insp.name);
        let option = $(document.createElement('option'));
        option.val(insp.name);
        option.attr('data-id', insp.id);
        option.appendTo(results);
      });
      search.appendTo(filterGroup);

      search.bind('input', function (e) {
        let value = e.target.value;
        let waitAMoment = setTimeout(function () {
          if (value == e.target.value) {
            if (inspNames.includes(value)) {
              let inspectorate = value;
              inspectorates.filter(insp => {
                if (insp.name === value) {
                  inspectorate = insp.id;
                }
              });
              let searchLabel = $(document.createElement('label'));
              searchLabel.attr('for', value);
              let searchInput = $(document.createElement('input'));
              searchInput.attr({
                'id': value,
                'type': 'checkbox',
                'name': 'inspectorates[]',
                'checked': 'checked',
                'class': 'manual-searched',
                'value': inspectorate
              });
              searchLabel.text(value);
              searchInput.prependTo(searchLabel);
              searchLabel.appendTo(searchContainer);
              searchLabel.bind('click', function (e) {

                // usuwanie z tablicy ręcznych wyszukiwań
                manualSearched = manualSearched.filter(item => item !== value);
                $(e.currentTarget).remove();
                showResults('filter');
              });
              e.target.value = '';
              showResults('filter');
            }
          }
          else if (!value.length) {
            clearTimeout(waitAMoment);
            showResults('filter');
          }
          else {
            clearTimeout(waitAMoment);
          }
        }, 300);
      });
      results.appendTo(filterGroup);
      filterGroup.appendTo(searchContainer);
    }

    // generowanie nadleśnictw po wybraniu rdlp
    let showInspectorates = (checkedInputs) => {
      console.log(checkedInputs);
      if (!checkedInputs.length) {
        clearFilters();
      }
      const inspectoratesContainer = $('#FilterInspectorate');
      inspectoratesContainer.html('');
      if (checkedInputs.length) {
        checkedInputs.each((index, inspectorate) => {
          let labelName = inspectorate.id;
          let inspectorateId = inspectorate.value;
          let filterGroup = $(document.createElement('div'));
          filterGroup.addClass('filter-group hidden');
          let rdlpLabel = $(document.createElement('label'));
          if (!$(inspectorate).parent().hasClass('heading')) {
            rdlpLabel.attr({
              // dodany "Sub-" żeby nie kolidował z rdlp z filtra regiony
              'for': 'Sub-' + labelName,
              'class': 'heading'
            });
            rdlpLabel.bind('click', function (e) {
              clickHeading(e);
            });
          }
          else {
            return
          }

          let filterInput = $(document.createElement('input'));
          filterInput.attr({
            // dodany "Sub-" żeby nie kolidował z rdlp z filtra regiony
            'id': 'Sub-' + labelName,
            'type': 'checkbox',
            'value': inspectorateId,
            'name': 'rdlpInInspectorates[]'
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
          showMoreButton.bind('click', function (e) {
            e.preventDefault();
            let moreContainer = $(this).prev();
            if (moreContainer.hasClass('hidden')) {
              moreContainer.toggleClass('hidden').css('opacity', 0)
                .slideDown('slow')
                .animate(
                  { opacity: 1 },
                  { queue: false, duration: 'slow' }
                );
              showMoreButton.text('- mniej');
            }
            else {
              moreContainer.toggleClass('hidden').css('opacity', 1)
                .slideUp('slow')
                .animate(
                  { opacity: 0 },
                  { queue: false, duration: 'slow' }
                );
              showMoreButton.text('+ więcej')
            }
          });

          $(db).each((index, region) => {
            region['RDLPs'].forEach(rdlp => {
              if (rdlp['RDLP'] === labelName) {
                let moreContainer = $(document.createElement('div'));
                moreContainer.addClass('more-container hidden');
                rdlp['Inspectorates'].forEach((insp, i) => {
                  let inspLabel = $(document.createElement('label'));
                  let inspectorate = insp;
                  inspLabel.attr('for', inspectorate.name);

                  let filterInput = $(document.createElement('input'));
                  filterInput.attr({
                    'id': inspectorate.name,
                    'type': 'checkbox',
                    'value': inspectorate.id,
                    'name': 'inspectorates[]'
                  });
                  filterInput.appendTo(inspLabel);
                  let spanLabel = $(document.createElement('span'));
                  spanLabel.html(inspectorate.name);
                  spanLabel.appendTo(inspLabel);
                  if (i < 5) {
                    inspLabel.appendTo(filterGroup);
                  }
                  else {
                    moreContainer.append(inspLabel);
                  }

                  inspLabel.bind('click', function (e) {
                    if (e.target.type == 'checkbox') {
                      showResults('filter');
                    }
                  });
                })
                moreContainer.appendTo(filterGroup);
              }
            })
          });
          showMoreButton.appendTo(filterGroup);
          filterGroup.appendTo(inspectoratesContainer);
        })
      }
      else {
        createInspectoratesSearch();
      }
    }

    // pobieranie parametrów get - wersja dłuższa dla IE
    let getAllUrlParams = () => {
      let queryString = decodeURI(window.location.search.slice(1));
      const obj = {};

      if (queryString) {
        queryString = queryString.split('#')[0];

        // poszczególne łańcuchy query
        const arr = queryString.split('&');

        for (let i = 0; i < arr.length; i++) {
          // oddzielanie kluczy od wartości
          const a = arr[i].split('=');
          let paramName = a[0];
          let paramValue = typeof (a[1]) === 'undefined' ? true : a[1];
          // jeśli klucz jest tablicą
          if (paramName.match(/\[(\d+)?\]$/)) {
            let key = paramName;
            if (!obj[key]) obj[key] = [];
            if (paramName.match(/\[\d+\]$/)) {
              let index = /\[(\d+)\]/.exec(paramName)[1];
              obj[key][index] = paramValue;
            } else {
              obj[key].push(paramValue);
            }
          } else {
            if (!obj[paramName]) {
              obj[paramName] = paramValue;
            } else if (obj[paramName] && typeof obj[paramName] === 'string') {
              obj[paramName] = [obj[paramName]];
              obj[paramName].push(paramValue);
            } else {
              obj[paramName].push(paramValue);
            }
          }
        }
      }
      for (let o in obj) {
        if (o && o.length){
          params[o] = obj[o];
          console.log(o);
          if(typeof obj[o] === 'object'){
            if(o === 'rdlps[]'){
              for(let p = 0; p < obj[o].length; p++){
                $(`input[name="${o}"][value="${obj[o][p]}"]`)[0].checked = true;
              }
              showInspectorates($('#FilterRegion input:checked'));
            }
            else if(params['rdlps[]'].length === 0 && o === 'inspectorates[]'){
              
              let searchContainer = $('#FilterInspectorate');
              if ($('#FilterInspectorate .filter-group').length) {
                searchContainer.html('');
              }
              createInspectoratesSearch();
              for(let p = 0; p < obj[o].length; p++){
                let inspectorateName; 
                inspectorates.filter(i => {
                  if(i.id === parseInt(obj[o][p])){
                    inspectorateName = i.name;
                  }
                });
                let searchLabel = $(document.createElement('label'));
                searchLabel.attr('for', inspectorateName);
                let searchInput = $(document.createElement('input'));
                searchInput.attr({
                  'id': inspectorateName,
                  'type': 'checkbox',
                  'name': 'inspectorates[]',
                  'checked': 'checked',
                  'class': 'manual-searched',
                  'value': obj[o][p]
                });
                searchLabel.text(inspectorateName);
                searchInput.prependTo(searchLabel);
                searchLabel.appendTo(searchContainer);
                //$(`input[name="${o}"][value="${obj[o][p]}"]`)[0].checked = true;
              }
            }
            else{
              for(let p = 0; p < obj[o].length; p++){
                $(`input[name="${o}"][value="${obj[o][p]}"]`)[0].checked = true;
              }
            }
          }
          else{
            $(`input[name="${o}"]`).val(obj[o]);
          }
        } 
      }
      const clearUrl = window.location.href.replace(window.location.search,'');
      window.history.pushState({}, document.title, clearUrl);
    }

    fetch('./getRdlps.json')
      .then(response => response.json())
      .then(arr => db = arr)
      .then(() => createTables())
      .then(() => fillRegionFilter())
      .then(() => createInspectoratesSearch())
      .then(() => getAllUrlParams())
      .then(() => observedStarsEvent())
      .then(() => pagination())
      .then(() => showResultsButton())

    // uzupełnianie regionów i rdlp z bazy
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
          'for': 'Region-' + regionNumber
        });
        let filterInput = $(document.createElement('input'));
        filterInput.attr({
          'id': 'Region-' + regionNumber,
          'type': 'checkbox',
          'value': regionNumber
        });
        filterInput.appendTo(regionLabel);
        let spanLabel = $(document.createElement('span'));
        spanLabel.html('Region ' + regionNumber);
        spanLabel.appendTo(regionLabel);
        regionLabel.bind('click', function (e) {
          clickHeading(e);
          let checkedInputs = $('#FilterRegion input:checked');
          showInspectorates(checkedInputs);
        });
        regionLabel.appendTo(filterGroup);
        filterGroup.appendTo(filterRegion);
        let rdlps = region['RDLPs'];

        if (rdlps.length) {
          rdlps.forEach(rdlp => {
            let rdlpLabel = $(document.createElement('label'));
            let rdlpName = rdlp['RDLP'];
            let rdlpID = rdlp['ID'];
            rdlpLabel.attr('for', rdlpName);

            let filterInput = $(document.createElement('input'));
            filterInput.attr({
              'id': rdlpName,
              'type': 'checkbox',
              'value': rdlpID,
              'name': 'rdlps[]'
            });
            filterInput.appendTo(rdlpLabel);
            rdlpLabel.bind('click', function (e) {
              if (e.target.type == 'checkbox') {
                let checkedInputs = $('#FilterRegion input:checked');
                showInspectorates(checkedInputs);
                showResults('filter');
              }
            });
            let spanLabel = $(document.createElement('span'));
            spanLabel.html(rdlpName);
            spanLabel.appendTo(rdlpLabel);
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

    let editSearch = (id) => {
      let saveSearchContainer = $('#SaveSearchName');
      let editButton = $('#EditSearchName');
      editButton.unbind('click');
      editButton.bind('click', function (e){
        let searchNameSpan = $('#SaveSearchNameSpan');
        searchNameSpan.attr('contenteditable', true).focus();
        editButton.fadeOut();
        let saveButton = $(document.createElement('button'));
        saveButton.attr('id', 'SaveEditSearchName');
        saveButton.on('click', function (e){
          $(this).remove();
          searchNameSpan.attr('contenteditable', false);
          editButton.fadeIn();
          showResults('editSearchName', searchNameSpan.text());
        });
        saveSearchContainer.append(saveButton);
      })
    }

    // akcja dla kliknięcia gwiazdki obserwowanych aukcji
    let observedStarsEvent = () => {
      $('.observe').unbind('click');
      $('.observe').bind('click', function (e) {
        console.log(e);
        if ($('.logged').length) {
          $(this).parent().parent().hasClass('observed') ? showResults('removeObserved') : showResults('addToObserved', $(e.target).parent().parent().attr('data-id'));
        }
        observeAndPopup(e, 'auction');
      });
    }
    
    let pagination = () => {
      $('#Pagination ul li a').unbind('click');
      $('#Pagination ul li a').bind('click', function (e) {
        e.preventDefault();
        let currentPage = $('#Pagination ul li a.active').text();
        let expectedPage = $(e.target).text();
        params['currentPage'] = currentPage;
        params['expectedPage'] = expectedPage;
        $('#currentPage').val(currentPage);
        $('#expectedPage').val(expectedPage);
        showResults('page');
      });
    }

    let clearFilters = () => {
      params = {
        "FilterEnd": "",
        "FilterMaxPrice": "",
        "FilterMaxQtyMin": "",
        "FilterMaxQuantity": "",
        "FilterMaxReceiptDate": "",
        "FilterMaxStartPrice": "",
        "FilterMinPrice": "",
        "FilterMinQtyMin": "",
        "FilterMinQuantity": "",
        "FilterMinStartPrice": "",
        "FilterReceiptDate": "",
        "FilterStart": "",
        "actionParams": "",
        "actionType": "",
        "ajaxRequest": "",
        "assortments[]": [],
        "commercialGroups[]": [],
        "currentPage": "",
        "expectedPage": "",
        "inspectorates[]": [],
        "rdlps[]": [],
        "sortColumn": "",
        "sortOrder": "",
        "types[]": []
      };
    }
  }
});
