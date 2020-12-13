$(function () {
	// check for support (webkit only)
	if (!('webkitSpeechRecognition' in window))
		return;

	var input = document.getElementById('input');
	var record = document.getElementById('record');

	// setup recognition
	const talkMsg = 'Speak now';
	// seconds to wait for more input after last
	const patience = 5;
	var prefix = '';
	var isSentence;
	var recognizing = false;
	var timeout;
	var oldPlaceholder = null;
	var recognition = new webkitSpeechRecognition();
	recognition.continuous = true;
	recognition.interimResults = true;

	function restartTimer() {
		timeout = setTimeout(function () {
			recognition.stop();
		}, patience * 1000);
	}

	recognition.onstart = function () {
		oldPlaceholder = input.placeholder;
		input.placeholder = talkMsg;
		recognizing = true;
		restartTimer();
	};

	recognition.onend = function () {
		recognizing = false;
		clearTimeout(timeout);
		if (oldPlaceholder !== null)
			input.placeholder = oldPlaceholder;
	};

	recognition.onresult = function (event) {
		clearTimeout(timeout);

		// get SpeechRecognitionResultList object
		var resultList = event.results;

		// go through each SpeechRecognitionResult object in the list
		var finalTranscript = '';
		var interimTranscript = '';
		for (var i = event.resultIndex; i < resultList.length; ++i) {
			var result = resultList[i];
			// get this result's first SpeechRecognitionAlternative object
			var firstAlternative = result[0];
			if (result.isFinal) {
				finalTranscript = firstAlternative.transcript;
			} else {
				interimTranscript += firstAlternative.transcript;
			}
		}
		// capitalize transcript if start of new sentence
		var transcript = finalTranscript || interimTranscript;
		transcript = !prefix || isSentence ? capitalize(transcript) : transcript;

		// append transcript to cached input value
		input.value = prefix + transcript;

		restartTimer();
	};

	record.addEventListener('click', function (event) {
		event.preventDefault();

		// stop and exit if already going
		if (recognizing) {
			recognition.stop();
			return;
		}

		// Cache current input value which the new transcript will be appended to
		var endsWithWhitespace = input.value.slice(-1).match(/\s/);
		prefix = !input.value || endsWithWhitespace ? input.value : input.value + ' ';

		// check if value ends with a sentence
		isSentence = prefix.trim().slice(-1).match(/[\.\?\!]/);

		// restart recognition
		recognition.start();
	}, false);
	
	
	function callChatbotApi(message) {
  	  // params, body, additionalParams
    		return sdk.searchGet({q:message}, {}, {});
 	 }

	queryImage.addEventListener('click', function (event) {
		

		function showimage(list){
		if(list.length == 0){
			var mypos = document.getElementById('imgHolder');
			mypos.innerHTML = 'Sorry, there is no result for your request.'
			return;
		}
		var mypos = document.getElementById('imgHolder');
		mypos.innerHTML = ' ';
		var idx = 0;
		for(idx=0;idx<list.length;idx++){
			var myImg = document.createElement("img");
			myImg.src = "https://yz3831-hw3-b2.s3.amazonaws.com/"+list[idx];
			myImg.width = "320";
			var mypos = document.getElementById('imgHolder');
			mypos.appendChild(myImg);
		}
		}


		if(!input.value){
			var mypos = document.getElementById('imgHolder');
			mypos.innerHTML = 'Please input a query.';
			return;
		}
		
		var list = -1;
		event.preventDefault();
		var msg = input.value;
		callChatbotApi(msg)
      			.then((response) => {
        			console.log(response);
        			var data = response.data;
				if (data.messages && data.messages.length > 0) {
         				console.log('received ' + data.messages.length + ' messages');
					
				}
				list = data.list;
				showimage(list);

			})
      			.catch((error) => {
        			console.log('an error occurred', error);
      			});
		
	},false);
	
	document.getElementById('inputFile').addEventListener('change', function (event) {
		//event.preventDefault();

AWS.config.region = 'us-east-1'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:6e049b90-c270-422e-bb74-88810a96ceb2',
});
var albumBucketName = 'yz3831-hw3-b2';
var s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  params: {Bucket: albumBucketName}
});	

		var files = document.getElementById('inputFile').files;
		if(!files.length){
			return alert("Please choose a file to upload first.");
		}
		file = files[0];
		fileName = file.name;
		var upload = new AWS.S3.ManagedUpload({
			params:{
			Bucket: "yz3831-hw3-b2",
			Key:fileName,
			Body:file,
			ACL:"public-read"
			}
		});
		var promise = upload.promise();
		promise.then(
			function(data){
				alert("Successfully uploaded.");
			},
			function(err){
				 return alert("There was an error uploading your photo: ", err.message);
			});
		
	}, false);
});

function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}