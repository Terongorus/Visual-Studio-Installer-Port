# Distributed under the OSI-approved BSD 3-Clause License.  See accompanying
# file Copyright.txt or https://cmake.org/licensing for details.

#[=======================================================================[.rst:
FindPython
----------

.. versionadded:: 3.12

Find Python interpreter, compiler and development environment (include
directories and libraries).

.. versionadded:: 3.19
  When a version is requested, it can be specified as a simple value or as a
  range. For a detailed description of version range usage and capabilities,
  refer to the :command:`find_package` command.

The following components are supported:

* ``Interpreter``: search for Python interpreter.
* ``Compiler``: search for Python compiler. Only offered by IronPython.
* ``Development``: search for development artifacts (include directories and
  libraries).

  .. versionadded:: 3.18
    This component includes two sub-components which can be specified
    independently:

    * ``Development.Module``: search for artifacts for Python module
      developments.
    * ``Development.Embed``: search for artifacts for Python embedding
      developments.

  .. versionadded:: 3.26

    * ``Development.SABIModule``: search for artifacts for Python module
      developments using the
      `Stable Application Binary Interface <https://docs.python.org/3/c-api/stable.html>`_.
      This component is available only for version ``3.2`` and upper.

* ``NumPy``: search for NumPy include directories.

.. versionadded:: 3.14
  Added the ``NumPy`` component.

If no ``COMPONENTS`` are specified, ``Interpreter`` is assumed.

If component ``Development`` is specified, it implies sub-components
``Development.Module`` and ``Development.Embed``.

To ensure consistent versions between components ``Interpreter``, ``Compiler``,
``Development`` (or one of its sub-components) and ``NumPy``, specify all
components at the same time::

  find_package (Python COMPONENTS Interpreter Development)

This module looks preferably for version 3 of Python. If not found, version 2
is searched.
To manage concurrent versions 3 and 2 of Python, use :module:`FindPython3` and
:module:`FindPython2` modules rather than this one.

.. note::

  If components ``Interpreter`` and ``Development`` (or one of its
  sub-components) are both specified, this module search only for interpreter
  with same platform architecture as the one defined by CMake
  configuration. This constraint does not apply if only ``Interpreter``
  component is specified.

Imported Targets
^^^^^^^^^^^^^^^^

This module defines the following :ref:`Imported Targets <Imported Targets>`:

.. versionchanged:: 3.14
  :ref:`Imported Targets <Imported Targets>` are only created when
  :prop_gbl:`CMAKE_ROLE` is ``PROJECT``.

``Python::Interpreter``
  Python interpreter. This target is defined only if the ``Interpreter``
  component is found.
``Python::InterpreterDebug``
  .. versionadded:: 3.30

  Python debug interpreter. This target is defined only if the ``Interpreter``
  component is found and the ``Python_EXECUTABLE_DEBUG`` variable is defined.
  The target is only defined on the ``Windows`` platform.

``Python::InterpreterMultiConfig``
  .. versionadded:: 3.30

  Python interpreter. The release or debug version of the interpreter will be
  used, based on the context (platform, configuration).
  This target is defined only if the ``Interpreter`` component is found

``Python::Compiler``
  Python compiler. This target is defined only if the ``Compiler`` component is
  found.

``Python::Module``
  .. versionadded:: 3.15

  Python library for Python module. Target defined if component
  ``Development.Module`` is found.

``Python::SABIModule``
  .. versionadded:: 3.26

  Python library for Python module using the Stable Application Binary
  Interface. Target defined if component ``Development.SABIModule`` is found.

``Python::Python``
  Python library for Python embedding. Target defined if component
  ``Development.Embed`` is found.

``Python::NumPy``
  .. versionadded:: 3.14

  NumPy Python library. Target defined if component ``NumPy`` is found.

Result Variables
^^^^^^^^^^^^^^^^

This module will set the following variables in your project
(see :ref:`Standard Variable Names <CMake Developer Standard Variable Names>`):

``Python_FOUND``
  System has the Python requested components.
``Python_Interpreter_FOUND``
  System has the Python interpreter.
``Python_EXECUTABLE``
  Path to the Python interpreter.
``Python_EXECUTABLE_DEBUG``
  .. versionadded:: 3.30

  Path to the debug Python interpreter. It is only defined on the ``Windows``
  platform.

``Python_INTERPRETER``
  .. versionadded:: 3.30

  Path to the Python interpreter, defined as a
  :manual:`generator expression <cmake-generator-expressions(7)>` selecting
  the ``Python_EXECUTABLE`` or ``Python_EXECUTABLE_DEBUG`` variable based on
  the context (platform, configuration).

``Python_INTERPRETER_ID``
  A short string unique to the interpreter. Possible values include:
    * Python
    * ActivePython
    * Anaconda
    * Canopy
    * IronPython
    * PyPy
``Python_STDLIB``
  Standard platform independent installation directory.

  Information returned by ``sysconfig.get_path('stdlib')``.
``Python_STDARCH``
  Standard platform dependent installation directory.

  Information returned by ``sysconfig.get_path('platstdlib')``.
``Python_SITELIB``
  Third-party platform independent installation directory.

  Information returned by ``sysconfig.get_path('purelib')``.
``Python_SITEARCH``
  Third-party platform dependent installation directory.

  Information returned by ``sysconfig.get_path('platlib')``.

``Python_SOABI``
  .. versionadded:: 3.17

  Extension suffix for modules.

  Information computed from ``sysconfig.get_config_var('EXT_SUFFIX')`` or
  ``sysconfig.get_config_var('SOABI')`` or
  ``python3-config --extension-suffix``.

``Python_SOSABI``
  .. versionadded:: 3.26

  Extension suffix for modules using the Stable Application Binary Interface.

  Information computed from ``importlib.machinery.EXTENSION_SUFFIXES`` if the
  COMPONENT ``Interpreter`` was specified. Otherwise, the extension is ``abi3``
  except for ``Windows``, ``MSYS`` and ``CYGWIN`` for which this is an empty
  string.

``Python_Compiler_FOUND``
  System has the Python compiler.
``Python_COMPILER``
  Path to the Python compiler. Only offered by IronPython.
``Python_COMPILER_ID``
  A short string unique to the compiler. Possible values include:
    * IronPython

``Python_DOTNET_LAUNCHER``
  .. versionadded:: 3.18

  The ``.Net`` interpreter. Only used by ``IronPython`` implementation.

``Python_Development_FOUND``
  System has the Python development artifacts.

``Python_Development.Module_FOUND``
  .. versionadded:: 3.18

  System has the Python development artifacts for Python module.

``Python_Development.SABIModule_FOUND``
  .. versionadded:: 3.26

  System has the Python development artifacts for Python module using the
  Stable Application Binary Interface.

``Python_Development.Embed_FOUND``
  .. versionadded:: 3.18

  System has the Python development artifacts for Python embedding.

``Python_INCLUDE_DIRS``

  The Python include directories.

``Python_DEFINITIONS``
  .. versionadded:: 3.30.3

  The Python preprocessor definitions.

``Python_DEBUG_POSTFIX``
  .. versionadded:: 3.30

  Postfix of debug python module. This variable can be used to define the
  :prop_tgt:`DEBUG_POSTFIX` target property.

``Python_LINK_OPTIONS``
  .. versionadded:: 3.19

  The Python link options. Some configurations require specific link options
  for a correct build and execution.

``Python_LIBRARIES``
  The Python libraries.
``Python_LIBRARY_DIRS``
  The Python library directories.
``Python_RUNTIME_LIBRARY_DIRS``
  The Python runtime library directories.
``Python_SABI_LIBRARIES``
  .. versionadded:: 3.26

  The Python libraries for the Stable Application Binary Interface.
``Python_SABI_LIBRARY_DIRS``
  .. versionadded:: 3.26

  The Python ``SABI`` library directories.
``Python_RUNTIME_SABI_LIBRARY_DIRS``
  .. versionadded:: 3.26

  The Python runtime ``SABI`` library directories.
``Python_VERSION``
  Python version.
``Python_VERSION_MAJOR``
  Python major version.
``Python_VERSION_MINOR``
  Python minor version.
``Python_VERSION_PATCH``
  Python patch version.

``Python_PyPy_VERSION``
  .. versionadded:: 3.18

  Python PyPy version.

``Python_NumPy_FOUND``
  .. versionadded:: 3.14

  System has the NumPy.

``Python_NumPy_INCLUDE_DIRS``
  .. versionadded:: 3.14

  The NumPy include directories.

``Python_NumPy_VERSION``
  .. versionadded:: 3.14

  The NumPy version.

Hints
^^^^^

``Python_ROOT_DIR``
  Define the root directory of a Python installation.

``Python_USE_STATIC_LIBS``
  * If not defined, search for shared libraries and static libraries in that
    order.
  * If set to TRUE, search **only** for static libraries.
  * If set to FALSE, search **only** for shared libraries.

  .. note::

    This hint will be ignored on ``Windows`` because static libraries are not
    available on this platform.

``Python_FIND_ABI``
  .. versionadded:: 3.16

  This variable defines which ABIs, as defined in :pep:`3149`, should be
  searched.

  .. note::

    This hint will be honored only when searched for ``Python`` version 3.

  The ``Python_FIND_ABI`` variable is a 4-tuple specifying, in that order,
  ``pydebug`` (``d``), ``pymalloc`` (``m``), ``unicode`` (``u``) and
  ``gil_disabled`` (``t``) flags.

  .. versionadded:: 3.30
    A fourth element, specifying the ``gil_disabled`` flag (i.e. free
    threaded python), is added and is optional. If not specified, the value is
    ``OFF``.

  Each element can be set to one of the following:

  * ``ON``: Corresponding flag is selected.
  * ``OFF``: Corresponding flag is not selected.
  * ``ANY``: The two possibilities (``ON`` and ``OFF``) will be searched.

  .. note::

    If ``Python3_FIND_ABI`` is not defined, any ABI, excluding the
    ``gil_disabled`` flag, will be searched.

  From this 4-tuple, various ABIs will be searched starting from the most
  specialized to the most general. Moreover, when ``ANY`` is specified for
  ``pydebug`` and ``gil_disabled``, ``debug`` and ``free threaded`` versions
  will be searched **after** ``non-debug`` and ``non-gil-disabled`` ones.

  For example, if we have::

    set (Python_FIND_ABI "ON" "ANY" "ANY" "ON")

  The following flags combinations will be appended, in that order, to the
  artifact names: ``tdmu``, ``tdm``, ``tdu``, and ``td``.

  And to search any possible ABIs::

    set (Python_FIND_ABI "ANY" "ANY" "ANY" "ANY")

  The following combinations, in that order, will be used: ``mu``, ``m``,
  ``u``, ``<empty>``, ``dmu``, ``dm``, ``du``, ``d``, ``tmu``, ``tm``, ``tu``,
  ``t``, ``tdmu``, ``tdm``, ``tdu``, and ``td``.

  .. note::

    This hint is useful only on ``POSIX`` systems except for the
    ``gil_disabled`` flag. So, on ``Windows`` systems,
    when ``Python_FIND_ABI`` is defined, ``Python`` distributions from
    `python.org <https://www.python.org/>`_ will be found only if the value for
    each flag is ``OFF`` or ``ANY`` except for the fourth one
    (``gil_disabled``).

``Python_FIND_STRATEGY``
  .. versionadded:: 3.15

  This variable defines how lookup will be done.
  The ``Python_FIND_STRATEGY`` variable can be set to one of the following:

  * ``VERSION``: Try to find the most recent version in all specified
    locations.
    This is the default if policy :policy:`CMP0094` is undefined or set to
    ``OLD``.
  * ``LOCATION``: Stops lookup as soon as a version satisfying version
    constraints is founded.
    This is the default if policy :policy:`CMP0094` is set to ``NEW``.

  See also ``Python_FIND_UNVERSIONED_NAMES``.

``Python_FIND_REGISTRY``
  .. versionadded:: 3.13

  On Windows the ``Python_FIND_REGISTRY`` variable determine the order
  of preference between registry and environment variables.
  the ``Python_FIND_REGISTRY`` variable can be set to one of the following:

  * ``FIRST``: Try to use registry before environment variables.
    This is the default.
  * ``LAST``: Try to use registry after environment variables.
  * ``NEVER``: Never try to use registry.

``Python_FIND_FRAMEWORK``
  .. versionadded:: 3.15

  On macOS the ``Python_FIND_FRAMEWORK`` variable determine the order of
  preference between Apple-style and unix-style package components.
  This variable can take same values as :variable:`CMAKE_FIND_FRAMEWORK`
  variable.

  .. note::

    Value ``ONLY`` is not supported so ``FIRST`` will be used instead.

  If ``Python_FIND_FRAMEWORK`` is not defined, :variable:`CMAKE_FIND_FRAMEWORK`
  variable will be used, if any.

``Python_FIND_VIRTUALENV``
  .. versionadded:: 3.15

  This variable defines the handling of virtual environments managed by
  ``virtualenv`` or ``conda``. It is meaningful only when a virtual environment
  is active (i.e. the ``activate`` script has been evaluated). In this case, it
  takes precedence over ``Python_FIND_REGISTRY`` and ``CMAKE_FIND_FRAMEWORK``
  variables.  The ``Python_FIND_VIRTUALENV`` variable can be set to one of the
  following:

  * ``FIRST``: The virtual environment is used before any other standard
    paths to look-up for the interpreter. This is the default.
  * ``ONLY``: Only the virtual environment is used to look-up for the
    interpreter.
  * ``STANDARD``: The virtual environment is not used to look-up for the
    interpreter but environment variable ``PATH`` is always considered.
    In this case, variable ``Python_FIND_REGISTRY`` (Windows) or
    ``CMAKE_FIND_FRAMEWORK`` (macOS) can be set with value ``LAST`` or
    ``NEVER`` to select preferably the interpreter from the virtual
    environment.

  .. versionadded:: 3.17
    Added support for ``conda`` environments.

  .. note::

    If the component ``Development`` is requested, it is **strongly**
    recommended to also include the component ``Interpreter`` to get expected
    result.

``Python_FIND_IMPLEMENTATIONS``
  .. versionadded:: 3.18

  This variable defines, in an ordered list, the different implementations
  which will be searched. The ``Python_FIND_IMPLEMENTATIONS`` variable can
  hold the following values:

  * ``CPython``: this is the standard implementation. Various products, like
    ``Anaconda`` or ``ActivePython``, rely on this implementation.
  * ``IronPython``: This implementation use the ``CSharp`` language for
    ``.NET Framework`` on top of the `Dynamic Language Runtime` (``DLR``).
    See `IronPython <https://ironpython.net>`_.
  * ``PyPy``: This implementation use ``RPython`` language and
    ``RPython translation toolchain`` to produce the python interpreter.
    See `PyPy <https://pypy.org>`_.

  The default value is:

  * Windows platform: ``CPython``, ``IronPython``
  * Other platforms: ``CPython``

  .. note::

    This hint has the lowest priority of all hints, so even if, for example,
    you specify ``IronPython`` first and ``CPython`` in second, a python
    product based on ``CPython`` can be selected because, for example with
    ``Python_FIND_STRATEGY=LOCATION``, each location will be search first for
    ``IronPython`` and second for ``CPython``.

  .. note::

    When ``IronPython`` is specified, on platforms other than ``Windows``, the
    ``.Net`` interpreter (i.e. ``mono`` command) is expected to be available
    through the ``PATH`` variable.

``Python_FIND_UNVERSIONED_NAMES``
  .. versionadded:: 3.20

  This variable defines how the generic names will be searched. Currently, it
  only applies to the generic names of the interpreter, namely, ``python3`` or
  ``python2`` and ``python``.
  The ``Python_FIND_UNVERSIONED_NAMES`` variable can be set to one of the
  following values:

  * ``FIRST``: The generic names are searched before the more specialized ones
    (such as ``python2.5`` for example).
  * ``LAST``: The generic names are searched after the more specialized ones.
    This is the default.
  * ``NEVER``: The generic name are not searched at all.

  See also ``Python_FIND_STRATEGY``.

Artifacts Specification
^^^^^^^^^^^^^^^^^^^^^^^

.. versionadded:: 3.16

To solve special cases, it is possible to specify directly the artifacts by
setting the following variables:

``Python_EXECUTABLE``
  The path to the interpreter.

``Python_COMPILER``
  The path to the compiler.

``Python_DOTNET_LAUNCHER``
  .. versionadded:: 3.18

  The ``.Net`` interpreter. Only used by ``IronPython`` implementation.

``Python_LIBRARY``
  The path to the library. It will be used to compute the
  variables ``Python_LIBRARIES``, ``Python_LIBRARY_DIRS`` and
  ``Python_RUNTIME_LIBRARY_DIRS``.

``Python_SABI_LIBRARY``
  .. versionadded:: 3.26

  The path to the library for Stable Application Binary Interface. It will be
  used to compute the variables ``Python_SABI_LIBRARIES``,
  ``Python_SABI_LIBRARY_DIRS`` and ``Python_RUNTIME_SABI_LIBRARY_DIRS``.

``Python_INCLUDE_DIR``
  The path to the directory of the ``Python`` headers. It will be used to
  compute the variable ``Python_INCLUDE_DIRS``.

``Python_NumPy_INCLUDE_DIR``
  The path to the directory of the ``NumPy`` headers. It will be used to
  compute the variable ``Python_NumPy_INCLUDE_DIRS``.

.. note::

  All paths must be absolute. Any artifact specified with a relative path
  will be ignored.

.. note::

  When an artifact is specified, all ``HINTS`` will be ignored and no search
  will be performed for this artifact.

  If more than one artifact is specified, it is the user's responsibility to
  ensure the consistency of the various artifacts.

By default, this module supports multiple calls in different directories of a
project with different version/component requirements while providing correct
and consistent results for each call. To support this behavior, CMake cache
is not used in the traditional way which can be problematic for interactive
specification. So, to enable also interactive specification, module behavior
can be controlled with the following variable:

``Python_ARTIFACTS_INTERACTIVE``
  .. versionadded:: 3.18

  Selects the behavior of the module. This is a boolean variable:

  * If set to ``TRUE``: Create CMake cache entries for the above artifact
    specification variables so that users can edit them interactively.
    This disables support for multiple version/component requirements.
  * If set to ``FALSE`` or undefined: Enable multiple version/component
    requirements.

Commands
^^^^^^^^

This module defines the command ``Python_add_library`` (when
:prop_gbl:`CMAKE_ROLE` is ``PROJECT``), which has the same semantics as
:command:`add_library` and adds a dependency to target ``Python::Python`` or,
when library type is ``MODULE``, to target ``Python::Module`` or
``Python::SABIModule`` (when ``USE_SABI`` option is specified) and takes care
of Python module naming rules::

  Python_add_library (<name> [STATIC | SHARED | MODULE [USE_SABI <version>] [WITH_SOABI]]
                      <source1> [<source2> ...])

If the library type is not specified, ``MODULE`` is assumed.

.. versionadded:: 3.17
  For ``MODULE`` library type, if option ``WITH_SOABI`` is specified, the
  module suffix will include the ``Python_SOABI`` value, if any.

.. versionadded:: 3.26
  For ``MODULE`` type, if the option ``USE_SABI`` is specified, the
  preprocessor definition ``Py_LIMITED_API`` will be specified, as ``PRIVATE``,
  for the target ``<name>`` with the value computed from ``<version>`` argument.
  The expected format for ``<version>`` is ``major[.minor]``, where each
  component is a numeric value. If ``minor`` component is specified, the
  version should be, at least, ``3.2`` which is the version where the
  `Stable Application Binary Interface <https://docs.python.org/3/c-api/stable.html>`_
  was introduced. Specifying only major version ``3`` is equivalent to ``3.2``.

  When option ``WITH_SOABI`` is also specified,  the module suffix will include
  the ``Python_SOSABI`` value, if any.

.. versionadded:: 3.30
  For ``MODULE`` type, the :prop_tgt:`DEBUG_POSTFIX` target property is
  initialized with the value of ``Python_DEBUG_POSTFIX`` variable if defined.
#]=======================================================================]


cmake_policy(PUSH)
# numbers and boolean constants
cmake_policy (SET CMP0012 NEW)


set (_PYTHON_PREFIX Python)
unset (_Python_REQUIRED_VERSION_MAJOR)
unset (_Python_REQUIRED_VERSIONS)

if (Python_FIND_VERSION_RANGE)
  # compute list of major versions
  foreach (_Python_MAJOR IN ITEMS 3 2)
    if (_Python_MAJOR VERSION_GREATER_EQUAL Python_FIND_VERSION_MIN_MAJOR
        AND ((Python_FIND_VERSION_RANGE_MAX STREQUAL "INCLUDE" AND _Python_MAJOR VERSION_LESS_EQUAL Python_FIND_VERSION_MAX)
        OR (Python_FIND_VERSION_RANGE_MAX STREQUAL "EXCLUDE" AND _Python_MAJOR VERSION_LESS Python_FIND_VERSION_MAX)))
      list (APPEND _Python_REQUIRED_VERSIONS ${_Python_MAJOR})
    endif()
  endforeach()
  list (LENGTH _Python_REQUIRED_VERSIONS _Python_VERSION_COUNT)
  if (_Python_VERSION_COUNT EQUAL 0)
    unset (_Python_REQUIRED_VERSIONS)
  elseif (_Python_VERSION_COUNT EQUAL 1)
    set (_Python_REQUIRED_VERSION_MAJOR ${_Python_REQUIRED_VERSIONS})
  endif()
elseif (DEFINED Python_FIND_VERSION)
  set (_Python_REQUIRED_VERSION_MAJOR ${Python_FIND_VERSION_MAJOR})
else()
  set (_Python_REQUIRED_VERSIONS 3 2)
endif()

if (_Python_REQUIRED_VERSION_MAJOR)
  include (${CMAKE_CURRENT_LIST_DIR}/FindPython/Support.cmake)
elseif (_Python_REQUIRED_VERSIONS)
  # iterate over versions in quiet and NOT required modes to avoid multiple
  # "Found" messages and prematurally failure.
  set (_Python_QUIETLY ${Python_FIND_QUIETLY})
  set (_Python_REQUIRED ${Python_FIND_REQUIRED})
  set (Python_FIND_QUIETLY TRUE)
  set (Python_FIND_REQUIRED FALSE)

  set (_Python_REQUIRED_VERSION_LAST 2)

  unset (_Python_INPUT_VARS)
  foreach (_Python_ITEM IN ITEMS Python_EXECUTABLE Python_COMPILER Python_LIBRARY
                                 Python_INCLUDE_DIR Python_NumPy_INCLUDE_DIR)
    if (NOT DEFINED ${_Python_ITEM})
      list (APPEND _Python_INPUT_VARS ${_Python_ITEM})
    endif()
  endforeach()

  foreach (_Python_REQUIRED_VERSION_MAJOR IN LISTS _Python_REQUIRED_VERSIONS)
    set (Python_FIND_VERSION ${_Python_REQUIRED_VERSION_MAJOR})
    include (${CMAKE_CURRENT_LIST_DIR}/FindPython/Support.cmake)
    if (Python_FOUND OR
        _Python_REQUIRED_VERSION_MAJOR EQUAL _Python_REQUIRED_VERSION_LAST)
      break()
    endif()
    # clean-up INPUT variables not set by the user
    foreach (_Python_ITEM IN LISTS _Python_INPUT_VARS)
      unset (${_Python_ITEM})
    endforeach()
    # clean-up some CACHE variables to ensure look-up restart from scratch
    foreach (_Python_ITEM IN LISTS _Python_CACHED_VARS)
      unset (${_Python_ITEM} CACHE)
    endforeach()
  endforeach()

  unset (Python_FIND_VERSION)

  set (Python_FIND_QUIETLY ${_Python_QUIETLY})
  set (Python_FIND_REQUIRED ${_Python_REQUIRED})
  if (Python_FIND_REQUIRED OR NOT Python_FIND_QUIETLY)
    # call again validation command to get "Found" or error message
    find_package_handle_standard_args (Python HANDLE_COMPONENTS HANDLE_VERSION_RANGE
                                              REQUIRED_VARS ${_Python_REQUIRED_VARS}
                                              VERSION_VAR Python_VERSION)
  endif()
else()
  # supported versions not in the specified range. Call final check
  if (NOT Python_FIND_COMPONENTS)
    set (Python_FIND_COMPONENTS Interpreter)
    set (Python_FIND_REQUIRED_Interpreter TRUE)
  endif()

  include (${CMAKE_CURRENT_LIST_DIR}/FindPackageHandleStandardArgs.cmake)
  find_package_handle_standard_args (Python HANDLE_COMPONENTS HANDLE_VERSION_RANGE
                                            VERSION_VAR Python_VERSION
                                            REASON_FAILURE_MESSAGE "Version range specified \"${Python_FIND_VERSION_RANGE}\" does not include supported versions")
endif()

if (COMMAND __Python_add_library)
  macro (Python_add_library)
    __Python_add_library (Python ${ARGV})
  endmacro()
endif()

unset (_PYTHON_PREFIX)

cmake_policy(POP)
