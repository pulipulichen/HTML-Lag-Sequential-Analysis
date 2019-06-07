let CSVHelper = {
  arrayToCSVString: function (headings, ary) {
    if (ary === undefined && Array.isArray(headings)) {
      ary = headings
      headings = []
      for (let i = 0; i < ary[0].length; i++) {
        headings.push(`field_` + (i+1))
      }
    }
    
    let output = []
    
    output.push(headings.join(','))
    
    ary.forEach(item => {
      if (Array.isArray(item)) {
        item = item.map(field => {
          if (typeof(field) !== 'string') {
            return field
          }
          
          if (field.indexOf('"') > -1) {
            field = field.split('"').join('\\"')
            field = `"${field}"`
          }
          else if (field.indexOf("'") > -1) {
            field = `"${field}"`
          }
          return field
        })
        output.push(item.join(','))
      }
      else {
        output.push(item)
      }
    })
    
    return output.join('\n')
  },
  arrayToCSVTableHTML: function (headings, ary) {
    if (ary === undefined && Array.isArray(headings)) {
      ary = headings
      headings = []
      for (let i = 0; i < ary[0].length; i++) {
        headings.push(`field_` + (i+1))
      }
    }
    
    let table = $(`<table border="1"><thead><tr></tr></thead><tbody></tbody></table>`)
    
    let theadTr = table.find('thead > tr')
    headings.forEach(h => {
      theadTr.append(`<th>${h}</th>`)
    })
    
    let tbody = table.find('tbody')
    ary.forEach(row => {
      let tr = $('<tr></tr>').appendTo(tbody)
      row.forEach(col => {
        tr.append(`<td>${col}</td>`)
      })
    })
    
    return table.prop('outerHTML')
  }
}

window.CSVHelper = CSVHelper