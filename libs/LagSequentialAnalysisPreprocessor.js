/* global AsyncLoopHelper */

let LagSequentialAnalysisPreprocessor = {
  parseCSVArray: function (csvString, callback) {
    if (typeof(csvString) !== 'string') {
      return csvString
    }
    
    let lines = csvString.trim().split('\n')
    let csvArray = []
    AsyncLoopHelper.loop(lines, 0, (line, next) => {
      let sep = ','
      if (line.indexOf(sep) === -1) {
        sep = '\t'
      }
      
      line = line.trim().split(sep).map(field => {
        if (field.startsWith('"') && field.endsWith('"')) {
          return field.split(1, -1).trim()
        }
        else if (field.startsWith("'") && field.endsWith("'")) {
          return field.split(1, -1).trim()
        }
        else {
          // return field.trim()
          // 看看是不是數字
          if (isNaN(field) === false) {
            eval(`field = ${field}`)
          }
          return field
        }
      })
      csvArray.push(line)
      next()
    }, () => {
      callback(csvArray)
    })
  },
  combineTimeSeq: function (csvArray, callback) {
    if (typeof (csvArray) === 'string') {
      return this.parseCSVArray(csvArray, (csvArray) => {
        this.combineTimeSeq(csvArray, callback)
      })
    }

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
        } else {
          _seq_type = "string";
        }
      }

      if (isNaN(_seq_id) === false) {
        _seq_id = eval(_seq_id);
      }

      var _events = _fields[2].split(";");

      // 加入到_users_seq
      if (typeof (_users_seq[_user]) === "undefined") {
        _users_seq[_user] = {};
      }
      if (typeof (_users_seq[_user][_seq_id]) === "undefined") {
        _users_seq[_user][_seq_id] = [];
      }
      for (var _e = 0; _e < _events.length; _e++) {
        _users_seq[_user][_seq_id].push(_events[_e]);
      }
    }
    
    // -------------------------------------

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
    
    // ------------------------------

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
  }
}

window.LagSequentialAnalysisPreprocessor = LagSequentialAnalysisPreprocessor