var connectionId = -1;
var str='';
window.onload = function() {
  document.querySelector('#greeting').innerText =
    'Timer';
    chrome.serial.getDevices(function(ports){
    onGetDevices(ports);
    buildPortPicker(ports);
    buildResetButton();
    buildConnectButton();
    document.getElementById('secs').innerText = '0000';
    });

};

var onGetDevices = function(ports) {
  for (var i=0; i<ports.length; i++) {
    console.log(ports[i].path);
  }
};
var stringReceived = '';
function onRead(readInfo){
    //var uint8View = new Uint8Array(readInfo.data);
    var str = String.fromCharCode.apply(null, new Uint8Array(readInfo.data));
    //var str = convertArrayBufferToString(readInfo.data);
    if (str.charAt(str.length-1) === '\n') {
      stringReceived += str.substring(0, str.length-1);
      console.log(parseFloat(stringReceived));
      //displaySecs(stringReceived);
      //displaySecs(parseFloat(stringReceived));
      stringReceived = ' ';
    }else {
      stringReceived += str;
    }
    
}


function displaySecs(number) {
  number = parseFloat(number);
  number = number/1000;
  
  document.getElementById('secs').innerText = number;
}
var onError = function(errorInfo)  {
  console.log(errorInfo.data);
};

function onOpen(openInfo) {
  connectionId = openInfo.connectionId;
  console.log("connectionId: " + connectionId);
  console.log("bitrate: " +openInfo.bitrate);
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
    portPicker.onload = function() {
    if (connectionId!= -1) {
      chrome.serial.disconnect(connectionId,openSelectedPort);
      return;
    }
    openSelectedPort();
  };
}

function buildResetButton() {
  var resetButton = document.getElementById('reset');
  
  resetButton.onclick = function() {
    console.log('reset');
    document.getElementById('secs').innerText = '0000';
    console.log(connectionId);
    stringReceived = ' ';
    str ='';
    chrome.serial.flush(connectionId,onFlush);
    chrome.serial.disconnect(connectionId,onDisconnect);
    openSelectedPort();
  };
var onDisconnect = function(result) {
  if (result) {
    console.log("Disconnected from the serial port");
  } else {
    console.log("Disconnect failed");
  }
};
  
  
}
function onFlush(flush) {
  return flush;
}
function buildConnectButton() {
  var connectButton = document.getElementById('connect');
  
  connectButton.onclick = function() {
    console.log('connect');
    var portPicker = document.getElementById('port-picker');
  var selectedPort = portPicker.options[portPicker.selectedIndex].value;
  chrome.serial.connect(selectedPort,{bitrate:9600}, onOpen);
  };
}


function openSelectedPort() {
  var portPicker = document.getElementById('port-picker');
  var selectedPort = portPicker.options[portPicker.selectedIndex].value;
  chrome.serial.connect(selectedPort,{bitrate:9600}, onOpen);
}