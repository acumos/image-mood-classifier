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
..      http://creativecommons.org/licenses/by/4.0
..
.. This file is distributed on an "AS IS" BASIS,
.. WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
.. See the License for the specific language governing permissions and
.. limitations under the License.
.. ===============LICENSE_END=========================================================

.. _demonstration_image-mood:


======================================================
Demonstrations: Tutorial for Image Mood Classification
======================================================

This web page sample allows the user to submit an image to an image
classification and image mood classification service in serial
progression.

-  `images/example_excitement_2.jpg <https://www.pexels.com/photo/red-green-hot-air-balloon-during-daytime-51377/>`__
-  `images/example_awe_1.jpg <https://www.pexels.com/photo/art-beach-beautiful-clouds-269583/>`__
-  `images/example_excitement_1.jpg <https://www.pexels.com/photo/sea-man-person-holiday-6557/>`__
-  `images/example_sad_1.jpg <https://www.pexels.com/photo/burial-cemetery-countryside-cross-116909/>`__


Browser Interaction
===================
Most browsers should have no
CORS or other cross-domain objections to dropping the file ``image-mood-classes.html``
into the browser and accesing a locally hosted server API, as configured
in :ref:`deployment_image-mood`.



Open-source hosted run
----------------------
Utilizing the generous `htmlpreview function <https://htmlpreview.github.io/>`_ available on
GitHub, you can also experiment with the respository-based web resource.  This resource
will proxy the repository ``web_demo`` directory into a live resource.

Navigate to the
`default webhost page <http://htmlpreview.github.io/?https://github.com/acumos/image-mood-classifier/blob/master/web_demo/image-mood-classes.html>`_
and confirm that the resource load properly.  The image at the bottom of this guide
is a good reference for correct page loading and display.

After confirming correct page load, simply replace the value in the ``Transform URL``
field to point at your deployed instance.  For example, if you've created a
dumped model locally, it might be a localhost port.


Local webserver run
-------------------

If you want to run the test locally, you can use a supplied python
webserver with the line below while working in the ``web_demo``
directory (assuming you're running python3).

::

    python simple-cors-http-server-python3.py 5000

Afterwards, just point your browser at
``http://localhost:5000/image-mood-classes.html``.

	
	
Usage of protobuf binaries for testing
--------------------------------------
	
Binary (protobuf encoded) data can be downloaded from the web page or directly with curl.
Two demonstration binaries have been included in the source repository for testing, as
captured from the :ref:`demonstration-image_classification_running_example` (awe) image below.

- ``protobuf.Image.bin`` - a protobuf-encoded image of the beach (awe) image
- ``protobuf.classifier.ImageTagSet.bin`` - a protobuf-encoded classification tag set for the beach (awe) image
- ``protobuf.mood.ImageTagSet.bin`` - a protobuf-encoded mood classifier tag set for the beach (awe) image


Within the webpage demo, simply select the correct protobuf method and then drag and
drop the binary file into the ``Protobuf Payload Input`` file uploader.  It will be
immediately uploaded through javascript to your specified ``Transform Url``.
	


Example image mood classification demo (docker and protobuf)
============================================================

To customize this demo, one should change either the included javascript
or simply update the primary classification URL on the page itself
during runtime. This demo utilizes the
`javascript protobuf library <https://github.com/dcodeIO/ProtoBuf.js/>`__ to encode
parameters into proto binaries in the browser.

**NOTE** One version of the model's protobuf schema is
included with this web page, but it may change over time. If you receive
encoding errors or unexpected results, please verify that your target
model and this web page are using the same ``.proto`` file.

-  confirm that your target docker instance is configured and running
-  download this directory to your local machine

   -  confirm the host port and classification service URL in the file
      ``image-mood-classes.js``

   .. code:: bash

          urlDefault: "http://localhost:8887/classify",

-  view the page ``image-mood-classes.html`` in a Crome or Firefox browser
-  you can switch between a few sample images or upload your own by
   clicking on the buttons below the main image window

Special decoding example
------------------------

You can also download a binary, encoded version of
the last image or output that was sent to the remote service. When
available, the Download Encoded Message button will be enabled and a
binary file will be generated in the browser.

.. code:: bash

    protoc --decode=QauAppBBvRcQrVeMxDhdHKrQXsYfYbpD.ImageTagSet model.tag.proto < protobuf.out.bin
    protoc --decode=ZmazgwcYOzRPSlAKlNLcoITKjByZchTo.ImageSet model.image.proto < protobuf.in.bin

**NOTE** The specific package name may have changed since the time of
writing, so be sure to check the contents of the current ``.proto``
file.

Example mood classification demo
--------------------------------

To customize this demo, one should change either the included javascript
or simply update the primary classification URL on the page itself
during runtime.

-  confirm that your local instance is configured and running
-  download this directory to your local machine
-  confirm the host port and classification service URL in the file
   ``image-mood-classes.js``

   ::

       classificationServer: "http://localhost:8887/classify",

-  view the page ``image-mood-classes.html`` in a Crome or Firefox
   browser
-  probabilities will be updated on the right side fo the screen
-  you can switch between a few sample images or upload your own by
   clicking on the buttons below the main image window

Example web application with *awe* mood classification

.. _demonstration-image_classification_running_example:

.. image:: example_running.jpg
    :alt: example web application with *awe* mood
    :width: 200


