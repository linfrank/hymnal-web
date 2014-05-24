/*global console, $, makeHymnPage, updateNav, document, window */

var hymnbooks = {}; // catalog of hymnbooks (hymnals)
var hymnstore = {}; // data store of hymns

var currBookId;
var currPage = -1;

var navLock = false;

function flipTime(){
  var time = $('#page-container').width() * 0.7;
  return Math.max(350, Math.min(850, time));
}

function checkVar(x, name){
  if(x === null || x === undefined){
    console.error(name + ' is ' + x + '!');
    return false;
  }
  else{
    return true;
  }
}

function loadHymns(url, df, ff){
  console.log('Retrieving hymns from ' + url);
  $.ajax({
    url: url,
    timeout: 5000,
    dataType: 'json'
  })
  .done(function(hymns){
    console.log('Retrieved ' + hymns.length + ' hymns');
    for(var i = 0; i < hymns.length; i++){
      hymnstore[hymns[i].id] = hymns[i];
    }
    console.log('Loaded ' + hymns.length + ' hymns into hymnstore');
    df(hymns);
  })
  .fail(function(jqXHR, textStatus, errorThrown){
    console.log('Error retrieving hymns from ' + url);
    console.log(jqXHR);
    console.log(textStatus);
    console.log(errorThrown);
    ff(jqXHR, textStatus, errorThrown);
  });
}

function loadHymnbook(url, df, ff){
  console.log('Retrieving hymnbook from ' + url);
  $.ajax({
    url: url,
    timeout: 3000,
    dataType: 'json'
  })
  .done(function(hymnal){
    console.log('Retrieved hymnbook: ' + hymnal.id);
    hymnbooks[hymnal.id] = hymnal;
    hymnal.pages = new Array(hymnal.order.length); // page -> number
    hymnal.numbers = {}; // number -> page
    for(var i = 0; i < hymnal.order.length; i++){
      hymnal.pages[i] = hymnal.order[i];
      hymnal.numbers[hymnal.order[i]] = i;
    }
    console.log('Loaded data for hymnbook: ' + hymnal.id);
    if(df) df(hymnal);
  })
  .fail(function(jqXHR, textStatus, errorThrown){
    console.log('Error retrieving hymnbook from ' + url);
    console.log(jqXHR);
    console.log(textStatus);
    console.log(errorThrown);
    if(ff) ff(jqXHR, textStatus, errorThrown);
  });
}

function getHymnbook(bookId){
  if(checkVar(bookId, 'Book ID')){
    return hymnbooks[bookId];
  }
}

function getHymnById(hymnId){
  if(checkVar(hymnId, 'Hymn ID')){
    return hymnstore[hymnId];
  }
}

function getHymnByNumber(book, number){
  if(checkVar(book, 'Book') && checkVar(number, 'Hymn number')){
    var id = book.binding[number];
    if(checkVar(id, 'Hymn id')) return hymnstore[id];
  }
}

function getHymnByPage(book, page){
  if(checkVar(book, 'Book') && page >= 0 && page < book.pages.length){
    return getHymnByNumber(book, book.pages[page]);
  }
}

function jumpToPage(bookId, page, cb){
  var book = getHymnbook(bookId);
  var hymn = getHymnByPage(book, page);
  if(checkVar(hymn, 'Hymn')){
    currPage = page;
    $('#number-search-input').val('').blur().attr('placeholder', book.pages[currPage]);
    $('#page-container').children().transition(
      {scale: 0.75, opacity : 0}, flipTime()/2, 'out', function(){
        this.remove();
        var newPage = $(makeHymnPage(hymn)).css({scale: 0.75, opacity : 0});
        $('#page-container').append(newPage);
        newPage.transition({scale: 1, opacity : 1}, flipTime()/2, 'in', function(){
          updateNav(hymn);
          if (cb && cb.success) cb.success(hymn);
        }); 
      }); 
  }
  else{
    $('#number-search-input')
    .css('text-decoration', 'line-through')
    .focus();
    if (cb && cb.fail) cb.fail();
  }
}

function jumpToNumber(bookId, number, cb){
  if(checkVar(bookId, "Book ID") && checkVar(bookId, "Hymn number")){
    jumpToPage(bookId, hymnbooks[bookId].numbers[number]);
  }
}

function clearTextDec(){
  $('#number-search-input').css('text-decoration','none');
}

function numberInputEvent(event){
  if(
    event.keyCode == 9 || // tab / next
    event.keyCode == 13 // enter
  ){
    jumpToNumber(currBookId, $('#number-search-input').val());
  }
}

function prevPage(){
  if(currPage > 0) return currPage - 1;
  else return hymnbooks[currBookId].pages.length-1;
}

function nextPage(){
  if(currPage < hymnbooks[currBookId].pages.length-1) return currPage + 1;
  else return 0;
}

function nextHymn(){
  // Lock navigation
  if(navLock) return; else navLock = true;
  // Find next page
  currPage = nextPage();
  // Load next page
  var book = getHymnbook(currBookId);
  var hymn = getHymnByPage(book, currPage);
  if(checkVar(hymn, 'Hymn')){
    //window.scrollTo(0, 0); // jump to top
    //$('html, body').animate({scrollTop: 0}, flipTime()); // scroll to top
    // Create new page
    var newPage = $(makeHymnPage(hymn))
    .css({top : 0}) // set up position
    .css({scale: 0.75, opacity: 0}); // set up flip transition
    // Transition out old page and remove it
    $('#page-container').children()
    .css({'z-index' : 1000})
    .transition({x : '-100%'}, flipTime(), 'out', function(){
      this.remove();
    });
    // Add new page
    $('#page-container').append(newPage);
    newPage.transition({scale: 1, opacity: 1}, flipTime(), 'out', function(){
      // Update hymn number
      $('#number-search-input').val('').blur().attr('placeholder', book.pages[currPage]);
      navLock = false;
    });
  }
}

function prevHymn(){
  // Lock navigation
  if(navLock) return; else navLock = true;
  // Find previous page
  currPage = prevPage();
  // Load previous page
  var book = getHymnbook(currBookId);
  var hymn = getHymnByPage(book, currPage);
  if(checkVar(hymn, 'Hymn')){
    //window.scrollTo(0, 0); // jump to top
    //$('html, body').animate({scrollTop: 0}, flipTime()); // scroll to top
    // Get old page
    var oldPage = $('#page-container').children();
    // Create new page
    var newPage = $(makeHymnPage(hymn))
    .css({transform : 'translate(-100%,0)', 'z-index' : 1000}); // set up flip position
    // Add new page
    $('#page-container').append(newPage);
    // Transition in new page
    newPage.transition({x : '0'}, flipTime(), 'out', function(){
      this.css({'z-index' : ''});
      // Update hymn number
      $('#number-search-input').val('').blur().attr('placeholder', book.pages[currPage]);
      // Unlock navigation
      navLock = false;
    });
    // Transition out old page
    oldPage.transition({scale: 0.75, opacity: 0}, flipTime(), 'out', function(){
      this.remove();
    });
  }
}

function pageSwipeSimple(event, direction, distance, duration, fingerCount) {
  if(direction == $.fn.swipe.directions.RIGHT) prevHymn();
  else if(direction == $.fn.swipe.directions.LEFT) nextHymn();
}

function initHymn(){

  // Handle key events
  $(window).keydown(function(event){
    // enter & tab
    if(event.keyCode == 13 || event.keyCode == 9){
      event.preventDefault();
      return false;
    }
    // left
    else if(event.keyCode == 37){
      event.preventDefault();
      prevHymn();
    }
    // right
    else if(event.keyCode == 39){
      event.preventDefault();
      nextHymn();
    }
  });

  // Handle swipe events
  $("#page-container").swipe({swipeLeft : pageSwipeSimple, swipeRight : pageSwipeSimple, allowPageScroll : "auto"});  


  // Load book!
  loadHymnbook(
    'data/LSM.English.hymnal.json',
    function(data){
      loadHymns(
      'data/LSM.English.hymns.json',
      function(data){
        jumpToPage(currBookId = 'LSM.English', currPage = 0);
      });
    });

}
