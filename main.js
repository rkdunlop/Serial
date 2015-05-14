var connectionId = -1;

window.onload = function() {
  document.querySelector('#greeting').innerText =
    'Hello, World! It is ' + new Date();
    chrome.serial.getDevices(function(ports){
    onGetDevices(ports);
    buildPortPicker(ports);
    buildResetButton();
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
  
    var str = convertArrayBufferToString(info.data);
    if (str.charAt(str.length-1) === '\n') {
      stringReceived += str.substring(0, str.length-1);
      displaySecs(parseFloat(stringReceived));
      stringReceived = '';
    }else {
      stringReceived += str;
    }
    
}


function displaySecs(number) {
  number = number/1000;
  document.getElementById('secs').innerText = number;
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
    console.log(reset);
    displaySecs(0);
    chrome.serial.disconnect(connectionId,openSelectedPort);
  };
  
  
}



function openSelectedPort() {
  var portPicker = document.getElementById('port-picker');
  var selectedPort = portPicker.options[portPicker.selectedIndex].value;
  chrome.serial.connect(selectedPort,{bitrate:9600}, onOpen);
}