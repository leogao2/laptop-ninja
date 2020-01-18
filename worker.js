importScripts('https://cdn.jsdelivr.net/npm/setimmediate@1.0.5/setImmediate.min.js')
self.importScripts('handtrack.min.js');

const ht = handTrack.load();

onmessage = async (e) => {
    var hmodel = await ht;
    console.log('Message received from main script', e.data);   
    hmodel.detect(e.data).then(predictions => {
      console.log('Predictions: ', predictions); 
    });
    console.log('Posting message back to main script', res);
    postMessage(res);
  }