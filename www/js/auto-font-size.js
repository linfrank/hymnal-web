/*global $ */

/*
 * Automatically sizes fonts based on maximum / minimum width for a input string at a px font size.
 * 
 * This is a generic solution for adjusting font sizes across browsers with different fallback
 * fonts (e.g., Android browsers defaults to "Noto Serif" for "serif" and iPhone to "Times").
 *
 * A good recommended test string would be a series of m's or i's.
 *
 * Algorithm description:
 * 1) Create a span in body with test string and test font family.
 * 2) Set adjusted size to the test size.
 * 3) If the test string is below the minimum width at adjusted size, increase the adjusted size until it exceeds the minimum.
 * 4) If the test string exeeds the maximum width at adjusted size, decrease the adjusted size until it is below the maximum.
 * 5) Return the adjusted size.
 *
 * Note that:
 * a) If the test string falls within the range, the adjusted size is not changed.
 * b) It the min/max bounds are too tight to both be satisfied, we prefer the max bound over the min bound.
 *
 * Q/A:
 * Why try to fit width instead of height?
 * Width often determine the number of lines a certain text is to continue on a new line, so it has
 * a higher style/overall impact to the flow of the page.
 *
 * Partly inspired by http://www.lalit.org/lab/javascript-css-font-detect/
 */

 function getAdjustedFontSize(referenceSize, referenceFontFamily, referenceString, minWidth, maxWidth){
  var body = document.body;
  var span = document.createElement('span');
  $(span)
    .css('font-size', referenceSize + 'px')
    .css('font-family', referenceFontFamily)
    .text(referenceString);
  body.appendChild(span);
  if (span.offsetWidth != undefined && span.offsetWidth > 0) {
    while (span.offsetWidth < minWidth) {
      span.style.fontSize = (++referenceSize) + 'px';
    }
    while (span.offsetWidth > maxWidth) {
      span.style.fontSize = (--referenceSize) + 'px';
    }
  }
  body.removeChild(span);
  return referenceSize;
}
