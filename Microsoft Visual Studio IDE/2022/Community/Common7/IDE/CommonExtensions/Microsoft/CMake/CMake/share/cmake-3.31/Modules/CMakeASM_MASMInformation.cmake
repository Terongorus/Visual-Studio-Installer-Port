# Distributed under the OSI-approved BSD 3-Clause License.  See accompanying
# file Copyright.txt or https://cmake.org/licensing for details.


# support for the MS assembler, masm and masm64

set(ASM_DIALECT "_MASM")

set(CMAKE_ASM${ASM_DIALECT}_SOURCE_FILE_EXTENSIONS asm)

set(CMAKE_ASM${ASM_DIALECT}_COMPILE_OBJECT "<CMAKE_ASM${ASM_DIALECT}_COMPILER> <DEFINES> <INCLUDES> <FLAGS> -c -Fo <OBJECT> <SOURCE>")
set(CMAKE_ASM${ASM_DIALECT}_CREATE_STATIC_LIBRARY "<CMAKE_AR> <LINK_FLAGS> /out:<TARGET> <OBJECTS> ")

# The ASM_MASM compiler id for this compiler is "MSVC", so fill out the runtime library table.
set(CMAKE_ASM${ASM_DIALECT}_COMPILE_OPTIONS_MSVC_RUNTIME_LIBRARY_MultiThreaded         "")
set(CMAKE_ASM${ASM_DIALECT}_COMPILE_OPTIONS_MSVC_RUNTIME_LIBRARY_MultiThreadedDLL      "")
set(CMAKE_ASM${ASM_DIALECT}_COMPILE_OPTIONS_MSVC_RUNTIME_LIBRARY_MultiThreadedDebug    "")
set(CMAKE_ASM${ASM_DIALECT}_COMPILE_OPTIONS_MSVC_RUNTIME_LIBRARY_MultiThreadedDebugDLL "")

set(CMAKE_ASM${ASM_DIALECT}_COMPILE_OPTIONS_MSVC_DEBUG_INFORMATION_FORMAT_Embedded        "-Zi")
set(CMAKE_ASM${ASM_DIALECT}_COMPILE_OPTIONS_MSVC_DEBUG_INFORMATION_FORMAT_ProgramDatabase "")
set(CMAKE_ASM${ASM_DIALECT}_COMPILE_OPTIONS_MSVC_DEBUG_INFORMATION_FORMAT_EditAndContinue "")

include(CMakeASMInformation)
set(ASM_DIALECT)
