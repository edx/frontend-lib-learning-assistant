frontend-lib-learning-assistant
###############################

|license-badge| |status-badge| |ci-badge| |codecov-badge|

.. |license-badge| image:: https://img.shields.io/github/license/edx/frontend-lib-learning-assistant.svg
    :target: https://github.com/edx/frontend-lib-learning-assistant/blob/main/LICENSE
    :alt: License

.. |status-badge| image:: https://img.shields.io/badge/Status-Maintained-brightgreen

.. |ci-badge| image:: https://github.com/edx/frontend-lib-learning-assistant/actions/workflows/ci.yml/badge.svg
    :target: https://github.com/edx/frontend-lib-learning-assistant/actions/workflows/ci.yml
    :alt: Continuous Integration

.. |codecov-badge| image:: https://codecov.io/github/edx/frontend-lib-learning-assistant/coverage.svg?branch=main
    :target: https://codecov.io/github/openedx/frontend-lib-learning-assistant?branch=main
    :alt: Codecov

Purpose
=======

This React library is the Learning Assistant frontend library. It provides the frontend code for a Learning Assistant
tool. This tool is meant to be installed into the `Learning micro-frontend (MFE)`_.

This library is currently a work in progress, so documentation is not complete.

.. _Learning micro-frontend (MFE): https://github.com/openedx/frontend-app-learning

Getting Started
===============

Devstack Installation
---------------------
This library is intended for use with the `Learning MFE`_. Please follow instructions for running the Learning MFE as
documented in the repository README.

.. _Learning MFE: https://github.com/openedx/frontend-app-learning

Development
-----------
This library is intended for use with the `Learning MFE`_. In order to install a local checkout of this library into 
the `Learning MFE`_ instead of from npm, follow the documentation for `local module development`_ in the `Learning MFE`_.

If you are planning to run the `Learning MFE`_ in `devstack`_, be sure to clone this repository into a ``src`` 
subdirectory of your `devstack`_ workspace directory so that the code is properly mounted into the `Learning MFE`_ 
Docker container. You will need to update the ``dir`` key in your ``module.config.js`` file appropriately. See 
the `Mounting frontend packages from src directory`_ ADR in the `devstack`_ repository for further details.

If you want to install a local checkout of this library into the `Learning MFE`_, follow the documentation mentioned 
above. However, if you want do active development on this library and wish to see your changes immediately reflected in 
the `Learning MFE`_, then you will need to modify your ``module.config.js`` to reference the ``src`` directory of this 
``repository`` in the ``dist`` key instead of the ``dist`` directory. Below is an example ``module.config.js`` for this
use case. If you set up your ``module.config.js`` this way, your changes will be picked up by the `Learning MFE`_ via 
the hot module reloading process.::

  module.exports = {
    localModules: [
        { moduleName: '@edx/frontend-lib-learning-assistant', dir: '../src/frontend-lib-learning-assistant', dist: 'src' },
    ],
  };
 
.. _devstack: https://github.com/openedx/devstack
.. _Learning MFE: https://github.com/openedx/frontend-app-learning
.. _local module development: https://github.com/openedx/frontend-app-learning#local-module-development
.. _Mounting frontend packages from src directory: https://github.com/openedx/devstack/blob/master/docs/decisions/0005-frontend-package-mounts.rst

Configuration
-------------

.. note::

   [TODO]

   Explicitly list anything that this MFE requires to function correctly.  This includes:

   * A list of both required and optional .env variables, and how they each
     affect the functioning of the MFE

   * A list of edx-platform `feature and waffle flags`_ that are either required
     to enable use of this MFE, or affect the behavior of the MFE in some other
     way

   * A list of IDAs or other MFEs that this MFE depends on to function correctly

.. _feature and waffle flags: https://docs.openedx.org/projects/openedx-proposals/en/latest/best-practices/oep-0017-bp-feature-toggles.html

[TODO]

Getting Help
============

If you are interested in using this repository, please contact team-cosmonauts@edx.org.

License
=======

The code in this repository is licensed under the AGPLv3 unless otherwise
noted.

Please see `LICENSE <LICENSE>`_ for details.

Contributing
============

This repo is not currently accepting contributions.

The Open edX Code of Conduct
============================

All community members are expected to follow the `Open edX Code of Conduct`_.

.. _Open edX Code of Conduct: https://openedx.org/code-of-conduct/

Reporting Security Issues
=========================

Please do not report security issues in public.  Email security@edx.org instead.
