canvas = document.getElementById('visualiser');
canvasCtx = canvas.getContext("2d");
  canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
    canvasCtx.fillStyle = 'rgb(0,0,0)';
	
	function lerp(a,b,t) {
		return ((1 - (t)) * (a) + (t) * (b) );
		}
		
		function Hz_to_midi_n(f){
			return 12*Math.log2(f/440)+49;
		}	
		function midi_n_to_Hz(n){
			return Math.pow(2,(n-49)/12)*440;
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
	 
			 let mx=data[0].y;
  for(let i = 1; i <data.length; i++) {
	  mx=(data[i].y>mx)?data[i].y:mx;
  }
  
				var scaleY=HEIGHT/mx;
				var min_f=0;
				var max_f=0;
				var d_l=data.length;
            for (var n = 0; n < d_l; n++) {  
                var point = data[n];  
				var s_y=HEIGHT-point.y*scaleY;
				freqs.push(point.x);
				min_f=(point.x<min_f || min_f==0)?point.x:min_f;
				max_f=(point.x>max_f)?point.x:max_f;
				mags.push(s_y);
            }
			
			var min_n=Hz_to_midi_n(min_f);
			var max_n=Hz_to_midi_n(max_f);
			var n_step=(max_n-min_n)/(HEIGHT-((data[0].x==0)?2:1));
			
			var n_Hz=midi_n_to_Hz(min_n);
			var equal_n=(data[0].x==0)?[0,n_Hz]:[n_Hz];
			var n_s=min_n;
			
			while (n_Hz<=max_f){
				n_s+=n_step;
				n_Hz=midi_n_to_Hz(n_s);
				equal_n.push(n_Hz);
			}
			
			var n_l=0;
			var n_h=0;
			
			var eq_nl=equal_n.length;
			var f_l=freqs.length;
			
			var equal_n_m=[];
			
			for (let i=0; i<eq_nl; i++){
				equal_n_m[i]=0;
				var n=equal_n[i];
				var breaker=false;
				while((n_l < f_l && n_h<f_l) && !breaker){
					var l_f=freqs[n_l];
					var h_f=freqs[n_h];
					
					if(l_f==n){
						equal_n_m[i]=mags[n_l];
						
							breaker=true;
					}
					if(!breaker){
						n_h=(n_l==n_h)?n_l+1:n_h;
						if(n_h>=f_l){
							equal_n_m[i]=mags[f_l-1];
							breaker=true;
						}else{
							h_f=freqs[n_h];
						}
						if(l_f<n && h_f>n){
							let diff=h_f-l_f;
							equal_n_m[i]=lerp(mags[n_l],mags[n_h],((diff==0)?0:(n-l_f)/diff));
							n_h=n_l;
							breaker=true;
						}else{
							n_l++;
						}
					}
				}
			}
			
			
			
				for (let y = 0; y < HEIGHT; y++) {  //freq axis
				
					  yf=equal_n_m[y]/HEIGHT;


				canvasCtx.fillStyle = 'hsl('+ (67.5*(yf)) +','+Math.pow(yf,1/adjPow)*100+'%,'+(1-Math.pow(yf,1/adjPow))*100+'%)';

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