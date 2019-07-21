let CSVHelper = {
  arrayToCSVString: function (headings, ary, callback) {
    if (ary === undefined && Array.isArray(headings)) {
      ary = headings
      headings = []
      let i = 0
      AsyncLoopHelper.loop(ary[0], 0, (item, next) => {
        headings.push(`field_` + (i+1))
        i++
        next()
      }, () => {
        this.arrayToCSVString(headings, ary, callback)
      })
      return
    }
    
    let output = []
    
    output.push(headings.join(','))
    
    AsyncLoopHelper.loop(ary, 0, (rowItems, rowNext) => {
      let line = []
      AsyncLoopHelper.loop(rowItems, 0, (field, colNext) => {
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
        line.push(field)
        colNext()
      }, () => {
        output.push(line.join(','))
        rowNext()
      })
    }, () => {
      callback(output.join('\n'))
    })
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