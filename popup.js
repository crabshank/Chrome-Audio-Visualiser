canvas = document.getElementById('visualiser');
canvasCtx = canvas.getContext("2d");
  canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
    canvasCtx.fillStyle = 'rgb(0,0,0)';
var WIDTH = 500;
var HEIGHT = 500;
var freqMags=[];
var adjPow=1;

var sldL=document.getElementById('powSldL');
var sld=document.getElementById('powSld');

sld.oninput= function(){
	adjPow=sld.value;
	sldL.innerText=sld.value;
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
	freqMags=[];
  //canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
 // canvasCtx.fillStyle = 'rgb(242, 242, 242)';

 // canvasCtx.lineWidth = 1;
// canvasCtx.beginPath();
          //  context.save();  
			 let mx=data[0].y;
  for(let i = 1; i <data.length; i++) {
	  mx=(data[i].y>mx)?data[i].y:mx;
  }
           /*context.lineWidth = width;  
           context.strokeStyle = color;  
           context.fillStyle = color;  */
				var scaleY=HEIGHT/mx;
				//var scaleX=WIDTH/data[data.length-1].x;
      //   context.beginPath();  
 
   
            for (var n = 0; n < data.length; n++) {  
                var point = data[n];  
				//var s_x=point.x*scaleX;
				var s_y=HEIGHT-point.y*scaleY;
				/*	if (n==0){
						context.moveTo(0,s_y); 
					}	*/
					
                // draw segment  
               /* context.lineTo(s_x,s_y);  
                context.stroke();  
                context.closePath();  */
   
              //  position for next segment  
             /*  context.beginPath();  
              context.moveTo(s_x,s_y);  */
				freqMags.push({f:point.x, m:s_y});
            }
			
        //  context.restore();  
			//var curr_x_f;
			var curr_y_f;
			//var xf;
			var yf;
			
				for (let y = 0; y < HEIGHT; y++) {  //freq axis
				let mxf=freqMags[freqMags.length-1].f;
					 curr_y_f=(mxf/HEIGHT)*(HEIGHT-y);
					curr_y_f= curr_y_f/mxf; //0 to 1
					 curr_y_f= Math.pow(curr_y_f,adjPow)*mxf;
					 
					  yf=freqMags[Math.floor(curr_y_f/step)].m/HEIGHT;
			
		       /* for (let x= 0; x < WIDTH; x++) { //time axis 

					 /*curr_x_f=(curr_y_f)*(1-x/WIDTH);
					 xf=freqMags[Math.floor(curr_x_f/step)].m;
	
					let max_X=Math.max(xf,yf);
					let out =(max_X==0)?1:(Math.min(xf,yf)/max_X);
					
					//canvasCtx.fillStyle = "rgb("+out+","+out+","+out+")";
					canvasCtx.fillStyle = 'hsl('+ (240*(1-out)) +',100%,50%)';
					canvasCtx.fillRect( x, y, 1, 1 );*/
			
				


			/*if(yf==0){
				canvasCtx.fillStyle = 'rgb(0,0,0)';
			}else{*/
			//	canvasCtx.fillStyle = 'hsl('+ (240*(yf)) +',100%,45%)';
				canvasCtx.fillStyle = 'hsl('+ (67.5*(yf)) +','+Math.pow(yf,1/adjPow)*100+'%,'+(1-Math.pow(yf,1/adjPow))*100+'%)';
			//}
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
