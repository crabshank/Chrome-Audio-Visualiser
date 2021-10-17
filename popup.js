canvas = document.getElementById('visualiser');
canvasCtx = canvas.getContext("2d");
  canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
    canvasCtx.fillStyle = 'rgb(0,0,0)';
	
	function lerp(a,b,t) {
		return ((1 - (t)) * (a) + (t) * (b) );
		}
	
var WIDTH = 500;
var HEIGHT = 500;
var freqMags=[];
var adjPow=3.1;

var sldL=document.getElementById('powSldL');
var sld=document.getElementById('powSld');

sld.oninput= function(){
	adjPow=sld.value;
	sldL.innerText=sld.valueAsNumber.toFixed(3);
}

var port = chrome.extension.connect();
port.postMessage({action: 'start'});

port.onMessage.addListener(function(msg) {
  var dataArray = msg.data;
  var bufferLength = msg.bufferLength;
  var sampleRate = msg.sampleRate;
  var fftSize = msg.fftSize;
	var step=sampleRate/fftSize;


function drawLine (data,context) {
	var freqs=[];
	 var mags=[];
	 var magsSort=[];
	 
			 let mx=data[0].y;
  for(let i = 1; i <data.length; i++) {
	  mx=(data[i].y>mx)?data[i].y:mx;
  }
  
				var scaleY=HEIGHT/mx;

            for (var n = 0; n < data.length; n++) {  
                var point = data[n];  
				var s_y=HEIGHT-point.y*scaleY;
				freqs.push(point.x);
				mags.push(s_y);
				magsSort.push(s_y);
            }
			
			var curr_y_f;
			var yf;
			
			var eqPows=[];
						
				var currPw=adjPow;

		magsSort.sort(function(a, b) {return b-a;});
		let topAvgs=[0.5*(magsSort[0]+magsSort[1]),(1/3)*(magsSort[0]+magsSort[1]+magsSort[2])];
				
				for (let i = 0, len= mags.length; i < len; i++){
					if(i==0){
						let pw=lerp(adjPow,0.001,(0.5*(mags[i]+mags[i+1]))/topAvgs[0]);
						currPw=(pw<currPw)?pw:currPw;
						eqPows[i]=currPw;
					}else if (i== mags.length-1){
						let pw=lerp(adjPow,0.001,(0.5*(mags[i]+mags[i-1]))/topAvgs[0]);
						currPw=(pw<currPw)?pw:currPw;
						eqPows[i]=currPw;
					}else{
						let pw=lerp(adjPow,0.001,((1/3)*(mags[i-1]+mags[i]+mags[i+1]))/topAvgs[1]);
						currPw=(pw<currPw)?pw:currPw;
						eqPows[i]=currPw;
					}				
				}
				
				for (let y = 0; y < HEIGHT; y++) {  //freq axis
				let mxf=freqs[freqs.length-1];
					 curr_y_f=(mxf/HEIGHT)*(HEIGHT-y);
				let fEl=Math.floor(curr_y_f/step);
			curr_y_f= curr_y_f/mxf; //0 to 1
					 curr_y_f= Math.pow(curr_y_f,eqPows[fEl])*mxf;
					 
					  yf=mags[Math.floor(curr_y_f/step)]/HEIGHT;


				canvasCtx.fillStyle = 'hsl('+ (67.5*(yf)) +','+Math.pow(yf,1/eqPows[fEl])*100+'%,'+(1-Math.pow(yf,1/eqPows[fEl]))*100+'%)';

					canvasCtx.fillRect( WIDTH-1, y, 1, 1 );
				
				}
				

								// shift everything to the left:
var imageData = canvasCtx.getImageData(1, 0, WIDTH-1, HEIGHT);
canvasCtx.putImageData(imageData, 0, 0);
canvasCtx.clearRect(WIDTH-1, 0, 1, HEIGHT);
				
				}
		   


 var data = [];
 let mn=dataArray[0];

 
	for(let i = 1; i <bufferLength; i++) {
		mn=(dataArray[i]<mn)?dataArray[i]:mn;
	}  

  for(let i = 0; i <bufferLength; i++) {
	  if(mn<0){
			dataArray[i]-=mn;
	  }
  }
  
 let mx=dataArray[0];
  for(let i = 1; i <bufferLength; i++) {
	  mx=(dataArray[i]>mx)?dataArray[i]:mx;
  }
  
  for(let i =0; i < bufferLength; i++) {
	data.push({x:i*step,y:dataArray[i]});
  }
  
drawLine (data,canvasCtx);
});
