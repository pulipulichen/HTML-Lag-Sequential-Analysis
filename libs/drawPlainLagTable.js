let drawPlainLagTable = function (crossTable) {
  let vars = []
  crossTable.find('thead tr.x-vars-tr th').each((i, ele) => {
    vars.push(ele.innerText.trim())
  })
  
  let data = []
  let attrList = [
    'num',
    'global',
    'exp',
    'residual',
    'adj-residual',
    'yule-q'
  ]
  
  vars.forEach(lag0 => {
    // 等於 y_var
    vars.forEach(lag1 => {
      // 等於 x_var
      
      let d = {
        lag0,
        lag1
      }
      
      attrList.forEach(attr => {
        let td = crossTable.find(`tbody tr[y_var="${lag0}"].${attr}-tr td[x_var="${lag1}"]`)
        //console.log(td.length)
        let value = td.eq(0).text()
        value = Number(value)
        d[attr] = value
      })
      
      data.push(d)
    })
  })
  
  //console.log(data)
  
  // --------------------------------
  
  let table = $(`<div class="analyze-result cross-table event-transfer-table">
<div class="caption" style="text-align:center;display:block">
  事件轉移表
  <button type="button" class="copy-table">複製</button>
</div>
<table border="1" cellpadding="0" cellspacing="0">
  <thead>
    <tr>
      <th>Lag 0</th>
      <th>Lag 1</th>
      <th>Lag 0->1</th>
      <th>出現頻率 f(g,t)</th>
      <th>出現機率 p(g,t)</th>
      <th>期望個數 exp(g,t)</th>
      <th>殘差</th>
      <th>調整後殘差<sup>a</sup></th>
      <th>相關係數<sup>b</sup></th>
    </tr>
  </thead>
  <tbody></tbody>
</table>
</div>`)
  
  table.find('.copy-table').click(() => {
    let text = data.map(d => {
      
      let line = [
        d['lag0'], 
        d['lag1'], 
        d['lag0'] + '->' + d['lag1']
      ]
      
      attrList.forEach(attr => {
        line.push(d[attr])
      })
      
      return line.join('\t')
    }).join('\n')
    
    text = [
      'Lag 0',
      'Lag 1',
      'Lag 0->1',
      '出現頻率',
      '出現機率',
      '期望個數',
      '殘差',
      '調整後殘差',
      '相關係數'].join('\t') + '\n' + text
    
    copyPlainText(text)
  })
  
  // --------------------------------
  
  let tbody = table.find('tbody')
  
  let useYuleQConnect = $('#connection_with_yule_q').prop('checked')
  let useYuleQsigZConnect = $('#connection_with_yule_q_sig_z').prop('checked')
  let useYuleQConnectMin = Number($('#connection_with_yule_q_min').val())

  data.forEach(d => {
    
    
    let tr = $('<tr></tr>')
    
    tr.append(`<td>${d['lag0']}</td>`)
    tr.append(`<td>${d['lag1']}</td>`)
    tr.append(`<td>${d['lag0']}->${d['lag1']}</td>`)
    
    attrList.forEach(attr => {
      tr.append(`<td>${d[attr]}</td>`)
    })
    
    if (useYuleQConnect === false) {
      if (d['adj-residual'] >= 1.96) {
        tr.find('td').css('background-color', 'yellow')
        tr.find('td').css('color', 'red')
      }
    }
    else if (useYuleQsigZConnect === true) {
      if (d['adj-residual'] >= 1.96 && d['yule-q'] >= useYuleQConnectMin) {
        tr.find('td').css('background-color', 'yellow')
        tr.find('td').css('color', 'red')
      }
    }
    else {
      if (d['yule-q'] >= useYuleQConnectMin) {
        tr.find('td').css('background-color', 'yellow')
        tr.find('td').css('color', 'red')
      }
    }
    
    tbody.append(tr)
  })
  
  // --------------------------------
  
  return table
}