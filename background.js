chrome.extension.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(msg) {
        if (msg.action === 'start') {
            var audioCtx = new (window.AudioContext)();
            chrome.tabCapture.capture({
                    audio : true,
                    video : false
                }, function(stream) {
                    var source = audioCtx.createMediaStreamSource(stream);
                    var analyser = audioCtx.createAnalyser();
                    source.connect(analyser);
                    analyser.connect(audioCtx.destination);

                    analyser.fftSize = 2048;
                    var bufferLength = analyser.frequencyBinCount;
                    var dataArray = new Float32Array(bufferLength);

                    function draw() {
                        analyser.getFloatFrequencyData(dataArray);
                        port.postMessage({data: dataArray, bufferLength: bufferLength, sampleRate:analyser.context.sampleRate,fftSize:analyser.fftSize});
                    };
					let time_a=0;
					let time_b=16;
                    var intv = setInterval(function(){ 
					time_a=performance.now();
					draw();
					time_b=performance.now();
					}, time_b-time_a+1);
                    port.onDisconnect.addListener(function(){
                        clearInterval(intv);
                        audioCtx.close();
                        stream.getAudioTracks()[0].stop();
                    });
                }
            );
        }
    });
});
