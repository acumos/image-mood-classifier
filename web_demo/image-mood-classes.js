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
function doPostImage(srcCanvas, dstDiv) {
	var serviceURL = "";
	var dataURL = srcCanvas.toDataURL('image/jpeg', 0.9);
	var blob = dataURItoBlob(dataURL);
	var hd = $(document.body).data('hdparams');
	var fd = new FormData();

    serviceURL = hd.classificationServer;
    fd.append("image_binary", blob);
    fd.append("mime_type", "image/jpeg");
    $(dstDiv).empty().append($("<div class='header'>Image Mood</div>"))
                     .append($("<div>&nbsp;</div>").addClass('spinner'));

	var request = new XMLHttpRequest();
	hd.imageIsWaiting = true;
	request.onreadystatechange=function() {
		if (request.readyState==4 && request.status==200) {
			genClassTable($.parseJSON(request.responseText), dstDiv);
			hd.imageIsWaiting = false;
		}
	}
	request.open("POST", serviceURL, true);
	request.send(fd);
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
                var fade = v.score+0.25;
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
                var fade = (v.score > 1.0) ? 1 : v.score;	// fade out low confidence classes
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
function dataURItoBlob(dataURI) {
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

    return new Blob([ia], {type:mimeString});
}

