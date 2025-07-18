# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.

import contextlib
try:
    from io import StringIO
except ImportError:
    from StringIO import StringIO  # 2.7
import os.path
import sys


@contextlib.contextmanager
def noop_cm():
    yield


def group_attr_names(attrnames):
    grouped = {
            'dunder': [],
            'private': [],
            'constants': [],
            'classes': [],
            'vars': [],
            'other': [],
            }
    for name in attrnames:
        if name.startswith('__') and name.endswith('__'):
            group = 'dunder'
        elif name.startswith('_'):
            group = 'private'
        elif name.isupper():
            group = 'constants'
        elif name.islower():
            group = 'vars'
        elif name == name.capitalize():
            group = 'classes'
        else:
            group = 'other'
        grouped[group].append(name)
    return grouped


if sys.version_info < (3,):
    def _str_to_lower(value):
        return value.decode().lower()
else:
    _str_to_lower = str.lower


#############################
# file paths

_os_path = os.path
# Uncomment to test Windows behavior on non-windows OS:
#import ntpath as _os_path
PATH_SEP = _os_path.sep
NORMCASE = _os_path.normcase
DIRNAME = _os_path.dirname
BASENAME = _os_path.basename
IS_ABS_PATH = _os_path.isabs
PATH_JOIN = _os_path.join


def fix_path(path, #*,
             _pathsep=PATH_SEP):
    """Return a platform-appropriate path for the given path."""
    if not path:
        return '.'
    return path.replace('/', _pathsep)


def fix_relpath(path, #*,
                _fix_path=fix_path,
                _path_isabs=IS_ABS_PATH,
                _pathsep=PATH_SEP
                ):
    """Return a ./-prefixed, platform-appropriate path for the given path."""
    path = _fix_path(path)
    if path in ('.', '..'):
        return path
    if not _path_isabs(path):
        if not path.startswith('.' + _pathsep):
            path = '.' + _pathsep + path
    return path


def _resolve_relpath(path, rootdir=None, #*,
                     _path_isabs=IS_ABS_PATH,
                     _normcase=NORMCASE,
                     _pathsep=PATH_SEP,
                     ):
    # "path" is expected to use "/" for its path separator, regardless
    # of the provided "_pathsep".

    if path.startswith('./'):
        return path[2:]
    if not _path_isabs(path):
        return path

    # Deal with root-dir-as-fileid.
    _, sep, relpath = path.partition('/')
    if sep and not relpath.replace('/', ''):
        return ''

    if rootdir is None:
        return None
    rootdir = _normcase(rootdir)
    if not rootdir.endswith(_pathsep):
        rootdir += _pathsep

    if not _normcase(path).startswith(rootdir):
        return None
    return path[len(rootdir):]


def fix_fileid(fileid, rootdir=None, #*,
               normalize=False,
               strictpathsep=None,
               _pathsep=PATH_SEP,
               **kwargs
               ):
    """Return a pathsep-separated file ID ("./"-prefixed) for the given value.

    The file ID may be absolute.  If so and "rootdir" is
    provided then make the file ID relative.  If absolute but "rootdir"
    is not provided then leave it absolute.
    """
    if not fileid or fileid == '.':
        return fileid

    # We default to "/" (forward slash) as the final path sep, since
    # that gives us a consistent, cross-platform result.  (Windows does
    # actually support "/" as a path separator.)  Most notably, node IDs
    # from pytest use "/" as the path separator by default.
    _fileid = fileid.replace(_pathsep, '/')

    relpath = _resolve_relpath(_fileid, rootdir,
                               _pathsep=_pathsep,
                               **kwargs
                               )
    if relpath:  # Note that we treat "" here as an absolute path.
        _fileid = './' + relpath

    if normalize:
        if strictpathsep:
            raise ValueError(
                    'cannot normalize *and* keep strict path separator')
        _fileid = _str_to_lower(_fileid)
    elif strictpathsep:
        # We do not use _normcase since we want to preserve capitalization.
        _fileid = _fileid.replace('/', _pathsep)
    return _fileid


#############################
# stdio

@contextlib.contextmanager
def hide_stdio():
    """Swallow stdout and stderr."""
    ignored = StdioStream()
    sys.stdout = ignored
    sys.stderr = ignored
    try:
        yield ignored
    finally:
        sys.stdout = sys.__stdout__
        sys.stderr = sys.__stderr__


if sys.version_info < (3,):
    class StdioStream(StringIO):
        def write(self, msg):
            StringIO.write(self, msg.decode())
else:
    StdioStream = StringIO


#############################
# shell

def shlex_unsplit(argv):
    """Return the shell-safe string for the given arguments.

    This effectively the equivalent of reversing shlex.split().
    """
    argv = [_quote_arg(a) for a in argv]
    return ' '.join(argv)


try:
    from shlex import quote as _quote_arg
except ImportError:
    def _quote_arg(arg):
        parts = None
        for i, c in enumerate(arg):
            if c.isspace():
                pass
            elif c == '"':
                pass
            elif c == "'":
                c = "'\"'\"'"
            else:
                continue
            if parts is None:
                parts = list(arg)
            parts[i] = c
        if parts is not None:
            arg = "'" + ''.join(parts) + "'"
        return arg
