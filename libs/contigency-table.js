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
