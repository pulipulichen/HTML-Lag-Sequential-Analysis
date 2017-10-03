
var _init_state_machine = function (_canvas_id, _seq_list) {
    jsPlumb.ready(function () {

        // setup some defaults for jsPlumb.
        var instance = jsPlumb.getInstance({
            Endpoint: ["Dot", {radius: 2}],
            Connector:"StateMachine",
            HoverPaintStyle: {stroke: "#1e8151" },
            ConnectionOverlays: [
                [ "Arrow", {
                    location: 1,
                    id: "arrow",
                    length: 14,
                    foldback: 0.8
                } ],
                [ "Label", { label: "", id: "label", cssClass: "aLabel" }]
            ],
            Container: _canvas_id
        });

        instance.registerConnectionType("basic", { 
            anchor:"Continuous", connector:"StateMachine" 
        });

        window.jsp = instance;

        var windows = jsPlumb.getSelector("#" + _canvas_id + " .w");
        //console.log(windows.length);

        var canvas = jsPlumb.getSelector("#" + _canvas_id);
        
        // ---------------------------------
        // 建立節點
        var _node_list = [];
        for (var _i = 0; _i < _seq_list.length; _i++) {
            var _from = _seq_list[_i].from;
            var _from_id = $.inArray(_from, _node_list);
            var _to = _seq_list[_i].to;
            var _to_id = $.inArray(_to, _node_list);
            
            if ($.inArray(_from, _node_list) === -1) {
                _node_list.push(_from);
                _from_id = _node_list.length-1;
            }
            if ($.inArray(_to, _node_list) === -1) {
                _node_list.push(_to);
                _to_id = _node_list.length-1;
            }
            else {
                _to_id = $.inArray(_to, _node_list);
            }
            
            _seq_list[_i].from_id = _from_id;
            _seq_list[_i].to_id = _to_id;
        }
        
        for (var _i = 0; _i < _node_list.length; _i++) {
            $(canvas).append('<div class="w" id="node' + _i + '">' + _node_list[_i] + '</div>');
        }
        
        // ----------------------------------
        
        
        // 先給下面的元素調整一個位置
        var _w = $(canvas).find(".w");
        var _node_count = _w.length;
        var _node_width  = Math.ceil(Math.sqrt(_node_count));
        //console.log(_node_width);
        // 好，那就畫3*3

        var _padding = 0;

        _w.each(function (_i, _div) {
            var _width = $(_div).width();
            if (_width > _padding) {
                _padding = _width;
            }
        });
        
        //console.log(_padding);
        
        // 決定margin
        var _margin = "";
        for (var _i = 0; _i < _seq_list.length; _i++) {
            if (typeof(_seq_list[_i].label) === "string") {
                var _m = _seq_list[_i].label;
                if (_m.length > _margin.length) {
                    _margin = _m;
                }
            }
        }
        var _span = $('<span class="margin-test">' + _margin  + "</span>")
                .appendTo($(canvas));
        _margin = _span.width() + 50;
        _span.remove();
        
        var _min_margin = 100;
        if (_margin < _min_margin) {
            _margin = _min_margin;
        }
        
        //console.log(_margin);
        
        _padding = _padding + _margin;
        var _base = _margin;
        var _left_base = _margin / 2;
        //console.log(_padding);
        
        var _height = (_w.eq(0).height() + (_margin*1.3))  * (_node_width-1);
        _height = _height + (_margin*1);
        //console.log(_w.eq(0).height());
        $(canvas).css("height", _height + "px");

        _w.each(function (_i, _div) {
            _div = $(_div);

            // 取得x的位置 0,1,2
            var _x = _i % _node_width;
            var _y = (_i-_x) / _node_width; // 

            var _pos = {
                "top": _margin,
                "left": _left_base
            };

            if (_i === 0) {
                _div.css("top", _base + "px");
                _div.css("left", _left_base + "px");
            }

            //var _prev_div = _w.eq(_i-1);
            if (_i > 0) {
                var _left = _padding * 1.2 * (_x);
                //console.log(["left", _left, _i, _x, _padding]);
                _div.css("left", (_left_base + _left) + "px");
            }

            if (_i > 0) {
                var _top = (_margin*1.3) * (_y);
                _div.css("top", (_base + _top) + "px");
               _pos.top = _top;
            }

            //console.log(_pos);
            instance.draggable(_div);
        });


        // bind a click listener to each connection; the connection is deleted. you could of course
        // just do this: jsPlumb.bind("click", jsPlumb.detach), but I wanted to make it clear what was
        // happening.
        //instance.bind("click", function (c) {
        //    instance.deleteConnection(c);
        //});

        // bind a connection listener. note that the parameter passed to this function contains more than
        // just the new connection - see the documentation for a full list of what is included in 'info'.
        // this listener sets the connection's internal
        // id as the label overlay's text.
        /*
        instance.bind("connection", function (info) {
            if (info.connection.id === "con_1") {
                console.log(info);
            }
            if (typeof(info.connection.label) !== "undefined") {
                var _label = info.connection.label;
                console.log(_label);
                //delete info.connection.label;
            }
            //info.connection.getOverlay("label").setLabel(_label);
        });
        */

        // bind a double click listener to "canvas"; add new node when this occurs.
        //jsPlumb.on(canvas, "dblclick", function(e) {
        //    newNode(e.offsetX, e.offsetY);
        //});

        //
        // initialise element as connection targets and source.
        //
        var initNode = function(el) {

            // initialise draggable elements.
            instance.draggable(el);

            instance.makeSource(el, {
                filter: ".ep",
                anchor: "Continuous",
                connectorStyle: { stroke: "#5c96bc", strokeWidth: 2, outlineStroke: "transparent", outlineWidth: 4 },
                connectionType:"basic",
                extract:{
                    "action":"the-action"
                },
                maxConnections: 2,
                onMaxConnections: function (info, e) {
                    //alert("Maximum connections (" + info.maxConnections + ") reached");
                }
            });


            instance.makeTarget(el, {
                dropOptions: { hoverClass: "dragHover" },
                anchor: "Continuous",
                allowLoopback: true
            });

            // this is not part of the core demo functionality; it is a means for the Toolkit edition's wrapped
            // version of this demo to find out about new nodes being added.
            //
            instance.fire("jsPlumbDemoNodeAdded", el);
        };

        /*
        var newNode = function(x, y) {
            var d = document.createElement("div");
            var id = jsPlumbUtil.uuid();
            d.className = "w";
            d.id = id;
            d.innerHTML = id.substring(0, 7) + "<div class=\"ep\"></div>";
            d.style.left = x + "px";
            d.style.top = y + "px";
            instance.getContainer().appendChild(d);
            initNode(d);
            return d;
        };
        */

        // suspend drawing and initialise.
        instance.batch(function () {
            for (var i = 0; i < windows.length; i++) {
                initNode(windows[i], true);
            }
            
            // and finally, make a few connections
            /*
            instance.connect({ source: "opened", target: "phone1", type:"basic"
                , label: "test" });
            instance.connect({ source: "phone1", target: "opened", type:"basic" });
            instance.connect({ source: "phone1", target: "phone1", type:"basic" });
            instance.connect({ source: "phone1", target: "inperson", type:"basic" });

            instance.connect({
                source:"phone2",
                target:"rejected",
                type:"basic"
            });
            */
            for (var _i = 0; _i < _seq_list.length; _i++) {
                var _s = _seq_list[_i];
                var _json = { source: "node"+ _s.from_id
                    , target: "node"+_s.to_id
                    , type:"basic"
                    //, paintStyle: {strokeWidth: 3, stroke:'#526173'}
                };
                if (typeof(_s.label) !== "undefined") {
                    _json.label = _s.label + "";
                }
                if (typeof(_s.paintStyle) !== "undefined") {
                    _json.paintStyle = _s.paintStyle;
                }
                instance.connect(_json);
            }
        });

        //jsPlumb.fire("jsPlumbDemoLoaded", instance);

    }); // jsPlumb.ready(function () {
};
/*
var _seq_list = [
    {from: "BEGIN", to: "PHONE INTERVIEW 1", label: "text1"},
    {from: "PHONE INTERVIEW 1", to: "BEGIN", label: "text2"},
    {from: "PHONE INTERVIEW 1", to: "PHONE INTERVIEW 1", label: "text3"},
    {from: "PHONE INTERVIEW 1", to: "IN PERSON", label: "text4"},
    {from: "PHONE INTERVIEW 2", to: "REJECTED", label: "text5"},
];

_init_state_machine("canvas", _seq_list);
*/