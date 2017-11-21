# -*- coding: utf-8 -*-
# ================================================================================
# ACUMOS
# ================================================================================
# Copyright © 2017 AT&T Intellectual Property & Tech Mahindra. All rights reserved.
# ================================================================================
# This Acumos software file is distributed by AT&T and Tech Mahindra
# under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# This file is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# ================================================================================

import connexion
import logging

import argparse
import json
import time

from flask import current_app, make_response
import pandas as pd
import numpy as np

from acumos.wrapped import load_model

import sys
if sys.version_info[0] < 3:
    from StringIO import StringIO
else:
    from io import StringIO


def generate_output(pred, rich_output, time_ellapse):
    if rich_output:
        # NOTE: This response is specially formatted for the webdemo included with this package.
        #       Alternate forms of a response are viable for any other desired application.
        retObj = {
            'classes': [],
            'clientfile': 'undefined',
            'info': 'Processed',
            'processingtime': time_ellapse,
            'serverfilename': '/dev/null',
            'status': 'Succeeded'
        }

        # iterate through predictions
        pred['rank'] = list(pred.index)
        pred['rank'] = pred['rank'] + 1
        retObj['tags'] = pred.to_dict(orient='records')

        # dump to pretty JSON
        retStr = json.dumps({'results': retObj}, indent=4)
    else:
        retStr = json.dumps(pred.to_dict(orient='records'), indent=4)

    # formulate response
    resp = make_response((retStr, 200, {}))
    # allow 'localhost' from 'file' or other;
    # NOTE: DO NOT USE IN PRODUCTION!!!
    resp.headers['Access-Control-Allow-Origin'] = '*'
    print(type(pred))
    print(retStr[:min(200, len(retStr))])
    # print(pred)
    return resp


def classify_tags(tag_scores, rich_output=False):
    app = current_app
    time_start = time.clock()
    str_predictions = tag_scores.stream.read().decode()

    # first pass is attempting to parse CSV
    try:
        objJson = json.loads(str_predictions)
        X = pd.DataFrame(objJson)
    except ValueError as e:
        class_predictions = StringIO(str_predictions)
        X = pd.read_csv(class_predictions)

    type_in = app.model_mood.classify._input_type
    classify_in = type_in(*tuple(col for col in X.values.T))
    pred_wrap = app.model_mood.classify.from_wrapped(classify_in).as_wrapped()
    pred = pd.DataFrame(np.column_stack(pred_wrap), columns=pred_wrap._fields)

    # for now, peel off single sample
    time_stop = time.clock()
    return generate_output(pred, rich_output, (time_stop - time_start), )


def classify_image(mime_type, image_binary, rich_output=False, native_transform=False):
    '''Consumes and produces protobuf binary data'''
    app = current_app
    if app.model_image is None:
        # formulate response
        resp = make_response(("Image classification model not loaded, image-based transform not possible", 500, {}))
        resp.headers['Access-Control-Allow-Origin'] = '*'
        return resp

    time_start = time.clock()
    image_read = image_binary.stream.read()
    X = pd.DataFrame([['image/jpeg', image_read]], columns=['mime_type', 'image_binary'])
    type_in = app.model_image.classify._input_type
    classify_in = type_in(*tuple(col for col in X.values.T))

    # note that we keep it in proto format, by not transforming back to native
    predImage_out = app.model_image.classify.from_wrapped(classify_in)
    if native_transform:       # for regression testing
        # final transform DOES use native format as last output,j ust as in python-client/testing/wrap/runner.py example
        # print("translate preview: ")
        # print(predImage_out)
        # print("translate preview (as wrapped): ")
        # print(predImage_out.as_wrapped())
        predMood_out = app.model_mood.classify.from_pb_msg(predImage_out.as_pb_msg()).as_wrapped()
    else:
        # print(predImage_out.as_wrapped())
        predMood_out = app.model_mood.classify.from_wrapped(predImage_out.as_wrapped()).as_wrapped()

    pred = pd.DataFrame(np.column_stack(predMood_out), columns=predMood_out._fields)
    time_stop = time.clock()
    return generate_output(pred, rich_output, (time_stop - time_start))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8886, help='port to launch the simple web server')
    parser.add_argument("--modeldir", type=str, default='../model', help='model directory to load dumped image-mood-classifier')
    parser.add_argument("--modeldir_image", type=str, default='', help='model directory for image classfier')
    pargs = parser.parse_args()

    print("Configuring local application... {:}".format(__name__))
    logging.basicConfig(level=logging.INFO)
    app = connexion.App(__name__)
    app.add_api('swagger.yaml')

    # example usage:
    #     curl -F image_binary=@test.jpg -F mime_type="image/jpeg" "http://localhost:8885/classify_image"

    print("Loading model... {:}".format(pargs.modeldir))
    app.app.model_mood = load_model(pargs.modeldir)  # refers to ./model dir in pwd. generated by helper script also in this dir

    app.app.model_image = None
    if pargs.modeldir_image:
        print("Loading image classifier model... {:}".format(pargs.modeldir_image))
        app.app.model_image = load_model(pargs.modeldir_image)  # refers to ./model dir in pwd. generated by helper script also in this dir

    # run our standalone gevent server
    app.run(port=pargs.port)
