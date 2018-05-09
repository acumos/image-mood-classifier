/*
  ===============LICENSE_START=======================================================
  Acumos Apache-2.0
  ===================================================================================
  Copyright (C) 2017-2018 AT&T Intellectual Property & Tech Mahindra. All rights reserved.
  ===================================================================================
  This Acumos software file is distributed by AT&T and Tech Mahindra
  under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
 
  http://www.apache.org/licenses/LICENSE-2.0
 
  This file is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
  ===============LICENSE_END=========================================================
*/

/**
 image-classes.js - send frames to an image classification service

 Videos or camera are displayed locally and frames are periodically sent to GPU image-net classifier service (developed by Zhu Liu) via http post.
 For webRTC, See: https://gist.github.com/greenido/6238800

 D. Gibbon 6/3/15
 D. Gibbon 4/19/17 updated to new getUserMedia api, https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
 D. Gibbon 8/1/17 adapted for Cognita
 E. Zavesky 05/05/18 adapted for row-based image and other results
 */

"use strict";

/**
 * main entry point
 */
$(document).ready(function() {
    var urlDefault = getUrlParameter('url-image');
    if (!urlDefault)
        urlDefault = "http://localhost:8886/classify";

	$(document.body).data('hdparams', {	// store global vars in the body element
		classificationServer: urlDefault,
		frameCounter: 0,
		protoObj: null,   // to be back-filled after protobuf load {'root':obj, 'methods':{'xx':{'typeIn':x, 'typeOut':y}} }
		protoPayloadInput: null,   //payload for encoded message download (if desired)
		protoPayloadOutput: null,   //payload for encoded message download (if desired)
		// Objects from DOM elements
		srcImgCanvas: document.getElementById('srcImgCanvas'),	// we have a 'src' source image
	});
    $(document.body).data('hdparams')['canvasMaxH'] = $(document.body).data('hdparams')['srcImgCanvas'].height;
    $(document.body).data('hdparams')['canvasMaxW'] = $(document.body).data('hdparams')['srcImgCanvas'].width;

	//add text input tweak
	$("#serverUrl").change(function() {
	    $(document.body).data('hdparams')['classificationServer'] = $(this).val();
        updateLink("serverLink");
	}).val($(document.body).data('hdparams')['classificationServer'])
	//set launch link at first
    updateLink("serverLink");

    $("#protoInput").prop("disabled",true).click(downloadBlobIn);
    $("#protoOutput").prop("disabled",true).click(downloadBlobOut);

    //if protobuf is enabled, fire load event for it as well
    $(document.body).data('hdparams').protoObj = {};  //clear from last load
    protobuf_load("model.image.proto", true);
    protobuf_load("model.tag.proto", false);

	// add buttons to change video
	$("#sourceRibbon div").click(function() {
	    var $this = $(this);
	    $this.siblings().removeClass('selected'); //clear other selection
	    $this.addClass('selected');
	    var objImg = $this.children('img')[0];
	    if (objImg) {
	        switchImage(objImg.src);
	    }
	});

	//allow user-uploaded images
    var imageLoader = document.getElementById('imageLoader');
    imageLoader.addEventListener('change', handleImage, false);

    //trigger first click
    $("#sourceRibbon div")[0].click();
});

function protobuf_load(pathProto, forceSelect) {
    protobuf.load(pathProto, function(err, root) {
        if (err) {
            console.log("[protobuf]: Error!: "+err);
            throw err;
        }
        var domSelect = $("#protoMethod");
        var numMethods = domSelect.children().length;
        $.each(root.nested, function(namePackage, objPackage) {    // walk all
            if ('Model' in objPackage && 'methods' in objPackage.Model) {    // walk to model and functions...
                var typeSummary = {'root':root, 'methods':{} };
                $.each(objPackage.Model.methods, function(nameMethod, objMethod) {  // walk methods
                    typeSummary['methods'][nameMethod] = {};
                    typeSummary['methods'][nameMethod]['typeIn'] = namePackage+'.'+objMethod.requestType;
                    typeSummary['methods'][nameMethod]['typeOut'] = namePackage+'.'+objMethod.responseType;
                    typeSummary['methods'][nameMethod]['service'] = namePackage+'.'+nameMethod;

                    //create HTML object as well
                    var namePretty = namePackage+"."+nameMethod;
                    var domOpt = $("<option />").attr("value", namePretty).text(
                        nameMethod+ " (input: "+objMethod.requestType
                        +", output: "+objMethod.responseType+")");
                    if (numMethods==0) {    // first method discovery
                        domSelect.append($("<option />").attr("value","").text("(disabled, not loaded)")); //add 'disabled'
                    }
                    if (forceSelect) {
                        domOpt.attr("selected", 1);
                    }
                    domSelect.append(domOpt);
                    numMethods++;
                });
                $(document.body).data('hdparams').protoObj[namePackage] = typeSummary;   //save new method set
                $("#protoContainer").show();
            }
        });
        console.log("[protobuf]: Load successful, found "+numMethods+" model methods.");
    });
}


function updateLink(domId) {
    var sPageURL = decodeURIComponent(window.location.search.split('?')[0]);
    var newServer = $(document.body).data('hdparams')['classificationServer'];
    var sNewUrl = sPageURL+"?url-image="+newServer;
    $("#"+domId).attr('href', sNewUrl);
}

function switchImage(imgSrc) {
    var canvas = $(document.body).data('hdparams')['srcImgCanvas'];
    var img = new Image();
    img.onload = function () {
        var ctx = canvas.getContext('2d');

        var canvasCopy = document.createElement("canvas");
        var copyContext = canvasCopy.getContext("2d");

        //call handy thumbnailer code
        //new thumbnailer(canvas, imgObj, 188, 3); //this produces lanczos3 (lanczos8 is lowest quality)

        var ratio = 1;

        //console.log( $(document.body).data('hdparams'));
        //console.log( [ img.width, img.height]);
        // https://stackoverflow.com/a/2412606
        if(img.width > $(document.body).data('hdparams')['canvasMaxW'])
            ratio = $(document.body).data('hdparams')['canvasMaxW'] / img.width;
        if(ratio*img.height > $(document.body).data('hdparams')['canvasMaxH'])
            ratio = $(document.body).data('hdparams')['canvasMaxH'] / img.height;

        canvasCopy.width = img.width;
        canvasCopy.height = img.height;
        copyContext.drawImage(img, 0, 0);

        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        ctx.drawImage(canvasCopy, 0, 0, canvasCopy.width, canvasCopy.height, 0, 0, canvas.width, canvas.height);
        //document.removeChild(canvasCopy);
        doPostImage(canvas, '#resultsDiv');
    }
    img.src = imgSrc;  //copy source, let image load
}


//load image that has been uploaded into a vancas
function handleImage(e){
    var reader = new FileReader();
    reader.onload = function(event){
        switchImage(event.target.result);
    }
    reader.readAsDataURL(e.target.files[0]);
}



// https://stackoverflow.com/questions/19491336/get-url-parameter-jquery-or-how-to-get-query-string-values-in-js
function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};



/**
 * post an image from the canvas to the service
 */
function doPostImage(srcCanvas, dstDiv,) {
    var dataURL = srcCanvas.toDataURL('image/jpeg', 1.0);
    var hd = $(document.body).data('hdparams');
    var sendPayload = null;

    var nameProtoMethod = $("#protoMethod option:selected").attr('value');
    var methodKeys = null;
    if (nameProtoMethod && nameProtoMethod.length) {     //valid protobuf type?
        var partsURL = hd.classificationServer.split("/");
        methodKeys = nameProtoMethod.split(".", 2);       //modified for multiple detect/pixelate models
        partsURL[partsURL.length-1] = methodKeys[1];
        hd.classificationServer = partsURL.join("/");   //rejoin with new endpoint
        updateLink("serverLink", hd.classificationServer);
    }

    var serviceURL = hd.classificationServer;
    var request = new XMLHttpRequest();     // create request to manipulate

    request.open("POST", serviceURL, true);
    hd.imageIsWaiting = true;

    var domResult = $(dstDiv);
    domResult.append($("<div>&nbsp;</div>").addClass('spinner'));

    //console.log("[doPostImage]: Selected method ... '"+typeInput+"'");
    if (nameProtoMethod && nameProtoMethod.length) {     //valid protobuf type?
        var blob = dataURItoBlob(dataURL, true);

        // fields from .proto file at time of writing...
        // message ImageSet {
        //   repeated Image Images = 1;
        // }
        //
        // message Image {
        //   string mime_type = 1;
        //   bytes image_binary = 2;
        // }

        //TODO: should we always assume this is input? answer: for now, YES, always image input!
        var inputPayload = {'Images':[{ "mimeType": blob.type, "imageBinary": blob.bytes }]};

        // ---- method for processing from a type ----
        var msgInput = hd.protoObj[methodKeys[0]]['root'].lookupType(hd.protoObj[methodKeys[0]]['methods'][methodKeys[1]]['typeIn']);
        // Verify the payload if necessary (i.e. when possibly incomplete or invalid)
        var errMsg = msgInput.verify(inputPayload);
        if (errMsg) {
            var strErr = "[doPostImage]: Error during type verify for object input into protobuf method. ("+errMsg+")";
            domResult.empty().html(strErr);
            console.log(strErr);
            throw Error(strErr);
        }
        // Create a new message
        var msgTransmit = msgInput.create(inputPayload);
        // Encode a message to an Uint8Array (browser) or Buffer (node)
        sendPayload = msgInput.encode(msgTransmit).finish();

        //downloadBlob(sendPayload, 'protobuf.bin', 'application/octet-stream');
        // NOTE: TO TEST THIS BINARY BLOB, use some command-line magic like this...
        //  protoc --decode=mMJuVapnmIbrHlZGKyuuPDXsrkzpGqcr.FaceImage model.proto < protobuf.bin
        $("#protoInput").prop("disabled",false);
        hd.protoPayloadInput = sendPayload;

        //request.setRequestHeader("Content-type", "application/octet-stream;charset=UTF-8");
        request.setRequestHeader("Content-type", "text/plain;charset=UTF-8");
        request.responseType = 'arraybuffer';
    }
    else {
        var blob = dataURItoBlob(dataURL, false);
        sendPayload = new FormData();
        if (true) { // hd.serverIsLocal) {
            serviceURL = hd.classificationServer;
            sendPayload.append("image_binary", blob);
            sendPayload.append("mime_type", blob.type);
        }
        else {      //disabled now for direct URL specification
            serviceURL = hd.classificationServerFirewall;
            sendPayload.append("myFile", blob);
            sendPayload.append("rtnformat", "json");
            sendPayload.append("myList", "5");	// limit the number of classes (max 1000)
        }
    }

    //$(dstImg).addClaas('workingImage').siblings('.spinner').remove().after($("<span class='spinner'>&nbsp;</span>"));

    request.onreadystatechange=function() {
        if (request.readyState==4 && request.status>=200 && request.status<300) {
            if (methodKeys!=null) {     //valid protobuf type?
                var bodyEncodedInString = new Uint8Array(request.response);
                $("#protoOutput").prop("disabled",false);
                hd.protoPayloadOutput = bodyEncodedInString;

                // ---- method for processing from a type ----
                var msgOutput = hd.protoObj[methodKeys[0]]['root'].lookupType(hd.protoObj[methodKeys[0]]['methods'][methodKeys[1]]['typeOut']);
                var objOutput = null;
                try {
                    objOutput = msgOutput.decode(hd.protoPayloadOutput);
                }
                catch(err) {
                    var errStr = "Error: Failed to parse protobuf response, was the right method chosen? (err: "+err.message+")";
                    console.log(errStr);
                    domResult.html(errStr);
                    hd.imageIsWaiting = false;
                    return false;
                }

                //try to crawl the fields in the protobuf....
                var numFields = 0;
                var nameRepeated;
                $.each(msgOutput.fields, function(name, val) {           //collect field names
                    if (val.repeated) {     //indicates it's a repeated field (likely an array)
                        nameRepeated = name;      //save this as last repeated field (ideally there is just one)
                    }
                    numFields += 1;
                });
                if (numFields > 1) {
                    var errStr = "Error: Expected array/repeated structure in response, but got non-flat array result ("+numFields+" fields)";
                    console.log(errStr);
                    domResult.html(errStr);
                    hd.imageIsWaiting = false;
                    return false;
                }
                var objRecv = objOutput[nameRepeated];

                //grab the nested array type and print out the fields of interest
                //var typeNested = methodKeys[0]+"."+msgOutput.fields[nameRepeated].type;
                //var msgOutputNested = hd.protoObj[methodKeys[0]]['root'].lookupType(typeNested);
                genClassTable(objRecv, dstDiv);
            }
            else {
                var objRecv = $.parseJSON(request.responseText);
                genClassTable(objRecv, dstDiv);
            }
            hd.imageIsWaiting = false;
        }
	}
	request.send(sendPayload);
}

/**
 * create markup for a list of classifications
 */
function genClassTable (data, div) {
	var count = 0;
	var limit = 100;
	var minScore = 0.1; // don't display any scores less than this
	$(div).empty();
	var classTable = $('<table />').append($('<tr />')
				.append($('<th />').append('Mood'))
				.append($('<th />').append('Score'))
				);

    if ('results' in data) {
        $.each(data.results.tags, function(k, v) {
            if (count < limit && v.score >= minScore) {
                var fade = v.score+0.45;
                fade = (fade > 1.0) ? 1 : fade;	// fade out low confidence classes
                classTable.append($('<tr />').css('opacity', fade)
                    .append($('<td />').append(v.tag))
                    .append($('<td />').append(parseFloat(v.score).toFixed(2)))
                    );
                count++;
            }
        });
    }
    else {  //expecting flat data
        $.each(data, function(i,v) {
            if (count < limit && v.score >= minScore) {
                var fade = (v.score > 1.0) ? 1 : 0.45+v.score;	// fade out low confidence classes
                classTable.append($('<tr />').css('opacity', fade)
                    .append($('<td />').append(v.tag))
                    .append($('<td />').append(parseFloat(v.score).toFixed(2)))
                    );
                count++;
            }
        });
    }

	$(div).append(classTable);
}


/**
 * convert base64/URLEncoded data component to raw binary data held in a string
 *
 * Stoive, http://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata
 */
function dataURItoBlob(dataURI, wantBytes) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    //added for returning bytes directly
    if (wantBytes) {
        return {'bytes':ia, 'type':mimeString};
    }
    return new Blob([ia], {type:mimeString});
}


function Uint8ToString(u8a){
  var CHUNK_SZ = 0x8000;
  var c = [];
  for (var i=0; i < u8a.length; i+=CHUNK_SZ) {
    c.push(String.fromCharCode.apply(null, u8a.subarray(i, i+CHUNK_SZ)));
  }
  return c.join("");
}


// ----- diagnostic tool to download binary blobs ----
function downloadBlobOut() {
    return downloadBlob($(document.body).data('hdparams').protoPayloadOutput, "protobuf.out.bin");
}

function downloadBlobIn() {
    return downloadBlob($(document.body).data('hdparams').protoPayloadInput, "protobuf.in.bin");
}

//  https://stackoverflow.com/a/33622881
function downloadBlob(data, fileName, mimeType) {
  //if there is no data, filename, or mime provided, make our own
  if (!data)
      data = $(document.body).data('hdparams').protoPayloadInput;
  if (!fileName)
      fileName = "protobuf.bin";
  if (!mimeType)
      mimeType = "application/octet-stream";

  var blob, url;
  blob = new Blob([data], {
    type: mimeType
  });
  url = window.URL.createObjectURL(blob);
  downloadURL(url, fileName, mimeType);
  setTimeout(function() {
    return window.URL.revokeObjectURL(url);
  }, 1000);
};

function downloadURL(data, fileName) {
  var a;
  a = document.createElement('a');
  a.href = data;
  a.download = fileName;
  document.body.appendChild(a);
  a.style = 'display: none';
  a.click();
  a.remove();
};

