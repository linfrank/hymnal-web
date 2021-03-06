/*global console, $, makeHymnPage, updateNav, document, window, Bloodhound, Handlebars */

var bookshelf = {}; // catalog of hymnbooks (hymnals)
var hymnstore = {}; // data store of hymns
var searchbase = []; // search data base

var currBookId;
var currPage = -1;

var navLock = false;

function latency() {
  return new Date().getTime() - hymnpageLatencyStartMs;
}

function flipTime(){
  var time = $('#page-container').width() * 0.8;
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
  console.log('Retrieving hymns from ' + url + ' [' + latency() + ']');
  $.ajax({
    url: url,
    timeout: 5000,
    dataType: 'json',
    xhr: function() {
      var xhr = new window.XMLHttpRequest();
      xhr.addEventListener("progress", function(evt) {
        if (evt.lengthComputable) {
          var percentComplete = evt.loaded / evt.total * 100;
          $('#progress-bar').css('width', Math.max((percentComplete / 2), 5) + '%');
        }
      }, false);
      return xhr;
    }
  })
  .done(function(hymns){
    console.log('Retrieved ' + hymns.length + ' hymns' + ' [' + latency() + ']');
    for(var i = 0; i < hymns.length; i++){
      // add to hymn store
      hymnstore[hymns[i].id] = hymns[i];
    }
    console.log('Loaded ' + hymns.length + ' hymns into hymnstore' + ' [' + latency() + ']');
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
  console.log('Retrieving hymnbook from ' + url + ' [' + latency() + ']');
  $.ajax({
    url: url,
    timeout: 3000,
    dataType: 'json'
  })
  .done(function(hymnal){
    console.log('Retrieved hymnbook: ' + hymnal.id + ' [' + latency() + ']');
    bookshelf[hymnal.id] = hymnal;
    hymnal.pages = []; hymnal.pages.length = hymnal.order.length; // page -> number
    hymnal.numbers = {}; // number -> page
    for(var i = 0; i < hymnal.order.length; i++){
      hymnal.pages[i] = hymnal.order[i];
      hymnal.numbers[hymnal.order[i]] = i;
    }
    console.log('Loaded data for hymnbook: ' + hymnal.id + ' [' + latency() + ']');
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
    return bookshelf[bookId];
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
    $('#number-display').text(book.pages[currPage]);
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
}

function jumpToNumber(bookId, number, cb){
  if(checkVar(bookId, "Book ID") && checkVar(bookId, "Hymn number")){
    jumpToPage(bookId, bookshelf[bookId].numbers[number]);
  }
}

function prevPage(){
  if(currPage > 0) return currPage - 1;
  else return bookshelf[currBookId].pages.length - 1; // this covers title page case (currPage == -1)
}

function nextPage(){
  if(currPage < bookshelf[currBookId].pages.length - 1 && currPage >= 0) return currPage + 1;
  else return 0; // title page case (currPage == -1)
}

function nextHymn(){
  // Clear and remove focus from text search
  $('#text-search-input').blur().typeahead('val', '');
  // Lock navigation
  if(navLock) return; else navLock = true;
  // Find next page
  currPage = nextPage();
  // Load next page
  var book = getHymnbook(currBookId);
  var hymn = getHymnByPage(book, currPage);
  if(checkVar(hymn, 'Hymn')){
    //window.scrollTo(0, 0); // jump to top
    $('html, body').animate({scrollTop: 0}, flipTime()); // scroll to top
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
      $('#number-display').text(book.pages[currPage]);
      navLock = false;
    });
  }
}

function prevHymn(){
  // Clear and remove focus from text search
  $('#text-search-input').blur().typeahead('val', '');
  // Lock navigation
  if(navLock) return; else navLock = true;
  // Find previous page
  currPage = prevPage();
  // Load previous page
  var book = getHymnbook(currBookId);
  var hymn = getHymnByPage(book, currPage);
  if(checkVar(hymn, 'Hymn')){
    //window.scrollTo(0, 0); // jump to top
    $('html, body').animate({scrollTop: 0}, flipTime()); // scroll to top
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
      $('#number-display').text(book.pages[currPage]);
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

function indexSearchbase(bookId) {

  var book = bookshelf[bookId];
  for(var number in book.binding){
    var hymnId = book.binding[number];
    var hymn = hymnstore[hymnId];
    if(checkVar(hymn)){
      var lineSet = {};
      for(var j = 0; j < hymn.song.length; j ++) {
        var section = hymn.song[j].lines;
        // Because single line is a too small a unit for indexing, we bundle every two lines.
        for(var k = 0; k < section.length;) {
          // If it's the first line of the hymn, add the hymn number to indexing.
          var line = '';
          if(j == 0 && k == 0) {
            line += '#' + number + ' ';
          }
          // Add the odd line to index unit
          line += section[k];
          k ++;
          // Add the next even line to unit if it exists.
          if(k < section.length) {
            line = line + ' ' + section[k];
            k ++;
          }
          // Add the next odd line if it's the last line of the section.
          if(k == section.length - 1) {
            line = line + ' ' + section[k];
            k ++;
          }
          // Add line bundle to set.
          if(checkVar(line)) lineSet[line] = null; // just the key, no value
        }
      }
      // Index all the two-line bundles.
      for(var key in lineSet){
        searchbase.push({
          line: key,
          bookId: bookId,
          bookName: book.title,
          number: number
        });
      }
    }
  }
}

function setupTypeAhead(data, df) {

  console.log('Indexing searchbase' + ' [' + latency() + ']');

  $('#progress-bar').css('width', '50%');

  indexSearchbase('LSM.English');

  $('#progress-bar').css('width', '75%');

  console.log('Finished indexing searchbase' + ' [' + latency() + ']');

  var hymnbh = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.obj.nonword('line'),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: searchbase,
    limit: 10
  });

  // kicks off the loading/processing of `local` and `prefetch`
  hymnbh.initialize();

  console.log('Finished initializing bloodhound' + ' [' + latency() + ']');

  $('#text-search-input')
  .typeahead({
    hint: false,
    highlight: true,
    minLength: 1
  },
  {
    name: 'hymnbh',
    displayKey: 'line',
    source: hymnbh.ttAdapter(),
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    templates: {
      header:
      '<span class="hymn-suggestion-book">' +
      bookshelf['LSM.English'].title +
      '</span>',
      suggestion: Handlebars.compile(
        '<div class="panel panel-default hymn-suggestion"><div class="panel-body">' +
        '<span class="hymn-suggestion-line">{{line}}</span>' +
        '<span class="hymn-suggestion-number">{{number}}</span>' +
        '</div></div>'
        )
    }
  })
  .on('typeahead:selected', function(event, data) {
    jumpToNumber(data.bookId,data.number);
    $('#text-search-input').blur().typeahead('val', '');
  });

  // set typeahead suggestion height
  $('#text-search-input ~ .tt-dropdown-menu')
  .css(
    'max-height',
    ($(window).height() - $('#text-search-input').offset().top - $('#text-search-input').height() - 50) + 'px'
  );

  if (df) df();
}

function initHymn(){

 // Adjust base (root element) font size for cross-browser typography consistency.
 // This only work for local fonts since it's called within $(document).ready().
 var adjustedFontSize = getAdjustedFontSize(
  20,
  $(document.body).css('font-family'),
  'mmmmmmmmmm',
  140,
  170)
 document.documentElement.style.fontSize = adjustedFontSize + 'px';
 console.log('Adjusted base font size: ' + document.documentElement.style.fontSize + ' [' + latency() + ']');

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
  $("#page-container").swipe({swipeLeft : pageSwipeSimple, swipeRight : pageSwipeSimple, allowPageScroll : "auto", threshold : 150});

  // Load book!
  loadHymnbook(
    'data/LSM.English.hymnal.json',
    function(hymnbook){
      // Start loading progress after hymnbook data is retrieved
      $('.hymn-page').empty().append(
        $(makeCoverPage(hymnbook.title))
      );
      loadHymns('data/LSM.English.hymns.json', function(hymns) {
        return setupTypeAhead(hymns, function() {
          currBookId = 'LSM.English';
          currPage = -1; // title page that goes away after any navigation action
          console.log('Finished loading' + ' [' + latency() + ']');
          // Remove progress bar after everything is ready to go
          $('#progress-bar')
          .css('width', '100%').addClass('fader')
          .parent().addClass('fader');
        });
      });
    }
  );
}
