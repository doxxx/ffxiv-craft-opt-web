(function () {
  'use strict';

  // scrollIntoViewIfNeeded polyfill for Firefox and IE
  // Based on https://gist.github.com/hsablonniere/2581101
  if (!Element.prototype.scrollIntoViewIfNeeded) {
    Element.prototype.scrollIntoViewIfNeeded = function (centerIfNeeded) {
      centerIfNeeded = arguments.length === 0 ? true : !!centerIfNeeded;

      var parent = this.parentNode,
        parentComputedStyle = window.getComputedStyle(parent, null),
        parentBorderTopWidth = parseInt(parentComputedStyle.getPropertyValue('border-top-width')),
        parentBorderLeftWidth = parseInt(parentComputedStyle.getPropertyValue('border-left-width')),
        overTop = this.offsetTop - parent.offsetTop < parent.scrollTop,
        overBottom = (this.offsetTop - parent.offsetTop + this.clientHeight - parentBorderTopWidth) > (parent.scrollTop + parent.clientHeight),
        overLeft = this.offsetLeft - parent.offsetLeft < parent.scrollLeft,
        overRight = (this.offsetLeft - parent.offsetLeft + this.clientWidth - parentBorderLeftWidth) > (parent.scrollLeft + parent.clientWidth);

      if (centerIfNeeded) {
        if (overTop || overBottom) {
          parent.scrollTop = this.offsetTop - parent.offsetTop - parent.clientHeight / 2 - parentBorderTopWidth + this.clientHeight / 2;
        }

        if (overLeft || overRight) {
          parent.scrollLeft = this.offsetLeft - parent.offsetLeft - parent.clientWidth / 2 - parentBorderLeftWidth + this.clientWidth / 2;
        }
      }
      else {
        if (overTop) {
          parent.scrollTop = this.offsetTop - parent.offsetTop - parentBorderTopWidth;
        }

        if (overBottom) {
          parent.scrollTop = this.offsetTop - parent.offsetTop - parentBorderTopWidth - parent.clientHeight + this.clientHeight;
        }

        if (overLeft) {
          parent.scrollLeft = this.offsetLeft - parent.offsetLeft - parentBorderLeftWidth;
        }

        if (overRight) {
          parent.scrollLeft = this.offsetLeft - parent.offsetLeft - parentBorderLeftWidth - parent.clientWidth + this.clientWidth;
        }
      }
    };
  }

  // Remove Accent from source (ex: ùéèûà will be returned as ueeua).
  // Use to compare string without accents
  // ---------------------------------------------------
  String.prototype.removeAccent = function(){
      var accent = [
              /[\300-\306]/g, /[\340-\346]/g, // A, a
              /[\310-\313]/g, /[\350-\353]/g, // E, e
              /[\314-\317]/g, /[\354-\357]/g, // I, i
              /[\322-\330]/g, /[\362-\370]/g, // O, o
              /[\331-\334]/g, /[\371-\374]/g, // U, u
              /[\321]/g, /[\361]/g, // N, n
              /[\307]/g, /[\347]/g, // C, c
          ],
          noaccent = ['A','a','E','e','I','i','O','o','U','u','N','n','C','c'];

      var str = this;
      for (var i = 0; i < accent.length; i++){
          str = str.replace(accent[i], noaccent[i]);
      }

      return str;
  };
})();
