let LagSequentialAnalysisCalculator = {
  calcYuleQ: function (_ct_json, _y_var_name, _x_var_name) {
    //    X ~X 
    // Y  a  bCalculater
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
  }
}

window.LagSequentialAnalysisCalculator = LagSequentialAnalysisCalculator