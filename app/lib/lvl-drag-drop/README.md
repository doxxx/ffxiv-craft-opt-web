#Native AngularJs drag and drop directive#

An easy to use, native, directive to enable drag/drop in your angular app.  This directive has no dependency on jQuery or other frameworks, it does require a browser that supports the HTML5 drag/drop events.

[Live Demo](http://logicbomb.github.io/ng-directives/drag-drop.html)

[Documentation](http://jasonturim.wordpress.com/2013/09/01/angularjs-drag-and-drop/)


##UUID Service##
A very simple service for working with [UUIDs](http://en.wikipedia.org/wiki/Universally_unique_identifier).

[Live Demo](http://logicbomb.github.io/ng-directives/uuid.html)

[Documentation](http://jasonturim.wordpress.com/2013/09/01/angularjs-drag-and-drop/)

## dataTransfer hack

The jQuery event object does not have a dataTransfer property... true, but one can try:


    jQuery.event.props.push('dataTransfer');
