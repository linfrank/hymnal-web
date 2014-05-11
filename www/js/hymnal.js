/*global console, $, makePage, updateNav, document, window */

var hymnBooks = {
  'LSM.English' : { title : 'Hymns', hymns : null, topics : null, numMap : null }
};

var hymnBookUrls = {
  'LSM.English' : 'data/LSM/English/'
};

var currBookId = 'LSM.English';
var currPage = -1;

var navLock = false;

function flipTime(){
  var time = $('#page-container').width() * 0.7;
  return Math.max(350, Math.min(850, time));
}

function loadBook(bookId, df, ff){
  var url = hymnBookUrls[bookId]+'hymns.json';
  console.log('Retrieving ' + bookId + ' from ' + url);
  $.ajax({
    url: url,
    timeout: 5000,
    dataType: 'json'
  })
  .done(function(data){
    console.log('Retrieved book: ' + bookId);
    var book = hymnBooks[bookId];
    // insert downloaded data
    book.hymns = data;
    // populate book number -> hymn mapping
    book.numMap = {};
    for(var i = 0; i < data.length; i++){
      book.numMap[data[i].properties.BookNumber]=i;
    }
    console.log('Numbers mapped for: ' + bookId);
    df(data);
  })
  .fail(function(jqXHR, textStatus, errorThrown){
    console.log('Error retrieving book: ' + bookId);
    console.log(jqXHR);
    console.log(textStatus);
    console.log(errorThrown);
    ff(jqXHR, textStatus, errorThrown);
  });
}

function loadHymnByPage(bookId, page, cb){
  var book = hymnBooks[bookId];
  var error;
  if(book === undefined || book.hymns === undefined){
    error = Error('Cannot load hymn page ' + page +
                  ' because current book (' + bookId + ') is not loaded!');
    console.error(error);
    if(cb && cb.fail) cb.fail(error);
  }
  else if(page === undefined){
    error = Error('Page is undefined!');
    console.error(error);
    if(cb && cb.fail) cb.fail(error);
  }
  else{
    if(page < 0 || page >= book.hymns.length){
      error = Error('Hymn page ' + page + ' does not exist!');
      console.error('Hymn page ' + page + ' does not exist!');
      if(cb && cb.fail) cb.fail(error);
    }
    else{
      var hymn = book.hymns[page];
      if(cb && cb.success) cb.success(hymn);
    }
  }
}

function getHymnByPage(bookId, page){
  var book = hymnBooks[bookId];
  if(book === undefined || book.hymns === undefined){
    console.error(Error('Cannot load page ' + page + ' because current book (' + bookId + ') is not loaded!'));
    return null;
  }
  else if(page === undefined){
    console.error(Error('Page is undefined!'));
    return null;
  }
  else if(page < 0 || page >= book.hymns.length){
    console.error(Error('Hymn page ' + page + ' does not exist!'));
    return null;
  }
  else{
    return book.hymns[page];
  }
}

function jumpToPage(bookId, page, cb){
  loadHymnByPage(
    bookId, page, {
      success: function(data){
        currPage = page;
        $('#number-search-input').val('').blur().attr('placeholder', data.properties.BookNumber);
        $('#page-container').children().transition(
          {scale: 0.75, opacity : 0}, flipTime()/2, 'out', function(){
            this.remove();
            var newPage = $(makePage(data)).css({scale: 0.75, opacity : 0});
            $('#page-container').append(newPage);
            newPage.transition({scale: 1, opacity : 1}, flipTime()/2, 'in', function(){
              updateNav(data);
              if (cb && cb.success) cb.success(data);
            }); 
          }); 
      },
      fail: function(error){
        if (cb && cb.fail) cb.fail(error);
      }
    });
}

function jumpToNumber(bookId, number, cb){
  var page = hymnBooks[bookId].numMap[number];
  if (page === undefined) {
    $('#number-search-input').css('text-decoration','line-through').focus();
  }
  else {
    jumpToPage(bookId, page);
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
  else return hymnBooks[currBookId].hymns.length-1;
}

function nextPage(){
  if(currPage < hymnBooks[currBookId].hymns.length-1) return currPage + 1;
  else return 0;
}

function nextHymn(){
  // Lock navigation
  if(navLock) return; else navLock = true;
  // Find next page
  currPage = nextPage();
  // Load next page
  loadHymnByPage(
    currBookId, currPage, {
      success: function(data){
        // scroll to top
        //window.scrollTo(0, 0);
        //$('html, body').animate({scrollTop: 0}, flipTime());
        // Create new page
        var newPage = $(makePage(data))
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
          $('#number-search-input').val('').blur().attr('placeholder', data.properties.BookNumber);
          navLock = false;
        });
      }
    });
}

function prevHymn(){
  // Lock navigation
  if(navLock) return; else navLock = true;
  // Find previous page
  currPage = prevPage();
  // Load previous page
  loadHymnByPage(
    currBookId, currPage, {
      success: function(data){
        // scroll to top
        //window.scrollTo(0, 0);
        //$('html, body').animate({scrollTop: 0}, flipTime());
        // Get old page
        var oldPage = $('#page-container').children();
        // Create new page
        var newPage = $(makePage(data))
        .css({transform : 'translate(-100%,0)', 'z-index' : 1000}); // set up flip position
        // Add new page
        $('#page-container').append(newPage);
        // Transition in new page
        newPage.transition({x : '0'}, flipTime(), 'out', function(){
          this.css({'z-index' : ''});
          // Update hymn number
          $('#number-search-input').val('').blur().attr('placeholder', data.properties.BookNumber);
          // Unlock navigation
          navLock = false;
        });
        // Transition out old page
        oldPage.transition({scale: 0.75, opacity: 0}, flipTime(), 'out', function(){
          this.remove();
        });
      }
    });
}

function pageSwipeSimple(event, direction, distance, duration, fingerCount) {
  if(direction == $.fn.swipe.directions.RIGHT) prevHymn();
  else if(direction == $.fn.swipe.directions.LEFT) nextHymn();
}


/*
var swiping = false;
var swipingStartX = 0;
var swipingDir = '';
var swipingAnimating = false;
var leftPage = null;
var rightPage = null;

function pageSwipe(event, phase, direction, distance, duration) {


  console.log(phase);
  console.log(direction);
  console.log(distance);
  console.log(duration);


  if(phase == 'move' && !swiping){
    swiping = true;
    swipingDir = direction;
    if(direction == 'left'){
      var nextHymn = getHymnByPage(currBookId, nextPage());
      if(nextHymn !== null){
        leftPage = $('#page-container').children()
        .css({'z-index' : 1000});
        rightPage = $(makePage(nextHymn))
        .css({top : 0}) // set up position
        .css({scale: 0.75, opacity: 0}); // set up flip transition
        // Add new page
        $('#page-container').append(rightPage);
      }
    }
    else if(direction == 'right'){
      var prevHymn = getHymnByPage(currBookId, prevPage());
      if(prevHymn !== null){
        rightPage = $('#page-container').children();
        leftPage = $(makePage(prevHymn))
        .css({transform : 'translate(-100%,0)', 'z-index' : 1000}); // set up flip position
        // Add new page
        $('#page-container').append(leftPage);
      }
    }
  }
  else if(phase == 'move' && swiping){
    if(!swipingAnimating){
      swipingAnimating = true;
      var pageWidth = $(window).width();
      var rTrans = direction == 'left' ? -distance : distance;
      leftPage.transition({x : rTrans}, 50, 'linear', function(){
        swipingAnimating = false;
      });
    }
    /*
    var lScale = distance / pageWidth * 0.25;
    lScale = direction == 'left' ? lScale : -lScale;
    var lOpacity = distance / pageWidth;
    lOpacity = direction == 'left' ? lOpacity : 1-lOpacity;
    leftPage.transition({scale : '+=' + lScale, opacity : '+=' + lOpacity}, 100, 'linear');
    
  }
  else if(phase == 'end'){

  }  


}
*/

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
  //$("#page-container").swipe({swipeStatus : pageSwipe, allowPageScroll : 'vertical'});

  // Load book!
  loadBook(currBookId,function(){jumpToPage(currBookId, currPage = 0);});

}
