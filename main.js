const table = document.getElementById('TableAuctions');
const tableHeader = document.getElementById('SortAuctions');
const tableContent = document.getElementById('Auctions');

// pseudo baza
let baza = {};
let user = {};
let regionsOptions = [];
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
  .then(() => showRegionAuctions(1))
  .then(() => addOptionsToFilters())
  .then(() => showPage())
  .then(() => observedSearch());


let createTable = () => {
  baza["SortLabels"].forEach(label => {
    let column = document.createElement('div');
    column.classList.add('column');
    column.innerHTML = label;
    tableHeader.appendChild(column);
  });
}

let showRegionAuctions = (region) => {

  let observed = user.observedAuctions;
  
  tableContent.innerHTML = '';

  baza["Regions"][region - 1].forEach(auction => {
    let row = document.createElement('div');
    row.classList.add('row');
    auction.forEach((col, i) => {
      if(i == 0){
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
      if(i == auction.length - 1){
        column.innerHTML = `<a href="${col}" target="_blank">Link</a>`;
      }
      else{
        column.innerHTML = col;
      }
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
  baza["Regions"].forEach(region => {
    region.forEach(auction => {
      auction.forEach((el, i) => {
        if(i == 1){
          regionsOptions.push(el);
        }
        else if(i == 2){
          inspectoratesOptions.push(el);
        }
        else if(i == 3){
          typeOptions.push(el);
        }
        else if(i == 4){
          assortmentOptions.push(el);
        }
      });
    })
  });
  // get unique values
  regionsOptions = [...new Set(regionsOptions)].sort();
  inspectoratesOptions = [...new Set(inspectoratesOptions)].sort();
  typeOptions = [...new Set(typeOptions)].sort();
  assortmentOptions = [...new Set(assortmentOptions)].sort();

  regionsOptions.forEach(element => {
    let option = document.createElement('option');
    option.value = element;
    option.innerText = element;
    filterRegion.appendChild(option);
  });

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