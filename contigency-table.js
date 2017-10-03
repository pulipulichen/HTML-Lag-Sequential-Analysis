var _DEBUG = {
    force_fisher: false,
    force_yates: false,
    force_sig_pass: false
};

_ct_json = {};
_event_list = [];

_events_count = 0;
_users_count = 0;
_events_stat = {};

var _load_csv_to_ct_json = function (_csv) {
    if (_csv === undefined || _csv.trim() === "") {
        return;
    }
    
    _csv = _combine_time_seq(_csv);
    
    //console.log(_csv);
    
    _ct_json = {};
    
    // ,性別:男性,性別:女性
    // 錄取結果:通過,35,20
    // 錄取結果:不通過,45,40
    
    // ,性別:男性,性別:女性\n錄取結果:通過,35,20\n錄取結果:不通過,45,40
    
    var _lines = _csv.trim().split("\n");
    
    var _users_seq = {};
    
    _events_count = 0;
    _events_stat = {};
    _events_list = [];
    for (var _l = 1; _l < _lines.length; _l++) {
        var _fields = _lines[_l].trim().split(",");
        
        var _user = _fields[0].trim();
        var _seq_id = eval(_fields[1].trim());
        var _events = _fields[2].trim().split(";");
        if (_events.length > 0) {
            for (var _e = 0; _e < _events.length; _e++) {
                var _event_name = _events[_e].trim();
                _events[_e] = _event_name;
                
                if (typeof(_events_stat[_event_name]) === "undefined") {
                    _events_list.push(_event_name);
                    _events_stat[_event_name] = 0;
                }
                _events_stat[_event_name]++;
            }
            _events_count++;
        }
        
        if (typeof(_users_seq[_user]) === "undefined") {
            _users_seq[_user] = [];
        }
        _users_seq[_user].push([_seq_id, _events]);
    }
    
    // --------------------------
    
    _users_count = 0;
    for (var _u in _users_seq) {
        _users_count++;
        var _seq = _users_seq[_u];
        
        _seq.sort(function(_a,_b) {
           return _a[0] - _b[0]; 
        });
        
        var _last_events = _seq[0][1];
        
        for (var _s = 1; _s < _seq.length; _s++) {
            var _events = _seq[_s][1];
            //if (_u === "2") {
            //    console.log(_events);
            //}
            for (var _e0 = 0; _e0 < _last_events.length; _e0++) {
                var _event_name0 = _last_events[_e0];
                
                for (var _e1 = 0; _e1 < _events.length; _e1++) {
                    var _event_name1 = _events[_e1];
                    if (typeof(_ct_json[_event_name0]) === "undefined") {
                        _ct_json[_event_name0] = {};
                    }
                    
                    if (typeof(_ct_json[_event_name0][_event_name1]) === "undefined") {
                        _ct_json[_event_name0][_event_name1] = 0;
                    }
                    _ct_json[_event_name0][_event_name1]++;
                    
                    //console.log([_event_name0, _event_name1, _ct_json[_event_name0][_event_name1]]);
                }
            }
            _last_events = _events;
        }
        
        //if (_u === "2") {
        //    console.log(_seq);
        //}
        //console.log("下一人");
    }
    
    //console.log(_users_seq);
    
    //return console.log(_ct_json);
    //console.log(_ct_json);
    
    _draw_contingency_table_from_ct_json();
};

var _combine_time_seq = function (_csv) {
    var _users_seq = [];
	var _seq_type = null;
    //console.log(_csv);
    // 第二格是time
    var _lines = _csv.trim().split("\n");
    for (var _l = 1; _l < _lines.length; _l++) {
        var _fields = _lines[_l].trim().split(",");
        if (_fields.length < 2) {
            continue;
        }
        //console.log(_fields);
		var _user = _fields[0];
		var _seq_id = _fields[1];
		
		if (_seq_type === null) {
			if (isNaN(_seq_id) === false) {
				_seq_type = "number";
			}
			else {
				_seq_type = "string";
			}
		}
		
		if (isNaN(_seq_id) === false) {
			_seq_id = eval(_seq_id);
		}
		
		
		
		var _events = _fields[2].split(";");
		
		// 加入到_users_seq
		if (typeof(_users_seq[_user])==="undefined") {
			_users_seq[_user] = {};
		}
		if (typeof(_users_seq[_user][_seq_id])==="undefined") {
			_users_seq[_user][_seq_id] = [];
		}
		for (var _e = 0; _e < _events.length; _e++) {
			_users_seq[_user][_seq_id].push(_events[_e]);
		}
    }
	
	// 排序一下seq_id
	for (var _user in _users_seq) {
		var _seq_json = _users_seq[_user];
		var _seq_array = [];
		for (var _seq in _seq_json) {
			_seq_array.push({
				seq: _seq,
				events: _seq_json[_seq]
			});
		}
		
		_seq_array.sort(function (_a, _b) {
			return (_b.seq < _a.seq);
		});
		
		_users_seq[_user] = _seq_array;
	}
	
	// 最後再整合為csv
	var _lines = ["user,seq_id,events"];
	for (var _user in _users_seq) {
		for (var _s = 0; _s < _users_seq[_user].length; _s++) {
			var _seq_array = _users_seq[_user][_s];
			var _line = [_user, _seq_array.seq, _seq_array.events.join(";")];
			_lines.push(_line.join(","));
		}
	}
    return _lines.join("\n");
};


var _traverse_ct_json = function (_callback) {
    for (var _x_var_name in _ct_json) {
        for (var _y_var_name in _ct_json[_x_var_name]) {
            _callback(_x_var_name, _y_var_name, _ct_json[_y_var_name][_x_var_name]);
        }
    }
};

// -------------------------

var _draw_contingency_table_from_ct_json = function () {
    //console.log(_ct_json);
    
    _reset_contingency_table();
    _event_list = _get_attr();
    
    
    // -------------------------------
    
    
    var _table = $("#contingency_table");
    var _tbody = _table.find("tbody");
    var _x_tr = _table.find(".variable_x_tr");
    var _event_count = _event_list.length;
    var _c = 0;
    
    for (var _e0 = 0; _e0 < _event_list.length; _e0++) {
        var _x_name = _event_list[_e0];
        
        _x_tr.append(_create_vairable_th("x",_x_name));
        
        for (var _e1 = 0; _e1 < _event_list.length; _e1++) {
            var _y_name = _event_list[_e1];
            
            if (_tbody.find('.variable_y[value="' + _y_name + '"]').length === 0) {
                var _y_th = _create_vairable_th("y",_y_name);
                
                var _tr = _tbody.find('tr:first');
                if (_tr.find("th").length > 1) {
                    // 表示第一列已經有資料
                    _tr = $('<tr></tr>').appendTo(_tbody);
                }
                
                _tr.append(_y_th);
                
                // ---------------------------
            }
            
            // -------------------------------
            
            var _count = 0;
            if (typeof(_ct_json[_y_name]) !== "undefined" 
                    && typeof(_ct_json[_y_name][_x_name]) !== "undefined") {
                _count = _ct_json[_y_name][_x_name];
            }
            
            var _cell_td = _create_cell_td(_count);
            _tbody.find('tr:eq(' + _e1 + ')').append(_cell_td);
            
            _c += _count;
        }
    }
    //console.log(_c);
    
    // ------------------------------
    // 設定span
    $(".variable_x_th").attr("colspan", _event_count);
    $(".variable_y_th").attr("rowspan", _event_count);
    
    _draw_result_table();
};

// -------------------------

var _get_ct_json_from_ui = function () {
    
    _ct_json = {};
    var _table = $("#contingency_table");
    
    /*
    var _var_x_name = _table.find("#variable_x_name").val().trim();
    if (_var_x_name === "") {
        _var_x_name = "X";
    }
    var _var_y_name = _table.find("#variable_y_name").val().trim();
    if (_var_y_name === "") {
        _var_y_name = "Y";
    }
    */
    
    // --------------------------
    
    var _var_x_list = [];
    _table.find(".variable_x").each(function (_i, _input) {
        var _name = _input.value.trim();
        if (_name === "") {
            _name = "X" + _i;
        }
        _var_x_list.push(_name);
    });
    
    var _var_y_list = [];
    _table.find(".variable_y").each(function (_i, _input) {
        var _name = _input.value.trim();
        if (_name === "") {
            _name = "Y" + _i;
        }
        _var_y_list.push(_name);
    });
    
    // --------------------------
    
    _table.find("tbody tr").each(function (_y, _y_tr) {
        $(_y_tr).find(".vairable_cell").each(function (_x, _cell) {
            var _cell_value = _cell.value.trim();
            if (isNaN(_cell_value) || _cell_value === "") {
                _cell_value = 0;
            }
            _cell_value = eval(_cell_value);
            
            var _x_attr = _var_x_list[_x];
            var _y_attr = _var_y_list[_y];
            
            if (typeof(_ct_json[_y_attr]) === "undefined") {
                _ct_json[_y_attr] = {};
            }
            
            if (_y_attr === _x_attr 
                    && _is_count_same_adjacent_event() === false) {
                _ct_json[_y_attr][_x_attr] = 0;
            }
            else {
                _ct_json[_y_attr][_x_attr] = _cell_value;
            }
        });
    });
    
    _get_attr();
    
    return _ct_json;
};

var _is_count_same_adjacent_event = function () {
    return ($("#input_count_same_adjacent_event:checked").length === 0);
};

/**
 * 
 * @param {type} _dimension [x|y]
 * @param {type} _name
 * @returns {undefined}
 */
var _remove_ct_json_attr = function (_dimension, _name) {
    if (_dimension === undefined) {
        return;
    }
    
    _ct_json = _get_ct_json_from_ui();
    if (typeof(_ct_json[_name]) === "object") {
        delete _ct_json[_name];
    }
    
    for (var _x_name in _ct_json) {
        if (typeof(_ct_json[_x_name][_name]) !== "undefined") {
            delete _ct_json[_x_name][_name];
        }
    }
    
    _draw_contingency_table_from_ct_json();
};

$(function () {
    $('.contingency-table-row-plus button.add-button').click(function () {
        _add_ct_json_attr('y');
    });
});

var _add_ct_json_attr = function (_dimension) {
    _ct_json = _get_ct_json_from_ui();
    //var _id = _dimension.toUpperCase() + (_count_attr(_dimension) + 1);
    var _id  = "E" + (_event_list.length+1);
    
    _ct_json[_id] = {};
    var _y_list = _event_list;
    for (var _i = 0; _i < _y_list.length; _i++) {
        _ct_json[_id][_y_list[_i]] = 0;
    }
    
    for (var _x in _ct_json) {
        _ct_json[_x][_id] = 0;
    }
    
    _ct_json[_id][_id] = 0;
    
    _draw_contingency_table_from_ct_json();
};

var _count_attr = function (_dimension) {
    var _count = 0;
    if (_dimension === "x") {
        for (var _x in _ct_json) {
            _count++;
        }
    }
    else {
        for (var _x in _ct_json) {
            for (var _y in _ct_json[_x]) {
                _count++;
            }
            break;
        }
    }
    return _count;
};

var _get_attr = function () {
    _event_list = [];
    for (var _i in _ct_json) {
        _event_list.push(_i);
    }
    
    for (var _i in _ct_json) {
        for (var _j in _ct_json[_i]) {
            if ($.inArray(_j, _event_list) === -1) {
                _event_list.push(_j);
            }
        }
    }
    
    _event_list.sort();
    //_event_list = ['U', 'S', 'P', 'T', 'G'];
    /*
    if (_dimension === 'x') {
        for (var _x in _ct_json) {
            _attr_list.push(_x);
        }
    }
    else {
        for (var _x in _ct_json) {
            for (var _y in _ct_json[_x]) {
                _attr_list.push(_y);
            }
            break;
        }
    }
    */
    return _event_list;
};


var _reset_contingency_table = function () {
    var _table = $("#contingency_table");
    _table.find(".cell_td").remove();
    _table.find(".variable_th").remove();
    _table.find("tbody tr:not(:first)").remove();
};

var _create_remove_attr_button = function (_dimension, _name) {
    var _ele = $('<button class="ui icon button" type="button" data-dimension="' + _dimension + '" data-name="' + _name + '">'
        + '<i class="minus square icon remove_attr" ></i>'
        + '</button>');
    _ele.click(function () {
        var _this = $(this);
        var _dimension = _this.data("dimension");
        var _name = _this.data("name");
        _remove_ct_json_attr(_dimension, _name);
    });
    return _ele;
};

var _create_vairable_th = function (_dimension, _name) {
    var _ele = $('<th class="variable_th">'
            + '<div class="ui action input">'
            + '<input type="text" value="' + _name + '" class="variable variable_' + _dimension + '" ori-value="' + _name + '" />'
            + '</div>'
            + '</th>');
    _ele.find("div").append(_create_remove_attr_button(_dimension, _name));
    _ele.find('.variable_' + _dimension).change(function () {
        // 先改自己對面的編碼
        var _this = $(this);
        var _val = _this.val().trim();
        var _ori_value = $(this).attr("ori-value");
        $('.variable[ori-value="' + _ori_value + '"]').val(_val).attr("ori-value", _val);
        _this.attr("ori-value", _val);
        
        _draw_result_table();
    });
    return _ele;
};

var _create_cell_td = function (_cell) {
    var _ele = $('<td class="cell_td"><input type="text" value="' + _cell + '" class="vairable_cell" /></td>');
    _ele.find('input').change(function () {
        _draw_result_table();
    });
    return _ele;
};

// --------------------------------------

var _x_var_count;
var _y_var_count;

var _draw_result_table = function () {
    _ct_json = _get_ct_json_from_ui();
    //console.log(_ct_json);
    
    
    _reset_result();
    
    //var _n = 0.07215074898001728;
    //console.log([precision_string(_n, 3), _n]);
    //return;
    
    var _panel = $(".file-process-framework");
    var _result = _panel.find("#preview_html");
    
    // ---------------------------------
    
    var _abs_table = _draw_obs_seq_table();
    _abs_table.appendTo(_result);
    var _evts_table = _draw_event_count_table();
    _evts_table.appendTo(_result);
    
    
    // ---------------------------------
    
    var _cross_table = _draw_cross_table();
    _cross_table.appendTo(_result);
    var _note = _draw_cross_table_note();
    _note.appendTo(_result);
    
    // ---------------------------------
    
    var _abs = _draw_contingency_table_analyze_result();
    _abs.appendTo(_result);
    
    // ---------------------------------
    
    // 找出有顯著轉移的序列
    var _sig_seq = _get_sig_seq();
    //console.log(_sig_seq);
    if ($("#input_display_full_transfer_diagram:checked").length === 0) {
        if (_sig_seq.length > 0) {
            $('<div style="margin-top: 1em;">事件轉移圖：(可拖曳事件調整位置)</div>').appendTo(_result);
            _draw_diagram(_result, _sig_seq);
        }
    }
    else {
        var _full_seq = _get_full_seq();
        $('<div style="margin-top: 1em;">事件轉移圖：(可拖曳事件調整位置)</div>').appendTo(_result);
        _draw_diagram(_result, _full_seq);
    }
    
    if ($("#input_table_style_display:checked").length === 1) {
        _result.find(".analyze-result").removeClass("analyze-result");
    }
};

var _draw_obs_seq_table = function () {
    
    //var _event_list = _get_attr();
    var _cross_table = $('<div class="analyze-result cross-table" style="display:inline-block">'
        + '<div class="caption" style="text-align:center;display:block">觀察樣本統計摘要表</div>'
        + '<table border="1" cellpadding="0" cellspacing="0">'
        + '<thead>'
            + '<tr>'
                + '<th>研究對象數量</th>'
                + '<th>事件類別數量</th>'
                + '<th>事件總數</th>'
                + '<th>每位研究對象<br />平均事件數量</th>'
            + '</tr></thead>'
        + '<tbody>'
            + '<tr>'
                + '<td>' + _users_count + '</td>'
                + '<td>' + _events_list.length + '</td>'
                + '<td>' + _events_count + '</td>'
                + '<td>' + precision_string((_events_count / _users_count),3) + '</td>'
            + '</tr>'
        + '</tbody>'
        + '</table></div><br />');

    return _cross_table;
};

var _draw_event_count_table = function () {
    
    var _cross_table = $('<div class="analyze-result cross-table events-descriptive-table" style="display:inline-block">'
        + '<div class="caption" style="text-align:center;display:block">事件統計表</div>'
        + '<table border="1" cellpadding="0" cellspacing="0">'
        + '<thead>'
            + '<tr>'
                + '<th>事件編碼</th>'
                + '<th>出現頻率</th>'
                + '<th>出現百分比</th>'
            + '</tr></thead>'
        + '<tbody>'
        + '</tbody>'
        + '<tfoot>'
            + '<tr class="top-border-medium">'
                + '<th align="left" class="right-border-medium">事件總數</th>' 
                + '<th align="right">' + _events_count + '</th>'
                + '<th align="right">100.0%</th>'
        + '</tfoot>'
        + '</table></div><br />');

    _events_list = _events_list.sort();
    
    var _tbody = _cross_table.find("tbody");
    var _data = [];
    for (var _i = 0; _i < _event_list.length; _i++) {
        var _event_name = _event_list[_i];
        var _count = _events_stat[_event_name];
        var _per = precision_string((_count/_events_count)*100, 1) + "%";
        _data.push({
            n: _event_name,
            c: _count,
            p: _per
        });
    }
    
    _data.sort(function (a, b) {
        return (b.c - a.c);
    });
    
    for (var _i = 0; _i < _data.length; _i++) {
        var _event_name = _data[_i].n;
        var _count = _data[_i].c;
        var _per = _data[_i].p;
        
        $('<tr event="' + _event_name +'">'
            + '<th align="left" style="text-align:left">' + _event_name + '</th>'
            + '<td class="count">' + _count + '</td>'
            + '<td class="per">' + _per + '</td>'
            + '</tr>').appendTo(_tbody);
    }
    
    return _cross_table;
};

var _draw_cross_table = function () {
    var _cross_table = $('<div class="analyze-result cross-table event-transfer-table" style="display:inline-block">'
        + '<div class="caption" style="text-align:center;display:block">事件轉移表</div>'
        + '<table border="1" cellpadding="0" cellspacing="0">'
        + '<thead>'
            + '<tr class="x-var-tr"><th colspan="3" rowspan="2"></th><th class="x-var-name"></th>'
                +'<th rowspan="2" valign="bottom">' + 'Lag 0 (g)<br />總數' + '</th></tr>'
            + '<tr class="x-vars-tr">'
                //+'<th valign="bottom">' + 'Lag 0 出現機率 p(g)' + '</th>'
            + '</tr></thead>'
        + '<tbody></tbody>'
        + '<tfoot>'
            + '<tr class="row x-sum num-tr top-border-medium">'
                + '<th rowspan="2" colspan="2" align="left" valign="top">' + 'Lag 1 (t)<br />總數' + '</th>'
                + '<th align="left" valign="top" class="right-border-medium">' + '出現頻率 f(t)' + '</th></tr>'
            + '<tr class="row x-sum per per-tr bottom-border-medium"><th align="left" valign="top">' + '出現機率 p(t)' + '</th></tr>'
            //+ '<tr class="row x-sum exp-tr bottom-border-medium"><th align="left" valign="top">' + '期望個數 exp(t)' + '</th></tr>' 
        + '</tfoot>'
        + '</table></div>');

    //_cross_table.appendTo(_result);
    
    // ------------------
    // 先畫出x變數
    
    var _x_var_name = _cross_table.find(".x-var-name:first");
    var _x_name = $("#variable_x_name").val().trim();
    _x_var_name.html(_x_name);
    
    var _x_vars_tr = _cross_table.find('.x-vars-tr');
    _x_vars_count = 0;
    var _x_vars_list = [];
    $("#contingency_table input.variable_x").each(function (_i, _input) {
        var _name = _input.value.trim();
        if (_name !== "") {
            //$('<th>' + _name + '</th>').insertBefore(_x_vars_tr.find("th:last"));
            $('<th>' + _name + '</th>').appendTo(_x_vars_tr);
            _x_vars_list.push(_name);
            _x_vars_count++;
        }
    });
    _x_var_name.attr("colspan", _x_vars_count);
    
    // ----------------------
    // 再畫出y變數
    
    
    var _tbody = _cross_table.find('tbody');
    var _y_var_name;
    _y_vars_count = 0;
    var _y_name = $("#variable_y_name").val().trim();
    var _rowspan = 6;
    $("#contingency_table input.variable_y").each(function (_i, _input) {
        var _name = _input.value.trim();
        if (_name === "") {
            return;
        }
        
        // -----------
        
        
        var _tr_num = $('<tr y_var="' + _name + '" class="num-tr row top-border-thin"><th rowspan="' + _rowspan + '" class="bottom-border-thin" valign="top" align="left">' + _name + '</th>'
                + '<th valign="top" align="left">' + '出現頻率 f(g,t)' + '</th></tr>').appendTo(_tbody);
        var _tr_global = $('<tr y_var="' + _name + '" class="global-tr"><th valign="top" align="left">' + '出現機率 p(g,t)' + '</th></tr>').appendTo(_tbody);
        var _tr_exp = $('<tr y_var="' + _name + '" class="exp-tr"><th valign="top" align="left">' + '期望個數 exp(g,t)' + '</th></tr>').appendTo(_tbody);
        var _tr_residual = $('<tr y_var="' + _name + '" class="residual-tr"><th valign="top" align="left">' + '殘差' + '</th></tr>').appendTo(_tbody);
        var _tr_adj_residual = $('<tr y_var="' + _name + '" class="adj-residual-tr"><th valign="top" align="left">' + '調整後殘差<sup>a</sup>' + '</th></tr>').appendTo(_tbody);
        var _tr_yule_q = $('<tr y_var="' + _name + '" class="yule-q-tr"><th valign="top" align="left">' + "相關係數<sup>b</sup>" + '</th></tr>').appendTo(_tbody);
        
        // -----------
        
        if (_y_vars_count === 0) {
            // 插入y變數的名字
            _y_var_name = $('<th class="y-var-name bottom-border-thin" valign="top" align="left"></th>')
                    .prependTo(_tr_num);
            _y_var_name.html(_name);
        }
        _y_vars_count++;
        
        // -----------
        
        for (var _j = 0; _j < _x_vars_count+1; _j++) {
            var _td = $('<td align="right"></td>');
            if (_j < _x_vars_count) {
                _td.attr('x_var', _x_vars_list[_j]);
            }
            else {
                _td.addClass('y-sum');
            }
            _td.clone().appendTo(_tr_num);
            _td.clone().appendTo(_tr_exp);
            
            _td.clone().appendTo(_tr_global);
            
            _td.clone().appendTo(_tr_residual);
            _td.clone().appendTo(_tr_adj_residual);
            _td.clone().appendTo(_tr_yule_q);
        }
        
        // -------------------
        
    }); // $("#contingency_table input.variable_y").each(function (_i, _input) {
    
    _y_var_name.attr('rowspan', _y_vars_count * _rowspan);
    _cross_table.find('.x-var-name').html(_x_name);
    _cross_table.find('.y-var-name').html(_y_name);
    
    //return;
    
    // ------------------------
    // 結尾
    
    var _tfoot_num_tr = _cross_table.find('tfoot > .x-sum.num-tr');
    //var _tfoot_exp_tr = _cross_table.find('tfoot > .x-sum.exp-tr');
    var _tfoot_y_per_tr = _cross_table.find('tfoot > .x-sum.y-per-tr');
    var _tfoot_x_per_tr = _cross_table.find('tfoot > .x-sum.x-per-tr');
    var _tfoot_per_tr = _cross_table.find('tfoot > .x-sum.per-tr');
    
    for (var _j = 0; _j < _x_vars_count+1; _j++) {
        var _td = $('<td align="right"></td>');
        if (_j < _x_vars_count) {
            _td.attr('x_var', _x_vars_list[_j]);
        }
        else {
            _td.addClass('total-sum');
        }
        _td.clone().appendTo(_tfoot_num_tr);
        //_td.clone().appendTo(_tfoot_exp_tr);
        _td.clone().appendTo(_tfoot_y_per_tr);
        _td.clone().appendTo(_tfoot_x_per_tr);
        _td.clone().appendTo(_tfoot_per_tr);
    }
    
    _draw_num_cell(_cross_table);
    _draw_x_percent_cell(_cross_table);
    _draw_y_percent_cell(_cross_table);
    _draw_cell_percent_cell(_cross_table);
    
    return _cross_table;
    //_result.html("1");
};

var _draw_cross_table_note = function () {
    var _note = $('<ol type="a">'
        + '<li>調整後殘差是用Allison & Liker (1982)的z分數計算公式，超過1.96即達0.05顯著水準，表示此序列次數顯著較多。</li>'
        + '<li class="q">相關係數是用Yule\'Q的計算公式，介於-1至1之間。大於0為正相關，小於0為複相關。絕對值1為完全相關、0.7~0.9為高度相關、0.4~0.6為中度相關、0.1~0.3為低度相關、0.1以下為無相關。</li>'
        + '</ol>');

    if ($("#input_table_display_details:checked").length === 0) {
        _note.find(".q").hide();
    }
    return _note;
};

var _x_sum_list;
var _y_sum_list;
var _total_sum;

var _is_sum_too_small;
var _is_zero_cell_existed;
var _is_sum_zero_cell_existed;

var _draw_num_cell = function (_cross_table) {
    _x_sum_list = {};
    _y_sum_list = {};
    _total_sum = 0;
    _is_sum_too_small = true;
    _is_zero_cell_existed = false;
    
    for (var _x_var_name in _ct_json) {
        for (var _y_var_name in _ct_json[_x_var_name]) {
            var _num = _ct_json[_y_var_name][_x_var_name];
            
            if (_num === 0) {
                _is_zero_cell_existed = true;
            }
            
            _cross_table.find('.num-tr[y_var="' + _y_var_name + '"] [x_var="' + _x_var_name +'"]').html(_num);
            
            if (typeof(_x_sum_list[_x_var_name]) === 'undefined') {
                _x_sum_list[_x_var_name] = 0;
            }
            _x_sum_list[_x_var_name] += _num;
            
            if (typeof(_y_sum_list[_y_var_name]) === 'undefined') {
                _y_sum_list[_y_var_name] = 0;
            }
            _y_sum_list[_y_var_name] += _num;
            
            _total_sum += _num;
        }
    }
    
    _is_sum_zero_cell_existed = false;
    for (var _x_var_name in _x_sum_list) {
        var _sum = _x_sum_list[_x_var_name];
        if (_sum >= 20) {
            _is_sum_too_small = false;
        }
        _cross_table.find('.x-sum.num-tr [x_var="' + _x_var_name + '"]').html(_sum);
        _cross_table.find('.x-sum.exp-tr [x_var="' + _x_var_name + '"]').html(_sum);
        
        if (_sum === 0) {
            _is_sum_zero_cell_existed = true;
            _cross_table.find('.x-sum.num-tr [x_var="' + _x_var_name + '"]').addClass('zero-sum');
        }
    }
    
    _cross_table.find('tbody .y-per-tr .y-sum').html(precision_string(100, 1) + '%');
    
    for (var _y_var_name in _y_sum_list) {
        var _sum = _y_sum_list[_y_var_name];
        if (_sum >= 20) {
            _is_sum_too_small = false;
        }
        
        _cross_table.find('.num-tr[y_var="' + _y_var_name + '"] .y-sum').html(_sum);
        //_cross_table.find('.exp-tr[y_var="' + _y_var_name + '"] .y-sum').html(_sum);
        
        if (_sum === 0) {
            _is_sum_zero_cell_existed = true;
            _cross_table.find('.num-tr[y_var="' + _y_var_name + '"] .y-sum').addClass('zero-sum');
        }
    }
    
    //_cross_table.find('.x-sum.x-per-tr td[x_var]').html(precision_string(1, 3));
    
    _cross_table.find('.x-sum.num-tr .total-sum').html(_total_sum);
    _cross_table.find('.x-sum.exp-tr .total-sum').html(_total_sum);
    //_cross_table.find('.x-sum.y-per-tr .total-sum').html(precision_string(100, 1) + '%');
    //_cross_table.find('.x-sum.x-per-tr .total-sum').html(precision_string(100, 1) + '%');
    _cross_table.find('.x-sum.per-tr .total-sum').html(_get_percent_text(1));
    
    
    if ($("#input_table_display_details:checked").length === 0) {
        _cross_table.find("tbody tr.exp-tr").remove();
        _cross_table.find("tbody tr.global-tr").remove();
        _cross_table.find("tbody tr.residual-tr").remove();
        _cross_table.find("tbody tr.yule-q-tr").remove();
        _cross_table.find("tbody th:first").attr("rowspan", _cross_table.find("tbody tr").length);
        _cross_table.find("tbody tr.num-tr").each(function (_i, _tr) {
            //console.log(_i);
            $(_tr).find("th[rowspan]:last").attr("rowspan", 2);
        });
    }
    
};

_x_per_list = {};
var _draw_x_percent_cell = function (_cross_table) {
    //var _cross_table = $("#preview_html .cross-table");
    for (var _x_var_name in _x_sum_list) {
        var _num = _x_sum_list[_x_var_name];
        var _per = (_num) / _total_sum ;
        _x_per_list[_x_var_name] = _per;
        var _per_text = _get_percent_text(_per);
        
        _cross_table.find('.x-sum.y-per-tr [x_var="' + _x_var_name + '"]').html(_per_text);
        _cross_table.find('.x-sum.per-tr [x_var="' + _x_var_name + '"]').html(_per_text);
    }
};

_y_per_list = {};
var _draw_y_percent_cell = function (_cross_table) {
    //var _cross_table = $("#preview_html .cross-table");
    for (var _y_var_name in _y_sum_list) {
        var _num = _y_sum_list[_y_var_name];
        var _per = (_num) / _total_sum;
        _y_per_list[_y_var_name] = _per;
        //var _per_text = precision_string(_per, 1) + '%';
        var _per_text = _get_percent_text(_per);
        //console.log([_x_var_name, _num, _per]);
        
        _cross_table.find('.x-per-tr[y_var="' + _y_var_name + '"] .y-sum').html(_per_text);
        _cross_table.find('.global-tr[y_var="' + _y_var_name + '"] .y-sum').html(_per_text);
    }
};

var _get_percent_text = function (_per) {
    return precision_string(_per, 3);
    //_per = _per*100;
    //return precision_string(_per, 1) + '%';
};

var _is_cell_exp_too_small;
var _draw_cell_percent_cell = function (_cross_table) {
    
    _is_cell_exp_too_small = false;
    
    //var _chi_squared = 0;
    //var _yates_chi_squared = 0;
    
    //var _cross_table = $("#preview_html .cross-table");
    var _tbody = _cross_table.find("tbody");
    for (var _x_var_name in _ct_json) {
        for (var _y_var_name in _ct_json[_x_var_name]) {
            var _num = _ct_json[_y_var_name][_x_var_name];
            
            var _total_per = _num / _total_sum;
            _tbody.find('tr.global-tr[y_var="' + _y_var_name + '"] td[x_var="' + _x_var_name + '"]').html(_get_percent_text(_total_per));
            
            
            //var _exp = (_x_sum_list[_x_var_name] * _y_sum_list[_y_var_name]) / _total_sum;
            //console.log([_num, _y_sum_list[_y_var_name], _x_sum_list[_x_var_name], _total_sum]);
            var _pt = _x_per_list[_x_var_name];
            if (_is_count_same_adjacent_event() === false) {
                // 編碼不可重複的情況
                _pt = (_x_sum_list[_x_var_name]) / (_total_sum - _y_sum_list[_y_var_name]);
            }
            var _exp = (_y_sum_list[_y_var_name] * _pt);
            _tbody.find('tr.exp-tr[y_var="' + _y_var_name + '"] td[x_var="' + _x_var_name + '"]').html(precision_string(_exp, 3));

            var _residual = _num - _exp;
            _tbody.find('tr.residual-tr[y_var="' + _y_var_name + '"] td[x_var="' + _x_var_name + '"]').html(precision_string(_residual, 3));
            
            //var _std_residual = _residual / Math.sqrt(_exp);
            //_tbody.find('tr.std-residual-tr[y_var="' + _y_var_name + '"] td[x_var="' + _x_var_name + '"]').html(precision_string(_std_residual, 1));
            
            // 這邊要換成另一隻種算法
            // https://docs.google.com/presentation/d/1uPTNQAXXSw9pxsy7-Q1RyHBb4XwB9JyTm_nBp38Cqcc/edit#slide=id.p65
            // (2-(4*0.33)) / Math.sqrt((4*0.33)*(1-0.33)*(1-0.44))
            var _adj_residual = 0;
            if (_exp !== 0) {
                //_adj_residual = _residual / Math.sqrt( _exp * (1 - _x_per_list[_x_var_name]) * (1 - _y_per_list[_y_var_name]) );
                var _z1 = _residual;
                var _z2 = _exp;
                var _z3 = 1 - _y_per_list[_y_var_name];
                var _z4 = 1 - _pt;
                if (_z2 !== 0 && _z3 !== 0 && _z4 !== 0) {
                    _adj_residual = _z1 / Math.sqrt(_z2 * _z3 * _z4);
                }
                else {
                    console.log({
                        "error": "e",
                        x: _x_var_name,
                        y: _y_var_name,
                        z1: _z1,
                        z2: _z2,
                        z3: _z3,
                        z4: _z4,
                        x_per: _x_per_list[_x_var_name],
                        x_sum: _x_sum_list[_x_var_name],
                        y_sum: _y_sum_list[_y_var_name],
                        total: _total_sum,
                        same: _is_count_same_adjacent_event(),
                    });
                }
                
                
                // -1.5 / Math.sqrt(2*0.75*0.25*0.67)
                
                /*
                if (_y_var_name === "C" && _x_var_name === "B") {
                    console.log({
                        "f(g,t)": _num,
                        "f(g)": _y_sum_list[_y_var_name],
                        "p(t)": _pt,    // 3 / (6-2) = 3/4
                        "p(g)": _y_per_list[_y_var_name],
                    });
                }
                */
            }
            //console.log([_residual, _exp, _x_per_list[_x_var_name], _y_per_list[_y_var_name]]);
            _tbody.find('tr.adj-residual-tr[y_var="' + _y_var_name + '"] td[x_var="' + _x_var_name + '"]').html(precision_string(_adj_residual, 3));
            
            if (_adj_residual >= 1.96) {
                _tbody.find('tr[y_var="' + _y_var_name + '"] td[x_var="' + _x_var_name + '"]').addClass("sig");
                
                /*
                console.log({
                        "error": "sig",
                        x: _x_var_name,
                        y: _y_var_name,
                        z1: _z1,
                        z2: _z2,
                        z3: _z3,
                        z4: _z4,
                        x_per: _x_per_list[_x_var_name],
                        x_sum: _x_sum_list[_x_var_name],
                        y_sum: _y_sum_list[_y_var_name],
                        total: _total_sum,
                        same: _is_count_same_adjacent_event(),
                    });
                */
            }
            
            var _q = _calc_yule_q(_y_var_name, _x_var_name);
            _tbody.find('tr.yule-q-tr[y_var="' + _y_var_name + '"] td[x_var="' + _x_var_name + '"]').html(precision_string(_q, 3));
        }
    }
};

var _calc_yule_q = function (_y_var_name, _x_var_name) {
    //    X ~X 
    // Y  a  b
    // ~Y c  d
    
    var _a = 0;
    var _b = 0;
    var _c = 0;
    var _d = 0;
    for (var _y in _ct_json) {
        for (var _x in _ct_json[_y]) {
            var _freq = _ct_json[_y][_x];
            if (_x === _x_var_name && _y === _y_var_name) {
                _a += _freq;
            }
            else if (_x !== _x_var_name && _y === _y_var_name) {
                _b += _freq;
            }
            else if (_x === _x_var_name && _y !== _y_var_name) {
                _c += _freq;
            }
            else {
                _d += _freq;
            }
        }
    }
    
    var _ad = _a * _d;
    var _bc = _b * _c;
    var _q = (_ad - _bc) / (_ad + _bc);
    return _q;
};

var _draw_contingency_table_analyze_result = function () {
    
    //console.log([_yates_chi_squared]);
    
    // ------------------------
    
    var _result = $("<div></div>");
    
    // -------------------
    
    // 找出有顯著轉移的序列
    var _sig_seq = _get_sig_seq();
    
    // ------------------
    
    
    //console.log(_chi_squared);
    var _title_container = $('<div><h1>序列分析結果：</h1></div>').appendTo(_result);
    
    var _button = $('<button type="button" class="ui icon button tiny teal speak skip"><i class="talk icon"></i></button>').prependTo(_title_container);
    _button.click(_speak_analyze_result);
    
    // -------------------------------------------
    // 研究目的
    
    // 幾個事件呢？
    var _events = _get_attr();
    var _con1_events = "";
    for (var _e = 0; _e < _events.length; _e++) {
        if (_e > 0) {
            if (_e < _events.length-1) {
                _con1_events += "、";
            }
            else {
                _con1_events += "與";
            }
        }
        _con1_events += '事件「' + _events[_e] + '」';
    }
    
    var _con1 = $('<div class="speak">本研究使用序列分析來檢定研究對象的行為序列資料中' + _con1_events + '之間是否有顯著轉移。</div>').appendTo(_title_container);
    
    // ---------------------------------------
    // 樣本敘述統計量
    
    $('<div class="speak">研究對象總共' + _users_count + '位，事件總數為' + _events_count + '次。</div>').appendTo(_title_container);
    
    var _con2_events = $('<ul></ul>').appendTo(_title_container);
    var _event_desc_table = $('.events-descriptive-table');
    for (var _e = 0; _e < _event_desc_table.find('tbody tr').length; _e++) {
        var _n = _event_desc_table.find('tbody tr:eq(' + _e  + ') th').text();
        var _c = _event_desc_table.find('tr[event="'+_n+'"] td.count').text();
        var _p = _event_desc_table.find('tr[event="'+_n+'"] td.per').text();
        $('<li>事件「' + _n + '」出現次數為' + _c + '次，佔' + _p + '。</li>').appendTo(_con2_events);
    }
    
    $('<div class="speak">雙事件轉移序列總數為' + _total_sum + '次。</div>').appendTo(_title_container);
    
    // ---------------------------------------
    
    $('<div class="speak">序列分析結果顯示：</div>').appendTo(_title_container);
    
    var _chi_squared_container = $('<ul class="analyze-result chi-squared-container"></ul>').appendTo(_result);
        
    for (var _i = 0; _i < _sig_seq.length; _i++) {
        var _seq = _sig_seq[_i];
        $('<li><span class="speak">事件「' + _seq.g + '」到事件「' + _seq.t + '」</span>調整後殘差為' + _seq.z + '<span class="speak">。</span></li>')
                .appendTo(_chi_squared_container);
    }
    
    if (_sig_seq.length > 0) {
        $('<div class="speak">以上序列出現顯著轉移。</div>').appendTo(_result);
    }
    else {
        $('<div class="speak">沒有序列達到顯著轉移。</div>').appendTo(_result);
    }
    
    // ----------------------
    return _result;
};

var _get_sig_seq = function () {
    var _sig_seq = [];
    $("#preview_html .cross-table .adj-residual-tr td.sig").each(function (_i, _td) {
        _td = $(_td);
        var _z = eval(_td.text().trim());
        var _g = _td.parent().attr("y_var");
        var _t = _td.attr("x_var");
        
        _sig_seq.push({
            g: _g,
            t: _t,
            z: _z
        });
    });
    
    // 排序
    _sig_seq.sort(function(_a, _b) {
        return (_b.z - _a.z);
    });
    
    return _sig_seq;
};

var _get_full_seq = function () {
    var _sig_seq = [];
    $("#preview_html .cross-table .adj-residual-tr td:not(.y-sum)").each(function (_i, _td) {
        _td = $(_td);
        var _z = eval(_td.text().trim());
        if (_z < 0) {
            return;
        }
        
        var _g = _td.parent().attr("y_var");
        var _t = _td.attr("x_var");
        
        _sig_seq.push({
            g: _g,
            t: _t,
            z: _z
        });
    });
    
    // 排序
    //_sig_seq.sort(function(_a, _b) {
    //    return (_b.z - _a.z);
    //});
    
    
    
    return _sig_seq;
};


var _speak_analyze_result = function () {
    var _panel = $(".file-process-framework");
    var _result = _panel.find("#preview_html");
    
    var _text = "";
    _result.find('.speak').each(function(_i, _span) {
        if ($(_span).attr("alt") === undefined) {
            _text += $(_span).text();
        }
        else {
            _text += $(_span).attr("alt");
        }
    });
    _text = "序列分析結果顯示。" + _text + "序列分析結束。";
    _text = _text.replace(/「|」/g, '');
    //console.log(_text);
    var _speak_list = _text.split("。");
    if (navigator.userAgent.match(/Android/)) {
        _speak_list = [_text];
    }

//        var _next = function (_i) {
//            _i++;
//            _loop(_i);
//        };
    //var _timer;
    var _loop = function (_i) {
        if (_i < _speak_list.length) {
            responsiveVoice.speak(_speak_list[_i], 'Chinese Female', {
                rate: 1.2,
                onend: function () {
                    //clearTimeout(_timer);
                    _i++;
                    _loop(_i);
                    console.log(_i);
                }
            });

//                console.log(_speak_list[_i].length * 1000 * 0.3 );
//                _timer = setTimeout(function () {
//                    console.log(_i);
//                    _next(_i);
//                }, _speak_list[_i].length * 1000 * 0.3 );
        }
    };
    _loop(0);

};

var _draw_diagram = function (_result, _sig_seq) {
    $('<div class="jtk-demo-canvas canvas-wide statemachine-demo jtk-surface jtk-surface-nopan" id="js_plumb_canvas"></div>').appendTo(_result);
    
    /*
    var _seq_list = [
        {from: "BEGIN", to: "PHONE INTERVIEW 1", label: "text1"},
        {from: "PHONE INTERVIEW 1", to: "BEGIN", label: "text2"},
        {from: "PHONE INTERVIEW 1", to: "PHONE INTERVIEW 1", label: "text3"},
        {from: "PHONE INTERVIEW 1", to: "IN PERSON", label: "text4"},
        {from: "PHONE INTERVIEW 2", to: "REJECTED", label: "text5"},
    ];
    */
    //console.log(_sig_seq);
    var _min_z;
    var _max_z;
    for (var _i = 0; _i < _sig_seq.length; _i++) {
        var _s = _sig_seq[_i];
        if (_min_z === undefined) {
            _min_z = _s.z;
        }
        else if (_s.z < _min_z) {
            _min_z = _s.z;
        }
        
        if (_max_z === undefined) {
            _max_z = _s.z;
        }
        else if (_s.z > _max_z) {
            _max_z = _s.z;
        }
    }
    
    var _ratio = 4 / (_max_z - _min_z);
    
    
    var _seq_list = [];
    for (var _i = 0; _i < _sig_seq.length; _i++) {
        var _s = _sig_seq[_i];
        
        var _width = (_s.z - _min_z) * _ratio;
        _width = _width + 1;
        
        var _color = "#526173";
        if (_s.z > 1.96 
                && $("#input_display_full_transfer_diagram:checked").length === 1) {
            _color = "red";
        }
        //console.log([_s.z, _width]);
        _seq_list.push({
            "from": _s.g,
            "to": _s.t,
            "label": _s.z,
            "paintStyle": {
                strokeWidth: _width, 
                stroke: _color
            }
        });
    }
    
    /*
    _seq_list.push({
            "from": "T",
            "to": "T",
            "label": "1234",
        });
    _seq_list.push({
            "from": "U",
            "to": "U",
            "label": "1234",
        });        
    _seq_list.push({
            "from": "P",
            "to": "P",
            "label": "1234",
        });
    */
    console.log(_seq_list);
    _init_state_machine("js_plumb_canvas", _seq_list);
}; 