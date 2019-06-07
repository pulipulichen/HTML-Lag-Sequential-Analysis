let AsyncLoopHelper = {
  loop: function (ary, delaySec, process, callback) {
    if (typeof(delaySec) === 'function' && typeof(process) === 'function' && typeof(callback) === 'undefined') {
      callback = process
      process = delaySec
      delaySec = 0.1
    }
    
    if (typeof(delaySec) !== 'function' || typeof(process) !== 'function') {
      return ary
    }
    
    // --------------------
    
    if (Array.isArray(ary) === false) {
      process(ary)
      callback(ary)
      return ary
    }
    
    else if (ary.length === 0) {
      callback(ary)
    }
    else {
      let item = ary.shift()
      process(item, () => {
        setTimeout(() => {
          this.loop(ary, delaySec, process, callback)
        }, delaySec * 1000)
      })
    }
  }
}

window.AsyncLoopHelper = AsyncLoopHelper