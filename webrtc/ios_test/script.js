'use strict';

let localStream = null;
let peer = null;
let existingCall = null;

// var peer: SKWPeer? //Peerオブジェクト
// var remoteStream: SKWMediaStream? //相手のMediaStreamオブジェクト
// var localStream: SKWMediaStream? //自分自身のMediaStreamオブジェクト
// var mediaConnection: SKWMediaConnection? //MediaConnectionオブジェクト


// let option: SKWPeerOption = SKWPeerOption.init()

const videoElement = document.querySelector('video');
const audioInputSelect = document.querySelector('select#audioSource');
const audioOutputSelect = document.querySelector('select#audioOutput');
const videoSelect = document.querySelector('select#videoSource');
const selectors = [audioInputSelect, audioOutputSelect, videoSelect];

audioOutputSelect.disabled = !('sinkId' in HTMLMediaElement.prototype);


navigator.mediaDevices.getUserMedia({video: true, audio: true})
    .then(function (stream) {
        // Success
        $('#my-video').get(0).srcObject = stream;
        localStream = stream;
	$("#result_use").html( cameraData[cnt].id );
	
	//カメラをvideoに結びつける
        video.src = window.URL.createObjectURL(stream);
	
	//カメラ切り替えボタン
	$("#changeButton").bind("click",function(){
            setCamera();
	});
	
    }).catch(function (error) {
	// Error
	console.error('mediaDevice.getUserMedia() error:', error);
	return;
    });
});

peer = new Peer({
    key: '36d58092-aaa0-466d-8fa6-1ae3fbd0e57e',
    debug: 3
});

peer.on('open', function(){
    $('#my-id').text(peer.id);
});

peer.on('error', function(err){
    alert(err.message);
});

peer.on('close', function(){
});

peer.on('disconnected', function(){
});



$('#make-call').submit(function(e){
    e.preventDefault();
    const call = peer.call($('#callto-id').val(), localStream);
    setupCallEventHandlers(call);
});

$('#end-call').click(function(){
    existingCall.close();
});

peer.on('call', function(call){
    call.answer(localStream);
    setupCallEventHandlers(call);
});




function setupCallEventHandlers(call){
    if (existingCall) {
        existingCall.close();
    };

    existingCall = call;

    call.on('stream', function(stream){
        addVideo(call,stream);
        setupEndCallUI();
        $('#their-id').text(call.remoteId);
    });
    call.on('close', function(){
        removeVideo(call.remoteId);
        setupMakeCallUI();
    });
}



function addVideo(call,stream){
    $('#their-video').get(0).srcObject = stream;
}

function removeVideo(peerId){
    $('#'+peerId).remove();
}

function setupMakeCallUI(){
    $('#make-call').show();
    $('#end-call').hide();
}


function start() {
  if (window.stream) {
    window.stream.getTracks().forEach(track => {
      track.stop();
    });
  }
  const audioSource = audioInputSelect.value;
  const videoSource = videoSelect.value;
  const constraints = {
    audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
    video: {deviceId: videoSource ? {exact: videoSource} : undefined}
  };
  navigator.mediaDevices.getUserMedia(constraints).then(gotStream).then(gotDevices).catch(handleError);
}

audioInputSelect.onchange = start;
audioOutputSelect.onchange = changeAudioDestination;

videoSelect.onchange = start;


function setupEndCallUI() {
    $('#make-call').hide();
    $('#end-call').show();
}


start();
