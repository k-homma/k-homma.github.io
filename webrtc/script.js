'use strict';

let localStream = null;
let peer = null;
let existingCall = null;

// multi part ///////////
let constraints = {
//    video: {},
    video: true,
    audio: true
};
constraints1.video1.width = {
    min: 320,
    max: 320
};
constraints1.video1.height = {
    min: 240,
    max: 240        
};

///////////////////////////


// navigator.mediaDevices.getUserMedia({video: true, audio: true})
navigator.mediaDevices.getUserMedia(constraints)
    .then(function (stream) {
        // Success
	//	$('#myStream').get(0).srcObject = stream;
        $('#my-video').get(0).srcObject = stream;
        localStream = stream;
    }).catch(function (error) {
	// Error
	console.error('mediaDevice.getUserMedia() error:', error);
	return;
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
    // add (multi) /////////// 
    // Enter the room name to join instead of the peer ID of
    // the connection destination, specify the room name as an argument,
    // and execute the peer.joinRoom method.

    // let roomName = $('#join-room').val();
    // if (!roomName) {
    //     return;
    // }
    
    // mode can be selected from sfu and mesh.
    // const call = peer.joinRoom(roomName, {mode: 'sfu', stream: localStream})

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

    // add (multi) ///
    // When using the Room function,
    // communication starts when you join the Room.
    //    setupEndCallUI();
    //    $('#room-id').text(call.name);

    // When the room function is used,
    // PeerID is stored in the Stream object,
    // so the Call object specified as
    // the first argument of addVideo can be omitted.
    //    call.on('stream', function(stream){
    //       addVideo(stream);
    //    });

    // Since the peer ID of the missing participant can be acquired,
    // the corresponding VIDEO element is deleted using that ID.
    //    call.on('peerLeave', function(peerId){
    //       removeVideo(peerId);
    //    });
    /////////////////

    // When 1:1, the processing that was inside
    // the Stream event is taken out.    
    call.on('stream', function(stream){
        addVideo(call,stream);
        setupEndCallUI();
        $('#their-id').text(call.remoteId);
    });
    
    call.on('close', function(){
	//removeAllRemoteVideos();
	removeVideo(call.remoteId);
        setupMakeCallUI();
    });
}

// function addVideo(stream){
//     const videoDom = $('<video autoplay>');
//     videoDom.attr('id',stream.peerId);
//     videoDom.get(0).srcObject = stream;
//     $('.videosContainer').append(videoDom);
// }

//function removeAllRemoteVideos(){
//    $('.videosContainer').empty();
// }

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

function setupEndCallUI() {
    $('#make-call').hide();
    $('#end-call').show();
}
