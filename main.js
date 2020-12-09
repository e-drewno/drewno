let db = [],
    regions = [],
    rdlps = [],
    inspectorates = [];
      
$(document).ready(function() {

  if($('.home'.length)){

    const sortHeader = $('#SortAuctions');
    const auctions = $('#Auctions');
    const tableAuctions = $('#TableAuctions');
    sortHeader.width(auctions.width());

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
      if($('#Popup').length){
        $('#Popup').remove();
      }
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
  
    //$('label.heading')

    // $('#FilterRegion label').on('click', function(e){
    //   let checkedInputs = $('#FilterRegion input:checked');
    //   showInspectorates(checkedInputs);

    // })

    let clickHeading = (e) => {
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
    }

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
              'for': labelName,
              'class': 'heading' 
            });
            rdlpLabel.on('click', function(e){
              clickHeading(e);
            });
          }
          else{
            return
          }

          let filterInput = $(document.createElement('input'));
          filterInput.attr({
            'id': labelName,
            'type': 'checkbox',
            'value': labelName
          });
          filterInput.appendTo(rdlpLabel);
          let spanLabel = $(document.createElement('span'));
          spanLabel.html(labelName);
          spanLabel.appendTo(rdlpLabel);
          rdlpLabel.appendTo(filterGroup);
          let showMoreButton = $(document.createElement('button'));
          let buttonText = 'Pokaż wszystkie';
          showMoreButton.text(buttonText);
          showMoreButton.on('click', function(e){
            e.preventDefault();
            filterGroup.toggleClass('hidden');
            showMoreButton.text(showMoreButton.text() == 'Pokaż wszystkie' ? 'Ukryj' : 'Pokaż wszystkie');
          })
          
          $(db).each((index, region) => {
            region['RDLPs'].forEach(rdlp => {
              console.log(rdlp['RDLP']);
              console.log(labelName);
              if(rdlp['RDLP'] === labelName){
                rdlp['Inspectorates'].forEach(insp => {
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
                  let spanLabel = $(document.createElement('span'));
                  spanLabel.html(inspectorate);
                  spanLabel.appendTo(inspLabel);
                  inspLabel.on('click', function(e){
                    alert(inspectorate);
                  });
                  inspLabel.appendTo(filterGroup);
                })
              }
            })
          });
          showMoreButton.appendTo(filterGroup);
          filterGroup.appendTo(inspectoratesContainer);
        })
      }
    }

    
    $(window).on('scroll', function(){
      fixedSortHeader();
    });

    $(window).on('resize', function(){
      sortHeader.width(auctions.width());
    })

    let fixedSortHeader = () => {
      if(window.scrollY >= tableAuctions.position().top){
        sortHeader.addClass('fixed');
      }
      else{
        sortHeader.removeClass('fixed');
      }
    }
  
  
    fetch('./drewno.json')
    .then(response => response.json())
    .then(arr => db = arr)
    .then(() => createTables())
    .then(() => fillRegionFilter());

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
        regionLabel.on('click', function(e){
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
            rdlpLabel.on('click', function(e){
              let checkedInputs = $('#FilterRegion input:checked');
              showInspectorates(checkedInputs);
            });
            rdlpLabel.appendTo(filterGroup);
          })
        };
      });
    }

    //arrays for quick search
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
      
  let findInDB = (text) => {
    auctions.forEach(arr => {
      if(arr.includes(text)){
        console.log(arr);
      }
    });
  }
