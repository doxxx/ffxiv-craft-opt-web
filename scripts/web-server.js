#!/usr/bin/env node

var assetCache = require('asset-cache');

var DEFAULT_PORT = 8001;

function main(argv) {
  var port = Number(argv[2]) || DEFAULT_PORT;
  assetCache.setCwd(argv[3]);
  assetCache.listen(port, function() {
    console.log('\tAsset server listening on port', port);
  });
}

// Must be last
main(process.argv);
