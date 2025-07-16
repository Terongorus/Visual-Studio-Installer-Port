// -----------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
// -----------------------------------------------------------------------------

/* README
 * This header file is used to define a set of macros that can be used to emit user marks and ranges.
 *
 * USE: Define DIAGHUB_ENABLE_TRACE_SYSTEM before including this header file.
 * Then, declare DIAGHUB_DECLARE_TRACE and start the trace system. Make sure to stop the trace system once finished. For example:
 *
 *     #define DIAGHUB_ENABLE_TRACE_SYSTEM
 *     #include "UserMarksRefactor.h"
 *     DIAGHUB_DECLARE_TRACE;
 *     int main()
 *     {
 *       // Start the trace system
 *       DIAGHUB_START_TRACE_SYSTEM();
 *
 *       // Do work and emit user marks and ranges
 *       ...
 *       // Stop the trace system
 *       DIAGHUB_STOP_TRACE_SYSTEM();
 *     }
 *
 * There are 2 ways to use marks and ranges:
 * -------------------------------------------------------------------------------------------------------------------
 * Option 1: The original API, which uses a global ID that is managed internally. The macros for this are:
 *
 *    USERMARKS_INITIALIZE
 *    USERMARKS_EMIT_MESSAGE
 *    USERMARKRANGE_INITIALIZE
 *    USERMARKRANGE_START
 *    USERMARKRANGE_END
 *
 * A sample usage of this is:
 *
 *    // Initialize user marks
 *    USERMARKS_INITIALIZE(L"User mark name");
 *
 *    // Initialize user mark range
 *    USERMARKRANGE_INITIALIZE(L"Range name");
 *
 *    // Emit events
 *    USERMARKS_EMIT(L"Message to emit with user mark");
 *    USERMARKRANGE_START(L"Message to emit with range");
 *    USERMARKRANGE_END();
 * -------------------------------------------------------------------------------------------------------------------
 * Option 2: The "session" version, which allows you to pass in structs that represent a mark or a range. This is recommended
 * for managing multiple marks or sessions. The macros for this are:
 *
 *    USERMARKS_INITIALIZE_SESSION
 *    USERMARKRANGE_INITIALIZE_SESSION
 *    USERMARKRANGE_MAP_SESSION_TO_NAME
 *    USERMARKRANGE_SESSION_START
 *    USERMARKRANGE_SESSION_STARTWITHMESSAGE
 *    USERMARKRANGE_SESSION_END
 *
 * A sample usage of this is:
 *
 *    // Initialize user mark
 *    marks_session myUserMarkSession;
 *    USERMARKS_INITIALIZE_SESSION(myUserMarkSession);
 *
 *    // Initialize a range
 *    marks_range myRangeSession;
 *    USERMARKRANGE_INITIALIZE_SESSION(myRangeSession);
 *
 *    // Emit a message
 *    USERMARKS_SESSION_EMIT_MESSAGE(myUserMarkSession, L"Hello from UserMarks!");
 *
 *    // Start a range
 *    USERMARKRANGE_SESSION_START(myRangeSession);
 *
 *    // Stop a range
 *    USERMARKRANGE_SESSION_END(myRangeSession
 * -------------------------------------------------------------------------------------------------------------------
 * It is fine to have both options in the same file.
 * Note: The macros should be compatible with C++ and C.
 */

#ifndef WIN32_LEAN_AND_MEAN
#define WIN32_LEAN_AND_MEAN
#include <Windows.h>
#undef WIN32_LEAN_AND_MEAN
#else
#include <Windows.h>
#endif
#include <objbase.h>
#include <winerror.h>
#include <Evntprov.h>
#include <intsafe.h>

#ifndef __DIAGHUBTRACE_H__
#define __DIAGHUBTRACE_H__

#ifndef ASSERT
#include <assert.h>
#define ASSERT(c, m) assert(c)
#endif

 // Define constants
__declspec(selectany) volatile LONG current_id = INT32_MIN;

// Function to get a unique ID
extern "C" inline int GetUniqueMarksId()
{
    LONG result = ::InterlockedIncrement(&current_id);
    if (result == 0)
    {
        // Don't return 0 since we reserve 0 for the add user marks ID
        return ::InterlockedIncrement(&current_id);
    }

    ASSERT(result >= INT32_MAX, "Cannot create more user marks or ranges, hit the limit");
    return result;
}

#ifdef DIAGHUB_ENABLE_TRACE_SYSTEM

// Structure to hold trace registration information
typedef struct ____DiagHubTraceRegistration
{
    REGHANDLE RegHandle;
    int Flags;
} ___DiagHubTraceRegistration;

// External declaration of trace registration
extern ___DiagHubTraceRegistration ____diagHubTraceReg;

// Trace variables
/* 41B0D44F-F34D-458A-8297-59362184834E */ \
__declspec(selectany) GUID ____userMarksProviderId = { 0x41b0d44f, 0xf34d, 0x458a, { 0x82, 0x97, 0x59, 0x36, 0x21, 0x84, 0x83, 0x4e } }; \
__declspec(selectany) ___DiagHubTraceRegistration ____diagHubTraceReg; \
__declspec(selectany) int ____userId; \
__declspec(selectany) int ____startId; \
__declspec(selectany) int ____endId; \

// Empty macro that was used to declare trace variables, keep for compatibility
#define DIAGHUB_DECLARE_TRACE \

// Structure to hold user marks session information
typedef struct marks_session
{
    int id;
} marks_session;

// Structure to hold range session information
typedef struct range_session
{
    LPCWSTR rangeGuid;
    int startId;
    int endId;
} range_session;

// Trace system macros
#define DIAGHUB_TRACE_FLAG_STARTED 0x1
#define DIAGHUB_TRACE_STARTED ((____diagHubTraceReg.Flags & DIAGHUB_TRACE_FLAG_STARTED) != 0)

// Inline functions used to write events
#ifndef DIAGHUB_PFORCEINLINE
#if defined(PFORCEINLINE)
#define DIAGHUB_PFORCEINLINE PFORCEINLINE
#elif defined(FORCEINLINE)
#define DIAGHUB_PFORCEINLINE FORCEINLINE
#else
#define DIAGHUB_PFORCEINLINE __forceinline
#endif
#endif

/* The max size limit of an ETW payload is 64k, but that includes the header.
   We take off a bit for ourselves. */
#define MAX_MSG_SIZE_IN_BYTES (63 * 1024)

   /* ********************************************************************************************************************
   * Internal inline functions for writing events
   * ******************************************************************************************************************** */
DIAGHUB_PFORCEINLINE
void
DiagHubFireUserEventIdNameMap(
    int id,
    _In_z_ LPCWSTR nameWideString
)
{
    ASSERT(NULL != nameWideString && (2 * wcslen(nameWideString)) < MAX_MSG_SIZE_IN_BYTES, "Invalid name argument");

    EVENT_DESCRIPTOR evtDesc;
    EVENT_DATA_DESCRIPTOR evtDataDesc[2];
    /* Include the null in the length */
    size_t nameLenInBytes = 2 * (wcslen(nameWideString) + 1);

    /* ID to name mapping event is 1 */
    EventDescCreate(&evtDesc, 1, 2, 0, 4, 0, 0, 0x1); /* 4 = TRACE_LEVEL_INFORMATION */

    EventDataDescCreate(&evtDataDesc[0], &id, sizeof(id));
    EventDataDescCreate(&evtDataDesc[1], nameWideString, (ULONG)nameLenInBytes);

    EventWrite(____diagHubTraceReg.RegHandle, &evtDesc, ARRAYSIZE(evtDataDesc), evtDataDesc);
}

DIAGHUB_PFORCEINLINE
void
DiagHubFireUserEventWithString(
    int id,
    _In_opt_z_ LPCWSTR markWideString
)
{
    EVENT_DESCRIPTOR evtDesc;
    EVENT_DATA_DESCRIPTOR evtDataDesc[2];

    /* Include the null in the length if the string is not null */
    size_t strLenInBytes = NULL == markWideString ? 0 : (2 * (wcslen(markWideString) + 1));
    ASSERT(strLenInBytes < MAX_MSG_SIZE_IN_BYTES, "Invalid string argument");

    /* Firing write event is 2 */
    EventDescCreate(&evtDesc, 2, 2, 0, 4, 0, 0, 0x1); /* 4 = TRACE_LEVEL_INFORMATION */
    EventDataDescCreate(&evtDataDesc[0], &id, sizeof(id));
    EventDataDescCreate(&evtDataDesc[1], markWideString, (ULONG)strLenInBytes);
    EventWrite(____diagHubTraceReg.RegHandle, &evtDesc, ARRAYSIZE(evtDataDesc), evtDataDesc);
}

DIAGHUB_PFORCEINLINE
void
DiagHubFireUserRangeEvent(
    _In_z_ LPCWSTR rangeGuid,
    int startId,
    int endId
)
{
    ASSERT(NULL != rangeGuid && (2 * wcslen(rangeGuid)) < MAX_MSG_SIZE_IN_BYTES, "Invalid string argument");

    EVENT_DESCRIPTOR evtDesc;
    EVENT_DATA_DESCRIPTOR evtDataDesc[3];

    /* Include the null in the length if the string is not null */
    size_t strLenInBytes = 2 * (wcslen(rangeGuid) + 1);

    /* Firing range event is 3 */
    EventDescCreate(&evtDesc, 3, 2, 0, 4, 0, 0, 0x1); /* 4 = TRACE_LEVEL_INFORMATION */
    EventDataDescCreate(&evtDataDesc[0], rangeGuid, (ULONG)strLenInBytes);
    EventDataDescCreate(&evtDataDesc[1], &startId, sizeof(startId));
    EventDataDescCreate(&evtDataDesc[2], &endId, sizeof(endId));

    EventWrite(____diagHubTraceReg.RegHandle, &evtDesc, ARRAYSIZE(evtDataDesc), evtDataDesc);
}

DIAGHUB_PFORCEINLINE
void
DiagHubFireUserRangeIdNameMap(
    _In_z_ LPCWSTR rangeGuid,
    _In_z_ LPCWSTR nameWideString
)
{
    ASSERT(NULL != rangeGuid && (2 * wcslen(rangeGuid)) < MAX_MSG_SIZE_IN_BYTES, "Invalid string argument");
    ASSERT(NULL != nameWideString && (2 * wcslen(nameWideString)) < MAX_MSG_SIZE_IN_BYTES, "Invalid string argument");

    EVENT_DESCRIPTOR evtDesc;
    EVENT_DATA_DESCRIPTOR evtDataDesc[2];

    /* Include the null in the length */
    size_t nameLenInBytes = 2 * (wcslen(nameWideString) + 1);
    size_t strLenInBytes = 2 * (wcslen(rangeGuid) + 1);

    /* Range guid to name mapping event is 4 */
    EventDescCreate(&evtDesc, 4, 2, 0, 4, 0, 0, 0x1); /* 4 = TRACE_LEVEL_INFORMATION */

    EventDataDescCreate(&evtDataDesc[0], rangeGuid, (ULONG)strLenInBytes);
    EventDataDescCreate(&evtDataDesc[1], nameWideString, (ULONG)nameLenInBytes);

    EventWrite(____diagHubTraceReg.RegHandle, &evtDesc, ARRAYSIZE(evtDataDesc), evtDataDesc);
}

/* ********************************************************************************************************************
 * Macros to call for user marks and ranges
 * ******************************************************************************************************************** */

 // Must call this to start
#define DIAGHUB_START_TRACE_SYSTEM() \
    if (ERROR_SUCCESS == EventRegister(&____userMarksProviderId, NULL, NULL, &____diagHubTraceReg.RegHandle)) \
    { ____diagHubTraceReg.Flags |= DIAGHUB_TRACE_FLAG_STARTED; }

// Must call this to stop
#define DIAGHUB_STOP_TRACE_SYSTEM() \
    if (DIAGHUB_TRACE_STARTED) \
    { EventUnregister(____diagHubTraceReg.RegHandle); \
      ____diagHubTraceReg.Flags &= ~(DIAGHUB_TRACE_FLAG_STARTED); \
    }

/* OPTION 1 MACROS ----------------------------------------------------------------------------------------------------- */
// Initialize a user mark with a name
#define USERMARKS_INITIALIZE(name) \
    if (DIAGHUB_TRACE_STARTED) \
    { ____userId = GetUniqueMarksId(); \
      DiagHubFireUserEventIdNameMap(____userId, name); }

// Initialize a range with a name
#define USERMARKRANGE_INITIALIZE(name) \
    if (DIAGHUB_TRACE_STARTED) \
    { ____startId = GetUniqueMarksId(); \
    ____endId = GetUniqueMarksId(); \
    GUID rangeGuid; \
    OLECHAR* guidString; \
    (void)CoCreateGuid(&rangeGuid); \
    (void)StringFromCLSID(rangeGuid, &guidString); \
    DiagHubFireUserRangeEvent(guidString, ____startId, ____endId); \
    DiagHubFireUserRangeIdNameMap(guidString, name); \
    CoTaskMemFree(guidString); }

// Emit a user mark with a message
#define USERMARKS_EMIT_MESSAGE(markWideString) \
    if (DIAGHUB_TRACE_STARTED) \
    { DiagHubFireUserEventWithString(____userId, markWideString); }

// Emit a user mark
// (This does not need USERMARKS_INITIALIZE to be called to emit. It will use a default id for the mark and will not have a name.)
#define USERMARKS_EMIT(markWideString) \
    if (DIAGHUB_TRACE_STARTED) \
    { DiagHubFireUserEventWithString(INT32_MIN, markWideString); }

// Start a range with a message
#define USERMARKRANGE_START(markWideString) \
    if (DIAGHUB_TRACE_STARTED) \
    { DiagHubFireUserEventWithString(____startId, markWideString); }

// End a range
#define USERMARKRANGE_END() \
    if (DIAGHUB_TRACE_STARTED) \
    { DiagHubFireUserEventWithString(____endId, L""); }

/* OPTION 2 MACROS ---------------------------------------------------------------------------------------------------- */
// Initialize a user mark session
#define USERMARKS_INITIALIZE_SESSION(marks_session) \
    { marks_session.id = GetUniqueMarksId(); } \

// Initialize a range session
#define USERMARKRANGE_INITIALIZE_SESSION(rangeSession) \
    if (DIAGHUB_TRACE_STARTED) \
    { GUID rangeGuid; \
    (void)CoCreateGuid(&rangeGuid); \
    OLECHAR* guidString; \
    (void)StringFromCLSID(rangeGuid, &guidString); \
    rangeSession.rangeGuid = guidString; \
    rangeSession.startId = GetUniqueMarksId(); \
    rangeSession.endId = GetUniqueMarksId(); \
    } \

// Map a user marks session to a name
#define USERMARKS_MAP_SESSION_TO_NAME(marksSession, name) \
    if (DIAGHUB_TRACE_STARTED) \
    { DiagHubFireUserEventIdNameMap(marksSession.id, name); \
    }

// Map a range session to a name
#define USERMARKRANGE_MAP_SESSION_TO_NAME(rangeSession, name) \
    if (DIAGHUB_TRACE_STARTED) \
    { DiagHubFireUserRangeEvent( rangeSession.rangeGuid,  rangeSession.startId,  rangeSession.endId); \
    DiagHubFireUserRangeIdNameMap(rangeSession.rangeGuid, name); \
    }

// Emit a user mark with a message
#define USERMARKS_SESSION_EMIT_MESSAGE(marksSession, markWideString) \
    if (DIAGHUB_TRACE_STARTED) \
    { DiagHubFireUserEventWithString(marksSession.id, markWideString); }

// Start a range
#define USERMARKRANGE_SESSION_START(rangeSession) \
    if (DIAGHUB_TRACE_STARTED) \
    { DiagHubFireUserEventWithString(rangeSession.startId, L""); }

// Start a range with a message
#define USERMARKRANGE_SESSION_STARTWITHMESSAGE(rangeSession, markWideString) \
    if (DIAGHUB_TRACE_STARTED) \
    { DiagHubFireUserEventWithString(rangeSession.startId, markWideString); }

// End a range
#define USERMARKRANGE_SESSION_END(rangeSession) \
    if (DIAGHUB_TRACE_STARTED) \
    { DiagHubFireUserEventWithString(rangeSession.endId, L""); }
#else

// Define empty macros if DIAGHUB_ENABLE_TRACE_SYSTEM is not defined
#define DIAGHUB_DECLARE_TRACE ;
#define DIAGHUB_TRACE_STARTED (0)

#define DIAGHUB_START_TRACE_SYSTEM() do {} while(0);
#define DIAGHUB_STOP_TRACE_SYSTEM() do {} while(0);
#define USERMARKS_INITIALIZE(name) do {} while(0);
#define USERMARKRANGE_INITIALIZE(name) do {} while(0);
#define USERMARKS_INITIALIZE_SESSION(marks_session) do {} while(0);
#define USERMARKRANGE_INITIALIZE_SESSION(rangeSession) do {} while(0);


#define USERMARKS_EMIT_MESSAGE(m) return S_OK;
#define USERMARKS_EMIT(m) return S_OK;
#define USERMARKS_SESSION_EMIT_MESSAGE do {} while(0);

#define USERMARKRANGE_START(m) return S_OK;
#define USERMARKRANGE_SESSION_START do {} while(0);

#define USERMARKRANGE_END(m) return S_OK;
#define USERMARKRANGE_SESSION_END do {} while(0);

#endif /* DIAGHUB_ENABLE_TRACE_SYSTEM */
#endif /* __DIAGHUBTRACE_H__ */