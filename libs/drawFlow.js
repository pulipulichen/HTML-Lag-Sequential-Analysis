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
      loop = 'entryX=0.25;entryY=1;entryDx=0;entryDy=0;exitX=1;exitY=0.75;exitDx=0;exitDy=0;'
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




// -------------------------

//document.getElementById('output').value = buildDiagramXML(nodes, edges)