 var _d = [[74,10],
[76,83],
[88,10],
[63,74],
[63,75],
[10,79],
[69,73],
[10,92],
[58,10],
[75,85]];
    var _n = _d.length;
    var _r = pearsonCorrelation(_d);
    var _t = _r * Math.sqrt( (_n-2) / (1-(_r*_r)) );
    var _p = (1-tprob((_n-2), _t))*2;
    console.log({
        r: _r,
        p: _p,
        n: _n,
    });