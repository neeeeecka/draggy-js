# cross-platfrom-js
Some cool cross platform html5 js stuff that is useful

# draggy
**Simple initialization JS and HTML**

```javascript
initDraggy();
```

and **HyperTML**
```HTML
    <!--UID can be anything, but it has to be unique(different, or not same) for every element-->
    <!--add class = draggable for elements that you will drag, and class = drop, for elements which u will use for dropping objects in. -->
    <!-- also don't forget rect class, its used in initialization for some stuff -->

    <div class="draggable rect" uid="drag1"></div>
    <div class="draggable rect" uid="drag14"></div>
    <div class="draggable rect" uid="dr4ag14"></div>

    <div class="drop rect" uid="dr32323op1"></div>
    <div class="drop rect" uid="drop31"></div>

```


**customized init(all parameters are optional)**

```javascript
        //time (in seconds) for element to become draggable after user touches(or clicks) it. (can be 0 or anything, not sure about negative time though)
        dragStartTime: 0.3,
        
        //fired when user just clicked(or touched) draggable object.
        onStart: function (obj) {
            $("#state").html("start");
        },
        
        //fired after element actually becomes draggable(after timer)(
        onEnable: function (obj) {
            $("#state").html("enabled");
        },
        //fired when user is dragging an element over the screen using mouse or finger or anything
        onDrag: function (obj) {
            $("#state").html("dragging");
        },
        //fired when user halts an object after moving it, but still doesn't release it
        onHalt: function (obj) {
            $("#state").html("halt");
        },
        //fired when draggable is dropped into "drop" object
        onDrop: function (obj, target) {
            $("#state").html("drop");
        },
        //lastly, just a fancy function for current state, could be used instead of using 4 functions above.
        /*
                basically:
                onStart = 0
                onEnable = 1
                onDrag = 2
                onHalt = 3
                onDrop = 4
        */
        pointerState: function (pstate) {
            $("#dragstate").html("pointer state is: " + pstate);
        }

```

**Also, when element becomes draggable, `.ghost` class is added to its cloned ghost**
Codepen: 


