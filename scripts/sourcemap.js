const sourceMap = require('source-map');
const fs = require('fs');

fs.readFile('./bundle.map.js', 'utf8', async function (err, data) {
  await sourceMap.SourceMapConsumer.with(data, null, consumer => {
    console.log(consumer.sources);
    console.log(consumer.originalPositionFor({ line: 1212, column: 1362 }));
    //consumer.eachMapping(function(m) {});
  });
});