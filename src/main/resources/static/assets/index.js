var n0=Object.defineProperty;var t0=(e,n,t)=>n in e?n0(e,n,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[n]=t;var Vo=(e,n,t)=>(t0(e,typeof n!="symbol"?n+"":n,t),t);const r0=function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const u of document.querySelectorAll('link[rel="modulepreload"]'))r(u);new MutationObserver(u=>{for(const l of u)if(l.type==="childList")for(const i of l.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&r(i)}).observe(document,{childList:!0,subtree:!0});function t(u){const l={};return u.integrity&&(l.integrity=u.integrity),u.referrerpolicy&&(l.referrerPolicy=u.referrerpolicy),u.crossorigin==="use-credentials"?l.credentials="include":u.crossorigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function r(u){if(u.ep)return;u.ep=!0;const l=t(u);fetch(u.href,l)}};r0();var P={exports:{}},O={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Cr=Symbol.for("react.element"),u0=Symbol.for("react.portal"),l0=Symbol.for("react.fragment"),i0=Symbol.for("react.strict_mode"),o0=Symbol.for("react.profiler"),a0=Symbol.for("react.provider"),s0=Symbol.for("react.context"),c0=Symbol.for("react.forward_ref"),d0=Symbol.for("react.suspense"),f0=Symbol.for("react.memo"),p0=Symbol.for("react.lazy"),Ho=Symbol.iterator;function h0(e){return e===null||typeof e!="object"?null:(e=Ho&&e[Ho]||e["@@iterator"],typeof e=="function"?e:null)}var ys={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},vs=Object.assign,Es={};function Pt(e,n,t){this.props=e,this.context=n,this.refs=Es,this.updater=t||ys}Pt.prototype.isReactComponent={};Pt.prototype.setState=function(e,n){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,n,"setState")};Pt.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function xs(){}xs.prototype=Pt.prototype;function ji(e,n,t){this.props=e,this.context=n,this.refs=Es,this.updater=t||ys}var Ui=ji.prototype=new xs;Ui.constructor=ji;vs(Ui,Pt.prototype);Ui.isPureReactComponent=!0;var Qo=Array.isArray,Fs=Object.prototype.hasOwnProperty,Wi={current:null},ws={key:!0,ref:!0,__self:!0,__source:!0};function ks(e,n,t){var r,u={},l=null,i=null;if(n!=null)for(r in n.ref!==void 0&&(i=n.ref),n.key!==void 0&&(l=""+n.key),n)Fs.call(n,r)&&!ws.hasOwnProperty(r)&&(u[r]=n[r]);var o=arguments.length-2;if(o===1)u.children=t;else if(1<o){for(var s=Array(o),c=0;c<o;c++)s[c]=arguments[c+2];u.children=s}if(e&&e.defaultProps)for(r in o=e.defaultProps,o)u[r]===void 0&&(u[r]=o[r]);return{$$typeof:Cr,type:e,key:l,ref:i,props:u,_owner:Wi.current}}function m0(e,n){return{$$typeof:Cr,type:e.type,key:n,ref:e.ref,props:e.props,_owner:e._owner}}function Vi(e){return typeof e=="object"&&e!==null&&e.$$typeof===Cr}function g0(e){var n={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(t){return n[t]})}var Go=/\/+/g;function pl(e,n){return typeof e=="object"&&e!==null&&e.key!=null?g0(""+e.key):n.toString(36)}function eu(e,n,t,r,u){var l=typeof e;(l==="undefined"||l==="boolean")&&(e=null);var i=!1;if(e===null)i=!0;else switch(l){case"string":case"number":i=!0;break;case"object":switch(e.$$typeof){case Cr:case u0:i=!0}}if(i)return i=e,u=u(i),e=r===""?"."+pl(i,0):r,Qo(u)?(t="",e!=null&&(t=e.replace(Go,"$&/")+"/"),eu(u,n,t,"",function(c){return c})):u!=null&&(Vi(u)&&(u=m0(u,t+(!u.key||i&&i.key===u.key?"":(""+u.key).replace(Go,"$&/")+"/")+e)),n.push(u)),1;if(i=0,r=r===""?".":r+":",Qo(e))for(var o=0;o<e.length;o++){l=e[o];var s=r+pl(l,o);i+=eu(l,n,t,s,u)}else if(s=h0(e),typeof s=="function")for(e=s.call(e),o=0;!(l=e.next()).done;)l=l.value,s=r+pl(l,o++),i+=eu(l,n,t,s,u);else if(l==="object")throw n=String(e),Error("Objects are not valid as a React child (found: "+(n==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":n)+"). If you meant to render a collection of children, use an array instead.");return i}function Ir(e,n,t){if(e==null)return e;var r=[],u=0;return eu(e,r,"","",function(l){return n.call(t,l,u++)}),r}function y0(e){if(e._status===-1){var n=e._result;n=n(),n.then(function(t){(e._status===0||e._status===-1)&&(e._status=1,e._result=t)},function(t){(e._status===0||e._status===-1)&&(e._status=2,e._result=t)}),e._status===-1&&(e._status=0,e._result=n)}if(e._status===1)return e._result.default;throw e._result}var xe={current:null},nu={transition:null},v0={ReactCurrentDispatcher:xe,ReactCurrentBatchConfig:nu,ReactCurrentOwner:Wi};O.Children={map:Ir,forEach:function(e,n,t){Ir(e,function(){n.apply(this,arguments)},t)},count:function(e){var n=0;return Ir(e,function(){n++}),n},toArray:function(e){return Ir(e,function(n){return n})||[]},only:function(e){if(!Vi(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};O.Component=Pt;O.Fragment=l0;O.Profiler=o0;O.PureComponent=ji;O.StrictMode=i0;O.Suspense=d0;O.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=v0;O.cloneElement=function(e,n,t){if(e==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+e+".");var r=vs({},e.props),u=e.key,l=e.ref,i=e._owner;if(n!=null){if(n.ref!==void 0&&(l=n.ref,i=Wi.current),n.key!==void 0&&(u=""+n.key),e.type&&e.type.defaultProps)var o=e.type.defaultProps;for(s in n)Fs.call(n,s)&&!ws.hasOwnProperty(s)&&(r[s]=n[s]===void 0&&o!==void 0?o[s]:n[s])}var s=arguments.length-2;if(s===1)r.children=t;else if(1<s){o=Array(s);for(var c=0;c<s;c++)o[c]=arguments[c+2];r.children=o}return{$$typeof:Cr,type:e.type,key:u,ref:l,props:r,_owner:i}};O.createContext=function(e){return e={$$typeof:s0,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},e.Provider={$$typeof:a0,_context:e},e.Consumer=e};O.createElement=ks;O.createFactory=function(e){var n=ks.bind(null,e);return n.type=e,n};O.createRef=function(){return{current:null}};O.forwardRef=function(e){return{$$typeof:c0,render:e}};O.isValidElement=Vi;O.lazy=function(e){return{$$typeof:p0,_payload:{_status:-1,_result:e},_init:y0}};O.memo=function(e,n){return{$$typeof:f0,type:e,compare:n===void 0?null:n}};O.startTransition=function(e){var n=nu.transition;nu.transition={};try{e()}finally{nu.transition=n}};O.unstable_act=function(){throw Error("act(...) is not supported in production builds of React.")};O.useCallback=function(e,n){return xe.current.useCallback(e,n)};O.useContext=function(e){return xe.current.useContext(e)};O.useDebugValue=function(){};O.useDeferredValue=function(e){return xe.current.useDeferredValue(e)};O.useEffect=function(e,n){return xe.current.useEffect(e,n)};O.useId=function(){return xe.current.useId()};O.useImperativeHandle=function(e,n,t){return xe.current.useImperativeHandle(e,n,t)};O.useInsertionEffect=function(e,n){return xe.current.useInsertionEffect(e,n)};O.useLayoutEffect=function(e,n){return xe.current.useLayoutEffect(e,n)};O.useMemo=function(e,n){return xe.current.useMemo(e,n)};O.useReducer=function(e,n,t){return xe.current.useReducer(e,n,t)};O.useRef=function(e){return xe.current.useRef(e)};O.useState=function(e){return xe.current.useState(e)};O.useSyncExternalStore=function(e,n,t){return xe.current.useSyncExternalStore(e,n,t)};O.useTransition=function(){return xe.current.useTransition()};O.version="18.2.0";P.exports=O;var E0=P.exports,Wl={},Cs={exports:{}},Pe={},As={exports:{}},Ss={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */(function(e){function n(_,z){var b=_.length;_.push(z);e:for(;0<b;){var X=b-1>>>1,le=_[X];if(0<u(le,z))_[X]=z,_[b]=le,b=X;else break e}}function t(_){return _.length===0?null:_[0]}function r(_){if(_.length===0)return null;var z=_[0],b=_.pop();if(b!==z){_[0]=b;e:for(var X=0,le=_.length,Pr=le>>>1;X<Pr;){var $n=2*(X+1)-1,fl=_[$n],jn=$n+1,Tr=_[jn];if(0>u(fl,b))jn<le&&0>u(Tr,fl)?(_[X]=Tr,_[jn]=b,X=jn):(_[X]=fl,_[$n]=b,X=$n);else if(jn<le&&0>u(Tr,b))_[X]=Tr,_[jn]=b,X=jn;else break e}}return z}function u(_,z){var b=_.sortIndex-z.sortIndex;return b!==0?b:_.id-z.id}if(typeof performance=="object"&&typeof performance.now=="function"){var l=performance;e.unstable_now=function(){return l.now()}}else{var i=Date,o=i.now();e.unstable_now=function(){return i.now()-o}}var s=[],c=[],h=1,m=null,p=3,v=!1,w=!1,F=!1,I=typeof setTimeout=="function"?setTimeout:null,f=typeof clearTimeout=="function"?clearTimeout:null,d=typeof setImmediate!="undefined"?setImmediate:null;typeof navigator!="undefined"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function g(_){for(var z=t(c);z!==null;){if(z.callback===null)r(c);else if(z.startTime<=_)r(c),z.sortIndex=z.expirationTime,n(s,z);else break;z=t(c)}}function E(_){if(F=!1,g(_),!w)if(t(s)!==null)w=!0,_r(C);else{var z=t(c);z!==null&&dl(E,z.startTime-_)}}function C(_,z){w=!1,F&&(F=!1,f(x),x=-1),v=!0;var b=p;try{for(g(z),m=t(s);m!==null&&(!(m.expirationTime>z)||_&&!U());){var X=m.callback;if(typeof X=="function"){m.callback=null,p=m.priorityLevel;var le=X(m.expirationTime<=z);z=e.unstable_now(),typeof le=="function"?m.callback=le:m===t(s)&&r(s),g(z)}else r(s);m=t(s)}if(m!==null)var Pr=!0;else{var $n=t(c);$n!==null&&dl(E,$n.startTime-z),Pr=!1}return Pr}finally{m=null,p=b,v=!1}}var A=!1,S=null,x=-1,N=5,T=-1;function U(){return!(e.unstable_now()-T<N)}function te(){if(S!==null){var _=e.unstable_now();T=_;var z=!0;try{z=S(!0,_)}finally{z?ge():(A=!1,S=null)}}else A=!1}var ge;if(typeof d=="function")ge=function(){d(te)};else if(typeof MessageChannel!="undefined"){var hn=new MessageChannel,Ke=hn.port2;hn.port1.onmessage=te,ge=function(){Ke.postMessage(null)}}else ge=function(){I(te,0)};function _r(_){S=_,A||(A=!0,ge())}function dl(_,z){x=I(function(){_(e.unstable_now())},z)}e.unstable_IdlePriority=5,e.unstable_ImmediatePriority=1,e.unstable_LowPriority=4,e.unstable_NormalPriority=3,e.unstable_Profiling=null,e.unstable_UserBlockingPriority=2,e.unstable_cancelCallback=function(_){_.callback=null},e.unstable_continueExecution=function(){w||v||(w=!0,_r(C))},e.unstable_forceFrameRate=function(_){0>_||125<_?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):N=0<_?Math.floor(1e3/_):5},e.unstable_getCurrentPriorityLevel=function(){return p},e.unstable_getFirstCallbackNode=function(){return t(s)},e.unstable_next=function(_){switch(p){case 1:case 2:case 3:var z=3;break;default:z=p}var b=p;p=z;try{return _()}finally{p=b}},e.unstable_pauseExecution=function(){},e.unstable_requestPaint=function(){},e.unstable_runWithPriority=function(_,z){switch(_){case 1:case 2:case 3:case 4:case 5:break;default:_=3}var b=p;p=_;try{return z()}finally{p=b}},e.unstable_scheduleCallback=function(_,z,b){var X=e.unstable_now();switch(typeof b=="object"&&b!==null?(b=b.delay,b=typeof b=="number"&&0<b?X+b:X):b=X,_){case 1:var le=-1;break;case 2:le=250;break;case 5:le=1073741823;break;case 4:le=1e4;break;default:le=5e3}return le=b+le,_={id:h++,callback:z,priorityLevel:_,startTime:b,expirationTime:le,sortIndex:-1},b>X?(_.sortIndex=b,n(c,_),t(s)===null&&_===t(c)&&(F?(f(x),x=-1):F=!0,dl(E,b-X))):(_.sortIndex=le,n(s,_),w||v||(w=!0,_r(C))),_},e.unstable_shouldYield=U,e.unstable_wrapCallback=function(_){var z=p;return function(){var b=p;p=z;try{return _.apply(this,arguments)}finally{p=b}}}})(Ss);As.exports=Ss;/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Bs=P.exports,_e=As.exports;function k(e){for(var n="https://reactjs.org/docs/error-decoder.html?invariant="+e,t=1;t<arguments.length;t++)n+="&args[]="+encodeURIComponent(arguments[t]);return"Minified React error #"+e+"; visit "+n+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var Ds=new Set,ir={};function nt(e,n){Ct(e,n),Ct(e+"Capture",n)}function Ct(e,n){for(ir[e]=n,e=0;e<n.length;e++)Ds.add(n[e])}var sn=!(typeof window=="undefined"||typeof window.document=="undefined"||typeof window.document.createElement=="undefined"),Vl=Object.prototype.hasOwnProperty,x0=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,Ko={},Yo={};function F0(e){return Vl.call(Yo,e)?!0:Vl.call(Ko,e)?!1:x0.test(e)?Yo[e]=!0:(Ko[e]=!0,!1)}function w0(e,n,t,r){if(t!==null&&t.type===0)return!1;switch(typeof n){case"function":case"symbol":return!0;case"boolean":return r?!1:t!==null?!t.acceptsBooleans:(e=e.toLowerCase().slice(0,5),e!=="data-"&&e!=="aria-");default:return!1}}function k0(e,n,t,r){if(n===null||typeof n=="undefined"||w0(e,n,t,r))return!0;if(r)return!1;if(t!==null)switch(t.type){case 3:return!n;case 4:return n===!1;case 5:return isNaN(n);case 6:return isNaN(n)||1>n}return!1}function Fe(e,n,t,r,u,l,i){this.acceptsBooleans=n===2||n===3||n===4,this.attributeName=r,this.attributeNamespace=u,this.mustUseProperty=t,this.propertyName=e,this.type=n,this.sanitizeURL=l,this.removeEmptyString=i}var ce={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e){ce[e]=new Fe(e,0,!1,e,null,!1,!1)});[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(e){var n=e[0];ce[n]=new Fe(n,1,!1,e[1],null,!1,!1)});["contentEditable","draggable","spellCheck","value"].forEach(function(e){ce[e]=new Fe(e,2,!1,e.toLowerCase(),null,!1,!1)});["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(e){ce[e]=new Fe(e,2,!1,e,null,!1,!1)});"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e){ce[e]=new Fe(e,3,!1,e.toLowerCase(),null,!1,!1)});["checked","multiple","muted","selected"].forEach(function(e){ce[e]=new Fe(e,3,!0,e,null,!1,!1)});["capture","download"].forEach(function(e){ce[e]=new Fe(e,4,!1,e,null,!1,!1)});["cols","rows","size","span"].forEach(function(e){ce[e]=new Fe(e,6,!1,e,null,!1,!1)});["rowSpan","start"].forEach(function(e){ce[e]=new Fe(e,5,!1,e.toLowerCase(),null,!1,!1)});var Hi=/[\-:]([a-z])/g;function Qi(e){return e[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e){var n=e.replace(Hi,Qi);ce[n]=new Fe(n,1,!1,e,null,!1,!1)});"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e){var n=e.replace(Hi,Qi);ce[n]=new Fe(n,1,!1,e,"http://www.w3.org/1999/xlink",!1,!1)});["xml:base","xml:lang","xml:space"].forEach(function(e){var n=e.replace(Hi,Qi);ce[n]=new Fe(n,1,!1,e,"http://www.w3.org/XML/1998/namespace",!1,!1)});["tabIndex","crossOrigin"].forEach(function(e){ce[e]=new Fe(e,1,!1,e.toLowerCase(),null,!1,!1)});ce.xlinkHref=new Fe("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1);["src","href","action","formAction"].forEach(function(e){ce[e]=new Fe(e,1,!1,e.toLowerCase(),null,!0,!0)});function Gi(e,n,t,r){var u=ce.hasOwnProperty(n)?ce[n]:null;(u!==null?u.type!==0:r||!(2<n.length)||n[0]!=="o"&&n[0]!=="O"||n[1]!=="n"&&n[1]!=="N")&&(k0(n,t,u,r)&&(t=null),r||u===null?F0(n)&&(t===null?e.removeAttribute(n):e.setAttribute(n,""+t)):u.mustUseProperty?e[u.propertyName]=t===null?u.type===3?!1:"":t:(n=u.attributeName,r=u.attributeNamespace,t===null?e.removeAttribute(n):(u=u.type,t=u===3||u===4&&t===!0?"":""+t,r?e.setAttributeNS(r,n,t):e.setAttribute(n,t))))}var pn=Bs.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,Lr=Symbol.for("react.element"),it=Symbol.for("react.portal"),ot=Symbol.for("react.fragment"),Ki=Symbol.for("react.strict_mode"),Hl=Symbol.for("react.profiler"),Ns=Symbol.for("react.provider"),_s=Symbol.for("react.context"),Yi=Symbol.for("react.forward_ref"),Ql=Symbol.for("react.suspense"),Gl=Symbol.for("react.suspense_list"),Ji=Symbol.for("react.memo"),gn=Symbol.for("react.lazy"),Ps=Symbol.for("react.offscreen"),Jo=Symbol.iterator;function zt(e){return e===null||typeof e!="object"?null:(e=Jo&&e[Jo]||e["@@iterator"],typeof e=="function"?e:null)}var J=Object.assign,hl;function Vt(e){if(hl===void 0)try{throw Error()}catch(t){var n=t.stack.trim().match(/\n( *(at )?)/);hl=n&&n[1]||""}return`
`+hl+e}var ml=!1;function gl(e,n){if(!e||ml)return"";ml=!0;var t=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(n)if(n=function(){throw Error()},Object.defineProperty(n.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(n,[])}catch(c){var r=c}Reflect.construct(e,[],n)}else{try{n.call()}catch(c){r=c}e.call(n.prototype)}else{try{throw Error()}catch(c){r=c}e()}}catch(c){if(c&&r&&typeof c.stack=="string"){for(var u=c.stack.split(`
`),l=r.stack.split(`
`),i=u.length-1,o=l.length-1;1<=i&&0<=o&&u[i]!==l[o];)o--;for(;1<=i&&0<=o;i--,o--)if(u[i]!==l[o]){if(i!==1||o!==1)do if(i--,o--,0>o||u[i]!==l[o]){var s=`
`+u[i].replace(" at new "," at ");return e.displayName&&s.includes("<anonymous>")&&(s=s.replace("<anonymous>",e.displayName)),s}while(1<=i&&0<=o);break}}}finally{ml=!1,Error.prepareStackTrace=t}return(e=e?e.displayName||e.name:"")?Vt(e):""}function C0(e){switch(e.tag){case 5:return Vt(e.type);case 16:return Vt("Lazy");case 13:return Vt("Suspense");case 19:return Vt("SuspenseList");case 0:case 2:case 15:return e=gl(e.type,!1),e;case 11:return e=gl(e.type.render,!1),e;case 1:return e=gl(e.type,!0),e;default:return""}}function Kl(e){if(e==null)return null;if(typeof e=="function")return e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case ot:return"Fragment";case it:return"Portal";case Hl:return"Profiler";case Ki:return"StrictMode";case Ql:return"Suspense";case Gl:return"SuspenseList"}if(typeof e=="object")switch(e.$$typeof){case _s:return(e.displayName||"Context")+".Consumer";case Ns:return(e._context.displayName||"Context")+".Provider";case Yi:var n=e.render;return e=e.displayName,e||(e=n.displayName||n.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case Ji:return n=e.displayName||null,n!==null?n:Kl(e.type)||"Memo";case gn:n=e._payload,e=e._init;try{return Kl(e(n))}catch{}}return null}function A0(e){var n=e.type;switch(e.tag){case 24:return"Cache";case 9:return(n.displayName||"Context")+".Consumer";case 10:return(n._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return e=n.render,e=e.displayName||e.name||"",n.displayName||(e!==""?"ForwardRef("+e+")":"ForwardRef");case 7:return"Fragment";case 5:return n;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return Kl(n);case 8:return n===Ki?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof n=="function")return n.displayName||n.name||null;if(typeof n=="string")return n}return null}function Pn(e){switch(typeof e){case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function Ts(e){var n=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(n==="checkbox"||n==="radio")}function S0(e){var n=Ts(e)?"checked":"value",t=Object.getOwnPropertyDescriptor(e.constructor.prototype,n),r=""+e[n];if(!e.hasOwnProperty(n)&&typeof t!="undefined"&&typeof t.get=="function"&&typeof t.set=="function"){var u=t.get,l=t.set;return Object.defineProperty(e,n,{configurable:!0,get:function(){return u.call(this)},set:function(i){r=""+i,l.call(this,i)}}),Object.defineProperty(e,n,{enumerable:t.enumerable}),{getValue:function(){return r},setValue:function(i){r=""+i},stopTracking:function(){e._valueTracker=null,delete e[n]}}}}function Rr(e){e._valueTracker||(e._valueTracker=S0(e))}function Is(e){if(!e)return!1;var n=e._valueTracker;if(!n)return!0;var t=n.getValue(),r="";return e&&(r=Ts(e)?e.checked?"true":"false":e.value),e=r,e!==t?(n.setValue(e),!0):!1}function pu(e){if(e=e||(typeof document!="undefined"?document:void 0),typeof e=="undefined")return null;try{return e.activeElement||e.body}catch{return e.body}}function Yl(e,n){var t=n.checked;return J({},n,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:t!=null?t:e._wrapperState.initialChecked})}function Zo(e,n){var t=n.defaultValue==null?"":n.defaultValue,r=n.checked!=null?n.checked:n.defaultChecked;t=Pn(n.value!=null?n.value:t),e._wrapperState={initialChecked:r,initialValue:t,controlled:n.type==="checkbox"||n.type==="radio"?n.checked!=null:n.value!=null}}function Ls(e,n){n=n.checked,n!=null&&Gi(e,"checked",n,!1)}function Jl(e,n){Ls(e,n);var t=Pn(n.value),r=n.type;if(t!=null)r==="number"?(t===0&&e.value===""||e.value!=t)&&(e.value=""+t):e.value!==""+t&&(e.value=""+t);else if(r==="submit"||r==="reset"){e.removeAttribute("value");return}n.hasOwnProperty("value")?Zl(e,n.type,t):n.hasOwnProperty("defaultValue")&&Zl(e,n.type,Pn(n.defaultValue)),n.checked==null&&n.defaultChecked!=null&&(e.defaultChecked=!!n.defaultChecked)}function qo(e,n,t){if(n.hasOwnProperty("value")||n.hasOwnProperty("defaultValue")){var r=n.type;if(!(r!=="submit"&&r!=="reset"||n.value!==void 0&&n.value!==null))return;n=""+e._wrapperState.initialValue,t||n===e.value||(e.value=n),e.defaultValue=n}t=e.name,t!==""&&(e.name=""),e.defaultChecked=!!e._wrapperState.initialChecked,t!==""&&(e.name=t)}function Zl(e,n,t){(n!=="number"||pu(e.ownerDocument)!==e)&&(t==null?e.defaultValue=""+e._wrapperState.initialValue:e.defaultValue!==""+t&&(e.defaultValue=""+t))}var Ht=Array.isArray;function vt(e,n,t,r){if(e=e.options,n){n={};for(var u=0;u<t.length;u++)n["$"+t[u]]=!0;for(t=0;t<e.length;t++)u=n.hasOwnProperty("$"+e[t].value),e[t].selected!==u&&(e[t].selected=u),u&&r&&(e[t].defaultSelected=!0)}else{for(t=""+Pn(t),n=null,u=0;u<e.length;u++){if(e[u].value===t){e[u].selected=!0,r&&(e[u].defaultSelected=!0);return}n!==null||e[u].disabled||(n=e[u])}n!==null&&(n.selected=!0)}}function ql(e,n){if(n.dangerouslySetInnerHTML!=null)throw Error(k(91));return J({},n,{value:void 0,defaultValue:void 0,children:""+e._wrapperState.initialValue})}function Xo(e,n){var t=n.value;if(t==null){if(t=n.children,n=n.defaultValue,t!=null){if(n!=null)throw Error(k(92));if(Ht(t)){if(1<t.length)throw Error(k(93));t=t[0]}n=t}n==null&&(n=""),t=n}e._wrapperState={initialValue:Pn(t)}}function Rs(e,n){var t=Pn(n.value),r=Pn(n.defaultValue);t!=null&&(t=""+t,t!==e.value&&(e.value=t),n.defaultValue==null&&e.defaultValue!==t&&(e.defaultValue=t)),r!=null&&(e.defaultValue=""+r)}function ea(e){var n=e.textContent;n===e._wrapperState.initialValue&&n!==""&&n!==null&&(e.value=n)}function zs(e){switch(e){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function Xl(e,n){return e==null||e==="http://www.w3.org/1999/xhtml"?zs(n):e==="http://www.w3.org/2000/svg"&&n==="foreignObject"?"http://www.w3.org/1999/xhtml":e}var zr,bs=function(e){return typeof MSApp!="undefined"&&MSApp.execUnsafeLocalFunction?function(n,t,r,u){MSApp.execUnsafeLocalFunction(function(){return e(n,t,r,u)})}:e}(function(e,n){if(e.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in e)e.innerHTML=n;else{for(zr=zr||document.createElement("div"),zr.innerHTML="<svg>"+n.valueOf().toString()+"</svg>",n=zr.firstChild;e.firstChild;)e.removeChild(e.firstChild);for(;n.firstChild;)e.appendChild(n.firstChild)}});function or(e,n){if(n){var t=e.firstChild;if(t&&t===e.lastChild&&t.nodeType===3){t.nodeValue=n;return}}e.textContent=n}var Yt={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},B0=["Webkit","ms","Moz","O"];Object.keys(Yt).forEach(function(e){B0.forEach(function(n){n=n+e.charAt(0).toUpperCase()+e.substring(1),Yt[n]=Yt[e]})});function Os(e,n,t){return n==null||typeof n=="boolean"||n===""?"":t||typeof n!="number"||n===0||Yt.hasOwnProperty(e)&&Yt[e]?(""+n).trim():n+"px"}function Ms(e,n){e=e.style;for(var t in n)if(n.hasOwnProperty(t)){var r=t.indexOf("--")===0,u=Os(t,n[t],r);t==="float"&&(t="cssFloat"),r?e.setProperty(t,u):e[t]=u}}var D0=J({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function ei(e,n){if(n){if(D0[e]&&(n.children!=null||n.dangerouslySetInnerHTML!=null))throw Error(k(137,e));if(n.dangerouslySetInnerHTML!=null){if(n.children!=null)throw Error(k(60));if(typeof n.dangerouslySetInnerHTML!="object"||!("__html"in n.dangerouslySetInnerHTML))throw Error(k(61))}if(n.style!=null&&typeof n.style!="object")throw Error(k(62))}}function ni(e,n){if(e.indexOf("-")===-1)return typeof n.is=="string";switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var ti=null;function Zi(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var ri=null,Et=null,xt=null;function na(e){if(e=Br(e)){if(typeof ri!="function")throw Error(k(280));var n=e.stateNode;n&&(n=Qu(n),ri(e.stateNode,e.type,n))}}function $s(e){Et?xt?xt.push(e):xt=[e]:Et=e}function js(){if(Et){var e=Et,n=xt;if(xt=Et=null,na(e),n)for(e=0;e<n.length;e++)na(n[e])}}function Us(e,n){return e(n)}function Ws(){}var yl=!1;function Vs(e,n,t){if(yl)return e(n,t);yl=!0;try{return Us(e,n,t)}finally{yl=!1,(Et!==null||xt!==null)&&(Ws(),js())}}function ar(e,n){var t=e.stateNode;if(t===null)return null;var r=Qu(t);if(r===null)return null;t=r[n];e:switch(n){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(r=!r.disabled)||(e=e.type,r=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!r;break e;default:e=!1}if(e)return null;if(t&&typeof t!="function")throw Error(k(231,n,typeof t));return t}var ui=!1;if(sn)try{var bt={};Object.defineProperty(bt,"passive",{get:function(){ui=!0}}),window.addEventListener("test",bt,bt),window.removeEventListener("test",bt,bt)}catch{ui=!1}function N0(e,n,t,r,u,l,i,o,s){var c=Array.prototype.slice.call(arguments,3);try{n.apply(t,c)}catch(h){this.onError(h)}}var Jt=!1,hu=null,mu=!1,li=null,_0={onError:function(e){Jt=!0,hu=e}};function P0(e,n,t,r,u,l,i,o,s){Jt=!1,hu=null,N0.apply(_0,arguments)}function T0(e,n,t,r,u,l,i,o,s){if(P0.apply(this,arguments),Jt){if(Jt){var c=hu;Jt=!1,hu=null}else throw Error(k(198));mu||(mu=!0,li=c)}}function tt(e){var n=e,t=e;if(e.alternate)for(;n.return;)n=n.return;else{e=n;do n=e,(n.flags&4098)!==0&&(t=n.return),e=n.return;while(e)}return n.tag===3?t:null}function Hs(e){if(e.tag===13){var n=e.memoizedState;if(n===null&&(e=e.alternate,e!==null&&(n=e.memoizedState)),n!==null)return n.dehydrated}return null}function ta(e){if(tt(e)!==e)throw Error(k(188))}function I0(e){var n=e.alternate;if(!n){if(n=tt(e),n===null)throw Error(k(188));return n!==e?null:e}for(var t=e,r=n;;){var u=t.return;if(u===null)break;var l=u.alternate;if(l===null){if(r=u.return,r!==null){t=r;continue}break}if(u.child===l.child){for(l=u.child;l;){if(l===t)return ta(u),e;if(l===r)return ta(u),n;l=l.sibling}throw Error(k(188))}if(t.return!==r.return)t=u,r=l;else{for(var i=!1,o=u.child;o;){if(o===t){i=!0,t=u,r=l;break}if(o===r){i=!0,r=u,t=l;break}o=o.sibling}if(!i){for(o=l.child;o;){if(o===t){i=!0,t=l,r=u;break}if(o===r){i=!0,r=l,t=u;break}o=o.sibling}if(!i)throw Error(k(189))}}if(t.alternate!==r)throw Error(k(190))}if(t.tag!==3)throw Error(k(188));return t.stateNode.current===t?e:n}function Qs(e){return e=I0(e),e!==null?Gs(e):null}function Gs(e){if(e.tag===5||e.tag===6)return e;for(e=e.child;e!==null;){var n=Gs(e);if(n!==null)return n;e=e.sibling}return null}var Ks=_e.unstable_scheduleCallback,ra=_e.unstable_cancelCallback,L0=_e.unstable_shouldYield,R0=_e.unstable_requestPaint,ee=_e.unstable_now,z0=_e.unstable_getCurrentPriorityLevel,qi=_e.unstable_ImmediatePriority,Ys=_e.unstable_UserBlockingPriority,gu=_e.unstable_NormalPriority,b0=_e.unstable_LowPriority,Js=_e.unstable_IdlePriority,Uu=null,qe=null;function O0(e){if(qe&&typeof qe.onCommitFiberRoot=="function")try{qe.onCommitFiberRoot(Uu,e,void 0,(e.current.flags&128)===128)}catch{}}var Ve=Math.clz32?Math.clz32:j0,M0=Math.log,$0=Math.LN2;function j0(e){return e>>>=0,e===0?32:31-(M0(e)/$0|0)|0}var br=64,Or=4194304;function Qt(e){switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return e&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return e&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return e}}function yu(e,n){var t=e.pendingLanes;if(t===0)return 0;var r=0,u=e.suspendedLanes,l=e.pingedLanes,i=t&268435455;if(i!==0){var o=i&~u;o!==0?r=Qt(o):(l&=i,l!==0&&(r=Qt(l)))}else i=t&~u,i!==0?r=Qt(i):l!==0&&(r=Qt(l));if(r===0)return 0;if(n!==0&&n!==r&&(n&u)===0&&(u=r&-r,l=n&-n,u>=l||u===16&&(l&4194240)!==0))return n;if((r&4)!==0&&(r|=t&16),n=e.entangledLanes,n!==0)for(e=e.entanglements,n&=r;0<n;)t=31-Ve(n),u=1<<t,r|=e[t],n&=~u;return r}function U0(e,n){switch(e){case 1:case 2:case 4:return n+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return n+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function W0(e,n){for(var t=e.suspendedLanes,r=e.pingedLanes,u=e.expirationTimes,l=e.pendingLanes;0<l;){var i=31-Ve(l),o=1<<i,s=u[i];s===-1?((o&t)===0||(o&r)!==0)&&(u[i]=U0(o,n)):s<=n&&(e.expiredLanes|=o),l&=~o}}function ii(e){return e=e.pendingLanes&-1073741825,e!==0?e:e&1073741824?1073741824:0}function Zs(){var e=br;return br<<=1,(br&4194240)===0&&(br=64),e}function vl(e){for(var n=[],t=0;31>t;t++)n.push(e);return n}function Ar(e,n,t){e.pendingLanes|=n,n!==536870912&&(e.suspendedLanes=0,e.pingedLanes=0),e=e.eventTimes,n=31-Ve(n),e[n]=t}function V0(e,n){var t=e.pendingLanes&~n;e.pendingLanes=n,e.suspendedLanes=0,e.pingedLanes=0,e.expiredLanes&=n,e.mutableReadLanes&=n,e.entangledLanes&=n,n=e.entanglements;var r=e.eventTimes;for(e=e.expirationTimes;0<t;){var u=31-Ve(t),l=1<<u;n[u]=0,r[u]=-1,e[u]=-1,t&=~l}}function Xi(e,n){var t=e.entangledLanes|=n;for(e=e.entanglements;t;){var r=31-Ve(t),u=1<<r;u&n|e[r]&n&&(e[r]|=n),t&=~u}}var j=0;function qs(e){return e&=-e,1<e?4<e?(e&268435455)!==0?16:536870912:4:1}var Xs,eo,ec,nc,tc,oi=!1,Mr=[],wn=null,kn=null,Cn=null,sr=new Map,cr=new Map,vn=[],H0="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function ua(e,n){switch(e){case"focusin":case"focusout":wn=null;break;case"dragenter":case"dragleave":kn=null;break;case"mouseover":case"mouseout":Cn=null;break;case"pointerover":case"pointerout":sr.delete(n.pointerId);break;case"gotpointercapture":case"lostpointercapture":cr.delete(n.pointerId)}}function Ot(e,n,t,r,u,l){return e===null||e.nativeEvent!==l?(e={blockedOn:n,domEventName:t,eventSystemFlags:r,nativeEvent:l,targetContainers:[u]},n!==null&&(n=Br(n),n!==null&&eo(n)),e):(e.eventSystemFlags|=r,n=e.targetContainers,u!==null&&n.indexOf(u)===-1&&n.push(u),e)}function Q0(e,n,t,r,u){switch(n){case"focusin":return wn=Ot(wn,e,n,t,r,u),!0;case"dragenter":return kn=Ot(kn,e,n,t,r,u),!0;case"mouseover":return Cn=Ot(Cn,e,n,t,r,u),!0;case"pointerover":var l=u.pointerId;return sr.set(l,Ot(sr.get(l)||null,e,n,t,r,u)),!0;case"gotpointercapture":return l=u.pointerId,cr.set(l,Ot(cr.get(l)||null,e,n,t,r,u)),!0}return!1}function rc(e){var n=Vn(e.target);if(n!==null){var t=tt(n);if(t!==null){if(n=t.tag,n===13){if(n=Hs(t),n!==null){e.blockedOn=n,tc(e.priority,function(){ec(t)});return}}else if(n===3&&t.stateNode.current.memoizedState.isDehydrated){e.blockedOn=t.tag===3?t.stateNode.containerInfo:null;return}}}e.blockedOn=null}function tu(e){if(e.blockedOn!==null)return!1;for(var n=e.targetContainers;0<n.length;){var t=ai(e.domEventName,e.eventSystemFlags,n[0],e.nativeEvent);if(t===null){t=e.nativeEvent;var r=new t.constructor(t.type,t);ti=r,t.target.dispatchEvent(r),ti=null}else return n=Br(t),n!==null&&eo(n),e.blockedOn=t,!1;n.shift()}return!0}function la(e,n,t){tu(e)&&t.delete(n)}function G0(){oi=!1,wn!==null&&tu(wn)&&(wn=null),kn!==null&&tu(kn)&&(kn=null),Cn!==null&&tu(Cn)&&(Cn=null),sr.forEach(la),cr.forEach(la)}function Mt(e,n){e.blockedOn===n&&(e.blockedOn=null,oi||(oi=!0,_e.unstable_scheduleCallback(_e.unstable_NormalPriority,G0)))}function dr(e){function n(u){return Mt(u,e)}if(0<Mr.length){Mt(Mr[0],e);for(var t=1;t<Mr.length;t++){var r=Mr[t];r.blockedOn===e&&(r.blockedOn=null)}}for(wn!==null&&Mt(wn,e),kn!==null&&Mt(kn,e),Cn!==null&&Mt(Cn,e),sr.forEach(n),cr.forEach(n),t=0;t<vn.length;t++)r=vn[t],r.blockedOn===e&&(r.blockedOn=null);for(;0<vn.length&&(t=vn[0],t.blockedOn===null);)rc(t),t.blockedOn===null&&vn.shift()}var Ft=pn.ReactCurrentBatchConfig,vu=!0;function K0(e,n,t,r){var u=j,l=Ft.transition;Ft.transition=null;try{j=1,no(e,n,t,r)}finally{j=u,Ft.transition=l}}function Y0(e,n,t,r){var u=j,l=Ft.transition;Ft.transition=null;try{j=4,no(e,n,t,r)}finally{j=u,Ft.transition=l}}function no(e,n,t,r){if(vu){var u=ai(e,n,t,r);if(u===null)Dl(e,n,r,Eu,t),ua(e,r);else if(Q0(u,e,n,t,r))r.stopPropagation();else if(ua(e,r),n&4&&-1<H0.indexOf(e)){for(;u!==null;){var l=Br(u);if(l!==null&&Xs(l),l=ai(e,n,t,r),l===null&&Dl(e,n,r,Eu,t),l===u)break;u=l}u!==null&&r.stopPropagation()}else Dl(e,n,r,null,t)}}var Eu=null;function ai(e,n,t,r){if(Eu=null,e=Zi(r),e=Vn(e),e!==null)if(n=tt(e),n===null)e=null;else if(t=n.tag,t===13){if(e=Hs(n),e!==null)return e;e=null}else if(t===3){if(n.stateNode.current.memoizedState.isDehydrated)return n.tag===3?n.stateNode.containerInfo:null;e=null}else n!==e&&(e=null);return Eu=e,null}function uc(e){switch(e){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(z0()){case qi:return 1;case Ys:return 4;case gu:case b0:return 16;case Js:return 536870912;default:return 16}default:return 16}}var xn=null,to=null,ru=null;function lc(){if(ru)return ru;var e,n=to,t=n.length,r,u="value"in xn?xn.value:xn.textContent,l=u.length;for(e=0;e<t&&n[e]===u[e];e++);var i=t-e;for(r=1;r<=i&&n[t-r]===u[l-r];r++);return ru=u.slice(e,1<r?1-r:void 0)}function uu(e){var n=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&n===13&&(e=13)):e=n,e===10&&(e=13),32<=e||e===13?e:0}function $r(){return!0}function ia(){return!1}function Te(e){function n(t,r,u,l,i){this._reactName=t,this._targetInst=u,this.type=r,this.nativeEvent=l,this.target=i,this.currentTarget=null;for(var o in e)e.hasOwnProperty(o)&&(t=e[o],this[o]=t?t(l):l[o]);return this.isDefaultPrevented=(l.defaultPrevented!=null?l.defaultPrevented:l.returnValue===!1)?$r:ia,this.isPropagationStopped=ia,this}return J(n.prototype,{preventDefault:function(){this.defaultPrevented=!0;var t=this.nativeEvent;t&&(t.preventDefault?t.preventDefault():typeof t.returnValue!="unknown"&&(t.returnValue=!1),this.isDefaultPrevented=$r)},stopPropagation:function(){var t=this.nativeEvent;t&&(t.stopPropagation?t.stopPropagation():typeof t.cancelBubble!="unknown"&&(t.cancelBubble=!0),this.isPropagationStopped=$r)},persist:function(){},isPersistent:$r}),n}var Tt={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},ro=Te(Tt),Sr=J({},Tt,{view:0,detail:0}),J0=Te(Sr),El,xl,$t,Wu=J({},Sr,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:uo,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==$t&&($t&&e.type==="mousemove"?(El=e.screenX-$t.screenX,xl=e.screenY-$t.screenY):xl=El=0,$t=e),El)},movementY:function(e){return"movementY"in e?e.movementY:xl}}),oa=Te(Wu),Z0=J({},Wu,{dataTransfer:0}),q0=Te(Z0),X0=J({},Sr,{relatedTarget:0}),Fl=Te(X0),ef=J({},Tt,{animationName:0,elapsedTime:0,pseudoElement:0}),nf=Te(ef),tf=J({},Tt,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),rf=Te(tf),uf=J({},Tt,{data:0}),aa=Te(uf),lf={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},of={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},af={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function sf(e){var n=this.nativeEvent;return n.getModifierState?n.getModifierState(e):(e=af[e])?!!n[e]:!1}function uo(){return sf}var cf=J({},Sr,{key:function(e){if(e.key){var n=lf[e.key]||e.key;if(n!=="Unidentified")return n}return e.type==="keypress"?(e=uu(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?of[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:uo,charCode:function(e){return e.type==="keypress"?uu(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?uu(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),df=Te(cf),ff=J({},Wu,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),sa=Te(ff),pf=J({},Sr,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:uo}),hf=Te(pf),mf=J({},Tt,{propertyName:0,elapsedTime:0,pseudoElement:0}),gf=Te(mf),yf=J({},Wu,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),vf=Te(yf),Ef=[9,13,27,32],lo=sn&&"CompositionEvent"in window,Zt=null;sn&&"documentMode"in document&&(Zt=document.documentMode);var xf=sn&&"TextEvent"in window&&!Zt,ic=sn&&(!lo||Zt&&8<Zt&&11>=Zt),ca=String.fromCharCode(32),da=!1;function oc(e,n){switch(e){case"keyup":return Ef.indexOf(n.keyCode)!==-1;case"keydown":return n.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function ac(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var at=!1;function Ff(e,n){switch(e){case"compositionend":return ac(n);case"keypress":return n.which!==32?null:(da=!0,ca);case"textInput":return e=n.data,e===ca&&da?null:e;default:return null}}function wf(e,n){if(at)return e==="compositionend"||!lo&&oc(e,n)?(e=lc(),ru=to=xn=null,at=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(n.ctrlKey||n.altKey||n.metaKey)||n.ctrlKey&&n.altKey){if(n.char&&1<n.char.length)return n.char;if(n.which)return String.fromCharCode(n.which)}return null;case"compositionend":return ic&&n.locale!=="ko"?null:n.data;default:return null}}var kf={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function fa(e){var n=e&&e.nodeName&&e.nodeName.toLowerCase();return n==="input"?!!kf[e.type]:n==="textarea"}function sc(e,n,t,r){$s(r),n=xu(n,"onChange"),0<n.length&&(t=new ro("onChange","change",null,t,r),e.push({event:t,listeners:n}))}var qt=null,fr=null;function Cf(e){xc(e,0)}function Vu(e){var n=dt(e);if(Is(n))return e}function Af(e,n){if(e==="change")return n}var cc=!1;if(sn){var wl;if(sn){var kl="oninput"in document;if(!kl){var pa=document.createElement("div");pa.setAttribute("oninput","return;"),kl=typeof pa.oninput=="function"}wl=kl}else wl=!1;cc=wl&&(!document.documentMode||9<document.documentMode)}function ha(){qt&&(qt.detachEvent("onpropertychange",dc),fr=qt=null)}function dc(e){if(e.propertyName==="value"&&Vu(fr)){var n=[];sc(n,fr,e,Zi(e)),Vs(Cf,n)}}function Sf(e,n,t){e==="focusin"?(ha(),qt=n,fr=t,qt.attachEvent("onpropertychange",dc)):e==="focusout"&&ha()}function Bf(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return Vu(fr)}function Df(e,n){if(e==="click")return Vu(n)}function Nf(e,n){if(e==="input"||e==="change")return Vu(n)}function _f(e,n){return e===n&&(e!==0||1/e===1/n)||e!==e&&n!==n}var Qe=typeof Object.is=="function"?Object.is:_f;function pr(e,n){if(Qe(e,n))return!0;if(typeof e!="object"||e===null||typeof n!="object"||n===null)return!1;var t=Object.keys(e),r=Object.keys(n);if(t.length!==r.length)return!1;for(r=0;r<t.length;r++){var u=t[r];if(!Vl.call(n,u)||!Qe(e[u],n[u]))return!1}return!0}function ma(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function ga(e,n){var t=ma(e);e=0;for(var r;t;){if(t.nodeType===3){if(r=e+t.textContent.length,e<=n&&r>=n)return{node:t,offset:n-e};e=r}e:{for(;t;){if(t.nextSibling){t=t.nextSibling;break e}t=t.parentNode}t=void 0}t=ma(t)}}function fc(e,n){return e&&n?e===n?!0:e&&e.nodeType===3?!1:n&&n.nodeType===3?fc(e,n.parentNode):"contains"in e?e.contains(n):e.compareDocumentPosition?!!(e.compareDocumentPosition(n)&16):!1:!1}function pc(){for(var e=window,n=pu();n instanceof e.HTMLIFrameElement;){try{var t=typeof n.contentWindow.location.href=="string"}catch{t=!1}if(t)e=n.contentWindow;else break;n=pu(e.document)}return n}function io(e){var n=e&&e.nodeName&&e.nodeName.toLowerCase();return n&&(n==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||n==="textarea"||e.contentEditable==="true")}function Pf(e){var n=pc(),t=e.focusedElem,r=e.selectionRange;if(n!==t&&t&&t.ownerDocument&&fc(t.ownerDocument.documentElement,t)){if(r!==null&&io(t)){if(n=r.start,e=r.end,e===void 0&&(e=n),"selectionStart"in t)t.selectionStart=n,t.selectionEnd=Math.min(e,t.value.length);else if(e=(n=t.ownerDocument||document)&&n.defaultView||window,e.getSelection){e=e.getSelection();var u=t.textContent.length,l=Math.min(r.start,u);r=r.end===void 0?l:Math.min(r.end,u),!e.extend&&l>r&&(u=r,r=l,l=u),u=ga(t,l);var i=ga(t,r);u&&i&&(e.rangeCount!==1||e.anchorNode!==u.node||e.anchorOffset!==u.offset||e.focusNode!==i.node||e.focusOffset!==i.offset)&&(n=n.createRange(),n.setStart(u.node,u.offset),e.removeAllRanges(),l>r?(e.addRange(n),e.extend(i.node,i.offset)):(n.setEnd(i.node,i.offset),e.addRange(n)))}}for(n=[],e=t;e=e.parentNode;)e.nodeType===1&&n.push({element:e,left:e.scrollLeft,top:e.scrollTop});for(typeof t.focus=="function"&&t.focus(),t=0;t<n.length;t++)e=n[t],e.element.scrollLeft=e.left,e.element.scrollTop=e.top}}var Tf=sn&&"documentMode"in document&&11>=document.documentMode,st=null,si=null,Xt=null,ci=!1;function ya(e,n,t){var r=t.window===t?t.document:t.nodeType===9?t:t.ownerDocument;ci||st==null||st!==pu(r)||(r=st,"selectionStart"in r&&io(r)?r={start:r.selectionStart,end:r.selectionEnd}:(r=(r.ownerDocument&&r.ownerDocument.defaultView||window).getSelection(),r={anchorNode:r.anchorNode,anchorOffset:r.anchorOffset,focusNode:r.focusNode,focusOffset:r.focusOffset}),Xt&&pr(Xt,r)||(Xt=r,r=xu(si,"onSelect"),0<r.length&&(n=new ro("onSelect","select",null,n,t),e.push({event:n,listeners:r}),n.target=st)))}function jr(e,n){var t={};return t[e.toLowerCase()]=n.toLowerCase(),t["Webkit"+e]="webkit"+n,t["Moz"+e]="moz"+n,t}var ct={animationend:jr("Animation","AnimationEnd"),animationiteration:jr("Animation","AnimationIteration"),animationstart:jr("Animation","AnimationStart"),transitionend:jr("Transition","TransitionEnd")},Cl={},hc={};sn&&(hc=document.createElement("div").style,"AnimationEvent"in window||(delete ct.animationend.animation,delete ct.animationiteration.animation,delete ct.animationstart.animation),"TransitionEvent"in window||delete ct.transitionend.transition);function Hu(e){if(Cl[e])return Cl[e];if(!ct[e])return e;var n=ct[e],t;for(t in n)if(n.hasOwnProperty(t)&&t in hc)return Cl[e]=n[t];return e}var mc=Hu("animationend"),gc=Hu("animationiteration"),yc=Hu("animationstart"),vc=Hu("transitionend"),Ec=new Map,va="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function zn(e,n){Ec.set(e,n),nt(n,[e])}for(var Al=0;Al<va.length;Al++){var Sl=va[Al],If=Sl.toLowerCase(),Lf=Sl[0].toUpperCase()+Sl.slice(1);zn(If,"on"+Lf)}zn(mc,"onAnimationEnd");zn(gc,"onAnimationIteration");zn(yc,"onAnimationStart");zn("dblclick","onDoubleClick");zn("focusin","onFocus");zn("focusout","onBlur");zn(vc,"onTransitionEnd");Ct("onMouseEnter",["mouseout","mouseover"]);Ct("onMouseLeave",["mouseout","mouseover"]);Ct("onPointerEnter",["pointerout","pointerover"]);Ct("onPointerLeave",["pointerout","pointerover"]);nt("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));nt("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));nt("onBeforeInput",["compositionend","keypress","textInput","paste"]);nt("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));nt("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));nt("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Gt="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),Rf=new Set("cancel close invalid load scroll toggle".split(" ").concat(Gt));function Ea(e,n,t){var r=e.type||"unknown-event";e.currentTarget=t,T0(r,n,void 0,e),e.currentTarget=null}function xc(e,n){n=(n&4)!==0;for(var t=0;t<e.length;t++){var r=e[t],u=r.event;r=r.listeners;e:{var l=void 0;if(n)for(var i=r.length-1;0<=i;i--){var o=r[i],s=o.instance,c=o.currentTarget;if(o=o.listener,s!==l&&u.isPropagationStopped())break e;Ea(u,o,c),l=s}else for(i=0;i<r.length;i++){if(o=r[i],s=o.instance,c=o.currentTarget,o=o.listener,s!==l&&u.isPropagationStopped())break e;Ea(u,o,c),l=s}}}if(mu)throw e=li,mu=!1,li=null,e}function H(e,n){var t=n[mi];t===void 0&&(t=n[mi]=new Set);var r=e+"__bubble";t.has(r)||(Fc(n,e,2,!1),t.add(r))}function Bl(e,n,t){var r=0;n&&(r|=4),Fc(t,e,r,n)}var Ur="_reactListening"+Math.random().toString(36).slice(2);function hr(e){if(!e[Ur]){e[Ur]=!0,Ds.forEach(function(t){t!=="selectionchange"&&(Rf.has(t)||Bl(t,!1,e),Bl(t,!0,e))});var n=e.nodeType===9?e:e.ownerDocument;n===null||n[Ur]||(n[Ur]=!0,Bl("selectionchange",!1,n))}}function Fc(e,n,t,r){switch(uc(n)){case 1:var u=K0;break;case 4:u=Y0;break;default:u=no}t=u.bind(null,n,t,e),u=void 0,!ui||n!=="touchstart"&&n!=="touchmove"&&n!=="wheel"||(u=!0),r?u!==void 0?e.addEventListener(n,t,{capture:!0,passive:u}):e.addEventListener(n,t,!0):u!==void 0?e.addEventListener(n,t,{passive:u}):e.addEventListener(n,t,!1)}function Dl(e,n,t,r,u){var l=r;if((n&1)===0&&(n&2)===0&&r!==null)e:for(;;){if(r===null)return;var i=r.tag;if(i===3||i===4){var o=r.stateNode.containerInfo;if(o===u||o.nodeType===8&&o.parentNode===u)break;if(i===4)for(i=r.return;i!==null;){var s=i.tag;if((s===3||s===4)&&(s=i.stateNode.containerInfo,s===u||s.nodeType===8&&s.parentNode===u))return;i=i.return}for(;o!==null;){if(i=Vn(o),i===null)return;if(s=i.tag,s===5||s===6){r=l=i;continue e}o=o.parentNode}}r=r.return}Vs(function(){var c=l,h=Zi(t),m=[];e:{var p=Ec.get(e);if(p!==void 0){var v=ro,w=e;switch(e){case"keypress":if(uu(t)===0)break e;case"keydown":case"keyup":v=df;break;case"focusin":w="focus",v=Fl;break;case"focusout":w="blur",v=Fl;break;case"beforeblur":case"afterblur":v=Fl;break;case"click":if(t.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":v=oa;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":v=q0;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":v=hf;break;case mc:case gc:case yc:v=nf;break;case vc:v=gf;break;case"scroll":v=J0;break;case"wheel":v=vf;break;case"copy":case"cut":case"paste":v=rf;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":v=sa}var F=(n&4)!==0,I=!F&&e==="scroll",f=F?p!==null?p+"Capture":null:p;F=[];for(var d=c,g;d!==null;){g=d;var E=g.stateNode;if(g.tag===5&&E!==null&&(g=E,f!==null&&(E=ar(d,f),E!=null&&F.push(mr(d,E,g)))),I)break;d=d.return}0<F.length&&(p=new v(p,w,null,t,h),m.push({event:p,listeners:F}))}}if((n&7)===0){e:{if(p=e==="mouseover"||e==="pointerover",v=e==="mouseout"||e==="pointerout",p&&t!==ti&&(w=t.relatedTarget||t.fromElement)&&(Vn(w)||w[cn]))break e;if((v||p)&&(p=h.window===h?h:(p=h.ownerDocument)?p.defaultView||p.parentWindow:window,v?(w=t.relatedTarget||t.toElement,v=c,w=w?Vn(w):null,w!==null&&(I=tt(w),w!==I||w.tag!==5&&w.tag!==6)&&(w=null)):(v=null,w=c),v!==w)){if(F=oa,E="onMouseLeave",f="onMouseEnter",d="mouse",(e==="pointerout"||e==="pointerover")&&(F=sa,E="onPointerLeave",f="onPointerEnter",d="pointer"),I=v==null?p:dt(v),g=w==null?p:dt(w),p=new F(E,d+"leave",v,t,h),p.target=I,p.relatedTarget=g,E=null,Vn(h)===c&&(F=new F(f,d+"enter",w,t,h),F.target=g,F.relatedTarget=I,E=F),I=E,v&&w)n:{for(F=v,f=w,d=0,g=F;g;g=lt(g))d++;for(g=0,E=f;E;E=lt(E))g++;for(;0<d-g;)F=lt(F),d--;for(;0<g-d;)f=lt(f),g--;for(;d--;){if(F===f||f!==null&&F===f.alternate)break n;F=lt(F),f=lt(f)}F=null}else F=null;v!==null&&xa(m,p,v,F,!1),w!==null&&I!==null&&xa(m,I,w,F,!0)}}e:{if(p=c?dt(c):window,v=p.nodeName&&p.nodeName.toLowerCase(),v==="select"||v==="input"&&p.type==="file")var C=Af;else if(fa(p))if(cc)C=Nf;else{C=Bf;var A=Sf}else(v=p.nodeName)&&v.toLowerCase()==="input"&&(p.type==="checkbox"||p.type==="radio")&&(C=Df);if(C&&(C=C(e,c))){sc(m,C,t,h);break e}A&&A(e,p,c),e==="focusout"&&(A=p._wrapperState)&&A.controlled&&p.type==="number"&&Zl(p,"number",p.value)}switch(A=c?dt(c):window,e){case"focusin":(fa(A)||A.contentEditable==="true")&&(st=A,si=c,Xt=null);break;case"focusout":Xt=si=st=null;break;case"mousedown":ci=!0;break;case"contextmenu":case"mouseup":case"dragend":ci=!1,ya(m,t,h);break;case"selectionchange":if(Tf)break;case"keydown":case"keyup":ya(m,t,h)}var S;if(lo)e:{switch(e){case"compositionstart":var x="onCompositionStart";break e;case"compositionend":x="onCompositionEnd";break e;case"compositionupdate":x="onCompositionUpdate";break e}x=void 0}else at?oc(e,t)&&(x="onCompositionEnd"):e==="keydown"&&t.keyCode===229&&(x="onCompositionStart");x&&(ic&&t.locale!=="ko"&&(at||x!=="onCompositionStart"?x==="onCompositionEnd"&&at&&(S=lc()):(xn=h,to="value"in xn?xn.value:xn.textContent,at=!0)),A=xu(c,x),0<A.length&&(x=new aa(x,e,null,t,h),m.push({event:x,listeners:A}),S?x.data=S:(S=ac(t),S!==null&&(x.data=S)))),(S=xf?Ff(e,t):wf(e,t))&&(c=xu(c,"onBeforeInput"),0<c.length&&(h=new aa("onBeforeInput","beforeinput",null,t,h),m.push({event:h,listeners:c}),h.data=S))}xc(m,n)})}function mr(e,n,t){return{instance:e,listener:n,currentTarget:t}}function xu(e,n){for(var t=n+"Capture",r=[];e!==null;){var u=e,l=u.stateNode;u.tag===5&&l!==null&&(u=l,l=ar(e,t),l!=null&&r.unshift(mr(e,l,u)),l=ar(e,n),l!=null&&r.push(mr(e,l,u))),e=e.return}return r}function lt(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5);return e||null}function xa(e,n,t,r,u){for(var l=n._reactName,i=[];t!==null&&t!==r;){var o=t,s=o.alternate,c=o.stateNode;if(s!==null&&s===r)break;o.tag===5&&c!==null&&(o=c,u?(s=ar(t,l),s!=null&&i.unshift(mr(t,s,o))):u||(s=ar(t,l),s!=null&&i.push(mr(t,s,o)))),t=t.return}i.length!==0&&e.push({event:n,listeners:i})}var zf=/\r\n?/g,bf=/\u0000|\uFFFD/g;function Fa(e){return(typeof e=="string"?e:""+e).replace(zf,`
`).replace(bf,"")}function Wr(e,n,t){if(n=Fa(n),Fa(e)!==n&&t)throw Error(k(425))}function Fu(){}var di=null,fi=null;function pi(e,n){return e==="textarea"||e==="noscript"||typeof n.children=="string"||typeof n.children=="number"||typeof n.dangerouslySetInnerHTML=="object"&&n.dangerouslySetInnerHTML!==null&&n.dangerouslySetInnerHTML.__html!=null}var hi=typeof setTimeout=="function"?setTimeout:void 0,Of=typeof clearTimeout=="function"?clearTimeout:void 0,wa=typeof Promise=="function"?Promise:void 0,Mf=typeof queueMicrotask=="function"?queueMicrotask:typeof wa!="undefined"?function(e){return wa.resolve(null).then(e).catch($f)}:hi;function $f(e){setTimeout(function(){throw e})}function Nl(e,n){var t=n,r=0;do{var u=t.nextSibling;if(e.removeChild(t),u&&u.nodeType===8)if(t=u.data,t==="/$"){if(r===0){e.removeChild(u),dr(n);return}r--}else t!=="$"&&t!=="$?"&&t!=="$!"||r++;t=u}while(t);dr(n)}function An(e){for(;e!=null;e=e.nextSibling){var n=e.nodeType;if(n===1||n===3)break;if(n===8){if(n=e.data,n==="$"||n==="$!"||n==="$?")break;if(n==="/$")return null}}return e}function ka(e){e=e.previousSibling;for(var n=0;e;){if(e.nodeType===8){var t=e.data;if(t==="$"||t==="$!"||t==="$?"){if(n===0)return e;n--}else t==="/$"&&n++}e=e.previousSibling}return null}var It=Math.random().toString(36).slice(2),Ze="__reactFiber$"+It,gr="__reactProps$"+It,cn="__reactContainer$"+It,mi="__reactEvents$"+It,jf="__reactListeners$"+It,Uf="__reactHandles$"+It;function Vn(e){var n=e[Ze];if(n)return n;for(var t=e.parentNode;t;){if(n=t[cn]||t[Ze]){if(t=n.alternate,n.child!==null||t!==null&&t.child!==null)for(e=ka(e);e!==null;){if(t=e[Ze])return t;e=ka(e)}return n}e=t,t=e.parentNode}return null}function Br(e){return e=e[Ze]||e[cn],!e||e.tag!==5&&e.tag!==6&&e.tag!==13&&e.tag!==3?null:e}function dt(e){if(e.tag===5||e.tag===6)return e.stateNode;throw Error(k(33))}function Qu(e){return e[gr]||null}var gi=[],ft=-1;function bn(e){return{current:e}}function Q(e){0>ft||(e.current=gi[ft],gi[ft]=null,ft--)}function V(e,n){ft++,gi[ft]=e.current,e.current=n}var Tn={},me=bn(Tn),Ce=bn(!1),Jn=Tn;function At(e,n){var t=e.type.contextTypes;if(!t)return Tn;var r=e.stateNode;if(r&&r.__reactInternalMemoizedUnmaskedChildContext===n)return r.__reactInternalMemoizedMaskedChildContext;var u={},l;for(l in t)u[l]=n[l];return r&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=n,e.__reactInternalMemoizedMaskedChildContext=u),u}function Ae(e){return e=e.childContextTypes,e!=null}function wu(){Q(Ce),Q(me)}function Ca(e,n,t){if(me.current!==Tn)throw Error(k(168));V(me,n),V(Ce,t)}function wc(e,n,t){var r=e.stateNode;if(n=n.childContextTypes,typeof r.getChildContext!="function")return t;r=r.getChildContext();for(var u in r)if(!(u in n))throw Error(k(108,A0(e)||"Unknown",u));return J({},t,r)}function ku(e){return e=(e=e.stateNode)&&e.__reactInternalMemoizedMergedChildContext||Tn,Jn=me.current,V(me,e),V(Ce,Ce.current),!0}function Aa(e,n,t){var r=e.stateNode;if(!r)throw Error(k(169));t?(e=wc(e,n,Jn),r.__reactInternalMemoizedMergedChildContext=e,Q(Ce),Q(me),V(me,e)):Q(Ce),V(Ce,t)}var rn=null,Gu=!1,_l=!1;function kc(e){rn===null?rn=[e]:rn.push(e)}function Wf(e){Gu=!0,kc(e)}function On(){if(!_l&&rn!==null){_l=!0;var e=0,n=j;try{var t=rn;for(j=1;e<t.length;e++){var r=t[e];do r=r(!0);while(r!==null)}rn=null,Gu=!1}catch(u){throw rn!==null&&(rn=rn.slice(e+1)),Ks(qi,On),u}finally{j=n,_l=!1}}return null}var pt=[],ht=0,Cu=null,Au=0,Le=[],Re=0,Zn=null,un=1,ln="";function Un(e,n){pt[ht++]=Au,pt[ht++]=Cu,Cu=e,Au=n}function Cc(e,n,t){Le[Re++]=un,Le[Re++]=ln,Le[Re++]=Zn,Zn=e;var r=un;e=ln;var u=32-Ve(r)-1;r&=~(1<<u),t+=1;var l=32-Ve(n)+u;if(30<l){var i=u-u%5;l=(r&(1<<i)-1).toString(32),r>>=i,u-=i,un=1<<32-Ve(n)+u|t<<u|r,ln=l+e}else un=1<<l|t<<u|r,ln=e}function oo(e){e.return!==null&&(Un(e,1),Cc(e,1,0))}function ao(e){for(;e===Cu;)Cu=pt[--ht],pt[ht]=null,Au=pt[--ht],pt[ht]=null;for(;e===Zn;)Zn=Le[--Re],Le[Re]=null,ln=Le[--Re],Le[Re]=null,un=Le[--Re],Le[Re]=null}var Ne=null,De=null,G=!1,We=null;function Ac(e,n){var t=ze(5,null,null,0);t.elementType="DELETED",t.stateNode=n,t.return=e,n=e.deletions,n===null?(e.deletions=[t],e.flags|=16):n.push(t)}function Sa(e,n){switch(e.tag){case 5:var t=e.type;return n=n.nodeType!==1||t.toLowerCase()!==n.nodeName.toLowerCase()?null:n,n!==null?(e.stateNode=n,Ne=e,De=An(n.firstChild),!0):!1;case 6:return n=e.pendingProps===""||n.nodeType!==3?null:n,n!==null?(e.stateNode=n,Ne=e,De=null,!0):!1;case 13:return n=n.nodeType!==8?null:n,n!==null?(t=Zn!==null?{id:un,overflow:ln}:null,e.memoizedState={dehydrated:n,treeContext:t,retryLane:1073741824},t=ze(18,null,null,0),t.stateNode=n,t.return=e,e.child=t,Ne=e,De=null,!0):!1;default:return!1}}function yi(e){return(e.mode&1)!==0&&(e.flags&128)===0}function vi(e){if(G){var n=De;if(n){var t=n;if(!Sa(e,n)){if(yi(e))throw Error(k(418));n=An(t.nextSibling);var r=Ne;n&&Sa(e,n)?Ac(r,t):(e.flags=e.flags&-4097|2,G=!1,Ne=e)}}else{if(yi(e))throw Error(k(418));e.flags=e.flags&-4097|2,G=!1,Ne=e}}}function Ba(e){for(e=e.return;e!==null&&e.tag!==5&&e.tag!==3&&e.tag!==13;)e=e.return;Ne=e}function Vr(e){if(e!==Ne)return!1;if(!G)return Ba(e),G=!0,!1;var n;if((n=e.tag!==3)&&!(n=e.tag!==5)&&(n=e.type,n=n!=="head"&&n!=="body"&&!pi(e.type,e.memoizedProps)),n&&(n=De)){if(yi(e))throw Sc(),Error(k(418));for(;n;)Ac(e,n),n=An(n.nextSibling)}if(Ba(e),e.tag===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(k(317));e:{for(e=e.nextSibling,n=0;e;){if(e.nodeType===8){var t=e.data;if(t==="/$"){if(n===0){De=An(e.nextSibling);break e}n--}else t!=="$"&&t!=="$!"&&t!=="$?"||n++}e=e.nextSibling}De=null}}else De=Ne?An(e.stateNode.nextSibling):null;return!0}function Sc(){for(var e=De;e;)e=An(e.nextSibling)}function St(){De=Ne=null,G=!1}function so(e){We===null?We=[e]:We.push(e)}var Vf=pn.ReactCurrentBatchConfig;function je(e,n){if(e&&e.defaultProps){n=J({},n),e=e.defaultProps;for(var t in e)n[t]===void 0&&(n[t]=e[t]);return n}return n}var Su=bn(null),Bu=null,mt=null,co=null;function fo(){co=mt=Bu=null}function po(e){var n=Su.current;Q(Su),e._currentValue=n}function Ei(e,n,t){for(;e!==null;){var r=e.alternate;if((e.childLanes&n)!==n?(e.childLanes|=n,r!==null&&(r.childLanes|=n)):r!==null&&(r.childLanes&n)!==n&&(r.childLanes|=n),e===t)break;e=e.return}}function wt(e,n){Bu=e,co=mt=null,e=e.dependencies,e!==null&&e.firstContext!==null&&((e.lanes&n)!==0&&(ke=!0),e.firstContext=null)}function Oe(e){var n=e._currentValue;if(co!==e)if(e={context:e,memoizedValue:n,next:null},mt===null){if(Bu===null)throw Error(k(308));mt=e,Bu.dependencies={lanes:0,firstContext:e}}else mt=mt.next=e;return n}var Hn=null;function ho(e){Hn===null?Hn=[e]:Hn.push(e)}function Bc(e,n,t,r){var u=n.interleaved;return u===null?(t.next=t,ho(n)):(t.next=u.next,u.next=t),n.interleaved=t,dn(e,r)}function dn(e,n){e.lanes|=n;var t=e.alternate;for(t!==null&&(t.lanes|=n),t=e,e=e.return;e!==null;)e.childLanes|=n,t=e.alternate,t!==null&&(t.childLanes|=n),t=e,e=e.return;return t.tag===3?t.stateNode:null}var yn=!1;function mo(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function Dc(e,n){e=e.updateQueue,n.updateQueue===e&&(n.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,effects:e.effects})}function an(e,n){return{eventTime:e,lane:n,tag:0,payload:null,callback:null,next:null}}function Sn(e,n,t){var r=e.updateQueue;if(r===null)return null;if(r=r.shared,($&2)!==0){var u=r.pending;return u===null?n.next=n:(n.next=u.next,u.next=n),r.pending=n,dn(e,t)}return u=r.interleaved,u===null?(n.next=n,ho(r)):(n.next=u.next,u.next=n),r.interleaved=n,dn(e,t)}function lu(e,n,t){if(n=n.updateQueue,n!==null&&(n=n.shared,(t&4194240)!==0)){var r=n.lanes;r&=e.pendingLanes,t|=r,n.lanes=t,Xi(e,t)}}function Da(e,n){var t=e.updateQueue,r=e.alternate;if(r!==null&&(r=r.updateQueue,t===r)){var u=null,l=null;if(t=t.firstBaseUpdate,t!==null){do{var i={eventTime:t.eventTime,lane:t.lane,tag:t.tag,payload:t.payload,callback:t.callback,next:null};l===null?u=l=i:l=l.next=i,t=t.next}while(t!==null);l===null?u=l=n:l=l.next=n}else u=l=n;t={baseState:r.baseState,firstBaseUpdate:u,lastBaseUpdate:l,shared:r.shared,effects:r.effects},e.updateQueue=t;return}e=t.lastBaseUpdate,e===null?t.firstBaseUpdate=n:e.next=n,t.lastBaseUpdate=n}function Du(e,n,t,r){var u=e.updateQueue;yn=!1;var l=u.firstBaseUpdate,i=u.lastBaseUpdate,o=u.shared.pending;if(o!==null){u.shared.pending=null;var s=o,c=s.next;s.next=null,i===null?l=c:i.next=c,i=s;var h=e.alternate;h!==null&&(h=h.updateQueue,o=h.lastBaseUpdate,o!==i&&(o===null?h.firstBaseUpdate=c:o.next=c,h.lastBaseUpdate=s))}if(l!==null){var m=u.baseState;i=0,h=c=s=null,o=l;do{var p=o.lane,v=o.eventTime;if((r&p)===p){h!==null&&(h=h.next={eventTime:v,lane:0,tag:o.tag,payload:o.payload,callback:o.callback,next:null});e:{var w=e,F=o;switch(p=n,v=t,F.tag){case 1:if(w=F.payload,typeof w=="function"){m=w.call(v,m,p);break e}m=w;break e;case 3:w.flags=w.flags&-65537|128;case 0:if(w=F.payload,p=typeof w=="function"?w.call(v,m,p):w,p==null)break e;m=J({},m,p);break e;case 2:yn=!0}}o.callback!==null&&o.lane!==0&&(e.flags|=64,p=u.effects,p===null?u.effects=[o]:p.push(o))}else v={eventTime:v,lane:p,tag:o.tag,payload:o.payload,callback:o.callback,next:null},h===null?(c=h=v,s=m):h=h.next=v,i|=p;if(o=o.next,o===null){if(o=u.shared.pending,o===null)break;p=o,o=p.next,p.next=null,u.lastBaseUpdate=p,u.shared.pending=null}}while(1);if(h===null&&(s=m),u.baseState=s,u.firstBaseUpdate=c,u.lastBaseUpdate=h,n=u.shared.interleaved,n!==null){u=n;do i|=u.lane,u=u.next;while(u!==n)}else l===null&&(u.shared.lanes=0);Xn|=i,e.lanes=i,e.memoizedState=m}}function Na(e,n,t){if(e=n.effects,n.effects=null,e!==null)for(n=0;n<e.length;n++){var r=e[n],u=r.callback;if(u!==null){if(r.callback=null,r=t,typeof u!="function")throw Error(k(191,u));u.call(r)}}}var Nc=new Bs.Component().refs;function xi(e,n,t,r){n=e.memoizedState,t=t(r,n),t=t==null?n:J({},n,t),e.memoizedState=t,e.lanes===0&&(e.updateQueue.baseState=t)}var Ku={isMounted:function(e){return(e=e._reactInternals)?tt(e)===e:!1},enqueueSetState:function(e,n,t){e=e._reactInternals;var r=ve(),u=Dn(e),l=an(r,u);l.payload=n,t!=null&&(l.callback=t),n=Sn(e,l,u),n!==null&&(He(n,e,u,r),lu(n,e,u))},enqueueReplaceState:function(e,n,t){e=e._reactInternals;var r=ve(),u=Dn(e),l=an(r,u);l.tag=1,l.payload=n,t!=null&&(l.callback=t),n=Sn(e,l,u),n!==null&&(He(n,e,u,r),lu(n,e,u))},enqueueForceUpdate:function(e,n){e=e._reactInternals;var t=ve(),r=Dn(e),u=an(t,r);u.tag=2,n!=null&&(u.callback=n),n=Sn(e,u,r),n!==null&&(He(n,e,r,t),lu(n,e,r))}};function _a(e,n,t,r,u,l,i){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(r,l,i):n.prototype&&n.prototype.isPureReactComponent?!pr(t,r)||!pr(u,l):!0}function _c(e,n,t){var r=!1,u=Tn,l=n.contextType;return typeof l=="object"&&l!==null?l=Oe(l):(u=Ae(n)?Jn:me.current,r=n.contextTypes,l=(r=r!=null)?At(e,u):Tn),n=new n(t,l),e.memoizedState=n.state!==null&&n.state!==void 0?n.state:null,n.updater=Ku,e.stateNode=n,n._reactInternals=e,r&&(e=e.stateNode,e.__reactInternalMemoizedUnmaskedChildContext=u,e.__reactInternalMemoizedMaskedChildContext=l),n}function Pa(e,n,t,r){e=n.state,typeof n.componentWillReceiveProps=="function"&&n.componentWillReceiveProps(t,r),typeof n.UNSAFE_componentWillReceiveProps=="function"&&n.UNSAFE_componentWillReceiveProps(t,r),n.state!==e&&Ku.enqueueReplaceState(n,n.state,null)}function Fi(e,n,t,r){var u=e.stateNode;u.props=t,u.state=e.memoizedState,u.refs=Nc,mo(e);var l=n.contextType;typeof l=="object"&&l!==null?u.context=Oe(l):(l=Ae(n)?Jn:me.current,u.context=At(e,l)),u.state=e.memoizedState,l=n.getDerivedStateFromProps,typeof l=="function"&&(xi(e,n,l,t),u.state=e.memoizedState),typeof n.getDerivedStateFromProps=="function"||typeof u.getSnapshotBeforeUpdate=="function"||typeof u.UNSAFE_componentWillMount!="function"&&typeof u.componentWillMount!="function"||(n=u.state,typeof u.componentWillMount=="function"&&u.componentWillMount(),typeof u.UNSAFE_componentWillMount=="function"&&u.UNSAFE_componentWillMount(),n!==u.state&&Ku.enqueueReplaceState(u,u.state,null),Du(e,t,u,r),u.state=e.memoizedState),typeof u.componentDidMount=="function"&&(e.flags|=4194308)}function jt(e,n,t){if(e=t.ref,e!==null&&typeof e!="function"&&typeof e!="object"){if(t._owner){if(t=t._owner,t){if(t.tag!==1)throw Error(k(309));var r=t.stateNode}if(!r)throw Error(k(147,e));var u=r,l=""+e;return n!==null&&n.ref!==null&&typeof n.ref=="function"&&n.ref._stringRef===l?n.ref:(n=function(i){var o=u.refs;o===Nc&&(o=u.refs={}),i===null?delete o[l]:o[l]=i},n._stringRef=l,n)}if(typeof e!="string")throw Error(k(284));if(!t._owner)throw Error(k(290,e))}return e}function Hr(e,n){throw e=Object.prototype.toString.call(n),Error(k(31,e==="[object Object]"?"object with keys {"+Object.keys(n).join(", ")+"}":e))}function Ta(e){var n=e._init;return n(e._payload)}function Pc(e){function n(f,d){if(e){var g=f.deletions;g===null?(f.deletions=[d],f.flags|=16):g.push(d)}}function t(f,d){if(!e)return null;for(;d!==null;)n(f,d),d=d.sibling;return null}function r(f,d){for(f=new Map;d!==null;)d.key!==null?f.set(d.key,d):f.set(d.index,d),d=d.sibling;return f}function u(f,d){return f=Nn(f,d),f.index=0,f.sibling=null,f}function l(f,d,g){return f.index=g,e?(g=f.alternate,g!==null?(g=g.index,g<d?(f.flags|=2,d):g):(f.flags|=2,d)):(f.flags|=1048576,d)}function i(f){return e&&f.alternate===null&&(f.flags|=2),f}function o(f,d,g,E){return d===null||d.tag!==6?(d=bl(g,f.mode,E),d.return=f,d):(d=u(d,g),d.return=f,d)}function s(f,d,g,E){var C=g.type;return C===ot?h(f,d,g.props.children,E,g.key):d!==null&&(d.elementType===C||typeof C=="object"&&C!==null&&C.$$typeof===gn&&Ta(C)===d.type)?(E=u(d,g.props),E.ref=jt(f,d,g),E.return=f,E):(E=du(g.type,g.key,g.props,null,f.mode,E),E.ref=jt(f,d,g),E.return=f,E)}function c(f,d,g,E){return d===null||d.tag!==4||d.stateNode.containerInfo!==g.containerInfo||d.stateNode.implementation!==g.implementation?(d=Ol(g,f.mode,E),d.return=f,d):(d=u(d,g.children||[]),d.return=f,d)}function h(f,d,g,E,C){return d===null||d.tag!==7?(d=Yn(g,f.mode,E,C),d.return=f,d):(d=u(d,g),d.return=f,d)}function m(f,d,g){if(typeof d=="string"&&d!==""||typeof d=="number")return d=bl(""+d,f.mode,g),d.return=f,d;if(typeof d=="object"&&d!==null){switch(d.$$typeof){case Lr:return g=du(d.type,d.key,d.props,null,f.mode,g),g.ref=jt(f,null,d),g.return=f,g;case it:return d=Ol(d,f.mode,g),d.return=f,d;case gn:var E=d._init;return m(f,E(d._payload),g)}if(Ht(d)||zt(d))return d=Yn(d,f.mode,g,null),d.return=f,d;Hr(f,d)}return null}function p(f,d,g,E){var C=d!==null?d.key:null;if(typeof g=="string"&&g!==""||typeof g=="number")return C!==null?null:o(f,d,""+g,E);if(typeof g=="object"&&g!==null){switch(g.$$typeof){case Lr:return g.key===C?s(f,d,g,E):null;case it:return g.key===C?c(f,d,g,E):null;case gn:return C=g._init,p(f,d,C(g._payload),E)}if(Ht(g)||zt(g))return C!==null?null:h(f,d,g,E,null);Hr(f,g)}return null}function v(f,d,g,E,C){if(typeof E=="string"&&E!==""||typeof E=="number")return f=f.get(g)||null,o(d,f,""+E,C);if(typeof E=="object"&&E!==null){switch(E.$$typeof){case Lr:return f=f.get(E.key===null?g:E.key)||null,s(d,f,E,C);case it:return f=f.get(E.key===null?g:E.key)||null,c(d,f,E,C);case gn:var A=E._init;return v(f,d,g,A(E._payload),C)}if(Ht(E)||zt(E))return f=f.get(g)||null,h(d,f,E,C,null);Hr(d,E)}return null}function w(f,d,g,E){for(var C=null,A=null,S=d,x=d=0,N=null;S!==null&&x<g.length;x++){S.index>x?(N=S,S=null):N=S.sibling;var T=p(f,S,g[x],E);if(T===null){S===null&&(S=N);break}e&&S&&T.alternate===null&&n(f,S),d=l(T,d,x),A===null?C=T:A.sibling=T,A=T,S=N}if(x===g.length)return t(f,S),G&&Un(f,x),C;if(S===null){for(;x<g.length;x++)S=m(f,g[x],E),S!==null&&(d=l(S,d,x),A===null?C=S:A.sibling=S,A=S);return G&&Un(f,x),C}for(S=r(f,S);x<g.length;x++)N=v(S,f,x,g[x],E),N!==null&&(e&&N.alternate!==null&&S.delete(N.key===null?x:N.key),d=l(N,d,x),A===null?C=N:A.sibling=N,A=N);return e&&S.forEach(function(U){return n(f,U)}),G&&Un(f,x),C}function F(f,d,g,E){var C=zt(g);if(typeof C!="function")throw Error(k(150));if(g=C.call(g),g==null)throw Error(k(151));for(var A=C=null,S=d,x=d=0,N=null,T=g.next();S!==null&&!T.done;x++,T=g.next()){S.index>x?(N=S,S=null):N=S.sibling;var U=p(f,S,T.value,E);if(U===null){S===null&&(S=N);break}e&&S&&U.alternate===null&&n(f,S),d=l(U,d,x),A===null?C=U:A.sibling=U,A=U,S=N}if(T.done)return t(f,S),G&&Un(f,x),C;if(S===null){for(;!T.done;x++,T=g.next())T=m(f,T.value,E),T!==null&&(d=l(T,d,x),A===null?C=T:A.sibling=T,A=T);return G&&Un(f,x),C}for(S=r(f,S);!T.done;x++,T=g.next())T=v(S,f,x,T.value,E),T!==null&&(e&&T.alternate!==null&&S.delete(T.key===null?x:T.key),d=l(T,d,x),A===null?C=T:A.sibling=T,A=T);return e&&S.forEach(function(te){return n(f,te)}),G&&Un(f,x),C}function I(f,d,g,E){if(typeof g=="object"&&g!==null&&g.type===ot&&g.key===null&&(g=g.props.children),typeof g=="object"&&g!==null){switch(g.$$typeof){case Lr:e:{for(var C=g.key,A=d;A!==null;){if(A.key===C){if(C=g.type,C===ot){if(A.tag===7){t(f,A.sibling),d=u(A,g.props.children),d.return=f,f=d;break e}}else if(A.elementType===C||typeof C=="object"&&C!==null&&C.$$typeof===gn&&Ta(C)===A.type){t(f,A.sibling),d=u(A,g.props),d.ref=jt(f,A,g),d.return=f,f=d;break e}t(f,A);break}else n(f,A);A=A.sibling}g.type===ot?(d=Yn(g.props.children,f.mode,E,g.key),d.return=f,f=d):(E=du(g.type,g.key,g.props,null,f.mode,E),E.ref=jt(f,d,g),E.return=f,f=E)}return i(f);case it:e:{for(A=g.key;d!==null;){if(d.key===A)if(d.tag===4&&d.stateNode.containerInfo===g.containerInfo&&d.stateNode.implementation===g.implementation){t(f,d.sibling),d=u(d,g.children||[]),d.return=f,f=d;break e}else{t(f,d);break}else n(f,d);d=d.sibling}d=Ol(g,f.mode,E),d.return=f,f=d}return i(f);case gn:return A=g._init,I(f,d,A(g._payload),E)}if(Ht(g))return w(f,d,g,E);if(zt(g))return F(f,d,g,E);Hr(f,g)}return typeof g=="string"&&g!==""||typeof g=="number"?(g=""+g,d!==null&&d.tag===6?(t(f,d.sibling),d=u(d,g),d.return=f,f=d):(t(f,d),d=bl(g,f.mode,E),d.return=f,f=d),i(f)):t(f,d)}return I}var Bt=Pc(!0),Tc=Pc(!1),Dr={},Xe=bn(Dr),yr=bn(Dr),vr=bn(Dr);function Qn(e){if(e===Dr)throw Error(k(174));return e}function go(e,n){switch(V(vr,n),V(yr,e),V(Xe,Dr),e=n.nodeType,e){case 9:case 11:n=(n=n.documentElement)?n.namespaceURI:Xl(null,"");break;default:e=e===8?n.parentNode:n,n=e.namespaceURI||null,e=e.tagName,n=Xl(n,e)}Q(Xe),V(Xe,n)}function Dt(){Q(Xe),Q(yr),Q(vr)}function Ic(e){Qn(vr.current);var n=Qn(Xe.current),t=Xl(n,e.type);n!==t&&(V(yr,e),V(Xe,t))}function yo(e){yr.current===e&&(Q(Xe),Q(yr))}var K=bn(0);function Nu(e){for(var n=e;n!==null;){if(n.tag===13){var t=n.memoizedState;if(t!==null&&(t=t.dehydrated,t===null||t.data==="$?"||t.data==="$!"))return n}else if(n.tag===19&&n.memoizedProps.revealOrder!==void 0){if((n.flags&128)!==0)return n}else if(n.child!==null){n.child.return=n,n=n.child;continue}if(n===e)break;for(;n.sibling===null;){if(n.return===null||n.return===e)return null;n=n.return}n.sibling.return=n.return,n=n.sibling}return null}var Pl=[];function vo(){for(var e=0;e<Pl.length;e++)Pl[e]._workInProgressVersionPrimary=null;Pl.length=0}var iu=pn.ReactCurrentDispatcher,Tl=pn.ReactCurrentBatchConfig,qn=0,Y=null,re=null,ie=null,_u=!1,er=!1,Er=0,Hf=0;function de(){throw Error(k(321))}function Eo(e,n){if(n===null)return!1;for(var t=0;t<n.length&&t<e.length;t++)if(!Qe(e[t],n[t]))return!1;return!0}function xo(e,n,t,r,u,l){if(qn=l,Y=n,n.memoizedState=null,n.updateQueue=null,n.lanes=0,iu.current=e===null||e.memoizedState===null?Yf:Jf,e=t(r,u),er){l=0;do{if(er=!1,Er=0,25<=l)throw Error(k(301));l+=1,ie=re=null,n.updateQueue=null,iu.current=Zf,e=t(r,u)}while(er)}if(iu.current=Pu,n=re!==null&&re.next!==null,qn=0,ie=re=Y=null,_u=!1,n)throw Error(k(300));return e}function Fo(){var e=Er!==0;return Er=0,e}function Je(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return ie===null?Y.memoizedState=ie=e:ie=ie.next=e,ie}function Me(){if(re===null){var e=Y.alternate;e=e!==null?e.memoizedState:null}else e=re.next;var n=ie===null?Y.memoizedState:ie.next;if(n!==null)ie=n,re=e;else{if(e===null)throw Error(k(310));re=e,e={memoizedState:re.memoizedState,baseState:re.baseState,baseQueue:re.baseQueue,queue:re.queue,next:null},ie===null?Y.memoizedState=ie=e:ie=ie.next=e}return ie}function xr(e,n){return typeof n=="function"?n(e):n}function Il(e){var n=Me(),t=n.queue;if(t===null)throw Error(k(311));t.lastRenderedReducer=e;var r=re,u=r.baseQueue,l=t.pending;if(l!==null){if(u!==null){var i=u.next;u.next=l.next,l.next=i}r.baseQueue=u=l,t.pending=null}if(u!==null){l=u.next,r=r.baseState;var o=i=null,s=null,c=l;do{var h=c.lane;if((qn&h)===h)s!==null&&(s=s.next={lane:0,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null}),r=c.hasEagerState?c.eagerState:e(r,c.action);else{var m={lane:h,action:c.action,hasEagerState:c.hasEagerState,eagerState:c.eagerState,next:null};s===null?(o=s=m,i=r):s=s.next=m,Y.lanes|=h,Xn|=h}c=c.next}while(c!==null&&c!==l);s===null?i=r:s.next=o,Qe(r,n.memoizedState)||(ke=!0),n.memoizedState=r,n.baseState=i,n.baseQueue=s,t.lastRenderedState=r}if(e=t.interleaved,e!==null){u=e;do l=u.lane,Y.lanes|=l,Xn|=l,u=u.next;while(u!==e)}else u===null&&(t.lanes=0);return[n.memoizedState,t.dispatch]}function Ll(e){var n=Me(),t=n.queue;if(t===null)throw Error(k(311));t.lastRenderedReducer=e;var r=t.dispatch,u=t.pending,l=n.memoizedState;if(u!==null){t.pending=null;var i=u=u.next;do l=e(l,i.action),i=i.next;while(i!==u);Qe(l,n.memoizedState)||(ke=!0),n.memoizedState=l,n.baseQueue===null&&(n.baseState=l),t.lastRenderedState=l}return[l,r]}function Lc(){}function Rc(e,n){var t=Y,r=Me(),u=n(),l=!Qe(r.memoizedState,u);if(l&&(r.memoizedState=u,ke=!0),r=r.queue,wo(Oc.bind(null,t,r,e),[e]),r.getSnapshot!==n||l||ie!==null&&ie.memoizedState.tag&1){if(t.flags|=2048,Fr(9,bc.bind(null,t,r,u,n),void 0,null),oe===null)throw Error(k(349));(qn&30)!==0||zc(t,n,u)}return u}function zc(e,n,t){e.flags|=16384,e={getSnapshot:n,value:t},n=Y.updateQueue,n===null?(n={lastEffect:null,stores:null},Y.updateQueue=n,n.stores=[e]):(t=n.stores,t===null?n.stores=[e]:t.push(e))}function bc(e,n,t,r){n.value=t,n.getSnapshot=r,Mc(n)&&$c(e)}function Oc(e,n,t){return t(function(){Mc(n)&&$c(e)})}function Mc(e){var n=e.getSnapshot;e=e.value;try{var t=n();return!Qe(e,t)}catch{return!0}}function $c(e){var n=dn(e,1);n!==null&&He(n,e,1,-1)}function Ia(e){var n=Je();return typeof e=="function"&&(e=e()),n.memoizedState=n.baseState=e,e={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:xr,lastRenderedState:e},n.queue=e,e=e.dispatch=Kf.bind(null,Y,e),[n.memoizedState,e]}function Fr(e,n,t,r){return e={tag:e,create:n,destroy:t,deps:r,next:null},n=Y.updateQueue,n===null?(n={lastEffect:null,stores:null},Y.updateQueue=n,n.lastEffect=e.next=e):(t=n.lastEffect,t===null?n.lastEffect=e.next=e:(r=t.next,t.next=e,e.next=r,n.lastEffect=e)),e}function jc(){return Me().memoizedState}function ou(e,n,t,r){var u=Je();Y.flags|=e,u.memoizedState=Fr(1|n,t,void 0,r===void 0?null:r)}function Yu(e,n,t,r){var u=Me();r=r===void 0?null:r;var l=void 0;if(re!==null){var i=re.memoizedState;if(l=i.destroy,r!==null&&Eo(r,i.deps)){u.memoizedState=Fr(n,t,l,r);return}}Y.flags|=e,u.memoizedState=Fr(1|n,t,l,r)}function La(e,n){return ou(8390656,8,e,n)}function wo(e,n){return Yu(2048,8,e,n)}function Uc(e,n){return Yu(4,2,e,n)}function Wc(e,n){return Yu(4,4,e,n)}function Vc(e,n){if(typeof n=="function")return e=e(),n(e),function(){n(null)};if(n!=null)return e=e(),n.current=e,function(){n.current=null}}function Hc(e,n,t){return t=t!=null?t.concat([e]):null,Yu(4,4,Vc.bind(null,n,e),t)}function ko(){}function Qc(e,n){var t=Me();n=n===void 0?null:n;var r=t.memoizedState;return r!==null&&n!==null&&Eo(n,r[1])?r[0]:(t.memoizedState=[e,n],e)}function Gc(e,n){var t=Me();n=n===void 0?null:n;var r=t.memoizedState;return r!==null&&n!==null&&Eo(n,r[1])?r[0]:(e=e(),t.memoizedState=[e,n],e)}function Kc(e,n,t){return(qn&21)===0?(e.baseState&&(e.baseState=!1,ke=!0),e.memoizedState=t):(Qe(t,n)||(t=Zs(),Y.lanes|=t,Xn|=t,e.baseState=!0),n)}function Qf(e,n){var t=j;j=t!==0&&4>t?t:4,e(!0);var r=Tl.transition;Tl.transition={};try{e(!1),n()}finally{j=t,Tl.transition=r}}function Yc(){return Me().memoizedState}function Gf(e,n,t){var r=Dn(e);if(t={lane:r,action:t,hasEagerState:!1,eagerState:null,next:null},Jc(e))Zc(n,t);else if(t=Bc(e,n,t,r),t!==null){var u=ve();He(t,e,r,u),qc(t,n,r)}}function Kf(e,n,t){var r=Dn(e),u={lane:r,action:t,hasEagerState:!1,eagerState:null,next:null};if(Jc(e))Zc(n,u);else{var l=e.alternate;if(e.lanes===0&&(l===null||l.lanes===0)&&(l=n.lastRenderedReducer,l!==null))try{var i=n.lastRenderedState,o=l(i,t);if(u.hasEagerState=!0,u.eagerState=o,Qe(o,i)){var s=n.interleaved;s===null?(u.next=u,ho(n)):(u.next=s.next,s.next=u),n.interleaved=u;return}}catch{}finally{}t=Bc(e,n,u,r),t!==null&&(u=ve(),He(t,e,r,u),qc(t,n,r))}}function Jc(e){var n=e.alternate;return e===Y||n!==null&&n===Y}function Zc(e,n){er=_u=!0;var t=e.pending;t===null?n.next=n:(n.next=t.next,t.next=n),e.pending=n}function qc(e,n,t){if((t&4194240)!==0){var r=n.lanes;r&=e.pendingLanes,t|=r,n.lanes=t,Xi(e,t)}}var Pu={readContext:Oe,useCallback:de,useContext:de,useEffect:de,useImperativeHandle:de,useInsertionEffect:de,useLayoutEffect:de,useMemo:de,useReducer:de,useRef:de,useState:de,useDebugValue:de,useDeferredValue:de,useTransition:de,useMutableSource:de,useSyncExternalStore:de,useId:de,unstable_isNewReconciler:!1},Yf={readContext:Oe,useCallback:function(e,n){return Je().memoizedState=[e,n===void 0?null:n],e},useContext:Oe,useEffect:La,useImperativeHandle:function(e,n,t){return t=t!=null?t.concat([e]):null,ou(4194308,4,Vc.bind(null,n,e),t)},useLayoutEffect:function(e,n){return ou(4194308,4,e,n)},useInsertionEffect:function(e,n){return ou(4,2,e,n)},useMemo:function(e,n){var t=Je();return n=n===void 0?null:n,e=e(),t.memoizedState=[e,n],e},useReducer:function(e,n,t){var r=Je();return n=t!==void 0?t(n):n,r.memoizedState=r.baseState=n,e={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:n},r.queue=e,e=e.dispatch=Gf.bind(null,Y,e),[r.memoizedState,e]},useRef:function(e){var n=Je();return e={current:e},n.memoizedState=e},useState:Ia,useDebugValue:ko,useDeferredValue:function(e){return Je().memoizedState=e},useTransition:function(){var e=Ia(!1),n=e[0];return e=Qf.bind(null,e[1]),Je().memoizedState=e,[n,e]},useMutableSource:function(){},useSyncExternalStore:function(e,n,t){var r=Y,u=Je();if(G){if(t===void 0)throw Error(k(407));t=t()}else{if(t=n(),oe===null)throw Error(k(349));(qn&30)!==0||zc(r,n,t)}u.memoizedState=t;var l={value:t,getSnapshot:n};return u.queue=l,La(Oc.bind(null,r,l,e),[e]),r.flags|=2048,Fr(9,bc.bind(null,r,l,t,n),void 0,null),t},useId:function(){var e=Je(),n=oe.identifierPrefix;if(G){var t=ln,r=un;t=(r&~(1<<32-Ve(r)-1)).toString(32)+t,n=":"+n+"R"+t,t=Er++,0<t&&(n+="H"+t.toString(32)),n+=":"}else t=Hf++,n=":"+n+"r"+t.toString(32)+":";return e.memoizedState=n},unstable_isNewReconciler:!1},Jf={readContext:Oe,useCallback:Qc,useContext:Oe,useEffect:wo,useImperativeHandle:Hc,useInsertionEffect:Uc,useLayoutEffect:Wc,useMemo:Gc,useReducer:Il,useRef:jc,useState:function(){return Il(xr)},useDebugValue:ko,useDeferredValue:function(e){var n=Me();return Kc(n,re.memoizedState,e)},useTransition:function(){var e=Il(xr)[0],n=Me().memoizedState;return[e,n]},useMutableSource:Lc,useSyncExternalStore:Rc,useId:Yc,unstable_isNewReconciler:!1},Zf={readContext:Oe,useCallback:Qc,useContext:Oe,useEffect:wo,useImperativeHandle:Hc,useInsertionEffect:Uc,useLayoutEffect:Wc,useMemo:Gc,useReducer:Ll,useRef:jc,useState:function(){return Ll(xr)},useDebugValue:ko,useDeferredValue:function(e){var n=Me();return re===null?n.memoizedState=e:Kc(n,re.memoizedState,e)},useTransition:function(){var e=Ll(xr)[0],n=Me().memoizedState;return[e,n]},useMutableSource:Lc,useSyncExternalStore:Rc,useId:Yc,unstable_isNewReconciler:!1};function Nt(e,n){try{var t="",r=n;do t+=C0(r),r=r.return;while(r);var u=t}catch(l){u=`
Error generating stack: `+l.message+`
`+l.stack}return{value:e,source:n,stack:u,digest:null}}function Rl(e,n,t){return{value:e,source:null,stack:t!=null?t:null,digest:n!=null?n:null}}function wi(e,n){try{console.error(n.value)}catch(t){setTimeout(function(){throw t})}}var qf=typeof WeakMap=="function"?WeakMap:Map;function Xc(e,n,t){t=an(-1,t),t.tag=3,t.payload={element:null};var r=n.value;return t.callback=function(){Iu||(Iu=!0,Ti=r),wi(e,n)},t}function ed(e,n,t){t=an(-1,t),t.tag=3;var r=e.type.getDerivedStateFromError;if(typeof r=="function"){var u=n.value;t.payload=function(){return r(u)},t.callback=function(){wi(e,n)}}var l=e.stateNode;return l!==null&&typeof l.componentDidCatch=="function"&&(t.callback=function(){wi(e,n),typeof r!="function"&&(Bn===null?Bn=new Set([this]):Bn.add(this));var i=n.stack;this.componentDidCatch(n.value,{componentStack:i!==null?i:""})}),t}function Ra(e,n,t){var r=e.pingCache;if(r===null){r=e.pingCache=new qf;var u=new Set;r.set(n,u)}else u=r.get(n),u===void 0&&(u=new Set,r.set(n,u));u.has(t)||(u.add(t),e=fp.bind(null,e,n,t),n.then(e,e))}function za(e){do{var n;if((n=e.tag===13)&&(n=e.memoizedState,n=n!==null?n.dehydrated!==null:!0),n)return e;e=e.return}while(e!==null);return null}function ba(e,n,t,r,u){return(e.mode&1)===0?(e===n?e.flags|=65536:(e.flags|=128,t.flags|=131072,t.flags&=-52805,t.tag===1&&(t.alternate===null?t.tag=17:(n=an(-1,1),n.tag=2,Sn(t,n,1))),t.lanes|=1),e):(e.flags|=65536,e.lanes=u,e)}var Xf=pn.ReactCurrentOwner,ke=!1;function ye(e,n,t,r){n.child=e===null?Tc(n,null,t,r):Bt(n,e.child,t,r)}function Oa(e,n,t,r,u){t=t.render;var l=n.ref;return wt(n,u),r=xo(e,n,t,r,l,u),t=Fo(),e!==null&&!ke?(n.updateQueue=e.updateQueue,n.flags&=-2053,e.lanes&=~u,fn(e,n,u)):(G&&t&&oo(n),n.flags|=1,ye(e,n,r,u),n.child)}function Ma(e,n,t,r,u){if(e===null){var l=t.type;return typeof l=="function"&&!Po(l)&&l.defaultProps===void 0&&t.compare===null&&t.defaultProps===void 0?(n.tag=15,n.type=l,nd(e,n,l,r,u)):(e=du(t.type,null,r,n,n.mode,u),e.ref=n.ref,e.return=n,n.child=e)}if(l=e.child,(e.lanes&u)===0){var i=l.memoizedProps;if(t=t.compare,t=t!==null?t:pr,t(i,r)&&e.ref===n.ref)return fn(e,n,u)}return n.flags|=1,e=Nn(l,r),e.ref=n.ref,e.return=n,n.child=e}function nd(e,n,t,r,u){if(e!==null){var l=e.memoizedProps;if(pr(l,r)&&e.ref===n.ref)if(ke=!1,n.pendingProps=r=l,(e.lanes&u)!==0)(e.flags&131072)!==0&&(ke=!0);else return n.lanes=e.lanes,fn(e,n,u)}return ki(e,n,t,r,u)}function td(e,n,t){var r=n.pendingProps,u=r.children,l=e!==null?e.memoizedState:null;if(r.mode==="hidden")if((n.mode&1)===0)n.memoizedState={baseLanes:0,cachePool:null,transitions:null},V(yt,Be),Be|=t;else{if((t&1073741824)===0)return e=l!==null?l.baseLanes|t:t,n.lanes=n.childLanes=1073741824,n.memoizedState={baseLanes:e,cachePool:null,transitions:null},n.updateQueue=null,V(yt,Be),Be|=e,null;n.memoizedState={baseLanes:0,cachePool:null,transitions:null},r=l!==null?l.baseLanes:t,V(yt,Be),Be|=r}else l!==null?(r=l.baseLanes|t,n.memoizedState=null):r=t,V(yt,Be),Be|=r;return ye(e,n,u,t),n.child}function rd(e,n){var t=n.ref;(e===null&&t!==null||e!==null&&e.ref!==t)&&(n.flags|=512,n.flags|=2097152)}function ki(e,n,t,r,u){var l=Ae(t)?Jn:me.current;return l=At(n,l),wt(n,u),t=xo(e,n,t,r,l,u),r=Fo(),e!==null&&!ke?(n.updateQueue=e.updateQueue,n.flags&=-2053,e.lanes&=~u,fn(e,n,u)):(G&&r&&oo(n),n.flags|=1,ye(e,n,t,u),n.child)}function $a(e,n,t,r,u){if(Ae(t)){var l=!0;ku(n)}else l=!1;if(wt(n,u),n.stateNode===null)au(e,n),_c(n,t,r),Fi(n,t,r,u),r=!0;else if(e===null){var i=n.stateNode,o=n.memoizedProps;i.props=o;var s=i.context,c=t.contextType;typeof c=="object"&&c!==null?c=Oe(c):(c=Ae(t)?Jn:me.current,c=At(n,c));var h=t.getDerivedStateFromProps,m=typeof h=="function"||typeof i.getSnapshotBeforeUpdate=="function";m||typeof i.UNSAFE_componentWillReceiveProps!="function"&&typeof i.componentWillReceiveProps!="function"||(o!==r||s!==c)&&Pa(n,i,r,c),yn=!1;var p=n.memoizedState;i.state=p,Du(n,r,i,u),s=n.memoizedState,o!==r||p!==s||Ce.current||yn?(typeof h=="function"&&(xi(n,t,h,r),s=n.memoizedState),(o=yn||_a(n,t,o,r,p,s,c))?(m||typeof i.UNSAFE_componentWillMount!="function"&&typeof i.componentWillMount!="function"||(typeof i.componentWillMount=="function"&&i.componentWillMount(),typeof i.UNSAFE_componentWillMount=="function"&&i.UNSAFE_componentWillMount()),typeof i.componentDidMount=="function"&&(n.flags|=4194308)):(typeof i.componentDidMount=="function"&&(n.flags|=4194308),n.memoizedProps=r,n.memoizedState=s),i.props=r,i.state=s,i.context=c,r=o):(typeof i.componentDidMount=="function"&&(n.flags|=4194308),r=!1)}else{i=n.stateNode,Dc(e,n),o=n.memoizedProps,c=n.type===n.elementType?o:je(n.type,o),i.props=c,m=n.pendingProps,p=i.context,s=t.contextType,typeof s=="object"&&s!==null?s=Oe(s):(s=Ae(t)?Jn:me.current,s=At(n,s));var v=t.getDerivedStateFromProps;(h=typeof v=="function"||typeof i.getSnapshotBeforeUpdate=="function")||typeof i.UNSAFE_componentWillReceiveProps!="function"&&typeof i.componentWillReceiveProps!="function"||(o!==m||p!==s)&&Pa(n,i,r,s),yn=!1,p=n.memoizedState,i.state=p,Du(n,r,i,u);var w=n.memoizedState;o!==m||p!==w||Ce.current||yn?(typeof v=="function"&&(xi(n,t,v,r),w=n.memoizedState),(c=yn||_a(n,t,c,r,p,w,s)||!1)?(h||typeof i.UNSAFE_componentWillUpdate!="function"&&typeof i.componentWillUpdate!="function"||(typeof i.componentWillUpdate=="function"&&i.componentWillUpdate(r,w,s),typeof i.UNSAFE_componentWillUpdate=="function"&&i.UNSAFE_componentWillUpdate(r,w,s)),typeof i.componentDidUpdate=="function"&&(n.flags|=4),typeof i.getSnapshotBeforeUpdate=="function"&&(n.flags|=1024)):(typeof i.componentDidUpdate!="function"||o===e.memoizedProps&&p===e.memoizedState||(n.flags|=4),typeof i.getSnapshotBeforeUpdate!="function"||o===e.memoizedProps&&p===e.memoizedState||(n.flags|=1024),n.memoizedProps=r,n.memoizedState=w),i.props=r,i.state=w,i.context=s,r=c):(typeof i.componentDidUpdate!="function"||o===e.memoizedProps&&p===e.memoizedState||(n.flags|=4),typeof i.getSnapshotBeforeUpdate!="function"||o===e.memoizedProps&&p===e.memoizedState||(n.flags|=1024),r=!1)}return Ci(e,n,t,r,l,u)}function Ci(e,n,t,r,u,l){rd(e,n);var i=(n.flags&128)!==0;if(!r&&!i)return u&&Aa(n,t,!1),fn(e,n,l);r=n.stateNode,Xf.current=n;var o=i&&typeof t.getDerivedStateFromError!="function"?null:r.render();return n.flags|=1,e!==null&&i?(n.child=Bt(n,e.child,null,l),n.child=Bt(n,null,o,l)):ye(e,n,o,l),n.memoizedState=r.state,u&&Aa(n,t,!0),n.child}function ud(e){var n=e.stateNode;n.pendingContext?Ca(e,n.pendingContext,n.pendingContext!==n.context):n.context&&Ca(e,n.context,!1),go(e,n.containerInfo)}function ja(e,n,t,r,u){return St(),so(u),n.flags|=256,ye(e,n,t,r),n.child}var Ai={dehydrated:null,treeContext:null,retryLane:0};function Si(e){return{baseLanes:e,cachePool:null,transitions:null}}function ld(e,n,t){var r=n.pendingProps,u=K.current,l=!1,i=(n.flags&128)!==0,o;if((o=i)||(o=e!==null&&e.memoizedState===null?!1:(u&2)!==0),o?(l=!0,n.flags&=-129):(e===null||e.memoizedState!==null)&&(u|=1),V(K,u&1),e===null)return vi(n),e=n.memoizedState,e!==null&&(e=e.dehydrated,e!==null)?((n.mode&1)===0?n.lanes=1:e.data==="$!"?n.lanes=8:n.lanes=1073741824,null):(i=r.children,e=r.fallback,l?(r=n.mode,l=n.child,i={mode:"hidden",children:i},(r&1)===0&&l!==null?(l.childLanes=0,l.pendingProps=i):l=qu(i,r,0,null),e=Yn(e,r,t,null),l.return=n,e.return=n,l.sibling=e,n.child=l,n.child.memoizedState=Si(t),n.memoizedState=Ai,e):Co(n,i));if(u=e.memoizedState,u!==null&&(o=u.dehydrated,o!==null))return ep(e,n,i,r,o,u,t);if(l){l=r.fallback,i=n.mode,u=e.child,o=u.sibling;var s={mode:"hidden",children:r.children};return(i&1)===0&&n.child!==u?(r=n.child,r.childLanes=0,r.pendingProps=s,n.deletions=null):(r=Nn(u,s),r.subtreeFlags=u.subtreeFlags&14680064),o!==null?l=Nn(o,l):(l=Yn(l,i,t,null),l.flags|=2),l.return=n,r.return=n,r.sibling=l,n.child=r,r=l,l=n.child,i=e.child.memoizedState,i=i===null?Si(t):{baseLanes:i.baseLanes|t,cachePool:null,transitions:i.transitions},l.memoizedState=i,l.childLanes=e.childLanes&~t,n.memoizedState=Ai,r}return l=e.child,e=l.sibling,r=Nn(l,{mode:"visible",children:r.children}),(n.mode&1)===0&&(r.lanes=t),r.return=n,r.sibling=null,e!==null&&(t=n.deletions,t===null?(n.deletions=[e],n.flags|=16):t.push(e)),n.child=r,n.memoizedState=null,r}function Co(e,n){return n=qu({mode:"visible",children:n},e.mode,0,null),n.return=e,e.child=n}function Qr(e,n,t,r){return r!==null&&so(r),Bt(n,e.child,null,t),e=Co(n,n.pendingProps.children),e.flags|=2,n.memoizedState=null,e}function ep(e,n,t,r,u,l,i){if(t)return n.flags&256?(n.flags&=-257,r=Rl(Error(k(422))),Qr(e,n,i,r)):n.memoizedState!==null?(n.child=e.child,n.flags|=128,null):(l=r.fallback,u=n.mode,r=qu({mode:"visible",children:r.children},u,0,null),l=Yn(l,u,i,null),l.flags|=2,r.return=n,l.return=n,r.sibling=l,n.child=r,(n.mode&1)!==0&&Bt(n,e.child,null,i),n.child.memoizedState=Si(i),n.memoizedState=Ai,l);if((n.mode&1)===0)return Qr(e,n,i,null);if(u.data==="$!"){if(r=u.nextSibling&&u.nextSibling.dataset,r)var o=r.dgst;return r=o,l=Error(k(419)),r=Rl(l,r,void 0),Qr(e,n,i,r)}if(o=(i&e.childLanes)!==0,ke||o){if(r=oe,r!==null){switch(i&-i){case 4:u=2;break;case 16:u=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:u=32;break;case 536870912:u=268435456;break;default:u=0}u=(u&(r.suspendedLanes|i))!==0?0:u,u!==0&&u!==l.retryLane&&(l.retryLane=u,dn(e,u),He(r,e,u,-1))}return _o(),r=Rl(Error(k(421))),Qr(e,n,i,r)}return u.data==="$?"?(n.flags|=128,n.child=e.child,n=pp.bind(null,e),u._reactRetry=n,null):(e=l.treeContext,De=An(u.nextSibling),Ne=n,G=!0,We=null,e!==null&&(Le[Re++]=un,Le[Re++]=ln,Le[Re++]=Zn,un=e.id,ln=e.overflow,Zn=n),n=Co(n,r.children),n.flags|=4096,n)}function Ua(e,n,t){e.lanes|=n;var r=e.alternate;r!==null&&(r.lanes|=n),Ei(e.return,n,t)}function zl(e,n,t,r,u){var l=e.memoizedState;l===null?e.memoizedState={isBackwards:n,rendering:null,renderingStartTime:0,last:r,tail:t,tailMode:u}:(l.isBackwards=n,l.rendering=null,l.renderingStartTime=0,l.last=r,l.tail=t,l.tailMode=u)}function id(e,n,t){var r=n.pendingProps,u=r.revealOrder,l=r.tail;if(ye(e,n,r.children,t),r=K.current,(r&2)!==0)r=r&1|2,n.flags|=128;else{if(e!==null&&(e.flags&128)!==0)e:for(e=n.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&Ua(e,t,n);else if(e.tag===19)Ua(e,t,n);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===n)break e;for(;e.sibling===null;){if(e.return===null||e.return===n)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}r&=1}if(V(K,r),(n.mode&1)===0)n.memoizedState=null;else switch(u){case"forwards":for(t=n.child,u=null;t!==null;)e=t.alternate,e!==null&&Nu(e)===null&&(u=t),t=t.sibling;t=u,t===null?(u=n.child,n.child=null):(u=t.sibling,t.sibling=null),zl(n,!1,u,t,l);break;case"backwards":for(t=null,u=n.child,n.child=null;u!==null;){if(e=u.alternate,e!==null&&Nu(e)===null){n.child=u;break}e=u.sibling,u.sibling=t,t=u,u=e}zl(n,!0,t,null,l);break;case"together":zl(n,!1,null,null,void 0);break;default:n.memoizedState=null}return n.child}function au(e,n){(n.mode&1)===0&&e!==null&&(e.alternate=null,n.alternate=null,n.flags|=2)}function fn(e,n,t){if(e!==null&&(n.dependencies=e.dependencies),Xn|=n.lanes,(t&n.childLanes)===0)return null;if(e!==null&&n.child!==e.child)throw Error(k(153));if(n.child!==null){for(e=n.child,t=Nn(e,e.pendingProps),n.child=t,t.return=n;e.sibling!==null;)e=e.sibling,t=t.sibling=Nn(e,e.pendingProps),t.return=n;t.sibling=null}return n.child}function np(e,n,t){switch(n.tag){case 3:ud(n),St();break;case 5:Ic(n);break;case 1:Ae(n.type)&&ku(n);break;case 4:go(n,n.stateNode.containerInfo);break;case 10:var r=n.type._context,u=n.memoizedProps.value;V(Su,r._currentValue),r._currentValue=u;break;case 13:if(r=n.memoizedState,r!==null)return r.dehydrated!==null?(V(K,K.current&1),n.flags|=128,null):(t&n.child.childLanes)!==0?ld(e,n,t):(V(K,K.current&1),e=fn(e,n,t),e!==null?e.sibling:null);V(K,K.current&1);break;case 19:if(r=(t&n.childLanes)!==0,(e.flags&128)!==0){if(r)return id(e,n,t);n.flags|=128}if(u=n.memoizedState,u!==null&&(u.rendering=null,u.tail=null,u.lastEffect=null),V(K,K.current),r)break;return null;case 22:case 23:return n.lanes=0,td(e,n,t)}return fn(e,n,t)}var od,Bi,ad,sd;od=function(e,n){for(var t=n.child;t!==null;){if(t.tag===5||t.tag===6)e.appendChild(t.stateNode);else if(t.tag!==4&&t.child!==null){t.child.return=t,t=t.child;continue}if(t===n)break;for(;t.sibling===null;){if(t.return===null||t.return===n)return;t=t.return}t.sibling.return=t.return,t=t.sibling}};Bi=function(){};ad=function(e,n,t,r){var u=e.memoizedProps;if(u!==r){e=n.stateNode,Qn(Xe.current);var l=null;switch(t){case"input":u=Yl(e,u),r=Yl(e,r),l=[];break;case"select":u=J({},u,{value:void 0}),r=J({},r,{value:void 0}),l=[];break;case"textarea":u=ql(e,u),r=ql(e,r),l=[];break;default:typeof u.onClick!="function"&&typeof r.onClick=="function"&&(e.onclick=Fu)}ei(t,r);var i;t=null;for(c in u)if(!r.hasOwnProperty(c)&&u.hasOwnProperty(c)&&u[c]!=null)if(c==="style"){var o=u[c];for(i in o)o.hasOwnProperty(i)&&(t||(t={}),t[i]="")}else c!=="dangerouslySetInnerHTML"&&c!=="children"&&c!=="suppressContentEditableWarning"&&c!=="suppressHydrationWarning"&&c!=="autoFocus"&&(ir.hasOwnProperty(c)?l||(l=[]):(l=l||[]).push(c,null));for(c in r){var s=r[c];if(o=u!=null?u[c]:void 0,r.hasOwnProperty(c)&&s!==o&&(s!=null||o!=null))if(c==="style")if(o){for(i in o)!o.hasOwnProperty(i)||s&&s.hasOwnProperty(i)||(t||(t={}),t[i]="");for(i in s)s.hasOwnProperty(i)&&o[i]!==s[i]&&(t||(t={}),t[i]=s[i])}else t||(l||(l=[]),l.push(c,t)),t=s;else c==="dangerouslySetInnerHTML"?(s=s?s.__html:void 0,o=o?o.__html:void 0,s!=null&&o!==s&&(l=l||[]).push(c,s)):c==="children"?typeof s!="string"&&typeof s!="number"||(l=l||[]).push(c,""+s):c!=="suppressContentEditableWarning"&&c!=="suppressHydrationWarning"&&(ir.hasOwnProperty(c)?(s!=null&&c==="onScroll"&&H("scroll",e),l||o===s||(l=[])):(l=l||[]).push(c,s))}t&&(l=l||[]).push("style",t);var c=l;(n.updateQueue=c)&&(n.flags|=4)}};sd=function(e,n,t,r){t!==r&&(n.flags|=4)};function Ut(e,n){if(!G)switch(e.tailMode){case"hidden":n=e.tail;for(var t=null;n!==null;)n.alternate!==null&&(t=n),n=n.sibling;t===null?e.tail=null:t.sibling=null;break;case"collapsed":t=e.tail;for(var r=null;t!==null;)t.alternate!==null&&(r=t),t=t.sibling;r===null?n||e.tail===null?e.tail=null:e.tail.sibling=null:r.sibling=null}}function fe(e){var n=e.alternate!==null&&e.alternate.child===e.child,t=0,r=0;if(n)for(var u=e.child;u!==null;)t|=u.lanes|u.childLanes,r|=u.subtreeFlags&14680064,r|=u.flags&14680064,u.return=e,u=u.sibling;else for(u=e.child;u!==null;)t|=u.lanes|u.childLanes,r|=u.subtreeFlags,r|=u.flags,u.return=e,u=u.sibling;return e.subtreeFlags|=r,e.childLanes=t,n}function tp(e,n,t){var r=n.pendingProps;switch(ao(n),n.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return fe(n),null;case 1:return Ae(n.type)&&wu(),fe(n),null;case 3:return r=n.stateNode,Dt(),Q(Ce),Q(me),vo(),r.pendingContext&&(r.context=r.pendingContext,r.pendingContext=null),(e===null||e.child===null)&&(Vr(n)?n.flags|=4:e===null||e.memoizedState.isDehydrated&&(n.flags&256)===0||(n.flags|=1024,We!==null&&(Ri(We),We=null))),Bi(e,n),fe(n),null;case 5:yo(n);var u=Qn(vr.current);if(t=n.type,e!==null&&n.stateNode!=null)ad(e,n,t,r,u),e.ref!==n.ref&&(n.flags|=512,n.flags|=2097152);else{if(!r){if(n.stateNode===null)throw Error(k(166));return fe(n),null}if(e=Qn(Xe.current),Vr(n)){r=n.stateNode,t=n.type;var l=n.memoizedProps;switch(r[Ze]=n,r[gr]=l,e=(n.mode&1)!==0,t){case"dialog":H("cancel",r),H("close",r);break;case"iframe":case"object":case"embed":H("load",r);break;case"video":case"audio":for(u=0;u<Gt.length;u++)H(Gt[u],r);break;case"source":H("error",r);break;case"img":case"image":case"link":H("error",r),H("load",r);break;case"details":H("toggle",r);break;case"input":Zo(r,l),H("invalid",r);break;case"select":r._wrapperState={wasMultiple:!!l.multiple},H("invalid",r);break;case"textarea":Xo(r,l),H("invalid",r)}ei(t,l),u=null;for(var i in l)if(l.hasOwnProperty(i)){var o=l[i];i==="children"?typeof o=="string"?r.textContent!==o&&(l.suppressHydrationWarning!==!0&&Wr(r.textContent,o,e),u=["children",o]):typeof o=="number"&&r.textContent!==""+o&&(l.suppressHydrationWarning!==!0&&Wr(r.textContent,o,e),u=["children",""+o]):ir.hasOwnProperty(i)&&o!=null&&i==="onScroll"&&H("scroll",r)}switch(t){case"input":Rr(r),qo(r,l,!0);break;case"textarea":Rr(r),ea(r);break;case"select":case"option":break;default:typeof l.onClick=="function"&&(r.onclick=Fu)}r=u,n.updateQueue=r,r!==null&&(n.flags|=4)}else{i=u.nodeType===9?u:u.ownerDocument,e==="http://www.w3.org/1999/xhtml"&&(e=zs(t)),e==="http://www.w3.org/1999/xhtml"?t==="script"?(e=i.createElement("div"),e.innerHTML="<script><\/script>",e=e.removeChild(e.firstChild)):typeof r.is=="string"?e=i.createElement(t,{is:r.is}):(e=i.createElement(t),t==="select"&&(i=e,r.multiple?i.multiple=!0:r.size&&(i.size=r.size))):e=i.createElementNS(e,t),e[Ze]=n,e[gr]=r,od(e,n,!1,!1),n.stateNode=e;e:{switch(i=ni(t,r),t){case"dialog":H("cancel",e),H("close",e),u=r;break;case"iframe":case"object":case"embed":H("load",e),u=r;break;case"video":case"audio":for(u=0;u<Gt.length;u++)H(Gt[u],e);u=r;break;case"source":H("error",e),u=r;break;case"img":case"image":case"link":H("error",e),H("load",e),u=r;break;case"details":H("toggle",e),u=r;break;case"input":Zo(e,r),u=Yl(e,r),H("invalid",e);break;case"option":u=r;break;case"select":e._wrapperState={wasMultiple:!!r.multiple},u=J({},r,{value:void 0}),H("invalid",e);break;case"textarea":Xo(e,r),u=ql(e,r),H("invalid",e);break;default:u=r}ei(t,u),o=u;for(l in o)if(o.hasOwnProperty(l)){var s=o[l];l==="style"?Ms(e,s):l==="dangerouslySetInnerHTML"?(s=s?s.__html:void 0,s!=null&&bs(e,s)):l==="children"?typeof s=="string"?(t!=="textarea"||s!=="")&&or(e,s):typeof s=="number"&&or(e,""+s):l!=="suppressContentEditableWarning"&&l!=="suppressHydrationWarning"&&l!=="autoFocus"&&(ir.hasOwnProperty(l)?s!=null&&l==="onScroll"&&H("scroll",e):s!=null&&Gi(e,l,s,i))}switch(t){case"input":Rr(e),qo(e,r,!1);break;case"textarea":Rr(e),ea(e);break;case"option":r.value!=null&&e.setAttribute("value",""+Pn(r.value));break;case"select":e.multiple=!!r.multiple,l=r.value,l!=null?vt(e,!!r.multiple,l,!1):r.defaultValue!=null&&vt(e,!!r.multiple,r.defaultValue,!0);break;default:typeof u.onClick=="function"&&(e.onclick=Fu)}switch(t){case"button":case"input":case"select":case"textarea":r=!!r.autoFocus;break e;case"img":r=!0;break e;default:r=!1}}r&&(n.flags|=4)}n.ref!==null&&(n.flags|=512,n.flags|=2097152)}return fe(n),null;case 6:if(e&&n.stateNode!=null)sd(e,n,e.memoizedProps,r);else{if(typeof r!="string"&&n.stateNode===null)throw Error(k(166));if(t=Qn(vr.current),Qn(Xe.current),Vr(n)){if(r=n.stateNode,t=n.memoizedProps,r[Ze]=n,(l=r.nodeValue!==t)&&(e=Ne,e!==null))switch(e.tag){case 3:Wr(r.nodeValue,t,(e.mode&1)!==0);break;case 5:e.memoizedProps.suppressHydrationWarning!==!0&&Wr(r.nodeValue,t,(e.mode&1)!==0)}l&&(n.flags|=4)}else r=(t.nodeType===9?t:t.ownerDocument).createTextNode(r),r[Ze]=n,n.stateNode=r}return fe(n),null;case 13:if(Q(K),r=n.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(G&&De!==null&&(n.mode&1)!==0&&(n.flags&128)===0)Sc(),St(),n.flags|=98560,l=!1;else if(l=Vr(n),r!==null&&r.dehydrated!==null){if(e===null){if(!l)throw Error(k(318));if(l=n.memoizedState,l=l!==null?l.dehydrated:null,!l)throw Error(k(317));l[Ze]=n}else St(),(n.flags&128)===0&&(n.memoizedState=null),n.flags|=4;fe(n),l=!1}else We!==null&&(Ri(We),We=null),l=!0;if(!l)return n.flags&65536?n:null}return(n.flags&128)!==0?(n.lanes=t,n):(r=r!==null,r!==(e!==null&&e.memoizedState!==null)&&r&&(n.child.flags|=8192,(n.mode&1)!==0&&(e===null||(K.current&1)!==0?ue===0&&(ue=3):_o())),n.updateQueue!==null&&(n.flags|=4),fe(n),null);case 4:return Dt(),Bi(e,n),e===null&&hr(n.stateNode.containerInfo),fe(n),null;case 10:return po(n.type._context),fe(n),null;case 17:return Ae(n.type)&&wu(),fe(n),null;case 19:if(Q(K),l=n.memoizedState,l===null)return fe(n),null;if(r=(n.flags&128)!==0,i=l.rendering,i===null)if(r)Ut(l,!1);else{if(ue!==0||e!==null&&(e.flags&128)!==0)for(e=n.child;e!==null;){if(i=Nu(e),i!==null){for(n.flags|=128,Ut(l,!1),r=i.updateQueue,r!==null&&(n.updateQueue=r,n.flags|=4),n.subtreeFlags=0,r=t,t=n.child;t!==null;)l=t,e=r,l.flags&=14680066,i=l.alternate,i===null?(l.childLanes=0,l.lanes=e,l.child=null,l.subtreeFlags=0,l.memoizedProps=null,l.memoizedState=null,l.updateQueue=null,l.dependencies=null,l.stateNode=null):(l.childLanes=i.childLanes,l.lanes=i.lanes,l.child=i.child,l.subtreeFlags=0,l.deletions=null,l.memoizedProps=i.memoizedProps,l.memoizedState=i.memoizedState,l.updateQueue=i.updateQueue,l.type=i.type,e=i.dependencies,l.dependencies=e===null?null:{lanes:e.lanes,firstContext:e.firstContext}),t=t.sibling;return V(K,K.current&1|2),n.child}e=e.sibling}l.tail!==null&&ee()>_t&&(n.flags|=128,r=!0,Ut(l,!1),n.lanes=4194304)}else{if(!r)if(e=Nu(i),e!==null){if(n.flags|=128,r=!0,t=e.updateQueue,t!==null&&(n.updateQueue=t,n.flags|=4),Ut(l,!0),l.tail===null&&l.tailMode==="hidden"&&!i.alternate&&!G)return fe(n),null}else 2*ee()-l.renderingStartTime>_t&&t!==1073741824&&(n.flags|=128,r=!0,Ut(l,!1),n.lanes=4194304);l.isBackwards?(i.sibling=n.child,n.child=i):(t=l.last,t!==null?t.sibling=i:n.child=i,l.last=i)}return l.tail!==null?(n=l.tail,l.rendering=n,l.tail=n.sibling,l.renderingStartTime=ee(),n.sibling=null,t=K.current,V(K,r?t&1|2:t&1),n):(fe(n),null);case 22:case 23:return No(),r=n.memoizedState!==null,e!==null&&e.memoizedState!==null!==r&&(n.flags|=8192),r&&(n.mode&1)!==0?(Be&1073741824)!==0&&(fe(n),n.subtreeFlags&6&&(n.flags|=8192)):fe(n),null;case 24:return null;case 25:return null}throw Error(k(156,n.tag))}function rp(e,n){switch(ao(n),n.tag){case 1:return Ae(n.type)&&wu(),e=n.flags,e&65536?(n.flags=e&-65537|128,n):null;case 3:return Dt(),Q(Ce),Q(me),vo(),e=n.flags,(e&65536)!==0&&(e&128)===0?(n.flags=e&-65537|128,n):null;case 5:return yo(n),null;case 13:if(Q(K),e=n.memoizedState,e!==null&&e.dehydrated!==null){if(n.alternate===null)throw Error(k(340));St()}return e=n.flags,e&65536?(n.flags=e&-65537|128,n):null;case 19:return Q(K),null;case 4:return Dt(),null;case 10:return po(n.type._context),null;case 22:case 23:return No(),null;case 24:return null;default:return null}}var Gr=!1,he=!1,up=typeof WeakSet=="function"?WeakSet:Set,B=null;function gt(e,n){var t=e.ref;if(t!==null)if(typeof t=="function")try{t(null)}catch(r){Z(e,n,r)}else t.current=null}function Di(e,n,t){try{t()}catch(r){Z(e,n,r)}}var Wa=!1;function lp(e,n){if(di=vu,e=pc(),io(e)){if("selectionStart"in e)var t={start:e.selectionStart,end:e.selectionEnd};else e:{t=(t=e.ownerDocument)&&t.defaultView||window;var r=t.getSelection&&t.getSelection();if(r&&r.rangeCount!==0){t=r.anchorNode;var u=r.anchorOffset,l=r.focusNode;r=r.focusOffset;try{t.nodeType,l.nodeType}catch{t=null;break e}var i=0,o=-1,s=-1,c=0,h=0,m=e,p=null;n:for(;;){for(var v;m!==t||u!==0&&m.nodeType!==3||(o=i+u),m!==l||r!==0&&m.nodeType!==3||(s=i+r),m.nodeType===3&&(i+=m.nodeValue.length),(v=m.firstChild)!==null;)p=m,m=v;for(;;){if(m===e)break n;if(p===t&&++c===u&&(o=i),p===l&&++h===r&&(s=i),(v=m.nextSibling)!==null)break;m=p,p=m.parentNode}m=v}t=o===-1||s===-1?null:{start:o,end:s}}else t=null}t=t||{start:0,end:0}}else t=null;for(fi={focusedElem:e,selectionRange:t},vu=!1,B=n;B!==null;)if(n=B,e=n.child,(n.subtreeFlags&1028)!==0&&e!==null)e.return=n,B=e;else for(;B!==null;){n=B;try{var w=n.alternate;if((n.flags&1024)!==0)switch(n.tag){case 0:case 11:case 15:break;case 1:if(w!==null){var F=w.memoizedProps,I=w.memoizedState,f=n.stateNode,d=f.getSnapshotBeforeUpdate(n.elementType===n.type?F:je(n.type,F),I);f.__reactInternalSnapshotBeforeUpdate=d}break;case 3:var g=n.stateNode.containerInfo;g.nodeType===1?g.textContent="":g.nodeType===9&&g.documentElement&&g.removeChild(g.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(k(163))}}catch(E){Z(n,n.return,E)}if(e=n.sibling,e!==null){e.return=n.return,B=e;break}B=n.return}return w=Wa,Wa=!1,w}function nr(e,n,t){var r=n.updateQueue;if(r=r!==null?r.lastEffect:null,r!==null){var u=r=r.next;do{if((u.tag&e)===e){var l=u.destroy;u.destroy=void 0,l!==void 0&&Di(n,t,l)}u=u.next}while(u!==r)}}function Ju(e,n){if(n=n.updateQueue,n=n!==null?n.lastEffect:null,n!==null){var t=n=n.next;do{if((t.tag&e)===e){var r=t.create;t.destroy=r()}t=t.next}while(t!==n)}}function Ni(e){var n=e.ref;if(n!==null){var t=e.stateNode;switch(e.tag){case 5:e=t;break;default:e=t}typeof n=="function"?n(e):n.current=e}}function cd(e){var n=e.alternate;n!==null&&(e.alternate=null,cd(n)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(n=e.stateNode,n!==null&&(delete n[Ze],delete n[gr],delete n[mi],delete n[jf],delete n[Uf])),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}function dd(e){return e.tag===5||e.tag===3||e.tag===4}function Va(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||dd(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function _i(e,n,t){var r=e.tag;if(r===5||r===6)e=e.stateNode,n?t.nodeType===8?t.parentNode.insertBefore(e,n):t.insertBefore(e,n):(t.nodeType===8?(n=t.parentNode,n.insertBefore(e,t)):(n=t,n.appendChild(e)),t=t._reactRootContainer,t!=null||n.onclick!==null||(n.onclick=Fu));else if(r!==4&&(e=e.child,e!==null))for(_i(e,n,t),e=e.sibling;e!==null;)_i(e,n,t),e=e.sibling}function Pi(e,n,t){var r=e.tag;if(r===5||r===6)e=e.stateNode,n?t.insertBefore(e,n):t.appendChild(e);else if(r!==4&&(e=e.child,e!==null))for(Pi(e,n,t),e=e.sibling;e!==null;)Pi(e,n,t),e=e.sibling}var ae=null,Ue=!1;function mn(e,n,t){for(t=t.child;t!==null;)fd(e,n,t),t=t.sibling}function fd(e,n,t){if(qe&&typeof qe.onCommitFiberUnmount=="function")try{qe.onCommitFiberUnmount(Uu,t)}catch{}switch(t.tag){case 5:he||gt(t,n);case 6:var r=ae,u=Ue;ae=null,mn(e,n,t),ae=r,Ue=u,ae!==null&&(Ue?(e=ae,t=t.stateNode,e.nodeType===8?e.parentNode.removeChild(t):e.removeChild(t)):ae.removeChild(t.stateNode));break;case 18:ae!==null&&(Ue?(e=ae,t=t.stateNode,e.nodeType===8?Nl(e.parentNode,t):e.nodeType===1&&Nl(e,t),dr(e)):Nl(ae,t.stateNode));break;case 4:r=ae,u=Ue,ae=t.stateNode.containerInfo,Ue=!0,mn(e,n,t),ae=r,Ue=u;break;case 0:case 11:case 14:case 15:if(!he&&(r=t.updateQueue,r!==null&&(r=r.lastEffect,r!==null))){u=r=r.next;do{var l=u,i=l.destroy;l=l.tag,i!==void 0&&((l&2)!==0||(l&4)!==0)&&Di(t,n,i),u=u.next}while(u!==r)}mn(e,n,t);break;case 1:if(!he&&(gt(t,n),r=t.stateNode,typeof r.componentWillUnmount=="function"))try{r.props=t.memoizedProps,r.state=t.memoizedState,r.componentWillUnmount()}catch(o){Z(t,n,o)}mn(e,n,t);break;case 21:mn(e,n,t);break;case 22:t.mode&1?(he=(r=he)||t.memoizedState!==null,mn(e,n,t),he=r):mn(e,n,t);break;default:mn(e,n,t)}}function Ha(e){var n=e.updateQueue;if(n!==null){e.updateQueue=null;var t=e.stateNode;t===null&&(t=e.stateNode=new up),n.forEach(function(r){var u=hp.bind(null,e,r);t.has(r)||(t.add(r),r.then(u,u))})}}function $e(e,n){var t=n.deletions;if(t!==null)for(var r=0;r<t.length;r++){var u=t[r];try{var l=e,i=n,o=i;e:for(;o!==null;){switch(o.tag){case 5:ae=o.stateNode,Ue=!1;break e;case 3:ae=o.stateNode.containerInfo,Ue=!0;break e;case 4:ae=o.stateNode.containerInfo,Ue=!0;break e}o=o.return}if(ae===null)throw Error(k(160));fd(l,i,u),ae=null,Ue=!1;var s=u.alternate;s!==null&&(s.return=null),u.return=null}catch(c){Z(u,n,c)}}if(n.subtreeFlags&12854)for(n=n.child;n!==null;)pd(n,e),n=n.sibling}function pd(e,n){var t=e.alternate,r=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if($e(n,e),Ye(e),r&4){try{nr(3,e,e.return),Ju(3,e)}catch(F){Z(e,e.return,F)}try{nr(5,e,e.return)}catch(F){Z(e,e.return,F)}}break;case 1:$e(n,e),Ye(e),r&512&&t!==null&&gt(t,t.return);break;case 5:if($e(n,e),Ye(e),r&512&&t!==null&&gt(t,t.return),e.flags&32){var u=e.stateNode;try{or(u,"")}catch(F){Z(e,e.return,F)}}if(r&4&&(u=e.stateNode,u!=null)){var l=e.memoizedProps,i=t!==null?t.memoizedProps:l,o=e.type,s=e.updateQueue;if(e.updateQueue=null,s!==null)try{o==="input"&&l.type==="radio"&&l.name!=null&&Ls(u,l),ni(o,i);var c=ni(o,l);for(i=0;i<s.length;i+=2){var h=s[i],m=s[i+1];h==="style"?Ms(u,m):h==="dangerouslySetInnerHTML"?bs(u,m):h==="children"?or(u,m):Gi(u,h,m,c)}switch(o){case"input":Jl(u,l);break;case"textarea":Rs(u,l);break;case"select":var p=u._wrapperState.wasMultiple;u._wrapperState.wasMultiple=!!l.multiple;var v=l.value;v!=null?vt(u,!!l.multiple,v,!1):p!==!!l.multiple&&(l.defaultValue!=null?vt(u,!!l.multiple,l.defaultValue,!0):vt(u,!!l.multiple,l.multiple?[]:"",!1))}u[gr]=l}catch(F){Z(e,e.return,F)}}break;case 6:if($e(n,e),Ye(e),r&4){if(e.stateNode===null)throw Error(k(162));u=e.stateNode,l=e.memoizedProps;try{u.nodeValue=l}catch(F){Z(e,e.return,F)}}break;case 3:if($e(n,e),Ye(e),r&4&&t!==null&&t.memoizedState.isDehydrated)try{dr(n.containerInfo)}catch(F){Z(e,e.return,F)}break;case 4:$e(n,e),Ye(e);break;case 13:$e(n,e),Ye(e),u=e.child,u.flags&8192&&(l=u.memoizedState!==null,u.stateNode.isHidden=l,!l||u.alternate!==null&&u.alternate.memoizedState!==null||(Bo=ee())),r&4&&Ha(e);break;case 22:if(h=t!==null&&t.memoizedState!==null,e.mode&1?(he=(c=he)||h,$e(n,e),he=c):$e(n,e),Ye(e),r&8192){if(c=e.memoizedState!==null,(e.stateNode.isHidden=c)&&!h&&(e.mode&1)!==0)for(B=e,h=e.child;h!==null;){for(m=B=h;B!==null;){switch(p=B,v=p.child,p.tag){case 0:case 11:case 14:case 15:nr(4,p,p.return);break;case 1:gt(p,p.return);var w=p.stateNode;if(typeof w.componentWillUnmount=="function"){r=p,t=p.return;try{n=r,w.props=n.memoizedProps,w.state=n.memoizedState,w.componentWillUnmount()}catch(F){Z(r,t,F)}}break;case 5:gt(p,p.return);break;case 22:if(p.memoizedState!==null){Ga(m);continue}}v!==null?(v.return=p,B=v):Ga(m)}h=h.sibling}e:for(h=null,m=e;;){if(m.tag===5){if(h===null){h=m;try{u=m.stateNode,c?(l=u.style,typeof l.setProperty=="function"?l.setProperty("display","none","important"):l.display="none"):(o=m.stateNode,s=m.memoizedProps.style,i=s!=null&&s.hasOwnProperty("display")?s.display:null,o.style.display=Os("display",i))}catch(F){Z(e,e.return,F)}}}else if(m.tag===6){if(h===null)try{m.stateNode.nodeValue=c?"":m.memoizedProps}catch(F){Z(e,e.return,F)}}else if((m.tag!==22&&m.tag!==23||m.memoizedState===null||m===e)&&m.child!==null){m.child.return=m,m=m.child;continue}if(m===e)break e;for(;m.sibling===null;){if(m.return===null||m.return===e)break e;h===m&&(h=null),m=m.return}h===m&&(h=null),m.sibling.return=m.return,m=m.sibling}}break;case 19:$e(n,e),Ye(e),r&4&&Ha(e);break;case 21:break;default:$e(n,e),Ye(e)}}function Ye(e){var n=e.flags;if(n&2){try{e:{for(var t=e.return;t!==null;){if(dd(t)){var r=t;break e}t=t.return}throw Error(k(160))}switch(r.tag){case 5:var u=r.stateNode;r.flags&32&&(or(u,""),r.flags&=-33);var l=Va(e);Pi(e,l,u);break;case 3:case 4:var i=r.stateNode.containerInfo,o=Va(e);_i(e,o,i);break;default:throw Error(k(161))}}catch(s){Z(e,e.return,s)}e.flags&=-3}n&4096&&(e.flags&=-4097)}function ip(e,n,t){B=e,hd(e)}function hd(e,n,t){for(var r=(e.mode&1)!==0;B!==null;){var u=B,l=u.child;if(u.tag===22&&r){var i=u.memoizedState!==null||Gr;if(!i){var o=u.alternate,s=o!==null&&o.memoizedState!==null||he;o=Gr;var c=he;if(Gr=i,(he=s)&&!c)for(B=u;B!==null;)i=B,s=i.child,i.tag===22&&i.memoizedState!==null?Ka(u):s!==null?(s.return=i,B=s):Ka(u);for(;l!==null;)B=l,hd(l),l=l.sibling;B=u,Gr=o,he=c}Qa(e)}else(u.subtreeFlags&8772)!==0&&l!==null?(l.return=u,B=l):Qa(e)}}function Qa(e){for(;B!==null;){var n=B;if((n.flags&8772)!==0){var t=n.alternate;try{if((n.flags&8772)!==0)switch(n.tag){case 0:case 11:case 15:he||Ju(5,n);break;case 1:var r=n.stateNode;if(n.flags&4&&!he)if(t===null)r.componentDidMount();else{var u=n.elementType===n.type?t.memoizedProps:je(n.type,t.memoizedProps);r.componentDidUpdate(u,t.memoizedState,r.__reactInternalSnapshotBeforeUpdate)}var l=n.updateQueue;l!==null&&Na(n,l,r);break;case 3:var i=n.updateQueue;if(i!==null){if(t=null,n.child!==null)switch(n.child.tag){case 5:t=n.child.stateNode;break;case 1:t=n.child.stateNode}Na(n,i,t)}break;case 5:var o=n.stateNode;if(t===null&&n.flags&4){t=o;var s=n.memoizedProps;switch(n.type){case"button":case"input":case"select":case"textarea":s.autoFocus&&t.focus();break;case"img":s.src&&(t.src=s.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(n.memoizedState===null){var c=n.alternate;if(c!==null){var h=c.memoizedState;if(h!==null){var m=h.dehydrated;m!==null&&dr(m)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(k(163))}he||n.flags&512&&Ni(n)}catch(p){Z(n,n.return,p)}}if(n===e){B=null;break}if(t=n.sibling,t!==null){t.return=n.return,B=t;break}B=n.return}}function Ga(e){for(;B!==null;){var n=B;if(n===e){B=null;break}var t=n.sibling;if(t!==null){t.return=n.return,B=t;break}B=n.return}}function Ka(e){for(;B!==null;){var n=B;try{switch(n.tag){case 0:case 11:case 15:var t=n.return;try{Ju(4,n)}catch(s){Z(n,t,s)}break;case 1:var r=n.stateNode;if(typeof r.componentDidMount=="function"){var u=n.return;try{r.componentDidMount()}catch(s){Z(n,u,s)}}var l=n.return;try{Ni(n)}catch(s){Z(n,l,s)}break;case 5:var i=n.return;try{Ni(n)}catch(s){Z(n,i,s)}}}catch(s){Z(n,n.return,s)}if(n===e){B=null;break}var o=n.sibling;if(o!==null){o.return=n.return,B=o;break}B=n.return}}var op=Math.ceil,Tu=pn.ReactCurrentDispatcher,Ao=pn.ReactCurrentOwner,be=pn.ReactCurrentBatchConfig,$=0,oe=null,ne=null,se=0,Be=0,yt=bn(0),ue=0,wr=null,Xn=0,Zu=0,So=0,tr=null,we=null,Bo=0,_t=1/0,tn=null,Iu=!1,Ti=null,Bn=null,Kr=!1,Fn=null,Lu=0,rr=0,Ii=null,su=-1,cu=0;function ve(){return($&6)!==0?ee():su!==-1?su:su=ee()}function Dn(e){return(e.mode&1)===0?1:($&2)!==0&&se!==0?se&-se:Vf.transition!==null?(cu===0&&(cu=Zs()),cu):(e=j,e!==0||(e=window.event,e=e===void 0?16:uc(e.type)),e)}function He(e,n,t,r){if(50<rr)throw rr=0,Ii=null,Error(k(185));Ar(e,t,r),(($&2)===0||e!==oe)&&(e===oe&&(($&2)===0&&(Zu|=t),ue===4&&En(e,se)),Se(e,r),t===1&&$===0&&(n.mode&1)===0&&(_t=ee()+500,Gu&&On()))}function Se(e,n){var t=e.callbackNode;W0(e,n);var r=yu(e,e===oe?se:0);if(r===0)t!==null&&ra(t),e.callbackNode=null,e.callbackPriority=0;else if(n=r&-r,e.callbackPriority!==n){if(t!=null&&ra(t),n===1)e.tag===0?Wf(Ya.bind(null,e)):kc(Ya.bind(null,e)),Mf(function(){($&6)===0&&On()}),t=null;else{switch(qs(r)){case 1:t=qi;break;case 4:t=Ys;break;case 16:t=gu;break;case 536870912:t=Js;break;default:t=gu}t=wd(t,md.bind(null,e))}e.callbackPriority=n,e.callbackNode=t}}function md(e,n){if(su=-1,cu=0,($&6)!==0)throw Error(k(327));var t=e.callbackNode;if(kt()&&e.callbackNode!==t)return null;var r=yu(e,e===oe?se:0);if(r===0)return null;if((r&30)!==0||(r&e.expiredLanes)!==0||n)n=Ru(e,r);else{n=r;var u=$;$|=2;var l=yd();(oe!==e||se!==n)&&(tn=null,_t=ee()+500,Kn(e,n));do try{cp();break}catch(o){gd(e,o)}while(1);fo(),Tu.current=l,$=u,ne!==null?n=0:(oe=null,se=0,n=ue)}if(n!==0){if(n===2&&(u=ii(e),u!==0&&(r=u,n=Li(e,u))),n===1)throw t=wr,Kn(e,0),En(e,r),Se(e,ee()),t;if(n===6)En(e,r);else{if(u=e.current.alternate,(r&30)===0&&!ap(u)&&(n=Ru(e,r),n===2&&(l=ii(e),l!==0&&(r=l,n=Li(e,l))),n===1))throw t=wr,Kn(e,0),En(e,r),Se(e,ee()),t;switch(e.finishedWork=u,e.finishedLanes=r,n){case 0:case 1:throw Error(k(345));case 2:Wn(e,we,tn);break;case 3:if(En(e,r),(r&130023424)===r&&(n=Bo+500-ee(),10<n)){if(yu(e,0)!==0)break;if(u=e.suspendedLanes,(u&r)!==r){ve(),e.pingedLanes|=e.suspendedLanes&u;break}e.timeoutHandle=hi(Wn.bind(null,e,we,tn),n);break}Wn(e,we,tn);break;case 4:if(En(e,r),(r&4194240)===r)break;for(n=e.eventTimes,u=-1;0<r;){var i=31-Ve(r);l=1<<i,i=n[i],i>u&&(u=i),r&=~l}if(r=u,r=ee()-r,r=(120>r?120:480>r?480:1080>r?1080:1920>r?1920:3e3>r?3e3:4320>r?4320:1960*op(r/1960))-r,10<r){e.timeoutHandle=hi(Wn.bind(null,e,we,tn),r);break}Wn(e,we,tn);break;case 5:Wn(e,we,tn);break;default:throw Error(k(329))}}}return Se(e,ee()),e.callbackNode===t?md.bind(null,e):null}function Li(e,n){var t=tr;return e.current.memoizedState.isDehydrated&&(Kn(e,n).flags|=256),e=Ru(e,n),e!==2&&(n=we,we=t,n!==null&&Ri(n)),e}function Ri(e){we===null?we=e:we.push.apply(we,e)}function ap(e){for(var n=e;;){if(n.flags&16384){var t=n.updateQueue;if(t!==null&&(t=t.stores,t!==null))for(var r=0;r<t.length;r++){var u=t[r],l=u.getSnapshot;u=u.value;try{if(!Qe(l(),u))return!1}catch{return!1}}}if(t=n.child,n.subtreeFlags&16384&&t!==null)t.return=n,n=t;else{if(n===e)break;for(;n.sibling===null;){if(n.return===null||n.return===e)return!0;n=n.return}n.sibling.return=n.return,n=n.sibling}}return!0}function En(e,n){for(n&=~So,n&=~Zu,e.suspendedLanes|=n,e.pingedLanes&=~n,e=e.expirationTimes;0<n;){var t=31-Ve(n),r=1<<t;e[t]=-1,n&=~r}}function Ya(e){if(($&6)!==0)throw Error(k(327));kt();var n=yu(e,0);if((n&1)===0)return Se(e,ee()),null;var t=Ru(e,n);if(e.tag!==0&&t===2){var r=ii(e);r!==0&&(n=r,t=Li(e,r))}if(t===1)throw t=wr,Kn(e,0),En(e,n),Se(e,ee()),t;if(t===6)throw Error(k(345));return e.finishedWork=e.current.alternate,e.finishedLanes=n,Wn(e,we,tn),Se(e,ee()),null}function Do(e,n){var t=$;$|=1;try{return e(n)}finally{$=t,$===0&&(_t=ee()+500,Gu&&On())}}function et(e){Fn!==null&&Fn.tag===0&&($&6)===0&&kt();var n=$;$|=1;var t=be.transition,r=j;try{if(be.transition=null,j=1,e)return e()}finally{j=r,be.transition=t,$=n,($&6)===0&&On()}}function No(){Be=yt.current,Q(yt)}function Kn(e,n){e.finishedWork=null,e.finishedLanes=0;var t=e.timeoutHandle;if(t!==-1&&(e.timeoutHandle=-1,Of(t)),ne!==null)for(t=ne.return;t!==null;){var r=t;switch(ao(r),r.tag){case 1:r=r.type.childContextTypes,r!=null&&wu();break;case 3:Dt(),Q(Ce),Q(me),vo();break;case 5:yo(r);break;case 4:Dt();break;case 13:Q(K);break;case 19:Q(K);break;case 10:po(r.type._context);break;case 22:case 23:No()}t=t.return}if(oe=e,ne=e=Nn(e.current,null),se=Be=n,ue=0,wr=null,So=Zu=Xn=0,we=tr=null,Hn!==null){for(n=0;n<Hn.length;n++)if(t=Hn[n],r=t.interleaved,r!==null){t.interleaved=null;var u=r.next,l=t.pending;if(l!==null){var i=l.next;l.next=u,r.next=i}t.pending=r}Hn=null}return e}function gd(e,n){do{var t=ne;try{if(fo(),iu.current=Pu,_u){for(var r=Y.memoizedState;r!==null;){var u=r.queue;u!==null&&(u.pending=null),r=r.next}_u=!1}if(qn=0,ie=re=Y=null,er=!1,Er=0,Ao.current=null,t===null||t.return===null){ue=1,wr=n,ne=null;break}e:{var l=e,i=t.return,o=t,s=n;if(n=se,o.flags|=32768,s!==null&&typeof s=="object"&&typeof s.then=="function"){var c=s,h=o,m=h.tag;if((h.mode&1)===0&&(m===0||m===11||m===15)){var p=h.alternate;p?(h.updateQueue=p.updateQueue,h.memoizedState=p.memoizedState,h.lanes=p.lanes):(h.updateQueue=null,h.memoizedState=null)}var v=za(i);if(v!==null){v.flags&=-257,ba(v,i,o,l,n),v.mode&1&&Ra(l,c,n),n=v,s=c;var w=n.updateQueue;if(w===null){var F=new Set;F.add(s),n.updateQueue=F}else w.add(s);break e}else{if((n&1)===0){Ra(l,c,n),_o();break e}s=Error(k(426))}}else if(G&&o.mode&1){var I=za(i);if(I!==null){(I.flags&65536)===0&&(I.flags|=256),ba(I,i,o,l,n),so(Nt(s,o));break e}}l=s=Nt(s,o),ue!==4&&(ue=2),tr===null?tr=[l]:tr.push(l),l=i;do{switch(l.tag){case 3:l.flags|=65536,n&=-n,l.lanes|=n;var f=Xc(l,s,n);Da(l,f);break e;case 1:o=s;var d=l.type,g=l.stateNode;if((l.flags&128)===0&&(typeof d.getDerivedStateFromError=="function"||g!==null&&typeof g.componentDidCatch=="function"&&(Bn===null||!Bn.has(g)))){l.flags|=65536,n&=-n,l.lanes|=n;var E=ed(l,o,n);Da(l,E);break e}}l=l.return}while(l!==null)}Ed(t)}catch(C){n=C,ne===t&&t!==null&&(ne=t=t.return);continue}break}while(1)}function yd(){var e=Tu.current;return Tu.current=Pu,e===null?Pu:e}function _o(){(ue===0||ue===3||ue===2)&&(ue=4),oe===null||(Xn&268435455)===0&&(Zu&268435455)===0||En(oe,se)}function Ru(e,n){var t=$;$|=2;var r=yd();(oe!==e||se!==n)&&(tn=null,Kn(e,n));do try{sp();break}catch(u){gd(e,u)}while(1);if(fo(),$=t,Tu.current=r,ne!==null)throw Error(k(261));return oe=null,se=0,ue}function sp(){for(;ne!==null;)vd(ne)}function cp(){for(;ne!==null&&!L0();)vd(ne)}function vd(e){var n=Fd(e.alternate,e,Be);e.memoizedProps=e.pendingProps,n===null?Ed(e):ne=n,Ao.current=null}function Ed(e){var n=e;do{var t=n.alternate;if(e=n.return,(n.flags&32768)===0){if(t=tp(t,n,Be),t!==null){ne=t;return}}else{if(t=rp(t,n),t!==null){t.flags&=32767,ne=t;return}if(e!==null)e.flags|=32768,e.subtreeFlags=0,e.deletions=null;else{ue=6,ne=null;return}}if(n=n.sibling,n!==null){ne=n;return}ne=n=e}while(n!==null);ue===0&&(ue=5)}function Wn(e,n,t){var r=j,u=be.transition;try{be.transition=null,j=1,dp(e,n,t,r)}finally{be.transition=u,j=r}return null}function dp(e,n,t,r){do kt();while(Fn!==null);if(($&6)!==0)throw Error(k(327));t=e.finishedWork;var u=e.finishedLanes;if(t===null)return null;if(e.finishedWork=null,e.finishedLanes=0,t===e.current)throw Error(k(177));e.callbackNode=null,e.callbackPriority=0;var l=t.lanes|t.childLanes;if(V0(e,l),e===oe&&(ne=oe=null,se=0),(t.subtreeFlags&2064)===0&&(t.flags&2064)===0||Kr||(Kr=!0,wd(gu,function(){return kt(),null})),l=(t.flags&15990)!==0,(t.subtreeFlags&15990)!==0||l){l=be.transition,be.transition=null;var i=j;j=1;var o=$;$|=4,Ao.current=null,lp(e,t),pd(t,e),Pf(fi),vu=!!di,fi=di=null,e.current=t,ip(t),R0(),$=o,j=i,be.transition=l}else e.current=t;if(Kr&&(Kr=!1,Fn=e,Lu=u),l=e.pendingLanes,l===0&&(Bn=null),O0(t.stateNode),Se(e,ee()),n!==null)for(r=e.onRecoverableError,t=0;t<n.length;t++)u=n[t],r(u.value,{componentStack:u.stack,digest:u.digest});if(Iu)throw Iu=!1,e=Ti,Ti=null,e;return(Lu&1)!==0&&e.tag!==0&&kt(),l=e.pendingLanes,(l&1)!==0?e===Ii?rr++:(rr=0,Ii=e):rr=0,On(),null}function kt(){if(Fn!==null){var e=qs(Lu),n=be.transition,t=j;try{if(be.transition=null,j=16>e?16:e,Fn===null)var r=!1;else{if(e=Fn,Fn=null,Lu=0,($&6)!==0)throw Error(k(331));var u=$;for($|=4,B=e.current;B!==null;){var l=B,i=l.child;if((B.flags&16)!==0){var o=l.deletions;if(o!==null){for(var s=0;s<o.length;s++){var c=o[s];for(B=c;B!==null;){var h=B;switch(h.tag){case 0:case 11:case 15:nr(8,h,l)}var m=h.child;if(m!==null)m.return=h,B=m;else for(;B!==null;){h=B;var p=h.sibling,v=h.return;if(cd(h),h===c){B=null;break}if(p!==null){p.return=v,B=p;break}B=v}}}var w=l.alternate;if(w!==null){var F=w.child;if(F!==null){w.child=null;do{var I=F.sibling;F.sibling=null,F=I}while(F!==null)}}B=l}}if((l.subtreeFlags&2064)!==0&&i!==null)i.return=l,B=i;else e:for(;B!==null;){if(l=B,(l.flags&2048)!==0)switch(l.tag){case 0:case 11:case 15:nr(9,l,l.return)}var f=l.sibling;if(f!==null){f.return=l.return,B=f;break e}B=l.return}}var d=e.current;for(B=d;B!==null;){i=B;var g=i.child;if((i.subtreeFlags&2064)!==0&&g!==null)g.return=i,B=g;else e:for(i=d;B!==null;){if(o=B,(o.flags&2048)!==0)try{switch(o.tag){case 0:case 11:case 15:Ju(9,o)}}catch(C){Z(o,o.return,C)}if(o===i){B=null;break e}var E=o.sibling;if(E!==null){E.return=o.return,B=E;break e}B=o.return}}if($=u,On(),qe&&typeof qe.onPostCommitFiberRoot=="function")try{qe.onPostCommitFiberRoot(Uu,e)}catch{}r=!0}return r}finally{j=t,be.transition=n}}return!1}function Ja(e,n,t){n=Nt(t,n),n=Xc(e,n,1),e=Sn(e,n,1),n=ve(),e!==null&&(Ar(e,1,n),Se(e,n))}function Z(e,n,t){if(e.tag===3)Ja(e,e,t);else for(;n!==null;){if(n.tag===3){Ja(n,e,t);break}else if(n.tag===1){var r=n.stateNode;if(typeof n.type.getDerivedStateFromError=="function"||typeof r.componentDidCatch=="function"&&(Bn===null||!Bn.has(r))){e=Nt(t,e),e=ed(n,e,1),n=Sn(n,e,1),e=ve(),n!==null&&(Ar(n,1,e),Se(n,e));break}}n=n.return}}function fp(e,n,t){var r=e.pingCache;r!==null&&r.delete(n),n=ve(),e.pingedLanes|=e.suspendedLanes&t,oe===e&&(se&t)===t&&(ue===4||ue===3&&(se&130023424)===se&&500>ee()-Bo?Kn(e,0):So|=t),Se(e,n)}function xd(e,n){n===0&&((e.mode&1)===0?n=1:(n=Or,Or<<=1,(Or&130023424)===0&&(Or=4194304)));var t=ve();e=dn(e,n),e!==null&&(Ar(e,n,t),Se(e,t))}function pp(e){var n=e.memoizedState,t=0;n!==null&&(t=n.retryLane),xd(e,t)}function hp(e,n){var t=0;switch(e.tag){case 13:var r=e.stateNode,u=e.memoizedState;u!==null&&(t=u.retryLane);break;case 19:r=e.stateNode;break;default:throw Error(k(314))}r!==null&&r.delete(n),xd(e,t)}var Fd;Fd=function(e,n,t){if(e!==null)if(e.memoizedProps!==n.pendingProps||Ce.current)ke=!0;else{if((e.lanes&t)===0&&(n.flags&128)===0)return ke=!1,np(e,n,t);ke=(e.flags&131072)!==0}else ke=!1,G&&(n.flags&1048576)!==0&&Cc(n,Au,n.index);switch(n.lanes=0,n.tag){case 2:var r=n.type;au(e,n),e=n.pendingProps;var u=At(n,me.current);wt(n,t),u=xo(null,n,r,e,u,t);var l=Fo();return n.flags|=1,typeof u=="object"&&u!==null&&typeof u.render=="function"&&u.$$typeof===void 0?(n.tag=1,n.memoizedState=null,n.updateQueue=null,Ae(r)?(l=!0,ku(n)):l=!1,n.memoizedState=u.state!==null&&u.state!==void 0?u.state:null,mo(n),u.updater=Ku,n.stateNode=u,u._reactInternals=n,Fi(n,r,e,t),n=Ci(null,n,r,!0,l,t)):(n.tag=0,G&&l&&oo(n),ye(null,n,u,t),n=n.child),n;case 16:r=n.elementType;e:{switch(au(e,n),e=n.pendingProps,u=r._init,r=u(r._payload),n.type=r,u=n.tag=gp(r),e=je(r,e),u){case 0:n=ki(null,n,r,e,t);break e;case 1:n=$a(null,n,r,e,t);break e;case 11:n=Oa(null,n,r,e,t);break e;case 14:n=Ma(null,n,r,je(r.type,e),t);break e}throw Error(k(306,r,""))}return n;case 0:return r=n.type,u=n.pendingProps,u=n.elementType===r?u:je(r,u),ki(e,n,r,u,t);case 1:return r=n.type,u=n.pendingProps,u=n.elementType===r?u:je(r,u),$a(e,n,r,u,t);case 3:e:{if(ud(n),e===null)throw Error(k(387));r=n.pendingProps,l=n.memoizedState,u=l.element,Dc(e,n),Du(n,r,null,t);var i=n.memoizedState;if(r=i.element,l.isDehydrated)if(l={element:r,isDehydrated:!1,cache:i.cache,pendingSuspenseBoundaries:i.pendingSuspenseBoundaries,transitions:i.transitions},n.updateQueue.baseState=l,n.memoizedState=l,n.flags&256){u=Nt(Error(k(423)),n),n=ja(e,n,r,t,u);break e}else if(r!==u){u=Nt(Error(k(424)),n),n=ja(e,n,r,t,u);break e}else for(De=An(n.stateNode.containerInfo.firstChild),Ne=n,G=!0,We=null,t=Tc(n,null,r,t),n.child=t;t;)t.flags=t.flags&-3|4096,t=t.sibling;else{if(St(),r===u){n=fn(e,n,t);break e}ye(e,n,r,t)}n=n.child}return n;case 5:return Ic(n),e===null&&vi(n),r=n.type,u=n.pendingProps,l=e!==null?e.memoizedProps:null,i=u.children,pi(r,u)?i=null:l!==null&&pi(r,l)&&(n.flags|=32),rd(e,n),ye(e,n,i,t),n.child;case 6:return e===null&&vi(n),null;case 13:return ld(e,n,t);case 4:return go(n,n.stateNode.containerInfo),r=n.pendingProps,e===null?n.child=Bt(n,null,r,t):ye(e,n,r,t),n.child;case 11:return r=n.type,u=n.pendingProps,u=n.elementType===r?u:je(r,u),Oa(e,n,r,u,t);case 7:return ye(e,n,n.pendingProps,t),n.child;case 8:return ye(e,n,n.pendingProps.children,t),n.child;case 12:return ye(e,n,n.pendingProps.children,t),n.child;case 10:e:{if(r=n.type._context,u=n.pendingProps,l=n.memoizedProps,i=u.value,V(Su,r._currentValue),r._currentValue=i,l!==null)if(Qe(l.value,i)){if(l.children===u.children&&!Ce.current){n=fn(e,n,t);break e}}else for(l=n.child,l!==null&&(l.return=n);l!==null;){var o=l.dependencies;if(o!==null){i=l.child;for(var s=o.firstContext;s!==null;){if(s.context===r){if(l.tag===1){s=an(-1,t&-t),s.tag=2;var c=l.updateQueue;if(c!==null){c=c.shared;var h=c.pending;h===null?s.next=s:(s.next=h.next,h.next=s),c.pending=s}}l.lanes|=t,s=l.alternate,s!==null&&(s.lanes|=t),Ei(l.return,t,n),o.lanes|=t;break}s=s.next}}else if(l.tag===10)i=l.type===n.type?null:l.child;else if(l.tag===18){if(i=l.return,i===null)throw Error(k(341));i.lanes|=t,o=i.alternate,o!==null&&(o.lanes|=t),Ei(i,t,n),i=l.sibling}else i=l.child;if(i!==null)i.return=l;else for(i=l;i!==null;){if(i===n){i=null;break}if(l=i.sibling,l!==null){l.return=i.return,i=l;break}i=i.return}l=i}ye(e,n,u.children,t),n=n.child}return n;case 9:return u=n.type,r=n.pendingProps.children,wt(n,t),u=Oe(u),r=r(u),n.flags|=1,ye(e,n,r,t),n.child;case 14:return r=n.type,u=je(r,n.pendingProps),u=je(r.type,u),Ma(e,n,r,u,t);case 15:return nd(e,n,n.type,n.pendingProps,t);case 17:return r=n.type,u=n.pendingProps,u=n.elementType===r?u:je(r,u),au(e,n),n.tag=1,Ae(r)?(e=!0,ku(n)):e=!1,wt(n,t),_c(n,r,u),Fi(n,r,u,t),Ci(null,n,r,!0,e,t);case 19:return id(e,n,t);case 22:return td(e,n,t)}throw Error(k(156,n.tag))};function wd(e,n){return Ks(e,n)}function mp(e,n,t,r){this.tag=e,this.key=t,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=n,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=r,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function ze(e,n,t,r){return new mp(e,n,t,r)}function Po(e){return e=e.prototype,!(!e||!e.isReactComponent)}function gp(e){if(typeof e=="function")return Po(e)?1:0;if(e!=null){if(e=e.$$typeof,e===Yi)return 11;if(e===Ji)return 14}return 2}function Nn(e,n){var t=e.alternate;return t===null?(t=ze(e.tag,n,e.key,e.mode),t.elementType=e.elementType,t.type=e.type,t.stateNode=e.stateNode,t.alternate=e,e.alternate=t):(t.pendingProps=n,t.type=e.type,t.flags=0,t.subtreeFlags=0,t.deletions=null),t.flags=e.flags&14680064,t.childLanes=e.childLanes,t.lanes=e.lanes,t.child=e.child,t.memoizedProps=e.memoizedProps,t.memoizedState=e.memoizedState,t.updateQueue=e.updateQueue,n=e.dependencies,t.dependencies=n===null?null:{lanes:n.lanes,firstContext:n.firstContext},t.sibling=e.sibling,t.index=e.index,t.ref=e.ref,t}function du(e,n,t,r,u,l){var i=2;if(r=e,typeof e=="function")Po(e)&&(i=1);else if(typeof e=="string")i=5;else e:switch(e){case ot:return Yn(t.children,u,l,n);case Ki:i=8,u|=8;break;case Hl:return e=ze(12,t,n,u|2),e.elementType=Hl,e.lanes=l,e;case Ql:return e=ze(13,t,n,u),e.elementType=Ql,e.lanes=l,e;case Gl:return e=ze(19,t,n,u),e.elementType=Gl,e.lanes=l,e;case Ps:return qu(t,u,l,n);default:if(typeof e=="object"&&e!==null)switch(e.$$typeof){case Ns:i=10;break e;case _s:i=9;break e;case Yi:i=11;break e;case Ji:i=14;break e;case gn:i=16,r=null;break e}throw Error(k(130,e==null?e:typeof e,""))}return n=ze(i,t,n,u),n.elementType=e,n.type=r,n.lanes=l,n}function Yn(e,n,t,r){return e=ze(7,e,r,n),e.lanes=t,e}function qu(e,n,t,r){return e=ze(22,e,r,n),e.elementType=Ps,e.lanes=t,e.stateNode={isHidden:!1},e}function bl(e,n,t){return e=ze(6,e,null,n),e.lanes=t,e}function Ol(e,n,t){return n=ze(4,e.children!==null?e.children:[],e.key,n),n.lanes=t,n.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},n}function yp(e,n,t,r,u){this.tag=n,this.containerInfo=e,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=vl(0),this.expirationTimes=vl(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=vl(0),this.identifierPrefix=r,this.onRecoverableError=u,this.mutableSourceEagerHydrationData=null}function To(e,n,t,r,u,l,i,o,s){return e=new yp(e,n,t,o,s),n===1?(n=1,l===!0&&(n|=8)):n=0,l=ze(3,null,null,n),e.current=l,l.stateNode=e,l.memoizedState={element:r,isDehydrated:t,cache:null,transitions:null,pendingSuspenseBoundaries:null},mo(l),e}function vp(e,n,t){var r=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:it,key:r==null?null:""+r,children:e,containerInfo:n,implementation:t}}function kd(e){if(!e)return Tn;e=e._reactInternals;e:{if(tt(e)!==e||e.tag!==1)throw Error(k(170));var n=e;do{switch(n.tag){case 3:n=n.stateNode.context;break e;case 1:if(Ae(n.type)){n=n.stateNode.__reactInternalMemoizedMergedChildContext;break e}}n=n.return}while(n!==null);throw Error(k(171))}if(e.tag===1){var t=e.type;if(Ae(t))return wc(e,t,n)}return n}function Cd(e,n,t,r,u,l,i,o,s){return e=To(t,r,!0,e,u,l,i,o,s),e.context=kd(null),t=e.current,r=ve(),u=Dn(t),l=an(r,u),l.callback=n!=null?n:null,Sn(t,l,u),e.current.lanes=u,Ar(e,u,r),Se(e,r),e}function Xu(e,n,t,r){var u=n.current,l=ve(),i=Dn(u);return t=kd(t),n.context===null?n.context=t:n.pendingContext=t,n=an(l,i),n.payload={element:e},r=r===void 0?null:r,r!==null&&(n.callback=r),e=Sn(u,n,i),e!==null&&(He(e,u,i,l),lu(e,u,i)),i}function zu(e){if(e=e.current,!e.child)return null;switch(e.child.tag){case 5:return e.child.stateNode;default:return e.child.stateNode}}function Za(e,n){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var t=e.retryLane;e.retryLane=t!==0&&t<n?t:n}}function Io(e,n){Za(e,n),(e=e.alternate)&&Za(e,n)}function Ep(){return null}var Ad=typeof reportError=="function"?reportError:function(e){console.error(e)};function Lo(e){this._internalRoot=e}el.prototype.render=Lo.prototype.render=function(e){var n=this._internalRoot;if(n===null)throw Error(k(409));Xu(e,n,null,null)};el.prototype.unmount=Lo.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var n=e.containerInfo;et(function(){Xu(null,e,null,null)}),n[cn]=null}};function el(e){this._internalRoot=e}el.prototype.unstable_scheduleHydration=function(e){if(e){var n=nc();e={blockedOn:null,target:e,priority:n};for(var t=0;t<vn.length&&n!==0&&n<vn[t].priority;t++);vn.splice(t,0,e),t===0&&rc(e)}};function Ro(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function nl(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11&&(e.nodeType!==8||e.nodeValue!==" react-mount-point-unstable "))}function qa(){}function xp(e,n,t,r,u){if(u){if(typeof r=="function"){var l=r;r=function(){var c=zu(i);l.call(c)}}var i=Cd(n,r,e,0,null,!1,!1,"",qa);return e._reactRootContainer=i,e[cn]=i.current,hr(e.nodeType===8?e.parentNode:e),et(),i}for(;u=e.lastChild;)e.removeChild(u);if(typeof r=="function"){var o=r;r=function(){var c=zu(s);o.call(c)}}var s=To(e,0,!1,null,null,!1,!1,"",qa);return e._reactRootContainer=s,e[cn]=s.current,hr(e.nodeType===8?e.parentNode:e),et(function(){Xu(n,s,t,r)}),s}function tl(e,n,t,r,u){var l=t._reactRootContainer;if(l){var i=l;if(typeof u=="function"){var o=u;u=function(){var s=zu(i);o.call(s)}}Xu(n,i,e,u)}else i=xp(t,n,e,u,r);return zu(i)}Xs=function(e){switch(e.tag){case 3:var n=e.stateNode;if(n.current.memoizedState.isDehydrated){var t=Qt(n.pendingLanes);t!==0&&(Xi(n,t|1),Se(n,ee()),($&6)===0&&(_t=ee()+500,On()))}break;case 13:et(function(){var r=dn(e,1);if(r!==null){var u=ve();He(r,e,1,u)}}),Io(e,1)}};eo=function(e){if(e.tag===13){var n=dn(e,134217728);if(n!==null){var t=ve();He(n,e,134217728,t)}Io(e,134217728)}};ec=function(e){if(e.tag===13){var n=Dn(e),t=dn(e,n);if(t!==null){var r=ve();He(t,e,n,r)}Io(e,n)}};nc=function(){return j};tc=function(e,n){var t=j;try{return j=e,n()}finally{j=t}};ri=function(e,n,t){switch(n){case"input":if(Jl(e,t),n=t.name,t.type==="radio"&&n!=null){for(t=e;t.parentNode;)t=t.parentNode;for(t=t.querySelectorAll("input[name="+JSON.stringify(""+n)+'][type="radio"]'),n=0;n<t.length;n++){var r=t[n];if(r!==e&&r.form===e.form){var u=Qu(r);if(!u)throw Error(k(90));Is(r),Jl(r,u)}}}break;case"textarea":Rs(e,t);break;case"select":n=t.value,n!=null&&vt(e,!!t.multiple,n,!1)}};Us=Do;Ws=et;var Fp={usingClientEntryPoint:!1,Events:[Br,dt,Qu,$s,js,Do]},Wt={findFiberByHostInstance:Vn,bundleType:0,version:"18.2.0",rendererPackageName:"react-dom"},wp={bundleType:Wt.bundleType,version:Wt.version,rendererPackageName:Wt.rendererPackageName,rendererConfig:Wt.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:pn.ReactCurrentDispatcher,findHostInstanceByFiber:function(e){return e=Qs(e),e===null?null:e.stateNode},findFiberByHostInstance:Wt.findFiberByHostInstance||Ep,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.2.0-next-9e3b772b8-20220608"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__!="undefined"){var Yr=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!Yr.isDisabled&&Yr.supportsFiber)try{Uu=Yr.inject(wp),qe=Yr}catch{}}Pe.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=Fp;Pe.createPortal=function(e,n){var t=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!Ro(n))throw Error(k(200));return vp(e,n,null,t)};Pe.createRoot=function(e,n){if(!Ro(e))throw Error(k(299));var t=!1,r="",u=Ad;return n!=null&&(n.unstable_strictMode===!0&&(t=!0),n.identifierPrefix!==void 0&&(r=n.identifierPrefix),n.onRecoverableError!==void 0&&(u=n.onRecoverableError)),n=To(e,1,!1,null,null,t,!1,r,u),e[cn]=n.current,hr(e.nodeType===8?e.parentNode:e),new Lo(n)};Pe.findDOMNode=function(e){if(e==null)return null;if(e.nodeType===1)return e;var n=e._reactInternals;if(n===void 0)throw typeof e.render=="function"?Error(k(188)):(e=Object.keys(e).join(","),Error(k(268,e)));return e=Qs(n),e=e===null?null:e.stateNode,e};Pe.flushSync=function(e){return et(e)};Pe.hydrate=function(e,n,t){if(!nl(n))throw Error(k(200));return tl(null,e,n,!0,t)};Pe.hydrateRoot=function(e,n,t){if(!Ro(e))throw Error(k(405));var r=t!=null&&t.hydratedSources||null,u=!1,l="",i=Ad;if(t!=null&&(t.unstable_strictMode===!0&&(u=!0),t.identifierPrefix!==void 0&&(l=t.identifierPrefix),t.onRecoverableError!==void 0&&(i=t.onRecoverableError)),n=Cd(n,null,e,1,t!=null?t:null,u,!1,l,i),e[cn]=n.current,hr(e),r)for(e=0;e<r.length;e++)t=r[e],u=t._getVersion,u=u(t._source),n.mutableSourceEagerHydrationData==null?n.mutableSourceEagerHydrationData=[t,u]:n.mutableSourceEagerHydrationData.push(t,u);return new el(n)};Pe.render=function(e,n,t){if(!nl(n))throw Error(k(200));return tl(null,e,n,!1,t)};Pe.unmountComponentAtNode=function(e){if(!nl(e))throw Error(k(40));return e._reactRootContainer?(et(function(){tl(null,null,e,!1,function(){e._reactRootContainer=null,e[cn]=null})}),!0):!1};Pe.unstable_batchedUpdates=Do;Pe.unstable_renderSubtreeIntoContainer=function(e,n,t,r){if(!nl(t))throw Error(k(200));if(e==null||e._reactInternals===void 0)throw Error(k(38));return tl(e,n,t,!1,r)};Pe.version="18.2.0-next-9e3b772b8-20220608";function Sd(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__=="undefined"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Sd)}catch(e){console.error(e)}}Sd(),Cs.exports=Pe;var Xa=Cs.exports;Wl.createRoot=Xa.createRoot,Wl.hydrateRoot=Xa.hydrateRoot;function bu(){return bu=Object.assign?Object.assign.bind():function(e){for(var n=1;n<arguments.length;n++){var t=arguments[n];for(var r in t)({}).hasOwnProperty.call(t,r)&&(e[r]=t[r])}return e},bu.apply(null,arguments)}var Gn;(function(e){e.Pop="POP",e.Push="PUSH",e.Replace="REPLACE"})(Gn||(Gn={}));var es=function(e){return e},ns="beforeunload",kp="hashchange",Cp="popstate";function Ap(e){e===void 0&&(e={});var n=e,t=n.window,r=t===void 0?document.defaultView:t,u=r.history;function l(){var x=In(r.location.hash.substr(1)),N=x.pathname,T=N===void 0?"/":N,U=x.search,te=U===void 0?"":U,ge=x.hash,hn=ge===void 0?"":ge,Ke=u.state||{};return[Ke.idx,es({pathname:T,search:te,hash:hn,state:Ke.usr||null,key:Ke.key||"default"})]}var i=null;function o(){if(i)v.call(i),i=null;else{var x=Gn.Pop,N=l(),T=N[0],U=N[1];if(v.length){if(T!=null){var te=h-T;te&&(i={action:x,location:U,retry:function(){A(te*-1)}},A(te))}}else g(x)}}r.addEventListener(Cp,o),r.addEventListener(kp,function(){var x=l(),N=x[1];ur(N)!==ur(m)&&o()});var s=Gn.Pop,c=l(),h=c[0],m=c[1],p=rs(),v=rs();h==null&&(h=0,u.replaceState(bu({},u.state,{idx:h}),""));function w(){var x=document.querySelector("base"),N="";if(x&&x.getAttribute("href")){var T=r.location.href,U=T.indexOf("#");N=U===-1?T:T.slice(0,U)}return N}function F(x){return w()+"#"+(typeof x=="string"?x:ur(x))}function I(x,N){return N===void 0&&(N=null),es(bu({pathname:m.pathname,hash:"",search:""},typeof x=="string"?In(x):x,{state:N,key:Sp()}))}function f(x,N){return[{usr:x.state,key:x.key,idx:N},F(x)]}function d(x,N,T){return!v.length||(v.call({action:x,location:N,retry:T}),!1)}function g(x){s=x;var N=l();h=N[0],m=N[1],p.call({action:s,location:m})}function E(x,N){var T=Gn.Push,U=I(x,N);function te(){E(x,N)}if(d(T,U,te)){var ge=f(U,h+1),hn=ge[0],Ke=ge[1];try{u.pushState(hn,"",Ke)}catch{r.location.assign(Ke)}g(T)}}function C(x,N){var T=Gn.Replace,U=I(x,N);function te(){C(x,N)}if(d(T,U,te)){var ge=f(U,h),hn=ge[0],Ke=ge[1];u.replaceState(hn,"",Ke),g(T)}}function A(x){u.go(x)}var S={get action(){return s},get location(){return m},createHref:F,push:E,replace:C,go:A,back:function(){A(-1)},forward:function(){A(1)},listen:function(N){return p.push(N)},block:function(N){var T=v.push(N);return v.length===1&&r.addEventListener(ns,ts),function(){T(),v.length||r.removeEventListener(ns,ts)}}};return S}function ts(e){e.preventDefault(),e.returnValue=""}function rs(){var e=[];return{get length(){return e.length},push:function(t){return e.push(t),function(){e=e.filter(function(r){return r!==t})}},call:function(t){e.forEach(function(r){return r&&r(t)})}}}function Sp(){return Math.random().toString(36).substr(2,8)}function ur(e){var n=e.pathname,t=n===void 0?"/":n,r=e.search,u=r===void 0?"":r,l=e.hash,i=l===void 0?"":l;return u&&u!=="?"&&(t+=u.charAt(0)==="?"?u:"?"+u),i&&i!=="#"&&(t+=i.charAt(0)==="#"?i:"#"+i),t}function In(e){var n={};if(e){var t=e.indexOf("#");t>=0&&(n.hash=e.substr(t),e=e.substr(0,t));var r=e.indexOf("?");r>=0&&(n.search=e.substr(r),e=e.substr(0,r)),e&&(n.pathname=e)}return n}/**
 * React Router v6.3.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */const zo=P.exports.createContext(null),bo=P.exports.createContext(null),Nr=P.exports.createContext({outlet:null,matches:[]});function Ge(e,n){if(!e)throw new Error(n)}function Bp(e,n,t){t===void 0&&(t="/");let r=typeof n=="string"?In(n):n,u=Nd(r.pathname||"/",t);if(u==null)return null;let l=Bd(e);Dp(l);let i=null;for(let o=0;i==null&&o<l.length;++o)i=bp(l[o],u);return i}function Bd(e,n,t,r){return n===void 0&&(n=[]),t===void 0&&(t=[]),r===void 0&&(r=""),e.forEach((u,l)=>{let i={relativePath:u.path||"",caseSensitive:u.caseSensitive===!0,childrenIndex:l,route:u};i.relativePath.startsWith("/")&&(i.relativePath.startsWith(r)||Ge(!1),i.relativePath=i.relativePath.slice(r.length));let o=_n([r,i.relativePath]),s=t.concat(i);u.children&&u.children.length>0&&(u.index===!0&&Ge(!1),Bd(u.children,n,s,o)),!(u.path==null&&!u.index)&&n.push({path:o,score:Rp(o,u.index),routesMeta:s})}),n}function Dp(e){e.sort((n,t)=>n.score!==t.score?t.score-n.score:zp(n.routesMeta.map(r=>r.childrenIndex),t.routesMeta.map(r=>r.childrenIndex)))}const Np=/^:\w+$/,_p=3,Pp=2,Tp=1,Ip=10,Lp=-2,us=e=>e==="*";function Rp(e,n){let t=e.split("/"),r=t.length;return t.some(us)&&(r+=Lp),n&&(r+=Pp),t.filter(u=>!us(u)).reduce((u,l)=>u+(Np.test(l)?_p:l===""?Tp:Ip),r)}function zp(e,n){return e.length===n.length&&e.slice(0,-1).every((r,u)=>r===n[u])?e[e.length-1]-n[n.length-1]:0}function bp(e,n){let{routesMeta:t}=e,r={},u="/",l=[];for(let i=0;i<t.length;++i){let o=t[i],s=i===t.length-1,c=u==="/"?n:n.slice(u.length)||"/",h=Op({path:o.relativePath,caseSensitive:o.caseSensitive,end:s},c);if(!h)return null;Object.assign(r,h.params);let m=o.route;l.push({params:r,pathname:_n([u,h.pathname]),pathnameBase:_d(_n([u,h.pathnameBase])),route:m}),h.pathnameBase!=="/"&&(u=_n([u,h.pathnameBase]))}return l}function Op(e,n){typeof e=="string"&&(e={path:e,caseSensitive:!1,end:!0});let[t,r]=Mp(e.path,e.caseSensitive,e.end),u=n.match(t);if(!u)return null;let l=u[0],i=l.replace(/(.)\/+$/,"$1"),o=u.slice(1);return{params:r.reduce((c,h,m)=>{if(h==="*"){let p=o[m]||"";i=l.slice(0,l.length-p.length).replace(/(.)\/+$/,"$1")}return c[h]=$p(o[m]||""),c},{}),pathname:l,pathnameBase:i,pattern:e}}function Mp(e,n,t){n===void 0&&(n=!1),t===void 0&&(t=!0);let r=[],u="^"+e.replace(/\/*\*?$/,"").replace(/^\/*/,"/").replace(/[\\.*+^$?{}|()[\]]/g,"\\$&").replace(/:(\w+)/g,(i,o)=>(r.push(o),"([^\\/]+)"));return e.endsWith("*")?(r.push("*"),u+=e==="*"||e==="/*"?"(.*)$":"(?:\\/(.+)|\\/*)$"):u+=t?"\\/*$":"(?:(?=[.~-]|%[0-9A-F]{2})|\\b|\\/|$)",[new RegExp(u,n?void 0:"i"),r]}function $p(e,n){try{return decodeURIComponent(e)}catch{return e}}function jp(e,n){n===void 0&&(n="/");let{pathname:t,search:r="",hash:u=""}=typeof e=="string"?In(e):e;return{pathname:t?t.startsWith("/")?t:Up(t,n):n,search:Vp(r),hash:Hp(u)}}function Up(e,n){let t=n.replace(/\/+$/,"").split("/");return e.split("/").forEach(u=>{u===".."?t.length>1&&t.pop():u!=="."&&t.push(u)}),t.length>1?t.join("/"):"/"}function Dd(e,n,t){let r=typeof e=="string"?In(e):e,u=e===""||r.pathname===""?"/":r.pathname,l;if(u==null)l=t;else{let o=n.length-1;if(u.startsWith("..")){let s=u.split("/");for(;s[0]==="..";)s.shift(),o-=1;r.pathname=s.join("/")}l=o>=0?n[o]:"/"}let i=jp(r,l);return u&&u!=="/"&&u.endsWith("/")&&!i.pathname.endsWith("/")&&(i.pathname+="/"),i}function Wp(e){return e===""||e.pathname===""?"/":typeof e=="string"?In(e).pathname:e.pathname}function Nd(e,n){if(n==="/")return e;if(!e.toLowerCase().startsWith(n.toLowerCase()))return null;let t=e.charAt(n.length);return t&&t!=="/"?null:e.slice(n.length)||"/"}const _n=e=>e.join("/").replace(/\/\/+/g,"/"),_d=e=>e.replace(/\/+$/,"").replace(/^\/*/,"/"),Vp=e=>!e||e==="?"?"":e.startsWith("?")?e:"?"+e,Hp=e=>!e||e==="#"?"":e.startsWith("#")?e:"#"+e;function Qp(e){Lt()||Ge(!1);let{basename:n,navigator:t}=P.exports.useContext(zo),{hash:r,pathname:u,search:l}=Oo(e),i=u;if(n!=="/"){let o=Wp(e),s=o!=null&&o.endsWith("/");i=u==="/"?n+(s?"/":""):_n([n,u])}return t.createHref({pathname:i,search:l,hash:r})}function Lt(){return P.exports.useContext(bo)!=null}function Mn(){return Lt()||Ge(!1),P.exports.useContext(bo).location}function rl(){Lt()||Ge(!1);let{basename:e,navigator:n}=P.exports.useContext(zo),{matches:t}=P.exports.useContext(Nr),{pathname:r}=Mn(),u=JSON.stringify(t.map(o=>o.pathnameBase)),l=P.exports.useRef(!1);return P.exports.useEffect(()=>{l.current=!0}),P.exports.useCallback(function(o,s){if(s===void 0&&(s={}),!l.current)return;if(typeof o=="number"){n.go(o);return}let c=Dd(o,JSON.parse(u),r);e!=="/"&&(c.pathname=_n([e,c.pathname])),(s.replace?n.replace:n.push)(c,s.state)},[e,n,u,r])}function Gp(){let{matches:e}=P.exports.useContext(Nr),n=e[e.length-1];return n?n.params:{}}function Oo(e){let{matches:n}=P.exports.useContext(Nr),{pathname:t}=Mn(),r=JSON.stringify(n.map(u=>u.pathnameBase));return P.exports.useMemo(()=>Dd(e,JSON.parse(r),t),[e,r,t])}function Kp(e,n){Lt()||Ge(!1);let{matches:t}=P.exports.useContext(Nr),r=t[t.length-1],u=r?r.params:{};r&&r.pathname;let l=r?r.pathnameBase:"/";r&&r.route;let i=Mn(),o;if(n){var s;let p=typeof n=="string"?In(n):n;l==="/"||((s=p.pathname)==null?void 0:s.startsWith(l))||Ge(!1),o=p}else o=i;let c=o.pathname||"/",h=l==="/"?c:c.slice(l.length)||"/",m=Bp(e,{pathname:h});return Yp(m&&m.map(p=>Object.assign({},p,{params:Object.assign({},u,p.params),pathname:_n([l,p.pathname]),pathnameBase:p.pathnameBase==="/"?l:_n([l,p.pathnameBase])})),t)}function Yp(e,n){return n===void 0&&(n=[]),e==null?null:e.reduceRight((t,r,u)=>P.exports.createElement(Nr.Provider,{children:r.route.element!==void 0?r.route.element:t,value:{outlet:t,matches:n.concat(e.slice(0,u+1))}}),null)}function Jp(e){let{to:n,replace:t,state:r}=e;Lt()||Ge(!1);let u=rl();return P.exports.useEffect(()=>{u(n,{replace:t,state:r})}),null}function Ie(e){Ge(!1)}function Zp(e){let{basename:n="/",children:t=null,location:r,navigationType:u=Gn.Pop,navigator:l,static:i=!1}=e;Lt()&&Ge(!1);let o=_d(n),s=P.exports.useMemo(()=>({basename:o,navigator:l,static:i}),[o,l,i]);typeof r=="string"&&(r=In(r));let{pathname:c="/",search:h="",hash:m="",state:p=null,key:v="default"}=r,w=P.exports.useMemo(()=>{let F=Nd(c,o);return F==null?null:{pathname:F,search:h,hash:m,state:p,key:v}},[o,c,h,m,p,v]);return w==null?null:P.exports.createElement(zo.Provider,{value:s},P.exports.createElement(bo.Provider,{children:t,value:{location:w,navigationType:u}}))}function qp(e){let{children:n,location:t}=e;return Kp(zi(n),t)}function zi(e){let n=[];return P.exports.Children.forEach(e,t=>{if(!P.exports.isValidElement(t))return;if(t.type===P.exports.Fragment){n.push.apply(n,zi(t.props.children));return}t.type!==Ie&&Ge(!1);let r={caseSensitive:t.props.caseSensitive,element:t.props.element,index:t.props.index,path:t.props.path};t.props.children&&(r.children=zi(t.props.children)),n.push(r)}),n}/**
 * React Router DOM v6.3.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function Ou(){return Ou=Object.assign||function(e){for(var n=1;n<arguments.length;n++){var t=arguments[n];for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&(e[r]=t[r])}return e},Ou.apply(this,arguments)}function Pd(e,n){if(e==null)return{};var t={},r=Object.keys(e),u,l;for(l=0;l<r.length;l++)u=r[l],!(n.indexOf(u)>=0)&&(t[u]=e[u]);return t}const Xp=["onClick","reloadDocument","replace","state","target","to"],eh=["aria-current","caseSensitive","className","end","style","to","children"];function nh(e){let{basename:n,children:t,window:r}=e,u=P.exports.useRef();u.current==null&&(u.current=Ap({window:r}));let l=u.current,[i,o]=P.exports.useState({action:l.action,location:l.location});return P.exports.useLayoutEffect(()=>l.listen(o),[l]),P.exports.createElement(Zp,{basename:n,children:t,location:i.location,navigationType:i.action,navigator:l})}function th(e){return!!(e.metaKey||e.altKey||e.ctrlKey||e.shiftKey)}const on=P.exports.forwardRef(function(n,t){let{onClick:r,reloadDocument:u,replace:l=!1,state:i,target:o,to:s}=n,c=Pd(n,Xp),h=Qp(s),m=rh(s,{replace:l,state:i,target:o});function p(v){r&&r(v),!v.defaultPrevented&&!u&&m(v)}return P.exports.createElement("a",Ou({},c,{href:h,onClick:p,ref:t,target:o}))}),Kt=P.exports.forwardRef(function(n,t){let{"aria-current":r="page",caseSensitive:u=!1,className:l="",end:i=!1,style:o,to:s,children:c}=n,h=Pd(n,eh),m=Mn(),p=Oo(s),v=m.pathname,w=p.pathname;u||(v=v.toLowerCase(),w=w.toLowerCase());let F=v===w||!i&&v.startsWith(w)&&v.charAt(w.length)==="/",I=F?r:void 0,f;typeof l=="function"?f=l({isActive:F}):f=[l,F?"active":null].filter(Boolean).join(" ");let d=typeof o=="function"?o({isActive:F}):o;return P.exports.createElement(on,Ou({},h,{"aria-current":I,className:f,ref:t,style:d,to:s}),typeof c=="function"?c({isActive:F}):c)});function rh(e,n){let{target:t,replace:r,state:u}=n===void 0?{}:n,l=rl(),i=Mn(),o=Oo(e);return P.exports.useCallback(s=>{if(s.button===0&&(!t||t==="_self")&&!th(s)){s.preventDefault();let c=!!r||ur(i)===ur(o);l(e,{replace:c,state:u})}},[i,l,o,r,u,t,e])}function uh(){const{pathname:e}=Mn();return P.exports.useEffect(()=>{window.scrollTo(0,0)},[e]),null}const Mo=[{label:"\u4EA7\u54C1",to:"/product"},{label:"\u89E3\u51B3\u65B9\u6848",to:"/solutions"},{label:"\u6570\u5B57\u5B6A\u751F",to:"/digital-twin"},{label:"\u5173\u4E8E\u6211\u4EEC",to:"/about"},{label:"\u8054\u7CFB\u6211\u4EEC",to:"/contact"},{label:"\u6587\u6863\u8BF4\u660E",to:"/docs"}],bi="1478838114@qq.com",Ee="/platform/",rt="/platform/assistant",lr="/platform/digital-twin";var lh="/assets/brand-logo.png",ul={exports:{}},ll={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var ih=P.exports,oh=Symbol.for("react.element"),ah=Symbol.for("react.fragment"),sh=Object.prototype.hasOwnProperty,ch=ih.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,dh={key:!0,ref:!0,__self:!0,__source:!0};function Td(e,n,t){var r,u={},l=null,i=null;t!==void 0&&(l=""+t),n.key!==void 0&&(l=""+n.key),n.ref!==void 0&&(i=n.ref);for(r in n)sh.call(n,r)&&!dh.hasOwnProperty(r)&&(u[r]=n[r]);if(e&&e.defaultProps)for(r in n=e.defaultProps,n)u[r]===void 0&&(u[r]=n[r]);return{$$typeof:oh,type:e,key:l,ref:i,props:u,_owner:ch.current}}ll.Fragment=ah;ll.jsx=Td;ll.jsxs=Td;ul.exports=ll;const a=ul.exports.jsx,y=ul.exports.jsxs,q=ul.exports.Fragment;function Id({inverse:e=!1,compact:n=!1}){return y("span",{className:"inline-flex min-w-max items-center gap-3",children:[a("span",{className:`${n?"h-10 w-10":"h-11 w-11"} relative block shrink-0 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5`,children:a("img",{src:lh,alt:"","aria-hidden":"true",className:"absolute left-1/2 top-0 w-[138%] max-w-none -translate-x-1/2"})}),y("span",{className:"flex flex-col leading-none",children:[a("strong",{className:`${n?"text-base":"text-lg"} font-semibold tracking-tight ${e?"text-white":"text-ink"}`,children:"\u7530\u8A00\u8015\u667A"}),!n&&a("small",{className:`mt-1.5 text-[10px] font-light tracking-[0.12em] ${e?"text-white/65":"text-muted"}`,children:"\u667A\u6167\u519C\u4E1A AI \u5E73\u53F0"})]})]})}const Ml="ease-[cubic-bezier(0.76,0,0.24,1)]";function fh({open:e,onClose:n}){return P.exports.useEffect(()=>(document.body.style.overflow=e?"hidden":"",()=>{document.body.style.overflow=""}),[e]),y("div",{className:`fixed inset-0 z-50 transition-opacity duration-700 ${Ml} md:hidden ${e?"opacity-100":"pointer-events-none opacity-0"}`,children:[a("div",{className:"absolute inset-0 bg-white/95 backdrop-blur-xl"}),y("div",{className:"relative z-10 flex h-full flex-col px-6 py-5",children:[y("div",{className:"flex items-center justify-between",children:[a(Kt,{to:"/",onClick:n,"aria-label":"\u7530\u8A00\u8015\u667A\u9996\u9875",children:a(Id,{compact:!0})}),y("button",{type:"button","aria-label":"\u5173\u95ED\u83DC\u5355",onClick:n,className:"relative h-6 w-6 focus:outline-none",children:[a("span",{className:"absolute left-0 top-1/2 h-[2px] w-6 -translate-y-1/2 rounded-full bg-ink rotate-45"}),a("span",{className:"absolute left-0 top-1/2 h-[2px] w-6 -translate-y-1/2 rounded-full bg-ink -rotate-45"})]})]}),a("nav",{className:"flex flex-1 flex-col items-center justify-center",children:Mo.map((t,r)=>a(Kt,{to:t.to,onClick:n,className:({isActive:u})=>`w-full py-4 text-center border-b border-slate-100 text-4xl sm:text-5xl font-instrument-serif transition-all duration-700 ${Ml} hover:pl-4 ${u?"text-brand-dark":"text-ink"} ${e?"translate-y-0 opacity-100":"translate-y-8 opacity-0"}`,style:{transitionDelay:e?`${150+r*80}ms`:"0ms"},children:t.label},t.to))}),y("div",{className:`pb-10 transition-all duration-700 ${Ml} ${e?"translate-y-0 opacity-100":"translate-y-8 opacity-0"}`,style:{transitionDelay:e?"550ms":"0ms"},children:[y("div",{className:"mb-5 flex justify-center gap-8 text-sm font-light text-muted",children:[a(Kt,{to:"/sign-in",onClick:n,className:"transition-colors hover:text-ink",children:"\u767B\u5F55"}),a(Kt,{to:"/sign-up",onClick:n,className:"transition-colors hover:text-ink",children:"\u6CE8\u518C"})]}),a("a",{href:Ee,onClick:n,className:"block w-full rounded-full bg-emerald-600 py-4 text-center font-medium text-white",children:"\u8FDB\u5165\u5E73\u53F0"})]})]})]})}const $l="ease-[cubic-bezier(0.76,0,0.24,1)]";function ph(){const[e,n]=P.exports.useState(!1),{pathname:t}=Mn(),r=t==="/";return y(q,{children:[a("header",{className:`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${r?"bg-gradient-to-b from-black/60 to-transparent":"border-b border-slate-200/80 bg-white/90 backdrop-blur-xl"}`,children:y("nav",{className:"flex items-center justify-between px-6 py-5 md:px-12 md:py-6 lg:px-16",children:[y("div",{className:"flex items-center gap-10",children:[a(on,{to:"/",className:`font-semibold text-lg tracking-tight ${r?"text-white":"text-ink"}`,children:"\u7530\u8A00\u8015\u667A"}),a("div",{className:"hidden items-center gap-8 md:flex",children:Mo.map(u=>a(Kt,{to:u.to,className:({isActive:l})=>`text-sm font-light transition-colors duration-200 ${l?"font-medium text-brand-dark":r?"text-white/80 hover:text-white":"text-muted hover:text-ink"}`,children:u.label},u.to))})]}),y("div",{className:"flex items-center gap-6",children:[a(on,{to:"/sign-in",className:`hidden text-sm font-light transition-colors duration-200 md:inline-block ${r?"text-white/80 hover:text-white":"text-muted hover:text-ink"}`,children:"\u767B\u5F55"}),a("a",{href:Ee,className:`hidden rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 md:inline-block ${r?"bg-white text-black hover:bg-white/90":"bg-emerald-600 text-white hover:bg-emerald-700"}`,children:"\u8FDB\u5165\u5E73\u53F0"}),y("button",{type:"button","aria-label":e?"\u5173\u95ED\u83DC\u5355":"\u6253\u5F00\u83DC\u5355","aria-expanded":e,onClick:()=>n(u=>!u),className:"relative h-6 w-6 focus:outline-none md:hidden",children:[a("span",{className:`absolute left-0 top-0 h-[2px] w-6 rounded-full transition-all duration-500 ${$l} ${r?"bg-white":"bg-ink"} ${e?"top-1/2 -translate-y-1/2 rotate-45":""}`}),a("span",{className:`absolute left-0 top-1/2 h-[2px] w-4 -translate-y-1/2 rounded-full transition-all duration-500 ${$l} ${r?"bg-white":"bg-ink"} ${e?"opacity-0":""}`}),a("span",{className:`absolute bottom-0 left-0 h-[2px] w-6 rounded-full transition-all duration-500 ${$l} ${r?"bg-white":"bg-ink"} ${e?"top-1/2 -translate-y-1/2 -rotate-45":""}`})]})]})]})}),a(fh,{open:e,onClose:()=>n(!1)})]})}const hh=[{label:"\u6570\u636E\u5DE5\u4F5C\u53F0",href:Ee},{label:"\u667A\u80FD\u95EE\u519C",href:rt},{label:"\u6570\u5B57\u5B6A\u751F",href:lr}];function mh(){return a("footer",{className:"site-footer",children:y("div",{className:"footer-shell",children:[y("div",{className:"footer-grid",children:[y("section",{className:"footer-brand",children:[a("div",{className:"footer-wordmark",children:a(Id,{})}),a("p",{children:"AI \u539F\u751F\u667A\u6167\u519C\u4E1A\u4E0E\u6570\u5B57\u5B6A\u751F\u5E73\u53F0\u3002\u4E0D\u7528\u5BFB\u627E\u6570\u636E\uFF0C\u76F4\u63A5\u8BE2\u95EE\u6570\u636E\uFF1B\u4E0D\u5FC5\u6D4F\u89C8\u62A5\u8868\uFF0C\u76F4\u63A5\u8FDB\u5165\u519C\u573A\u3002"}),y("a",{className:"footer-cta",href:Ee,children:["\u8FDB\u5165\u667A\u6167\u519C\u573A ",a("span",{children:"\u2197"})]})]}),y("nav",{className:"footer-column","aria-label":"\u5B98\u7F51\u5BFC\u822A",children:[a("h3",{children:"\u63A2\u7D22\u5B98\u7F51"}),a("ul",{children:Mo.map(e=>a("li",{children:a(on,{to:e.to,children:e.label})},e.to))})]}),y("nav",{className:"footer-column","aria-label":"\u5E73\u53F0\u5165\u53E3",children:[a("h3",{children:"\u4EA7\u54C1\u80FD\u529B"}),a("ul",{children:hh.map(e=>a("li",{children:a("a",{href:e.href,children:e.label})},e.href))})]}),y("nav",{className:"footer-column","aria-label":"\u8054\u7CFB\u4FE1\u606F",children:[a("h3",{children:"\u5173\u4E8E\u6211\u4EEC"}),y("ul",{children:[a("li",{children:a(on,{to:"/about",children:"\u5E73\u53F0\u613F\u666F"})}),a("li",{children:a(on,{to:"/solutions",children:"\u884C\u4E1A\u65B9\u6848"})}),a("li",{children:a(on,{to:"/contact",children:"\u8054\u7CFB\u6211\u4EEC"})})]})]})]}),y("div",{className:"footer-meta",children:[a("span",{children:"\xA9 2026 \u7530\u8A00\u8015\u667A"}),y("span",{className:"footer-status",children:[a("i",{}),"\u6240\u6709\u670D\u52A1\u8FD0\u884C\u6B63\u5E38"]}),a("span",{children:"\u667A\u6167\u519C\u4E1A \xB7 AI \u539F\u751F"})]})]})})}var gh={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};const yh=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),vh=(e,n)=>{const t=P.exports.forwardRef(({color:r="currentColor",size:u=24,strokeWidth:l=2,absoluteStrokeWidth:i,children:o,...s},c)=>P.exports.createElement("svg",{ref:c,...gh,width:u,height:u,stroke:r,strokeWidth:i?Number(l)*24/Number(u):l,className:`lucide lucide-${yh(e)}`,...s},[...n.map(([h,m])=>P.exports.createElement(h,m)),...(Array.isArray(o)?o:[o])||[]]));return t.displayName=`${e}`,t};var M=vh;const Eh=M("ArrowLeft",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]]),nn=M("ArrowRight",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]]),Ld=M("Bell",[["path",{d:"M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9",key:"1qo2s2"}],["path",{d:"M10.3 21a1.94 1.94 0 0 0 3.4 0",key:"qgo35s"}]]),Rd=M("BookOpen",[["path",{d:"M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z",key:"vv98re"}],["path",{d:"M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z",key:"1cyq3y"}]]),zd=M("Bot",[["rect",{width:"18",height:"10",x:"3",y:"11",rx:"2",key:"1ofdy3"}],["circle",{cx:"12",cy:"5",r:"2",key:"f1ur92"}],["path",{d:"M12 7v4",key:"xawao1"}],["line",{x1:"8",x2:"8",y1:"16",y2:"16",key:"h6x27f"}],["line",{x1:"16",x2:"16",y1:"16",y2:"16",key:"5lty7f"}]]),$o=M("Boxes",[["path",{d:"M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z",key:"lc1i9w"}],["path",{d:"m7 16.5-4.74-2.85",key:"1o9zyk"}],["path",{d:"m7 16.5 5-3",key:"va8pkn"}],["path",{d:"M7 16.5v5.17",key:"jnp8gn"}],["path",{d:"M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z",key:"8zsnat"}],["path",{d:"m17 16.5-5-3",key:"8arw3v"}],["path",{d:"m17 16.5 4.74-2.85",key:"8rfmw"}],["path",{d:"M17 16.5v5.17",key:"k6z78m"}],["path",{d:"M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z",key:"1xygjf"}],["path",{d:"M12 8 7.26 5.15",key:"1vbdud"}],["path",{d:"m12 8 4.74-2.85",key:"3rx089"}],["path",{d:"M12 13.5V8",key:"1io7kd"}]]),Oi=M("Camera",[["path",{d:"M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z",key:"1tc9qg"}],["circle",{cx:"12",cy:"13",r:"3",key:"1vg3eu"}]]),xh=M("CheckCircle2",[["path",{d:"M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",key:"14v8dr"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]),Mu=M("Check",[["polyline",{points:"20 6 9 17 4 12",key:"10jjfj"}]]),Fh=M("Clock3",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["polyline",{points:"12 6 12 12 16.5 12",key:"1aq6pp"}]]),bd=M("Code2",[["path",{d:"m18 16 4-4-4-4",key:"1inbqp"}],["path",{d:"m6 8-4 4 4 4",key:"15zrgr"}],["path",{d:"m14.5 4-5 16",key:"e7oirm"}]]),Od=M("Cpu",[["rect",{x:"4",y:"4",width:"16",height:"16",rx:"2",key:"1vbyd7"}],["rect",{x:"9",y:"9",width:"6",height:"6",key:"o3kz5p"}],["path",{d:"M15 2v2",key:"13l42r"}],["path",{d:"M15 20v2",key:"15mkzm"}],["path",{d:"M2 15h2",key:"1gxd5l"}],["path",{d:"M2 9h2",key:"1bbxkp"}],["path",{d:"M20 15h2",key:"19e6y8"}],["path",{d:"M20 9h2",key:"19tzq7"}],["path",{d:"M9 2v2",key:"165o2o"}],["path",{d:"M9 20v2",key:"i2bqo8"}]]),Md=M("Droplets",[["path",{d:"M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z",key:"1ptgy4"}],["path",{d:"M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97",key:"1sl1rz"}]]),ls=M("EyeOff",[["path",{d:"M9.88 9.88a3 3 0 1 0 4.24 4.24",key:"1jxqfv"}],["path",{d:"M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68",key:"9wicm4"}],["path",{d:"M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61",key:"1jreej"}],["line",{x1:"2",x2:"22",y1:"2",y2:"22",key:"a6p6uj"}]]),Mi=M("Eye",[["path",{d:"M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z",key:"rwhkz3"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]),wh=M("LayoutDashboard",[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]]),kh=M("LayoutGrid",[["rect",{width:"7",height:"7",x:"3",y:"3",rx:"1",key:"1g98yp"}],["rect",{width:"7",height:"7",x:"14",y:"3",rx:"1",key:"6d4xhi"}],["rect",{width:"7",height:"7",x:"14",y:"14",rx:"1",key:"nxv5o0"}],["rect",{width:"7",height:"7",x:"3",y:"14",rx:"1",key:"1bb6yr"}]]),Ch=M("LineChart",[["path",{d:"M3 3v18h18",key:"1s2lah"}],["path",{d:"m19 9-5 5-4-4-3 3",key:"2osh9i"}]]),Ah=M("Loader2",[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]]),Sh=M("Mail",[["rect",{width:"20",height:"16",x:"2",y:"4",rx:"2",key:"18n3k1"}],["path",{d:"m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7",key:"1ocrg3"}]]),Bh=M("MapPin",[["path",{d:"M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z",key:"2oe9fu"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]]),Dh=M("Moon",[["path",{d:"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z",key:"a7tn18"}]]),$d=M("Play",[["polygon",{points:"5 3 19 12 5 21 5 3",key:"191637"}]]),Nh=M("Quote",[["path",{d:"M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z",key:"4rm80e"}],["path",{d:"M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z",key:"10za9r"}]]),_h=M("Radar",[["path",{d:"M19.07 4.93A10 10 0 0 0 6.99 3.34",key:"z3du51"}],["path",{d:"M4 6h.01",key:"oypzma"}],["path",{d:"M2.29 9.62A10 10 0 1 0 21.31 8.35",key:"qzzz0"}],["path",{d:"M16.24 7.76A6 6 0 1 0 8.23 16.67",key:"1yjesh"}],["path",{d:"M12 18h.01",key:"mhygvu"}],["path",{d:"M17.99 11.66A6 6 0 0 1 15.77 16.67",key:"1u2y91"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}],["path",{d:"m13.41 10.59 5.66-5.66",key:"mhq4k0"}]]),Ph=M("RefreshCw",[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]]),Th=M("Send",[["path",{d:"m22 2-7 20-4-9-9-4Z",key:"1q3vgg"}],["path",{d:"M22 2 11 13",key:"nzbqef"}]]),jd=M("Sprout",[["path",{d:"M7 20h10",key:"e6iznv"}],["path",{d:"M10 20c5.5-2.5.8-6.4 3-10",key:"161w41"}],["path",{d:"M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z",key:"9gtqwd"}],["path",{d:"M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z",key:"bkxnd2"}]]),Ih=M("Sun",[["circle",{cx:"12",cy:"12",r:"4",key:"4exip2"}],["path",{d:"M12 2v2",key:"tus03m"}],["path",{d:"M12 20v2",key:"1lh1kg"}],["path",{d:"m4.93 4.93 1.41 1.41",key:"149t6j"}],["path",{d:"m17.66 17.66 1.41 1.41",key:"ptbguv"}],["path",{d:"M2 12h2",key:"1t8f8n"}],["path",{d:"M20 12h2",key:"1q8mjw"}],["path",{d:"m6.34 17.66-1.41 1.41",key:"1m8zz5"}],["path",{d:"m19.07 4.93-1.41 1.41",key:"1shlcs"}]]),Ud=M("Thermometer",[["path",{d:"M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z",key:"17jzev"}]]),Lh=M("Upload",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"17 8 12 3 7 8",key:"t8dd8p"}],["line",{x1:"12",x2:"12",y1:"3",y2:"15",key:"widbto"}]]),Wd=M("Users",[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["path",{d:"M16 3.13a4 4 0 0 1 0 7.75",key:"1da9ce"}]]),Rh=M("Video",[["path",{d:"m22 8-6 4 6 4V8Z",key:"50v9me"}],["rect",{width:"14",height:"12",x:"2",y:"6",rx:"2",ry:"2",key:"1rqjg6"}]]),zh=M("Workflow",[["rect",{width:"8",height:"8",x:"3",y:"3",rx:"2",key:"by2w9f"}],["path",{d:"M7 11v4a2 2 0 0 0 2 2h4",key:"xkn7yn"}],["rect",{width:"8",height:"8",x:"13",y:"13",rx:"2",key:"1cgmvn"}]]),bh=M("Wrench",[["path",{d:"M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",key:"cbrjhi"}]]),Oh=M("XCircle",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]]),Mh="/assets/home-hero.mp4";function is(){return y("section",{className:"relative h-screen w-full overflow-hidden",children:[y("div",{className:"absolute inset-0",children:[a("video",{autoPlay:!0,muted:!0,loop:!0,playsInline:!0,preload:"auto",poster:"/assets/farm-aerial.png",src:Mh,className:"h-full w-full object-cover"}),a("div",{className:"absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-black/65"})]}),a("div",{className:"relative z-10 flex h-full flex-col",children:y("div",{className:"flex flex-1 flex-col items-center justify-center px-6 text-center -translate-y-10 sm:-translate-y-14",children:[y("h1",{className:"font-instrument-serif max-w-5xl text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[1.1]",children:["AI \u539F\u751F ",a("span",{className:"italic",children:"\u4E0E"})," \u6570\u5B57\u5B6A\u751F",a("br",{}),"\u4E13\u4E3A ",a("span",{className:"italic",children:"\u73B0\u4EE3\u519C\u4E1A"})," \u6253\u9020",a("br",{}),"\u8BA9\u8015\u79CD\u66F4\u667A\u6167"]}),y("p",{className:"mt-4 max-w-md font-light text-sm text-white/70 leading-relaxed md:mt-5 md:text-base",children:["\u6211\u4EEC\u4EE5\u81EA\u7136\u8BED\u8A00\u4E3A\u5165\u53E3\uFF0C\u4EE5\u519C\u573A\u7A7A\u95F4\u4E3A\u4E3B\u754C\u9762",a("br",{className:"hidden sm:block"}),"\u7528\u6570\u636E\u3001\u89C6\u89C9\u8BC6\u522B\u4E0E AI\uFF0C\u8986\u76D6\u79CD\u690D\u5230\u519C\u4E8B\u6267\u884C"]}),y("div",{className:"mt-5 flex flex-col items-center gap-4 sm:flex-row md:mt-6",children:[y("a",{href:Ee,className:"group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-medium text-black transition-colors duration-200 hover:bg-white/90",children:["\u8FDB\u5165\u5E73\u53F0",a(nn,{className:"h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"})]}),y("a",{href:rt,className:"inline-flex items-center gap-2 rounded-full border border-white/40 px-7 py-3 text-sm font-medium text-white transition-colors duration-200 hover:border-white/60 hover:bg-white/10",children:[a($d,{className:"h-4 w-4"}),"\u4F53\u9A8C\u667A\u80FD\u95EE\u519C"]})]})]})})]})}function Vd({children:e}){return y("span",{className:"inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-emerald-700",children:[a("span",{className:"h-1.5 w-1.5 rounded-full bg-emerald-500"}),e]})}function Rt({eyebrow:e,title:n,subtitle:t,children:r}){return y("section",{className:"relative overflow-hidden px-6 pt-32 pb-14 md:px-12 md:pt-40 lg:px-16",children:[a("div",{className:"pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.12),transparent_62%)]"}),a("div",{className:"pointer-events-none absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-100/70 blur-[120px]"}),y("div",{className:"relative mx-auto max-w-4xl text-center",children:[a(Vd,{children:e}),a("h1",{className:"mt-6 font-instrument-serif text-ink text-4xl leading-[1.12] sm:text-5xl md:text-6xl",children:n}),t&&a("p",{className:"mx-auto mt-5 max-w-2xl font-light text-muted leading-relaxed md:text-lg",children:t}),r&&a("div",{className:"mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row",children:r})]})]})}const $h={emerald:"bg-emerald-100 text-emerald-700",amber:"bg-amber-100 text-amber-700",sky:"bg-sky-100 text-sky-700",violet:"bg-violet-100 text-violet-700",rose:"bg-rose-100 text-rose-700",teal:"bg-teal-100 text-teal-700"};function kr({icon:e,tone:n="emerald",className:t=""}){return a("div",{className:`flex h-11 w-11 items-center justify-center rounded-xl ${$h[n]} ${t}`,children:a(e,{className:"h-5 w-5",strokeWidth:1.8})})}function il({href:e,children:n,className:t=""}){return y("a",{href:e,className:`group inline-flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-3.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-600/20 ${t}`,children:[n,a(nn,{className:"h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"})]})}function ol({href:e,children:n,className:t=""}){return a("a",{href:e,className:`inline-flex items-center gap-2 rounded-full border border-slate-300 px-8 py-3.5 text-sm font-medium text-ink transition-all duration-200 hover:border-emerald-400 hover:bg-emerald-50 ${t}`,children:n})}function al({stats:e}){return a("section",{className:"bg-gradient-to-r from-emerald-50 via-sky-50 to-emerald-50 px-6 py-16 md:px-12 lg:px-16",children:a("div",{className:"mx-auto grid max-w-6xl grid-cols-2 gap-10 md:grid-cols-4",children:e.map(n=>y("div",{className:"text-center",children:[a("p",{className:"font-instrument-serif text-4xl text-emerald-600 md:text-5xl",children:n.value}),a("p",{className:"mt-2 text-[11px] font-medium uppercase tracking-widest text-muted",children:n.label})]},n.value))})})}function sl({title:e,subtitle:n,href:t,label:r}){return a("section",{className:"px-6 pb-24 md:px-12 lg:px-16",children:y("div",{className:"relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 px-8 py-16 text-center shadow-2xl shadow-emerald-600/20 md:py-20",children:[a("div",{className:"pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-[90px]"}),a("div",{className:"pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-white/10 blur-[90px]"}),a("h2",{className:"relative font-instrument-serif text-3xl text-white sm:text-4xl",children:e}),n&&a("p",{className:"relative mx-auto mt-4 max-w-xl font-light text-white/80 leading-relaxed",children:n}),a("div",{className:"relative mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row",children:y("a",{href:t,className:"group inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-emerald-700 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/10",children:[r,a(nn,{className:"h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"})]})})]})})}function en({eyebrow:e,title:n,subtitle:t}){return y("div",{className:"mx-auto max-w-2xl text-center",children:[a(Vd,{children:e}),a("h2",{className:"mt-4 font-instrument-serif text-3xl text-ink sm:text-4xl",children:n}),t&&a("p",{className:"mt-3 font-light text-muted leading-relaxed",children:t})]})}const jh=[{icon:wh,tone:"emerald",name:"\u6570\u636E\u5DE5\u4F5C\u53F0",desc:"\u4EE5\u5168\u5C4F\u519C\u573A\u822A\u62CD\u5B9E\u666F\u4E3A\u754C\u9762\uFF0C\u5730\u5757\u3001\u6E29\u5BA4\u3001\u6C14\u8C61\u7AD9\u3001\u84C4\u6C34\u6C60\u3001\u8BBE\u5907\u3001\u6444\u50CF\u5934\u4E0E\u673A\u5668\u4EBA\u5747\u53EF\u70B9\u9009\u4EA4\u4E92\u3002",points:["Hover \u9884\u89C8 \xB7 \u5355\u51FB\u8BE6\u60C5 \xB7 \u53CC\u51FB\u805A\u7126","2.5D \u5B9E\u666F\u4E0E 3D \u53CC\u89C6\u56FE\u5207\u6362","\u7A7A\u95F4\u5BF9\u8C61\u5B9E\u65F6\u72B6\u6001\u4E0E\u4E0A\u4E0B\u6587\u62BD\u5C49"],href:Ee,cta:"\u8FDB\u5165\u6570\u636E\u5DE5\u4F5C\u53F0"},{icon:zd,tone:"sky",name:"\u667A\u80FD\u95EE\u519C",desc:"\u4EE5\u81EA\u7136\u8BED\u8A00\u4E3A\u5165\u53E3\uFF0C\u4E00\u53E5\u8BDD\u83B7\u53D6\u6570\u636E\u3001\u56FE\u8868\u3001\u5206\u6790\u4E0E\u64CD\u4F5C\u5EFA\u8BAE\uFF0C\u4E0D\u518D\u9700\u8981\u5BFB\u627E\u83DC\u5355\u3002",points:["\u4E00\u53E5\u8BDD\u83B7\u53D6\u5B9E\u65F6\u6307\u6807","24 \u5C0F\u65F6\u8D8B\u52BF\u4E0E\u5F02\u5E38\u6807\u8BB0","AI \u5EFA\u8BAE\u4E0E\u884C\u52A8\u5165\u53E3"],href:rt,cta:"\u4F53\u9A8C\u667A\u80FD\u95EE\u519C"},{icon:$o,tone:"violet",name:"\u6570\u5B57\u5B6A\u751F",desc:"2.5D \u822A\u62CD\u5B9E\u666F\u4E0E Three.js WebGL \u6570\u5B57\u5B6A\u751F\u5171\u7528\u5BF9\u8C61 ID \u4E0E\u7A7A\u95F4\u5750\u6807\uFF0C\u7B2C\u4E00\u4EBA\u79F0\u5DE1\u573A\u8EAB\u4E34\u5176\u5883\u3002",points:["\u5171\u7528\u7A7A\u95F4\u5750\u6807\u4E0E\u5BF9\u8C61 ID","\u7B2C\u4E00\u4EBA\u79F0\u5DE1\u573A\u6A21\u5F0F","\u663C\u591C\u5149\u7167\u4E0E\u672C\u5730 3D \u516C\u6A21"],href:lr,cta:"\u8FDB\u5165\u6570\u5B57\u5B6A\u751F"}],Uh=[{icon:kh,tone:"sky",name:"\u603B\u89C8",desc:"\u56ED\u533A\u6574\u4F53\u72B6\u6001\u4E00\u5C4F\u5C3D\u89C8"},{icon:Rh,tone:"violet",name:"\u56ED\u533A\u76D1\u63A7",desc:"\u6E29\u5BA4\u4E0E\u79CD\u690D\u533A\u5B9E\u65F6\u753B\u9762"},{icon:Ud,tone:"amber",name:"\u73AF\u5883\u4E2D\u5FC3",desc:"\u4E94\u7C7B\u6307\u6807\u4E0E AI \u8C03\u63A7\u5EFA\u8BAE"},{icon:Od,tone:"teal",name:"\u8BBE\u5907\u7BA1\u7406",desc:"\u5730\u56FE\u9009\u673A\u3001\u5F00\u5173\u4E0E\u81EA\u68C0"},{icon:Md,tone:"emerald",name:"\u704C\u6E89\u63A7\u5236",desc:"\u5F00\u505C\u3001\u65F6\u957F\u4E0E\u8BA1\u5212\u4FDD\u5B58"},{icon:jd,tone:"emerald",name:"\u4F5C\u7269\u6863\u6848",desc:"\u957F\u52BF\u3001\u9636\u6BB5\u4E0E\u519C\u4E8B\u4EFB\u52A1"},{icon:Ld,tone:"rose",name:"\u544A\u8B66\u4E2D\u5FC3",desc:"\u5B9E\u65F6\u544A\u8B66\u4E0E\u5F02\u5E38\u5904\u7406"}],Wh=[{title:"\u7A7A\u95F4\u5BF9\u8C61\u4EA4\u4E92",desc:"\u5730\u5757\u3001\u6E29\u5BA4\u3001\u8BBE\u5907\u3001\u6444\u50CF\u5934\u4E0E\u673A\u5668\u4EBA\uFF0C\u70B9\u51FB\u5373\u83B7\u5F97\u4E0A\u4E0B\u6587\uFF0C\u65E0\u9700\u5728\u83DC\u5355\u91CC\u7FFB\u627E\u3002"},{title:"\u53CC\u89C6\u56FE\u8FDE\u7EED\u4F20\u9012",desc:"\u5B9E\u666F\u4E0E 3D \u5171\u7528\u5BF9\u8C61 ID \u4E0E\u5750\u6807\uFF0CHover\u3001\u70B9\u51FB\u3001\u805A\u7126\u72B6\u6001\u5728\u4E24\u79CD\u89C6\u89D2\u95F4\u65E0\u7F1D\u8854\u63A5\u3002"},{title:"\u6DB2\u6001\u73BB\u7483\u4E1A\u52A1 Dock",desc:"\u603B\u89C8\u3001\u76D1\u63A7\u3001\u73AF\u5883\u3001\u8BBE\u5907\u3001\u704C\u6E89\u3001\u4F5C\u7269\u3001\u544A\u8B66\u4E03\u4E2A\u5165\u53E3\uFF0C\u968F\u65F6\u5207\u6362\u5173\u6CE8\u7EF4\u5EA6\u3002"}],os="rounded-2xl border border-slate-200 bg-white p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-card-hover";function Vh(){return y(q,{children:[y(Rt,{eyebrow:"Product",title:y(q,{children:["\u4EE5\u519C\u573A\u7A7A\u95F4\u4E3A\u4E3B\u754C\u9762",a("br",{}),"\u7684\u667A\u6167\u519C\u4E1A\u5DE5\u4F5C\u53F0"]}),subtitle:"\u4ECE\u6570\u636E\u5DE5\u4F5C\u53F0\u5230\u667A\u80FD\u95EE\u519C\uFF0C\u518D\u5230\u6570\u5B57\u5B6A\u751F\uFF0C\u4E09\u4E2A\u5165\u53E3\u8986\u76D6\u300C\u67E5\u770B \u2014 \u8BE2\u95EE \u2014 \u8EAB\u4E34\u5176\u5883\u300D\u7684\u5B8C\u6574\u4F53\u9A8C\u3002",children:[a(il,{href:Ee,children:"\u8FDB\u5165\u5E73\u53F0"}),y(ol,{href:rt,children:[a($d,{className:"h-4 w-4"})," \u4F53\u9A8C\u667A\u80FD\u95EE\u519C"]})]}),a("section",{className:"px-6 pb-20 md:px-12 lg:px-16",children:y("div",{className:"mx-auto max-w-6xl",children:[a(en,{eyebrow:"Core Products",title:"\u4E09\u5927\u6838\u5FC3\u4EA7\u54C1",subtitle:"\u8986\u76D6\u6570\u636E\u67E5\u770B\u3001\u81EA\u7136\u8BED\u8A00\u8BE2\u95EE\u4E0E\u4E09\u7EF4\u5DE1\u573A\u4E09\u79CD\u4F7F\u7528\u65B9\u5F0F\u3002"}),a("div",{className:"mt-12 grid gap-6 md:grid-cols-3",children:jh.map(e=>y("a",{href:e.href,className:`group ${os}`,children:[y("div",{className:"flex items-center justify-between",children:[a(kr,{icon:e.icon,tone:e.tone}),a(nn,{className:"h-5 w-5 text-slate-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-emerald-500"})]}),a("h3",{className:"mt-6 text-lg font-semibold text-ink",children:e.name}),a("p",{className:"mt-3 text-sm font-light text-muted leading-relaxed",children:e.desc}),a("ul",{className:"mt-5 space-y-2.5",children:e.points.map(n=>y("li",{className:"flex items-start gap-2 text-sm text-muted",children:[a(Mu,{className:"mt-0.5 h-4 w-4 shrink-0 text-emerald-600",strokeWidth:2.2}),n]},n))}),a("span",{className:"mt-7 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 transition-transform duration-200 group-hover:translate-x-1",children:e.cta})]},e.name))})]})}),a(al,{stats:[{value:"3",label:"\u6838\u5FC3\u4EA7\u54C1"},{value:"7",label:"\u4E1A\u52A1\u6A21\u5757"},{value:"10+",label:"\u7A7A\u95F4\u5BF9\u8C61"},{value:"2",label:"\u5B9E\u666F / 3D \u89C6\u89D2"}]}),a("section",{className:"bg-white px-6 py-20 md:px-12 lg:px-16",children:y("div",{className:"mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2",children:[y("div",{children:[a(en,{eyebrow:"Why Workbench",title:"\u6570\u636E\u5DE5\u4F5C\u53F0\u4E3A\u4EC0\u4E48\u597D\u7528",subtitle:"\u4EE5\u7A7A\u95F4\u4E3A\u4E2D\u5FC3\u7684\u4EA4\u4E92\uFF0C\u53D6\u4EE3\u4F20\u7EDF\u300C\u5DE6\u4FA7\u83DC\u5355 + \u56FA\u5B9A\u56FE\u8868 + \u5927\u91CF\u5361\u7247\u300D\u7684\u540E\u53F0\u5F62\u6001\u3002"}),a("div",{className:"mt-10 space-y-6",children:Wh.map(e=>y("div",{className:"flex gap-4",children:[a("div",{className:"flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700",children:a(Mu,{className:"h-4 w-4",strokeWidth:2.2})}),y("div",{children:[a("h4",{className:"font-medium text-ink",children:e.title}),a("p",{className:"mt-1 text-sm font-light text-muted leading-relaxed",children:e.desc})]})]},e.title))}),y("a",{href:Ee,className:"mt-10 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-900/20",children:["\u6253\u5F00\u6570\u636E\u5DE5\u4F5C\u53F0 ",a(nn,{className:"h-4 w-4"})]})]}),y("div",{className:"relative",children:[a("div",{className:"pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-emerald-100/70 blur-2xl"}),y("div",{className:"relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card-hover",children:[y("div",{className:"flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3",children:[a("span",{className:"h-2.5 w-2.5 rounded-full bg-rose-400"}),a("span",{className:"h-2.5 w-2.5 rounded-full bg-amber-400"}),a("span",{className:"h-2.5 w-2.5 rounded-full bg-emerald-400"}),a("span",{className:"ml-3 h-5 max-w-xs flex-1 rounded-md bg-slate-200"})]}),y("div",{className:"grid grid-cols-[1.2fr_1fr] gap-3 bg-gradient-to-br from-emerald-50/80 to-slate-50 p-5",children:[y("div",{className:"space-y-2",children:[a("div",{className:"h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 opacity-90"}),y("div",{className:"grid grid-cols-2 gap-2",children:[a("div",{className:"h-8 rounded-lg bg-emerald-200"}),a("div",{className:"h-8 rounded-lg bg-teal-200"})]}),a("div",{className:"h-8 rounded-lg bg-slate-200"}),y("div",{className:"grid grid-cols-3 gap-2",children:[a("div",{className:"h-14 rounded-lg border-2 border-emerald-300 bg-white"}),a("div",{className:"h-14 rounded-lg border-2 border-slate-200 bg-white"}),a("div",{className:"h-14 rounded-lg border-2 border-slate-200 bg-white"})]})]}),y("div",{className:"space-y-2",children:[a("div",{className:"h-5 w-2/3 rounded-md bg-emerald-300"}),a("div",{className:"h-3 w-full rounded-md bg-slate-200"}),a("div",{className:"h-3 w-5/6 rounded-md bg-slate-200"}),a("div",{className:"mt-3 h-10 rounded-lg bg-gradient-to-r from-emerald-500/80 to-teal-400/60"}),y("div",{className:"mt-2 flex gap-1.5",children:[a("div",{className:"h-10 w-10 rounded-full bg-emerald-200"}),a("div",{className:"h-10 w-10 rounded-full bg-teal-200"}),a("div",{className:"h-10 w-10 rounded-full bg-slate-300"})]})]})]})]})]})]})}),a("section",{className:"px-6 py-20 md:px-12 lg:px-16",children:y("div",{className:"mx-auto max-w-6xl",children:[a(en,{eyebrow:"Seven Docks",title:"\u4E03\u5927\u4E1A\u52A1\u6A21\u5757",subtitle:"\u6DB2\u6001\u73BB\u7483 Dock \u7EDF\u4E00\u7EBF\u6027\u56FE\u6807\uFF0C\u4E00\u952E\u5207\u6362\u5173\u6CE8\u7EF4\u5EA6\u3002"}),a("div",{className:"mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",children:Uh.map(e=>a("div",{className:os,children:y("div",{className:"flex items-start gap-4",children:[a(kr,{icon:e.icon,tone:e.tone,className:"h-11 w-11 shrink-0 rounded-xl"}),y("div",{children:[a("h4",{className:"font-medium text-ink",children:e.name}),a("p",{className:"mt-1 text-xs font-light text-muted",children:e.desc})]})]})},e.name))})]})}),a(sl,{title:"\u73B0\u5728\u5C31\u8D70\u8FDB\u4F60\u7684\u519C\u573A",subtitle:"\u65E0\u9700\u5BFB\u627E\u6570\u636E\uFF0C\u76F4\u63A5\u8BE2\u95EE\u6570\u636E\uFF1B\u4E0D\u5FC5\u6D4F\u89C8\u62A5\u8868\uFF0C\u76F4\u63A5\u8FDB\u5165\u519C\u573A\u3002",href:Ee,label:"\u8FDB\u5165\u5E73\u53F0"})]})}const Hh=[{icon:Md,tone:"emerald",name:"\u667A\u80FD\u704C\u6E89\u63A7\u5236",desc:"\u53EF\u89C6\u5316\u6E20\u9053\u4E0E\u53EF\u63A7\u704C\u6E89\u5355\u5143\uFF0C\u652F\u6301\u4E00\u952E\u5F00\u505C\u3001\u704C\u6E89\u65F6\u957F\u8BBE\u5B9A\u4E0E\u8BA1\u5212\u4FDD\u5B58\uFF0C\u7CBE\u51C6\u7528\u6C34\u3001\u4E0D\u6D6A\u8D39\u4E00\u6EF4\u3002"},{icon:Ud,tone:"amber",name:"\u73AF\u5883\u4E2D\u5FC3",desc:"\u6E29\u5EA6\u3001\u7A7A\u6C14\u6E7F\u5EA6\u3001\u571F\u58E4\u6E7F\u5EA6\u3001\u5149\u7167\u4E0E CO\u2082 \u5B9E\u65F6\u76D1\u6D4B\uFF0C24 \u5C0F\u65F6\u8D8B\u52BF\u5206\u6790\uFF0C\u9644 AI \u8C03\u63A7\u5EFA\u8BAE\u3002"},{icon:Od,tone:"teal",name:"\u8BBE\u5907\u7BA1\u7406",desc:"\u5730\u56FE\u9009\u673A\u3001\u5728\u7EBF\u4E0E\u5F02\u5E38\u72B6\u6001\u8BC6\u522B\uFF0C\u652F\u6301\u8BBE\u5907\u5F00\u5173\u3001\u81EA\u68C0\u4E0E\u53C2\u6570\u914D\u7F6E\u5165\u53E3\u3002"},{icon:Oi,tone:"violet",name:"\u56ED\u533A\u76D1\u63A7",desc:"\u9009\u62E9\u4EFB\u610F\u6E29\u5BA4\u6216\u79CD\u690D\u533A\u6253\u5F00\u5B9E\u65F6\u753B\u9762\uFF0C\u6444\u50CF\u5934\u5207\u6362\u3001AI \u8BC6\u522B\uFF08\u4EBA\u5458\u4E0E\u4F5C\u7269\uFF09\u4E0E\u622A\u56FE\u5F55\u50CF\u3002"},{icon:jd,tone:"emerald",name:"\u4F5C\u7269\u6863\u6848",desc:"\u6309\u6E29\u5BA4\u6216\u5730\u5757\u5C55\u793A\u957F\u52BF\u3001\u751F\u80B2\u9636\u6BB5\u3001\u75C5\u866B\u5BB3\u98CE\u9669\u4E0E\u519C\u4E8B\u4EFB\u52A1\uFF0C\u79CD\u690D\u5168\u7A0B\u53EF\u8FFD\u6EAF\u3002"},{icon:Ld,tone:"rose",name:"\u544A\u8B66\u4E2D\u5FC3",desc:"\u5B9E\u65F6\u544A\u8B66\u4E8B\u4EF6\u4E0E\u5F02\u5E38\u5B9A\u4F4D\uFF0C\u7A7A\u95F4\u5BF9\u8C61\u6807\u6CE8\u98CE\u9669\u70B9\uFF0C\u5FEB\u901F\u54CD\u5E94\u4E0D\u9057\u6F0F\u3002"}],Qh=[{icon:_h,step:"01",title:"\u611F\u77E5\u76D1\u6D4B",desc:"\u73AF\u5883\u4F20\u611F\u5668\u3001\u8BBE\u5907\u72B6\u6001\u4E0E\u76D1\u63A7\u753B\u9762\u63A5\u5165\uFF0C\u5F62\u6210\u4E00\u5F20\u4F1A\u8BF4\u8BDD\u7684\u519C\u573A\u6570\u5B57\u5E95\u56FE\u3002",tone:"emerald"},{icon:Ch,step:"02",title:"AI \u8BCA\u65AD",desc:"24 \u5C0F\u65F6\u8D8B\u52BF\u5206\u6790\u3001\u5F02\u5E38\u6807\u8BB0\u4E0E AI \u8C03\u63A7\u5EFA\u8BAE\uFF0C\u628A\u6570\u636E\u53D8\u6210\u53EF\u6267\u884C\u7684\u7ED3\u8BBA\u3002",tone:"amber"},{icon:zh,step:"03",title:"\u519C\u4E8B\u6267\u884C",desc:"\u704C\u6E89\u5F00\u505C\u3001\u8BBE\u5907\u5F00\u5173\u4E0E\u519C\u4E8B\u4EFB\u52A1\u4E00\u952E\u4E0B\u53D1\uFF0C\u8BA9\u7ED3\u8BBA\u771F\u6B63\u843D\u5730\u5230\u7530\u95F4\u3002",tone:"sky"}],Gh=[{title:"\u7A7A\u95F4\u5373\u754C\u9762",desc:"\u5728\u519C\u573A\u5730\u56FE\u4E0A\u76F4\u63A5\u70B9\u9009\u4E0E\u64CD\u4F5C\uFF0C\u544A\u522B\u590D\u6742\u7684\u62A5\u8868\u8FF7\u5BAB\u3002"},{title:"\u53CC\u89C6\u56FE\u5B6A\u751F",desc:"2.5D \u5B9E\u666F\u4E0E 3D \u6570\u5B57\u5B6A\u751F\u5171\u4EAB\u4E00\u5957\u5750\u6807\u4E0E\u5BF9\u8C61\u3002"},{title:"AI \u539F\u751F\u5165\u53E3",desc:"\u81EA\u7136\u8BED\u8A00\u76F4\u8FBE\u6570\u636E\u3001\u5206\u6790\u4E0E\u884C\u52A8\uFF0C\u65E0\u9700\u5B66\u4E60\u6210\u672C\u3002"},{title:"\u56E2\u961F\u534F\u4F5C\u5F00\u53D1",desc:"\u6309\u6A21\u5757\u5206\u5DE5\uFF0C\u5B98\u7F51\u3001\u5DE5\u4F5C\u53F0\u3001\u667A\u80FD\u95EE\u519C\u5404\u81EA\u6F14\u8FDB\u3001\u968F\u65F6\u62FC\u88C5\u3002"}],jl="rounded-2xl border border-slate-200 bg-white p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-card-hover";function Kh(){return y(q,{children:[y(Rt,{eyebrow:"Solutions",title:y(q,{children:["\u4ECE\u79CD\u690D\u5230\u519C\u4E8B\u6267\u884C\u7684",a("br",{}),"\u5168\u94FE\u8DEF\u6570\u5B57\u5316"]}),subtitle:"\u56F4\u7ED5\u6E29\u5BA4\u7684\u704C\u6E89\u3001\u73AF\u5883\u3001\u8BBE\u5907\u3001\u76D1\u63A7\u4E0E\u519C\u4E8B\uFF0C\u63D0\u4F9B\u4E00\u5957\u53EF\u843D\u5730\u7684\u667A\u6167\u519C\u4E1A\u89E3\u51B3\u65B9\u6848\u3002",children:[a(il,{href:Ee,children:"\u8FDB\u5165\u5E73\u53F0\u4F53\u9A8C"}),a(ol,{href:rt,children:"\u54A8\u8BE2\u667A\u80FD\u95EE\u519C"})]}),a("section",{className:"px-6 pb-20 md:px-12 lg:px-16",children:y("div",{className:"mx-auto max-w-6xl",children:[a(en,{eyebrow:"Six Solutions",title:"\u516D\u5927\u89E3\u51B3\u65B9\u6848",subtitle:"\u4ECE\u6C34\u3001\u5149\u3001\u6E29\u3001\u6C14\u5230\u8BBE\u5907\u4E0E\u519C\u4E8B\uFF0C\u8986\u76D6\u6E29\u5BA4\u79CD\u690D\u7684\u6BCF\u4E00\u4E2A\u73AF\u8282\u3002"}),a("div",{className:"mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3",children:Hh.map((e,n)=>y("div",{className:`group ${jl}`,children:[y("div",{className:"flex items-center justify-between",children:[a(kr,{icon:e.icon,tone:e.tone}),y("span",{className:"font-instrument-serif text-3xl text-slate-200 transition-colors duration-300 group-hover:text-emerald-300",children:["0",n+1]})]}),a("h3",{className:"mt-6 text-lg font-semibold text-ink",children:e.name}),a("p",{className:"mt-3 text-sm font-light text-muted leading-relaxed",children:e.desc}),y("span",{className:"mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100",children:["\u4E86\u89E3\u8BE6\u60C5 ",a(nn,{className:"h-4 w-4"})]})]},e.name))})]})}),a(al,{stats:[{value:"6",label:"\u89E3\u51B3\u65B9\u6848"},{value:"5",label:"\u7C7B\u73AF\u5883\u6307\u6807"},{value:"7\xD724",label:"\u5B9E\u65F6\u76D1\u6D4B"},{value:"25",label:"FPS \u667A\u80FD\u5206\u6790"}]}),a("section",{className:"bg-white px-6 py-20 md:px-12 lg:px-16",children:y("div",{className:"mx-auto max-w-6xl",children:[a(en,{eyebrow:"How It Works",title:"\u611F\u77E5 \u2014 \u8BCA\u65AD \u2014 \u6267\u884C",subtitle:"\u4E00\u5957\u4ECE\u6570\u636E\u5230\u884C\u52A8\u7684\u5B8C\u6574\u95ED\u73AF\uFF0C\u8BA9\u79CD\u690D\u51B3\u7B56\u6709\u636E\u53EF\u4F9D\u3002"}),a("div",{className:"mt-14 grid gap-8 md:grid-cols-3",children:Qh.map(e=>y("div",{className:`relative ${jl}`,children:[y("div",{className:"flex items-center justify-between",children:[a(kr,{icon:e.icon,tone:e.tone,className:"h-14 w-14 rounded-2xl"}),a("span",{className:"font-instrument-serif text-5xl text-slate-100",children:e.step})]}),a("h3",{className:"mt-6 text-lg font-semibold text-ink",children:e.title}),a("p",{className:"mt-3 text-sm font-light text-muted leading-relaxed",children:e.desc})]},e.step))})]})}),a("section",{className:"px-6 py-20 md:px-12 lg:px-16",children:y("div",{className:"mx-auto max-w-6xl",children:[a(en,{eyebrow:"Why Us",title:"\u4E3A\u4EC0\u4E48\u9009\u62E9\u7530\u8A00\u8015\u667A",subtitle:"\u4E0D\u662F\u53C8\u4E00\u4E2A\u519C\u4E1A\u62A5\u8868\u7CFB\u7EDF\uFF0C\u800C\u662F\u4E00\u5957\u4EE5\u7A7A\u95F4\u548C\u81EA\u7136\u8BED\u8A00\u4E3A\u4E2D\u5FC3\u7684 AI \u5DE5\u4F5C\u7A7A\u95F4\u3002"}),a("div",{className:"mt-12 grid gap-6 sm:grid-cols-2",children:Gh.map(e=>a("div",{className:jl,children:y("div",{className:"flex gap-4",children:[a("div",{className:"flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700",children:a(Mu,{className:"h-4 w-4",strokeWidth:2.2})}),y("div",{children:[a("h4",{className:"font-medium text-ink",children:e.title}),a("p",{className:"mt-1 text-sm font-light text-muted leading-relaxed",children:e.desc})]})]})},e.title))})]})}),a(sl,{title:"\u5F00\u59CB\u6784\u5EFA\u4F60\u7684\u6570\u5B57\u5316\u519C\u573A",subtitle:"\u704C\u6E89\u3001\u73AF\u5883\u3001\u8BBE\u5907\u3001\u76D1\u63A7\u4E0E\u519C\u4E8B\uFF0C\u4ECE\u4ECA\u5929\u8D77\u90FD\u5728\u4E00\u4E2A\u5DE5\u4F5C\u53F0\u91CC\u5B8C\u6210\u3002",href:Ee,label:"\u8FDB\u5165\u5E73\u53F0"})]})}const Yh=[{icon:$o,tone:"emerald",title:"\u672C\u5730 GLB \u516C\u6A21",desc:"8 \u4E2A CC0 \u519C\u4E1A\u516C\u6A21\u7531\u672C\u5730\u52A0\u8F7D\uFF0C\u6A21\u578B\u6309\u5305\u56F4\u76D2\u81EA\u52A8\u5F52\u4E00\u5316\u5E76\u843D\u5230\u5730\u9762\uFF0C\u66FF\u6362\u6A21\u578B\u53EA\u9700\u6539\u8D44\u6E90\u5730\u5740\u4E0E\u5750\u6807\u3002"},{icon:Ih,tone:"amber",title:"\u663C\u591C\u5149\u7167\u540C\u6B65",desc:"3D \u5929\u7A7A\u6309\u672C\u5730\u771F\u5B9E\u65F6\u95F4\u540C\u6B65\u663C\u591C\u5149\u7167\u3001\u6668\u660F\u8272\u6E29\u3001\u661F\u7A7A\u4E0E\u7F13\u6162\u79FB\u52A8\u7684\u4E91\u5C42\uFF0C\u5149\u5F71\u771F\u5B9E\u53EF\u4FE1\u3002"},{icon:Mi,tone:"sky",title:"\u7B2C\u4E00\u4EBA\u79F0\u5DE1\u573A",desc:"WASD \u79FB\u52A8\u3001\u9F20\u6807\u63A7\u5236\u89C6\u89D2\u3001Shift \u52A0\u901F\u3001\u51C6\u661F\u9009\u62E9\u8BBE\u65BD\u3001Esc \u9000\u51FA\uFF1B\u6E29\u5BA4\u4E0E\u8BBE\u5907\u5E26\u78B0\u649E\u7BB1\u5E76\u652F\u6301\u8D34\u8FB9\u6ED1\u52A8\u3002"},{icon:Bh,tone:"violet",title:"\u516D\u5EA7\u6E29\u5BA4",desc:"\u6309\u4E1A\u52A1\u6570\u636E\u5206\u522B\u79CD\u690D\u756A\u8304\u3001\u8349\u8393\u3001\u9EC4\u74DC\u3001\u80B2\u82D7\u3001\u53F6\u83DC\u4E0E\u751F\u6001\u756A\u8304\uFF0C\u914D\u6709\u72EC\u7ACB\u98CE\u673A\u3001\u63A7\u5236\u7BB1\u3001\u72B6\u6001\u5C4F\u4E0E\u6307\u793A\u706F\u3002"},{icon:Dh,tone:"teal",title:"\u53CC\u89C6\u56FE\u7EDF\u4E00\u5750\u6807",desc:"\u5B9E\u666F\u4E0E 3D \u5171\u7528\u5BF9\u8C61 ID \u4E0E\u7A7A\u95F4\u5750\u6807\uFF0CHover \u9884\u89C8\u3001\u5355\u51FB\u8BE6\u60C5\u3001\u53CC\u51FB\u805A\u7126\u72B6\u6001\u53EF\u8FDE\u7EED\u4F20\u9012\u3002"},{icon:bh,tone:"rose",title:"\u6027\u80FD\u4F18\u5316",desc:"\u91CD\u590D\u4F5C\u7269\u4EE5 InstancedMesh \u6279\u91CF\u6E32\u67D3\uFF0C\u72EC\u7ACB\u50CF\u7D20\u6BD4\u3001\u9759\u6001\u9634\u5F71\u6309\u9700\u5237\u65B0\uFF0C\u56ED\u533A\u9053\u8DEF\u8F7B\u91CF\u5316\u7EC6\u8282\u3002"}],Jh=["W","A","S","D","Shift","Esc"],Zh=["\u6570\u5B57\u952E 1\u20137 \u5FEB\u901F\u5207\u6362\u603B\u89C8\u3001\u76D1\u63A7\u3001\u73AF\u5883\u3001\u8BBE\u5907\u3001\u704C\u6E89\u3001\u4F5C\u7269\u4E0E\u544A\u8B66 Dock","\u6E29\u5BA4\u95E8\u53E3\u8BBE\u7F6E\u5BF9\u5E94\u4F5C\u7269\u7684\u5361\u901A\u5706\u5F62\u5FBD\u7AE0\uFF0C\u8FD1\u666F\u5373\u53EF\u8BC6\u522B\u68DA\u5185\u54C1\u79CD","\u573A\u666F\u542B\u53EF\u4EA4\u4E92\u7684\u6E20\u9053\u95F8\u95E8\u3001\u63A7\u5236\u5C4F\u3001\u589E\u538B\u6CF5\u7EC4\u4E0E\u8FD0\u884C\u706F","\u9E1F\u77B0\u89C6\u89D2\u652F\u6301\u62D6\u52A8\u65CB\u8F6C\u3001\u6EDA\u8F6E\u7F29\u653E\u4E0E\u5BF9\u8C61\u70B9\u51FB"],qh="rounded-2xl border border-slate-200 bg-white p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-card-hover";function Xh(){return y(q,{children:[y(Rt,{eyebrow:"Digital Twin",title:y(q,{children:["\u4E00\u4E2A\u519C\u573A\uFF0C\u4E24\u79CD\u89C6\u89D2",a("br",{}),"\u5B9E\u666F\u4E0E\u6570\u5B57\u5B6A\u751F"]}),subtitle:"2.5D \u822A\u62CD\u5B9E\u666F\u4E0E Three.js WebGL \u6570\u5B57\u5B6A\u751F\u5171\u7528\u5BF9\u8C61 ID \u4E0E\u7A7A\u95F4\u5750\u6807\uFF0C\u4EA4\u4E92\u72B6\u6001\u5728\u4E24\u79CD\u89C6\u89D2\u95F4\u8FDE\u7EED\u4F20\u9012\u3002",children:[a(il,{href:lr,children:"\u8FDB\u5165\u6570\u5B57\u5B6A\u751F"}),a(ol,{href:Ee,children:"\u8FD4\u56DE\u5B9E\u666F\u5DE5\u4F5C\u53F0"})]}),a("section",{className:"px-6 pb-20 md:px-12 lg:px-16",children:y("div",{className:"mx-auto max-w-6xl",children:[a(en,{eyebrow:"Capabilities",title:"\u6570\u5B57\u5B6A\u751F\u80FD\u529B",subtitle:"\u4ECE\u5EFA\u6A21\u5230\u6E32\u67D3\uFF0C\u4ECE\u89C6\u89D2\u5230\u4EA4\u4E92\uFF0C\u6784\u5EFA\u53EF\u5B9E\u65F6\u4E92\u52A8\u7684\u865A\u62DF\u519C\u573A\u3002"}),a("div",{className:"mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3",children:Yh.map(e=>y("div",{className:qh,children:[a(kr,{icon:e.icon,tone:e.tone}),a("h3",{className:"mt-6 text-lg font-semibold text-ink",children:e.title}),a("p",{className:"mt-3 text-sm font-light text-muted leading-relaxed",children:e.desc})]},e.title))})]})}),a("section",{className:"bg-white px-6 py-20 md:px-12 lg:px-16",children:y("div",{className:"mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2",children:[a("div",{children:y("div",{className:"relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 shadow-card-hover",children:[y("div",{className:"flex items-center gap-2 border-b border-white/10 px-4 py-3",children:[a("span",{className:"h-2.5 w-2.5 rounded-full bg-rose-400"}),a("span",{className:"h-2.5 w-2.5 rounded-full bg-amber-400"}),a("span",{className:"h-2.5 w-2.5 rounded-full bg-emerald-400"}),a("span",{className:"ml-3 h-5 max-w-[140px] flex-1 rounded-md bg-white/10"})]}),y("div",{className:"relative h-72",children:[a("div",{className:"absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#2f9e63_0%,transparent_55%),linear-gradient(180deg,#0d3322,#071a11)]"}),a("div",{className:"absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#071a11] to-transparent"}),a("div",{className:"absolute left-8 top-8 grid grid-cols-3 gap-2 opacity-90",children:[0,1,2,3,4,5].map(e=>a("div",{className:"h-6 w-10 rounded-t-md bg-emerald-400/60"},e))}),a("div",{className:"absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-1",children:[0,1,2].map(e=>a("div",{className:"h-2 w-12 rounded-full bg-emerald-400/40"},e))}),a("div",{className:"absolute right-8 top-6 h-2 w-14 rounded-full bg-emerald-400/60"}),y("div",{className:"absolute bottom-8 right-8 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 backdrop-blur",children:[a("span",{className:"h-2 w-2 animate-pulse rounded-full bg-emerald-400"}),a("span",{className:"text-[10px] text-white/80",children:"3D \u573A\u666F \xB7 \u5B9E\u65F6\u6E32\u67D3"})]})]})]})}),y("div",{children:[a(en,{eyebrow:"First Person Tour",title:"\u7B2C\u4E00\u4EBA\u79F0\u5DE1\u573A\uFF0C\u50CF\u8D70\u8FDB\u519C\u573A\u4E00\u6837",subtitle:"\u5728 3D \u573A\u666F\u91CC\u81EA\u7531\u7A7F\u884C\uFF0C\u7528\u51C6\u661F\u9009\u62E9\u6E29\u5BA4\u4E0E\u8BBE\u5907\uFF0C\u50CF\u5B9E\u5730\u5DE1\u68C0\u4E00\u6837\u67E5\u770B\u6BCF\u4E00\u5904\u8BBE\u65BD\u3002"}),a("div",{className:"mt-6 flex flex-wrap gap-2.5",children:Jh.map(e=>a("kbd",{className:"rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-emerald-700 shadow-sm",children:e},e))}),a("ul",{className:"mt-8 space-y-3.5",children:Zh.map(e=>y("li",{className:"flex items-start gap-3 text-sm text-muted",children:[a("span",{className:"mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700",children:a(Mu,{className:"h-3 w-3",strokeWidth:2.4})}),e]},e))}),y("a",{href:lr,className:"mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-900/20",children:["\u5F00\u59CB\u5DE1\u573A ",a(nn,{className:"h-4 w-4"})]})]})]})}),a(al,{stats:[{value:"8",label:"\u672C\u5730 GLB \u516C\u6A21"},{value:"6",label:"\u5EA7\u6E29\u5BA4\u4F5C\u7269"},{value:"60",label:"FPS \u573A\u666F\u5237\u65B0"},{value:"1",label:"\u5957\u5171\u4EAB\u5750\u6807"}]}),a(sl,{title:"\u7528\u4E09\u7EF4\u89C6\u89D2\uFF0C\u91CD\u65B0\u8BA4\u8BC6\u4F60\u7684\u519C\u573A",subtitle:"\u70B9\u51FB\u5373\u53EF\u5728 2.5D \u5B9E\u666F\u4E0E 3D \u6570\u5B57\u5B6A\u751F\u4E4B\u95F4\u5207\u6362\uFF0C\u72B6\u6001\u4E0E\u5BF9\u8C61\u5168\u7A0B\u4E00\u81F4\u3002",href:lr,label:"\u8FDB\u5165\u6570\u5B57\u5B6A\u751F"})]})}const em=[{char:"\u7530",title:"\u4EE5\u519C\u573A\u3001\u5730\u5757\u548C\u5927\u68DA\u4E3A\u6838\u5FC3\u7A7A\u95F4",tone:"bg-emerald-100 text-emerald-700"},{char:"\u8A00",title:"\u4EE5\u81EA\u7136\u8BED\u8A00\u4F5C\u4E3A\u7CFB\u7EDF\u5165\u53E3",tone:"bg-sky-100 text-sky-700"},{char:"\u8015",title:"\u8986\u76D6\u79CD\u690D\u3001\u704C\u6E89\u3001\u5DE1\u68C0\u548C\u519C\u4E8B\u6267\u884C",tone:"bg-amber-100 text-amber-700"},{char:"\u667A",title:"\u901A\u8FC7\u6570\u636E\u3001\u89C6\u89C9\u8BC6\u522B\u548C AI \u8F85\u52A9\u51B3\u7B56",tone:"bg-violet-100 text-violet-700"}],nm=[{initials:"\u6570",module:"\u6570\u636E\u5DE5\u4F5C\u53F0",owner:"\u5F53\u524D\u5206\u652F",desc:"\u5168\u5C4F\u519C\u573A\u7A7A\u95F4\u4EA4\u4E92\u30012.5D/3D \u53CC\u89C6\u56FE\u4E0E\u4E03\u5927\u4E1A\u52A1\u6A21\u5757\u3002",tone:"bg-emerald-100 text-emerald-700"},{initials:"\u95EE",module:"\u667A\u80FD\u95EE\u519C",owner:"\u56E2\u961F\u5176\u4ED6\u6A21\u5757",desc:"\u4EE5\u81EA\u7136\u8BED\u8A00\u4E3A\u5165\u53E3\u7684 AI \u5BF9\u8BDD\u3001\u6570\u636E\u95EE\u7B54\u4E0E\u64CD\u4F5C\u5EFA\u8BAE\u3002",tone:"bg-sky-100 text-sky-700"},{initials:"\u68DA",module:"\u5927\u68DA\u5185\u90E8",owner:"\u56E2\u961F\u5176\u4ED6\u6A21\u5757",desc:"\u6E29\u5BA4\u5185\u90E8\u573A\u666F\u3001\u4F5C\u7269\u7EC6\u8282\u4E0E\u73AF\u5883\u7684\u6DF1\u5165\u6570\u5B57\u5B6A\u751F\u3002",tone:"bg-amber-100 text-amber-700"},{initials:"\u7F51",module:"\u5B98\u7F51\u8425\u9500",owner:"\u5F53\u524D\u5206\u652F",desc:"\u591A\u9875\u8425\u9500\u7AD9\u70B9\u4E0E\u300C\u5B98\u7F51 \u2192 \u5E73\u53F0\u300D\u7684\u7AD9\u5185\u8054\u52A8\u5165\u53E3\u3002",tone:"bg-violet-100 text-violet-700"}],as="rounded-2xl border border-slate-200 bg-white p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-card-hover";function tm(){return y(q,{children:[y(Rt,{eyebrow:"About",title:y(q,{children:["\u7530\u8A00\u8015\u667A",a("br",{}),"\u4E3A\u73B0\u4EE3\u519C\u4E1A\u800C\u751F\u7684 AI \u5E73\u53F0"]}),subtitle:"\u6211\u4EEC\u76F8\u4FE1\u519C\u4E1A\u7684\u6570\u636E\u4E0D\u8BE5\u88AB\u85CF\u5728\u62A5\u8868\u91CC\u3002\u8BA9\u81EA\u7136\u8BED\u8A00\u6210\u4E3A\u5165\u53E3\uFF0C\u8BA9\u519C\u573A\u7A7A\u95F4\u6210\u4E3A\u754C\u9762\u3002",children:[a(il,{href:Ee,children:"\u8FDB\u5165\u5E73\u53F0"}),a(ol,{href:rt,children:"\u4E86\u89E3\u66F4\u591A"})]}),a("section",{className:"px-6 pb-20 md:px-12 lg:px-16",children:y("div",{className:"mx-auto max-w-6xl",children:[a(en,{eyebrow:"Brand",title:"\u300C\u7530\u8A00\u8015\u667A\u300D\u56DB\u4E2A\u5B57",subtitle:"\u6BCF\u4E00\u4E2A\u5B57\uFF0C\u90FD\u662F\u4E00\u5C42\u4EA7\u54C1\u54F2\u5B66\u3002"}),a("div",{className:"mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4",children:em.map(e=>y("div",{className:`text-center ${as}`,children:[a("div",{className:`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl font-instrument-serif text-3xl ${e.tone}`,children:e.char}),a("p",{className:"mt-5 text-sm font-light text-muted leading-relaxed",children:e.title})]},e.char))})]})}),a("section",{className:"px-6 pb-20 md:px-12 lg:px-16",children:y("div",{className:"relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 px-8 py-14 text-center shadow-2xl shadow-emerald-600/20 md:py-20",children:[a(Nh,{className:"mx-auto h-10 w-10 text-white/60",strokeWidth:1.5}),y("p",{className:"mx-auto mt-6 max-w-3xl font-instrument-serif text-2xl text-white leading-relaxed sm:text-3xl",children:["\u4E0D\u7528\u5BFB\u627E\u6570\u636E\uFF0C\u76F4\u63A5\u8BE2\u95EE\u6570\u636E\u3002",a("br",{}),"\u4E0D\u5FC5\u6D4F\u89C8\u62A5\u8868\uFF0C\u76F4\u63A5\u8FDB\u5165\u519C\u573A\u3002",a("br",{}),a("span",{className:"italic text-emerald-100",children:"AI \u4E0D\u53EA\u56DE\u7B54\u95EE\u9898\uFF0C\u8FD8\u80FD\u5B9A\u4F4D\u3001\u89E3\u91CA\u548C\u8F85\u52A9\u884C\u52A8\u3002"})]})]})}),a(al,{stats:[{value:"4",label:"\u5B57\u54C1\u724C\u91CA\u4E49"},{value:"3",label:"\u79CD\u5165\u53E3\u6A21\u5F0F"},{value:"6",label:"\u5EA7\u6E29\u5BA4\u5B6A\u751F"},{value:"1",label:"\u4E2A\u5171\u540C\u4F7F\u547D"}]}),a("section",{className:"bg-white px-6 py-20 md:px-12 lg:px-16",children:y("div",{className:"mx-auto max-w-6xl",children:[a(en,{eyebrow:"Team & Modules",title:"\u56E2\u961F\u534F\u4F5C\uFF0C\u6A21\u5757\u5316\u6F14\u8FDB",subtitle:"\u4E0D\u540C\u4E13\u4E1A\u9875\u9762\u7531\u4E0D\u540C\u6A21\u5757\u5206\u5DE5\u5F00\u53D1\uFF0C\u65E2\u72EC\u7ACB\u6F14\u8FDB\uFF0C\u53C8\u5171\u4EAB\u6838\u5FC3\u72B6\u6001\u4E0E\u5750\u6807\u4F53\u7CFB\u3002"}),a("div",{className:"mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4",children:nm.map(e=>y("div",{className:`text-center ${as}`,children:[a("div",{className:`mx-auto flex h-16 w-16 items-center justify-center rounded-full font-instrument-serif text-2xl ${e.tone}`,children:e.initials}),a("h3",{className:"mt-5 text-lg font-semibold text-ink",children:e.module}),a("p",{className:"mt-1 text-xs font-medium uppercase tracking-wider text-emerald-700",children:e.owner}),a("p",{className:"mt-3 text-sm font-light text-muted leading-relaxed",children:e.desc})]},e.module))})]})}),a("section",{className:"px-6 py-20 md:px-12 lg:px-16",children:y("div",{className:"mx-auto flex max-w-3xl flex-col items-center gap-5 rounded-3xl border border-emerald-100 bg-emerald-50/60 px-8 py-12 text-center",children:[a(Wd,{className:"h-8 w-8 text-emerald-600",strokeWidth:1.5}),a("p",{className:"max-w-xl text-sm font-light text-muted leading-relaxed",children:"\u5F53\u524D\u7248\u672C\u5DF2\u63A5\u5165 Spring Boot\u3001MySQL \u4E0E\u865A\u62DF\u4F20\u611F\u5668\u6570\u636E\uFF0C\u652F\u6301\u767B\u5F55\u6CE8\u518C\u3001\u6570\u636E\u5DE5\u4F5C\u53F0\u3001\u6570\u5B57\u5B6A\u751F\u3001\u8BBE\u5907\u53CA\u704C\u6E89\u63A7\u5236\u3001\u76D1\u63A7\u5206\u6790\u548C\u667A\u80FD\u95EE\u519C\u3002\u65E0\u5B9E\u4F53\u4F20\u611F\u5668\u65F6\u7531\u670D\u52A1\u7AEF\u6301\u7EED\u751F\u6210\u6F14\u793A\u6570\u636E\u3002"})]})}),a(sl,{title:"\u548C\u6211\u4EEC\u4E00\u8D77\uFF0C\u8BA9\u8015\u79CD\u66F4\u667A\u6167",subtitle:"\u4ECE\u4E00\u5757\u519C\u7530\u3001\u4E00\u5EA7\u6E29\u5BA4\u5F00\u59CB\uFF0C\u7528 AI \u539F\u751F\u4F53\u9A8C\u91CD\u5851\u519C\u4E1A\u751F\u4EA7\u3002",href:Ee,label:"\u8FDB\u5165\u5E73\u53F0"})]})}const rm=[{icon:Sh,label:"\u90AE\u4EF6\u8054\u7CFB",value:bi,href:`mailto:${bi}`},{icon:$o,label:"\u6570\u636E\u5DE5\u4F5C\u53F0",value:"\u8FDB\u5165\u5E73\u53F0\u4F53\u9A8C",href:Ee},{icon:zd,label:"\u667A\u80FD\u95EE\u519C",value:"\u81EA\u7136\u8BED\u8A00\u95EE\u519C",href:rt}],Jr="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-slate-400 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100",Zr="mb-1.5 block text-sm font-medium text-ink";function um(){const[e,n]=P.exports.useState({name:"",email:"",subject:"",message:"",_honey:""}),[t,r]=P.exports.useState("idle");function u(i){return o=>n(s=>({...s,[i]:o.target.value}))}async function l(i){if(i.preventDefault(),!e._honey){r("sending");try{const o=await fetch(`https://formsubmit.co/ajax/${bi}`,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({_subject:`\u5B98\u7F51\u7559\u8A00\uFF1A${e.subject||"\uFF08\u672A\u586B\u5199\u4E3B\u9898\uFF09"}`,name:e.name,email:e.email,message:e.message,_honey:e._honey})}),s=await o.json();o.ok&&s.success==="true"?(r("success"),n({name:"",email:"",subject:"",message:"",_honey:""})):r("error")}catch{r("error")}}}return y(q,{children:[a(Rt,{eyebrow:"Contact",title:y(q,{children:["\u548C\u6211\u4EEC\u804A\u804A",a("br",{}),"\u4F60\u7684\u519C\u573A"]}),subtitle:"\u65E0\u8BBA\u662F\u4E86\u89E3\u5E73\u53F0\u3001\u54A8\u8BE2\u89E3\u51B3\u65B9\u6848\uFF0C\u8FD8\u662F\u60F3\u4E00\u8D77\u63A8\u8FDB\u667A\u6167\u519C\u4E1A\uFF0C\u90FD\u6B22\u8FCE\u7559\u8A00\u3002"}),a("section",{className:"px-6 pb-24 md:px-12 lg:px-16",children:y("div",{className:"mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.2fr]",children:[y("div",{className:"space-y-4",children:[rm.map(i=>y("a",{href:i.href,className:"group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-card-hover",children:[a("div",{className:"flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700",children:a(i.icon,{className:"h-5 w-5",strokeWidth:1.8})}),y("div",{className:"min-w-0",children:[a("p",{className:"text-xs font-medium uppercase tracking-wider text-muted",children:i.label}),a("p",{className:"truncate text-sm font-medium text-ink group-hover:text-emerald-700",children:i.value})]}),a(nn,{className:"ml-auto h-4 w-4 shrink-0 text-slate-300 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-emerald-500"})]},i.label)),a("p",{className:"rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5 text-xs font-light text-muted leading-relaxed",children:"\u8868\u5355\u901A\u8FC7 FormSubmit \u53D1\u9001\u5230\u6307\u5B9A\u90AE\u7BB1\uFF0C\u65E0\u9700\u6CE8\u518C\u540E\u7AEF\uFF1B\u63D0\u4EA4\u540E\u4F1A\u6536\u5230\u300C\u5B98\u7F51\u7559\u8A00\u300D\u4E3B\u9898\u7684\u90AE\u4EF6\u3002"})]}),y("form",{onSubmit:l,className:"rounded-3xl border border-slate-200 bg-white p-8 shadow-card-hover md:p-10",children:[a("h2",{className:"font-instrument-serif text-2xl text-ink",children:"\u7559\u4E0B\u4F60\u7684\u4FE1\u606F"}),a("p",{className:"mt-2 text-sm font-light text-muted",children:"\u6211\u4EEC\u4F1A\u5728\u6536\u5230\u7559\u8A00\u540E\u5C3D\u5FEB\u4E0E\u4F60\u8054\u7CFB\u3002"}),a("input",{type:"text",name:"_honey",value:e._honey,onChange:u("_honey"),className:"hidden",tabIndex:-1,autoComplete:"off"}),y("div",{className:"mt-8 grid gap-6 sm:grid-cols-2",children:[y("div",{children:[a("label",{htmlFor:"name",className:Zr,children:"\u79F0\u547C"}),a("input",{id:"name",type:"text",required:!0,value:e.name,onChange:u("name"),placeholder:"\u600E\u4E48\u79F0\u547C\u4F60",className:Jr})]}),y("div",{children:[a("label",{htmlFor:"email",className:Zr,children:"\u90AE\u7BB1"}),a("input",{id:"email",type:"email",required:!0,value:e.email,onChange:u("email"),placeholder:"you@example.com",className:Jr})]})]}),y("div",{className:"mt-6",children:[a("label",{htmlFor:"subject",className:Zr,children:"\u4E3B\u9898"}),a("input",{id:"subject",type:"text",value:e.subject,onChange:u("subject"),placeholder:"\u60F3\u804A\u70B9\u4EC0\u4E48\uFF08\u53EF\u9009\uFF09",className:Jr})]}),y("div",{className:"mt-6",children:[a("label",{htmlFor:"message",className:Zr,children:"\u7559\u8A00\u5185\u5BB9"}),a("textarea",{id:"message",required:!0,rows:6,value:e.message,onChange:u("message"),placeholder:"\u60F3\u4E86\u89E3\u5E73\u53F0\u3001\u89E3\u51B3\u65B9\u6848\uFF0C\u6216\u4EFB\u4F55\u5EFA\u8BAE\u2026",className:`${Jr} resize-none`})]}),t==="success"&&y("div",{className:"mt-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700",children:[a(xh,{className:"h-5 w-5 shrink-0"}),"\u7559\u8A00\u5DF2\u53D1\u9001\uFF0C\u6211\u4EEC\u4F1A\u5C3D\u5FEB\u56DE\u590D\u4F60\uFF01"]}),t==="error"&&y("div",{className:"mt-6 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-600",children:[a(Oh,{className:"h-5 w-5 shrink-0"}),"\u53D1\u9001\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5\u6216\u76F4\u63A5\u90AE\u4EF6\u8054\u7CFB\u3002"]}),a("button",{type:"submit",disabled:t==="sending",className:"group mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-3.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-60",children:t==="sending"?y(q,{children:[a(Ah,{className:"h-4 w-4 animate-spin"})," \u53D1\u9001\u4E2D\u2026"]}):y(q,{children:["\u53D1\u9001\u7559\u8A00",a(Th,{className:"h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"})]})})]})]})})]})}function Hd({onCapture:e,busy:n=!1,label:t="\u8BC6\u522B",allowUpload:r=!0}){const u=P.exports.useRef(null),l=P.exports.useRef(null),[i,o]=P.exports.useState(""),[s,c]=P.exports.useState(null);P.exports.useEffect(()=>{let F=!1;async function I(){try{const f=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user",width:{ideal:640},height:{ideal:480}},audio:!1});if(F){f.getTracks().forEach(d=>d.stop());return}l.current=f,u.current&&(u.current.srcObject=f,u.current.play().catch(()=>{}))}catch{F||o(r?"\u65E0\u6CD5\u6253\u5F00\u6444\u50CF\u5934\uFF0C\u8BF7\u5141\u8BB8\u8BBF\u95EE\u6743\u9650\uFF0C\u6216\u6539\u7528\u4E0B\u65B9\u56FE\u7247\u4E0A\u4F20":"\u65E0\u6CD5\u6253\u5F00\u6444\u50CF\u5934\uFF0C\u8BF7\u5141\u8BB8\u6D4F\u89C8\u5668\u8BBF\u95EE\u6444\u50CF\u5934\u540E\u91CD\u8BD5")}}return I(),()=>{var f;F=!0,(f=l.current)==null||f.getTracks().forEach(d=>d.stop()),l.current=null}},[]);function h(){const F=u.current;if(!F||!F.videoWidth)return;const I=document.createElement("canvas"),f=512/F.videoWidth;I.width=512,I.height=Math.round(F.videoHeight*f),I.getContext("2d").drawImage(F,0,0,I.width,I.height),c(I.toDataURL("image/jpeg",.9))}function m(){c(null),o("")}function p(F){const[I,f]=F.split(","),d=atob(f),g=new Uint8Array(d.length);for(let E=0;E<d.length;E++)g[E]=d.charCodeAt(E);return new Blob([g],{type:"image/jpeg"})}function v(){s&&e(p(s))}function w(F){var f;const I=(f=F.target.files)==null?void 0:f[0];I&&e(I)}return y("div",{className:"space-y-3",children:[a("div",{className:"relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-foreground/5",children:s?a("img",{src:s,alt:"captured face",className:"h-full w-full object-cover"}):y(q,{children:[a("video",{ref:u,playsInline:!0,muted:!0,className:"h-full w-full object-cover"}),i&&a("div",{className:"absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-muted-foreground",children:i})]})}),a("div",{className:"flex items-center justify-center gap-3",children:s?y(q,{children:[y("button",{type:"button",onClick:m,className:"flex items-center gap-2 rounded-2xl border border-border px-4 py-3 text-sm transition-colors hover:bg-secondary",children:[a(Ph,{className:"h-4 w-4"})," \u91CD\u62CD"]}),y("button",{type:"button",disabled:n,onClick:v,className:"flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60",children:[a(Oi,{className:"h-4 w-4"})," ",n?"\u8BC6\u522B\u4E2D\u2026":t]})]}):y(q,{children:[y("button",{type:"button",onClick:h,className:"flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",children:[a(Oi,{className:"h-4 w-4"})," \u62CD\u7167"]}),r&&y("label",{className:"flex cursor-pointer items-center gap-2 rounded-2xl border border-border px-4 py-3 text-sm transition-colors hover:bg-secondary",children:[a(Lh,{className:"h-4 w-4"})," \u4E0A\u4F20\u56FE\u7247",a("input",{type:"file",accept:"image/*",className:"hidden",onChange:w})]})]})})]})}const lm=()=>y("svg",{xmlns:"http://www.w3.org/2000/svg",className:"h-5 w-5",viewBox:"0 0 48 48",children:[a("path",{fill:"#FFC107",d:"M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z"}),a("path",{fill:"#FF3D00",d:"M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"}),a("path",{fill:"#4CAF50",d:"M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"}),a("path",{fill:"#1976D2",d:"M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z"})]}),qr=({children:e})=>a("div",{className:"rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-violet-400/70 focus-within:bg-violet-500/10",children:e}),Ul=({testimonial:e,delay:n})=>y("div",{className:`animate-testimonial ${n} flex items-start gap-3 rounded-3xl bg-card/40 dark:bg-zinc-800/40 backdrop-blur-xl border border-white/10 p-5 w-64`,children:[a("img",{src:e.avatarSrc,className:"h-10 w-10 object-cover rounded-2xl",alt:"avatar"}),y("div",{className:"text-sm leading-snug",children:[a("p",{className:"flex items-center gap-1 font-medium text-foreground",children:e.name}),a("p",{className:"text-muted-foreground",children:e.handle}),a("p",{className:"mt-1 text-foreground/80",children:e.text})]})]}),Qd=({mode:e="sign-in",title:n=a("span",{className:"font-light text-foreground tracking-tighter",children:"Welcome"}),description:t="Access your account and continue your journey with us",heroImageSrc:r,testimonials:u=[],onSignIn:l,onSignUp:i,onFaceLogin:o,faceBusy:s=!1,submitBusy:c=!1,enableFace:h=!1,onGoogleSignIn:m,onResetPassword:p,onCreateAccount:v,onSignInLink:w,backHref:F,backLabel:I,error:f})=>{const[d,g]=P.exports.useState(!1),[E,C]=P.exports.useState(!1),[A,S]=P.exports.useState(!1),x=e==="sign-up",N={title:"animate-delay-100",desc:"animate-delay-200",name:x?"animate-delay-300":"",email:x?"animate-delay-400":"animate-delay-300",password:x?"animate-delay-500":"animate-delay-400",confirm:x?"animate-delay-600":"",extras:x?"":"animate-delay-500",submit:x?"animate-delay-700":"animate-delay-600",divider:x?"animate-delay-800":"animate-delay-700",social:x?"animate-delay-900":"animate-delay-800",footer:x?"animate-delay-1000":"animate-delay-900"},T="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none",U=te=>`flex-1 rounded-full py-2 transition-colors ${te?"bg-primary text-primary-foreground":"text-muted-foreground hover:text-foreground"}`;return y("div",{className:"h-[100dvh] flex flex-col md:flex-row font-geist w-[100dvw]",children:[a("section",{className:"flex-1 flex items-center justify-center p-8",children:a("div",{className:"w-full max-w-md",children:y("div",{className:"flex flex-col gap-6",children:[F&&a("a",{href:F,className:"animate-element text-sm text-muted-foreground transition-colors hover:text-foreground",children:I||"\u2190 Back"}),h&&y("div",{className:"animate-element flex rounded-full border border-border p-1 text-sm",children:[a("button",{type:"button",onClick:()=>S(!1),className:U(!A),children:"\u5BC6\u7801\u767B\u5F55"}),a("button",{type:"button",onClick:()=>S(!0),className:U(A),children:"\u5237\u8138\u767B\u5F55"})]}),A?y(q,{children:[y("div",{className:"animate-element animate-delay-100",children:[a("h1",{className:"text-4xl md:text-5xl font-semibold leading-tight",children:"\u5237\u8138\u767B\u5F55"}),a("p",{className:"mt-2 text-muted-foreground",children:"\u4FDD\u6301\u9762\u90E8\u6B63\u5BF9\u6444\u50CF\u5934\uFF0C\u5149\u7EBF\u5145\u8DB3\u5373\u53EF\u8BC6\u522B"})]}),a("div",{className:"animate-element animate-delay-200",children:a(Hd,{onCapture:o,busy:s,label:"\u767B\u5F55",allowUpload:!1})})]}):y(q,{children:[a("h1",{className:`animate-element ${N.title} text-4xl md:text-5xl font-semibold leading-tight`,children:n}),a("p",{className:`animate-element ${N.desc} text-muted-foreground`,children:t}),y("form",{className:"space-y-5",onSubmit:x?i:l,children:[x&&y("div",{className:`animate-element ${N.name}`,children:[a("label",{className:"text-sm font-medium text-muted-foreground",children:"Full Name"}),a(qr,{children:a("input",{name:"name",type:"text",required:!0,placeholder:"How should we address you",className:T})})]}),y("div",{className:`animate-element ${N.email}`,children:[a("label",{className:"text-sm font-medium text-muted-foreground",children:"Email Address"}),a(qr,{children:a("input",{name:"email",type:"email",required:!0,placeholder:"Enter your email address",className:T})})]}),y("div",{className:`animate-element ${N.password}`,children:[a("label",{className:"text-sm font-medium text-muted-foreground",children:"Password"}),a(qr,{children:y("div",{className:"relative",children:[a("input",{name:"password",type:d?"text":"password",required:!0,minLength:x?6:void 0,placeholder:x?"At least 6 characters":"Enter your password",className:`${T} pr-12`}),a("button",{type:"button",onClick:()=>g(!d),"aria-label":d?"Hide password":"Show password",className:"absolute inset-y-0 right-3 flex items-center",children:d?a(ls,{className:"w-5 h-5 text-muted-foreground hover:text-foreground transition-colors"}):a(Mi,{className:"w-5 h-5 text-muted-foreground hover:text-foreground transition-colors"})})]})})]}),x&&y("div",{className:`animate-element ${N.confirm}`,children:[a("label",{className:"text-sm font-medium text-muted-foreground",children:"Confirm Password"}),a(qr,{children:y("div",{className:"relative",children:[a("input",{name:"confirm",type:E?"text":"password",required:!0,placeholder:"Re-enter your password",className:`${T} pr-12`}),a("button",{type:"button",onClick:()=>C(!E),"aria-label":E?"Hide password":"Show password",className:"absolute inset-y-0 right-3 flex items-center",children:E?a(ls,{className:"w-5 h-5 text-muted-foreground hover:text-foreground transition-colors"}):a(Mi,{className:"w-5 h-5 text-muted-foreground hover:text-foreground transition-colors"})})]})})]}),!x&&y("div",{className:`animate-element ${N.extras} flex items-center justify-between text-sm`,children:[y("label",{className:"flex items-center gap-3 cursor-pointer",children:[a("input",{type:"checkbox",name:"rememberMe",className:"custom-checkbox"}),a("span",{className:"text-foreground/90",children:"Keep me signed in"})]}),a("a",{href:"#",onClick:te=>{te.preventDefault(),p==null||p()},className:"hover:underline text-violet-400 transition-colors",children:"Reset password"})]}),a("button",{type:"submit",disabled:c,className:`animate-element ${N.submit} w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:cursor-not-allowed disabled:opacity-60`,children:c?"\u8BF7\u7A0D\u5019\u2026":x?"Create Account":"Sign In"})]})]}),f&&a("div",{className:"animate-element rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600",role:"alert",children:f}),!A&&m&&y(q,{children:[y("div",{className:`animate-element ${N.divider} relative flex items-center justify-center`,children:[a("span",{className:"w-full border-t border-border"}),a("span",{className:"px-4 text-sm text-muted-foreground bg-background absolute",children:"Or continue with"})]}),y("button",{onClick:m,className:`animate-element ${N.social} w-full flex items-center justify-center gap-3 border border-border rounded-2xl py-4 hover:bg-secondary transition-colors`,children:[a(lm,{}),"Continue with Google"]})]}),a("button",{type:"button",onClick:x?w:v,className:`animate-element ${N.footer} w-full rounded-2xl border border-border bg-background/55 py-3.5 text-sm font-medium text-foreground transition-all hover:border-primary/35 hover:bg-primary/5 hover:text-primary`,children:x?"\u5DF2\u6709\u8D26\u53F7\uFF0C\u8FD4\u56DE\u767B\u5F55":"\u8FD8\u6CA1\u6709\u8D26\u53F7\uFF1F\u7ACB\u5373\u6CE8\u518C"})]})})}),r&&y("section",{className:"hidden md:block flex-1 relative p-4",children:[a("div",{className:"animate-slide-right animate-delay-300 absolute inset-4 rounded-3xl bg-cover bg-center",style:{backgroundImage:`url(${r})`}}),u.length>0&&y("div",{className:"absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 px-8 w-full justify-center",children:[a(Ul,{testimonial:u[0],delay:"animate-delay-1000"}),u[1]&&a("div",{className:"hidden xl:flex",children:a(Ul,{testimonial:u[1],delay:"animate-delay-1200"})}),u[2]&&a("div",{className:"hidden 2xl:flex",children:a(Ul,{testimonial:u[2],delay:"animate-delay-1400"})})]})]})]})},im="/api",jo="ty_token",Gd="ty_user";function om(e){var n;return(n=localStorage.getItem(e))!=null?n:sessionStorage.getItem(e)}async function cl(e,{headers:n={},body:t,...r}={}){const u=t instanceof FormData,l=await fetch(`${im}${e}`,{...r,body:t,headers:{...u?{}:{"Content-Type":"application/json"},...n}}),i=await l.json().catch(()=>({}));if(!l.ok)throw new Error(i.message||`\u8BF7\u6C42\u5931\u8D25\uFF08${l.status}\uFF09`);return i}function am({name:e,email:n,password:t}){return cl("/auth/register",{method:"POST",body:JSON.stringify({name:e,email:n,password:t})})}function sm({email:e,password:n}){return cl("/auth/login",{method:"POST",body:JSON.stringify({email:e,password:n})})}function cm(e){const n=new FormData;return n.append("photo",e,"face.jpg"),cl("/auth/face-register",{method:"POST",body:n,headers:{Authorization:`Bearer ${fm()}`}})}function dm(e){const n=new FormData;return n.append("photo",e,"face.jpg"),cl("/auth/face-login",{method:"POST",body:n})}function $i({token:e,user:n},t=!0){pm();const r=t?localStorage:sessionStorage;r.setItem(jo,e),r.setItem(Gd,JSON.stringify(n))}function fm(){return om(jo)}function pm(){for(const e of[localStorage,sessionStorage])e.removeItem(jo),e.removeItem(Gd)}const ss="/platform/",hm=[{avatarSrc:"https://randomuser.me/api/portraits/women/57.jpg",name:"\u674E\u54F2",handle:"\u6E29\u5BA4\u79CD\u690D\u4E3B\u7BA1",text:"\u628A\u516D\u5EA7\u6E29\u5BA4\u88C5\u8FDB\u4E00\u4E2A\u6570\u5B57\u5B6A\u751F\u91CC\uFF0C\u5DE1\u573A\u548C\u67E5\u6570\u636E\u90FD\u7701\u4E86\u592A\u591A\u65F6\u95F4\u3002"},{avatarSrc:"https://randomuser.me/api/portraits/men/64.jpg",name:"\u738B\u5C9A",handle:"\u519C\u573A\u8FD0\u8425\u7ECF\u7406",text:"\u4E00\u53E5\u8BDD\u5C31\u80FD\u95EE\u51FA\u571F\u58E4\u6E7F\u5EA6\u8D8B\u52BF\uFF0C\u8FD8\u80FD\u76F4\u63A5\u7ED9\u704C\u6E89\u5EFA\u8BAE\uFF0C\u771F\u4E0D\u7528\u7FFB\u62A5\u8868\u4E86\u3002"},{avatarSrc:"https://randomuser.me/api/portraits/men/32.jpg",name:"\u9648\u65B9",handle:"\u519C\u4E1A\u6570\u5B57\u5316\u987E\u95EE",text:"\u5B9E\u666F\u548C 3D \u5171\u7528\u4E00\u5957\u5750\u6807\uFF0C\u7ED9\u5BA2\u6237\u6F14\u793A\u6548\u679C\u975E\u5E38\u76F4\u89C2\u3002"}];function mm(){const e=rl(),[n,t]=P.exports.useState(""),[r,u]=P.exports.useState(!1),[l,i]=P.exports.useState(!1);return a(Qd,{mode:"sign-in",title:"\u6B22\u8FCE\u56DE\u6765",description:"\u767B\u5F55\u4F60\u7684\u7530\u8A00\u8015\u667A\u8D26\u53F7\uFF0C\u7EE7\u7EED\u67E5\u770B\u4F60\u7684\u519C\u573A\u3002",heroImageSrc:"/assets/uc.png",testimonials:hm,error:n,submitBusy:l,enableFace:!0,faceBusy:r,onFaceLogin:async c=>{t(""),u(!0);try{const h=await dm(c);$i(h),window.location.href=ss}catch(h){t(h.message||"\u4EBA\u8138\u767B\u5F55\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5"),u(!1)}},onSignIn:async c=>{c.preventDefault(),t("");const h=Object.fromEntries(new FormData(c.currentTarget).entries());i(!0);try{const m=await sm({email:h.email,password:h.password});$i(m,h.rememberMe==="on"),window.location.href=ss}catch(m){t(m.message||"\u767B\u5F55\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5"),i(!1)}},onResetPassword:()=>{window.location.href="mailto:support@tianyan.agri?subject=\u7530\u8A00\u8015\u667A\u8D26\u53F7\u5BC6\u7801\u91CD\u7F6E"},onCreateAccount:()=>e("/sign-up"),backHref:"/#/",backLabel:"\u8FD4\u56DE\u5B98\u7F51"})}const cs="/platform/",gm=[{avatarSrc:"https://randomuser.me/api/portraits/women/57.jpg",name:"\u674E\u54F2",handle:"\u6E29\u5BA4\u79CD\u690D\u4E3B\u7BA1",text:"\u628A\u516D\u5EA7\u6E29\u5BA4\u88C5\u8FDB\u4E00\u4E2A\u6570\u5B57\u5B6A\u751F\u91CC\uFF0C\u5DE1\u573A\u548C\u67E5\u6570\u636E\u90FD\u7701\u4E86\u592A\u591A\u65F6\u95F4\u3002"},{avatarSrc:"https://randomuser.me/api/portraits/men/64.jpg",name:"\u738B\u5C9A",handle:"\u519C\u573A\u8FD0\u8425\u7ECF\u7406",text:"\u4E00\u53E5\u8BDD\u5C31\u80FD\u95EE\u51FA\u571F\u58E4\u6E7F\u5EA6\u8D8B\u52BF\uFF0C\u8FD8\u80FD\u76F4\u63A5\u7ED9\u704C\u6E89\u5EFA\u8BAE\uFF0C\u771F\u4E0D\u7528\u7FFB\u62A5\u8868\u4E86\u3002"},{avatarSrc:"https://randomuser.me/api/portraits/men/32.jpg",name:"\u9648\u65B9",handle:"\u519C\u4E1A\u6570\u5B57\u5316\u987E\u95EE",text:"\u5B9E\u666F\u548C 3D \u5171\u7528\u4E00\u5957\u5750\u6807\uFF0C\u7ED9\u5BA2\u6237\u6F14\u793A\u6548\u679C\u975E\u5E38\u76F4\u89C2\u3002"}];function ym(){const e=rl(),[n,t]=P.exports.useState(""),[r,u]=P.exports.useState("form"),[l,i]=P.exports.useState(!1),[o,s]=P.exports.useState(!1),c=async m=>{m.preventDefault(),t("");const p=Object.fromEntries(new FormData(m.currentTarget).entries());if(p.password!==p.confirm){t("\u4E24\u6B21\u8F93\u5165\u7684\u5BC6\u7801\u4E0D\u4E00\u81F4\uFF0C\u8BF7\u91CD\u65B0\u8F93\u5165\u3002");return}s(!0);try{const v=await am({name:p.name,email:p.email,password:p.password});$i(v),u("face"),s(!1)}catch(v){t(v.message||"\u6CE8\u518C\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u518D\u8BD5"),s(!1)}},h=async m=>{t(""),i(!0);try{await cm(m),window.location.href=cs}catch(p){t(p.message||"\u4EBA\u8138\u7ED1\u5B9A\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5"),i(!1)}};return r==="face"?a("div",{className:"flex min-h-[100dvh] items-center justify-center bg-page p-8",children:y("div",{className:"flex w-full max-w-md flex-col gap-6 text-center",children:[y("span",{className:"animate-element inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-emerald-700",children:[a("span",{className:"h-1.5 w-1.5 rounded-full bg-emerald-500"}),"Face Binding"]}),a("h1",{className:"animate-element animate-delay-100 font-instrument-serif text-4xl text-ink md:text-5xl",children:"\u7ED1\u5B9A\u4EBA\u8138"}),a("p",{className:"animate-element animate-delay-200 font-light text-muted",children:"\u6CE8\u518C\u6210\u529F\uFF01\u7ED1\u5B9A\u4EBA\u8138\u540E\uFF0C\u4E0B\u6B21\u5728\u5B98\u7F51\u5373\u53EF\u76F4\u63A5\u5237\u8138\u767B\u5F55\u3002"}),a("div",{className:"animate-element animate-delay-300",children:a(Hd,{onCapture:h,busy:l,label:"\u7ED1\u5B9A\u5E76\u8FDB\u5165"})}),n&&a("p",{className:"animate-element rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600",role:"alert",children:n}),y("button",{onClick:()=>{window.location.href=cs},className:"animate-element animate-delay-400 inline-flex items-center justify-center gap-1.5 text-sm font-light text-muted transition-colors hover:text-ink",children:["\u8DF3\u8FC7\uFF0C\u7A0D\u540E\u5728\u5E73\u53F0\u8BBE\u7F6E\u4E2D\u7ED1\u5B9A ",a(nn,{className:"h-4 w-4"})]})]})}):a(Qd,{mode:"sign-up",title:"\u521B\u5EFA\u8D26\u53F7",description:"\u6CE8\u518C\u7530\u8A00\u8015\u667A\uFF0C\u628A\u6570\u636E\u5E26\u8FDB\u4F60\u7684\u519C\u573A\u3002",heroImageSrc:"/assets/uc.png",testimonials:gm,error:n,submitBusy:o,onSignUp:c,onSignInLink:()=>e("/sign-in"),backHref:"/#/",backLabel:"\u8FD4\u56DE\u5B98\u7F51"})}const vm=[{slug:"user-manual",icon:Rd,eyebrow:"USER GUIDE",title:"\u7528\u6237\u4F7F\u7528\u624B\u518C",description:"\u4ECE\u8D26\u53F7\u767B\u5F55\u5230\u667A\u80FD\u95EE\u519C\u3001\u6570\u5B57\u5B6A\u751F\u3001\u8BBE\u5907\u63A7\u5236\u4E0E\u544A\u8B66\u5904\u7406\uFF0C\u6309\u5B9E\u9645\u64CD\u4F5C\u6D41\u7A0B\u5FEB\u901F\u4E0A\u624B\u3002",audience:"\u5E73\u53F0\u4F7F\u7528\u8005\u4E0E\u519C\u573A\u7BA1\u7406\u4EBA\u5458",reading:"\u7EA6 25 \u5206\u949F",tone:"bg-emerald-100 text-emerald-700"},{slug:"technical-manual",icon:bd,eyebrow:"TECHNICAL GUIDE",title:"\u6280\u672F\u8BF4\u660E\u624B\u518C",description:"\u6DB5\u76D6\u7CFB\u7EDF\u67B6\u6784\u3001\u5F00\u53D1\u73AF\u5883\u3001\u6570\u636E\u5E93\u3001\u63A5\u53E3\u3001\u524D\u540E\u7AEF\u6784\u5EFA\u4E0E\u751F\u4EA7\u90E8\u7F72\uFF0C\u5E2E\u52A9\u7814\u53D1\u4EBA\u5458\u7EF4\u62A4\u5E73\u53F0\u3002",audience:"\u5F00\u53D1\u3001\u6D4B\u8BD5\u4E0E\u8FD0\u7EF4\u4EBA\u5458",reading:"\u7EA6 35 \u5206\u949F",tone:"bg-sky-100 text-sky-700"}];function Em(){return y(q,{children:[a(Rt,{eyebrow:"Documentation",title:y(q,{children:["\u6587\u6863\u8BF4\u660E",a("br",{}),"\u4ECE\u4F7F\u7528\u5230\u5F00\u53D1\uFF0C\u4E00\u7AD9\u67E5\u9605"]}),subtitle:"\u9009\u62E9\u9002\u5408\u4F60\u7684\u624B\u518C\uFF0C\u4E86\u89E3\u7530\u8A00\u8015\u667A\u7684\u5B8C\u6574\u64CD\u4F5C\u6D41\u7A0B\u4E0E\u6280\u672F\u5B9E\u73B0\u3002\u6587\u6863\u5185\u5BB9\u968F\u9879\u76EE\u7248\u672C\u540C\u6B65\u66F4\u65B0\u3002"}),a("section",{className:"px-6 pb-24 md:px-12 lg:px-16",children:a("div",{className:"mx-auto grid max-w-5xl gap-6 md:grid-cols-2",children:vm.map(e=>{const n=e.icon;return y(on,{to:`/docs/${e.slug}`,className:"group flex min-h-[330px] flex-col rounded-[2rem] border border-slate-200 bg-white p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-card-hover md:p-10",children:[a("div",{className:`flex h-14 w-14 items-center justify-center rounded-2xl ${e.tone}`,children:a(n,{className:"h-6 w-6",strokeWidth:1.6})}),a("p",{className:"mt-8 text-[11px] font-semibold tracking-[0.2em] text-emerald-700",children:e.eyebrow}),a("h2",{className:"mt-3 font-instrument-serif text-3xl text-ink",children:e.title}),a("p",{className:"mt-4 flex-1 text-sm font-light leading-7 text-muted",children:e.description}),y("div",{className:"mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 pt-5 text-xs text-muted",children:[y("span",{className:"inline-flex items-center gap-1.5",children:[a(Wd,{className:"h-3.5 w-3.5"}),e.audience]}),y("span",{className:"inline-flex items-center gap-1.5",children:[a(Fh,{className:"h-3.5 w-3.5"}),e.reading]})]}),y("span",{className:"mt-5 inline-flex items-center gap-2 text-sm font-medium text-emerald-700",children:["\u9605\u8BFB\u6587\u6863 ",a(nn,{className:"h-4 w-4 transition-transform group-hover:translate-x-1"})]})]},e.slug)})})})]})}function Kd(){return{async:!1,baseUrl:null,breaks:!1,extensions:null,gfm:!0,headerIds:!0,headerPrefix:"",highlight:null,hooks:null,langPrefix:"language-",mangle:!0,pedantic:!1,renderer:null,sanitize:!1,sanitizer:null,silent:!1,smartypants:!1,tokenizer:null,walkTokens:null,xhtml:!1}}let ut=Kd();function xm(e){ut=e}const Yd=/[&<>"']/,Fm=new RegExp(Yd.source,"g"),Jd=/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,wm=new RegExp(Jd.source,"g"),km={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},ds=e=>km[e];function pe(e,n){if(n){if(Yd.test(e))return e.replace(Fm,ds)}else if(Jd.test(e))return e.replace(wm,ds);return e}const Cm=/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig;function Zd(e){return e.replace(Cm,(n,t)=>(t=t.toLowerCase(),t==="colon"?":":t.charAt(0)==="#"?t.charAt(1)==="x"?String.fromCharCode(parseInt(t.substring(2),16)):String.fromCharCode(+t.substring(1)):""))}const Am=/(^|[^\[])\^/g;function W(e,n){e=typeof e=="string"?e:e.source,n=n||"";const t={replace:(r,u)=>(u=u.source||u,u=u.replace(Am,"$1"),e=e.replace(r,u),t),getRegex:()=>new RegExp(e,n)};return t}const Sm=/[^\w:]/g,Bm=/^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;function fs(e,n,t){if(e){let r;try{r=decodeURIComponent(Zd(t)).replace(Sm,"").toLowerCase()}catch{return null}if(r.indexOf("javascript:")===0||r.indexOf("vbscript:")===0||r.indexOf("data:")===0)return null}n&&!Bm.test(t)&&(t=Pm(n,t));try{t=encodeURI(t).replace(/%25/g,"%")}catch{return null}return t}const Xr={},Dm=/^[^:]+:\/*[^/]*$/,Nm=/^([^:]+:)[\s\S]*$/,_m=/^([^:]+:\/*[^/]*)[\s\S]*$/;function Pm(e,n){Xr[" "+e]||(Dm.test(e)?Xr[" "+e]=e+"/":Xr[" "+e]=fu(e,"/",!0)),e=Xr[" "+e];const t=e.indexOf(":")===-1;return n.substring(0,2)==="//"?t?n:e.replace(Nm,"$1")+n:n.charAt(0)==="/"?t?n:e.replace(_m,"$1")+n:e+n}const $u={exec:function(){}};function ps(e,n){const t=e.replace(/\|/g,(l,i,o)=>{let s=!1,c=i;for(;--c>=0&&o[c]==="\\";)s=!s;return s?"|":" |"}),r=t.split(/ \|/);let u=0;if(r[0].trim()||r.shift(),r.length>0&&!r[r.length-1].trim()&&r.pop(),r.length>n)r.splice(n);else for(;r.length<n;)r.push("");for(;u<r.length;u++)r[u]=r[u].trim().replace(/\\\|/g,"|");return r}function fu(e,n,t){const r=e.length;if(r===0)return"";let u=0;for(;u<r;){const l=e.charAt(r-u-1);if(l===n&&!t)u++;else if(l!==n&&t)u++;else break}return e.slice(0,r-u)}function Tm(e,n){if(e.indexOf(n[1])===-1)return-1;const t=e.length;let r=0,u=0;for(;u<t;u++)if(e[u]==="\\")u++;else if(e[u]===n[0])r++;else if(e[u]===n[1]&&(r--,r<0))return u;return-1}function Im(e){e&&e.sanitize&&!e.silent&&console.warn("marked(): sanitize and sanitizer parameters are deprecated since version 0.7.0, should not be used and will be removed in the future. Read more here: https://marked.js.org/#/USING_ADVANCED.md#options")}function hs(e,n){if(n<1)return"";let t="";for(;n>1;)n&1&&(t+=e),n>>=1,e+=e;return t+e}function ms(e,n,t,r){const u=n.href,l=n.title?pe(n.title):null,i=e[1].replace(/\\([\[\]])/g,"$1");if(e[0].charAt(0)!=="!"){r.state.inLink=!0;const o={type:"link",raw:t,href:u,title:l,text:i,tokens:r.inlineTokens(i)};return r.state.inLink=!1,o}return{type:"image",raw:t,href:u,title:l,text:pe(i)}}function Lm(e,n){const t=e.match(/^(\s+)(?:```)/);if(t===null)return n;const r=t[1];return n.split(`
`).map(u=>{const l=u.match(/^\s+/);if(l===null)return u;const[i]=l;return i.length>=r.length?u.slice(r.length):u}).join(`
`)}class Uo{constructor(n){this.options=n||ut}space(n){const t=this.rules.block.newline.exec(n);if(t&&t[0].length>0)return{type:"space",raw:t[0]}}code(n){const t=this.rules.block.code.exec(n);if(t){const r=t[0].replace(/^ {1,4}/gm,"");return{type:"code",raw:t[0],codeBlockStyle:"indented",text:this.options.pedantic?r:fu(r,`
`)}}}fences(n){const t=this.rules.block.fences.exec(n);if(t){const r=t[0],u=Lm(r,t[3]||"");return{type:"code",raw:r,lang:t[2]?t[2].trim().replace(this.rules.inline._escapes,"$1"):t[2],text:u}}}heading(n){const t=this.rules.block.heading.exec(n);if(t){let r=t[2].trim();if(/#$/.test(r)){const u=fu(r,"#");(this.options.pedantic||!u||/ $/.test(u))&&(r=u.trim())}return{type:"heading",raw:t[0],depth:t[1].length,text:r,tokens:this.lexer.inline(r)}}}hr(n){const t=this.rules.block.hr.exec(n);if(t)return{type:"hr",raw:t[0]}}blockquote(n){const t=this.rules.block.blockquote.exec(n);if(t){const r=t[0].replace(/^ *>[ \t]?/gm,""),u=this.lexer.state.top;this.lexer.state.top=!0;const l=this.lexer.blockTokens(r);return this.lexer.state.top=u,{type:"blockquote",raw:t[0],tokens:l,text:r}}}list(n){let t=this.rules.block.list.exec(n);if(t){let r,u,l,i,o,s,c,h,m,p,v,w,F=t[1].trim();const I=F.length>1,f={type:"list",raw:"",ordered:I,start:I?+F.slice(0,-1):"",loose:!1,items:[]};F=I?`\\d{1,9}\\${F.slice(-1)}`:`\\${F}`,this.options.pedantic&&(F=I?F:"[*+-]");const d=new RegExp(`^( {0,3}${F})((?:[	 ][^\\n]*)?(?:\\n|$))`);for(;n&&(w=!1,!(!(t=d.exec(n))||this.rules.block.hr.test(n)));){if(r=t[0],n=n.substring(r.length),h=t[2].split(`
`,1)[0].replace(/^\t+/,E=>" ".repeat(3*E.length)),m=n.split(`
`,1)[0],this.options.pedantic?(i=2,v=h.trimLeft()):(i=t[2].search(/[^ ]/),i=i>4?1:i,v=h.slice(i),i+=t[1].length),s=!1,!h&&/^ *$/.test(m)&&(r+=m+`
`,n=n.substring(m.length+1),w=!0),!w){const E=new RegExp(`^ {0,${Math.min(3,i-1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),C=new RegExp(`^ {0,${Math.min(3,i-1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),A=new RegExp(`^ {0,${Math.min(3,i-1)}}(?:\`\`\`|~~~)`),S=new RegExp(`^ {0,${Math.min(3,i-1)}}#`);for(;n&&(p=n.split(`
`,1)[0],m=p,this.options.pedantic&&(m=m.replace(/^ {1,4}(?=( {4})*[^ ])/g,"  ")),!(A.test(m)||S.test(m)||E.test(m)||C.test(n)));){if(m.search(/[^ ]/)>=i||!m.trim())v+=`
`+m.slice(i);else{if(s||h.search(/[^ ]/)>=4||A.test(h)||S.test(h)||C.test(h))break;v+=`
`+m}!s&&!m.trim()&&(s=!0),r+=p+`
`,n=n.substring(p.length+1),h=m.slice(i)}}f.loose||(c?f.loose=!0:/\n *\n *$/.test(r)&&(c=!0)),this.options.gfm&&(u=/^\[[ xX]\] /.exec(v),u&&(l=u[0]!=="[ ] ",v=v.replace(/^\[[ xX]\] +/,""))),f.items.push({type:"list_item",raw:r,task:!!u,checked:l,loose:!1,text:v}),f.raw+=r}f.items[f.items.length-1].raw=r.trimRight(),f.items[f.items.length-1].text=v.trimRight(),f.raw=f.raw.trimRight();const g=f.items.length;for(o=0;o<g;o++)if(this.lexer.state.top=!1,f.items[o].tokens=this.lexer.blockTokens(f.items[o].text,[]),!f.loose){const E=f.items[o].tokens.filter(A=>A.type==="space"),C=E.length>0&&E.some(A=>/\n.*\n/.test(A.raw));f.loose=C}if(f.loose)for(o=0;o<g;o++)f.items[o].loose=!0;return f}}html(n){const t=this.rules.block.html.exec(n);if(t){const r={type:"html",raw:t[0],pre:!this.options.sanitizer&&(t[1]==="pre"||t[1]==="script"||t[1]==="style"),text:t[0]};if(this.options.sanitize){const u=this.options.sanitizer?this.options.sanitizer(t[0]):pe(t[0]);r.type="paragraph",r.text=u,r.tokens=this.lexer.inline(u)}return r}}def(n){const t=this.rules.block.def.exec(n);if(t){const r=t[1].toLowerCase().replace(/\s+/g," "),u=t[2]?t[2].replace(/^<(.*)>$/,"$1").replace(this.rules.inline._escapes,"$1"):"",l=t[3]?t[3].substring(1,t[3].length-1).replace(this.rules.inline._escapes,"$1"):t[3];return{type:"def",tag:r,raw:t[0],href:u,title:l}}}table(n){const t=this.rules.block.table.exec(n);if(t){const r={type:"table",header:ps(t[1]).map(u=>({text:u})),align:t[2].replace(/^ *|\| *$/g,"").split(/ *\| */),rows:t[3]&&t[3].trim()?t[3].replace(/\n[ \t]*$/,"").split(`
`):[]};if(r.header.length===r.align.length){r.raw=t[0];let u=r.align.length,l,i,o,s;for(l=0;l<u;l++)/^ *-+: *$/.test(r.align[l])?r.align[l]="right":/^ *:-+: *$/.test(r.align[l])?r.align[l]="center":/^ *:-+ *$/.test(r.align[l])?r.align[l]="left":r.align[l]=null;for(u=r.rows.length,l=0;l<u;l++)r.rows[l]=ps(r.rows[l],r.header.length).map(c=>({text:c}));for(u=r.header.length,i=0;i<u;i++)r.header[i].tokens=this.lexer.inline(r.header[i].text);for(u=r.rows.length,i=0;i<u;i++)for(s=r.rows[i],o=0;o<s.length;o++)s[o].tokens=this.lexer.inline(s[o].text);return r}}}lheading(n){const t=this.rules.block.lheading.exec(n);if(t)return{type:"heading",raw:t[0],depth:t[2].charAt(0)==="="?1:2,text:t[1],tokens:this.lexer.inline(t[1])}}paragraph(n){const t=this.rules.block.paragraph.exec(n);if(t){const r=t[1].charAt(t[1].length-1)===`
`?t[1].slice(0,-1):t[1];return{type:"paragraph",raw:t[0],text:r,tokens:this.lexer.inline(r)}}}text(n){const t=this.rules.block.text.exec(n);if(t)return{type:"text",raw:t[0],text:t[0],tokens:this.lexer.inline(t[0])}}escape(n){const t=this.rules.inline.escape.exec(n);if(t)return{type:"escape",raw:t[0],text:pe(t[1])}}tag(n){const t=this.rules.inline.tag.exec(n);if(t)return!this.lexer.state.inLink&&/^<a /i.test(t[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&/^<\/a>/i.test(t[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&/^<(pre|code|kbd|script)(\s|>)/i.test(t[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&/^<\/(pre|code|kbd|script)(\s|>)/i.test(t[0])&&(this.lexer.state.inRawBlock=!1),{type:this.options.sanitize?"text":"html",raw:t[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,text:this.options.sanitize?this.options.sanitizer?this.options.sanitizer(t[0]):pe(t[0]):t[0]}}link(n){const t=this.rules.inline.link.exec(n);if(t){const r=t[2].trim();if(!this.options.pedantic&&/^</.test(r)){if(!/>$/.test(r))return;const i=fu(r.slice(0,-1),"\\");if((r.length-i.length)%2===0)return}else{const i=Tm(t[2],"()");if(i>-1){const s=(t[0].indexOf("!")===0?5:4)+t[1].length+i;t[2]=t[2].substring(0,i),t[0]=t[0].substring(0,s).trim(),t[3]=""}}let u=t[2],l="";if(this.options.pedantic){const i=/^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(u);i&&(u=i[1],l=i[3])}else l=t[3]?t[3].slice(1,-1):"";return u=u.trim(),/^</.test(u)&&(this.options.pedantic&&!/>$/.test(r)?u=u.slice(1):u=u.slice(1,-1)),ms(t,{href:u&&u.replace(this.rules.inline._escapes,"$1"),title:l&&l.replace(this.rules.inline._escapes,"$1")},t[0],this.lexer)}}reflink(n,t){let r;if((r=this.rules.inline.reflink.exec(n))||(r=this.rules.inline.nolink.exec(n))){let u=(r[2]||r[1]).replace(/\s+/g," ");if(u=t[u.toLowerCase()],!u){const l=r[0].charAt(0);return{type:"text",raw:l,text:l}}return ms(r,u,r[0],this.lexer)}}emStrong(n,t,r=""){let u=this.rules.inline.emStrong.lDelim.exec(n);if(!u||u[3]&&r.match(/[\p{L}\p{N}]/u))return;const l=u[1]||u[2]||"";if(!l||l&&(r===""||this.rules.inline.punctuation.exec(r))){const i=u[0].length-1;let o,s,c=i,h=0;const m=u[0][0]==="*"?this.rules.inline.emStrong.rDelimAst:this.rules.inline.emStrong.rDelimUnd;for(m.lastIndex=0,t=t.slice(-1*n.length+i);(u=m.exec(t))!=null;){if(o=u[1]||u[2]||u[3]||u[4]||u[5]||u[6],!o)continue;if(s=o.length,u[3]||u[4]){c+=s;continue}else if((u[5]||u[6])&&i%3&&!((i+s)%3)){h+=s;continue}if(c-=s,c>0)continue;s=Math.min(s,s+c+h);const p=n.slice(0,i+u.index+(u[0].length-o.length)+s);if(Math.min(i,s)%2){const w=p.slice(1,-1);return{type:"em",raw:p,text:w,tokens:this.lexer.inlineTokens(w)}}const v=p.slice(2,-2);return{type:"strong",raw:p,text:v,tokens:this.lexer.inlineTokens(v)}}}}codespan(n){const t=this.rules.inline.code.exec(n);if(t){let r=t[2].replace(/\n/g," ");const u=/[^ ]/.test(r),l=/^ /.test(r)&&/ $/.test(r);return u&&l&&(r=r.substring(1,r.length-1)),r=pe(r,!0),{type:"codespan",raw:t[0],text:r}}}br(n){const t=this.rules.inline.br.exec(n);if(t)return{type:"br",raw:t[0]}}del(n){const t=this.rules.inline.del.exec(n);if(t)return{type:"del",raw:t[0],text:t[2],tokens:this.lexer.inlineTokens(t[2])}}autolink(n,t){const r=this.rules.inline.autolink.exec(n);if(r){let u,l;return r[2]==="@"?(u=pe(this.options.mangle?t(r[1]):r[1]),l="mailto:"+u):(u=pe(r[1]),l=u),{type:"link",raw:r[0],text:u,href:l,tokens:[{type:"text",raw:u,text:u}]}}}url(n,t){let r;if(r=this.rules.inline.url.exec(n)){let u,l;if(r[2]==="@")u=pe(this.options.mangle?t(r[0]):r[0]),l="mailto:"+u;else{let i;do i=r[0],r[0]=this.rules.inline._backpedal.exec(r[0])[0];while(i!==r[0]);u=pe(r[0]),r[1]==="www."?l="http://"+r[0]:l=r[0]}return{type:"link",raw:r[0],text:u,href:l,tokens:[{type:"text",raw:u,text:u}]}}}inlineText(n,t){const r=this.rules.inline.text.exec(n);if(r){let u;return this.lexer.state.inRawBlock?u=this.options.sanitize?this.options.sanitizer?this.options.sanitizer(r[0]):pe(r[0]):r[0]:u=pe(this.options.smartypants?t(r[0]):r[0]),{type:"text",raw:r[0],text:u}}}}const R={newline:/^(?: *(?:\n|$))+/,code:/^( {4}[^\n]+(?:\n(?: *(?:\n|$))*)?)+/,fences:/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,hr:/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,heading:/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,blockquote:/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,list:/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/,html:"^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n *)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$))",def:/^ {0,3}\[(label)\]: *(?:\n *)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n *)?| *\n *)(title))? *(?:\n+|$)/,table:$u,lheading:/^((?:.|\n(?!\n))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,_paragraph:/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,text:/^[^\n]+/};R._label=/(?!\s*\])(?:\\.|[^\[\]\\])+/;R._title=/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/;R.def=W(R.def).replace("label",R._label).replace("title",R._title).getRegex();R.bullet=/(?:[*+-]|\d{1,9}[.)])/;R.listItemStart=W(/^( *)(bull) */).replace("bull",R.bullet).getRegex();R.list=W(R.list).replace(/bull/g,R.bullet).replace("hr","\\n+(?=\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$))").replace("def","\\n+(?="+R.def.source+")").getRegex();R._tag="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul";R._comment=/<!--(?!-?>)[\s\S]*?(?:-->|$)/;R.html=W(R.html,"i").replace("comment",R._comment).replace("tag",R._tag).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex();R.paragraph=W(R._paragraph).replace("hr",R.hr).replace("heading"," {0,3}#{1,6} ").replace("|lheading","").replace("|table","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",R._tag).getRegex();R.blockquote=W(R.blockquote).replace("paragraph",R.paragraph).getRegex();R.normal={...R};R.gfm={...R.normal,table:"^ *([^\\n ].*\\|.*)\\n {0,3}(?:\\| *)?(:?-+:? *(?:\\| *:?-+:? *)*)(?:\\| *)?(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)"};R.gfm.table=W(R.gfm.table).replace("hr",R.hr).replace("heading"," {0,3}#{1,6} ").replace("blockquote"," {0,3}>").replace("code"," {4}[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",R._tag).getRegex();R.gfm.paragraph=W(R._paragraph).replace("hr",R.hr).replace("heading"," {0,3}#{1,6} ").replace("|lheading","").replace("table",R.gfm.table).replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",R._tag).getRegex();R.pedantic={...R.normal,html:W(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment",R._comment).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:$u,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:W(R.normal._paragraph).replace("hr",R.hr).replace("heading",` *#{1,6} *[^
]`).replace("lheading",R.lheading).replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").getRegex()};const D={escape:/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,autolink:/^<(scheme:[^\s\x00-\x1f<>]*|email)>/,url:$u,tag:"^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>",link:/^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/,reflink:/^!?\[(label)\]\[(ref)\]/,nolink:/^!?\[(ref)\](?:\[\])?/,reflinkSearch:"reflink|nolink(?!\\()",emStrong:{lDelim:/^(?:\*+(?:([punct_])|[^\s*]))|^_+(?:([punct*])|([^\s_]))/,rDelimAst:/^(?:[^_*\\]|\\.)*?\_\_(?:[^_*\\]|\\.)*?\*(?:[^_*\\]|\\.)*?(?=\_\_)|(?:[^*\\]|\\.)+(?=[^*])|[punct_](\*+)(?=[\s]|$)|(?:[^punct*_\s\\]|\\.)(\*+)(?=[punct_\s]|$)|[punct_\s](\*+)(?=[^punct*_\s])|[\s](\*+)(?=[punct_])|[punct_](\*+)(?=[punct_])|(?:[^punct*_\s\\]|\\.)(\*+)(?=[^punct*_\s])/,rDelimUnd:/^(?:[^_*\\]|\\.)*?\*\*(?:[^_*\\]|\\.)*?\_(?:[^_*\\]|\\.)*?(?=\*\*)|(?:[^_\\]|\\.)+(?=[^_])|[punct*](\_+)(?=[\s]|$)|(?:[^punct*_\s\\]|\\.)(\_+)(?=[punct*\s]|$)|[punct*\s](\_+)(?=[^punct*_\s])|[\s](\_+)(?=[punct*])|[punct*](\_+)(?=[punct*])/},code:/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,br:/^( {2,}|\\)\n(?!\s*$)/,del:$u,text:/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,punctuation:/^([\spunctuation])/};D._punctuation="!\"#$%&'()+\\-.,/:;<=>?@\\[\\]`^{|}~";D.punctuation=W(D.punctuation).replace(/punctuation/g,D._punctuation).getRegex();D.blockSkip=/\[[^\]]*?\]\([^\)]*?\)|`[^`]*?`|<[^>]*?>/g;D.escapedEmSt=/(?:^|[^\\])(?:\\\\)*\\[*_]/g;D._comment=W(R._comment).replace("(?:-->|$)","-->").getRegex();D.emStrong.lDelim=W(D.emStrong.lDelim).replace(/punct/g,D._punctuation).getRegex();D.emStrong.rDelimAst=W(D.emStrong.rDelimAst,"g").replace(/punct/g,D._punctuation).getRegex();D.emStrong.rDelimUnd=W(D.emStrong.rDelimUnd,"g").replace(/punct/g,D._punctuation).getRegex();D._escapes=/\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/g;D._scheme=/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/;D._email=/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/;D.autolink=W(D.autolink).replace("scheme",D._scheme).replace("email",D._email).getRegex();D._attribute=/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/;D.tag=W(D.tag).replace("comment",D._comment).replace("attribute",D._attribute).getRegex();D._label=/(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/;D._href=/<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/;D._title=/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/;D.link=W(D.link).replace("label",D._label).replace("href",D._href).replace("title",D._title).getRegex();D.reflink=W(D.reflink).replace("label",D._label).replace("ref",R._label).getRegex();D.nolink=W(D.nolink).replace("ref",R._label).getRegex();D.reflinkSearch=W(D.reflinkSearch,"g").replace("reflink",D.reflink).replace("nolink",D.nolink).getRegex();D.normal={...D};D.pedantic={...D.normal,strong:{start:/^__|\*\*/,middle:/^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,endAst:/\*\*(?!\*)/g,endUnd:/__(?!_)/g},em:{start:/^_|\*/,middle:/^()\*(?=\S)([\s\S]*?\S)\*(?!\*)|^_(?=\S)([\s\S]*?\S)_(?!_)/,endAst:/\*(?!\*)/g,endUnd:/_(?!_)/g},link:W(/^!?\[(label)\]\((.*?)\)/).replace("label",D._label).getRegex(),reflink:W(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",D._label).getRegex()};D.gfm={...D.normal,escape:W(D.escape).replace("])","~|])").getRegex(),_extended_email:/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/,url:/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])([\s\S]*?[^\s~])\1(?=[^~]|$)/,text:/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/};D.gfm.url=W(D.gfm.url,"i").replace("email",D.gfm._extended_email).getRegex();D.breaks={...D.gfm,br:W(D.br).replace("{2,}","*").getRegex(),text:W(D.gfm.text).replace("\\b_","\\b_| {2,}\\n").replace(/\{2,\}/g,"*").getRegex()};function Rm(e){return e.replace(/---/g,"\u2014").replace(/--/g,"\u2013").replace(/(^|[-\u2014/(\[{"\s])'/g,"$1\u2018").replace(/'/g,"\u2019").replace(/(^|[-\u2014/(\[{\u2018\s])"/g,"$1\u201C").replace(/"/g,"\u201D").replace(/\.{3}/g,"\u2026")}function gs(e){let n="",t,r;const u=e.length;for(t=0;t<u;t++)r=e.charCodeAt(t),Math.random()>.5&&(r="x"+r.toString(16)),n+="&#"+r+";";return n}class Ln{constructor(n){this.tokens=[],this.tokens.links=Object.create(null),this.options=n||ut,this.options.tokenizer=this.options.tokenizer||new Uo,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};const t={block:R.normal,inline:D.normal};this.options.pedantic?(t.block=R.pedantic,t.inline=D.pedantic):this.options.gfm&&(t.block=R.gfm,this.options.breaks?t.inline=D.breaks:t.inline=D.gfm),this.tokenizer.rules=t}static get rules(){return{block:R,inline:D}}static lex(n,t){return new Ln(t).lex(n)}static lexInline(n,t){return new Ln(t).inlineTokens(n)}lex(n){n=n.replace(/\r\n|\r/g,`
`),this.blockTokens(n,this.tokens);let t;for(;t=this.inlineQueue.shift();)this.inlineTokens(t.src,t.tokens);return this.tokens}blockTokens(n,t=[]){this.options.pedantic?n=n.replace(/\t/g,"    ").replace(/^ +$/gm,""):n=n.replace(/^( *)(\t+)/gm,(o,s,c)=>s+"    ".repeat(c.length));let r,u,l,i;for(;n;)if(!(this.options.extensions&&this.options.extensions.block&&this.options.extensions.block.some(o=>(r=o.call({lexer:this},n,t))?(n=n.substring(r.raw.length),t.push(r),!0):!1))){if(r=this.tokenizer.space(n)){n=n.substring(r.raw.length),r.raw.length===1&&t.length>0?t[t.length-1].raw+=`
`:t.push(r);continue}if(r=this.tokenizer.code(n)){n=n.substring(r.raw.length),u=t[t.length-1],u&&(u.type==="paragraph"||u.type==="text")?(u.raw+=`
`+r.raw,u.text+=`
`+r.text,this.inlineQueue[this.inlineQueue.length-1].src=u.text):t.push(r);continue}if(r=this.tokenizer.fences(n)){n=n.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.heading(n)){n=n.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.hr(n)){n=n.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.blockquote(n)){n=n.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.list(n)){n=n.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.html(n)){n=n.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.def(n)){n=n.substring(r.raw.length),u=t[t.length-1],u&&(u.type==="paragraph"||u.type==="text")?(u.raw+=`
`+r.raw,u.text+=`
`+r.raw,this.inlineQueue[this.inlineQueue.length-1].src=u.text):this.tokens.links[r.tag]||(this.tokens.links[r.tag]={href:r.href,title:r.title});continue}if(r=this.tokenizer.table(n)){n=n.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.lheading(n)){n=n.substring(r.raw.length),t.push(r);continue}if(l=n,this.options.extensions&&this.options.extensions.startBlock){let o=1/0;const s=n.slice(1);let c;this.options.extensions.startBlock.forEach(function(h){c=h.call({lexer:this},s),typeof c=="number"&&c>=0&&(o=Math.min(o,c))}),o<1/0&&o>=0&&(l=n.substring(0,o+1))}if(this.state.top&&(r=this.tokenizer.paragraph(l))){u=t[t.length-1],i&&u.type==="paragraph"?(u.raw+=`
`+r.raw,u.text+=`
`+r.text,this.inlineQueue.pop(),this.inlineQueue[this.inlineQueue.length-1].src=u.text):t.push(r),i=l.length!==n.length,n=n.substring(r.raw.length);continue}if(r=this.tokenizer.text(n)){n=n.substring(r.raw.length),u=t[t.length-1],u&&u.type==="text"?(u.raw+=`
`+r.raw,u.text+=`
`+r.text,this.inlineQueue.pop(),this.inlineQueue[this.inlineQueue.length-1].src=u.text):t.push(r);continue}if(n){const o="Infinite loop on byte: "+n.charCodeAt(0);if(this.options.silent){console.error(o);break}else throw new Error(o)}}return this.state.top=!0,t}inline(n,t=[]){return this.inlineQueue.push({src:n,tokens:t}),t}inlineTokens(n,t=[]){let r,u,l,i=n,o,s,c;if(this.tokens.links){const h=Object.keys(this.tokens.links);if(h.length>0)for(;(o=this.tokenizer.rules.inline.reflinkSearch.exec(i))!=null;)h.includes(o[0].slice(o[0].lastIndexOf("[")+1,-1))&&(i=i.slice(0,o.index)+"["+hs("a",o[0].length-2)+"]"+i.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex))}for(;(o=this.tokenizer.rules.inline.blockSkip.exec(i))!=null;)i=i.slice(0,o.index)+"["+hs("a",o[0].length-2)+"]"+i.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);for(;(o=this.tokenizer.rules.inline.escapedEmSt.exec(i))!=null;)i=i.slice(0,o.index+o[0].length-2)+"++"+i.slice(this.tokenizer.rules.inline.escapedEmSt.lastIndex),this.tokenizer.rules.inline.escapedEmSt.lastIndex--;for(;n;)if(s||(c=""),s=!1,!(this.options.extensions&&this.options.extensions.inline&&this.options.extensions.inline.some(h=>(r=h.call({lexer:this},n,t))?(n=n.substring(r.raw.length),t.push(r),!0):!1))){if(r=this.tokenizer.escape(n)){n=n.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.tag(n)){n=n.substring(r.raw.length),u=t[t.length-1],u&&r.type==="text"&&u.type==="text"?(u.raw+=r.raw,u.text+=r.text):t.push(r);continue}if(r=this.tokenizer.link(n)){n=n.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.reflink(n,this.tokens.links)){n=n.substring(r.raw.length),u=t[t.length-1],u&&r.type==="text"&&u.type==="text"?(u.raw+=r.raw,u.text+=r.text):t.push(r);continue}if(r=this.tokenizer.emStrong(n,i,c)){n=n.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.codespan(n)){n=n.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.br(n)){n=n.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.del(n)){n=n.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.autolink(n,gs)){n=n.substring(r.raw.length),t.push(r);continue}if(!this.state.inLink&&(r=this.tokenizer.url(n,gs))){n=n.substring(r.raw.length),t.push(r);continue}if(l=n,this.options.extensions&&this.options.extensions.startInline){let h=1/0;const m=n.slice(1);let p;this.options.extensions.startInline.forEach(function(v){p=v.call({lexer:this},m),typeof p=="number"&&p>=0&&(h=Math.min(h,p))}),h<1/0&&h>=0&&(l=n.substring(0,h+1))}if(r=this.tokenizer.inlineText(l,Rm)){n=n.substring(r.raw.length),r.raw.slice(-1)!=="_"&&(c=r.raw.slice(-1)),s=!0,u=t[t.length-1],u&&u.type==="text"?(u.raw+=r.raw,u.text+=r.text):t.push(r);continue}if(n){const h="Infinite loop on byte: "+n.charCodeAt(0);if(this.options.silent){console.error(h);break}else throw new Error(h)}}return t}}class Wo{constructor(n){this.options=n||ut}code(n,t,r){const u=(t||"").match(/\S*/)[0];if(this.options.highlight){const l=this.options.highlight(n,u);l!=null&&l!==n&&(r=!0,n=l)}return n=n.replace(/\n$/,"")+`
`,u?'<pre><code class="'+this.options.langPrefix+pe(u)+'">'+(r?n:pe(n,!0))+`</code></pre>
`:"<pre><code>"+(r?n:pe(n,!0))+`</code></pre>
`}blockquote(n){return`<blockquote>
${n}</blockquote>
`}html(n){return n}heading(n,t,r,u){if(this.options.headerIds){const l=this.options.headerPrefix+u.slug(r);return`<h${t} id="${l}">${n}</h${t}>
`}return`<h${t}>${n}</h${t}>
`}hr(){return this.options.xhtml?`<hr/>
`:`<hr>
`}list(n,t,r){const u=t?"ol":"ul",l=t&&r!==1?' start="'+r+'"':"";return"<"+u+l+`>
`+n+"</"+u+`>
`}listitem(n){return`<li>${n}</li>
`}checkbox(n){return"<input "+(n?'checked="" ':"")+'disabled="" type="checkbox"'+(this.options.xhtml?" /":"")+"> "}paragraph(n){return`<p>${n}</p>
`}table(n,t){return t&&(t=`<tbody>${t}</tbody>`),`<table>
<thead>
`+n+`</thead>
`+t+`</table>
`}tablerow(n){return`<tr>
${n}</tr>
`}tablecell(n,t){const r=t.header?"th":"td";return(t.align?`<${r} align="${t.align}">`:`<${r}>`)+n+`</${r}>
`}strong(n){return`<strong>${n}</strong>`}em(n){return`<em>${n}</em>`}codespan(n){return`<code>${n}</code>`}br(){return this.options.xhtml?"<br/>":"<br>"}del(n){return`<del>${n}</del>`}link(n,t,r){if(n=fs(this.options.sanitize,this.options.baseUrl,n),n===null)return r;let u='<a href="'+n+'"';return t&&(u+=' title="'+t+'"'),u+=">"+r+"</a>",u}image(n,t,r){if(n=fs(this.options.sanitize,this.options.baseUrl,n),n===null)return r;let u=`<img src="${n}" alt="${r}"`;return t&&(u+=` title="${t}"`),u+=this.options.xhtml?"/>":">",u}text(n){return n}}class qd{strong(n){return n}em(n){return n}codespan(n){return n}del(n){return n}html(n){return n}text(n){return n}link(n,t,r){return""+r}image(n,t,r){return""+r}br(){return""}}class Xd{constructor(){this.seen={}}serialize(n){return n.toLowerCase().trim().replace(/<[!\/a-z].*?>/ig,"").replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g,"").replace(/\s/g,"-")}getNextSafeSlug(n,t){let r=n,u=0;if(this.seen.hasOwnProperty(r)){u=this.seen[n];do u++,r=n+"-"+u;while(this.seen.hasOwnProperty(r))}return t||(this.seen[n]=u,this.seen[r]=0),r}slug(n,t={}){const r=this.serialize(n);return this.getNextSafeSlug(r,t.dryrun)}}class Rn{constructor(n){this.options=n||ut,this.options.renderer=this.options.renderer||new Wo,this.renderer=this.options.renderer,this.renderer.options=this.options,this.textRenderer=new qd,this.slugger=new Xd}static parse(n,t){return new Rn(t).parse(n)}static parseInline(n,t){return new Rn(t).parseInline(n)}parse(n,t=!0){let r="",u,l,i,o,s,c,h,m,p,v,w,F,I,f,d,g,E,C,A;const S=n.length;for(u=0;u<S;u++){if(v=n[u],this.options.extensions&&this.options.extensions.renderers&&this.options.extensions.renderers[v.type]&&(A=this.options.extensions.renderers[v.type].call({parser:this},v),A!==!1||!["space","hr","heading","code","table","blockquote","list","html","paragraph","text"].includes(v.type))){r+=A||"";continue}switch(v.type){case"space":continue;case"hr":{r+=this.renderer.hr();continue}case"heading":{r+=this.renderer.heading(this.parseInline(v.tokens),v.depth,Zd(this.parseInline(v.tokens,this.textRenderer)),this.slugger);continue}case"code":{r+=this.renderer.code(v.text,v.lang,v.escaped);continue}case"table":{for(m="",h="",o=v.header.length,l=0;l<o;l++)h+=this.renderer.tablecell(this.parseInline(v.header[l].tokens),{header:!0,align:v.align[l]});for(m+=this.renderer.tablerow(h),p="",o=v.rows.length,l=0;l<o;l++){for(c=v.rows[l],h="",s=c.length,i=0;i<s;i++)h+=this.renderer.tablecell(this.parseInline(c[i].tokens),{header:!1,align:v.align[i]});p+=this.renderer.tablerow(h)}r+=this.renderer.table(m,p);continue}case"blockquote":{p=this.parse(v.tokens),r+=this.renderer.blockquote(p);continue}case"list":{for(w=v.ordered,F=v.start,I=v.loose,o=v.items.length,p="",l=0;l<o;l++)d=v.items[l],g=d.checked,E=d.task,f="",d.task&&(C=this.renderer.checkbox(g),I?d.tokens.length>0&&d.tokens[0].type==="paragraph"?(d.tokens[0].text=C+" "+d.tokens[0].text,d.tokens[0].tokens&&d.tokens[0].tokens.length>0&&d.tokens[0].tokens[0].type==="text"&&(d.tokens[0].tokens[0].text=C+" "+d.tokens[0].tokens[0].text)):d.tokens.unshift({type:"text",text:C}):f+=C),f+=this.parse(d.tokens,I),p+=this.renderer.listitem(f,E,g);r+=this.renderer.list(p,w,F);continue}case"html":{r+=this.renderer.html(v.text);continue}case"paragraph":{r+=this.renderer.paragraph(this.parseInline(v.tokens));continue}case"text":{for(p=v.tokens?this.parseInline(v.tokens):v.text;u+1<S&&n[u+1].type==="text";)v=n[++u],p+=`
`+(v.tokens?this.parseInline(v.tokens):v.text);r+=t?this.renderer.paragraph(p):p;continue}default:{const x='Token with "'+v.type+'" type was not found.';if(this.options.silent){console.error(x);return}else throw new Error(x)}}}return r}parseInline(n,t){t=t||this.renderer;let r="",u,l,i;const o=n.length;for(u=0;u<o;u++){if(l=n[u],this.options.extensions&&this.options.extensions.renderers&&this.options.extensions.renderers[l.type]&&(i=this.options.extensions.renderers[l.type].call({parser:this},l),i!==!1||!["escape","html","link","image","strong","em","codespan","br","del","text"].includes(l.type))){r+=i||"";continue}switch(l.type){case"escape":{r+=t.text(l.text);break}case"html":{r+=t.html(l.text);break}case"link":{r+=t.link(l.href,l.title,this.parseInline(l.tokens,t));break}case"image":{r+=t.image(l.href,l.title,l.text);break}case"strong":{r+=t.strong(this.parseInline(l.tokens,t));break}case"em":{r+=t.em(this.parseInline(l.tokens,t));break}case"codespan":{r+=t.codespan(l.text);break}case"br":{r+=t.br();break}case"del":{r+=t.del(this.parseInline(l.tokens,t));break}case"text":{r+=t.text(l.text);break}default:{const s='Token with "'+l.type+'" type was not found.';if(this.options.silent){console.error(s);return}else throw new Error(s)}}}return r}}class ju{constructor(n){this.options=n||ut}preprocess(n){return n}postprocess(n){return n}}Vo(ju,"passThroughHooks",new Set(["preprocess","postprocess"]));function zm(e,n,t){return r=>{if(r.message+=`
Please report this to https://github.com/markedjs/marked.`,e){const u="<p>An error occurred:</p><pre>"+pe(r.message+"",!0)+"</pre>";if(n)return Promise.resolve(u);if(t){t(null,u);return}return u}if(n)return Promise.reject(r);if(t){t(r);return}throw r}}function e0(e,n){return(t,r,u)=>{typeof r=="function"&&(u=r,r=null);const l={...r};r={...L.defaults,...l};const i=zm(r.silent,r.async,u);if(typeof t=="undefined"||t===null)return i(new Error("marked(): input parameter is undefined or null"));if(typeof t!="string")return i(new Error("marked(): input parameter is of type "+Object.prototype.toString.call(t)+", string expected"));if(Im(r),r.hooks&&(r.hooks.options=r),u){const o=r.highlight;let s;try{r.hooks&&(t=r.hooks.preprocess(t)),s=e(t,r)}catch(m){return i(m)}const c=function(m){let p;if(!m)try{r.walkTokens&&L.walkTokens(s,r.walkTokens),p=n(s,r),r.hooks&&(p=r.hooks.postprocess(p))}catch(v){m=v}return r.highlight=o,m?i(m):u(null,p)};if(!o||o.length<3||(delete r.highlight,!s.length))return c();let h=0;L.walkTokens(s,function(m){m.type==="code"&&(h++,setTimeout(()=>{o(m.text,m.lang,function(p,v){if(p)return c(p);v!=null&&v!==m.text&&(m.text=v,m.escaped=!0),h--,h===0&&c()})},0))}),h===0&&c();return}if(r.async)return Promise.resolve(r.hooks?r.hooks.preprocess(t):t).then(o=>e(o,r)).then(o=>r.walkTokens?Promise.all(L.walkTokens(o,r.walkTokens)).then(()=>o):o).then(o=>n(o,r)).then(o=>r.hooks?r.hooks.postprocess(o):o).catch(i);try{r.hooks&&(t=r.hooks.preprocess(t));const o=e(t,r);r.walkTokens&&L.walkTokens(o,r.walkTokens);let s=n(o,r);return r.hooks&&(s=r.hooks.postprocess(s)),s}catch(o){return i(o)}}}function L(e,n,t){return e0(Ln.lex,Rn.parse)(e,n,t)}L.options=L.setOptions=function(e){return L.defaults={...L.defaults,...e},xm(L.defaults),L};L.getDefaults=Kd;L.defaults=ut;L.use=function(...e){const n=L.defaults.extensions||{renderers:{},childTokens:{}};e.forEach(t=>{const r={...t};if(r.async=L.defaults.async||r.async||!1,t.extensions&&(t.extensions.forEach(u=>{if(!u.name)throw new Error("extension name required");if(u.renderer){const l=n.renderers[u.name];l?n.renderers[u.name]=function(...i){let o=u.renderer.apply(this,i);return o===!1&&(o=l.apply(this,i)),o}:n.renderers[u.name]=u.renderer}if(u.tokenizer){if(!u.level||u.level!=="block"&&u.level!=="inline")throw new Error("extension level must be 'block' or 'inline'");n[u.level]?n[u.level].unshift(u.tokenizer):n[u.level]=[u.tokenizer],u.start&&(u.level==="block"?n.startBlock?n.startBlock.push(u.start):n.startBlock=[u.start]:u.level==="inline"&&(n.startInline?n.startInline.push(u.start):n.startInline=[u.start]))}u.childTokens&&(n.childTokens[u.name]=u.childTokens)}),r.extensions=n),t.renderer){const u=L.defaults.renderer||new Wo;for(const l in t.renderer){const i=u[l];u[l]=(...o)=>{let s=t.renderer[l].apply(u,o);return s===!1&&(s=i.apply(u,o)),s}}r.renderer=u}if(t.tokenizer){const u=L.defaults.tokenizer||new Uo;for(const l in t.tokenizer){const i=u[l];u[l]=(...o)=>{let s=t.tokenizer[l].apply(u,o);return s===!1&&(s=i.apply(u,o)),s}}r.tokenizer=u}if(t.hooks){const u=L.defaults.hooks||new ju;for(const l in t.hooks){const i=u[l];ju.passThroughHooks.has(l)?u[l]=o=>{if(L.defaults.async)return Promise.resolve(t.hooks[l].call(u,o)).then(c=>i.call(u,c));const s=t.hooks[l].call(u,o);return i.call(u,s)}:u[l]=(...o)=>{let s=t.hooks[l].apply(u,o);return s===!1&&(s=i.apply(u,o)),s}}r.hooks=u}if(t.walkTokens){const u=L.defaults.walkTokens;r.walkTokens=function(l){let i=[];return i.push(t.walkTokens.call(this,l)),u&&(i=i.concat(u.call(this,l))),i}}L.setOptions(r)})};L.walkTokens=function(e,n){let t=[];for(const r of e)switch(t=t.concat(n.call(L,r)),r.type){case"table":{for(const u of r.header)t=t.concat(L.walkTokens(u.tokens,n));for(const u of r.rows)for(const l of u)t=t.concat(L.walkTokens(l.tokens,n));break}case"list":{t=t.concat(L.walkTokens(r.items,n));break}default:L.defaults.extensions&&L.defaults.extensions.childTokens&&L.defaults.extensions.childTokens[r.type]?L.defaults.extensions.childTokens[r.type].forEach(function(u){t=t.concat(L.walkTokens(r[u],n))}):r.tokens&&(t=t.concat(L.walkTokens(r.tokens,n)))}return t};L.parseInline=e0(Ln.lexInline,Rn.parseInline);L.Parser=Rn;L.parser=Rn.parse;L.Renderer=Wo;L.TextRenderer=qd;L.Lexer=Ln;L.lexer=Ln.lex;L.Tokenizer=Uo;L.Slugger=Xd;L.Hooks=ju;L.parse=L;L.options;L.setOptions;L.use;L.walkTokens;L.parseInline;Rn.parse;Ln.lex;var bm=`# \u7530\u8A00\u8015\u667A\u7528\u6237\u4F7F\u7528\u624B\u518C

> \u6587\u6863\u7248\u672C\uFF1AV1.0  
> \u9002\u7528\u9879\u76EE\uFF1A\u7530\u8A00\u8015\u667A \xB7 AI \u539F\u751F\u667A\u6167\u519C\u4E1A\u4E0E\u6570\u5B57\u5B6A\u751F\u5E73\u53F0  
> \u9002\u7528\u89D2\u8272\uFF1A\u519C\u573A\u7BA1\u7406\u4EBA\u5458\u3001\u6E29\u5BA4\u79CD\u690D\u4EBA\u5458\u3001\u8BBE\u5907\u8FD0\u7EF4\u4EBA\u5458\u3001\u5C55\u793A\u8BB2\u89E3\u4EBA\u5458\u3001\u9879\u76EE\u9A8C\u6536\u4EBA\u5458  
> \u9ED8\u8BA4\u6F14\u793A\u5730\u5740\uFF1A\`http://localhost:8081/\`

---

## 1. \u624B\u518C\u76EE\u6807

\u672C\u624B\u518C\u7528\u4E8E\u5E2E\u52A9\u7B2C\u4E00\u6B21\u63A5\u89E6\u7CFB\u7EDF\u7684\u7528\u6237\uFF0C\u4ECE\u6253\u5F00\u5B98\u7F51\u5F00\u59CB\uFF0C\u9010\u6B65\u5B8C\u6210\u4EE5\u4E0B\u5B8C\u6574\u4F53\u9A8C\uFF1A

1. \u6D4F\u89C8\u5B98\u7F51\u5E76\u4E86\u89E3\u4EA7\u54C1\u80FD\u529B\uFF1B
2. \u6CE8\u518C\u8D26\u53F7\u5E76\u767B\u5F55\u5E73\u53F0\uFF1B
3. \u9009\u62E9\u662F\u5426\u7ED1\u5B9A\u4EBA\u8138\uFF1B
4. \u4F7F\u7528\u5BC6\u7801\u6216\u5B9E\u65F6\u6444\u50CF\u5934\u5237\u8138\u767B\u5F55\uFF1B
5. \u8FDB\u5165\u667A\u6167\u519C\u573A\u6570\u636E\u5DE5\u4F5C\u53F0\uFF1B
6. \u6D4F\u89C8\u822A\u62CD\u5B9E\u666F\u548C 3D \u6570\u5B57\u5B6A\u751F\uFF1B
7. \u67E5\u8BE2\u5730\u5757\u3001\u5927\u68DA\u3001\u8BBE\u5907\u3001\u704C\u6E89\u548C\u544A\u8B66\u4FE1\u606F\uFF1B
8. \u63A7\u5236\u8BBE\u5907\u3001\u6267\u884C\u81EA\u68C0\u3001\u8BBE\u7F6E\u704C\u6E89\u65F6\u957F\u5E76\u5904\u7406\u544A\u8B66\uFF1B
9. \u4F7F\u7528\u201C\u5C0F\u7530\u201D\u52A9\u624B\u548C\u72EC\u7ACB\u201C\u667A\u80FD\u95EE\u519C\u201D\u5DE5\u4F5C\u53F0\uFF1B
10. \u8FDB\u5165\u6BCF\u4E00\u5EA7\u5927\u68DA\uFF0C\u5207\u6362\u68DA\u5185\u5B9E\u666F\u4E0E\u6570\u5B57\u5B6A\u751F\uFF1B
11. \u67E5\u770B\u68DA\u5185\u73AF\u5883\u3001\u8BBE\u5907\u3001\u5206\u533A\u548C\u690D\u682A\u7EA7\u6570\u636E\uFF1B
12. \u5B8C\u6210\u4E00\u6B21\u9002\u5408\u9879\u76EE\u6F14\u793A\u6216\u9A8C\u6536\u7684\u5168\u6D41\u7A0B\u64CD\u4F5C\u3002

\u672C\u9879\u76EE\u5F53\u524D\u4F7F\u7528\u6F14\u793A\u6570\u636E\u3002\u73AF\u5883\u6307\u6807\u4F1A\u81EA\u52A8\u53D8\u5316\uFF0C\u8BBE\u5907\u5F00\u5173\u3001\u704C\u6E89\u548C\u544A\u8B66\u64CD\u4F5C\u4F1A\u4FDD\u5B58\u5230\u6570\u636E\u5E93\uFF0C\u56E0\u6B64\u5237\u65B0\u9875\u9762\u540E\u4ECD\u53EF\u770B\u5230\u64CD\u4F5C\u7ED3\u679C\u3002

---

## 2. \u4F7F\u7528\u524D\u51C6\u5907

### 2.1 \u63A8\u8350\u8BBE\u5907

| \u9879\u76EE | \u63A8\u8350\u914D\u7F6E |
|---|---|
| \u6D4F\u89C8\u5668 | \u6700\u65B0\u7248 Chrome\u3001Edge \u6216 Firefox |
| \u5C4F\u5E55 | 1920\xD71080\uFF1B\u6700\u4F4E\u5EFA\u8BAE 1366\xD7768 |
| \u7F51\u7EDC | \u672C\u673A\u8BBF\u95EE\u4E0D\u9700\u8981\u4E92\u8054\u7F51\uFF1BAI \u95EE\u519C\u3001\u4EBA\u8138\u670D\u52A1\u9700\u8981\u8054\u7F51 |
| \u6444\u50CF\u5934 | \u4F7F\u7528\u5237\u8138\u767B\u5F55\u65F6\u5FC5\u987B\u5177\u5907\u53EF\u7528\u6444\u50CF\u5934 |
| \u663E\u5361 | \u822A\u62CD\u6A21\u5F0F\u65E0\u7279\u6B8A\u8981\u6C42\uFF1B3D \u6A21\u5F0F\u5EFA\u8BAE\u4F7F\u7528\u652F\u6301 WebGL 2 \u7684\u72EC\u7ACB\u663E\u5361 |

### 2.2 \u6D4F\u89C8\u5668\u6743\u9650

\u9996\u6B21\u4F7F\u7528\u65F6\uFF0C\u6D4F\u89C8\u5668\u53EF\u80FD\u8BE2\u95EE\u4EE5\u4E0B\u6743\u9650\uFF1A

- **\u6444\u50CF\u5934\u6743\u9650**\uFF1A\u5237\u8138\u767B\u5F55\u9700\u8981\uFF1B\u62D2\u7EDD\u540E\u65E0\u6CD5\u5237\u8138\u767B\u5F55\uFF1B
- **\u9EA6\u514B\u98CE\u6743\u9650**\uFF1A\u667A\u80FD\u95EE\u519C\u8BED\u97F3\u8F93\u5165\u9700\u8981\uFF1B
- **\u5168\u5C4F\u6743\u9650**\uFF1A\u70B9\u51FB\u6570\u636E\u53F0\u5168\u5C4F\u6309\u94AE\u540E\u4F7F\u7528\uFF1B
- **\u81EA\u52A8\u64AD\u653E\u6743\u9650**\uFF1A\u53EF\u80FD\u5F71\u54CD\u5927\u68DA\u5B9E\u666F\u89C6\u9891\u81EA\u52A8\u64AD\u653E\u3002

### 2.3 \u786E\u8BA4\u7CFB\u7EDF\u5DF2\u7ECF\u542F\u52A8

\u5728\u6D4F\u89C8\u5668\u8BBF\u95EE\uFF1A

\`\`\`text
http://localhost:8081/
\`\`\`

\u5982\u679C\u65E0\u6CD5\u6253\u5F00\uFF0C\u8BF7\u8BA9\u7CFB\u7EDF\u7BA1\u7406\u5458\u786E\u8BA4\uFF1A

1. MySQL \u5BB9\u5668\u6B63\u5728\u8FD0\u884C\uFF1B
2. Spring Boot \u5DF2\u76D1\u542C \`8081\`\uFF1B
3. \u6CA1\u6709\u7B2C\u4E8C\u4E2A\u7A0B\u5E8F\u5360\u7528 \`8081\`\uFF1B
4. \u5B98\u7F51\u548C\u5E73\u53F0\u524D\u7AEF\u5DF2\u7ECF\u6784\u5EFA\u3002

---

## 3. \u5B98\u7F51\u6D4F\u89C8

\u5B98\u7F51\u7528\u4E8E\u4EA7\u54C1\u4ECB\u7ECD\u548C\u5E73\u53F0\u5165\u53E3\uFF0C\u4E0D\u767B\u5F55\u4E5F\u53EF\u4EE5\u8BBF\u95EE\u3002

![\u5B98\u7F51\u9996\u9875\u5168\u666F](./\u622A\u56FE/\u5B98\u7F51.png)

> **\u56FE 3-1\u3000\u5B98\u7F51\u9996\u9875\u3002** \u9876\u90E8\u662F\u4EA7\u54C1\u5BFC\u822A\u548C\u767B\u5F55\u5165\u53E3\uFF1B\u9875\u9762\u4E2D\u592E\u7684\u201C\u8FDB\u5165\u5E73\u53F0\u201D\u7528\u4E8E\u5F00\u59CB\u5B8C\u6574\u4F53\u9A8C\uFF0C\u201C\u4F53\u9A8C\u667A\u80FD\u95EE\u519C\u201D\u7528\u4E8E\u76F4\u63A5\u4E86\u89E3 AI \u52A9\u624B\u80FD\u529B\u3002

### 3.1 \u9876\u90E8\u5BFC\u822A

\u5B98\u7F51\u9876\u90E8\u5305\u62EC\uFF1A

- **\u7530\u8A00\u8015\u667A**\uFF1A\u8FD4\u56DE\u9996\u9875\uFF1B
- **\u4EA7\u54C1**\uFF1A\u67E5\u770B\u5E73\u53F0\u6838\u5FC3\u80FD\u529B\uFF1B
- **\u89E3\u51B3\u65B9\u6848**\uFF1A\u67E5\u770B\u4E0D\u540C\u519C\u4E1A\u573A\u666F\u65B9\u6848\uFF1B
- **\u6570\u5B57\u5B6A\u751F**\uFF1A\u4E86\u89E3\u5B9E\u666F\u4E0E 3D \u519C\u573A\uFF1B
- **\u5173\u4E8E\u6211\u4EEC**\uFF1A\u67E5\u770B\u54C1\u724C\u5B9A\u4F4D\uFF1B
- **\u8054\u7CFB\u6211\u4EEC**\uFF1A\u63D0\u4EA4\u5408\u4F5C\u6216\u54A8\u8BE2\u7559\u8A00\uFF1B
- **\u767B\u5F55**\uFF1A\u8FDB\u5165\u8D26\u53F7\u767B\u5F55\u9875\uFF1B
- **\u8FDB\u5165\u5E73\u53F0**\uFF1A\u5DF2\u6709\u767B\u5F55\u72B6\u6001\u65F6\u76F4\u63A5\u8FDB\u5165\u6570\u636E\u5DE5\u4F5C\u53F0\uFF0C\u5426\u5219\u8F6C\u5230\u767B\u5F55\u9875\u3002

### 3.2 \u8054\u7CFB\u6211\u4EEC

1. \u70B9\u51FB\u9876\u90E8\u201C\u8054\u7CFB\u6211\u4EEC\u201D\uFF1B
2. \u586B\u5199\u79F0\u547C\uFF1B
3. \u586B\u5199\u81EA\u5DF1\u7684\u90AE\u7BB1\uFF1B
4. \u586B\u5199\u4E3B\u9898\uFF1B
5. \u586B\u5199\u7559\u8A00\u5185\u5BB9\uFF1B
6. \u70B9\u51FB\u201C\u53D1\u9001\u7559\u8A00\u201D\uFF1B
7. \u9875\u9762\u663E\u793A\u201C\u7559\u8A00\u5DF2\u53D1\u9001\u201D\u540E\u5B8C\u6210\u3002

\u7559\u8A00\u5C06\u901A\u8FC7 FormSubmit \u53D1\u9001\u81F3\uFF1A

\`\`\`text
1478838114@qq.com
\`\`\`

> \u9996\u6B21\u542F\u7528\u8BE5\u90AE\u7BB1\u65F6\uFF0CFormSubmit \u53EF\u80FD\u5411\u6536\u4EF6\u7BB1\u53D1\u9001\u786E\u8BA4\u90AE\u4EF6\u3002\u90AE\u7BB1\u6240\u6709\u8005\u5FC5\u987B\u5148\u70B9\u51FB\u6FC0\u6D3B\u94FE\u63A5\uFF0C\u5426\u5219\u8868\u5355\u53EF\u80FD\u663E\u793A\u5931\u8D25\u6216\u65E0\u6CD5\u9001\u8FBE\u3002

---

## 4. \u6CE8\u518C\u8D26\u53F7

### 4.1 \u6253\u5F00\u6CE8\u518C\u9875

\u6709\u4E24\u79CD\u8FDB\u5165\u65B9\u5F0F\uFF1A

1. \u5728\u767B\u5F55\u9875\u70B9\u51FB\u201C\u8FD8\u6CA1\u6709\u8D26\u53F7\uFF1F\u7ACB\u5373\u6CE8\u518C\u201D\uFF1B
2. \u76F4\u63A5\u8BBF\u95EE \`http://localhost:8081/#/sign-up\`\u3002

### 4.2 \u586B\u5199\u8D26\u53F7\u4FE1\u606F

\u4F9D\u6B21\u586B\u5199\uFF1A

1. **Full Name**\uFF1A\u59D3\u540D\u6216\u5E73\u53F0\u663E\u793A\u540D\u79F0\uFF1B
2. **Email Address**\uFF1A\u767B\u5F55\u90AE\u7BB1\uFF0C\u4E0D\u80FD\u548C\u5DF2\u6709\u8D26\u53F7\u91CD\u590D\uFF1B
3. **Password**\uFF1A\u81F3\u5C11 6 \u4E2A\u5B57\u7B26\uFF1B
4. **Confirm Password**\uFF1A\u518D\u6B21\u8F93\u5165\u5B8C\u5168\u76F8\u540C\u7684\u5BC6\u7801\uFF1B
5. \u70B9\u51FB **Create Account**\u3002

\u6CE8\u518C\u6210\u529F\u540E\uFF0C\u7CFB\u7EDF\u4F1A\u81EA\u52A8\u4FDD\u5B58\u767B\u5F55\u4EE4\u724C\uFF0C\u5E76\u8FDB\u5165\u4EBA\u8138\u7ED1\u5B9A\u6B65\u9AA4\u3002

### 4.3 \u7ED1\u5B9A\u4EBA\u8138\uFF08\u53EF\u9009\uFF09

1. \u6D4F\u89C8\u5668\u5F39\u51FA\u6444\u50CF\u5934\u6743\u9650\u65F6\u70B9\u51FB\u201C\u5141\u8BB8\u201D\uFF1B
2. \u4FDD\u6301\u6B63\u8138\u4F4D\u4E8E\u53D6\u666F\u6846\u4E2D\u592E\uFF1B
3. \u907F\u514D\u80CC\u5149\u3001\u906E\u6321\u548C\u591A\u4EBA\u540C\u65F6\u5165\u955C\uFF1B
4. \u70B9\u51FB\u201C\u62CD\u7167\u201D\uFF1B
5. \u68C0\u67E5\u7167\u7247\u662F\u5426\u6E05\u6670\uFF1B
6. \u4E0D\u6EE1\u610F\u65F6\u70B9\u51FB\u201C\u91CD\u62CD\u201D\uFF1B
7. \u6EE1\u610F\u540E\u70B9\u51FB\u201C\u7ED1\u5B9A\u5E76\u8FDB\u5165\u201D\u3002

\u6CE8\u518C\u7ED1\u5B9A\u573A\u666F\u5141\u8BB8\u4E0A\u4F20\u4E00\u5F20\u6E05\u6670\u6B63\u8138\u7167\u3002\u5982\u679C\u6682\u65F6\u4E0D\u7ED1\u5B9A\uFF0C\u53EF\u4EE5\u70B9\u51FB\u201C\u8DF3\u8FC7\uFF0C\u7A0D\u540E\u5728\u5E73\u53F0\u8BBE\u7F6E\u4E2D\u7ED1\u5B9A\u201D\u3002

---

## 5. \u767B\u5F55\u5E73\u53F0

![\u767B\u5F55\u9875\u9762](./\u622A\u56FE/\u767B\u9646.png)

> **\u56FE 5-1\u3000\u767B\u5F55\u9875\u9762\u3002** \u5DE6\u4FA7\u4E0A\u65B9\u53EF\u5207\u6362\u201C\u5BC6\u7801\u767B\u5F55/\u5237\u8138\u767B\u5F55\u201D\uFF1B\u8868\u5355\u4E0B\u65B9\u662F\u6CE8\u518C\u5165\u53E3\uFF1B\u201C\u8FD4\u56DE\u5B98\u7F51\u201D\u7528\u4E8E\u9000\u51FA\u767B\u5F55\u6D41\u7A0B\u3002

### 5.1 \u5BC6\u7801\u767B\u5F55

1. \u6253\u5F00 \`http://localhost:8081/#/sign-in\`\uFF1B
2. \u4FDD\u6301\u9876\u90E8\u9009\u62E9\u201C\u5BC6\u7801\u767B\u5F55\u201D\uFF1B
3. \u8F93\u5165\u6CE8\u518C\u90AE\u7BB1\uFF1B
4. \u8F93\u5165\u5BC6\u7801\uFF1B
5. \u5982\u9700\u5173\u95ED\u6D4F\u89C8\u5668\u540E\u7EE7\u7EED\u4FDD\u6301\u767B\u5F55\uFF0C\u52FE\u9009 **Keep me signed in**\uFF1B
6. \u70B9\u51FB **Sign In**\uFF1B
7. \u767B\u5F55\u6210\u529F\u540E\u81EA\u52A8\u8FDB\u5165\u667A\u6167\u519C\u573A\u6570\u636E\u5DE5\u4F5C\u53F0\u3002

\u201CKeep me signed in\u201D\u7684\u533A\u522B\uFF1A

- \u52FE\u9009\uFF1A\u767B\u5F55\u4FE1\u606F\u4FDD\u5B58\u5230\u6D4F\u89C8\u5668\u672C\u5730\u5B58\u50A8\uFF1B
- \u4E0D\u52FE\u9009\uFF1A\u5173\u95ED\u6D4F\u89C8\u5668\u4F1A\u8BDD\u540E\u9700\u8981\u91CD\u65B0\u767B\u5F55\u3002

### 5.2 \u5237\u8138\u767B\u5F55

\u5237\u8138\u767B\u5F55\u53EA\u5141\u8BB8\u4F7F\u7528\u5B9E\u65F6\u6444\u50CF\u5934\uFF0C\u4E0D\u5141\u8BB8\u4E0A\u4F20\u5DF2\u6709\u56FE\u7247\u3002

1. \u5728\u767B\u5F55\u9875\u9009\u62E9\u201C\u5237\u8138\u767B\u5F55\u201D\uFF1B
2. \u6D4F\u89C8\u5668\u8BE2\u95EE\u6444\u50CF\u5934\u6743\u9650\u65F6\u70B9\u51FB\u201C\u5141\u8BB8\u201D\uFF1B
3. \u5C06\u6B63\u8138\u653E\u5728\u753B\u9762\u4E2D\u592E\uFF1B
4. \u4FDD\u6301\u5149\u7EBF\u5747\u5300\uFF0C\u6458\u4E0B\u53E3\u7F69\u3001\u58A8\u955C\u7B49\u906E\u6321\u7269\uFF1B
5. \u70B9\u51FB\u201C\u62CD\u7167\u201D\uFF1B
6. \u67E5\u770B\u9884\u89C8\uFF0C\u4E0D\u6E05\u6670\u65F6\u70B9\u51FB\u201C\u91CD\u62CD\u201D\uFF1B
7. \u70B9\u51FB\u201C\u767B\u5F55\u201D\uFF1B
8. \u5339\u914D\u901A\u8FC7\u540E\u8FDB\u5165\u6570\u636E\u5DE5\u4F5C\u53F0\u3002

\u5982\u679C\u6444\u50CF\u5934\u65E0\u6CD5\u6253\u5F00\uFF1A

1. \u70B9\u51FB\u5730\u5740\u680F\u5DE6\u4FA7\u7684\u7F51\u7AD9\u6743\u9650\u56FE\u6807\uFF1B
2. \u5C06\u201C\u6444\u50CF\u5934\u201D\u6539\u4E3A\u201C\u5141\u8BB8\u201D\uFF1B
3. \u5237\u65B0\u9875\u9762\uFF1B
4. \u91CD\u65B0\u8FDB\u5165\u5237\u8138\u767B\u5F55\u3002

### 5.3 \u767B\u5F55\u5931\u8D25\u5904\u7406

| \u63D0\u793A | \u5904\u7406\u65B9\u6CD5 |
|---|---|
| \u90AE\u7BB1\u6216\u5BC6\u7801\u9519\u8BEF | \u68C0\u67E5\u90AE\u7BB1\u62FC\u5199\u3001\u5927\u5C0F\u5199\u548C\u5BC6\u7801 |
| \u8BE5\u90AE\u7BB1\u5DF2\u88AB\u6CE8\u518C | \u8FD4\u56DE\u767B\u5F55\u9875\u76F4\u63A5\u767B\u5F55 |
| \u65E0\u6CD5\u6253\u5F00\u6444\u50CF\u5934 | \u5F00\u542F\u6D4F\u89C8\u5668\u6743\u9650\uFF0C\u786E\u8BA4\u6444\u50CF\u5934\u672A\u88AB\u5176\u4ED6\u8F6F\u4EF6\u5360\u7528 |
| \u4EBA\u8138\u672A\u5339\u914D | \u4F7F\u7528\u7ED1\u5B9A\u8FC7\u4EBA\u8138\u7684\u8D26\u53F7\uFF0C\u6539\u5584\u5149\u7167\u540E\u91CD\u62CD |
| \u8BF7\u6C42\u5931\u8D25\uFF08401\uFF09 | \u767B\u5F55\u5DF2\u8FC7\u671F\uFF0C\u91CD\u65B0\u767B\u5F55 |

---

## 6. \u6570\u636E\u5DE5\u4F5C\u53F0\u603B\u89C8

![\u822A\u62CD\u5B9E\u666F\u6570\u636E\u5DE5\u4F5C\u53F0](./\u622A\u56FE/\u4E3B\u754C\u9762.png)

> **\u56FE 6-1\u3000\u822A\u62CD\u5B9E\u666F\u6570\u636E\u5DE5\u4F5C\u53F0\u3002** \u9876\u90E8\u4E3A\u5168\u5C40\u64CD\u4F5C\u680F\uFF0C\u5DE6\u4E0A\u89D2\u5207\u6362\u5B9E\u666F\u548C 3D\uFF0C\u4E2D\u592E\u6807\u7B7E\u5BF9\u5E94\u519C\u573A\u5BF9\u8C61\uFF0C\u53F3\u4FA7\u4E3A\u5F53\u524D\u5BF9\u8C61\u8BE6\u60C5\uFF0C\u5E95\u90E8 Dock \u5BF9\u5E94\u4E03\u4E2A\u4E1A\u52A1\u4E2D\u5FC3\u3002

\u8FDB\u5165\u5E73\u53F0\u540E\u9ED8\u8BA4\u5230\u8FBE\uFF1A

\`\`\`text
/platform/workspaces/farm-01
\`\`\`

\u8BF7\u6309\u4EE5\u4E0B\u7F16\u53F7\u8BA4\u8BC6\u754C\u9762\uFF1A

1. **\u9876\u90E8\u5168\u5C40\u680F**\uFF1A\u54C1\u724C\u3001\u6A21\u5F0F\u5207\u6362\u3001\u519C\u573A\u3001\u641C\u7D22\u3001\u901A\u77E5\u3001\u7528\u6237\u83DC\u5355\u548C\u5168\u5C4F\uFF1B
2. **\u5DE6\u4E0A\u5929\u6C14\u5361**\uFF1A\u5F53\u524D\u6E29\u5EA6\u3001\u6E7F\u5EA6\u3001\u98CE\u901F\u3001\u5149\u7167\uFF1B
3. **\u4E2D\u592E\u519C\u573A\u573A\u666F**\uFF1A\u822A\u62CD\u5B9E\u666F\u6216 3D \u6570\u5B57\u5B6A\u751F\uFF1B
4. **\u573A\u666F\u5BF9\u8C61**\uFF1A\u5927\u68DA\u3001\u5730\u5757\u3001\u6444\u50CF\u5934\u3001\u8BBE\u5907\u3001\u6C34\u6C60\u3001\u6C14\u8C61\u7AD9\u548C\u673A\u5668\u4EBA\uFF1B
5. **\u89C6\u56FE\u5207\u6362**\uFF1A\u5B9E\u666F\u4E0E 3D\uFF1B
6. **\u573A\u666F\u5DE5\u5177**\uFF1A\u7F29\u653E\u3001\u590D\u4F4D\u3001\u56FE\u5C42\u3001\u6D4B\u8DDD\uFF1B
7. **\u5E95\u90E8\u4E1A\u52A1 Dock**\uFF1A\u603B\u89C8\u3001\u76D1\u63A7\u3001\u73AF\u5883\u3001\u8BBE\u5907\u3001\u704C\u6E89\u3001\u4F5C\u7269\u3001\u544A\u8B66\uFF1B
8. **\u53F3\u4FA7\u4E0A\u4E0B\u6587\u62BD\u5C49**\uFF1A\u663E\u793A\u5F53\u524D\u5BF9\u8C61\u6570\u636E\u4E0E\u64CD\u4F5C\uFF1B
9. **\u5C0F\u7530\u52A9\u624B**\uFF1A\u5728\u5F53\u524D\u519C\u573A\u4E0A\u4E0B\u6587\u4E2D\u63D0\u95EE\u3002

### 6.1 \u641C\u7D22\u5BF9\u8C61

1. \u70B9\u51FB\u9876\u90E8\u641C\u7D22\u6846\uFF1B
2. \u8F93\u5165\u5BF9\u8C61\u540D\u79F0\uFF0C\u5982\u201C2\u53F7\u6E29\u5BA4\u201D\u201C\u6C34\u80A5\u4E00\u4F53\u673A\u201D\u201C\u84C4\u6C34\u6C60\u201D\uFF1B
3. \u6309 Enter\uFF1B
4. \u7CFB\u7EDF\u81EA\u52A8\u9009\u4E2D\u5E76\u805A\u7126\u5BF9\u8C61\uFF1B
5. \u672A\u627E\u5230\u65F6\u4F1A\u663E\u793A\u63D0\u793A\u6D88\u606F\u3002

### 6.2 \u901A\u77E5

1. \u70B9\u51FB\u9876\u90E8\u901A\u77E5\u56FE\u6807\uFF1B
2. \u67E5\u770B\u6700\u8FD1\u4E09\u6761\u544A\u8B66\uFF1B
3. \u70B9\u51FB\u201C\u67E5\u770B\u5168\u90E8\u6D88\u606F\u201D\uFF1B
4. \u7CFB\u7EDF\u5207\u6362\u5230\u544A\u8B66\u4E1A\u52A1\u4E2D\u5FC3\u3002

### 6.3 \u7528\u6237\u83DC\u5355

\u70B9\u51FB\u53F3\u4E0A\u89D2\u5934\u50CF\uFF0C\u53EF\u4EE5\uFF1A

- \u67E5\u770B\u5F53\u524D\u7528\u6237\uFF1B
- \u6253\u5F00\u4EBA\u8138\u7BA1\u7406\uFF1B
- \u7ED1\u5B9A\u6216\u89E3\u7ED1\u4EBA\u8138\uFF1B
- \u9000\u51FA\u767B\u5F55\u3002

---

## 7. \u822A\u62CD\u5B9E\u666F\u6A21\u5F0F

\u822A\u62CD\u5B9E\u666F\u7528\u4E8E\u5FEB\u901F\u7406\u89E3\u6574\u4E2A\u519C\u573A\u7684\u7A7A\u95F4\u5173\u7CFB\u3002

### 7.1 \u67E5\u770B\u5BF9\u8C61

- **\u9F20\u6807\u60AC\u505C**\uFF1A\u663E\u793A\u5BF9\u8C61\u8FB9\u754C\u548C\u6458\u8981\uFF1B
- **\u5355\u51FB\u5BF9\u8C61**\uFF1A\u9009\u4E2D\u5BF9\u8C61\u5E76\u6253\u5F00\u53F3\u4FA7\u8BE6\u60C5\uFF1B
- **\u53CC\u51FB\u5BF9\u8C61**\uFF1A\u805A\u7126\u8BE5\u5BF9\u8C61\uFF1B
- **\u70B9\u51FB\u7A7A\u767D\u5904**\uFF1A\u53D6\u6D88\u9009\u62E9\uFF1B
- **\u6EDA\u8F6E\u6216\u5DE5\u5177\u6309\u94AE**\uFF1A\u8C03\u6574\u7F29\u653E\uFF1B
- **\u590D\u4F4D\u6309\u94AE**\uFF1A\u6062\u590D\u519C\u573A\u5168\u666F\u3002

### 7.2 \u56FE\u5C42\u63A7\u5236

\u70B9\u51FB\u573A\u666F\u5DE5\u5177\u680F\u4E2D\u7684\u201C\u56FE\u5C42\u201D\uFF0C\u53EF\u6253\u5F00\u6216\u5173\u95ED\uFF1A

- \u5730\u5757\u8FB9\u754C\uFF1B
- \u8BBE\u5907\uFF1B
- \u6444\u50CF\u5934\uFF1B
- \u704C\u6E89\u7F51\u7EDC\uFF1B
- \u544A\u8B66\u3002

### 7.3 \u6D4B\u8DDD

1. \u70B9\u51FB\u201C\u6D4B\u8DDD\u201D\uFF1B
2. \u70B9\u51FB\u7B2C\u4E00\u4E2A\u5730\u56FE\u5BF9\u8C61\u4F5C\u4E3A\u8D77\u70B9\uFF1B
3. \u70B9\u51FB\u7B2C\u4E8C\u4E2A\u5BF9\u8C61\u4F5C\u4E3A\u7EC8\u70B9\uFF1B
4. \u9875\u9762\u63D0\u793A\u4E24\u70B9\u4E4B\u95F4\u7684\u7A7A\u95F4\u8DDD\u79BB\u3002

---

## 8. 3D \u6570\u5B57\u5B6A\u751F\u6A21\u5F0F

![3D \u6570\u5B57\u5B6A\u751F\u9E1F\u77B0](./\u622A\u56FE/3D.png)

> **\u56FE 8-1\u30003D \u6570\u5B57\u5B6A\u751F\u9E1F\u77B0\u3002** \u5DE6\u4E0A\u89D2\u201C\u5B9E\u666F/3D\u201D\u7528\u4E8E\u5207\u6362\u573A\u666F\uFF1B\u4E2D\u592E\u6E29\u5BA4\u3001\u8BBE\u5907\u3001\u9053\u8DEF\u548C\u79CD\u690D\u533A\u5747\u4E3A\u7A7A\u95F4\u5BF9\u8C61\uFF1B\u53F3\u4FA7\u8BE6\u60C5\u4E2D\u7684\u201C\u8FDB\u5165\u5927\u68DA\u201D\u53EF\u8FDB\u5165\u5BF9\u5E94\u68DA\u5185\u9875\u9762\u3002

### 8.1 \u8FDB\u5165 3D

1. \u70B9\u51FB\u573A\u666F\u53F3\u4E0A\u65B9\u201C3D\u201D\u6216\u201C\u6570\u5B57\u5B6A\u751F\u201D\uFF1B
2. \u7B49\u5F85\u6A21\u578B\u52A0\u8F7D\u8FDB\u5EA6\u5B8C\u6210\uFF1B
3. \u52A0\u8F7D\u540E\u53EF\u4EE5\u770B\u5230\u5927\u68DA\u3001\u9053\u8DEF\u3001\u8BBE\u5907\u3001\u673A\u5668\u4EBA\u3001\u6811\u6728\u548C\u79CD\u690D\u533A\u3002

### 8.2 \u9E1F\u77B0\u64CD\u4F5C

- \u6309\u4F4F\u9F20\u6807\u5DE6\u952E\u62D6\u52A8\uFF1A\u65CB\u8F6C\u89C6\u89D2\uFF1B
- \u9F20\u6807\u6EDA\u8F6E\uFF1A\u7F29\u653E\uFF1B
- \u5355\u51FB\u5BF9\u8C61\uFF1A\u6253\u5F00\u8BE6\u60C5\uFF1B
- \u53CC\u51FB\u5927\u68DA\uFF1A\u76F4\u63A5\u8FDB\u5165\u5BF9\u5E94\u5927\u68DA\u5185\u90E8\uFF1B
- \u70B9\u51FB\u7A7A\u767D\u533A\u57DF\uFF1A\u5173\u95ED\u9009\u62E9\u3002

### 8.3 \u7B2C\u4E00\u4EBA\u79F0\u5DE1\u573A

![\u7B2C\u4E00\u4EBA\u79F0\u5DE1\u573A](./\u622A\u56FE/\u7B2C\u4E00\u4EBA\u79F0.png)

> **\u56FE 8-2\u3000\u7B2C\u4E00\u4EBA\u79F0\u5DE1\u573A\u3002** \u753B\u9762\u4E2D\u592E\u51C6\u661F\u7528\u4E8E\u9009\u62E9\u5BF9\u8C61\uFF0C\u5E95\u90E8\u63D0\u793A\u6761\u663E\u793A\u79FB\u52A8\u3001\u89C2\u5BDF\u3001\u52A0\u901F\u548C\u4E1A\u52A1\u5FEB\u6377\u952E\uFF0C\u5DE6\u4E0A\u89D2\u53EF\u6309 \`Esc\` \u9000\u51FA\u5DE1\u573A\u3002

1. \u70B9\u51FB\u201C\u7B2C\u4E00\u4EBA\u79F0\u5DE1\u573A\u201D\uFF1B
2. \u70B9\u51FB\u573A\u666F\u4EE5\u9501\u5B9A\u9F20\u6807\uFF1B
3. \u4F7F\u7528 \`W/A/S/D\` \u524D\u540E\u5DE6\u53F3\u79FB\u52A8\uFF1B
4. \u79FB\u52A8\u9F20\u6807\u89C2\u5BDF\u56DB\u5468\uFF1B
5. \u6309\u4F4F \`Shift\` \u52A0\u901F\uFF1B
6. \u4F7F\u7528\u753B\u9762\u4E2D\u5FC3\u51C6\u661F\u5BF9\u51C6\u5BF9\u8C61\uFF1B
7. \u70B9\u51FB\u5DE6\u952E\u9009\u62E9\u8BBE\u65BD\uFF1B
8. \u6309 \`Esc\` \u91CA\u653E\u9F20\u6807\u6216\u9000\u51FA\u5DE1\u573A\u3002

\u7B2C\u4E00\u4EBA\u79F0\u5FEB\u6377\u952E\uFF1A

| \u6309\u952E | \u4E1A\u52A1\u6A21\u5757 |
|---|---|
| 1 | \u603B\u89C8 |
| 2 | \u76D1\u63A7 |
| 3 | \u73AF\u5883 |
| 4 | \u8BBE\u5907 |
| 5 | \u704C\u6E89 |
| 6 | \u4F5C\u7269 |
| 7 | \u544A\u8B66 |

\u573A\u666F\u5177\u6709\u8BBE\u65BD\u78B0\u649E\u8303\u56F4\uFF0C\u65E0\u6CD5\u76F4\u63A5\u7A7F\u8FC7\u6E29\u5BA4\u3001\u5EFA\u7B51\u3001\u6C34\u6C60\u548C\u8BBE\u5907\u3002\u9760\u8FD1\u969C\u788D\u7269\u65F6\u53EF\u6CBF\u8FB9\u7F18\u6ED1\u52A8\u3002

---

## 9. \u4E03\u4E2A\u4E1A\u52A1\u4E2D\u5FC3

### 9.1 \u603B\u89C8

\u7528\u4E8E\u67E5\u770B\uFF1A

- \u519C\u573A\u5065\u5EB7\u5EA6\uFF1B
- \u8BBE\u5907\u603B\u6570\u548C\u5728\u7EBF\u6570\uFF1B
- \u5F53\u524D\u672A\u5904\u7406\u544A\u8B66\uFF1B
- \u6C34\u4F4D\u548C\u4ECA\u65E5\u7528\u6C34\uFF1B
- \u5173\u952E\u7A7A\u95F4\u5BF9\u8C61\u72B6\u6001\u3002

### 9.2 \u76D1\u63A7

1. \u70B9\u51FB Dock \u4E2D\u201C\u76D1\u63A7\u201D\uFF1B
2. \u5730\u56FE\u4E0A\u53EF\u76D1\u63A7\u7684\u5927\u68DA\u548C\u5730\u5757\u8FDB\u5165\u53EF\u9009\u72B6\u6001\uFF1B
3. \u70B9\u51FB\u4E00\u4E2A\u5927\u68DA\u6216\u5730\u5757\uFF1B
4. \u6253\u5F00\u76D1\u63A7\u5F39\u7A97\uFF1B
5. \u67E5\u770B\u89C6\u9891\u3001\u6444\u50CF\u5934\u4FE1\u606F\u548C AI \u68C0\u6D4B\u6846\uFF1B
6. \u53EF\u5207\u6362\u6444\u50CF\u5934\u3001\u67E5\u770B AI \u5206\u6790\u6216\u6267\u884C\u5F55\u50CF\u64CD\u4F5C\u3002

\u5F53\u524D\u6F14\u793A\u89C6\u9891\u91C7\u7528 YOLO \u79BB\u7EBF\u68C0\u6D4B\uFF0C\u5E76\u4F7F\u7528 ByteTrack \u7EF4\u6301\u4EBA\u5458/\u4F5C\u7269\u76EE\u6807 ID\u3002\u68C0\u6D4B\u7ED3\u679C\u4F1A\u6309\u89C6\u9891\u65F6\u95F4\u53E0\u52A0\u663E\u793A\u3002

### 9.3 \u73AF\u5883

\u70B9\u51FB\u201C\u73AF\u5883\u201D\u540E\u53EF\u67E5\u770B\uFF1A

- \u7A7A\u6C14\u6E29\u5EA6\uFF1B
- \u7A7A\u6C14\u6E7F\u5EA6\uFF1B
- \u571F\u58E4\u6E7F\u5EA6\uFF1B
- \u5149\u7167\uFF1B
- CO\u2082\uFF1B
- 24 \u5C0F\u65F6\u8D8B\u52BF\uFF1B
- AI \u8C03\u63A7\u5EFA\u8BAE\u3002

\u73AF\u5883\u6570\u636E\u6BCF 30 \u79D2\u5237\u65B0\u4E00\u6B21\u3002\u6A59\u8272\u6216\u8B66\u793A\u8272\u8868\u793A\u6307\u6807\u9700\u8981\u5173\u6CE8\u3002

### 9.4 \u8BBE\u5907

1. \u70B9\u51FB\u201C\u8BBE\u5907\u201D\uFF1B
2. \u9ED8\u8BA4\u9009\u4E2D\u6C34\u80A5\u4E00\u4F53\u673A\uFF1B
3. \u4ECE\u5730\u56FE\u6216\u8BBE\u5907\u5217\u8868\u9009\u62E9\u76EE\u6807\uFF1B
4. \u67E5\u770B\u5728\u7EBF\u72B6\u6001\u3001\u4F4D\u7F6E\u3001\u5F53\u524D\u6570\u503C\u548C\u6700\u540E\u901A\u4FE1\u65F6\u95F4\uFF1B
5. \u4F7F\u7528\u5F00\u5173\u63A7\u5236\u8BBE\u5907\uFF1B
6. \u70B9\u51FB\u201C\u8BBE\u5907\u81EA\u68C0\u201D\u6267\u884C\u68C0\u67E5\uFF1B
7. \u7B49\u5F85\u6210\u529F\u6216\u5931\u8D25\u63D0\u793A\u3002

\u5B89\u5168\u9650\u5236\uFF1A\u79BB\u7EBF\u8BBE\u5907\u4E0D\u80FD\u88AB\u5F00\u542F\u3002\u7CFB\u7EDF\u4F1A\u8FD4\u56DE\u201C\u79BB\u7EBF\u8BBE\u5907\u65E0\u6CD5\u5F00\u542F\u201D\uFF0C\u9632\u6B62\u9519\u8BEF\u63A7\u5236\u3002

### 9.5 \u704C\u6E89

1. \u70B9\u51FB\u201C\u704C\u6E89\u201D\uFF1B
2. \u67E5\u770B\u84C4\u6C34\u6C60\u3001\u6C34\u80A5\u673A\u3001\u9600\u95E8\u548C\u5404\u704C\u6E89\u5355\u5143\uFF1B
3. \u9009\u62E9\u4E00\u4E2A\u704C\u6E89\u5355\u5143\uFF1B
4. \u8BBE\u7F6E\u704C\u6E89\u65F6\u957F\uFF1B
5. \u6253\u5F00\u6216\u5173\u95ED\u704C\u6E89\uFF1B
6. \u4FDD\u5B58\u8BA1\u5212\uFF1B
7. \u5237\u65B0\u9875\u9762\u786E\u8BA4\u72B6\u6001\u4ECD\u7136\u4FDD\u7559\u3002

### 9.6 \u4F5C\u7269

\u9009\u62E9\u201C\u4F5C\u7269\u201D\u540E\u53EF\u67E5\u770B\uFF1A

- \u4F5C\u7269\u54C1\u79CD\uFF1B
- \u751F\u957F\u9636\u6BB5\uFF1B
- \u5065\u5EB7\u5EA6\uFF1B
- \u73AF\u5883\u6458\u8981\uFF1B
- \u75C5\u866B\u5BB3\u98CE\u9669\uFF1B
- \u5F53\u524D\u519C\u4E8B\u4EFB\u52A1\u3002

\u9009\u62E9\u5927\u68DA\u540E\uFF0C\u53EF\u901A\u8FC7\u8BE6\u60C5\u4E2D\u7684\u201C\u8FDB\u5165\u5927\u68DA\u201D\u7EE7\u7EED\u67E5\u770B\u68DA\u5185\u690D\u682A\u3002

### 9.7 \u544A\u8B66

1. \u70B9\u51FB\u201C\u544A\u8B66\u201D\uFF1B
2. \u67E5\u770B\u544A\u8B66\u6807\u9898\u3001\u65F6\u95F4\u3001\u7B49\u7EA7\u548C\u72B6\u6001\uFF1B
3. \u9009\u62E9\u672A\u5904\u7406\u544A\u8B66\uFF1B
4. \u9605\u8BFB\u5173\u8054\u5BF9\u8C61\u4FE1\u606F\uFF1B
5. \u70B9\u51FB\u201C\u5904\u7406\u544A\u8B66\u201D\uFF1B
6. \u72B6\u6001\u53D8\u4E3A\u201C\u5DF2\u5904\u7406\u201D\uFF1B
7. \u5237\u65B0\u540E\u5904\u7406\u7ED3\u679C\u4ECD\u7136\u4FDD\u7559\u3002

---

## 10. \u53F3\u4FA7\u4E0A\u4E0B\u6587\u62BD\u5C49

\u53F3\u4FA7\u62BD\u5C49\u6839\u636E\u9009\u62E9\u5BF9\u8C61\u81EA\u52A8\u53D8\u5316\u3002

### 10.1 \u5927\u68DA\u6216\u5730\u5757

\u663E\u793A\uFF1A\u4F5C\u7269\u3001\u9762\u79EF\u3001\u751F\u957F\u9636\u6BB5\u3001\u73AF\u5883\u3001\u5065\u5EB7\u5EA6\u548C\u4EFB\u52A1\u3002\u5927\u68DA\u8BE6\u60C5\u4E0B\u65B9\u63D0\u4F9B\u201C\u8FDB\u5165\u5927\u68DA\u201D\u3002

### 10.2 \u8BBE\u5907

\u663E\u793A\uFF1A\u5728\u7EBF\u72B6\u6001\u3001\u542F\u505C\u72B6\u6001\u3001\u6D4B\u91CF\u503C\u3001\u4F4D\u7F6E\u3001\u6700\u540E\u901A\u4FE1\u65F6\u95F4\u3001\u63A7\u5236\u5F00\u5173\u548C\u81EA\u68C0\u3002

### 10.3 \u704C\u6E89\u5355\u5143

\u663E\u793A\uFF1A\u76EE\u6807\u533A\u57DF\u3001\u8FD0\u884C\u72B6\u6001\u3001\u6D41\u91CF\u3001\u65F6\u957F\u8BBE\u7F6E\u548C\u8BA1\u5212\u4FDD\u5B58\u3002

### 10.4 \u544A\u8B66

\u663E\u793A\uFF1A\u4E8B\u4EF6\u7B49\u7EA7\u3001\u5173\u8054\u5BF9\u8C61\u3001\u53D1\u751F\u65F6\u95F4\u3001\u5F53\u524D\u72B6\u6001\u548C\u5904\u7406\u64CD\u4F5C\u3002

\u5173\u95ED\u62BD\u5C49\u540E\uFF0C3D \u7B2C\u4E00\u4EBA\u79F0\u63A7\u5236\u4F1A\u81EA\u52A8\u6062\u590D\u3002

---

## 11. \u667A\u80FD\u95EE\u519C

![\u72EC\u7ACB\u667A\u80FD\u95EE\u519C\u9996\u9875](./\u622A\u56FE/\u95EE\u519C.png)

> **\u56FE 11-1\u3000\u72EC\u7ACB\u667A\u80FD\u95EE\u519C\u9996\u9875\u3002** \u4E2D\u592E\u8F93\u5165\u6846\u7528\u4E8E\u81EA\u7136\u8BED\u8A00\u63D0\u95EE\uFF0C\u4E0B\u65B9\u63D0\u4F9B\u5E38\u7528\u95EE\u9898\u5FEB\u6377\u5165\u53E3\uFF1B\u5DE6\u4FA7\u4FDD\u5B58\u9879\u76EE\u548C\u6700\u8FD1\u5BF9\u8BDD\uFF0C\u5E95\u90E8 Dock \u53EF\u8FDB\u5165\u9762\u677F\u3001\u6F14\u793A\u53CA\u5176\u4ED6\u5E94\u7528\u3002

\u7CFB\u7EDF\u63D0\u4F9B\u4E24\u79CD\u95EE\u519C\u5165\u53E3\uFF1A

1. \u6570\u636E\u5DE5\u4F5C\u53F0\u5DE6\u4FA7\u201C\u5C0F\u7530\u201D\u52A9\u624B\uFF1B
2. \u9876\u90E8\u201C\u667A\u80FD\u95EE\u519C\u201D\u72EC\u7ACB\u9875\u9762\u3002

### 11.1 \u5728\u6570\u636E\u5DE5\u4F5C\u53F0\u4E2D\u63D0\u95EE

1. \u70B9\u51FB\u201C\u5C0F\u7530\u201D\u89D2\u8272\uFF1B
2. \u8F93\u5165\u95EE\u9898\uFF1B
3. \u70B9\u51FB\u53D1\u9001\uFF1B
4. \u7CFB\u7EDF\u4F1A\u81EA\u52A8\u643A\u5E26\u5F53\u524D\u89C6\u56FE\u3001\u4E1A\u52A1\u6A21\u5757\u548C\u5DF2\u9009\u5BF9\u8C61\uFF1B
5. \u67E5\u770B\u56DE\u7B54\uFF1B
6. \u7EE7\u7EED\u8FFD\u95EE\u5373\u53EF\u5F62\u6210\u591A\u8F6E\u5BF9\u8BDD\u3002

\u793A\u4F8B\u95EE\u9898\uFF1A

- \u201C\u5F53\u524D\u519C\u573A\u6709\u54EA\u4E9B\u5F02\u5E38\uFF1F\u201D
- \u201C2\u53F7\u6E29\u5BA4\u4E3A\u4EC0\u4E48\u9700\u8981\u5173\u6CE8\uFF1F\u201D
- \u201C\u5206\u67904\u53F7\u5730\u5757\u571F\u58E4\u6E7F\u5EA6\u3002\u201D
- \u201C\u7ED9\u6211\u4E00\u4E2A\u4ECA\u5929\u7684\u704C\u6E89\u5EFA\u8BAE\u3002\u201D
- \u201C\u5F53\u524D\u6709\u54EA\u4E9B\u79BB\u7EBF\u8BBE\u5907\uFF1F\u201D

### 11.2 \u72EC\u7ACB\u667A\u80FD\u95EE\u519C\u9875\u9762

1. \u70B9\u51FB\u9876\u90E8\u201C\u667A\u80FD\u95EE\u519C\u201D\uFF1B
2. \u70B9\u51FB\u201C\u65B0\u5EFA\u5BF9\u8BDD\u201D\u6216\u9009\u62E9\u5386\u53F2\u5BF9\u8BDD\uFF1B
3. \u8F93\u5165\u81EA\u7136\u8BED\u8A00\u95EE\u9898\uFF1B
4. \u53EF\u4F7F\u7528\u5FEB\u6377\u95EE\u9898\uFF1B
5. \u53EF\u70B9\u51FB\u9EA6\u514B\u98CE\u8FDB\u884C\u8BED\u97F3\u8F93\u5165\uFF1B
6. \u53EF\u6DFB\u52A0\u6587\u672C\u9644\u4EF6\uFF1B
7. \u53D1\u9001\u540E\u67E5\u770B\u6587\u5B57\u56DE\u7B54\u548C\u81EA\u52A8\u751F\u6210\u7684\u6570\u636E\u9762\u677F\uFF1B
8. \u4F7F\u7528\u53F3\u4FA7\u5FEB\u6377 Dock \u6253\u5F00\u5E94\u7528\u3001\u6570\u636E\u6216\u76F8\u5173\u529F\u80FD\uFF1B
9. \u5BF9\u8BDD\u548C\u5DE5\u4F5C\u53F0\u5E03\u5C40\u4F1A\u4FDD\u5B58\u5230\u5F53\u524D\u8D26\u53F7\u3002

\u4E0D\u540C\u8D26\u53F7\u7684\u95EE\u519C\u8BB0\u5F55\u76F8\u4E92\u9694\u79BB\u3002

![\u81EA\u5B9A\u4E49\u667A\u80FD\u5DE5\u4F5C\u53F0](./\u622A\u56FE/\u81EA\u5B9A\u4E49\u5DE5\u4F5C\u53F0.png)

> **\u56FE 11-2\u3000\u81EA\u5B9A\u4E49\u667A\u80FD\u5DE5\u4F5C\u53F0\u3002** \u5DE5\u4F5C\u53F0\u53EF\u540C\u65F6\u627F\u8F7D\u544A\u8B66\u3001\u704C\u6E89\u8BA1\u5212\u3001\u5927\u68DA\u72B6\u6001\u3001\u519C\u573A\u603B\u89C8\u548C\u5173\u952E\u6307\u6807\u7EC4\u4EF6\uFF1B\u70B9\u51FB\u53F3\u4E0A\u89D2\u201C\u7F16\u8F91\u5DE5\u4F5C\u53F0\u201D\u53EF\u8C03\u6574\u7EC4\u4EF6\uFF0C\u5E95\u90E8\u201C\u5C0F\u7530\u52A9\u624B\u201D\u53EF\u7ED3\u5408\u5F53\u524D\u9762\u677F\u7EE7\u7EED\u63D0\u95EE\u3002

### 11.3 AI \u4E0D\u53EF\u7528\u65F6

\u5982\u679C\u63D0\u793A\u672A\u914D\u7F6E\u6216\u8C03\u7528\u5931\u8D25\uFF0C\u8BF7\u7BA1\u7406\u5458\u68C0\u67E5\uFF1A

- \`DEEPSEEK_API_KEY\`\uFF1B
- \`DEEPSEEK_BASE_URL\`\uFF1B
- \`DEEPSEEK_MODEL\`\uFF1B
- \u670D\u52A1\u5668\u662F\u5426\u80FD\u591F\u8BBF\u95EE\u6A21\u578B\u63A5\u53E3\u3002

---

## 12. \u8FDB\u5165\u5927\u68DA\u5185\u90E8

\u8FDB\u5165\u65B9\u5F0F\u6709\u4E24\u79CD\uFF1A

### 12.1 \u4ECE\u8BE6\u60C5\u6309\u94AE\u8FDB\u5165

1. \u5728\u822A\u62CD\u6216 3D \u573A\u666F\u5355\u51FB\u4E00\u5EA7\u5927\u68DA\uFF1B
2. \u6253\u5F00\u53F3\u4FA7\u8BE6\u60C5\uFF1B
3. \u70B9\u51FB\u201C\u8FDB\u5165\u5927\u68DA\u201D\uFF1B
4. \u7CFB\u7EDF\u8FDB\u5165\u5BF9\u5E94\u5927\u68DA\u5185\u90E8\u9875\u9762\u3002

### 12.2 \u5728 3D \u4E2D\u53CC\u51FB\u8FDB\u5165

1. \u5207\u6362\u5230 3D\uFF1B
2. \u627E\u5230\u76EE\u6807\u5927\u68DA\uFF1B
3. \u53CC\u51FB\u5927\u68DA\u6A21\u578B\uFF1B
4. \u7CFB\u7EDF\u8FDB\u5165\u5BF9\u5E94\u5927\u68DA\u5185\u90E8\u3002

\u516D\u5EA7\u5927\u68DA\u5206\u522B\u4F7F\u7528\u72EC\u7ACB\u4F5C\u7269\u548C\u7ED3\u6784\uFF1A

| \u5927\u68DA | \u4F5C\u7269/\u7528\u9014 | \u6A21\u578B\u7279\u70B9 |
|---|---|---|
| 1\u53F7 | \u756A\u8304 | \u85E4\u8513\u756A\u8304\u4E0E\u683D\u57F9\u67B6 |
| 2\u53F7 | \u8349\u8393 | \u9AD8\u67B6\u57FA\u8D28\u683D\u57F9 |
| 3\u53F7 | \u9EC4\u74DC | \u540A\u8513\u683D\u57F9 |
| 4\u53F7 | \u80B2\u82D7 | \u7A74\u76D8\u4E0E\u6F6E\u6C50\u82D7\u5E8A |
| 5\u53F7 | \u751F\u6001\u756A\u8304 | \u6709\u673A\u9AD8\u5784\u3001\u8986\u8349\u4FDD\u5892 |
| 6\u53F7 | \u6C34\u57F9\u53F6\u83DC | NFT \u6C34\u57F9\u4E0E\u8425\u517B\u6DB2\u5FAA\u73AF |

---

## 13. \u5927\u68DA\u5185\u90E8\u64CD\u4F5C

![\u5927\u68DA\u5185\u90E8\u6570\u5B57\u5B6A\u751F](./\u622A\u56FE/\u5927\u68DA\u5185\u90E8.png)

> **\u56FE 13-1\u3000\u5927\u68DA\u5185\u90E8\u6570\u5B57\u5B6A\u751F\u3002** \u9876\u90E8\u5207\u6362\u5B9E\u666F/\u6570\u5B57\u5B6A\u751F\uFF1B\u4E2D\u592E\u4E3A\u9AD8\u7CBE\u5EA6\u4F5C\u7269\u548C\u68DA\u5185\u8BBE\u5907\u6A21\u578B\uFF1B\u5E95\u90E8\u663E\u793A\u73AF\u5883\u6307\u6807\uFF1B\u53F3\u4FA7\u6807\u7B7E\u5206\u522B\u8FDB\u5165\u603B\u89C8\u3001\u8BBE\u5907\u548C\u690D\u682A\u6570\u636E\uFF0C\u53F3\u680F\u5185\u90E8\u53EF\u72EC\u7ACB\u5411\u4E0B\u6EDA\u52A8\u3002

### 13.1 \u9875\u9762\u7ED3\u6784

1. **\u9876\u90E8\u680F**\uFF1A\u8FD4\u56DE\u519C\u573A\u3001\u5927\u68DA\u540D\u79F0\u3001\u667A\u80FD\u95EE\u519C/\u6570\u636E\u5DE5\u4F5C\u53F0\u3001\u5B9E\u666F/\u6570\u5B57\u5B6A\u751F\uFF1B
2. **\u4E2D\u592E\u4E3B\u753B\u9762**\uFF1A\u68DA\u5185\u5B9E\u666F\u89C6\u9891\u6216 3D \u6A21\u578B\uFF1B
3. **\u5E95\u90E8\u73AF\u5883\u6761**\uFF1A\u6E29\u5EA6\u3001\u6E7F\u5EA6\u3001\u571F\u58E4/\u57FA\u8D28\u542B\u6C34\u3001\u5149\u7167\u3001CO\u2082\uFF1B
4. **\u53F3\u4FA7\u6570\u636E\u680F**\uFF1A\u5927\u68DA\u6982\u51B5\u3001\u8BBE\u5907\u3001\u5206\u533A\u3001\u690D\u682A\u3001\u5EFA\u8BAE\u548C\u544A\u8B66\uFF1B
5. **\u4FA7\u680F\u6536\u8D77\u6309\u94AE**\uFF1A\u6269\u5927\u4E3B\u753B\u9762\uFF1B
6. **\u8FD4\u56DE\u519C\u573A**\uFF1A\u8FD4\u56DE\u56ED\u533A\u6570\u636E\u5DE5\u4F5C\u53F0\u3002

### 13.2 \u5B9E\u666F\u6A21\u5F0F

1. \u70B9\u51FB\u9876\u90E8\u201C\u5B9E\u666F\u201D\uFF1B
2. \u7B49\u5F85\u6444\u50CF\u5934/\u6F14\u793A\u89C6\u9891\u8FDE\u63A5\uFF1B
3. \u67E5\u770B\u68DA\u5185\u771F\u5B9E\u753B\u9762\uFF1B
4. \u5982\u679C\u6D4F\u89C8\u5668\u963B\u6B62\u81EA\u52A8\u64AD\u653E\uFF0C\u70B9\u51FB\u201C\u64AD\u653E\u68DA\u5185\u5B9E\u666F\u201D\uFF1B
5. \u89C2\u5BDF\u6444\u50CF\u5934\u8FDE\u63A5\u548C AI \u5728\u7EBF\u72B6\u6001\u3002

\u5F53\u524D\u7248\u672C\u64AD\u653E\u9884\u7F6E\u68DA\u5185\u89C6\u9891\u3002\u540E\u7EED\u8BA1\u5212\u63A5\u5165 LingBot-Map\uFF0C\u5C06\u5355\u76EE\u6444\u50CF\u5934\u89C6\u9891\u8F6C\u6362\u4E3A\u68DA\u5185\u4E09\u7EF4\u91CD\u5EFA\u7ED3\u679C\uFF0C\u5E76\u670D\u52A1\u4E8E\u519C\u4E1A\u673A\u5668\u4EBA\u5B9A\u4F4D\u548C\u5BFC\u822A\u3002\u8BE5\u89C4\u5212\u4E0D\u4EE3\u8868\u5F53\u524D\u9875\u9762\u5DF2\u7ECF\u5B8C\u6210\u5B9E\u65F6\u5EFA\u56FE\u3002

### 13.3 \u6570\u5B57\u5B6A\u751F\u6A21\u5F0F

1. \u70B9\u51FB\u9876\u90E8\u201C\u6570\u5B57\u5B6A\u751F\u201D\uFF1B
2. \u62D6\u52A8\u65CB\u8F6C\u6A21\u578B\uFF1B
3. \u6EDA\u8F6E\u7F29\u653E\uFF1B
4. \u70B9\u51FB\u690D\u682A\uFF0C\u5728\u53F3\u680F\u6253\u5F00\u690D\u682A\u6570\u636E\uFF1B
5. \u67E5\u770B\u68DA\u67B6\u3001\u82D7\u5E8A\u3001\u6EF4\u704C\u3001\u4F20\u611F\u5668\u3001\u98CE\u673A\u3001\u76F8\u673A\u548C\u63A7\u5236\u8BBE\u5907\u3002

### 13.4 \u53F3\u4FA7\u201C\u603B\u89C8\u201D

\u5305\u62EC\uFF1A

- \u5927\u68DA\u9762\u79EF\u3001\u68DA\u578B\u3001\u683D\u57F9\u6A21\u5F0F\u548C\u5065\u5EB7\u5EA6\uFF1B
- \u751F\u4EA7\u753B\u50CF\uFF1B
- \u5E73\u5747\u682A\u9AD8 7 \u65E5\u8D8B\u52BF\uFF1B
- A/B/C \u5206\u533A\u4F5C\u4E1A\uFF1B
- AI \u8C03\u63A7\u5EFA\u8BAE\uFF1B
- \u6700\u8FD1\u544A\u8B66\u3002

### 13.5 \u53F3\u4FA7\u201C\u8BBE\u5907\u201D

1. \u70B9\u51FB\u201C\u8BBE\u5907\u201D\uFF1B
2. \u67E5\u770B\u5728\u7EBF\u8BBE\u5907\u6570\u91CF\uFF1B
3. \u9010\u9879\u67E5\u770B\u8BBE\u5907\u540D\u79F0\u3001\u4F4D\u7F6E\u3001\u8D23\u4EFB\u3001\u8FD0\u884C\u72B6\u6001\u548C\u5B9E\u65F6\u503C\uFF1B
4. \u5BF9\u7167\u6570\u5B57\u5B6A\u751F\u4E2D\u7684\u7A7A\u95F4\u4F4D\u7F6E\u7406\u89E3\u8BBE\u5907\u5E03\u5C40\u3002

### 13.6 \u53F3\u4FA7\u201C\u690D\u682A\u201D

1. \u70B9\u51FB\u201C\u690D\u682A\u201D\uFF1B
2. \u67E5\u770B\u6837\u672C\u603B\u6570\u548C\u9700\u5173\u6CE8\u6570\u91CF\uFF1B
3. \u70B9\u51FB\u4E00\u4E2A\u690D\u682A\u7F16\u53F7\uFF0C\u5982 \`P-03\`\uFF1B
4. 3D \u6A21\u578B\u5B9A\u4F4D\u5230\u5BF9\u5E94\u690D\u682A\uFF1B
5. \u67E5\u770B\u5065\u5EB7\u5EA6\u3001\u682A\u9AD8\u3001\u57FA\u8D28\u542B\u6C34\u3001\u682A\u9F84\u3001\u53F6\u9762\u79EF\u6307\u6570\u548C\u5EFA\u6A21\u5750\u6807\uFF1B
6. \u70B9\u51FB\u201C\u53D6\u6D88\u5B9A\u4F4D\u201D\u6062\u590D\u666E\u901A\u6D4F\u89C8\uFF1B
7. \u4F7F\u7528\u9F20\u6807\u6EDA\u8F6E\u6216\u62D6\u52A8\u53F3\u680F\u6EDA\u52A8\u6761\u7EE7\u7EED\u67E5\u770B\u4E0B\u65B9\u690D\u682A\u3002

### 13.7 \u6536\u8D77\u548C\u5C55\u5F00\u6570\u636E\u680F

- \u70B9\u51FB\u53F3\u680F\u5DE6\u4FA7\u4E2D\u90E8\u7684\u7BAD\u5934\u53EF\u6536\u8D77\uFF1B
- \u518D\u6B21\u70B9\u51FB\u53EF\u5C55\u5F00\uFF1B
- \u53F3\u680F\u5185\u5BB9\u8FC7\u957F\u65F6\uFF0C\u628A\u9F20\u6807\u653E\u5728\u53F3\u680F\u5185\u90E8\u6EDA\u52A8\uFF1B
- \u624B\u673A\u548C\u5E73\u677F\u4E0A\u53EF\u76F4\u63A5\u5728\u53F3\u680F\u4E0A\u4E0B\u6ED1\u52A8\u3002

---

## 14. \u4EBA\u8138\u7BA1\u7406\u4E0E\u9000\u51FA

### 14.1 \u7ED1\u5B9A\u4EBA\u8138

1. \u70B9\u51FB\u53F3\u4E0A\u89D2\u7528\u6237\u5934\u50CF\uFF1B
2. \u6253\u5F00\u4EBA\u8138\u7BA1\u7406\uFF1B
3. \u70B9\u51FB\u62CD\u7167\u6216\u5728\u7ED1\u5B9A\u573A\u666F\u4E0A\u4F20\u6E05\u6670\u4EBA\u8138\u7167\uFF1B
4. \u786E\u8BA4\u7ED1\u5B9A\uFF1B
5. \u72B6\u6001\u53D8\u4E3A\u201C\u5DF2\u7ED1\u5B9A\u201D\u3002

### 14.2 \u89E3\u7ED1\u4EBA\u8138

1. \u6253\u5F00\u4EBA\u8138\u7BA1\u7406\uFF1B
2. \u70B9\u51FB\u201C\u89E3\u7ED1\u4EBA\u8138\u201D\uFF1B
3. \u786E\u8BA4\u64CD\u4F5C\uFF1B
4. \u4E4B\u540E\u4E0D\u80FD\u518D\u4F7F\u7528\u5237\u8138\u767B\u5F55\uFF0C\u5BC6\u7801\u767B\u5F55\u4E0D\u53D7\u5F71\u54CD\u3002

### 14.3 \u9000\u51FA\u767B\u5F55

1. \u70B9\u51FB\u7528\u6237\u5934\u50CF\uFF1B
2. \u70B9\u51FB\u201C\u9000\u51FA\u767B\u5F55\u201D\uFF1B
3. \u672C\u5730\u767B\u5F55\u4EE4\u724C\u88AB\u6E05\u9664\uFF1B
4. \u9875\u9762\u8FD4\u56DE\u5B98\u7F51\u767B\u5F55\u3002

---

## 15. \u624B\u673A\u548C\u5E73\u677F\u4F7F\u7528

- \u9876\u90E8\u529F\u80FD\u4F1A\u6839\u636E\u5C4F\u5E55\u5BBD\u5EA6\u81EA\u52A8\u6536\u7F29\uFF1B
- \u53F3\u4FA7\u8BE6\u60C5\u6539\u4E3A\u8986\u76D6\u5F0F\u9762\u677F\uFF1B
- \u4F7F\u7528\u624B\u6307\u4E0A\u4E0B\u6ED1\u52A8\u8BE6\u60C5\u5185\u5BB9\uFF1B
- 3D \u6A21\u5F0F\u5BF9\u624B\u673A\u6027\u80FD\u8981\u6C42\u8F83\u9AD8\uFF0C\u5361\u987F\u65F6\u5207\u56DE\u5B9E\u666F\uFF1B
- \u7B2C\u4E00\u4EBA\u79F0\u5DE1\u573A\u4E3B\u8981\u9762\u5411\u952E\u9F20\u684C\u9762\u7AEF\uFF1B
- \u624B\u673A\u6D4F\u89C8\u5668\u5237\u8138\u767B\u5F55\u65F6\u8BF7\u9009\u62E9\u524D\u7F6E\u6444\u50CF\u5934\u5E76\u4FDD\u6301\u7AD6\u5C4F\u7A33\u5B9A\u3002

---

## 16. \u63A8\u8350\u6F14\u793A\u6D41\u7A0B

\u4EE5\u4E0B\u6D41\u7A0B\u9002\u5408\u7B54\u8FA9\u3001\u5BA2\u6237\u6F14\u793A\u548C\u9A8C\u6536\uFF0C\u7EA6 8\u201412 \u5206\u949F\uFF1A

1. \u4ECE\u5B98\u7F51\u9996\u9875\u4ECB\u7ECD\u4EA7\u54C1\u5B9A\u4F4D\uFF1B
2. \u6253\u5F00\u4EA7\u54C1\u3001\u89E3\u51B3\u65B9\u6848\u548C\u6570\u5B57\u5B6A\u751F\u9875\u9762\uFF1B
3. \u6CE8\u518C\u4E00\u4E2A\u65B0\u8D26\u53F7\uFF1B
4. \u7ED1\u5B9A\u4EBA\u8138\u5E76\u8FDB\u5165\u5E73\u53F0\uFF1B
5. \u5C55\u793A\u822A\u62CD\u5B9E\u666F\u5BF9\u8C61\u60AC\u505C\u3001\u5355\u51FB\u548C\u53CC\u51FB\uFF1B
6. \u5207\u6362 3D\uFF0C\u5C55\u793A\u516D\u5EA7\u4E0D\u540C\u4F5C\u7269\u6E29\u5BA4\uFF1B
7. \u8FDB\u5165\u7B2C\u4E00\u4EBA\u79F0\u5DE1\u573A\u5E76\u7528\u6570\u5B57\u952E\u5207\u6362\u4E1A\u52A1\uFF1B
8. \u6253\u5F00\u8BBE\u5907\u4E2D\u5FC3\uFF0C\u63A7\u5236\u5728\u7EBF\u8BBE\u5907\u5E76\u6267\u884C\u81EA\u68C0\uFF1B
9. \u6253\u5F00\u704C\u6E89\u4E2D\u5FC3\uFF0C\u8C03\u6574\u65F6\u957F\u5E76\u4FDD\u5B58\uFF1B
10. \u6253\u5F00\u544A\u8B66\u4E2D\u5FC3\u5E76\u5904\u7406\u4E00\u6761\u544A\u8B66\uFF1B
11. \u8BA9\u201C\u5C0F\u7530\u201D\u5206\u6790\u5F53\u524D\u5F02\u5E38\uFF1B
12. \u53CC\u51FB 5 \u53F7\u5927\u68DA\u8FDB\u5165\u68DA\u5185\uFF1B
13. \u5207\u6362\u68DA\u5185\u5B9E\u666F\u548C\u6570\u5B57\u5B6A\u751F\uFF1B
14. \u5728\u690D\u682A\u9762\u677F\u9009\u62E9 \`P-03\`\uFF0C\u5C55\u793A\u690D\u682A\u7EA7\u5B9A\u4F4D\u548C\u6307\u6807\uFF1B
15. \u8FD4\u56DE\u519C\u573A\u5E76\u6253\u5F00\u72EC\u7ACB\u667A\u80FD\u95EE\u519C\u5DE5\u4F5C\u53F0\uFF1B
16. \u9000\u51FA\u767B\u5F55\uFF0C\u518D\u4F7F\u7528\u6444\u50CF\u5934\u5237\u8138\u767B\u5F55\u3002

---

## 17. \u5E38\u89C1\u95EE\u9898

### 17.1 \u9875\u9762\u6253\u4E0D\u5F00

- \u786E\u8BA4\u5730\u5740\u4E3A \`http://localhost:8081/\`\uFF1B
- \u786E\u8BA4\u540E\u7AEF\u5DF2\u7ECF\u542F\u52A8\uFF1B
- \u5982\u679C\u65E5\u5FD7\u51FA\u73B0\u201C\u5730\u5740\u5DF2\u5728\u4F7F\u7528\u201D\uFF0C\u8BF4\u660E\u5DF2\u6709\u5B9E\u4F8B\u5360\u7528 8081\uFF0C\u4E0D\u8981\u91CD\u590D\u542F\u52A8\uFF1B
- \u5F3A\u5236\u5237\u65B0\uFF1AWindows/Linux \u4F7F\u7528 \`Ctrl+F5\`\u3002

### 17.2 \u9875\u9762\u53EA\u6709\u5B98\u7F51\uFF0C\u8FDB\u5165\u4E0D\u4E86\u5E73\u53F0

- \u68C0\u67E5\u662F\u5426\u767B\u5F55\uFF1B
- \u68C0\u67E5\u6D4F\u89C8\u5668\u662F\u5426\u7981\u7528\u4E86\u672C\u5730\u5B58\u50A8\uFF1B
- \u91CD\u65B0\u8BBF\u95EE \`/#/sign-in\` \u767B\u5F55\u3002

### 17.3 3D \u9ED1\u5C4F\u6216\u6A21\u578B\u4E0D\u5B8C\u6574

- \u66F4\u65B0\u663E\u5361\u9A71\u52A8\uFF1B
- \u786E\u8BA4\u6D4F\u89C8\u5668\u5F00\u542F\u786C\u4EF6\u52A0\u901F\uFF1B
- \u68C0\u67E5\u6D4F\u89C8\u5668\u662F\u5426\u652F\u6301 WebGL 2\uFF1B
- \u5173\u95ED\u5176\u4ED6\u5360\u7528\u663E\u5B58\u7684\u8F6F\u4EF6\uFF1B
- \u5207\u56DE\u822A\u62CD\u5B9E\u666F\u7EE7\u7EED\u64CD\u4F5C\u3002

### 17.4 \u5927\u68DA\u53F3\u680F\u4E0D\u80FD\u6EDA\u52A8

- \u5C06\u9F20\u6807\u79FB\u5165\u53F3\u680F\u540E\u518D\u6EDA\u52A8\uFF1B
- \u4E0D\u8981\u5728\u4E2D\u592E 3D \u753B\u9762\u4E0A\u6EDA\u52A8\uFF1B
- \u624B\u673A\u4E0A\u76F4\u63A5\u5728\u53F3\u680F\u533A\u57DF\u4E0A\u4E0B\u6ED1\u52A8\uFF1B
- \u5F3A\u5236\u5237\u65B0\u4EE5\u786E\u4FDD\u52A0\u8F7D\u6700\u65B0 CSS\u3002

### 17.5 \u5B9E\u666F\u89C6\u9891\u4E0D\u64AD\u653E

- \u70B9\u51FB\u753B\u9762\u4E2D\u592E\u64AD\u653E\u6309\u94AE\uFF1B
- \u68C0\u67E5\u6D4F\u89C8\u5668\u81EA\u52A8\u64AD\u653E\u8BBE\u7F6E\uFF1B
- \u786E\u8BA4 \`greenhouse-monitor.mp4\` \u9759\u6001\u8D44\u6E90\u5B58\u5728\u3002

### 17.6 AI \u95EE\u519C\u5931\u8D25

- \u666E\u901A\u6570\u636E\u53F0\u529F\u80FD\u4E0D\u53D7\u5F71\u54CD\uFF1B
- \u8054\u7CFB\u7BA1\u7406\u5458\u914D\u7F6E DeepSeek Key\uFF1B
- \u68C0\u67E5\u670D\u52A1\u5668\u8054\u7F51\u72B6\u6001\u3002

### 17.7 \u8054\u7CFB\u8868\u5355\u53D1\u9001\u5931\u8D25

- \u68C0\u67E5\u7F51\u7EDC\uFF1B
- \u786E\u8BA4 FormSubmit \u5DF2\u5728\u6536\u4EF6\u90AE\u7BB1\u6FC0\u6D3B\uFF1B
- \u76F4\u63A5\u53D1\u9001\u90AE\u4EF6\u5230 \`1478838114@qq.com\`\u3002

---

## 18. \u6570\u636E\u548C\u5B89\u5168\u63D0\u793A

- \u6F14\u793A\u73AF\u5883\u6570\u636E\u4E0D\u4EE3\u8868\u771F\u5B9E\u519C\u4E1A\u751F\u4EA7\u53C2\u6570\uFF1B
- \u6267\u884C\u771F\u5B9E\u8BBE\u5907\u63A7\u5236\u524D\u5FC5\u987B\u589E\u52A0\u6743\u9650\u3001\u5BA1\u8BA1\u3001\u8054\u9501\u548C\u73B0\u573A\u6025\u505C\uFF1B
- \u4E0D\u8981\u5C06\u7BA1\u7406\u5458\u5BC6\u7801\u3001JWT \u5BC6\u94A5\u3001DeepSeek Key \u6216\u767E\u5EA6\u4EBA\u8138 Key \u544A\u8BC9\u666E\u901A\u7528\u6237\uFF1B
- \u5237\u8138\u529F\u80FD\u6D89\u53CA\u751F\u7269\u7279\u5F81\u6570\u636E\uFF0C\u6B63\u5F0F\u90E8\u7F72\u524D\u5E94\u53D6\u5F97\u7528\u6237\u6388\u6743\u5E76\u5236\u5B9A\u5220\u9664\u673A\u5236\uFF1B
- \u751F\u4EA7\u51B3\u7B56\u5E94\u7531\u519C\u4E1A\u4E13\u4E1A\u4EBA\u5458\u7ED3\u5408\u73B0\u573A\u60C5\u51B5\u786E\u8BA4\uFF0CAI \u5EFA\u8BAE\u4E0D\u80FD\u66FF\u4EE3\u4EBA\u5DE5\u8D23\u4EFB\u3002

---

## 19. \u622A\u56FE\u7D22\u5F15

| \u622A\u56FE | \u7528\u9014 |
|---|---|
| [\u5B98\u7F51.png](./\u622A\u56FE/\u5B98\u7F51.png) | \u5B98\u7F51\u9996\u9875\u3001\u4EA7\u54C1\u5BFC\u822A\u548C\u5E73\u53F0\u5165\u53E3 |
| [\u767B\u9646.png](./\u622A\u56FE/\u767B\u9646.png) | \u5BC6\u7801/\u5237\u8138\u767B\u5F55\u5207\u6362\u548C\u6CE8\u518C\u5165\u53E3 |
| [\u4E3B\u754C\u9762.png](./\u622A\u56FE/\u4E3B\u754C\u9762.png) | \u822A\u62CD\u5B9E\u666F\u6570\u636E\u5DE5\u4F5C\u53F0\u4E0E\u5BF9\u8C61\u8BE6\u60C5 |
| [3D.png](./\u622A\u56FE/3D.png) | 3D \u519C\u573A\u9E1F\u77B0\u548C\u5927\u68DA\u5165\u53E3 |
| [\u7B2C\u4E00\u4EBA\u79F0.png](./\u622A\u56FE/\u7B2C\u4E00\u4EBA\u79F0.png) | \u7B2C\u4E00\u4EBA\u79F0\u5DE1\u573A\u548C\u5FEB\u6377\u952E\u63D0\u793A |
| [\u95EE\u519C.png](./\u622A\u56FE/\u95EE\u519C.png) | \u72EC\u7ACB\u667A\u80FD\u95EE\u519C\u9996\u9875 |
| [\u81EA\u5B9A\u4E49\u5DE5\u4F5C\u53F0.png](./\u622A\u56FE/\u81EA\u5B9A\u4E49\u5DE5\u4F5C\u53F0.png) | \u53EF\u7F16\u8F91\u7684 AI \u6570\u636E\u5DE5\u4F5C\u53F0 |
| [\u5927\u68DA\u5185\u90E8.png](./\u622A\u56FE/\u5927\u68DA\u5185\u90E8.png) | \u68DA\u5185\u6570\u5B57\u5B6A\u751F\u3001\u73AF\u5883\u6761\u548C\u6570\u636E\u4FA7\u680F |
`,Om=`# \u7530\u8A00\u8015\u667A\u667A\u6167\u519C\u4E1A\u5E73\u53F0\u6280\u672F\u8BF4\u660E\u624B\u518C

> \u6587\u6863\u7248\u672C\uFF1A1.0  
> \u7F16\u5236\u65E5\u671F\uFF1A2026-08-05  
> \u9002\u7528\u9879\u76EE\uFF1A\u7530\u8A00\u8015\u667A\uFF08ty\uFF09  
> \u8BFB\u8005\uFF1A\u5F00\u53D1\u3001\u6D4B\u8BD5\u3001\u90E8\u7F72\u3001\u8FD0\u7EF4\u3001\u7B97\u6CD5\u4E0E\u673A\u5668\u4EBA\u96C6\u6210\u4EBA\u5458

## 1. \u6587\u6863\u76EE\u7684\u4E0E\u8FB9\u754C

\u672C\u6587\u8BF4\u660E\u9879\u76EE\u7684\u7CFB\u7EDF\u67B6\u6784\u3001\u6E90\u7801\u7EC4\u7EC7\u3001\u90E8\u7F72\u914D\u7F6E\u3001\u6570\u636E\u6A21\u578B\u3001\u63A5\u53E3\u3001\u6D4B\u8BD5\u65B9\u6CD5\uFF0C\u4EE5\u53CA\u89C6\u89C9\u8BC6\u522B\u548C\u6E29\u5BA4\u5B9E\u666F\u5EFA\u56FE\u7684\u6F14\u8FDB\u65B9\u6848\u3002

\u6587\u4E2D\u80FD\u529B\u5206\u4E3A\u4E24\u7C7B\uFF1A

- **\u5F53\u524D\u5DF2\u5B9E\u73B0**\uFF1A\u4ED3\u5E93\u4E2D\u5DF2\u6709\u4EE3\u7801\u3001\u8D44\u6E90\u6216\u63A5\u53E3\uFF0C\u53EF\u6309\u672C\u6587\u6B65\u9AA4\u8FD0\u884C\u548C\u9A8C\u8BC1\u3002
- **\u89C4\u5212\u63A5\u5165**\uFF1ALingBot-Map\u3001\u673A\u5668\u4EBA\u5BFC\u822A\u3001NVIDIA LocateAnything \u7B49\u540E\u7EED\u65B9\u6848\u3002\u5B83\u4EEC\u5C1A\u4E0D\u80FD\u88AB\u63CF\u8FF0\u4E3A\u5F53\u524D\u751F\u4EA7\u80FD\u529B\u3002

\u7528\u6237\u64CD\u4F5C\u8BF7\u914D\u5408\u9605\u8BFB[\u300A\u7528\u6237\u4F7F\u7528\u624B\u518C\u300B](./\u7528\u6237\u4F7F\u7528\u624B\u518C.md)\u3002

## 2. \u7CFB\u7EDF\u6982\u89C8

\u7530\u8A00\u8015\u667A\u662F\u4E00\u4E2A\u5305\u542B\u5B98\u7F51\u3001\u8EAB\u4EFD\u8BA4\u8BC1\u3001\u519C\u573A\u6570\u5B57\u5B6A\u751F\u3001\u6E29\u5BA4\u5185\u90E8\u53EF\u89C6\u5316\u3001\u8BBE\u5907\u63A7\u5236\u3001\u704C\u6E89\u7BA1\u7406\u3001\u544A\u8B66\u7BA1\u7406\u548C AI \u95EE\u519C\u7684\u5168\u6808\u7CFB\u7EDF\u3002

\`\`\`mermaid
flowchart LR
    U[\u6D4F\u89C8\u5668\u7528\u6237] --> L[React \u5B98\u7F51\u4E0E\u8BA4\u8BC1]
    U --> V[Vue \u6570\u636E\u5DE5\u4F5C\u53F0]
    L --> B[Spring Boot API]
    V --> B
    V --> T[Three.js \u6570\u5B57\u5B6A\u751F]
    B --> M[(MySQL)]
    B --> D[DeepSeek API]
    B --> F[\u767E\u5EA6\u4EBA\u8138 API]
    Y[YOLO + ByteTrack \u79BB\u7EBF\u5DE5\u5177] --> J[\u9010\u5E27\u68C0\u6D4B JSON]
    J --> V
\`\`\`

### 2.1 \u6280\u672F\u6808

| \u5C42\u6B21 | \u6280\u672F | \u4E3B\u8981\u7528\u9014 |
|---|---|---|
| \u5B98\u7F51 | React 18\u3001Vite | \u4EA7\u54C1\u4ECB\u7ECD\u3001\u8054\u7CFB\u3001\u6CE8\u518C\u548C\u767B\u5F55 |
| \u6570\u636E\u5E73\u53F0 | Vue 3\u3001TypeScript\u3001Vite | \u519C\u573A\u5DE5\u4F5C\u53F0\u4E0E\u6E29\u5BA4\u5185\u90E8\u9875\u9762 |
| 3D | Three.js 0.152.x | \u519C\u573A\u53CA\u6E29\u5BA4\u6570\u5B57\u5B6A\u751F\u573A\u666F |
| \u540E\u7AEF | Java 17\u3001Spring Boot 4.1 | REST API\u3001\u4E1A\u52A1\u903B\u8F91\u4E0E\u5B89\u5168\u63A7\u5236 |
| \u6570\u636E\u5E93 | MySQL 8.x\u3001Spring Data JPA | \u7528\u6237\u3001\u8BBE\u5907\u3001\u73AF\u5883\u3001\u544A\u8B66\u548C\u72B6\u6001\u6301\u4E45\u5316 |
| \u9274\u6743 | JWT\u3001Spring Security | \u65E0\u72B6\u6001\u8EAB\u4EFD\u8BA4\u8BC1\u548C\u63A5\u53E3\u4FDD\u62A4 |
| AI \u95EE\u519C | DeepSeek \u517C\u5BB9 API | \u519C\u4E1A\u95EE\u7B54\u548C\u4E0A\u4E0B\u6587\u54CD\u5E94 |
| \u4EBA\u8138\u80FD\u529B | \u767E\u5EA6\u667A\u80FD\u4E91\u4EBA\u8138 API | \u4EBA\u8138\u6CE8\u518C\u3001\u68C0\u7D22\u548C\u767B\u5F55 |
| \u76D1\u63A7\u8BC6\u522B | Ultralytics YOLO\u3001ByteTrack | \u79BB\u7EBF\u89C6\u9891\u68C0\u6D4B\u3001\u8DE8\u5E27\u76EE\u6807 ID |

## 3. \u5F53\u524D\u80FD\u529B\u6E05\u5355

### 3.1 \u5DF2\u5B9E\u73B0

- \u5B98\u7F51\u3001\u4EA7\u54C1\u3001\u89E3\u51B3\u65B9\u6848\u3001\u6570\u5B57\u5B6A\u751F\u3001\u5173\u4E8E\u548C\u8054\u7CFB\u9875\u9762\uFF1B
- \u90AE\u7BB1\u5BC6\u7801\u6CE8\u518C\u4E0E\u767B\u5F55\uFF1B
- \u6CE8\u518C\u540E\u53EF\u9009\u4EBA\u8138\u7ED1\u5B9A\u3001\u6444\u50CF\u5934\u5237\u8138\u767B\u5F55\u3001\u4EBA\u8138\u89E3\u7ED1\uFF1B
- JWT \u4F1A\u8BDD\u53CA\u5F53\u524D\u7528\u6237\u67E5\u8BE2\uFF1B
- \u519C\u573A\u603B\u89C8\u3001\u73AF\u5883\u6570\u636E\u3001\u8BBE\u5907\u72B6\u6001\u3001\u704C\u6E89\u3001\u544A\u8B66\uFF1B
- \u9E1F\u77B0\u30013D \u548C\u7B2C\u4E00\u4EBA\u79F0\u519C\u573A\u573A\u666F\uFF1B
- \u8BBE\u5907\u3001\u704C\u6E89\u548C\u544A\u8B66\u7684\u4EA4\u4E92\u5F0F\u63A7\u5236\uFF1B
- AI \u95EE\u519C\u548C\u7528\u6237\u52A9\u624B\u72B6\u6001\u4FDD\u5B58\uFF1B
- \u5927\u68DA\u8BE6\u60C5\u5165\u53E3\u53CA\u53CC\u51FB 3D \u5927\u68DA\u8FDB\u5165\uFF1B
- \u516D\u5EA7\u5927\u68DA\u7684\u5DEE\u5F02\u5316\u4F5C\u7269\u3001\u6A21\u578B\u3001\u8BBE\u5907\u548C\u533A\u57DF\u4FE1\u606F\uFF1B
- \u6E29\u5BA4\u5185\u90E8\u6570\u5B57\u5B6A\u751F\u4E0E\u5B9E\u666F\u89C6\u9891\u5207\u6362\uFF1B
- YOLO + ByteTrack \u79BB\u7EBF\u76D1\u63A7\u68C0\u6D4B\u7ED3\u679C\u53E0\u52A0\u3002

### 3.2 \u89C4\u5212\u4E2D

- LingBot-Map \u5355\u76EE\u89C6\u9891/\u56FE\u7247\u6D41\u4E09\u7EF4\u91CD\u5EFA\uFF1B
- \u91CD\u5EFA\u7ED3\u679C\u5411\u673A\u5668\u4EBA\u5360\u636E\u5730\u56FE\u548C\u5BFC\u822A\u5750\u6807\u7CFB\u8F6C\u6362\uFF1B
- \u5728\u7EBF\u76F8\u673A\u6D41\u3001\u8FB9\u7F18\u63A8\u7406\u670D\u52A1\u548C\u5B9E\u65F6\u68C0\u6D4B\u6D88\u606F\u901A\u9053\uFF1B
- NVIDIA LocateAnything \u5F00\u653E\u8BCD\u6C47\u5B9A\u4F4D\uFF1B
- \u591A\u79DF\u6237\u3001\u751F\u4EA7\u7EA7\u5BF9\u8C61\u5B58\u50A8\u3001\u53EF\u89C2\u6D4B\u6027\u548C\u9AD8\u53EF\u7528\u90E8\u7F72\u3002

## 4. \u6E90\u7801\u4E0E\u6784\u5EFA\u4EA7\u7269

\`\`\`text
ty/
\u251C\u2500\u2500 landing/                         React \u5B98\u7F51\u6E90\u7801
\u251C\u2500\u2500 frontend/                        Vue \u6570\u636E\u5E73\u53F0\u6E90\u7801
\u251C\u2500\u2500 src/main/java/com/example/ty/    Spring Boot \u540E\u7AEF
\u2502   \u251C\u2500\u2500 auth/                        \u8BA4\u8BC1\u3001\u4EBA\u8138\u548C JWT
\u2502   \u251C\u2500\u2500 dashboard/                   \u519C\u573A\u4E0E\u6E29\u5BA4\u4E1A\u52A1
\u2502   \u2514\u2500\u2500 assistant/                   AI \u95EE\u519C\u53CA\u72B6\u6001
\u251C\u2500\u2500 src/main/resources/
\u2502   \u251C\u2500\u2500 application.yaml             \u670D\u52A1\u914D\u7F6E
\u2502   \u2514\u2500\u2500 static/                      \u5DF2\u6784\u5EFA\u7684\u524D\u7AEF\u8D44\u6E90
\u2502       \u2514\u2500\u2500 platform/                Vue \u5E73\u53F0\u6784\u5EFA\u4EA7\u7269
\u251C\u2500\u2500 src/test/                         \u540E\u7AEF\u6D4B\u8BD5
\u251C\u2500\u2500 tools/yolo/                       YOLO \u6570\u636E\u3001\u8BAD\u7EC3\u548C\u5BFC\u51FA\u5DE5\u5177
\u251C\u2500\u2500 docs/                             \u56FE\u7247\u3001\u89C6\u9891\u548C\u9879\u76EE\u6587\u6863
\u251C\u2500\u2500 pom.xml                           Maven \u914D\u7F6E
\u251C\u2500\u2500 start.sh                          \u542F\u52A8\u8F85\u52A9\u811A\u672C
\u2514\u2500\u2500 setup-mysql.sh                    MySQL \u521D\u59CB\u5316\u8F85\u52A9\u811A\u672C
\`\`\`

\u6CE8\u610F\uFF1A\`landing/\` \u548C \`frontend/\` \u662F\u6E90\u4EE3\u7801\uFF1B\`src/main/resources/static/\` \u662F\u6784\u5EFA\u4EA7\u7269\u3002\u4FEE\u6539\u6E90\u4EE3\u7801\u540E\u5FC5\u987B\u91CD\u65B0\u6784\u5EFA\uFF0C\u4E0D\u80FD\u53EA\u7F16\u8F91\u6784\u5EFA\u540E\u7684\u538B\u7F29\u6587\u4EF6\u3002

## 5. \u73AF\u5883\u51C6\u5907

### 5.1 \u6700\u4F4E\u8F6F\u4EF6\u8981\u6C42

- JDK 17\uFF1B
- MySQL 8.x\uFF1B
- Node.js 18 \u6216\u66F4\u9AD8\u7248\u672C\u53CA npm\uFF1B
- Git\uFF1B
- \u652F\u6301 WebGL \u7684\u73B0\u4EE3\u6D4F\u89C8\u5668\u3002

\u8FD0\u884C YOLO \u5DE5\u5177\u65F6\u8FD8\u9700\u8981 Python 3\u3001\u865A\u62DF\u73AF\u5883\u548C\u5BF9\u5E94\u7684 PyTorch/Ultralytics \u4F9D\u8D56\u3002\u4F7F\u7528 CUDA \u65F6\uFF0C\u5E94\u5148\u786E\u8BA4 NVIDIA \u9A71\u52A8\u548C \`nvidia-smi\` \u6B63\u5E38\u3002

### 5.2 \u6570\u636E\u5E93

\u9ED8\u8BA4\u914D\u7F6E\u8FDE\u63A5\uFF1A

\`\`\`text
jdbc:mysql://localhost:3306/tianyan
\u7528\u6237\u540D\uFF1Aroot
\u5BC6\u7801\uFF1ARoot_123456
\`\`\`

\u63A8\u8350\u901A\u8FC7\u73AF\u5883\u53D8\u91CF\u8986\u76D6\u9ED8\u8BA4\u503C\uFF1A

\`\`\`bash
export DB_URL='jdbc:mysql://127.0.0.1:3306/tianyan?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai'
export DB_USERNAME='tianyan_app'
export DB_PASSWORD='\u8BF7\u4F7F\u7528\u72EC\u7ACB\u5F3A\u5BC6\u7801'
\`\`\`

\u53EF\u6267\u884C\u9879\u76EE\u811A\u672C\u521D\u59CB\u5316\u6570\u636E\u5E93\uFF1A

\`\`\`bash
./setup-mysql.sh
\`\`\`

\u751F\u4EA7\u73AF\u5883\u5E94\u4E3A\u5E94\u7528\u5EFA\u7ACB\u6700\u5C0F\u6743\u9650\u6570\u636E\u5E93\u8D26\u53F7\uFF0C\u4E0D\u5E94\u7EE7\u7EED\u4F7F\u7528 \`root\`\u3002

### 5.3 \u540E\u7AEF\u73AF\u5883\u53D8\u91CF

| \u53D8\u91CF | \u5FC5\u9700\u6027 | \u8BF4\u660E |
|---|---|---|
| \`SERVER_PORT\` | \u53EF\u9009 | \u9ED8\u8BA4 8081 |
| \`DB_URL\` | \u5EFA\u8BAE\u663E\u5F0F\u8BBE\u7F6E | JDBC \u5730\u5740 |
| \`DB_USERNAME\` | \u5EFA\u8BAE\u663E\u5F0F\u8BBE\u7F6E | \u6570\u636E\u5E93\u7528\u6237 |
| \`DB_PASSWORD\` | \u5EFA\u8BAE\u663E\u5F0F\u8BBE\u7F6E | \u6570\u636E\u5E93\u5BC6\u7801 |
| \`JWT_SECRET\` | \u751F\u4EA7\u5FC5\u9700 | JWT \u7B7E\u540D\u5BC6\u94A5\uFF0C\u81F3\u5C11 32 \u5B57\u8282\u968F\u673A\u503C |
| \`BAIDU_FACE_AK\` | \u4F7F\u7528\u4EBA\u8138\u65F6\u5FC5\u9700 | \u767E\u5EA6\u4EBA\u8138 Access Key |
| \`BAIDU_FACE_SK\` | \u4F7F\u7528\u4EBA\u8138\u65F6\u5FC5\u9700 | \u767E\u5EA6\u4EBA\u8138 Secret Key |
| \`DEEPSEEK_API_KEY\` | \u4F7F\u7528 AI \u65F6\u5FC5\u9700 | \u6A21\u578B API \u5BC6\u94A5 |
| \`DEEPSEEK_BASE_URL\` | \u53EF\u9009 | DeepSeek \u517C\u5BB9\u63A5\u53E3\u5730\u5740 |
| \`DEEPSEEK_MODEL\` | \u53EF\u9009 | \u6A21\u578B\u540D\u79F0 |

\u4E0D\u8981\u628A\u771F\u5B9E\u5BC6\u94A5\u5199\u5165 Git\u3002\u5F00\u53D1\u73AF\u5883\u53EF\u4F7F\u7528 IDE \u73AF\u5883\u53D8\u91CF\u6216\u672A\u8DDF\u8E2A\u7684\u672C\u5730\u542F\u52A8\u914D\u7F6E\uFF1B\u751F\u4EA7\u73AF\u5883\u4F7F\u7528 Secret \u7BA1\u7406\u670D\u52A1\u3002

## 6. \u6784\u5EFA\u4E0E\u542F\u52A8

### 6.1 \u6784\u5EFA\u5B98\u7F51

\`\`\`bash
cd landing
npm install
npm run build
\`\`\`

\u6784\u5EFA\u8F93\u51FA\u5E94\u8FDB\u5165 Spring Boot \u9759\u6001\u8D44\u6E90\u76EE\u5F55\u3002\u5B8C\u6210\u540E\u8FD4\u56DE\u4ED3\u5E93\u6839\u76EE\u5F55\u3002

### 6.2 \u6784\u5EFA Vue \u6570\u636E\u5E73\u53F0

\`\`\`bash
cd frontend
npm install
npm run build
\`\`\`

\u8F93\u51FA\u76EE\u6807\u4E3A \`src/main/resources/static/platform/\`\u3002\u6587\u4EF6\u540D\u5E26\u5185\u5BB9\u54C8\u5E0C\uFF0C\u91CD\u65B0\u6784\u5EFA\u540E\u65E7\u6587\u4EF6\u540D\u53D8\u5316\u662F\u6B63\u5E38\u73B0\u8C61\u3002

### 6.3 \u6D4B\u8BD5\u548C\u542F\u52A8\u540E\u7AEF

\`\`\`bash
./mvnw test
./mvnw spring-boot:run
\`\`\`

\u6D4F\u89C8\u5668\u8BBF\u95EE\uFF1A

\`\`\`text
http://localhost:8081/
\`\`\`

\u4E5F\u53EF\u4EE5\u4F7F\u7528\u9879\u76EE\u7684\u7EC4\u5408\u542F\u52A8\u811A\u672C\uFF1A

\`\`\`bash
./start.sh
\`\`\`

### 6.4 \u63A8\u8350\u6784\u5EFA\u987A\u5E8F

1. \u68C0\u67E5 MySQL \u662F\u5426\u8FD0\u884C\uFF1B
2. \u914D\u7F6E\u6570\u636E\u5E93\u3001JWT\u3001\u767E\u5EA6\u4EBA\u8138\u548C DeepSeek \u73AF\u5883\u53D8\u91CF\uFF1B
3. \u6784\u5EFA React \u5B98\u7F51\uFF1B
4. \u6784\u5EFA Vue \u6570\u636E\u5E73\u53F0\uFF1B
5. \u6267\u884C Maven \u6D4B\u8BD5\uFF1B
6. \u542F\u52A8 Spring Boot\uFF1B
7. \u5B8C\u6210\u6CE8\u518C\u3001\u767B\u5F55\u3001\u5DE5\u4F5C\u53F0\u3001\u6E29\u5BA4\u548C API \u5192\u70DF\u6D4B\u8BD5\u3002

## 7. \u524D\u7AEF\u8DEF\u7531\u4E0E\u9875\u9762\u534F\u4F5C

### 7.1 \u5B98\u7F51\u8DEF\u7531

\u5B98\u7F51\u4F7F\u7528 HashRouter\uFF0C\u4E3B\u8981\u5730\u5740\u4E3A\uFF1A

| \u5730\u5740 | \u9875\u9762 |
|---|---|
| \`/#/\` | \u5B98\u7F51\u9996\u9875 |
| \`/#/product\` | \u4EA7\u54C1 |
| \`/#/solutions\` | \u89E3\u51B3\u65B9\u6848 |
| \`/#/digital-twin\` | \u6570\u5B57\u5B6A\u751F\u4ECB\u7ECD |
| \`/#/about\` | \u5173\u4E8E |
| \`/#/contact\` | \u8054\u7CFB\u6211\u4EEC |
| \`/#/sign-in\` | \u767B\u5F55 |
| \`/#/sign-up\` | \u6CE8\u518C |

### 7.2 \u6570\u636E\u5E73\u53F0\u8DEF\u7531

| \u5730\u5740 | \u9875\u9762 |
|---|---|
| \`/platform/workspaces/farm-01\` | \u519C\u573A\u6570\u636E\u5DE5\u4F5C\u53F0 |
| \`/platform/assistant\` | AI \u95EE\u519C |
| \`/platform/workspaces/:id/greenhouses/:greenhouseId\` | \u6E29\u5BA4\u5185\u90E8 |
| \`/platform/digital-twin\` | \u6570\u5B57\u5B6A\u751F\u5165\u53E3 |

Spring Boot \u5FC5\u987B\u5BF9 Vue \u5386\u53F2\u8DEF\u7531\u6267\u884C\u524D\u7AEF\u56DE\u9000\uFF0C\u5426\u5219\u76F4\u63A5\u5237\u65B0\u6DF1\u5C42 URL \u4F1A\u51FA\u73B0 404\u3002

### 7.3 \u72B6\u6001\u6D41

1. \u5B98\u7F51\u767B\u5F55\u63A5\u53E3\u8FD4\u56DE JWT \u548C\u7528\u6237\u4FE1\u606F\uFF1B
2. \u6D4F\u89C8\u5668\u4FDD\u5B58\u4F1A\u8BDD\uFF1B
3. Vue \u5E73\u53F0\u8BF7\u6C42\u65F6\u9644\u52A0 \`Authorization: Bearer <token>\`\uFF1B
4. Spring Security \u9A8C\u8BC1 JWT \u540E\u628A\u7528\u6237\u8EAB\u4EFD\u653E\u5165\u5B89\u5168\u4E0A\u4E0B\u6587\uFF1B
5. Dashboard \u548C Assistant \u670D\u52A1\u6839\u636E\u8EAB\u4EFD\u53CA \`farmId\` \u8FD4\u56DE\u6570\u636E\uFF1B
6. Three.js \u53EA\u8D1F\u8D23\u53EF\u89C6\u5316\uFF0C\u4E0D\u5E94\u6210\u4E3A\u4E1A\u52A1\u6570\u636E\u7684\u552F\u4E00\u6765\u6E90\u3002

### 7.4 \u5F53\u524D\u754C\u9762\u5B9E\u73B0\u57FA\u7EBF

\u4EE5\u4E0B\u622A\u56FE\u6765\u81EA\u5F53\u524D\u4ED3\u5E93\u5BF9\u5E94\u7248\u672C\uFF0C\u7528\u4E8E\u5F00\u53D1\u8054\u8C03\u3001\u89C6\u89C9\u56DE\u5F52\u548C\u9A8C\u6536\u3002\u540E\u7EED\u4FEE\u6539\u5E03\u5C40\u65F6\uFF0C\u5E94\u786E\u4FDD\u8DEF\u7531\u3001\u6838\u5FC3\u5165\u53E3\u548C\u6570\u636E\u5173\u7CFB\u4FDD\u6301\u4E00\u81F4\u3002

![\u5B98\u7F51\u5B9E\u73B0\u57FA\u7EBF](./\u622A\u56FE/\u5B98\u7F51.png)

> **\u56FE 7-1\u3000React \u5B98\u7F51\u57FA\u7EBF\u3002** \u5B98\u7F51\u8D1F\u8D23\u4EA7\u54C1\u4FE1\u606F\u548C\u8EAB\u4EFD\u5165\u53E3\uFF0C\u4E0D\u627F\u8F7D\u767B\u5F55\u540E\u7684\u519C\u573A\u4E1A\u52A1\u72B6\u6001\u3002

![\u822A\u62CD\u5DE5\u4F5C\u53F0\u5B9E\u73B0\u57FA\u7EBF](./\u622A\u56FE/\u4E3B\u754C\u9762.png)

> **\u56FE 7-2\u3000Vue \u822A\u62CD\u5DE5\u4F5C\u53F0\u57FA\u7EBF\u3002** \u7A7A\u95F4\u5BF9\u8C61\u3001\u53F3\u4FA7\u4E0A\u4E0B\u6587\u62BD\u5C49\u548C\u5E95\u90E8\u4E1A\u52A1 Dock \u5171\u4EAB\u5DE5\u4F5C\u533A\u72B6\u6001\uFF1B\u9009\u4E2D\u5BF9\u8C61\u540E\uFF0C\u5730\u56FE\u9AD8\u4EAE\u4E0E\u8BE6\u60C5\u6570\u636E\u5FC5\u987B\u6307\u5411\u76F8\u540C\u4E1A\u52A1 ID\u3002

![\u81EA\u5B9A\u4E49\u5DE5\u4F5C\u53F0\u5B9E\u73B0\u57FA\u7EBF](./\u622A\u56FE/\u81EA\u5B9A\u4E49\u5DE5\u4F5C\u53F0.png)

> **\u56FE 7-3\u3000AI \u81EA\u5B9A\u4E49\u5DE5\u4F5C\u53F0\u57FA\u7EBF\u3002** \u544A\u8B66\u3001\u704C\u6E89\u3001\u5927\u68DA\u548C\u6307\u6807\u7EC4\u4EF6\u8BFB\u53D6\u7EDF\u4E00 Dashboard \u6570\u636E\uFF1B\u7528\u6237\u5E03\u5C40\u4E0E\u52A9\u624B\u72B6\u6001\u901A\u8FC7\u5F53\u524D\u8D26\u53F7\u9694\u79BB\u4FDD\u5B58\u3002

## 8. \u540E\u7AEF\u6A21\u5757

### 8.1 \u8BA4\u8BC1\u6A21\u5757

\u8BA4\u8BC1\u6A21\u5757\u8D1F\u8D23\u7528\u6237\u6CE8\u518C\u3001\u5BC6\u7801\u54C8\u5E0C\u3001\u767B\u5F55\u3001JWT \u7B7E\u53D1\u548C\u5F53\u524D\u7528\u6237\u67E5\u8BE2\u3002\u5BC6\u7801\u5FC5\u987B\u53EA\u5B58\u50A8\u54C8\u5E0C\uFF0CAPI \u54CD\u5E94\u4E0D\u5F97\u8FD4\u56DE\u5BC6\u7801\u5B57\u6BB5\u3002

![\u8BA4\u8BC1\u9875\u9762\u5B9E\u73B0\u57FA\u7EBF](./\u622A\u56FE/\u767B\u9646.png)

> **\u56FE 8-1\u3000\u8BA4\u8BC1\u9875\u9762\u57FA\u7EBF\u3002** \u5BC6\u7801\u767B\u5F55\u548C\u5237\u8138\u767B\u5F55\u5171\u7528\u9875\u9762\u5BB9\u5668\u4F46\u4F7F\u7528\u72EC\u7ACB\u63D0\u4EA4\u94FE\u8DEF\uFF1B\u6CE8\u518C\u5165\u53E3\u5FC5\u987B\u59CB\u7EC8\u53EF\u89C1\uFF0C\u5237\u8138\u6A21\u5F0F\u4E0D\u5F97\u51FA\u73B0\u672C\u5730\u56FE\u7247\u4E0A\u4F20\u63A7\u4EF6\u3002

\u4EBA\u8138\u6D41\u7A0B\uFF1A\u6D4F\u89C8\u5668\u6444\u50CF\u5934\u91C7\u96C6\u56FE\u50CF \u2192 \u540E\u7AEF\u6821\u9A8C \u2192 \u767E\u5EA6\u4EBA\u8138\u7EC4\u6CE8\u518C\u6216\u68C0\u7D22 \u2192 \u7ED1\u5B9A\u6216\u7B7E\u53D1\u767B\u5F55\u4EE4\u724C\u3002\u5F53\u524D\u4EA7\u54C1\u5DF2\u7981\u6B62\u4ECE\u672C\u5730\u4E0A\u4F20\u56FE\u7247\u8FDB\u884C\u5237\u8138\u767B\u5F55\uFF0C\u76EE\u7684\u662F\u964D\u4F4E\u7167\u7247\u66FF\u4EE3\u771F\u4EBA\u91C7\u96C6\u7684\u98CE\u9669\u3002\u4F46\u8FD9\u4E0D\u7B49\u540C\u4E8E\u5B8C\u6574\u6D3B\u4F53\u68C0\u6D4B\uFF1B\u751F\u4EA7\u73AF\u5883\u4ECD\u5E94\u589E\u52A0\u52A8\u4F5C\u6D3B\u4F53\u3001\u9759\u9ED8\u6D3B\u4F53\u3001\u91CD\u653E\u9632\u62A4\u3001\u9650\u6D41\u548C\u5BA1\u8BA1\u3002

### 8.2 Dashboard \u6A21\u5757

\u8BE5\u6A21\u5757\u805A\u5408\u519C\u573A\u8D44\u4EA7\u3001\u73AF\u5883\u6307\u6807\u3001\u8BBE\u5907\u3001\u704C\u6E89\u5355\u5143\u548C\u544A\u8B66\uFF0C\u5E76\u751F\u6210\u5DEE\u5F02\u5316\u6E29\u5BA4\u8BE6\u60C5\u3002\u5199\u64CD\u4F5C\u7531\u670D\u52A1\u5C42\u6821\u9A8C\u5B9E\u4F53\u662F\u5426\u5C5E\u4E8E\u8BF7\u6C42\u4E2D\u7684\u519C\u573A\uFF0C\u907F\u514D\u8DE8\u519C\u573A\u4FEE\u6539\u3002

### 8.3 Assistant \u6A21\u5757

AI \u95EE\u519C\u63A5\u6536\u5386\u53F2\u6D88\u606F\u4E0E\u53EF\u9009\u573A\u666F\u4E0A\u4E0B\u6587\uFF0C\u8C03\u7528\u517C\u5BB9\u7684\u6A21\u578B\u63A5\u53E3\u5E76\u8FD4\u56DE\u6587\u672C\u3002\u7528\u6237\u52A9\u624B\u72B6\u6001\u5355\u72EC\u6301\u4E45\u5316\uFF0C\u7528\u4E8E\u4FDD\u7559\u754C\u9762\u914D\u7F6E\u6216\u4F1A\u8BDD\u76F8\u5173\u72B6\u6001\u3002

![\u667A\u80FD\u95EE\u519C\u5B9E\u73B0\u57FA\u7EBF](./\u622A\u56FE/\u95EE\u519C.png)

> **\u56FE 8-2\u3000\u667A\u80FD\u95EE\u519C\u57FA\u7EBF\u3002** \u5BF9\u8BDD\u5217\u8868\u3001\u8F93\u5165\u533A\u3001\u5FEB\u6377\u95EE\u9898\u548C\u5E94\u7528 Dock \u5C5E\u4E8E\u7528\u6237\u72B6\u6001\uFF1B\u6A21\u578B\u56DE\u7B54\u6765\u81EA\u540E\u7AEF\u63A5\u53E3\uFF0C\u524D\u7AEF\u4E0D\u5F97\u7528\u9759\u6001\u6210\u529F\u5185\u5BB9\u63A9\u76D6\u4E0A\u6E38\u8C03\u7528\u5931\u8D25\u3002

\u751F\u4EA7\u73AF\u5883\u9700\u8981\uFF1A\u8F93\u5165\u957F\u5EA6\u9650\u5236\u3001\u8D85\u65F6\u3001\u91CD\u8BD5\u4E0A\u9650\u3001\u654F\u611F\u4FE1\u606F\u8FC7\u6EE4\u3001\u63D0\u793A\u6CE8\u5165\u9632\u62A4\u3001\u8C03\u7528\u5BA1\u8BA1\u548C\u8D39\u7528\u544A\u8B66\u3002

## 9. REST API

\u9664\u6CE8\u518C\u548C\u767B\u5F55\u7C7B\u63A5\u53E3\u5916\uFF0C\u4E1A\u52A1\u63A5\u53E3\u9ED8\u8BA4\u8981\u6C42 JWT\u3002

### 9.1 \u6CE8\u518C

\`\`\`http
POST /api/auth/register
Content-Type: application/json

{
  "name": "\u6F14\u793A\u7528\u6237",
  "email": "user@example.com",
  "password": "StrongPassword_2026!"
}
\`\`\`

\u6210\u529F\u54CD\u5E94\u5305\u542B \`token\` \u548C \`user\`\u3002\u90AE\u7BB1\u91CD\u590D\u3001\u53C2\u6570\u4E0D\u5408\u6CD5\u6216\u5BC6\u7801\u4E0D\u6EE1\u8DB3\u7EA6\u675F\u65F6\u5E94\u8FD4\u56DE 4xx\u3002

### 9.2 \u5BC6\u7801\u767B\u5F55

\`\`\`http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "StrongPassword_2026!"
}
\`\`\`

### 9.3 \u5F53\u524D\u7528\u6237

\`\`\`http
GET /api/auth/me
Authorization: Bearer <token>
\`\`\`

### 9.4 \u4EBA\u8138\u63A5\u53E3

\`\`\`text
POST /api/auth/face-register   \u7ED1\u5B9A\u5F53\u524D\u8D26\u6237\u7684\u4EBA\u8138
POST /api/auth/face-delete     \u5220\u9664\u5F53\u524D\u8D26\u6237\u7684\u4EBA\u8138\u7ED1\u5B9A
POST /api/auth/face-login      \u901A\u8FC7\u6444\u50CF\u5934\u91C7\u96C6\u7ED3\u679C\u767B\u5F55
\`\`\`

\u56FE\u7247\u8BF7\u6C42\u53D7 10 MB multipart \u9650\u5236\u3002\u524D\u7AEF\u53EA\u5141\u8BB8\u6444\u50CF\u5934\u91C7\u96C6\uFF0C\u4E0D\u63D0\u4F9B\u672C\u5730\u6587\u4EF6\u4E0A\u4F20\u5165\u53E3\u3002

### 9.5 Dashboard \u63A5\u53E3

\`\`\`text
GET   /api/farms/{farmId}/dashboard
GET   /api/farms/{farmId}/greenhouses/{greenhouseId}
PATCH /api/farms/{farmId}/devices/{entityId}
POST  /api/farms/{farmId}/devices/{entityId}/self-test
PATCH /api/farms/{farmId}/irrigation/{unitId}
PATCH /api/farms/{farmId}/alerts/{alertId}/handle
\`\`\`

\u704C\u6E89\u63A7\u5236\u793A\u4F8B\uFF1A

\`\`\`http
PATCH /api/farms/farm-01/irrigation/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "enabled": true,
  "durationMinutes": 20
}
\`\`\`

\`durationMinutes\` \u7684\u6709\u6548\u8303\u56F4\u4E3A 5\u201360 \u5206\u949F\u3002\u524D\u7AEF\u63A7\u5236\u6210\u529F\u540E\u5E94\u4EE5\u670D\u52A1\u7AEF\u8FD4\u56DE\u503C\u5237\u65B0\u72B6\u6001\uFF0C\u4E0D\u80FD\u53EA\u5728\u672C\u5730\u5207\u6362\u6309\u94AE\u3002

### 9.6 AI \u63A5\u53E3

\`\`\`http
POST /api/assistant/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "context": "farm-01 1\u53F7\u756A\u8304\u6E29\u5BA4",
  "messages": [
    {"role": "user", "content": "\u5F53\u524D\u6E7F\u5EA6\u504F\u9AD8\u5E94\u8BE5\u600E\u4E48\u5904\u7406\uFF1F"}
  ]
}
\`\`\`

\u8FD4\u56DE\u7ED3\u6784\uFF1A

\`\`\`json
{
  "reply": "\u2026\u2026",
  "model": "\u5B9E\u9645\u4F7F\u7528\u7684\u6A21\u578B\u540D\u79F0"
}
\`\`\`

\u72B6\u6001\u63A5\u53E3\uFF1A

\`\`\`text
GET /api/assistant/state
PUT /api/assistant/state
\`\`\`

## 10. \u6570\u636E\u6A21\u578B

| \u8868 | \u7528\u9014 | \u5173\u952E\u7EA6\u675F |
|---|---|---|
| \`users\` | \u7528\u6237\u3001\u5BC6\u7801\u54C8\u5E0C\u548C\u4EBA\u8138\u7ED1\u5B9A\u4FE1\u606F | \u90AE\u7BB1\u552F\u4E00 |
| \`farm_assets\` | \u5927\u68DA\u3001\u5730\u5757\u7B49\u519C\u573A\u8D44\u4EA7 | \u4EE5\u519C\u573A\u548C\u4E1A\u52A1 ID \u5173\u8054 |
| \`farm_devices\` | \u8BBE\u5907\u3001\u8FD0\u884C\u72B6\u6001\u548C\u63A7\u5236\u6570\u636E | \u5F52\u5C5E\u4E8E\u519C\u573A/\u8D44\u4EA7 |
| \`environment_metrics\` | \u6E29\u6E7F\u5EA6\u3001\u5149\u7167\u3001CO\u2082 \u7B49\u6307\u6807 | \`(farm_id, metric_key)\` \u552F\u4E00 |
| \`irrigation_units\` | \u704C\u6E89\u5206\u533A\u548C\u6267\u884C\u72B6\u6001 | \u8BB0\u5F55\u5F00\u5173\u4E0E\u65F6\u957F |
| \`farm_alerts\` | \u544A\u8B66\u53CA\u5904\u7406\u72B6\u6001 | \u4FDD\u7559\u7EA7\u522B\u3001\u65F6\u95F4\u548C\u5904\u7F6E\u7ED3\u679C |
| \`user_assistant_states\` | \u7528\u6237 AI \u52A9\u624B\u72B6\u6001 | \`user_id\` \u552F\u4E00 |

\u6B63\u5F0F\u53D8\u66F4\u8868\u7ED3\u6784\u65F6\u5EFA\u8BAE\u5F15\u5165 Flyway \u6216 Liquibase\uFF0C\u4E0D\u8981\u4F9D\u8D56\u751F\u4EA7\u73AF\u5883\u81EA\u52A8\u5EFA\u8868\u3002\u6570\u636E\u5E93\u5907\u4EFD\u81F3\u5C11\u5305\u542B\u6BCF\u65E5\u5168\u91CF\u3001binlog \u589E\u91CF\u548C\u5B9A\u671F\u6062\u590D\u6F14\u7EC3\u3002

## 11. Three.js \u6570\u5B57\u5B6A\u751F

### 11.1 \u519C\u573A\u573A\u666F

\u573A\u666F\u652F\u6301\u9E1F\u77B0\u3001\u8F68\u9053\u5F0F 3D \u548C\u7B2C\u4E00\u4EBA\u79F0\u6A21\u5F0F\u3002\u5927\u68DA\u6A21\u578B\u5FC5\u987B\u643A\u5E26\u7A33\u5B9A\u4E1A\u52A1 ID\uFF1B\u53CC\u51FB\u62FE\u53D6 Three.js \u5BF9\u8C61\u540E\uFF0C\u6839\u636E ID \u8DF3\u8F6C\u5BF9\u5E94\u6E29\u5BA4\u8DEF\u7531\u3002

![3D \u519C\u573A\u5B9E\u73B0\u573A\u666F](./\u622A\u56FE/3D.png)

> **\u56FE 11-1\u30003D \u519C\u573A\u573A\u666F\u57FA\u7EBF\u3002** \u573A\u666F\u6E32\u67D3\u3001\u5BF9\u8C61\u62FE\u53D6\u3001\u8BE6\u60C5\u62BD\u5C49\u548C\u201C\u8FDB\u5165\u5927\u68DA\u201D\u8DEF\u7531\u6784\u6210\u4E00\u6761\u5B8C\u6574\u4EA4\u4E92\u94FE\u8DEF\u3002

![\u7B2C\u4E00\u4EBA\u79F0\u5DE1\u573A\u5B9E\u73B0\u57FA\u7EBF](./\u622A\u56FE/\u7B2C\u4E00\u4EBA\u79F0.png)

> **\u56FE 11-2\u3000\u7B2C\u4E00\u4EBA\u79F0\u5DE1\u573A\u57FA\u7EBF\u3002** Pointer Lock\u3001WASD \u79FB\u52A8\u3001\u78B0\u649E\u68C0\u6D4B\u3001\u51C6\u661F\u62FE\u53D6\u3001\`1\u20137\` \u4E1A\u52A1\u5207\u6362\u548C \`Esc\` \u9000\u51FA\u5E94\u4F5C\u4E3A\u540C\u4E00\u5957\u4EA4\u4E92\u72B6\u6001\u673A\u7EF4\u62A4\u3002

\u6B63\u786E\u6620\u5C04\u94FE\u8DEF\u4E3A\uFF1A

\`\`\`text
3D Object.userData.greenhouseId
    \u2192 Vue Router greenhouseId
    \u2192 GET greenhouse detail API
    \u2192 \u573A\u666F\u6A21\u578B\u3001\u53F3\u4FA7\u680F\u548C\u8BBE\u5907\u72B6\u6001
\`\`\`

\u7981\u6B62\u7528\u6570\u7EC4\u4E0B\u6807\u4F5C\u4E3A\u957F\u671F\u4E1A\u52A1\u6807\u8BC6\uFF0C\u5426\u5219\u6392\u5E8F\u53D8\u5316\u540E\u4F1A\u8FDB\u5165\u9519\u8BEF\u5927\u68DA\u3002

### 11.2 \u6E29\u5BA4\u5185\u90E8

\u516D\u5EA7\u6E29\u5BA4\u7531\u540E\u7AEF\u8BE6\u60C5\u6570\u636E\u9A71\u52A8\u4F5C\u7269\u54C1\u79CD\u3001\u683D\u57F9\u65B9\u5F0F\u3001\u682A\u6570\u3001\u533A\u57DF\u3001\u8BBE\u5907\u548C\u73AF\u5883\u6307\u6807\u3002\u524D\u7AEF\u6A21\u578B\u751F\u6210\u5668\u6839\u636E\u4F5C\u7269\u7C7B\u578B\u521B\u5EFA\u5DEE\u5F02\u5316\u690D\u682A\u51E0\u4F55\u4F53\uFF0C\u5E76\u4E3A\u6837\u672C\u690D\u682A\u63D0\u4F9B\u53EF\u70B9\u51FB\u5B9A\u4F4D\u3002

![\u6E29\u5BA4\u5185\u90E8\u5B9E\u73B0\u57FA\u7EBF](./\u622A\u56FE/\u5927\u68DA\u5185\u90E8.png)

> **\u56FE 11-3\u3000\u6E29\u5BA4\u5185\u90E8\u57FA\u7EBF\u3002** Three.js \u4E3B\u573A\u666F\u3001\u5E95\u90E8\u73AF\u5883\u6307\u6807\u548C\u53F3\u4FA7\u4E1A\u52A1\u6570\u636E\u5FC5\u987B\u6765\u81EA\u540C\u4E00\u6E29\u5BA4\u8BE6\u60C5\u54CD\u5E94\uFF1B\u53F3\u680F\u91C7\u7528\u72EC\u7ACB\u6EDA\u52A8\u5BB9\u5668\uFF0C\u4E0D\u80FD\u7531\u9875\u9762\u6574\u4F53\u9AD8\u5EA6\u88C1\u5207\u5185\u5BB9\u3002

\u6027\u80FD\u5EFA\u8BAE\uFF1A

- \u91CD\u590D\u690D\u682A\u4F18\u5148\u4F7F\u7528 \`InstancedMesh\`\uFF1B
- \u5408\u5E76\u9759\u6001\u51E0\u4F55\u4F53\u5E76\u5171\u4EAB\u6750\u8D28\uFF1B
- \u7EB9\u7406\u4F7F\u7528\u538B\u7F29\u683C\u5F0F\u548C\u5408\u7406 mipmap\uFF1B
- \u8FDC\u8DDD\u79BB\u6A21\u578B\u91C7\u7528 LOD\uFF1B
- \u9500\u6BC1\u9875\u9762\u65F6\u91CA\u653E geometry\u3001material\u3001texture \u548C\u4E8B\u4EF6\u76D1\u542C\uFF1B
- \u7528\u771F\u5B9E\u8BBE\u5907\u6D4B\u8BD5\u5E27\u7387\u3001\u663E\u5B58\u548C\u6D4F\u89C8\u5668\u5185\u5B58\uFF0C\u800C\u4E0D\u53EA\u770B\u5F00\u53D1\u673A\u3002

## 12. \u5F53\u524D YOLO \u76D1\u63A7\u8BC6\u522B\u94FE\u8DEF

\u5F53\u524D\u7F51\u7AD9\u4E0D\u4F1A\u5728\u6D4F\u89C8\u5668\u4E2D\u5B9E\u65F6\u8FD0\u884C Python\u3002\u5904\u7406\u6D41\u7A0B\u662F\uFF1A

\`\`\`mermaid
flowchart LR
    A[docs/mo.mp4] --> B[\u62BD\u53D6\u8BAD\u7EC3\u5E27]
    B --> C[YOLO \u683C\u5F0F\u6807\u6CE8]
    C --> D[\u8BAD\u7EC3 YOLO11n]
    D --> E[ByteTrack \u89C6\u9891\u63A8\u7406]
    E --> F[greenhouse-monitor.detections.json]
    F --> G[Vue \u6309\u89C6\u9891\u65F6\u95F4\u7ED8\u5236\u68C0\u6D4B\u6846]
\`\`\`

\u7C7B\u522B\u76EE\u524D\u4E3A\uFF1A

- \`person\`\uFF1A\u53EF\u89C1\u4EBA\u5458\uFF1B
- \`crop\`\uFF1A\u4F5C\u7269\u690D\u682A\u6216\u8FDE\u7EED\u51A0\u5C42\u3002

### 12.1 \u5EFA\u7ACB\u7B97\u6CD5\u73AF\u5883

\`\`\`bash
python3 -m venv tools/yolo/.venv
source tools/yolo/.venv/bin/activate
python -m pip install -U pip
python -m pip install -r tools/yolo/requirements.txt
\`\`\`

### 12.2 \u62BD\u5E27\u3001\u6807\u6CE8\u548C\u8BAD\u7EC3

\`\`\`bash
python tools/yolo/extract_frames.py
python tools/yolo/labelme_to_yolo.py
python tools/yolo/train.py --epochs 80 --batch 8 --imgsz 640
\`\`\`

\u6700\u4F73\u6743\u91CD\u4F4D\u4E8E\uFF1A

\`\`\`text
tools/yolo/runs/greenhouse-person-crop/weights/best.pt
\`\`\`

### 12.3 \u5BFC\u51FA\u68C0\u6D4B\u7ED3\u679C

\`\`\`bash
python tools/yolo/export_detections.py
\`\`\`

\u8F93\u51FA\uFF1A

\`\`\`text
frontend/public/assets/media/greenhouse-monitor.detections.json
\`\`\`

\u968F\u540E\u91CD\u65B0\u6784\u5EFA Vue \u5E73\u53F0\u3002\u5F53\u524D 38 \u5E27\u9AD8\u5EA6\u76F8\u4F3C\uFF0C\u53EA\u9002\u5408\u6F14\u793A\u89C6\u9891\uFF1B\u7528\u4E8E\u65B0\u6E29\u5BA4\u524D\u5FC5\u987B\u91C7\u96C6\u4E0D\u540C\u8DDD\u79BB\u3001\u65F6\u6BB5\u3001\u5149\u7167\u3001\u906E\u6321\u3001\u4EBA\u5458\u59FF\u6001\u548C\u4F5C\u7269\u751F\u80B2\u671F\u7684\u6570\u636E\uFF0C\u5E76\u91CD\u65B0\u5212\u5206\u8BAD\u7EC3\u3001\u9A8C\u8BC1\u548C\u72EC\u7ACB\u6D4B\u8BD5\u96C6\u3002

### 12.4 \u5347\u7EA7\u4E3A\u5B9E\u65F6\u670D\u52A1

\u63A8\u8350\u5C06\u63A8\u7406\u72EC\u7ACB\u4E3A Python/GPU \u670D\u52A1\uFF1A\u6444\u50CF\u5934 RTSP \u2192 \u89E3\u7801\u548C\u62BD\u5E27 \u2192 YOLO/TensorRT \u2192 \u8DDF\u8E2A \u2192 \u4E8B\u4EF6\u89C4\u5219 \u2192 WebSocket/SSE \u2192 \u524D\u7AEF\u53E0\u52A0\u3002Spring Boot \u4FDD\u5B58\u4E8B\u4EF6\u3001\u8BBE\u5907\u548C\u544A\u8B66\uFF0C\u4E0D\u8D1F\u8D23\u9010\u5E27 GPU \u63A8\u7406\u3002

\u5FC5\u987B\u76D1\u63A7\u7AEF\u5230\u7AEF\u5EF6\u8FDF\u3001FPS\u3001\u961F\u5217\u79EF\u538B\u3001\u6F0F\u68C0\u7387\u3001\u8BEF\u62A5\u7387\u3001GPU \u5229\u7528\u7387\u548C\u6444\u50CF\u5934\u65AD\u6D41\u3002

## 13. NVIDIA LocateAnything \u5347\u7EA7\u65B9\u6848

NVIDIA LocateAnything \u662F\u5F00\u653E\u8BCD\u6C47\u89C6\u89C9\u5B9A\u4F4D\u6A21\u578B\uFF0C\u53EF\u4F7F\u7528\u81EA\u7136\u8BED\u8A00\u67E5\u8BE2\u5728\u56FE\u50CF\u4E2D\u5B9A\u4F4D\u5BF9\u8C61\uFF0C\u5E76\u8986\u76D6\u901A\u7528\u76EE\u6807\u68C0\u6D4B\u3001OCR \u548C\u754C\u9762\u5B9A\u4F4D\u7B49\u4EFB\u52A1\u3002\u5B83\u9002\u5408\u5904\u7406\u56FA\u5B9A YOLO \u7C7B\u522B\u4E4B\u5916\u7684\u4E34\u65F6\u67E5\u8BE2\uFF0C\u4F46**\u76EE\u524D\u5C1A\u672A\u63A5\u5165\u672C\u9879\u76EE**\u3002

\u5B98\u65B9\u8D44\u6599\uFF1A

- [NVIDIA LocateAnything \u9879\u76EE\u9875](https://research.nvidia.com/labs/lpr/locate-anything/)
- [LocateAnything-3B \u6A21\u578B\u9875](https://huggingface.co/nvidia/LocateAnything-3B)

### 13.1 \u63A8\u8350\u7684\u5206\u5C42\u67B6\u6784

| \u5C42\u7EA7 | \u6A21\u578B | \u4EFB\u52A1 | \u539F\u56E0 |
|---|---|---|---|
| \u4E00\u7EA7 | YOLO/TensorRT | 7\xD724 \u5C0F\u65F6\u56FA\u5B9A\u7C7B\u522B\u68C0\u6D4B | \u5FEB\u3001\u6210\u672C\u4F4E\u3001\u6613\u8FB9\u7F18\u90E8\u7F72 |
| \u4E8C\u7EA7 | LocateAnything | \u6309\u9700\u5F00\u653E\u8BCD\u6C47\u5B9A\u4F4D\u3001\u7591\u96BE\u5E27\u590D\u6838 | \u67E5\u8BE2\u7075\u6D3B\u4F46\u8BA1\u7B97\u9700\u6C42\u66F4\u9AD8 |
| \u8BAD\u7EC3\u95ED\u73AF | LocateAnything + \u4EBA\u5DE5\u5BA1\u6838 | \u8F85\u52A9\u751F\u6210\u65B0\u7C7B\u522B\u6807\u6CE8\uFF0C\u518D\u8BAD\u7EC3 YOLO | \u5C06\u5F00\u653E\u80FD\u529B\u6C89\u6DC0\u4E3A\u5B9E\u65F6\u5C0F\u6A21\u578B |

\u4E0D\u8981\u7B80\u5355\u5730\u7528 LocateAnything \u5168\u91CF\u66FF\u6362 YOLO\u3002\u5B98\u65B9\u6027\u80FD\u6570\u636E\u4F9D\u8D56\u9AD8\u7AEF GPU \u73AF\u5883\uFF1B\u90E8\u7F72\u524D\u5FC5\u987B\u5728\u76EE\u6807\u8BBE\u5907\u548C\u519C\u4E1A\u6570\u636E\u96C6\u4E0A\u5B9E\u6D4B\u3002

### 13.2 \u519C\u4E1A\u67E5\u8BE2\u793A\u4F8B

- \u201C\u5B9A\u4F4D\u53F6\u7247\u660E\u663E\u840E\u852B\u7684\u756A\u8304\u690D\u682A\u201D\uFF1B
- \u201C\u5B9A\u4F4D\u901A\u9053\u4E2D\u7684\u79EF\u6C34\u533A\u57DF\u201D\uFF1B
- \u201C\u5B9A\u4F4D\u672A\u4F69\u6234\u9632\u62A4\u88C5\u5907\u7684\u4EBA\u5458\u201D\uFF1B
- \u201C\u5B9A\u4F4D\u7834\u635F\u7684\u6EF4\u704C\u7BA1\u201D\uFF1B
- \u201C\u5B9A\u4F4D\u6E29\u5BA4\u5185\u7684\u4EEA\u8868\u8BFB\u6570\u533A\u57DF\u201D\u3002

\u8FD9\u4E9B\u8BED\u53E5\u53EA\u4EE3\u8868\u5019\u9009\u5E94\u7528\uFF0C\u4E0D\u80FD\u5728\u672A\u7ECF\u6807\u6CE8\u6570\u636E\u9A8C\u8BC1\u65F6\u627F\u8BFA\u51C6\u786E\u7387\u3002\u5EFA\u8BAE\u5EFA\u7ACB\u542B\u5F3A\u5149\u3001\u9006\u5149\u3001\u591C\u95F4\u3001\u96FE\u6C14\u3001\u906E\u6321\u548C\u76F8\u4F3C\u80CC\u666F\u7684\u4E13\u9879\u6D4B\u8BD5\u96C6\u3002

## 14. LingBot-Map \u5B9E\u666F\u5EFA\u56FE\u65B9\u6848

LingBot-Map \u662F\u9762\u5411\u56FE\u50CF\u6216\u89C6\u9891\u6D41\u7684\u524D\u9988\u5F0F\u4E09\u7EF4\u91CD\u5EFA\u9879\u76EE\uFF0C\u652F\u6301\u6D41\u5F0F/\u7A97\u53E3\u5316\u5904\u7406\u5E76\u8F93\u51FA\u76F8\u673A\u548C\u70B9\u4E91\u7B49\u7ED3\u679C\u3002\u5B83\u4E0E\u201C\u5355\u6444\u50CF\u5934\u91C7\u96C6\u6E29\u5BA4\u5B9E\u666F\u3001\u964D\u4F4E\u5BF9\u6FC0\u5149\u96F7\u8FBE\u7684\u4F9D\u8D56\u201D\u7684\u76EE\u6807\u5339\u914D\uFF0C\u4F46**\u5F53\u524D\u5C1A\u672A\u96C6\u6210**\u3002

\u5B98\u65B9\u4ED3\u5E93\uFF1A[robbyant/lingbot-map](https://github.com/robbyant/lingbot-map)

### 14.1 \u5FC5\u987B\u6F84\u6E05\u7684\u5DE5\u7A0B\u8FB9\u754C

LingBot-Map \u89E3\u51B3\u7684\u662F\u89C6\u89C9\u4E09\u7EF4\u91CD\u5EFA\uFF0C\u4E0D\u662F\u5B8C\u6574\u673A\u5668\u4EBA\u5BFC\u822A\u7CFB\u7EDF\u3002\u70B9\u4E91\u4E0D\u80FD\u76F4\u63A5\u7B49\u540C\u4E8E\u53EF\u5BFC\u822A\u5730\u56FE\u3002\u5355\u76EE\u65B9\u6848\u8FD8\u4F1A\u9762\u5BF9\u5C3A\u5EA6\u6F02\u79FB\u3001\u5F31\u7EB9\u7406\u3001\u91CD\u590D\u68DA\u67B6\u3001\u53CD\u5149\u8584\u819C\u3001\u52A8\u6001\u4EBA\u5458\u3001\u5149\u7167\u53D8\u5316\u548C\u8FD0\u52A8\u6A21\u7CCA\u3002

\u5373\u4F7F\u4E0D\u4F7F\u7528\u6FC0\u5149\u96F7\u8FBE\uFF0C\u751F\u4EA7\u673A\u5668\u4EBA\u4ECD\u5EFA\u8BAE\u5177\u5907\u8F6E\u901F\u91CC\u7A0B\u8BA1\u3001IMU\u3001\u78B0\u649E\u6761/\u6025\u505C\u548C\u8FD1\u8DDD\u79BB\u5B89\u5168\u4F20\u611F\u5668\u3002\u4EBA\u5458\u548C\u4F5C\u7269\u5171\u5B58\u73AF\u5883\u4E2D\uFF0C\u5B89\u5168\u5C42\u4E0D\u80FD\u53EA\u4F9D\u8D56\u5355\u76EE\u91CD\u5EFA\u3002

### 14.2 \u5EFA\u8BAE\u7684\u6570\u636E\u94FE\u8DEF

\`\`\`mermaid
flowchart LR
    C[\u5355\u76EE\u6444\u50CF\u5934/\u5F55\u5236\u89C6\u9891] --> S[\u5E27\u91C7\u6837\u4E0E\u8D28\u91CF\u68C0\u67E5]
    S --> L[LingBot-Map \u63A8\u7406]
    L --> P[\u76F8\u673A\u4F4D\u59FF + \u70B9\u4E91]
    P --> F[\u53BB\u566A\u3001\u5C3A\u5EA6\u6807\u5B9A\u3001\u5730\u9762\u5206\u5272]
    F --> O[\u4F53\u7D20/\u5360\u636E\u6805\u683C/OctoMap]
    O --> R[\u5B9A\u4F4D\u4E0E\u5BFC\u822A\u5750\u6807\u7CFB]
    R --> G[\u5168\u5C40\u89C4\u5212]
    G --> Q[\u5C40\u90E8\u907F\u969C\u4E0E\u5B89\u5168\u63A7\u5236]
    Q --> M[\u519C\u4E1A\u673A\u5668\u4EBA]
    P --> W[Web \u7AEF\u5B9E\u666F\u4E09\u7EF4\u5C55\u793A]
\`\`\`

### 14.3 \u670D\u52A1\u62C6\u5206

\u5EFA\u8BAE\u5EFA\u7ACB\u72EC\u7ACB \`mapping-service\`\uFF0C\u907F\u514D\u5728 Spring JVM \u5185\u52A0\u8F7D\u5927\u578B PyTorch \u6A21\u578B\uFF1A

- **\u91C7\u96C6\u7AEF**\uFF1A\u76F8\u673A\u6807\u5B9A\u3001\u89C6\u9891\u5207\u7247\u3001\u65F6\u95F4\u6233\u548C\u6E29\u5BA4 ID\uFF1B
- **\u91CD\u5EFA\u7AEF**\uFF1AGPU \u63A8\u7406\u3001\u4EFB\u52A1\u961F\u5217\u3001\u8FDB\u5EA6\u548C\u5931\u8D25\u91CD\u8BD5\uFF1B
- **\u5730\u56FE\u5904\u7406\u7AEF**\uFF1A\u5C3A\u5EA6\u5BF9\u9F50\u3001\u6EE4\u6CE2\u3001\u5360\u636E\u5730\u56FE\u751F\u6210\uFF1B
- **\u5B58\u50A8\u7AEF**\uFF1A\u539F\u89C6\u9891\u3001PLY/GLB\u3001\u76F8\u673A\u8F68\u8FF9\u3001\u5730\u56FE\u7248\u672C\u548C\u7F29\u7565\u56FE\uFF1B
- **\u4E1A\u52A1\u7AEF**\uFF1ASpring Boot \u7BA1\u7406\u4EFB\u52A1\u5143\u6570\u636E\u3001\u6743\u9650\u548C\u6E29\u5BA4\u5173\u8054\uFF1B
- **\u5C55\u793A\u7AEF**\uFF1AVue/Three.js \u52A0\u8F7D\u8F7B\u91CF GLB \u6216\u5206\u5757\u70B9\u4E91\uFF1B
- **\u673A\u5668\u4EBA\u7AEF**\uFF1AROS 2/\u5BFC\u822A\u6808\u6D88\u8D39\u7ECF\u8FC7\u9A8C\u8BC1\u7684\u5730\u56FE\uFF0C\u800C\u975E\u76F4\u63A5\u6D88\u8D39\u7F51\u9875\u6A21\u578B\u3002

\u5EFA\u8BAE\u4E1A\u52A1\u63A5\u53E3\uFF1A

\`\`\`text
POST /api/farms/{farmId}/greenhouses/{id}/mapping-sessions
POST /api/mapping-sessions/{sessionId}/frames
POST /api/mapping-sessions/{sessionId}/complete
GET  /api/mapping-sessions/{sessionId}
GET  /api/mapping-sessions/{sessionId}/artifacts
POST /api/mapping-sessions/{sessionId}/publish
\`\`\`

\u4EFB\u52A1\u72B6\u6001\u5EFA\u8BAE\u4E3A\uFF1A\`CREATED \u2192 UPLOADING \u2192 QUEUED \u2192 RECONSTRUCTING \u2192 POST_PROCESSING \u2192 REVIEW_REQUIRED \u2192 PUBLISHED\`\uFF0C\u5931\u8D25\u8FDB\u5165 \`FAILED\` \u5E76\u4FDD\u5B58\u53EF\u8BCA\u65AD\u539F\u56E0\u3002

### 14.4 \u5750\u6807\u4E0E\u6807\u5B9A

\u81F3\u5C11\u7EF4\u62A4\u4EE5\u4E0B\u5750\u6807\u7CFB\uFF1A

- \`camera\`\uFF1A\u76F8\u673A\u5750\u6807\uFF1B
- \`reconstruction\`\uFF1ALingBot-Map \u8F93\u51FA\u5750\u6807\uFF1B
- \`greenhouse\`\uFF1A\u6E29\u5BA4\u4E1A\u52A1\u5750\u6807\uFF1B
- \`map\`\uFF1A\u673A\u5668\u4EBA\u5BFC\u822A\u5730\u56FE\u5750\u6807\uFF1B
- \`base_link\`\uFF1A\u673A\u5668\u4EBA\u672C\u4F53\u5750\u6807\u3002

\u53D1\u5E03\u5730\u56FE\u524D\u9700\u8981\u7528\u5DF2\u77E5\u5C3A\u5BF8\u6807\u5FD7\u7269\u3001\u6E29\u5BA4\u7ED3\u6784\u5C3A\u5BF8\u6216\u878D\u5408\u91CC\u7A0B\u8BA1\u786E\u5B9A\u5C3A\u5EA6\uFF0C\u8BB0\u5F55\u53D8\u6362\u77E9\u9635\u548C\u6807\u5B9A\u7248\u672C\u3002\u6BCF\u6B21\u76F8\u673A\u5B89\u88C5\u4F4D\u7F6E\u3001\u7126\u8DDD\u6216\u88C1\u526A\u7B56\u7565\u53D8\u5316\u540E\u91CD\u65B0\u9A8C\u8BC1\u3002

### 14.5 \u5206\u9636\u6BB5\u5B9E\u65BD

1. **\u79BB\u7EBF\u9A8C\u8BC1**\uFF1A\u5BF9\u5355\u5EA7\u6E29\u5BA4\u5F55\u5236\u89C6\u9891\uFF0C\u5F97\u5230\u70B9\u4E91\u548C\u76F8\u673A\u8F68\u8FF9\uFF1B
2. **Web \u5C55\u793A**\uFF1A\u538B\u7F29\u4E3A GLB/\u5206\u5757\u70B9\u4E91\uFF0C\u5728\u5B9E\u666F\u9875\u52A0\u8F7D\uFF1B
3. **\u5C3A\u5EA6\u4E0E\u5730\u9762**\uFF1A\u5EFA\u7ACB\u771F\u5B9E\u7C73\u5236\u5C3A\u5EA6\uFF0C\u8BC6\u522B\u5730\u9762\u548C\u56FA\u5B9A\u969C\u788D\uFF1B
4. **\u5730\u56FE\u8F6C\u6362**\uFF1A\u751F\u6210\u4E8C\u7EF4\u5360\u636E\u6805\u683C\u6216\u4E09\u7EF4\u4F53\u7D20\u5730\u56FE\uFF1B
5. **\u56DE\u653E\u5BFC\u822A**\uFF1A\u4EFF\u771F\u6216\u5F55\u5305\u9A8C\u8BC1\u5B9A\u4F4D\u548C\u89C4\u5212\uFF1B
6. **\u4F4E\u901F\u5C01\u95ED\u6D4B\u8BD5**\uFF1A\u7A7A\u68DA\u3001\u9650\u901F\u3001\u4EBA\u5DE5\u6025\u505C\uFF1B
7. **\u6709\u4EBA\u73AF\u5883\u6D4B\u8BD5**\uFF1A\u52A0\u5165\u52A8\u6001\u969C\u788D\u548C\u72EC\u7ACB\u5B89\u5168\u5C42\uFF1B
8. **\u7248\u672C\u7BA1\u7406**\uFF1A\u68DA\u5185\u5E03\u5C40\u53D8\u5316\u540E\u91CD\u65B0\u5EFA\u56FE\u5E76\u652F\u6301\u56DE\u6EDA\u3002

### 14.6 \u9A8C\u6536\u6307\u6807

- \u8F68\u8FF9\u5B8C\u6574\u7387\u548C\u91CD\u5EFA\u6210\u529F\u7387\uFF1B
- \u7C73\u5236\u5C3A\u5EA6\u8BEF\u5DEE\u3001\u95ED\u73AF\u6F02\u79FB\u548C\u91CD\u590D\u5EFA\u56FE\u4E00\u81F4\u6027\uFF1B
- \u5730\u9762/\u969C\u788D\u7269\u5206\u7C7B\u51C6\u786E\u7387\uFF1B
- \u5360\u636E\u5730\u56FE\u7684\u6F0F\u969C\u788D\u7387\u548C\u865A\u5047\u969C\u788D\u7387\uFF1B
- \u5B9A\u4F4D\u6210\u529F\u7387\u3001\u8DEF\u5F84\u6210\u529F\u7387\u548C\u6700\u5C0F\u5B89\u5168\u8DDD\u79BB\uFF1B
- \u4E0D\u540C\u5149\u7167\u3001\u4F5C\u7269\u9AD8\u5EA6\u3001\u901A\u9053\u79EF\u6C34\u548C\u4EBA\u5458\u8D70\u52A8\u6761\u4EF6\u4E0B\u7684\u9C81\u68D2\u6027\uFF1B
- \u5730\u56FE\u52A0\u8F7D\u65F6\u95F4\u3001\u524D\u7AEF\u5E27\u7387\u548C\u4EA7\u7269\u5927\u5C0F\u3002

## 15. \u5B89\u5168\u8BBE\u8BA1

### 15.1 Web \u4E0E API

- \u5168\u7AD9 HTTPS\uFF1B
- JWT \u5BC6\u94A5\u5B9A\u671F\u8F6E\u6362\uFF0C\u8BBE\u7F6E\u5408\u7406\u8FC7\u671F\u65F6\u95F4\uFF1B
- CORS \u53EA\u5141\u8BB8\u53EF\u4FE1\u57DF\u540D\uFF1B
- \u767B\u5F55\u3001\u4EBA\u8138\u548C AI \u63A5\u53E3\u9650\u6D41\uFF1B
- \u8BBE\u5907\u63A7\u5236\u5199\u5165\u64CD\u4F5C\u8005\u3001\u65F6\u95F4\u3001\u65E7\u503C\u3001\u65B0\u503C\u548C\u7ED3\u679C\uFF1B
- \u8F93\u51FA\u7F16\u7801\u5E76\u9650\u5236\u4E0A\u4F20\u7C7B\u578B\u3001\u5927\u5C0F\u548C\u5206\u8FA8\u7387\uFF1B
- \u4F9D\u8D56\u6F0F\u6D1E\u626B\u63CF\u548C\u8F6F\u4EF6\u7269\u6599\u6E05\u5355\uFF1B
- \u670D\u52A1\u9519\u8BEF\u4E0D\u5F97\u6CC4\u9732\u5806\u6808\u3001\u6570\u636E\u5E93\u53E3\u4EE4\u6216\u7B2C\u4E09\u65B9\u5BC6\u94A5\u3002

### 15.2 \u4EBA\u8138\u6570\u636E

\u4EBA\u8138\u5C5E\u4E8E\u654F\u611F\u4E2A\u4EBA\u4FE1\u606F\u3002\u4E0A\u7EBF\u524D\u5E94\u83B7\u5F97\u5355\u72EC\u540C\u610F\uFF0C\u8BF4\u660E\u76EE\u7684\u3001\u4FDD\u5B58\u671F\u9650\u3001\u5220\u9664\u65B9\u5F0F\u548C\u7B2C\u4E09\u65B9\u5904\u7406\u65B9\u3002\u63D0\u4F9B\u89E3\u7ED1\u548C\u5220\u9664\u80FD\u529B\uFF0C\u9650\u5236\u7BA1\u7406\u5458\u8BBF\u95EE\u5E76\u4FDD\u7559\u5BA1\u8BA1\u8BB0\u5F55\u3002\u6444\u50CF\u5934\u91C7\u96C6\u53EA\u662F\u8F93\u5165\u9650\u5236\uFF0C\u4E0D\u80FD\u66FF\u4EE3\u6D3B\u4F53\u68C0\u6D4B\u3002

### 15.3 \u673A\u5668\u4EBA\u5B89\u5168

\u5730\u56FE\u6216\u8BC6\u522B\u6A21\u578B\u8F93\u51FA\u4E0D\u5F97\u76F4\u63A5\u7ED5\u8FC7\u5B89\u5168\u63A7\u5236\u9A71\u52A8\u6267\u884C\u5668\u3002\u673A\u5668\u4EBA\u5E94\u6709\u72EC\u7ACB\u6025\u505C\u3001\u9650\u901F\u3001\u78B0\u649E\u4FDD\u62A4\u3001\u5931\u8054\u505C\u8F66\u548C\u4EBA\u5DE5\u63A5\u7BA1\uFF1B\u65B0\u5730\u56FE\u53D1\u5E03\u9700\u8981\u5BA1\u6838\u548C\u7B7E\u540D\uFF0C\u5BFC\u822A\u5931\u8D25\u65F6\u8FDB\u5165\u5B89\u5168\u72B6\u6001\u3002

## 16. \u6D4B\u8BD5\u7B56\u7565

### 16.1 \u81EA\u52A8\u6D4B\u8BD5

\`\`\`bash
./mvnw test
cd landing && npm run build
cd ../frontend && npm run build
\`\`\`

\u540E\u7AEF\u5E94\u8986\u76D6\uFF1A\u6CE8\u518C\u3001\u91CD\u590D\u90AE\u7BB1\u3001\u6B63\u786E/\u9519\u8BEF\u5BC6\u7801\u3001JWT\u3001Dashboard \u67E5\u8BE2\u3001\u6E29\u5BA4\u8BE6\u60C5\u3001\u8BBE\u5907\u66F4\u65B0\u3001\u704C\u6E89\u53C2\u6570\u8FB9\u754C\u3001\u544A\u8B66\u5904\u7F6E\u548C\u7528\u6237\u72B6\u6001\u9694\u79BB\u3002

### 16.2 \u524D\u7AEF\u4EBA\u5DE5\u56DE\u5F52

1. \u8BBF\u95EE\u5B98\u7F51\u6240\u6709\u5BFC\u822A\u9875\uFF1B
2. \u63D0\u4EA4\u8054\u7CFB\u8868\u5355\u5E76\u6838\u5BF9\u76EE\u6807\u90AE\u7BB1\uFF1B
3. \u6CE8\u518C\u65B0\u7528\u6237\uFF1B
4. \u767B\u5F55\u3001\u9000\u51FA\u548C\u9519\u8BEF\u5BC6\u7801\u63D0\u793A\uFF1B
5. \u5141\u8BB8/\u62D2\u7EDD\u6444\u50CF\u5934\u6743\u9650\uFF1B
6. \u8FDB\u5165\u5DE5\u4F5C\u53F0\u5E76\u5207\u6362\u4E09\u79CD\u89C6\u89D2\uFF1B
7. \u64CD\u4F5C\u4E03\u4E2A\u529F\u80FD\u6A21\u5757\uFF1B
8. \u53CC\u51FB\u6BCF\u5EA7\u5927\u68DA\u5E76\u786E\u8BA4\u8DEF\u7531\u548C\u4F5C\u7269\u5DEE\u5F02\uFF1B
9. \u5207\u6362\u5B9E\u666F/\u6570\u5B57\u5B6A\u751F\uFF1B
10. \u68C0\u67E5\u53F3\u4FA7\u680F\u6EDA\u52A8\u3001\u8BBE\u5907\u3001\u690D\u682A\u5B9A\u4F4D\uFF1B
11. \u64AD\u653E\u76D1\u63A7\u89C6\u9891\u5E76\u6838\u5BF9\u68C0\u6D4B\u6846\u65F6\u95F4\u540C\u6B65\uFF1B
12. \u68C0\u67E5\u7A84\u5C4F\u3001\u7F29\u653E\u548C\u4F4E\u6027\u80FD\u8BBE\u5907\u8868\u73B0\u3002

### 16.3 \u7B97\u6CD5\u6D4B\u8BD5

\u7B97\u6CD5\u8BC4\u4F30\u5FC5\u987B\u6309\u6E29\u5BA4\u3001\u65F6\u6BB5\u6216\u89C6\u9891\u5206\u7EC4\uFF0C\u4E0D\u80FD\u628A\u76F8\u90BB\u5E27\u968F\u673A\u62C6\u5230\u8BAD\u7EC3\u96C6\u4E0E\u6D4B\u8BD5\u96C6\u9020\u6210\u6570\u636E\u6CC4\u6F0F\u3002YOLO \u81F3\u5C11\u8BB0\u5F55 precision\u3001recall\u3001mAP\u3001\u8DDF\u8E2A ID \u5207\u6362\u548C\u5B9E\u65F6\u5EF6\u8FDF\uFF1B\u5EFA\u56FE\u8BB0\u5F55\u5C3A\u5EA6\u3001\u8F68\u8FF9\u3001\u5730\u56FE\u548C\u5BFC\u822A\u6307\u6807\uFF1B\u5F00\u653E\u8BCD\u6C47\u6A21\u578B\u5EFA\u7ACB\u56FA\u5B9A\u67E5\u8BE2\u96C6\u5408\u53CA\u4EBA\u5DE5\u6807\u6CE8\u57FA\u51C6\u3002

## 17. \u8FD0\u7EF4\u4E0E\u53EF\u89C2\u6D4B\u6027

\u5EFA\u8BAE\u91C7\u96C6\uFF1A

- HTTP \u8BF7\u6C42\u6570\u3001P95/P99 \u5EF6\u8FDF\u30014xx/5xx\uFF1B
- \u6570\u636E\u5E93\u8FDE\u63A5\u6C60\u3001\u6162\u67E5\u8BE2\u548C\u78C1\u76D8\u5BB9\u91CF\uFF1B
- \u767B\u5F55\u5931\u8D25\u3001\u4EBA\u8138\u670D\u52A1\u5931\u8D25\u3001AI \u8C03\u7528\u5931\u8D25\uFF1B
- \u8BBE\u5907\u63A7\u5236\u6210\u529F\u7387\u548C\u544A\u8B66\u79EF\u538B\uFF1B
- \u6444\u50CF\u5934\u5728\u7EBF\u7387\u3001\u89C6\u9891\u5E27\u7387\u548C\u63A8\u7406\u961F\u5217\uFF1B
- GPU \u663E\u5B58\u3001\u5229\u7528\u7387\u3001\u6E29\u5EA6\u548C\u6A21\u578B\u8017\u65F6\uFF1B
- \u5EFA\u56FE\u4EFB\u52A1\u8017\u65F6\u3001\u5931\u8D25\u9636\u6BB5\u548C\u4EA7\u7269\u5927\u5C0F\u3002

\u65E5\u5FD7\u5E94\u5305\u542B\u8BF7\u6C42 ID\u3001\u7528\u6237 ID\u3001\u519C\u573A ID \u548C\u4EFB\u52A1 ID\uFF0C\u4F46\u4E0D\u5F97\u8BB0\u5F55\u5BC6\u7801\u3001JWT \u5168\u6587\u3001\u4EBA\u8138\u539F\u56FE\u6216\u7B2C\u4E09\u65B9\u5BC6\u94A5\u3002

## 18. \u5E38\u89C1\u6545\u969C

### 18.1 \u542F\u52A8\u65F6\u62A5\u6570\u636E\u5E93\u9519\u8BEF

\u786E\u8BA4 MySQL \u8FD0\u884C\u3001\u6570\u636E\u5E93\u5B58\u5728\u3001\u8D26\u53F7\u6709\u6743\u9650\u3001URL \u65F6\u533A\u6B63\u786E\u3002\u4F7F\u7528\u547D\u4EE4\u884C\u5BA2\u6237\u7AEF\u9A8C\u8BC1\u540C\u4E00\u7EC4\u51ED\u636E\uFF0C\u4E0D\u8981\u53EA\u4FEE\u6539\u524D\u7AEF\u914D\u7F6E\u3002

### 18.2 \u5237\u65B0\u5E73\u53F0\u6DF1\u5C42\u8DEF\u7531\u51FA\u73B0 404

\u786E\u8BA4\u5DF2\u6784\u5EFA\u5230 \`static/platform\`\uFF0C\u670D\u52A1\u5668\u914D\u7F6E\u4E86 SPA \u56DE\u9000\uFF0C\u5E76\u68C0\u67E5 \`base\` \u8DEF\u5F84\u548C\u8D44\u6E90 URL \u662F\u5426\u4E3A \`/platform/\`\u3002

### 18.3 \u767B\u5F55\u6210\u529F\u4F46 API \u8FD4\u56DE 401

\u68C0\u67E5\u8BF7\u6C42\u662F\u5426\u643A\u5E26 Bearer Token\u3001Token \u662F\u5426\u8FC7\u671F\u3001JWT_SECRET \u662F\u5426\u5728\u91CD\u542F\u540E\u53D8\u5316\uFF0C\u4EE5\u53CA\u6D4F\u89C8\u5668\u662F\u5426\u4ECD\u4FDD\u5B58\u65E7\u4F1A\u8BDD\u3002

### 18.4 \u6444\u50CF\u5934\u4E0D\u53EF\u7528

\u9664 localhost \u5916\u6D4F\u89C8\u5668\u901A\u5E38\u8981\u6C42 HTTPS\uFF1B\u68C0\u67E5\u6743\u9650\u3001\u8BBE\u5907\u5360\u7528\u3001\u7CFB\u7EDF\u9690\u79C1\u8BBE\u7F6E\u3002\u9879\u76EE\u4E0D\u5141\u8BB8\u901A\u8FC7\u4E0A\u4F20\u56FE\u7247\u66FF\u4EE3\u5237\u8138\u91C7\u96C6\u3002

### 18.5 3D \u573A\u666F\u7A7A\u767D\u6216\u5361\u987F

\u68C0\u67E5 WebGL\u3001\u63A7\u5236\u53F0\u8D44\u6E90\u9519\u8BEF\u548C\u663E\u5361\u9A71\u52A8\uFF1B\u964D\u4F4E\u50CF\u7D20\u6BD4\u3001\u9634\u5F71\u3001\u690D\u682A\u5B9E\u4F8B\u6570\u6216\u6A21\u578B\u7EC6\u8282\u3002\u786E\u8BA4\u7EC4\u4EF6\u5378\u8F7D\u65F6\u91CA\u653E\u8D44\u6E90\u3002

### 18.6 \u68C0\u6D4B\u6846\u4E0E\u89C6\u9891\u9519\u4F4D

\u786E\u8BA4 JSON \u5BF9\u5E94\u540C\u4E00\u89C6\u9891\u7248\u672C\u3001\u5206\u8FA8\u7387\u548C\u65F6\u95F4\u57FA\u51C6\uFF1B\u91CD\u65B0\u8FD0\u884C\u5BFC\u51FA\u811A\u672C\uFF0C\u907F\u514D\u5BF9\u89C6\u9891\u8F6C\u7801\u540E\u7EE7\u7EED\u4F7F\u7528\u65E7\u7ED3\u679C\u3002

### 18.7 AI \u95EE\u519C\u5931\u8D25

\u68C0\u67E5 API Key\u3001Base URL\u3001\u6A21\u578B\u540D\u3001\u7F51\u7EDC\u3001\u4F59\u989D\u3001\u8D85\u65F6\u548C\u4E0A\u6E38\u9650\u6D41\u3002\u524D\u7AEF\u5E94\u663E\u793A\u53EF\u7406\u89E3\u7684\u5931\u8D25\u63D0\u793A\uFF0C\u4E0D\u80FD\u4F2A\u9020\u6A21\u578B\u56DE\u7B54\u3002

## 19. \u53D1\u5E03\u68C0\u67E5\u6E05\u5355

- [ ] \u4E24\u4E2A\u524D\u7AEF\u5747\u4ECE\u6E90\u7801\u6210\u529F\u6784\u5EFA\uFF1B
- [ ] Maven \u6D4B\u8BD5\u5168\u90E8\u901A\u8FC7\uFF1B
- [ ] \u6570\u636E\u5E93\u8FC1\u79FB\u3001\u5907\u4EFD\u548C\u6062\u590D\u65B9\u6848\u5DF2\u9A8C\u8BC1\uFF1B
- [ ] \u751F\u4EA7 JWT\u3001\u6570\u636E\u5E93\u548C\u7B2C\u4E09\u65B9\u5BC6\u94A5\u5DF2\u66FF\u6362\uFF1B
- [ ] HTTPS\u3001CORS\u3001\u9650\u6D41\u548C\u5B89\u5168\u54CD\u5E94\u5934\u5DF2\u914D\u7F6E\uFF1B
- [ ] \u6CE8\u518C\u3001\u5BC6\u7801\u767B\u5F55\u3001\u6444\u50CF\u5934\u5237\u8138\u548C\u89E3\u7ED1\u5DF2\u56DE\u5F52\uFF1B
- [ ] \u5DE5\u4F5C\u53F0\u3001\u4E03\u4E2A\u6A21\u5757\u548C\u5168\u90E8\u6E29\u5BA4\u5165\u53E3\u5DF2\u56DE\u5F52\uFF1B
- [ ] \u5B9E\u666F/\u6570\u5B57\u5B6A\u751F\u3001\u53F3\u4FA7\u680F\u6EDA\u52A8\u548C\u68C0\u6D4B\u6846\u5DF2\u56DE\u5F52\uFF1B
- [ ] \u8BBE\u5907\u63A7\u5236\u6709\u6388\u6743\u3001\u5BA1\u8BA1\u548C\u5931\u8D25\u56DE\u6EDA\uFF1B
- [ ] \u76D1\u63A7\u3001\u544A\u8B66\u3001\u65E5\u5FD7\u8131\u654F\u548C\u5BB9\u91CF\u9608\u503C\u5DF2\u914D\u7F6E\uFF1B
- [ ] LingBot-Map \u4E0E LocateAnything \u82E5\u672A\u5B8C\u6210\u9A8C\u6536\uFF0C\u754C\u9762\u660E\u786E\u6807\u6CE8\u4E3A\u89C4\u5212/\u5B9E\u9A8C\u80FD\u529B\uFF1B
- [ ] \u673A\u5668\u4EBA\u5B9E\u673A\u6D4B\u8BD5\u5177\u5907\u6025\u505C\u3001\u9650\u901F\u3001\u9694\u79BB\u533A\u548C\u4EBA\u5DE5\u76D1\u62A4\u3002

## 20. \u6280\u672F\u6F14\u8FDB\u4F18\u5148\u7EA7

1. \u5F15\u5165\u6570\u636E\u5E93\u8FC1\u79FB\u3001\u751F\u4EA7\u914D\u7F6E\u6A21\u677F\u548C CI \u6784\u5EFA\uFF1B
2. \u8865\u9F50\u524D\u7AEF\u7EC4\u4EF6\u6D4B\u8BD5\u4E0E\u7AEF\u5230\u7AEF\u56DE\u5F52\uFF1B
3. \u5C06 YOLO \u79BB\u7EBF\u94FE\u8DEF\u5347\u7EA7\u4E3A\u72EC\u7ACB\u5B9E\u65F6\u63A8\u7406\u670D\u52A1\uFF1B
4. \u5B8C\u6210 LingBot-Map \u5355\u68DA\u79BB\u7EBF\u91CD\u5EFA\u548C Web \u5C55\u793A PoC\uFF1B
5. \u5B8C\u6210\u5C3A\u5EA6\u6807\u5B9A\u3001\u5360\u636E\u5730\u56FE\u8F6C\u6362\u548C\u4EFF\u771F\u5BFC\u822A\uFF1B
6. \u5728\u76EE\u6807 GPU \u4E0A\u8BC4\u4F30 LocateAnything\uFF0C\u5F62\u6210 YOLO + \u5F00\u653E\u8BCD\u6C47\u5206\u5C42\u65B9\u6848\uFF1B
7. \u5728\u4E25\u683C\u5B89\u5168\u6761\u4EF6\u4E0B\u5F00\u5C55\u673A\u5668\u4EBA\u5C01\u95ED\u573A\u5730\u6D4B\u8BD5\uFF1B
8. \u5EFA\u7ACB\u6570\u636E\u3001\u6A21\u578B\u3001\u5730\u56FE\u548C\u90E8\u7F72\u7248\u672C\u7684\u7EDF\u4E00\u8FFD\u8E2A\u4F53\u7CFB\u3002

## 21. \u4E94\u9879\u89C4\u5212\u7684\u5DE5\u7A0B\u5B9E\u65BD\u84DD\u56FE

\u672C\u7AE0\u5C06 3.2 \u8282\u5217\u51FA\u7684\u89C4\u5212\u80FD\u529B\u5C55\u5F00\u4E3A\u53EF\u6267\u884C\u65B9\u6848\u3002\u5EFA\u8BAE\u9075\u5FAA\u201C\u5148\u79BB\u7EBF\u9A8C\u8BC1\u3001\u518D\u5728\u7EBF\u89C2\u6D4B\u3001\u6700\u540E\u95ED\u73AF\u63A7\u5236\u201D\u7684\u987A\u5E8F\u3002\u4EFB\u4F55\u5B9E\u9A8C\u6A21\u578B\u90FD\u4E0D\u80FD\u672A\u7ECF\u4EBA\u5DE5\u5BA1\u6838\u76F4\u63A5\u63A7\u5236\u704C\u6E89\u8BBE\u5907\u6216\u673A\u5668\u4EBA\u3002

### 21.1 \u603B\u4F53\u76EE\u6807\u67B6\u6784

\`\`\`mermaid
flowchart TB
    subgraph Edge[\u519C\u573A\u8FB9\u7F18\u8282\u70B9]
        CAM[\u5355\u76EE\u6444\u50CF\u5934/RTSP]
        ROBOT[\u519C\u4E1A\u673A\u5668\u4EBA ROS 2]
        YOLO[YOLO \u5B9E\u65F6\u63A8\u7406]
        BUFFER[\u65AD\u7F51\u7F13\u51B2]
    end

    subgraph AI[GPU \u7B97\u6CD5\u670D\u52A1]
        MAP[LingBot-Map \u91CD\u5EFA\u670D\u52A1]
        LOC[LocateAnything \u5F00\u653E\u8BCD\u6C47\u5B9A\u4F4D]
        POST[\u70B9\u4E91\u4E0E\u5730\u56FE\u540E\u5904\u7406]
    end

    subgraph Platform[\u4E1A\u52A1\u5E73\u53F0]
        API[Spring Boot API]
        MQ[\u4E8B\u4EF6\u603B\u7EBF]
        WS[WebSocket/SSE \u7F51\u5173]
        DB[(MySQL \u5143\u6570\u636E)]
        OBJ[(S3 \u517C\u5BB9\u5BF9\u8C61\u5B58\u50A8)]
        OBS[\u65E5\u5FD7/\u6307\u6807/\u94FE\u8DEF\u8FFD\u8E2A]
    end

    CAM --> YOLO
    CAM --> BUFFER
    BUFFER --> MAP
    YOLO --> MQ
    YOLO --> LOC
    MAP --> POST
    POST --> OBJ
    POST --> ROBOT
    MQ --> API
    API --> DB
    API --> OBJ
    MQ --> WS
    WS --> WEB[Vue/Three.js]
    Platform --> OBS
    AI --> OBS
    Edge --> OBS
\`\`\`

\u804C\u8D23\u8FB9\u754C\uFF1ASpring Boot \u7BA1\u7406\u7528\u6237\u3001\u6743\u9650\u3001\u4EFB\u52A1\u548C\u4E1A\u52A1\u72B6\u6001\uFF1BPython/GPU \u670D\u52A1\u8D1F\u8D23\u6A21\u578B\u63A8\u7406\uFF1B\u5BF9\u8C61\u5B58\u50A8\u4FDD\u5B58\u89C6\u9891\u3001\u70B9\u4E91\u548C\u5730\u56FE\u5927\u6587\u4EF6\uFF1BMySQL \u53EA\u4FDD\u5B58\u53EF\u67E5\u8BE2\u5143\u6570\u636E\uFF1BROS 2 \u8D1F\u8D23\u673A\u5668\u4EBA\u5B9A\u4F4D\u3001\u89C4\u5212\u548C\u63A7\u5236\u3002

## 22. LingBot-Map \u5355\u76EE\u4E09\u7EF4\u91CD\u5EFA\u89C4\u5212

\u5B98\u65B9\u4ED3\u5E93\uFF1A[robbyant/lingbot-map](https://github.com/robbyant/lingbot-map)\u3002\u9879\u76EE\u652F\u6301\u56FE\u7247\u76EE\u5F55\u6216\u89C6\u9891\u8F93\u5165\uFF0C\u5E76\u63D0\u4F9B \`streaming\` \u4E0E \`windowed\` \u6A21\u5F0F\u3002\u5B98\u65B9\u793A\u4F8B\u5BF9\u957F\u4E8E 500 \u5E27\u7684\u5E8F\u5217\u63A8\u8350\u7A97\u53E3\u6A21\u5F0F\uFF0C\u5173\u952E\u5E27\u3001\u7A97\u53E3\u5927\u5C0F\u3001\u91CD\u53E0\u957F\u5EA6\u3001\u91C7\u6837 FPS \u548C\u76F8\u673A\u4F18\u5316\u6B21\u6570\u5747\u53EF\u914D\u7F6E\u3002

### 22.1 \u4E1A\u52A1\u76EE\u6807

1. \u4F7F\u7528\u666E\u901A RGB \u5355\u76EE\u6444\u50CF\u5934\u91C7\u96C6\u68DA\u5185\u901A\u9053\u3001\u68DA\u67B6\u3001\u4F5C\u7269\u548C\u56FA\u5B9A\u8BBE\u65BD\uFF1B
2. \u751F\u6210\u5E26\u989C\u8272\u70B9\u4E91\u3001\u76F8\u673A\u8F68\u8FF9\u548C\u53EF\u4F9B\u7F51\u9875\u5C55\u793A\u7684\u8F7B\u91CF\u4E09\u7EF4\u4EA7\u7269\uFF1B
3. \u5728\u5B8C\u6210\u5C3A\u5EA6\u6807\u5B9A\u4E0E\u5730\u56FE\u540E\u5904\u7406\u540E\uFF0C\u4E3A\u673A\u5668\u4EBA\u63D0\u4F9B\u5019\u9009\u5BFC\u822A\u5E95\u56FE\uFF1B
4. \u901A\u8FC7\u5730\u56FE\u7248\u672C\u5BF9\u6BD4\u8BC6\u522B\u68DA\u5185\u7ED3\u6784\u6216\u79CD\u690D\u5E03\u5C40\u53D8\u5316\u3002

\u7B2C\u4E00\u9636\u6BB5\u4E0D\u627F\u8BFA\u5B9E\u65F6 SLAM\uFF0C\u4E5F\u4E0D\u627F\u8BFA\u5355\u6B21\u91CD\u5EFA\u7ED3\u679C\u53EF\u76F4\u63A5\u5BFC\u822A\u3002\u76EE\u6807\u5E94\u662F\u201C\u7A33\u5B9A\u79BB\u7EBF\u91CD\u5EFA\u5E76\u53EF\u4EBA\u5DE5\u5BA1\u6838\u201D\u3002

### 22.2 \u91C7\u96C6\u89C4\u8303

| \u9879\u76EE | \u5EFA\u8BAE\u89C4\u5219 | \u539F\u56E0 |
|---|---|---|
| \u76F8\u673A | \u56FA\u5B9A\u7126\u8DDD\u3001\u5173\u95ED\u6570\u5B57\u53D8\u7126\uFF0C\u8BB0\u5F55\u5185\u53C2 | \u4FDD\u6301\u6295\u5F71\u6A21\u578B\u4E00\u81F4 |
| \u5206\u8FA8\u7387 | \u539F\u89C6\u9891\u4FDD\u7559\uFF0C\u63A8\u7406\u6309\u6A21\u578B\u8981\u6C42\u7F29\u653E | \u4FBF\u4E8E\u4EE5\u540E\u91CD\u7B97 |
| \u5E27\u7387 | \u539F\u59CB 25/30 FPS\uFF0C\u63A8\u7406\u5148\u8BD5 5\u201310 FPS | \u964D\u4F4E\u76F8\u90BB\u5E27\u5197\u4F59 |
| \u8FD0\u52A8 | \u4F4E\u901F\u3001\u5E73\u7A33\u3001\u907F\u514D\u6025\u8F6C\u548C\u5927\u5E45\u6296\u52A8 | \u51CF\u5C11\u8FD0\u52A8\u6A21\u7CCA |
| \u8DEF\u7EBF | \u901A\u9053\u5F80\u8FD4\u5E76\u5305\u542B\u53EF\u8BC6\u522B\u7684\u4EA4\u53C9\u89C6\u89D2 | \u63D0\u5347\u8986\u76D6\u548C\u5BF9\u9F50\u80FD\u529B |
| \u5149\u7167 | \u5206\u522B\u91C7\u96C6\u767D\u5929\u3001\u80CC\u5149\u548C\u8865\u5149\u6761\u4EF6 | \u68C0\u9A8C\u6E29\u5BA4\u5149\u7167\u9C81\u68D2\u6027 |
| \u6807\u5C3A | \u8BBE\u7F6E\u5DF2\u77E5\u5C3A\u5BF8\u6807\u5FD7\u7269\u6216\u6D4B\u91CF\u63A7\u5236\u70B9 | \u6062\u590D\u7C73\u5236\u5C3A\u5EA6 |
| \u52A8\u6001\u7269\u4F53 | \u9996\u6B21\u5EFA\u56FE\u5C3D\u91CF\u6E05\u573A | \u964D\u4F4E\u4EBA\u5458\u3001\u673A\u5668\u4EBA\u9020\u6210\u7684\u4F2A\u70B9 |

\u6BCF\u6B21\u91C7\u96C6\u5FC5\u987B\u8BB0\u5F55\uFF1A\`tenantId\`\u3001\`farmId\`\u3001\`greenhouseId\`\u3001\u76F8\u673A ID\u3001\u5185\u53C2\u7248\u672C\u3001\u89C6\u9891\u5F00\u59CB/\u7ED3\u675F\u65F6\u95F4\u3001\u91C7\u96C6\u8DEF\u7EBF\u3001\u64CD\u4F5C\u8005\u548C\u6807\u5C3A\u6570\u636E\u3002

### 22.3 \u91CD\u5EFA\u4EFB\u52A1\u914D\u7F6E

\u5EFA\u8BAE\u4FDD\u5B58\u4EE5\u4E0B\u914D\u7F6E\uFF0C\u800C\u4E0D\u662F\u628A\u547D\u4EE4\u53C2\u6570\u6563\u843D\u5728\u811A\u672C\u4E2D\uFF1A

\`\`\`yaml
mappingJob:
  mode: windowed
  sampleFps: 8
  imageSize: 518
  windowSize: 64
  overlapSize: 16
  keyframeInterval: 2
  cameraIterations: 4
  offloadToCpu: true
  modelVersion: lingbot-map@pinned-commit
\`\`\`

- \u77ED\u89C6\u9891\u5148\u4F7F\u7528 \`streaming\`\uFF0C\u9010\u5E27\u5904\u7406\u5E76\u5229\u7528 KV cache\uFF1B
- \u957F\u5E8F\u5217\u4F7F\u7528 \`windowed\`\uFF0C\u901A\u8FC7\u91CD\u53E0\u5E27\u8FDB\u884C\u7A97\u53E3\u8854\u63A5\uFF1B
- \`keyframeInterval\` \u8D8A\u5927\uFF0C\u663E\u5B58\u4E0E\u8017\u65F6\u8D8A\u4F4E\uFF0C\u4F46\u53EF\u80FD\u635F\u5931\u5FEB\u901F\u8F6C\u5F2F\u5904\u7684\u4FE1\u606F\uFF1B
- \`cameraIterations=1\` \u53EF\u7528\u4E8E\u5FEB\u901F\u9884\u89C8\uFF0C\u6B63\u5F0F\u53D1\u5E03\u4F7F\u7528\u7ECF\u8FC7\u9A8C\u8BC1\u7684\u914D\u7F6E\uFF1B
- \u6A21\u578B\u4ED3\u5E93\u5FC5\u987B\u56FA\u5B9A commit \u548C\u6743\u91CD\u6821\u9A8C\u548C\uFF0C\u907F\u514D\u540C\u4E00\u4EFB\u52A1\u65E0\u6CD5\u590D\u73B0\u3002

### 22.4 \u4EFB\u52A1 API \u4E0E\u72B6\u6001\u673A

\`\`\`http
POST /api/v1/farms/{farmId}/greenhouses/{greenhouseId}/mapping-sessions
Idempotency-Key: <uuid>
Content-Type: application/json

{
  "cameraId": "cam-gh01-01",
  "captureType": "VIDEO",
  "calibrationVersion": "calib-2026-08-01",
  "requestedMode": "WINDOWED"
}
\`\`\`

\u670D\u52A1\u8FD4\u56DE \`sessionId\` \u548C\u9884\u7B7E\u540D\u4E0A\u4F20\u5730\u5740\u3002\u5927\u6587\u4EF6\u4E0D\u7ECF\u8FC7 Spring Boot \u8F6C\u53D1\uFF0C\u5E94\u7531\u5BA2\u6237\u7AEF\u76F4\u63A5\u5206\u7247\u4E0A\u4F20\u5BF9\u8C61\u5B58\u50A8\u3002

\u72B6\u6001\u673A\uFF1A

\`\`\`text
CREATED \u2192 UPLOADING \u2192 VALIDATING \u2192 QUEUED \u2192 RECONSTRUCTING
        \u2192 POST_PROCESSING \u2192 REVIEW_REQUIRED \u2192 PUBLISHED
\`\`\`

\u4EFB\u4F55\u9636\u6BB5\u53EF\u8FDB\u5165 \`FAILED\`\uFF1B\u5931\u8D25\u8BB0\u5F55 \`errorCode\`\u3001\u53EF\u91CD\u8BD5\u6027\u3001\u6A21\u578B\u65E5\u5FD7\u4F4D\u7F6E\u548C\u6700\u540E\u6210\u529F\u9636\u6BB5\u3002\`PUBLISHED\` \u5FC5\u987B\u7531\u6709\u6743\u9650\u4EBA\u5458\u5BA1\u6838\u89E6\u53D1\u3002

### 22.5 \u91CD\u5EFA\u4EA7\u7269

| \u4EA7\u7269 | \u683C\u5F0F\u5EFA\u8BAE | \u7528\u9014 |
|---|---|---|
| \u539F\u59CB\u89C6\u9891 | MP4 | \u5BA1\u8BA1\u548C\u91CD\u65B0\u8BA1\u7B97 |
| \u62BD\u53D6\u5E27\u6E05\u5355 | JSON/Parquet | \u91CD\u5EFA\u53EF\u590D\u73B0\u6027 |
| \u76F8\u673A\u8F68\u8FF9 | JSON/TUM \u683C\u5F0F | \u8F68\u8FF9\u8BC4\u4F30\u4E0E\u5750\u6807\u8F6C\u6362 |
| \u539F\u59CB\u70B9\u4E91 | PLY/PCD | \u7B97\u6CD5\u540E\u5904\u7406 |
| \u7F51\u9875\u6A21\u578B | GLB \u6216\u5206\u5757\u70B9\u4E91 | Three.js \u5C55\u793A |
| \u5360\u636E\u5730\u56FE | PGM+YAML / OccupancyGrid | ROS 2 \u5BFC\u822A |
| \u914D\u7F6E\u5FEB\u7167 | YAML | \u53C2\u6570\u3001\u7248\u672C\u548C\u6821\u9A8C\u548C |
| \u8D28\u91CF\u62A5\u544A | JSON+HTML | \u4EBA\u5DE5\u5BA1\u6838\u548C\u9A8C\u6536 |

### 22.6 \u8D28\u91CF\u95E8\u7981

\u53D1\u5E03\u524D\u81EA\u52A8\u68C0\u67E5\uFF1A\u89C6\u9891\u53EF\u89E3\u7801\u7387\u3001\u6709\u6548\u5E27\u6BD4\u4F8B\u3001\u6A21\u7CCA\u7387\u3001\u8F68\u8FF9\u8DF3\u53D8\u3001\u70B9\u4E91\u79BB\u7FA4\u6BD4\u4F8B\u3001\u5730\u9762\u5E73\u6574\u5EA6\u3001\u5C3A\u5EA6\u8BEF\u5DEE\u3001\u8986\u76D6\u7387\u548C\u4EA7\u7269\u5B8C\u6574\u6027\u3002\u4EFB\u4E00\u5173\u952E\u9879\u8D85\u9608\u503C\u65F6\u8FDB\u5165 \`REVIEW_REQUIRED\`\uFF0C\u4E0D\u80FD\u81EA\u52A8\u6210\u4E3A\u673A\u5668\u4EBA\u5730\u56FE\u3002

## 23. \u70B9\u4E91\u5230\u673A\u5668\u4EBA\u5360\u636E\u5730\u56FE\u4E0E\u5BFC\u822A\u5750\u6807\u7CFB

Nav2 \u4F7F\u7528 \`map\`\u3001\`odom\`\u3001\`base_link\` \u7B49\u5750\u6807\u5E27\uFF1B\`map\` \u662F\u5168\u5C40\u4E00\u81F4\u5750\u6807\uFF0C\`odom\` \u63D0\u4F9B\u5C40\u90E8\u8FDE\u7EED\u8FD0\u52A8\uFF0C\`base_link\` \u8868\u793A\u673A\u5668\u4EBA\u672C\u4F53\u3002\u5B98\u65B9 Nav2 \u6587\u6863\u8BF4\u660E\u5176\u4E8C\u7EF4\u4EE3\u4EF7\u5730\u56FE\u7531\u9759\u6001\u5C42\u3001\u969C\u788D\u5C42\u3001\u4F53\u7D20\u5C42\u3001\u81A8\u80C0\u5C42\u7B49\u7EC4\u6210\uFF1A[Nav2 Mapping and Localization](https://docs.nav2.org/setup_guides/sensors/mapping_localization.html)\u3001[Nav2 Transformations](https://docs.nav2.org/setup_guides/transformation/setup_transforms.html)\u3002

### 23.1 \u8F6C\u6362\u6D41\u6C34\u7EBF

\`\`\`text
LingBot \u70B9\u4E91\u4E0E\u76F8\u673A\u4F4D\u59FF
 \u2192 \u5750\u6807\u8F74\u7EDF\u4E00
 \u2192 \u7C73\u5236\u5C3A\u5EA6\u6062\u590D
 \u2192 \u7578\u53D8/\u79BB\u7FA4\u70B9\u8FC7\u6EE4
 \u2192 \u5730\u9762\u5E73\u9762\u4F30\u8BA1
 \u2192 \u56FA\u5B9A\u7ED3\u6784\u4E0E\u52A8\u6001\u7269\u4F53\u5206\u79BB
 \u2192 \u4F53\u7D20\u964D\u91C7\u6837
 \u2192 \u673A\u5668\u4EBA\u9AD8\u5EA6\u8303\u56F4\u5207\u7247
 \u2192 \u4E8C\u7EF4\u5360\u636E\u6982\u7387\u6805\u683C
 \u2192 \u4EBA\u5DE5\u7F16\u8F91\u7981\u884C\u533A/\u9650\u901F\u533A
 \u2192 Nav2 \u9759\u6001\u5730\u56FE\u4E0E\u4EE3\u4EF7\u5730\u56FE
\`\`\`

### 23.2 \u5750\u6807\u94FE

\`\`\`text
map \u2192 odom \u2192 base_link \u2192 camera_link \u2192 camera_optical_frame
\`\`\`

- \`map\u2192odom\`\uFF1A\u7531\u5B9A\u4F4D\u7CFB\u7EDF\u4FEE\u6B63\u5168\u5C40\u6F02\u79FB\uFF1B
- \`odom\u2192base_link\`\uFF1A\u7531\u8F6E\u901F\u3001\u89C6\u89C9\u91CC\u7A0B\u8BA1\u6216\u878D\u5408\u5B9A\u4F4D\u8FDE\u7EED\u53D1\u5E03\uFF1B
- \`base_link\u2192camera_link\`\uFF1A\u76F8\u673A\u76F8\u5BF9\u8F66\u4F53\u7684\u5916\u53C2\uFF0C\u901A\u5E38\u7531 URDF/robot_state_publisher \u53D1\u5E03\uFF1B
- \`reconstruction\u2192map\`\uFF1A\u7531\u63A7\u5236\u70B9\u548C\u5C3A\u5EA6\u6807\u5B9A\u8BA1\u7B97\uFF0C\u5FC5\u987B\u968F\u5730\u56FE\u7248\u672C\u4FDD\u5B58\u3002

\u53D8\u6362\u8BB0\u5F55\u81F3\u5C11\u5305\u542B\u5E73\u79FB\u3001\u56DB\u5143\u6570\u3001\u5C3A\u5EA6\u3001\u7B97\u6CD5\u7248\u672C\u3001\u63A7\u5236\u70B9\u6B8B\u5DEE\u548C\u6807\u5B9A\u65F6\u95F4\u3002\u4E0D\u8981\u5728\u524D\u7AEF\u4EE3\u7801\u4E2D\u786C\u7F16\u7801\u5750\u6807\u504F\u79FB\u3002

### 23.3 OccupancyGrid \u751F\u6210

ROS \`nav_msgs/OccupancyGrid\` \u4E2D\u901A\u5E38\u7528 \`-1\` \u8868\u793A\u672A\u77E5\u3001\`0\` \u8868\u793A\u7A7A\u95F2\u3001\`100\` \u8868\u793A\u5360\u7528\u3002\u9879\u76EE\u8F6C\u6362\u5668\u5E94\u914D\u7F6E\uFF1A

- \u5206\u8FA8\u7387\uFF0C\u4F8B\u5982 0.03\u20130.10 m/cell\uFF0C\u901A\u8FC7\u673A\u5668\u4EBA\u5BBD\u5EA6\u548C\u901A\u9053\u5BBD\u5EA6\u5B9E\u6D4B\u9009\u62E9\uFF1B
- \u5730\u9762\u4E0A\u65B9\u969C\u788D\u5207\u7247\u9AD8\u5EA6\uFF1B
- \u6700\u5C0F\u70B9\u5BC6\u5EA6\u548C\u5360\u7528\u6982\u7387\u9608\u503C\uFF1B
- \u5B54\u6D1E\u586B\u5145\u3001\u8150\u8680/\u81A8\u80C0\u534A\u5F84\uFF1B
- \u673A\u5668\u4EBA footprint \u548C\u5B89\u5168\u81A8\u80C0\u8DDD\u79BB\uFF1B
- \u6E29\u5BA4\u8FB9\u754C\u3001\u7981\u884C\u533A\u3001\u9650\u901F\u533A\u548C\u6389\u843D\u98CE\u9669\u533A\u3002

Nav2 \u4E2D \`0\u2013254\` \u7684\u4EE3\u4EF7\u503C\u7528\u4E8E\u8868\u793A\u4ECE\u81EA\u7531\u901A\u884C\u5230\u81F4\u547D\u969C\u788D\u7684\u4EE3\u4EF7\u3002\u5EFA\u8BAE\u4FDD\u7559\uFF1A\u9759\u6001\u5730\u56FE\u5C42\u3001\u5B9E\u65F6\u89C6\u89C9\u969C\u788D\u5C42\u3001\u81A8\u80C0\u5C42\u3001\u7981\u884C\u533A\u8FC7\u6EE4\u5668\u548C\u9650\u901F\u533A\u8FC7\u6EE4\u5668\u3002\u9759\u6001 LingBot \u5730\u56FE\u4E0D\u80FD\u66FF\u4EE3\u5B9E\u65F6\u907F\u969C\u3002

### 23.4 \u5BFC\u822A\u63A5\u5165\u6B65\u9AA4

1. \u5BFC\u51FA PGM/YAML \u6216\u76F4\u63A5\u53D1\u5E03 \`/map\`\uFF1B
2. \u5728 RViz \u68C0\u67E5\u65B9\u5411\u3001\u6BD4\u4F8B\u3001\u539F\u70B9\u548C\u901A\u9053\u5BBD\u5EA6\uFF1B
3. \u914D\u7F6E URDF\u3001\u673A\u5668\u4EBA footprint \u548C TF\uFF1B
4. \u878D\u5408\u8F6E\u901F\u4E0E IMU\uFF0C\u63D0\u4F9B\u8FDE\u7EED \`odom\u2192base_link\`\uFF1B
5. \u9009\u62E9\u9002\u5408\u89C6\u89C9\u8F93\u5165\u7684\u5B9A\u4F4D\u65B9\u6848\u5E76\u53D1\u5E03 \`map\u2192odom\`\uFF1B
6. \u914D\u7F6E\u5168\u5C40/\u5C40\u90E8 costmap\u3001\u89C4\u5212\u5668\u548C\u63A7\u5236\u5668\uFF1B
7. \u4EFF\u771F\u6216 rosbag \u56DE\u653E\u9A8C\u8BC1\uFF1B
8. \u7A7A\u68DA\u4F4E\u901F\u6D4B\u8BD5\uFF1B
9. \u589E\u52A0\u4EBA\u5458\u3001\u8F66\u8F86\u548C\u79FB\u52A8\u5DE5\u5177\u7B49\u52A8\u6001\u969C\u788D\u6D4B\u8BD5\uFF1B
10. \u901A\u8FC7\u6025\u505C\u3001\u5931\u8054\u505C\u8F66\u548C\u4EBA\u5DE5\u63A5\u7BA1\u9A8C\u6536\u540E\u518D\u8FDB\u5165\u751F\u4EA7\u8BD5\u8FD0\u884C\u3002

### 23.5 \u5730\u56FE\u7248\u672C\u7BA1\u7406

\u5730\u56FE\u8BB0\u5F55\u5EFA\u8BAE\u5305\u542B\uFF1A

\`\`\`text
map_id, tenant_id, farm_id, greenhouse_id, version,
source_session_id, calibration_version, resolution,
origin_x, origin_y, origin_yaw, scale,
artifact_uri, checksum, quality_score,
status, approved_by, approved_at, created_at
\`\`\`

\u540C\u4E00\u6E29\u5BA4\u53EA\u80FD\u6709\u4E00\u4E2A \`ACTIVE\` \u5BFC\u822A\u5730\u56FE\uFF0C\u4F46\u5FC5\u987B\u4FDD\u7559\u5386\u53F2\u7248\u672C\u548C\u5FEB\u901F\u56DE\u6EDA\u3002\u68DA\u67B6\u79FB\u52A8\u3001\u4F5C\u7269\u663E\u8457\u957F\u9AD8\u3001\u8BBE\u5907\u6362\u4F4D\u6216\u901A\u9053\u6539\u53D8\u65F6\u89E6\u53D1\u91CD\u65B0\u5EFA\u56FE\u8BC4\u4F30\u3002

## 24. \u5728\u7EBF\u76F8\u673A\u6D41\u3001\u8FB9\u7F18\u63A8\u7406\u4E0E\u5B9E\u65F6\u6D88\u606F\u901A\u9053

### 24.1 \u89C6\u9891\u63A5\u5165

\u63A8\u8350\u94FE\u8DEF\uFF1A

\`\`\`text
RTSP \u6444\u50CF\u5934 \u2192 \u8FB9\u7F18\u7F51\u5173/GStreamer \u2192 \u89E3\u7801 \u2192 \u5E27\u91C7\u6837
  \u251C\u2500 \u4F4E\u5EF6\u8FDF\u5E27 \u2192 YOLO/TensorRT
  \u251C\u2500 \u5173\u952E\u4E8B\u4EF6\u7247\u6BB5 \u2192 \u5BF9\u8C61\u5B58\u50A8
  \u2514\u2500 \u5EFA\u56FE\u7247\u6BB5 \u2192 LingBot-Map \u4EFB\u52A1
\`\`\`

\u6444\u50CF\u5934\u6CE8\u518C\u4FE1\u606F\u5305\u62EC\u79DF\u6237\u3001\u519C\u573A\u3001\u6E29\u5BA4\u3001RTSP \u5BC6\u6587\u5F15\u7528\u3001\u5B89\u88C5\u4F4D\u7F6E\u3001\u65B9\u5411\u3001\u5185\u53C2\u3001\u5728\u7EBF\u72B6\u6001\u548C\u4FDD\u7559\u7B56\u7565\u3002\u5E73\u53F0\u4E0D\u5F97\u628A RTSP \u5BC6\u7801\u8FD4\u56DE\u6D4F\u89C8\u5668\u3002

\u6D4F\u89C8\u5668\u89C2\u770B\u4F18\u5148\u7531\u7F51\u5173\u8F6C\u6362\u4E3A WebRTC\uFF1BHLS \u53EF\u4F5C\u4E3A\u9AD8\u5EF6\u8FDF\u517C\u5BB9\u65B9\u6848\u3002\u4E0D\u8981\u8BA9\u6BCF\u4E2A\u6D4F\u89C8\u5668\u76F4\u63A5\u8FDE\u63A5\u76F8\u673A\uFF0C\u5426\u5219\u4F1A\u9020\u6210\u8FDE\u63A5\u6570\u5931\u63A7\u548C\u51ED\u636E\u6CC4\u9732\u3002

### 24.2 \u8FB9\u7F18\u63A8\u7406\u670D\u52A1

\u8FB9\u7F18\u8282\u70B9\u8D1F\u8D23\uFF1A

- \u6444\u50CF\u5934\u65AD\u7EBF\u91CD\u8FDE\u548C\u5FC3\u8DF3\uFF1B
- \u6309\u6A21\u578B\u9700\u8981\u7F29\u653E\u3001\u5F52\u4E00\u5316\u548C\u6279\u5904\u7406\uFF1B
- YOLO \u63A8\u7406\u4E0E ByteTrack \u8DDF\u8E2A\uFF1B
- \u76EE\u6807\u8D8A\u7EBF\u3001\u533A\u57DF\u5165\u4FB5\u3001\u6EDE\u7559\u7B49\u672C\u5730\u89C4\u5219\uFF1B
- \u65AD\u7F51\u671F\u95F4\u4E8B\u4EF6\u7F13\u51B2\u548C\u6062\u590D\u540E\u8865\u4F20\uFF1B
- \u4EC5\u4E0A\u4F20\u4E8B\u4EF6\u622A\u56FE/\u77ED\u7247\uFF0C\u964D\u4F4E\u5E26\u5BBD\u4E0E\u9690\u79C1\u98CE\u9669\u3002

\u63A8\u8350\u5C06\u6A21\u578B\u6253\u5305\u6210\u7248\u672C\u5316\u5BB9\u5668\u3002\u6A21\u578B\u53D1\u5E03\u91C7\u7528 \`STAGING \u2192 CANARY \u2192 ACTIVE \u2192 RETIRED\`\uFF0C\u652F\u6301\u6309\u6444\u50CF\u5934\u7070\u5EA6\u5207\u6362\u548C\u4E00\u952E\u56DE\u9000\u3002

### 24.3 \u4E8B\u4EF6\u6D88\u606F\u6A21\u578B

\`\`\`json
{
  "schemaVersion": "1.0",
  "eventId": "evt_01...",
  "tenantId": "tenant_demo",
  "farmId": "farm-01",
  "greenhouseId": "gh-01",
  "cameraId": "cam-gh01-01",
  "capturedAt": "2026-08-05T15:30:02.123+08:00",
  "model": {"name": "greenhouse-yolo", "version": "1.3.0"},
  "type": "DETECTION",
  "detections": [
    {"trackId": 17, "label": "person", "confidence": 0.91,
     "box": {"x": 0.12, "y": 0.20, "w": 0.18, "h": 0.52}}
  ],
  "snapshotUri": "s3://tenant-demo/events/2026/08/05/evt_01.jpg",
  "traceId": "..."
}
\`\`\`

\u6846\u5750\u6807\u7EDF\u4E00\u4F7F\u7528\u76F8\u5BF9\u503C \`0\u20131\`\uFF0C\u5E76\u4FDD\u7559\u6E90\u5E27\u5BBD\u9AD8\u3002\u6D88\u606F\u5FC5\u987B\u5305\u542B schema \u548C\u6A21\u578B\u7248\u672C\u3002\u6D88\u8D39\u8005\u6309 \`eventId\` \u5E42\u7B49\u5904\u7406\uFF0C\u907F\u514D\u6D88\u606F\u91CD\u6295\u9020\u6210\u91CD\u590D\u544A\u8B66\u3002

### 24.4 \u6D88\u606F\u901A\u9053\u9009\u62E9

| \u901A\u9053 | \u7528\u9014 |
|---|---|
| MQTT | \u8FB9\u7F18\u8BBE\u5907\u5FC3\u8DF3\u3001\u5C0F\u578B\u9065\u6D4B\u548C\u5F31\u7F51\u573A\u666F |
| Kafka/\u517C\u5BB9\u4E8B\u4EF6\u6D41 | \u5927\u89C4\u6A21\u68C0\u6D4B\u4E8B\u4EF6\u3001\u53EF\u56DE\u653E\u6570\u636E\u7BA1\u9053 |
| WebSocket | \u6D4F\u89C8\u5668\u5B9E\u65F6\u68C0\u6D4B\u6846\u548C\u72B6\u6001\u53CC\u5411\u4EA4\u4E92 |
| SSE | \u5355\u5411\u4EFB\u52A1\u8FDB\u5EA6\u3001\u544A\u8B66\u548C\u5EFA\u56FE\u72B6\u6001 |
| REST | \u67E5\u8BE2\u5386\u53F2\u3001\u4E0B\u53D1\u4F4E\u9891\u914D\u7F6E\u548C\u4EBA\u5DE5\u64CD\u4F5C |

\u5C0F\u89C4\u6A21\u90E8\u7F72\u53EF\u5148\u4F7F\u7528 MQTT + WebSocket\uFF1B\u89C4\u6A21\u6269\u5927\u540E\u518D\u5F15\u5165\u6301\u4E45\u4E8B\u4EF6\u603B\u7EBF\u3002Spring Boot \u6D88\u8D39\u63A8\u7406\u4E8B\u4EF6\uFF0C\u751F\u6210\u4E1A\u52A1\u544A\u8B66\u5E76\u901A\u8FC7 WebSocket/SSE \u63A8\u9001\uFF0C\u4E0D\u8F6C\u53D1\u6BCF\u4E00\u5E27\u539F\u59CB\u56FE\u50CF\u3002

### 24.5 \u964D\u7EA7\u7B56\u7565

- GPU \u5FD9\uFF1A\u964D\u4F4E\u91C7\u6837 FPS\uFF0C\u4FDD\u7559\u544A\u8B66\u7C7B\u522B\u4F18\u5148\u7EA7\uFF1B
- \u6D88\u606F\u603B\u7EBF\u4E0D\u53EF\u7528\uFF1A\u8FB9\u7F18\u78C1\u76D8\u6709\u754C\u7F13\u51B2\uFF0C\u8D85\u8FC7\u9608\u503C\u5148\u4E22\u666E\u901A\u5E27\u3001\u4FDD\u7559\u544A\u8B66\uFF1B
- \u5BF9\u8C61\u5B58\u50A8\u4E0D\u53EF\u7528\uFF1A\u4E8B\u4EF6\u5148\u4FDD\u5B58\u672C\u5730\uFF0C\u754C\u9762\u663E\u793A\u201C\u5A92\u4F53\u5F85\u540C\u6B65\u201D\uFF1B
- \u7F51\u7EDC\u4E2D\u65AD\uFF1A\u672C\u5730\u89C4\u5219\u7EE7\u7EED\u62A5\u8B66\uFF0C\u6062\u590D\u540E\u6309\u65F6\u95F4\u987A\u5E8F\u8865\u4F20\uFF1B
- \u6A21\u578B\u5F02\u5E38\uFF1A\u5207\u6362\u4E0A\u4E00\u7A33\u5B9A\u7248\u672C\u5E76\u89E6\u53D1\u8FD0\u7EF4\u544A\u8B66\u3002

## 25. NVIDIA LocateAnything \u5F00\u653E\u8BCD\u6C47\u5B9A\u4F4D\u89C4\u5212

\u5B98\u65B9\u9879\u76EE\u9875\uFF1A[NVIDIA LocateAnything](https://research.nvidia.com/labs/lpr/locate-anything/)\u3002\u6A21\u578B\u4EE5\u56FE\u50CF\u548C\u81EA\u7136\u8BED\u8A00\u67E5\u8BE2\u4E3A\u8F93\u5165\uFF0C\u8F93\u51FA\u6846\u6216\u70B9\u3002\u5176 Parallel Box Decoding \u652F\u6301 Fast Mode\uFF0CSlow Mode \u5F3A\u8C03\u7A33\u5B9A\u6027\uFF0CHybrid Mode \u5728\u5E76\u884C\u8F93\u51FA\u4E0D\u53EF\u9760\u65F6\u56DE\u9000\u3002\u5B98\u65B9\u541E\u5410\u6570\u636E\u4F7F\u7528\u5355\u5F20 H100 \u6D4B\u5F97\uFF0C\u56E0\u6B64\u9879\u76EE\u5FC5\u987B\u5728\u5B9E\u9645 GPU \u4E0A\u91CD\u65B0\u6D4B\u8BD5\u3002

### 25.1 \u5B9A\u4F4D\u89D2\u8272

LocateAnything \u4E0D\u66FF\u4EE3 YOLO \u7684\u6301\u7EED\u5B9E\u65F6\u68C0\u6D4B\uFF0C\u800C\u4F5C\u4E3A\u4E8C\u7EA7\u6A21\u578B\uFF1A

1. \u7528\u6237\u4E34\u65F6\u67E5\u8BE2\u672A\u8BAD\u7EC3\u7C7B\u522B\uFF1B
2. \u5BF9 YOLO \u4F4E\u7F6E\u4FE1\u5EA6\u5E27\u505A\u5F02\u6B65\u590D\u6838\uFF1B
3. \u6279\u91CF\u6316\u6398\u65B0\u7C7B\u522B\u8BAD\u7EC3\u6837\u672C\uFF1B
4. \u4E3A\u56FE\u7247\u6807\u6CE8\u63D0\u4F9B\u5019\u9009\u6846\uFF0C\u7ECF\u4EBA\u5DE5\u786E\u8BA4\u540E\u8BAD\u7EC3\u8F7B\u91CF YOLO\uFF1B
5. \u5BF9\u590D\u6742\u63CF\u8FF0\u6267\u884C\u6307\u4EE3\u8868\u8FBE\u5B9A\u4F4D\u3002

### 25.2 \u63A8\u7406\u63A5\u53E3

\`\`\`http
POST /api/v1/vision/open-vocabulary-jobs
Content-Type: application/json

{
  "farmId": "farm-01",
  "greenhouseId": "gh-01",
  "imageUri": "s3://.../frame.jpg",
  "queries": ["\u53F6\u7247\u660E\u663E\u840E\u852B\u7684\u756A\u8304\u690D\u682A", "\u901A\u9053\u4E2D\u7684\u79EF\u6C34\u533A\u57DF"],
  "mode": "HYBRID",
  "maxBoxes": 50
}
\`\`\`

\u8FD4\u56DE\u5F02\u6B65 \`jobId\`\u3002\u7ED3\u679C\u4FDD\u5B58\u539F\u59CB\u67E5\u8BE2\u3001\u5F52\u4E00\u5316\u6846\u3001\u5206\u6570\u3001\u6A21\u578B\u7248\u672C\u3001\u63A8\u7406\u6A21\u5F0F\u3001\u8017\u65F6\u548C\u4EBA\u5DE5\u5BA1\u6838\u72B6\u6001\u3002\u7528\u6237\u81EA\u7531\u8F93\u5165\u5E94\u505A\u957F\u5EA6\u9650\u5236\u3001\u654F\u611F\u8BCD\u68C0\u67E5\u548C\u67E5\u8BE2\u6A21\u677F\u5316\uFF0C\u9632\u6B62\u65E0\u9650\u7C7B\u522B\u5BFC\u81F4\u8D44\u6E90\u6EE5\u7528\u3002

### 25.3 \u8C03\u5EA6\u7B56\u7565

| \u4F18\u5148\u7EA7 | \u573A\u666F | \u6A21\u5F0F |
|---|---|---|
| P0 | \u5B89\u5168\u4E8B\u4EF6\u590D\u6838 | Fast/Hybrid\uFF0C\u72EC\u7ACB\u8D44\u6E90\u6C60 |
| P1 | \u7528\u6237\u4EA4\u4E92\u67E5\u8BE2 | Hybrid\uFF0C\u8BBE\u8D85\u65F6 |
| P2 | \u544A\u8B66\u6279\u91CF\u590D\u6838 | \u5F02\u6B65\u6279\u5904\u7406 |
| P3 | \u6570\u636E\u96C6\u6316\u6398 | Slow\uFF0C\u79BB\u5CF0\u6267\u884C |

\u8BBE\u7F6E\u6BCF\u79DF\u6237 GPU \u914D\u989D\u3001\u6700\u5927\u5E76\u53D1\u3001\u5355\u56FE\u67E5\u8BE2\u6570\u548C\u65E5\u8C03\u7528\u91CF\u3002\u8D85\u989D\u65F6\u6392\u961F\u6216\u8FD4\u56DE\u660E\u786E\u7684\u9650\u6D41\u54CD\u5E94\uFF0C\u800C\u4E0D\u662F\u62A2\u5360\u5B9E\u65F6 YOLO \u8D44\u6E90\u3002

### 25.4 \u519C\u4E1A\u6570\u636E\u9A8C\u8BC1

\u5EFA\u7ACB\u672C\u5730\u57FA\u51C6\u96C6\uFF0C\u8986\u76D6\u4F5C\u7269\u54C1\u79CD\u3001\u751F\u80B2\u671F\u3001\u68DA\u819C\u53CD\u5149\u3001\u53F6\u7247\u906E\u6321\u3001\u75C5\u6591\u3001\u5C0F\u76EE\u6807\u3001\u591C\u95F4\u8865\u5149\u3001\u96FE\u6C14\u548C\u5BC6\u96C6\u690D\u682A\u3002\u6BCF\u6761\u67E5\u8BE2\u7531\u519C\u4E1A\u4EBA\u5458\u5B9A\u4E49\u53EF\u5224\u5B9A\u6807\u51C6\uFF0C\u8BB0\u5F55 Precision\u3001Recall\u3001F1\u3001IoU\u3001\u6F0F\u68C0\u5B89\u5168\u98CE\u9669\u548C\u5355\u56FE\u5EF6\u8FDF\u3002

\u4E0A\u7EBF\u95E8\u69DB\u4E0D\u80FD\u53EA\u770B\u901A\u7528\u516C\u5F00\u6570\u636E\u96C6\uFF1B\u5E94\u6309\u201C\u4F5C\u7269\u2014\u95EE\u9898\u2014\u5149\u7167\u2014\u6444\u50CF\u5934\u201D\u5206\u5C42\u62A5\u544A\u3002\u6A21\u578B\u7ED9\u51FA\u7684\u75C5\u5BB3\u5B9A\u4F4D\u4EC5\u662F\u89C6\u89C9\u7EBF\u7D22\uFF0C\u4E0D\u80FD\u76F4\u63A5\u4F5C\u4E3A\u519C\u836F\u6216\u704C\u6E89\u5904\u65B9\u3002

## 26. \u591A\u79DF\u6237\u3001\u5BF9\u8C61\u5B58\u50A8\u3001\u53EF\u89C2\u6D4B\u6027\u548C\u9AD8\u53EF\u7528\u89C4\u5212

### 26.1 \u591A\u79DF\u6237\u6A21\u578B

\u79DF\u6237\u5C42\u7EA7\u5EFA\u8BAE\u4E3A\uFF1A

\`\`\`text
Tenant\uFF08\u7EC4\u7EC7\uFF09
 \u2514\u2500 Farm\uFF08\u519C\u573A\uFF09
     \u2514\u2500 Greenhouse/Field\uFF08\u5927\u68DA/\u5730\u5757\uFF09
         \u251C\u2500 Camera/Device
         \u251C\u2500 MappingSession/MapVersion
         \u2514\u2500 DetectionEvent/Alert
\`\`\`

\u6240\u6709\u4E1A\u52A1\u8868\u589E\u52A0\u4E0D\u53EF\u4E3A\u7A7A\u7684 \`tenant_id\`\uFF0C\u552F\u4E00\u7EA6\u675F\u5FC5\u987B\u5305\u542B\u79DF\u6237\u5217\u3002JWT \u4E2D\u4FDD\u5B58 \`tenantId\`\u3001\`userId\` \u548C\u89D2\u8272\uFF1B\u670D\u52A1\u7AEF\u4ECE\u8BA4\u8BC1\u4E0A\u4E0B\u6587\u53D6\u5F97\u79DF\u6237\uFF0C\u4E0D\u80FD\u76F8\u4FE1\u8BF7\u6C42\u4F53\u4F20\u5165\u7684\u79DF\u6237\u503C\u3002

\u63A8\u8350\u89D2\u8272\uFF1A\`TENANT_ADMIN\`\u3001\`FARM_MANAGER\`\u3001\`AGRONOMIST\`\u3001\`OPERATOR\`\u3001\`VIEWER\`\u3001\`ROBOT_SERVICE\`\u3002\u8BBE\u5907\u63A7\u5236\u3001\u5730\u56FE\u53D1\u5E03\u3001\u4EBA\u8138\u7BA1\u7406\u548C\u6A21\u578B\u53D1\u5E03\u5206\u522B\u6388\u6743\u3002

\u521D\u671F\u53EF\u91C7\u7528\u5171\u4EAB\u6570\u636E\u5E93\u3001\u5171\u4EAB\u8868\u5E76\u4EE5 \`tenant_id\` \u884C\u7EA7\u9694\u79BB\uFF1B\u9AD8\u5408\u89C4\u5BA2\u6237\u53EF\u6F14\u8FDB\u4E3A\u72EC\u7ACB schema \u6216\u72EC\u7ACB\u6570\u636E\u5E93\u3002\u5FC5\u987B\u7F16\u5199\u8DE8\u79DF\u6237\u8BBF\u95EE\u81EA\u52A8\u6D4B\u8BD5\uFF0C\u7F13\u5B58\u952E\u3001\u5BF9\u8C61\u8DEF\u5F84\u3001\u6D88\u606F\u4E3B\u9898\u548C\u65E5\u5FD7\u67E5\u8BE2\u4E5F\u8981\u5305\u542B\u79DF\u6237\u7EF4\u5EA6\u3002

### 26.2 \u751F\u4EA7\u7EA7\u5BF9\u8C61\u5B58\u50A8

\u5BF9\u8C61\u5B58\u50A8\u7528\u4E8E\u89C6\u9891\u3001\u622A\u56FE\u3001\u70B9\u4E91\u3001GLB\u3001\u5730\u56FE\u548C\u6A21\u578B\uFF0C\u4E0D\u628A\u5927\u6587\u4EF6\u5B58\u5165 MySQL\u3002\u5EFA\u8BAE\u4F7F\u7528 S3 \u517C\u5BB9\u63A5\u53E3\uFF0C\u5F00\u53D1\u53EF\u7528 MinIO\uFF0C\u751F\u4EA7\u53EF\u9009\u4E91\u5BF9\u8C61\u5B58\u50A8\u6216\u9AD8\u53EF\u7528 MinIO \u96C6\u7FA4\u3002

\u5BF9\u8C61\u952E\u89C4\u8303\uFF1A

\`\`\`text
/{tenantId}/{farmId}/{resourceType}/{yyyy}/{mm}/{dd}/{resourceId}/{version}/{file}
\`\`\`

\u5B89\u5168\u8981\u6C42\uFF1A

- Bucket \u9ED8\u8BA4\u79C1\u6709\uFF1B
- \u6D4F\u89C8\u5668\u53EA\u83B7\u5F97\u77ED\u65F6\u9884\u7B7E\u540D URL\uFF1B
- \u670D\u52A1\u8D26\u53F7\u6309\u524D\u7F00\u6700\u5C0F\u6743\u9650\u8BBF\u95EE\uFF1B
- \u4E0A\u4F20\u5B8C\u6210\u540E\u6821\u9A8C\u5927\u5C0F\u3001MIME\u3001SHA-256 \u548C\u6076\u610F\u6587\u4EF6\uFF1B
- \u670D\u52A1\u7AEF\u52A0\u5BC6\uFF0C\u654F\u611F\u89C6\u9891\u53EF\u4F7F\u7528\u72EC\u7ACB\u79DF\u6237\u5BC6\u94A5\uFF1B
- \u5F00\u542F\u7248\u672C\u63A7\u5236\u3001\u751F\u547D\u5468\u671F\u3001\u4E0D\u53EF\u53D8\u4FDD\u7559\u548C\u8DE8\u533A\u57DF\u590D\u5236\uFF1B
- \u6570\u636E\u5E93\u53EA\u4FDD\u5B58\u903B\u8F91 URI\u3001\u6821\u9A8C\u548C\u3001\u5927\u5C0F\u3001\u72B6\u6001\u548C\u4FDD\u7559\u622A\u6B62\u65F6\u95F4\u3002

\u751F\u547D\u5468\u671F\u793A\u4F8B\uFF1A\u4E8B\u4EF6\u7F29\u7565\u56FE\u4FDD\u7559 90 \u5929\uFF0C\u666E\u901A\u89C6\u9891 30 \u5929\uFF0C\u5DF2\u53D1\u5E03\u5730\u56FE\u957F\u671F\u4FDD\u7559\uFF0C\u5931\u8D25\u4EFB\u52A1\u4E2D\u95F4\u6587\u4EF6 7 \u5929\u3002\u771F\u5B9E\u671F\u9650\u5E94\u7531\u4E1A\u52A1\u3001\u9690\u79C1\u548C\u6CD5\u89C4\u5171\u540C\u786E\u5B9A\u3002

### 26.3 \u53EF\u89C2\u6D4B\u6027

\u91C7\u7528 OpenTelemetry \u7EDF\u4E00 trace\u3001metric \u548C log\uFF0C\u5E76\u5C06 \`traceId\` \u8D2F\u7A7F\u6D4F\u89C8\u5668\u3001Spring Boot\u3001\u6D88\u606F\u603B\u7EBF\u3001\u63A8\u7406\u670D\u52A1\u548C\u5BF9\u8C61\u5B58\u50A8\u4EFB\u52A1\u3002

\u6838\u5FC3\u6307\u6807\uFF1A

| \u57DF | \u6307\u6807 |
|---|---|
| API | QPS\u3001P50/P95/P99\u3001\u9519\u8BEF\u7387\u3001\u9274\u6743\u5931\u8D25\u7387 |
| \u6570\u636E\u5E93 | \u8FDE\u63A5\u6C60\u3001\u6162\u67E5\u8BE2\u3001\u9501\u7B49\u5F85\u3001\u590D\u5236\u5EF6\u8FDF |
| \u89C6\u9891 | \u5728\u7EBF\u7387\u3001\u91CD\u8FDE\u6B21\u6570\u3001\u89E3\u7801 FPS\u3001\u4E22\u5E27\u7387 |
| \u63A8\u7406 | \u961F\u5217\u957F\u5EA6\u3001GPU \u5229\u7528\u7387\u3001\u663E\u5B58\u3001\u5355\u5E27\u5EF6\u8FDF\u3001\u541E\u5410 |
| \u5EFA\u56FE | \u5404\u9636\u6BB5\u8017\u65F6\u3001\u6210\u529F\u7387\u3001\u8D28\u91CF\u5206\u3001\u4EA7\u7269\u5927\u5C0F |
| \u6D88\u606F | \u751F\u4EA7/\u6D88\u8D39\u901F\u7387\u3001\u79EF\u538B\u3001\u91CD\u8BD5\u548C\u6B7B\u4FE1\u6570 |
| \u5B58\u50A8 | \u5BB9\u91CF\u3001\u4E0A\u4F20\u5931\u8D25\u3001\u8BFB\u53D6\u5EF6\u8FDF\u3001\u6821\u9A8C\u5931\u8D25 |
| \u673A\u5668\u4EBA | \u5B9A\u4F4D\u6210\u529F\u7387\u3001\u89C4\u5212\u5931\u8D25\u3001\u6025\u505C\u3001\u6700\u5C0F\u969C\u788D\u8DDD\u79BB |

\u670D\u52A1\u7B49\u7EA7\u76EE\u6807\u793A\u4F8B\uFF1A\u6838\u5FC3\u67E5\u8BE2\u6708\u53EF\u7528\u6027 99.9%\uFF0CP95 \u5C0F\u4E8E 500 ms\uFF1B\u5B9E\u65F6\u544A\u8B66\u4ECE\u8FB9\u7F18\u4E8B\u4EF6\u5230\u6D4F\u89C8\u5668 P95 \u5C0F\u4E8E 2 s\uFF1B\u5EFA\u56FE\u5C5E\u4E8E\u5F02\u6B65\u4EFB\u52A1\uFF0C\u4E0D\u4EE5 HTTP \u5EF6\u8FDF\u8861\u91CF\uFF0C\u800C\u4EE5\u5B8C\u6210\u65F6\u95F4\u548C\u6210\u529F\u7387\u8861\u91CF\u3002

\u544A\u8B66\u9700\u5206\u7EA7\u5E76\u5E26\u8FD0\u884C\u624B\u518C\u94FE\u63A5\u3002\u907F\u514D\u53EA\u56E0 CPU \u77ED\u65F6\u5347\u9AD8\u62A5\u8B66\uFF0C\u5E94\u7EC4\u5408\u6301\u7EED\u65F6\u95F4\u3001\u9519\u8BEF\u7387\u548C\u4E1A\u52A1\u5F71\u54CD\u3002\u65E5\u5FD7\u7981\u6B62\u8BB0\u5F55 JWT\u3001\u5BC6\u7801\u3001\u4EBA\u8138\u539F\u56FE\u3001RTSP \u5BC6\u7801\u548C\u9884\u7B7E\u540D URL \u5168\u6587\u3002

### 26.4 \u9AD8\u53EF\u7528\u90E8\u7F72

\`\`\`mermaid
flowchart LR
    DNS[DNS/WAF] --> LB[\u8D1F\u8F7D\u5747\u8861]
    LB --> A1[Spring Boot A]
    LB --> A2[Spring Boot B]
    A1 --> DBP[(MySQL Primary)]
    A2 --> DBP
    DBP --> DBR[(Replica/Backup)]
    A1 --> MQC[\u6D88\u606F\u96C6\u7FA4]
    A2 --> MQC
    MQC --> GPU1[GPU Worker A]
    MQC --> GPU2[GPU Worker B]
    A1 --> S3[(\u5BF9\u8C61\u5B58\u50A8\u96C6\u7FA4)]
    A2 --> S3
\`\`\`

- Spring Boot \u4FDD\u6301\u65E0\u72B6\u6001\uFF0C\u81F3\u5C11\u4E24\u4E2A\u5B9E\u4F8B\uFF0C\u5065\u5EB7\u68C0\u67E5\u533A\u5206\u5B58\u6D3B\u548C\u5C31\u7EEA\uFF1B
- JWT \u4E0D\u4F9D\u8D56\u5355\u673A Session\uFF1BWebSocket \u4F7F\u7528\u5171\u4EAB\u6D88\u606F\u540E\u7AEF\u6216\u4E00\u81F4\u6027\u8DEF\u7531\uFF1B
- MySQL \u4F7F\u7528\u4E3B\u4ECE/\u6258\u7BA1\u9AD8\u53EF\u7528\uFF0C\u5E76\u5B9E\u65BD PITR\uFF1B
- \u6D88\u606F\u603B\u7EBF\u5F00\u542F\u6301\u4E45\u5316\u3001\u526F\u672C\u3001\u91CD\u8BD5\u4E3B\u9898\u548C\u6B7B\u4FE1\u961F\u5217\uFF1B
- GPU Worker \u4ECE\u961F\u5217\u9886\u53D6\u4EFB\u52A1\uFF0C\u4F7F\u7528\u79DF\u7EA6\u548C\u5FC3\u8DF3\u907F\u514D\u4EFB\u52A1\u4E22\u5931\uFF1B
- \u5BF9\u8C61\u5B58\u50A8\u542F\u7528\u591A\u526F\u672C\u548C\u5B9A\u671F\u6062\u590D\u6F14\u7EC3\uFF1B
- \u8FB9\u7F18\u8282\u70B9\u65AD\u7F51\u53EF\u81EA\u6CBB\u5E76\u7F13\u5B58\uFF0C\u4E0D\u56E0\u4E91\u7AEF\u6545\u969C\u505C\u6B62\u5B89\u5168\u544A\u8B66\u3002

### 26.5 \u707E\u96BE\u6062\u590D

\u5B9A\u4E49\u5E76\u5B9E\u6D4B\uFF1A

- RPO\uFF1A\u5141\u8BB8\u4E22\u5931\u7684\u6570\u636E\u65F6\u95F4\u7A97\u53E3\uFF1B
- RTO\uFF1A\u5141\u8BB8\u670D\u52A1\u4E2D\u65AD\u65F6\u957F\uFF1B
- MySQL \u5168\u91CF+\u589E\u91CF\u6062\u590D\uFF1B
- \u5BF9\u8C61\u5B58\u50A8\u7248\u672C\u548C\u8DE8\u533A\u57DF\u526F\u672C\u6062\u590D\uFF1B
- \u6D88\u606F\u79EF\u538B\u91CD\u653E\u548C\u5E42\u7B49\u9A8C\u8BC1\uFF1B
- \u5730\u56FE\u3001\u6A21\u578B\u548C\u914D\u7F6E\u56DE\u6EDA\uFF1B
- \u8FB9\u7F18\u8282\u70B9\u91CD\u65B0\u6CE8\u518C\u4E0E\u5BC6\u94A5\u8F6E\u6362\u3002

\u6BCF\u5B63\u5EA6\u81F3\u5C11\u8FDB\u884C\u4E00\u6B21\u6062\u590D\u6F14\u7EC3\uFF0C\u5E76\u4FDD\u5B58\u5B9E\u9645\u6062\u590D\u65F6\u95F4\uFF0C\u800C\u4E0D\u662F\u53EA\u786E\u8BA4\u201C\u5B58\u5728\u5907\u4EFD\u201D\u3002

## 27. \u5206\u9636\u6BB5\u91CC\u7A0B\u7891\u4E0E\u9A8C\u6536

| \u9636\u6BB5 | \u4E3B\u8981\u4EA4\u4ED8 | \u8FDB\u5165\u4E0B\u4E00\u9636\u6BB5\u7684\u95E8\u69DB |
|---|---|---|
| P0 \u57FA\u7EBF | \u6444\u50CF\u5934\u6807\u5B9A\u3001\u6570\u636E\u89C4\u8303\u3001\u6A21\u578B\u4E0E\u5730\u56FE\u7248\u672C\u89C4\u8303 | \u53EF\u91CD\u590D\u91C7\u96C6\u540C\u4E00\u6E29\u5BA4 |
| P1 \u79BB\u7EBF\u5EFA\u56FE | LingBot-Map \u4EFB\u52A1\u3001\u70B9\u4E91\u3001\u8F68\u8FF9\u3001Web \u9884\u89C8 | \u8986\u76D6\u7387\u548C\u5C3A\u5EA6\u8BEF\u5DEE\u8FBE\u6807 |
| P2 \u5730\u56FE\u8F6C\u6362 | OccupancyGrid\u3001TF\u3001RViz \u6821\u9A8C | \u901A\u9053\u548C\u969C\u788D\u4E0E\u5B9E\u6D4B\u4E00\u81F4 |
| P3 \u4EFF\u771F\u5BFC\u822A | Nav2 \u914D\u7F6E\u3001rosbag/\u4EFF\u771F\u56DE\u653E | \u89C4\u5212\u6210\u529F\u4E14\u65E0\u78B0\u649E |
| P4 \u5728\u7EBF\u8BC6\u522B | RTSP\u3001\u8FB9\u7F18 YOLO\u3001\u4E8B\u4EF6\u603B\u7EBF\u3001\u5B9E\u65F6\u53E0\u52A0 | \u5EF6\u8FDF\u3001\u65AD\u7F51\u548C\u8BEF\u62A5\u8FBE\u6807 |
| P5 \u5F00\u653E\u5B9A\u4F4D | LocateAnything \u5F02\u6B65\u670D\u52A1\u548C\u519C\u4E1A\u57FA\u51C6\u96C6 | \u672C\u5730\u6570\u636E\u6307\u6807\u8FBE\u6807 |
| P6 \u751F\u4EA7\u5E73\u53F0 | \u591A\u79DF\u6237\u3001\u5BF9\u8C61\u5B58\u50A8\u3001\u53EF\u89C2\u6D4B\u6027\u3001\u9AD8\u53EF\u7528 | \u5B89\u5168\u6D4B\u8BD5\u548C\u707E\u5907\u6F14\u7EC3\u901A\u8FC7 |
| P7 \u673A\u5668\u4EBA\u8BD5\u8FD0\u884C | \u4F4E\u901F\u5C01\u95ED\u6D4B\u8BD5\u3001\u52A8\u6001\u969C\u788D\u548C\u4EBA\u5DE5\u63A5\u7BA1 | \u5B89\u5168\u8BC4\u5BA1\u6279\u51C6 |

\u5EFA\u8BAE\u6BCF\u9636\u6BB5\u5206\u522B\u63D0\u4EA4\u67B6\u6784\u51B3\u7B56\u8BB0\u5F55\u3001\u6570\u636E\u5B57\u5178\u3001\u90E8\u7F72\u6E05\u5355\u3001\u6D4B\u8BD5\u62A5\u544A\u3001\u98CE\u9669\u6E05\u5355\u548C\u56DE\u6EDA\u65B9\u6848\u3002\u672A\u7ECF\u672C\u9636\u6BB5\u9A8C\u6536\uFF0C\u4E0D\u5E94\u4EC5\u4E3A\u4E86\u6F14\u793A\u8FDB\u5EA6\u63D0\u524D\u5BA3\u79F0\u4E0B\u4E00\u9636\u6BB5\u80FD\u529B\u5DF2\u7ECF\u5B8C\u6210\u3002

---

\u672C\u6587\u4EE5\u4ED3\u5E93\u5728 2026-08-05 \u7684\u5B9E\u73B0\u4E3A\u57FA\u51C6\u3002\u6A21\u578B\u3001\u4F9D\u8D56\u548C\u7B2C\u4E09\u65B9\u63A5\u53E3\u4F1A\u53D8\u5316\uFF0C\u5B9E\u9645\u90E8\u7F72\u524D\u5E94\u590D\u6838\u5404\u9879\u76EE\u7684\u5B98\u65B9\u8BF4\u660E\u3001\u8BB8\u53EF\u8BC1\u3001\u786C\u4EF6\u8981\u6C42\u53CA\u9690\u79C1\u5408\u89C4\u8981\u6C42\u3002
`,Mm="/assets/\u5B98\u7F51.png",$m="/assets/\u767B\u9646.png",jm="/assets/\u4E3B\u754C\u9762.png",Um="/assets/\u81EA\u5B9A\u4E49\u5DE5\u4F5C\u53F0.png",Wm="/assets/\u95EE\u519C.png",Vm="/assets/\u7B2C\u4E00\u4EBA\u79F0.png",Hm="/assets/3D.png",Qm="/assets/\u5927\u68DA\u5185\u90E8.png";const Gm={"\u5B98\u7F51.png":Mm,"\u767B\u9646.png":$m,"\u4E3B\u754C\u9762.png":jm,"\u81EA\u5B9A\u4E49\u5DE5\u4F5C\u53F0.png":Um,"\u95EE\u519C.png":Wm,"\u7B2C\u4E00\u4EBA\u79F0.png":Vm,"3D.png":Hm,"\u5927\u68DA\u5185\u90E8.png":Qm},Km={"user-manual":{title:"\u7528\u6237\u4F7F\u7528\u624B\u518C",label:"USER GUIDE",description:"\u9762\u5411\u5E73\u53F0\u4F7F\u7528\u8005\u4E0E\u519C\u573A\u7BA1\u7406\u4EBA\u5458",icon:Rd,source:bm},"technical-manual":{title:"\u6280\u672F\u8BF4\u660E\u624B\u518C",label:"TECHNICAL GUIDE",description:"\u9762\u5411\u5F00\u53D1\u3001\u6D4B\u8BD5\u4E0E\u8FD0\u7EF4\u4EBA\u5458",icon:bd,source:Om}};function Ym(e){const n=new L.Renderer;return n.image=(t,r,u)=>{const l=decodeURIComponent(String(t||"").split("/").pop());return`<img src="${Gm[l]||t}" alt="${u||""}"${r?` title="${r}"`:""} loading="lazy">`},L.parse(e,{renderer:n,headerIds:!0,mangle:!1})}function Jm(){const{slug:e}=Gp(),n=Km[e],t=P.exports.useMemo(()=>n?Ym(n.source):"",[n]);if(!n)return a(Jp,{to:"/docs",replace:!0});const r=n.icon;return a("main",{className:"docs-reader px-6 pb-24 pt-32 md:px-12 md:pt-40 lg:px-16",children:y("div",{className:"mx-auto max-w-5xl",children:[y(on,{to:"/docs",className:"inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-emerald-700",children:[a(Eh,{className:"h-4 w-4"})," \u8FD4\u56DE\u6587\u6863\u8BF4\u660E"]}),y("header",{className:"mt-8 border-b border-slate-200 pb-10",children:[y("div",{className:"flex items-center gap-3 text-emerald-700",children:[a(r,{className:"h-5 w-5",strokeWidth:1.6}),a("span",{className:"text-[11px] font-semibold tracking-[0.2em]",children:n.label})]}),a("h1",{className:"mt-5 font-instrument-serif text-4xl text-ink sm:text-5xl",children:n.title}),y("p",{className:"mt-4 text-sm font-light text-muted",children:[n.description," \xB7 \u5185\u5BB9\u968F\u9879\u76EE\u7248\u672C\u540C\u6B65\u66F4\u65B0"]})]}),a("article",{className:"markdown-body",dangerouslySetInnerHTML:{__html:t}})]})})}function Zm(){const{pathname:e}=Mn(),n=e==="/sign-in"||e==="/sign-up";return y(q,{children:[!n&&a(ph,{}),y(qp,{children:[a(Ie,{path:"/",element:a(is,{})}),a(Ie,{path:"/product",element:a(Vh,{})}),a(Ie,{path:"/solutions",element:a(Kh,{})}),a(Ie,{path:"/digital-twin",element:a(Xh,{})}),a(Ie,{path:"/about",element:a(tm,{})}),a(Ie,{path:"/contact",element:a(um,{})}),a(Ie,{path:"/docs",element:a(Em,{})}),a(Ie,{path:"/docs/:slug",element:a(Jm,{})}),a(Ie,{path:"/sign-in",element:a(mm,{})}),a(Ie,{path:"/sign-up",element:a(ym,{})}),a(Ie,{path:"*",element:a(is,{})})]}),!n&&a(mh,{})]})}function qm(){return y(nh,{children:[a(uh,{}),a("div",{className:"w-full min-h-screen bg-page text-ink",children:a(Zm,{})})]})}Wl.createRoot(document.getElementById("root")).render(a(E0.StrictMode,{children:a(qm,{})}));
