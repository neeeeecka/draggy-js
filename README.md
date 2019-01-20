# cross-platfrom-js
Some cool cross platform html5 js stuff that is useful

# draggy
**Simple initialization**

```javascript
initDraggy();
```

**customized init(all parameters are optional)**

```javascript
        onStart: function (obj) {
            $("#state").html("start");

        },
        onEnable: function (obj) {
            $("#state").html("enabled");

        },
        onDrag: function (obj) {
            $("#state").html("dragging");

        },
        onHalt: function (obj) {
            $("#state").html("halt");

        },
        onDrop: function (obj, target) {
            $("#state").html("drop");

        },
        dragStartTime: 0.3,
        pointerState: function (pstate) {
            $("#dragstate").html("pointer state is: " + pstate);
        }

```
