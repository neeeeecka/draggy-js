class Draggy {
    static init(settings) {

        $(document).ready(function () {

            if (settings === undefined) {
                settings = {
                    dragStartTime: 0.5
                };
            }
            if (settings.allowDrag === undefined) {
                settings.allowDrag = function () {
                    return true;
                };
            }
            if (settings.allowDrop === undefined) {
                settings.allowDrop = function () {
                    return true;
                };
            }

            var dragStartTime = settings.dragStartTime * 1000;

            class Rectangle {
                constructor(startPosition, obj, uid) {
                    this.startPosition = startPosition;
                    this.obj = obj;
                    this.uid = uid;
                }

                setPointer(w, h) {
                    this.pointerWidth = w;
                    this.pointerHeight = h;
                }
                setPointerPos(vec) {
                    this.pointerPos = new Vector2(vec.x, vec.y);
                }

                setPosition(pos) {
                    this.obj[0].style.transform = "translate(" + pos.x + "px, " + pos.y + "px)";
                }

                getPosition() {
                    return this.obj.offset;
                }

                resetPosition() {
                    this.setPosition(this.startPosition);
                }

                intersects(rect) {
                    return !(
                        ((this.obj.offset().top + this.obj.height()) < (rect.obj.offset().top)) ||
                        (this.obj.offset().top > (rect.obj.offset().top + rect.obj.height())) ||
                        ((this.obj.offset().left + this.obj.width()) < rect.obj.offset().left) ||
                        (this.obj.offset().left > (rect.obj.offset().left + rect.obj.width()))
                    );
                }
                pointerIntersects(rect) {
                    return !(
                        ((this.pointerPos.top + this.pointerHeight) < (rect.obj.offset().top)) ||
                        (this.pointerPos.top > (rect.obj.offset().top + rect.obj.height())) ||
                        ((this.pointerPos.left + this.pointerWidth) < rect.obj.offset().left) ||
                        (this.pointerPos.left > (rect.obj.offset().left + rect.obj.width()))
                    );
                }

            }

            class Vector2 {
                constructor(x, y) {
                    this.x = x;
                    this.y = y;
                }
                add(vec) {
                    return new Vector2(this.x + vec.x, this.y + vec.y);
                }
                subtract(vec) {
                    return new Vector2(this.x - vec.x, this.y - vec.y);
                }
            }

            var interval;

            var dragState = false;
            var useTime = false;

            var dragBoxes = {};
            var dropBoxes = {};

            initBoxes();

            var startOffset = new Vector2(0, 0);
            var cursorPos = new Vector2(0, 0);
            var cursorGhost = new Rectangle(0, 0, null, "777cuHc>V2Q");
            cursorGhost.setPointer(1, 1);


            function initBoxes() {


                $(".rect").each(function () {
                    var dbx = new Rectangle(new Vector2($(this).offset().left, $(this).offset().top), $(this), $(this).attr("uid"));

                    if ($(this).hasClass("draggable")) {
                        dragBoxes[$(this).attr("uid")] = dbx;
                        console.log("init drag");
                    }
                    if ($(this).hasClass("drop")) {
                        dropBoxes[$(this).attr("uid")] = dbx;
                        console.log("init drop");
                    }
                });
            }

            $(".draggable").bind("touchstart mousedown", function (e) {
                var action = true;

                if (isMobile != true) {
                    if (e.which != 1) {
                        action = false;
                    }
                }

                if (settings.allowDrag.call(this, e)) {
                    if (!action) return;


                    if (useTime) return;

                    useTime = true;

                    interval = setInterval(ghostDraggable, dragStartTime, $(this).attr("uid"));

                    disable_scroll_mobile();

                    if (settings.pointerState !== undefined)
                        settings.pointerState(0);

                    if (settings.onStart === undefined) return;
                    settings.onStart.call(this, e);
                }

            });

            var currentGhost = null;
            var mouseTimer = null;

            function ghostDraggable(uid) {
                clearInterval(interval);
                var newGhostObj = dragBoxes[uid].obj.clone().appendTo("body");
                newGhostObj.width(dragBoxes[uid].obj.width());
                newGhostObj.height(dragBoxes[uid].obj.height());
                newGhostObj.addClass("ghost");

                console.log(newGhostObj);

                currentGhost = new Rectangle(new Vector2(0, 0), newGhostObj, uid);
                currentGhost.setPosition(new Vector2(
                    dragBoxes[uid].obj.offset().left,
                    cursorPos.y - dragBoxes[uid].obj.height() / 2));

                startOffset = new Vector2(
                    cursorPos.x - currentGhost.obj.offset().left,
                    cursorPos.y - currentGhost.obj.offset().top);

                useTime = false;
                dragState = true;
                if (settings.pointerState !== undefined)
                    settings.pointerState(1);

                if (settings.onEnable === undefined) return;
                //calback
                settings.onEnable.call(dragBoxes[uid].obj);
            }


            $(window).bind("touchmove mousemove", function (e) {
                if (!dragState) return;
                requestAnimationFrame(moveGhost);
            });

            function moveGhost() {
                currentGhost.setPosition(cursorPos.subtract(startOffset));

                if (settings.pointerState !== undefined)
                    settings.pointerState(2);

                clearTimeout(mouseTimer);
                mouseTimer = setTimeout(mouseStopped, 200);

                if (settings.onDrag === undefined) return;
                settings.onDrag.call(dragBoxes[currentGhost.uid].obj);
            }

            function mouseStopped() {
                if (settings.pointerState !== undefined)
                    settings.pointerState(3);
                if (settings.onHalt === undefined) return;
                if (currentGhost !== null)
                    settings.onHalt.call(dragBoxes[currentGhost.uid].obj);
            }


            $(document).bind("touchend touchcancel mouseup", function (e) {
                if (dragState == false) return;
                clearInterval(interval);

                if (settings.pointerState !== undefined)
                    settings.pointerState(4);

                for (var k in dropBoxes) {
                    if (cursorGhost.pointerIntersects(dropBoxes[k])) {
                        // console.log("intersect");

                        if (settings.allowDrop.call(dragBoxes[currentGhost.uid].obj, e, dropBoxes[k].obj)) {
                            if (dropBoxes[k].obj != dragBoxes[currentGhost.uid].obj)
                                if (settings.onDrop !== undefined) {
                                    //callback
                                    settings.onDrop.call(dragBoxes[currentGhost.uid].obj, dropBoxes[k].obj);
                                }
                        }
                    }

                }

                enable_scroll_mobile();

                currentGhost.obj.remove();
                currentGhost = null;

                dragState = false;

            });

            $(window).on("touchmove mousemove touchstart mousedown", function (e) {
                var x, y;

                if (isMobile()) {
                    x = e.originalEvent.touches[0].pageX;
                    y = e.originalEvent.touches[0].pageY;
                } else {
                    x = e.pageX;
                    y = e.pageY;
                }
                cursorPos.x = x;
                cursorPos.y = y;

                cursorGhost.setPointerPos(cursorPos);
                //console.log(cursorGhost.pointerPos);
                for (var k in dropBoxes) {
                    if (cursorGhost.pointerIntersects(dropBoxes[k])) {
                        console.log("intersect");
                        console.log(cursorGhost.pointerPos);
                    }
                }
            });

            function isMobile() {
                var im = false;
                if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) ||
                    /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
                    im = true;
                }
                return im;
            }

            function preventDefault(e) {
                e = e || window.event;
                if (e.preventDefault)
                    e.preventDefault();
                e.returnValue = false;
            }

            function disable_scroll_mobile() {
                document.addEventListener('touchmove', preventDefault, false);
            }

            function enable_scroll_mobile() {
                document.removeEventListener('touchmove', preventDefault, false);
            }

        });

    }
}