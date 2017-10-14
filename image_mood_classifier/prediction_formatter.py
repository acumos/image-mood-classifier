#! python
# -*- coding: utf-8 -*-
"""
Simple scikit-based transformer for transforming numpy predictions into a dataframe with classes
"""

from __future__ import print_function

import numpy as np
import pandas as pd
from math import ceil
from sklearn.base import BaseEstimator, ClassifierMixin
from sklearn.preprocessing import LabelBinarizer


class Formatter(BaseEstimator, ClassifierMixin):
    """Format predictions by binding to class names"""
    COL_NAME_IDX = "image"
    COL_NAME_CLASS = "class"
    COL_NAME_PREDICTION = "score"
    SAMPLE_GENERATE_MASKING = [0.1, 0.25, 0.5, 1]

    def __init__(self, class_map=None, classifier=None, class_encoder=None,
                 input_columns=None, input_map=None, input_softnoise=True):
        """
        Initialize the formatter with a class map
        :param class_map: map of {index:string , ...}
        """
        self.class_map = class_map
        self.classifier = classifier
        self.class_encoder = class_encoder
        self.input_columns = input_columns
        self.input_map = input_map
        self.class_list = None
        self.input_softnoise = input_softnoise
        #print("SET: {:}".format(self.class_map))

    def learn_class_mapping(self, raw_labels):
        """Method to learn input mapping from raw samples """
        # this binarization is required for keras models, disabled for now
        # https://stackoverflow.com/a/45365714
        if self.class_encoder is None:
            self.class_encoder = LabelBinarizer()
        rawLabel = self.class_encoder.fit_transform(raw_labels)
        self.class_map = dict(zip(range(len(self.class_encoder.classes_)), self.class_encoder.classes_))
        return rawLabel

    def learn_input_mapping(self, raw_sample, class_column, group_column, data_column):
        """Method to learn class mapping from raw samples """
        self.input_columns = {'class':class_column, 'group':group_column, 'data':data_column}
        classes = raw_sample[self.input_columns['class']].unique().tolist()
        self.input_map = dict(zip(classes, range(len(classes))))

    def transform_raw_sample(self, raw_sample, raw_labels=None, mask_depths=SAMPLE_GENERATE_MASKING):
        """Method to transform raw sample into numpy matrix, according to internal class mapping"""
        if self.input_map is None: return None
        raw_sample.sort_values([self.input_columns['data']], ascending=False, inplace=True)
        groupSet = raw_sample.groupby(self.input_columns['group'])
        numImages = len(groupSet)
        numFeatures = len(self.input_map)
        listFrames = []
        listLabels = []
        if mask_depths is None:
            mask_depths = [1]
        # utilize 10% of mean value as background noise
        if self.input_softnoise:
            valMean = raw_sample[self.input_columns['data']].mean()
            # print("Found mean {:} for samples within incoming features".format(valMean))
            npData = np.random.random_sample((numImages*len(mask_depths), numFeatures))*valMean*0.1
        else:
            npData = np.zeros((numImages*len(mask_depths), numFeatures))
        idx = 0
        for nameG, rowsG in groupSet:
            for maskFraction in mask_depths:
                numNonMasked = min(ceil(maskFraction*numFeatures), numFeatures)
                listFrames.append(nameG)
                if raw_labels is not None:
                    listLabels.append(raw_labels[idx])
                # https://stackoverflow.com/questions/7837722/what-is-the-most-efficient-way-to-loop-through-dataframes-with-pandas/34311080#34311080
                idxF = 0
                for rowDf in zip(rowsG[self.input_columns['class']], rowsG[self.input_columns['data']]):
                    npData[idx][self.input_map[rowDf[0]]] = rowDf[1]
                    idxF += 1
                    if idxF >= numNonMasked: break
            idx += 1

        # if input was a ndarray set, merge them back
        if listLabels and type(listLabels[0])==np.ndarray:
            listLabels = np.vstack(listLabels)
        return {'frames':listFrames, 'values':npData, 'labels':listLabels}


    def get_params(self, deep=False):
        return {'class_map': self.class_map, "classifier": self.classifier, 'class_encoder':self.class_encoder,
                'input_columns': self.input_columns, 'input_map':self.input_map, 'input_softnoise':self.input_softnoise }

    @property
    def output_types_(self):
        _types = self.classes_
        return [{Formatter.COL_NAME_IDX: _types[0]}, {Formatter.COL_NAME_CLASS: _types[1]}, {Formatter.COL_NAME_PREDICTION: _types[2]}]

    @property
    def n_outputs_(self):
        return 3

    @property
    def classes_(self):
        return [int, str, float]

    def fit(self, x, y=None):
        # no real training here, but if we had a classifier, retrain it
        if self.classifier is not None:
            self.classifier.fit(x, y)
        return self

    def predict(self, X, y=None):
        if type(X)!=pd.DataFrame:
            print("Error: Input type is not dataframe, aborting!")
            return None
        if self.classifier is None:
            print("Error: No underlying classifier provided, aborting!")
            return None
        objTransform = self.transform_raw_sample(X, y, mask_depths=None)
        #xx = self.classifier.predict(objTransform['values'])
        #print(xx)
        X = np.array(self.classifier.predict_proba(objTransform['values']))

        # always prefer to get class list from the classifier, if available
        if self.class_list is None and hasattr(self.classifier, 'classes_'):
            self.class_list = self.classifier.classes_

        df_predict_set = None
        for image_idx in range(len(X)):
            np_predict = X[image_idx,:]
            #print(np_predict)
            if self.class_list is None:  # may need to init from map one time
                num_class = len(np_predict)
                self.class_list = Formatter.prediction_list_gen(self.class_map, range(num_class))

            df_predict = Formatter.prediction_transform(np_predict, self.class_list)
            df_predict.insert(0, Formatter.COL_NAME_IDX, image_idx)

            if df_predict_set is None:
                df_predict_set = df_predict
            else:
                df_predict_set = df_predict_set.append(df_predict, ignore_index=True)
        return df_predict_set.reset_index(drop=True)

    def score(self, X, y=None):
        return 0

    @staticmethod
    def prediction_list_gen(dict_classes, list_idx):
        if dict_classes is None:
            return ['{:}_{:}'.format(Formatter.COL_NAME_CLASS, ix) for ix in list_idx]
        return [dict_classes[ix] for ix in list_idx]  # NOTE: special -1 offset

    @staticmethod
    def prediction_transform(preds, class_list=None, path_class=None):
        """
        Transform predictions by pairing with class labels
        :param preds: the numpy result after prediction
        :param class_list: class list for pairing
        :param path_class: path for class listing file
        :return: dataframe sorted by descending probability
        """
        df = pd.DataFrame(preds.transpose(), columns=[Formatter.COL_NAME_PREDICTION])
        if class_list is None:  # must simulate or load the class list
            print("Formatter: Warning, class map is not currently set...")
            dict_classes = None
            if path_class is None or not path_class:
                dict_classes = eval(open(path_class, 'r').read())
            #print("CONFIRM: {:}".format(list(df.index)))
            class_list = Formatter.prediction_list_gen(dict_classes, list(df.index))
        df.insert(0, Formatter.COL_NAME_CLASS, class_list)

        #print("Class is: " + classes[np.argmax(preds) - 1])
        df.sort_values([Formatter.COL_NAME_PREDICTION], ascending=False, inplace=True)
        return df

