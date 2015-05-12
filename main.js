var connectionId = -1;

window.onload = function() {
  document.querySelector('#greeting').innerText =
    'Hello, World! It is ' + new Date();
    chrome.serial.getDevices(function(ports){
    onGetDevices(ports);
    buildPortPicker(ports);
    });

};

var onGetDevices = function(ports) {
  for (var i=0; i<ports.length; i++) {
    console.log(ports[i].path);
  }
};
var lock = false;
var arrayReceived=[]; //array of Uint8Arrays
function onRead(readInfo){
  
    // only append the newly available data to arrayReceived.
    arrayReceived = arrayReceived.concat(new Uint8Array(readInfo.data));
    //console.log(arrayReceived);
    process();//operates on the global arrayReceived array.
}
var readBuffer = ''; 
var number = '';
// made global because in one invocation a portion of a command could be sent.
// we want to the buffer to include incomplete commands from previous invocations of process() too.
// e.g. in one iteration process could only get 1a2c0a1
// and the next iteration could be a3c0a, so we want the one from the last invocation to paired up
// with a from the next invocation.
function process(){
    // synchronous function
    if(lock === false){
        lock = true;
        var command = '';
        for(var index=0; index < arrayReceived.length; index++){
            // iterate over all the Uint8Arrays. global variable arrayReceived.
            var uint8View = arrayReceived.shift();
            for(var innerIndex=0; innerIndex < uint8View.length; innerIndex++){
                var data = String.fromCharCode(uint8View[innerIndex]);
                // data is always a single character. for 11 data is first 1 and then
                // in the next iteration another 1 is sent.
                
               
                if(data === '\n'){
                    readBuffer = '';
                    data = '';
                    number++ ;
                    console.log(number);
                }
                readBuffer += data;
                
            }
        }
        lock = false;
    }
}
var onError = function(errorInfo)  {
  console.log(errorInfo.data);
};

function onOpen(openInfo) {
  connectionId = openInfo.connectionId;
  console.log("connectionId: " + connectionId);
  if (connectionId == -1) {
    setStatus('Could not open');
    return;
  }
  setStatus('Connected');

  chrome.serial.onReceive.addListener(onRead);
}

function setStatus(status) {
  document.getElementById('status').innerText = status;
}


function buildPortPicker(ports) {
  console.log(ports);
  var portPicker = document.getElementById('port-picker');
  ports.forEach(function(port) {
    var portOption = document.createElement('option');
    
    portOption.name = portOption.innerText = port.path;
    portOption.value = portOption.innerText = port.path;
    portPicker.appendChild(portOption);
    console.log(portOption);
  });


  portPicker.onchange = function() {
    if (connectionId != -1) {
      chrome.serial.disconnect(connectionId, openSelectedPort);
      return;
    }
    openSelectedPort();
  };
}

function openSelectedPort() {
  var portPicker = document.getElementById('port-picker');
  var selectedPort = portPicker.options[portPicker.selectedIndex].value;
  chrome.serial.connect(selectedPort,{bitrate:9600}, onOpen);
}