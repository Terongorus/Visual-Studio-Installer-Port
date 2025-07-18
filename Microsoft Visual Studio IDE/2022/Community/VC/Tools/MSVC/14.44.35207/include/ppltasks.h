/***
* ==++==
*
* Copyright (c) Microsoft Corporation. All rights reserved.
*
* ==--==
* =+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
*
* ppltasks.h
*
* Parallel Patterns Library - PPL Tasks
*
* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
****/

#ifndef _PPLTASKS_H
#define _PPLTASKS_H

#include <yvals_core.h>

#if _STL_COMPILER_PREPROCESSOR

#include <pplwin.h>

#include <functional>
#include <vector>
#include <utility>
#include <exception>
#include <algorithm>
#include <mutex>
#include <intrin.h>

#if defined (__cplusplus_winrt)
#include <agile.h>
#endif /* #if defined(__cplusplus_winrt) */

#ifdef _DEBUG
    #define _DBG_ONLY(X) X
#else
    #define _DBG_ONLY(X)
#endif // #ifdef _DEBUG

#ifndef _PPLTASK_ASYNC_LOGGING
#define _PPLTASK_ASYNC_LOGGING 1
#endif // #ifndef _PPLTASK_ASYNC_LOGGING

// Enforce consistent task definitions across clients
#if _PPLTASK_ASYNC_LOGGING
#pragma detect_mismatch("_PPLTASK_ASYNC_LOGGING", "1")
#else
#pragma detect_mismatch("_PPLTASK_ASYNC_LOGGING", "0")
#endif // #if _PPLTASK_ASYNC_LOGGING

#if defined(PPL_TASK_CONTEXT_ERROR_CONTROL) || defined (__cplusplus_winrt)
#define _PPL_TASK_CONTEXT_CONTROL_ENABLED true
#else
#define _PPL_TASK_CONTEXT_CONTROL_ENABLED false
#endif
#if defined(PPL_TASK_CONTEXT_ERROR_CONTROL)
#define _PPL_TASK_ERROR_REPORT_ENABLED true
#else
#define _PPL_TASK_ERROR_REPORT_ENABLED false
#endif

#pragma pack(push, _CRT_PACKING)
#pragma warning(push, _STL_WARNING_LEVEL)
#pragma warning(disable : _STL_DISABLED_WARNINGS)
_STL_DISABLE_CLANG_WARNINGS
#pragma push_macro("new")
#undef new

#pragma warning(disable: 28197)
#pragma warning(disable: 4100) // Unreferenced formal parameter - needed for document generation
#pragma warning(disable: 4127) // constant express in if condition - we use it for meta programming

extern "C++" { // attach declarations in namespace Concurrency to the global module, see N4910 [module.unit]/7

// stuff ported from Dev11 CRT
// NOTE: this doesn't actually match std::declval. it behaves differently for void!
// so don't blindly change it to std::declval.
namespace Concurrency
{
    namespace details
    {
        template<class _Ty>
        _Ty&& declval();
    }
}

/// <summary>
///     The <c>Concurrency</c> namespace provides classes and functions that give you access to the Concurrency Runtime,
///     a concurrent programming framework for C++. For more information, see <see cref="Concurrency Runtime"/>.
/// </summary>
/**/
namespace Concurrency
{
/// <summary>
///     A type that represents the terminal state of a task. Valid values are <c>completed</c> and <c>canceled</c>.
/// </summary>
/// <seealso cref="task Class"/>
/**/
typedef task_group_status task_status;

template <typename _Type> class task;
template <> class task<void>;

// In debug builds, default to 10 frames, unless this is overridden prior to #include'ing ppltasks.h.  In retail builds, default to only one frame.
#ifndef PPL_TASK_SAVE_FRAME_COUNT
#ifdef _DEBUG
#define PPL_TASK_SAVE_FRAME_COUNT 10
#else
#define PPL_TASK_SAVE_FRAME_COUNT 1
#endif
#endif

#ifndef __EDG__
#define _EXPAND_STR(x) #x
// Enforce consistent task frame save count across clients
#pragma detect_mismatch("ppltask_saved_frame_numbers", _EXPAND_STR(PPL_TASK_SAVE_FRAME_COUNT))
#undef _EXPAND_STR
#endif

/// <summary>
/// Helper macro to determine how many stack frames need to be saved. When any number less or equal to 1 is specified,
/// only one frame is captured and no stackwalk will be involved. Otherwise, the number of callstack frames will be captured.
/// </summary>
/// <remarks>
/// This needs to be defined as a macro rather than a function so that if we're only gathering one frame, _ReturnAddress()
/// will evaluate to client code, rather than a helper function inside of _TaskCreationCallstack, itself.
/// </remarks>
#if PPL_TASK_SAVE_FRAME_COUNT > 1
#if defined(__cplusplus_winrt) && !defined(_DEBUG)
#pragma message ("WARNING: Redefining PPL_TASK_SAVE_FRAME_COUNT under Release build for non-desktop applications is not supported; only one frame will be captured!")
#endif
#define _CAPTURE_CALLSTACK() ::Concurrency::details::_TaskCreationCallstack::_CaptureMultiFramesCallstack(_ReturnAddress(), PPL_TASK_SAVE_FRAME_COUNT)
#else
#define _CAPTURE_CALLSTACK() ::Concurrency::details::_TaskCreationCallstack::_CaptureSingleFrameCallstack(_ReturnAddress())
#endif


/// <summary>
///     Cancels the currently executing task. This function can be called from within the body of a task to abort the
///     task's execution and cause it to enter the <c>canceled</c> state. While it may be used in response to
///     a cancellation request through a <c>cancellation_token</c>, you may also use it by itself, to initiate
///     cancellation of the task that is currently executing.
///     <para>It is not a supported scenario to call this function if you are not within the body of a <c>task</c>.
///     Doing so will result in undefined behavior such as a crash or a hang in your application.</para>
/// </summary>
/// <seealso cref="task Class"/>
/**/
inline __declspec(noreturn) void __cdecl cancel_current_task()
{
    _THROW(task_canceled{});
}

namespace details
{
    struct _DefaultTaskHelper
    {
        /// <summary>
        /// Helper function for throwing an error for task functions that cannot be called
        /// from a default constructed task.
        /// </summary>
        static void __declspec(noreturn) __cdecl _NoCallOnDefaultTask_ErrorImpl()
        {
            _THROW(invalid_operation("This function cannot be called on a default constructed task"));
        }
    };

    /// <summary>
    ///     Callstack container, which is used to capture and preserve callstacks in ppltasks.
    ///     Members of this class is examined by vc debugger, thus there will be no public access methods.
    ///     Please note that names of this class should be kept stable for debugger examining.
    /// </summary>
    class _TaskCreationCallstack
    {
    private:
        // If _M_SingleFrame != nullptr, there will be only one frame of callstacks, which is stored in _M_SingleFrame;
        // otherwise, _M_Frame will store all the callstack frames.
        void* _M_SingleFrame;
        ::std::vector<void *> _M_frames;
    public:
        _TaskCreationCallstack()
        {
            _M_SingleFrame = nullptr;
        }

        // Store one frame of callstack. This function works for both Debug / Release CRT.
        static _TaskCreationCallstack _CaptureSingleFrameCallstack(void *_SingleFrame)
        {
            _TaskCreationCallstack _csc;
            _csc._M_SingleFrame = _SingleFrame;
            return _csc;
        }

        // Capture _CaptureFrames number of callstack frames. This function only work properly for Desktop or Debug CRT.
        __declspec(noinline)
        static _TaskCreationCallstack _CaptureMultiFramesCallstack(void *_SingleFrame, size_t _CaptureFrames)
        {
            _TaskCreationCallstack _csc;
            _csc._M_SingleFrame = _SingleFrame;
            if (_CaptureFrames > 1)
            {
            _csc._M_frames.resize(_CaptureFrames);
            // skip 2 frames to make sure callstack starts from user code
            _csc._M_frames.resize(::Concurrency::details::platform::CaptureCallstack(&_csc._M_frames[0], 2, _CaptureFrames));
            }
            return _csc;
        }
    };
    typedef unsigned char _Unit_type;

    struct _TypeSelectorNoAsync {};
    struct _TypeSelectorAsyncOperationOrTask {};
    struct _TypeSelectorAsyncOperation : public _TypeSelectorAsyncOperationOrTask { };
    struct _TypeSelectorAsyncTask : public _TypeSelectorAsyncOperationOrTask { };
    struct _TypeSelectorAsyncAction {};
    struct _TypeSelectorAsyncActionWithProgress {};
    struct _TypeSelectorAsyncOperationWithProgress {};

    template<typename _Ty>
    struct _NormalizeVoidToUnitType
    {
        typedef _Ty _Type;
    };

    template<>
    struct _NormalizeVoidToUnitType<void>
    {
        typedef _Unit_type _Type;
    };

    template<typename _Ty>
    struct _IsUnwrappedAsyncSelector
    {
        static constexpr bool _Value = true;
    };

    template<>
    struct _IsUnwrappedAsyncSelector<_TypeSelectorNoAsync>
    {
        static constexpr bool _Value = false;
    };

    template <typename _Ty>
    struct _UnwrapTaskType
    {
        typedef _Ty _Type;
    };

    template <typename _Ty>
    struct _UnwrapTaskType<task<_Ty>>
    {
        typedef _Ty _Type;
    };

    template <typename _Ty>
    _TypeSelectorAsyncTask _AsyncOperationKindSelector(task<_Ty>);

    _TypeSelectorNoAsync _AsyncOperationKindSelector(...);

#if defined(__cplusplus_winrt)
    template <typename _Type>
    struct _Unhat
    {
        typedef _Type _Value;
    };

    template <typename _Type>
    struct _Unhat<_Type^>
    {
        typedef _Type _Value;
    };

    value struct _NonUserType { public: int _Dummy; };

    template <typename _Type, bool _IsValueTypeOrRefType = __is_valid_winrt_type(_Type)>
    struct _ValueTypeOrRefType
    {
        typedef _NonUserType _Value;
    };

    template <typename _Type>
    struct _ValueTypeOrRefType<_Type, true>
    {
        typedef _Type _Value;
    };

    template <typename _T1, typename _T2>
    _T2 _ProgressTypeSelector(Windows::Foundation::IAsyncOperationWithProgress<_T1,_T2>^);

    template <typename _T1>
    _T1 _ProgressTypeSelector(Windows::Foundation::IAsyncActionWithProgress<_T1>^);

    template <typename _Type>
    struct _GetProgressType
    {
        typedef decltype(_ProgressTypeSelector(details::declval<_Type>())) _Value;
    };

    template <typename _Type>
    struct _IsIAsyncInfo
    {
        static constexpr bool _Value = __is_base_of(Windows::Foundation::IAsyncInfo, typename _Unhat<_Type>::_Value);
    };

    template <typename _Ty>
    _TypeSelectorAsyncOperation _AsyncOperationKindSelector(Windows::Foundation::IAsyncOperation<_Ty>^);

    _TypeSelectorAsyncAction _AsyncOperationKindSelector(Windows::Foundation::IAsyncAction^);

    template <typename _T1, typename _T2>
    _TypeSelectorAsyncOperationWithProgress _AsyncOperationKindSelector(Windows::Foundation::IAsyncOperationWithProgress<_T1, _T2>^);

    template <typename _Ty>
    _TypeSelectorAsyncActionWithProgress _AsyncOperationKindSelector(Windows::Foundation::IAsyncActionWithProgress<_Ty>^);

    template <typename _Type, bool _IsAsync = _IsIAsyncInfo<_Type>::_Value>
    struct _TaskTypeTraits
    {
        typedef typename _UnwrapTaskType<_Type>::_Type _TaskRetType;
        typedef decltype(_AsyncOperationKindSelector(details::declval<_Type>())) _AsyncKind;
        typedef typename _NormalizeVoidToUnitType<_TaskRetType>::_Type _NormalizedTaskRetType;

        static constexpr bool _IsAsyncTask = _IsAsync;
        static constexpr bool _IsUnwrappedTaskOrAsync = _IsUnwrappedAsyncSelector<_AsyncKind>::_Value;
    };

    template<typename _Type>
    struct _TaskTypeTraits<_Type, true >
    {
        typedef decltype(((_Type)nullptr)->GetResults()) _TaskRetType;
        typedef _TaskRetType _NormalizedTaskRetType;
        typedef decltype(_AsyncOperationKindSelector((_Type)nullptr)) _AsyncKind;

        static constexpr bool _IsAsyncTask = true;
        static constexpr bool _IsUnwrappedTaskOrAsync = _IsUnwrappedAsyncSelector<_AsyncKind>::_Value;
    };

#else  /* defined (__cplusplus_winrt) */
    template <typename _Type>
    struct _IsIAsyncInfo
    {
        static constexpr bool _Value = false;
    };

    template <typename _Type, bool _IsAsync = false>
    struct _TaskTypeTraits
    {
        typedef typename _UnwrapTaskType<_Type>::_Type _TaskRetType;
        typedef decltype(_AsyncOperationKindSelector(details::declval<_Type>())) _AsyncKind;
        typedef typename _NormalizeVoidToUnitType<_TaskRetType>::_Type _NormalizedTaskRetType;

        static constexpr bool _IsAsyncTask = false;
        static constexpr bool _IsUnwrappedTaskOrAsync = _IsUnwrappedAsyncSelector<_AsyncKind>::_Value;
    };
#endif  /* defined (__cplusplus_winrt) */

    template <typename _Function> auto _IsCallable(_Function _Func, int) -> decltype(_Func(), ::std::true_type());
    template <typename _Function> ::std::false_type _IsCallable(_Function, ...);

    template <>
    struct _TaskTypeTraits<void>
    {
        typedef void _TaskRetType;
        typedef _TypeSelectorNoAsync _AsyncKind;
        typedef _Unit_type _NormalizedTaskRetType;

        static constexpr bool _IsAsyncTask = false;
        static constexpr bool _IsUnwrappedTaskOrAsync = false;
    };

    struct _BadContinuationParamType{};

    template <typename _Function, typename _Type> auto _ReturnTypeHelper(_Type _Obj, _Function _Func, int, int) -> decltype(_Func(::std::declval<task<_Type>>()));
    template <typename _Function, typename _Type> auto _ReturnTypeHelper(_Type _Obj, _Function _Func, int, ...) -> decltype(_Func(_Obj));
    template <typename _Function, typename _Type> auto _ReturnTypeHelper(_Type _Obj, _Function _Func, ...) -> _BadContinuationParamType;

    template <typename _Function, typename _Type> auto _IsTaskHelper(_Type _Obj, _Function _Func, int, int) -> decltype(_Func(::std::declval<task<_Type>>()), ::std::true_type());
    template <typename _Function, typename _Type> auto _IsTaskHelper(_Type _Obj, _Function _Func, int, ...) -> ::std::false_type;

    template <typename _Function> auto _VoidReturnTypeHelper(_Function _Func, int, int) -> decltype(_Func(::std::declval<task<void>>()));
    template <typename _Function> auto _VoidReturnTypeHelper(_Function _Func, int, ...) -> decltype(_Func());

    template <typename _Function> auto _VoidIsTaskHelper(_Function _Func, int, int) -> decltype(_Func(::std::declval<task<void>>()), ::std::true_type());
    template <typename _Function> auto _VoidIsTaskHelper(_Function _Func, int, ...) -> ::std::false_type;

    template<typename _Function, typename _ExpectedParameterType>
    struct _FunctionTypeTraits
    {
        typedef decltype(_ReturnTypeHelper(details::declval<_ExpectedParameterType>(),details::declval<_Function>(), 0, 0)) _FuncRetType;
        static_assert(!::std::is_same_v<_FuncRetType, _BadContinuationParamType>, "incorrect parameter type for the callable object in 'then'; consider _ExpectedParameterType or task<_ExpectedParameterType> (see below)");

        typedef decltype(_IsTaskHelper(details::declval<_ExpectedParameterType>(),details::declval<_Function>(), 0, 0)) _Takes_task;
    };

    template<typename _Function>
    struct _FunctionTypeTraits<_Function, void>
    {
        typedef decltype(_VoidReturnTypeHelper(details::declval<_Function>(), 0, 0)) _FuncRetType;
        typedef decltype(_VoidIsTaskHelper(details::declval<_Function>(), 0, 0)) _Takes_task;
    };

#ifndef _PPLTASKS_NO_STDFUNC
    template<typename _Ty, typename _IsTaskType>
    struct _ContinuationArgTypeHelper
    {
        static_assert(::std::is_same_v<_IsTaskType, ::std::false_type>, "_IsTaskType template parameter must be std::true_type or std::false_type");
        typedef _Ty _ArgType;
    };

    template<typename _Ty>
    struct _ContinuationArgTypeHelper<_Ty, ::std::true_type>
    {
        typedef task<_Ty> _ArgType;
    };

    template<typename _RetTypeT, typename _ArgTypeT>
    struct _StdFunctionTypeHelper
    {
        typedef ::std::function<_RetTypeT __cdecl(_ArgTypeT)> _StdFuncT;
    };

    template<typename _RetTypeT>
    struct _StdFunctionTypeHelper<_RetTypeT, void>
    {
        typedef ::std::function<_RetTypeT __cdecl()> _StdFuncT;
    };
#endif

    template<typename _Function, typename _ReturnType>
    struct _ContinuationTypeTraits
    {
        typedef task<typename _TaskTypeTraits<typename _FunctionTypeTraits<_Function, _ReturnType>::_FuncRetType>::_TaskRetType> _TaskOfType;
#ifndef _PPLTASKS_NO_STDFUNC
        typedef typename _ContinuationArgTypeHelper<_ReturnType, typename details::_FunctionTypeTraits<_Function, _ReturnType>::_Takes_task>::_ArgType _ArgTypeT;
        typedef typename _FunctionTypeTraits<_Function, _ReturnType>::_FuncRetType _RetTypeT;
        typedef typename _StdFunctionTypeHelper<_RetTypeT, _ArgTypeT>::_StdFuncT _StdFuncT;
#endif
    };
    // _InitFunctorTypeTraits is used to decide whether a task constructed with a lambda should be unwrapped. Depending on how the variable is
    // declared, the constructor may or may not perform unwrapping. For eg.
    //
    //  This declaration SHOULD NOT cause unwrapping
    //    task<task<void>> t1([]() -> task<void> {
    //        task<void> t2([]() {});
    //        return t2;
    //    });
    //
    // This declaration SHOULD cause unwrapping
    //    task<void>> t1([]() -> task<void> {
    //        task<void> t2([]() {});
    //        return t2;
    //    });
    // If the type of the task is the same as the return type of the function, no unwrapping should take place. Else normal rules apply.
    template <typename _TaskType, typename _FuncRetType>
    struct _InitFunctorTypeTraits
    {
        typedef typename _TaskTypeTraits<_FuncRetType>::_AsyncKind _AsyncKind;
        static constexpr bool _IsAsyncTask = _TaskTypeTraits<_FuncRetType>::_IsAsyncTask;
        static constexpr bool _IsUnwrappedTaskOrAsync = _TaskTypeTraits<_FuncRetType>::_IsUnwrappedTaskOrAsync;
    };

    template<typename _Ty>
    struct _InitFunctorTypeTraits<_Ty, _Ty>
    {
        typedef _TypeSelectorNoAsync _AsyncKind;
        static constexpr bool _IsAsyncTask = false;
        static constexpr bool _IsUnwrappedTaskOrAsync = false;
    };

    /// <summary>
    ///     Helper object used for LWT invocation.
    /// </summary>
    struct _TaskProcThunk
    {
        _TaskProcThunk(const ::std::function<void ()> & _Callback) :
            _M_func(_Callback)
        {
        }

        static void __cdecl _Bridge(void *_PData)
        {
            _TaskProcThunk *_PThunk = reinterpret_cast<_TaskProcThunk *>(_PData);
            _Holder _ThunkHolder(_PThunk);
            _PThunk->_M_func();
        }
    private:

        // RAII holder
        struct _Holder
        {
            _Holder(_TaskProcThunk * _PThunk) : _M_pThunk(_PThunk)
            {
            }

            ~_Holder()
            {
                delete _M_pThunk;
            }

            _TaskProcThunk * _M_pThunk;

        private:
            _Holder& operator=(const _Holder&);
        };

        ::std::function<void()> _M_func;
        _TaskProcThunk& operator=(const _TaskProcThunk&);
    };

    /// <summary>
    ///     Schedule a functor with automatic inlining. Note that this is "fire and forget" scheduling, which cannot be
    ///     waited on or canceled after scheduling.
    ///     This schedule method will perform automatic inlining base on <paramref value="_InliningMode"/>.
    /// </summary>
    /// <param name="_Func">
    ///     The user functor need to be scheduled.
    /// </param>
    /// <param name="_InliningMode">
    ///     The inlining scheduling policy for current functor.
    /// </param>
    inline void _ScheduleFuncWithAutoInline(const ::std::function<void ()> & _Func, _TaskInliningMode_t _InliningMode)
    {
        _TaskCollection_t::_RunTask(&_TaskProcThunk::_Bridge, new _TaskProcThunk(_Func), _InliningMode);
    }

    class _ContextCallback
    {
        typedef ::std::function<void __cdecl ()> _CallbackFunction;

    public:

        static _ContextCallback _CaptureCurrent()
        {
            _ContextCallback _Context;
            _Context._Capture();
            return _Context;
        }

        ~_ContextCallback()
        {
            _Reset();
        }

        _ContextCallback(bool _DeferCapture = false) noexcept
        {
            if (_DeferCapture)
            {
                _M_context._M_captureMethod = _S_captureDeferred;
            }
            else
            {
                _M_context._M_pContextCallback = nullptr;
            }
        }

        // Resolves a context that was created as _S_captureDeferred based on the environment (ancestor, current context).
        void _Resolve(bool _CaptureCurrent)
        {
            if(_M_context._M_captureMethod == _S_captureDeferred)
            {
                _M_context._M_pContextCallback = nullptr;

                if (_CaptureCurrent && _IsCurrentOriginSTA())
                {
                    _Capture();
                }
            }
        }



        _ContextCallback(const _ContextCallback& _Src)
        {
            _Assign(_Src._M_context._M_pContextCallback);
        }

        _ContextCallback(_ContextCallback&& _Src) noexcept
        {
            _M_context._M_pContextCallback = _Src._M_context._M_pContextCallback;
            _Src._M_context._M_pContextCallback = nullptr;
        }

        _ContextCallback& operator=(const _ContextCallback& _Src)
        {
            if (this != &_Src)
            {
                _Reset();
                _Assign(_Src._M_context._M_pContextCallback);
            }
            return *this;
        }

        _ContextCallback& operator=(_ContextCallback&& _Src) noexcept
        {
            if (this != &_Src)
            {
                _M_context._M_pContextCallback = _Src._M_context._M_pContextCallback;
                _Src._M_context._M_pContextCallback = nullptr;
            }
            return *this;
        }

        bool _HasCapturedContext() const
        {
            _ASSERTE(_M_context._M_captureMethod != _S_captureDeferred);
            return (_M_context._M_pContextCallback != nullptr);
        }



        bool operator==(const _ContextCallback& _Rhs) const
        {
            return (_M_context._M_pContextCallback == _Rhs._M_context._M_pContextCallback);
        }

        bool operator != (const _ContextCallback& _Rhs) const
        {
            return !(operator==(_Rhs));
        }

        _CRTIMP2 void __thiscall _CallInContext(_CallbackFunction _Func, bool _IgnoreDisconnect) const;

        void _CallInContext(_CallbackFunction _Func) const
        {
            _CallInContext(_Func, false);
        }

    private:
        _CRTIMP2 void __thiscall _Reset();

        _CRTIMP2 void __thiscall _Assign(void *_PContextCallback);

        // Returns the origin information for the caller (runtime / Windows Runtime apartment as far as task continuations need know)
        _CRTIMP2 static bool __cdecl _IsCurrentOriginSTA();

        _CRTIMP2 void __thiscall _Capture();

        union
        {
            void *_M_pContextCallback; // IContextCallback *
            size_t _M_captureMethod;
        } _M_context;

        static constexpr size_t _S_captureDeferred = 1;

    };

    template<typename _Type>
    struct _ResultHolder
    {
        _ResultHolder() = default;

        void Set(const _Type& _type)
        {
            _Result = _type;
        }

        _Type Get()
        {
            return _Result;
        }

        _Type _Result;
    };

    // Special implementation of vector<bool> in STL will cause
    // race condition when multiple threads write to the result
    template<>
    struct _ResultHolder<::std::vector<bool>>
    {
        void Set(const ::std::vector<bool>& _type)
        {
            _Result.resize(_type.size());
            ::std::transform(_type.begin(), _type.end(), _Result.begin(), [](bool _Val) { return static_cast<char>(_Val); });
        }

        ::std::vector<bool> Get()
        {
            ::std::vector<bool> _Ret(_Result.size());
            ::std::transform(_Result.begin(), _Result.end(), _Ret.begin(), [](char _Val) { return _Val != 0; });
            return _Ret;
        }

        ::std::vector<char> _Result;
    };

#if defined (__cplusplus_winrt)

    template<typename _Type>
    struct _ResultHolder<_Type^>
    {
        void Set(_Type^ const & _type)
        {
           _M_Result = _type;
        }

        _Type^ Get()
        {
            return _M_Result.Get();
        }
    private:
        // ::Platform::Agile handle specialization of all hats
        // including ::Platform::String and ::Platform::Array
        ::Platform::Agile<_Type^> _M_Result;
    };

    //
    // The below are for composability with tasks auto-created from when_any / when_all / && / || constructs.
    //
    template<typename _Type>
    struct _ResultHolder<::std::vector<_Type^>>
    {
        void Set(const ::std::vector<_Type^>& _type)
        {
            _Result.reserve(_type.size());

            for (auto _PTask = _type.begin(); _PTask != _type.end(); ++_PTask)
            {
                _Result.emplace_back(*_PTask);
            }
        }

        ::std::vector<_Type^> Get()
        {
            // Return vector<T^> with the objects that are marshaled in the proper apartment
            ::std::vector<_Type^> _Return;
            _Return.reserve(_Result.size());

            for (auto _PTask = _Result.begin(); _PTask != _Result.end(); ++_PTask)
            {
                _Return.push_back(_PTask->Get()); // Platform::Agile will marshal the object to appropriate apartment if necessary
            }

            return _Return;
        }

        ::std::vector< ::Platform::Agile<_Type^>> _Result;
    };

    template<typename _Type>
    struct _ResultHolder<::std::pair<_Type^, void*>>
    {
        void Set(const ::std::pair<_Type^, size_t>& _type)
        {
            _M_Result = _type;
        }

        ::std::pair<_Type^, size_t> Get()
        {
            return ::std::make_pair(_M_Result.first.Get(), _M_Result.second);
        }
    private:
        ::std::pair< ::Platform::Agile<_Type^>, size_t> _M_Result;
    };

#endif  /* defined (__cplusplus_winrt) */

    // An exception thrown by the task body is captured in an exception holder and it is shared with all value based continuations rooted at the task.
    // The exception is 'observed' if the user invokes get()/wait() on any of the tasks that are sharing this exception holder. If the exception
    // is not observed by the time the internal object owned by the shared pointer destructs, the process will fail fast.
    struct _ExceptionHolder
    {
    private:
        // To ensure that the ReportUnhandledError DLL export is preserved, conditional error reporting via
        // _REPORT_PPLTASK_UNOBSERVED_EXCEPTION below is based on the header definition of ReportUnhandledError.
#if !defined(_CRTBLD) && defined(UNDOCKED_WINDOWS_UCRT) && !_PPL_TASK_ERROR_REPORT_ENABLED
        void ReportUnhandledError() {}
#else
        _CRTIMP2 void __thiscall ReportUnhandledError();
#endif

    public:
        explicit _ExceptionHolder(const ::std::exception_ptr& _E, const _TaskCreationCallstack &_stackTrace) :
        _M_exceptionObserved(0), _M_stdException(_E), _M_stackTrace(_stackTrace)
        {
        }

        __declspec(noinline)
        ~_ExceptionHolder()
        {
            if (_M_exceptionObserved == 0)
            {
                // If you are trapped here, it means an exception thrown in task chain didn't get handled.
                // Please add task-based continuation to handle all exceptions coming from tasks.
                // this->_M_stackTrace keeps the creation callstack of the task generates this exception.
                _REPORT_PPLTASK_UNOBSERVED_EXCEPTION();
            }
        }

        void _RethrowUserException()
        {
            if (_M_exceptionObserved == 0)
            {
                atomic_exchange(_M_exceptionObserved, 1l);
            }

            ::std::rethrow_exception(_M_stdException);
        }

        // A variable that remembers if this exception was ever rethrown into user code (and hence handled by the user). Exceptions that
        // are unobserved when the exception holder is destructed will terminate the process.
        atomic_long _M_exceptionObserved;

        // Either _M_stdException or _M_winRTException is populated based on the type of exception encountered.
        ::std::exception_ptr _M_stdException;

        // Disassembling this value will point to a source instruction right after a call instruction. If the call is to create_task,
        // a task constructor or the then method, the task created by that method is the one that encountered this exception. If the call
        // is to task_completion_event::set_exception, the set_exception method was the source of the exception.
        // DO NOT REMOVE THIS VARIABLE. It is extremely helpful for debugging.
        _TaskCreationCallstack _M_stackTrace;

    };

#if defined (__cplusplus_winrt)
    /// <summary>
    ///     Base converter class for converting asynchronous interfaces to IAsyncOperation
    /// </summary>
    template<typename _AsyncOperationType, typename _CompletionHandlerType, typename _Result>
    ref struct _AsyncInfoImpl abstract : Windows::Foundation::IAsyncOperation<_Result>
    {
    internal:
        // The async action, action with progress or operation with progress that this stub forwards to.
        ::Platform::Agile<_AsyncOperationType> _M_asyncInfo;

        Windows::Foundation::AsyncOperationCompletedHandler<_Result>^ _M_CompletedHandler;

        _AsyncInfoImpl( _AsyncOperationType _AsyncInfo ) : _M_asyncInfo(_AsyncInfo) {}

    public:
        virtual void Cancel() { _M_asyncInfo.Get()->Cancel(); }
        virtual void Close() { _M_asyncInfo.Get()->Close(); }

        virtual property Windows::Foundation::HResult ErrorCode
        {
            Windows::Foundation::HResult get()
            {
                return _M_asyncInfo.Get()->ErrorCode;
            }
        }

        virtual property UINT Id
        {
            UINT get()
            {
                return _M_asyncInfo.Get()->Id;
            }
        }

        virtual property Windows::Foundation::AsyncStatus Status
        {
            Windows::Foundation::AsyncStatus get()
            {
                return _M_asyncInfo.Get()->Status;
            }
        }

        virtual _Result GetResults() { throw ::std::runtime_error("derived class must implement"); }

        virtual property Windows::Foundation::AsyncOperationCompletedHandler<_Result>^ Completed
        {
            Windows::Foundation::AsyncOperationCompletedHandler<_Result>^ get()
            {
                return _M_CompletedHandler;
            }

            void set(Windows::Foundation::AsyncOperationCompletedHandler<_Result>^ _Value)
            {
                _M_CompletedHandler = _Value;
                _M_asyncInfo.Get()->Completed = ref new _CompletionHandlerType([&](_AsyncOperationType, Windows::Foundation::AsyncStatus _Status) {
                    _M_CompletedHandler->Invoke(this, _Status);
                });
            }
        }
    };

    /// <summary>
    ///     Class _IAsyncOperationWithProgressToAsyncOperationConverter is used to convert an instance of IAsyncOperationWithProgress<T> into IAsyncOperation<T>
    /// </summary>
    template<typename _Result, typename _Progress>
    ref struct _IAsyncOperationWithProgressToAsyncOperationConverter sealed :
        _AsyncInfoImpl<Windows::Foundation::IAsyncOperationWithProgress<_Result,_Progress>^,
                      Windows::Foundation::AsyncOperationWithProgressCompletedHandler<_Result,_Progress>,
                      _Result>
    {
    internal:
        _IAsyncOperationWithProgressToAsyncOperationConverter(Windows::Foundation::IAsyncOperationWithProgress<_Result,_Progress>^ _Operation) :
            _AsyncInfoImpl<Windows::Foundation::IAsyncOperationWithProgress<_Result,_Progress>^,
                          Windows::Foundation::AsyncOperationWithProgressCompletedHandler<_Result,_Progress>,
                          _Result>(_Operation) {}

    public:
        virtual _Result GetResults() override { return this->_M_asyncInfo.Get()->GetResults(); }
    };

    /// <summary>
    ///     Class _IAsyncActionToAsyncOperationConverter is used to convert an instance of IAsyncAction into IAsyncOperation<_Unit_type>
    /// </summary>
    ref struct _IAsyncActionToAsyncOperationConverter sealed :
        _AsyncInfoImpl<Windows::Foundation::IAsyncAction^,
                      Windows::Foundation::AsyncActionCompletedHandler,
                      details::_Unit_type>
    {
    internal:
        _IAsyncActionToAsyncOperationConverter(Windows::Foundation::IAsyncAction^ _Operation) :
            _AsyncInfoImpl<Windows::Foundation::IAsyncAction^,
                          Windows::Foundation::AsyncActionCompletedHandler,
                          details::_Unit_type>(_Operation) {}

    public:
        virtual details::_Unit_type GetResults() override
        {
            // Invoke GetResults on the IAsyncAction to allow exceptions to be thrown to higher layers before returning a dummy value.
            this->_M_asyncInfo.Get()->GetResults();
            return details::_Unit_type();
        }
    };

    /// <summary>
    ///     Class _IAsyncActionWithProgressToAsyncOperationConverter is used to convert an instance of IAsyncActionWithProgress into IAsyncOperation<_Unit_type>
    /// </summary>
    template<typename _Progress>
    ref struct _IAsyncActionWithProgressToAsyncOperationConverter sealed :
        _AsyncInfoImpl<Windows::Foundation::IAsyncActionWithProgress<_Progress>^,
                      Windows::Foundation::AsyncActionWithProgressCompletedHandler<_Progress>,
                      details::_Unit_type>
    {
    internal:
        _IAsyncActionWithProgressToAsyncOperationConverter(Windows::Foundation::IAsyncActionWithProgress<_Progress>^ _Action) :
            _AsyncInfoImpl<Windows::Foundation::IAsyncActionWithProgress<_Progress>^,
                          Windows::Foundation::AsyncActionWithProgressCompletedHandler<_Progress>,
                          details::_Unit_type>(_Action) {}
    public:
        virtual details::_Unit_type GetResults() override
        {
            // Invoke GetResults on the IAsyncActionWithProgress to allow exceptions to be thrown before returning a dummy value.
            this->_M_asyncInfo.Get()->GetResults();
            return details::_Unit_type();
        }
    };
#endif  /* defined (__cplusplus_winrt) */
} // namespace details

/// <summary>
///     The <c>task_continuation_context</c> class allows you to specify where you would like a continuation to be executed.
///     It is only useful to use this class from a Windows Store app. For non-Windows Store apps, the task continuation's
///     execution context is determined by the runtime, and not configurable.
/// </summary>
/// <seealso cref="task Class"/>
/**/
class task_continuation_context : public details::_ContextCallback
{
public:

    /// <summary>
    ///     Creates the default task continuation context.
    /// </summary>
    /// <returns>
    ///     The default continuation context.
    /// </returns>
    /// <remarks>
    ///     The default context is used if you don't specify a continuation context when you call the <c>then</c> method. In Windows
    ///     applications for Windows 7 and below, as well as desktop applications on Windows 8 and higher, the runtime determines where
    ///     task continuations will execute. However, in a Windows Store app, the default continuation context for a continuation on an
    ///     apartment aware task is the apartment where <c>then</c> is invoked.
    ///     <para>An apartment aware task is a task that unwraps a Windows Runtime <c>IAsyncInfo</c> interface, or a task that is descended from such
    ///     a task. Therefore, if you schedule a continuation on an apartment aware task in a Windows Runtime STA, the continuation will execute in
    ///     that STA.</para>
    ///     <para>A continuation on a non-apartment aware task will execute in a context the Runtime chooses.</para>
    /// </remarks>
    /**/
    static task_continuation_context use_default()
    {
        return task_continuation_context{_Tag{}};
    }

    /// <summary>
    ///     Returns a task continuation context object that represents the current winrt thread context.
    /// </summary>
    /// <returns>
    ///     The current winrt thread context.
    /// </returns>
    /// <remarks>
    ///     This method captures the current caller's Windows Runtime thread context.
    ///     It is very similar to what <c>task_continuation_context::use_current()</c> is doing except it is also available without C++/Cx extension support.
    ///     Please approach this method with caution as it is designed for advanced users writing C++/Cx agnostic library code.
    ///     <c>task_continuation_context::use_current()</c> will give you more protection from mistakes.
    ///     <para>This method is only available to Windows Store apps.</para>
    /// </remarks>
    /**/
    static task_continuation_context get_current_winrt_context()
    {
        task_continuation_context _Current{_Tag{}};
        _Current._Resolve(true);
        return _Current;
    }

#if defined(__cplusplus_winrt) || defined(PPL_TASK_CONTEXT_ERROR_CONTROL)
    /// <summary>
    ///     Creates a task continuation context which allows the Runtime to choose the execution context for a continuation.
    /// </summary>
    /// <returns>
    ///     A task continuation context that represents an arbitrary location.
    /// </returns>
    /// <remarks>
    ///     When this continuation context is used the continuation will execute in a context the runtime chooses even if the antecedent task
    ///     is apartment aware.
    ///     <para><c>use_arbitrary</c> can be used to turn off the default behavior for a continuation on an apartment
    ///     aware task created in an STA. </para>
    ///     <para>This method is only available to Windows Store apps.</para>
    /// </remarks>
    /**/
    static task_continuation_context use_arbitrary()
    {
        task_continuation_context _Arbitrary{_Tag{}};
        _Arbitrary._Resolve(false);
        return _Arbitrary;
    }

    /// <summary>
    ///     Returns a task continuation context object that represents the current execution context.
    /// </summary>
    /// <returns>
    ///     The current execution context.
    /// </returns>
    /// <remarks>
    ///     This method captures the caller's Windows Runtime context so that continuations can be executed in the right apartment.
    ///     <para>The value returned by <c>use_current</c> can be used to indicate to the Runtime that the continuation should execute in
    ///     the captured context (STA vs MTA) regardless of whether or not the antecedent task is apartment aware. An apartment aware task is
    ///     a task that unwraps a Windows Runtime <c>IAsyncInfo</c> interface, or a task that is descended from such a task. </para>
    ///     <para>This method is only available to Windows Store apps.</para>
    /// </remarks>
    /**/
    static task_continuation_context use_current()
    {
        return get_current_winrt_context();
    }
#endif

    /// <summary>
    ///     Returns a task continuation context object that represents the synchronous execution context.
    /// </summary>
    /// <returns>
    ///     The synchronous execution context.
    /// </returns>
    /// <remarks>
    ///     This method will force the continuation task synchronously running on the context causing its antecedent task's completion;
    ///     if the antecedent task has completed when the continuation is attached, the continuation will synchronously run on the context
    ///     that attaches the continuation.
    /// </remarks>
    /**/
    static task_continuation_context use_synchronous_execution()
    {
        task_continuation_context _Current{_Tag{}};
        _Current._Resolve(false);
        _Current._M_RunInline = true;
        return _Current;
    }

    bool _ForceInline() const
    {
        return _M_RunInline;
    }

private:
    _CRTIMP2 __thiscall task_continuation_context();
#if defined(UNDOCKED_WINDOWS_UCRT) || _PPL_TASK_CONTEXT_CONTROL_ENABLED
    explicit task_continuation_context(bool _Enable_context) : _ContextCallback(_Enable_context), _M_RunInline(false)
    {
    }
#endif
    // To ensure that the task_continuation_context ctor DLL export is preserved, conditional context behavior for the ctor
    // calls above is achieved with the tag dispatched ctor overload below, which forwards to the appropriate exported ctor.
    struct _Tag {};
#if !defined(_CRTBLD) && _PPL_TASK_CONTEXT_CONTROL_ENABLED && !defined(_PPL_TASK_FORCE_DEFAULT_CTOR)
    explicit task_continuation_context(_Tag) : task_continuation_context(_PPL_TASK_CONTEXT_CONTROL_ENABLED) {}
#else
    explicit task_continuation_context(_Tag) : task_continuation_context() {}
#endif

    bool _M_RunInline; // default, it's false
};

class task_options;
namespace details
{
    struct _Internal_task_options
    {
        bool _M_hasPresetCreationCallstack;
        _TaskCreationCallstack _M_presetCreationCallstack;

        void _set_creation_callstack(const _TaskCreationCallstack &_callstack)
        {
            _M_hasPresetCreationCallstack = true;
            _M_presetCreationCallstack = _callstack;
        }
        _Internal_task_options()
        {
            _M_hasPresetCreationCallstack = false;
        }
    };

    inline _Internal_task_options &_get_internal_task_options(task_options &_Options);
    inline const _Internal_task_options &_get_internal_task_options(const task_options &_Options);
}
/// <summary>
///     Represents the allowed options for creating a task
/// </summary>
class task_options
{
public:


    /// <summary>
    ///     Default list of task creation options
    /// </summary>
    task_options()
        : _M_Scheduler(get_ambient_scheduler()),
          _M_CancellationToken(cancellation_token::none()),
          _M_ContinuationContext(task_continuation_context::use_default()),
          _M_HasCancellationToken(false),
          _M_HasScheduler(false)
    {
    }

    /// <summary>
    ///     Task option that specify a cancellation token
    /// </summary>
    task_options(cancellation_token _Token)
        : _M_Scheduler(get_ambient_scheduler()),
          _M_CancellationToken(_Token),
          _M_ContinuationContext(task_continuation_context::use_default()),
          _M_HasCancellationToken(true),
          _M_HasScheduler(false)
    {
    }

    /// <summary>
    ///     Task option that specify a continuation context. This is valid only for continuations (then)
    /// </summary>
    task_options(task_continuation_context _ContinuationContext)
        : _M_Scheduler(get_ambient_scheduler()),
          _M_CancellationToken(cancellation_token::none()),
          _M_ContinuationContext(_ContinuationContext),
          _M_HasCancellationToken(false),
          _M_HasScheduler(false)
    {
    }

    /// <summary>
    ///     Task option that specify a cancellation token and a continuation context. This is valid only for continuations (then)
    /// </summary>
    task_options(cancellation_token _Token, task_continuation_context _ContinuationContext)
        : _M_Scheduler(get_ambient_scheduler()),
          _M_CancellationToken(_Token),
          _M_ContinuationContext(_ContinuationContext),
          _M_HasCancellationToken(true),
          _M_HasScheduler(false)
    {
    }

    /// <summary>
    ///     Task option that specify a scheduler with shared lifetime
    /// </summary>
    template<typename _SchedType>
    task_options(::std::shared_ptr<_SchedType> _Scheduler)
        : _M_Scheduler(::std::move(_Scheduler)),
          _M_CancellationToken(cancellation_token::none()),
          _M_ContinuationContext(task_continuation_context::use_default()),
          _M_HasCancellationToken(false),
          _M_HasScheduler(true)
    {
    }

    /// <summary>
    ///     Task option that specify a scheduler reference
    /// </summary>
    task_options(scheduler_interface& _Scheduler)
        : _M_Scheduler(&_Scheduler),
          _M_CancellationToken(cancellation_token::none()),
          _M_ContinuationContext(task_continuation_context::use_default()),
          _M_HasCancellationToken(false),
          _M_HasScheduler(true)
    {
    }

    /// <summary>
    ///     Task option that specify a scheduler
    /// </summary>
    task_options(scheduler_ptr _Scheduler)
        : _M_Scheduler(::std::move(_Scheduler)),
          _M_CancellationToken(cancellation_token::none()),
          _M_ContinuationContext(task_continuation_context::use_default()),
          _M_HasCancellationToken(false),
          _M_HasScheduler(true)
    {
    }

    /// <summary>
    ///     Task option copy constructor
    /// </summary>
    task_options(const task_options& _TaskOptions)
        : _M_Scheduler(_TaskOptions.get_scheduler()),
          _M_CancellationToken(_TaskOptions.get_cancellation_token()),
          _M_ContinuationContext(_TaskOptions.get_continuation_context()),
          _M_HasCancellationToken(_TaskOptions.has_cancellation_token()),
          _M_HasScheduler(_TaskOptions.has_scheduler())
    {
    }

    /// <summary>
    ///     Sets the given token in the options
    /// </summary>
    void set_cancellation_token(cancellation_token _Token)
    {
        _M_CancellationToken = _Token;
       _M_HasCancellationToken = true;
    }

    /// <summary>
    ///     Sets the given continuation context in the options
    /// </summary>
    void set_continuation_context(task_continuation_context _ContinuationContext)
    {
        _M_ContinuationContext = _ContinuationContext;
    }

    /// <summary>
    ///     Indicates whether a cancellation token was specified by the user
    /// </summary>
    bool has_cancellation_token() const
    {
        return _M_HasCancellationToken;
    }

    /// <summary>
    ///     Returns the cancellation token
    /// </summary>
    cancellation_token get_cancellation_token() const
    {
        return _M_CancellationToken;
    }

    /// <summary>
    ///     Returns the continuation context
    /// </summary>
    task_continuation_context get_continuation_context() const
    {
        return _M_ContinuationContext;
    }

    /// <summary>
    ///     Indicates whether a scheduler n was specified by the user
    /// </summary>
    bool has_scheduler() const
    {
        return _M_HasScheduler;
    }

    /// <summary>
    ///     Returns the scheduler
    /// </summary>
    scheduler_ptr get_scheduler() const
    {
        return _M_Scheduler;
    }

private:

    task_options const& operator=(task_options const& _Right);
    friend details::_Internal_task_options &details::_get_internal_task_options(task_options &);
    friend const details::_Internal_task_options &details::_get_internal_task_options(const task_options &);

    scheduler_ptr _M_Scheduler;
    cancellation_token _M_CancellationToken;
    task_continuation_context _M_ContinuationContext;
    details::_Internal_task_options _M_InternalTaskOptions;
    bool _M_HasCancellationToken;
    bool _M_HasScheduler;
};

namespace details
{

    /// _ThenImplOptions contains state variables used when calling the internal _ThenImpl function.
    /// This is a non-templated object that was introduced to reduce the generated code size of PPLTasks continuations.
    struct _ThenImplOptions
    {
        _ThenImplOptions(_CancellationTokenState *_Token_state, const task_continuation_context* _Continuation_context,
            scheduler_ptr _PScheduler, _TaskCreationCallstack _Creation_stack, _TaskInliningMode_t _Inlining_mode = _NoInline) :
            _PTokenState(_Token_state), _Scheduler(_PScheduler), _CreationStack(_Creation_stack), _InliningMode(_Inlining_mode),
            _PContinuationContext(const_cast<task_continuation_context*>(_Continuation_context)) {}

        _CancellationTokenState *_PTokenState;
        scheduler_ptr _Scheduler;
        _TaskCreationCallstack _CreationStack;
        _TaskInliningMode_t _InliningMode;
        task_continuation_context* _PContinuationContext;

        static _ThenImplOptions _CreateOptions(const task_options& _Task_Options, const task_continuation_context& _ContinuationContext,
            const scheduler_ptr& impl_scheduler)
        {
            _CancellationTokenState *_TokenState = _Task_Options.has_cancellation_token() ?
                _Task_Options.get_cancellation_token()._GetImplValue() : nullptr;
            auto _Scheduler = _Task_Options.has_scheduler() ? _Task_Options.get_scheduler() : impl_scheduler;
            auto _InliningMode = _Task_Options.get_continuation_context()._ForceInline() ? details::_ForceInline : details::_NoInline;

            auto _Task_Options_Int = details::_get_internal_task_options(_Task_Options);
            auto _CreationStack = _Task_Options_Int._M_hasPresetCreationCallstack ?
                _Task_Options_Int._M_presetCreationCallstack : details::_TaskCreationCallstack();

            return _ThenImplOptions(_TokenState, &_ContinuationContext, _Scheduler, _CreationStack,_InliningMode);
        }
    };

    inline _Internal_task_options & _get_internal_task_options(task_options &_Options)
    {
        return _Options._M_InternalTaskOptions;
    }
    inline const _Internal_task_options & _get_internal_task_options(const task_options &_Options)
    {
        return _Options._M_InternalTaskOptions;
    }

    struct _Task_impl_base;
    template<typename _ReturnType> struct _Task_impl;

    template<typename _ReturnType>
    struct _Task_ptr
    {
        typedef ::std::shared_ptr<_Task_impl<_ReturnType>> _Type;
        static _Type _Make(_CancellationTokenState * _Ct, scheduler_ptr _Scheduler_arg) { return ::std::make_shared<_Task_impl<_ReturnType>>(_Ct, _Scheduler_arg); }
    };

    typedef _TaskCollection_t::_TaskProcHandle_t _UnrealizedChore_t;
    typedef ::std::shared_ptr<_Task_impl_base> _Task_ptr_base;

    // The weak-typed base task handler for continuation tasks.
    struct _ContinuationTaskHandleBase : _UnrealizedChore_t
    {
        _ContinuationTaskHandleBase * _M_next;
        task_continuation_context _M_continuationContext;
        bool _M_isTaskBasedContinuation;

        // This field gives inlining scheduling policy for current chore.
        _TaskInliningMode_t _M_inliningMode;

        virtual _Task_ptr_base _GetTaskImplBase() const = 0;

        _ContinuationTaskHandleBase() :
            _M_next(nullptr), _M_continuationContext(task_continuation_context::use_default()), _M_isTaskBasedContinuation(false), _M_inliningMode(details::_NoInline)
        {
        }

        virtual ~_ContinuationTaskHandleBase() {}
    };

#if _PPLTASK_ASYNC_LOGGING

    // Stateful logger rests inside task_impl_base.
    struct _TaskEventLogger
    {
        _Task_impl_base *_M_task;
        bool _M_scheduled;
        bool _M_taskPostEventStarted;

        // Log before scheduling task
        _CRTIMP2 void __thiscall _LogScheduleTask(bool _isContinuation);

        // It will log the cancel event but not canceled state. _LogTaskCompleted will log the terminal state, which includes cancel state.
        _CRTIMP2 void __thiscall _LogCancelTask();

        // Log when task reaches terminal state. Note: the task can reach a terminal state (by cancellation or exception) without having run
        _CRTIMP2 void __thiscall _LogTaskCompleted();

        // Log when task body (which includes user lambda and other scheduling code) begin to run
        void _LogTaskExecutionStarted() { }

        // Log when task body finish executing
        _CRTIMP2 void __thiscall _LogTaskExecutionCompleted();

        // Log right before user lambda being invoked
        _CRTIMP2 void __thiscall _LogWorkItemStarted();

        // Log right after user lambda being invoked
        _CRTIMP2 void __thiscall _LogWorkItemCompleted();

        _TaskEventLogger(_Task_impl_base *_task): _M_task(_task)
        {
            _M_scheduled = false;
            _M_taskPostEventStarted = false;
        }
    };

    // Exception safe logger for user lambda
    struct _TaskWorkItemRAIILogger
    {
        _TaskEventLogger &_M_logger;
        _TaskWorkItemRAIILogger(_TaskEventLogger &_taskHandleLogger): _M_logger(_taskHandleLogger)
        {
            _M_logger._LogWorkItemStarted();
        }

        ~_TaskWorkItemRAIILogger()
        {
            _M_logger._LogWorkItemCompleted();
        }
        _TaskWorkItemRAIILogger &operator =(const _TaskWorkItemRAIILogger &); // cannot be assigned
    };

#else
    inline void _LogCancelTask(_Task_impl_base *) {}
    struct _TaskEventLogger
    {
        void _LogScheduleTask(bool) {}
        void _LogCancelTask() {}
        void _LogWorkItemStarted() {}
        void _LogWorkItemCompleted() {}
        void _LogTaskExecutionStarted() {}
        void _LogTaskExecutionCompleted() {}
        void _LogTaskCompleted() {}
        _TaskEventLogger(_Task_impl_base *) {}
    };
    struct _TaskWorkItemRAIILogger
    {
        _TaskWorkItemRAIILogger(_TaskEventLogger &) {}
    };
#endif

    /// <summary>
    ///     The _PPLTaskHandle is the strong-typed task handle base. All user task functions need to be wrapped in this task handler
    ///     to be executable by PPL. By deriving from a different _BaseTaskHandle, it can be used for both initial tasks and continuation tasks.
    ///     For initial tasks, _PPLTaskHandle will be derived from _UnrealizedChore_t, and for continuation tasks, it will be derived from
    ///     _ContinuationTaskHandleBase. The life time of the _PPLTaskHandle object is be managed by runtime if task handle is scheduled.
    /// </summary>
    /// <typeparam name="_ReturnType">
    ///     The result type of the _Task_impl.
    /// </typeparam>
    /// <typeparam name="_DerivedTaskHandle">
    ///     The derived task handle class. The <c>operator ()</c> needs to be implemented.
    /// </typeparam>
    /// <typeparam name="_BaseTaskHandle">
    ///     The base class from which _PPLTaskHandle should be derived. This is either _UnrealizedChore_t or _ContinuationTaskHandleBase.
    /// </typeparam>
    template<typename _ReturnType, typename _DerivedTaskHandle, typename _BaseTaskHandle>
    struct _PPLTaskHandle : _BaseTaskHandle
    {
        _PPLTaskHandle(const typename _Task_ptr<_ReturnType>::_Type & _PTask) : _M_pTask(_PTask)
        {
        }

        virtual ~_PPLTaskHandle()
        {
            // Here is the sink of all task completion code paths
            _M_pTask->_M_taskEventLogger._LogTaskCompleted();
        }

        virtual void invoke() const
        {
            // All exceptions should be rethrown to finish cleanup of the task collection. They will be caught and handled
            // by the runtime.
            _ASSERTE((bool)_M_pTask);
            if (!_M_pTask->_TransitionedToStarted())
            {
                static_cast<const _DerivedTaskHandle *>(this)->_SyncCancelAndPropagateException();
                return;
            }

            _M_pTask->_M_taskEventLogger._LogTaskExecutionStarted();

            _TRY_BEGIN
            // All derived task handle must implement this contract function.
            static_cast<const _DerivedTaskHandle *>(this)->_Perform();
            _CATCH(const task_canceled &)
            _M_pTask->_Cancel(true);
            _CATCH(const _Interruption_exception &)
            _M_pTask->_Cancel(true);
            _CATCH_ALL
            _M_pTask->_CancelWithException(::std::current_exception());
            _CATCH_END
            _M_pTask->_M_taskEventLogger._LogTaskExecutionCompleted();
        }

        // Cast _M_pTask pointer to "type-less" _Task_impl_base pointer, which can be used in _ContinuationTaskHandleBase.
        // The return value should be automatically optimized by R-value ref.
        _Task_ptr_base _GetTaskImplBase() const
        {
            return _M_pTask;
        }

        typename _Task_ptr<_ReturnType>::_Type _M_pTask;
    private:
        _PPLTaskHandle const & operator=(_PPLTaskHandle const&);    // no assignment operator
    };

    /// <summary>
    ///     The base implementation of a first-class task. This class contains all the non-type specific
    ///     implementation details of the task.
    /// </summary>
    /**/
    struct _Task_impl_base
    {
        enum _TaskInternalState
        {
            // Tracks the state of the task, rather than the task collection on which the task is scheduled
            _Created,
            _Started,
            _PendingCancel,
            _Completed,
            _Canceled
        };

#pragma warning(push)
#pragma warning(disable : 4355) // 'this': used in base member initializer list (/Wall)
        _Task_impl_base(_CancellationTokenState * _PTokenState, scheduler_ptr _Scheduler_arg)
                          : _M_TaskState(_Created),
                            _M_fFromAsync(false), _M_fUnwrappedTask(false),
                            _M_Continuations(nullptr), _M_pRegistration(nullptr), _M_TaskCollection(_Scheduler_arg),
                            _M_taskEventLogger(this)
        {
            // Set cancellation token
            _M_pTokenState = _PTokenState;
            _ASSERTE(_M_pTokenState != nullptr);
            if (_M_pTokenState != _CancellationTokenState::_None())
                _M_pTokenState->_Reference();
        }
#pragma warning(pop)

        virtual ~_Task_impl_base()
        {
            _ASSERTE(_M_pTokenState != nullptr);
            if (_M_pTokenState != _CancellationTokenState::_None())
            {
                _M_pTokenState->_Release();
            }
        }

        task_status _Wait()
        {
            bool _DoWait = true;

#if (_PPL_TASK_CONTEXT_CONTROL_ENABLED)
            if (_IsNonBlockingThread())
            {
                // In order to prevent Windows Runtime STA threads from blocking the UI, calling task.wait() task.get() is illegal
                // if task has not been completed.
                if (!_IsCompleted() && !_IsCanceled())
                {
                    _THROW(invalid_operation("Illegal to wait on a task in a Windows Runtime STA"));
                }
                else
                {
                    // Task Continuations are 'scheduled' *inside* the chore that is executing on the ancestor's task group. If a continuation
                    // needs to be marshalled to a different apartment instead of scheduling, we make a synchronous cross-apartment COM
                    // call to execute the continuation. If it then happens to do something which waits on the ancestor (say it calls .get(),
                    // which task based continuations are wont to do), waiting on the task group results in waiting on the chore that is making
                    // this synchronous callback, which causes a deadlock. To avoid this, we test the state of the ancestor's event,
                    // and we will NOT wait on it if it has finished execution (which means now we are in the inline synchronous callback).
                    _DoWait = false;
                }
            }
#endif

            if (_DoWait)
            {
                // If this task was created from a Windows Runtime async operation, do not attempt to inline it. The
                // async operation will take place on a thread in the appropriate apartment Simply wait for the completed
                // event to be set.
                if (_M_fFromAsync)
                {
                    _M_TaskCollection._Wait();
                }
                else
                {
                    // Wait on the task collection to complete. The task collection is guaranteed to still be
                    // valid since the task must be still within scope so that the _Task_impl_base destructor
                    // has not yet been called. This call to _Wait potentially inlines execution of work.
                    _TRY_BEGIN
                    // Invoking wait on a task collection resets the state of the task collection. This means that
                    // if the task collection itself were canceled, or had encountered an exception, only the first
                    // call to wait will receive this status. However, both cancellation and exceptions flowing through
                    // tasks set state in the task impl itself.

                    // When it returns cancelled, either work chore or the cancel thread should already have set task's state
                    // properly -- cancelled state or completed state (because there was no interruption point).
                    // For tasks with unwrapped tasks, we should not change the state of current task, since the unwrapped task are still running.
                    _M_TaskCollection._RunAndWait();
                    _CATCH(details::_Interruption_exception&)
                    // The _TaskCollection will never be an interruption point since it has a none token.
                    _ASSERTE(false);
                    _CATCH(task_canceled&)
                    // task_canceled is a special exception thrown by cancel_current_task. The spec states that cancel_current_task
                    // must be called from code that is executed within the task (throwing it from parallel work created by and waited
                    // upon by the task is acceptable). We can safely assume that the task wrapper _PPLTaskHandle::operator() has seen
                    // the exception and canceled the task. Swallow the exception here.
                    _ASSERTE(_IsCanceled());
                    _CATCH_ALL
                    // It's possible the task body hasn't seen the exception; if so we need to cancel with exception here.
                    if(!_HasUserException())
                    {
                        _CancelWithException(::std::current_exception());
                    }
                    // Rethrow will mark the exception as observed.
                    _M_exceptionHolder->_RethrowUserException();
                    _CATCH_END

                    // If the lambda body for this task (executed or waited upon in _RunAndWait above) happened to return a task
                    // which is to be unwrapped and plumbed to the output of this task, we must not only wait on the lambda body, we must
                    // wait on the **INNER** body. It is in theory possible that we could inline such if we plumb a series of things through;
                    // however, this simply waits upon the completion signal.
                    if (_M_fUnwrappedTask)
                    {
                        _M_TaskCollection._Wait();
                    }
                }
            }

            if (_HasUserException())
            {
                _M_exceptionHolder->_RethrowUserException();
            }
            else if (_IsCanceled())
            {
                return canceled;
            }
            _ASSERTE(_IsCompleted());
            return completed;
        }

        /// <summary>
        ///     Requests cancellation on the task and schedules continuations if the task can be transitioned to a terminal state.
        /// </summary>
        /// <param name="_SynchronousCancel">
        ///     Set to true if the cancel takes place as a result of the task body encountering an exception, or because an ancestor or task_completion_event the task
        ///     was registered with were canceled with an exception. A synchronous cancel is one that assures the task could not be running on a different thread at
        ///     the time the cancellation is in progress. An asynchronous cancel is one where the thread performing the cancel has no control over the thread that could
        ///     be executing the task, that is the task could execute concurrently while the cancellation is in progress.
        /// </param>
        /// <param name="_UserException">
        ///     Whether an exception other than the internal runtime cancellation exceptions caused this cancellation.
        /// </param>
        /// <param name="_PropagatedFromAncestor">
        ///     Whether this exception came from an ancestor task or a task_completion_event as opposed to an exception that was encountered by the task itself. Only valid when
        ///     _UserException is set to true.
        /// </param>
        /// <param name="_ExHolder">
        ///     The exception holder that represents the exception. Only valid when _UserException is set to true.
        /// </param>
        virtual bool _CancelAndRunContinuations(bool _SynchronousCancel, bool _UserException, bool _PropagatedFromAncestor, const ::std::shared_ptr<_ExceptionHolder>& _ExHolder) = 0;

        bool _Cancel(bool _SynchronousCancel)
        {
            // Send in a dummy value for exception. It is not used when the first parameter is false.
            return _CancelAndRunContinuations(_SynchronousCancel, false, false, _M_exceptionHolder);
        }

        bool _CancelWithExceptionHolder(const ::std::shared_ptr<_ExceptionHolder>& _ExHolder, bool _PropagatedFromAncestor)
        {
            // This task was canceled because an ancestor task encountered an exception.
            return _CancelAndRunContinuations(true, true, _PropagatedFromAncestor, _ExHolder);
        }

        bool _CancelWithException(const ::std::exception_ptr& _Exception)
        {
            // This task was canceled because the task body encountered an exception.
            _ASSERTE(!_HasUserException());
            return _CancelAndRunContinuations(true, true, false, ::std::make_shared<_ExceptionHolder>(_Exception, _GetTaskCreationCallstack()));
        }

        void _RegisterCancellation(::std::weak_ptr<_Task_impl_base> _WeakPtr)
        {
            _ASSERTE(details::_CancellationTokenState::_IsValid(_M_pTokenState));

            auto _CancellationCallback = [_WeakPtr](){
                // Taking ownership of the task prevents dead lock during destruction
                // if the destructor waits for the cancellations to be finished
                auto _task = _WeakPtr.lock();
                if (_task != nullptr)
                    _task->_Cancel(false);
            };

            _M_pRegistration = new details::_CancellationTokenCallback<decltype(_CancellationCallback)>(_CancellationCallback);
            _M_pTokenState->_RegisterCallback(_M_pRegistration);
        }

        void _DeregisterCancellation()
        {
            if (_M_pRegistration != nullptr)
            {
                _M_pTokenState->_DeregisterCallback(_M_pRegistration);
                _M_pRegistration->_Release();
                _M_pRegistration = nullptr;
            }
        }

        bool _IsCreated()
        {
            return (_M_TaskState == _Created);
        }

        bool _IsStarted()
        {
            return (_M_TaskState == _Started);
        }

        bool _IsPendingCancel()
        {
            return (_M_TaskState == _PendingCancel);
        }

        bool _IsCompleted()
        {
            return (_M_TaskState == _Completed);
        }

        bool _IsCanceled()
        {
            return (_M_TaskState == _Canceled);
        }

        bool _HasUserException()
        {
            return static_cast<bool>(_M_exceptionHolder);
        }

        const ::std::shared_ptr<_ExceptionHolder>& _GetExceptionHolder()
        {
            _ASSERTE(_HasUserException());
            return _M_exceptionHolder;
        }

        bool _IsApartmentAware()
        {
            return _M_fFromAsync;
        }

        void _SetAsync(bool _Async = true)
        {
            _M_fFromAsync = _Async;
        }

        _TaskCreationCallstack _GetTaskCreationCallstack()
        {
            return _M_pTaskCreationCallstack;
        }

        void _SetTaskCreationCallstack(const _TaskCreationCallstack &_Callstack)
        {
            _M_pTaskCreationCallstack = _Callstack;
        }

        /// <summary>
        ///     Helper function to schedule the task on the Task Collection.
        /// </summary>
        /// <param name="_PTaskHandle">
        ///     The task chore handle that need to be executed.
        /// </param>
        /// <param name="_InliningMode">
        ///     The inlining scheduling policy for current _PTaskHandle.
        /// </param>
        void _ScheduleTask(_UnrealizedChore_t * _PTaskHandle, _TaskInliningMode_t _InliningMode)
        {
            _TRY_BEGIN
            _M_TaskCollection._ScheduleTask(_PTaskHandle, _InliningMode);
            _CATCH(const task_canceled &)
            // task_canceled is a special exception thrown by cancel_current_task. The spec states that cancel_current_task
            // must be called from code that is executed within the task (throwing it from parallel work created by and waited
            // upon by the task is acceptable). We can safely assume that the task wrapper _PPLTaskHandle::operator() has seen
            // the exception and canceled the task. Swallow the exception here.
            _ASSERTE(_IsCanceled());
            _CATCH(const _Interruption_exception &)
            // The _TaskCollection will never be an interruption point since it has a none token.
            _ASSERTE(false);
            _CATCH_ALL
            // The exception could have come from two places:
            //   1. From the chore body, so it already should have been caught and canceled.
            //      In this case swallow the exception.
            //   2. From trying to actually schedule the task on the scheduler.
            //      In this case cancel the task with the current exception, otherwise the
            //      task will never be signaled leading to deadlock when waiting on the task.

            if (!_HasUserException())
            {
                _CancelWithException(::std::current_exception());
            }
            _CATCH_END
        }

        /// <summary>
        ///     Function executes a continuation. This function is recorded by a parent task implementation
        ///     when a continuation is created in order to execute later.
        /// </summary>
        /// <param name="_PTaskHandle">
        ///     The continuation task chore handle that need to be executed.
        /// </param>
        /**/
        void _RunContinuation(_ContinuationTaskHandleBase * _PTaskHandle)
        {
            _Task_ptr_base _ImplBase = _PTaskHandle->_GetTaskImplBase();
            if (_IsCanceled() && !_PTaskHandle->_M_isTaskBasedContinuation)
            {
                if (_HasUserException())
                {
                    // If the ancestor encountered an exception, transfer the exception to the continuation
                    // This traverses down the tree to propagate the exception.
                    _ImplBase->_CancelWithExceptionHolder(_GetExceptionHolder(), true);
                }
                else
                {
                    // If the ancestor was canceled, then your own execution should be canceled.
                    // This traverses down the tree to cancel it.
                    _ImplBase->_Cancel(true);
                }
            }
            else
            {
                // This can only run when the ancestor has completed or it's a task based continuation that fires when a task is canceled
                // (with or without a user exception).
                _ASSERTE(_IsCompleted() || _PTaskHandle->_M_isTaskBasedContinuation);
                _ASSERTE(!_ImplBase->_IsCanceled());
                return _ImplBase->_ScheduleContinuationTask(_PTaskHandle);
            }

            // If the handle is not scheduled, we need to manually delete it.
            delete _PTaskHandle;
        }

        // Schedule a continuation to run
        void _ScheduleContinuationTask(_ContinuationTaskHandleBase * _PTaskHandle)
        {

            _M_taskEventLogger._LogScheduleTask(true);
            // Ensure that the continuation runs in proper context (this might be on a Concurrency Runtime thread or in a different Windows Runtime apartment)
            if (_PTaskHandle->_M_continuationContext._HasCapturedContext())
            {
                // For those continuations need to be scheduled inside captured context, we will try to apply automatic inlining to their inline modes,
                // if they haven't been specified as _ForceInline yet. This change will encourage those continuations to be executed inline so that reduce
                // the cost of marshaling.
                // For normal continuations we won't do any change here, and their inline policies are completely decided by ._ThenImpl method.
                if (_PTaskHandle->_M_inliningMode != details::_ForceInline)
                {
                    _PTaskHandle->_M_inliningMode = details::_DefaultAutoInline;
                }
                _ScheduleFuncWithAutoInline([_PTaskHandle]() {
                    // Note that we cannot directly capture "this" pointer, instead, we should use _TaskImplPtr, a shared_ptr to the _Task_impl_base.
                    // Because "this" pointer will be invalid as soon as _PTaskHandle get deleted. _PTaskHandle will be deleted after being scheduled.
                    auto _TaskImplPtr = _PTaskHandle->_GetTaskImplBase();
                    if (details::_ContextCallback::_CaptureCurrent() == _PTaskHandle->_M_continuationContext)
                    {
                        _TaskImplPtr->_ScheduleTask(_PTaskHandle, details::_ForceInline);
                    }
                    else
                    {
                        //
                        // It's entirely possible that the attempt to marshal the call into a differing context will fail. In this case, we need to handle
                        // the exception and mark the continuation as canceled with the appropriate exception. There is one slight hitch to this:
                        //
                        // NOTE: COM's legacy behavior is to swallow SEH exceptions and marshal them back as HRESULTS. This will in effect turn an SEH into
                        // a C++ exception that gets tagged on the task. One unfortunate result of this is that various pieces of the task infrastructure will
                        // not be in a valid state after this in /EHsc (due to the lack of destructors running, etc...).
                        //
                        _TRY_BEGIN
                        _PTaskHandle->_M_continuationContext._CallInContext( [_PTaskHandle, _TaskImplPtr](){
                            _TaskImplPtr->_ScheduleTask(_PTaskHandle, details::_ForceInline);
                        });
                        _CATCH_ALL
                        _TaskImplPtr->_CancelWithException(::std::current_exception());
                        _CATCH_END
                    }
                }, _PTaskHandle->_M_inliningMode);
            }
            else
            {
                _ScheduleTask(_PTaskHandle, _PTaskHandle->_M_inliningMode);
            }
        }

        /// <summary>
        ///     Schedule the actual continuation. This will either schedule the function on the continuation task's implementation
        ///     if the task has completed or append it to a list of functions to execute when the task actually does complete.
        /// </summary>
        /// <typeparam name="_FuncInputType">
        ///     The input type of the task.
        /// </typeparam>
        /// <typeparam name="_FuncOutputType">
        ///     The output type of the task.
        /// </typeparam>
        /**/
        void _ScheduleContinuation(_ContinuationTaskHandleBase * _PTaskHandle)
        {
            enum { _Nothing, _Schedule, _Cancel, _CancelWithException } _Do = _Nothing;

            // If the task has canceled, cancel the continuation. If the task has completed, execute the continuation right away.
            // Otherwise, add it to the list of pending continuations
            {
                ::std::lock_guard<::std::mutex> _LockHolder(_M_ContinuationsCritSec);
                if (_IsCompleted() || (_IsCanceled() && _PTaskHandle->_M_isTaskBasedContinuation))
                {
                    _Do = _Schedule;
                }
                else if (_IsCanceled())
                {
                    if (_HasUserException())
                    {
                        _Do = _CancelWithException;
                    }
                    else
                    {
                        _Do = _Cancel;
                    }
                }
                else
                {
                    // chain itself on the continuation chain.
                    _PTaskHandle->_M_next = _M_Continuations;
                    _M_Continuations = _PTaskHandle;
                }
            }

            // Cancellation and execution of continuations should be performed after releasing the lock. Continuations off of
            // async tasks may execute inline.
            switch (_Do)
            {
                case _Schedule:
                {
                    _PTaskHandle->_GetTaskImplBase()->_ScheduleContinuationTask(_PTaskHandle);
                    break;
                }
                case _Cancel:
                {
                    // If the ancestor was canceled, then your own execution should be canceled.
                    // This traverses down the tree to cancel it.
                    _PTaskHandle->_GetTaskImplBase()->_Cancel(true);

                    delete _PTaskHandle;
                    break;
                }
                case _CancelWithException:
                {
                    // If the ancestor encountered an exception, transfer the exception to the continuation
                    // This traverses down the tree to propagate the exception.
                    _PTaskHandle->_GetTaskImplBase()->_CancelWithExceptionHolder(_GetExceptionHolder(), true);

                    delete _PTaskHandle;
                    break;
                }
                case _Nothing:
                default:
                    // In this case, we have inserted continuation to continuation chain,
                    // nothing more need to be done, just leave.
                    break;
            }
        }

        void _RunTaskContinuations()
        {
            // The link list can no longer be modified at this point,
            // since all following up continuations will be scheduled by themselves.
            _ContinuationList _Cur = _M_Continuations, _Next;
            _M_Continuations = nullptr;
            while (_Cur)
            {
                // Current node might be deleted after running,
                // so we must fetch the next first.
                _Next = _Cur->_M_next;
                _RunContinuation(_Cur);
                _Cur = _Next;
            }
        }

        _CRTIMP2 static bool __cdecl _IsNonBlockingThread();

#if defined (__cplusplus_winrt)
        template<typename _ReturnType, typename>
        static void _AsyncInit(const typename _Task_ptr<_ReturnType>::_Type & _OuterTask,
                               Windows::Foundation::IAsyncOperation<typename details::_ValueTypeOrRefType<_ReturnType>::_Value>^ _AsyncOp)
        {
            // This method is invoked either when a task is created from an existing async operation or
            // when a lambda that creates an async operation executes.

            // If the outer task is pending cancel, cancel the async operation before setting the completed handler. The COM reference on
            // the IAsyncInfo object will be released when all ^references to the operation go out of scope.

            // This assertion uses the existence of taskcollection to determine if the task was created from an event.
            // That is no longer valid as even tasks created from a user lambda could have no underlying taskcollection
            // when a custom scheduler is used.
            // _ASSERTE((!_OuterTask->_M_TaskCollection._IsCreated() || _OuterTask->_M_fUnwrappedTask) && !_OuterTask->_IsCanceled());

            // Pass the shared_ptr by value into the lambda instead of using 'this'.
            _AsyncOp->Completed = ref new Windows::Foundation::AsyncOperationCompletedHandler<_ReturnType>(
              [_OuterTask](Windows::Foundation::IAsyncOperation<typename details::_ValueTypeOrRefType<_ReturnType>::_Value>^ _Operation, Windows::Foundation::AsyncStatus _Status) mutable
            {
                if (_Status == Windows::Foundation::AsyncStatus::Canceled)
                {
                    _OuterTask->_Cancel(true);
                }
                else if (_Status == Windows::Foundation::AsyncStatus::Error)
                {
                    _OuterTask->_CancelWithException(
                        ::std::make_exception_ptr(::Platform::Exception::ReCreateException(static_cast<int>(_Operation->ErrorCode.Value))));
                }
                else
                {
                    _ASSERTE(_Status == Windows::Foundation::AsyncStatus::Completed);

                    try
                    {
                        _OuterTask->_FinalizeAndRunContinuations(_Operation->GetResults());
                    }
                    catch (...)
                    {
                        // unknown exceptions thrown from GetResult
                        _OuterTask->_CancelWithException(::std::current_exception());
                    }

                }

                // Take away this shared pointers reference on the task instead of waiting for the delegate to be released. It could
                // be released on a different thread after a delay, and not releasing the reference here could cause the tasks to hold
                // on to resources longer than they should. As an example, without this reset, writing to a file followed by reading from
                // it using the Windows Runtime Async APIs causes a sharing violation.
                // Using const_cast is the workaround for failed mutable keywords
                const_cast<_Task_ptr<_ReturnType>::_Type &>(_OuterTask).reset();
             });
            _OuterTask->_SetUnwrappedAsyncOp(_AsyncOp);
        }
#endif  /* defined (__cplusplus_winrt) */

        template<typename _ReturnType, typename _InternalReturnType>
        static void _AsyncInit(const typename _Task_ptr<_ReturnType>::_Type& _OuterTask, const task<_InternalReturnType> & _UnwrappedTask)
        {
            _ASSERTE(_OuterTask->_M_fUnwrappedTask && !_OuterTask->_IsCanceled());

            //
            // We must ensure that continuations off _OuterTask (especially exception handling ones) continue to function in the
            // presence of an exception flowing out of the inner task _UnwrappedTask. This requires an exception handling continuation
            // off the inner task which does the appropriate funnelling to the outer one. We use _Then instead of then to prevent
            // the exception from being marked as observed by our internal continuation. This continuation must be scheduled regardless
            // of whether or not the _OuterTask task is canceled.
            //
            _UnwrappedTask._Then([_OuterTask] (task<_InternalReturnType> _AncestorTask) {

                if (_AncestorTask._GetImpl()->_IsCompleted())
                {
                    _OuterTask->_FinalizeAndRunContinuations(_AncestorTask._GetImpl()->_GetResult());
                }
                else
                {
                    _ASSERTE(_AncestorTask._GetImpl()->_IsCanceled());
                    if (_AncestorTask._GetImpl()->_HasUserException())
                    {
                        // Set _PropagatedFromAncestor to false, since _AncestorTask is not an ancestor of _UnwrappedTask.
                        // Instead, it is the enclosing task.
                        _OuterTask->_CancelWithExceptionHolder(_AncestorTask._GetImpl()->_GetExceptionHolder(), false);
                    }
                    else
                    {
                        _OuterTask->_Cancel(true);
                    }
                }
            }, nullptr, details::_DefaultAutoInline);

        }

        scheduler_ptr _GetScheduler() const
        {
            return _M_TaskCollection._GetScheduler();
        }

        // Tracks the internal state of the task
        volatile _TaskInternalState _M_TaskState;
        // Set to true either if the ancestor task had the flag set to true, or if the lambda that does the work of this task returns an
        // async operation or async action that is unwrapped by the runtime.
        bool _M_fFromAsync;
        // Set to true when a continuation unwraps a task or async operation.
        bool _M_fUnwrappedTask;

        // An exception thrown by the task body is captured in an exception holder and it is shared with all value based continuations rooted at the task.
        // The exception is 'observed' if the user invokes get()/wait() on any of the tasks that are sharing this exception holder. If the exception
        // is not observed by the time the internal object owned by the shared pointer destructs, the process will fail fast.
        ::std::shared_ptr<_ExceptionHolder> _M_exceptionHolder;

        typedef _ContinuationTaskHandleBase * _ContinuationList;

        ::std::mutex _M_ContinuationsCritSec;
        _ContinuationList _M_Continuations;

        // The cancellation token state.
        _CancellationTokenState * _M_pTokenState;

        // The registration on the token.
        _CancellationTokenRegistration * _M_pRegistration;

        // The async task collection wrapper
        ::Concurrency::details::_TaskCollection_t _M_TaskCollection;

        // Callstack for function call (constructor or .then) that created this task impl.
        _TaskCreationCallstack _M_pTaskCreationCallstack;

        _TaskEventLogger _M_taskEventLogger;
   private:
        // Must not be copied by value:
        _Task_impl_base(const _Task_impl_base&);
        _Task_impl_base const & operator=(_Task_impl_base const&);
    };

    /// <summary>
    ///     The implementation of a first-class task. This structure contains the task group used to execute
    ///     the task function and handles the scheduling. The _Task_impl is created as a shared_ptr
    ///     member of the public task class, so its destruction is handled automatically.
    /// </summary>
    /// <typeparam name="_ReturnType">
    ///     The result type of this task.
    /// </typeparam>
    /**/
    template<typename _ReturnType>
    struct _Task_impl : public _Task_impl_base
    {
        #pragma warning(push)
        #pragma warning(disable: 26495) // _ReturnType is not necessarily default constructible.
        _Task_impl(_CancellationTokenState * _Ct, scheduler_ptr _Scheduler_arg)
            : _Task_impl_base(_Ct, _Scheduler_arg)
        {
        }
        #pragma warning(pop)

        virtual ~_Task_impl()
        {
            // We must invoke _DeregisterCancellation in the derived class destructor. Calling it in the base class destructor could cause
            // a partially initialized _Task_impl to be in the list of registrations for a cancellation token.
            _DeregisterCancellation();
        }

        virtual bool _CancelAndRunContinuations(bool _SynchronousCancel, bool _UserException, bool _PropagatedFromAncestor, const ::std::shared_ptr<_ExceptionHolder> & _ExceptionHolder_arg) override
        {
            enum { _Nothing, _RunContinuations, _Cancel } _Do = _Nothing;
            {
                ::std::lock_guard<::std::mutex> _LockHolder(_M_ContinuationsCritSec);
                if (_UserException)
                {
                    _ASSERTE(_SynchronousCancel && !_IsCompleted());
                    // If the state is _Canceled, the exception has to be coming from an ancestor.
                    _ASSERTE(!_IsCanceled() || _PropagatedFromAncestor);

                    // We should not be canceled with an exception more than once.
                    _ASSERTE(!_HasUserException());

                    if (_M_TaskState == _Canceled)
                    {
                        // If the task has finished cancelling there should not be any continuation records in the array.
                        return false;
                    }
                    else
                    {
                        _ASSERTE(_M_TaskState != _Completed);
                        _M_exceptionHolder = _ExceptionHolder_arg;
                    }
                }
                else
                {
                    // Completed is a non-cancellable state, and if this is an asynchronous cancel, we're unable to do better than the last async cancel
                    // which is to say, cancellation is already initiated, so return early.
                    if (_IsCompleted() || _IsCanceled() || (_IsPendingCancel() && !_SynchronousCancel))
                    {
                        _ASSERTE(!_IsCompleted() || !_HasUserException());
                        return false;
                    }
                    _ASSERTE(!_SynchronousCancel || !_HasUserException());
                }

                if (_SynchronousCancel)
                {
                    // Be aware that this set must be done BEFORE _M_Scheduled being set, or race will happen between this and wait()
                    _M_TaskState = _Canceled;
                    // Cancellation completes the task, so all dependent tasks must be run to cancel them
                    // They are canceled when they begin running (see _RunContinuation) and see that their
                    // ancestor has been canceled.
                    _Do = _RunContinuations;
                }
                else
                {
                    _ASSERTE(!_UserException);

                    if (_IsStarted())
                    {
                        // should not initiate cancellation under a lock
                        _Do = _Cancel;
                    }

                    // The _M_TaskState variable transitions to _Canceled when cancellation is completed (the task is not executing user code anymore).
                    // In the case of a synchronous cancel, this can happen immediately, whereas with an asynchronous cancel, the task has to move from
                    // _Started to _PendingCancel before it can move to _Canceled when it is finished executing.
                    _M_TaskState = _PendingCancel;

                    _M_taskEventLogger._LogCancelTask();
                }
            }

            switch (_Do)
            {
                case _Cancel:
                {
                    if (_M_InternalCancellation)
                    {
                        // We will only try to cancel async operation but not unwrapped tasks, since unwrapped tasks cannot be canceled without its token.
                        _M_InternalCancellation();
                    }
                    _M_TaskCollection._Cancel();
                    break;
                }
                case _RunContinuations:
                {
                    // Only execute continuations and mark the task as completed if we were able to move the task to the _Canceled state.
                    _M_TaskCollection._Complete();

                    if (_M_Continuations)
                    {
                        // Scheduling cancellation with automatic inlining.
                        _ScheduleFuncWithAutoInline([this](){ _RunTaskContinuations(); }, details::_DefaultAutoInline);
                    }

                    break;
                }
                case _Nothing:
                default:
                    break;
            }
            return true;
        }

        void _FinalizeAndRunContinuations(_ReturnType _Result)
        {
            _M_Result.Set(_Result);

            {
                //
                // Hold this lock to ensure continuations being concurrently either get added
                // to the _M_Continuations vector or wait for the result
                //
                ::std::lock_guard<::std::mutex> _LockHolder(_M_ContinuationsCritSec);

                // A task could still be in the _Created state if it was created with a task_completion_event.
                // It could also be in the _Canceled state for the same reason.
                _ASSERTE(!_HasUserException() && !_IsCompleted());
                if (_IsCanceled())
                {
                    return;
                }

                // Always transition to "completed" state, even in the face of unacknowledged pending cancellation
                _M_TaskState = _Completed;
            }
            _M_TaskCollection._Complete();
            _RunTaskContinuations();
        }

        //
        // This method is invoked when the starts executing. The task returns early if this method returns true.
        //
        bool _TransitionedToStarted()
        {
            ::std::lock_guard<::std::mutex> _LockHolder(_M_ContinuationsCritSec);
            // Canceled state could only result from antecedent task's canceled state, but that code path will not reach here.
            _ASSERT(!_IsCanceled());
            if (_IsPendingCancel())
                return false;

            _ASSERTE(_IsCreated());
            _M_TaskState = _Started;
            return true;
        }

#if defined (__cplusplus_winrt)
        void _SetUnwrappedAsyncOp(Windows::Foundation::IAsyncOperation<typename details::_ValueTypeOrRefType<_ReturnType>::_Value>^ _AsyncOp)
        {
            bool _DoCancel = false;
            {
                ::std::lock_guard<::std::mutex> _LockHolder(_M_ContinuationsCritSec);
                // Cancel the async operation if the task itself is canceled, since the thread that canceled the task missed it.
                if (_IsPendingCancel())
                {
                    _ASSERTE(!_IsCanceled());
                    _DoCancel = true;
                }
                else if (!_IsCanceled() && !_IsCompleted())
                {
                    _M_TaskState = _Started;
                    _M_InternalCancellation = [=] {
                        _AsyncOp->Cancel();
                    };
                }
            }
            if (_DoCancel)
            {
                _AsyncOp->Cancel();
            }
        }
#endif  /* defined (__cplusplus_winrt) */

        // Return true if the task has reached a terminal state
        bool _IsDone()
        {
            return _IsCompleted() || _IsCanceled();
        }

        _ReturnType _GetResult()
        {
            return _M_Result.Get();
        }

        _ResultHolder<_ReturnType> _M_Result;
        ::std::function<void()>    _M_InternalCancellation;
    };

    template<typename _ResultType>
    struct _Task_completion_event_impl
    {
    private:
        _Task_completion_event_impl(const _Task_completion_event_impl&);
        _Task_completion_event_impl& operator=(const _Task_completion_event_impl&);

    public:

        typedef ::std::vector<typename _Task_ptr<_ResultType>::_Type> _TaskList;

        #pragma warning(push)
        #pragma warning(disable: 26495) // _ResultType is not necessarily default constructible.
        _Task_completion_event_impl() :
            _M_fHasValue(false), _M_fIsCanceled(false)
        {
        }
        #pragma warning(pop)

        bool _HasUserException()
        {
            return _M_exceptionHolder != nullptr;
        }

        ~_Task_completion_event_impl()
        {
            for( auto _TaskIt = _M_tasks.begin(); _TaskIt != _M_tasks.end(); ++_TaskIt )
            {
                _ASSERTE(!_M_fHasValue && !_M_fIsCanceled);
                // Cancel the tasks since the event was never signaled or canceled.
                (*_TaskIt)->_Cancel(true);
            }
        }

        // We need to protect the loop over the array, so concurrent_vector would not have helped
        _TaskList                           _M_tasks;
        ::std::mutex                        _M_taskListCritSec;
        _ResultHolder<_ResultType>          _M_value;
        ::std::shared_ptr<_ExceptionHolder> _M_exceptionHolder;
        bool                                _M_fHasValue;
        bool                                _M_fIsCanceled;
    };

    // Utility method for dealing with void functions
    inline ::std::function<_Unit_type()> _MakeVoidToUnitFunc(const ::std::function<void()>& _Func)
    {
        return [=]() -> _Unit_type { _Func(); return _Unit_type(); };
    }

    template <typename _Type>
    ::std::function<_Type(_Unit_type)> _MakeUnitToTFunc(const ::std::function<_Type()>& _Func)
    {
        return [=](_Unit_type) -> _Type { return _Func(); };
    }

    template <typename _Type>
    ::std::function<_Unit_type(_Type)> _MakeTToUnitFunc(const ::std::function<void(_Type)>& _Func)
    {
        return [=](_Type _Obj) -> _Unit_type { _Func(_Obj); return _Unit_type(); };
    }

    inline ::std::function<_Unit_type(_Unit_type)> _MakeUnitToUnitFunc(const ::std::function<void()>& _Func)
    {
        return [=](_Unit_type) -> _Unit_type { _Func(); return _Unit_type(); };
    }
} // namespace details

/// <summary>
///     The <c>task_completion_event</c> class allows you to delay the execution of a task until a condition is satisfied,
///     or start a task in response to an external event.
/// </summary>
/// <typeparam name="_ResultType">
///     The result type of this <c>task_completion_event</c> class.
/// </typeparam>
/// <remarks>
///     Use a task created from a task completion event when your scenario requires you to create a task that will complete, and
///     thereby have its continuations scheduled for execution, at some point in the future. The <c>task_completion_event</c> must
///     have the same type as the task you create, and calling the set method on the task completion event with a value of that type
///     will cause the associated task to complete, and provide that value as a result to its continuations.
///     <para>If the task completion event is never signaled, any tasks created from it will be canceled when it is destructed.</para>
///     <para><c>task_completion_event</c> behaves like a smart pointer, and should be passed by value.</para>
/// </remarks>
/// <seealso cref="task Class"/>
/**/
template<typename _ResultType>
class task_completion_event
{
public:
    /// <summary>
    ///     Constructs a <c>task_completion_event</c> object.
    /// </summary>
    /**/
    task_completion_event()
        : _M_Impl(::std::make_shared<details::_Task_completion_event_impl<_ResultType>>())
    {
    }

    /// <summary>
    ///     Sets the task completion event.
    /// </summary>
    /// <param name="_Result">
    ///     The result to set this event with.
    /// </param>
    /// <returns>
    ///     The method returns <c>true</c> if it was successful in setting the event. It returns <c>false</c> if the event is already set.
    /// </returns>
    /// <remarks>
    ///     In the presence of multiple or concurrent calls to <c>set</c>, only the first call will succeed and its result (if any) will be stored in the
    ///     task completion event. The remaining sets are ignored and the method will return false. When you set a task completion event, all the
    ///     tasks created from that event will immediately complete, and its continuations, if any, will be scheduled. Task completion objects that have
    ///     a <typeparamref name="_ResultType"/> other than <c>void</c> will pass the value <paramref value="_Result"/> to their continuations.
    /// </remarks>
    /**/
    bool set(_ResultType _Result) const // 'const' (even though it's not deep) allows to safely pass events by value into lambdas
    {
        // Subsequent sets are ignored. This makes races to set benign: the first setter wins and all others are ignored.
        if (_IsTriggered())
        {
            return false;
        }

        _TaskList _Tasks;
        bool _RunContinuations = false;
        {
            ::std::lock_guard<::std::mutex> _LockHolder(_M_Impl->_M_taskListCritSec);

            if (!_IsTriggered())
            {
                _M_Impl->_M_value.Set(_Result);
                _M_Impl->_M_fHasValue = true;

                _Tasks.swap(_M_Impl->_M_tasks);
                _RunContinuations = true;
            }
        }

        if (_RunContinuations)
        {
            for( auto _TaskIt = _Tasks.begin(); _TaskIt != _Tasks.end(); ++_TaskIt )
            {
                // If current task was cancelled by a cancellation_token, it would be in cancel pending state.
                if ((*_TaskIt)->_IsPendingCancel())
                    (*_TaskIt)->_Cancel(true);
                else
                {
                    // Tasks created with task_completion_events can be marked as async, (we do this in when_any and when_all
                    // if one of the tasks involved is an async task). Since continuations of async tasks can execute inline, we
                    // need to run continuations after the lock is released.
                    (*_TaskIt)->_FinalizeAndRunContinuations(_M_Impl->_M_value.Get());
                }
            }

            return true;
        }

        return false;
    }

    template<typename _E>
    __declspec(noinline) // Ask for no inlining so that the _ReturnAddress intrinsic gives us the expected result
    bool set_exception(_E _Except) const // 'const' (even though it's not deep) allows to safely pass events by value into lambdas
    {
        // It is important that _CAPTURE_CALLSTACK() evaluates to the instruction after the call instruction for set_exception.
        return _Cancel(::std::make_exception_ptr(_Except), _CAPTURE_CALLSTACK());
    }

    /// <summary>
    ///     Propagates an exception to all tasks associated with this event.
    /// </summary>
    /// <param>
    ///     The exception_ptr that indicates the exception to set this event with.
    /// </param>
    /**/
    __declspec(noinline) // Ask for no inlining so that the _CAPTURE_CALLSTACK gives us the expected result
    bool set_exception(::std::exception_ptr _ExceptionPtr) const // 'const' (even though it's not deep) allows to safely pass events by value into lambdas
    {
        // It is important that _CAPTURE_CALLSTACK() evaluates to the instruction after the call instruction for set_exception.
        return _Cancel(_ExceptionPtr, _CAPTURE_CALLSTACK());
    }

    /// <summary>
    ///     Internal method to cancel the task_completion_event. Any task created using this event will be marked as canceled if it has
    ///     not already been set.
    /// </summary>
    bool _Cancel() const
    {
        // Cancel with the stored exception if one exists.
        return _CancelInternal();
    }

    /// <summary>
    ///     Internal method to cancel the task_completion_event with the exception provided. Any task created using this event will be canceled
    ///     with the same exception.
    /// </summary>
    template<typename _ExHolderType>
    bool _Cancel(_ExHolderType _ExHolder, const details::_TaskCreationCallstack &_SetExceptionAddressHint = details::_TaskCreationCallstack ()) const
    {
        bool _Canceled;
        if(_StoreException(_ExHolder, _SetExceptionAddressHint))
        {
            _Canceled = _CancelInternal();
            _ASSERTE(_Canceled);
        }
        else
        {
            _Canceled = false;
        }
        return _Canceled;
    }

    /// <summary>
    ///     Internal method that stores an exception in the task completion event. This is used internally by when_any.
    ///     Note, this does not cancel the task completion event. A task completion event with a stored exception
    ///     can bet set() successfully. If it is canceled, it will cancel with the stored exception, if one is present.
    /// </summary>
    template<typename _ExHolderType>
    bool _StoreException(_ExHolderType _ExHolder, const details::_TaskCreationCallstack &_SetExceptionAddressHint = details::_TaskCreationCallstack ()) const
    {
        ::std::lock_guard<::std::mutex> _LockHolder(_M_Impl->_M_taskListCritSec);
        if (!_IsTriggered() && !_M_Impl->_HasUserException())
        {
            // Create the exception holder only if we have ensured there we will be successful in setting it onto the
            // task completion event. Failing to do so will result in an unobserved task exception.
            _M_Impl->_M_exceptionHolder = _ToExceptionHolder(_ExHolder, _SetExceptionAddressHint);
            return true;
        }
        return false;
    }
    /// <summary>
    ///     Internal method that observe and clear the exception stored in the task completion event.
    ///     This is used internally by when_any.
    /// </summary>
    void _ClearStoredException() const
    {
        ::std::lock_guard<::std::mutex> _LockHolder(_M_Impl->_M_taskListCritSec);
        if (_M_Impl->_M_exceptionHolder)
        {
            details::atomic_exchange(_M_Impl->_M_exceptionHolder->_M_exceptionObserved, 1l);
            _M_Impl->_M_exceptionHolder.reset();
        }
    }

    /// <summary>
    ///     Tests whether current event has been either Set, or Canceled.
    /// </summary>
    bool _IsTriggered() const
    {
        return _M_Impl->_M_fHasValue || _M_Impl->_M_fIsCanceled;
    }

private:

    static ::std::shared_ptr<details::_ExceptionHolder> _ToExceptionHolder(const ::std::shared_ptr<details::_ExceptionHolder>& _ExHolder, const details::_TaskCreationCallstack&)
    {
        return _ExHolder;
    }

    static ::std::shared_ptr<details::_ExceptionHolder> _ToExceptionHolder(::std::exception_ptr _ExceptionPtr, const details::_TaskCreationCallstack &_SetExceptionAddressHint)
    {
        return ::std::make_shared<details::_ExceptionHolder>(_ExceptionPtr, _SetExceptionAddressHint);
    }


    template <typename _Ty> friend class task; // task can register itself with the event by calling the private _RegisterTask
    template <typename _Ty> friend class task_completion_event;

    typedef typename details::_Task_completion_event_impl<_ResultType>::_TaskList _TaskList;

    /// <summary>
    ///    Cancels the task_completion_event.
    /// </summary>
    bool _CancelInternal() const
    {
        // Cancellation of task completion events is an internal only utility. Our usage is such that _CancelInternal
        // will never be invoked if the task completion event has been set.
        _ASSERTE(!_M_Impl->_M_fHasValue);
        if (_M_Impl->_M_fIsCanceled)
        {
            return false;
        }

        _TaskList _Tasks;
        bool _Cancel = false;
        {
            ::std::lock_guard<::std::mutex> _LockHolder(_M_Impl->_M_taskListCritSec);
            _ASSERTE(!_M_Impl->_M_fHasValue);
            if (!_M_Impl->_M_fIsCanceled)
            {
                _M_Impl->_M_fIsCanceled = true;
                _Tasks.swap(_M_Impl->_M_tasks);
                _Cancel = true;
            }
        }

        const bool _UserException = _M_Impl->_HasUserException();

        if (_Cancel)
        {
            for( auto _TaskIt = _Tasks.begin(); _TaskIt != _Tasks.end(); ++_TaskIt )
            {
                // Need to call this after the lock is released. See comments in set().
                if (_UserException)
                {
                    (*_TaskIt)->_CancelWithExceptionHolder(_M_Impl->_M_exceptionHolder, true);
                }
                else
                {
                    (*_TaskIt)->_Cancel(true);
                }
            }
        }
        return _Cancel;
    }

    /// <summary>
    ///     Register a task with this event. This function is called when a task is constructed using
    ///     a task_completion_event.
    /// </summary>
    void _RegisterTask(const typename details::_Task_ptr<_ResultType>::_Type & _TaskParam)
    {
        enum { _Nothing, _Trigger, _Cancel } _Action = _Nothing;
        {
            ::std::lock_guard<::std::mutex> _LockHolder(_M_Impl->_M_taskListCritSec);

            //If an exception was already set on this event, then cancel the task with the stored exception.
            if (_M_Impl->_HasUserException())
            {
                _Action = _Cancel;
            }
            else if (_M_Impl->_M_fHasValue)
            {
                _Action = _Trigger;
            }
            else
            {
                _M_Impl->_M_tasks.push_back(_TaskParam);
            }
        }

        switch (_Action)
        {
        case _Trigger:
            _TaskParam->_FinalizeAndRunContinuations(_M_Impl->_M_value.Get());
            break;
        case _Cancel:
            _TaskParam->_CancelWithExceptionHolder(_M_Impl->_M_exceptionHolder, true);
            break;
        case _Nothing:
        default:
            break;
        }
    }

    ::std::shared_ptr<details::_Task_completion_event_impl<_ResultType>> _M_Impl;
};

/// <summary>
///     The <c>task_completion_event</c> class allows you to delay the execution of a task until a condition is satisfied,
///     or start a task in response to an external event.
/// </summary>
/// <remarks>
///     Use a task created from a task completion event when your scenario requires you to create a task that will complete, and
///     thereby have its continuations scheduled for execution, at some point in the future. The <c>task_completion_event</c> must
///     have the same type as the task you create, and calling the set method on the task completion event with a value of that type
///     will cause the associated task to complete, and provide that value as a result to its continuations.
///     <para>If the task completion event is never signaled, any tasks created from it will be canceled when it is destructed.</para>
///     <para><c>task_completion_event</c> behaves like a smart pointer, and should be passed by value.</para>
/// </remarks>
/// <seealso cref="task Class"/>
/**/
template<>
class task_completion_event<void>
{
public:
    /// <summary>
    ///     Sets the task completion event.
    /// </summary>
    /// <returns>
    ///     The method returns <c>true</c> if it was successful in setting the event. It returns <c>false</c> if the event is already set.
    /// </returns>
    /// <remarks>
    ///     In the presence of multiple or concurrent calls to <c>set</c>, only the first call will succeed and its result (if any) will be stored in the
    ///     task completion event. The remaining sets are ignored and the method will return false. When you set a task completion event, all the
    ///     tasks created from that event will immediately complete, and its continuations, if any, will be scheduled. Task completion objects that have
    ///     a <typeparamref name="_ResultType"/> other than <c>void</c> will pass the value <paramref value="_Result"/> to their continuations.
    /// </remarks>
    /**/
    bool set() const // 'const' (even though it's not deep) allows to safely pass events by value into lambdas
    {
        return _M_unitEvent.set(details::_Unit_type());
    }

    template<typename _E>
    __declspec(noinline) // Ask for no inlining so that the _ReturnAddress intrinsic gives us the expected result
    bool set_exception(_E _Except) const // 'const' (even though it's not deep) allows to safely pass events by value into lambdas
    {
        return _M_unitEvent._Cancel(::std::make_exception_ptr(_Except), _CAPTURE_CALLSTACK());
    }

    /// <summary>
    ///     Propagates an exception to all tasks associated with this event.
    /// </summary>
    /// <param>
    ///     The exception_ptr that indicates the exception to set this event with.
    /// </param>
    /**/
    __declspec(noinline) // Ask for no inlining so that the _CAPTURE_CALLSTACK intrinsic gives us the expected result
    bool set_exception(::std::exception_ptr _ExceptionPtr) const // 'const' (even though it's not deep) allows to safely pass events by value into lambdas
    {
        // It is important that _CAPTURE_CALLSTACK() evaluates to the instruction after the call instruction for set_exception.
        return _M_unitEvent._Cancel(_ExceptionPtr, _CAPTURE_CALLSTACK());
    }

    /// <summary>
    ///     Cancel the task_completion_event. Any task created using this event will be marked as canceled if it has
    ///     not already been set.
    /// </summary>
    void _Cancel() const // 'const' (even though it's not deep) allows to safely pass events by value into lambdas
    {
        _M_unitEvent._Cancel();
    }

    /// <summary>
    ///     Cancel the task_completion_event with the exception holder provided. Any task created using this event will be canceled
    ///     with the same exception.
    /// </summary>
    void _Cancel(const ::std::shared_ptr<details::_ExceptionHolder>& _ExHolder) const
    {
        _M_unitEvent._Cancel(_ExHolder);
    }

    /// <summary>
    ///     Method that stores an exception in the task completion event. This is used internally by when_any.
    ///     Note, this does not cancel the task completion event. A task completion event with a stored exception
    ///     can bet set() successfully. If it is canceled, it will cancel with the stored exception, if one is present.
    /// </summary>
    bool _StoreException(const ::std::shared_ptr<details::_ExceptionHolder>& _ExHolder) const
    {
        return _M_unitEvent._StoreException(_ExHolder);
    }

    /// <summary>
    ///     Internal method that observe and clear the exception stored in the task completion event.
    ///     This is used internally by when_any.
    /// </summary>
    void _ClearStoredException() const
    {
        _M_unitEvent._ClearStoredException();
    }

    /// <summary>
    ///     Test whether current event has been either Set, or Canceled.
    /// </summary>
    bool _IsTriggered() const
    {
        return _M_unitEvent._IsTriggered();
    }

private:
    template <typename _Ty> friend class task; // task can register itself with the event by calling the private _RegisterTask

    /// <summary>
    ///     Register a task with this event. This function is called when a task is constructed using
    ///     a task_completion_event.
    /// </summary>
    void _RegisterTask(details::_Task_ptr<details::_Unit_type>::_Type _TaskParam)
    {
        _M_unitEvent._RegisterTask(_TaskParam);
    }

    // The void event contains an event a dummy type so common code can be used for events with void and non-void results.
    task_completion_event<details::_Unit_type> _M_unitEvent;
};

namespace details
{
    //
    // Compile-time validation helpers
    //

    // Task constructor validation: issue helpful diagnostics for common user errors. Do not attempt full validation here.
    //
    // Anything callable is fine
    template<typename _ReturnType, typename _Ty>
    auto _IsValidTaskCtor(_Ty _Param, int,int,int,int) -> decltype(_Param(), ::std::true_type());

#if defined (__cplusplus_winrt)
    // Anything that has GetResults is fine: this covers all async operations
    template<typename _ReturnType, typename _Ty>
    auto _IsValidTaskCtor(_Ty _Param, int, int, int,...) -> decltype(_Param->GetResults(), ::std::true_type());
#endif

    // Allow parameters with set: this covers task_completion_event
    template<typename _ReturnType, typename _Ty>
    auto _IsValidTaskCtor(_Ty _Param, int, int, ...) -> decltype(_Param.set(details::declval<_ReturnType>()), ::std::true_type());

    template<typename _ReturnType, typename _Ty>
    auto _IsValidTaskCtor(_Ty _Param, int, ...) -> decltype(_Param.set(), ::std::true_type());

    // All else is invalid
    template<typename _ReturnType, typename _Ty>
    ::std::false_type _IsValidTaskCtor(_Ty _Param, ...);

    template<typename _ReturnType, typename _Ty>
    void _ValidateTaskConstructorArgs(const _Ty& _Param)
    {
        static_assert(::std::is_same_v<decltype(_IsValidTaskCtor<_ReturnType, _Ty>(_Param,0,0,0,0)), ::std::true_type>,
#if defined (__cplusplus_winrt)
            "incorrect argument for task constructor; must be a callable object, an asynchronous operation or a task_completion_event"
#else  /* defined (__cplusplus_winrt) */
            "incorrect argument for task constructor; must be either a callable object or a task_completion_event"
#endif  /* defined (__cplusplus_winrt) */
            );
#if defined (__cplusplus_winrt)
        static_assert(!(::std::is_same_v<_Ty, _ReturnType> && details::_IsIAsyncInfo<_Ty>::_Value),
            "incorrect template argument for task; consider using the return type of the async operation");
#endif  /* defined (__cplusplus_winrt) */
    }

    class _ProgressReporterCtorArgType{};

#if defined (__cplusplus_winrt)
    // Helpers for create_async validation
    //
    // A parameter lambda taking no arguments is valid
    template<typename _Ty>
    static auto _IsValidCreateAsync(_Ty _Param, int, int, int, int) -> decltype(_Param(), ::std::true_type());

    // A parameter lambda taking an cancellation_token argument is valid
    template<typename _Ty>
    static auto _IsValidCreateAsync(_Ty _Param, int, int, int, ...) -> decltype(_Param(cancellation_token::none()), ::std::true_type());

    // A parameter lambda taking a progress report argument is valid
    template<typename _Ty>
    static auto _IsValidCreateAsync(_Ty _Param, int, int, ...) -> decltype(_Param(details::_ProgressReporterCtorArgType()), ::std::true_type());

    // A parameter lambda taking a progress report and a cancellation_token argument is valid
    template<typename _Ty>
    static auto _IsValidCreateAsync(_Ty _Param, int, ...) -> decltype(_Param(details::_ProgressReporterCtorArgType(), cancellation_token::none()), ::std::true_type());

    // All else is invalid
    template<typename _Ty>
    static ::std::false_type _IsValidCreateAsync(_Ty _Param, ...);
#endif  /* defined (__cplusplus_winrt) */
}
/// <summary>
///     A helper class template that transforms a continuation lambda that either takes or returns void, or both, into a lambda that takes and returns a
///     non-void type (details::_Unit_type is used to substitute for void). This is to minimize the special handling required for 'void'.
/// </summary>
template<typename _InpType, typename _OutType>
class _Continuation_func_transformer
{
public:
    static auto _Perform(::std::function<_OutType(_InpType)> _Func) -> decltype(_Func)
    {
        return _Func;
    }
};

template<typename _OutType>
class _Continuation_func_transformer<void, _OutType>
{
public:
    static auto _Perform(::std::function<_OutType()> _Func) -> decltype(details::_MakeUnitToTFunc<_OutType>(_Func))
    {
        return details::_MakeUnitToTFunc<_OutType>(_Func);
    }
};

template<typename _InType>
class _Continuation_func_transformer<_InType, void>
{
public:
    static auto _Perform(::std::function<void(_InType)> _Func) -> decltype(details::_MakeTToUnitFunc<_InType>(_Func))
    {
        return details::_MakeTToUnitFunc<_InType>(_Func);
    }
};

template<>
class _Continuation_func_transformer<void, void>
{
public:
    static auto _Perform(::std::function<void()> _Func) -> decltype(details::_MakeUnitToUnitFunc(_Func))
    {
        return details::_MakeUnitToUnitFunc(_Func);
    }
};

// A helper class template that transforms an initial task lambda returns void into a lambda that returns a non-void type (details::_Unit_type is used
// to substitute for void). This is to minimize the special handling required for 'void'.
template<typename _RetType>
class _Init_func_transformer
{
public:
    static auto _Perform(::std::function<_RetType()> _Func) -> decltype(_Func)
    {
        return _Func;
    }
};

template<>
class _Init_func_transformer<void>
{
public:
    static auto _Perform(::std::function<void()> _Func) -> decltype(details::_MakeVoidToUnitFunc(_Func))
    {
        return details::_MakeVoidToUnitFunc(_Func);
    }
};

/// <summary>
///     The Parallel Patterns Library (PPL) <c>task</c> class. A <c>task</c> object represents work that can be executed asynchronously,
///     and concurrently with other tasks and parallel work produced by parallel algorithms in the Concurrency Runtime. It produces
///     a result of type <typeparamref name="_ResultType"/> on successful completion. Tasks of type <c>task&lt;void&gt;</c> produce no result.
///     A task can be waited upon and canceled independently of other tasks. It can also be composed with other tasks using
///     continuations(<c>then</c>), and join(<c>when_all</c>) and choice(<c>when_any</c>) patterns.
/// </summary>
/// <typeparam name="_ReturnType">
///     The result type of this task.
/// </typeparam>
/// <remarks>
///     For more information, see <see cref="Task Parallelism (Concurrency Runtime)"/>.
/// </remarks>
/**/
template<typename _ReturnType>
class task
{
public:
    /// <summary>
    ///     The type of the result an object of this class produces.
    /// </summary>
    /**/
    typedef _ReturnType result_type;

    /// <summary>
    ///     Constructs a <c>task</c> object.
    /// </summary>
    /// <remarks>
    ///     The default constructor for a <c>task</c> is only present in order to allow tasks to be used within containers.
    ///     A default constructed task cannot be used until you assign a valid task to it. Methods such as <c>get</c>, <c>wait</c> or <c>then</c>
    ///     will throw an <see cref="invalid_argument Class">invalid_argument</see> exception when called on a default constructed task.
    ///     <para>A task that is created from a <c>task_completion_event</c> will complete (and have its continuations scheduled) when the task
    ///     completion event is set.</para>
    ///     <para>The version of the constructor that takes a cancellation token creates a task that can be canceled using the
    ///     <c>cancellation_token_source</c> the token was obtained from. Tasks created without a cancellation token are not cancelable.</para>
    ///     <para>Tasks created from a <c>Windows::Foundation::IAsyncInfo</c> interface or a lambda that returns an <c>IAsyncInfo</c> interface
    ///     reach their terminal state when the enclosed Windows Runtime asynchronous operation or action completes. Similarly, tasks created
    ///     from a lambda that returns a <c>task&lt;result_type&gt;</c> reach their terminal state when the inner task reaches its terminal state,
    ///     and not when the lambda returns.</para>
    ///     <para><c>task</c> behaves like a smart pointer and is safe to pass around by value. It can be accessed by multiple threads
    ///     without the need for locks.</para>
    ///     <para>The constructor overloads that take a Windows::Foundation::IAsyncInfo interface or a lambda returning such an interface, are only available
    ///     to Windows Store apps.</para>
    ///     <para>For more information, see <see cref="Task Parallelism (Concurrency Runtime)"/>.</para>
    /// </remarks>
    /**/
    task() noexcept : _M_Impl(nullptr)
    {
        // The default constructor should create a task with a nullptr impl. This is a signal that the
        // task is not usable and should throw if any wait(), get() or then() APIs are used.
    }

    /// <summary>
    ///     Constructs a <c>task</c> object.
    /// </summary>
    /// <typeparam name="_Ty">
    ///     The type of the parameter from which the task is to be constructed.
    /// </typeparam>
    /// <param name="_Param">
    ///     The parameter from which the task is to be constructed. This could be a lambda, a function object, a <c>task_completion_event&lt;result_type&gt;</c>
    ///     object, or a Windows::Foundation::IAsyncInfo if you are using tasks in your Windows Store app. The lambda or function
    ///     object should be a type equivalent to <c>std::function&lt;X()&gt;</c>, where X can be a variable of type <c>result_type</c>,
    ///     <c>task&lt;result_type&gt;</c>, or a Windows::Foundation::IAsyncInfo in Windows Store apps.
    /// </param>
    /// <param name="_Token">
    ///     The cancellation token to associate with this task. A task created without a cancellation token cannot be canceled. It implicitly receives
    ///     the token <c>cancellation_token::none()</c>.
    /// </param>
    /// <remarks>
    ///     The default constructor for a <c>task</c> is only present in order to allow tasks to be used within containers.
    ///     A default constructed task cannot be used until you assign a valid task to it. Methods such as <c>get</c>, <c>wait</c> or <c>then</c>
    ///     will throw an <see cref="invalid_argument Class">invalid_argument</see> exception when called on a default constructed task.
    ///     <para>A task that is created from a <c>task_completion_event</c> will complete (and have its continuations scheduled) when the task
    ///     completion event is set.</para>
    ///     <para>The version of the constructor that takes a cancellation token creates a task that can be canceled using the
    ///     <c>cancellation_token_source</c> the token was obtained from. Tasks created without a cancellation token are not cancelable.</para>
    ///     <para>Tasks created from a <c>Windows::Foundation::IAsyncInfo</c> interface or a lambda that returns an <c>IAsyncInfo</c> interface
    ///     reach their terminal state when the enclosed Windows Runtime asynchronous operation or action completes. Similarly, tasks created
    ///     from a lambda that returns a <c>task&lt;result_type&gt;</c> reach their terminal state when the inner task reaches its terminal state,
    ///     and not when the lambda returns.</para>
    ///     <para><c>task</c> behaves like a smart pointer and is safe to pass around by value. It can be accessed by multiple threads
    ///     without the need for locks.</para>
    ///     <para>The constructor overloads that take a Windows::Foundation::IAsyncInfo interface or a lambda returning such an interface, are only available
    ///     to Windows Store apps.</para>
    ///     <para>For more information, see <see cref="Task Parallelism (Concurrency Runtime)"/>.</para>
    /// </remarks>
    /**/
    template<typename _Ty>
    __declspec(noinline) // Ask for no inlining so that the _CAPTURE_CALLSTACK gives us the expected result
    explicit task(_Ty _Param)
    {
        task_options _TaskOptions;
        details::_ValidateTaskConstructorArgs<_ReturnType,_Ty>(_Param);

        _CreateImpl(_TaskOptions.get_cancellation_token()._GetImplValue(), _TaskOptions.get_scheduler());
        // Do not move the next line out of this function. It is important that _CAPTURE_CALLSTACK() evaluates to the call site of the task constructor.
        _SetTaskCreationCallstack(_CAPTURE_CALLSTACK());

        _TaskInitMaybeFunctor(_Param, decltype(details::_IsCallable(_Param,0))());
    }

    /// <summary>
    ///     Constructs a <c>task</c> object.
    /// </summary>
    /// <typeparam name="_Ty">
    ///     The type of the parameter from which the task is to be constructed.
    /// </typeparam>
    /// <param name="_Param">
    ///     The parameter from which the task is to be constructed. This could be a lambda, a function object, a <c>task_completion_event&lt;result_type&gt;</c>
    ///     object, or a Windows::Foundation::IAsyncInfo if you are using tasks in your Windows Store app. The lambda or function
    ///     object should be a type equivalent to <c>std::function&lt;X()&gt;</c>, where X can be a variable of type <c>result_type</c>,
    ///     <c>task&lt;result_type&gt;</c>, or a Windows::Foundation::IAsyncInfo in Windows Store apps.
    /// </param>
    /// <param name="_TaskOptions">
    ///     The task options include cancellation token, scheduler etc
    /// </param>
    /// <remarks>
    ///     The default constructor for a <c>task</c> is only present in order to allow tasks to be used within containers.
    ///     A default constructed task cannot be used until you assign a valid task to it. Methods such as <c>get</c>, <c>wait</c> or <c>then</c>
    ///     will throw an <see cref="invalid_argument Class">invalid_argument</see> exception when called on a default constructed task.
    ///     <para>A task that is created from a <c>task_completion_event</c> will complete (and have its continuations scheduled) when the task
    ///     completion event is set.</para>
    ///     <para>The version of the constructor that takes a cancellation token creates a task that can be canceled using the
    ///     <c>cancellation_token_source</c> the token was obtained from. Tasks created without a cancellation token are not cancelable.</para>
    ///     <para>Tasks created from a <c>Windows::Foundation::IAsyncInfo</c> interface or a lambda that returns an <c>IAsyncInfo</c> interface
    ///     reach their terminal state when the enclosed Windows Runtime asynchronous operation or action completes. Similarly, tasks created
    ///     from a lambda that returns a <c>task&lt;result_type&gt;</c> reach their terminal state when the inner task reaches its terminal state,
    ///     and not when the lambda returns.</para>
    ///     <para><c>task</c> behaves like a smart pointer and is safe to pass around by value. It can be accessed by multiple threads
    ///     without the need for locks.</para>
    ///     <para>The constructor overloads that take a Windows::Foundation::IAsyncInfo interface or a lambda returning such an interface, are only available
    ///     to Windows Store apps.</para>
    ///     <para>For more information, see <see cref="Task Parallelism (Concurrency Runtime)"/>.</para>
    /// </remarks>
    /**/
    template<typename _Ty>
    __declspec(noinline) // Ask for no inlining so that the _CAPTURE_CALLSTACK gives us the expected result
    explicit task(_Ty _Param, const task_options &_TaskOptions)
    {
        details::_ValidateTaskConstructorArgs<_ReturnType,_Ty>(_Param);

        _CreateImpl(_TaskOptions.get_cancellation_token()._GetImplValue(), _TaskOptions.get_scheduler());
        // Do not move the next line out of this function. It is important that _CAPTURE_CALLSTACK() evaluates to the call site of the task constructor.
        _SetTaskCreationCallstack(details::_get_internal_task_options(_TaskOptions)._M_hasPresetCreationCallstack ? details::_get_internal_task_options(_TaskOptions)._M_presetCreationCallstack : _CAPTURE_CALLSTACK());

        _TaskInitMaybeFunctor(_Param, decltype(details::_IsCallable(_Param,0))());
    }

    /// <summary>
    ///     Constructs a <c>task</c> object.
    /// </summary>
    /// <param name="_Other">
    ///     The source <c>task</c> object.
    /// </param>
    /// <remarks>
    ///     The default constructor for a <c>task</c> is only present in order to allow tasks to be used within containers.
    ///     A default constructed task cannot be used until you assign a valid task to it. Methods such as <c>get</c>, <c>wait</c> or <c>then</c>
    ///     will throw an <see cref="invalid_argument Class">invalid_argument</see> exception when called on a default constructed task.
    ///     <para>A task that is created from a <c>task_completion_event</c> will complete (and have its continuations scheduled) when the task
    ///     completion event is set.</para>
    ///     <para>The version of the constructor that takes a cancellation token creates a task that can be canceled using the
    ///     <c>cancellation_token_source</c> the token was obtained from. Tasks created without a cancellation token are not cancelable.</para>
    ///     <para>Tasks created from a <c>Windows::Foundation::IAsyncInfo</c> interface or a lambda that returns an <c>IAsyncInfo</c> interface
    ///     reach their terminal state when the enclosed Windows Runtime asynchronous operation or action completes. Similarly, tasks created
    ///     from a lambda that returns a <c>task&lt;result_type&gt;</c> reach their terminal state when the inner task reaches its terminal state,
    ///     and not when the lambda returns.</para>
    ///     <para><c>task</c> behaves like a smart pointer and is safe to pass around by value. It can be accessed by multiple threads
    ///     without the need for locks.</para>
    ///     <para>The constructor overloads that take a Windows::Foundation::IAsyncInfo interface or a lambda returning such an interface, are only available
    ///     to Windows Store apps.</para>
    ///     <para>For more information, see <see cref="Task Parallelism (Concurrency Runtime)"/>.</para>
    /// </remarks>
    /**/
    task(const task& _Other) noexcept : _M_Impl(_Other._M_Impl) {}

    /// <summary>
    ///     Constructs a <c>task</c> object.
    /// </summary>
    /// <param name="_Other">
    ///     The source <c>task</c> object.
    /// </param>
    /// <remarks>
    ///     The default constructor for a <c>task</c> is only present in order to allow tasks to be used within containers.
    ///     A default constructed task cannot be used until you assign a valid task to it. Methods such as <c>get</c>, <c>wait</c> or <c>then</c>
    ///     will throw an <see cref="invalid_argument Class">invalid_argument</see> exception when called on a default constructed task.
    ///     <para>A task that is created from a <c>task_completion_event</c> will complete (and have its continuations scheduled) when the task
    ///     completion event is set.</para>
    ///     <para>The version of the constructor that takes a cancellation token creates a task that can be canceled using the
    ///     <c>cancellation_token_source</c> the token was obtained from. Tasks created without a cancellation token are not cancelable.</para>
    ///     <para>Tasks created from a <c>Windows::Foundation::IAsyncInfo</c> interface or a lambda that returns an <c>IAsyncInfo</c> interface
    ///     reach their terminal state when the enclosed Windows Runtime asynchronous operation or action completes. Similarly, tasks created
    ///     from a lambda that returns a <c>task&lt;result_type&gt;</c> reach their terminal state when the inner task reaches its terminal state,
    ///     and not when the lambda returns.</para>
    ///     <para><c>task</c> behaves like a smart pointer and is safe to pass around by value. It can be accessed by multiple threads
    ///     without the need for locks.</para>
    ///     <para>The constructor overloads that take a Windows::Foundation::IAsyncInfo interface or a lambda returning such an interface, are only available
    ///     to Windows Store apps.</para>
    ///     <para>For more information, see <see cref="Task Parallelism (Concurrency Runtime)"/>.</para>
    /// </remarks>
    /**/
    task(task&& _Other) noexcept : _M_Impl(::std::move(_Other._M_Impl)) {}

    /// <summary>
    ///     Replaces the contents of one <c>task</c> object with another.
    /// </summary>
    /// <param name="_Other">
    ///     The source <c>task</c> object.
    /// </param>
    /// <remarks>
    ///     As <c>task</c> behaves like a smart pointer, after a copy assignment, this <c>task</c> objects represents the same
    ///     actual task as <paramref name="_Other"/> does.
    /// </remarks>
    /**/
    task& operator=(const task& _Other) noexcept
    {
        if (this != &_Other)
        {
            _M_Impl = _Other._M_Impl;
        }
        return *this;
    }

    /// <summary>
    ///     Replaces the contents of one <c>task</c> object with another.
    /// </summary>
    /// <param name="_Other">
    ///     The source <c>task</c> object.
    /// </param>
    /// <remarks>
    ///     As <c>task</c> behaves like a smart pointer, after a copy assignment, this <c>task</c> objects represents the same
    ///     actual task as <paramref name="_Other"/> does.
    /// </remarks>
    /**/
    task& operator=(task&& _Other) noexcept
    {
        if (this != &_Other)
        {
            _M_Impl = ::std::move(_Other._M_Impl);
        }
        return *this;
    }

    /// <summary>
    ///     Adds a continuation task to this task.
    /// </summary>
    /// <typeparam name="_Function">
    ///     The type of the function object that will be invoked by this task.
    /// </typeparam>
    /// <param name="_Func">
    ///     The continuation function to execute when this task completes. This continuation function must take as input
    ///     a variable of either <c>result_type</c> or <c>task&lt;result_type&gt;</c>, where <c>result_type</c> is the type
    ///     of the result this task produces.
    /// </param>
    /// <returns>
    ///     The newly created continuation task. The result type of the returned task is determined by what <paramref name="_Func"/> returns.
    /// </returns>
    /// <remarks>
    ///     The overloads of <c>then</c> that take a lambda or functor that returns a Windows::Foundation::IAsyncInfo interface, are only available
    ///     to Windows Store apps.
    ///     <para>For more information on how to use task continuations to compose asynchronous work, see <see cref="Task Parallelism (Concurrency Runtime)"/>.</para>
    /// </remarks>
    /**/
    template<typename _Function>
    __declspec(noinline) // Ask for no inlining so that the _CAPTURE_CALLSTACK gives us the expected result
    auto then(const _Function& _Func) const -> typename details::_ContinuationTypeTraits<_Function, _ReturnType>::_TaskOfType
    {
        task_options _TaskOptions;
        details::_get_internal_task_options(_TaskOptions)._set_creation_callstack(_CAPTURE_CALLSTACK());

        // Note: _ThenImpl's implementation makes a copy of the continuation_context when it schedules the continuation.
        //       The Continuation Context used to create the _ThenImplOptions must still exist when _ThenImpl executes.
        auto _ContinuationContext = _TaskOptions.get_continuation_context();
        auto _Options = details::_ThenImplOptions::_CreateOptions(_TaskOptions, _ContinuationContext, _ThenGetImpl()->_GetScheduler());

#ifndef _PPLTASKS_NO_STDFUNC
        return _ThenImpl<_ReturnType>(typename details::_ContinuationTypeTraits<_Function, _ReturnType>::_StdFuncT(_Func), _Options);
#else
        return _ThenImpl<_ReturnType>(_Func, _Options);
#endif
    }

    /// <summary>
    ///     Adds a continuation task to this task.
    /// </summary>
    /// <typeparam name="_Function">
    ///     The type of the function object that will be invoked by this task.
    /// </typeparam>
    /// <param name="_Func">
    ///     The continuation function to execute when this task completes. This continuation function must take as input
    ///     a variable of either <c>result_type</c> or <c>task&lt;result_type&gt;</c>, where <c>result_type</c> is the type
    ///     of the result this task produces.
    /// </param>
    /// <param name="_TaskOptions">
    ///     The task options include cancellation token, scheduler and continuation context. By default the former 3
    ///     options are inherited from the antecedent task
    /// </param>
    /// <returns>
    ///     The newly created continuation task. The result type of the returned task is determined by what <paramref name="_Func"/> returns.
    /// </returns>
    /// <remarks>
    ///     The overloads of <c>then</c> that take a lambda or functor that returns a Windows::Foundation::IAsyncInfo interface, are only available
    ///     to Windows Store apps.
    ///     <para>For more information on how to use task continuations to compose asynchronous work, see <see cref="Task Parallelism (Concurrency Runtime)"/>.</para>
    /// </remarks>
    /**/
    template<typename _Function>
    __declspec(noinline) // Ask for no inlining so that the _CAPTURE_CALLSTACK gives us the expected result
    auto then(const _Function& _Func, task_options _TaskOptions) const -> typename details::_ContinuationTypeTraits<_Function, _ReturnType>::_TaskOfType
    {
        details::_get_internal_task_options(_TaskOptions)._set_creation_callstack(_CAPTURE_CALLSTACK());

        // Note: _ThenImpl's implementation makes a copy of the continuation_context when it schedules the continuation.
        //       The Continuation Context used to create the _ThenImplOptions must still exist when _ThenImpl executes.
        auto _ContinuationContext = _TaskOptions.get_continuation_context();
        auto _Options = details::_ThenImplOptions::_CreateOptions(_TaskOptions, _ContinuationContext, _ThenGetImpl()->_GetScheduler());

#ifndef _PPLTASKS_NO_STDFUNC
        return _ThenImpl<_ReturnType>(typename details::_ContinuationTypeTraits<_Function, _ReturnType>::_StdFuncT(_Func), _Options);
#else
        return _ThenImpl<_ReturnType>(_Func, _Options);
#endif
    }

    /// <summary>
    ///     Adds a continuation task to this task.
    /// </summary>
    /// <typeparam name="_Function">
    ///     The type of the function object that will be invoked by this task.
    /// </typeparam>
    /// <param name="_Func">
    ///     The continuation function to execute when this task completes. This continuation function must take as input
    ///     a variable of either <c>result_type</c> or <c>task&lt;result_type&gt;</c>, where <c>result_type</c> is the type
    ///     of the result this task produces.
    /// </param>
    /// <param name="_CancellationToken">
    ///     The cancellation token to associate with the continuation task. A continuation task that is created without a cancellation token will inherit
    ///     the token of its antecedent task.
    /// </param>
    /// <param name="_ContinuationContext">
    ///     A variable that specifies where the continuation should execute. This variable is only useful when used in a Windows Store
    ///     style app. For more information, see <see cref="task_continuation_context Class">task_continuation_context</see>
    /// </param>
    /// <returns>
    ///     The newly created continuation task. The result type of the returned task is determined by what <paramref name="_Func"/> returns.
    /// </returns>
    /// <remarks>
    ///     The overloads of <c>then</c> that take a lambda or functor that returns a Windows::Foundation::IAsyncInfo interface, are only available
    ///     to Windows Store apps.
    ///     <para>For more information on how to use task continuations to compose asynchronous work, see <see cref="Task Parallelism (Concurrency Runtime)"/>.</para>
    /// </remarks>
    /**/
    template<typename _Function>
    __declspec(noinline) // Ask for no inlining so that the _CAPTURE_CALLSTACK gives us the expected result
    auto then(const _Function& _Func, cancellation_token _CancellationToken, task_continuation_context _ContinuationContext) const -> typename details::_ContinuationTypeTraits<_Function, _ReturnType>::_TaskOfType
    {

        task_options _TaskOptions(_CancellationToken, _ContinuationContext);
        details::_get_internal_task_options(_TaskOptions)._set_creation_callstack(_CAPTURE_CALLSTACK());

        auto _Options = details::_ThenImplOptions::_CreateOptions(_TaskOptions, _ContinuationContext, _ThenGetImpl()->_GetScheduler());

#ifndef _PPLTASKS_NO_STDFUNC
        return _ThenImpl<_ReturnType>(typename details::_ContinuationTypeTraits<_Function, _ReturnType>::_StdFuncT(_Func), _Options);
#else
        return _ThenImpl<_ReturnType>(_Func, _Options);
#endif
    }

    /// <summary>
    ///     Waits for this task to reach a terminal state. It is possible for <c>wait</c> to execute the task inline, if all of the tasks
    ///     dependencies are satisfied, and it has not already been picked up for execution by a background worker.
    /// </summary>
    /// <returns>
    ///     A <c>task_status</c> value which could be either <c>completed</c> or <c>canceled</c>. If the task encountered an exception
    ///     during execution, or an exception was propagated to it from an antecedent task, <c>wait</c> will throw that exception.
    /// </returns>
    /**/
    task_status wait() const
    {
        if (!_M_Impl)
        {
            details::_DefaultTaskHelper::_NoCallOnDefaultTask_ErrorImpl();
        }

        return _M_Impl->_Wait();
    }

    /// <summary>
    ///     Returns the result this task produced. If the task is not in a terminal state, a call to <c>get</c> will wait for the task to
    ///     finish. This method does not return a value when called on a task with a <c>result_type</c> of <c>void</c>.
    /// </summary>
    /// <returns>
    ///     The result of the task.
    /// </returns>
    /// <remarks>
    ///     If the task is canceled, a call to <c>get</c> will throw a <see cref="task_canceled Class">task_canceled</see> exception. If the task
    ///     encountered an different exception or an exception was propagated to it from an antecedent task, a call to <c>get</c> will throw that exception.
    /// </remarks>
    /**/
    _ReturnType get() const
    {
        if (!_M_Impl)
        {
            details::_DefaultTaskHelper::_NoCallOnDefaultTask_ErrorImpl();
        }

        if (_M_Impl->_Wait() == canceled)
        {
            _THROW(task_canceled{});
        }

        return _M_Impl->_GetResult();
    }

    /// <summary>
    ///     Determines if the task is completed.
    /// </summary>
    /// <returns>
    ///     True if the task has completed, false otherwise.
    /// </returns>
    /// <remarks>
    ///     The function returns true if the task is completed or canceled (with or without user exception).
    /// </remarks>
    bool is_done() const
    {
        if (!_M_Impl)
        {
            details::_DefaultTaskHelper::_NoCallOnDefaultTask_ErrorImpl();
        }

        return _M_Impl->_IsDone();
    }

    /// <summary>
    ///     Returns the scheduler for this task
    /// </summary>
    /// <returns>
    ///     A pointer to the scheduler
    /// </returns>
    scheduler_ptr scheduler() const
    {
        if (!_M_Impl)
        {
            details::_DefaultTaskHelper::_NoCallOnDefaultTask_ErrorImpl();
        }

        return _M_Impl->_GetScheduler();
    }

    /// <summary>
    ///     Determines whether the task unwraps a Windows Runtime <c>IAsyncInfo</c> interface or is descended from such a task.
    /// </summary>
    /// <returns>
    ///     <c>true</c> if the task unwraps an <c>IAsyncInfo</c> interface or is descended from such a task, <c>false</c> otherwise.
    /// </returns>
    /**/
    bool is_apartment_aware() const
    {
        if (!_M_Impl)
        {
            details::_DefaultTaskHelper::_NoCallOnDefaultTask_ErrorImpl();
        }
        return _M_Impl->_IsApartmentAware();
    }

    /// <summary>
    ///     Determines whether two <c>task</c> objects represent the same internal task.
    /// </summary>
    /// <returns>
    ///     <c>true</c> if the objects refer to the same underlying task, and <c>false</c> otherwise.
    /// </returns>
    /**/
    bool operator==(const task<_ReturnType>& _Rhs) const
    {
        return (_M_Impl == _Rhs._M_Impl);
    }

    /// <summary>
    ///     Determines whether two <c>task</c> objects represent different internal tasks.
    /// </summary>
    /// <returns>
    ///     <c>true</c> if the objects refer to different underlying tasks, and <c>false</c> otherwise.
    /// </returns>
    /**/
    bool operator!=(const task<_ReturnType>& _Rhs) const
    {
        return !operator==(_Rhs);
    }

    /// <summary>
    ///     Create an underlying task implementation.
    /// </summary>
    void _CreateImpl(details::_CancellationTokenState * _Ct, scheduler_ptr _Scheduler)
    {
        _ASSERTE(_Ct != nullptr);
        _M_Impl = details::_Task_ptr<_ReturnType>::_Make(_Ct, _Scheduler);
        if (_Ct != details::_CancellationTokenState::_None())
        {
            _M_Impl->_RegisterCancellation(_M_Impl);
        }
    }

    /// <summary>
    ///     Return the underlying implementation for this task.
    /// </summary>
    const typename details::_Task_ptr<_ReturnType>::_Type & _GetImpl() const
    {
        return _M_Impl;
    }

    const typename details::_Task_ptr<_ReturnType>::_Type & _ThenGetImpl() const
    {
        if (!_M_Impl)
        {
            details::_DefaultTaskHelper::_NoCallOnDefaultTask_ErrorImpl();
        }

        return _M_Impl;
    }

    /// <summary>
    ///     Set the implementation of the task to be the supplied implementation.
    /// </summary>
    void _SetImpl(const typename details::_Task_ptr<_ReturnType>::_Type & _Impl)
    {
        _ASSERTE(!_M_Impl);
        _M_Impl = _Impl;
    }

    /// <summary>
    ///     Set the implementation of the task to be the supplied implementation using a move instead of a copy.
    /// </summary>
    void _SetImpl(typename details::_Task_ptr<_ReturnType>::_Type && _Impl)
    {
        _ASSERTE(!_M_Impl);
        _M_Impl = ::std::move(_Impl);
    }

    /// <summary>
    ///     Sets a property determining whether the task is apartment aware.
    /// </summary>
    void _SetAsync(bool _Async = true)
    {
        _GetImpl()->_SetAsync(_Async);
    }

    /// <summary>
    ///     Sets a field in the task impl to the return callstack for calls to the task constructors and the then method.
    /// </summary>
    void _SetTaskCreationCallstack(const details::_TaskCreationCallstack &_callstack)
    {
        _GetImpl()->_SetTaskCreationCallstack(_callstack);
    }

    /// <summary>
    ///     An internal version of then that takes additional flags and always execute the continuation inline by default.
    ///     When _ForceInline is set to false, continuations inlining will be limited to default _DefaultAutoInline.
    ///     This function is Used for runtime internal continuations only.
    /// </summary>
    template<typename _Function>
    auto _Then(const _Function& _Func, details::_CancellationTokenState *_PTokenState,
        details::_TaskInliningMode_t _InliningMode = details::_ForceInline) const -> typename details::_ContinuationTypeTraits<_Function, _ReturnType>::_TaskOfType
    {
        // inherit from antecedent
        auto _Scheduler = _GetImpl()->_GetScheduler();

        // Note: _ThenImpl's implementation makes a copy of the continuation_context when it schedules the continuation.  '
        //       The Continuation Context used to create the _ThenImplOptions must still exist when _ThenImpl executes.
        auto _Default_Context = task_continuation_context::use_default();
        details::_ThenImplOptions _Options (_PTokenState, &_Default_Context, _Scheduler, _CAPTURE_CALLSTACK(), _InliningMode);

#ifndef _PPLTASKS_NO_STDFUNC
        return _ThenImpl<_ReturnType>(typename details::_ContinuationTypeTraits<_Function, _ReturnType>::_StdFuncT(_Func), _Options);
#else
        return _ThenImpl<_ReturnType>(_Func, _Options);
#endif
    }

private:
    template <typename _Ty> friend class task;


    // The task handle type used to construct an 'initial task' - a task with no dependents.
    template <typename _InternalReturnType, typename _Function, typename _TypeSelection>
    struct _InitialTaskHandle :
        details::_PPLTaskHandle<_ReturnType, _InitialTaskHandle<_InternalReturnType, _Function, _TypeSelection>, details::_UnrealizedChore_t>
    {
        _Function _M_function;
        _InitialTaskHandle(const typename details::_Task_ptr<_ReturnType>::_Type & _TaskImpl, const _Function & _func)
            : details::_PPLTaskHandle<_ReturnType, _InitialTaskHandle<_InternalReturnType, _Function, _TypeSelection>, details::_UnrealizedChore_t>::_PPLTaskHandle(_TaskImpl)
            , _M_function(_func)
        {
        }

        virtual ~_InitialTaskHandle() {}

        template <typename _Func>
        auto _LogWorkItemAndInvokeUserLambda(_Func _func) const -> decltype(_func())
        {
            details::_TaskWorkItemRAIILogger _LogWorkItem(this->_M_pTask->_M_taskEventLogger);
            return _func();
        }

        void _Perform() const
        {
            _Init(_TypeSelection());
        }

        void _SyncCancelAndPropagateException() const
        {
            this->_M_pTask->_Cancel(true);
        }

        //
        // Overload 0: returns _InternalReturnType
        //
        // This is the most basic task with no unwrapping
        //
        void _Init(details::_TypeSelectorNoAsync) const
        {
            this->_M_pTask->_FinalizeAndRunContinuations(_LogWorkItemAndInvokeUserLambda(_Init_func_transformer<_InternalReturnType>::_Perform(_M_function)));
        }

        //
        // Overload 1: returns IAsyncOperation<_InternalReturnType>^ (only under /ZW)
        //                   or
        //             returns task<_InternalReturnType>
        //
        // This is task whose functor returns an async operation or a task which will be unwrapped for continuation
        // Depending on the output type, the right _AsyncInit gets invoked
        //
        void _Init(details::_TypeSelectorAsyncOperationOrTask) const
        {
            details::_Task_impl_base::_AsyncInit<_ReturnType, _InternalReturnType>(this->_M_pTask, _LogWorkItemAndInvokeUserLambda(_M_function));
        }

#if defined (__cplusplus_winrt)
        //
        // Overload 2: returns IAsyncAction^
        //
        // This is task whose functor returns an async action which will be unwrapped for continuation
        //
        void _Init(details::_TypeSelectorAsyncAction) const
        {
            details::_Task_impl_base::_AsyncInit<_ReturnType, _InternalReturnType>(this->_M_pTask, ref new details::_IAsyncActionToAsyncOperationConverter(_LogWorkItemAndInvokeUserLambda(_M_function)));
        }

        //
        // Overload 3: returns IAsyncOperationWithProgress<_InternalReturnType, _ProgressType>^
        //
        // This is task whose functor returns an async operation with progress which will be unwrapped for continuation
        //
        void _Init(details::_TypeSelectorAsyncOperationWithProgress) const
        {
            typedef details::_GetProgressType<decltype(_M_function())>::_Value _ProgressType;

            details::_Task_impl_base::_AsyncInit<_ReturnType, _InternalReturnType>(this->_M_pTask,
                    ref new details::_IAsyncOperationWithProgressToAsyncOperationConverter<_InternalReturnType,_ProgressType>(_LogWorkItemAndInvokeUserLambda(_M_function)));
        }

        //
        // Overload 4: returns IAsyncActionWithProgress<_ProgressType>^
        //
        // This is task whose functor returns an async action with progress which will be unwrapped for continuation
        //
        void _Init(details::_TypeSelectorAsyncActionWithProgress) const
        {
            typedef details::_GetProgressType<decltype(_M_function())>::_Value _ProgressType;

            details::_Task_impl_base::_AsyncInit<_ReturnType, _InternalReturnType>(this->_M_pTask,
                ref new details::_IAsyncActionWithProgressToAsyncOperationConverter<_ProgressType>(_LogWorkItemAndInvokeUserLambda(_M_function)));
        }
#endif  /* defined (__cplusplus_winrt) */
    };


    /// <summary>
    ///     The task handle type used to create a 'continuation task'.
    /// </summary>
    template <typename _InternalReturnType, typename _ContinuationReturnType, typename _Function, typename _IsTaskBased, typename _TypeSelection>
    struct _ContinuationTaskHandle :
        details::_PPLTaskHandle<typename details::_NormalizeVoidToUnitType<_ContinuationReturnType>::_Type,
        _ContinuationTaskHandle<_InternalReturnType, _ContinuationReturnType, _Function, _IsTaskBased, _TypeSelection>, details::_ContinuationTaskHandleBase>
    {
        typedef typename details::_NormalizeVoidToUnitType<_ContinuationReturnType>::_Type _NormalizedContinuationReturnType;

        typename details::_Task_ptr<_ReturnType>::_Type _M_ancestorTaskImpl;
        _Function _M_function;

        _ContinuationTaskHandle(const typename details::_Task_ptr<_ReturnType>::_Type & _AncestorImpl,
            const typename details::_Task_ptr<_NormalizedContinuationReturnType>::_Type & _ContinuationImpl,
            const _Function & _Func, const task_continuation_context & _Context, details::_TaskInliningMode_t _InliningMode)
                : details::_PPLTaskHandle<typename details::_NormalizeVoidToUnitType<_ContinuationReturnType>::_Type,
                    _ContinuationTaskHandle<_InternalReturnType, _ContinuationReturnType, _Function, _IsTaskBased, _TypeSelection>, details::_ContinuationTaskHandleBase>
                    ::_PPLTaskHandle(_ContinuationImpl)
                , _M_ancestorTaskImpl(_AncestorImpl)
                , _M_function(_Func)
        {
            this->_M_isTaskBasedContinuation = _IsTaskBased::value;
            this->_M_continuationContext = _Context;
            this->_M_continuationContext._Resolve(_AncestorImpl->_IsApartmentAware());
            this->_M_inliningMode = _InliningMode;
        }

        virtual ~_ContinuationTaskHandle() {}

        template <typename _Func, typename _Arg>
        auto _LogWorkItemAndInvokeUserLambda(_Func && _func, _Arg && _value) const -> decltype(_func(::std::forward<_Arg>(_value)))
        {
            details::_TaskWorkItemRAIILogger _LogWorkItem(this->_M_pTask->_M_taskEventLogger);
            return _func(::std::forward<_Arg>(_value));
        }

        void _Perform() const
        {
            _Continue(_IsTaskBased(), _TypeSelection());
        }

        void _SyncCancelAndPropagateException() const
        {
            if (_M_ancestorTaskImpl->_HasUserException())
            {
                // If the ancestor encountered an exception, transfer the exception to the continuation
                // This traverses down the tree to propagate the exception.
                this->_M_pTask->_CancelWithExceptionHolder(_M_ancestorTaskImpl->_GetExceptionHolder(), true);
            }
            else
            {
                // If the ancestor was canceled, then your own execution should be canceled.
                // This traverses down the tree to cancel it.
                this->_M_pTask->_Cancel(true);
            }
        }

        //
        // Overload 0-0: _InternalReturnType -> _TaskType
        //
        // This is a straight task continuation which simply invokes its target with the ancestor's completion argument
        //
        void _Continue(::std::false_type, details::_TypeSelectorNoAsync) const
        {
            this->_M_pTask->_FinalizeAndRunContinuations(
                _LogWorkItemAndInvokeUserLambda(_Continuation_func_transformer<_InternalReturnType, _ContinuationReturnType>::_Perform(_M_function), _M_ancestorTaskImpl->_GetResult()));
        }

        //
        // Overload 0-1: _InternalReturnType -> IAsyncOperation<_TaskType>^ (only under /ZW)
        //               or
        //               _InternalReturnType -> task<_TaskType>
        //
        // This is a straight task continuation which returns an async operation or a task which will be unwrapped for continuation
        // Depending on the output type, the right _AsyncInit gets invoked
        //
        void _Continue(::std::false_type, details::_TypeSelectorAsyncOperationOrTask) const
        {
            typedef typename details::_FunctionTypeTraits<_Function, _InternalReturnType>::_FuncRetType _FuncOutputType;

            details::_Task_impl_base::_AsyncInit<_NormalizedContinuationReturnType, _ContinuationReturnType>(
                this->_M_pTask,
                _LogWorkItemAndInvokeUserLambda(_Continuation_func_transformer<_InternalReturnType, _FuncOutputType>::_Perform(_M_function), _M_ancestorTaskImpl->_GetResult())
            );
        }

#if defined (__cplusplus_winrt)
        //
        // Overload 0-2: _InternalReturnType -> IAsyncAction^
        //
        // This is a straight task continuation which returns an async action which will be unwrapped for continuation
        //
        void _Continue(::std::false_type, details::_TypeSelectorAsyncAction) const
        {
            typedef details::_FunctionTypeTraits<_Function, _InternalReturnType>::_FuncRetType _FuncOutputType;

            details::_Task_impl_base::_AsyncInit<_NormalizedContinuationReturnType, _ContinuationReturnType>(
                this->_M_pTask,
                ref new details::_IAsyncActionToAsyncOperationConverter(
                    _LogWorkItemAndInvokeUserLambda(_Continuation_func_transformer<_InternalReturnType, _FuncOutputType>::_Perform(_M_function), _M_ancestorTaskImpl->_GetResult())));
        }

        //
        // Overload 0-3: _InternalReturnType -> IAsyncOperationWithProgress<_TaskType, _ProgressType>^
        //
        // This is a straight task continuation which returns an async operation with progress which will be unwrapped for continuation
        //
        void _Continue(::std::false_type, details::_TypeSelectorAsyncOperationWithProgress) const
        {
            typedef details::_FunctionTypeTraits<_Function, _InternalReturnType>::_FuncRetType _FuncOutputType;

            auto _OpWithProgress = _LogWorkItemAndInvokeUserLambda(_Continuation_func_transformer<_InternalReturnType, _FuncOutputType>::_Perform(_M_function), _M_ancestorTaskImpl->_GetResult());
            typedef details::_GetProgressType<decltype(_OpWithProgress)>::_Value _ProgressType;

            details::_Task_impl_base::_AsyncInit<_NormalizedContinuationReturnType, _ContinuationReturnType>(
                this->_M_pTask,
                ref new details::_IAsyncOperationWithProgressToAsyncOperationConverter<_ContinuationReturnType, _ProgressType>(_OpWithProgress));
        }

        //
        // Overload 0-4: _InternalReturnType -> IAsyncActionWithProgress<_ProgressType>^
        //
        // This is a straight task continuation which returns an async action with progress which will be unwrapped for continuation
        //
        void _Continue(::std::false_type, details::_TypeSelectorAsyncActionWithProgress) const
        {
            typedef details::_FunctionTypeTraits<_Function, _InternalReturnType>::_FuncRetType _FuncOutputType;

            auto _OpWithProgress = _LogWorkItemAndInvokeUserLambda(_Continuation_func_transformer<_InternalReturnType, _FuncOutputType>::_Perform(_M_function), _M_ancestorTaskImpl->_GetResult());
            typedef details::_GetProgressType<decltype(_OpWithProgress)>::_Value _ProgressType;

            details::_Task_impl_base::_AsyncInit<_NormalizedContinuationReturnType, _ContinuationReturnType>(
                this->_M_pTask,
                ref new details::_IAsyncActionWithProgressToAsyncOperationConverter<_ProgressType>(_OpWithProgress));
        }

#endif  /* defined (__cplusplus_winrt) */

        //
        // Overload 1-0: task<_InternalReturnType> -> _TaskType
        //
        // This is an exception handling type of continuation which takes the task rather than the task's result.
        //
        void _Continue(::std::true_type, details::_TypeSelectorNoAsync) const
        {
            typedef task<_InternalReturnType> _FuncInputType;
            task<_InternalReturnType> _ResultTask;
            _ResultTask._SetImpl(::std::move(_M_ancestorTaskImpl));
            this->_M_pTask->_FinalizeAndRunContinuations(
                _LogWorkItemAndInvokeUserLambda(_Continuation_func_transformer<_FuncInputType, _ContinuationReturnType>::_Perform(_M_function), ::std::move(_ResultTask)));
        }

        //
        // Overload 1-1: task<_InternalReturnType> -> IAsyncOperation<_TaskType>^
        //                                            or
        //                                            task<_TaskType>
        //
        // This is an exception handling type of continuation which takes the task rather than
        // the task's result. It also returns an async operation or a task which will be unwrapped
        // for continuation
        //
        void _Continue(::std::true_type, details::_TypeSelectorAsyncOperationOrTask) const
        {
            // The continuation takes a parameter of type task<_Input>, which is the same as the ancestor task.
            task<_InternalReturnType> _ResultTask;
            _ResultTask._SetImpl(::std::move(_M_ancestorTaskImpl));
            details::_Task_impl_base::_AsyncInit<_NormalizedContinuationReturnType, _ContinuationReturnType>(this->_M_pTask,
                _LogWorkItemAndInvokeUserLambda(_M_function, ::std::move(_ResultTask)));
        }

#if defined (__cplusplus_winrt)

        //
        // Overload 1-2: task<_InternalReturnType> -> IAsyncAction^
        //
        // This is an exception handling type of continuation which takes the task rather than
        // the task's result. It also returns an async action which will be unwrapped for continuation
        //
        void _Continue(::std::true_type, details::_TypeSelectorAsyncAction) const
        {
            // The continuation takes a parameter of type task<_Input>, which is the same as the ancestor task.
            task<_InternalReturnType> _ResultTask;
            _ResultTask._SetImpl(::std::move(_M_ancestorTaskImpl));
            details::_Task_impl_base::_AsyncInit<_NormalizedContinuationReturnType, _ContinuationReturnType>(this->_M_pTask,
                ref new details::_IAsyncActionToAsyncOperationConverter(_LogWorkItemAndInvokeUserLambda(_M_function, ::std::move(_ResultTask))));
        }

        //
        // Overload 1-3: task<_InternalReturnType> -> IAsyncOperationWithProgress<_TaskType, _ProgressType>^
        //
        // This is an exception handling type of continuation which takes the task rather than
        // the task's result. It also returns an async operation with progress which will be unwrapped
        // for continuation
        //
        void _Continue(::std::true_type, details::_TypeSelectorAsyncOperationWithProgress) const
        {
            // The continuation takes a parameter of type task<_Input>, which is the same as the ancestor task.
            task<_InternalReturnType> _ResultTask;
            _ResultTask._SetImpl(::std::move(_M_ancestorTaskImpl));

            typedef details::_GetProgressType<decltype(_M_function(_ResultTask))>::_Value _ProgressType;

            details::_Task_impl_base::_AsyncInit<_NormalizedContinuationReturnType, _ContinuationReturnType>(this->_M_pTask,
                    ref new details::_IAsyncOperationWithProgressToAsyncOperationConverter<_ContinuationReturnType, _ProgressType>(
                    _LogWorkItemAndInvokeUserLambda(_M_function, ::std::move(_ResultTask))));
        }

        //
        // Overload 1-4: task<_InternalReturnType> -> IAsyncActionWithProgress<_ProgressType>^
        //
        // This is an exception handling type of continuation which takes the task rather than
        // the task's result. It also returns an async operation with progress which will be unwrapped
        // for continuation
        //
        void _Continue(::std::true_type, details::_TypeSelectorAsyncActionWithProgress) const
        {
            // The continuation takes a parameter of type task<_Input>, which is the same as the ancestor task.
            task<_InternalReturnType> _ResultTask;
            _ResultTask._SetImpl(::std::move(_M_ancestorTaskImpl));

            typedef details::_GetProgressType<decltype(_M_function(_ResultTask))>::_Value _ProgressType;

            details::_Task_impl_base::_AsyncInit<_NormalizedContinuationReturnType, _ContinuationReturnType>(this->_M_pTask,
                    ref new details::_IAsyncActionWithProgressToAsyncOperationConverter<_ProgressType>(
                    _LogWorkItemAndInvokeUserLambda(_M_function, ::std::move(_ResultTask))));
        }
#endif  /* defined (__cplusplus_winrt) */
    };

    /// <summary>
    ///     Initializes a task using a lambda, function pointer or function object.
    /// </summary>
    template<typename _InternalReturnType, typename _Function>
    void _TaskInitWithFunctor(const _Function& _Func)
    {
        typedef typename details::_InitFunctorTypeTraits<_InternalReturnType, decltype(::std::declval<_Function>()())> _Async_type_traits;

        _M_Impl->_M_fFromAsync = _Async_type_traits::_IsAsyncTask;
        _M_Impl->_M_fUnwrappedTask = _Async_type_traits::_IsUnwrappedTaskOrAsync;
        _M_Impl->_M_taskEventLogger._LogScheduleTask(false);
        _M_Impl->_ScheduleTask(new _InitialTaskHandle<_InternalReturnType, _Function, typename _Async_type_traits::_AsyncKind>(_GetImpl(), _Func), details::_NoInline);
    }

    /// <summary>
    ///     Initializes a task using a task completion event.
    /// </summary>
    void _TaskInitNoFunctor(task_completion_event<_ReturnType>& _Event)
    {
        _Event._RegisterTask(_M_Impl);
    }

#if defined (__cplusplus_winrt)
    /// <summary>
    ///     Initializes a task using an asynchronous operation IAsyncOperation<T>^
    /// </summary>
    void _TaskInitAsyncOp(Windows::Foundation::IAsyncOperation<typename details::_ValueTypeOrRefType<_ReturnType>::_Value>^ _AsyncOp)
    {
        _M_Impl->_M_fFromAsync = true;

        // Pass the shared pointer into _AsyncInit for storage in the Async Callback.
        details::_Task_impl_base::_AsyncInit<_ReturnType, _ReturnType>(_M_Impl, _AsyncOp);
    }

    /// <summary>
    ///     Initializes a task using an asynchronous operation IAsyncOperation<T>^
    /// </summary>
    void _TaskInitNoFunctor(Windows::Foundation::IAsyncOperation<typename details::_ValueTypeOrRefType<_ReturnType>::_Value>^ _AsyncOp)
    {
        _TaskInitAsyncOp(_AsyncOp);
    }

    /// <summary>
    ///     Initializes a task using an asynchronous operation with progress IAsyncOperationWithProgress<T, P>^
    /// </summary>
    template<typename _Progress>
    void _TaskInitNoFunctor(Windows::Foundation::IAsyncOperationWithProgress<typename details::_ValueTypeOrRefType<_ReturnType>::_Value, _Progress>^ _AsyncOp)
    {
        _TaskInitAsyncOp(ref new details::_IAsyncOperationWithProgressToAsyncOperationConverter<typename details::_ValueTypeOrRefType<_ReturnType>::_Value, _Progress>(_AsyncOp));
    }
#endif  /* defined (__cplusplus_winrt) */

    /// <summary>
    ///     Initializes a task using a callable object.
    /// </summary>
    template<typename _Function>
    void _TaskInitMaybeFunctor(_Function& _Func, ::std::true_type)
    {
        _TaskInitWithFunctor<_ReturnType, _Function>(_Func);
    }

    /// <summary>
    ///     Initializes a task using a non-callable object.
    /// </summary>
    template<typename _Ty>
    void _TaskInitMaybeFunctor(_Ty& _Param, ::std::false_type)
    {
        _TaskInitNoFunctor(_Param);
    }

    /// <summary>
    ///     The one and only implementation of then for void and non-void tasks.
    /// </summary>
    template<typename _InternalReturnType, typename _Function>
    auto _ThenImpl(const _Function& _Func, details::_ThenImplOptions& _Options) const -> typename details::_ContinuationTypeTraits<_Function, _InternalReturnType>::_TaskOfType
    {

        typedef details::_FunctionTypeTraits<_Function, _InternalReturnType> _Function_type_traits;
        typedef details::_TaskTypeTraits<typename _Function_type_traits::_FuncRetType> _Async_type_traits;
        typedef typename _Async_type_traits::_TaskRetType _TaskType;

        //
        // A **nullptr** token state indicates that it was not provided by the user. In this case, we inherit the antecedent's token UNLESS this is a
        // an exception handling continuation. In that case, we break the chain with a _None. That continuation is never canceled unless the user
        // explicitly passes the same token.
        //
        if (_Options._PTokenState == nullptr)
        {
            if (_Function_type_traits::_Takes_task::value)
            {
                _Options._PTokenState = details::_CancellationTokenState::_None();
            }
            else
            {
                _Options._PTokenState = _GetImpl()->_M_pTokenState;
            }
        }

        task<_TaskType> _ContinuationTask;
        _ContinuationTask._CreateImpl(_Options._PTokenState, _Options._Scheduler);

        _ContinuationTask._GetImpl()->_M_fFromAsync = (_GetImpl()->_M_fFromAsync || _Async_type_traits::_IsAsyncTask);
        _ContinuationTask._GetImpl()->_M_fUnwrappedTask = _Async_type_traits::_IsUnwrappedTaskOrAsync;
        _ContinuationTask._SetTaskCreationCallstack(_Options._CreationStack);

        _GetImpl()->_ScheduleContinuation(new _ContinuationTaskHandle<_InternalReturnType, _TaskType, _Function, typename _Function_type_traits::_Takes_task, typename _Async_type_traits::_AsyncKind>(
            _GetImpl(), _ContinuationTask._GetImpl(), _Func, *_Options._PContinuationContext, _Options._InliningMode));

        return _ContinuationTask;
    }

    // The underlying implementation for this task
    typename details::_Task_ptr<_ReturnType>::_Type _M_Impl;
};

/// <summary>
///     The Parallel Patterns Library (PPL) <c>task</c> class. A <c>task</c> object represents work that can be executed asynchronously,
///     and concurrently with other tasks and parallel work produced by parallel algorithms in the Concurrency Runtime. It produces
///     a result of type <typeparamref name="_ResultType"/> on successful completion. Tasks of type <c>task&lt;void&gt;</c> produce no result.
///     A task can be waited upon and canceled independently of other tasks. It can also be composed with other tasks using
///     continuations(<c>then</c>), and join(<c>when_all</c>) and choice(<c>when_any</c>) patterns.
/// </summary>
/// <remarks>
///     For more information, see <see cref="Task Parallelism (Concurrency Runtime)"/>.
/// </remarks>
/**/
template<>
class task<void>
{
public:
    /// <summary>
    ///     The type of the result an object of this class produces.
    /// </summary>
    /**/
    typedef void result_type;

    /// <summary>
    ///     Constructs a <c>task</c> object.
    /// </summary>
    /// <remarks>
    ///     The default constructor for a <c>task</c> is only present in order to allow tasks to be used within containers.
    ///     A default constructed task cannot be used until you assign a valid task to it. Methods such as <c>get</c>, <c>wait</c> or <c>then</c>
    ///     will throw an <see cref="invalid_argument Class">invalid_argument</see> exception when called on a default constructed task.
    ///     <para>A task that is created from a <c>task_completion_event</c> will complete (and have its continuations scheduled) when the task
    ///     completion event is set.</para>
    ///     <para>The version of the constructor that takes a cancellation token creates a task that can be canceled using the
    ///     <c>cancellation_token_source</c> the token was obtained from. Tasks created without a cancellation token are not cancelable.</para>
    ///     <para>Tasks created from a <c>Windows::Foundation::IAsyncInfo</c> interface or a lambda that returns an <c>IAsyncInfo</c> interface
    ///     reach their terminal state when the enclosed Windows Runtime asynchronous operation or action completes. Similarly, tasks created
    ///     from a lambda that returns a <c>task&lt;result_type&gt;</c> reach their terminal state when the inner task reaches its terminal state,
    ///     and not when the lambda returns.</para>
    ///     <para><c>task</c> behaves like a smart pointer and is safe to pass around by value. It can be accessed by multiple threads
    ///     without the need for locks.</para>
    ///     <para>The constructor overloads that take a Windows::Foundation::IAsyncInfo interface or a lambda returning such an interface, are only available
    ///     to Windows Store apps.</para>
    ///     <para>For more information, see <see cref="Task Parallelism (Concurrency Runtime)"/>.</para>
    /// </remarks>
    /**/
    task() noexcept : _M_unitTask()
    {
        // The default constructor should create a task with a nullptr impl. This is a signal that the
        // task is not usable and should throw if any wait(), get() or then() APIs are used.
    }

    /// <summary>
    ///     Constructs a <c>task</c> object.
    /// </summary>
    /// <typeparam name="_Ty">
    ///     The type of the parameter from which the task is to be constructed.
    /// </typeparam>
    /// <param name="_Param">
    ///     The parameter from which the task is to be constructed. This could be a lambda, a function object, a <c>task_completion_event&lt;result_type&gt;</c>
    ///     object, or a Windows::Foundation::IAsyncInfo if you are using tasks in your Windows Store app. The lambda or function
    ///     object should be a type equivalent to <c>std::function&lt;X()&gt;</c>, where X can be a variable of type <c>result_type</c>,
    ///     <c>task&lt;result_type&gt;</c>, or a Windows::Foundation::IAsyncInfo in Windows Store apps.
    /// </param>
    /// <remarks>
    ///     The default constructor for a <c>task</c> is only present in order to allow tasks to be used within containers.
    ///     A default constructed task cannot be used until you assign a valid task to it. Methods such as <c>get</c>, <c>wait</c> or <c>then</c>
    ///     will throw an <see cref="invalid_argument Class">invalid_argument</see> exception when called on a default constructed task.
    ///     <para>A task that is created from a <c>task_completion_event</c> will complete (and have its continuations scheduled) when the task
    ///     completion event is set.</para>
    ///     <para>The version of the constructor that takes a cancellation token creates a task that can be canceled using the
    ///     <c>cancellation_token_source</c> the token was obtained from. Tasks created without a cancellation token are not cancelable.</para>
    ///     <para>Tasks created from a <c>Windows::Foundation::IAsyncInfo</c> interface or a lambda that returns an <c>IAsyncInfo</c> interface
    ///     reach their terminal state when the enclosed Windows Runtime asynchronous operation or action completes. Similarly, tasks created
    ///     from a lambda that returns a <c>task&lt;result_type&gt;</c> reach their terminal state when the inner task reaches its terminal state,
    ///     and not when the lambda returns.</para>
    ///     <para><c>task</c> behaves like a smart pointer and is safe to pass around by value. It can be accessed by multiple threads
    ///     without the need for locks.</para>
    ///     <para>The constructor overloads that take a Windows::Foundation::IAsyncInfo interface or a lambda returning such an interface, are only available
    ///     to Windows Store apps.</para>
    ///     <para>For more information, see <see cref="Task Parallelism (Concurrency Runtime)"/>.</para>
    /// </remarks>
    /**/
    template<typename _Ty>
    __declspec(noinline) // Ask for no inlining so that the _CAPTURE_CALLSTACK gives us the expected result
    explicit task(_Ty _Param, const task_options& _TaskOptions = task_options())
    {
        details::_ValidateTaskConstructorArgs<void,_Ty>(_Param);

        _M_unitTask._CreateImpl(_TaskOptions.get_cancellation_token()._GetImplValue(), _TaskOptions.get_scheduler());
        // Do not move the next line out of this function. It is important that _CAPTURE_CALLSTACK() evaluates to the call site of the task constructor.
        _M_unitTask._SetTaskCreationCallstack(details::_get_internal_task_options(_TaskOptions)._M_hasPresetCreationCallstack ? details::_get_internal_task_options(_TaskOptions)._M_presetCreationCallstack : _CAPTURE_CALLSTACK());

        _TaskInitMaybeFunctor(_Param, decltype(details::_IsCallable(_Param,0))());
    }

    /// <summary>
    ///     Constructs a <c>task</c> object.
    /// </summary>
    /// <param name="_Other">
    ///     The source <c>task</c> object.
    /// </param>
    /// <remarks>
    ///     The default constructor for a <c>task</c> is only present in order to allow tasks to be used within containers.
    ///     A default constructed task cannot be used until you assign a valid task to it. Methods such as <c>get</c>, <c>wait</c> or <c>then</c>
    ///     will throw an <see cref="invalid_argument Class">invalid_argument</see> exception when called on a default constructed task.
    ///     <para>A task that is created from a <c>task_completion_event</c> will complete (and have its continuations scheduled) when the task
    ///     completion event is set.</para>
    ///     <para>The version of the constructor that takes a cancellation token creates a task that can be canceled using the
    ///     <c>cancellation_token_source</c> the token was obtained from. Tasks created without a cancellation token are not cancelable.</para>
    ///     <para>Tasks created from a <c>Windows::Foundation::IAsyncInfo</c> interface or a lambda that returns an <c>IAsyncInfo</c> interface
    ///     reach their terminal state when the enclosed Windows Runtime asynchronous operation or action completes. Similarly, tasks created
    ///     from a lambda that returns a <c>task&lt;result_type&gt;</c> reach their terminal state when the inner task reaches its terminal state,
    ///     and not when the lambda returns.</para>
    ///     <para><c>task</c> behaves like a smart pointer and is safe to pass around by value. It can be accessed by multiple threads
    ///     without the need for locks.</para>
    ///     <para>The constructor overloads that take a Windows::Foundation::IAsyncInfo interface or a lambda returning such an interface, are only available
    ///     to Windows Store apps.</para>
    ///     <para>For more information, see <see cref="Task Parallelism (Concurrency Runtime)"/>.</para>
    /// </remarks>
    /**/
    task(const task& _Other) noexcept : _M_unitTask(_Other._M_unitTask){}

    /// <summary>
    ///     Constructs a <c>task</c> object.
    /// </summary>
    /// <param name="_Other">
    ///     The source <c>task</c> object.
    /// </param>
    /// <remarks>
    ///     The default constructor for a <c>task</c> is only present in order to allow tasks to be used within containers.
    ///     A default constructed task cannot be used until you assign a valid task to it. Methods such as <c>get</c>, <c>wait</c> or <c>then</c>
    ///     will throw an <see cref="invalid_argument Class">invalid_argument</see> exception when called on a default constructed task.
    ///     <para>A task that is created from a <c>task_completion_event</c> will complete (and have its continuations scheduled) when the task
    ///     completion event is set.</para>
    ///     <para>The version of the constructor that takes a cancellation token creates a task that can be canceled using the
    ///     <c>cancellation_token_source</c> the token was obtained from. Tasks created without a cancellation token are not cancelable.</para>
    ///     <para>Tasks created from a <c>Windows::Foundation::IAsyncInfo</c> interface or a lambda that returns an <c>IAsyncInfo</c> interface
    ///     reach their terminal state when the enclosed Windows Runtime asynchronous operation or action completes. Similarly, tasks created
    ///     from a lambda that returns a <c>task&lt;result_type&gt;</c> reach their terminal state when the inner task reaches its terminal state,
    ///     and not when the lambda returns.</para>
    ///     <para><c>task</c> behaves like a smart pointer and is safe to pass around by value. It can be accessed by multiple threads
    ///     without the need for locks.</para>
    ///     <para>The constructor overloads that take a Windows::Foundation::IAsyncInfo interface or a lambda returning such an interface, are only available
    ///     to Windows Store apps.</para>
    ///     <para>For more information, see <see cref="Task Parallelism (Concurrency Runtime)"/>.</para>
    /// </remarks>
    /**/
    task(task&& _Other) noexcept : _M_unitTask(::std::move(_Other._M_unitTask)) {}

    /// <summary>
    ///     Replaces the contents of one <c>task</c> object with another.
    /// </summary>
    /// <param name="_Other">
    ///     The source <c>task</c> object.
    /// </param>
    /// <remarks>
    ///     As <c>task</c> behaves like a smart pointer, after a copy assignment, this <c>task</c> objects represents the same
    ///     actual task as <paramref name="_Other"/> does.
    /// </remarks>
    /**/
    task& operator=(const task& _Other) noexcept
    {
        if (this != &_Other)
        {
            _M_unitTask = _Other._M_unitTask;
        }
        return *this;
    }

    /// <summary>
    ///     Replaces the contents of one <c>task</c> object with another.
    /// </summary>
    /// <param name="_Other">
    ///     The source <c>task</c> object.
    /// </param>
    /// <remarks>
    ///     As <c>task</c> behaves like a smart pointer, after a copy assignment, this <c>task</c> objects represents the same
    ///     actual task as <paramref name="_Other"/> does.
    /// </remarks>
    /**/
    task& operator=(task&& _Other) noexcept
    {
        if (this != &_Other)
        {
            _M_unitTask = ::std::move(_Other._M_unitTask);
        }
        return *this;
    }

    /// <summary>
    ///     Adds a continuation task to this task.
    /// </summary>
    /// <typeparam name="_Function">
    ///     The type of the function object that will be invoked by this task.
    /// </typeparam>
    /// <param name="_Func">
    ///     The continuation function to execute when this task completes. This continuation function must take as input
    ///     a variable of either <c>result_type</c> or <c>task&lt;result_type&gt;</c>, where <c>result_type</c> is the type
    ///     of the result this task produces.
    /// </param>
    /// <param name="_CancellationToken">
    ///     The cancellation token to associate with the continuation task. A continuation task that is created without a cancellation token will inherit
    ///     the token of its antecedent task.
    /// </param>
    /// <returns>
    ///     The newly created continuation task. The result type of the returned task is determined by what <paramref name="_Func"/> returns.
    /// </returns>
    /// <remarks>
    ///     The overloads of <c>then</c> that take a lambda or functor that returns a Windows::Foundation::IAsyncInfo interface, are only available
    ///     to Windows Store apps.
    ///     <para>For more information on how to use task continuations to compose asynchronous work, see <see cref="Task Parallelism (Concurrency Runtime)"/>.</para>
    /// </remarks>
    /**/
    template<typename _Function>
    __declspec(noinline) // Ask for no inlining so that the _CAPTURE_CALLSTACK gives us the expected result
    auto then(const _Function& _Func, task_options _TaskOptions = task_options()) const -> typename details::_ContinuationTypeTraits<_Function, void>::_TaskOfType
    {
        details::_get_internal_task_options(_TaskOptions)._set_creation_callstack(_CAPTURE_CALLSTACK());

        // Note: _ThenImpl's implementation makes a copy of the continuation_context when it schedules the continuation.  '
        //       The Continuation Context used to create the _ThenImplOptions must still exist when _ThenImpl executes.
        auto _ContinuationContext = _TaskOptions.get_continuation_context();
        auto _Options = details::_ThenImplOptions::_CreateOptions(_TaskOptions, _ContinuationContext, _ThenGetImpl()->_GetScheduler());

#ifndef _PPLTASKS_NO_STDFUNC
        return _M_unitTask._ThenImpl<void>(typename details::_ContinuationTypeTraits<_Function, void>::_StdFuncT(_Func), _Options);
#else
        return _M_unitTask._ThenImpl<void>(_Func, _Options);
#endif
    }

    /// <summary>
    ///     Adds a continuation task to this task.
    /// </summary>
    /// <typeparam name="_Function">
    ///     The type of the function object that will be invoked by this task.
    /// </typeparam>
    /// <param name="_Func">
    ///     The continuation function to execute when this task completes. This continuation function must take as input
    ///     a variable of either <c>result_type</c> or <c>task&lt;result_type&gt;</c>, where <c>result_type</c> is the type
    ///     of the result this task produces.
    /// </param>
    /// <param name="_CancellationToken">
    ///     The cancellation token to associate with the continuation task. A continuation task that is created without a cancellation token will inherit
    ///     the token of its antecedent task.
    /// </param>
    /// <param name="_ContinuationContext">
    ///     A variable that specifies where the continuation should execute. This variable is only useful when used in a Windows Store
    ///     style app. For more information, see <see cref="task_continuation_context Class">task_continuation_context</see>
    /// </param>
    /// <returns>
    ///     The newly created continuation task. The result type of the returned task is determined by what <paramref name="_Func"/> returns.
    /// </returns>
    /// <remarks>
    ///     The overloads of <c>then</c> that take a lambda or functor that returns a Windows::Foundation::IAsyncInfo interface, are only available
    ///     to Windows Store apps.
    ///     <para>For more information on how to use task continuations to compose asynchronous work, see <see cref="Task Parallelism (Concurrency Runtime)"/>.</para>
    /// </remarks>
    /**/
    template<typename _Function>
    __declspec(noinline) // Ask for no inlining so that the _CAPTURE_CALLSTACK gives us the expected result
    auto then(const _Function& _Func, cancellation_token _CancellationToken, task_continuation_context _ContinuationContext) const -> typename details::_ContinuationTypeTraits<_Function, void>::_TaskOfType
    {

        task_options _TaskOptions(_CancellationToken, _ContinuationContext);
        details::_get_internal_task_options(_TaskOptions)._set_creation_callstack(_CAPTURE_CALLSTACK());

        auto _Options = details::_ThenImplOptions::_CreateOptions(_TaskOptions, _ContinuationContext, _ThenGetImpl()->_GetScheduler());

#ifndef _PPLTASKS_NO_STDFUNC
        return _M_unitTask._ThenImpl<void>(typename details::_ContinuationTypeTraits<_Function, void>::_StdFuncT(_Func), _Options);
#else
        return _M_unitTask._ThenImpl<void>(_Func, _Options);
#endif
    }

    /// <summary>
    ///     Waits for this task to reach a terminal state. It is possible for <c>wait</c> to execute the task inline, if all of the tasks
    ///     dependencies are satisfied, and it has not already been picked up for execution by a background worker.
    /// </summary>
    /// <returns>
    ///     A <c>task_status</c> value which could be either <c>completed</c> or <c>canceled</c>. If the task encountered an exception
    ///     during execution, or an exception was propagated to it from an antecedent task, <c>wait</c> will throw that exception.
    /// </returns>
    /**/
    task_status wait() const
    {
        return _M_unitTask.wait();
    }

    /// <summary>
    ///     Returns the result this task produced. If the task is not in a terminal state, a call to <c>get</c> will wait for the task to
    ///     finish. This method does not return a value when called on a task with a <c>result_type</c> of <c>void</c>.
    /// </summary>
    /// <remarks>
    ///     If the task is canceled, a call to <c>get</c> will throw a <see cref="task_canceled Class">task_canceled</see> exception. If the task
    ///     encountered an different exception or an exception was propagated to it from an antecedent task, a call to <c>get</c> will throw that exception.
    /// </remarks>
    /**/
    void get() const
    {
        _M_unitTask.get();
    }

    /// <summary>
    ///     Determines if the task is completed.
    /// </summary>
    /// <returns>
    ///     True if the task has completed, false otherwise.
    /// </returns>
    /// <remarks>
    ///     The function returns true if the task is completed or canceled (with or without user exception).
    /// </remarks>
    bool is_done() const
    {
        return _M_unitTask.is_done();
    }

    /// <summary>
    ///     Returns the scheduler for this task
    /// </summary>
    /// <returns>
    ///     A pointer to the scheduler
    /// </returns>
    scheduler_ptr scheduler() const
    {
        return _M_unitTask.scheduler();
    }

    /// <summary>
    ///     Determines whether the task unwraps a Windows Runtime <c>IAsyncInfo</c> interface or is descended from such a task.
    /// </summary>
    /// <returns>
    ///     <c>true</c> if the task unwraps an <c>IAsyncInfo</c> interface or is descended from such a task, <c>false</c> otherwise.
    /// </returns>
    /**/
    bool is_apartment_aware() const
    {
        return _M_unitTask.is_apartment_aware();
    }

    /// <summary>
    ///     Determines whether two <c>task</c> objects represent the same internal task.
    /// </summary>
    /// <returns>
    ///     <c>true</c> if the objects refer to the same underlying task, and <c>false</c> otherwise.
    /// </returns>
    /**/
    bool operator==(const task<void>& _Rhs) const
    {
        return (_M_unitTask == _Rhs._M_unitTask);
    }

    /// <summary>
    ///     Determines whether two <c>task</c> objects represent different internal tasks.
    /// </summary>
    /// <returns>
    ///     <c>true</c> if the objects refer to different underlying tasks, and <c>false</c> otherwise.
    /// </returns>
    /**/
    bool operator!=(const task<void>& _Rhs) const
    {
        return !operator==(_Rhs);
    }

    /// <summary>
    ///     Create an underlying task implementation.
    /// </summary>
    void _CreateImpl(details::_CancellationTokenState * _Ct, scheduler_ptr _Scheduler)
    {
        _M_unitTask._CreateImpl(_Ct, _Scheduler);
    }

    /// <summary>
    ///     Return the underlying implementation for this task.
    /// </summary>
    const details::_Task_ptr<details::_Unit_type>::_Type & _GetImpl() const
    {
        return _M_unitTask._M_Impl;
    }

    const details::_Task_ptr<details::_Unit_type>::_Type & _ThenGetImpl() const
    {
        if (!_M_unitTask._M_Impl)
        {
            details::_DefaultTaskHelper::_NoCallOnDefaultTask_ErrorImpl();
        }

        return _M_unitTask._M_Impl;
    }

    /// <summary>
    ///     Set the implementation of the task to be the supplied implementation.
    /// </summary>
    void _SetImpl(const details::_Task_ptr<details::_Unit_type>::_Type & _Impl)
    {
        _M_unitTask._SetImpl(_Impl);
    }

    /// <summary>
    ///     Set the implementation of the task to be the supplied implementation using a move instead of a copy.
    /// </summary>
    void _SetImpl(details::_Task_ptr<details::_Unit_type>::_Type && _Impl)
    {
        _M_unitTask._SetImpl(::std::move(_Impl));
    }

    /// <summary>
    ///     Sets a property determining whether the task is apartment aware.
    /// </summary>
    void _SetAsync(bool _Async = true)
    {
        _M_unitTask._SetAsync(_Async);
    }

    /// <summary>
    ///     Sets a field in the task impl to the return callstack for calls to the task constructors and the then method.
    /// </summary>
    void _SetTaskCreationCallstack(const details::_TaskCreationCallstack &_callstack)
    {
        _M_unitTask._SetTaskCreationCallstack(_callstack);
    }

    /// <summary>
    ///     An internal version of then that takes additional flags and executes the continuation inline. Used for runtime internal continuations only.
    /// </summary>
    template<typename _Function>
    auto _Then(const _Function& _Func, details::_CancellationTokenState *_PTokenState,
        details::_TaskInliningMode_t _InliningMode = details::_ForceInline) const -> typename details::_ContinuationTypeTraits<_Function, void>::_TaskOfType
    {

        // inherit from antecedent
        auto _Scheduler = _ThenGetImpl()->_GetScheduler();

        // Note: _ThenImpl's implementation makes a copy of the continuation_context when it schedules the continuation.  '
        //       The Continuation Context used to create the _ThenImplOptions must still exist when _ThenImpl executes.
        auto _Default_Context = task_continuation_context::use_default();
        details::_ThenImplOptions _Options{ _PTokenState, &_Default_Context, _Scheduler, _CAPTURE_CALLSTACK(), _InliningMode };

#ifndef _PPLTASKS_NO_STDFUNC
        return _M_unitTask._ThenImpl<void>(typename details::_ContinuationTypeTraits<_Function, void>::_StdFuncT(_Func), _Options);
#else
        return _M_unitTask._ThenImpl<void>(_Func, _Options);
#endif
    }

private:
    template <typename _Ty> friend class task;
    template <typename _Ty> friend class task_completion_event;

    /// <summary>
    ///     Initializes a task using a task completion event.
    /// </summary>
    void _TaskInitNoFunctor(task_completion_event<void>& _Event)
    {
        _M_unitTask._TaskInitNoFunctor(_Event._M_unitEvent);
    }

#if defined (__cplusplus_winrt)
    /// <summary>
    ///     Initializes a task using an asynchronous action IAsyncAction^
    /// </summary>
    void _TaskInitNoFunctor(Windows::Foundation::IAsyncAction^ _AsyncAction)
    {
         _M_unitTask._TaskInitAsyncOp(ref new details::_IAsyncActionToAsyncOperationConverter(_AsyncAction));
    }

    /// <summary>
    ///     Initializes a task using an asynchronous action with progress IAsyncActionWithProgress<_P>^
    /// </summary>
    template<typename _P>
    void _TaskInitNoFunctor(Windows::Foundation::IAsyncActionWithProgress<_P>^ _AsyncActionWithProgress)
    {
        _M_unitTask._TaskInitAsyncOp(ref new details::_IAsyncActionWithProgressToAsyncOperationConverter<_P>(_AsyncActionWithProgress));
    }
#endif  /* defined (__cplusplus_winrt) */

    /// <summary>
    ///     Initializes a task using a callable object.
    /// </summary>
    template<typename _Function>
    void _TaskInitMaybeFunctor(_Function& _Func, ::std::true_type)
    {
        _M_unitTask._TaskInitWithFunctor<void, _Function>(_Func);
    }

    /// <summary>
    ///     Initializes a task using a non-callable object.
    /// </summary>
    template<typename _Ty>
    void _TaskInitMaybeFunctor(_Ty& _Param, ::std::false_type)
    {
        _TaskInitNoFunctor(_Param);
    }

    // The void task contains a task of a dummy type so common code can be used for tasks with void and non-void results.
    task<details::_Unit_type> _M_unitTask;
};

namespace details
{
    /// <summary>
    ///   The following type traits are used for the create_task function.
    /// </summary>

#if defined (__cplusplus_winrt)
    // Unwrap functions for asyncOperations
    template<typename _Ty>
    _Ty _GetUnwrappedType(Windows::Foundation::IAsyncOperation<_Ty>^);

    void _GetUnwrappedType(Windows::Foundation::IAsyncAction^);

    template<typename _Ty, typename _Progress>
    _Ty _GetUnwrappedType(Windows::Foundation::IAsyncOperationWithProgress<_Ty, _Progress>^);

    template<typename _Progress>
    void _GetUnwrappedType(Windows::Foundation::IAsyncActionWithProgress<_Progress>^);
#endif  /* defined (__cplusplus_winrt) */

    // Unwrap task<T>
    template<typename _Ty>
    _Ty _GetUnwrappedType(task<_Ty>);

    // Unwrap all supported types
    template<typename _Ty>
    auto _GetUnwrappedReturnType(_Ty _Arg, int) -> decltype(_GetUnwrappedType(_Arg));
    // fallback
    template<typename _Ty>
    _Ty _GetUnwrappedReturnType(_Ty, ...);

    /// <summary>
    ///   <c>_GetTaskType</c> functions will retrieve task type <c>T</c> in <c>task[T](Arg)</c>,
    ///   for given constructor argument <c>Arg</c> and its property "callable".
    ///   It will automatically unwrap argument to get the final return type if necessary.
    /// </summary>

    // Non-Callable
    template<typename _Ty>
    _Ty _GetTaskType(task_completion_event<_Ty>, ::std::false_type);

    // Non-Callable
    template<typename _Ty>
    auto _GetTaskType(_Ty _NonFunc, ::std::false_type) -> decltype(_GetUnwrappedType(_NonFunc));

    // Callable
    template<typename _Ty>
    auto _GetTaskType(_Ty _Func, ::std::true_type) -> decltype(_GetUnwrappedReturnType(_Func(), 0));

    // Special callable returns void
    void _GetTaskType(::std::function<void()>, ::std::true_type);
    struct _BadArgType{};

    template<typename _Ty>
    auto _FilterValidTaskType(_Ty _Param, int) -> decltype(_GetTaskType(_Param, _IsCallable(_Param, 0)));

    template<typename _Ty>
    _BadArgType _FilterValidTaskType(_Ty _Param, ...);

    template<typename _Ty>
    struct _TaskTypeFromParam
    {
        typedef decltype(_FilterValidTaskType(details::declval<_Ty>(), 0)) _Type;
    };

    inline bool _IsHRCOMDisconnected(int __hr)
    {
        return static_cast<unsigned int>(__hr) == 0x800706BAU // HRESULT_FROM_WIN32(RPC_S_SERVER_UNAVAILABLE)
        || static_cast<unsigned int>(__hr) == 0x80010108U // RPC_E_DISCONNECTED
        || static_cast<unsigned int>(__hr) == 0x89020001U; // JSCRIPT_E_CANTEXECUTE
    }
} // namespace details

/// <summary>
///     Creates a PPL <see cref="task Class">task</see> object. <c>create_task</c> can be used anywhere you would have used a task constructor.
///     It is provided mainly for convenience, because it allows use of the <c>auto</c> keyword while creating tasks.
/// </summary>
/// <typeparam name="_Ty">
///     The type of the parameter from which the task is to be constructed.
/// </typeparam>
/// <param name="_Param">
///     The parameter from which the task is to be constructed. This could be a lambda or function object, a <c>task_completion_event</c>
///     object, a different <c>task</c> object, or a Windows::Foundation::IAsyncInfo interface if you are using tasks in your Windows Store app.
/// </param>
/// <returns>
///     A new task of type <c>T</c>, that is inferred from <paramref name="_Param"/>.
/// </returns>
/// <remarks>
///     The first overload behaves like a task constructor that takes a single parameter.
///     <para>The second overload associates the cancellation token provided with the newly created task. If you use this overload you are not
///     allowed to pass in a different <c>task</c> object as the first parameter.</para>
///     <para>The type of the returned task is inferred from the first parameter to the function. If <paramref name="_Param"/> is a <c>task_completion_event&lt;T&gt;</c>,
///     a <c>task&lt;T&gt;</c>, or a functor that returns either type <c>T</c> or <c>task&lt;T&gt;</c>, the type of the created task is <c>task&lt;T&gt;</c>.</para>
///     <para>In a Windows Store app, if <paramref name="_Param"/> is of type Windows::Foundation::IAsyncOperation&lt;T&gt;^ or
///     Windows::Foundation::IAsyncOperationWithProgress&lt;T,P&gt;^, or a functor that returns either of those types, the created task will be of type <c>task&lt;T&gt;</c>.
///     If <paramref name="_Param"/> is of type Windows::Foundation::IAsyncAction^ or Windows::Foundation::IAsyncActionWithProgress&lt;P&gt;^, or a functor
///     that returns either of those types, the created task will have type <c>task&lt;void&gt;</c>.</para>
/// </remarks>
/// <seealso cref="task Class"/>
/// <seealso cref="Task Parallelism (Concurrency Runtime)"/>
/**/
template<typename _Ty>
__declspec(noinline)
auto create_task(_Ty _Param, task_options _TaskOptions = task_options()) -> task<typename details::_TaskTypeFromParam<_Ty>::_Type>
{
    static_assert(!::std::is_same_v<typename details::_TaskTypeFromParam<_Ty>::_Type, details::_BadArgType>,
#if defined (__cplusplus_winrt)
            "incorrect argument for create_task; can be a callable object, an asynchronous operation, or a task_completion_event"
#else  /* defined (__cplusplus_winrt) */
            "incorrect argument for create_task; must be either a callable object or a task_completion_event"
#endif  /* defined (__cplusplus_winrt) */
    );
    details::_get_internal_task_options(_TaskOptions)._set_creation_callstack(_CAPTURE_CALLSTACK());
    task<typename details::_TaskTypeFromParam<_Ty>::_Type> _CreatedTask(_Param, _TaskOptions);
    return _CreatedTask;
}

/// <summary>
///     Creates a PPL <see cref="task Class">task</see> object. <c>create_task</c> can be used anywhere you would have used a task constructor.
///     It is provided mainly for convenience, because it allows use of the <c>auto</c> keyword while creating tasks.
/// </summary>
/// <typeparam name="_Ty">
///     The type of the parameter from which the task is to be constructed.
/// </typeparam>
/// <param name="_Param">
///     The parameter from which the task is to be constructed. This could be a lambda or function object, a <c>task_completion_event</c>
///     object, a different <c>task</c> object, or a Windows::Foundation::IAsyncInfo interface if you are using tasks in your Windows Store app.
/// </param>
/// <param name="_Token">
///     The cancellation token to associate with the task. When the source for this token is canceled, cancellation will be requested on the task.
/// </param>
/// <returns>
///     A new task of type <c>T</c>, that is inferred from <paramref name="_Param"/>.
/// </returns>
/// <remarks>
///     The first overload behaves like a task constructor that takes a single parameter.
///     <para>The second overload associates the cancellation token provided with the newly created task. If you use this overload you are not
///     allowed to pass in a different <c>task</c> object as the first parameter.</para>
///     <para>The type of the returned task is inferred from the first parameter to the function. If <paramref name="_Param"/> is a <c>task_completion_event&lt;T&gt;</c>,
///     a <c>task&lt;T&gt;</c>, or a functor that returns either type <c>T</c> or <c>task&lt;T&gt;</c>, the type of the created task is <c>task&lt;T&gt;</c>.</para>
///     <para>In a Windows Store app, if <paramref name="_Param"/> is of type Windows::Foundation::IAsyncOperation&lt;T&gt;^ or
///     Windows::Foundation::IAsyncOperationWithProgress&lt;T,P&gt;^, or a functor that returns either of those types, the created task will be of type <c>task&lt;T&gt;</c>.
///     If <paramref name="_Param"/> is of type Windows::Foundation::IAsyncAction^ or Windows::Foundation::IAsyncActionWithProgress&lt;P&gt;^, or a functor
///     that returns either of those types, the created task will have type <c>task&lt;void&gt;</c>.</para>
/// </remarks>
/// <seealso cref="task Class"/>
/// <seealso cref="Task Parallelism (Concurrency Runtime)"/>
/**/
template<typename _ReturnType>
__declspec(noinline)
task<_ReturnType> create_task(const task<_ReturnType>& _Task)
{
    task<_ReturnType> _CreatedTask(_Task);
    return _CreatedTask;
}

#if defined (__cplusplus_winrt)
namespace details
{
    template<typename _Ty>
    task<_Ty> _To_task_helper(Windows::Foundation::IAsyncOperation<_Ty>^ _Op)
    {
        return task<_Ty>(_Op);
    }

    template<typename _Ty, typename _Progress>
    task<_Ty> _To_task_helper(Windows::Foundation::IAsyncOperationWithProgress<_Ty, _Progress>^ _Op)
    {
        return task<_Ty>(_Op);
    }

    inline task<void> _To_task_helper(Windows::Foundation::IAsyncAction^ _Op)
    {
        return task<void>(_Op);
    }

    template<typename _Progress>
    task<void> _To_task_helper(Windows::Foundation::IAsyncActionWithProgress<_Progress>^ _Op)
    {
        return task<void>(_Op);
    }

    template<typename _ProgressType>
    class _ProgressDispatcherBase
    {
    public:

        virtual ~_ProgressDispatcherBase()
        {
        }

        virtual void _Report(const _ProgressType& _Val) = 0;
    };

    template<typename _ProgressType, typename _ClassPtrType>
    class _ProgressDispatcher : public _ProgressDispatcherBase<_ProgressType>
    {
    public:

        virtual ~_ProgressDispatcher()
        {
        }

        _ProgressDispatcher(_ClassPtrType _Ptr) : _M_ptr(_Ptr)
        {
        }

        virtual void _Report(const _ProgressType& _Val)
        {
            _M_ptr->_FireProgress(_Val);
        }

    private:

        _ClassPtrType _M_ptr;
    };
} // namespace details

/// <summary>
///     The progress reporter class allows reporting progress notifications of a specific type. Each progress_reporter object is bound
///     to a particular asynchronous action or operation.
/// </summary>
/// <typeparam name="_ProgressType">
///     The payload type of each progress notification reported through the progress reporter.
/// </typeparam>
/// <remarks>
///     This type is only available to Windows Store apps.
/// </remarks>
/// <seealso cref="create_async Function"/>
/**/
template<typename _ProgressType>
class progress_reporter
{
    typedef ::std::shared_ptr<details::_ProgressDispatcherBase<_ProgressType>> _PtrType;

public:

    /// <summary>
    ///     Sends a progress report to the asynchronous action or operation to which this progress reporter is bound.
    /// </summary>
    /// <param name="_Val">
    ///     The payload to report through a progress notification.
    /// </param>
    /**/
    void report(const _ProgressType& _Val) const
    {
        _M_dispatcher->_Report(_Val);
    }

    template<typename _ClassPtrType>
    static progress_reporter _CreateReporter(_ClassPtrType _Ptr)
    {
        progress_reporter _Reporter;
        details::_ProgressDispatcherBase<_ProgressType> *_PDispatcher = new details::_ProgressDispatcher<_ProgressType, _ClassPtrType>(_Ptr);
        _Reporter._M_dispatcher = _PtrType(_PDispatcher);
        return _Reporter;
    }
    progress_reporter() {}

    // For validation type traits
    progress_reporter(details::_ProgressReporterCtorArgType);
private:

    _PtrType _M_dispatcher;
};

namespace details
{
    //
    // maps internal definitions for AsyncStatus and defines states that are not client visible
    //
    enum _AsyncStatusInternal
    {
        _AsyncCreated = -1,  // externally invisible
        // client visible states (must match AsyncStatus exactly)
        _AsyncStarted = 0,   // Windows::Foundation::AsyncStatus::Started,
        _AsyncCompleted = 1, // Windows::Foundation::AsyncStatus::Completed,
        _AsyncCanceled = 2, // Windows::Foundation::AsyncStatus::Canceled,
        _AsyncError = 3,     // Windows::Foundation::AsyncStatus::Error,
        // non-client visible internal states
        _AsyncCancelPending,
        _AsyncClosed,
        _AsyncUndefined
    };

    //
    // designates whether the "GetResults" method returns a single result (after complete fires) or multiple results
    // (which are progressively consumable between Start state and before Close is called)
    //
    enum _AsyncResultType
    {
        SingleResult    = 0x0001,
        MultipleResults = 0x0002
    };

    // ***************************************************************************
    // Template type traits and helpers for async production APIs:
    //

    struct _ZeroArgumentFunctor { };
    struct _OneArgumentFunctor { };
    struct _TwoArgumentFunctor { };

    // ****************************************
    // CLASS TYPES:

    // ********************
    // TWO ARGUMENTS:

    // non-void arg:
    template<typename _Class, typename _ReturnType, typename _Arg1, typename _Arg2>
    _Arg1 _Arg1ClassHelperThunk(_ReturnType (_Class::*)(_Arg1, _Arg2) const);

    // non-void arg:
    template<typename _Class, typename _ReturnType, typename _Arg1, typename _Arg2>
    _Arg2 _Arg2ClassHelperThunk(_ReturnType (_Class::*)(_Arg1, _Arg2) const);

    template<typename _Class, typename _ReturnType, typename _Arg1, typename _Arg2>
    _ReturnType _ReturnTypeClassHelperThunk(_ReturnType (_Class::*)(_Arg1, _Arg2) const);

    template<typename _Class, typename _ReturnType, typename _Arg1, typename _Arg2>
    _TwoArgumentFunctor _ArgumentCountHelper(_ReturnType (_Class::*)(_Arg1, _Arg2) const);

    // ********************
    // ONE ARGUMENT:

    // non-void arg:
    template<typename _Class, typename _ReturnType, typename _Arg1>
    _Arg1 _Arg1ClassHelperThunk(_ReturnType (_Class::*)(_Arg1) const);

    // non-void arg:
    template<typename _Class, typename _ReturnType, typename _Arg1>
    void _Arg2ClassHelperThunk(_ReturnType (_Class::*)(_Arg1) const);

    template<typename _Class, typename _ReturnType, typename _Arg1>
    _ReturnType _ReturnTypeClassHelperThunk(_ReturnType (_Class::*)(_Arg1) const);

    template<typename _Class, typename _ReturnType, typename _Arg1>
    _OneArgumentFunctor _ArgumentCountHelper(_ReturnType (_Class::*)(_Arg1) const);

    // ********************
    // ZERO ARGUMENT:

    // void arg:
    template<typename _Class, typename _ReturnType>
    void _Arg1ClassHelperThunk(_ReturnType (_Class::*)() const);

    // void arg:
    template<typename _Class, typename _ReturnType>
    void _Arg2ClassHelperThunk(_ReturnType (_Class::*)() const);

    // void arg:
    template<typename _Class, typename _ReturnType>
    _ReturnType _ReturnTypeClassHelperThunk(_ReturnType (_Class::*)() const);

    template<typename _Class, typename _ReturnType>
    _ZeroArgumentFunctor _ArgumentCountHelper(_ReturnType (_Class::*)() const);

    // ****************************************
    // POINTER TYPES:

    // ********************
    // TWO ARGUMENTS:

    template<typename _ReturnType, typename _Arg1, typename _Arg2>
    _Arg1 _Arg1PFNHelperThunk(_ReturnType(__cdecl *)(_Arg1, _Arg2));

    template<typename _ReturnType, typename _Arg1, typename _Arg2>
    _Arg2 _Arg2PFNHelperThunk(_ReturnType(__cdecl *)(_Arg1, _Arg2));

    template<typename _ReturnType, typename _Arg1, typename _Arg2>
    _ReturnType _ReturnTypePFNHelperThunk(_ReturnType(__cdecl *)(_Arg1, _Arg2));

    template<typename _ReturnType, typename _Arg1, typename _Arg2>
    _TwoArgumentFunctor _ArgumentCountHelper(_ReturnType(__cdecl *)(_Arg1, _Arg2));

    template<typename _ReturnType, typename _Arg1, typename _Arg2>
    _Arg1 _Arg1PFNHelperThunk(_ReturnType(__stdcall *)(_Arg1, _Arg2));

    template<typename _ReturnType, typename _Arg1, typename _Arg2>
    _Arg2 _Arg2PFNHelperThunk(_ReturnType(__stdcall *)(_Arg1, _Arg2));

    template<typename _ReturnType, typename _Arg1, typename _Arg2>
    _ReturnType _ReturnTypePFNHelperThunk(_ReturnType(__stdcall *)(_Arg1, _Arg2));

    template<typename _ReturnType, typename _Arg1, typename _Arg2>
    _TwoArgumentFunctor _ArgumentCountHelper(_ReturnType(__stdcall *)(_Arg1, _Arg2));

    template<typename _ReturnType, typename _Arg1, typename _Arg2>
    _Arg1 _Arg1PFNHelperThunk(_ReturnType(__fastcall *)(_Arg1, _Arg2));

    template<typename _ReturnType, typename _Arg1, typename _Arg2>
    _Arg2 _Arg2PFNHelperThunk(_ReturnType(__fastcall *)(_Arg1, _Arg2));

    template<typename _ReturnType, typename _Arg1, typename _Arg2>
    _ReturnType _ReturnTypePFNHelperThunk(_ReturnType(__fastcall *)(_Arg1, _Arg2));

    template<typename _ReturnType, typename _Arg1, typename _Arg2>
    _TwoArgumentFunctor _ArgumentCountHelper(_ReturnType(__fastcall *)(_Arg1, _Arg2));

    // ********************
    // ONE ARGUMENT:

    template<typename _ReturnType, typename _Arg1>
    _Arg1 _Arg1PFNHelperThunk(_ReturnType(__cdecl *)(_Arg1));

    template<typename _ReturnType, typename _Arg1>
    void _Arg2PFNHelperThunk(_ReturnType(__cdecl *)(_Arg1));

    template<typename _ReturnType, typename _Arg1>
    _ReturnType _ReturnTypePFNHelperThunk(_ReturnType(__cdecl *)(_Arg1));

    template<typename _ReturnType, typename _Arg1>
    _OneArgumentFunctor _ArgumentCountHelper(_ReturnType(__cdecl *)(_Arg1));

    template<typename _ReturnType, typename _Arg1>
    _Arg1 _Arg1PFNHelperThunk(_ReturnType(__stdcall *)(_Arg1));

    template<typename _ReturnType, typename _Arg1>
    void _Arg2PFNHelperThunk(_ReturnType(__stdcall *)(_Arg1));

    template<typename _ReturnType, typename _Arg1>
    _ReturnType _ReturnTypePFNHelperThunk(_ReturnType(__stdcall *)(_Arg1));

    template<typename _ReturnType, typename _Arg1>
    _OneArgumentFunctor _ArgumentCountHelper(_ReturnType(__stdcall *)(_Arg1));

    template<typename _ReturnType, typename _Arg1>
    _Arg1 _Arg1PFNHelperThunk(_ReturnType(__fastcall *)(_Arg1));

    template<typename _ReturnType, typename _Arg1>
    void _Arg2PFNHelperThunk(_ReturnType(__fastcall *)(_Arg1));

    template<typename _ReturnType, typename _Arg1>
    _ReturnType _ReturnTypePFNHelperThunk(_ReturnType(__fastcall *)(_Arg1));

    template<typename _ReturnType, typename _Arg1>
    _OneArgumentFunctor _ArgumentCountHelper(_ReturnType(__fastcall *)(_Arg1));

    // ********************
    // ZERO ARGUMENT:

    template<typename _ReturnType>
    void _Arg1PFNHelperThunk(_ReturnType(__cdecl *)());

    template<typename _ReturnType>
    void _Arg2PFNHelperThunk(_ReturnType(__cdecl *)());

    template<typename _ReturnType>
    _ReturnType _ReturnTypePFNHelperThunk(_ReturnType(__cdecl *)());

    template<typename _ReturnType>
    _ZeroArgumentFunctor _ArgumentCountHelper(_ReturnType(__cdecl *)());

    template<typename _ReturnType>
    void _Arg1PFNHelperThunk(_ReturnType(__stdcall *)());

    template<typename _ReturnType>
    void _Arg2PFNHelperThunk(_ReturnType(__stdcall *)());

    template<typename _ReturnType>
    _ReturnType _ReturnTypePFNHelperThunk(_ReturnType(__stdcall *)());

    template<typename _ReturnType>
    _ZeroArgumentFunctor _ArgumentCountHelper(_ReturnType(__stdcall *)());

    template<typename _ReturnType>
    void _Arg1PFNHelperThunk(_ReturnType(__fastcall *)());

    template<typename _ReturnType>
    void _Arg2PFNHelperThunk(_ReturnType(__fastcall *)());

    template<typename _ReturnType>
    _ReturnType _ReturnTypePFNHelperThunk(_ReturnType(__fastcall *)());

    template<typename _ReturnType>
    _ZeroArgumentFunctor _ArgumentCountHelper(_ReturnType(__fastcall *)());

    template<typename _Ty>
    struct _FunctorArguments
    {
        static constexpr size_t _Count = 0;
    };

    template<>
    struct _FunctorArguments<_OneArgumentFunctor>
    {
        static constexpr size_t _Count = 1;
    };

    template<>
    struct _FunctorArguments<_TwoArgumentFunctor>
    {
        static constexpr size_t _Count = 2;
    };

    template<typename _Ty>
    struct _FunctorTypeTraits
    {
        typedef decltype(_ArgumentCountHelper(&(_Ty::operator()))) _ArgumentCountType;
        static constexpr size_t _ArgumentCount = _FunctorArguments<_ArgumentCountType>::_Count;

        typedef decltype(_ReturnTypeClassHelperThunk(&(_Ty::operator()))) _ReturnType;
        typedef decltype(_Arg1ClassHelperThunk(&(_Ty::operator()))) _Argument1Type;
        typedef decltype(_Arg2ClassHelperThunk(&(_Ty::operator()))) _Argument2Type;
    };

    template<typename _Ty>
    struct _FunctorTypeTraits<_Ty *>
    {
        typedef decltype(_ArgumentCountHelper(details::declval<_Ty*>())) _ArgumentCountType;
        static constexpr size_t _ArgumentCount = _FunctorArguments<_ArgumentCountType>::_Count;

        typedef decltype(_ReturnTypePFNHelperThunk(details::declval<_Ty*>())) _ReturnType;
        typedef decltype(_Arg1PFNHelperThunk(details::declval<_Ty*>())) _Argument1Type;
        typedef decltype(_Arg2PFNHelperThunk(details::declval<_Ty*>())) _Argument2Type;
    };

    template<typename _Ty>
    struct _ProgressTypeTraits
    {
        static constexpr bool _TakesProgress = false;
        typedef void _ProgressType;
    };

    template<typename _Ty>
    struct _ProgressTypeTraits<progress_reporter<_Ty>>
    {
        static constexpr bool _TakesProgress = true;
        typedef _Ty _ProgressType;
    };


    template<typename _Ty, size_t _Count = _FunctorTypeTraits<_Ty>::_ArgumentCount>
    struct _CAFunctorOptions
    {
        static constexpr bool _TakesProgress = false;
        static constexpr bool _TakesToken = false;
        typedef void _ProgressType;
    };

    template<typename _Ty>
    struct _CAFunctorOptions<_Ty, 1>
    {
    private:

        typedef typename _FunctorTypeTraits<_Ty>::_Argument1Type _Argument1Type;

    public:

        static constexpr bool _TakesProgress = _ProgressTypeTraits<_Argument1Type>::_TakesProgress;
        static constexpr bool _TakesToken = !_TakesProgress;
        typedef typename _ProgressTypeTraits<_Argument1Type>::_ProgressType _ProgressType;
    };

    template<typename _Ty>
    struct _CAFunctorOptions<_Ty, 2>
    {
    private:

        typedef typename _FunctorTypeTraits<_Ty>::_Argument1Type _Argument1Type;

    public:

        static constexpr bool _TakesProgress = true;
        static constexpr bool _TakesToken = true;
        typedef typename _ProgressTypeTraits<_Argument1Type>::_ProgressType _ProgressType;
    };

    ref class _Zip
    {
    };

    // ***************************************************************************
    // Async Operation Task Generators
    //

    //
    // Functor returns an IAsyncInfo - result needs to be wrapped in a task:
    //
    template<typename _AsyncSelector, typename _ReturnType>
    struct _SelectorTaskGenerator
    {
        template<typename _Function>
        static task<_ReturnType> _GenerateTask_0(const _Function& _Func, cancellation_token_source _Cts, const _TaskCreationCallstack & _callstack)
        {
            task_options _taskOptinos(_Cts.get_token());
            details::_get_internal_task_options(_taskOptinos)._set_creation_callstack(_callstack);
            return task<_ReturnType>(_Func(), _taskOptinos);
        }

        template<typename _Function>
        static task<_ReturnType> _GenerateTask_1C(const _Function& _Func, cancellation_token_source _Cts, const _TaskCreationCallstack & _callstack)
        {
            task_options _taskOptinos(_Cts.get_token());
            details::_get_internal_task_options(_taskOptinos)._set_creation_callstack(_callstack);
            return task<_ReturnType>(_Func(_Cts.get_token()), _taskOptinos);
        }

        template<typename _Function, typename _ProgressObject>
        static task<_ReturnType> _GenerateTask_1P(const _Function& _Func, const _ProgressObject& _Progress, cancellation_token_source _Cts, const _TaskCreationCallstack & _callstack)
        {
            task_options _taskOptinos(_Cts.get_token());
            details::_get_internal_task_options(_taskOptinos)._set_creation_callstack(_callstack);
            return task<_ReturnType>(_Func(_Progress), _taskOptinos);
        }

        template<typename _Function, typename _ProgressObject>
        static task<_ReturnType> _GenerateTask_2PC(const _Function& _Func, const _ProgressObject& _Progress, cancellation_token_source _Cts, const _TaskCreationCallstack & _callstack)
        {
            task_options _taskOptinos(_Cts.get_token());
            details::_get_internal_task_options(_taskOptinos)._set_creation_callstack(_callstack);
            return task<_ReturnType>(_Func(_Progress, _Cts.get_token()), _taskOptinos);
        }
    };

    template<typename _AsyncSelector>
    struct _SelectorTaskGenerator<_AsyncSelector, void>
    {
        template<typename _Function>
        static task<void> _GenerateTask_0(const _Function& _Func, cancellation_token_source _Cts, const _TaskCreationCallstack & _callstack)
        {
            task_options _taskOptinos(_Cts.get_token());
            details::_get_internal_task_options(_taskOptinos)._set_creation_callstack(_callstack);
            return task<void>(_Func(), _taskOptinos);
        }

        template<typename _Function>
        static task<void> _GenerateTask_1C(const _Function& _Func, cancellation_token_source _Cts, const _TaskCreationCallstack & _callstack)
        {
            task_options _taskOptinos(_Cts.get_token());
            details::_get_internal_task_options(_taskOptinos)._set_creation_callstack(_callstack);
            return task<void>(_Func(_Cts.get_token()), _taskOptinos);
        }

        template<typename _Function, typename _ProgressObject>
        static task<void> _GenerateTask_1P(const _Function& _Func, const _ProgressObject& _Progress, cancellation_token_source _Cts, const _TaskCreationCallstack & _callstack)
        {
            task_options _taskOptinos(_Cts.get_token());
            details::_get_internal_task_options(_taskOptinos)._set_creation_callstack(_callstack);
            return task<void>(_Func(_Progress), _taskOptinos);
        }

        template<typename _Function, typename _ProgressObject>
        static task<void> _GenerateTask_2PC(const _Function& _Func, const _ProgressObject& _Progress, cancellation_token_source _Cts, const _TaskCreationCallstack & _callstack)
        {
            task_options _taskOptinos(_Cts.get_token());
            details::_get_internal_task_options(_taskOptinos)._set_creation_callstack(_callstack);
            return task<void>(_Func(_Progress, _Cts.get_token()), _taskOptinos);
        }
    };

    //
    // Functor returns a result - it needs to be wrapped in a task:
    //
    template<typename _ReturnType>
    struct _SelectorTaskGenerator<_TypeSelectorNoAsync, _ReturnType>
    {

#pragma warning(push)
#pragma warning(disable: 4702)
        template<typename _Function>
        static task<_ReturnType> _GenerateTask_0(const _Function& _Func, cancellation_token_source _Cts, const _TaskCreationCallstack & _callstack)
        {
            task_options _taskOptinos(_Cts.get_token());
            details::_get_internal_task_options(_taskOptinos)._set_creation_callstack(_callstack);
            return task<_ReturnType>( [=]() -> _ReturnType {
                _Task_generator_oversubscriber_t _Oversubscriber;
                (_Oversubscriber);
                return _Func();
            }, _taskOptinos);
        }
#pragma warning(pop)

        template<typename _Function>
        static task<_ReturnType> _GenerateTask_1C(const _Function& _Func, cancellation_token_source _Cts, const _TaskCreationCallstack & _callstack)
        {
            task_options _taskOptinos(_Cts.get_token());
            details::_get_internal_task_options(_taskOptinos)._set_creation_callstack(_callstack);
            return task<_ReturnType>( [=]() -> _ReturnType {
                _Task_generator_oversubscriber_t _Oversubscriber;
                (_Oversubscriber);
                return _Func(_Cts.get_token());
            }, _taskOptinos);
        }

        template<typename _Function, typename _ProgressObject>
        static task<_ReturnType> _GenerateTask_1P(const _Function& _Func, const _ProgressObject& _Progress, cancellation_token_source _Cts, const _TaskCreationCallstack & _callstack)
        {
            task_options _taskOptinos(_Cts.get_token());
            details::_get_internal_task_options(_taskOptinos)._set_creation_callstack(_callstack);
            return task<_ReturnType>( [=]() -> _ReturnType {
                _Task_generator_oversubscriber_t _Oversubscriber;
                (_Oversubscriber);
                return _Func(_Progress);
            }, _taskOptinos);
        }

        template<typename _Function, typename _ProgressObject>
        static task<_ReturnType> _GenerateTask_2PC(const _Function& _Func, const _ProgressObject& _Progress, cancellation_token_source _Cts, const _TaskCreationCallstack & _callstack)
        {
            task_options _taskOptinos(_Cts.get_token());
            details::_get_internal_task_options(_taskOptinos)._set_creation_callstack(_callstack);
            return task<_ReturnType>( [=]() -> _ReturnType {
                _Task_generator_oversubscriber_t _Oversubscriber;
                (_Oversubscriber);
                return _Func(_Progress, _Cts.get_token());
            }, _taskOptinos);
        }
    };

    template<>
    struct _SelectorTaskGenerator<_TypeSelectorNoAsync, void>
    {
        template<typename _Function>
        static task<void> _GenerateTask_0(const _Function& _Func, cancellation_token_source _Cts, const _TaskCreationCallstack & _callstack)
        {
            task_options _taskOptinos(_Cts.get_token());
            details::_get_internal_task_options(_taskOptinos)._set_creation_callstack(_callstack);
            return task<void>( [=]() {
                _Task_generator_oversubscriber_t _Oversubscriber;
                (_Oversubscriber);
                _Func();
            }, _taskOptinos);
        }

        template<typename _Function>
        static task<void> _GenerateTask_1C(const _Function& _Func, cancellation_token_source _Cts, const _TaskCreationCallstack & _callstack)
        {
            task_options _taskOptinos(_Cts.get_token());
            details::_get_internal_task_options(_taskOptinos)._set_creation_callstack(_callstack);
            return task<void>( [=]() {
                _Task_generator_oversubscriber_t _Oversubscriber;
                (_Oversubscriber);
                _Func(_Cts.get_token());
            }, _taskOptinos);
        }

        template<typename _Function, typename _ProgressObject>
        static task<void> _GenerateTask_1P(const _Function& _Func, const _ProgressObject& _Progress, cancellation_token_source _Cts, const _TaskCreationCallstack & _callstack)
        {
            task_options _taskOptinos(_Cts.get_token());
            details::_get_internal_task_options(_taskOptinos)._set_creation_callstack(_callstack);
            return task<void>( [=]() {
                _Task_generator_oversubscriber_t _Oversubscriber;
                (_Oversubscriber);
                _Func(_Progress);
            }, _taskOptinos);
        }

        template<typename _Function, typename _ProgressObject>
        static task<void> _GenerateTask_2PC(const _Function& _Func, const _ProgressObject& _Progress, cancellation_token_source _Cts, const _TaskCreationCallstack & _callstack)
        {
            task_options _taskOptinos(_Cts.get_token());
            details::_get_internal_task_options(_taskOptinos)._set_creation_callstack(_callstack);
            return task<void>( [=]() {
                _Task_generator_oversubscriber_t _Oversubscriber;
                (_Oversubscriber);
                _Func(_Progress, _Cts.get_token());
            }, _taskOptinos);
        }
    };

    //
    // Functor returns a task - the task can directly be returned:
    //
    template<typename _ReturnType>
    struct _SelectorTaskGenerator<_TypeSelectorAsyncTask, _ReturnType>
    {
        template<typename _Function>
        static task<_ReturnType> _GenerateTask_0(const _Function& _Func, cancellation_token_source _Cts, const _TaskCreationCallstack & _callstack)
        {
            return _Func();
        }

        template<typename _Function>
        static task<_ReturnType> _GenerateTask_1C(const _Function& _Func, cancellation_token_source _Cts, const _TaskCreationCallstack & _callstack)
        {
            return _Func(_Cts.get_token());
        }

        template<typename _Function, typename _ProgressObject>
        static task<_ReturnType> _GenerateTask_1P(const _Function& _Func, const _ProgressObject& _Progress, cancellation_token_source _Cts, const _TaskCreationCallstack & _callstack)
        {
            return _Func(_Progress);
        }

        template<typename _Function, typename _ProgressObject>
        static task<_ReturnType> _GenerateTask_2PC(const _Function& _Func, const _ProgressObject& _Progress, cancellation_token_source _Cts, const _TaskCreationCallstack & _callstack)
        {
            return _Func(_Progress, _Cts.get_token());
        }
    };

    template<>
    struct _SelectorTaskGenerator<_TypeSelectorAsyncTask, void>
    {
        template<typename _Function>
        static task<void> _GenerateTask_0(const _Function& _Func, cancellation_token_source _Cts, const _TaskCreationCallstack & _callstack)
        {
            return _Func();
        }

        template<typename _Function>
        static task<void> _GenerateTask_1C(const _Function& _Func, cancellation_token_source _Cts, const _TaskCreationCallstack & _callstack)
        {
            return _Func(_Cts.get_token());
        }

        template<typename _Function, typename _ProgressObject>
        static task<void> _GenerateTask_1P(const _Function& _Func, const _ProgressObject& _Progress, cancellation_token_source _Cts, const _TaskCreationCallstack & _callstack)
        {
            return _Func(_Progress);
        }

        template<typename _Function, typename _ProgressObject>
        static task<void> _GenerateTask_2PC(const _Function& _Func, const _ProgressObject& _Progress, cancellation_token_source _Cts, const _TaskCreationCallstack & _callstack)
        {
            return _Func(_Progress, _Cts.get_token());
        }
    };

    template<typename _Generator, bool _TakesToken, bool TakesProgress>
    struct _TaskGenerator
    {
    };

    template<typename _Generator>
    struct _TaskGenerator<_Generator, false, false>
    {
        template<typename _Function, typename _ClassPtr, typename _ProgressType>
        static auto _GenerateTask(const _Function& _Func, _ClassPtr _Ptr, cancellation_token_source _Cts, const _TaskCreationCallstack & _callstack)
            -> decltype(_Generator::_GenerateTask_0(_Func, _Cts, _callstack))
        {
#ifndef _PPLTASKS_NO_STDFUNC
            typedef decltype(_Func()) _ReturnType;
            typedef ::std::function<_ReturnType __cdecl()> _StdFunction;
            return _Generator::_GenerateTask_0(_StdFunction(_Func), _Cts, _callstack);
#else
            return _Generator::_GenerateTask_0(_Func, _Cts, _callstack);
#endif
        }
    };

    template<typename _Generator>
    struct _TaskGenerator<_Generator, true, false>
    {
        template<typename _Function, typename _ClassPtr, typename _ProgressType>
        static auto _GenerateTask(const _Function& _Func, _ClassPtr _Ptr, cancellation_token_source _Cts, const _TaskCreationCallstack & _callstack)
            -> decltype(_Generator::_GenerateTask_0(_Func, _Cts, _callstack))
        {
#ifndef _PPLTASKS_NO_STDFUNC
            typedef decltype(_Func(details::declval<cancellation_token>())) _ReturnType;
            return _Generator::_GenerateTask_1C(::std::function<_ReturnType __cdecl(cancellation_token)>(_Func), _Cts, _callstack);
#else
            return _Generator::_GenerateTask_1C(_Func, _Cts, _callstack);
#endif
        }
    };

    template<typename _Generator>
    struct _TaskGenerator<_Generator, false, true>
    {
        template<typename _Function, typename _ClassPtr, typename _ProgressType>
        static auto _GenerateTask(const _Function& _Func, _ClassPtr _Ptr, cancellation_token_source _Cts, const _TaskCreationCallstack & _callstack)
            -> decltype(_Generator::_GenerateTask_0(_Func, _Cts, _callstack))
        {
#ifndef _PPLTASKS_NO_STDFUNC
            typedef decltype(_Func(details::declval<const progress_reporter<_ProgressType>&>())) _ReturnType;
            return _Generator::_GenerateTask_1P(::std::function<_ReturnType __cdecl(const progress_reporter<_ProgressType>&)>(_Func), progress_reporter<_ProgressType>::_CreateReporter(_Ptr), _Cts, _callstack);
#else
            return _Generator::_GenerateTask_1P(_Func, progress_reporter<_ProgressType>::_CreateReporter(_Ptr), _Cts, _callstack);
#endif
        }
    };

    template<typename _Generator>
    struct _TaskGenerator<_Generator, true, true>
    {
        template<typename _Function, typename _ClassPtr, typename _ProgressType>
        static auto _GenerateTask(const _Function& _Func, _ClassPtr _Ptr, cancellation_token_source _Cts, const _TaskCreationCallstack & _callstack)
            -> decltype(_Generator::_GenerateTask_0(_Func, _Cts, _callstack))
        {
#ifndef _PPLTASKS_NO_STDFUNC
            typedef decltype(_Func(details::declval<const progress_reporter<_ProgressType>&>(), details::declval<cancellation_token>())) _ReturnType;
            return _Generator::_GenerateTask_2PC(::std::function<_ReturnType __cdecl(const progress_reporter<_ProgressType>&, cancellation_token)>(_Func), progress_reporter<_ProgressType>::_CreateReporter(_Ptr), _Cts, _callstack);
#else
            return _Generator::_GenerateTask_2PC(_Func, progress_reporter<_ProgressType>::_CreateReporter(_Ptr), _Cts, _callstack);
#endif
        }
    };

    // ***************************************************************************
    // Async Operation Attributes Classes
    //
    // These classes are passed through the hierarchy of async base classes in order to hold multiple attributes of a given async construct in
    // a single container. An attribute class must define:
    //
    // Mandatory:
    // -------------------------
    //
    // _AsyncBaseType           : The Windows Runtime interface which is being implemented.
    // _CompletionDelegateType  : The Windows Runtime completion delegate type for the interface.
    // _ProgressDelegateType    : If _TakesProgress is true, the Windows Runtime progress delegate type for the interface. If it is false, an empty Windows Runtime type.
    // _ReturnType              : The return type of the async construct (void for actions / non-void for operations)
    //
    // _TakesProgress           : An indication as to whether or not
    //
    //
    // Optional:
    // -------------------------
    //

    template<typename _ProgressType, typename _ReturnType, typename _TaskTraits, bool _TakesToken, bool _TakesProgress>
    struct _AsyncAttributes
    {
    };

    template<typename _ProgressTypeParam, typename _ReturnTypeParam, typename _TaskTraits, bool _TakesToken>
    struct _AsyncAttributes<_ProgressTypeParam, _ReturnTypeParam, _TaskTraits, _TakesToken, true>
    {
        typedef _ReturnTypeParam _ReturnType;
        typedef _ProgressTypeParam _ProgressType;
        typedef Windows::Foundation::IAsyncOperationWithProgress<_ReturnType, _ProgressType> _AsyncBaseType;
        typedef Windows::Foundation::AsyncOperationProgressHandler<_ReturnType, _ProgressType> _ProgressDelegateType;
        typedef Windows::Foundation::AsyncOperationWithProgressCompletedHandler<_ReturnType, _ProgressType> _CompletionDelegateType;
        typedef typename _TaskTraits::_AsyncKind _AsyncKind;
        typedef _SelectorTaskGenerator<_AsyncKind, _ReturnType> _SelectorTaskGenerator;
        typedef _TaskGenerator<_SelectorTaskGenerator, _TakesToken, true> _TaskGenerator;

        static constexpr bool _TakesProgress = true;
        static constexpr bool _TakesToken = _TakesToken;
    };

    template<typename _ProgressTypeParam, typename _ReturnTypeParam, typename _TaskTraits, bool _TakesToken>
    struct _AsyncAttributes<_ProgressTypeParam, _ReturnTypeParam, _TaskTraits, _TakesToken, false>
    {
        typedef _ReturnTypeParam _ReturnType;
        typedef _ProgressTypeParam _ProgressType;
        typedef Windows::Foundation::IAsyncOperation<_ReturnType> _AsyncBaseType;
        typedef _Zip _ProgressDelegateType;
        typedef Windows::Foundation::AsyncOperationCompletedHandler<_ReturnType> _CompletionDelegateType;
        typedef typename _TaskTraits::_AsyncKind _AsyncKind;
        typedef _SelectorTaskGenerator<_AsyncKind, _ReturnType> _SelectorTaskGenerator;
        typedef _TaskGenerator<_SelectorTaskGenerator, _TakesToken, false> _TaskGenerator;

        static constexpr bool _TakesProgress = false;
        static constexpr bool _TakesToken = _TakesToken;
    };

    template<typename _ProgressTypeParam, typename _TaskTraits, bool _TakesToken>
    struct _AsyncAttributes<_ProgressTypeParam, void, _TaskTraits, _TakesToken, true>
    {
        typedef void _ReturnType;
        typedef _ProgressTypeParam _ProgressType;
        typedef Windows::Foundation::IAsyncActionWithProgress<_ProgressType> _AsyncBaseType;
        typedef Windows::Foundation::AsyncActionProgressHandler<_ProgressType> _ProgressDelegateType;
        typedef Windows::Foundation::AsyncActionWithProgressCompletedHandler<_ProgressType> _CompletionDelegateType;
        typedef typename _TaskTraits::_AsyncKind _AsyncKind;
        typedef _SelectorTaskGenerator<_AsyncKind, _ReturnType> _SelectorTaskGenerator;
        typedef _TaskGenerator<_SelectorTaskGenerator, _TakesToken, true> _TaskGenerator;

        static constexpr bool _TakesProgress = true;
        static constexpr bool _TakesToken = _TakesToken;
    };

    template<typename _ProgressTypeParam, typename _TaskTraits, bool _TakesToken>
    struct _AsyncAttributes<_ProgressTypeParam, void, _TaskTraits, _TakesToken, false>
    {
        typedef void _ReturnType;
        typedef _ProgressTypeParam _ProgressType;
        typedef Windows::Foundation::IAsyncAction _AsyncBaseType;
        typedef _Zip _ProgressDelegateType;
        typedef Windows::Foundation::AsyncActionCompletedHandler _CompletionDelegateType;
        typedef typename _TaskTraits::_AsyncKind _AsyncKind;
        typedef _SelectorTaskGenerator<_AsyncKind, _ReturnType> _SelectorTaskGenerator;
        typedef _TaskGenerator<_SelectorTaskGenerator, _TakesToken, false> _TaskGenerator;

        static constexpr bool _TakesProgress = false;
        static constexpr bool _TakesToken = _TakesToken;
    };

    template<typename _Function>
    struct _AsyncLambdaTypeTraits
    {
        typedef typename _FunctorTypeTraits<_Function>::_ReturnType _ReturnType;
        typedef typename _FunctorTypeTraits<_Function>::_Argument1Type _Argument1Type;
        typedef typename _CAFunctorOptions<_Function>::_ProgressType _ProgressType;

        static constexpr bool _TakesProgress = _CAFunctorOptions<_Function>::_TakesProgress;
        static constexpr bool _TakesToken = _CAFunctorOptions<_Function>::_TakesToken;

        typedef _TaskTypeTraits<_ReturnType> _TaskTraits;
        typedef _AsyncAttributes<_ProgressType, typename _TaskTraits::_TaskRetType, _TaskTraits, _TakesToken, _TakesProgress> _AsyncAttributes;
    };

    struct _AsyncAttributesTaskGenerator
    {
        // _Generate_Task           : A function adapting the user's function into what's necessary to produce the appropriate task
        template<typename _Function, typename _ClassPtr, typename _AsyncAttributesT>
        static task<typename _AsyncAttributesT::_ReturnType> _Generate_Task(const _Function& _Func, _ClassPtr _Ptr, cancellation_token_source _Cts, const _TaskCreationCallstack & _callstack)
        {
            return _AsyncAttributesT::_TaskGenerator::_GenerateTask<_Function, _ClassPtr, _AsyncAttributesT::_ProgressType>(_Func, _Ptr, _Cts, _callstack);
        }
    };

    // ***************************************************************************
    // AsyncInfo (and completion) Layer:
    //

    //
    // Internal base class implementation for async operations (based on internal Windows representation for ABI level async operations)
    //
    template < typename _Attributes, _AsyncResultType _ResultType = SingleResult >
    ref class _AsyncInfoBase abstract : _Attributes::_AsyncBaseType
    {
    internal:

        _AsyncInfoBase() :
            _M_currentStatus(_AsyncStatusInternal::_AsyncCreated),
            _M_errorCode(S_OK),
            _M_completeDelegate(nullptr),
            _M_CompleteDelegateAssigned(0),
            _M_CallbackMade(0)
        {
            _M_id = ::Concurrency::details::platform::GetNextAsyncId();
        }

    public:
        virtual typename _Attributes::_ReturnType GetResults()
        {
            throw ::Platform::Exception::CreateException(E_UNEXPECTED);
        }

        virtual property unsigned int Id
        {
            unsigned int get()
            {
                _CheckValidStateForAsyncInfoCall();

                return _M_id;
            }

            void set(unsigned int id)
            {
                _CheckValidStateForAsyncInfoCall();

                if (id == 0)
                {
                    throw ::Platform::Exception::CreateException(E_INVALIDARG);
                }
                else if (_M_currentStatus != _AsyncStatusInternal::_AsyncCreated)
                {
                    throw ::Platform::Exception::CreateException(E_ILLEGAL_METHOD_CALL);
                }

                _M_id = id;
            }
        }

        virtual property Windows::Foundation::AsyncStatus Status
        {
            Windows::Foundation::AsyncStatus get()
            {
                _CheckValidStateForAsyncInfoCall();

                _AsyncStatusInternal _Current = _M_currentStatus;

                //
                // Map our internal cancel pending to cancelled. This way "pending cancelled" looks to the outside as "cancelled" but
                // can still transition to "completed" if the operation completes without acknowledging the cancellation request
                //
                switch(_Current)
                {
                    case _AsyncCancelPending:
                        _Current = _AsyncCanceled;
                        break;
                    case _AsyncCreated:
                        _Current = _AsyncStarted;
                        break;
                    default:
                        break;
                }

                return static_cast<Windows::Foundation::AsyncStatus>(_Current);
            }
        }

        virtual property Windows::Foundation::HResult ErrorCode
        {
            Windows::Foundation::HResult get()
            {
                _CheckValidStateForAsyncInfoCall();

                Windows::Foundation::HResult _Hr;
                _Hr.Value = _M_errorCode;
                return _Hr;
            }
        }

        virtual property typename _Attributes::_ProgressDelegateType^ Progress
        {
            typename typename _Attributes::_ProgressDelegateType^ get()
            {
                return _GetOnProgress();
            }

            void set(typename _Attributes::_ProgressDelegateType^ _ProgressHandler)
            {
                _PutOnProgress(_ProgressHandler);
            }
        }

        virtual void Cancel()
        {
            if (_TransitionToState(_AsyncCancelPending))
            {
                _OnCancel();
            }
        }

        virtual void Close()
        {
            if (_TransitionToState(_AsyncClosed))
            {
                _OnClose();
            }
            else
            {
                if (_M_currentStatus != _AsyncClosed) // Closed => Closed transition is just ignored
                {
                    throw ::Platform::Exception::CreateException(E_ILLEGAL_STATE_CHANGE);
                }
            }
        }

        virtual property typename _Attributes::_CompletionDelegateType^ Completed
        {
            typename _Attributes::_CompletionDelegateType^ get()
            {
                _CheckValidStateForDelegateCall();
                return _M_completeDelegate;
            }

            void set(typename _Attributes::_CompletionDelegateType^ _CompleteHandler)
            {
                _CheckValidStateForDelegateCall();
                // this delegate property is "write once"
                if (InterlockedIncrement(&_M_CompleteDelegateAssigned) == 1)
                {
                    _M_completeDelegateContext = _ContextCallback::_CaptureCurrent();
                    _M_completeDelegate = _CompleteHandler;
                    // Guarantee that the write of _M_completeDelegate is ordered with respect to the read of state below
                    // as perceived from _FireCompletion on another thread.
                    MemoryBarrier();
                    if (_IsTerminalState())
                    {
                        _FireCompletion();
                    }
                }
                else
                {
                    throw ::Platform::Exception::CreateException(E_ILLEGAL_DELEGATE_ASSIGNMENT);
                }
            }
        }


    protected private:

        // _Start - this is not externally visible since async operations "hot start" before returning to the caller
        void _Start()
        {
            if (_TransitionToState(_AsyncStarted))
            {
                _OnStart();
            }
            else
            {
                throw ::Platform::Exception::CreateException(E_ILLEGAL_STATE_CHANGE);
            }
        }


        void _FireCompletion()
        {
            _TryTransitionToCompleted();

            // we guarantee that completion can only ever be fired once
            if (_M_completeDelegate != nullptr && InterlockedIncrement(&_M_CallbackMade) == 1)
            {
                _M_completeDelegateContext._CallInContext([=] {

                    try
                    {
                        _M_completeDelegate((_Attributes::_AsyncBaseType^)this, this->Status);
                        _M_completeDelegate = nullptr;
                    }
                    catch(::Platform::Exception^ _ex)
                    {
                        // Null out the delegate since something went wrong when calling it
                        _M_completeDelegate = nullptr;
                        if (!_IsHRCOMDisconnected(_ex->HResult))
                        {
                            throw;
                        }
                    }
                }, true); // Ignore COM disconnection error
            }
        }

        virtual typename _Attributes::_ProgressDelegateType^ _GetOnProgress()
        {
            throw ::Platform::Exception::CreateException(E_UNEXPECTED);
        }

        virtual void _PutOnProgress(typename _Attributes::_ProgressDelegateType^ _ProgressHandler)
        {
            throw ::Platform::Exception::CreateException(E_UNEXPECTED);
        }

        bool _TryTransitionToCompleted()
        {
            return _TransitionToState(_AsyncStatusInternal::_AsyncCompleted);
        }

        bool _TryTransitionToCancelled()
        {
            return _TransitionToState(_AsyncStatusInternal::_AsyncCanceled);
        }

        bool _TryTransitionToError(const HRESULT error)
        {
            _InterlockedCompareExchange(reinterpret_cast<volatile LONG*>(&_M_errorCode), error, S_OK);
            return _TransitionToState(_AsyncStatusInternal::_AsyncError);
        }

        // This method checks to see if the delegate properties can be
        // modified in the current state and generates the appropriate
        // error hr in the case of violation.
        inline void _CheckValidStateForDelegateCall()
        {
            if (_M_currentStatus == _AsyncClosed)
            {
                throw ::Platform::Exception::CreateException(E_ILLEGAL_METHOD_CALL);
            }
        }

        // This method checks to see if results can be collected in the
        // current state and generates the appropriate error hr in
        // the case of a violation.
        inline void _CheckValidStateForResultsCall()
        {
            _AsyncStatusInternal _Current = _M_currentStatus;

            if (_Current == _AsyncError)
            {
                throw ::Platform::Exception::CreateException(_M_errorCode);
            }
#pragma warning(push)
#pragma warning(disable: 4127) // Conditional expression is constant
            // single result illegal before transition to Completed or Cancelled state
            if (_ResultType == SingleResult)
#pragma warning(pop)
            {
                if (_Current != _AsyncCompleted)
                {
                    throw ::Platform::Exception::CreateException(E_ILLEGAL_METHOD_CALL);
                }
            }
            // multiple results can be called after Start has been called and before/after Completed
            else if (_Current != _AsyncStarted &&
                     _Current != _AsyncCancelPending &&
                     _Current != _AsyncCanceled &&
                     _Current != _AsyncCompleted)
            {
                throw ::Platform::Exception::CreateException(E_ILLEGAL_METHOD_CALL);
            }
        }

        // This method can be called by derived classes periodically to determine
        // whether the asynchronous operation should continue processing or should
        // be halted.
        inline bool _ContinueAsyncOperation()
        {
            return (_M_currentStatus == _AsyncStarted);
        }

        // These two methods are used to allow the async worker implementation do work on
        // state transitions. No real "work" should be done in these methods. In other words
        // they should not block for a long time on UI timescales.
        virtual void _OnStart() = 0;
        virtual void _OnClose() = 0;
        virtual void _OnCancel() = 0;

    private:

        // This method is used to check if calls to the AsyncInfo properties
        // (id, status, errorcode) are legal in the current state. It also
        // generates the appropriate error hr to return in the case of an
        // illegal call.
        inline void _CheckValidStateForAsyncInfoCall()
        {
            _AsyncStatusInternal _Current = _M_currentStatus;
            if (_Current == _AsyncClosed)
            {
                throw ::Platform::Exception::CreateException(E_ILLEGAL_METHOD_CALL);
            }
            else if (_Current == _AsyncCreated)
            {
                throw ::Platform::Exception::CreateException(E_ASYNC_OPERATION_NOT_STARTED);
            }

        }

        inline bool _TransitionToState(const _AsyncStatusInternal _NewState)
        {
            _AsyncStatusInternal _Current = _M_currentStatus;

            // This enforces the valid state transitions of the asynchronous worker object
            // state machine.
            switch(_NewState)
            {
            case _AsyncStatusInternal::_AsyncStarted:
                if (_Current != _AsyncCreated)
                {
                    return false;
                }
                break;
            case _AsyncStatusInternal::_AsyncCompleted:
                if (_Current != _AsyncStarted && _Current != _AsyncCancelPending)
                {
                    return false;
                }
                break;
            case _AsyncStatusInternal::_AsyncCancelPending:
                if (_Current != _AsyncStarted)
                {
                    return false;
                }
                break;
            case _AsyncStatusInternal::_AsyncCanceled:
                if (_Current != _AsyncStarted && _Current != _AsyncCancelPending)
                {
                    return false;
                }
                break;
            case _AsyncStatusInternal::_AsyncError:
                if (_Current != _AsyncStarted && _Current != _AsyncCancelPending)
                {
                    return false;
                }
                break;
            case _AsyncStatusInternal::_AsyncClosed:
                if (!_IsTerminalState(_Current))
                {
                    return false;
                }
                break;
            default:
                return false;
                break;
            }

            // attempt the transition to the new state
            // Note: if currentStatus_ == _Current, then there was no intervening write
            // by the async work object and the swap succeeded.
            _AsyncStatusInternal _RetState = static_cast<_AsyncStatusInternal>(
                    _InterlockedCompareExchange(reinterpret_cast<volatile LONG*>(&_M_currentStatus),
                                                _NewState,
                                                static_cast<LONG>(_Current)));

            // ICE returns the former state, if the returned state and the
            // state we captured at the beginning of this method are the same,
            // the swap succeeded.
            return (_RetState == _Current);
        }

        inline bool _IsTerminalState()
        {
            return _IsTerminalState(_M_currentStatus);
        }

        inline bool _IsTerminalState(_AsyncStatusInternal status)
        {
            return (status == _AsyncError ||
                    status == _AsyncCanceled ||
                    status == _AsyncCompleted ||
                    status == _AsyncClosed);
        }

    private:

        _ContextCallback        _M_completeDelegateContext;
        typename _Attributes::_CompletionDelegateType^  volatile _M_completeDelegate;
        _AsyncStatusInternal volatile                   _M_currentStatus;
        HRESULT volatile                                _M_errorCode;
        unsigned int                                    _M_id;
        long volatile                                   _M_CompleteDelegateAssigned;
        long volatile                                   _M_CallbackMade;
    };

    // ***************************************************************************
    // Progress Layer (optional):
    //

    // __declspec(no_empty_identity_interface) is used to suppress generation of WinRT
    // default functions (e.g. QueryInterface, AddRef, etc).  _AsyncProgressBase is never
    // used directly, so generation of WinRT functions is not needed and unnecessarily
    // increases generated code size.

    template< typename _Attributes, bool _HasProgress, _AsyncResultType _ResultType = SingleResult >
    ref class __declspec(no_empty_identity_interface) _AsyncProgressBase abstract : _AsyncInfoBase<_Attributes, _ResultType>
    {
    };

    template< typename _Attributes, _AsyncResultType _ResultType>
    ref class __declspec(no_empty_identity_interface) _AsyncProgressBase<_Attributes, true, _ResultType> abstract : _AsyncInfoBase<_Attributes, _ResultType>
    {
    internal:

        _AsyncProgressBase() : _AsyncInfoBase<_Attributes, _ResultType>(),
            _M_progressDelegate(nullptr)
        {
        }

        virtual typename _Attributes::_ProgressDelegateType^ _GetOnProgress() override
        {
            _CheckValidStateForDelegateCall();
            return _M_progressDelegate;
        }

        virtual void _PutOnProgress(typename _Attributes::_ProgressDelegateType^ _ProgressHandler) override
        {
            _CheckValidStateForDelegateCall();
            _M_progressDelegate = _ProgressHandler;
            _M_progressDelegateContext = _ContextCallback::_CaptureCurrent();
        }

        void _FireProgress(const typename _Attributes::_ProgressType& _ProgressValue)
        {
            if (_M_progressDelegate != nullptr)
            {
                _M_progressDelegateContext._CallInContext([=] {
                    try
                    {
                        _M_progressDelegate((_Attributes::_AsyncBaseType^)this, _ProgressValue);
                    }
                    catch(::Platform::Exception^ _ex)
                    {
                        // Null out the delegate since something went wrong when calling it
                        _M_progressDelegate = nullptr;
                        if (!_IsHRCOMDisconnected(_ex->HResult))
                        {
                            throw;
                        }
                    }
                }, true); // Ignore COM disconnection error
            }
        }

    private:

        _ContextCallback _M_progressDelegateContext;
        typename _Attributes::_ProgressDelegateType^ _M_progressDelegate;
    };

    // ***************************************************************************
    // Async Creation Layer:
    //
    template<typename _Function>
    ref class _AsyncTaskGeneratorThunk sealed : _AsyncProgressBase<typename _AsyncLambdaTypeTraits<_Function>::_AsyncAttributes,
        _AsyncLambdaTypeTraits<_Function>::_AsyncAttributes::_TakesProgress>
    {
    internal:

        typedef typename _AsyncLambdaTypeTraits<_Function>::_AsyncAttributes _Attributes;
        typedef typename _Attributes::_AsyncBaseType _AsyncBaseType;

        _AsyncTaskGeneratorThunk(const _Function& _Func, const _TaskCreationCallstack &_callstack) : _M_func(_Func), _M_creationCallstack(_callstack)
        {
            // Virtual call here is safe as the class is declared 'sealed'
            _Start();
        }

    public:

        virtual typename _Attributes::_ReturnType GetResults() override
        {
            _CheckValidStateForResultsCall();
            return _M_task.get();
        }

    protected:

        //
        // The only thing we must do different from the base class is we must spin the hot task on transition from Created->Started. Otherwise,
        // let the base thunk handle everything.
        //

        virtual void _OnStart() override
        {
            //
            // Call the appropriate task generator to actually produce a task of the expected type. This might adapt the user lambda for progress reports,
            // wrap the return result in a task, or allow for direct return of a task depending on the form of the lambda.
            //
            _M_task = _AsyncAttributesTaskGenerator::_Generate_Task<_Function, _AsyncTaskGeneratorThunk<_Function>^, _Attributes>(_M_func, this, _M_cts, _M_creationCallstack);
            _M_task.then([=](task<typename _Attributes::_ReturnType> _Antecedent) {
                try
                {
                    _Antecedent.get();
                }
                catch (task_canceled&)
                {
                    this->_TryTransitionToCancelled();
                }
                catch (::Platform::Exception^ _Ex)
                {
                    this->_TryTransitionToError(_Ex->HResult);
                }
                catch (...)
                {
                    this->_TryTransitionToError(E_FAIL);
                }
                this->_FireCompletion();
            });
        }

        virtual void _OnCancel() override
        {
            _M_cts.cancel();
        }

        virtual void _OnClose() override
        {
        }

    private:

        task<typename _Attributes::_ReturnType> _M_task;
        cancellation_token_source _M_cts;
        _TaskCreationCallstack _M_creationCallstack;
        _Function _M_func;
    };
} // namespace details

/// <summary>
///     Creates a Windows Runtime asynchronous construct based on a user supplied lambda or function object. The return type of <c>create_async</c> is
///     one of either <c>IAsyncAction^</c>, <c>IAsyncActionWithProgress&lt;TProgress&gt;^</c>, <c>IAsyncOperation&lt;TResult&gt;^</c>, or
///     <c>IAsyncOperationWithProgress&lt;TResult, TProgress&gt;^</c> based on the signature of the lambda passed to the method.
/// </summary>
/// <param name="_Func">
///     The lambda or function object from which to create a Windows Runtime asynchronous construct.
/// </param>
/// <returns>
///     An asynchronous construct represented by an IAsyncAction^, IAsyncActionWithProgress&lt;TProgress&gt;^, IAsyncOperation&lt;TResult&gt;^, or an
///     IAsyncOperationWithProgress&lt;TResult, TProgress&gt;^. The interface returned depends on the signature of the lambda passed into the function.
/// </returns>
/// <remarks>
///     The return type of the lambda determines whether the construct is an action or an operation.
///     <para>Lambdas that return void cause the creation of actions. Lambdas that return a result of type <c>TResult</c> cause the creation of
///     operations of TResult.</para>
///     <para>The lambda may also return a <c>task&lt;TResult&gt;</c> which encapsulates the asynchronous work within itself or is the continuation of
///     a chain of tasks that represent the asynchronous work. In this case, the lambda itself is executed inline, since the tasks are the ones that
///     execute asynchronously, and the return type of the lambda is unwrapped to produce the asynchronous construct returned by <c>create_async</c>.
///     This implies that a lambda that returns a task&lt;void&gt; will cause the creation of actions, and a lambda that returns a task&lt;TResult&gt; will
///     cause the creation of operations of TResult.</para>
///     <para>The lambda may take either zero, one or two arguments. The valid arguments are <c>progress_reporter&lt;TProgress&gt;</c> and
///     <c>cancellation_token</c>, in that order if both are used. A lambda without arguments causes the creation of an asynchronous construct without
///     the capability for progress reporting. A lambda that takes a progress_reporter&lt;TProgress&gt; will cause <c>create_async</c> to return an asynchronous
///     construct which reports progress of type TProgress each time the <c>report</c> method of the progress_reporter object is called. A lambda that
///     takes a cancellation_token may use that token to check for cancellation, or pass it to tasks that it creates so that cancellation of the
///     asynchronous construct causes cancellation of those tasks.</para>
///     <para>If the body of the lambda or function object returns a result (and not a task&lt;TResult&gt;), the lambda will be executed
///     asynchronously within the process MTA in the context of a task the Runtime implicitly creates for it. The <c>IAsyncInfo::Cancel</c> method will
///     cause cancellation of the implicit task.</para>
///     <para>If the body of the lambda returns a task, the lambda executes inline, and by declaring the lambda to take an argument of type
///     <c>cancellation_token</c> you can trigger cancellation of any tasks you create within the lambda by passing that token in when you create them.
///     You may also use the <c>register_callback</c> method on the token to cause the Runtime to invoke a callback when you call <c>IAsyncInfo::Cancel</c> on
///     the async operation or action produced..</para>
///     <para>This function is only available to Windows Store apps.</para>
/// </remarks>
/// <seealso cref="task Class"/>
/// <seealso cref="progress_reporter Class"/>
/// <seealso cref="cancelation_token Class"/>
/**/
template<typename _Function>
__declspec(noinline)
details::_AsyncTaskGeneratorThunk<_Function> ^create_async(const _Function& _Func)
{
    static_assert(::std::is_same_v<decltype(details::_IsValidCreateAsync(_Func,0,0,0,0)), ::std::true_type>,
        "argument to create_async must be a callable object taking zero, one or two arguments");

    return ref new details::_AsyncTaskGeneratorThunk<_Function>(_Func, _CAPTURE_CALLSTACK());
}

#endif  /* defined (__cplusplus_winrt) */

namespace details
{
    // Helper struct for when_all operators to know when tasks have completed
    template<typename _Type>
    struct _RunAllParam
    {
        _RunAllParam() : _M_completeCount(0), _M_numTasks(0)
        {
        }

        void _Resize(size_t _Len, bool _SkipVector = false)
        {
            _M_numTasks = _Len;
            if (!_SkipVector)
            {
                _M_vector._Result.resize(_Len);
            }
        }

        task_completion_event<_Unit_type>   _M_completed;
        _ResultHolder<::std::vector<_Type>> _M_vector;
        _ResultHolder<_Type>                _M_mergeVal;
        atomic_size_t                       _M_completeCount;
        size_t                              _M_numTasks;
    };

    template<typename _Type>
    struct _RunAllParam<::std::vector<_Type>>
    {
        _RunAllParam() : _M_completeCount(0), _M_numTasks(0)
        {
        }

        void _Resize(size_t _Len, bool _SkipVector = false)
        {
            _M_numTasks = _Len;

            if (!_SkipVector)
            {
                _M_vector.resize(_Len);
            }
        }

        task_completion_event<_Unit_type>                  _M_completed;
        ::std::vector<_ResultHolder<::std::vector<_Type>>> _M_vector;
        atomic_size_t                                      _M_completeCount;
        size_t                                             _M_numTasks;
    };

    // Helper struct specialization for void
    template<>
    struct _RunAllParam<_Unit_type>
    {
        _RunAllParam() : _M_completeCount(0), _M_numTasks(0)
        {
        }

        void _Resize(size_t _Len)
        {
            _M_numTasks = _Len;
        }

        task_completion_event<_Unit_type> _M_completed;
        atomic_size_t _M_completeCount;
        size_t _M_numTasks;
    };

    inline void _JoinAllTokens_Add(const cancellation_token_source& _MergedSrc, _CancellationTokenState *_PJoinedTokenState)
    {
        if (_PJoinedTokenState != nullptr && _PJoinedTokenState != _CancellationTokenState::_None())
        {
            cancellation_token _T = cancellation_token::_FromImpl(_PJoinedTokenState);
            _T.register_callback( [=](){
                _MergedSrc.cancel();
                });
        }
    }

    template<typename _ElementType, typename _Function, typename _TaskType>
    void _WhenAllContinuationWrapper(_RunAllParam<_ElementType>* _PParam, _Function _Func, task<_TaskType>& _Task)
    {
        if (_Task._GetImpl()->_IsCompleted())
        {
            _Func();
            const auto _NumTasks = _PParam->_M_numTasks; // must read before atomic_increment(), see VSO-2326552
            if (atomic_increment(_PParam->_M_completeCount) == _NumTasks)
            {
                // Inline execute its direct continuation, the _ReturnTask
                _PParam->_M_completed.set(_Unit_type());
                // It's safe to delete it since all usage of _PParam in _ReturnTask has been finished.
                delete _PParam;
            }
        }
        else
        {
            _ASSERTE(_Task._GetImpl()->_IsCanceled());
            if (_Task._GetImpl()->_HasUserException())
            {
                // _Cancel will return false if the TCE is already canceled with or without exception
                if (!_PParam->_M_completed._Cancel(_Task._GetImpl()->_GetExceptionHolder()))
                {
                    atomic_exchange(_Task._GetImpl()->_GetExceptionHolder()->_M_exceptionObserved, 1l);
                }
            }
            else
            {
                _PParam->_M_completed._Cancel();
            }

            const auto _NumTasks = _PParam->_M_numTasks; // must read before atomic_increment(), see VSO-2326552
            if (atomic_increment(_PParam->_M_completeCount) == _NumTasks)
            {
                delete _PParam;
            }
        }
    }

    template<typename _ElementType, typename _Iterator>
    struct _WhenAllImpl
    {
        static task<::std::vector<_ElementType>> _Perform(const task_options& _TaskOptions, _Iterator _Begin, _Iterator _End)
        {
            _CancellationTokenState *_PTokenState = _TaskOptions.has_cancellation_token() ? _TaskOptions.get_cancellation_token()._GetImplValue() : nullptr;

            auto _PParam = new _RunAllParam<_ElementType>();
            cancellation_token_source _MergedSource;

            // Step1: Create task completion event.
            task_options _Options(_TaskOptions);
            _Options.set_cancellation_token(_MergedSource.get_token());
            task<_Unit_type> _All_tasks_completed(_PParam->_M_completed, _Options);
            // The return task must be created before step 3 to enforce inline execution.
            auto _ReturnTask = _All_tasks_completed._Then([=](_Unit_type) -> ::std::vector<_ElementType> {
                return _PParam->_M_vector.Get();
            }, nullptr);

            // Step2: Combine and check tokens, and count elements in range.
            if (_PTokenState)
            {
                _JoinAllTokens_Add(_MergedSource, _PTokenState);
                _PParam->_Resize(static_cast<size_t>(::std::distance(_Begin, _End)));
            }
            else
            {
                size_t _TaskNum = 0;
                for (auto _PTask = _Begin; _PTask != _End; ++_PTask)
                {
                    _TaskNum++;
                    _JoinAllTokens_Add(_MergedSource, _PTask->_GetImpl()->_M_pTokenState);
                }
                _PParam->_Resize(_TaskNum);
            }

            // Step3: Check states of previous tasks.
            if( _Begin == _End )
            {
                _PParam->_M_completed.set(_Unit_type());
                delete _PParam;
            }
            else
            {
                size_t _Index = 0;
                for (auto _PTask = _Begin; _PTask != _End; ++_PTask)
                {
                    if (_PTask->is_apartment_aware())
                    {
                        _ReturnTask._SetAsync();
                    }

                    _PTask->_Then([_PParam, _Index](task<_ElementType> _ResultTask) {

                        auto _Func = [_PParam, _Index, &_ResultTask](){
                            _PParam->_M_vector._Result[_Index] = _ResultTask._GetImpl()->_GetResult();
                        };

                        _WhenAllContinuationWrapper(_PParam, _Func, _ResultTask);
                    }, _CancellationTokenState::_None());

                    _Index++;
                }
            }

            return _ReturnTask;
        }
    };

    template<typename _ElementType, typename _Iterator>
    struct _WhenAllImpl<::std::vector<_ElementType>, _Iterator>
    {
        static task<::std::vector<_ElementType>> _Perform(const task_options& _TaskOptions, _Iterator _Begin, _Iterator _End)
        {
            _CancellationTokenState *_PTokenState = _TaskOptions.has_cancellation_token() ? _TaskOptions.get_cancellation_token()._GetImplValue() : nullptr;

            auto _PParam = new _RunAllParam<::std::vector<_ElementType>>();
            cancellation_token_source _MergedSource;

            // Step1: Create task completion event.
            task_options _Options(_TaskOptions);
            _Options.set_cancellation_token(_MergedSource.get_token());
            task<_Unit_type> _All_tasks_completed(_PParam->_M_completed, _Options);
            // The return task must be created before step 3 to enforce inline execution.
            auto _ReturnTask = _All_tasks_completed._Then([=](_Unit_type) -> ::std::vector<_ElementType> {
                _ASSERTE(_PParam->_M_completeCount ==  _PParam->_M_numTasks);
                ::std::vector<_ElementType> _Result;
                for(size_t _I = 0; _I < _PParam->_M_numTasks; _I++)
                {
                    const ::std::vector<_ElementType>& _Vec = _PParam->_M_vector[_I].Get();
                    _Result.insert(_Result.end(), _Vec.begin(), _Vec.end());
                }
                return _Result;
            }, nullptr);

            // Step2: Combine and check tokens, and count elements in range.
            if (_PTokenState)
            {
                _JoinAllTokens_Add(_MergedSource, _PTokenState);
                _PParam->_Resize(static_cast<size_t>(::std::distance(_Begin, _End)));
            }
            else
            {
                size_t _TaskNum = 0;
                for (auto _PTask = _Begin; _PTask != _End; ++_PTask)
                {
                    _TaskNum++;
                    _JoinAllTokens_Add(_MergedSource, _PTask->_GetImpl()->_M_pTokenState);
                }
                _PParam->_Resize(_TaskNum);
            }

            // Step3: Check states of previous tasks.
            if( _Begin == _End )
            {
                _PParam->_M_completed.set(_Unit_type());
                delete _PParam;
            }
            else
            {
                size_t _Index = 0;
                for (auto _PTask = _Begin; _PTask != _End; ++_PTask)
                {
                    if (_PTask->is_apartment_aware())
                    {
                        _ReturnTask._SetAsync();
                    }

                    _PTask->_Then([_PParam, _Index](task<::std::vector<_ElementType>> _ResultTask) {
                        auto _Func = [_PParam, _Index, &_ResultTask]() {
                            _PParam->_M_vector[_Index].Set(_ResultTask._GetImpl()->_GetResult());
                        };

                        _WhenAllContinuationWrapper(_PParam, _Func, _ResultTask);
                    }, _CancellationTokenState::_None());

                    _Index++;
                }
            }

            return  _ReturnTask;
        }
    };

    template<typename _Iterator>
    struct _WhenAllImpl<void, _Iterator>
    {
        static task<void> _Perform(const task_options& _TaskOptions, _Iterator _Begin, _Iterator _End)
        {
            _CancellationTokenState *_PTokenState = _TaskOptions.has_cancellation_token() ? _TaskOptions.get_cancellation_token()._GetImplValue() : nullptr;

            auto _PParam = new _RunAllParam<_Unit_type>();
            cancellation_token_source _MergedSource;

            // Step1: Create task completion event.
            task_options _Options(_TaskOptions);
            _Options.set_cancellation_token(_MergedSource.get_token());
            task<_Unit_type> _All_tasks_completed(_PParam->_M_completed, _Options);
            // The return task must be created before step 3 to enforce inline execution.
            auto _ReturnTask = _All_tasks_completed._Then([=](_Unit_type) {
            }, nullptr);

            // Step2: Combine and check tokens, and count elements in range.
            if (_PTokenState)
            {
                _JoinAllTokens_Add(_MergedSource, _PTokenState);
                _PParam->_Resize(static_cast<size_t>(::std::distance(_Begin, _End)));
            }
            else
            {
                size_t _TaskNum = 0;
                for (auto _PTask = _Begin; _PTask != _End; ++_PTask)
                {
                    _TaskNum++;
                    _JoinAllTokens_Add(_MergedSource, _PTask->_GetImpl()->_M_pTokenState);
                }
                _PParam->_Resize(_TaskNum);
            }

            // Step3: Check states of previous tasks.
            if( _Begin == _End )
            {
                _PParam->_M_completed.set(_Unit_type());
                delete _PParam;
            }
            else
            {
                for (auto _PTask = _Begin; _PTask != _End; ++_PTask)
                {
                    if (_PTask->is_apartment_aware())
                    {
                        _ReturnTask._SetAsync();
                    }

                    _PTask->_Then([_PParam](task<void> _ResultTask) {
                        auto _Func = [](){};
                        _WhenAllContinuationWrapper(_PParam, _Func, _ResultTask);
                    }, _CancellationTokenState::_None());
                }
            }

            return _ReturnTask;
        }
    };

    template<typename _ReturnType>
    task<::std::vector<_ReturnType>> _WhenAllVectorAndValue(const task<::std::vector<_ReturnType>>& _VectorTask, const task<_ReturnType>& _ValueTask,
                                                          bool _OutputVectorFirst)
    {
        auto _PParam = new _RunAllParam<_ReturnType>();
        cancellation_token_source _MergedSource;

        // Step1: Create task completion event.
        task<_Unit_type> _All_tasks_completed(_PParam->_M_completed, _MergedSource.get_token());
        // The return task must be created before step 3 to enforce inline execution.
        auto _ReturnTask = _All_tasks_completed._Then([=](_Unit_type) -> ::std::vector<_ReturnType> {
            _ASSERTE(_PParam->_M_completeCount == 2);
            auto _Result = _PParam->_M_vector.Get(); // copy by value
            auto _mergeVal = _PParam->_M_mergeVal.Get();

            if (_OutputVectorFirst == true)
            {
                _Result.push_back(_mergeVal);
            }
            else
            {
                _Result.insert(_Result.begin(), _mergeVal);
            }
            return _Result;
        }, nullptr);

        // Step2: Combine and check tokens.
        _JoinAllTokens_Add(_MergedSource, _VectorTask._GetImpl()->_M_pTokenState);
        _JoinAllTokens_Add(_MergedSource, _ValueTask._GetImpl()->_M_pTokenState);

        // Step3: Check states of previous tasks.
        _PParam->_Resize(2, true);

        if (_VectorTask.is_apartment_aware() || _ValueTask.is_apartment_aware())
        {
            _ReturnTask._SetAsync();
        }
        _VectorTask._Then([_PParam](task<::std::vector<_ReturnType>> _ResultTask) {
            auto _Func = [_PParam, &_ResultTask]() {
                auto _ResultLocal = _ResultTask._GetImpl()->_GetResult();
                _PParam->_M_vector.Set(_ResultLocal);
            };

            _WhenAllContinuationWrapper(_PParam, _Func, _ResultTask);
        }, _CancellationTokenState::_None());
        _ValueTask._Then([_PParam](task<_ReturnType> _ResultTask) {
            auto _Func = [_PParam, &_ResultTask]() {
                auto _ResultLocal = _ResultTask._GetImpl()->_GetResult();
                _PParam->_M_mergeVal.Set(_ResultLocal);
            };

            _WhenAllContinuationWrapper(_PParam, _Func, _ResultTask);
        }, _CancellationTokenState::_None());

        return _ReturnTask;
    }
} // namespace details

/// <summary>
///     Creates a task that will complete successfully when all of the tasks supplied as arguments complete successfully.
/// </summary>
/// <typeparam name="_Iterator">
///     The type of the input iterator.
/// </typeparam>
/// <param name="_Begin">
///     The position of the first element in the range of elements to be combined into the resulting task.
/// </param>
/// <param name="_End">
///     The position of the first element beyond the range of elements to be combined into the resulting task.
/// </param>
/// <returns>
///     A task that completes successfully when all of the input tasks have completed successfully. If the input tasks are of type <c>T</c>,
///     the output of this function will be a <c>task&lt;std::vector&lt;T&gt;&gt;</c>. If the input tasks are of type <c>void</c> the output
///     task will also be a <c>task&lt;void&gt;</c>.
/// </returns>
/// <remarks>
///     If one of the tasks is canceled or throws an exception, the returned task will complete early, in the canceled state, and the exception,
///     if one is encountered, will be thrown if you call <c>get()</c> or <c>wait()</c> on that task.
/// </remarks>
/// <seealso cref="Task Parallelism (Concurrency Runtime)"/>
/**/
template <typename _Iterator>
auto when_all(_Iterator _Begin, _Iterator _End, const task_options& _TaskOptions = task_options())
    -> decltype (details::_WhenAllImpl<typename ::std::iterator_traits<_Iterator>::value_type::result_type, _Iterator>::_Perform(_TaskOptions, _Begin, _End))
{
    typedef typename ::std::iterator_traits<_Iterator>::value_type::result_type _ElementType;
    return details::_WhenAllImpl<_ElementType, _Iterator>::_Perform(_TaskOptions, _Begin, _End);
}

/// <summary>
///     Creates a task that will complete successfully when both of the tasks supplied as arguments complete successfully.
/// </summary>
/// <typeparam name="_ReturnType">
///     The type of the returned task.
/// </typeparam>
/// <param name="_Lhs">
///     The first task to combine into the resulting task.
/// </param>
/// <param name="_Rhs">
///     The second task to combine into the resulting task.
/// </param>
/// <returns>
///     A task that completes successfully when both of the input tasks have completed successfully. If the input tasks are of type <c>T</c>,
///     the output of this function will be a <c>task&lt;std::vector&lt;T&gt;&gt;</c>. If the input tasks are of type <c>void</c> the output
///     task will also be a <c>task&lt;void&gt;</c>.
///     <para> To allow for a construct of the sort taskA &amp;&amp; taskB &amp;&amp; taskC, which are combined in pairs, the &amp;&amp; operator
///     produces a <c>task&lt;std::vector&lt;T&gt;&gt;</c> if either one or both of the tasks are of type <c>task&lt;std::vector&lt;T&gt;&gt;</c>.</para>
/// </returns>
/// <remarks>
///     If one of the tasks is canceled or throws an exception, the returned task will complete early, in the canceled state, and the exception,
///     if one is encountered, will be thrown if you call <c>get()</c> or <c>wait()</c> on that task.
/// </remarks>
/// <seealso cref="Task Parallelism (Concurrency Runtime)"/>
/**/
template<typename _ReturnType>
auto operator&&(const task<_ReturnType> & _Lhs, const task<_ReturnType> & _Rhs)
{
    task<_ReturnType> _PTasks[2] = {_Lhs, _Rhs};
    return when_all(_PTasks, _PTasks+2);
}

/// <summary>
///     Creates a task that will complete successfully when both of the tasks supplied as arguments complete successfully.
/// </summary>
/// <typeparam name="_ReturnType">
///     The type of the returned task.
/// </typeparam>
/// <param name="_Lhs">
///     The first task to combine into the resulting task.
/// </param>
/// <param name="_Rhs">
///     The second task to combine into the resulting task.
/// </param>
/// <returns>
///     A task that completes successfully when both of the input tasks have completed successfully. If the input tasks are of type <c>T</c>,
///     the output of this function will be a <c>task&lt;std::vector&lt;T&gt;&gt;</c>. If the input tasks are of type <c>void</c> the output
///     task will also be a <c>task&lt;void&gt;</c>.
///     <para> To allow for a construct of the sort taskA &amp;&amp; taskB &amp;&amp; taskC, which are combined in pairs, the &amp;&amp; operator
///     produces a <c>task&lt;std::vector&lt;T&gt;&gt;</c> if either one or both of the tasks are of type <c>task&lt;std::vector&lt;T&gt;&gt;</c>.</para>
/// </returns>
/// <remarks>
///     If one of the tasks is canceled or throws an exception, the returned task will complete early, in the canceled state, and the exception,
///     if one is encountered, will be thrown if you call <c>get()</c> or <c>wait()</c> on that task.
/// </remarks>
/// <seealso cref="Task Parallelism (Concurrency Runtime)"/>
/**/
template<typename _ReturnType>
task<::std::vector<_ReturnType>> operator&&(const task<::std::vector<_ReturnType>> & _Lhs, const task<_ReturnType> & _Rhs)
{
    return details::_WhenAllVectorAndValue(_Lhs, _Rhs, true);
}

/// <summary>
///     Creates a task that will complete successfully when both of the tasks supplied as arguments complete successfully.
/// </summary>
/// <typeparam name="_ReturnType">
///     The type of the returned task.
/// </typeparam>
/// <param name="_Lhs">
///     The first task to combine into the resulting task.
/// </param>
/// <param name="_Rhs">
///     The second task to combine into the resulting task.
/// </param>
/// <returns>
///     A task that completes successfully when both of the input tasks have completed successfully. If the input tasks are of type <c>T</c>,
///     the output of this function will be a <c>task&lt;std::vector&lt;T&gt;&gt;</c>. If the input tasks are of type <c>void</c> the output
///     task will also be a <c>task&lt;void&gt;</c>.
///     <para> To allow for a construct of the sort taskA &amp;&amp; taskB &amp;&amp; taskC, which are combined in pairs, the &amp;&amp; operator
///     produces a <c>task&lt;std::vector&lt;T&gt;&gt;</c> if either one or both of the tasks are of type <c>task&lt;std::vector&lt;T&gt;&gt;</c>.</para>
/// </returns>
/// <remarks>
///     If one of the tasks is canceled or throws an exception, the returned task will complete early, in the canceled state, and the exception,
///     if one is encountered, will be thrown if you call <c>get()</c> or <c>wait()</c> on that task.
/// </remarks>
/// <seealso cref="Task Parallelism (Concurrency Runtime)"/>
/**/
template<typename _ReturnType>
task<::std::vector<_ReturnType>> operator&&(const task<_ReturnType> & _Lhs, const task<::std::vector<_ReturnType>> & _Rhs)
{
    return details::_WhenAllVectorAndValue(_Rhs, _Lhs, false);
}

/// <summary>
///     Creates a task that will complete successfully when both of the tasks supplied as arguments complete successfully.
/// </summary>
/// <typeparam name="_ReturnType">
///     The type of the returned task.
/// </typeparam>
/// <param name="_Lhs">
///     The first task to combine into the resulting task.
/// </param>
/// <param name="_Rhs">
///     The second task to combine into the resulting task.
/// </param>
/// <returns>
///     A task that completes successfully when both of the input tasks have completed successfully. If the input tasks are of type <c>T</c>,
///     the output of this function will be a <c>task&lt;std::vector&lt;T&gt;&gt;</c>. If the input tasks are of type <c>void</c> the output
///     task will also be a <c>task&lt;void&gt;</c>.
///     <para> To allow for a construct of the sort taskA &amp;&amp; taskB &amp;&amp; taskC, which are combined in pairs, the &amp;&amp; operator
///     produces a <c>task&lt;std::vector&lt;T&gt;&gt;</c> if either one or both of the tasks are of type <c>task&lt;std::vector&lt;T&gt;&gt;</c>.</para>
/// </returns>
/// <remarks>
///     If one of the tasks is canceled or throws an exception, the returned task will complete early, in the canceled state, and the exception,
///     if one is encountered, will be thrown if you call <c>get()</c> or <c>wait()</c> on that task.
/// </remarks>
/// <seealso cref="Task Parallelism (Concurrency Runtime)"/>
/**/
template<typename _ReturnType>
task<::std::vector<_ReturnType>> operator&&(const task<::std::vector<_ReturnType>> & _Lhs, const task<::std::vector<_ReturnType>> & _Rhs)
{
    task<::std::vector<_ReturnType>> _PTasks[2] = {_Lhs, _Rhs};
    return when_all(_PTasks, _PTasks+2);
}

namespace details
{
    // Helper struct for when_any operators to know when tasks have completed
    template <typename _CompletionType>
    struct _RunAnyParam
    {
        _RunAnyParam() : _M_exceptionRelatedToken(nullptr), _M_completeCount(0), _M_numTasks(0), _M_fHasExplicitToken(false)
        {
        }
        ~_RunAnyParam()
        {
            if (_CancellationTokenState::_IsValid(_M_exceptionRelatedToken))
                _M_exceptionRelatedToken->_Release();
        }
        task_completion_event<_CompletionType>      _M_Completed;
        cancellation_token_source                   _M_cancellationSource;
        _CancellationTokenState *                   _M_exceptionRelatedToken;
        atomic_size_t                               _M_completeCount;
        size_t                                      _M_numTasks;
        bool                                        _M_fHasExplicitToken;
    };

    template<typename _CompletionType, typename _Function, typename _TaskType>
    void _WhenAnyContinuationWrapper(_RunAnyParam<_CompletionType> * _PParam, const _Function & _Func, task<_TaskType>& _Task)
    {
        bool _IsTokenCanceled = !_PParam->_M_fHasExplicitToken && _Task._GetImpl()->_M_pTokenState != _CancellationTokenState::_None() && _Task._GetImpl()->_M_pTokenState->_IsCanceled();
        if (_Task._GetImpl()->_IsCompleted() && !_IsTokenCanceled)
        {
            _Func();
            const auto _NumTasks = _PParam->_M_numTasks; // must read before atomic_increment(), see VSO-2326552
            if (atomic_increment(_PParam->_M_completeCount) == _NumTasks)
            {
                _PParam->_M_Completed._ClearStoredException();
                delete _PParam;
            }
        }
        else
        {
            _ASSERTE(_Task._GetImpl()->_IsCanceled() || _IsTokenCanceled);
            if (_Task._GetImpl()->_HasUserException())
            {
                if (!_IsTokenCanceled && _PParam->_M_Completed._StoreException(_Task._GetImpl()->_GetExceptionHolder()))
                {
                    // This can only enter once.
                    _PParam->_M_exceptionRelatedToken = _Task._GetImpl()->_M_pTokenState;
                    _ASSERTE(_PParam->_M_exceptionRelatedToken);
                    // Deref token will be done in the _PParam destructor.
                    if (_PParam->_M_exceptionRelatedToken != _CancellationTokenState::_None())
                    {
                        _PParam->_M_exceptionRelatedToken->_Reference();
                    }
                }
                else
                {
                    // Observe exceptions that not picked
                    atomic_exchange(_Task._GetImpl()->_GetExceptionHolder()->_M_exceptionObserved, 1l);
                }
            }

            const auto _NumTasks = _PParam->_M_numTasks; // must read before atomic_increment(), see VSO-2326552
            if (atomic_increment(_PParam->_M_completeCount) == _NumTasks)
            {
                // If no one has be completed so far, we need to make some final cancellation decision.
                if (!_PParam->_M_Completed._IsTriggered())
                {
                    // If we already explicit token, we can skip the token join part.
                    if (!_PParam->_M_fHasExplicitToken)
                    {
                        if (_PParam->_M_exceptionRelatedToken)
                        {
                            _JoinAllTokens_Add(_PParam->_M_cancellationSource, _PParam->_M_exceptionRelatedToken);
                        }
                        else
                        {
                            // If haven't captured any exception token yet, there was no exception for all those tasks,
                            // so just pick a random token (current one) for normal cancellation.
                            _JoinAllTokens_Add(_PParam->_M_cancellationSource, _Task._GetImpl()->_M_pTokenState);
                        }
                    }
                    // Do exception cancellation or normal cancellation based on whether it has stored exception.
                    _PParam->_M_Completed._Cancel();
                }
                else
                    _PParam->_M_Completed._ClearStoredException();
                delete _PParam;
            }
        }
    }

    template<typename _ElementType, typename _Iterator>
    struct _WhenAnyImpl
    {
        static task<::std::pair<_ElementType, size_t>> _Perform(const task_options& _TaskOptions, _Iterator _Begin, _Iterator _End)
        {
            if( _Begin == _End )
            {
                _THROW(invalid_operation("when_any(begin, end) cannot be called on an empty container."));
            }
            _CancellationTokenState *_PTokenState = _TaskOptions.has_cancellation_token() ? _TaskOptions.get_cancellation_token()._GetImplValue() : nullptr;
            auto _PParam = new _RunAnyParam<::std::pair<::std::pair<_ElementType, size_t>, _CancellationTokenState *>>();

            if (_PTokenState)
            {
                _JoinAllTokens_Add(_PParam->_M_cancellationSource, _PTokenState);
                _PParam->_M_fHasExplicitToken = true;
            }

            task_options _Options(_TaskOptions);
            _Options.set_cancellation_token(_PParam->_M_cancellationSource.get_token());
            task<::std::pair<::std::pair<_ElementType, size_t>, _CancellationTokenState *>> _Any_tasks_completed(_PParam->_M_Completed, _Options);

            // Keep a copy ref to the token source
            auto _CancellationSource = _PParam->_M_cancellationSource;

            _PParam->_M_numTasks = static_cast<size_t>(::std::distance(_Begin, _End));
            size_t _Index = 0;
            for (auto _PTask = _Begin; _PTask != _End; ++_PTask)
            {
                if (_PTask->is_apartment_aware())
                {
                    _Any_tasks_completed._SetAsync();
                }

                _PTask->_Then([_PParam, _Index](task<_ElementType> _ResultTask) {
                    auto _Func = [&_ResultTask, _PParam, _Index]() {
                        _PParam->_M_Completed.set(::std::make_pair(::std::make_pair(_ResultTask._GetImpl()->_GetResult(), _Index),  _ResultTask._GetImpl()->_M_pTokenState));
                    };

                    _WhenAnyContinuationWrapper(_PParam, _Func, _ResultTask);
                }, _CancellationTokenState::_None());

                _Index++;
            }

            // All _Any_tasks_completed._SetAsync() must be finished before this return continuation task being created.
            return _Any_tasks_completed._Then([=](::std::pair<::std::pair<_ElementType, size_t>, _CancellationTokenState *> _Result) -> ::std::pair<_ElementType, size_t> {
                _ASSERTE(_Result.second);
                if (!_PTokenState)
                {
                    _JoinAllTokens_Add(_CancellationSource, _Result.second);
                }
                return _Result.first;
            }, nullptr);
        }
    };

    template<typename _Iterator>
    struct _WhenAnyImpl<void, _Iterator>
    {
        static task<size_t> _Perform(const task_options& _TaskOptions, _Iterator _Begin, _Iterator _End)
        {
            if( _Begin == _End )
            {
                _THROW(invalid_operation("when_any(begin, end) cannot be called on an empty container."));
            }

            _CancellationTokenState *_PTokenState = _TaskOptions.has_cancellation_token() ? _TaskOptions.get_cancellation_token()._GetImplValue() : nullptr;
            auto _PParam = new _RunAnyParam<::std::pair<size_t, _CancellationTokenState *>>();

            if (_PTokenState)
            {
                _JoinAllTokens_Add(_PParam->_M_cancellationSource, _PTokenState);
                _PParam->_M_fHasExplicitToken = true;
            }

            task_options _Options(_TaskOptions);
            _Options.set_cancellation_token(_PParam->_M_cancellationSource.get_token());
            task<::std::pair<size_t, _CancellationTokenState *>> _Any_tasks_completed(_PParam->_M_Completed, _Options);

            // Keep a copy ref to the token source
            auto _CancellationSource = _PParam->_M_cancellationSource;

            _PParam->_M_numTasks = static_cast<size_t>(::std::distance(_Begin, _End));
            size_t _Index = 0;
            for (auto _PTask = _Begin; _PTask != _End; ++_PTask)
            {
                if (_PTask->is_apartment_aware())
                {
                    _Any_tasks_completed._SetAsync();
                }

                _PTask->_Then([_PParam, _Index](task<void> _ResultTask) {
                    auto _Func = [&_ResultTask, _PParam, _Index]() {
                        _PParam->_M_Completed.set(::std::make_pair(_Index, _ResultTask._GetImpl()->_M_pTokenState));
                    };
                    _WhenAnyContinuationWrapper(_PParam, _Func, _ResultTask);
                }, _CancellationTokenState::_None());

                _Index++;
            }

            // All _Any_tasks_completed._SetAsync() must be finished before this return continuation task being created.
            return _Any_tasks_completed._Then([=](::std::pair<size_t, _CancellationTokenState *> _Result) -> size_t {
                _ASSERTE(_Result.second);
                if (!_PTokenState)
                {
                    _JoinAllTokens_Add(_CancellationSource, _Result.second);
                }
                return _Result.first;
            }, nullptr);
        }
    };
} // namespace details

/// <summary>
///     Creates a task that will complete successfully when any of the tasks supplied as arguments completes successfully.
/// </summary>
/// <typeparam name="_Iterator">
///     The type of the input iterator.
/// </typeparam>
/// <param name="_Begin">
///     The position of the first element in the range of elements to be combined into the resulting task.
/// </param>
/// <param name="_End">
///     The position of the first element beyond the range of elements to be combined into the resulting task.
/// </param>
/// <returns>
///     A task that completes successfully when any one of the input tasks has completed successfully. If the input tasks are of type <c>T</c>,
///     the output of this function will be a <c>task&lt;std::pair&lt;T, size_t&gt;&gt;></c>, where the first element of the pair is the result
///     of the completing task, and the second element is the index of the task that finished. If the input tasks are of type <c>void</c>
///     the output is a <c>task&lt;size_t&gt;</c>, where the result is the index of the completing task.
/// </returns>
/// <seealso cref="Task Parallelism (Concurrency Runtime)"/>
/**/
template<typename _Iterator>
auto when_any(_Iterator _Begin, _Iterator _End, const task_options& _TaskOptions = task_options())
    -> decltype (details::_WhenAnyImpl<typename ::std::iterator_traits<_Iterator>::value_type::result_type, _Iterator>::_Perform(_TaskOptions, _Begin, _End))
{
    typedef typename ::std::iterator_traits<_Iterator>::value_type::result_type _ElementType;
    return details::_WhenAnyImpl<_ElementType, _Iterator>::_Perform(_TaskOptions, _Begin, _End);
}

/// <summary>
///     Creates a task that will complete successfully when any of the tasks supplied as arguments completes successfully.
/// </summary>
/// <typeparam name="_Iterator">
///     The type of the input iterator.
/// </typeparam>
/// <param name="_Begin">
///     The position of the first element in the range of elements to be combined into the resulting task.
/// </param>
/// <param name="_End">
///     The position of the first element beyond the range of elements to be combined into the resulting task.
/// </param>
/// <param name="_CancellationToken">
///     The cancellation token which controls cancellation of the returned task. If you do not provide a cancellation token, the resulting
///     task will receive the cancellation token of the task that causes it to complete.
/// </param>
/// <returns>
///     A task that completes successfully when any one of the input tasks has completed successfully. If the input tasks are of type <c>T</c>,
///     the output of this function will be a <c>task&lt;std::pair&lt;T, size_t&gt;&gt;></c>, where the first element of the pair is the result
///     of the completing task, and the second element is the index of the task that finished. If the input tasks are of type <c>void</c>
///     the output is a <c>task&lt;size_t&gt;</c>, where the result is the index of the completing task.
/// </returns>
/// <seealso cref="Task Parallelism (Concurrency Runtime)"/>
/**/
template<typename _Iterator>
auto when_any(_Iterator _Begin, _Iterator _End, cancellation_token _CancellationToken)
    -> decltype (details::_WhenAnyImpl<typename ::std::iterator_traits<_Iterator>::value_type::result_type, _Iterator>::_Perform(_CancellationToken._GetImplValue(), _Begin, _End))
{
    typedef typename ::std::iterator_traits<_Iterator>::value_type::result_type _ElementType;
    return details::_WhenAnyImpl<_ElementType, _Iterator>::_Perform(_CancellationToken._GetImplValue(), _Begin, _End);
}

/// <summary>
///     Creates a task that will complete successfully when either of the tasks supplied as arguments completes successfully.
/// </summary>
/// <typeparam name="_ReturnType">
///     The type of the returned task.
/// </typeparam>
/// <param name="_Lhs">
///     The first task to combine into the resulting task.
/// </param>
/// <param name="_Rhs">
///     The second task to combine into the resulting task.
/// </param>
/// <returns>
///     A task that completes successfully when either of the input tasks has completed successfully. If the input tasks are of type <c>T</c>,
///     the output of this function will be a <c>task&lt;std::vector&lt;T&gt;</c>. If the input tasks are of type <c>void</c> the output task
///     will also be a <c>task&lt;void&gt;</c>.
///     <para> To allow for a construct of the sort taskA || taskB &amp;&amp; taskC, which are combined in pairs, with &amp;&amp; taking precedence
///     over ||, the operator|| produces a <c>task&lt;std::vector&lt;T&gt;&gt;</c> if one of the tasks is of type <c>task&lt;std::vector&lt;T&gt;&gt;</c>
///     and the other one is of type <c>task&lt;T&gt;.</c></para>
/// </returns>
/// <remarks>
///     If both of the tasks are canceled or throw exceptions, the returned task will complete in the canceled state, and one of the exceptions,
///     if any are encountered, will be thrown when you call <c>get()</c> or <c>wait()</c> on that task.
/// </remarks>
/// <seealso cref="Task Parallelism (Concurrency Runtime)"/>
/**/
template<typename _ReturnType>
task<_ReturnType> operator||(const task<_ReturnType> & _Lhs, const task<_ReturnType> & _Rhs)
{
    auto _PParam = new details::_RunAnyParam<::std::pair<_ReturnType, size_t>>();

    task<::std::pair<_ReturnType, size_t>> _Any_tasks_completed(_PParam->_M_Completed, _PParam->_M_cancellationSource.get_token());
    // Chain the return continuation task here to ensure it will get inline execution when _M_Completed.set is called,
    // So that _PParam can be used before it getting deleted.
    auto _ReturnTask = _Any_tasks_completed._Then([=](::std::pair<_ReturnType, size_t> _Ret) -> _ReturnType {
        _ASSERTE(_Ret.second);
        _JoinAllTokens_Add(_PParam->_M_cancellationSource, reinterpret_cast<details::_CancellationTokenState *>(_Ret.second));
        return _Ret.first;
    }, nullptr);

    if (_Lhs.is_apartment_aware() || _Rhs.is_apartment_aware())
    {
        _ReturnTask._SetAsync();
    }

    _PParam->_M_numTasks = 2;
    auto _Continuation = [_PParam](task<_ReturnType> _ResultTask) {
        auto _Func = [&_ResultTask, _PParam]() {
            _PParam->_M_Completed.set(::std::make_pair(_ResultTask._GetImpl()->_GetResult(), reinterpret_cast<size_t>(_ResultTask._GetImpl()->_M_pTokenState)));
        };
        _WhenAnyContinuationWrapper(_PParam, _Func, _ResultTask);
    };

    _Lhs._Then(_Continuation, details::_CancellationTokenState::_None());
    _Rhs._Then(_Continuation, details::_CancellationTokenState::_None());

    return _ReturnTask;
}

/// <summary>
///     Creates a task that will complete successfully when any of the tasks supplied as arguments completes successfully.
/// </summary>
/// <typeparam name="_ReturnType">
///     The type of the returned task.
/// </typeparam>
/// <param name="_Lhs">
///     The first task to combine into the resulting task.
/// </param>
/// <param name="_Rhs">
///     The second task to combine into the resulting task.
/// </param>
/// <returns>
///     A task that completes successfully when either of the input tasks has completed successfully. If the input tasks are of type <c>T</c>,
///     the output of this function will be a <c>task&lt;std::vector&lt;T&gt;</c>. If the input tasks are of type <c>void</c> the output task
///     will also be a <c>task&lt;void&gt;</c>.
///     <para> To allow for a construct of the sort taskA || taskB &amp;&amp; taskC, which are combined in pairs, with &amp;&amp; taking precedence
///     over ||, the operator|| produces a <c>task&lt;std::vector&lt;T&gt;&gt;</c> if one of the tasks is of type <c>task&lt;std::vector&lt;T&gt;&gt;</c>
///     and the other one is of type <c>task&lt;T&gt;.</c></para>
/// </returns>
/// <remarks>
///     If both of the tasks are canceled or throw exceptions, the returned task will complete in the canceled state, and one of the exceptions,
///     if any are encountered, will be thrown when you call <c>get()</c> or <c>wait()</c> on that task.
/// </remarks>
/// <seealso cref="Task Parallelism (Concurrency Runtime)"/>
/**/
template<typename _ReturnType>
task<::std::vector<_ReturnType>> operator||(const task<::std::vector<_ReturnType>> & _Lhs, const task<_ReturnType> & _Rhs)
{
    auto _PParam = new details::_RunAnyParam<::std::pair<::std::vector<_ReturnType>, details::_CancellationTokenState *>>();

    task<::std::pair<::std::vector<_ReturnType>, details::_CancellationTokenState *>> _Any_tasks_completed(_PParam->_M_Completed, _PParam->_M_cancellationSource.get_token());

    // Chain the return continuation task here to ensure it will get inline execution when _M_Completed.set is called,
    // So that _PParam can be used before it getting deleted.
    auto _ReturnTask = _Any_tasks_completed._Then([=](::std::pair<::std::vector<_ReturnType>, details::_CancellationTokenState *> _Ret) -> ::std::vector<_ReturnType> {
        _ASSERTE(_Ret.second);
        _JoinAllTokens_Add(_PParam->_M_cancellationSource, _Ret.second);
        return _Ret.first;
    }, nullptr);

    if (_Lhs.is_apartment_aware() || _Rhs.is_apartment_aware())
    {
        _ReturnTask._SetAsync();
    }

    _PParam->_M_numTasks = 2;
    _Lhs._Then([_PParam](task<::std::vector<_ReturnType>> _ResultTask) {
        auto _Func = [&_ResultTask, _PParam]() {
            auto _Result = _ResultTask._GetImpl()->_GetResult();
            _PParam->_M_Completed.set(::std::make_pair(_Result, _ResultTask._GetImpl()->_M_pTokenState));
        };
        _WhenAnyContinuationWrapper(_PParam, _Func, _ResultTask);
    }, details::_CancellationTokenState::_None());


    _Rhs._Then([_PParam](task<_ReturnType> _ResultTask)
    {
        auto _Func = [&_ResultTask, _PParam]() {
            auto _Result = _ResultTask._GetImpl()->_GetResult();

            ::std::vector<_ReturnType> _Vec;
            _Vec.push_back(_Result);
            _PParam->_M_Completed.set(::std::make_pair(_Vec, _ResultTask._GetImpl()->_M_pTokenState));
        };
        _WhenAnyContinuationWrapper(_PParam, _Func, _ResultTask);
    }, details::_CancellationTokenState::_None());

    return _ReturnTask;
}

/// <summary>
///     Creates a task that will complete successfully when any of the tasks supplied as arguments completes successfully.
/// </summary>
/// <typeparam name="_ReturnType">
///     The type of the returned task.
/// </typeparam>
/// <param name="_Lhs">
///     The first task to combine into the resulting task.
/// </param>
/// <param name="_Rhs">
///     The second task to combine into the resulting task.
/// </param>
/// <returns>
///     A task that completes successfully when either of the input tasks has completed successfully. If the input tasks are of type <c>T</c>,
///     the output of this function will be a <c>task&lt;std::vector&lt;T&gt;</c>. If the input tasks are of type <c>void</c> the output task
///     will also be a <c>task&lt;void&gt;</c>.
///     <para> To allow for a construct of the sort taskA || taskB &amp;&amp; taskC, which are combined in pairs, with &amp;&amp; taking precedence
///     over ||, the operator|| produces a <c>task&lt;std::vector&lt;T&gt;&gt;</c> if one of the tasks is of type <c>task&lt;std::vector&lt;T&gt;&gt;</c>
///     and the other one is of type <c>task&lt;T&gt;.</c></para>
/// </returns>
/// <remarks>
///     If both of the tasks are canceled or throw exceptions, the returned task will complete in the canceled state, and one of the exceptions,
///     if any are encountered, will be thrown when you call <c>get()</c> or <c>wait()</c> on that task.
/// </remarks>
/// <seealso cref="Task Parallelism (Concurrency Runtime)"/>
/**/
template<typename _ReturnType>
task<::std::vector<_ReturnType>> operator||(const task<_ReturnType> & _Lhs, const task<::std::vector<_ReturnType>> & _Rhs)
{
    return _Rhs || _Lhs;
}

/// <summary>
///     Creates a task that will complete successfully when any of the tasks supplied as arguments completes successfully.
/// </summary>
/// <typeparam name="_ReturnType">
///     The type of the returned task.
/// </typeparam>
/// <param name="_Lhs">
///     The first task to combine into the resulting task.
/// </param>
/// <param name="_Rhs">
///     The second task to combine into the resulting task.
/// </param>
/// <returns>
///     A task that completes successfully when either of the input tasks has completed successfully. If the input tasks are of type <c>T</c>,
///     the output of this function will be a <c>task&lt;std::vector&lt;T&gt;</c>. If the input tasks are of type <c>void</c> the output task
///     will also be a <c>task&lt;void&gt;</c>.
///     <para> To allow for a construct of the sort taskA || taskB &amp;&amp; taskC, which are combined in pairs, with &amp;&amp; taking precedence
///     over ||, the operator|| produces a <c>task&lt;std::vector&lt;T&gt;&gt;</c> if one of the tasks is of type <c>task&lt;std::vector&lt;T&gt;&gt;</c>
///     and the other one is of type <c>task&lt;T&gt;.</c></para>
/// </returns>
/// <remarks>
///     If both of the tasks are canceled or throw exceptions, the returned task will complete in the canceled state, and one of the exceptions,
///     if any are encountered, will be thrown when you call <c>get()</c> or <c>wait()</c> on that task.
/// </remarks>
/// <seealso cref="Task Parallelism (Concurrency Runtime)"/>
/**/
template<typename _Ty = task<void>, typename _Pair = ::std::pair<details::_Unit_type, details::_CancellationTokenState *>>
inline _Ty operator||(const task<void> & _Lhs_arg, const task<void> & _Rhs_arg)
{
    const _Ty& _Lhs = _Lhs_arg;
    const _Ty& _Rhs = _Rhs_arg;

    auto _PParam = new details::_RunAnyParam<_Pair>();

    task<_Pair> _Any_task_completed(_PParam->_M_Completed, _PParam->_M_cancellationSource.get_token());
    // Chain the return continuation task here to ensure it will get inline execution when _M_Completed.set is called,
    // So that _PParam can be used before it getting deleted.
    auto _ReturnTask = _Any_task_completed._Then([=](_Pair _Ret) {
        _ASSERTE(_Ret.second);
        details::_JoinAllTokens_Add(_PParam->_M_cancellationSource, _Ret.second);
    }, nullptr);

    if (_Lhs.is_apartment_aware() || _Rhs.is_apartment_aware())
    {
        _ReturnTask._SetAsync();
    }

    _PParam->_M_numTasks = 2;
    auto _Continuation = [_PParam](_Ty _ResultTask) mutable {
        auto _Func = [&_ResultTask, _PParam]() {
            _PParam->_M_Completed.set(::std::make_pair(details::_Unit_type(), _ResultTask._GetImpl()->_M_pTokenState));
        };
        _WhenAnyContinuationWrapper(_PParam, _Func, _ResultTask);
    };

    _Lhs._Then(_Continuation, details::_CancellationTokenState::_None());
    _Rhs._Then(_Continuation, details::_CancellationTokenState::_None());

    return _ReturnTask;
}

template<typename _Ty>
task<_Ty> task_from_result(_Ty _Param, const task_options& _TaskOptions = task_options())
{
    task_completion_event<_Ty> _Tce;
    _Tce.set(_Param);
    return create_task(_Tce, _TaskOptions);
}

inline task<void> task_from_result(const task_options& _TaskOptions = task_options())
{
    task_completion_event<void> _Tce;
    _Tce.set();
    return create_task(_Tce, _TaskOptions);
}

template<typename _TaskType, typename _ExType>
task<_TaskType> task_from_exception(_ExType _Exception, const task_options& _TaskOptions = task_options())
{
    task_completion_event<_TaskType> _Tce;
    _Tce.set_exception(_Exception);
    return create_task(_Tce, _TaskOptions);
}

namespace details
{
    /// <summary>
    /// A convenient extension to Concurrency: loop until a condition is no longer met
    /// </summary>
    /// <param name="_Func">
    ///   A function representing the body of the loop. It will be invoked at least once and
    ///   then repetitively as long as it returns true.
    /// </param>
    template<typename _Ty = task<bool>>
    inline
    _Ty do_while(::std::enable_if_t<true, ::std::function<_Ty()>> _Func)
    {
        _Ty _First = _Func();
        return _First.then([=](bool _Guard) -> _Ty {
            if (_Guard)
                return do_while(_Func);
            else
                return _First;
            });
    }

} // namespace details

} // namespace Concurrency

} // extern "C++"

#pragma pop_macro("new")
_STL_RESTORE_CLANG_WARNINGS
#pragma warning(pop)
#pragma pack(pop)

#endif // _STL_COMPILER_PREPROCESSOR

#endif // _PPLTASKS_H
