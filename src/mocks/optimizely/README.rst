Optimizely Mock Implementation
##############################

Purpose
=======

This repository uses the `Optimizely SDK`_ to implement frontend experiments. Using Optimizely requires the use of an
SDK key or datafile. This poses a problem for development locally, because it requires that an `Optimizely environment`_
exists for local environments. When developing locally, it may be preferable not to rely explicitly on Optimizely and
to reserve testing the Optimizely flow in a staging environment.

This module contains a mock Optimizely implementation module that allows engineers to hardcode the return
values of the functions of the `Optimizely SDK`_, namely the `useDecision hook`_.

Usage
=====

The implementations of the `createInstance function`_ and the `OptimizelyProvider component`_ are no-op pass through
functions. They do not do anything.

In order to modify the experiment and how your user is bucketed, you will need to modify the `useDecision hook`_
implementation. Use the React SDK documentation to determine how to modify this function to suit your needs.

In addition, you will need to update your ``module.config.js`` file in your local checkout of the Learning MFE to
map the ``@optimizely/react-sdk`` module to this mock module.

A sample ``module.config.js`` file is shown below, but please refer to the documentation for `local module development`_
in the `Learning MFE`_ for more information.


.. code-block::

    module.exports = {
        localModules: [
            { moduleName: '@edx/frontend-lib-learning-assistant', dir: '../src/frontend-lib-learning-assistant', dist: 'src' },
            { moduleName: '@optimizely/react-sdk', dir: '../src/frontend-lib-learning-assistant/src/mocks/optimizely', dist: '.' },
        ],
    };

.. _createInstance function: https://docs.developers.optimizely.com/feature-experimentation/docs/initialize-sdk-react
.. _Learning MFE: https://github.com/openedx/frontend-app-learning
.. _local module development: https://github.com/openedx/frontend-app-learning#local-module-development
.. _Optimizely environment: https://docs.developers.optimizely.com/feature-experimentation/docs/manage-environments
.. _OptimizelyProvider component: https://docs.developers.optimizely.com/feature-experimentation/docs/optimizelyprovider
.. _Optimizely SDK: https://docs.developers.optimizely.com/feature-experimentation/docs/javascript-react-sdk
.. _useDecision hook: https://docs.developers.optimizely.com/feature-experimentation/docs/usedecision-react
