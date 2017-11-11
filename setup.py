# -*- coding: utf-8 -*-
import os
from setuptools import setup, find_packages

# extract __version__ from version file. importing will lead to install failures
setup_dir = os.path.dirname(__file__)
with open(os.path.join(setup_dir, 'image_mood_classifier', '_version.py')) as file:
    globals_dict = dict()
    exec(file.read(), globals_dict)
    __version__ = globals_dict['__version__']


setup(
    name=globals_dict['MODEL_NAME'],
    version=__version__,
    packages=find_packages(),
    author="Eric Zavesky",
    author_email="ezavesky@research.att.com",
    description=("Image mood classification tool using underlying scene classification"),
    long_description=("Image mood classification tool using underlying scene classification"),
    license="Apache",
    # package_data={globals_dict['MODEL_NAME']:['data/*']},
    scripts=['bin/run_image-mood-classifier_reference.py'],
    setup_requires=['pytest-runner'],
    entry_points="""
    [console_scripts]
    """,
    # setup_requires=['pytest-runner'],
    install_requires=['acumos',
                      'numpy',
                      'sklearn',
                      globals_dict['MODEL_NAME']],
    tests_require=['pytest',
                   'pexpect'],
    include_package_data=True,
)
