<!---
.. ===============LICENSE_START=======================================================
.. Acumos CC-BY-4.0
.. ===================================================================================
.. Copyright (C) 2017-2018 AT&T Intellectual Property & Tech Mahindra. All rights reserved.
.. ===================================================================================
.. This Acumos documentation file is distributed by AT&T and Tech Mahindra
.. under the Creative Commons Attribution 4.0 International License (the "License");
.. you may not use this file except in compliance with the License.
.. You may obtain a copy of the License at
..
.. http://creativecommons.org/licenses/by/4.0
..
.. This file is distributed on an "AS IS" BASIS,
.. WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
.. See the License for the specific language governing permissions and
.. limitations under the License.
.. ===============LICENSE_END=========================================================
-->

# Web Demo
This web page sample allows the user to submit an image to
an image classification and image mood classification service
in serial progression.

** Image Copyrights May Apply ** - the included sample videos may carry
additional copyrights and are not meant for public resale or consumption.

* [images/example_excitement_2.jpg](https://www.pexels.com/photo/red-green-hot-air-balloon-during-daytime-51377/)
* [images/example_awe_1.jpg](https://flic.kr/p/RLzkvAhttps://www.pexels.com/photo/art-beach-beautiful-clouds-269583/)
* [images/example_excitement_1.jpg](https://www.pexels.com/photo/sea-man-person-holiday-6557/)
* [images/example_sad_1.jpg](https://www.pexels.com/photo/burial-cemetery-countryside-cross-116909/)


## Browser Interaction
Most browsers should have no
CORS or other cross-domain objections to dropping the file `image-mood-classes.html`
into the browser and accesing a locally hosted server API, as configured
in [the previous tutorial](lesson2.md).

If you want to run the test locally, you can use the built-in python
webserver with the line below while working in the `web_demo` directory
(assuming you're running python3).
```
python -m http.server 5000
```

Afterwards, just point your browser at `http://localhost:5000/image-mood-classes.html`.


## Example mood classification demo (docker and protobuf)
To customize this demo, one should change either the included javascript
or simply update the primary classification URL on the page itself during runtime.
This demo utilizes the [javascript protobuf library](https://github.com/dcodeIO/ProtoBuf.js/)
to encode parameters into proto binaries in the browser.

** NOTE ** One version of the face model's protobuf schema is included with
this web page, but it may change over time.  If you receive encoding errors
or unexpected results, please verify that your target model and this web page
are using the same `.proto` file.

* confirm that your target docker instance is configured and running
* download this directory to your local machine
    * confirm the host port and classification service URL in the file `image-mood-classes.js`
    * modify the `protoDefault` setting to be 1
```
urlDefault: "http://localhost:8886/classify",
```
* view the page `image-mood-classes.html` in a Crome or Firefox browser
* you can switch between a few sample images or upload your own by clicking on the buttons below the main image window


### Special decoding example
In `protobuf` mode, you can also download a binary, encoded version of the last
image or output that was sent to the remote service.  When available, the <strong>Download Encoded Message</strong>
button will be enabled and a binary file will be generated in the browser.

```
protoc --decode=USdJIcOQiGLiZLfBnxcOzsGXRYeIewQs.ImageTagSet model.tag.proto < protobuf.out.bin
protoc --decode=MkQqqYoJoeivdiNvJPVSnhUlmFzKVten.ImageSet model.image.proto < protobuf.in.bin
```

**NOTE** The specific package name may have changed since the time of writing,
so be sure to check the contents of the current `.proto` file.



## Example mood classification demo
To customize this demo, one should change either the included javascript
or simply update the primary classification URL on the page itself during runtime.

* confirm that your local instance is configured and running
* download this directory to your local machine
  * confirm the host port and classification service URL in the file `image-mood-classes.js`
```
classificationServer: "http://localhost:8886/classify",
```

* view the page `image-mood-classes.html` in a Crome or Firefox browser
* probabilities will be updated on the right side fo the screen
* you can switch between a few sample images or upload your own by clicking on the buttons below the main image window

Example web application with *awe* mood classification

* ![example web application with *awe* mood](example_running.jpg "Example web application classifying tigers video")
