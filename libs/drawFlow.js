/*
let edges = [
  {source: "Aa", target: "Cc", label: '0.9*', width: 1},
  {source: "Bb", target: "Dd", label: '0.3', width: 2}
]
*/
let seqListToEdges = (seqList) => {
  return seqList.map(s => {
    return {
      source: s.from,
      target: s.to,
      label: s.label,
      width: s.paintStyle.strokeWidth
    }
  })
}

let parseNodesFromEdges = (edges) => {
  let nodes = []
  edges.forEach(({source, target}) => {
    if (nodes.indexOf(source) === -1) {
      nodes.push(source)
    }
    if (nodes.indexOf(target) === -1) {
      nodes.push(target)
  }
  })
  //nodes.sort()
  return nodes
}
//let nodes = parseNodesFromEdges(edges)


// -------------------------
let buildDiagramXML = function (nodes, edges) {
  let maxNodeLength = 0
  nodes.forEach(n => {
    if (maxNodeLength < n.length) {
      maxNodeLength = n.length
    }
  })
  
  let nodeWidth = 40 + (maxNodeLength * 10)
  let nodeHeight = nodeWidth

  let nodeSize = nodeWidth
  if (nodeSize < nodeHeight) {
    nodeSize = nodeHeight
  }

  let diameter = Math.round(nodeSize * 2 * Math.sqrt(nodes.length))
  let pageSize = diameter + nodeSize
  let centerSize = Math.round(pageSize / 2)
  let nodePos = buildNodePositions(nodes)
  //console.log(nodePos)

  // -------------------------

  let xml = $(`<mxfile host="app.diagrams.net" modified="2020-08-27T09:19:55.502Z" agent="5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36" etag="enQdLDDL4RRfg4W3JObJ" version="13.6.5" type="device">
    <diagram id="C5RBs43oDa-KdzZeNtuy" name="Page-1">
      <mxGraphModel dx="${Math.round(pageSize / 2)}" dy="${Math.round(pageSize / 1.5)}" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="${pageSize}" pageHeight="${pageSize}" math="0" shadow="0">
        <root>
          <mxCell id="WIyWlLk6GJQsqaUBKTNV-0"></mxCell>
          <mxCell id="WIyWlLk6GJQsqaUBKTNV-1" parent="WIyWlLk6GJQsqaUBKTNV-0"></mxCell>
        </root>
      </mxGraphModel>
    </diagram>
  </mxfile>`)


  let root = xml.find('root')

  // -------------

  nodes.forEach((node, i) => {
    let pos = nodePos[node]

    let x = Math.round(pos.x * diameter + pageSize * 2)
    let y = Math.round(pos.y * diameter + pageSize * 2)

    root.append(`<mxCell id="WIyWlLk6GJQsqaUBKTNV-cell${i}" 
              value="${node}" style="whiteSpace=wrap;html=1;fontSize=12;glass=0;strokeWidth=1;shadow=1;rounded=1;" parent="WIyWlLk6GJQsqaUBKTNV-1" vertex="1">
          <mxGeometry x="${x}" y="${y}" width="${nodeWidth}" height="${nodeHeight}" as="geometry" />
        </mxCell>`)
  })

  // -------------
  let overlap = []

  edges.forEach(({source, target, label, width}, i) => {
    let sourceID = `WIyWlLk6GJQsqaUBKTNV-cell${nodes.indexOf(source)}`
    let targetID = `WIyWlLk6GJQsqaUBKTNV-cell${nodes.indexOf(target)}`
    
    let overlapID = [source, target].sort().join('-')
    let warning = ''
    if (overlap.indexOf(overlapID) === -1) {
      overlap.push(overlapID)
    }
    else {
      warning = 'strokeColor=#FF0000;'
    }

    if (isNaN(width)) {
      width = 1
    }
    
    let loop = ''
    if (source === target) {
      loop = 'entryX=0.75;entryY=1;entryDx=0;entryDy=0;exitX=1;exitY=0.75;exitDx=0;exitDy=0;'
    }

    root.append(`<mxCell id="A-Yyusrlcqo05p7WiQaU-line${i}" value="${label}" 
    style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeWidth=${width};${warning}jumpStyle=arc;jumpSize=12;${loop}" 
    parent="WIyWlLk6GJQsqaUBKTNV-1" 
    source="${sourceID}" 
    target="${targetID}" edge="1">
          <mxGeometry relative="1" as="geometry"></mxGeometry>
        </mxCell>`)
  })

  // -------------

  let text = `<?xml version="1.0" encoding="UTF-8"?>`
          + xml.prop('outerHTML')

  let remapping = {
    'mxgraphmodel': 'mxGraphModel',
    'mxcell': 'mxCell',
    'mxgeometry': 'mxGeometry'
  }
  Object.keys(remapping).forEach(s => {
    text = text.split(s).join(remapping[s])
  })

  return text
}

let buildNodePositions = function (nodes) {
  let output = {}
  nodes.forEach((node, i) => {
    output[node] = {
      x: Math.sin(Math.PI * 2 * i / nodes.length),
      y: Math.cos(Math.PI * 2 * i / nodes.length) * -1,
    }
  })
  return output
}


let parseGroup = (node) => {
  if (node.indexOf('-') === -1) {
    return '_'
  }
  else {
    return node.slice(0, node.indexOf('-'))
  }
}
  
let analyzeGroupEdges = function (edges) {
  let groupList = {}
  
  
  let addToGroupList = (group, edge) => {
    if (Array.isArray(groupList[group]) === false) {
      groupList[group] = []
    }
    groupList[group].push(edge)
  }
  
  edges.forEach(edge => {
    let sourceGroup = parseGroup(edge.source)
    let targetGroup = parseGroup(edge.target)
    
    if (sourceGroup === targetGroup) {
      addToGroupList(sourceGroup, edge)
    }
    else {
      addToGroupList(sourceGroup, edge)
      addToGroupList(targetGroup, edge)
    }
  })
  
  return groupList
}


// -------------------------

//document.getElementById('output').value = buildDiagramXML(nodes, edges)


let appendDiagramFlow = function (_seq_list) {
  
    let edges = seqListToEdges(_seq_list)
    let groupsEdges = analyzeGroupEdges(edges)
    
    let groupsKeys = Object.keys(groupsEdges)
    groupsKeys.sort()
    groupsKeys.forEach(group => {
      let e = groupsEdges[group]
      
      if (group === 'AP') {
        console.log(e)
      }
      
      let copyLabel = 'Copy'
      if (group !== '_') {
        copyLabel = 'Copy ' + group
      }
      
      let downloadLabel = 'Download'
      if (group !== '_') {
        downloadLabel = 'Download ' + group
      }
      
      //console.log(edges)
      let nodes = parseNodesFromEdges(e)
      let xml = buildDiagramXML(nodes, e)
      let diagramButtons = $(`<div class="ui fluid buttons">
      <a class="ui button copy-button">${copyLabel}</a>
      <a class="ui button download-button" group="${group}">${downloadLabel}</a>
      <a class="ui button" href="https://app.diagrams.net/" target="_blank">diagrams.net</a>
  </div>`)

      diagramButtons.find('.download-button').click(function () {
        let nodeString = []
        
        for (let i = 0; i < nodes.length; i++) {
          /*
          if (nodeString !== '') {
            nodeString = nodeString + ','
          }
          */
          let n = nodes[i]
          if (n.indexOf('-') > -1) {
            n = n.slice(n.indexOf('-') + 1)
          }
          n = n.slice(0,3)

          nodeString.push(n)
          if (nodeString.join(',').length > 10) {
            break
          }
        }

        nodeString = nodeString.join(',')
        let filename
        let paticipantName = $('#paticipant_code').val()
        
        if (group !== '_') {
          filename = `LSA-${group}-${nodeString}-${paticipantName}-${(new Date().mmddhhmm())}.xml`
        }
        else {
          filename = `LSA-${nodeString}-${paticipantName}-${(new Date().mmddhhmm())}.xml`
        }
        
        
        
        _download_file(xml, filename, "text/xml");
      })

      diagramButtons.find('.copy-button').click(() => {
        copyPlainText(xml)
      })

      let preview = $('#preview_html')
      preview.append(buildDiagramTable(e, group))
      preview.append(`<textarea onfocus="this.select()">` + xml + `</textarea>`)
      preview.append(diagramButtons)
      //drawPlainLagTable()
    })
      
}

let sortTwoStrings = function (str1, str2) {
  if (str1 > str2) {
    return 1
  }
  else {
    return -1
  }
}

let sortTwoStringsWithGroup = function (str1, str2, group) {
  if (parseGroup(str1) === parseGroup(str2)) {
      return sortTwoStrings(str1, str2)
    }
    else if (parseGroup(str1) === group) {
      return -1
    }
    else if (parseGroup(str2) === group) {
      return 1
    }
}

let sortNodesByGroup = function (source, target, group) {
  let nodes = []
  
  if (parseGroup(source) !== parseGroup(target)) {
    if (parseGroup(source) === group) {
      nodes = [source, target]
    }
    else if (parseGroup(target) === group) {
      nodes = [target, source]
    }
    else {
      nodes = [source, target]
      nodes.sort()
    }
  }
  else {
    nodes = [source, target]
    nodes.sort()
  }
  
  return nodes
}

let buildDiagramTable = function (edge, group) {
  edge = [].concat(edge)
  
  edge.sort((a, b) => {
    let aNodes = sortNodesByGroup(a.source, a.target, group)
    let bNodes = sortNodesByGroup(b.source, b.target, group)
    
    if (parseGroup(aNodes[0]) !== parseGroup(bNodes[0])) {
      if (parseGroup(aNodes[0]) === group) {
        return -1
      }
      else if (parseGroup(bNodes[0]) === group) {
        return 1
      }
    }
    else {
      if (aNodes[0] === bNodes[0]) {
        if (aNodes[0] === a.source && bNodes[0] === b.source) {
          if (parseGroup(aNodes[1]) === group) {
            return -1
          }
          else if (parseGroup(bNodes[1]) === group) {
            return 1
          }
          else {
            return sortTwoStrings(aNodes[1], bNodes[1])
          }
        }
        else if (aNodes[0] === a.source) {
          return -1
        }
        else if (bNodes[0] === b.source) {
          return 1
        }
        return sortTwoStrings(aNodes[1], bNodes[1])
      }
      else {
        return sortTwoStrings(aNodes[0], bNodes[0])
      }
    }
    
    /*
    if (parseGroup(a.source) !== parseGroup(b.source)) {
      if (parseGroup(a.source) === group) {
        return -1
      }
      else {
        return 1
      }
    }
    else {
      if (a.source === b.source) {
        return sortTwoStrings(a.target, b.target)
      }
      else {
        return sortTwoStrings(a.source, b.source)
      }
    }
    */
    
    /*
    if (a.source === a.target) {
      if (b.source === b.target) {
        return (sortTwoStrings(a.source, b.source))
      }
      return -1
    }
    else if (b.source === b.target) {
      return 1
    }
    else if (parseGroup(a.source) === parseGroup(a.target) 
            && parseGroup(b.source) === parseGroup(b.target)
            && parseGroup(b.source) === parseGroup(a.source)) {
      if (a.source === b.source) {
        return sortTwoStrings(a.target, b.target)
      }
      return sortTwoStrings(a.source, b.source)
    }
    else if (parseGroup(a.source) === group) {
      if (parseGroup(a.target) === group) {
        if (parseGroup(b.source) === group 
                && parseGroup(b.target) === group) {
          if (a.source !== b.source) {
            return sortTwoStrings(a.source, b.source)
          }
          else if (a.target !== b.target) {
            return sortTwoStrings(a.target, b.target)
          }
        }
        else if (parseGroup(b.source) === group
                && a.source === b.source) {
          return sortTwoStrings(a.target, b.target)
        }
        return -1
      }
      else if (parseGroup(b.source) === group) {
        if (a.source === b.source) {
          return sortTwoStringsWithGroup(a.target, b.target, group)
        }
        return sortTwoStringsWithGroup(a.source, b.source, group)
      }
      else if (parseGroup(b.source) === group 
              && parseGroup(b.target) === group) {
        return 1
      }
      return -1
    }
    else if (parseGroup(b.source) === group) {
      return 1
    }
    else {
      if (a.target > b.target) {
        return 1
      }
      else if (a.target < b.target) {
        return -1
      }
      else if (a.source > b.source) {
        return 1
      }
      else if (a.source < b.source) {
        return -1
      }
    }
     */
  })
  
  let paticipant = $('#paticipant_code').val()
  
  if (group !== '_') {
    if (paticipant !== '') {
      paticipant = paticipant + '-'
    }
    paticipant = paticipant + group
  }
  
  paticipant = paticipant + `(${edge.length})`
  
  let table = $(`<table class="ui compact table">
  <thead>
    <tr>
      <th>${paticipant}</th>
      <th>source</th>
      <th>target</th>
      <th>label</th>
    </tr>
  </thead>
  <tbody></tbody>
</table>`)
  
  let tbody = table.find('tbody')
  
  let colorList = ['yellow', '#2ecc71']
  
  let lastCode
  let colorIndex = 0
  
  let parseCode = function (node) {
    if (node.indexOf('-') === -1) {
      return node
    }
    return node.slice(node.indexOf("-") + 1)
  }
  
  edge.forEach(({source, target, label}) => {
    let edgeNodes = sortNodesByGroup(source, target, group)
    let code = parseCode(edgeNodes[0])
    
    if (!lastCode) {
      lastCode = code
    }
    else if (lastCode !== code) {
      colorIndex++
      lastCode = code
    }
    
    let color = colorList[(colorIndex % colorList.length)]
    
    let checked = ''
    if (source === target) {
      checked = `checked="checked"`
    }
    
    let tr = $(`<tr>
      <td><div class="ui fitted slider checkbox">
          <input type="checkbox" ${checked}> <label></label>
        </div></td>
      <td class="source">${source}</td>
      <td class="target">${target}</td>
      <td class="label">${label}</td>
    </tr>`)
    
    //console.log(parseGroup(source), parseGroup(target))
    if (source === target) {
      tr.find('.source,.target').css('color', 'red')
    }
    
    if (parseGroup(source) === group) {
      //tr.find('.source').addClass('positive')
      if (parseCode(source) === lastCode) {
        tr.find('.source').css('background-color', color)
      }
      else {
        tr.find('.source').css('color', 'red')
      }
    }
    if (parseGroup(target) === group) {
      
      if (parseCode(target) === lastCode) {
        tr.find('.target').css('background-color', color)
      }
      else {
        tr.find('.target').css('color', 'red')
      }
    }
    
    tbody.append(tr)
  })
  
  return table
}