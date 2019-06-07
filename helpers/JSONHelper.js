let JSONHelper = {
  traverse2WaysContigencyTable: function (_ct_json, _callback) {
    for (var _x_var_name in _ct_json) {
        for (var _y_var_name in _ct_json[_x_var_name]) {
            _callback(_x_var_name, _y_var_name, _ct_json[_y_var_name][_x_var_name]);
        }
    }
  }
}

window.JSONHelper = JSONHelper