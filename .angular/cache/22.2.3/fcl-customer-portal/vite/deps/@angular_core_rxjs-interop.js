import { G as Injector, Ia as Subject, It as assertInInjectionContext, Jt as assertNotInReactiveContext, La as createOperatorSubscriber, O as DestroyRef, Ra as operate, Ui as signal, Va as noop, Ya as __extends, _ as untracked, c as computed, l as encapsulateResourceError, m as resource, mi as promiseWithResolvers, st as PendingTasks, u as getOutputDestroyRef, ut as RuntimeError, wr as inject, xn as effect, za as Observable } from "./_resource-chunk-Bak-5JP4.js";
import { t as innerFrom } from "./innerFrom-CuMgNOgk.js";
import { n as _defineProperty, t as _objectSpread2 } from "./objectSpread2-weooBxVk.js";
//#region node_modules/rxjs/dist/esm5/internal/scheduler/dateTimestampProvider.js
var dateTimestampProvider = {
	now: function() {
		return (dateTimestampProvider.delegate || Date).now();
	},
	delegate: void 0
};
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/ReplaySubject.js
var ReplaySubject = function(_super) {
	__extends(ReplaySubject, _super);
	function ReplaySubject(_bufferSize, _windowTime, _timestampProvider) {
		if (_bufferSize === void 0) _bufferSize = Infinity;
		if (_windowTime === void 0) _windowTime = Infinity;
		if (_timestampProvider === void 0) _timestampProvider = dateTimestampProvider;
		var _this = _super.call(this) || this;
		_this._bufferSize = _bufferSize;
		_this._windowTime = _windowTime;
		_this._timestampProvider = _timestampProvider;
		_this._buffer = [];
		_this._infiniteTimeWindow = true;
		_this._infiniteTimeWindow = _windowTime === Infinity;
		_this._bufferSize = Math.max(1, _bufferSize);
		_this._windowTime = Math.max(1, _windowTime);
		return _this;
	}
	ReplaySubject.prototype.next = function(value) {
		var _a = this, isStopped = _a.isStopped, _buffer = _a._buffer, _infiniteTimeWindow = _a._infiniteTimeWindow, _timestampProvider = _a._timestampProvider, _windowTime = _a._windowTime;
		if (!isStopped) {
			_buffer.push(value);
			!_infiniteTimeWindow && _buffer.push(_timestampProvider.now() + _windowTime);
		}
		this._trimBuffer();
		_super.prototype.next.call(this, value);
	};
	ReplaySubject.prototype._subscribe = function(subscriber) {
		this._throwIfClosed();
		this._trimBuffer();
		var subscription = this._innerSubscribe(subscriber);
		var _a = this, _infiniteTimeWindow = _a._infiniteTimeWindow;
		var copy = _a._buffer.slice();
		for (var i = 0; i < copy.length && !subscriber.closed; i += _infiniteTimeWindow ? 1 : 2) subscriber.next(copy[i]);
		this._checkFinalizedStatuses(subscriber);
		return subscription;
	};
	ReplaySubject.prototype._trimBuffer = function() {
		var _a = this, _bufferSize = _a._bufferSize, _timestampProvider = _a._timestampProvider, _buffer = _a._buffer, _infiniteTimeWindow = _a._infiniteTimeWindow;
		var adjustedBufferSize = (_infiniteTimeWindow ? 1 : 2) * _bufferSize;
		_bufferSize < Infinity && adjustedBufferSize < _buffer.length && _buffer.splice(0, _buffer.length - adjustedBufferSize);
		if (!_infiniteTimeWindow) {
			var now = _timestampProvider.now();
			var last = 0;
			for (var i = 1; i < _buffer.length && _buffer[i] <= now; i += 2) last = i;
			last && _buffer.splice(0, last + 1);
		}
	};
	return ReplaySubject;
}(Subject);
//#endregion
//#region node_modules/rxjs/dist/esm5/internal/operators/takeUntil.js
function takeUntil(notifier) {
	return operate(function(source, subscriber) {
		innerFrom(notifier).subscribe(createOperatorSubscriber(subscriber, function() {
			return subscriber.complete();
		}, noop));
		!subscriber.closed && source.subscribe(subscriber);
	});
}
//#endregion
//#region node_modules/@angular/core/fesm2022/rxjs-interop.mjs
/**
* @license Angular v22.2.3
* (c) 2010-2026 Google LLC. https://angular.dev/
* License: MIT
*/
function takeUntilDestroyed(destroyRef) {
	if (!destroyRef) {
		ngDevMode && assertInInjectionContext(takeUntilDestroyed);
		destroyRef = inject(DestroyRef);
	}
	const destroyed$ = new Observable((subscriber) => {
		if (destroyRef.destroyed) {
			subscriber.next();
			return;
		}
		return destroyRef.onDestroy(subscriber.next.bind(subscriber));
	});
	return (source) => {
		return source.pipe(takeUntil(destroyed$));
	};
}
var OutputFromObservableRef = class {
	constructor(source) {
		_defineProperty(this, "source", void 0);
		_defineProperty(this, "destroyed", false);
		_defineProperty(this, "destroyRef", inject(DestroyRef));
		this.source = source;
		this.destroyRef.onDestroy(() => {
			this.destroyed = true;
		});
	}
	subscribe(callbackFn) {
		if (this.destroyed) throw new RuntimeError(953, ngDevMode && "Unexpected subscription to destroyed `OutputRef`. The owning directive/component is destroyed.");
		const subscription = this.source.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: (value) => callbackFn(value) });
		return { unsubscribe: () => subscription.unsubscribe() };
	}
};
function outputFromObservable(observable, opts) {
	ngDevMode && assertInInjectionContext(outputFromObservable);
	return new OutputFromObservableRef(observable);
}
function outputToObservable(ref) {
	const destroyRef = getOutputDestroyRef(ref);
	return new Observable((observer) => {
		const unregisterOnDestroy = destroyRef === null || destroyRef === void 0 ? void 0 : destroyRef.onDestroy(() => observer.complete());
		const subscription = ref.subscribe((v) => observer.next(v));
		return () => {
			subscription.unsubscribe();
			unregisterOnDestroy === null || unregisterOnDestroy === void 0 || unregisterOnDestroy();
		};
	});
}
function toObservable(source, options) {
	var _options$injector;
	if (ngDevMode && !(options === null || options === void 0 ? void 0 : options.injector)) assertInInjectionContext(toObservable);
	const injector = (_options$injector = options === null || options === void 0 ? void 0 : options.injector) !== null && _options$injector !== void 0 ? _options$injector : inject(Injector);
	const subject = new ReplaySubject(1);
	const watcher = effect(() => {
		let value;
		try {
			value = source();
		} catch (err) {
			untracked(() => subject.error(err));
			return;
		}
		untracked(() => subject.next(value));
	}, {
		injector,
		manualCleanup: true
	});
	injector.get(DestroyRef).onDestroy(() => {
		watcher.destroy();
		subject.complete();
	});
	return subject.asObservable();
}
function toSignal(source, options) {
	var _options$injector$get, _options$injector2;
	typeof ngDevMode !== "undefined" && ngDevMode && assertNotInReactiveContext(toSignal, "Invoking `toSignal` causes new subscriptions every time. Consider moving `toSignal` outside of the reactive context and read the signal value where needed.");
	const requiresCleanup = !(options === null || options === void 0 ? void 0 : options.manualCleanup);
	if (ngDevMode && requiresCleanup && !(options === null || options === void 0 ? void 0 : options.injector)) assertInInjectionContext(toSignal);
	const cleanupRef = requiresCleanup ? (_options$injector$get = options === null || options === void 0 || (_options$injector2 = options.injector) === null || _options$injector2 === void 0 ? void 0 : _options$injector2.get(DestroyRef)) !== null && _options$injector$get !== void 0 ? _options$injector$get : inject(DestroyRef) : null;
	const equal = makeToSignalEqual(options === null || options === void 0 ? void 0 : options.equal);
	let state;
	if (options === null || options === void 0 ? void 0 : options.requireSync) state = signal({ kind: 0 }, _objectSpread2({ equal }, ngDevMode ? createDebugNameObject(options === null || options === void 0 ? void 0 : options.debugName, "state") : void 0));
	else state = signal({
		kind: 1,
		value: options === null || options === void 0 ? void 0 : options.initialValue
	}, _objectSpread2({ equal }, ngDevMode ? createDebugNameObject(options === null || options === void 0 ? void 0 : options.debugName, "state") : void 0));
	let destroyUnregisterFn;
	const sub = source.subscribe({
		next: (value) => state.set({
			kind: 1,
			value
		}),
		error: (error) => {
			state.set({
				kind: 2,
				error
			});
			destroyUnregisterFn === null || destroyUnregisterFn === void 0 || destroyUnregisterFn();
		},
		complete: () => {
			destroyUnregisterFn === null || destroyUnregisterFn === void 0 || destroyUnregisterFn();
		}
	});
	if ((options === null || options === void 0 ? void 0 : options.requireSync) && state().kind === 0) throw new RuntimeError(601, (typeof ngDevMode === "undefined" || ngDevMode) && "`toSignal()` called with `requireSync` but `Observable` did not emit synchronously.");
	destroyUnregisterFn = cleanupRef === null || cleanupRef === void 0 ? void 0 : cleanupRef.onDestroy(sub.unsubscribe.bind(sub));
	return computed(() => {
		const current = state();
		switch (current.kind) {
			case 1: return current.value;
			case 2: throw current.error;
			case 0: throw new RuntimeError(601, (typeof ngDevMode === "undefined" || ngDevMode) && "`toSignal()` called with `requireSync` but `Observable` did not emit synchronously.");
		}
	}, _objectSpread2({ equal: options === null || options === void 0 ? void 0 : options.equal }, ngDevMode ? createDebugNameObject(options === null || options === void 0 ? void 0 : options.debugName, "source") : void 0));
}
function makeToSignalEqual(userEquality = Object.is) {
	return (a, b) => a.kind === 1 && b.kind === 1 && userEquality(a.value, b.value);
}
function createDebugNameObject(toSignalDebugName, internalSignalDebugName) {
	return { debugName: `toSignal${toSignalDebugName ? "#" + toSignalDebugName : ""}.${internalSignalDebugName}` };
}
function pendingUntilEvent(injector) {
	if (injector === void 0) {
		ngDevMode && assertInInjectionContext(pendingUntilEvent);
		injector = inject(Injector);
	}
	const taskService = injector.get(PendingTasks);
	return (sourceObservable) => {
		return new Observable((originalSubscriber) => {
			const removeTask = taskService.add();
			let cleanedUp = false;
			function cleanupTask() {
				if (cleanedUp) return;
				removeTask();
				cleanedUp = true;
			}
			const innerSubscription = sourceObservable.subscribe({
				next: (v) => {
					originalSubscriber.next(v);
					cleanupTask();
				},
				complete: () => {
					originalSubscriber.complete();
					cleanupTask();
				},
				error: (e) => {
					originalSubscriber.error(e);
					cleanupTask();
				}
			});
			innerSubscription.add(() => {
				originalSubscriber.unsubscribe();
				cleanupTask();
			});
			return innerSubscription;
		});
	};
}
function rxResource(opts) {
	if (ngDevMode && !(opts === null || opts === void 0 ? void 0 : opts.injector)) assertInInjectionContext(rxResource);
	return resource(_objectSpread2(_objectSpread2({}, opts), {}, {
		loader: void 0,
		stream: (params) => {
			let sub;
			let aborted = false;
			const stream = signal({ value: void 0 });
			const { resolve, promise } = promiseWithResolvers();
			let hasResolved = false;
			function resolveOnce() {
				if (!hasResolved) {
					hasResolved = true;
					resolve(stream);
				}
			}
			const onAbort = () => {
				aborted = true;
				sub === null || sub === void 0 || sub.unsubscribe();
				params.abortSignal.removeEventListener("abort", onAbort);
				resolveOnce();
			};
			params.abortSignal.addEventListener("abort", onAbort);
			function send(value) {
				stream.set(value);
				resolveOnce();
			}
			const streamFn = opts.stream;
			if (streamFn === void 0) throw new RuntimeError(990, ngDevMode && `Must provide \`stream\` option.`);
			sub = streamFn(params).subscribe({
				next: (value) => send({ value }),
				error: (error) => {
					send({ error: encapsulateResourceError(error) });
					params.abortSignal.removeEventListener("abort", onAbort);
				},
				complete: () => {
					if (!hasResolved) send({ error: new RuntimeError(-991, ngDevMode && "Resource completed before producing a value") });
					params.abortSignal.removeEventListener("abort", onAbort);
				}
			});
			if (aborted) sub.unsubscribe();
			if (hasResolved) return stream;
			return promise;
		}
	}));
}
//#endregion
export { outputFromObservable, outputToObservable, pendingUntilEvent, rxResource, takeUntilDestroyed, toObservable, toSignal };
