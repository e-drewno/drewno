const table = document.getElementById('TableAuctions');
const tableHeader = document.getElementById('SortAuctions');
const tableContent = document.getElementById('Auctions');

// pseudo baza
let baza = {};
let user = {};
let regionsOptions = [];
let rdlpOptions = [];
let inspectoratesOptions = [];
let typeOptions = [];
let assortmentOptions = [];

fetch('./drewno.json')
  .then(response => response.json())
  .then(obj => baza = obj)
  .then(() => createTestUser(0))
  .then(() => toogleLogin())
  .then(() => createTable())
  .then(() => addSortable())
  .then(() => showRegionAuctions('Region 1'))
  .then(() => addOptionsToFilters())
  .then(() => slideFilter())
  .then(() => showPage())
  .then(() => observedSearch());


let createTable = () => {
  baza["SortLabels"].forEach(label => {
    let column = document.createElement('div');
    column.classList.add('column');
    let span = document.createElement('span');
    span.innerHTML = label;
    column.appendChild(span);
    tableHeader.appendChild(column);
  });
}

let showRegionAuctions = (region) => {

  let observed = user.observedAuctions;
  
  tableContent.innerHTML = '';

  baza["Regions"].forEach(auction => {
    if(auction[0] !== region){
      return
    }
    let row = document.createElement('div');
    row.classList.add('row');
    auction.forEach((col, i) => {
      if(i == 0){
        row.setAttribute('data-region', col);
        return
      }
      else if(i == 1){
        row.setAttribute('data-id', col);
        if(observed.length && observed.includes(col)){
          row.classList.add('observed');
        }
        else{
          row.classList.remove('observed');
        }
        return
      }
      
      let column = document.createElement('div');
      column.classList.add('column');
      let span = document.createElement('span');
      if(i == auction.length - 1){
        span.innerHTML = `<a href="${col}" target="_blank">Link</a>`;
      }
      else{
        span.innerHTML = col;
      }
      
      column.appendChild(span);
      row.appendChild(column);
    });
    let observe = document.createElement('button');
    observe.classList.add('observe');
    observe.addEventListener('click', function(e){
      let parent = this.parentElement;
      let id = parent.getAttribute('data-id');
      
      if(observed.length  && observed.includes(id)){
        const index = observed.indexOf(id); 
        if (index >= 0) {
            observed.splice(index, 1);
            parent.classList.remove('observed');
            this.innerText = '';
        }
      }
      else{
        let popup = document.createElement('div');
        popup.id ='Popup';
        if(user.logged){
          popup.innerHTML = baza["Popups"].AddToObservedLoggedIn;
          observed.push(id);
          parent.classList.add('observed');
          this.innerText = 1;
        }
        else{
          popup.innerHTML = baza["Popups"].AddToObservedLoggedOut;  
        }
        
        let button = document.createElement('button');
        popup.appendChild(button);
        button.addEventListener('click', function(){
          popup.parentElement.removeChild(document.getElementById('Popup'));
        });
        document.body.appendChild(popup);
      }
    });
    row.appendChild(observe);
    tableContent.appendChild(row);
  });
}

let addSortable = () => {
  const getCellValue = (tr, i) => tr.children[i].innerText || tr.children[i].textContent;

  const comparer = (i, asc) => (a, b) => ((v1, v2) =>
    v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2) ? v1 - v2 : v1.toString().localeCompare(v2)
  )(getCellValue(asc ? a : b, i), getCellValue(asc ? b : a, i));

  const ths = document.querySelectorAll('#SortAuctions > .column');

  ths.forEach(th => th.addEventListener('click', (function(){
    if(document.querySelector('.desc')){
      document.querySelector('.desc').classList.remove('desc');
    }
    if(document.querySelector('.asc')){
      document.querySelector('.asc').classList.remove('asc');
    }
    if(document.querySelector('.active-sort')){
      document.querySelector('.active-sort').classList.remove('active-sort');
    }
    this.classList.add('active-sort');
    
    if(this.asc){
      this.classList.remove('asc');
      this.classList.add('desc');
    }
    else{
      this.classList.remove('desc');
      this.classList.add('asc');
    }
    Array.from(tableContent.querySelectorAll('.row'))
      .sort(comparer(Array.from(th.parentNode.children).indexOf(th), this.asc = !this.asc))
      .forEach(tr => tableContent.appendChild(tr));
  })));
}

let showPage = () => {
  const links = document.querySelectorAll('#Pagination a');
  links.forEach(link => {
    link.addEventListener('click', function(e){
      e.preventDefault();
      if(link.classList.contains('active')){
        return
      }
      document.querySelector('#Pagination a.active').classList.remove('active');
      link.classList.add('active');
      showRegionAuctions(link.innerText);
    })
  });
}

let observedSearch = () => {
  const observedButton = document.getElementById('SafeSearch');
  observedButton.addEventListener('click', function(){
    let searches = [];
    let search = [];
    let filters = document.getElementById('Filters').elements;
      for(let i = 0; i < filters.length; i++){
        search.push(filters[i].value);
      };
    if(this.classList.contains('observed')){
      this.classList.remove('observed');
      alert('Usuwanie ' + search);
    }
    else{
      let popup = document.createElement('div');
      popup.id ='Popup';
      if(user.logged){
        popup.innerHTML = baza["Popups"].SearchObserveLoggedIn;
        this.classList.add('observed');
        alert('Test: dodano ' + search);
        searches.push(search);
      }
      else{
        popup.innerHTML = baza["Popups"].SearchObserveLoggedOut;  
      }
      
      let button = document.createElement('button');
      popup.appendChild(button);
      button.addEventListener('click', function(){
        popup.parentElement.removeChild(document.getElementById('Popup'));
      });
      document.body.appendChild(popup);
    }
  });
}

// testowe dane
let createTestUser = (id) => {
  
  let testUser = baza["Users"][id];
  
  user.id = testUser[0];
  user.name = testUser[1],
  user.email = testUser[2],
  user.passwd = testUser[3],
  user.logged = testUser[4],
  user.observedAuctions = testUser[5],
  user.observedSearch = testUser[6]
}

// pseudo Logowanie
let toogleLogin = () => {
  document.querySelector('#TopMenu li:last-of-type a').addEventListener('click', function() {
    let helloUser = document.querySelector("#UserPanel h2");
    if(user.logged == false){
      user.logged = true;
      this.innerText = "Wyloguj";
      helloUser.innerText = `Witaj, ${user.name}!`;
      document.body.classList.add('logged');
    }
    else{
      user.logged = false;
      this.innerText = "Logowanie / Rejestracja";
      helloUser.innerHTML = '';
      document.body.classList.remove('logged');
    }
  })
}

let addOptionsToFilters = () => {
  // Filters
  let filterRegion = document.getElementById('FilterRegion');
  let filterInspectorate = document.getElementById('FilterInspectorate');
  let filterType = document.getElementById('FilterType');
  let filterAssortment = document.getElementById('FilterAssortment');
  filterRegion.innerText = '';
  filterInspectorate.innerText = '';
  filterType.innerText = '';
  filterAssortment.innerText = '';
  
  // get values from pseudo database
  let regionName = '';
  let regionIndex = -1;
  baza["Regions"].forEach(region => {
    region.forEach((column, i) => {
      if(i == 0){
        regionsOptions.push(column);
        if(column !== regionName){
          regionName = column;
          let regionArr = [];
          rdlpOptions.push(regionArr);
          regionIndex++;
        }   
      }
      else if(i == 2){   
        rdlpOptions[regionIndex].push(column);
      }
      else if(i == 3){
        inspectoratesOptions.push(column);
      }
      else if(i == 4){
        typeOptions.push(column);
      }
      else if(i == 5){
        assortmentOptions.push(column);
      }
    })
  });
  // get unique values
  regionsOptions = [...new Set(regionsOptions)].sort();
  inspectoratesOptions = [...new Set(inspectoratesOptions)].sort();
  typeOptions = [...new Set(typeOptions)].sort();
  assortmentOptions = [...new Set(assortmentOptions)].sort();

  // group unique rdlp by regions
  rdlpOptions.forEach((rdlp, i) =>{
    rdlpOptions[i] = [...new Set(rdlp)].sort();
  });

  regionsOptions.forEach((region, index) => {
    let container = document.createElement('div');
    container.classList.add('region');
    let labelGroup = document.createElement('label');
    labelGroup.classList.add('heading');
    labelGroup.setAttribute('for', 'Region ' + ++index);
    labelGroup.innerText = 'Region ' + index;
    let checkboxGroup = document.createElement('input');
    checkboxGroup.type = 'checkbox';
    checkboxGroup.value = region;
    labelGroup.appendChild(checkboxGroup);
    container.appendChild(labelGroup);
    rdlpOptions[index-1].forEach(element => {
      let label = document.createElement('label');
      label.setAttribute('for', element);
      let checkbox = document.createElement('input');
      checkbox.value = element;
      checkbox.type = 'checkbox';
      label.innerText = element;
      container.appendChild(label);
      label.appendChild(checkbox);
    });
    filterRegion.appendChild(container);
  })
  

  inspectoratesOptions.forEach(element => {
    let option = document.createElement('option');
    option.value = element;
    option.innerText = element;
    filterInspectorate.appendChild(option);
  })

  typeOptions.forEach(element => {
    let option = document.createElement('option');
    option.value = element;
    option.innerText = element;
    filterType.appendChild(option);
  })

  assortmentOptions.forEach(element => {
    let option = document.createElement('option');
    option.value = element;
    option.innerText = element;
    filterAssortment.appendChild(option);
  })
  
}

let slideFilter = () => {
  let filterLabels = document.querySelectorAll("#Filters .filter > label");
  filterLabels.forEach(label => {
    label.addEventListener('click', function(){
      if(label.parentNode.classList.contains('active')){
        return
      }
      document.querySelector("#Filters .filter.active").classList.remove('active');
      label.parentNode.classList.add('active');
    })
  })
}