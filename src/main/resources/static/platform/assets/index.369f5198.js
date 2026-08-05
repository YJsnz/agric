const lg=function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function t(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerpolicy&&(r.referrerPolicy=s.referrerpolicy),s.crossorigin==="use-credentials"?r.credentials="include":s.crossorigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(s){if(s.ep)return;s.ep=!0;const r=t(s);fetch(s.href,r)}};lg();function Dc(n,e){const t=Object.create(null),i=n.split(",");for(let s=0;s<i.length;s++)t[i[s]]=!0;return e?s=>!!t[s.toLowerCase()]:s=>!!t[s]}function Gn(n){if(ct(n)){const e={};for(let t=0;t<n.length;t++){const i=n[t],s=on(i)?hg(i):Gn(i);if(s)for(const r in s)e[r]=s[r]}return e}else{if(on(n))return n;if(kt(n))return n}}const ug=/;(?![^(]*\))/g,cg=/:([^]+)/,dg=/\/\*.*?\*\//gs;function hg(n){const e={};return n.replace(dg,"").split(ug).forEach(t=>{if(t){const i=t.split(cg);i.length>1&&(e[i[0].trim()]=i[1].trim())}}),e}function $e(n){let e="";if(on(n))e=n;else if(ct(n))for(let t=0;t<n.length;t++){const i=$e(n[t]);i&&(e+=i+" ")}else if(kt(n))for(const t in n)n[t]&&(e+=t+" ");return e.trim()}const fg="itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly",pg=Dc(fg);function Pp(n){return!!n||n===""}function mg(n,e){if(n.length!==e.length)return!1;let t=!0;for(let i=0;t&&i<n.length;i++)t=Sl(n[i],e[i]);return t}function Sl(n,e){if(n===e)return!0;let t=Fd(n),i=Fd(e);if(t||i)return t&&i?n.getTime()===e.getTime():!1;if(t=Qo(n),i=Qo(e),t||i)return n===e;if(t=ct(n),i=ct(e),t||i)return t&&i?mg(n,e):!1;if(t=kt(n),i=kt(e),t||i){if(!t||!i)return!1;const s=Object.keys(n).length,r=Object.keys(e).length;if(s!==r)return!1;for(const o in n){const a=n.hasOwnProperty(o),l=e.hasOwnProperty(o);if(a&&!l||!a&&l||!Sl(n[o],e[o]))return!1}}return String(n)===String(e)}function Lp(n,e){return n.findIndex(t=>Sl(t,e))}const B=n=>on(n)?n:n==null?"":ct(n)||kt(n)&&(n.toString===Up||!_t(n.toString))?JSON.stringify(n,Ip,2):String(n),Ip=(n,e)=>e&&e.__v_isRef?Ip(n,e.value):Jr(e)?{[`Map(${e.size})`]:[...e.entries()].reduce((t,[i,s])=>(t[`${i} =>`]=s,t),{})}:Tl(e)?{[`Set(${e.size})`]:[...e.values()]}:kt(e)&&!ct(e)&&!Np(e)?String(e):e,Wt={},Yr=[],Mi=()=>{},gg=()=>!1,_g=/^on[^a-z]/,wl=n=>_g.test(n),Rc=n=>n.startsWith("onUpdate:"),En=Object.assign,Fc=(n,e)=>{const t=n.indexOf(e);t>-1&&n.splice(t,1)},vg=Object.prototype.hasOwnProperty,Dt=(n,e)=>vg.call(n,e),ct=Array.isArray,Jr=n=>ga(n)==="[object Map]",Tl=n=>ga(n)==="[object Set]",Fd=n=>ga(n)==="[object Date]",_t=n=>typeof n=="function",on=n=>typeof n=="string",Qo=n=>typeof n=="symbol",kt=n=>n!==null&&typeof n=="object",Bp=n=>kt(n)&&_t(n.then)&&_t(n.catch),Up=Object.prototype.toString,ga=n=>Up.call(n),yg=n=>ga(n).slice(8,-1),Np=n=>ga(n)==="[object Object]",Pc=n=>on(n)&&n!=="NaN"&&n[0]!=="-"&&""+parseInt(n,10)===n,il=Dc(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"),Cl=n=>{const e=Object.create(null);return t=>e[t]||(e[t]=n(t))},Eg=/-(\w)/g,Ui=Cl(n=>n.replace(Eg,(e,t)=>t?t.toUpperCase():"")),xg=/\B([A-Z])/g,mr=Cl(n=>n.replace(xg,"-$1").toLowerCase()),Dl=Cl(n=>n.charAt(0).toUpperCase()+n.slice(1)),Ql=Cl(n=>n?`on${Dl(n)}`:""),ea=(n,e)=>!Object.is(n,e),sl=(n,e)=>{for(let t=0;t<n.length;t++)n[t](e)},pl=(n,e,t)=>{Object.defineProperty(n,e,{configurable:!0,enumerable:!1,value:t})},Ku=n=>{const e=parseFloat(n);return isNaN(e)?n:e},bg=n=>{const e=on(n)?Number(n):NaN;return isNaN(e)?n:e};let Pd;const Mg=()=>Pd||(Pd=typeof globalThis!="undefined"?globalThis:typeof self!="undefined"?self:typeof window!="undefined"?window:typeof global!="undefined"?global:{});let ni;class Op{constructor(e=!1){this.detached=e,this._active=!0,this.effects=[],this.cleanups=[],this.parent=ni,!e&&ni&&(this.index=(ni.scopes||(ni.scopes=[])).push(this)-1)}get active(){return this._active}run(e){if(this._active){const t=ni;try{return ni=this,e()}finally{ni=t}}}on(){ni=this}off(){ni=this.parent}stop(e){if(this._active){let t,i;for(t=0,i=this.effects.length;t<i;t++)this.effects[t].stop();for(t=0,i=this.cleanups.length;t<i;t++)this.cleanups[t]();if(this.scopes)for(t=0,i=this.scopes.length;t<i;t++)this.scopes[t].stop(!0);if(!this.detached&&this.parent&&!e){const s=this.parent.scopes.pop();s&&s!==this&&(this.parent.scopes[this.index]=s,s.index=this.index)}this.parent=void 0,this._active=!1}}}function kp(n){return new Op(n)}function Ag(n,e=ni){e&&e.active&&e.effects.push(n)}function zp(){return ni}function Sg(n){ni&&ni.cleanups.push(n)}const Lc=n=>{const e=new Set(n);return e.w=0,e.n=0,e},Hp=n=>(n.w&Bs)>0,$p=n=>(n.n&Bs)>0,wg=({deps:n})=>{if(n.length)for(let e=0;e<n.length;e++)n[e].w|=Bs},Tg=n=>{const{deps:e}=n;if(e.length){let t=0;for(let i=0;i<e.length;i++){const s=e[i];Hp(s)&&!$p(s)?s.delete(n):e[t++]=s,s.w&=~Bs,s.n&=~Bs}e.length=t}},ml=new WeakMap;let zo=0,Bs=1;const Yu=30;let xi;const ir=Symbol(""),Ju=Symbol("");class Ic{constructor(e,t=null,i){this.fn=e,this.scheduler=t,this.active=!0,this.deps=[],this.parent=void 0,Ag(this,i)}run(){if(!this.active)return this.fn();let e=xi,t=Rs;for(;e;){if(e===this)return;e=e.parent}try{return this.parent=xi,xi=this,Rs=!0,Bs=1<<++zo,zo<=Yu?wg(this):Ld(this),this.fn()}finally{zo<=Yu&&Tg(this),Bs=1<<--zo,xi=this.parent,Rs=t,this.parent=void 0,this.deferStop&&this.stop()}}stop(){xi===this?this.deferStop=!0:this.active&&(Ld(this),this.onStop&&this.onStop(),this.active=!1)}}function Ld(n){const{deps:e}=n;if(e.length){for(let t=0;t<e.length;t++)e[t].delete(n);e.length=0}}let Rs=!0;const Vp=[];function yo(){Vp.push(Rs),Rs=!1}function Eo(){const n=Vp.pop();Rs=n===void 0?!0:n}function Jn(n,e,t){if(Rs&&xi){let i=ml.get(n);i||ml.set(n,i=new Map);let s=i.get(t);s||i.set(t,s=Lc()),Gp(s)}}function Gp(n,e){let t=!1;zo<=Yu?$p(n)||(n.n|=Bs,t=!Hp(n)):t=!n.has(xi),t&&(n.add(xi),xi.deps.push(n))}function os(n,e,t,i,s,r){const o=ml.get(n);if(!o)return;let a=[];if(e==="clear")a=[...o.values()];else if(t==="length"&&ct(n)){const l=Number(i);o.forEach((u,d)=>{(d==="length"||d>=l)&&a.push(u)})}else switch(t!==void 0&&a.push(o.get(t)),e){case"add":ct(n)?Pc(t)&&a.push(o.get("length")):(a.push(o.get(ir)),Jr(n)&&a.push(o.get(Ju)));break;case"delete":ct(n)||(a.push(o.get(ir)),Jr(n)&&a.push(o.get(Ju)));break;case"set":Jr(n)&&a.push(o.get(ir));break}if(a.length===1)a[0]&&Zu(a[0]);else{const l=[];for(const u of a)u&&l.push(...u);Zu(Lc(l))}}function Zu(n,e){const t=ct(n)?n:[...n];for(const i of t)i.computed&&Id(i);for(const i of t)i.computed||Id(i)}function Id(n,e){(n!==xi||n.allowRecurse)&&(n.scheduler?n.scheduler():n.run())}function Cg(n,e){var t;return(t=ml.get(n))===null||t===void 0?void 0:t.get(e)}const Dg=Dc("__proto__,__v_isRef,__isVue"),Wp=new Set(Object.getOwnPropertyNames(Symbol).filter(n=>n!=="arguments"&&n!=="caller").map(n=>Symbol[n]).filter(Qo)),Rg=Bc(),Fg=Bc(!1,!0),Pg=Bc(!0),Bd=Lg();function Lg(){const n={};return["includes","indexOf","lastIndexOf"].forEach(e=>{n[e]=function(...t){const i=At(this);for(let r=0,o=this.length;r<o;r++)Jn(i,"get",r+"");const s=i[e](...t);return s===-1||s===!1?i[e](...t.map(At)):s}}),["push","pop","shift","unshift","splice"].forEach(e=>{n[e]=function(...t){yo();const i=At(this)[e].apply(this,t);return Eo(),i}}),n}function Ig(n){const e=At(this);return Jn(e,"has",n),e.hasOwnProperty(n)}function Bc(n=!1,e=!1){return function(i,s,r){if(s==="__v_isReactive")return!n;if(s==="__v_isReadonly")return n;if(s==="__v_isShallow")return e;if(s==="__v_raw"&&r===(n?e?Yg:Yp:e?Kp:qp).get(i))return i;const o=ct(i);if(!n){if(o&&Dt(Bd,s))return Reflect.get(Bd,s,r);if(s==="hasOwnProperty")return Ig}const a=Reflect.get(i,s,r);return(Qo(s)?Wp.has(s):Dg(s))||(n||Jn(i,"get",s),e)?a:rn(a)?o&&Pc(s)?a:a.value:kt(a)?n?Jp(a):Bn(a):a}}const Bg=Xp(),Ug=Xp(!0);function Xp(n=!1){return function(t,i,s,r){let o=t[i];if(so(o)&&rn(o)&&!rn(s))return!1;if(!n&&(!gl(s)&&!so(s)&&(o=At(o),s=At(s)),!ct(t)&&rn(o)&&!rn(s)))return o.value=s,!0;const a=ct(t)&&Pc(i)?Number(i)<t.length:Dt(t,i),l=Reflect.set(t,i,s,r);return t===At(r)&&(a?ea(s,o)&&os(t,"set",i,s):os(t,"add",i,s)),l}}function Ng(n,e){const t=Dt(n,e);n[e];const i=Reflect.deleteProperty(n,e);return i&&t&&os(n,"delete",e,void 0),i}function Og(n,e){const t=Reflect.has(n,e);return(!Qo(e)||!Wp.has(e))&&Jn(n,"has",e),t}function kg(n){return Jn(n,"iterate",ct(n)?"length":ir),Reflect.ownKeys(n)}const jp={get:Rg,set:Bg,deleteProperty:Ng,has:Og,ownKeys:kg},zg={get:Pg,set(n,e){return!0},deleteProperty(n,e){return!0}},Hg=En({},jp,{get:Fg,set:Ug}),Uc=n=>n,Rl=n=>Reflect.getPrototypeOf(n);function xa(n,e,t=!1,i=!1){n=n.__v_raw;const s=At(n),r=At(e);t||(e!==r&&Jn(s,"get",e),Jn(s,"get",r));const{has:o}=Rl(s),a=i?Uc:t?kc:ta;if(o.call(s,e))return a(n.get(e));if(o.call(s,r))return a(n.get(r));n!==s&&n.get(e)}function ba(n,e=!1){const t=this.__v_raw,i=At(t),s=At(n);return e||(n!==s&&Jn(i,"has",n),Jn(i,"has",s)),n===s?t.has(n):t.has(n)||t.has(s)}function Ma(n,e=!1){return n=n.__v_raw,!e&&Jn(At(n),"iterate",ir),Reflect.get(n,"size",n)}function Ud(n){n=At(n);const e=At(this);return Rl(e).has.call(e,n)||(e.add(n),os(e,"add",n,n)),this}function Nd(n,e){e=At(e);const t=At(this),{has:i,get:s}=Rl(t);let r=i.call(t,n);r||(n=At(n),r=i.call(t,n));const o=s.call(t,n);return t.set(n,e),r?ea(e,o)&&os(t,"set",n,e):os(t,"add",n,e),this}function Od(n){const e=At(this),{has:t,get:i}=Rl(e);let s=t.call(e,n);s||(n=At(n),s=t.call(e,n)),i&&i.call(e,n);const r=e.delete(n);return s&&os(e,"delete",n,void 0),r}function kd(){const n=At(this),e=n.size!==0,t=n.clear();return e&&os(n,"clear",void 0,void 0),t}function Aa(n,e){return function(i,s){const r=this,o=r.__v_raw,a=At(o),l=e?Uc:n?kc:ta;return!n&&Jn(a,"iterate",ir),o.forEach((u,d)=>i.call(s,l(u),l(d),r))}}function Sa(n,e,t){return function(...i){const s=this.__v_raw,r=At(s),o=Jr(r),a=n==="entries"||n===Symbol.iterator&&o,l=n==="keys"&&o,u=s[n](...i),d=t?Uc:e?kc:ta;return!e&&Jn(r,"iterate",l?Ju:ir),{next(){const{value:h,done:f}=u.next();return f?{value:h,done:f}:{value:a?[d(h[0]),d(h[1])]:d(h),done:f}},[Symbol.iterator](){return this}}}}function ps(n){return function(...e){return n==="delete"?!1:this}}function $g(){const n={get(r){return xa(this,r)},get size(){return Ma(this)},has:ba,add:Ud,set:Nd,delete:Od,clear:kd,forEach:Aa(!1,!1)},e={get(r){return xa(this,r,!1,!0)},get size(){return Ma(this)},has:ba,add:Ud,set:Nd,delete:Od,clear:kd,forEach:Aa(!1,!0)},t={get(r){return xa(this,r,!0)},get size(){return Ma(this,!0)},has(r){return ba.call(this,r,!0)},add:ps("add"),set:ps("set"),delete:ps("delete"),clear:ps("clear"),forEach:Aa(!0,!1)},i={get(r){return xa(this,r,!0,!0)},get size(){return Ma(this,!0)},has(r){return ba.call(this,r,!0)},add:ps("add"),set:ps("set"),delete:ps("delete"),clear:ps("clear"),forEach:Aa(!0,!0)};return["keys","values","entries",Symbol.iterator].forEach(r=>{n[r]=Sa(r,!1,!1),t[r]=Sa(r,!0,!1),e[r]=Sa(r,!1,!0),i[r]=Sa(r,!0,!0)}),[n,t,e,i]}const[Vg,Gg,Wg,Xg]=$g();function Nc(n,e){const t=e?n?Xg:Wg:n?Gg:Vg;return(i,s,r)=>s==="__v_isReactive"?!n:s==="__v_isReadonly"?n:s==="__v_raw"?i:Reflect.get(Dt(t,s)&&s in i?t:i,s,r)}const jg={get:Nc(!1,!1)},qg={get:Nc(!1,!0)},Kg={get:Nc(!0,!1)},qp=new WeakMap,Kp=new WeakMap,Yp=new WeakMap,Yg=new WeakMap;function Jg(n){switch(n){case"Object":case"Array":return 1;case"Map":case"Set":case"WeakMap":case"WeakSet":return 2;default:return 0}}function Zg(n){return n.__v_skip||!Object.isExtensible(n)?0:Jg(yg(n))}function Bn(n){return so(n)?n:Oc(n,!1,jp,jg,qp)}function Qg(n){return Oc(n,!1,Hg,qg,Kp)}function Jp(n){return Oc(n,!0,zg,Kg,Yp)}function Oc(n,e,t,i,s){if(!kt(n)||n.__v_raw&&!(e&&n.__v_isReactive))return n;const r=s.get(n);if(r)return r;const o=Zg(n);if(o===0)return n;const a=new Proxy(n,o===2?i:t);return s.set(n,a),a}function Fs(n){return so(n)?Fs(n.__v_raw):!!(n&&n.__v_isReactive)}function so(n){return!!(n&&n.__v_isReadonly)}function gl(n){return!!(n&&n.__v_isShallow)}function Zp(n){return Fs(n)||so(n)}function At(n){const e=n&&n.__v_raw;return e?At(e):n}function ro(n){return pl(n,"__v_skip",!0),n}const ta=n=>kt(n)?Bn(n):n,kc=n=>kt(n)?Jp(n):n;function Qp(n){Rs&&xi&&(n=At(n),Gp(n.dep||(n.dep=Lc())))}function em(n,e){n=At(n);const t=n.dep;t&&Zu(t)}function rn(n){return!!(n&&n.__v_isRef===!0)}function Ce(n){return tm(n,!1)}function e_(n){return tm(n,!0)}function tm(n,e){return rn(n)?n:new t_(n,e)}class t_{constructor(e,t){this.__v_isShallow=t,this.dep=void 0,this.__v_isRef=!0,this._rawValue=t?e:At(e),this._value=t?e:ta(e)}get value(){return Qp(this),this._value}set value(e){const t=this.__v_isShallow||gl(e)||so(e);e=t?e:At(e),ea(e,this._rawValue)&&(this._rawValue=e,this._value=t?e:ta(e),em(this))}}function K(n){return rn(n)?n.value:n}const n_={get:(n,e,t)=>K(Reflect.get(n,e,t)),set:(n,e,t,i)=>{const s=n[e];return rn(s)&&!rn(t)?(s.value=t,!0):Reflect.set(n,e,t,i)}};function nm(n){return Fs(n)?n:new Proxy(n,n_)}function i_(n){const e=ct(n)?new Array(n.length):{};for(const t in n)e[t]=r_(n,t);return e}class s_{constructor(e,t,i){this._object=e,this._key=t,this._defaultValue=i,this.__v_isRef=!0}get value(){const e=this._object[this._key];return e===void 0?this._defaultValue:e}set value(e){this._object[this._key]=e}get dep(){return Cg(At(this._object),this._key)}}function r_(n,e,t){const i=n[e];return rn(i)?i:new s_(n,e,t)}var im;class o_{constructor(e,t,i,s){this._setter=t,this.dep=void 0,this.__v_isRef=!0,this[im]=!1,this._dirty=!0,this.effect=new Ic(e,()=>{this._dirty||(this._dirty=!0,em(this))}),this.effect.computed=this,this.effect.active=this._cacheable=!s,this.__v_isReadonly=i}get value(){const e=At(this);return Qp(e),(e._dirty||!e._cacheable)&&(e._dirty=!1,e._value=e.effect.run()),e._value}set value(e){this._setter(e)}}im="__v_isReadonly";function a_(n,e,t=!1){let i,s;const r=_t(n);return r?(i=n,s=Mi):(i=n.get,s=n.set),new o_(i,s,r||!s,t)}function Ps(n,e,t,i){let s;try{s=i?n(...i):n()}catch(r){Fl(r,e,t)}return s}function pi(n,e,t,i){if(_t(n)){const r=Ps(n,e,t,i);return r&&Bp(r)&&r.catch(o=>{Fl(o,e,t)}),r}const s=[];for(let r=0;r<n.length;r++)s.push(pi(n[r],e,t,i));return s}function Fl(n,e,t,i=!0){const s=e?e.vnode:null;if(e){let r=e.parent;const o=e.proxy,a=t;for(;r;){const u=r.ec;if(u){for(let d=0;d<u.length;d++)if(u[d](n,o,a)===!1)return}r=r.parent}const l=e.appContext.config.errorHandler;if(l){Ps(l,null,10,[n,o,a]);return}}l_(n,t,s,i)}function l_(n,e,t,i=!0){console.error(n)}let na=!1,Qu=!1;const Pn=[];let Bi=0;const Zr=[];let ns=null,Ys=0;const sm=Promise.resolve();let zc=null;function jn(n){const e=zc||sm;return n?e.then(this?n.bind(this):n):e}function u_(n){let e=Bi+1,t=Pn.length;for(;e<t;){const i=e+t>>>1;ia(Pn[i])<n?e=i+1:t=i}return e}function Hc(n){(!Pn.length||!Pn.includes(n,na&&n.allowRecurse?Bi+1:Bi))&&(n.id==null?Pn.push(n):Pn.splice(u_(n.id),0,n),rm())}function rm(){!na&&!Qu&&(Qu=!0,zc=sm.then(am))}function c_(n){const e=Pn.indexOf(n);e>Bi&&Pn.splice(e,1)}function d_(n){ct(n)?Zr.push(...n):(!ns||!ns.includes(n,n.allowRecurse?Ys+1:Ys))&&Zr.push(n),rm()}function zd(n,e=na?Bi+1:0){for(;e<Pn.length;e++){const t=Pn[e];t&&t.pre&&(Pn.splice(e,1),e--,t())}}function om(n){if(Zr.length){const e=[...new Set(Zr)];if(Zr.length=0,ns){ns.push(...e);return}for(ns=e,ns.sort((t,i)=>ia(t)-ia(i)),Ys=0;Ys<ns.length;Ys++)ns[Ys]();ns=null,Ys=0}}const ia=n=>n.id==null?1/0:n.id,h_=(n,e)=>{const t=ia(n)-ia(e);if(t===0){if(n.pre&&!e.pre)return-1;if(e.pre&&!n.pre)return 1}return t};function am(n){Qu=!1,na=!0,Pn.sort(h_);const e=Mi;try{for(Bi=0;Bi<Pn.length;Bi++){const t=Pn[Bi];t&&t.active!==!1&&Ps(t,null,14)}}finally{Bi=0,Pn.length=0,om(),na=!1,zc=null,(Pn.length||Zr.length)&&am()}}function f_(n,e,...t){if(n.isUnmounted)return;const i=n.vnode.props||Wt;let s=t;const r=e.startsWith("update:"),o=r&&e.slice(7);if(o&&o in i){const d=`${o==="modelValue"?"model":o}Modifiers`,{number:h,trim:f}=i[d]||Wt;f&&(s=t.map(p=>on(p)?p.trim():p)),h&&(s=t.map(Ku))}let a,l=i[a=Ql(e)]||i[a=Ql(Ui(e))];!l&&r&&(l=i[a=Ql(mr(e))]),l&&pi(l,n,6,s);const u=i[a+"Once"];if(u){if(!n.emitted)n.emitted={};else if(n.emitted[a])return;n.emitted[a]=!0,pi(u,n,6,s)}}function lm(n,e,t=!1){const i=e.emitsCache,s=i.get(n);if(s!==void 0)return s;const r=n.emits;let o={},a=!1;if(!_t(n)){const l=u=>{const d=lm(u,e,!0);d&&(a=!0,En(o,d))};!t&&e.mixins.length&&e.mixins.forEach(l),n.extends&&l(n.extends),n.mixins&&n.mixins.forEach(l)}return!r&&!a?(kt(n)&&i.set(n,null),null):(ct(r)?r.forEach(l=>o[l]=null):En(o,r),kt(n)&&i.set(n,o),o)}function Pl(n,e){return!n||!wl(e)?!1:(e=e.slice(2).replace(/Once$/,""),Dt(n,e[0].toLowerCase()+e.slice(1))||Dt(n,mr(e))||Dt(n,e))}let ii=null,Ll=null;function _l(n){const e=ii;return ii=n,Ll=n&&n.type.__scopeId||null,e}function Qt(n){Ll=n}function en(){Ll=null}function qt(n,e=ii,t){if(!e||n._n)return n;const i=(...s)=>{i._d&&Yd(-1);const r=_l(e);let o;try{o=n(...s)}finally{_l(r),i._d&&Yd(1)}return o};return i._n=!0,i._c=!0,i._d=!0,i}function eu(n){const{type:e,vnode:t,proxy:i,withProxy:s,props:r,propsOptions:[o],slots:a,attrs:l,emit:u,render:d,renderCache:h,data:f,setupState:p,ctx:g,inheritAttrs:v}=n;let _,m;const E=_l(n);try{if(t.shapeFlag&4){const x=s||i;_=Li(d.call(x,x,h,r,p,f,g)),m=l}else{const x=e;_=Li(x.length>1?x(r,{attrs:l,slots:a,emit:u}):x(r,null)),m=e.props?l:p_(l)}}catch(x){Go.length=0,Fl(x,n,1),_=tt(Ai)}let y=_;if(m&&v!==!1){const x=Object.keys(m),{shapeFlag:M}=y;x.length&&M&7&&(o&&x.some(Rc)&&(m=m_(m,o)),y=Us(y,m))}return t.dirs&&(y=Us(y),y.dirs=y.dirs?y.dirs.concat(t.dirs):t.dirs),t.transition&&(y.transition=t.transition),_=y,_l(E),_}const p_=n=>{let e;for(const t in n)(t==="class"||t==="style"||wl(t))&&((e||(e={}))[t]=n[t]);return e},m_=(n,e)=>{const t={};for(const i in n)(!Rc(i)||!(i.slice(9)in e))&&(t[i]=n[i]);return t};function g_(n,e,t){const{props:i,children:s,component:r}=n,{props:o,children:a,patchFlag:l}=e,u=r.emitsOptions;if(e.dirs||e.transition)return!0;if(t&&l>=0){if(l&1024)return!0;if(l&16)return i?Hd(i,o,u):!!o;if(l&8){const d=e.dynamicProps;for(let h=0;h<d.length;h++){const f=d[h];if(o[f]!==i[f]&&!Pl(u,f))return!0}}}else return(s||a)&&(!a||!a.$stable)?!0:i===o?!1:i?o?Hd(i,o,u):!0:!!o;return!1}function Hd(n,e,t){const i=Object.keys(e);if(i.length!==Object.keys(n).length)return!0;for(let s=0;s<i.length;s++){const r=i[s];if(e[r]!==n[r]&&!Pl(t,r))return!0}return!1}function __({vnode:n,parent:e},t){for(;e&&e.subTree===n;)(n=e.vnode).el=t,e=e.parent}const v_=n=>n.__isSuspense;function y_(n,e){e&&e.pendingBranch?ct(n)?e.effects.push(...n):e.effects.push(n):d_(n)}function rl(n,e){if(sn){let t=sn.provides;const i=sn.parent&&sn.parent.provides;i===t&&(t=sn.provides=Object.create(i)),t[n]=e}}function mi(n,e,t=!1){const i=sn||ii;if(i){const s=i.parent==null?i.vnode.appContext&&i.vnode.appContext.provides:i.parent.provides;if(s&&n in s)return s[n];if(arguments.length>1)return t&&_t(e)?e.call(i.proxy):e}}function tu(n,e){return $c(n,null,e)}const wa={};function _n(n,e,t){return $c(n,e,t)}function $c(n,e,{immediate:t,deep:i,flush:s,onTrack:r,onTrigger:o}=Wt){const a=zp()===(sn==null?void 0:sn.scope)?sn:null;let l,u=!1,d=!1;if(rn(n)?(l=()=>n.value,u=gl(n)):Fs(n)?(l=()=>n,i=!0):ct(n)?(d=!0,u=n.some(y=>Fs(y)||gl(y)),l=()=>n.map(y=>{if(rn(y))return y.value;if(Fs(y))return tr(y);if(_t(y))return Ps(y,a,2)})):_t(n)?e?l=()=>Ps(n,a,2):l=()=>{if(!(a&&a.isUnmounted))return h&&h(),pi(n,a,3,[f])}:l=Mi,e&&i){const y=l;l=()=>tr(y())}let h,f=y=>{h=m.onStop=()=>{Ps(y,a,4)}},p;if(aa)if(f=Mi,e?t&&pi(e,a,3,[l(),d?[]:void 0,f]):l(),s==="sync"){const y=cv();p=y.__watcherHandles||(y.__watcherHandles=[])}else return Mi;let g=d?new Array(n.length).fill(wa):wa;const v=()=>{if(!!m.active)if(e){const y=m.run();(i||u||(d?y.some((x,M)=>ea(x,g[M])):ea(y,g)))&&(h&&h(),pi(e,a,3,[y,g===wa?void 0:d&&g[0]===wa?[]:g,f]),g=y)}else m.run()};v.allowRecurse=!!e;let _;s==="sync"?_=v:s==="post"?_=()=>Xn(v,a&&a.suspense):(v.pre=!0,a&&(v.id=a.uid),_=()=>Hc(v));const m=new Ic(l,_);e?t?v():g=m.run():s==="post"?Xn(m.run.bind(m),a&&a.suspense):m.run();const E=()=>{m.stop(),a&&a.scope&&Fc(a.scope.effects,m)};return p&&p.push(E),E}function E_(n,e,t){const i=this.proxy,s=on(n)?n.includes(".")?um(i,n):()=>i[n]:n.bind(i,i);let r;_t(e)?r=e:(r=e.handler,t=e);const o=sn;oo(this);const a=$c(s,r.bind(i),t);return o?oo(o):sr(),a}function um(n,e){const t=e.split(".");return()=>{let i=n;for(let s=0;s<t.length&&i;s++)i=i[t[s]];return i}}function tr(n,e){if(!kt(n)||n.__v_skip||(e=e||new Set,e.has(n)))return n;if(e.add(n),rn(n))tr(n.value,e);else if(ct(n))for(let t=0;t<n.length;t++)tr(n[t],e);else if(Tl(n)||Jr(n))n.forEach(t=>{tr(t,e)});else if(Np(n))for(const t in n)tr(n[t],e);return n}function cm(){const n={isMounted:!1,isLeaving:!1,isUnmounting:!1,leavingVNodes:new Map};return ks(()=>{n.isMounted=!0}),$i(()=>{n.isUnmounting=!0}),n}const oi=[Function,Array],x_={name:"BaseTransition",props:{mode:String,appear:Boolean,persisted:Boolean,onBeforeEnter:oi,onEnter:oi,onAfterEnter:oi,onEnterCancelled:oi,onBeforeLeave:oi,onLeave:oi,onAfterLeave:oi,onLeaveCancelled:oi,onBeforeAppear:oi,onAppear:oi,onAfterAppear:oi,onAppearCancelled:oi},setup(n,{slots:e}){const t=jc(),i=cm();let s;return()=>{const r=e.default&&Vc(e.default(),!0);if(!r||!r.length)return;let o=r[0];if(r.length>1){for(const v of r)if(v.type!==Ai){o=v;break}}const a=At(n),{mode:l}=a;if(i.isLeaving)return nu(o);const u=$d(o);if(!u)return nu(o);const d=sa(u,a,i,t);ra(u,d);const h=t.subTree,f=h&&$d(h);let p=!1;const{getTransitionKey:g}=u.type;if(g){const v=g();s===void 0?s=v:v!==s&&(s=v,p=!0)}if(f&&f.type!==Ai&&(!Js(u,f)||p)){const v=sa(f,a,i,t);if(ra(f,v),l==="out-in")return i.isLeaving=!0,v.afterLeave=()=>{i.isLeaving=!1,t.update.active!==!1&&t.update()},nu(o);l==="in-out"&&u.type!==Ai&&(v.delayLeave=(_,m,E)=>{const y=hm(i,f);y[String(f.key)]=f,_._leaveCb=()=>{m(),_._leaveCb=void 0,delete d.delayedLeave},d.delayedLeave=E})}return o}}},dm=x_;function hm(n,e){const{leavingVNodes:t}=n;let i=t.get(e.type);return i||(i=Object.create(null),t.set(e.type,i)),i}function sa(n,e,t,i){const{appear:s,mode:r,persisted:o=!1,onBeforeEnter:a,onEnter:l,onAfterEnter:u,onEnterCancelled:d,onBeforeLeave:h,onLeave:f,onAfterLeave:p,onLeaveCancelled:g,onBeforeAppear:v,onAppear:_,onAfterAppear:m,onAppearCancelled:E}=e,y=String(n.key),x=hm(t,n),M=(I,b)=>{I&&pi(I,i,9,b)},A=(I,b)=>{const w=b[1];M(I,b),ct(I)?I.every(oe=>oe.length<=1)&&w():I.length<=1&&w()},F={mode:r,persisted:o,beforeEnter(I){let b=a;if(!t.isMounted)if(s)b=v||a;else return;I._leaveCb&&I._leaveCb(!0);const w=x[y];w&&Js(n,w)&&w.el._leaveCb&&w.el._leaveCb(),M(b,[I])},enter(I){let b=l,w=u,oe=d;if(!t.isMounted)if(s)b=_||l,w=m||u,oe=E||d;else return;let X=!1;const z=I._enterCb=T=>{X||(X=!0,T?M(oe,[I]):M(w,[I]),F.delayedLeave&&F.delayedLeave(),I._enterCb=void 0)};b?A(b,[I,z]):z()},leave(I,b){const w=String(n.key);if(I._enterCb&&I._enterCb(!0),t.isUnmounting)return b();M(h,[I]);let oe=!1;const X=I._leaveCb=z=>{oe||(oe=!0,b(),z?M(g,[I]):M(p,[I]),I._leaveCb=void 0,x[w]===n&&delete x[w])};x[w]=n,f?A(f,[I,X]):X()},clone(I){return sa(I,e,t,i)}};return F}function nu(n){if(Il(n))return n=Us(n),n.children=null,n}function $d(n){return Il(n)?n.children?n.children[0]:void 0:n}function ra(n,e){n.shapeFlag&6&&n.component?ra(n.component.subTree,e):n.shapeFlag&128?(n.ssContent.transition=e.clone(n.ssContent),n.ssFallback.transition=e.clone(n.ssFallback)):n.transition=e}function Vc(n,e=!1,t){let i=[],s=0;for(let r=0;r<n.length;r++){let o=n[r];const a=t==null?o.key:String(t)+String(o.key!=null?o.key:r);o.type===He?(o.patchFlag&128&&s++,i=i.concat(Vc(o.children,e,a))):(e||o.type!==Ai)&&i.push(a!=null?Us(o,{key:a}):o)}if(s>1)for(let r=0;r<i.length;r++)i[r].patchFlag=-2;return i}function It(n){return _t(n)?{setup:n,name:n.name}:n}const ol=n=>!!n.type.__asyncLoader,Il=n=>n.type.__isKeepAlive;function b_(n,e){fm(n,"a",e)}function M_(n,e){fm(n,"da",e)}function fm(n,e,t=sn){const i=n.__wdc||(n.__wdc=()=>{let s=t;for(;s;){if(s.isDeactivated)return;s=s.parent}return n()});if(Bl(e,i,t),t){let s=t.parent;for(;s&&s.parent;)Il(s.parent.vnode)&&A_(i,e,t,s),s=s.parent}}function A_(n,e,t,i){const s=Bl(e,n,i,!0);Ul(()=>{Fc(i[e],s)},t)}function Bl(n,e,t=sn,i=!1){if(t){const s=t[n]||(t[n]=[]),r=e.__weh||(e.__weh=(...o)=>{if(t.isUnmounted)return;yo(),oo(t);const a=pi(e,t,n,o);return sr(),Eo(),a});return i?s.unshift(r):s.push(r),r}}const as=n=>(e,t=sn)=>(!aa||n==="sp")&&Bl(n,(...i)=>e(...i),t),S_=as("bm"),ks=as("m"),w_=as("bu"),pm=as("u"),$i=as("bum"),Ul=as("um"),T_=as("sp"),C_=as("rtg"),D_=as("rtc");function R_(n,e=sn){Bl("ec",n,e)}function ss(n,e){const t=ii;if(t===null)return n;const i=kl(t)||t.proxy,s=n.dirs||(n.dirs=[]);for(let r=0;r<e.length;r++){let[o,a,l,u=Wt]=e[r];o&&(_t(o)&&(o={mounted:o,updated:o}),o.deep&&tr(a),s.push({dir:o,instance:i,value:a,oldValue:void 0,arg:l,modifiers:u}))}return n}function Hs(n,e,t,i){const s=n.dirs,r=e&&e.dirs;for(let o=0;o<s.length;o++){const a=s[o];r&&(a.oldValue=r[o].value);let l=a.dir[i];l&&(yo(),pi(l,t,8,[n.el,a,n,e]),Eo())}}const mm="components",gm=Symbol();function F_(n){return on(n)?P_(mm,n,!1)||n:n||gm}function P_(n,e,t=!0,i=!1){const s=ii||sn;if(s){const r=s.type;if(n===mm){const a=av(r,!1);if(a&&(a===e||a===Ui(e)||a===Dl(Ui(e))))return r}const o=Vd(s[n]||r[n],e)||Vd(s.appContext[n],e);return!o&&i?r:o}}function Vd(n,e){return n&&(n[e]||n[Ui(e)]||n[Dl(Ui(e))])}function pt(n,e,t,i){let s;const r=t&&t[i];if(ct(n)||on(n)){s=new Array(n.length);for(let o=0,a=n.length;o<a;o++)s[o]=e(n[o],o,void 0,r&&r[o])}else if(typeof n=="number"){s=new Array(n);for(let o=0;o<n;o++)s[o]=e(o+1,o,void 0,r&&r[o])}else if(kt(n))if(n[Symbol.iterator])s=Array.from(n,(o,a)=>e(o,a,void 0,r&&r[a]));else{const o=Object.keys(n);s=new Array(o.length);for(let a=0,l=o.length;a<l;a++){const u=o[a];s[a]=e(n[u],u,a,r&&r[a])}}else s=[];return t&&(t[i]=s),s}const ec=n=>n?Cm(n)?kl(n)||n.proxy:ec(n.parent):null,Vo=En(Object.create(null),{$:n=>n,$el:n=>n.vnode.el,$data:n=>n.data,$props:n=>n.props,$attrs:n=>n.attrs,$slots:n=>n.slots,$refs:n=>n.refs,$parent:n=>ec(n.parent),$root:n=>ec(n.root),$emit:n=>n.emit,$options:n=>Gc(n),$forceUpdate:n=>n.f||(n.f=()=>Hc(n.update)),$nextTick:n=>n.n||(n.n=jn.bind(n.proxy)),$watch:n=>E_.bind(n)}),iu=(n,e)=>n!==Wt&&!n.__isScriptSetup&&Dt(n,e),L_={get({_:n},e){const{ctx:t,setupState:i,data:s,props:r,accessCache:o,type:a,appContext:l}=n;let u;if(e[0]!=="$"){const p=o[e];if(p!==void 0)switch(p){case 1:return i[e];case 2:return s[e];case 4:return t[e];case 3:return r[e]}else{if(iu(i,e))return o[e]=1,i[e];if(s!==Wt&&Dt(s,e))return o[e]=2,s[e];if((u=n.propsOptions[0])&&Dt(u,e))return o[e]=3,r[e];if(t!==Wt&&Dt(t,e))return o[e]=4,t[e];tc&&(o[e]=0)}}const d=Vo[e];let h,f;if(d)return e==="$attrs"&&Jn(n,"get",e),d(n);if((h=a.__cssModules)&&(h=h[e]))return h;if(t!==Wt&&Dt(t,e))return o[e]=4,t[e];if(f=l.config.globalProperties,Dt(f,e))return f[e]},set({_:n},e,t){const{data:i,setupState:s,ctx:r}=n;return iu(s,e)?(s[e]=t,!0):i!==Wt&&Dt(i,e)?(i[e]=t,!0):Dt(n.props,e)||e[0]==="$"&&e.slice(1)in n?!1:(r[e]=t,!0)},has({_:{data:n,setupState:e,accessCache:t,ctx:i,appContext:s,propsOptions:r}},o){let a;return!!t[o]||n!==Wt&&Dt(n,o)||iu(e,o)||(a=r[0])&&Dt(a,o)||Dt(i,o)||Dt(Vo,o)||Dt(s.config.globalProperties,o)},defineProperty(n,e,t){return t.get!=null?n._.accessCache[e]=0:Dt(t,"value")&&this.set(n,e,t.value,null),Reflect.defineProperty(n,e,t)}};let tc=!0;function I_(n){const e=Gc(n),t=n.proxy,i=n.ctx;tc=!1,e.beforeCreate&&Gd(e.beforeCreate,n,"bc");const{data:s,computed:r,methods:o,watch:a,provide:l,inject:u,created:d,beforeMount:h,mounted:f,beforeUpdate:p,updated:g,activated:v,deactivated:_,beforeDestroy:m,beforeUnmount:E,destroyed:y,unmounted:x,render:M,renderTracked:A,renderTriggered:F,errorCaptured:I,serverPrefetch:b,expose:w,inheritAttrs:oe,components:X,directives:z,filters:T}=e;if(u&&B_(u,i,null,n.appContext.config.unwrapInjectedRef),o)for(const ae in o){const C=o[ae];_t(C)&&(i[ae]=C.bind(t))}if(s){const ae=s.call(t,t);kt(ae)&&(n.data=Bn(ae))}if(tc=!0,r)for(const ae in r){const C=r[ae],J=_t(C)?C.bind(t,t):_t(C.get)?C.get.bind(t,t):Mi,$=!_t(C)&&_t(C.set)?C.set.bind(t):Mi,ee=Qe({get:J,set:$});Object.defineProperty(i,ae,{enumerable:!0,configurable:!0,get:()=>ee.value,set:U=>ee.value=U})}if(a)for(const ae in a)_m(a[ae],i,t,ae);if(l){const ae=_t(l)?l.call(t):l;Reflect.ownKeys(ae).forEach(C=>{rl(C,ae[C])})}d&&Gd(d,n,"c");function re(ae,C){ct(C)?C.forEach(J=>ae(J.bind(t))):C&&ae(C.bind(t))}if(re(S_,h),re(ks,f),re(w_,p),re(pm,g),re(b_,v),re(M_,_),re(R_,I),re(D_,A),re(C_,F),re($i,E),re(Ul,x),re(T_,b),ct(w))if(w.length){const ae=n.exposed||(n.exposed={});w.forEach(C=>{Object.defineProperty(ae,C,{get:()=>t[C],set:J=>t[C]=J})})}else n.exposed||(n.exposed={});M&&n.render===Mi&&(n.render=M),oe!=null&&(n.inheritAttrs=oe),X&&(n.components=X),z&&(n.directives=z)}function B_(n,e,t=Mi,i=!1){ct(n)&&(n=nc(n));for(const s in n){const r=n[s];let o;kt(r)?"default"in r?o=mi(r.from||s,r.default,!0):o=mi(r.from||s):o=mi(r),rn(o)&&i?Object.defineProperty(e,s,{enumerable:!0,configurable:!0,get:()=>o.value,set:a=>o.value=a}):e[s]=o}}function Gd(n,e,t){pi(ct(n)?n.map(i=>i.bind(e.proxy)):n.bind(e.proxy),e,t)}function _m(n,e,t,i){const s=i.includes(".")?um(t,i):()=>t[i];if(on(n)){const r=e[n];_t(r)&&_n(s,r)}else if(_t(n))_n(s,n.bind(t));else if(kt(n))if(ct(n))n.forEach(r=>_m(r,e,t,i));else{const r=_t(n.handler)?n.handler.bind(t):e[n.handler];_t(r)&&_n(s,r,n)}}function Gc(n){const e=n.type,{mixins:t,extends:i}=e,{mixins:s,optionsCache:r,config:{optionMergeStrategies:o}}=n.appContext,a=r.get(e);let l;return a?l=a:!s.length&&!t&&!i?l=e:(l={},s.length&&s.forEach(u=>vl(l,u,o,!0)),vl(l,e,o)),kt(e)&&r.set(e,l),l}function vl(n,e,t,i=!1){const{mixins:s,extends:r}=e;r&&vl(n,r,t,!0),s&&s.forEach(o=>vl(n,o,t,!0));for(const o in e)if(!(i&&o==="expose")){const a=U_[o]||t&&t[o];n[o]=a?a(n[o],e[o]):e[o]}return n}const U_={data:Wd,props:js,emits:js,methods:js,computed:js,beforeCreate:zn,created:zn,beforeMount:zn,mounted:zn,beforeUpdate:zn,updated:zn,beforeDestroy:zn,beforeUnmount:zn,destroyed:zn,unmounted:zn,activated:zn,deactivated:zn,errorCaptured:zn,serverPrefetch:zn,components:js,directives:js,watch:O_,provide:Wd,inject:N_};function Wd(n,e){return e?n?function(){return En(_t(n)?n.call(this,this):n,_t(e)?e.call(this,this):e)}:e:n}function N_(n,e){return js(nc(n),nc(e))}function nc(n){if(ct(n)){const e={};for(let t=0;t<n.length;t++)e[n[t]]=n[t];return e}return n}function zn(n,e){return n?[...new Set([].concat(n,e))]:e}function js(n,e){return n?En(En(Object.create(null),n),e):e}function O_(n,e){if(!n)return e;if(!e)return n;const t=En(Object.create(null),n);for(const i in e)t[i]=zn(n[i],e[i]);return t}function k_(n,e,t,i=!1){const s={},r={};pl(r,Ol,1),n.propsDefaults=Object.create(null),vm(n,e,s,r);for(const o in n.propsOptions[0])o in s||(s[o]=void 0);t?n.props=i?s:Qg(s):n.type.props?n.props=s:n.props=r,n.attrs=r}function z_(n,e,t,i){const{props:s,attrs:r,vnode:{patchFlag:o}}=n,a=At(s),[l]=n.propsOptions;let u=!1;if((i||o>0)&&!(o&16)){if(o&8){const d=n.vnode.dynamicProps;for(let h=0;h<d.length;h++){let f=d[h];if(Pl(n.emitsOptions,f))continue;const p=e[f];if(l)if(Dt(r,f))p!==r[f]&&(r[f]=p,u=!0);else{const g=Ui(f);s[g]=ic(l,a,g,p,n,!1)}else p!==r[f]&&(r[f]=p,u=!0)}}}else{vm(n,e,s,r)&&(u=!0);let d;for(const h in a)(!e||!Dt(e,h)&&((d=mr(h))===h||!Dt(e,d)))&&(l?t&&(t[h]!==void 0||t[d]!==void 0)&&(s[h]=ic(l,a,h,void 0,n,!0)):delete s[h]);if(r!==a)for(const h in r)(!e||!Dt(e,h)&&!0)&&(delete r[h],u=!0)}u&&os(n,"set","$attrs")}function vm(n,e,t,i){const[s,r]=n.propsOptions;let o=!1,a;if(e)for(let l in e){if(il(l))continue;const u=e[l];let d;s&&Dt(s,d=Ui(l))?!r||!r.includes(d)?t[d]=u:(a||(a={}))[d]=u:Pl(n.emitsOptions,l)||(!(l in i)||u!==i[l])&&(i[l]=u,o=!0)}if(r){const l=At(t),u=a||Wt;for(let d=0;d<r.length;d++){const h=r[d];t[h]=ic(s,l,h,u[h],n,!Dt(u,h))}}return o}function ic(n,e,t,i,s,r){const o=n[t];if(o!=null){const a=Dt(o,"default");if(a&&i===void 0){const l=o.default;if(o.type!==Function&&_t(l)){const{propsDefaults:u}=s;t in u?i=u[t]:(oo(s),i=u[t]=l.call(null,e),sr())}else i=l}o[0]&&(r&&!a?i=!1:o[1]&&(i===""||i===mr(t))&&(i=!0))}return i}function ym(n,e,t=!1){const i=e.propsCache,s=i.get(n);if(s)return s;const r=n.props,o={},a=[];let l=!1;if(!_t(n)){const d=h=>{l=!0;const[f,p]=ym(h,e,!0);En(o,f),p&&a.push(...p)};!t&&e.mixins.length&&e.mixins.forEach(d),n.extends&&d(n.extends),n.mixins&&n.mixins.forEach(d)}if(!r&&!l)return kt(n)&&i.set(n,Yr),Yr;if(ct(r))for(let d=0;d<r.length;d++){const h=Ui(r[d]);Xd(h)&&(o[h]=Wt)}else if(r)for(const d in r){const h=Ui(d);if(Xd(h)){const f=r[d],p=o[h]=ct(f)||_t(f)?{type:f}:Object.assign({},f);if(p){const g=Kd(Boolean,p.type),v=Kd(String,p.type);p[0]=g>-1,p[1]=v<0||g<v,(g>-1||Dt(p,"default"))&&a.push(h)}}}const u=[o,a];return kt(n)&&i.set(n,u),u}function Xd(n){return n[0]!=="$"}function jd(n){const e=n&&n.toString().match(/^\s*(function|class) (\w+)/);return e?e[2]:n===null?"null":""}function qd(n,e){return jd(n)===jd(e)}function Kd(n,e){return ct(e)?e.findIndex(t=>qd(t,n)):_t(e)&&qd(e,n)?0:-1}const Em=n=>n[0]==="_"||n==="$stable",Wc=n=>ct(n)?n.map(Li):[Li(n)],H_=(n,e,t)=>{if(e._n)return e;const i=qt((...s)=>Wc(e(...s)),t);return i._c=!1,i},xm=(n,e,t)=>{const i=n._ctx;for(const s in n){if(Em(s))continue;const r=n[s];if(_t(r))e[s]=H_(s,r,i);else if(r!=null){const o=Wc(r);e[s]=()=>o}}},bm=(n,e)=>{const t=Wc(e);n.slots.default=()=>t},$_=(n,e)=>{if(n.vnode.shapeFlag&32){const t=e._;t?(n.slots=At(e),pl(e,"_",t)):xm(e,n.slots={})}else n.slots={},e&&bm(n,e);pl(n.slots,Ol,1)},V_=(n,e,t)=>{const{vnode:i,slots:s}=n;let r=!0,o=Wt;if(i.shapeFlag&32){const a=e._;a?t&&a===1?r=!1:(En(s,e),!t&&a===1&&delete s._):(r=!e.$stable,xm(e,s)),o=e}else e&&(bm(n,e),o={default:1});if(r)for(const a in s)!Em(a)&&!(a in o)&&delete s[a]};function Mm(){return{app:null,config:{isNativeTag:gg,performance:!1,globalProperties:{},optionMergeStrategies:{},errorHandler:void 0,warnHandler:void 0,compilerOptions:{}},mixins:[],components:{},directives:{},provides:Object.create(null),optionsCache:new WeakMap,propsCache:new WeakMap,emitsCache:new WeakMap}}let G_=0;function W_(n,e){return function(i,s=null){_t(i)||(i=Object.assign({},i)),s!=null&&!kt(s)&&(s=null);const r=Mm(),o=new Set;let a=!1;const l=r.app={_uid:G_++,_component:i,_props:s,_container:null,_context:r,_instance:null,version:dv,get config(){return r.config},set config(u){},use(u,...d){return o.has(u)||(u&&_t(u.install)?(o.add(u),u.install(l,...d)):_t(u)&&(o.add(u),u(l,...d))),l},mixin(u){return r.mixins.includes(u)||r.mixins.push(u),l},component(u,d){return d?(r.components[u]=d,l):r.components[u]},directive(u,d){return d?(r.directives[u]=d,l):r.directives[u]},mount(u,d,h){if(!a){const f=tt(i,s);return f.appContext=r,d&&e?e(f,u):n(f,u,h),a=!0,l._container=u,u.__vue_app__=l,kl(f.component)||f.component.proxy}},unmount(){a&&(n(null,l._container),delete l._container.__vue_app__)},provide(u,d){return r.provides[u]=d,l}};return l}}function sc(n,e,t,i,s=!1){if(ct(n)){n.forEach((f,p)=>sc(f,e&&(ct(e)?e[p]:e),t,i,s));return}if(ol(i)&&!s)return;const r=i.shapeFlag&4?kl(i.component)||i.component.proxy:i.el,o=s?null:r,{i:a,r:l}=n,u=e&&e.r,d=a.refs===Wt?a.refs={}:a.refs,h=a.setupState;if(u!=null&&u!==l&&(on(u)?(d[u]=null,Dt(h,u)&&(h[u]=null)):rn(u)&&(u.value=null)),_t(l))Ps(l,a,12,[o,d]);else{const f=on(l),p=rn(l);if(f||p){const g=()=>{if(n.f){const v=f?Dt(h,l)?h[l]:d[l]:l.value;s?ct(v)&&Fc(v,r):ct(v)?v.includes(r)||v.push(r):f?(d[l]=[r],Dt(h,l)&&(h[l]=d[l])):(l.value=[r],n.k&&(d[n.k]=l.value))}else f?(d[l]=o,Dt(h,l)&&(h[l]=o)):p&&(l.value=o,n.k&&(d[n.k]=o))};o?(g.id=-1,Xn(g,t)):g()}}}const Xn=y_;function X_(n){return j_(n)}function j_(n,e){const t=Mg();t.__VUE__=!0;const{insert:i,remove:s,patchProp:r,createElement:o,createText:a,createComment:l,setText:u,setElementText:d,parentNode:h,nextSibling:f,setScopeId:p=Mi,insertStaticContent:g}=n,v=(P,k,ue,fe=null,be=null,De=null,Ie=!1,Ae=null,Re=!!k.dynamicChildren)=>{if(P===k)return;P&&!Js(P,k)&&(fe=O(P),U(P,be,De,!0),P=null),k.patchFlag===-2&&(Re=!1,k.dynamicChildren=null);const{type:Te,ref:D,shapeFlag:S}=k;switch(Te){case Nl:_(P,k,ue,fe);break;case Ai:m(P,k,ue,fe);break;case al:P==null&&E(k,ue,fe,Ie);break;case He:X(P,k,ue,fe,be,De,Ie,Ae,Re);break;default:S&1?M(P,k,ue,fe,be,De,Ie,Ae,Re):S&6?z(P,k,ue,fe,be,De,Ie,Ae,Re):(S&64||S&128)&&Te.process(P,k,ue,fe,be,De,Ie,Ae,Re,Oe)}D!=null&&be&&sc(D,P&&P.ref,De,k||P,!k)},_=(P,k,ue,fe)=>{if(P==null)i(k.el=a(k.children),ue,fe);else{const be=k.el=P.el;k.children!==P.children&&u(be,k.children)}},m=(P,k,ue,fe)=>{P==null?i(k.el=l(k.children||""),ue,fe):k.el=P.el},E=(P,k,ue,fe)=>{[P.el,P.anchor]=g(P.children,k,ue,fe,P.el,P.anchor)},y=({el:P,anchor:k},ue,fe)=>{let be;for(;P&&P!==k;)be=f(P),i(P,ue,fe),P=be;i(k,ue,fe)},x=({el:P,anchor:k})=>{let ue;for(;P&&P!==k;)ue=f(P),s(P),P=ue;s(k)},M=(P,k,ue,fe,be,De,Ie,Ae,Re)=>{Ie=Ie||k.type==="svg",P==null?A(k,ue,fe,be,De,Ie,Ae,Re):b(P,k,be,De,Ie,Ae,Re)},A=(P,k,ue,fe,be,De,Ie,Ae)=>{let Re,Te;const{type:D,props:S,shapeFlag:se,transition:ve,dirs:xe}=P;if(Re=P.el=o(P.type,De,S&&S.is,S),se&8?d(Re,P.children):se&16&&I(P.children,Re,null,fe,be,De&&D!=="foreignObject",Ie,Ae),xe&&Hs(P,null,fe,"created"),F(Re,P,P.scopeId,Ie,fe),S){for(const W in S)W!=="value"&&!il(W)&&r(Re,W,null,S[W],De,P.children,fe,be,ce);"value"in S&&r(Re,"value",null,S.value),(Te=S.onVnodeBeforeMount)&&Ri(Te,fe,P)}xe&&Hs(P,null,fe,"beforeMount");const Le=(!be||be&&!be.pendingBranch)&&ve&&!ve.persisted;Le&&ve.beforeEnter(Re),i(Re,k,ue),((Te=S&&S.onVnodeMounted)||Le||xe)&&Xn(()=>{Te&&Ri(Te,fe,P),Le&&ve.enter(Re),xe&&Hs(P,null,fe,"mounted")},be)},F=(P,k,ue,fe,be)=>{if(ue&&p(P,ue),fe)for(let De=0;De<fe.length;De++)p(P,fe[De]);if(be){let De=be.subTree;if(k===De){const Ie=be.vnode;F(P,Ie,Ie.scopeId,Ie.slotScopeIds,be.parent)}}},I=(P,k,ue,fe,be,De,Ie,Ae,Re=0)=>{for(let Te=Re;Te<P.length;Te++){const D=P[Te]=Ae?Ss(P[Te]):Li(P[Te]);v(null,D,k,ue,fe,be,De,Ie,Ae)}},b=(P,k,ue,fe,be,De,Ie)=>{const Ae=k.el=P.el;let{patchFlag:Re,dynamicChildren:Te,dirs:D}=k;Re|=P.patchFlag&16;const S=P.props||Wt,se=k.props||Wt;let ve;ue&&$s(ue,!1),(ve=se.onVnodeBeforeUpdate)&&Ri(ve,ue,k,P),D&&Hs(k,P,ue,"beforeUpdate"),ue&&$s(ue,!0);const xe=be&&k.type!=="foreignObject";if(Te?w(P.dynamicChildren,Te,Ae,ue,fe,xe,De):Ie||C(P,k,Ae,null,ue,fe,xe,De,!1),Re>0){if(Re&16)oe(Ae,k,S,se,ue,fe,be);else if(Re&2&&S.class!==se.class&&r(Ae,"class",null,se.class,be),Re&4&&r(Ae,"style",S.style,se.style,be),Re&8){const Le=k.dynamicProps;for(let W=0;W<Le.length;W++){const ye=Le[W],pe=S[ye],ze=se[ye];(ze!==pe||ye==="value")&&r(Ae,ye,pe,ze,be,P.children,ue,fe,ce)}}Re&1&&P.children!==k.children&&d(Ae,k.children)}else!Ie&&Te==null&&oe(Ae,k,S,se,ue,fe,be);((ve=se.onVnodeUpdated)||D)&&Xn(()=>{ve&&Ri(ve,ue,k,P),D&&Hs(k,P,ue,"updated")},fe)},w=(P,k,ue,fe,be,De,Ie)=>{for(let Ae=0;Ae<k.length;Ae++){const Re=P[Ae],Te=k[Ae],D=Re.el&&(Re.type===He||!Js(Re,Te)||Re.shapeFlag&70)?h(Re.el):ue;v(Re,Te,D,null,fe,be,De,Ie,!0)}},oe=(P,k,ue,fe,be,De,Ie)=>{if(ue!==fe){if(ue!==Wt)for(const Ae in ue)!il(Ae)&&!(Ae in fe)&&r(P,Ae,ue[Ae],null,Ie,k.children,be,De,ce);for(const Ae in fe){if(il(Ae))continue;const Re=fe[Ae],Te=ue[Ae];Re!==Te&&Ae!=="value"&&r(P,Ae,Te,Re,Ie,k.children,be,De,ce)}"value"in fe&&r(P,"value",ue.value,fe.value)}},X=(P,k,ue,fe,be,De,Ie,Ae,Re)=>{const Te=k.el=P?P.el:a(""),D=k.anchor=P?P.anchor:a("");let{patchFlag:S,dynamicChildren:se,slotScopeIds:ve}=k;ve&&(Ae=Ae?Ae.concat(ve):ve),P==null?(i(Te,ue,fe),i(D,ue,fe),I(k.children,ue,D,be,De,Ie,Ae,Re)):S>0&&S&64&&se&&P.dynamicChildren?(w(P.dynamicChildren,se,ue,be,De,Ie,Ae),(k.key!=null||be&&k===be.subTree)&&Am(P,k,!0)):C(P,k,ue,D,be,De,Ie,Ae,Re)},z=(P,k,ue,fe,be,De,Ie,Ae,Re)=>{k.slotScopeIds=Ae,P==null?k.shapeFlag&512?be.ctx.activate(k,ue,fe,Ie,Re):T(k,ue,fe,be,De,Ie,Re):G(P,k,Re)},T=(P,k,ue,fe,be,De,Ie)=>{const Ae=P.component=nv(P,fe,be);if(Il(P)&&(Ae.ctx.renderer=Oe),iv(Ae),Ae.asyncDep){if(be&&be.registerDep(Ae,re),!P.el){const Re=Ae.subTree=tt(Ai);m(null,Re,k,ue)}return}re(Ae,P,k,ue,be,De,Ie)},G=(P,k,ue)=>{const fe=k.component=P.component;if(g_(P,k,ue))if(fe.asyncDep&&!fe.asyncResolved){ae(fe,k,ue);return}else fe.next=k,c_(fe.update),fe.update();else k.el=P.el,fe.vnode=k},re=(P,k,ue,fe,be,De,Ie)=>{const Ae=()=>{if(P.isMounted){let{next:D,bu:S,u:se,parent:ve,vnode:xe}=P,Le=D,W;$s(P,!1),D?(D.el=xe.el,ae(P,D,Ie)):D=xe,S&&sl(S),(W=D.props&&D.props.onVnodeBeforeUpdate)&&Ri(W,ve,D,xe),$s(P,!0);const ye=eu(P),pe=P.subTree;P.subTree=ye,v(pe,ye,h(pe.el),O(pe),P,be,De),D.el=ye.el,Le===null&&__(P,ye.el),se&&Xn(se,be),(W=D.props&&D.props.onVnodeUpdated)&&Xn(()=>Ri(W,ve,D,xe),be)}else{let D;const{el:S,props:se}=k,{bm:ve,m:xe,parent:Le}=P,W=ol(k);if($s(P,!1),ve&&sl(ve),!W&&(D=se&&se.onVnodeBeforeMount)&&Ri(D,Le,k),$s(P,!0),S&&Ne){const ye=()=>{P.subTree=eu(P),Ne(S,P.subTree,P,be,null)};W?k.type.__asyncLoader().then(()=>!P.isUnmounted&&ye()):ye()}else{const ye=P.subTree=eu(P);v(null,ye,ue,fe,P,be,De),k.el=ye.el}if(xe&&Xn(xe,be),!W&&(D=se&&se.onVnodeMounted)){const ye=k;Xn(()=>Ri(D,Le,ye),be)}(k.shapeFlag&256||Le&&ol(Le.vnode)&&Le.vnode.shapeFlag&256)&&P.a&&Xn(P.a,be),P.isMounted=!0,k=ue=fe=null}},Re=P.effect=new Ic(Ae,()=>Hc(Te),P.scope),Te=P.update=()=>Re.run();Te.id=P.uid,$s(P,!0),Te()},ae=(P,k,ue)=>{k.component=P;const fe=P.vnode.props;P.vnode=k,P.next=null,z_(P,k.props,fe,ue),V_(P,k.children,ue),yo(),zd(),Eo()},C=(P,k,ue,fe,be,De,Ie,Ae,Re=!1)=>{const Te=P&&P.children,D=P?P.shapeFlag:0,S=k.children,{patchFlag:se,shapeFlag:ve}=k;if(se>0){if(se&128){$(Te,S,ue,fe,be,De,Ie,Ae,Re);return}else if(se&256){J(Te,S,ue,fe,be,De,Ie,Ae,Re);return}}ve&8?(D&16&&ce(Te,be,De),S!==Te&&d(ue,S)):D&16?ve&16?$(Te,S,ue,fe,be,De,Ie,Ae,Re):ce(Te,be,De,!0):(D&8&&d(ue,""),ve&16&&I(S,ue,fe,be,De,Ie,Ae,Re))},J=(P,k,ue,fe,be,De,Ie,Ae,Re)=>{P=P||Yr,k=k||Yr;const Te=P.length,D=k.length,S=Math.min(Te,D);let se;for(se=0;se<S;se++){const ve=k[se]=Re?Ss(k[se]):Li(k[se]);v(P[se],ve,ue,null,be,De,Ie,Ae,Re)}Te>D?ce(P,be,De,!0,!1,S):I(k,ue,fe,be,De,Ie,Ae,Re,S)},$=(P,k,ue,fe,be,De,Ie,Ae,Re)=>{let Te=0;const D=k.length;let S=P.length-1,se=D-1;for(;Te<=S&&Te<=se;){const ve=P[Te],xe=k[Te]=Re?Ss(k[Te]):Li(k[Te]);if(Js(ve,xe))v(ve,xe,ue,null,be,De,Ie,Ae,Re);else break;Te++}for(;Te<=S&&Te<=se;){const ve=P[S],xe=k[se]=Re?Ss(k[se]):Li(k[se]);if(Js(ve,xe))v(ve,xe,ue,null,be,De,Ie,Ae,Re);else break;S--,se--}if(Te>S){if(Te<=se){const ve=se+1,xe=ve<D?k[ve].el:fe;for(;Te<=se;)v(null,k[Te]=Re?Ss(k[Te]):Li(k[Te]),ue,xe,be,De,Ie,Ae,Re),Te++}}else if(Te>se)for(;Te<=S;)U(P[Te],be,De,!0),Te++;else{const ve=Te,xe=Te,Le=new Map;for(Te=xe;Te<=se;Te++){const We=k[Te]=Re?Ss(k[Te]):Li(k[Te]);We.key!=null&&Le.set(We.key,Te)}let W,ye=0;const pe=se-xe+1;let ze=!1,Ke=0;const et=new Array(pe);for(Te=0;Te<pe;Te++)et[Te]=0;for(Te=ve;Te<=S;Te++){const We=P[Te];if(ye>=pe){U(We,be,De,!0);continue}let rt;if(We.key!=null)rt=Le.get(We.key);else for(W=xe;W<=se;W++)if(et[W-xe]===0&&Js(We,k[W])){rt=W;break}rt===void 0?U(We,be,De,!0):(et[rt-xe]=Te+1,rt>=Ke?Ke=rt:ze=!0,v(We,k[rt],ue,null,be,De,Ie,Ae,Re),ye++)}const qe=ze?q_(et):Yr;for(W=qe.length-1,Te=pe-1;Te>=0;Te--){const We=xe+Te,rt=k[We],ft=We+1<D?k[We+1].el:fe;et[Te]===0?v(null,rt,ue,ft,be,De,Ie,Ae,Re):ze&&(W<0||Te!==qe[W]?ee(rt,ue,ft,2):W--)}}},ee=(P,k,ue,fe,be=null)=>{const{el:De,type:Ie,transition:Ae,children:Re,shapeFlag:Te}=P;if(Te&6){ee(P.component.subTree,k,ue,fe);return}if(Te&128){P.suspense.move(k,ue,fe);return}if(Te&64){Ie.move(P,k,ue,Oe);return}if(Ie===He){i(De,k,ue);for(let S=0;S<Re.length;S++)ee(Re[S],k,ue,fe);i(P.anchor,k,ue);return}if(Ie===al){y(P,k,ue);return}if(fe!==2&&Te&1&&Ae)if(fe===0)Ae.beforeEnter(De),i(De,k,ue),Xn(()=>Ae.enter(De),be);else{const{leave:S,delayLeave:se,afterLeave:ve}=Ae,xe=()=>i(De,k,ue),Le=()=>{S(De,()=>{xe(),ve&&ve()})};se?se(De,xe,Le):Le()}else i(De,k,ue)},U=(P,k,ue,fe=!1,be=!1)=>{const{type:De,props:Ie,ref:Ae,children:Re,dynamicChildren:Te,shapeFlag:D,patchFlag:S,dirs:se}=P;if(Ae!=null&&sc(Ae,null,ue,P,!0),D&256){k.ctx.deactivate(P);return}const ve=D&1&&se,xe=!ol(P);let Le;if(xe&&(Le=Ie&&Ie.onVnodeBeforeUnmount)&&Ri(Le,k,P),D&6)Y(P.component,ue,fe);else{if(D&128){P.suspense.unmount(ue,fe);return}ve&&Hs(P,null,k,"beforeUnmount"),D&64?P.type.remove(P,k,ue,be,Oe,fe):Te&&(De!==He||S>0&&S&64)?ce(Te,k,ue,!1,!0):(De===He&&S&384||!be&&D&16)&&ce(Re,k,ue),fe&&N(P)}(xe&&(Le=Ie&&Ie.onVnodeUnmounted)||ve)&&Xn(()=>{Le&&Ri(Le,k,P),ve&&Hs(P,null,k,"unmounted")},ue)},N=P=>{const{type:k,el:ue,anchor:fe,transition:be}=P;if(k===He){le(ue,fe);return}if(k===al){x(P);return}const De=()=>{s(ue),be&&!be.persisted&&be.afterLeave&&be.afterLeave()};if(P.shapeFlag&1&&be&&!be.persisted){const{leave:Ie,delayLeave:Ae}=be,Re=()=>Ie(ue,De);Ae?Ae(P.el,De,Re):Re()}else De()},le=(P,k)=>{let ue;for(;P!==k;)ue=f(P),s(P),P=ue;s(k)},Y=(P,k,ue)=>{const{bum:fe,scope:be,update:De,subTree:Ie,um:Ae}=P;fe&&sl(fe),be.stop(),De&&(De.active=!1,U(Ie,P,k,ue)),Ae&&Xn(Ae,k),Xn(()=>{P.isUnmounted=!0},k),k&&k.pendingBranch&&!k.isUnmounted&&P.asyncDep&&!P.asyncResolved&&P.suspenseId===k.pendingId&&(k.deps--,k.deps===0&&k.resolve())},ce=(P,k,ue,fe=!1,be=!1,De=0)=>{for(let Ie=De;Ie<P.length;Ie++)U(P[Ie],k,ue,fe,be)},O=P=>P.shapeFlag&6?O(P.component.subTree):P.shapeFlag&128?P.suspense.next():f(P.anchor||P.el),Fe=(P,k,ue)=>{P==null?k._vnode&&U(k._vnode,null,null,!0):v(k._vnode||null,P,k,null,null,null,ue),zd(),om(),k._vnode=P},Oe={p:v,um:U,m:ee,r:N,mt:T,mc:I,pc:C,pbc:w,n:O,o:n};let Pe,Ne;return e&&([Pe,Ne]=e(Oe)),{render:Fe,hydrate:Pe,createApp:W_(Fe,Pe)}}function $s({effect:n,update:e},t){n.allowRecurse=e.allowRecurse=t}function Am(n,e,t=!1){const i=n.children,s=e.children;if(ct(i)&&ct(s))for(let r=0;r<i.length;r++){const o=i[r];let a=s[r];a.shapeFlag&1&&!a.dynamicChildren&&((a.patchFlag<=0||a.patchFlag===32)&&(a=s[r]=Ss(s[r]),a.el=o.el),t||Am(o,a)),a.type===Nl&&(a.el=o.el)}}function q_(n){const e=n.slice(),t=[0];let i,s,r,o,a;const l=n.length;for(i=0;i<l;i++){const u=n[i];if(u!==0){if(s=t[t.length-1],n[s]<u){e[i]=s,t.push(i);continue}for(r=0,o=t.length-1;r<o;)a=r+o>>1,n[t[a]]<u?r=a+1:o=a;u<n[t[r]]&&(r>0&&(e[i]=t[r-1]),t[r]=i)}}for(r=t.length,o=t[r-1];r-- >0;)t[r]=o,o=e[o];return t}const K_=n=>n.__isTeleport,He=Symbol(void 0),Nl=Symbol(void 0),Ai=Symbol(void 0),al=Symbol(void 0),Go=[];let bi=null;function H(n=!1){Go.push(bi=n?null:[])}function Y_(){Go.pop(),bi=Go[Go.length-1]||null}let oa=1;function Yd(n){oa+=n}function Sm(n){return n.dynamicChildren=oa>0?bi||Yr:null,Y_(),oa>0&&bi&&bi.push(n),n}function q(n,e,t,i,s,r){return Sm(c(n,e,t,i,s,r,!0))}function gn(n,e,t,i,s){return Sm(tt(n,e,t,i,s,!0))}function rc(n){return n?n.__v_isVNode===!0:!1}function Js(n,e){return n.type===e.type&&n.key===e.key}const Ol="__vInternal",wm=({key:n})=>n!=null?n:null,ll=({ref:n,ref_key:e,ref_for:t})=>n!=null?on(n)||rn(n)||_t(n)?{i:ii,r:n,k:e,f:!!t}:n:null;function c(n,e=null,t=null,i=0,s=null,r=n===He?0:1,o=!1,a=!1){const l={__v_isVNode:!0,__v_skip:!0,type:n,props:e,key:e&&wm(e),ref:e&&ll(e),scopeId:Ll,slotScopeIds:null,children:t,component:null,suspense:null,ssContent:null,ssFallback:null,dirs:null,transition:null,el:null,anchor:null,target:null,targetAnchor:null,staticCount:0,shapeFlag:r,patchFlag:i,dynamicProps:s,dynamicChildren:null,appContext:null,ctx:ii};return a?(Xc(l,t),r&128&&n.normalize(l)):t&&(l.shapeFlag|=on(t)?8:16),oa>0&&!o&&bi&&(l.patchFlag>0||r&6)&&l.patchFlag!==32&&bi.push(l),l}const tt=J_;function J_(n,e=null,t=null,i=0,s=null,r=!1){if((!n||n===gm)&&(n=Ai),rc(n)){const a=Us(n,e,!0);return t&&Xc(a,t),oa>0&&!r&&bi&&(a.shapeFlag&6?bi[bi.indexOf(n)]=a:bi.push(a)),a.patchFlag|=-2,a}if(lv(n)&&(n=n.__vccOpts),e){e=Z_(e);let{class:a,style:l}=e;a&&!on(a)&&(e.class=$e(a)),kt(l)&&(Zp(l)&&!ct(l)&&(l=En({},l)),e.style=Gn(l))}const o=on(n)?1:v_(n)?128:K_(n)?64:kt(n)?4:_t(n)?2:0;return c(n,e,t,i,s,o,r,!0)}function Z_(n){return n?Zp(n)||Ol in n?En({},n):n:null}function Us(n,e,t=!1){const{props:i,ref:s,patchFlag:r,children:o}=n,a=e?Q_(i||{},e):i;return{__v_isVNode:!0,__v_skip:!0,type:n.type,props:a,key:a&&wm(a),ref:e&&e.ref?t&&s?ct(s)?s.concat(ll(e)):[s,ll(e)]:ll(e):s,scopeId:n.scopeId,slotScopeIds:n.slotScopeIds,children:o,target:n.target,targetAnchor:n.targetAnchor,staticCount:n.staticCount,shapeFlag:n.shapeFlag,patchFlag:e&&n.type!==He?r===-1?16:r|16:r,dynamicProps:n.dynamicProps,dynamicChildren:n.dynamicChildren,appContext:n.appContext,dirs:n.dirs,transition:n.transition,component:n.component,suspense:n.suspense,ssContent:n.ssContent&&Us(n.ssContent),ssFallback:n.ssFallback&&Us(n.ssFallback),el:n.el,anchor:n.anchor,ctx:n.ctx,ce:n.ce}}function it(n=" ",e=0){return tt(Nl,null,n,e)}function Tm(n,e){const t=tt(al,null,n);return t.staticCount=e,t}function at(n="",e=!1){return e?(H(),gn(Ai,null,n)):tt(Ai,null,n)}function Li(n){return n==null||typeof n=="boolean"?tt(Ai):ct(n)?tt(He,null,n.slice()):typeof n=="object"?Ss(n):tt(Nl,null,String(n))}function Ss(n){return n.el===null&&n.patchFlag!==-1||n.memo?n:Us(n)}function Xc(n,e){let t=0;const{shapeFlag:i}=n;if(e==null)e=null;else if(ct(e))t=16;else if(typeof e=="object")if(i&65){const s=e.default;s&&(s._c&&(s._d=!1),Xc(n,s()),s._c&&(s._d=!0));return}else{t=32;const s=e._;!s&&!(Ol in e)?e._ctx=ii:s===3&&ii&&(ii.slots._===1?e._=1:(e._=2,n.patchFlag|=1024))}else _t(e)?(e={default:e,_ctx:ii},t=32):(e=String(e),i&64?(t=16,e=[it(e)]):t=8);n.children=e,n.shapeFlag|=t}function Q_(...n){const e={};for(let t=0;t<n.length;t++){const i=n[t];for(const s in i)if(s==="class")e.class!==i.class&&(e.class=$e([e.class,i.class]));else if(s==="style")e.style=Gn([e.style,i.style]);else if(wl(s)){const r=e[s],o=i[s];o&&r!==o&&!(ct(r)&&r.includes(o))&&(e[s]=r?[].concat(r,o):o)}else s!==""&&(e[s]=i[s])}return e}function Ri(n,e,t,i=null){pi(n,e,7,[t,i])}const ev=Mm();let tv=0;function nv(n,e,t){const i=n.type,s=(e?e.appContext:n.appContext)||ev,r={uid:tv++,vnode:n,type:i,parent:e,appContext:s,root:null,next:null,subTree:null,effect:null,update:null,scope:new Op(!0),render:null,proxy:null,exposed:null,exposeProxy:null,withProxy:null,provides:e?e.provides:Object.create(s.provides),accessCache:null,renderCache:[],components:null,directives:null,propsOptions:ym(i,s),emitsOptions:lm(i,s),emit:null,emitted:null,propsDefaults:Wt,inheritAttrs:i.inheritAttrs,ctx:Wt,data:Wt,props:Wt,attrs:Wt,slots:Wt,refs:Wt,setupState:Wt,setupContext:null,suspense:t,suspenseId:t?t.pendingId:0,asyncDep:null,asyncResolved:!1,isMounted:!1,isUnmounted:!1,isDeactivated:!1,bc:null,c:null,bm:null,m:null,bu:null,u:null,um:null,bum:null,da:null,a:null,rtg:null,rtc:null,ec:null,sp:null};return r.ctx={_:r},r.root=e?e.root:r,r.emit=f_.bind(null,r),n.ce&&n.ce(r),r}let sn=null;const jc=()=>sn||ii,oo=n=>{sn=n,n.scope.on()},sr=()=>{sn&&sn.scope.off(),sn=null};function Cm(n){return n.vnode.shapeFlag&4}let aa=!1;function iv(n,e=!1){aa=e;const{props:t,children:i}=n.vnode,s=Cm(n);k_(n,t,s,e),$_(n,i);const r=s?sv(n,e):void 0;return aa=!1,r}function sv(n,e){const t=n.type;n.accessCache=Object.create(null),n.proxy=ro(new Proxy(n.ctx,L_));const{setup:i}=t;if(i){const s=n.setupContext=i.length>1?ov(n):null;oo(n),yo();const r=Ps(i,n,0,[n.props,s]);if(Eo(),sr(),Bp(r)){if(r.then(sr,sr),e)return r.then(o=>{Jd(n,o,e)}).catch(o=>{Fl(o,n,0)});n.asyncDep=r}else Jd(n,r,e)}else Dm(n,e)}function Jd(n,e,t){_t(e)?n.type.__ssrInlineRender?n.ssrRender=e:n.render=e:kt(e)&&(n.setupState=nm(e)),Dm(n,t)}let Zd;function Dm(n,e,t){const i=n.type;if(!n.render){if(!e&&Zd&&!i.render){const s=i.template||Gc(n).template;if(s){const{isCustomElement:r,compilerOptions:o}=n.appContext.config,{delimiters:a,compilerOptions:l}=i,u=En(En({isCustomElement:r,delimiters:a},o),l);i.render=Zd(s,u)}}n.render=i.render||Mi}oo(n),yo(),I_(n),Eo(),sr()}function rv(n){return new Proxy(n.attrs,{get(e,t){return Jn(n,"get","$attrs"),e[t]}})}function ov(n){const e=i=>{n.exposed=i||{}};let t;return{get attrs(){return t||(t=rv(n))},slots:n.slots,emit:n.emit,expose:e}}function kl(n){if(n.exposed)return n.exposeProxy||(n.exposeProxy=new Proxy(nm(ro(n.exposed)),{get(e,t){if(t in e)return e[t];if(t in Vo)return Vo[t](n)},has(e,t){return t in e||t in Vo}}))}function av(n,e=!0){return _t(n)?n.displayName||n.name:n.name||e&&n.__name}function lv(n){return _t(n)&&"__vccOpts"in n}const Qe=(n,e)=>a_(n,e,aa);function qc(n,e,t){const i=arguments.length;return i===2?kt(e)&&!ct(e)?rc(e)?tt(n,null,[e]):tt(n,e):tt(n,null,e):(i>3?t=Array.prototype.slice.call(arguments,2):i===3&&rc(t)&&(t=[t]),tt(n,e,t))}const uv=Symbol(""),cv=()=>mi(uv),dv="3.2.47",hv="http://www.w3.org/2000/svg",Zs=typeof document!="undefined"?document:null,Qd=Zs&&Zs.createElement("template"),fv={insert:(n,e,t)=>{e.insertBefore(n,t||null)},remove:n=>{const e=n.parentNode;e&&e.removeChild(n)},createElement:(n,e,t,i)=>{const s=e?Zs.createElementNS(hv,n):Zs.createElement(n,t?{is:t}:void 0);return n==="select"&&i&&i.multiple!=null&&s.setAttribute("multiple",i.multiple),s},createText:n=>Zs.createTextNode(n),createComment:n=>Zs.createComment(n),setText:(n,e)=>{n.nodeValue=e},setElementText:(n,e)=>{n.textContent=e},parentNode:n=>n.parentNode,nextSibling:n=>n.nextSibling,querySelector:n=>Zs.querySelector(n),setScopeId(n,e){n.setAttribute(e,"")},insertStaticContent(n,e,t,i,s,r){const o=t?t.previousSibling:e.lastChild;if(s&&(s===r||s.nextSibling))for(;e.insertBefore(s.cloneNode(!0),t),!(s===r||!(s=s.nextSibling)););else{Qd.innerHTML=i?`<svg>${n}</svg>`:n;const a=Qd.content;if(i){const l=a.firstChild;for(;l.firstChild;)a.appendChild(l.firstChild);a.removeChild(l)}e.insertBefore(a,t)}return[o?o.nextSibling:e.firstChild,t?t.previousSibling:e.lastChild]}};function pv(n,e,t){const i=n._vtc;i&&(e=(e?[e,...i]:[...i]).join(" ")),e==null?n.removeAttribute("class"):t?n.setAttribute("class",e):n.className=e}function mv(n,e,t){const i=n.style,s=on(t);if(t&&!s){if(e&&!on(e))for(const r in e)t[r]==null&&oc(i,r,"");for(const r in t)oc(i,r,t[r])}else{const r=i.display;s?e!==t&&(i.cssText=t):e&&n.removeAttribute("style"),"_vod"in n&&(i.display=r)}}const eh=/\s*!important$/;function oc(n,e,t){if(ct(t))t.forEach(i=>oc(n,e,i));else if(t==null&&(t=""),e.startsWith("--"))n.setProperty(e,t);else{const i=gv(n,e);eh.test(t)?n.setProperty(mr(i),t.replace(eh,""),"important"):n[i]=t}}const th=["Webkit","Moz","ms"],su={};function gv(n,e){const t=su[e];if(t)return t;let i=Ui(e);if(i!=="filter"&&i in n)return su[e]=i;i=Dl(i);for(let s=0;s<th.length;s++){const r=th[s]+i;if(r in n)return su[e]=r}return e}const nh="http://www.w3.org/1999/xlink";function _v(n,e,t,i,s){if(i&&e.startsWith("xlink:"))t==null?n.removeAttributeNS(nh,e.slice(6,e.length)):n.setAttributeNS(nh,e,t);else{const r=pg(e);t==null||r&&!Pp(t)?n.removeAttribute(e):n.setAttribute(e,r?"":t)}}function vv(n,e,t,i,s,r,o){if(e==="innerHTML"||e==="textContent"){i&&o(i,s,r),n[e]=t==null?"":t;return}if(e==="value"&&n.tagName!=="PROGRESS"&&!n.tagName.includes("-")){n._value=t;const l=t==null?"":t;(n.value!==l||n.tagName==="OPTION")&&(n.value=l),t==null&&n.removeAttribute(e);return}let a=!1;if(t===""||t==null){const l=typeof n[e];l==="boolean"?t=Pp(t):t==null&&l==="string"?(t="",a=!0):l==="number"&&(t=0,a=!0)}try{n[e]=t}catch{}a&&n.removeAttribute(e)}function Qs(n,e,t,i){n.addEventListener(e,t,i)}function yv(n,e,t,i){n.removeEventListener(e,t,i)}function Ev(n,e,t,i,s=null){const r=n._vei||(n._vei={}),o=r[e];if(i&&o)o.value=i;else{const[a,l]=xv(e);if(i){const u=r[e]=Av(i,s);Qs(n,a,u,l)}else o&&(yv(n,a,o,l),r[e]=void 0)}}const ih=/(?:Once|Passive|Capture)$/;function xv(n){let e;if(ih.test(n)){e={};let i;for(;i=n.match(ih);)n=n.slice(0,n.length-i[0].length),e[i[0].toLowerCase()]=!0}return[n[2]===":"?n.slice(3):mr(n.slice(2)),e]}let ru=0;const bv=Promise.resolve(),Mv=()=>ru||(bv.then(()=>ru=0),ru=Date.now());function Av(n,e){const t=i=>{if(!i._vts)i._vts=Date.now();else if(i._vts<=t.attached)return;pi(Sv(i,t.value),e,5,[i])};return t.value=n,t.attached=Mv(),t}function Sv(n,e){if(ct(e)){const t=n.stopImmediatePropagation;return n.stopImmediatePropagation=()=>{t.call(n),n._stopped=!0},e.map(i=>s=>!s._stopped&&i&&i(s))}else return e}const sh=/^on[a-z]/,wv=(n,e,t,i,s=!1,r,o,a,l)=>{e==="class"?pv(n,i,s):e==="style"?mv(n,t,i):wl(e)?Rc(e)||Ev(n,e,t,i,o):(e[0]==="."?(e=e.slice(1),!0):e[0]==="^"?(e=e.slice(1),!1):Tv(n,e,i,s))?vv(n,e,i,r,o,a,l):(e==="true-value"?n._trueValue=i:e==="false-value"&&(n._falseValue=i),_v(n,e,i,s))};function Tv(n,e,t,i){return i?!!(e==="innerHTML"||e==="textContent"||e in n&&sh.test(e)&&_t(t)):e==="spellcheck"||e==="draggable"||e==="translate"||e==="form"||e==="list"&&n.tagName==="INPUT"||e==="type"&&n.tagName==="TEXTAREA"||sh.test(e)&&on(t)?!1:e in n}const ms="transition",wo="animation",Kt=(n,{slots:e})=>qc(dm,Fm(n),e);Kt.displayName="Transition";const Rm={name:String,type:String,css:{type:Boolean,default:!0},duration:[String,Number,Object],enterFromClass:String,enterActiveClass:String,enterToClass:String,appearFromClass:String,appearActiveClass:String,appearToClass:String,leaveFromClass:String,leaveActiveClass:String,leaveToClass:String},Cv=Kt.props=En({},dm.props,Rm),Vs=(n,e=[])=>{ct(n)?n.forEach(t=>t(...e)):n&&n(...e)},rh=n=>n?ct(n)?n.some(e=>e.length>1):n.length>1:!1;function Fm(n){const e={};for(const X in n)X in Rm||(e[X]=n[X]);if(n.css===!1)return e;const{name:t="v",type:i,duration:s,enterFromClass:r=`${t}-enter-from`,enterActiveClass:o=`${t}-enter-active`,enterToClass:a=`${t}-enter-to`,appearFromClass:l=r,appearActiveClass:u=o,appearToClass:d=a,leaveFromClass:h=`${t}-leave-from`,leaveActiveClass:f=`${t}-leave-active`,leaveToClass:p=`${t}-leave-to`}=n,g=Dv(s),v=g&&g[0],_=g&&g[1],{onBeforeEnter:m,onEnter:E,onEnterCancelled:y,onLeave:x,onLeaveCancelled:M,onBeforeAppear:A=m,onAppear:F=E,onAppearCancelled:I=y}=e,b=(X,z,T)=>{Ms(X,z?d:a),Ms(X,z?u:o),T&&T()},w=(X,z)=>{X._isLeaving=!1,Ms(X,h),Ms(X,p),Ms(X,f),z&&z()},oe=X=>(z,T)=>{const G=X?F:E,re=()=>b(z,X,T);Vs(G,[z,re]),oh(()=>{Ms(z,X?l:r),es(z,X?d:a),rh(G)||ah(z,i,v,re)})};return En(e,{onBeforeEnter(X){Vs(m,[X]),es(X,r),es(X,o)},onBeforeAppear(X){Vs(A,[X]),es(X,l),es(X,u)},onEnter:oe(!1),onAppear:oe(!0),onLeave(X,z){X._isLeaving=!0;const T=()=>w(X,z);es(X,h),Lm(),es(X,f),oh(()=>{!X._isLeaving||(Ms(X,h),es(X,p),rh(x)||ah(X,i,_,T))}),Vs(x,[X,T])},onEnterCancelled(X){b(X,!1),Vs(y,[X])},onAppearCancelled(X){b(X,!0),Vs(I,[X])},onLeaveCancelled(X){w(X),Vs(M,[X])}})}function Dv(n){if(n==null)return null;if(kt(n))return[ou(n.enter),ou(n.leave)];{const e=ou(n);return[e,e]}}function ou(n){return bg(n)}function es(n,e){e.split(/\s+/).forEach(t=>t&&n.classList.add(t)),(n._vtc||(n._vtc=new Set)).add(e)}function Ms(n,e){e.split(/\s+/).forEach(i=>i&&n.classList.remove(i));const{_vtc:t}=n;t&&(t.delete(e),t.size||(n._vtc=void 0))}function oh(n){requestAnimationFrame(()=>{requestAnimationFrame(n)})}let Rv=0;function ah(n,e,t,i){const s=n._endId=++Rv,r=()=>{s===n._endId&&i()};if(t)return setTimeout(r,t);const{type:o,timeout:a,propCount:l}=Pm(n,e);if(!o)return i();const u=o+"end";let d=0;const h=()=>{n.removeEventListener(u,f),r()},f=p=>{p.target===n&&++d>=l&&h()};setTimeout(()=>{d<l&&h()},a+1),n.addEventListener(u,f)}function Pm(n,e){const t=window.getComputedStyle(n),i=g=>(t[g]||"").split(", "),s=i(`${ms}Delay`),r=i(`${ms}Duration`),o=lh(s,r),a=i(`${wo}Delay`),l=i(`${wo}Duration`),u=lh(a,l);let d=null,h=0,f=0;e===ms?o>0&&(d=ms,h=o,f=r.length):e===wo?u>0&&(d=wo,h=u,f=l.length):(h=Math.max(o,u),d=h>0?o>u?ms:wo:null,f=d?d===ms?r.length:l.length:0);const p=d===ms&&/\b(transform|all)(,|$)/.test(i(`${ms}Property`).toString());return{type:d,timeout:h,propCount:f,hasTransform:p}}function lh(n,e){for(;n.length<e.length;)n=n.concat(n);return Math.max(...e.map((t,i)=>uh(t)+uh(n[i])))}function uh(n){return Number(n.slice(0,-1).replace(",","."))*1e3}function Lm(){return document.body.offsetHeight}const Im=new WeakMap,Bm=new WeakMap,Um={name:"TransitionGroup",props:En({},Cv,{tag:String,moveClass:String}),setup(n,{slots:e}){const t=jc(),i=cm();let s,r;return pm(()=>{if(!s.length)return;const o=n.moveClass||`${n.name||"v"}-move`;if(!Uv(s[0].el,t.vnode.el,o))return;s.forEach(Lv),s.forEach(Iv);const a=s.filter(Bv);Lm(),a.forEach(l=>{const u=l.el,d=u.style;es(u,o),d.transform=d.webkitTransform=d.transitionDuration="";const h=u._moveCb=f=>{f&&f.target!==u||(!f||/transform$/.test(f.propertyName))&&(u.removeEventListener("transitionend",h),u._moveCb=null,Ms(u,o))};u.addEventListener("transitionend",h)})}),()=>{const o=At(n),a=Fm(o);let l=o.tag||He;s=r,r=e.default?Vc(e.default()):[];for(let u=0;u<r.length;u++){const d=r[u];d.key!=null&&ra(d,sa(d,a,i,t))}if(s)for(let u=0;u<s.length;u++){const d=s[u];ra(d,sa(d,a,i,t)),Im.set(d,d.el.getBoundingClientRect())}return tt(l,null,r)}}},Fv=n=>delete n.mode;Um.props;const Pv=Um;function Lv(n){const e=n.el;e._moveCb&&e._moveCb(),e._enterCb&&e._enterCb()}function Iv(n){Bm.set(n,n.el.getBoundingClientRect())}function Bv(n){const e=Im.get(n),t=Bm.get(n),i=e.left-t.left,s=e.top-t.top;if(i||s){const r=n.el.style;return r.transform=r.webkitTransform=`translate(${i}px,${s}px)`,r.transitionDuration="0s",n}}function Uv(n,e,t){const i=n.cloneNode();n._vtc&&n._vtc.forEach(o=>{o.split(/\s+/).forEach(a=>a&&i.classList.remove(a))}),t.split(/\s+/).forEach(o=>o&&i.classList.add(o)),i.style.display="none";const s=e.nodeType===1?e:e.parentNode;s.appendChild(i);const{hasTransform:r}=Pm(i);return s.removeChild(i),r}const yl=n=>{const e=n.props["onUpdate:modelValue"]||!1;return ct(e)?t=>sl(e,t):e};function Nv(n){n.target.composing=!0}function ch(n){const e=n.target;e.composing&&(e.composing=!1,e.dispatchEvent(new Event("input")))}const Ls={created(n,{modifiers:{lazy:e,trim:t,number:i}},s){n._assign=yl(s);const r=i||s.props&&s.props.type==="number";Qs(n,e?"change":"input",o=>{if(o.target.composing)return;let a=n.value;t&&(a=a.trim()),r&&(a=Ku(a)),n._assign(a)}),t&&Qs(n,"change",()=>{n.value=n.value.trim()}),e||(Qs(n,"compositionstart",Nv),Qs(n,"compositionend",ch),Qs(n,"change",ch))},mounted(n,{value:e}){n.value=e==null?"":e},beforeUpdate(n,{value:e,modifiers:{lazy:t,trim:i,number:s}},r){if(n._assign=yl(r),n.composing||document.activeElement===n&&n.type!=="range"&&(t||i&&n.value.trim()===e||(s||n.type==="number")&&Ku(n.value)===e))return;const o=e==null?"":e;n.value!==o&&(n.value=o)}},Ov={deep:!0,created(n,e,t){n._assign=yl(t),Qs(n,"change",()=>{const i=n._modelValue,s=kv(n),r=n.checked,o=n._assign;if(ct(i)){const a=Lp(i,s),l=a!==-1;if(r&&!l)o(i.concat(s));else if(!r&&l){const u=[...i];u.splice(a,1),o(u)}}else if(Tl(i)){const a=new Set(i);r?a.add(s):a.delete(s),o(a)}else o(Nm(n,r))})},mounted:dh,beforeUpdate(n,e,t){n._assign=yl(t),dh(n,e,t)}};function dh(n,{value:e,oldValue:t},i){n._modelValue=e,ct(e)?n.checked=Lp(e,i.props.value)>-1:Tl(e)?n.checked=e.has(i.props.value):e!==t&&(n.checked=Sl(e,Nm(n,!0)))}function kv(n){return"_value"in n?n._value:n.value}function Nm(n,e){const t=e?"_trueValue":"_falseValue";return t in n?n[t]:e}const zv=["ctrl","shift","alt","meta"],Hv={stop:n=>n.stopPropagation(),prevent:n=>n.preventDefault(),self:n=>n.target!==n.currentTarget,ctrl:n=>!n.ctrlKey,shift:n=>!n.shiftKey,alt:n=>!n.altKey,meta:n=>!n.metaKey,left:n=>"button"in n&&n.button!==0,middle:n=>"button"in n&&n.button!==1,right:n=>"button"in n&&n.button!==2,exact:(n,e)=>zv.some(t=>n[`${t}Key`]&&!e.includes(t))},nn=(n,e)=>(t,...i)=>{for(let s=0;s<e.length;s++){const r=Hv[e[s]];if(r&&r(t,e))return}return n(t,...i)},$v={esc:"escape",space:" ",up:"arrow-up",left:"arrow-left",right:"arrow-right",down:"arrow-down",delete:"backspace"},Vv=(n,e)=>t=>{if(!("key"in t))return;const i=mr(t.key);if(e.some(s=>s===i||$v[s]===i))return n(t)},Gv=En({patchProp:wv},fv);let hh;function Wv(){return hh||(hh=X_(Gv))}const Xv=(...n)=>{const e=Wv().createApp(...n),{mount:t}=e;return e.mount=i=>{const s=jv(i);if(!s)return;const r=e._component;!_t(r)&&!r.render&&!r.template&&(r.template=s.innerHTML),s.innerHTML="";const o=t(s,!1,s instanceof SVGElement);return s instanceof Element&&(s.removeAttribute("v-cloak"),s.setAttribute("data-v-app","")),o},e};function jv(n){return on(n)?document.querySelector(n):n}var qv=!1;/*!
  * pinia v2.0.36
  * (c) 2023 Eduardo San Martin Morote
  * @license MIT
  */let Om;const zl=n=>Om=n,km=Symbol();function ac(n){return n&&typeof n=="object"&&Object.prototype.toString.call(n)==="[object Object]"&&typeof n.toJSON!="function"}var Wo;(function(n){n.direct="direct",n.patchObject="patch object",n.patchFunction="patch function"})(Wo||(Wo={}));function Kv(){const n=kp(!0),e=n.run(()=>Ce({}));let t=[],i=[];const s=ro({install(r){zl(s),s._a=r,r.provide(km,s),r.config.globalProperties.$pinia=s,i.forEach(o=>t.push(o)),i=[]},use(r){return!this._a&&!qv?i.push(r):t.push(r),this},_p:t,_a:null,_e:n,_s:new Map,state:e});return s}const zm=()=>{};function fh(n,e,t,i=zm){n.push(e);const s=()=>{const r=n.indexOf(e);r>-1&&(n.splice(r,1),i())};return!t&&zp()&&Sg(s),s}function yr(n,...e){n.slice().forEach(t=>{t(...e)})}function lc(n,e){n instanceof Map&&e instanceof Map&&e.forEach((t,i)=>n.set(i,t)),n instanceof Set&&e instanceof Set&&e.forEach(n.add,n);for(const t in e){if(!e.hasOwnProperty(t))continue;const i=e[t],s=n[t];ac(s)&&ac(i)&&n.hasOwnProperty(t)&&!rn(i)&&!Fs(i)?n[t]=lc(s,i):n[t]=i}return n}const Yv=Symbol();function Jv(n){return!ac(n)||!n.hasOwnProperty(Yv)}const{assign:As}=Object;function Zv(n){return!!(rn(n)&&n.effect)}function Qv(n,e,t,i){const{state:s,actions:r,getters:o}=e,a=t.state.value[n];let l;function u(){a||(t.state.value[n]=s?s():{});const d=i_(t.state.value[n]);return As(d,r,Object.keys(o||{}).reduce((h,f)=>(h[f]=ro(Qe(()=>{zl(t);const p=t._s.get(n);return o[f].call(p,p)})),h),{}))}return l=Hm(n,u,e,t,i,!0),l}function Hm(n,e,t={},i,s,r){let o;const a=As({actions:{}},t),l={deep:!0};let u,d,h=ro([]),f=ro([]),p;const g=i.state.value[n];!r&&!g&&(i.state.value[n]={}),Ce({});let v;function _(F){let I;u=d=!1,typeof F=="function"?(F(i.state.value[n]),I={type:Wo.patchFunction,storeId:n,events:p}):(lc(i.state.value[n],F),I={type:Wo.patchObject,payload:F,storeId:n,events:p});const b=v=Symbol();jn().then(()=>{v===b&&(u=!0)}),d=!0,yr(h,I,i.state.value[n])}const m=r?function(){const{state:I}=t,b=I?I():{};this.$patch(w=>{As(w,b)})}:zm;function E(){o.stop(),h=[],f=[],i._s.delete(n)}function y(F,I){return function(){zl(i);const b=Array.from(arguments),w=[],oe=[];function X(G){w.push(G)}function z(G){oe.push(G)}yr(f,{args:b,name:F,store:M,after:X,onError:z});let T;try{T=I.apply(this&&this.$id===n?this:M,b)}catch(G){throw yr(oe,G),G}return T instanceof Promise?T.then(G=>(yr(w,G),G)).catch(G=>(yr(oe,G),Promise.reject(G))):(yr(w,T),T)}}const x={_p:i,$id:n,$onAction:fh.bind(null,f),$patch:_,$reset:m,$subscribe(F,I={}){const b=fh(h,F,I.detached,()=>w()),w=o.run(()=>_n(()=>i.state.value[n],oe=>{(I.flush==="sync"?d:u)&&F({storeId:n,type:Wo.direct,events:p},oe)},As({},l,I)));return b},$dispose:E},M=Bn(x);i._s.set(n,M);const A=i._e.run(()=>(o=kp(),o.run(()=>e())));for(const F in A){const I=A[F];if(rn(I)&&!Zv(I)||Fs(I))r||(g&&Jv(I)&&(rn(I)?I.value=g[F]:lc(I,g[F])),i.state.value[n][F]=I);else if(typeof I=="function"){const b=y(F,I);A[F]=b,a.actions[F]=I}}return As(M,A),As(At(M),A),Object.defineProperty(M,"$state",{get:()=>i.state.value[n],set:F=>{_(I=>{As(I,F)})}}),i._p.forEach(F=>{As(M,o.run(()=>F({store:M,app:i._a,pinia:i,options:a})))}),g&&r&&t.hydrate&&t.hydrate(M.$state,g),u=!0,d=!0,M}function e1(n,e,t){let i,s;const r=typeof e=="function";typeof n=="string"?(i=n,s=r?t:e):(s=n,i=n.id);function o(a,l){const u=jc();return a=a||u&&mi(km,null),a&&zl(a),a=Om,a._s.has(i)||(r?Hm(i,e,s,a):Qv(i,s,a)),a._s.get(i)}return o.$id=i,o}/*!
  * vue-router v4.1.6
  * (c) 2022 Eduardo San Martin Morote
  * @license MIT
  */const jr=typeof window!="undefined";function t1(n){return n.__esModule||n[Symbol.toStringTag]==="Module"}const Pt=Object.assign;function au(n,e){const t={};for(const i in e){const s=e[i];t[i]=Ti(s)?s.map(n):n(s)}return t}const Xo=()=>{},Ti=Array.isArray,n1=/\/$/,i1=n=>n.replace(n1,"");function lu(n,e,t="/"){let i,s={},r="",o="";const a=e.indexOf("#");let l=e.indexOf("?");return a<l&&a>=0&&(l=-1),l>-1&&(i=e.slice(0,l),r=e.slice(l+1,a>-1?a:e.length),s=n(r)),a>-1&&(i=i||e.slice(0,a),o=e.slice(a,e.length)),i=a1(i!=null?i:e,t),{fullPath:i+(r&&"?")+r+o,path:i,query:s,hash:o}}function s1(n,e){const t=e.query?n(e.query):"";return e.path+(t&&"?")+t+(e.hash||"")}function ph(n,e){return!e||!n.toLowerCase().startsWith(e.toLowerCase())?n:n.slice(e.length)||"/"}function r1(n,e,t){const i=e.matched.length-1,s=t.matched.length-1;return i>-1&&i===s&&ao(e.matched[i],t.matched[s])&&$m(e.params,t.params)&&n(e.query)===n(t.query)&&e.hash===t.hash}function ao(n,e){return(n.aliasOf||n)===(e.aliasOf||e)}function $m(n,e){if(Object.keys(n).length!==Object.keys(e).length)return!1;for(const t in n)if(!o1(n[t],e[t]))return!1;return!0}function o1(n,e){return Ti(n)?mh(n,e):Ti(e)?mh(e,n):n===e}function mh(n,e){return Ti(e)?n.length===e.length&&n.every((t,i)=>t===e[i]):n.length===1&&n[0]===e}function a1(n,e){if(n.startsWith("/"))return n;if(!n)return e;const t=e.split("/"),i=n.split("/");let s=t.length-1,r,o;for(r=0;r<i.length;r++)if(o=i[r],o!==".")if(o==="..")s>1&&s--;else break;return t.slice(0,s).join("/")+"/"+i.slice(r-(r===i.length?1:0)).join("/")}var la;(function(n){n.pop="pop",n.push="push"})(la||(la={}));var jo;(function(n){n.back="back",n.forward="forward",n.unknown=""})(jo||(jo={}));function l1(n){if(!n)if(jr){const e=document.querySelector("base");n=e&&e.getAttribute("href")||"/",n=n.replace(/^\w+:\/\/[^\/]+/,"")}else n="/";return n[0]!=="/"&&n[0]!=="#"&&(n="/"+n),i1(n)}const u1=/^[^#]+#/;function c1(n,e){return n.replace(u1,"#")+e}function d1(n,e){const t=document.documentElement.getBoundingClientRect(),i=n.getBoundingClientRect();return{behavior:e.behavior,left:i.left-t.left-(e.left||0),top:i.top-t.top-(e.top||0)}}const Hl=()=>({left:window.pageXOffset,top:window.pageYOffset});function h1(n){let e;if("el"in n){const t=n.el,i=typeof t=="string"&&t.startsWith("#"),s=typeof t=="string"?i?document.getElementById(t.slice(1)):document.querySelector(t):t;if(!s)return;e=d1(s,n)}else e=n;"scrollBehavior"in document.documentElement.style?window.scrollTo(e):window.scrollTo(e.left!=null?e.left:window.pageXOffset,e.top!=null?e.top:window.pageYOffset)}function gh(n,e){return(history.state?history.state.position-e:-1)+n}const uc=new Map;function f1(n,e){uc.set(n,e)}function p1(n){const e=uc.get(n);return uc.delete(n),e}let m1=()=>location.protocol+"//"+location.host;function Vm(n,e){const{pathname:t,search:i,hash:s}=e,r=n.indexOf("#");if(r>-1){let a=s.includes(n.slice(r))?n.slice(r).length:1,l=s.slice(a);return l[0]!=="/"&&(l="/"+l),ph(l,"")}return ph(t,n)+i+s}function g1(n,e,t,i){let s=[],r=[],o=null;const a=({state:f})=>{const p=Vm(n,location),g=t.value,v=e.value;let _=0;if(f){if(t.value=p,e.value=f,o&&o===g){o=null;return}_=v?f.position-v.position:0}else i(p);s.forEach(m=>{m(t.value,g,{delta:_,type:la.pop,direction:_?_>0?jo.forward:jo.back:jo.unknown})})};function l(){o=t.value}function u(f){s.push(f);const p=()=>{const g=s.indexOf(f);g>-1&&s.splice(g,1)};return r.push(p),p}function d(){const{history:f}=window;!f.state||f.replaceState(Pt({},f.state,{scroll:Hl()}),"")}function h(){for(const f of r)f();r=[],window.removeEventListener("popstate",a),window.removeEventListener("beforeunload",d)}return window.addEventListener("popstate",a),window.addEventListener("beforeunload",d),{pauseListeners:l,listen:u,destroy:h}}function _h(n,e,t,i=!1,s=!1){return{back:n,current:e,forward:t,replaced:i,position:window.history.length,scroll:s?Hl():null}}function _1(n){const{history:e,location:t}=window,i={value:Vm(n,t)},s={value:e.state};s.value||r(i.value,{back:null,current:i.value,forward:null,position:e.length-1,replaced:!0,scroll:null},!0);function r(l,u,d){const h=n.indexOf("#"),f=h>-1?(t.host&&document.querySelector("base")?n:n.slice(h))+l:m1()+n+l;try{e[d?"replaceState":"pushState"](u,"",f),s.value=u}catch(p){console.error(p),t[d?"replace":"assign"](f)}}function o(l,u){const d=Pt({},e.state,_h(s.value.back,l,s.value.forward,!0),u,{position:s.value.position});r(l,d,!0),i.value=l}function a(l,u){const d=Pt({},s.value,e.state,{forward:l,scroll:Hl()});r(d.current,d,!0);const h=Pt({},_h(i.value,l,null),{position:d.position+1},u);r(l,h,!1),i.value=l}return{location:i,state:s,push:a,replace:o}}function v1(n){n=l1(n);const e=_1(n),t=g1(n,e.state,e.location,e.replace);function i(r,o=!0){o||t.pauseListeners(),history.go(r)}const s=Pt({location:"",base:n,go:i,createHref:c1.bind(null,n)},e,t);return Object.defineProperty(s,"location",{enumerable:!0,get:()=>e.location.value}),Object.defineProperty(s,"state",{enumerable:!0,get:()=>e.state.value}),s}function y1(n){return typeof n=="string"||n&&typeof n=="object"}function Gm(n){return typeof n=="string"||typeof n=="symbol"}const gs={path:"/",name:void 0,params:{},query:{},hash:"",fullPath:"/",matched:[],meta:{},redirectedFrom:void 0},Wm=Symbol("");var vh;(function(n){n[n.aborted=4]="aborted",n[n.cancelled=8]="cancelled",n[n.duplicated=16]="duplicated"})(vh||(vh={}));function lo(n,e){return Pt(new Error,{type:n,[Wm]:!0},e)}function Xi(n,e){return n instanceof Error&&Wm in n&&(e==null||!!(n.type&e))}const yh="[^/]+?",E1={sensitive:!1,strict:!1,start:!0,end:!0},x1=/[.+*?^${}()[\]/\\]/g;function b1(n,e){const t=Pt({},E1,e),i=[];let s=t.start?"^":"";const r=[];for(const u of n){const d=u.length?[]:[90];t.strict&&!u.length&&(s+="/");for(let h=0;h<u.length;h++){const f=u[h];let p=40+(t.sensitive?.25:0);if(f.type===0)h||(s+="/"),s+=f.value.replace(x1,"\\$&"),p+=40;else if(f.type===1){const{value:g,repeatable:v,optional:_,regexp:m}=f;r.push({name:g,repeatable:v,optional:_});const E=m||yh;if(E!==yh){p+=10;try{new RegExp(`(${E})`)}catch(x){throw new Error(`Invalid custom RegExp for param "${g}" (${E}): `+x.message)}}let y=v?`((?:${E})(?:/(?:${E}))*)`:`(${E})`;h||(y=_&&u.length<2?`(?:/${y})`:"/"+y),_&&(y+="?"),s+=y,p+=20,_&&(p+=-8),v&&(p+=-20),E===".*"&&(p+=-50)}d.push(p)}i.push(d)}if(t.strict&&t.end){const u=i.length-1;i[u][i[u].length-1]+=.7000000000000001}t.strict||(s+="/?"),t.end?s+="$":t.strict&&(s+="(?:/|$)");const o=new RegExp(s,t.sensitive?"":"i");function a(u){const d=u.match(o),h={};if(!d)return null;for(let f=1;f<d.length;f++){const p=d[f]||"",g=r[f-1];h[g.name]=p&&g.repeatable?p.split("/"):p}return h}function l(u){let d="",h=!1;for(const f of n){(!h||!d.endsWith("/"))&&(d+="/"),h=!1;for(const p of f)if(p.type===0)d+=p.value;else if(p.type===1){const{value:g,repeatable:v,optional:_}=p,m=g in u?u[g]:"";if(Ti(m)&&!v)throw new Error(`Provided param "${g}" is an array but it is not repeatable (* or + modifiers)`);const E=Ti(m)?m.join("/"):m;if(!E)if(_)f.length<2&&(d.endsWith("/")?d=d.slice(0,-1):h=!0);else throw new Error(`Missing required param "${g}"`);d+=E}}return d||"/"}return{re:o,score:i,keys:r,parse:a,stringify:l}}function M1(n,e){let t=0;for(;t<n.length&&t<e.length;){const i=e[t]-n[t];if(i)return i;t++}return n.length<e.length?n.length===1&&n[0]===40+40?-1:1:n.length>e.length?e.length===1&&e[0]===40+40?1:-1:0}function A1(n,e){let t=0;const i=n.score,s=e.score;for(;t<i.length&&t<s.length;){const r=M1(i[t],s[t]);if(r)return r;t++}if(Math.abs(s.length-i.length)===1){if(Eh(i))return 1;if(Eh(s))return-1}return s.length-i.length}function Eh(n){const e=n[n.length-1];return n.length>0&&e[e.length-1]<0}const S1={type:0,value:""},w1=/[a-zA-Z0-9_]/;function T1(n){if(!n)return[[]];if(n==="/")return[[S1]];if(!n.startsWith("/"))throw new Error(`Invalid path "${n}"`);function e(p){throw new Error(`ERR (${t})/"${u}": ${p}`)}let t=0,i=t;const s=[];let r;function o(){r&&s.push(r),r=[]}let a=0,l,u="",d="";function h(){!u||(t===0?r.push({type:0,value:u}):t===1||t===2||t===3?(r.length>1&&(l==="*"||l==="+")&&e(`A repeatable param (${u}) must be alone in its segment. eg: '/:ids+.`),r.push({type:1,value:u,regexp:d,repeatable:l==="*"||l==="+",optional:l==="*"||l==="?"})):e("Invalid state to consume buffer"),u="")}function f(){u+=l}for(;a<n.length;){if(l=n[a++],l==="\\"&&t!==2){i=t,t=4;continue}switch(t){case 0:l==="/"?(u&&h(),o()):l===":"?(h(),t=1):f();break;case 4:f(),t=i;break;case 1:l==="("?t=2:w1.test(l)?f():(h(),t=0,l!=="*"&&l!=="?"&&l!=="+"&&a--);break;case 2:l===")"?d[d.length-1]=="\\"?d=d.slice(0,-1)+l:t=3:d+=l;break;case 3:h(),t=0,l!=="*"&&l!=="?"&&l!=="+"&&a--,d="";break;default:e("Unknown state");break}}return t===2&&e(`Unfinished custom RegExp for param "${u}"`),h(),o(),s}function C1(n,e,t){const i=b1(T1(n.path),t),s=Pt(i,{record:n,parent:e,children:[],alias:[]});return e&&!s.record.aliasOf==!e.record.aliasOf&&e.children.push(s),s}function D1(n,e){const t=[],i=new Map;e=Mh({strict:!1,end:!0,sensitive:!1},e);function s(d){return i.get(d)}function r(d,h,f){const p=!f,g=R1(d);g.aliasOf=f&&f.record;const v=Mh(e,d),_=[g];if("alias"in d){const y=typeof d.alias=="string"?[d.alias]:d.alias;for(const x of y)_.push(Pt({},g,{components:f?f.record.components:g.components,path:x,aliasOf:f?f.record:g}))}let m,E;for(const y of _){const{path:x}=y;if(h&&x[0]!=="/"){const M=h.record.path,A=M[M.length-1]==="/"?"":"/";y.path=h.record.path+(x&&A+x)}if(m=C1(y,h,v),f?f.alias.push(m):(E=E||m,E!==m&&E.alias.push(m),p&&d.name&&!bh(m)&&o(d.name)),g.children){const M=g.children;for(let A=0;A<M.length;A++)r(M[A],m,f&&f.children[A])}f=f||m,(m.record.components&&Object.keys(m.record.components).length||m.record.name||m.record.redirect)&&l(m)}return E?()=>{o(E)}:Xo}function o(d){if(Gm(d)){const h=i.get(d);h&&(i.delete(d),t.splice(t.indexOf(h),1),h.children.forEach(o),h.alias.forEach(o))}else{const h=t.indexOf(d);h>-1&&(t.splice(h,1),d.record.name&&i.delete(d.record.name),d.children.forEach(o),d.alias.forEach(o))}}function a(){return t}function l(d){let h=0;for(;h<t.length&&A1(d,t[h])>=0&&(d.record.path!==t[h].record.path||!Xm(d,t[h]));)h++;t.splice(h,0,d),d.record.name&&!bh(d)&&i.set(d.record.name,d)}function u(d,h){let f,p={},g,v;if("name"in d&&d.name){if(f=i.get(d.name),!f)throw lo(1,{location:d});v=f.record.name,p=Pt(xh(h.params,f.keys.filter(E=>!E.optional).map(E=>E.name)),d.params&&xh(d.params,f.keys.map(E=>E.name))),g=f.stringify(p)}else if("path"in d)g=d.path,f=t.find(E=>E.re.test(g)),f&&(p=f.parse(g),v=f.record.name);else{if(f=h.name?i.get(h.name):t.find(E=>E.re.test(h.path)),!f)throw lo(1,{location:d,currentLocation:h});v=f.record.name,p=Pt({},h.params,d.params),g=f.stringify(p)}const _=[];let m=f;for(;m;)_.unshift(m.record),m=m.parent;return{name:v,path:g,params:p,matched:_,meta:P1(_)}}return n.forEach(d=>r(d)),{addRoute:r,resolve:u,removeRoute:o,getRoutes:a,getRecordMatcher:s}}function xh(n,e){const t={};for(const i of e)i in n&&(t[i]=n[i]);return t}function R1(n){return{path:n.path,redirect:n.redirect,name:n.name,meta:n.meta||{},aliasOf:void 0,beforeEnter:n.beforeEnter,props:F1(n),children:n.children||[],instances:{},leaveGuards:new Set,updateGuards:new Set,enterCallbacks:{},components:"components"in n?n.components||null:n.component&&{default:n.component}}}function F1(n){const e={},t=n.props||!1;if("component"in n)e.default=t;else for(const i in n.components)e[i]=typeof t=="boolean"?t:t[i];return e}function bh(n){for(;n;){if(n.record.aliasOf)return!0;n=n.parent}return!1}function P1(n){return n.reduce((e,t)=>Pt(e,t.meta),{})}function Mh(n,e){const t={};for(const i in n)t[i]=i in e?e[i]:n[i];return t}function Xm(n,e){return e.children.some(t=>t===n||Xm(n,t))}const jm=/#/g,L1=/&/g,I1=/\//g,B1=/=/g,U1=/\?/g,qm=/\+/g,N1=/%5B/g,O1=/%5D/g,Km=/%5E/g,k1=/%60/g,Ym=/%7B/g,z1=/%7C/g,Jm=/%7D/g,H1=/%20/g;function Kc(n){return encodeURI(""+n).replace(z1,"|").replace(N1,"[").replace(O1,"]")}function $1(n){return Kc(n).replace(Ym,"{").replace(Jm,"}").replace(Km,"^")}function cc(n){return Kc(n).replace(qm,"%2B").replace(H1,"+").replace(jm,"%23").replace(L1,"%26").replace(k1,"`").replace(Ym,"{").replace(Jm,"}").replace(Km,"^")}function V1(n){return cc(n).replace(B1,"%3D")}function G1(n){return Kc(n).replace(jm,"%23").replace(U1,"%3F")}function W1(n){return n==null?"":G1(n).replace(I1,"%2F")}function El(n){try{return decodeURIComponent(""+n)}catch{}return""+n}function X1(n){const e={};if(n===""||n==="?")return e;const i=(n[0]==="?"?n.slice(1):n).split("&");for(let s=0;s<i.length;++s){const r=i[s].replace(qm," "),o=r.indexOf("="),a=El(o<0?r:r.slice(0,o)),l=o<0?null:El(r.slice(o+1));if(a in e){let u=e[a];Ti(u)||(u=e[a]=[u]),u.push(l)}else e[a]=l}return e}function Ah(n){let e="";for(let t in n){const i=n[t];if(t=V1(t),i==null){i!==void 0&&(e+=(e.length?"&":"")+t);continue}(Ti(i)?i.map(r=>r&&cc(r)):[i&&cc(i)]).forEach(r=>{r!==void 0&&(e+=(e.length?"&":"")+t,r!=null&&(e+="="+r))})}return e}function j1(n){const e={};for(const t in n){const i=n[t];i!==void 0&&(e[t]=Ti(i)?i.map(s=>s==null?null:""+s):i==null?i:""+i)}return e}const q1=Symbol(""),Sh=Symbol(""),$l=Symbol(""),Yc=Symbol(""),dc=Symbol("");function To(){let n=[];function e(i){return n.push(i),()=>{const s=n.indexOf(i);s>-1&&n.splice(s,1)}}function t(){n=[]}return{add:e,list:()=>n,reset:t}}function ws(n,e,t,i,s){const r=i&&(i.enterCallbacks[s]=i.enterCallbacks[s]||[]);return()=>new Promise((o,a)=>{const l=h=>{h===!1?a(lo(4,{from:t,to:e})):h instanceof Error?a(h):y1(h)?a(lo(2,{from:e,to:h})):(r&&i.enterCallbacks[s]===r&&typeof h=="function"&&r.push(h),o())},u=n.call(i&&i.instances[s],e,t,l);let d=Promise.resolve(u);n.length<3&&(d=d.then(l)),d.catch(h=>a(h))})}function uu(n,e,t,i){const s=[];for(const r of n)for(const o in r.components){let a=r.components[o];if(!(e!=="beforeRouteEnter"&&!r.instances[o]))if(K1(a)){const u=(a.__vccOpts||a)[e];u&&s.push(ws(u,t,i,r,o))}else{let l=a();s.push(()=>l.then(u=>{if(!u)return Promise.reject(new Error(`Couldn't resolve component "${o}" at "${r.path}"`));const d=t1(u)?u.default:u;r.components[o]=d;const f=(d.__vccOpts||d)[e];return f&&ws(f,t,i,r,o)()}))}}return s}function K1(n){return typeof n=="object"||"displayName"in n||"props"in n||"__vccOpts"in n}function wh(n){const e=mi($l),t=mi(Yc),i=Qe(()=>e.resolve(K(n.to))),s=Qe(()=>{const{matched:l}=i.value,{length:u}=l,d=l[u-1],h=t.matched;if(!d||!h.length)return-1;const f=h.findIndex(ao.bind(null,d));if(f>-1)return f;const p=Th(l[u-2]);return u>1&&Th(d)===p&&h[h.length-1].path!==p?h.findIndex(ao.bind(null,l[u-2])):f}),r=Qe(()=>s.value>-1&&Q1(t.params,i.value.params)),o=Qe(()=>s.value>-1&&s.value===t.matched.length-1&&$m(t.params,i.value.params));function a(l={}){return Z1(l)?e[K(n.replace)?"replace":"push"](K(n.to)).catch(Xo):Promise.resolve()}return{route:i,href:Qe(()=>i.value.href),isActive:r,isExactActive:o,navigate:a}}const Y1=It({name:"RouterLink",compatConfig:{MODE:3},props:{to:{type:[String,Object],required:!0},replace:Boolean,activeClass:String,exactActiveClass:String,custom:Boolean,ariaCurrentValue:{type:String,default:"page"}},useLink:wh,setup(n,{slots:e}){const t=Bn(wh(n)),{options:i}=mi($l),s=Qe(()=>({[Ch(n.activeClass,i.linkActiveClass,"router-link-active")]:t.isActive,[Ch(n.exactActiveClass,i.linkExactActiveClass,"router-link-exact-active")]:t.isExactActive}));return()=>{const r=e.default&&e.default(t);return n.custom?r:qc("a",{"aria-current":t.isExactActive?n.ariaCurrentValue:null,href:t.href,onClick:t.navigate,class:s.value},r)}}}),J1=Y1;function Z1(n){if(!(n.metaKey||n.altKey||n.ctrlKey||n.shiftKey)&&!n.defaultPrevented&&!(n.button!==void 0&&n.button!==0)){if(n.currentTarget&&n.currentTarget.getAttribute){const e=n.currentTarget.getAttribute("target");if(/\b_blank\b/i.test(e))return}return n.preventDefault&&n.preventDefault(),!0}}function Q1(n,e){for(const t in e){const i=e[t],s=n[t];if(typeof i=="string"){if(i!==s)return!1}else if(!Ti(s)||s.length!==i.length||i.some((r,o)=>r!==s[o]))return!1}return!0}function Th(n){return n?n.aliasOf?n.aliasOf.path:n.path:""}const Ch=(n,e,t)=>n!=null?n:e!=null?e:t,ey=It({name:"RouterView",inheritAttrs:!1,props:{name:{type:String,default:"default"},route:Object},compatConfig:{MODE:3},setup(n,{attrs:e,slots:t}){const i=mi(dc),s=Qe(()=>n.route||i.value),r=mi(Sh,0),o=Qe(()=>{let u=K(r);const{matched:d}=s.value;let h;for(;(h=d[u])&&!h.components;)u++;return u}),a=Qe(()=>s.value.matched[o.value]);rl(Sh,Qe(()=>o.value+1)),rl(q1,a),rl(dc,s);const l=Ce();return _n(()=>[l.value,a.value,n.name],([u,d,h],[f,p,g])=>{d&&(d.instances[h]=u,p&&p!==d&&u&&u===f&&(d.leaveGuards.size||(d.leaveGuards=p.leaveGuards),d.updateGuards.size||(d.updateGuards=p.updateGuards))),u&&d&&(!p||!ao(d,p)||!f)&&(d.enterCallbacks[h]||[]).forEach(v=>v(u))},{flush:"post"}),()=>{const u=s.value,d=n.name,h=a.value,f=h&&h.components[d];if(!f)return Dh(t.default,{Component:f,route:u});const p=h.props[d],g=p?p===!0?u.params:typeof p=="function"?p(u):p:null,_=qc(f,Pt({},g,e,{onVnodeUnmounted:m=>{m.component.isUnmounted&&(h.instances[d]=null)},ref:l}));return Dh(t.default,{Component:_,route:u})||_}}});function Dh(n,e){if(!n)return null;const t=n(e);return t.length===1?t[0]:t}const Zm=ey;function ty(n){const e=D1(n.routes,n),t=n.parseQuery||X1,i=n.stringifyQuery||Ah,s=n.history,r=To(),o=To(),a=To(),l=e_(gs);let u=gs;jr&&n.scrollBehavior&&"scrollRestoration"in history&&(history.scrollRestoration="manual");const d=au.bind(null,Y=>""+Y),h=au.bind(null,W1),f=au.bind(null,El);function p(Y,ce){let O,Fe;return Gm(Y)?(O=e.getRecordMatcher(Y),Fe=ce):Fe=Y,e.addRoute(Fe,O)}function g(Y){const ce=e.getRecordMatcher(Y);ce&&e.removeRoute(ce)}function v(){return e.getRoutes().map(Y=>Y.record)}function _(Y){return!!e.getRecordMatcher(Y)}function m(Y,ce){if(ce=Pt({},ce||l.value),typeof Y=="string"){const P=lu(t,Y,ce.path),k=e.resolve({path:P.path},ce),ue=s.createHref(P.fullPath);return Pt(P,k,{params:f(k.params),hash:El(P.hash),redirectedFrom:void 0,href:ue})}let O;if("path"in Y)O=Pt({},Y,{path:lu(t,Y.path,ce.path).path});else{const P=Pt({},Y.params);for(const k in P)P[k]==null&&delete P[k];O=Pt({},Y,{params:h(Y.params)}),ce.params=h(ce.params)}const Fe=e.resolve(O,ce),Oe=Y.hash||"";Fe.params=d(f(Fe.params));const Pe=s1(i,Pt({},Y,{hash:$1(Oe),path:Fe.path})),Ne=s.createHref(Pe);return Pt({fullPath:Pe,hash:Oe,query:i===Ah?j1(Y.query):Y.query||{}},Fe,{redirectedFrom:void 0,href:Ne})}function E(Y){return typeof Y=="string"?lu(t,Y,l.value.path):Pt({},Y)}function y(Y,ce){if(u!==Y)return lo(8,{from:ce,to:Y})}function x(Y){return F(Y)}function M(Y){return x(Pt(E(Y),{replace:!0}))}function A(Y){const ce=Y.matched[Y.matched.length-1];if(ce&&ce.redirect){const{redirect:O}=ce;let Fe=typeof O=="function"?O(Y):O;return typeof Fe=="string"&&(Fe=Fe.includes("?")||Fe.includes("#")?Fe=E(Fe):{path:Fe},Fe.params={}),Pt({query:Y.query,hash:Y.hash,params:"path"in Fe?{}:Y.params},Fe)}}function F(Y,ce){const O=u=m(Y),Fe=l.value,Oe=Y.state,Pe=Y.force,Ne=Y.replace===!0,P=A(O);if(P)return F(Pt(E(P),{state:typeof P=="object"?Pt({},Oe,P.state):Oe,force:Pe,replace:Ne}),ce||O);const k=O;k.redirectedFrom=ce;let ue;return!Pe&&r1(i,Fe,O)&&(ue=lo(16,{to:k,from:Fe}),$(Fe,Fe,!0,!1)),(ue?Promise.resolve(ue):b(k,Fe)).catch(fe=>Xi(fe)?Xi(fe,2)?fe:J(fe):ae(fe,k,Fe)).then(fe=>{if(fe){if(Xi(fe,2))return F(Pt({replace:Ne},E(fe.to),{state:typeof fe.to=="object"?Pt({},Oe,fe.to.state):Oe,force:Pe}),ce||k)}else fe=oe(k,Fe,!0,Ne,Oe);return w(k,Fe,fe),fe})}function I(Y,ce){const O=y(Y,ce);return O?Promise.reject(O):Promise.resolve()}function b(Y,ce){let O;const[Fe,Oe,Pe]=ny(Y,ce);O=uu(Fe.reverse(),"beforeRouteLeave",Y,ce);for(const P of Fe)P.leaveGuards.forEach(k=>{O.push(ws(k,Y,ce))});const Ne=I.bind(null,Y,ce);return O.push(Ne),Er(O).then(()=>{O=[];for(const P of r.list())O.push(ws(P,Y,ce));return O.push(Ne),Er(O)}).then(()=>{O=uu(Oe,"beforeRouteUpdate",Y,ce);for(const P of Oe)P.updateGuards.forEach(k=>{O.push(ws(k,Y,ce))});return O.push(Ne),Er(O)}).then(()=>{O=[];for(const P of Y.matched)if(P.beforeEnter&&!ce.matched.includes(P))if(Ti(P.beforeEnter))for(const k of P.beforeEnter)O.push(ws(k,Y,ce));else O.push(ws(P.beforeEnter,Y,ce));return O.push(Ne),Er(O)}).then(()=>(Y.matched.forEach(P=>P.enterCallbacks={}),O=uu(Pe,"beforeRouteEnter",Y,ce),O.push(Ne),Er(O))).then(()=>{O=[];for(const P of o.list())O.push(ws(P,Y,ce));return O.push(Ne),Er(O)}).catch(P=>Xi(P,8)?P:Promise.reject(P))}function w(Y,ce,O){for(const Fe of a.list())Fe(Y,ce,O)}function oe(Y,ce,O,Fe,Oe){const Pe=y(Y,ce);if(Pe)return Pe;const Ne=ce===gs,P=jr?history.state:{};O&&(Fe||Ne?s.replace(Y.fullPath,Pt({scroll:Ne&&P&&P.scroll},Oe)):s.push(Y.fullPath,Oe)),l.value=Y,$(Y,ce,O,Ne),J()}let X;function z(){X||(X=s.listen((Y,ce,O)=>{if(!le.listening)return;const Fe=m(Y),Oe=A(Fe);if(Oe){F(Pt(Oe,{replace:!0}),Fe).catch(Xo);return}u=Fe;const Pe=l.value;jr&&f1(gh(Pe.fullPath,O.delta),Hl()),b(Fe,Pe).catch(Ne=>Xi(Ne,12)?Ne:Xi(Ne,2)?(F(Ne.to,Fe).then(P=>{Xi(P,20)&&!O.delta&&O.type===la.pop&&s.go(-1,!1)}).catch(Xo),Promise.reject()):(O.delta&&s.go(-O.delta,!1),ae(Ne,Fe,Pe))).then(Ne=>{Ne=Ne||oe(Fe,Pe,!1),Ne&&(O.delta&&!Xi(Ne,8)?s.go(-O.delta,!1):O.type===la.pop&&Xi(Ne,20)&&s.go(-1,!1)),w(Fe,Pe,Ne)}).catch(Xo)}))}let T=To(),G=To(),re;function ae(Y,ce,O){J(Y);const Fe=G.list();return Fe.length?Fe.forEach(Oe=>Oe(Y,ce,O)):console.error(Y),Promise.reject(Y)}function C(){return re&&l.value!==gs?Promise.resolve():new Promise((Y,ce)=>{T.add([Y,ce])})}function J(Y){return re||(re=!Y,z(),T.list().forEach(([ce,O])=>Y?O(Y):ce()),T.reset()),Y}function $(Y,ce,O,Fe){const{scrollBehavior:Oe}=n;if(!jr||!Oe)return Promise.resolve();const Pe=!O&&p1(gh(Y.fullPath,0))||(Fe||!O)&&history.state&&history.state.scroll||null;return jn().then(()=>Oe(Y,ce,Pe)).then(Ne=>Ne&&h1(Ne)).catch(Ne=>ae(Ne,Y,ce))}const ee=Y=>s.go(Y);let U;const N=new Set,le={currentRoute:l,listening:!0,addRoute:p,removeRoute:g,hasRoute:_,getRoutes:v,resolve:m,options:n,push:x,replace:M,go:ee,back:()=>ee(-1),forward:()=>ee(1),beforeEach:r.add,beforeResolve:o.add,afterEach:a.add,onError:G.add,isReady:C,install(Y){const ce=this;Y.component("RouterLink",J1),Y.component("RouterView",Zm),Y.config.globalProperties.$router=ce,Object.defineProperty(Y.config.globalProperties,"$route",{enumerable:!0,get:()=>K(l)}),jr&&!U&&l.value===gs&&(U=!0,x(s.location).catch(Oe=>{}));const O={};for(const Oe in gs)O[Oe]=Qe(()=>l.value[Oe]);Y.provide($l,ce),Y.provide(Yc,Bn(O)),Y.provide(dc,l);const Fe=Y.unmount;N.add(Y),Y.unmount=function(){N.delete(Y),N.size<1&&(u=gs,X&&X(),X=null,l.value=gs,U=!1,re=!1),Fe()}}};return le}function Er(n){return n.reduce((e,t)=>e.then(()=>t()),Promise.resolve())}function ny(n,e){const t=[],i=[],s=[],r=Math.max(e.matched.length,n.matched.length);for(let o=0;o<r;o++){const a=e.matched[o];a&&(n.matched.find(u=>ao(u,a))?i.push(a):t.push(a));const l=n.matched[o];l&&(e.matched.find(u=>ao(u,l))||s.push(l))}return[t,i,s]}function _a(){return mi($l)}function Jc(){return mi(Yc)}var zt=(n,e)=>{const t=n.__vccOpts||n;for(const[i,s]of e)t[i]=s;return t};const iy=n=>(Qt("data-v-e0dadcf8"),n=n(),en(),n),sy=iy(()=>c("svg",{viewBox:"0 0 20 20"},[c("path",{d:"M10 2.5 11.4 7 16 8.5 11.4 10 10 14.5 8.6 10 4 8.5 8.6 7 10 2.5Z"}),c("path",{d:"m15.5 13 .6 1.8 1.9.7-1.9.6-.6 1.9-.6-1.9-1.9-.6 1.9-.7.6-1.8Z"})],-1)),ry=Tm('<svg viewBox="0 0 20 20" data-v-e0dadcf8><rect x="2.5" y="3" width="6" height="6" rx="1" data-v-e0dadcf8></rect><rect x="11.5" y="3" width="6" height="6" rx="1" data-v-e0dadcf8></rect><rect x="2.5" y="12" width="6" height="5" rx="1" data-v-e0dadcf8></rect><rect x="11.5" y="12" width="6" height="5" rx="1" data-v-e0dadcf8></rect></svg>',1),oy=It({__name:"ModeSwitch",props:{mode:null,dark:{type:Boolean}},setup(n){const e=_a();return(t,i)=>(H(),q("div",{class:$e(["mode-switch",{dark:n.dark}]),"aria-label":"\u4E3B\u6A21\u5F0F\u5207\u6362"},[c("button",{class:$e({active:n.mode==="assistant"}),onClick:i[0]||(i[0]=s=>K(e).push("/assistant"))},[sy,it("\u667A\u80FD\u95EE\u519C")],2),c("button",{class:$e({active:n.mode==="workspace"}),onClick:i[1]||(i[1]=s=>K(e).push("/workspaces/farm-01"))},[ry,it("\u6570\u636E\u5DE5\u4F5C\u53F0")],2)],2))}});var ay=zt(oy,[["__scopeId","data-v-e0dadcf8"]]);const ly=It({__name:"App",setup(n){const e=Jc(),t=Qe(()=>e.path.startsWith("/assistant")?"assistant":"workspace"),i=Qe(()=>e.path.includes("/greenhouses/"));return(s,r)=>(H(),q(He,null,[c("div",{class:$e(["platform-mode-anchor",{"in-topbar":K(i)}])},[tt(ay,{mode:K(t)},null,8,["mode"])],2),tt(K(Zm),null,{default:qt(({Component:o,route:a})=>[tt(Kt,{name:"page",mode:"out-in"},{default:qt(()=>[(H(),gn(F_(o),{key:a.fullPath}))]),_:2},1024)]),_:1})],64))}});var uy=zt(ly,[["__scopeId","data-v-4e876019"]]),cy="/platform/assets/brand-logo.334483ca.png";const Qm=n=>(Qt("data-v-5b78a0d2"),n=n(),en(),n),dy={class:"mark","aria-hidden":"true"},hy=["src"],fy={key:0,class:"copy"},py=Qm(()=>c("strong",null,"\u7530\u8A00\u8015\u667A",-1)),my=Qm(()=>c("small",null,"\u667A\u6167\u519C\u4E1A AI \u5E73\u53F0",-1)),gy=[py,my],_y=It({__name:"BrandLogo",props:{compact:{type:Boolean},inverse:{type:Boolean}},setup(n){return(e,t)=>(H(),q("div",{class:$e(["brand",{compact:n.compact,inverse:n.inverse}])},[c("span",dy,[c("img",{src:K(cy),alt:""},null,8,hy)]),n.compact?at("",!0):(H(),q("span",fy,gy))],2))}});var Zc=zt(_y,[["__scopeId","data-v-5b78a0d2"]]);const Qc="ty_token",ed="ty_user";function e0(n){var e;return(e=localStorage.getItem(n))!=null?e:sessionStorage.getItem(n)}function gr(){return e0(Qc)}function t0(){try{return JSON.parse(e0(ed)||"null")}catch{return null}}function ul(n){(localStorage.getItem(Qc)?localStorage:sessionStorage).setItem(ed,JSON.stringify(n))}function Vl(){for(const n of[localStorage,sessionStorage])n.removeItem(Qc),n.removeItem(ed)}async function td(n,{headers:e={},...t}={}){const i=t.body instanceof FormData,s=await fetch(`/api${n}`,{...t,headers:{...i?{}:{"Content-Type":"application/json"},...e}}),r=await s.json().catch(()=>({}));if(!s.ok)throw s.status===401&&(Vl(),window.location.replace("/#/sign-in")),new Error(r.message||`\u8BF7\u6C42\u5931\u8D25\uFF08${s.status}\uFF09`);return r}function n0(n=gr()){return td("/auth/me",{headers:{Authorization:`Bearer ${n}`}})}function vy(n){const e=new FormData;return e.append("photo",n,"face.jpg"),td("/auth/face-register",{method:"POST",body:e,headers:{Authorization:`Bearer ${gr()}`}})}function yy(){return td("/auth/face-delete",{method:"POST",headers:{Authorization:`Bearer ${gr()}`}})}const Ey={class:"face-capture"},xy={class:"stage"},by=["src"],My={key:2,class:"cam-error"},Ay={class:"actions"},Sy=["disabled"],wy={class:"ghost upload"},Ty=It({__name:"FaceCapture",props:{busy:{type:Boolean},label:null},emits:["capture"],setup(n,{emit:e}){const t=n,i=Ce(null),s=Ce(""),r=Ce("");let o=null;a();async function a(){try{o=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user",width:{ideal:640},height:{ideal:480}},audio:!1}),i.value&&(i.value.srcObject=o,i.value.play().catch(()=>{}))}catch{s.value="\u65E0\u6CD5\u6253\u5F00\u6444\u50CF\u5934\uFF0C\u8BF7\u5141\u8BB8\u6743\u9650\u6216\u6539\u7528\u4E0B\u65B9\u56FE\u7247\u4E0A\u4F20"}}$i(()=>o==null?void 0:o.getTracks().forEach(p=>p.stop()));function l(){var _;const p=i.value;if(!p||!p.videoWidth)return;const g=document.createElement("canvas"),v=512/p.videoWidth;g.width=512,g.height=Math.round(p.videoHeight*v),(_=g.getContext("2d"))==null||_.drawImage(p,0,0,g.width,g.height),r.value=g.toDataURL("image/jpeg",.9)}function u(){r.value="",s.value=""}function d(p){const[,g]=p.split(","),v=atob(g),_=new Uint8Array(v.length);for(let m=0;m<v.length;m++)_[m]=v.charCodeAt(m);return new Blob([_],{type:"image/jpeg"})}function h(){r.value&&e("capture",d(r.value))}function f(p){var v;const g=(v=p.target.files)==null?void 0:v[0];g&&e("capture",g)}return(p,g)=>(H(),q("div",Ey,[c("div",xy,[r.value?(H(),q("img",{key:0,src:r.value,alt:"\u4EBA\u8138\u9884\u89C8",class:"preview"},null,8,by)):(H(),q("video",{key:1,ref_key:"videoRef",ref:i,playsinline:"",muted:"",class:"preview"},null,512)),s.value&&!r.value?(H(),q("p",My,B(s.value),1)):at("",!0)]),c("div",Ay,[r.value?(H(),q(He,{key:0},[c("button",{type:"button",class:"ghost",onClick:u},"\u91CD\u62CD"),c("button",{type:"button",class:"primary",disabled:n.busy,onClick:h},B(n.busy?"\u8BC6\u522B\u4E2D\u2026":t.label||"\u786E\u8BA4"),9,Sy)],64)):(H(),q(He,{key:1},[c("button",{type:"button",class:"primary",onClick:l},"\u62CD\u7167"),c("label",wy,[it(" \u4E0A\u4F20\u56FE\u7247 "),c("input",{type:"file",accept:"image/*",hidden:"",onChange:f},null,32)])],64))])]))}});var Cy=zt(Ty,[["__scopeId","data-v-2ef9df9a"]]);const Dy={class:"progress-head"},Ry={class:"progress-state","aria-hidden":"true"},Fy=["aria-valuemax","aria-valuenow","aria-valuetext"],Py={class:"rail"},Ly={key:1,class:"fill indeterminate"},Iy={class:"sr-only","aria-live":"polite"},By=It({__name:"ProgressBar",props:{value:null,max:{default:100},label:{default:"\u52A0\u8F7D\u8FDB\u5EA6"},pendingLabel:{default:"\u5904\u7406\u4E2D"},completeLabel:{default:"\u5DF2\u5B8C\u6210"},tone:{default:"light"},compact:{type:Boolean,default:!1}},setup(n){const e=n,t=Qe(()=>e.value===null),i=Qe(()=>e.value===null||e.max<=0?0:Math.min(1,Math.max(0,e.value/e.max))),s=Qe(()=>Math.round(i.value*100)),r=Qe(()=>!t.value&&i.value>=1),o=`progress-${Math.random().toString(36).slice(2)}`;return(a,l)=>(H(),q("div",{class:$e(["progress-bar",[n.tone,{compact:n.compact}]])},[c("div",Dy,[c("span",{id:o},B(n.label),1),c("span",Ry,[c("b",{class:$e({visible:K(t)})},B(n.pendingLabel),3),c("b",{class:$e(["percent",{visible:!K(t)}])},B(K(s))+"%",3)])]),c("div",{class:"track",role:"progressbar","aria-labelledby":o,"aria-valuemin":"0","aria-valuemax":n.max,"aria-valuenow":K(t)?void 0:Math.round(K(i)*n.max*100)/100,"aria-valuetext":K(t)?n.pendingLabel:`${K(s)}%`},[c("div",Py,[K(t)?(H(),q("span",Ly)):(H(),q("span",{key:0,class:"fill",style:Gn({transform:`scaleX(${K(i)})`})},null,4))])],8,Fy),c("span",Iy,B(K(r)?n.completeLabel:K(t)?n.pendingLabel:""),1)],2))}});var Ns=zt(By,[["__scopeId","data-v-6c78accc"]]);const nd=n=>(Qt("data-v-05f09572"),n=n(),en(),n),Uy=["onClick"],Ny={class:"panel"},Oy=nd(()=>c("div",null,[c("small",null,"FACE \xB7 \u767E\u5EA6\u4E91\u8BC6\u522B"),c("h2",null,"\u4EBA\u8138\u7BA1\u7406")],-1)),ky={class:"body"},zy=nd(()=>c("i",null,null,-1)),Hy=nd(()=>c("div",{class:"bound-box"},[c("span",null,"\u2713"),c("p",null,"\u4F60\u7684\u4EBA\u8138\u5DF2\u5F55\u5165\u4EBA\u8138\u5E93\uFF0C\u767B\u5F55\u9875\u5207\u5230\u300C\u5237\u8138\u767B\u5F55\u300D\u5373\u53EF\u76F4\u63A5\u8FDB\u5165\u5E73\u53F0\u3002")],-1)),$y=["disabled"],Vy={key:2,class:"error",role:"alert"},Gy=It({__name:"FaceManageModal",props:{open:{type:Boolean}},emits:["close"],setup(n,{emit:e}){const t=n,i=Ce(!1),s=Ce(!1),r=Ce(""),o=Ce(!1);async function a(){const h=await n0();o.value=h.faceBound,ul(h)}_n(()=>t.open,async h=>{if(!!h){r.value="",i.value=!0;try{await a()}catch(f){r.value=f.message}finally{i.value=!1}}});async function l(h){s.value=!0,r.value="";try{const f=await vy(h);o.value=f.faceBound,ul(f)}catch(f){r.value=f.message}finally{s.value=!1}}async function u(){s.value=!0,r.value="";try{const h=await yy();o.value=h.faceBound,ul(h)}catch(h){r.value=h.message}finally{s.value=!1}}function d(){e("close")}return(h,f)=>(H(),gn(Kt,{name:"mask"},{default:qt(()=>[n.open?(H(),q("div",{key:0,class:"mask",onClick:nn(d,["self"])},[c("section",Ny,[c("header",null,[Oy,c("button",{"aria-label":"\u5173\u95ED",onClick:d},"\xD7")]),c("div",ky,[i.value?(H(),gn(Ns,{key:0,value:null,label:"\u8BFB\u53D6\u4EBA\u8138\u7ED1\u5B9A\u72B6\u6001","pending-label":"\u8FDE\u63A5\u670D\u52A1"})):(H(),q(He,{key:1},[c("p",{class:$e(["status",{bound:o.value}])},[zy,it(B(o.value?"\u5DF2\u7ED1\u5B9A\u4EBA\u8138\uFF0C\u53EF\u5728\u5B98\u7F51\u4E00\u952E\u5237\u8138\u767B\u5F55":"\u672A\u7ED1\u5B9A\u4EBA\u8138"),1)],2),o.value?(H(),q(He,{key:1},[Hy,c("button",{class:"danger",disabled:s.value,onClick:u},B(s.value?"\u5904\u7406\u4E2D\u2026":"\u89E3\u7ED1\u4EBA\u8138"),9,$y)],64)):(H(),gn(Cy,{key:0,busy:s.value,label:"\u7ED1\u5B9A\u4EBA\u8138",onCapture:l},null,8,["busy"])),r.value?(H(),q("p",Vy,B(r.value),1)):at("",!0),s.value?(H(),gn(Ns,{key:3,value:null,label:"\u6B63\u5728\u5904\u7406\u4EBA\u8138\u4FE1\u606F","pending-label":"\u8BF7\u7A0D\u5019",compact:""})):at("",!0)],64))])])],8,Uy)):at("",!0)]),_:1}))}});var Wy=zt(Gy,[["__scopeId","data-v-05f09572"]]);const Xy={class:"user-menu"},jy=["aria-label"],qy={key:0,class:"avatar-inner"},Ky={key:1},Yy={class:"info"},Jy=It({__name:"UserMenu",props:{dark:{type:Boolean}},setup(n){const e=Ce(t0()),t=Ce(!1),i=Ce(!1);function s(){t.value=!t.value}function r(){t.value=!1,i.value=!0}function o(){Vl(),t.value=!1,window.location.href="/#/"}function a(){window.location.href="/#/sign-in"}return(l,u)=>{var d;return H(),q("div",Xy,[c("button",{class:$e(["avatar",{dark:n.dark}]),onClick:s,"aria-label":e.value?`\u7528\u6237 ${e.value.name}`:"\u767B\u5F55"},[e.value?(H(),q("span",qy,B(((d=e.value.name)==null?void 0:d.slice(0,1))||"\u7528"),1)):(H(),q("span",Ky,"\u767B\u5F55"))],10,jy),tt(Kt,{name:"menu"},{default:qt(()=>[t.value?(H(),q("div",{key:0,class:"dropdown",onClick:u[0]||(u[0]=nn(h=>t.value=!1,["self"]))},[e.value?(H(),q(He,{key:0},[c("div",Yy,[c("strong",null,B(e.value.name),1),c("small",null,B(e.value.email),1)]),c("button",{class:"item",onClick:r},"\u4EBA\u8138\u7BA1\u7406"),c("button",{class:"item",onClick:o},"\u9000\u51FA\u767B\u5F55")],64)):(H(),q("button",{key:1,class:"item",onClick:a},"\u767B\u5F55 / \u6CE8\u518C"))])):at("",!0)]),_:1}),tt(Wy,{open:i.value,onClose:u[1]||(u[1]=h=>i.value=!1)},null,8,["open"])])}}});var id=zt(Jy,[["__scopeId","data-v-1bb18c4f"]]);const xo=n=>(Qt("data-v-55f4b43e"),n=n(),en(),n),Zy={class:"left"},Qy=xo(()=>c("button",{class:"farm-select"},[it("\u667A\u6167\u519C\u573A01 "),c("svg",{viewBox:"0 0 20 20"},[c("path",{d:"m6 8 4 4 4-4"})])],-1)),eE={class:"right"},tE=["onSubmit"],nE=xo(()=>c("svg",{viewBox:"0 0 24 24"},[c("circle",{cx:"11",cy:"11",r:"6.5"}),c("path",{d:"m16 16 4 4"})],-1)),iE={class:"time"},sE=xo(()=>c("span",null,"\u4ECA\u5929",-1)),rE=xo(()=>c("svg",{viewBox:"0 0 24 24"},[c("rect",{x:"3",y:"5",width:"18",height:"16",rx:"3"}),c("path",{d:"M7 3v4m10-4v4M3 10h18"})],-1)),oE=xo(()=>c("svg",{viewBox:"0 0 24 24"},[c("path",{d:"M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M9.5 21h5"})],-1)),aE={key:0},lE=xo(()=>c("svg",{viewBox:"0 0 24 24"},[c("path",{d:"M8 3H3v5m13-5h5v5M8 21H3v-5m13 5h5v-5"})],-1)),uE=[lE],cE=It({__name:"FarmTopBar",props:{dark:{type:Boolean},notificationCount:null},emits:["search","notify"],setup(n,{emit:e}){_a();const t=Ce(""),i=Ce("--:--:--");let s=0;function r(){i.value=new Date().toLocaleTimeString("zh-CN",{hour12:!1,hour:"2-digit",minute:"2-digit",second:"2-digit"})}function o(){t.value.trim()&&e("search",t.value.trim())}function a(){var l,u;(u=(l=document.documentElement).requestFullscreen)==null||u.call(l)}return ks(()=>{r(),s=window.setInterval(r,1e3)}),$i(()=>window.clearInterval(s)),(l,u)=>(H(),q("header",{class:$e(["topbar",{dark:n.dark}])},[c("div",Zy,[tt(Zc,{inverse:n.dark},null,8,["inverse"]),Qy]),c("div",eE,[c("form",{class:"search",onSubmit:nn(o,["prevent"])},[nE,ss(c("input",{"onUpdate:modelValue":u[0]||(u[0]=d=>t.value=d),"aria-label":"\u5168\u5C40\u641C\u7D22",placeholder:"\u641C\u7D22\u8BBE\u5907\u3001\u5730\u5757\u3001\u6570\u636E\u2026"},null,512),[[Ls,t.value]])],40,tE),c("button",iE,[sE,it(" "+B(i.value)+" ",1),rE]),c("button",{class:"top-icon notice","aria-label":"\u901A\u77E5",onClick:u[1]||(u[1]=d=>l.$emit("notify"))},[oE,n.notificationCount?(H(),q("i",aE,B(n.notificationCount>9?"9+":n.notificationCount),1)):at("",!0)]),c("button",{class:"top-icon","aria-label":"\u5168\u5C4F",onClick:a},uE),tt(id,{dark:n.dark},null,8,["dark"])])],2))}});var dE=zt(cE,[["__scopeId","data-v-55f4b43e"]]);const Xt=Bn([{id:"gh-01",name:"1\u53F7\u756A\u8304\u6E29\u5BA4",type:"greenhouse",status:"normal",metric:"\u5065\u5EB7\u5EA6 96",x:25,y:52,health:96,position3D:{x:-16,y:0,z:3}},{id:"gh-02",name:"2\u53F7\u8349\u8393\u6E29\u5BA4",type:"greenhouse",status:"attention",metric:"\u6E7F\u5EA6 42%",x:32,y:48,health:86,position3D:{x:-8,y:0,z:1}},{id:"gh-03",name:"3\u53F7\u9EC4\u74DC\u6E29\u5BA4",type:"greenhouse",status:"normal",metric:"\u5065\u5EB7\u5EA6 92",x:39,y:44,health:92,position3D:{x:0,y:0,z:-2}},{id:"gh-04",name:"4\u53F7\u80B2\u82D7\u6E29\u5BA4",type:"greenhouse",status:"normal",metric:"\u5065\u5EB7\u5EA6 94",x:47,y:41,health:94,position3D:{x:8,y:0,z:-5}},{id:"gh-06",name:"6\u53F7\u53F6\u83DC\u6E29\u5BA4",type:"greenhouse",status:"normal",metric:"\u5065\u5EB7\u5EA6 90",x:54,y:40,health:90,position3D:{x:16,y:0,z:-8}},{id:"gh-05",name:"5\u53F7\u751F\u6001\u6E29\u5BA4",type:"greenhouse",status:"normal",metric:"\u5065\u5EB7\u5EA6 91",x:58,y:54,health:91,position3D:{x:7,y:0,z:4}},{id:"field-04",name:"4\u53F7\u751F\u83DC\u79CD\u690D\u533A",type:"field",status:"warning",metric:"\u571F\u58E4\u6E7F\u5EA6 32%",x:43,y:62,health:74,position3D:{x:4,y:0,z:12}},{id:"field-05",name:"5\u53F7\u9732\u5929\u79CD\u690D\u533A",type:"field",status:"normal",metric:"\u957F\u52BF\u826F\u597D",x:73,y:60,health:93,position3D:{x:19,y:0,z:8}},{id:"weather-01",name:"\u6C14\u8C61\u7AD901",type:"station",status:"normal",metric:"28.3\xB0C \xB7 2.1m/s",x:13,y:40,position3D:{x:-28,y:0,z:-7}},{id:"water-01",name:"\u84C4\u6C34\u6C6001",type:"water",status:"normal",metric:"\u6C34\u4F4D 82%",x:17,y:70,position3D:{x:-20,y:0,z:18}},{id:"fertilizer-01",name:"\u6C34\u80A5\u4E00\u4F53\u673A01",type:"device",status:"normal",metric:"EC 1.32mS/cm",x:67,y:44,position3D:{x:15,y:0,z:-2}},{id:"pump-02",name:"\u589E\u538B\u6CF5\u7AD902",type:"device",status:"offline",metric:"\u901A\u4FE1\u4E2D\u65AD \xB7 6\u5206\u949F",x:53,y:73,position3D:{x:2,y:0,z:9}},{id:"valve-02",name:"\u704C\u6E89\u9600\u95E8\u7EC402",type:"device",status:"normal",metric:"\u6D41\u91CF 12.6m\xB3/h",x:36,y:79,position3D:{x:-10,y:0,z:20}},{id:"camera-03",name:"\u6444\u50CF\u593403",type:"camera",status:"normal",metric:"AI \u8BC6\u522B\u5728\u7EBF",x:69,y:77,position3D:{x:15,y:0,z:18}},{id:"robot-01",name:"\u519C\u4E1A\u673A\u5668\u4EBA01",type:"robot",status:"normal",metric:"\u5DE1\u68C0\u4E2D \xB7 82%",x:60,y:73,position3D:{x:24,y:0,z:12}}]),Ni=Bn([{id:"zone-gh-01",entityId:"gh-01",polygon:[[238,483],[302,458],[492,522],[503,579],[468,611],[416,620],[238,549]],crop:"\u6A31\u6843\u756A\u8304",area:"1,200 \u33A1",stage:"\u5F00\u82B1\u5750\u679C\u671F",environment:"26.5\xB0C \xB7 62%"},{id:"zone-gh-02",entityId:"gh-02",polygon:[[350,447],[410,429],[624,478],[634,526],[596,553],[557,563],[350,507]],crop:"\u7EA2\u989C\u8349\u8393",area:"980 \u33A1",stage:"\u81A8\u679C\u671F",environment:"25.8\xB0C \xB7 67%"},{id:"zone-gh-03",entityId:"gh-03",polygon:[[471,412],[521,395],[715,438],[725,478],[694,506],[660,516],[470,462]],crop:"\u6C34\u679C\u9EC4\u74DC",area:"1,080 \u33A1",stage:"\u91C7\u6536\u671F",environment:"27.1\xB0C \xB7 59%"},{id:"zone-gh-04",entityId:"gh-04",polygon:[[594,385],[649,369],[826,409],[838,446],[810,472],[780,480],[594,428]],crop:"\u852C\u83DC\u80B2\u82D7",area:"760 \u33A1",stage:"\u5E7C\u82D7\u671F",environment:"25.2\xB0C \xB7 70%"},{id:"zone-gh-06",entityId:"gh-06",polygon:[[698,359],[759,341],[965,388],[981,423],[959,457],[926,470],[697,412]],crop:"\u6C34\u57F9\u53F6\u83DC",area:"1,050 \u33A1",stage:"\u5FEB\u901F\u751F\u957F\u671F",environment:"25.9\xB0C \xB7 66%"},{id:"zone-gh-05",entityId:"gh-05",polygon:[[722,509],[788,483],[991,522],[1009,558],[991,593],[920,620],[721,561]],crop:"\u751F\u6001\u756A\u8304",area:"1,160 \u33A1",stage:"\u8425\u517B\u751F\u957F\u671F",environment:"26.8\xB0C \xB7 61%"},{id:"zone-field-04",entityId:"field-04",polygon:[[468,580],[707,535],[866,614],[816,657],[665,707],[457,651]],crop:"\u5976\u6CB9\u751F\u83DC",area:"2.6 \u4EA9",stage:"\u751F\u957F\u671F",environment:"\u571F\u58E4\u6E7F\u5EA6 32%"},{id:"zone-field-05",entityId:"field-05",polygon:[[1e3,570],[1273,514],[1339,650],[1212,690],[1071,726],[948,662]],crop:"\u9732\u5929\u7518\u84DD",area:"3.1 \u4EA9",stage:"\u83B2\u5EA7\u671F",environment:"\u571F\u58E4\u6E7F\u5EA6 48%"}]),cl=Bn([{key:"overview",label:"\u603B\u89C8",icon:"\u2302",description:"\u5B8C\u6574\u519C\u573A\u4E0E\u5173\u952E\u72B6\u6001",subLayers:[{key:"health",label:"\u519C\u573A\u5065\u5EB7",value:"92"},{key:"weather",label:"\u4ECA\u65E5\u5929\u6C14",value:"28\xB0C"},{key:"online",label:"\u8BBE\u5907\u5728\u7EBF",value:"96%"}]},{key:"monitoring",label:"\u76D1\u63A7",icon:"\u25C9",description:"\u6444\u50CF\u5934\u4E0E AI \u8986\u76D6\u8303\u56F4",badge:3,subLayers:[{key:"all-cameras",label:"\u5168\u90E8\u6444\u50CF\u5934",value:"12"},{key:"ai-events",label:"AI \u4E8B\u4EF6",value:"3"},{key:"coverage",label:"\u8986\u76D6\u8303\u56F4"}]},{key:"environment",label:"\u73AF\u5883",icon:"\u2668",description:"\u7A7A\u95F4\u73AF\u5883\u4E0E\u70ED\u529B\u5206\u5E03",subLayers:[{key:"temperature",label:"\u6E29\u5EA6"},{key:"airHumidity",label:"\u7A7A\u6C14\u6E7F\u5EA6"},{key:"soilMoisture",label:"\u571F\u58E4\u6E7F\u5EA6"},{key:"light",label:"\u5149\u7167"},{key:"co2",label:"CO\u2082"}]},{key:"devices",label:"\u8BBE\u5907",icon:"\u2699",description:"\u8BBE\u5907\u7A7A\u95F4\u4F4D\u7F6E\u548C\u8FD0\u884C\u72B6\u6001",badge:1,subLayers:[{key:"all-devices",label:"\u5168\u90E8\u8BBE\u5907",value:"28"},{key:"sensors",label:"\u4F20\u611F\u5668",value:"16"},{key:"actuators",label:"\u6267\u884C\u8BBE\u5907",value:"12"},{key:"offline",label:"\u79BB\u7EBF",value:"1"}]},{key:"irrigation",label:"\u704C\u6E89",icon:"\u25D2",description:"\u6C34\u6E90\u3001\u7BA1\u7EBF\u3001\u9600\u95E8\u4E0E\u6C34\u6D41",subLayers:[{key:"network",label:"\u704C\u6E89\u7BA1\u7F51"},{key:"flow",label:"\u5B9E\u65F6\u6C34\u6D41",value:"12.6m\xB3/h"},{key:"plans",label:"\u4ECA\u65E5\u8BA1\u5212",value:"4"}]},{key:"crops",label:"\u4F5C\u7269",icon:"\u2301",description:"\u54C1\u79CD\u3001\u751F\u957F\u9636\u6BB5\u548C\u5065\u5EB7\u5EA6",subLayers:[{key:"health",label:"\u5065\u5EB7\u5EA6"},{key:"stage",label:"\u751F\u957F\u9636\u6BB5"},{key:"maturity",label:"\u6210\u719F\u5EA6"},{key:"risk",label:"\u5F02\u5E38\u533A\u57DF",value:"1"}]},{key:"alerts",label:"\u544A\u8B66",icon:"\u25B3",description:"\u53EA\u663E\u793A\u5F02\u5E38\u5BF9\u8C61\u548C\u98CE\u9669\u7B49\u7EA7",badge:3,subLayers:[{key:"all-alerts",label:"\u5168\u90E8",value:"3"},{key:"attention",label:"\u5173\u6CE8",value:"1"},{key:"warning",label:"\u9884\u8B66",value:"2"},{key:"offline",label:"\u79BB\u7EBF",value:"1"}]}]),Os=Bn([{label:"\u7A7A\u6C14\u6E29\u5EA6",value:"28.3\xB0C",delta:"+0.2\xB0C"},{label:"\u7A7A\u6C14\u6E7F\u5EA6",value:"56%",delta:"-1.0%"},{label:"\u571F\u58E4\u6E7F\u5EA6",value:"42%",delta:"-4.8%",tone:"warning"},{label:"\u5149\u7167\u5F3A\u5EA6",value:"680 lx",delta:"+32 lx"},{label:"CO\u2082",value:"580 ppm",delta:"\u6B63\u5E38"}]),An=Bn([{id:"dev-weather",entityId:"weather-01",name:"\u7530\u95F4\u6C14\u8C61\u7AD9 01",category:"sensor",location:"\u897F\u4FA7\u9732\u5929\u533A",online:!0,enabled:!0,value:"28.3\xB0C \xB7 2.1m/s",lastSeen:"\u521A\u521A"},{id:"dev-camera",entityId:"camera-03",name:"AI \u6444\u50CF\u5934 03",category:"camera",location:"\u4E1C\u5357\u5DE1\u68C0\u533A",online:!0,enabled:!0,value:"1080P \xB7 AI \u5728\u7EBF",lastSeen:"3 \u79D2\u524D"},{id:"dev-fertilizer",entityId:"fertilizer-01",name:"\u6C34\u80A5\u4E00\u4F53\u673A 01",category:"actuator",location:"\u6E29\u5BA4\u8BBE\u5907\u533A",online:!0,enabled:!0,value:"EC 1.32mS/cm",lastSeen:"12 \u79D2\u524D"},{id:"dev-pump",entityId:"pump-02",name:"\u589E\u538B\u6CF5\u7AD9 02",category:"actuator",location:"\u5357\u4FA7\u704C\u6E89\u533A",online:!1,enabled:!1,value:"\u901A\u4FE1\u4E2D\u65AD",lastSeen:"6 \u5206\u949F\u524D"},{id:"dev-valve",entityId:"valve-02",name:"\u7535\u78C1\u9600\u95E8\u7EC4 02",category:"actuator",location:"\u5357\u4FA7\u4E3B\u7BA1\u7F51",online:!0,enabled:!1,value:"\u5173\u95ED \xB7 0m\xB3/h",lastSeen:"8 \u79D2\u524D"},{id:"dev-robot",entityId:"robot-01",name:"\u519C\u4E1A\u5DE1\u68C0\u673A\u5668\u4EBA 01",category:"robot",location:"5\u53F7\u9732\u5929\u79CD\u690D\u533A",online:!0,enabled:!0,value:"\u5DE1\u68C0\u4E2D \xB7 \u7535\u91CF82%",lastSeen:"\u521A\u521A"}]),$n=Bn([{id:"water-source",entityId:"water-01",name:"\u84C4\u6C34\u6C60\u603B\u63A7",target:"\u5168\u573A\u4F9B\u6C34",kind:"source",x:20,y:69,enabled:!0,flow:"\u6C34\u4F4D 82%"},{id:"fertigation",entityId:"fertilizer-01",name:"\u6C34\u80A5\u4E00\u4F53\u673A",target:"\u6E29\u5BA4\u4E3B\u7BA1\u7F51",kind:"fertigation",x:61,y:48,enabled:!0,flow:"12.6m\xB3/h"},{id:"valve-south",entityId:"valve-02",name:"\u5357\u533A\u9600\u95E8\u7EC4",target:"4\u53F7\u751F\u83DC\u79CD\u690D\u533A",kind:"valve",x:35,y:78,enabled:!1,flow:"0m\xB3/h"},{id:"zone-field-04",entityId:"field-04",name:"4\u53F7\u533A\u704C\u6E89\u5355\u5143",target:"\u5976\u6CB9\u751F\u83DC \xB7 2.6\u4EA9",kind:"zone",x:43,y:62,enabled:!1,flow:"\u5EFA\u8BAE\u704C\u6E89 18min"},{id:"zone-field-05",entityId:"field-05",name:"5\u53F7\u533A\u704C\u6E89\u5355\u5143",target:"\u9732\u5929\u7518\u84DD \xB7 3.1\u4EA9",kind:"zone",x:73,y:59,enabled:!0,flow:"8.4m\xB3/h"}]),Ln=Bn([{time:"10:23",title:"4\u53F7\u751F\u83DC\u533A\u571F\u58E4\u6E7F\u5EA6\u504F\u4F4E",level:"\u9884\u8B66",status:"\u672A\u5904\u7406"},{time:"09:48",title:"2\u53F7\u6E29\u5BA4\u897F\u4FA7\u53F6\u7247\u8F7B\u5EA6\u840E\u852B",level:"\u5173\u6CE8",status:"\u5904\u7406\u4E2D"},{time:"08:12",title:"\u6C34\u80A5\u4E00\u4F53\u673A EC \u77ED\u65F6\u504F\u9AD8",level:"\u63D0\u9192",status:"\u5DF2\u6062\u590D"}]),yt=Bn({health:92,totalDevices:28,onlineDevices:27,runningDevices:18,openAlerts:3,waterLevel:82,todayWaterUsage:38.2});function hE(n){Xt.splice(0,Xt.length,...n.entities),Ni.splice(0,Ni.length,...n.zones),Os.splice(0,Os.length,...n.environmentMetrics),An.splice(0,An.length,...n.devices),$n.splice(0,$n.length,...n.irrigationUnits),Ln.splice(0,Ln.length,...n.alerts),Object.assign(yt,n.summary);const e=cl.find(s=>s.key==="overview");e&&(e.subLayers.find(s=>s.key==="health").value=String(n.summary.health),e.subLayers.find(s=>s.key==="online").value=`${Math.round(n.summary.onlineDevices/Math.max(1,n.summary.totalDevices)*100)}%`);const t=cl.find(s=>s.key==="devices");t&&(t.badge=n.summary.totalDevices-n.summary.onlineDevices,t.subLayers.find(s=>s.key==="all-devices").value=String(n.summary.totalDevices),t.subLayers.find(s=>s.key==="sensors").value=String(n.devices.filter(s=>s.category==="sensor").length),t.subLayers.find(s=>s.key==="actuators").value=String(n.devices.filter(s=>s.category==="actuator").length),t.subLayers.find(s=>s.key==="offline").value=String(n.summary.totalDevices-n.summary.onlineDevices));const i=cl.find(s=>s.key==="alerts");i&&(i.badge=n.summary.openAlerts,i.subLayers.find(s=>s.key==="all-alerts").value=String(n.alerts.length))}const sd=n=>(Qt("data-v-80b42eea"),n=n(),en(),n),fE={class:"weather glass-dark"},pE={class:"summary"},mE={class:"sun"},gE=sd(()=>c("small",null,"\u865A\u62DF\u6C14\u8C61 \xB7 \u5B9E\u65F6\u66F4\u65B0",-1)),_E={class:"facts"},vE=sd(()=>c("span",null,[it("\u98CE\u901F "),c("b",null,"2.1m/s")],-1)),yE=sd(()=>c("span",null,"\u2192",-1)),EE=It({__name:"WeatherCard",setup(n){const e=r=>Qe(()=>{var o;return((o=Os.find(a=>a.key===r))==null?void 0:o.value)||"--"}),t=e("temperature"),i=e("airHumidity"),s=e("light");return(r,o)=>(H(),q("section",fE,[c("div",pE,[c("span",mE,[(H(),q(He,null,pt(8,a=>c("i",{key:a})),64))]),c("div",null,[c("strong",null,B(K(t)),1),gE])]),c("div",_E,[c("span",null,[it("\u6E7F\u5EA6 "),c("b",null,B(K(i)),1)]),vE,c("span",null,[it("\u5149\u7167 "),c("b",null,B(K(s)),1)])]),c("button",{onClick:o[0]||(o[0]=a=>r.$emit("detail"))},[it("\u67E5\u770B\u66F4\u591A "),yE])]))}});var xE=zt(EE,[["__scopeId","data-v-80b42eea"]]);const si=n=>(Qt("data-v-8d345a1a"),n=n(),en(),n),bE={class:"entity-icon"},ME={key:0,viewBox:"0 0 24 24"},AE=si(()=>c("path",{d:"M4 8h11v9H4zM15 11l5-2v7l-5-2z"},null,-1)),SE=si(()=>c("circle",{cx:"9.5",cy:"12.5",r:"2.2"},null,-1)),wE=[AE,SE],TE={key:1,viewBox:"0 0 24 24"},CE=si(()=>c("path",{d:"M12 3c3 4 5 6.6 5 10a5 5 0 0 1-10 0c0-3.4 2-6 5-10Z"},null,-1)),DE=si(()=>c("path",{d:"M9.5 14.5c.7 1.1 1.5 1.5 2.7 1.5"},null,-1)),RE=[CE,DE],FE={key:2,viewBox:"0 0 24 24"},PE=si(()=>c("rect",{x:"5",y:"7",width:"14",height:"10",rx:"3"},null,-1)),LE=si(()=>c("path",{d:"M12 7V4M8 20v-3M16 20v-3"},null,-1)),IE=si(()=>c("circle",{cx:"9",cy:"12",r:"1"},null,-1)),BE=si(()=>c("circle",{cx:"15",cy:"12",r:"1"},null,-1)),UE=[PE,LE,IE,BE],NE={key:3,viewBox:"0 0 24 24"},OE=si(()=>c("path",{d:"M12 5v15M8 20h8M7 8a7 7 0 0 1 10 0M9.5 10.5a3.5 3.5 0 0 1 5 0"},null,-1)),kE=si(()=>c("circle",{cx:"12",cy:"13",r:"1.2"},null,-1)),zE=[OE,kE],HE={key:4,viewBox:"0 0 24 24"},$E=si(()=>c("path",{d:"M4 18c4-7 9-10 16-11M5 13c3 0 5 1 7 4M12 9c2 0 4 .8 6 3"},null,-1)),VE=[$E],GE={key:5,viewBox:"0 0 24 24"},WE=si(()=>c("path",{d:"M4 18V9l8-5 8 5v9M8 18v-6h8v6M7 8V5h3"},null,-1)),XE=[WE],jE=si(()=>c("i",null,null,-1)),qE=It({__name:"SceneEntityLabel",props:{entity:null,active:{type:Boolean}},setup(n){return(e,t)=>(H(),q("button",{class:$e(["entity",[n.entity.status,{active:n.active}]]),style:Gn({left:n.entity.x+"%",top:n.entity.y+"%"}),onClick:t[0]||(t[0]=nn(i=>e.$emit("select"),["stop"])),onDblclick:t[1]||(t[1]=nn(i=>e.$emit("focus"),["stop"]))},[c("span",bE,[n.entity.type==="camera"?(H(),q("svg",ME,wE)):n.entity.type==="water"?(H(),q("svg",TE,RE)):n.entity.type==="robot"?(H(),q("svg",FE,UE)):n.entity.type==="station"?(H(),q("svg",NE,zE)):n.entity.type==="field"?(H(),q("svg",HE,VE)):(H(),q("svg",GE,XE))]),c("span",null,[c("strong",null,B(n.entity.name),1),c("small",null,B(n.entity.metric),1),c("em",null,[jE,it(B(n.entity.status==="warning"?"\u9884\u8B66":n.entity.status==="attention"?"\u5173\u6CE8":"\u6B63\u5E38"),1)])])],38))}});var KE=zt(qE,[["__scopeId","data-v-8d345a1a"]]);const ri=n=>(Qt("data-v-14c1a2ad"),n=n(),en(),n),YE={key:0,class:"pipes",viewBox:"0 0 100 100",preserveAspectRatio:"none"},JE=ri(()=>c("path",{class:"main",d:"M15 72 C27 70 34 75 43 65 S58 59 67 49 S78 46 84 35"},null,-1)),ZE=ri(()=>c("path",{d:"M43 65 L35 50 M57 59 L53 40 M68 49 L62 31 M70 51 L77 64"},null,-1)),QE=[JE,ZE],ex={key:1,class:"monitoring-hint"},tx=ri(()=>c("i",null,null,-1)),nx=ri(()=>c("span",null,[c("strong",null,"\u56ED\u533A\u76D1\u63A7\u9009\u62E9"),c("small",null,"\u9009\u62E9\u4EFB\u610F\u6E29\u5BA4\u6216\u79CD\u690D\u533A\u67E5\u770B\u5B9E\u65F6\u76D1\u63A7")],-1)),ix=[tx,nx],sx={key:2,class:"irrigation-units"},rx=["onClick"],ox=ri(()=>c("span",null,[c("svg",{viewBox:"0 0 24 24"},[c("path",{d:"M12 3c3.5 4.7 5.5 7.3 5.5 10.5a5.5 5.5 0 0 1-11 0C6.5 10.3 8.5 7.7 12 3Z"}),c("path",{d:"M9 15c.7 1.1 1.6 1.6 3 1.6"})])],-1)),ax={key:3,class:"alerts-layer"},lx={key:4,class:"camera-coverage"},ux=ri(()=>c("i",null,null,-1)),cx=ri(()=>c("span",null,"CAM-03 AI \u8986\u76D6\u8303\u56F4",-1)),dx=[ux,cx],hx={key:5,class:"zones",viewBox:"0 0 1535 1024",preserveAspectRatio:"xMidYMid slice"},fx=["points"],px=["points","onPointerenter","onClick","onDblclick"],mx={class:"preview-head"},gx=ri(()=>c("dt",null,"\u79CD\u690D",-1)),_x=ri(()=>c("dt",null,"\u9762\u79EF",-1)),vx=ri(()=>c("dt",null,"\u9636\u6BB5",-1)),yx=ri(()=>c("dt",null,"\u73AF\u5883",-1)),Ex=ri(()=>c("span",null,"\u5065\u5EB7\u5EA6",-1)),xx=ri(()=>c("em",null,"\u5355\u51FB\u67E5\u770B\u8BE6\u60C5 \u2192",-1)),bx=It({__name:"AerialFarmScene",props:{selectedId:null,activeModule:null,activeSubLayer:null,scale:null,offsetX:null,offsetY:null,layers:null},emits:["select","focus"],setup(n,{emit:e}){const t=n,i=Ce(null),s="/platform/assets/farm-aerial.png",r=Qe(()=>Ni.find(h=>h.entityId===i.value)),o=Qe(()=>Xt.find(h=>h.id===i.value)),a=Qe(()=>Ln.filter(h=>h.entityId&&!["\u5DF2\u5904\u7406","\u5DF2\u6062\u590D"].includes(h.status)).map(h=>Xt.find(f=>f.id===h.entityId)).filter(h=>Boolean(h))),l=Qe(()=>t.activeModule==="monitoring"?Xt.filter(h=>["greenhouse","field"].includes(h.type)):t.activeModule==="environment"?[]:t.activeModule==="devices"?Xt.filter(h=>t.activeSubLayer==="offline"?h.status==="offline"||h.id==="fertilizer-01":t.activeSubLayer==="sensors"?h.type==="station"||h.id==="camera-03":t.activeSubLayer==="actuators"?h.type==="device"||h.type==="robot":["device","robot","station","camera"].includes(h.type)):t.activeModule==="irrigation"?[]:t.activeModule==="crops"?Xt.filter(h=>["field","greenhouse"].includes(h.type)):t.activeModule==="alerts"?Xt.filter(h=>h.status!=="normal"):Xt);function u(h){return h.map(f=>f.join(",")).join(" ")}function d(h){i.value!==h&&(i.value=h)}return(h,f)=>{var p,g,v,_,m;return H(),q("div",{class:"aerial",onClick:f[2]||(f[2]=E=>h.$emit("select",null))},[c("div",{class:"scene-plane",style:Gn({transform:`translate(${n.offsetX}px, ${n.offsetY}px) scale(${n.scale})`})},[c("svg",{class:"scene-image",viewBox:"0 0 1535 1024",preserveAspectRatio:"xMidYMid slice","aria-hidden":"true"},[c("image",{href:s,width:"1535",height:"1024"})]),n.activeModule==="irrigation"||((p=n.layers)==null?void 0:p.irrigation)?(H(),q("svg",YE,QE)):at("",!0),n.activeModule==="monitoring"?(H(),q("div",ex,ix)):at("",!0),n.activeModule==="irrigation"?(H(),q("div",sx,[(H(!0),q(He,null,pt(K($n),E=>(H(),q("button",{key:E.id,class:$e([{running:E.enabled},E.kind]),style:Gn({left:E.x+"%",top:E.y+"%"}),onClick:nn(y=>h.$emit("select",E.entityId),["stop"])},[ox,c("b",null,B(E.name),1),c("small",null,B(E.enabled?"\u8FD0\u884C\u4E2D":"\u5DF2\u5173\u95ED"),1)],14,rx))),128))])):at("",!0),n.activeModule==="alerts"||((g=n.layers)==null?void 0:g.alerts)?(H(),q("div",ax,[(H(!0),q(He,null,pt(K(a),E=>(H(),q("i",{key:E.id,class:$e(["alert-ring",E.type]),style:Gn({left:`${E.x-9}%`,top:`${E.y-9}%`})},null,6))),128))])):at("",!0),(v=n.layers)!=null&&v.cameras?(H(),q("div",lx,dx)):at("",!0),((_=n.layers)==null?void 0:_.zones)!==!1?(H(),q("svg",hx,[(H(!0),q(He,null,pt(K(Ni),E=>(H(),q("g",{key:E.id,class:$e({hovered:i.value===E.entityId,selected:n.selectedId===E.entityId,selectable:n.activeModule==="monitoring",crop:n.activeModule==="crops",alert:n.activeModule==="alerts"&&K(a).some(y=>y.id===E.entityId)})},[c("polygon",{class:"zone-shape",points:u(E.polygon)},null,8,fx),c("polygon",{class:"zone-hit",points:u(E.polygon),onPointerenter:y=>d(E.entityId),onPointerleave:f[0]||(f[0]=y=>d(null)),onClick:nn(y=>h.$emit("select",E.entityId),["stop"]),onDblclick:nn(y=>h.$emit("focus",E.entityId),["stop"])},null,40,px)],2))),128))])):at("",!0),(H(!0),q(He,null,pt(((m=n.layers)==null?void 0:m.devices)===!1?[]:K(l),E=>(H(),gn(KE,{key:E.id,entity:E,active:n.selectedId===E.id,onMouseenter:y=>d(E.id),onMouseleave:f[1]||(f[1]=y=>d(null)),onSelect:y=>h.$emit("select",E.id),onFocus:y=>h.$emit("focus",E.id)},null,8,["entity","active","onMouseenter","onSelect","onFocus"]))),128)),tt(Kt,{name:"preview"},{default:qt(()=>[K(r)&&K(o)?(H(),q("div",{key:0,class:"zone-preview",style:Gn({left:Math.min(82,K(o).x+7)+"%",top:Math.max(20,K(o).y-7)+"%"})},[c("div",mx,[c("span",null,B(K(o).type==="greenhouse"?"\u6E29\u5BA4":"\u5730\u5757"),1),c("i",{class:$e(K(o).status)},null,2)]),c("strong",null,B(K(o).name),1),c("dl",null,[c("div",null,[gx,c("dd",null,B(K(r).crop),1)]),c("div",null,[_x,c("dd",null,B(K(r).area),1)]),c("div",null,[vx,c("dd",null,B(K(r).stage),1)]),c("div",null,[yx,c("dd",null,B(K(r).environment),1)])]),c("footer",null,[Ex,c("b",null,B(K(o).health),1),xx])],4)):at("",!0)]),_:1})],4)])}}});var Mx=zt(bx,[["__scopeId","data-v-14c1a2ad"]]);/**
 * @license
 * Copyright 2010-2023 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const rd="152",xr={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},br={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},Ax=0,Rh=1,Sx=2,i0=1,od=2,ts=3,Oi=0,Yn=1,Sn=2,Is=0,Qr=1,hc=2,Fh=3,Ph=4,wx=5,qr=100,Tx=101,Cx=102,Lh=103,Ih=104,Dx=200,Rx=201,Fx=202,Px=203,s0=204,r0=205,Lx=206,Ix=207,Bx=208,Ux=209,Nx=210,Ox=0,kx=1,zx=2,fc=3,Hx=4,$x=5,Vx=6,Gx=7,o0=0,Wx=1,Xx=2,rs=0,jx=1,qx=2,Kx=3,ad=4,Yx=5,a0=300,uo=301,co=302,pc=303,mc=304,Gl=306,ur=1e3,hi=1001,xl=1002,pn=1003,gc=1004,dl=1005,qn=1006,l0=1007,cr=1008,dr=1009,Jx=1010,Zx=1011,u0=1012,Qx=1013,nr=1014,Ds=1015,ua=1016,e2=1017,t2=1018,eo=1020,n2=1021,fi=1023,i2=1024,s2=1025,rr=1026,ho=1027,r2=1028,o2=1029,a2=1030,l2=1031,u2=1033,cu=33776,du=33777,hu=33778,fu=33779,Bh=35840,Uh=35841,Nh=35842,Oh=35843,c2=36196,kh=37492,zh=37496,Hh=37808,$h=37809,Vh=37810,Gh=37811,Wh=37812,Xh=37813,jh=37814,qh=37815,Kh=37816,Yh=37817,Jh=37818,Zh=37819,Qh=37820,ef=37821,pu=36492,d2=36283,tf=36284,nf=36285,sf=36286,ca=2300,fo=2301,mu=2302,rf=2400,of=2401,af=2402,h2=2500,f2=0,c0=1,_c=2,d0=3e3,or=3001,p2=3200,m2=3201,h0=0,g2=1,ar="",dt="srgb",ki="srgb-linear",f0="display-p3",gu=7680,_2=519,bl=35044,lf="300 es",vc=1035;class zs{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const i=this._listeners;return i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const s=this._listeners[e];if(s!==void 0){const r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const i=this._listeners[e.type];if(i!==void 0){e.target=this;const s=i.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}}const Dn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let uf=1234567;const qo=Math.PI/180,po=180/Math.PI;function Si(){const n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Dn[n&255]+Dn[n>>8&255]+Dn[n>>16&255]+Dn[n>>24&255]+"-"+Dn[e&255]+Dn[e>>8&255]+"-"+Dn[e>>16&15|64]+Dn[e>>24&255]+"-"+Dn[t&63|128]+Dn[t>>8&255]+"-"+Dn[t>>16&255]+Dn[t>>24&255]+Dn[i&255]+Dn[i>>8&255]+Dn[i>>16&255]+Dn[i>>24&255]).toLowerCase()}function ln(n,e,t){return Math.max(e,Math.min(t,n))}function ld(n,e){return(n%e+e)%e}function v2(n,e,t,i,s){return i+(n-e)*(s-i)/(t-e)}function y2(n,e,t){return n!==e?(t-n)/(e-n):0}function Ko(n,e,t){return(1-t)*n+t*e}function E2(n,e,t,i){return Ko(n,e,1-Math.exp(-t*i))}function x2(n,e=1){return e-Math.abs(ld(n,e*2)-e)}function b2(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*(3-2*n))}function M2(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*n*(n*(n*6-15)+10))}function A2(n,e){return n+Math.floor(Math.random()*(e-n+1))}function S2(n,e){return n+Math.random()*(e-n)}function w2(n){return n*(.5-Math.random())}function T2(n){n!==void 0&&(uf=n);let e=uf+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function C2(n){return n*qo}function D2(n){return n*po}function yc(n){return(n&n-1)===0&&n!==0}function p0(n){return Math.pow(2,Math.ceil(Math.log(n)/Math.LN2))}function m0(n){return Math.pow(2,Math.floor(Math.log(n)/Math.LN2))}function R2(n,e,t,i,s){const r=Math.cos,o=Math.sin,a=r(t/2),l=o(t/2),u=r((e+i)/2),d=o((e+i)/2),h=r((e-i)/2),f=o((e-i)/2),p=r((i-e)/2),g=o((i-e)/2);switch(s){case"XYX":n.set(a*d,l*h,l*f,a*u);break;case"YZY":n.set(l*f,a*d,l*h,a*u);break;case"ZXZ":n.set(l*h,l*f,a*d,a*u);break;case"XZX":n.set(a*d,l*g,l*p,a*u);break;case"YXY":n.set(l*p,a*d,l*g,a*u);break;case"ZYZ":n.set(l*g,l*p,a*d,a*u);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function is(n,e){switch(e.constructor){case Float32Array:return n;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function Nt(n,e){switch(e.constructor){case Float32Array:return n;case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}const Ho={DEG2RAD:qo,RAD2DEG:po,generateUUID:Si,clamp:ln,euclideanModulo:ld,mapLinear:v2,inverseLerp:y2,lerp:Ko,damp:E2,pingpong:x2,smoothstep:b2,smootherstep:M2,randInt:A2,randFloat:S2,randFloatSpread:w2,seededRandom:T2,degToRad:C2,radToDeg:D2,isPowerOfTwo:yc,ceilPowerOfTwo:p0,floorPowerOfTwo:m0,setQuaternionFromProperEuler:R2,normalize:Nt,denormalize:is};class Ue{constructor(e=0,t=0){Ue.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,i=this.y,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6],this.y=s[1]*t+s[4]*i+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=this.x<0?Math.ceil(this.x):Math.floor(this.x),this.y=this.y<0?Math.ceil(this.y):Math.floor(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(ln(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const i=Math.cos(t),s=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*i-o*s+e.x,this.y=r*s+o*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Mt{constructor(){Mt.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1]}set(e,t,i,s,r,o,a,l,u){const d=this.elements;return d[0]=e,d[1]=s,d[2]=a,d[3]=t,d[4]=r,d[5]=l,d[6]=i,d[7]=o,d[8]=u,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,s=t.elements,r=this.elements,o=i[0],a=i[3],l=i[6],u=i[1],d=i[4],h=i[7],f=i[2],p=i[5],g=i[8],v=s[0],_=s[3],m=s[6],E=s[1],y=s[4],x=s[7],M=s[2],A=s[5],F=s[8];return r[0]=o*v+a*E+l*M,r[3]=o*_+a*y+l*A,r[6]=o*m+a*x+l*F,r[1]=u*v+d*E+h*M,r[4]=u*_+d*y+h*A,r[7]=u*m+d*x+h*F,r[2]=f*v+p*E+g*M,r[5]=f*_+p*y+g*A,r[8]=f*m+p*x+g*F,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],u=e[7],d=e[8];return t*o*d-t*a*u-i*r*d+i*a*l+s*r*u-s*o*l}invert(){const e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],u=e[7],d=e[8],h=d*o-a*u,f=a*l-d*r,p=u*r-o*l,g=t*h+i*f+s*p;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const v=1/g;return e[0]=h*v,e[1]=(s*u-d*i)*v,e[2]=(a*i-s*o)*v,e[3]=f*v,e[4]=(d*t-s*l)*v,e[5]=(s*r-a*t)*v,e[6]=p*v,e[7]=(i*l-u*t)*v,e[8]=(o*t-i*r)*v,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,s,r,o,a){const l=Math.cos(r),u=Math.sin(r);return this.set(i*l,i*u,-i*(l*o+u*a)+o+e,-s*u,s*l,-s*(-u*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(_u.makeScale(e,t)),this}rotate(e){return this.premultiply(_u.makeRotation(-e)),this}translate(e,t){return this.premultiply(_u.makeTranslation(e,t)),this}makeTranslation(e,t){return this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,i=e.elements;for(let s=0;s<9;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const _u=new Mt;function g0(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function da(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}const cf={};function Yo(n){n in cf||(cf[n]=!0,console.warn(n))}function to(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function vu(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}const F2=new Mt().fromArray([.8224621,.0331941,.0170827,.177538,.9668058,.0723974,-1e-7,1e-7,.9105199]),P2=new Mt().fromArray([1.2249401,-.0420569,-.0196376,-.2249404,1.0420571,-.0786361,1e-7,0,1.0982735]);function L2(n){return n.convertSRGBToLinear().applyMatrix3(P2)}function I2(n){return n.applyMatrix3(F2).convertLinearToSRGB()}const B2={[ki]:n=>n,[dt]:n=>n.convertSRGBToLinear(),[f0]:L2},U2={[ki]:n=>n,[dt]:n=>n.convertLinearToSRGB(),[f0]:I2},_i={enabled:!0,get legacyMode(){return console.warn("THREE.ColorManagement: .legacyMode=false renamed to .enabled=true in r150."),!this.enabled},set legacyMode(n){console.warn("THREE.ColorManagement: .legacyMode=false renamed to .enabled=true in r150."),this.enabled=!n},get workingColorSpace(){return ki},set workingColorSpace(n){console.warn("THREE.ColorManagement: .workingColorSpace is readonly.")},convert:function(n,e,t){if(this.enabled===!1||e===t||!e||!t)return n;const i=B2[e],s=U2[t];if(i===void 0||s===void 0)throw new Error(`Unsupported color space conversion, "${e}" to "${t}".`);return s(i(n))},fromWorkingColorSpace:function(n,e){return this.convert(n,this.workingColorSpace,e)},toWorkingColorSpace:function(n,e){return this.convert(n,e,this.workingColorSpace)}};let Mr;class _0{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement=="undefined")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{Mr===void 0&&(Mr=da("canvas")),Mr.width=e.width,Mr.height=e.height;const i=Mr.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),t=Mr}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement!="undefined"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement!="undefined"&&e instanceof HTMLCanvasElement||typeof ImageBitmap!="undefined"&&e instanceof ImageBitmap){const t=da("canvas");t.width=e.width,t.height=e.height;const i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const s=i.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=to(r[o]/255)*255;return i.putImageData(s,0,0),t}else if(e.data){const t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(to(t[i]/255)*255):t[i]=to(t[i]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}class v0{constructor(e=null){this.isSource=!0,this.uuid=Si(),this.data=e,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(yu(s[o].image)):r.push(yu(s[o]))}else r=yu(s);i.url=r}return t||(e.images[this.uuid]=i),i}}function yu(n){return typeof HTMLImageElement!="undefined"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement!="undefined"&&n instanceof HTMLCanvasElement||typeof ImageBitmap!="undefined"&&n instanceof ImageBitmap?_0.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let N2=0;class vn extends zs{constructor(e=vn.DEFAULT_IMAGE,t=vn.DEFAULT_MAPPING,i=hi,s=hi,r=qn,o=cr,a=fi,l=dr,u=vn.DEFAULT_ANISOTROPY,d=ar){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:N2++}),this.uuid=Si(),this.name="",this.source=new v0(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=u,this.format=a,this.internalFormat=null,this.type=l,this.offset=new Ue(0,0),this.repeat=new Ue(1,1),this.center=new Ue(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Mt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,typeof d=="string"?this.colorSpace=d:(Yo("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=d===or?dt:ar),this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.needsPMREMUpdate=!1}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.5,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==a0)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case ur:e.x=e.x-Math.floor(e.x);break;case hi:e.x=e.x<0?0:1;break;case xl:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case ur:e.y=e.y-Math.floor(e.y);break;case hi:e.y=e.y<0?0:1;break;case xl:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}get encoding(){return Yo("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace===dt?or:d0}set encoding(e){Yo("THREE.Texture: Property .encoding has been replaced by .colorSpace."),this.colorSpace=e===or?dt:ar}}vn.DEFAULT_IMAGE=null;vn.DEFAULT_MAPPING=a0;vn.DEFAULT_ANISOTROPY=1;class Ot{constructor(e=0,t=0,i=0,s=1){Ot.prototype.isVector4=!0,this.x=e,this.y=t,this.z=i,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,s){return this.x=e,this.y=t,this.z=i,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,i=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*i+o[8]*s+o[12]*r,this.y=o[1]*t+o[5]*i+o[9]*s+o[13]*r,this.z=o[2]*t+o[6]*i+o[10]*s+o[14]*r,this.w=o[3]*t+o[7]*i+o[11]*s+o[15]*r,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,s,r;const l=e.elements,u=l[0],d=l[4],h=l[8],f=l[1],p=l[5],g=l[9],v=l[2],_=l[6],m=l[10];if(Math.abs(d-f)<.01&&Math.abs(h-v)<.01&&Math.abs(g-_)<.01){if(Math.abs(d+f)<.1&&Math.abs(h+v)<.1&&Math.abs(g+_)<.1&&Math.abs(u+p+m-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const y=(u+1)/2,x=(p+1)/2,M=(m+1)/2,A=(d+f)/4,F=(h+v)/4,I=(g+_)/4;return y>x&&y>M?y<.01?(i=0,s=.707106781,r=.707106781):(i=Math.sqrt(y),s=A/i,r=F/i):x>M?x<.01?(i=.707106781,s=0,r=.707106781):(s=Math.sqrt(x),i=A/s,r=I/s):M<.01?(i=.707106781,s=.707106781,r=0):(r=Math.sqrt(M),i=F/r,s=I/r),this.set(i,s,r,t),this}let E=Math.sqrt((_-g)*(_-g)+(h-v)*(h-v)+(f-d)*(f-d));return Math.abs(E)<.001&&(E=1),this.x=(_-g)/E,this.y=(h-v)/E,this.z=(f-d)/E,this.w=Math.acos((u+p+m-1)/2),this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=this.x<0?Math.ceil(this.x):Math.floor(this.x),this.y=this.y<0?Math.ceil(this.y):Math.floor(this.y),this.z=this.z<0?Math.ceil(this.z):Math.floor(this.z),this.w=this.w<0?Math.ceil(this.w):Math.floor(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class hr extends zs{constructor(e=1,t=1,i={}){super(),this.isWebGLRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new Ot(0,0,e,t),this.scissorTest=!1,this.viewport=new Ot(0,0,e,t);const s={width:e,height:t,depth:1};i.encoding!==void 0&&(Yo("THREE.WebGLRenderTarget: option.encoding has been replaced by option.colorSpace."),i.colorSpace=i.encoding===or?dt:ar),this.texture=new vn(s,i.mapping,i.wrapS,i.wrapT,i.magFilter,i.minFilter,i.format,i.type,i.anisotropy,i.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.flipY=!1,this.texture.generateMipmaps=i.generateMipmaps!==void 0?i.generateMipmaps:!1,this.texture.internalFormat=i.internalFormat!==void 0?i.internalFormat:null,this.texture.minFilter=i.minFilter!==void 0?i.minFilter:qn,this.depthBuffer=i.depthBuffer!==void 0?i.depthBuffer:!0,this.stencilBuffer=i.stencilBuffer!==void 0?i.stencilBuffer:!1,this.depthTexture=i.depthTexture!==void 0?i.depthTexture:null,this.samples=i.samples!==void 0?i.samples:0}setSize(e,t,i=1){(this.width!==e||this.height!==t||this.depth!==i)&&(this.width=e,this.height=t,this.depth=i,this.texture.image.width=e,this.texture.image.height=t,this.texture.image.depth=i,this.dispose()),this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.texture=e.texture.clone(),this.texture.isRenderTargetTexture=!0;const t=Object.assign({},e.texture.image);return this.texture.source=new v0(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class y0 extends vn{constructor(e=null,t=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=pn,this.minFilter=pn,this.wrapR=hi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class O2 extends vn{constructor(e=null,t=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=pn,this.minFilter=pn,this.wrapR=hi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class zi{constructor(e=0,t=0,i=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=s}static slerpFlat(e,t,i,s,r,o,a){let l=i[s+0],u=i[s+1],d=i[s+2],h=i[s+3];const f=r[o+0],p=r[o+1],g=r[o+2],v=r[o+3];if(a===0){e[t+0]=l,e[t+1]=u,e[t+2]=d,e[t+3]=h;return}if(a===1){e[t+0]=f,e[t+1]=p,e[t+2]=g,e[t+3]=v;return}if(h!==v||l!==f||u!==p||d!==g){let _=1-a;const m=l*f+u*p+d*g+h*v,E=m>=0?1:-1,y=1-m*m;if(y>Number.EPSILON){const M=Math.sqrt(y),A=Math.atan2(M,m*E);_=Math.sin(_*A)/M,a=Math.sin(a*A)/M}const x=a*E;if(l=l*_+f*x,u=u*_+p*x,d=d*_+g*x,h=h*_+v*x,_===1-a){const M=1/Math.sqrt(l*l+u*u+d*d+h*h);l*=M,u*=M,d*=M,h*=M}}e[t]=l,e[t+1]=u,e[t+2]=d,e[t+3]=h}static multiplyQuaternionsFlat(e,t,i,s,r,o){const a=i[s],l=i[s+1],u=i[s+2],d=i[s+3],h=r[o],f=r[o+1],p=r[o+2],g=r[o+3];return e[t]=a*g+d*h+l*p-u*f,e[t+1]=l*g+d*f+u*h-a*p,e[t+2]=u*g+d*p+a*f-l*h,e[t+3]=d*g-a*h-l*f-u*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,s){return this._x=e,this._y=t,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t){const i=e._x,s=e._y,r=e._z,o=e._order,a=Math.cos,l=Math.sin,u=a(i/2),d=a(s/2),h=a(r/2),f=l(i/2),p=l(s/2),g=l(r/2);switch(o){case"XYZ":this._x=f*d*h+u*p*g,this._y=u*p*h-f*d*g,this._z=u*d*g+f*p*h,this._w=u*d*h-f*p*g;break;case"YXZ":this._x=f*d*h+u*p*g,this._y=u*p*h-f*d*g,this._z=u*d*g-f*p*h,this._w=u*d*h+f*p*g;break;case"ZXY":this._x=f*d*h-u*p*g,this._y=u*p*h+f*d*g,this._z=u*d*g+f*p*h,this._w=u*d*h-f*p*g;break;case"ZYX":this._x=f*d*h-u*p*g,this._y=u*p*h+f*d*g,this._z=u*d*g-f*p*h,this._w=u*d*h+f*p*g;break;case"YZX":this._x=f*d*h+u*p*g,this._y=u*p*h+f*d*g,this._z=u*d*g-f*p*h,this._w=u*d*h-f*p*g;break;case"XZY":this._x=f*d*h-u*p*g,this._y=u*p*h-f*d*g,this._z=u*d*g+f*p*h,this._w=u*d*h+f*p*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t!==!1&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const i=t/2,s=Math.sin(i);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,i=t[0],s=t[4],r=t[8],o=t[1],a=t[5],l=t[9],u=t[2],d=t[6],h=t[10],f=i+a+h;if(f>0){const p=.5/Math.sqrt(f+1);this._w=.25/p,this._x=(d-l)*p,this._y=(r-u)*p,this._z=(o-s)*p}else if(i>a&&i>h){const p=2*Math.sqrt(1+i-a-h);this._w=(d-l)/p,this._x=.25*p,this._y=(s+o)/p,this._z=(r+u)/p}else if(a>h){const p=2*Math.sqrt(1+a-i-h);this._w=(r-u)/p,this._x=(s+o)/p,this._y=.25*p,this._z=(l+d)/p}else{const p=2*Math.sqrt(1+h-i-a);this._w=(o-s)/p,this._x=(r+u)/p,this._y=(l+d)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<Number.EPSILON?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(ln(this.dot(e),-1,1)))}rotateTowards(e,t){const i=this.angleTo(e);if(i===0)return this;const s=Math.min(1,t/i);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const i=e._x,s=e._y,r=e._z,o=e._w,a=t._x,l=t._y,u=t._z,d=t._w;return this._x=i*d+o*a+s*u-r*l,this._y=s*d+o*l+r*a-i*u,this._z=r*d+o*u+i*l-s*a,this._w=o*d-i*a-s*l-r*u,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const i=this._x,s=this._y,r=this._z,o=this._w;let a=o*e._w+i*e._x+s*e._y+r*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=i,this._y=s,this._z=r,this;const l=1-a*a;if(l<=Number.EPSILON){const p=1-t;return this._w=p*o+t*this._w,this._x=p*i+t*this._x,this._y=p*s+t*this._y,this._z=p*r+t*this._z,this.normalize(),this._onChangeCallback(),this}const u=Math.sqrt(l),d=Math.atan2(u,a),h=Math.sin((1-t)*d)/u,f=Math.sin(t*d)/u;return this._w=o*h+this._w*f,this._x=i*h+this._x*f,this._y=s*h+this._y*f,this._z=r*h+this._z*f,this._onChangeCallback(),this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){const e=Math.random(),t=Math.sqrt(1-e),i=Math.sqrt(e),s=2*Math.PI*Math.random(),r=2*Math.PI*Math.random();return this.set(t*Math.cos(s),i*Math.sin(r),i*Math.cos(r),t*Math.sin(s))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class L{constructor(e=0,t=0,i=0){L.prototype.isVector3=!0,this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(df.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(df.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6]*s,this.y=r[1]*t+r[4]*i+r[7]*s,this.z=r[2]*t+r[5]*i+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,i=this.y,s=this.z,r=e.elements,o=1/(r[3]*t+r[7]*i+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*i+r[8]*s+r[12])*o,this.y=(r[1]*t+r[5]*i+r[9]*s+r[13])*o,this.z=(r[2]*t+r[6]*i+r[10]*s+r[14])*o,this}applyQuaternion(e){const t=this.x,i=this.y,s=this.z,r=e.x,o=e.y,a=e.z,l=e.w,u=l*t+o*s-a*i,d=l*i+a*t-r*s,h=l*s+r*i-o*t,f=-r*t-o*i-a*s;return this.x=u*l+f*-r+d*-a-h*-o,this.y=d*l+f*-o+h*-r-u*-a,this.z=h*l+f*-a+u*-o-d*-r,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*i+r[8]*s,this.y=r[1]*t+r[5]*i+r[9]*s,this.z=r[2]*t+r[6]*i+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=this.x<0?Math.ceil(this.x):Math.floor(this.x),this.y=this.y<0?Math.ceil(this.y):Math.floor(this.y),this.z=this.z<0?Math.ceil(this.z):Math.floor(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const i=e.x,s=e.y,r=e.z,o=t.x,a=t.y,l=t.z;return this.x=s*l-r*a,this.y=r*o-i*l,this.z=i*a-s*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return Eu.copy(this).projectOnVector(e),this.sub(Eu)}reflect(e){return this.sub(Eu.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(ln(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y,s=this.z-e.z;return t*t+i*i+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){const s=Math.sin(t)*e;return this.x=s*Math.sin(i),this.y=Math.cos(t)*e,this.z=s*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=(Math.random()-.5)*2,t=Math.random()*Math.PI*2,i=Math.sqrt(1-e**2);return this.x=i*Math.cos(t),this.y=i*Math.sin(t),this.z=e,this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Eu=new L,df=new zi;class mn{constructor(e=new L(1/0,1/0,1/0),t=new L(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(qi.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(qi.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const i=qi.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){if(e.updateWorldMatrix(!1,!1),e.boundingBox!==void 0)e.boundingBox===null&&e.computeBoundingBox(),Ar.copy(e.boundingBox),Ar.applyMatrix4(e.matrixWorld),this.union(Ar);else{const s=e.geometry;if(s!==void 0)if(t&&s.attributes!==void 0&&s.attributes.position!==void 0){const r=s.attributes.position;for(let o=0,a=r.count;o<a;o++)qi.fromBufferAttribute(r,o).applyMatrix4(e.matrixWorld),this.expandByPoint(qi)}else s.boundingBox===null&&s.computeBoundingBox(),Ar.copy(s.boundingBox),Ar.applyMatrix4(e.matrixWorld),this.union(Ar)}const i=e.children;for(let s=0,r=i.length;s<r;s++)this.expandByObject(i[s],t);return this}containsPoint(e){return!(e.x<this.min.x||e.x>this.max.x||e.y<this.min.y||e.y>this.max.y||e.z<this.min.z||e.z>this.max.z)}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return!(e.max.x<this.min.x||e.min.x>this.max.x||e.max.y<this.min.y||e.min.y>this.max.y||e.max.z<this.min.z||e.min.z>this.max.z)}intersectsSphere(e){return this.clampPoint(e.center,qi),qi.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Co),Ta.subVectors(this.max,Co),Sr.subVectors(e.a,Co),wr.subVectors(e.b,Co),Tr.subVectors(e.c,Co),_s.subVectors(wr,Sr),vs.subVectors(Tr,wr),Gs.subVectors(Sr,Tr);let t=[0,-_s.z,_s.y,0,-vs.z,vs.y,0,-Gs.z,Gs.y,_s.z,0,-_s.x,vs.z,0,-vs.x,Gs.z,0,-Gs.x,-_s.y,_s.x,0,-vs.y,vs.x,0,-Gs.y,Gs.x,0];return!xu(t,Sr,wr,Tr,Ta)||(t=[1,0,0,0,1,0,0,0,1],!xu(t,Sr,wr,Tr,Ta))?!1:(Ca.crossVectors(_s,vs),t=[Ca.x,Ca.y,Ca.z],xu(t,Sr,wr,Tr,Ta))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,qi).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(qi).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(ji[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),ji[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),ji[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),ji[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),ji[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),ji[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),ji[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),ji[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(ji),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const ji=[new L,new L,new L,new L,new L,new L,new L,new L],qi=new L,Ar=new mn,Sr=new L,wr=new L,Tr=new L,_s=new L,vs=new L,Gs=new L,Co=new L,Ta=new L,Ca=new L,Ws=new L;function xu(n,e,t,i,s){for(let r=0,o=n.length-3;r<=o;r+=3){Ws.fromArray(n,r);const a=s.x*Math.abs(Ws.x)+s.y*Math.abs(Ws.y)+s.z*Math.abs(Ws.z),l=e.dot(Ws),u=t.dot(Ws),d=i.dot(Ws);if(Math.max(-Math.max(l,u,d),Math.min(l,u,d))>a)return!1}return!0}const k2=new mn,Do=new L,bu=new L;class ls{constructor(e=new L,t=-1){this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const i=this.center;t!==void 0?i.copy(t):k2.setFromPoints(e).getCenter(i);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,i.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Do.subVectors(e,this.center);const t=Do.lengthSq();if(t>this.radius*this.radius){const i=Math.sqrt(t),s=(i-this.radius)*.5;this.center.addScaledVector(Do,s/i),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(bu.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Do.copy(e.center).add(bu)),this.expandByPoint(Do.copy(e.center).sub(bu))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const Ki=new L,Mu=new L,Da=new L,ys=new L,Au=new L,Ra=new L,Su=new L;class Wl{constructor(e=new L,t=new L(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Ki)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=Ki.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Ki.copy(this.origin).addScaledVector(this.direction,t),Ki.distanceToSquared(e))}distanceSqToSegment(e,t,i,s){Mu.copy(e).add(t).multiplyScalar(.5),Da.copy(t).sub(e).normalize(),ys.copy(this.origin).sub(Mu);const r=e.distanceTo(t)*.5,o=-this.direction.dot(Da),a=ys.dot(this.direction),l=-ys.dot(Da),u=ys.lengthSq(),d=Math.abs(1-o*o);let h,f,p,g;if(d>0)if(h=o*l-a,f=o*a-l,g=r*d,h>=0)if(f>=-g)if(f<=g){const v=1/d;h*=v,f*=v,p=h*(h+o*f+2*a)+f*(o*h+f+2*l)+u}else f=r,h=Math.max(0,-(o*f+a)),p=-h*h+f*(f+2*l)+u;else f=-r,h=Math.max(0,-(o*f+a)),p=-h*h+f*(f+2*l)+u;else f<=-g?(h=Math.max(0,-(-o*r+a)),f=h>0?-r:Math.min(Math.max(-r,-l),r),p=-h*h+f*(f+2*l)+u):f<=g?(h=0,f=Math.min(Math.max(-r,-l),r),p=f*(f+2*l)+u):(h=Math.max(0,-(o*r+a)),f=h>0?r:Math.min(Math.max(-r,-l),r),p=-h*h+f*(f+2*l)+u);else f=o>0?-r:r,h=Math.max(0,-(o*f+a)),p=-h*h+f*(f+2*l)+u;return i&&i.copy(this.origin).addScaledVector(this.direction,h),s&&s.copy(Mu).addScaledVector(Da,f),p}intersectSphere(e,t){Ki.subVectors(e.center,this.origin);const i=Ki.dot(this.direction),s=Ki.dot(Ki)-i*i,r=e.radius*e.radius;if(s>r)return null;const o=Math.sqrt(r-s),a=i-o,l=i+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){const i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,s,r,o,a,l;const u=1/this.direction.x,d=1/this.direction.y,h=1/this.direction.z,f=this.origin;return u>=0?(i=(e.min.x-f.x)*u,s=(e.max.x-f.x)*u):(i=(e.max.x-f.x)*u,s=(e.min.x-f.x)*u),d>=0?(r=(e.min.y-f.y)*d,o=(e.max.y-f.y)*d):(r=(e.max.y-f.y)*d,o=(e.min.y-f.y)*d),i>o||r>s||((r>i||isNaN(i))&&(i=r),(o<s||isNaN(s))&&(s=o),h>=0?(a=(e.min.z-f.z)*h,l=(e.max.z-f.z)*h):(a=(e.max.z-f.z)*h,l=(e.min.z-f.z)*h),i>l||a>s)||((a>i||i!==i)&&(i=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(i>=0?i:s,t)}intersectsBox(e){return this.intersectBox(e,Ki)!==null}intersectTriangle(e,t,i,s,r){Au.subVectors(t,e),Ra.subVectors(i,e),Su.crossVectors(Au,Ra);let o=this.direction.dot(Su),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;ys.subVectors(this.origin,e);const l=a*this.direction.dot(Ra.crossVectors(ys,Ra));if(l<0)return null;const u=a*this.direction.dot(Au.cross(ys));if(u<0||l+u>o)return null;const d=-a*ys.dot(Su);return d<0?null:this.at(d/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class xt{constructor(){xt.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]}set(e,t,i,s,r,o,a,l,u,d,h,f,p,g,v,_){const m=this.elements;return m[0]=e,m[4]=t,m[8]=i,m[12]=s,m[1]=r,m[5]=o,m[9]=a,m[13]=l,m[2]=u,m[6]=d,m[10]=h,m[14]=f,m[3]=p,m[7]=g,m[11]=v,m[15]=_,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new xt().fromArray(this.elements)}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){const t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,i=e.elements,s=1/Cr.setFromMatrixColumn(e,0).length(),r=1/Cr.setFromMatrixColumn(e,1).length(),o=1/Cr.setFromMatrixColumn(e,2).length();return t[0]=i[0]*s,t[1]=i[1]*s,t[2]=i[2]*s,t[3]=0,t[4]=i[4]*r,t[5]=i[5]*r,t[6]=i[6]*r,t[7]=0,t[8]=i[8]*o,t[9]=i[9]*o,t[10]=i[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,i=e.x,s=e.y,r=e.z,o=Math.cos(i),a=Math.sin(i),l=Math.cos(s),u=Math.sin(s),d=Math.cos(r),h=Math.sin(r);if(e.order==="XYZ"){const f=o*d,p=o*h,g=a*d,v=a*h;t[0]=l*d,t[4]=-l*h,t[8]=u,t[1]=p+g*u,t[5]=f-v*u,t[9]=-a*l,t[2]=v-f*u,t[6]=g+p*u,t[10]=o*l}else if(e.order==="YXZ"){const f=l*d,p=l*h,g=u*d,v=u*h;t[0]=f+v*a,t[4]=g*a-p,t[8]=o*u,t[1]=o*h,t[5]=o*d,t[9]=-a,t[2]=p*a-g,t[6]=v+f*a,t[10]=o*l}else if(e.order==="ZXY"){const f=l*d,p=l*h,g=u*d,v=u*h;t[0]=f-v*a,t[4]=-o*h,t[8]=g+p*a,t[1]=p+g*a,t[5]=o*d,t[9]=v-f*a,t[2]=-o*u,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){const f=o*d,p=o*h,g=a*d,v=a*h;t[0]=l*d,t[4]=g*u-p,t[8]=f*u+v,t[1]=l*h,t[5]=v*u+f,t[9]=p*u-g,t[2]=-u,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){const f=o*l,p=o*u,g=a*l,v=a*u;t[0]=l*d,t[4]=v-f*h,t[8]=g*h+p,t[1]=h,t[5]=o*d,t[9]=-a*d,t[2]=-u*d,t[6]=p*h+g,t[10]=f-v*h}else if(e.order==="XZY"){const f=o*l,p=o*u,g=a*l,v=a*u;t[0]=l*d,t[4]=-h,t[8]=u*d,t[1]=f*h+v,t[5]=o*d,t[9]=p*h-g,t[2]=g*h-p,t[6]=a*d,t[10]=v*h+f}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(z2,e,H2)}lookAt(e,t,i){const s=this.elements;return ei.subVectors(e,t),ei.lengthSq()===0&&(ei.z=1),ei.normalize(),Es.crossVectors(i,ei),Es.lengthSq()===0&&(Math.abs(i.z)===1?ei.x+=1e-4:ei.z+=1e-4,ei.normalize(),Es.crossVectors(i,ei)),Es.normalize(),Fa.crossVectors(ei,Es),s[0]=Es.x,s[4]=Fa.x,s[8]=ei.x,s[1]=Es.y,s[5]=Fa.y,s[9]=ei.y,s[2]=Es.z,s[6]=Fa.z,s[10]=ei.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,s=t.elements,r=this.elements,o=i[0],a=i[4],l=i[8],u=i[12],d=i[1],h=i[5],f=i[9],p=i[13],g=i[2],v=i[6],_=i[10],m=i[14],E=i[3],y=i[7],x=i[11],M=i[15],A=s[0],F=s[4],I=s[8],b=s[12],w=s[1],oe=s[5],X=s[9],z=s[13],T=s[2],G=s[6],re=s[10],ae=s[14],C=s[3],J=s[7],$=s[11],ee=s[15];return r[0]=o*A+a*w+l*T+u*C,r[4]=o*F+a*oe+l*G+u*J,r[8]=o*I+a*X+l*re+u*$,r[12]=o*b+a*z+l*ae+u*ee,r[1]=d*A+h*w+f*T+p*C,r[5]=d*F+h*oe+f*G+p*J,r[9]=d*I+h*X+f*re+p*$,r[13]=d*b+h*z+f*ae+p*ee,r[2]=g*A+v*w+_*T+m*C,r[6]=g*F+v*oe+_*G+m*J,r[10]=g*I+v*X+_*re+m*$,r[14]=g*b+v*z+_*ae+m*ee,r[3]=E*A+y*w+x*T+M*C,r[7]=E*F+y*oe+x*G+M*J,r[11]=E*I+y*X+x*re+M*$,r[15]=E*b+y*z+x*ae+M*ee,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[4],s=e[8],r=e[12],o=e[1],a=e[5],l=e[9],u=e[13],d=e[2],h=e[6],f=e[10],p=e[14],g=e[3],v=e[7],_=e[11],m=e[15];return g*(+r*l*h-s*u*h-r*a*f+i*u*f+s*a*p-i*l*p)+v*(+t*l*p-t*u*f+r*o*f-s*o*p+s*u*d-r*l*d)+_*(+t*u*h-t*a*p-r*o*h+i*o*p+r*a*d-i*u*d)+m*(-s*a*d-t*l*h+t*a*f+s*o*h-i*o*f+i*l*d)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=i),this}invert(){const e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],u=e[7],d=e[8],h=e[9],f=e[10],p=e[11],g=e[12],v=e[13],_=e[14],m=e[15],E=h*_*u-v*f*u+v*l*p-a*_*p-h*l*m+a*f*m,y=g*f*u-d*_*u-g*l*p+o*_*p+d*l*m-o*f*m,x=d*v*u-g*h*u+g*a*p-o*v*p-d*a*m+o*h*m,M=g*h*l-d*v*l-g*a*f+o*v*f+d*a*_-o*h*_,A=t*E+i*y+s*x+r*M;if(A===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const F=1/A;return e[0]=E*F,e[1]=(v*f*r-h*_*r-v*s*p+i*_*p+h*s*m-i*f*m)*F,e[2]=(a*_*r-v*l*r+v*s*u-i*_*u-a*s*m+i*l*m)*F,e[3]=(h*l*r-a*f*r-h*s*u+i*f*u+a*s*p-i*l*p)*F,e[4]=y*F,e[5]=(d*_*r-g*f*r+g*s*p-t*_*p-d*s*m+t*f*m)*F,e[6]=(g*l*r-o*_*r-g*s*u+t*_*u+o*s*m-t*l*m)*F,e[7]=(o*f*r-d*l*r+d*s*u-t*f*u-o*s*p+t*l*p)*F,e[8]=x*F,e[9]=(g*h*r-d*v*r-g*i*p+t*v*p+d*i*m-t*h*m)*F,e[10]=(o*v*r-g*a*r+g*i*u-t*v*u-o*i*m+t*a*m)*F,e[11]=(d*a*r-o*h*r-d*i*u+t*h*u+o*i*p-t*a*p)*F,e[12]=M*F,e[13]=(d*v*s-g*h*s+g*i*f-t*v*f-d*i*_+t*h*_)*F,e[14]=(g*a*s-o*v*s-g*i*l+t*v*l+o*i*_-t*a*_)*F,e[15]=(o*h*s-d*a*s+d*i*l-t*h*l-o*i*f+t*a*f)*F,this}scale(e){const t=this.elements,i=e.x,s=e.y,r=e.z;return t[0]*=i,t[4]*=s,t[8]*=r,t[1]*=i,t[5]*=s,t[9]*=r,t[2]*=i,t[6]*=s,t[10]*=r,t[3]*=i,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,s))}makeTranslation(e,t,i){return this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const i=Math.cos(t),s=Math.sin(t),r=1-i,o=e.x,a=e.y,l=e.z,u=r*o,d=r*a;return this.set(u*o+i,u*a-s*l,u*l+s*a,0,u*a+s*l,d*a+i,d*l-s*o,0,u*l-s*a,d*l+s*o,r*l*l+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,s,r,o){return this.set(1,i,r,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,i){const s=this.elements,r=t._x,o=t._y,a=t._z,l=t._w,u=r+r,d=o+o,h=a+a,f=r*u,p=r*d,g=r*h,v=o*d,_=o*h,m=a*h,E=l*u,y=l*d,x=l*h,M=i.x,A=i.y,F=i.z;return s[0]=(1-(v+m))*M,s[1]=(p+x)*M,s[2]=(g-y)*M,s[3]=0,s[4]=(p-x)*A,s[5]=(1-(f+m))*A,s[6]=(_+E)*A,s[7]=0,s[8]=(g+y)*F,s[9]=(_-E)*F,s[10]=(1-(f+v))*F,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,i){const s=this.elements;let r=Cr.set(s[0],s[1],s[2]).length();const o=Cr.set(s[4],s[5],s[6]).length(),a=Cr.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),e.x=s[12],e.y=s[13],e.z=s[14],vi.copy(this);const u=1/r,d=1/o,h=1/a;return vi.elements[0]*=u,vi.elements[1]*=u,vi.elements[2]*=u,vi.elements[4]*=d,vi.elements[5]*=d,vi.elements[6]*=d,vi.elements[8]*=h,vi.elements[9]*=h,vi.elements[10]*=h,t.setFromRotationMatrix(vi),i.x=r,i.y=o,i.z=a,this}makePerspective(e,t,i,s,r,o){const a=this.elements,l=2*r/(t-e),u=2*r/(i-s),d=(t+e)/(t-e),h=(i+s)/(i-s),f=-(o+r)/(o-r),p=-2*o*r/(o-r);return a[0]=l,a[4]=0,a[8]=d,a[12]=0,a[1]=0,a[5]=u,a[9]=h,a[13]=0,a[2]=0,a[6]=0,a[10]=f,a[14]=p,a[3]=0,a[7]=0,a[11]=-1,a[15]=0,this}makeOrthographic(e,t,i,s,r,o){const a=this.elements,l=1/(t-e),u=1/(i-s),d=1/(o-r),h=(t+e)*l,f=(i+s)*u,p=(o+r)*d;return a[0]=2*l,a[4]=0,a[8]=0,a[12]=-h,a[1]=0,a[5]=2*u,a[9]=0,a[13]=-f,a[2]=0,a[6]=0,a[10]=-2*d,a[14]=-p,a[3]=0,a[7]=0,a[11]=0,a[15]=1,this}equals(e){const t=this.elements,i=e.elements;for(let s=0;s<16;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}}const Cr=new L,vi=new xt,z2=new L(0,0,0),H2=new L(1,1,1),Es=new L,Fa=new L,ei=new L,hf=new xt,ff=new zi;class va{constructor(e=0,t=0,i=0,s=va.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,s=this._order){return this._x=e,this._y=t,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){const s=e.elements,r=s[0],o=s[4],a=s[8],l=s[1],u=s[5],d=s[9],h=s[2],f=s[6],p=s[10];switch(t){case"XYZ":this._y=Math.asin(ln(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-d,p),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(f,u),this._z=0);break;case"YXZ":this._x=Math.asin(-ln(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(a,p),this._z=Math.atan2(l,u)):(this._y=Math.atan2(-h,r),this._z=0);break;case"ZXY":this._x=Math.asin(ln(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-h,p),this._z=Math.atan2(-o,u)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-ln(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(f,p),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,u));break;case"YZX":this._z=Math.asin(ln(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-d,u),this._y=Math.atan2(-h,r)):(this._x=0,this._y=Math.atan2(a,p));break;case"XZY":this._z=Math.asin(-ln(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(f,u),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-d,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return hf.makeRotationFromQuaternion(e),this.setFromRotationMatrix(hf,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return ff.setFromEuler(this),this.setFromQuaternion(ff,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}va.DEFAULT_ORDER="XYZ";class ud{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let $2=0;const pf=new L,Dr=new zi,Yi=new xt,Pa=new L,Ro=new L,V2=new L,G2=new zi,mf=new L(1,0,0),gf=new L(0,1,0),_f=new L(0,0,1),W2={type:"added"},vf={type:"removed"};class Vt extends zs{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:$2++}),this.uuid=Si(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Vt.DEFAULT_UP.clone();const e=new L,t=new va,i=new zi,s=new L(1,1,1);function r(){i.setFromEuler(t,!1)}function o(){t.setFromQuaternion(i,void 0,!1)}t._onChange(r),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new xt},normalMatrix:{value:new Mt}}),this.matrix=new xt,this.matrixWorld=new xt,this.matrixAutoUpdate=Vt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.matrixWorldAutoUpdate=Vt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.layers=new ud,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Dr.setFromAxisAngle(e,t),this.quaternion.multiply(Dr),this}rotateOnWorldAxis(e,t){return Dr.setFromAxisAngle(e,t),this.quaternion.premultiply(Dr),this}rotateX(e){return this.rotateOnAxis(mf,e)}rotateY(e){return this.rotateOnAxis(gf,e)}rotateZ(e){return this.rotateOnAxis(_f,e)}translateOnAxis(e,t){return pf.copy(e).applyQuaternion(this.quaternion),this.position.add(pf.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(mf,e)}translateY(e){return this.translateOnAxis(gf,e)}translateZ(e){return this.translateOnAxis(_f,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Yi.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?Pa.copy(e):Pa.set(e,t,i);const s=this.parent;this.updateWorldMatrix(!0,!1),Ro.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Yi.lookAt(Ro,Pa,this.up):Yi.lookAt(Pa,Ro,this.up),this.quaternion.setFromRotationMatrix(Yi),s&&(Yi.extractRotation(s.matrixWorld),Dr.setFromRotationMatrix(Yi),this.quaternion.premultiply(Dr.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.parent!==null&&e.parent.remove(e),e.parent=this,this.children.push(e),e.dispatchEvent(W2)):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(vf)),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){for(let e=0;e<this.children.length;e++){const t=this.children[e];t.parent=null,t.dispatchEvent(vf)}return this.children.length=0,this}attach(e){return this.updateWorldMatrix(!0,!1),Yi.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Yi.multiply(e.parent.matrixWorld)),e.applyMatrix4(Yi),this.add(e),e.updateWorldMatrix(!1,!0),this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,s=this.children.length;i<s;i++){const o=this.children[i].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t){let i=[];this[e]===t&&i.push(this);for(let s=0,r=this.children.length;s<r;s++){const o=this.children[s].getObjectsByProperty(e,t);o.length>0&&(i=i.concat(o))}return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ro,e,V2),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ro,G2,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let i=0,s=t.length;i<s;i++){const r=t[i];(r.matrixWorldAutoUpdate===!0||e===!0)&&r.updateMatrixWorld(e)}}updateWorldMatrix(e,t){const i=this.parent;if(e===!0&&i!==null&&i.matrixWorldAutoUpdate===!0&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix),t===!0){const s=this.children;for(let r=0,o=s.length;r<o;r++){const a=s[r];a.matrixWorldAutoUpdate===!0&&a.updateWorldMatrix(!1,!0)}}}toJSON(e){const t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.5,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON()));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let u=0,d=l.length;u<d;u++){const h=l[u];r(e.shapes,h)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,u=this.material.length;l<u;l++)a.push(r(e.materials,this.material[l]));s.material=a}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];s.animations.push(r(e.animations,l))}}if(t){const a=o(e.geometries),l=o(e.materials),u=o(e.textures),d=o(e.images),h=o(e.shapes),f=o(e.skeletons),p=o(e.animations),g=o(e.nodes);a.length>0&&(i.geometries=a),l.length>0&&(i.materials=l),u.length>0&&(i.textures=u),d.length>0&&(i.images=d),h.length>0&&(i.shapes=h),f.length>0&&(i.skeletons=f),p.length>0&&(i.animations=p),g.length>0&&(i.nodes=g)}return i.object=s,i;function o(a){const l=[];for(const u in a){const d=a[u];delete d.metadata,l.push(d)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations,this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){const s=e.children[i];this.add(s.clone())}return this}}Vt.DEFAULT_UP=new L(0,1,0);Vt.DEFAULT_MATRIX_AUTO_UPDATE=!0;Vt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const yi=new L,Ji=new L,wu=new L,Zi=new L,Rr=new L,Fr=new L,yf=new L,Tu=new L,Cu=new L,Du=new L;let La=!1;class di{constructor(e=new L,t=new L,i=new L){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,s){s.subVectors(i,t),yi.subVectors(e,t),s.cross(yi);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,i,s,r){yi.subVectors(s,t),Ji.subVectors(i,t),wu.subVectors(e,t);const o=yi.dot(yi),a=yi.dot(Ji),l=yi.dot(wu),u=Ji.dot(Ji),d=Ji.dot(wu),h=o*u-a*a;if(h===0)return r.set(-2,-1,-1);const f=1/h,p=(u*l-a*d)*f,g=(o*d-a*l)*f;return r.set(1-p-g,g,p)}static containsPoint(e,t,i,s){return this.getBarycoord(e,t,i,s,Zi),Zi.x>=0&&Zi.y>=0&&Zi.x+Zi.y<=1}static getUV(e,t,i,s,r,o,a,l){return La===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),La=!0),this.getInterpolation(e,t,i,s,r,o,a,l)}static getInterpolation(e,t,i,s,r,o,a,l){return this.getBarycoord(e,t,i,s,Zi),l.setScalar(0),l.addScaledVector(r,Zi.x),l.addScaledVector(o,Zi.y),l.addScaledVector(a,Zi.z),l}static isFrontFacing(e,t,i,s){return yi.subVectors(i,t),Ji.subVectors(e,t),yi.cross(Ji).dot(s)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,s){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,i,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return yi.subVectors(this.c,this.b),Ji.subVectors(this.a,this.b),yi.cross(Ji).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return di.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return di.getBarycoord(e,this.a,this.b,this.c,t)}getUV(e,t,i,s,r){return La===!1&&(console.warn("THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."),La=!0),di.getInterpolation(e,this.a,this.b,this.c,t,i,s,r)}getInterpolation(e,t,i,s,r){return di.getInterpolation(e,this.a,this.b,this.c,t,i,s,r)}containsPoint(e){return di.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return di.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const i=this.a,s=this.b,r=this.c;let o,a;Rr.subVectors(s,i),Fr.subVectors(r,i),Tu.subVectors(e,i);const l=Rr.dot(Tu),u=Fr.dot(Tu);if(l<=0&&u<=0)return t.copy(i);Cu.subVectors(e,s);const d=Rr.dot(Cu),h=Fr.dot(Cu);if(d>=0&&h<=d)return t.copy(s);const f=l*h-d*u;if(f<=0&&l>=0&&d<=0)return o=l/(l-d),t.copy(i).addScaledVector(Rr,o);Du.subVectors(e,r);const p=Rr.dot(Du),g=Fr.dot(Du);if(g>=0&&p<=g)return t.copy(r);const v=p*u-l*g;if(v<=0&&u>=0&&g<=0)return a=u/(u-g),t.copy(i).addScaledVector(Fr,a);const _=d*g-p*h;if(_<=0&&h-d>=0&&p-g>=0)return yf.subVectors(r,s),a=(h-d)/(h-d+(p-g)),t.copy(s).addScaledVector(yf,a);const m=1/(_+v+f);return o=v*m,a=f*m,t.copy(i).addScaledVector(Rr,o).addScaledVector(Fr,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}let X2=0;class wi extends zs{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:X2++}),this.uuid=Si(),this.name="",this.type="Material",this.blending=Qr,this.side=Oi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.blendSrc=s0,this.blendDst=r0,this.blendEquation=qr,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.depthFunc=fc,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=_2,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=gu,this.stencilZFail=gu,this.stencilZPass=gu,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBuild(){}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const i=e[t];if(i===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const i={metadata:{version:4.5,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==Qr&&(i.blending=this.blending),this.side!==Oi&&(i.side=this.side),this.vertexColors&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=this.transparent),i.depthFunc=this.depthFunc,i.depthTest=this.depthTest,i.depthWrite=this.depthWrite,i.colorWrite=this.colorWrite,i.stencilWrite=this.stencilWrite,i.stencilWriteMask=this.stencilWriteMask,i.stencilFunc=this.stencilFunc,i.stencilRef=this.stencilRef,i.stencilFuncMask=this.stencilFuncMask,i.stencilFail=this.stencilFail,i.stencilZFail=this.stencilZFail,i.stencilZPass=this.stencilZPass,this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaToCoverage===!0&&(i.alphaToCoverage=this.alphaToCoverage),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=this.premultipliedAlpha),this.forceSinglePass===!0&&(i.forceSinglePass=this.forceSinglePass),this.wireframe===!0&&(i.wireframe=this.wireframe),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=this.flatShading),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(r){const o=[];for(const a in r){const l=r[a];delete l.metadata,o.push(l)}return o}if(t){const r=s(e.textures),o=s(e.images);r.length>0&&(i.textures=r),o.length>0&&(i.images=o)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let i=null;if(t!==null){const s=t.length;i=new Array(s);for(let r=0;r!==s;++r)i[r]=t[r].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}const E0={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ei={h:0,s:0,l:0},Ia={h:0,s:0,l:0};function Ru(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}class ut{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,t===void 0&&i===void 0?this.set(e):this.setRGB(e,t,i)}set(e){return e&&e.isColor?this.copy(e):typeof e=="number"?this.setHex(e):typeof e=="string"&&this.setStyle(e),this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=dt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,_i.toWorkingColorSpace(this,t),this}setRGB(e,t,i,s=_i.workingColorSpace){return this.r=e,this.g=t,this.b=i,_i.toWorkingColorSpace(this,s),this}setHSL(e,t,i,s=_i.workingColorSpace){if(e=ld(e,1),t=ln(t,0,1),i=ln(i,0,1),t===0)this.r=this.g=this.b=i;else{const r=i<=.5?i*(1+t):i+t-i*t,o=2*i-r;this.r=Ru(o,r,e+1/3),this.g=Ru(o,r,e),this.b=Ru(o,r,e-1/3)}return _i.toWorkingColorSpace(this,s),this}setStyle(e,t=dt){function i(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=dt){const i=E0[e.toLowerCase()];return i!==void 0?this.setHex(i,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=to(e.r),this.g=to(e.g),this.b=to(e.b),this}copyLinearToSRGB(e){return this.r=vu(e.r),this.g=vu(e.g),this.b=vu(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=dt){return _i.fromWorkingColorSpace(Rn.copy(this),e),Math.round(ln(Rn.r*255,0,255))*65536+Math.round(ln(Rn.g*255,0,255))*256+Math.round(ln(Rn.b*255,0,255))}getHexString(e=dt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=_i.workingColorSpace){_i.fromWorkingColorSpace(Rn.copy(this),t);const i=Rn.r,s=Rn.g,r=Rn.b,o=Math.max(i,s,r),a=Math.min(i,s,r);let l,u;const d=(a+o)/2;if(a===o)l=0,u=0;else{const h=o-a;switch(u=d<=.5?h/(o+a):h/(2-o-a),o){case i:l=(s-r)/h+(s<r?6:0);break;case s:l=(r-i)/h+2;break;case r:l=(i-s)/h+4;break}l/=6}return e.h=l,e.s=u,e.l=d,e}getRGB(e,t=_i.workingColorSpace){return _i.fromWorkingColorSpace(Rn.copy(this),t),e.r=Rn.r,e.g=Rn.g,e.b=Rn.b,e}getStyle(e=dt){_i.fromWorkingColorSpace(Rn.copy(this),e);const t=Rn.r,i=Rn.g,s=Rn.b;return e!==dt?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(e,t,i){return this.getHSL(Ei),Ei.h+=e,Ei.s+=t,Ei.l+=i,this.setHSL(Ei.h,Ei.s,Ei.l),this}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(Ei),e.getHSL(Ia);const i=Ko(Ei.h,Ia.h,t),s=Ko(Ei.s,Ia.s,t),r=Ko(Ei.l,Ia.l,t);return this.setHSL(i,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,i=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*i+r[6]*s,this.g=r[1]*t+r[4]*i+r[7]*s,this.b=r[2]*t+r[5]*i+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Rn=new ut;ut.NAMES=E0;class Vn extends wi{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new ut(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.combine=o0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const an=new L,Ba=new Ue;class In{constructor(e,t,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=bl,this.updateRange={offset:0,count:-1},this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[i+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)Ba.fromBufferAttribute(this,t),Ba.applyMatrix3(e),this.setXY(t,Ba.x,Ba.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)an.fromBufferAttribute(this,t),an.applyMatrix3(e),this.setXYZ(t,an.x,an.y,an.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)an.fromBufferAttribute(this,t),an.applyMatrix4(e),this.setXYZ(t,an.x,an.y,an.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)an.fromBufferAttribute(this,t),an.applyNormalMatrix(e),this.setXYZ(t,an.x,an.y,an.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)an.fromBufferAttribute(this,t),an.transformDirection(e),this.setXYZ(t,an.x,an.y,an.z);return this}set(e,t=0){return this.array.set(e,t),this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=is(t,this.array)),t}setX(e,t){return this.normalized&&(t=Nt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=is(t,this.array)),t}setY(e,t){return this.normalized&&(t=Nt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=is(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Nt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=is(t,this.array)),t}setW(e,t){return this.normalized&&(t=Nt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=Nt(t,this.array),i=Nt(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,s){return e*=this.itemSize,this.normalized&&(t=Nt(t,this.array),i=Nt(i,this.array),s=Nt(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this}setXYZW(e,t,i,s,r){return e*=this.itemSize,this.normalized&&(t=Nt(t,this.array),i=Nt(i,this.array),s=Nt(s,this.array),r=Nt(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==bl&&(e.usage=this.usage),(this.updateRange.offset!==0||this.updateRange.count!==-1)&&(e.updateRange=this.updateRange),e}copyColorsArray(){console.error("THREE.BufferAttribute: copyColorsArray() was removed in r144.")}copyVector2sArray(){console.error("THREE.BufferAttribute: copyVector2sArray() was removed in r144.")}copyVector3sArray(){console.error("THREE.BufferAttribute: copyVector3sArray() was removed in r144.")}copyVector4sArray(){console.error("THREE.BufferAttribute: copyVector4sArray() was removed in r144.")}}class x0 extends In{constructor(e,t,i){super(new Uint16Array(e),t,i)}}class b0 extends In{constructor(e,t,i){super(new Uint32Array(e),t,i)}}class bt extends In{constructor(e,t,i){super(new Float32Array(e),t,i)}}let j2=0;const ai=new xt,Fu=new Vt,Pr=new L,ti=new mn,Fo=new mn,fn=new L;class Zt extends zs{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:j2++}),this.uuid=Si(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(g0(e)?b0:x0)(e,1):this.index=e,this}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const r=new Mt().getNormalMatrix(e);i.applyNormalMatrix(r),i.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return ai.makeRotationFromQuaternion(e),this.applyMatrix4(ai),this}rotateX(e){return ai.makeRotationX(e),this.applyMatrix4(ai),this}rotateY(e){return ai.makeRotationY(e),this.applyMatrix4(ai),this}rotateZ(e){return ai.makeRotationZ(e),this.applyMatrix4(ai),this}translate(e,t,i){return ai.makeTranslation(e,t,i),this.applyMatrix4(ai),this}scale(e,t,i){return ai.makeScale(e,t,i),this.applyMatrix4(ai),this}lookAt(e){return Fu.lookAt(e),Fu.updateMatrix(),this.applyMatrix4(Fu.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Pr).negate(),this.translate(Pr.x,Pr.y,Pr.z),this}setFromPoints(e){const t=[];for(let i=0,s=e.length;i<s;i++){const r=e[i];t.push(r.x,r.y,r.z||0)}return this.setAttribute("position",new bt(t,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new mn);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingBox.set(new L(-1/0,-1/0,-1/0),new L(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,s=t.length;i<s;i++){const r=t[i];ti.setFromBufferAttribute(r),this.morphTargetsRelative?(fn.addVectors(this.boundingBox.min,ti.min),this.boundingBox.expandByPoint(fn),fn.addVectors(this.boundingBox.max,ti.max),this.boundingBox.expandByPoint(fn)):(this.boundingBox.expandByPoint(ti.min),this.boundingBox.expandByPoint(ti.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ls);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error('THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere. Alternatively set "mesh.frustumCulled" to "false".',this),this.boundingSphere.set(new L,1/0);return}if(e){const i=this.boundingSphere.center;if(ti.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){const a=t[r];Fo.setFromBufferAttribute(a),this.morphTargetsRelative?(fn.addVectors(ti.min,Fo.min),ti.expandByPoint(fn),fn.addVectors(ti.max,Fo.max),ti.expandByPoint(fn)):(ti.expandByPoint(Fo.min),ti.expandByPoint(Fo.max))}ti.getCenter(i);let s=0;for(let r=0,o=e.count;r<o;r++)fn.fromBufferAttribute(e,r),s=Math.max(s,i.distanceToSquared(fn));if(t)for(let r=0,o=t.length;r<o;r++){const a=t[r],l=this.morphTargetsRelative;for(let u=0,d=a.count;u<d;u++)fn.fromBufferAttribute(a,u),l&&(Pr.fromBufferAttribute(e,u),fn.add(Pr)),s=Math.max(s,i.distanceToSquared(fn))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=e.array,s=t.position.array,r=t.normal.array,o=t.uv.array,a=s.length/3;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new In(new Float32Array(4*a),4));const l=this.getAttribute("tangent").array,u=[],d=[];for(let w=0;w<a;w++)u[w]=new L,d[w]=new L;const h=new L,f=new L,p=new L,g=new Ue,v=new Ue,_=new Ue,m=new L,E=new L;function y(w,oe,X){h.fromArray(s,w*3),f.fromArray(s,oe*3),p.fromArray(s,X*3),g.fromArray(o,w*2),v.fromArray(o,oe*2),_.fromArray(o,X*2),f.sub(h),p.sub(h),v.sub(g),_.sub(g);const z=1/(v.x*_.y-_.x*v.y);!isFinite(z)||(m.copy(f).multiplyScalar(_.y).addScaledVector(p,-v.y).multiplyScalar(z),E.copy(p).multiplyScalar(v.x).addScaledVector(f,-_.x).multiplyScalar(z),u[w].add(m),u[oe].add(m),u[X].add(m),d[w].add(E),d[oe].add(E),d[X].add(E))}let x=this.groups;x.length===0&&(x=[{start:0,count:i.length}]);for(let w=0,oe=x.length;w<oe;++w){const X=x[w],z=X.start,T=X.count;for(let G=z,re=z+T;G<re;G+=3)y(i[G+0],i[G+1],i[G+2])}const M=new L,A=new L,F=new L,I=new L;function b(w){F.fromArray(r,w*3),I.copy(F);const oe=u[w];M.copy(oe),M.sub(F.multiplyScalar(F.dot(oe))).normalize(),A.crossVectors(I,oe);const z=A.dot(d[w])<0?-1:1;l[w*4]=M.x,l[w*4+1]=M.y,l[w*4+2]=M.z,l[w*4+3]=z}for(let w=0,oe=x.length;w<oe;++w){const X=x[w],z=X.start,T=X.count;for(let G=z,re=z+T;G<re;G+=3)b(i[G+0]),b(i[G+1]),b(i[G+2])}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new In(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let f=0,p=i.count;f<p;f++)i.setXYZ(f,0,0,0);const s=new L,r=new L,o=new L,a=new L,l=new L,u=new L,d=new L,h=new L;if(e)for(let f=0,p=e.count;f<p;f+=3){const g=e.getX(f+0),v=e.getX(f+1),_=e.getX(f+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,v),o.fromBufferAttribute(t,_),d.subVectors(o,r),h.subVectors(s,r),d.cross(h),a.fromBufferAttribute(i,g),l.fromBufferAttribute(i,v),u.fromBufferAttribute(i,_),a.add(d),l.add(d),u.add(d),i.setXYZ(g,a.x,a.y,a.z),i.setXYZ(v,l.x,l.y,l.z),i.setXYZ(_,u.x,u.y,u.z)}else for(let f=0,p=t.count;f<p;f+=3)s.fromBufferAttribute(t,f+0),r.fromBufferAttribute(t,f+1),o.fromBufferAttribute(t,f+2),d.subVectors(o,r),h.subVectors(s,r),d.cross(h),i.setXYZ(f+0,d.x,d.y,d.z),i.setXYZ(f+1,d.x,d.y,d.z),i.setXYZ(f+2,d.x,d.y,d.z);this.normalizeNormals(),i.needsUpdate=!0}}merge(){return console.error("THREE.BufferGeometry.merge() has been removed. Use THREE.BufferGeometryUtils.mergeGeometries() instead."),this}normalizeNormals(){const e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)fn.fromBufferAttribute(e,t),fn.normalize(),e.setXYZ(t,fn.x,fn.y,fn.z)}toNonIndexed(){function e(a,l){const u=a.array,d=a.itemSize,h=a.normalized,f=new u.constructor(l.length*d);let p=0,g=0;for(let v=0,_=l.length;v<_;v++){a.isInterleavedBufferAttribute?p=l[v]*a.data.stride+a.offset:p=l[v]*d;for(let m=0;m<d;m++)f[g++]=u[p++]}return new In(f,d,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Zt,i=this.index.array,s=this.attributes;for(const a in s){const l=s[a],u=e(l,i);t.setAttribute(a,u)}const r=this.morphAttributes;for(const a in r){const l=[],u=r[a];for(let d=0,h=u.length;d<h;d++){const f=u[d],p=e(f,i);l.push(p)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const u=o[a];t.addGroup(u.start,u.count,u.materialIndex)}return t}toJSON(){const e={metadata:{version:4.5,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const u in l)l[u]!==void 0&&(e[u]=l[u]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const i=this.attributes;for(const l in i){const u=i[l];e.data.attributes[l]=u.toJSON(e.data)}const s={};let r=!1;for(const l in this.morphAttributes){const u=this.morphAttributes[l],d=[];for(let h=0,f=u.length;h<f;h++){const p=u[h];d.push(p.toJSON(e.data))}d.length>0&&(s[l]=d,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone(t));const s=e.attributes;for(const u in s){const d=s[u];this.setAttribute(u,d.clone(t))}const r=e.morphAttributes;for(const u in r){const d=[],h=r[u];for(let f=0,p=h.length;f<p;f++)d.push(h[f].clone(t));this.morphAttributes[u]=d}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let u=0,d=o.length;u<d;u++){const h=o[u];this.addGroup(h.start,h.count,h.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Ef=new xt,Fi=new Wl,Ua=new ls,xf=new L,Lr=new L,Ir=new L,Br=new L,Pu=new L,Na=new L,Oa=new Ue,ka=new Ue,za=new Ue,bf=new L,Mf=new L,Af=new L,Ha=new L,$a=new L;class je extends Vt{constructor(e=new Zt,t=new Vn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){const i=this.geometry,s=i.attributes.position,r=i.morphAttributes.position,o=i.morphTargetsRelative;t.fromBufferAttribute(s,e);const a=this.morphTargetInfluences;if(r&&a){Na.set(0,0,0);for(let l=0,u=r.length;l<u;l++){const d=a[l],h=r[l];d!==0&&(Pu.fromBufferAttribute(h,e),o?Na.addScaledVector(Pu,d):Na.addScaledVector(Pu.sub(t),d))}t.add(Na)}return t}raycast(e,t){const i=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Ua.copy(i.boundingSphere),Ua.applyMatrix4(r),Fi.copy(e.ray).recast(e.near),!(Ua.containsPoint(Fi.origin)===!1&&(Fi.intersectSphere(Ua,xf)===null||Fi.origin.distanceToSquared(xf)>(e.far-e.near)**2))&&(Ef.copy(r).invert(),Fi.copy(e.ray).applyMatrix4(Ef),!(i.boundingBox!==null&&Fi.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t)))}_computeIntersections(e,t){let i;const s=this.geometry,r=this.material,o=s.index,a=s.attributes.position,l=s.attributes.uv,u=s.attributes.uv1,d=s.attributes.normal,h=s.groups,f=s.drawRange;if(o!==null)if(Array.isArray(r))for(let p=0,g=h.length;p<g;p++){const v=h[p],_=r[v.materialIndex],m=Math.max(v.start,f.start),E=Math.min(o.count,Math.min(v.start+v.count,f.start+f.count));for(let y=m,x=E;y<x;y+=3){const M=o.getX(y),A=o.getX(y+1),F=o.getX(y+2);i=Va(this,_,e,Fi,l,u,d,M,A,F),i&&(i.faceIndex=Math.floor(y/3),i.face.materialIndex=v.materialIndex,t.push(i))}}else{const p=Math.max(0,f.start),g=Math.min(o.count,f.start+f.count);for(let v=p,_=g;v<_;v+=3){const m=o.getX(v),E=o.getX(v+1),y=o.getX(v+2);i=Va(this,r,e,Fi,l,u,d,m,E,y),i&&(i.faceIndex=Math.floor(v/3),t.push(i))}}else if(a!==void 0)if(Array.isArray(r))for(let p=0,g=h.length;p<g;p++){const v=h[p],_=r[v.materialIndex],m=Math.max(v.start,f.start),E=Math.min(a.count,Math.min(v.start+v.count,f.start+f.count));for(let y=m,x=E;y<x;y+=3){const M=y,A=y+1,F=y+2;i=Va(this,_,e,Fi,l,u,d,M,A,F),i&&(i.faceIndex=Math.floor(y/3),i.face.materialIndex=v.materialIndex,t.push(i))}}else{const p=Math.max(0,f.start),g=Math.min(a.count,f.start+f.count);for(let v=p,_=g;v<_;v+=3){const m=v,E=v+1,y=v+2;i=Va(this,r,e,Fi,l,u,d,m,E,y),i&&(i.faceIndex=Math.floor(v/3),t.push(i))}}}}function q2(n,e,t,i,s,r,o,a){let l;if(e.side===Yn?l=i.intersectTriangle(o,r,s,!0,a):l=i.intersectTriangle(s,r,o,e.side===Oi,a),l===null)return null;$a.copy(a),$a.applyMatrix4(n.matrixWorld);const u=t.ray.origin.distanceTo($a);return u<t.near||u>t.far?null:{distance:u,point:$a.clone(),object:n}}function Va(n,e,t,i,s,r,o,a,l,u){n.getVertexPosition(a,Lr),n.getVertexPosition(l,Ir),n.getVertexPosition(u,Br);const d=q2(n,e,t,i,Lr,Ir,Br,Ha);if(d){s&&(Oa.fromBufferAttribute(s,a),ka.fromBufferAttribute(s,l),za.fromBufferAttribute(s,u),d.uv=di.getInterpolation(Ha,Lr,Ir,Br,Oa,ka,za,new Ue)),r&&(Oa.fromBufferAttribute(r,a),ka.fromBufferAttribute(r,l),za.fromBufferAttribute(r,u),d.uv1=di.getInterpolation(Ha,Lr,Ir,Br,Oa,ka,za,new Ue),d.uv2=d.uv1),o&&(bf.fromBufferAttribute(o,a),Mf.fromBufferAttribute(o,l),Af.fromBufferAttribute(o,u),d.normal=di.getInterpolation(Ha,Lr,Ir,Br,bf,Mf,Af,new L),d.normal.dot(i.direction)>0&&d.normal.multiplyScalar(-1));const h={a,b:l,c:u,normal:new L,materialIndex:0};di.getNormal(Lr,Ir,Br,h.normal),d.face=h}return d}class mt extends Zt{constructor(e=1,t=1,i=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:s,heightSegments:r,depthSegments:o};const a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);const l=[],u=[],d=[],h=[];let f=0,p=0;g("z","y","x",-1,-1,i,t,e,o,r,0),g("z","y","x",1,-1,i,t,-e,o,r,1),g("x","z","y",1,1,e,i,t,s,o,2),g("x","z","y",1,-1,e,i,-t,s,o,3),g("x","y","z",1,-1,e,t,i,s,r,4),g("x","y","z",-1,-1,e,t,-i,s,r,5),this.setIndex(l),this.setAttribute("position",new bt(u,3)),this.setAttribute("normal",new bt(d,3)),this.setAttribute("uv",new bt(h,2));function g(v,_,m,E,y,x,M,A,F,I,b){const w=x/F,oe=M/I,X=x/2,z=M/2,T=A/2,G=F+1,re=I+1;let ae=0,C=0;const J=new L;for(let $=0;$<re;$++){const ee=$*oe-z;for(let U=0;U<G;U++){const N=U*w-X;J[v]=N*E,J[_]=ee*y,J[m]=T,u.push(J.x,J.y,J.z),J[v]=0,J[_]=0,J[m]=A>0?1:-1,d.push(J.x,J.y,J.z),h.push(U/F),h.push(1-$/I),ae+=1}}for(let $=0;$<I;$++)for(let ee=0;ee<F;ee++){const U=f+ee+G*$,N=f+ee+G*($+1),le=f+(ee+1)+G*($+1),Y=f+(ee+1)+G*$;l.push(U,N,Y),l.push(N,le,Y),C+=6}a.addGroup(p,C,b),p+=C,f+=ae}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new mt(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function mo(n){const e={};for(const t in n){e[t]={};for(const i in n[t]){const s=n[t][i];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=s.clone():Array.isArray(s)?e[t][i]=s.slice():e[t][i]=s}}return e}function Hn(n){const e={};for(let t=0;t<n.length;t++){const i=mo(n[t]);for(const s in i)e[s]=i[s]}return e}function K2(n){const e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function M0(n){return n.getRenderTarget()===null?n.outputColorSpace:ki}const Y2={clone:mo,merge:Hn};var J2=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Z2=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class fr extends wi{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=J2,this.fragmentShader=Z2,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={derivatives:!1,fragDepth:!1,drawBuffers:!1,shaderTextureLOD:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=mo(e.uniforms),this.uniformsGroups=K2(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const s in this.uniforms){const o=this.uniforms[s].value;o&&o.isTexture?t.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[s]={type:"m4",value:o.toArray()}:t.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const i={};for(const s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}}class A0 extends Vt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new xt,this.projectionMatrix=new xt,this.projectionMatrixInverse=new xt}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(-t[8],-t[9],-t[10]).normalize()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}class Fn extends A0{constructor(e=50,t=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=po*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(qo*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return po*2*Math.atan(Math.tan(qo*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}setViewOffset(e,t,i,s,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(qo*.5*this.fov)/this.zoom,i=2*t,s=this.aspect*i,r=-.5*s;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,u=o.fullHeight;r+=o.offsetX*s/l,t-=o.offsetY*i/u,s*=o.width/l,i*=o.height/u}const a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-i,e,this.far),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const Ur=-90,Nr=1;class Q2 extends Vt{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i;const s=new Fn(Ur,Nr,e,t);s.layers=this.layers,s.up.set(0,1,0),s.lookAt(1,0,0),this.add(s);const r=new Fn(Ur,Nr,e,t);r.layers=this.layers,r.up.set(0,1,0),r.lookAt(-1,0,0),this.add(r);const o=new Fn(Ur,Nr,e,t);o.layers=this.layers,o.up.set(0,0,-1),o.lookAt(0,1,0),this.add(o);const a=new Fn(Ur,Nr,e,t);a.layers=this.layers,a.up.set(0,0,1),a.lookAt(0,-1,0),this.add(a);const l=new Fn(Ur,Nr,e,t);l.layers=this.layers,l.up.set(0,1,0),l.lookAt(0,0,1),this.add(l);const u=new Fn(Ur,Nr,e,t);u.layers=this.layers,u.up.set(0,1,0),u.lookAt(0,0,-1),this.add(u)}update(e,t){this.parent===null&&this.updateMatrixWorld();const i=this.renderTarget,[s,r,o,a,l,u]=this.children,d=e.getRenderTarget(),h=e.toneMapping,f=e.xr.enabled;e.toneMapping=rs,e.xr.enabled=!1;const p=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0),e.render(t,s),e.setRenderTarget(i,1),e.render(t,r),e.setRenderTarget(i,2),e.render(t,o),e.setRenderTarget(i,3),e.render(t,a),e.setRenderTarget(i,4),e.render(t,l),i.texture.generateMipmaps=p,e.setRenderTarget(i,5),e.render(t,u),e.setRenderTarget(d),e.toneMapping=h,e.xr.enabled=f,i.texture.needsPMREMUpdate=!0}}class S0 extends vn{constructor(e,t,i,s,r,o,a,l,u,d){e=e!==void 0?e:[],t=t!==void 0?t:uo,super(e,t,i,s,r,o,a,l,u,d),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class eb extends hr{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},s=[i,i,i,i,i,i];t.encoding!==void 0&&(Yo("THREE.WebGLCubeRenderTarget: option.encoding has been replaced by option.colorSpace."),t.colorSpace=t.encoding===or?dt:ar),this.texture=new S0(s,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:qn}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new mt(5,5,5),r=new fr({name:"CubemapFromEquirect",uniforms:mo(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Yn,blending:Is});r.uniforms.tEquirect.value=t;const o=new je(s,r),a=t.minFilter;return t.minFilter===cr&&(t.minFilter=qn),new Q2(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t,i,s){const r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,i,s);e.setRenderTarget(r)}}const Lu=new L,tb=new L,nb=new Mt;class qs{constructor(e=new L(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,s){return this.normal.set(e,t,i),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){const s=Lu.subVectors(i,t).cross(tb.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const i=e.delta(Lu),s=this.normal.dot(i);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(i,r)}intersectsLine(e){const t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const i=t||nb.getNormalMatrix(e),s=this.coplanarPoint(Lu).applyMatrix4(e),r=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Xs=new ls,Ga=new L;class cd{constructor(e=new qs,t=new qs,i=new qs,s=new qs,r=new qs,o=new qs){this.planes=[e,t,i,s,r,o]}set(e,t,i,s,r,o){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(i),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(e){const t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e){const t=this.planes,i=e.elements,s=i[0],r=i[1],o=i[2],a=i[3],l=i[4],u=i[5],d=i[6],h=i[7],f=i[8],p=i[9],g=i[10],v=i[11],_=i[12],m=i[13],E=i[14],y=i[15];return t[0].setComponents(a-s,h-l,v-f,y-_).normalize(),t[1].setComponents(a+s,h+l,v+f,y+_).normalize(),t[2].setComponents(a+r,h+u,v+p,y+m).normalize(),t[3].setComponents(a-r,h-u,v-p,y-m).normalize(),t[4].setComponents(a-o,h-d,v-g,y-E).normalize(),t[5].setComponents(a+o,h+d,v+g,y+E).normalize(),this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Xs.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Xs.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Xs)}intersectsSprite(e){return Xs.center.set(0,0,0),Xs.radius=.7071067811865476,Xs.applyMatrix4(e.matrixWorld),this.intersectsSphere(Xs)}intersectsSphere(e){const t=this.planes,i=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(i)<s)return!1;return!0}intersectsBox(e){const t=this.planes;for(let i=0;i<6;i++){const s=t[i];if(Ga.x=s.normal.x>0?e.max.x:e.min.x,Ga.y=s.normal.y>0?e.max.y:e.min.y,Ga.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Ga)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function w0(){let n=null,e=!1,t=null,i=null;function s(r,o){t(r,o),i=n.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(i=n.requestAnimationFrame(s),e=!0)},stop:function(){n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){n=r}}}function ib(n,e){const t=e.isWebGL2,i=new WeakMap;function s(u,d){const h=u.array,f=u.usage,p=n.createBuffer();n.bindBuffer(d,p),n.bufferData(d,h,f),u.onUploadCallback();let g;if(h instanceof Float32Array)g=n.FLOAT;else if(h instanceof Uint16Array)if(u.isFloat16BufferAttribute)if(t)g=n.HALF_FLOAT;else throw new Error("THREE.WebGLAttributes: Usage of Float16BufferAttribute requires WebGL2.");else g=n.UNSIGNED_SHORT;else if(h instanceof Int16Array)g=n.SHORT;else if(h instanceof Uint32Array)g=n.UNSIGNED_INT;else if(h instanceof Int32Array)g=n.INT;else if(h instanceof Int8Array)g=n.BYTE;else if(h instanceof Uint8Array)g=n.UNSIGNED_BYTE;else if(h instanceof Uint8ClampedArray)g=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+h);return{buffer:p,type:g,bytesPerElement:h.BYTES_PER_ELEMENT,version:u.version}}function r(u,d,h){const f=d.array,p=d.updateRange;n.bindBuffer(h,u),p.count===-1?n.bufferSubData(h,0,f):(t?n.bufferSubData(h,p.offset*f.BYTES_PER_ELEMENT,f,p.offset,p.count):n.bufferSubData(h,p.offset*f.BYTES_PER_ELEMENT,f.subarray(p.offset,p.offset+p.count)),p.count=-1),d.onUploadCallback()}function o(u){return u.isInterleavedBufferAttribute&&(u=u.data),i.get(u)}function a(u){u.isInterleavedBufferAttribute&&(u=u.data);const d=i.get(u);d&&(n.deleteBuffer(d.buffer),i.delete(u))}function l(u,d){if(u.isGLBufferAttribute){const f=i.get(u);(!f||f.version<u.version)&&i.set(u,{buffer:u.buffer,type:u.type,bytesPerElement:u.elementSize,version:u.version});return}u.isInterleavedBufferAttribute&&(u=u.data);const h=i.get(u);h===void 0?i.set(u,s(u,d)):h.version<u.version&&(r(h.buffer,u,d),h.version=u.version)}return{get:o,remove:a,update:l}}class go extends Zt{constructor(e=1,t=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:s};const r=e/2,o=t/2,a=Math.floor(i),l=Math.floor(s),u=a+1,d=l+1,h=e/a,f=t/l,p=[],g=[],v=[],_=[];for(let m=0;m<d;m++){const E=m*f-o;for(let y=0;y<u;y++){const x=y*h-r;g.push(x,-E,0),v.push(0,0,1),_.push(y/a),_.push(1-m/l)}}for(let m=0;m<l;m++)for(let E=0;E<a;E++){const y=E+u*m,x=E+u*(m+1),M=E+1+u*(m+1),A=E+1+u*m;p.push(y,x,A),p.push(x,M,A)}this.setIndex(p),this.setAttribute("position",new bt(g,3)),this.setAttribute("normal",new bt(v,3)),this.setAttribute("uv",new bt(_,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new go(e.width,e.height,e.widthSegments,e.heightSegments)}}var sb=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,rb=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,ob=`#ifdef USE_ALPHATEST
	if ( diffuseColor.a < alphaTest ) discard;
#endif`,ab=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,lb=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,ub=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,cb="vec3 transformed = vec3( position );",db=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,hb=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,fb=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			 return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float R21 = R12;
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,pb=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = dFdx( surf_pos.xyz );
		vec3 vSigmaY = dFdy( surf_pos.xyz );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,mb=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#pragma unroll_loop_start
	for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
		plane = clippingPlanes[ i ];
		if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
	}
	#pragma unroll_loop_end
	#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
		bool clipped = true;
		#pragma unroll_loop_start
		for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
		}
		#pragma unroll_loop_end
		if ( clipped ) discard;
	#endif
#endif`,gb=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,_b=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,vb=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,yb=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Eb=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,xb=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	varying vec3 vColor;
#endif`,bb=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif`,Mb=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
struct GeometricContext {
	vec3 position;
	vec3 normal;
	vec3 viewDir;
#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal;
#endif
};
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
float luminance( const in vec3 rgb ) {
	const vec3 weights = vec3( 0.2126729, 0.7151522, 0.0721750 );
	return dot( weights, rgb );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Ab=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_v0 0.339
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_v1 0.276
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_v4 0.046
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_v5 0.016
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_v6 0.0038
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Sb=`vec3 transformedNormal = objectNormal;
#ifdef USE_INSTANCING
	mat3 m = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( m[ 0 ], m[ 0 ] ), dot( m[ 1 ], m[ 1 ] ), dot( m[ 2 ], m[ 2 ] ) );
	transformedNormal = m * transformedNormal;
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	vec3 transformedTangent = ( modelViewMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,wb=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Tb=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Cb=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Db=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Rb="gl_FragColor = linearToOutputTexel( gl_FragColor );",Fb=`vec4 LinearToLinear( in vec4 value ) {
	return value;
}
vec4 LinearTosRGB( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Pb=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,Lb=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Ib=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Bb=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Ub=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Nb=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Ob=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,kb=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,zb=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Hb=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,$b=`#ifdef USE_LIGHTMAP
	vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
	vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
	reflectedLight.indirectDiffuse += lightMapIrradiance;
#endif`,Vb=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Gb=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Wb=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in GeometricContext geometry, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometry.normal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in GeometricContext geometry, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Xb=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
uniform vec3 lightProbe[ 9 ];
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	#if defined ( LEGACY_LIGHTS )
		if ( cutoffDistance > 0.0 && decayExponent > 0.0 ) {
			return pow( saturate( - lightDistance / cutoffDistance + 1.0 ), decayExponent );
		}
		return 1.0;
	#else
		float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
		if ( cutoffDistance > 0.0 ) {
			distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
		}
		return distanceFalloff;
	#endif
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, const in GeometricContext geometry, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in GeometricContext geometry, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometry.position;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in GeometricContext geometry, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometry.position;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,jb=`#if defined( USE_ENVMAP )
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#if defined( ENVMAP_TYPE_CUBE_UV )
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#if defined( ENVMAP_TYPE_CUBE_UV )
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
#endif`,qb=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Kb=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in GeometricContext geometry, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometry.normal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in GeometricContext geometry, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Yb=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Jb=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometry.normal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometry.viewDir, geometry.normal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in GeometricContext geometry, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Zb=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( geometryNormal ) ), abs( dFdy( geometryNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif`,Qb=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
};
vec3 clearcoatSpecular = vec3( 0.0 );
vec3 sheenSpecular = vec3( 0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
	float D = D_GGX( alpha, dotNH );
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometry.normal;
		vec3 viewDir = geometry.viewDir;
		vec3 position = geometry.position;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometry.normal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometry.clearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecular += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometry.viewDir, geometry.clearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecular += irradiance * BRDF_Sheen( directLight.direction, geometry.viewDir, geometry.normal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometry.viewDir, geometry.normal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecular += clearcoatRadiance * EnvironmentBRDF( geometry.clearcoatNormal, geometry.viewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecular += irradiance * material.sheenColor * IBLSheenBRDF( geometry.normal, geometry.viewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometry.normal, geometry.viewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometry.normal, geometry.viewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,eM=`
GeometricContext geometry;
geometry.position = - vViewPosition;
geometry.normal = normal;
geometry.viewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
#ifdef USE_CLEARCOAT
	geometry.clearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometry.viewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometry, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometry, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometry, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometry, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, geometry, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometry, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometry, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	irradiance += getLightProbeIrradiance( lightProbe, geometry.normal );
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry.normal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,tM=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometry.normal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	radiance += getIBLRadiance( geometry.viewDir, geometry.normal, material.roughness );
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometry.viewDir, geometry.clearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,nM=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometry, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometry, material, reflectedLight );
#endif`,iM=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,sM=`#if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,rM=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		varying float vFragDepth;
		varying float vIsPerspective;
	#else
		uniform float logDepthBufFC;
	#endif
#endif`,oM=`#ifdef USE_LOGDEPTHBUF
	#ifdef USE_LOGDEPTHBUF_EXT
		vFragDepth = 1.0 + gl_Position.w;
		vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
	#else
		if ( isPerspectiveMatrix( projectionMatrix ) ) {
			gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
			gl_Position.z *= gl_Position.w;
		}
	#endif
#endif`,aM=`#ifdef USE_MAP
	diffuseColor *= texture2D( map, vMapUv );
#endif`,lM=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,uM=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,cM=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,dM=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,hM=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,fM=`#if defined( USE_MORPHCOLORS ) && defined( MORPHTARGETS_TEXTURE )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,pM=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		objectNormal += morphNormal0 * morphTargetInfluences[ 0 ];
		objectNormal += morphNormal1 * morphTargetInfluences[ 1 ];
		objectNormal += morphNormal2 * morphTargetInfluences[ 2 ];
		objectNormal += morphNormal3 * morphTargetInfluences[ 3 ];
	#endif
#endif`,mM=`#ifdef USE_MORPHTARGETS
	uniform float morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
		uniform sampler2DArray morphTargetsTexture;
		uniform ivec2 morphTargetsTextureSize;
		vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
			int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
			int y = texelIndex / morphTargetsTextureSize.x;
			int x = texelIndex - y * morphTargetsTextureSize.x;
			ivec3 morphUV = ivec3( x, y, morphTargetIndex );
			return texelFetch( morphTargetsTexture, morphUV, 0 );
		}
	#else
		#ifndef USE_MORPHNORMALS
			uniform float morphTargetInfluences[ 8 ];
		#else
			uniform float morphTargetInfluences[ 4 ];
		#endif
	#endif
#endif`,gM=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	#ifdef MORPHTARGETS_TEXTURE
		for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
			if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
		}
	#else
		transformed += morphTarget0 * morphTargetInfluences[ 0 ];
		transformed += morphTarget1 * morphTargetInfluences[ 1 ];
		transformed += morphTarget2 * morphTargetInfluences[ 2 ];
		transformed += morphTarget3 * morphTargetInfluences[ 3 ];
		#ifndef USE_MORPHNORMALS
			transformed += morphTarget4 * morphTargetInfluences[ 4 ];
			transformed += morphTarget5 * morphTargetInfluences[ 5 ];
			transformed += morphTarget6 * morphTargetInfluences[ 6 ];
			transformed += morphTarget7 * morphTargetInfluences[ 7 ];
		#endif
	#endif
#endif`,_M=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#ifdef USE_NORMALMAP_TANGENTSPACE
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal, vNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 geometryNormal = normal;`,vM=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,yM=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,EM=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,xM=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,bM=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,MM=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = geometryNormal;
#endif`,AM=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,SM=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,wM=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,TM=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha + 0.1;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,CM=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;
const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );
const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );
const float ShiftRight8 = 1. / 256.;
vec4 packDepthToRGBA( const in float v ) {
	vec4 r = vec4( fract( v * PackFactors ), v );
	r.yzw -= r.xyz * ShiftRight8;	return r * PackUpscale;
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors );
}
vec2 packDepthToRG( in highp float v ) {
	return packDepthToRGBA( v ).yx;
}
float unpackRGToDepth( const in highp vec2 v ) {
	return unpackRGBAToDepth( vec4( v.xy, 0.0, 0.0 ) );
}
vec4 pack2HalfToRGBA( vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,DM=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,RM=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,FM=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,PM=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,LM=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,IM=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,BM=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return shadow;
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
		vec3 lightToPosition = shadowCoord.xyz;
		float dp = ( length( lightToPosition ) - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );		dp += shadowBias;
		vec3 bd3D = normalize( lightToPosition );
		#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
			vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
			return (
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
				texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
			) * ( 1.0 / 9.0 );
		#else
			return texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
		#endif
	}
#endif`,UM=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,NM=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,OM=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,kM=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,zM=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	uniform int boneTextureSize;
	mat4 getBoneMatrix( const in float i ) {
		float j = i * 4.0;
		float x = mod( j, float( boneTextureSize ) );
		float y = floor( j / float( boneTextureSize ) );
		float dx = 1.0 / float( boneTextureSize );
		float dy = 1.0 / float( boneTextureSize );
		y = dy * ( y + 0.5 );
		vec4 v1 = texture2D( boneTexture, vec2( dx * ( x + 0.5 ), y ) );
		vec4 v2 = texture2D( boneTexture, vec2( dx * ( x + 1.5 ), y ) );
		vec4 v3 = texture2D( boneTexture, vec2( dx * ( x + 2.5 ), y ) );
		vec4 v4 = texture2D( boneTexture, vec2( dx * ( x + 3.5 ), y ) );
		mat4 bone = mat4( v1, v2, v3, v4 );
		return bone;
	}
#endif`,HM=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,$M=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,VM=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,GM=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,WM=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,XM=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return toneMappingExposure * color;
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 OptimizedCineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,jM=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmission = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmission.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmission.rgb, material.transmission );
#endif`,qM=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 applyVolumeAttenuation( const in vec3 radiance, const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return radiance;
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance * radiance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
		vec3 refractedRayExit = position + transmissionRay;
		vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
		vec2 refractionCoords = ndcPos.xy / ndcPos.w;
		refractionCoords += 1.0;
		refractionCoords /= 2.0;
		vec4 transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
		vec3 attenuatedColor = applyVolumeAttenuation( transmittedLight.rgb, length( transmissionRay ), attenuationColor, attenuationDistance );
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		return vec4( ( 1.0 - F ) * attenuatedColor * diffuseColor, transmittedLight.a );
	}
#endif`,KM=`#ifdef USE_UV
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,YM=`#ifdef USE_UV
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,JM=`#ifdef USE_UV
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,ZM=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const QM=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,eA=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <encodings_fragment>
}`,tA=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,nA=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <encodings_fragment>
}`,iA=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,sA=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <encodings_fragment>
}`,rA=`#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,oA=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#endif
}`,aA=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <skinbase_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,lA=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( 1.0 );
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,uA=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,cA=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <encodings_fragment>
}`,dA=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,hA=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,fA=`#include <common>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,pA=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,mA=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,gA=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,_A=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,vA=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,yA=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,EA=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), opacity );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,xA=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,bA=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,MA=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,AA=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecular;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometry.clearcoatNormal, geometry.viewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + clearcoatSpecular * material.clearcoat;
	#endif
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,SA=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,wA=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec4 diffuseColor = vec4( diffuse, opacity );
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,TA=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,CA=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,DA=`#include <common>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,RA=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
}`,FA=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
	vec2 scale;
	scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
	scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,PA=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
}`,Et={alphamap_fragment:sb,alphamap_pars_fragment:rb,alphatest_fragment:ob,alphatest_pars_fragment:ab,aomap_fragment:lb,aomap_pars_fragment:ub,begin_vertex:cb,beginnormal_vertex:db,bsdfs:hb,iridescence_fragment:fb,bumpmap_pars_fragment:pb,clipping_planes_fragment:mb,clipping_planes_pars_fragment:gb,clipping_planes_pars_vertex:_b,clipping_planes_vertex:vb,color_fragment:yb,color_pars_fragment:Eb,color_pars_vertex:xb,color_vertex:bb,common:Mb,cube_uv_reflection_fragment:Ab,defaultnormal_vertex:Sb,displacementmap_pars_vertex:wb,displacementmap_vertex:Tb,emissivemap_fragment:Cb,emissivemap_pars_fragment:Db,encodings_fragment:Rb,encodings_pars_fragment:Fb,envmap_fragment:Pb,envmap_common_pars_fragment:Lb,envmap_pars_fragment:Ib,envmap_pars_vertex:Bb,envmap_physical_pars_fragment:jb,envmap_vertex:Ub,fog_vertex:Nb,fog_pars_vertex:Ob,fog_fragment:kb,fog_pars_fragment:zb,gradientmap_pars_fragment:Hb,lightmap_fragment:$b,lightmap_pars_fragment:Vb,lights_lambert_fragment:Gb,lights_lambert_pars_fragment:Wb,lights_pars_begin:Xb,lights_toon_fragment:qb,lights_toon_pars_fragment:Kb,lights_phong_fragment:Yb,lights_phong_pars_fragment:Jb,lights_physical_fragment:Zb,lights_physical_pars_fragment:Qb,lights_fragment_begin:eM,lights_fragment_maps:tM,lights_fragment_end:nM,logdepthbuf_fragment:iM,logdepthbuf_pars_fragment:sM,logdepthbuf_pars_vertex:rM,logdepthbuf_vertex:oM,map_fragment:aM,map_pars_fragment:lM,map_particle_fragment:uM,map_particle_pars_fragment:cM,metalnessmap_fragment:dM,metalnessmap_pars_fragment:hM,morphcolor_vertex:fM,morphnormal_vertex:pM,morphtarget_pars_vertex:mM,morphtarget_vertex:gM,normal_fragment_begin:_M,normal_fragment_maps:vM,normal_pars_fragment:yM,normal_pars_vertex:EM,normal_vertex:xM,normalmap_pars_fragment:bM,clearcoat_normal_fragment_begin:MM,clearcoat_normal_fragment_maps:AM,clearcoat_pars_fragment:SM,iridescence_pars_fragment:wM,output_fragment:TM,packing:CM,premultiplied_alpha_fragment:DM,project_vertex:RM,dithering_fragment:FM,dithering_pars_fragment:PM,roughnessmap_fragment:LM,roughnessmap_pars_fragment:IM,shadowmap_pars_fragment:BM,shadowmap_pars_vertex:UM,shadowmap_vertex:NM,shadowmask_pars_fragment:OM,skinbase_vertex:kM,skinning_pars_vertex:zM,skinning_vertex:HM,skinnormal_vertex:$M,specularmap_fragment:VM,specularmap_pars_fragment:GM,tonemapping_fragment:WM,tonemapping_pars_fragment:XM,transmission_fragment:jM,transmission_pars_fragment:qM,uv_pars_fragment:KM,uv_pars_vertex:YM,uv_vertex:JM,worldpos_vertex:ZM,background_vert:QM,background_frag:eA,backgroundCube_vert:tA,backgroundCube_frag:nA,cube_vert:iA,cube_frag:sA,depth_vert:rA,depth_frag:oA,distanceRGBA_vert:aA,distanceRGBA_frag:lA,equirect_vert:uA,equirect_frag:cA,linedashed_vert:dA,linedashed_frag:hA,meshbasic_vert:fA,meshbasic_frag:pA,meshlambert_vert:mA,meshlambert_frag:gA,meshmatcap_vert:_A,meshmatcap_frag:vA,meshnormal_vert:yA,meshnormal_frag:EA,meshphong_vert:xA,meshphong_frag:bA,meshphysical_vert:MA,meshphysical_frag:AA,meshtoon_vert:SA,meshtoon_frag:wA,points_vert:TA,points_frag:CA,shadow_vert:DA,shadow_frag:RA,sprite_vert:FA,sprite_frag:PA},Xe={common:{diffuse:{value:new ut(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Mt},alphaMap:{value:null},alphaMapTransform:{value:new Mt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Mt}},envmap:{envMap:{value:null},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Mt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Mt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Mt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Mt},normalScale:{value:new Ue(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Mt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Mt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Mt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Mt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new ut(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new ut(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaTest:{value:0},uvTransform:{value:new Mt}},sprite:{diffuse:{value:new ut(16777215)},opacity:{value:1},center:{value:new Ue(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Mt},alphaMap:{value:null},alphaTest:{value:0}}},Ii={basic:{uniforms:Hn([Xe.common,Xe.specularmap,Xe.envmap,Xe.aomap,Xe.lightmap,Xe.fog]),vertexShader:Et.meshbasic_vert,fragmentShader:Et.meshbasic_frag},lambert:{uniforms:Hn([Xe.common,Xe.specularmap,Xe.envmap,Xe.aomap,Xe.lightmap,Xe.emissivemap,Xe.bumpmap,Xe.normalmap,Xe.displacementmap,Xe.fog,Xe.lights,{emissive:{value:new ut(0)}}]),vertexShader:Et.meshlambert_vert,fragmentShader:Et.meshlambert_frag},phong:{uniforms:Hn([Xe.common,Xe.specularmap,Xe.envmap,Xe.aomap,Xe.lightmap,Xe.emissivemap,Xe.bumpmap,Xe.normalmap,Xe.displacementmap,Xe.fog,Xe.lights,{emissive:{value:new ut(0)},specular:{value:new ut(1118481)},shininess:{value:30}}]),vertexShader:Et.meshphong_vert,fragmentShader:Et.meshphong_frag},standard:{uniforms:Hn([Xe.common,Xe.envmap,Xe.aomap,Xe.lightmap,Xe.emissivemap,Xe.bumpmap,Xe.normalmap,Xe.displacementmap,Xe.roughnessmap,Xe.metalnessmap,Xe.fog,Xe.lights,{emissive:{value:new ut(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Et.meshphysical_vert,fragmentShader:Et.meshphysical_frag},toon:{uniforms:Hn([Xe.common,Xe.aomap,Xe.lightmap,Xe.emissivemap,Xe.bumpmap,Xe.normalmap,Xe.displacementmap,Xe.gradientmap,Xe.fog,Xe.lights,{emissive:{value:new ut(0)}}]),vertexShader:Et.meshtoon_vert,fragmentShader:Et.meshtoon_frag},matcap:{uniforms:Hn([Xe.common,Xe.bumpmap,Xe.normalmap,Xe.displacementmap,Xe.fog,{matcap:{value:null}}]),vertexShader:Et.meshmatcap_vert,fragmentShader:Et.meshmatcap_frag},points:{uniforms:Hn([Xe.points,Xe.fog]),vertexShader:Et.points_vert,fragmentShader:Et.points_frag},dashed:{uniforms:Hn([Xe.common,Xe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Et.linedashed_vert,fragmentShader:Et.linedashed_frag},depth:{uniforms:Hn([Xe.common,Xe.displacementmap]),vertexShader:Et.depth_vert,fragmentShader:Et.depth_frag},normal:{uniforms:Hn([Xe.common,Xe.bumpmap,Xe.normalmap,Xe.displacementmap,{opacity:{value:1}}]),vertexShader:Et.meshnormal_vert,fragmentShader:Et.meshnormal_frag},sprite:{uniforms:Hn([Xe.sprite,Xe.fog]),vertexShader:Et.sprite_vert,fragmentShader:Et.sprite_frag},background:{uniforms:{uvTransform:{value:new Mt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Et.background_vert,fragmentShader:Et.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1}},vertexShader:Et.backgroundCube_vert,fragmentShader:Et.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Et.cube_vert,fragmentShader:Et.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Et.equirect_vert,fragmentShader:Et.equirect_frag},distanceRGBA:{uniforms:Hn([Xe.common,Xe.displacementmap,{referencePosition:{value:new L},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Et.distanceRGBA_vert,fragmentShader:Et.distanceRGBA_frag},shadow:{uniforms:Hn([Xe.lights,Xe.fog,{color:{value:new ut(0)},opacity:{value:1}}]),vertexShader:Et.shadow_vert,fragmentShader:Et.shadow_frag}};Ii.physical={uniforms:Hn([Ii.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Mt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Mt},clearcoatNormalScale:{value:new Ue(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Mt},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Mt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Mt},sheen:{value:0},sheenColor:{value:new ut(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Mt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Mt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Mt},transmissionSamplerSize:{value:new Ue},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Mt},attenuationDistance:{value:0},attenuationColor:{value:new ut(0)},specularColor:{value:new ut(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Mt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Mt}}]),vertexShader:Et.meshphysical_vert,fragmentShader:Et.meshphysical_frag};const Wa={r:0,b:0,g:0};function LA(n,e,t,i,s,r,o){const a=new ut(0);let l=r===!0?0:1,u,d,h=null,f=0,p=null;function g(_,m){let E=!1,y=m.isScene===!0?m.background:null;switch(y&&y.isTexture&&(y=(m.backgroundBlurriness>0?t:e).get(y)),y===null?v(a,l):y&&y.isColor&&(v(y,1),E=!0),n.xr.getEnvironmentBlendMode()){case"opaque":E=!0;break;case"additive":i.buffers.color.setClear(0,0,0,1,o),E=!0;break;case"alpha-blend":i.buffers.color.setClear(0,0,0,0,o),E=!0;break}(n.autoClear||E)&&n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil),y&&(y.isCubeTexture||y.mapping===Gl)?(d===void 0&&(d=new je(new mt(1,1,1),new fr({name:"BackgroundCubeMaterial",uniforms:mo(Ii.backgroundCube.uniforms),vertexShader:Ii.backgroundCube.vertexShader,fragmentShader:Ii.backgroundCube.fragmentShader,side:Yn,depthTest:!1,depthWrite:!1,fog:!1})),d.geometry.deleteAttribute("normal"),d.geometry.deleteAttribute("uv"),d.onBeforeRender=function(A,F,I){this.matrixWorld.copyPosition(I.matrixWorld)},Object.defineProperty(d.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(d)),d.material.uniforms.envMap.value=y,d.material.uniforms.flipEnvMap.value=y.isCubeTexture&&y.isRenderTargetTexture===!1?-1:1,d.material.uniforms.backgroundBlurriness.value=m.backgroundBlurriness,d.material.uniforms.backgroundIntensity.value=m.backgroundIntensity,d.material.toneMapped=y.colorSpace!==dt,(h!==y||f!==y.version||p!==n.toneMapping)&&(d.material.needsUpdate=!0,h=y,f=y.version,p=n.toneMapping),d.layers.enableAll(),_.unshift(d,d.geometry,d.material,0,0,null)):y&&y.isTexture&&(u===void 0&&(u=new je(new go(2,2),new fr({name:"BackgroundMaterial",uniforms:mo(Ii.background.uniforms),vertexShader:Ii.background.vertexShader,fragmentShader:Ii.background.fragmentShader,side:Oi,depthTest:!1,depthWrite:!1,fog:!1})),u.geometry.deleteAttribute("normal"),Object.defineProperty(u.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(u)),u.material.uniforms.t2D.value=y,u.material.uniforms.backgroundIntensity.value=m.backgroundIntensity,u.material.toneMapped=y.colorSpace!==dt,y.matrixAutoUpdate===!0&&y.updateMatrix(),u.material.uniforms.uvTransform.value.copy(y.matrix),(h!==y||f!==y.version||p!==n.toneMapping)&&(u.material.needsUpdate=!0,h=y,f=y.version,p=n.toneMapping),u.layers.enableAll(),_.unshift(u,u.geometry,u.material,0,0,null))}function v(_,m){_.getRGB(Wa,M0(n)),i.buffers.color.setClear(Wa.r,Wa.g,Wa.b,m,o)}return{getClearColor:function(){return a},setClearColor:function(_,m=1){a.set(_),l=m,v(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(_){l=_,v(a,l)},render:g}}function IA(n,e,t,i){const s=n.getParameter(n.MAX_VERTEX_ATTRIBS),r=i.isWebGL2?null:e.get("OES_vertex_array_object"),o=i.isWebGL2||r!==null,a={},l=_(null);let u=l,d=!1;function h(T,G,re,ae,C){let J=!1;if(o){const $=v(ae,re,G);u!==$&&(u=$,p(u.object)),J=m(T,ae,re,C),J&&E(T,ae,re,C)}else{const $=G.wireframe===!0;(u.geometry!==ae.id||u.program!==re.id||u.wireframe!==$)&&(u.geometry=ae.id,u.program=re.id,u.wireframe=$,J=!0)}C!==null&&t.update(C,n.ELEMENT_ARRAY_BUFFER),(J||d)&&(d=!1,I(T,G,re,ae),C!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,t.get(C).buffer))}function f(){return i.isWebGL2?n.createVertexArray():r.createVertexArrayOES()}function p(T){return i.isWebGL2?n.bindVertexArray(T):r.bindVertexArrayOES(T)}function g(T){return i.isWebGL2?n.deleteVertexArray(T):r.deleteVertexArrayOES(T)}function v(T,G,re){const ae=re.wireframe===!0;let C=a[T.id];C===void 0&&(C={},a[T.id]=C);let J=C[G.id];J===void 0&&(J={},C[G.id]=J);let $=J[ae];return $===void 0&&($=_(f()),J[ae]=$),$}function _(T){const G=[],re=[],ae=[];for(let C=0;C<s;C++)G[C]=0,re[C]=0,ae[C]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:G,enabledAttributes:re,attributeDivisors:ae,object:T,attributes:{},index:null}}function m(T,G,re,ae){const C=u.attributes,J=G.attributes;let $=0;const ee=re.getAttributes();for(const U in ee)if(ee[U].location>=0){const le=C[U];let Y=J[U];if(Y===void 0&&(U==="instanceMatrix"&&T.instanceMatrix&&(Y=T.instanceMatrix),U==="instanceColor"&&T.instanceColor&&(Y=T.instanceColor)),le===void 0||le.attribute!==Y||Y&&le.data!==Y.data)return!0;$++}return u.attributesNum!==$||u.index!==ae}function E(T,G,re,ae){const C={},J=G.attributes;let $=0;const ee=re.getAttributes();for(const U in ee)if(ee[U].location>=0){let le=J[U];le===void 0&&(U==="instanceMatrix"&&T.instanceMatrix&&(le=T.instanceMatrix),U==="instanceColor"&&T.instanceColor&&(le=T.instanceColor));const Y={};Y.attribute=le,le&&le.data&&(Y.data=le.data),C[U]=Y,$++}u.attributes=C,u.attributesNum=$,u.index=ae}function y(){const T=u.newAttributes;for(let G=0,re=T.length;G<re;G++)T[G]=0}function x(T){M(T,0)}function M(T,G){const re=u.newAttributes,ae=u.enabledAttributes,C=u.attributeDivisors;re[T]=1,ae[T]===0&&(n.enableVertexAttribArray(T),ae[T]=1),C[T]!==G&&((i.isWebGL2?n:e.get("ANGLE_instanced_arrays"))[i.isWebGL2?"vertexAttribDivisor":"vertexAttribDivisorANGLE"](T,G),C[T]=G)}function A(){const T=u.newAttributes,G=u.enabledAttributes;for(let re=0,ae=G.length;re<ae;re++)G[re]!==T[re]&&(n.disableVertexAttribArray(re),G[re]=0)}function F(T,G,re,ae,C,J){i.isWebGL2===!0&&(re===n.INT||re===n.UNSIGNED_INT)?n.vertexAttribIPointer(T,G,re,C,J):n.vertexAttribPointer(T,G,re,ae,C,J)}function I(T,G,re,ae){if(i.isWebGL2===!1&&(T.isInstancedMesh||ae.isInstancedBufferGeometry)&&e.get("ANGLE_instanced_arrays")===null)return;y();const C=ae.attributes,J=re.getAttributes(),$=G.defaultAttributeValues;for(const ee in J){const U=J[ee];if(U.location>=0){let N=C[ee];if(N===void 0&&(ee==="instanceMatrix"&&T.instanceMatrix&&(N=T.instanceMatrix),ee==="instanceColor"&&T.instanceColor&&(N=T.instanceColor)),N!==void 0){const le=N.normalized,Y=N.itemSize,ce=t.get(N);if(ce===void 0)continue;const O=ce.buffer,Fe=ce.type,Oe=ce.bytesPerElement;if(N.isInterleavedBufferAttribute){const Pe=N.data,Ne=Pe.stride,P=N.offset;if(Pe.isInstancedInterleavedBuffer){for(let k=0;k<U.locationSize;k++)M(U.location+k,Pe.meshPerAttribute);T.isInstancedMesh!==!0&&ae._maxInstanceCount===void 0&&(ae._maxInstanceCount=Pe.meshPerAttribute*Pe.count)}else for(let k=0;k<U.locationSize;k++)x(U.location+k);n.bindBuffer(n.ARRAY_BUFFER,O);for(let k=0;k<U.locationSize;k++)F(U.location+k,Y/U.locationSize,Fe,le,Ne*Oe,(P+Y/U.locationSize*k)*Oe)}else{if(N.isInstancedBufferAttribute){for(let Pe=0;Pe<U.locationSize;Pe++)M(U.location+Pe,N.meshPerAttribute);T.isInstancedMesh!==!0&&ae._maxInstanceCount===void 0&&(ae._maxInstanceCount=N.meshPerAttribute*N.count)}else for(let Pe=0;Pe<U.locationSize;Pe++)x(U.location+Pe);n.bindBuffer(n.ARRAY_BUFFER,O);for(let Pe=0;Pe<U.locationSize;Pe++)F(U.location+Pe,Y/U.locationSize,Fe,le,Y*Oe,Y/U.locationSize*Pe*Oe)}}else if($!==void 0){const le=$[ee];if(le!==void 0)switch(le.length){case 2:n.vertexAttrib2fv(U.location,le);break;case 3:n.vertexAttrib3fv(U.location,le);break;case 4:n.vertexAttrib4fv(U.location,le);break;default:n.vertexAttrib1fv(U.location,le)}}}}A()}function b(){X();for(const T in a){const G=a[T];for(const re in G){const ae=G[re];for(const C in ae)g(ae[C].object),delete ae[C];delete G[re]}delete a[T]}}function w(T){if(a[T.id]===void 0)return;const G=a[T.id];for(const re in G){const ae=G[re];for(const C in ae)g(ae[C].object),delete ae[C];delete G[re]}delete a[T.id]}function oe(T){for(const G in a){const re=a[G];if(re[T.id]===void 0)continue;const ae=re[T.id];for(const C in ae)g(ae[C].object),delete ae[C];delete re[T.id]}}function X(){z(),d=!0,u!==l&&(u=l,p(u.object))}function z(){l.geometry=null,l.program=null,l.wireframe=!1}return{setup:h,reset:X,resetDefaultState:z,dispose:b,releaseStatesOfGeometry:w,releaseStatesOfProgram:oe,initAttributes:y,enableAttribute:x,disableUnusedAttributes:A}}function BA(n,e,t,i){const s=i.isWebGL2;let r;function o(u){r=u}function a(u,d){n.drawArrays(r,u,d),t.update(d,r,1)}function l(u,d,h){if(h===0)return;let f,p;if(s)f=n,p="drawArraysInstanced";else if(f=e.get("ANGLE_instanced_arrays"),p="drawArraysInstancedANGLE",f===null){console.error("THREE.WebGLBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}f[p](r,u,d,h),t.update(d,r,h)}this.setMode=o,this.render=a,this.renderInstances=l}function UA(n,e,t){let i;function s(){if(i!==void 0)return i;if(e.has("EXT_texture_filter_anisotropic")===!0){const F=e.get("EXT_texture_filter_anisotropic");i=n.getParameter(F.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function r(F){if(F==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";F="mediump"}return F==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}const o=typeof WebGL2RenderingContext!="undefined"&&n.constructor.name==="WebGL2RenderingContext";let a=t.precision!==void 0?t.precision:"highp";const l=r(a);l!==a&&(console.warn("THREE.WebGLRenderer:",a,"not supported, using",l,"instead."),a=l);const u=o||e.has("WEBGL_draw_buffers"),d=t.logarithmicDepthBuffer===!0,h=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),f=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),p=n.getParameter(n.MAX_TEXTURE_SIZE),g=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),v=n.getParameter(n.MAX_VERTEX_ATTRIBS),_=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),m=n.getParameter(n.MAX_VARYING_VECTORS),E=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),y=f>0,x=o||e.has("OES_texture_float"),M=y&&x,A=o?n.getParameter(n.MAX_SAMPLES):0;return{isWebGL2:o,drawBuffers:u,getMaxAnisotropy:s,getMaxPrecision:r,precision:a,logarithmicDepthBuffer:d,maxTextures:h,maxVertexTextures:f,maxTextureSize:p,maxCubemapSize:g,maxAttributes:v,maxVertexUniforms:_,maxVaryings:m,maxFragmentUniforms:E,vertexTextures:y,floatFragmentTextures:x,floatVertexTextures:M,maxSamples:A}}function NA(n){const e=this;let t=null,i=0,s=!1,r=!1;const o=new qs,a=new Mt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,f){const p=h.length!==0||f||i!==0||s;return s=f,i=h.length,p},this.beginShadows=function(){r=!0,d(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(h,f){t=d(h,f,0)},this.setState=function(h,f,p){const g=h.clippingPlanes,v=h.clipIntersection,_=h.clipShadows,m=n.get(h);if(!s||g===null||g.length===0||r&&!_)r?d(null):u();else{const E=r?0:i,y=E*4;let x=m.clippingState||null;l.value=x,x=d(g,f,y,p);for(let M=0;M!==y;++M)x[M]=t[M];m.clippingState=x,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=E}};function u(){l.value!==t&&(l.value=t,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function d(h,f,p,g){const v=h!==null?h.length:0;let _=null;if(v!==0){if(_=l.value,g!==!0||_===null){const m=p+v*4,E=f.matrixWorldInverse;a.getNormalMatrix(E),(_===null||_.length<m)&&(_=new Float32Array(m));for(let y=0,x=p;y!==v;++y,x+=4)o.copy(h[y]).applyMatrix4(E,a),o.normal.toArray(_,x),_[x+3]=o.constant}l.value=_,l.needsUpdate=!0}return e.numPlanes=v,e.numIntersection=0,_}}function OA(n){let e=new WeakMap;function t(o,a){return a===pc?o.mapping=uo:a===mc&&(o.mapping=co),o}function i(o){if(o&&o.isTexture&&o.isRenderTargetTexture===!1){const a=o.mapping;if(a===pc||a===mc)if(e.has(o)){const l=e.get(o).texture;return t(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const u=new eb(l.height/2);return u.fromEquirectangularTexture(n,o),e.set(o,u),o.addEventListener("dispose",s),t(u.texture,o.mapping)}else return null}}return o}function s(o){const a=o.target;a.removeEventListener("dispose",s);const l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function r(){e=new WeakMap}return{get:i,dispose:r}}class dd extends A0{constructor(e=-1,t=1,i=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=i-e,o=i+e,a=s+t,l=s-t;if(this.view!==null&&this.view.enabled){const u=(this.right-this.left)/this.view.fullWidth/this.zoom,d=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=u*this.view.offsetX,o=r+u*this.view.width,a-=d*this.view.offsetY,l=a-d*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}const Kr=4,Sf=[.125,.215,.35,.446,.526,.582],er=20,Iu=new dd,wf=new ut;let Bu=null;const Ks=(1+Math.sqrt(5))/2,Or=1/Ks,Tf=[new L(1,1,1),new L(-1,1,1),new L(1,1,-1),new L(-1,1,-1),new L(0,Ks,Or),new L(0,Ks,-Or),new L(Or,0,Ks),new L(-Or,0,Ks),new L(Ks,Or,0),new L(-Ks,Or,0)];class Cf{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,i=.1,s=100){Bu=this._renderer.getRenderTarget(),this._setSize(256);const r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(e,i,s,r),t>0&&this._blur(r,0,0,t),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Ff(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Rf(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Bu),e.scissorTest=!1,Xa(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===uo||e.mapping===co?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Bu=this._renderer.getRenderTarget();const i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:qn,minFilter:qn,generateMipmaps:!1,type:ua,format:fi,colorSpace:ki,depthBuffer:!1},s=Df(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Df(e,t,i);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=kA(r)),this._blurMaterial=zA(r,e,t)}return s}_compileMaterial(e){const t=new je(this._lodPlanes[0],e);this._renderer.compile(t,Iu)}_sceneToCubeUV(e,t,i,s){const a=new Fn(90,1,t,i),l=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],d=this._renderer,h=d.autoClear,f=d.toneMapping;d.getClearColor(wf),d.toneMapping=rs,d.autoClear=!1;const p=new Vn({name:"PMREM.Background",side:Yn,depthWrite:!1,depthTest:!1}),g=new je(new mt,p);let v=!1;const _=e.background;_?_.isColor&&(p.color.copy(_),e.background=null,v=!0):(p.color.copy(wf),v=!0);for(let m=0;m<6;m++){const E=m%3;E===0?(a.up.set(0,l[m],0),a.lookAt(u[m],0,0)):E===1?(a.up.set(0,0,l[m]),a.lookAt(0,u[m],0)):(a.up.set(0,l[m],0),a.lookAt(0,0,u[m]));const y=this._cubeSize;Xa(s,E*y,m>2?y:0,y,y),d.setRenderTarget(s),v&&d.render(g,a),d.render(e,a)}g.geometry.dispose(),g.material.dispose(),d.toneMapping=f,d.autoClear=h,e.background=_}_textureToCubeUV(e,t){const i=this._renderer,s=e.mapping===uo||e.mapping===co;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Ff()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Rf());const r=s?this._cubemapMaterial:this._equirectMaterial,o=new je(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=e;const l=this._cubeSize;Xa(t,0,0,3*l,2*l),i.setRenderTarget(t),i.render(o,Iu)}_applyPMREM(e){const t=this._renderer,i=t.autoClear;t.autoClear=!1;for(let s=1;s<this._lodPlanes.length;s++){const r=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),o=Tf[(s-1)%Tf.length];this._blur(e,s-1,s,r,o)}t.autoClear=i}_blur(e,t,i,s,r){const o=this._pingPongRenderTarget;this._halfBlur(e,o,t,i,s,"latitudinal",r),this._halfBlur(o,e,i,i,s,"longitudinal",r)}_halfBlur(e,t,i,s,r,o,a){const l=this._renderer,u=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const d=3,h=new je(this._lodPlanes[s],u),f=u.uniforms,p=this._sizeLods[i]-1,g=isFinite(r)?Math.PI/(2*p):2*Math.PI/(2*er-1),v=r/g,_=isFinite(r)?1+Math.floor(d*v):er;_>er&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${_} samples when the maximum is set to ${er}`);const m=[];let E=0;for(let F=0;F<er;++F){const I=F/v,b=Math.exp(-I*I/2);m.push(b),F===0?E+=b:F<_&&(E+=2*b)}for(let F=0;F<m.length;F++)m[F]=m[F]/E;f.envMap.value=e.texture,f.samples.value=_,f.weights.value=m,f.latitudinal.value=o==="latitudinal",a&&(f.poleAxis.value=a);const{_lodMax:y}=this;f.dTheta.value=g,f.mipInt.value=y-i;const x=this._sizeLods[s],M=3*x*(s>y-Kr?s-y+Kr:0),A=4*(this._cubeSize-x);Xa(t,M,A,3*x,2*x),l.setRenderTarget(t),l.render(h,Iu)}}function kA(n){const e=[],t=[],i=[];let s=n;const r=n-Kr+1+Sf.length;for(let o=0;o<r;o++){const a=Math.pow(2,s);t.push(a);let l=1/a;o>n-Kr?l=Sf[o-n+Kr-1]:o===0&&(l=0),i.push(l);const u=1/(a-2),d=-u,h=1+u,f=[d,d,h,d,h,h,d,d,h,h,d,h],p=6,g=6,v=3,_=2,m=1,E=new Float32Array(v*g*p),y=new Float32Array(_*g*p),x=new Float32Array(m*g*p);for(let A=0;A<p;A++){const F=A%3*2/3-1,I=A>2?0:-1,b=[F,I,0,F+2/3,I,0,F+2/3,I+1,0,F,I,0,F+2/3,I+1,0,F,I+1,0];E.set(b,v*g*A),y.set(f,_*g*A);const w=[A,A,A,A,A,A];x.set(w,m*g*A)}const M=new Zt;M.setAttribute("position",new In(E,v)),M.setAttribute("uv",new In(y,_)),M.setAttribute("faceIndex",new In(x,m)),e.push(M),s>Kr&&s--}return{lodPlanes:e,sizeLods:t,sigmas:i}}function Df(n,e,t){const i=new hr(n,e,t);return i.texture.mapping=Gl,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Xa(n,e,t,i,s){n.viewport.set(e,t,i,s),n.scissor.set(e,t,i,s)}function zA(n,e,t){const i=new Float32Array(er),s=new L(0,1,0);return new fr({name:"SphericalGaussianBlur",defines:{n:er,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:hd(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Is,depthTest:!1,depthWrite:!1})}function Rf(){return new fr({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:hd(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Is,depthTest:!1,depthWrite:!1})}function Ff(){return new fr({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:hd(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Is,depthTest:!1,depthWrite:!1})}function hd(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function HA(n){let e=new WeakMap,t=null;function i(a){if(a&&a.isTexture){const l=a.mapping,u=l===pc||l===mc,d=l===uo||l===co;if(u||d)if(a.isRenderTargetTexture&&a.needsPMREMUpdate===!0){a.needsPMREMUpdate=!1;let h=e.get(a);return t===null&&(t=new Cf(n)),h=u?t.fromEquirectangular(a,h):t.fromCubemap(a,h),e.set(a,h),h.texture}else{if(e.has(a))return e.get(a).texture;{const h=a.image;if(u&&h&&h.height>0||d&&h&&s(h)){t===null&&(t=new Cf(n));const f=u?t.fromEquirectangular(a):t.fromCubemap(a);return e.set(a,f),a.addEventListener("dispose",r),f.texture}else return null}}}return a}function s(a){let l=0;const u=6;for(let d=0;d<u;d++)a[d]!==void 0&&l++;return l===u}function r(a){const l=a.target;l.removeEventListener("dispose",r);const u=e.get(l);u!==void 0&&(e.delete(l),u.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:i,dispose:o}}function $A(n){const e={};function t(i){if(e[i]!==void 0)return e[i];let s;switch(i){case"WEBGL_depth_texture":s=n.getExtension("WEBGL_depth_texture")||n.getExtension("MOZ_WEBGL_depth_texture")||n.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=n.getExtension("EXT_texture_filter_anisotropic")||n.getExtension("MOZ_EXT_texture_filter_anisotropic")||n.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=n.getExtension("WEBGL_compressed_texture_s3tc")||n.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=n.getExtension("WEBGL_compressed_texture_pvrtc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=n.getExtension(i)}return e[i]=s,s}return{has:function(i){return t(i)!==null},init:function(i){i.isWebGL2?t("EXT_color_buffer_float"):(t("WEBGL_depth_texture"),t("OES_texture_float"),t("OES_texture_half_float"),t("OES_texture_half_float_linear"),t("OES_standard_derivatives"),t("OES_element_index_uint"),t("OES_vertex_array_object"),t("ANGLE_instanced_arrays")),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture")},get:function(i){const s=t(i);return s===null&&console.warn("THREE.WebGLRenderer: "+i+" extension not supported."),s}}}function VA(n,e,t,i){const s={},r=new WeakMap;function o(h){const f=h.target;f.index!==null&&e.remove(f.index);for(const g in f.attributes)e.remove(f.attributes[g]);f.removeEventListener("dispose",o),delete s[f.id];const p=r.get(f);p&&(e.remove(p),r.delete(f)),i.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,t.memory.geometries--}function a(h,f){return s[f.id]===!0||(f.addEventListener("dispose",o),s[f.id]=!0,t.memory.geometries++),f}function l(h){const f=h.attributes;for(const g in f)e.update(f[g],n.ARRAY_BUFFER);const p=h.morphAttributes;for(const g in p){const v=p[g];for(let _=0,m=v.length;_<m;_++)e.update(v[_],n.ARRAY_BUFFER)}}function u(h){const f=[],p=h.index,g=h.attributes.position;let v=0;if(p!==null){const E=p.array;v=p.version;for(let y=0,x=E.length;y<x;y+=3){const M=E[y+0],A=E[y+1],F=E[y+2];f.push(M,A,A,F,F,M)}}else{const E=g.array;v=g.version;for(let y=0,x=E.length/3-1;y<x;y+=3){const M=y+0,A=y+1,F=y+2;f.push(M,A,A,F,F,M)}}const _=new(g0(f)?b0:x0)(f,1);_.version=v;const m=r.get(h);m&&e.remove(m),r.set(h,_)}function d(h){const f=r.get(h);if(f){const p=h.index;p!==null&&f.version<p.version&&u(h)}else u(h);return r.get(h)}return{get:a,update:l,getWireframeAttribute:d}}function GA(n,e,t,i){const s=i.isWebGL2;let r;function o(f){r=f}let a,l;function u(f){a=f.type,l=f.bytesPerElement}function d(f,p){n.drawElements(r,p,a,f*l),t.update(p,r,1)}function h(f,p,g){if(g===0)return;let v,_;if(s)v=n,_="drawElementsInstanced";else if(v=e.get("ANGLE_instanced_arrays"),_="drawElementsInstancedANGLE",v===null){console.error("THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.");return}v[_](r,p,a,f*l,g),t.update(p,r,g)}this.setMode=o,this.setIndex=u,this.render=d,this.renderInstances=h}function WA(n){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,o,a){switch(t.calls++,o){case n.TRIANGLES:t.triangles+=a*(r/3);break;case n.LINES:t.lines+=a*(r/2);break;case n.LINE_STRIP:t.lines+=a*(r-1);break;case n.LINE_LOOP:t.lines+=a*r;break;case n.POINTS:t.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function s(){t.frame++,t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:i}}function XA(n,e){return n[0]-e[0]}function jA(n,e){return Math.abs(e[1])-Math.abs(n[1])}function qA(n,e,t){const i={},s=new Float32Array(8),r=new WeakMap,o=new Ot,a=[];for(let u=0;u<8;u++)a[u]=[u,0];function l(u,d,h){const f=u.morphTargetInfluences;if(e.isWebGL2===!0){const g=d.morphAttributes.position||d.morphAttributes.normal||d.morphAttributes.color,v=g!==void 0?g.length:0;let _=r.get(d);if(_===void 0||_.count!==v){let G=function(){z.dispose(),r.delete(d),d.removeEventListener("dispose",G)};var p=G;_!==void 0&&_.texture.dispose();const y=d.morphAttributes.position!==void 0,x=d.morphAttributes.normal!==void 0,M=d.morphAttributes.color!==void 0,A=d.morphAttributes.position||[],F=d.morphAttributes.normal||[],I=d.morphAttributes.color||[];let b=0;y===!0&&(b=1),x===!0&&(b=2),M===!0&&(b=3);let w=d.attributes.position.count*b,oe=1;w>e.maxTextureSize&&(oe=Math.ceil(w/e.maxTextureSize),w=e.maxTextureSize);const X=new Float32Array(w*oe*4*v),z=new y0(X,w,oe,v);z.type=Ds,z.needsUpdate=!0;const T=b*4;for(let re=0;re<v;re++){const ae=A[re],C=F[re],J=I[re],$=w*oe*4*re;for(let ee=0;ee<ae.count;ee++){const U=ee*T;y===!0&&(o.fromBufferAttribute(ae,ee),X[$+U+0]=o.x,X[$+U+1]=o.y,X[$+U+2]=o.z,X[$+U+3]=0),x===!0&&(o.fromBufferAttribute(C,ee),X[$+U+4]=o.x,X[$+U+5]=o.y,X[$+U+6]=o.z,X[$+U+7]=0),M===!0&&(o.fromBufferAttribute(J,ee),X[$+U+8]=o.x,X[$+U+9]=o.y,X[$+U+10]=o.z,X[$+U+11]=J.itemSize===4?o.w:1)}}_={count:v,texture:z,size:new Ue(w,oe)},r.set(d,_),d.addEventListener("dispose",G)}let m=0;for(let y=0;y<f.length;y++)m+=f[y];const E=d.morphTargetsRelative?1:1-m;h.getUniforms().setValue(n,"morphTargetBaseInfluence",E),h.getUniforms().setValue(n,"morphTargetInfluences",f),h.getUniforms().setValue(n,"morphTargetsTexture",_.texture,t),h.getUniforms().setValue(n,"morphTargetsTextureSize",_.size)}else{const g=f===void 0?0:f.length;let v=i[d.id];if(v===void 0||v.length!==g){v=[];for(let x=0;x<g;x++)v[x]=[x,0];i[d.id]=v}for(let x=0;x<g;x++){const M=v[x];M[0]=x,M[1]=f[x]}v.sort(jA);for(let x=0;x<8;x++)x<g&&v[x][1]?(a[x][0]=v[x][0],a[x][1]=v[x][1]):(a[x][0]=Number.MAX_SAFE_INTEGER,a[x][1]=0);a.sort(XA);const _=d.morphAttributes.position,m=d.morphAttributes.normal;let E=0;for(let x=0;x<8;x++){const M=a[x],A=M[0],F=M[1];A!==Number.MAX_SAFE_INTEGER&&F?(_&&d.getAttribute("morphTarget"+x)!==_[A]&&d.setAttribute("morphTarget"+x,_[A]),m&&d.getAttribute("morphNormal"+x)!==m[A]&&d.setAttribute("morphNormal"+x,m[A]),s[x]=F,E+=F):(_&&d.hasAttribute("morphTarget"+x)===!0&&d.deleteAttribute("morphTarget"+x),m&&d.hasAttribute("morphNormal"+x)===!0&&d.deleteAttribute("morphNormal"+x),s[x]=0)}const y=d.morphTargetsRelative?1:1-E;h.getUniforms().setValue(n,"morphTargetBaseInfluence",y),h.getUniforms().setValue(n,"morphTargetInfluences",s)}}return{update:l}}function KA(n,e,t,i){let s=new WeakMap;function r(l){const u=i.render.frame,d=l.geometry,h=e.get(l,d);return s.get(h)!==u&&(e.update(h),s.set(h,u)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),t.update(l.instanceMatrix,n.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,n.ARRAY_BUFFER)),h}function o(){s=new WeakMap}function a(l){const u=l.target;u.removeEventListener("dispose",a),t.remove(u.instanceMatrix),u.instanceColor!==null&&t.remove(u.instanceColor)}return{update:r,dispose:o}}const T0=new vn,C0=new y0,D0=new O2,R0=new S0,Pf=[],Lf=[],If=new Float32Array(16),Bf=new Float32Array(9),Uf=new Float32Array(4);function bo(n,e,t){const i=n[0];if(i<=0||i>0)return n;const s=e*t;let r=Pf[s];if(r===void 0&&(r=new Float32Array(s),Pf[s]=r),e!==0){i.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,n[o].toArray(r,a)}return r}function cn(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function dn(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function Xl(n,e){let t=Lf[e];t===void 0&&(t=new Int32Array(e),Lf[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function YA(n,e){const t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function JA(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(cn(t,e))return;n.uniform2fv(this.addr,e),dn(t,e)}}function ZA(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(cn(t,e))return;n.uniform3fv(this.addr,e),dn(t,e)}}function QA(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(cn(t,e))return;n.uniform4fv(this.addr,e),dn(t,e)}}function e5(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(cn(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),dn(t,e)}else{if(cn(t,i))return;Uf.set(i),n.uniformMatrix2fv(this.addr,!1,Uf),dn(t,i)}}function t5(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(cn(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),dn(t,e)}else{if(cn(t,i))return;Bf.set(i),n.uniformMatrix3fv(this.addr,!1,Bf),dn(t,i)}}function n5(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(cn(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),dn(t,e)}else{if(cn(t,i))return;If.set(i),n.uniformMatrix4fv(this.addr,!1,If),dn(t,i)}}function i5(n,e){const t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function s5(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(cn(t,e))return;n.uniform2iv(this.addr,e),dn(t,e)}}function r5(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(cn(t,e))return;n.uniform3iv(this.addr,e),dn(t,e)}}function o5(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(cn(t,e))return;n.uniform4iv(this.addr,e),dn(t,e)}}function a5(n,e){const t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function l5(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(cn(t,e))return;n.uniform2uiv(this.addr,e),dn(t,e)}}function u5(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(cn(t,e))return;n.uniform3uiv(this.addr,e),dn(t,e)}}function c5(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(cn(t,e))return;n.uniform4uiv(this.addr,e),dn(t,e)}}function d5(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture2D(e||T0,s)}function h5(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture3D(e||D0,s)}function f5(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTextureCube(e||R0,s)}function p5(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture2DArray(e||C0,s)}function m5(n){switch(n){case 5126:return YA;case 35664:return JA;case 35665:return ZA;case 35666:return QA;case 35674:return e5;case 35675:return t5;case 35676:return n5;case 5124:case 35670:return i5;case 35667:case 35671:return s5;case 35668:case 35672:return r5;case 35669:case 35673:return o5;case 5125:return a5;case 36294:return l5;case 36295:return u5;case 36296:return c5;case 35678:case 36198:case 36298:case 36306:case 35682:return d5;case 35679:case 36299:case 36307:return h5;case 35680:case 36300:case 36308:case 36293:return f5;case 36289:case 36303:case 36311:case 36292:return p5}}function g5(n,e){n.uniform1fv(this.addr,e)}function _5(n,e){const t=bo(e,this.size,2);n.uniform2fv(this.addr,t)}function v5(n,e){const t=bo(e,this.size,3);n.uniform3fv(this.addr,t)}function y5(n,e){const t=bo(e,this.size,4);n.uniform4fv(this.addr,t)}function E5(n,e){const t=bo(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function x5(n,e){const t=bo(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function b5(n,e){const t=bo(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function M5(n,e){n.uniform1iv(this.addr,e)}function A5(n,e){n.uniform2iv(this.addr,e)}function S5(n,e){n.uniform3iv(this.addr,e)}function w5(n,e){n.uniform4iv(this.addr,e)}function T5(n,e){n.uniform1uiv(this.addr,e)}function C5(n,e){n.uniform2uiv(this.addr,e)}function D5(n,e){n.uniform3uiv(this.addr,e)}function R5(n,e){n.uniform4uiv(this.addr,e)}function F5(n,e,t){const i=this.cache,s=e.length,r=Xl(t,s);cn(i,r)||(n.uniform1iv(this.addr,r),dn(i,r));for(let o=0;o!==s;++o)t.setTexture2D(e[o]||T0,r[o])}function P5(n,e,t){const i=this.cache,s=e.length,r=Xl(t,s);cn(i,r)||(n.uniform1iv(this.addr,r),dn(i,r));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||D0,r[o])}function L5(n,e,t){const i=this.cache,s=e.length,r=Xl(t,s);cn(i,r)||(n.uniform1iv(this.addr,r),dn(i,r));for(let o=0;o!==s;++o)t.setTextureCube(e[o]||R0,r[o])}function I5(n,e,t){const i=this.cache,s=e.length,r=Xl(t,s);cn(i,r)||(n.uniform1iv(this.addr,r),dn(i,r));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||C0,r[o])}function B5(n){switch(n){case 5126:return g5;case 35664:return _5;case 35665:return v5;case 35666:return y5;case 35674:return E5;case 35675:return x5;case 35676:return b5;case 5124:case 35670:return M5;case 35667:case 35671:return A5;case 35668:case 35672:return S5;case 35669:case 35673:return w5;case 5125:return T5;case 36294:return C5;case 36295:return D5;case 36296:return R5;case 35678:case 36198:case 36298:case 36306:case 35682:return F5;case 35679:case 36299:case 36307:return P5;case 35680:case 36300:case 36308:case 36293:return L5;case 36289:case 36303:case 36311:case 36292:return I5}}class U5{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.setValue=m5(t.type)}}class N5{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.size=t.size,this.setValue=B5(t.type)}}class O5{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){const s=this.seq;for(let r=0,o=s.length;r!==o;++r){const a=s[r];a.setValue(e,t[a.id],i)}}}const Uu=/(\w+)(\])?(\[|\.)?/g;function Nf(n,e){n.seq.push(e),n.map[e.id]=e}function k5(n,e,t){const i=n.name,s=i.length;for(Uu.lastIndex=0;;){const r=Uu.exec(i),o=Uu.lastIndex;let a=r[1];const l=r[2]==="]",u=r[3];if(l&&(a=a|0),u===void 0||u==="["&&o+2===s){Nf(t,u===void 0?new U5(a,n,e):new N5(a,n,e));break}else{let h=t.map[a];h===void 0&&(h=new O5(a),Nf(t,h)),t=h}}}class hl{constructor(e,t){this.seq=[],this.map={};const i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<i;++s){const r=e.getActiveUniform(t,s),o=e.getUniformLocation(t,r.name);k5(r,o,this)}}setValue(e,t,i,s){const r=this.map[t];r!==void 0&&r.setValue(e,i,s)}setOptional(e,t,i){const s=t[i];s!==void 0&&this.setValue(e,i,s)}static upload(e,t,i,s){for(let r=0,o=t.length;r!==o;++r){const a=t[r],l=i[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,s)}}static seqWithValue(e,t){const i=[];for(let s=0,r=e.length;s!==r;++s){const o=e[s];o.id in t&&i.push(o)}return i}}function Of(n,e,t){const i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}let z5=0;function H5(n,e){const t=n.split(`
`),i=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=s;o<r;o++){const a=o+1;i.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return i.join(`
`)}function $5(n){switch(n){case ki:return["Linear","( value )"];case dt:return["sRGB","( value )"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",n),["Linear","( value )"]}}function kf(n,e,t){const i=n.getShaderParameter(e,n.COMPILE_STATUS),s=n.getShaderInfoLog(e).trim();if(i&&s==="")return"";const r=/ERROR: 0:(\d+)/.exec(s);if(r){const o=parseInt(r[1]);return t.toUpperCase()+`

`+s+`

`+H5(n.getShaderSource(e),o)}else return s}function V5(n,e){const t=$5(e);return"vec4 "+n+"( vec4 value ) { return LinearTo"+t[0]+t[1]+"; }"}function G5(n,e){let t;switch(e){case jx:t="Linear";break;case qx:t="Reinhard";break;case Kx:t="OptimizedCineon";break;case ad:t="ACESFilmic";break;case Yx:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}function W5(n){return[n.extensionDerivatives||!!n.envMapCubeUVHeight||n.bumpMap||n.normalMapTangentSpace||n.clearcoatNormalMap||n.flatShading||n.shaderID==="physical"?"#extension GL_OES_standard_derivatives : enable":"",(n.extensionFragDepth||n.logarithmicDepthBuffer)&&n.rendererExtensionFragDepth?"#extension GL_EXT_frag_depth : enable":"",n.extensionDrawBuffers&&n.rendererExtensionDrawBuffers?"#extension GL_EXT_draw_buffers : require":"",(n.extensionShaderTextureLOD||n.envMap||n.transmission)&&n.rendererExtensionShaderTextureLod?"#extension GL_EXT_shader_texture_lod : enable":""].filter($o).join(`
`)}function X5(n){const e=[];for(const t in n){const i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function j5(n,e){const t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){const r=n.getActiveAttrib(e,s),o=r.name;let a=1;r.type===n.FLOAT_MAT2&&(a=2),r.type===n.FLOAT_MAT3&&(a=3),r.type===n.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:n.getAttribLocation(e,o),locationSize:a}}return t}function $o(n){return n!==""}function zf(n,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Hf(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const q5=/^[ \t]*#include +<([\w\d./]+)>/gm;function Ec(n){return n.replace(q5,K5)}function K5(n,e){const t=Et[e];if(t===void 0)throw new Error("Can not resolve #include <"+e+">");return Ec(t)}const Y5=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function $f(n){return n.replace(Y5,J5)}function J5(n,e,t,i){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Vf(n){let e="precision "+n.precision+` float;
precision `+n.precision+" int;";return n.precision==="highp"?e+=`
#define HIGH_PRECISION`:n.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function Z5(n){let e="SHADOWMAP_TYPE_BASIC";return n.shadowMapType===i0?e="SHADOWMAP_TYPE_PCF":n.shadowMapType===od?e="SHADOWMAP_TYPE_PCF_SOFT":n.shadowMapType===ts&&(e="SHADOWMAP_TYPE_VSM"),e}function Q5(n){let e="ENVMAP_TYPE_CUBE";if(n.envMap)switch(n.envMapMode){case uo:case co:e="ENVMAP_TYPE_CUBE";break;case Gl:e="ENVMAP_TYPE_CUBE_UV";break}return e}function eS(n){let e="ENVMAP_MODE_REFLECTION";if(n.envMap)switch(n.envMapMode){case co:e="ENVMAP_MODE_REFRACTION";break}return e}function tS(n){let e="ENVMAP_BLENDING_NONE";if(n.envMap)switch(n.combine){case o0:e="ENVMAP_BLENDING_MULTIPLY";break;case Wx:e="ENVMAP_BLENDING_MIX";break;case Xx:e="ENVMAP_BLENDING_ADD";break}return e}function nS(n){const e=n.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),7*16)),texelHeight:i,maxMip:t}}function iS(n,e,t,i){const s=n.getContext(),r=t.defines;let o=t.vertexShader,a=t.fragmentShader;const l=Z5(t),u=Q5(t),d=eS(t),h=tS(t),f=nS(t),p=t.isWebGL2?"":W5(t),g=X5(r),v=s.createProgram();let _,m,E=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(_=[g].filter($o).join(`
`),_.length>0&&(_+=`
`),m=[p,g].filter($o).join(`
`),m.length>0&&(m+=`
`)):(_=[Vf(t),"#define SHADER_NAME "+t.shaderName,g,t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+d:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors&&t.isWebGL2?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE":"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0&&t.isWebGL2?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#if ( defined( USE_MORPHTARGETS ) && ! defined( MORPHTARGETS_TEXTURE ) )","	attribute vec3 morphTarget0;","	attribute vec3 morphTarget1;","	attribute vec3 morphTarget2;","	attribute vec3 morphTarget3;","	#ifdef USE_MORPHNORMALS","		attribute vec3 morphNormal0;","		attribute vec3 morphNormal1;","		attribute vec3 morphNormal2;","		attribute vec3 morphNormal3;","	#else","		attribute vec3 morphTarget4;","		attribute vec3 morphTarget5;","		attribute vec3 morphTarget6;","		attribute vec3 morphTarget7;","	#endif","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter($o).join(`
`),m=[p,Vf(t),"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.envMap?"#define "+d:"",t.envMap?"#define "+h:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.useLegacyLights?"#define LEGACY_LIGHTS":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.logarithmicDepthBuffer&&t.rendererExtensionFragDepth?"#define USE_LOGDEPTHBUF_EXT":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==rs?"#define TONE_MAPPING":"",t.toneMapping!==rs?Et.tonemapping_pars_fragment:"",t.toneMapping!==rs?G5("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Et.encodings_pars_fragment,V5("linearToOutputTexel",t.outputColorSpace),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter($o).join(`
`)),o=Ec(o),o=zf(o,t),o=Hf(o,t),a=Ec(a),a=zf(a,t),a=Hf(a,t),o=$f(o),a=$f(a),t.isWebGL2&&t.isRawShaderMaterial!==!0&&(E=`#version 300 es
`,_=["precision mediump sampler2DArray;","#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+_,m=["#define varying in",t.glslVersion===lf?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===lf?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);const y=E+_+o,x=E+m+a,M=Of(s,s.VERTEX_SHADER,y),A=Of(s,s.FRAGMENT_SHADER,x);if(s.attachShader(v,M),s.attachShader(v,A),t.index0AttributeName!==void 0?s.bindAttribLocation(v,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(v,0,"position"),s.linkProgram(v),n.debug.checkShaderErrors){const b=s.getProgramInfoLog(v).trim(),w=s.getShaderInfoLog(M).trim(),oe=s.getShaderInfoLog(A).trim();let X=!0,z=!0;if(s.getProgramParameter(v,s.LINK_STATUS)===!1)if(X=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(s,v,M,A);else{const T=kf(s,M,"vertex"),G=kf(s,A,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(v,s.VALIDATE_STATUS)+`

Program Info Log: `+b+`
`+T+`
`+G)}else b!==""?console.warn("THREE.WebGLProgram: Program Info Log:",b):(w===""||oe==="")&&(z=!1);z&&(this.diagnostics={runnable:X,programLog:b,vertexShader:{log:w,prefix:_},fragmentShader:{log:oe,prefix:m}})}s.deleteShader(M),s.deleteShader(A);let F;this.getUniforms=function(){return F===void 0&&(F=new hl(s,v)),F};let I;return this.getAttributes=function(){return I===void 0&&(I=j5(s,v)),I},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(v),this.program=void 0},this.name=t.shaderName,this.id=z5++,this.cacheKey=e,this.usedTimes=1,this.program=v,this.vertexShader=M,this.fragmentShader=A,this}let sS=0;class rS{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,i=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(i),o=this._getShaderCacheForMaterial(e);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){const t=this.shaderCache;let i=t.get(e);return i===void 0&&(i=new oS(e),t.set(e,i)),i}}class oS{constructor(e){this.id=sS++,this.code=e,this.usedTimes=0}}function aS(n,e,t,i,s,r,o){const a=new ud,l=new rS,u=[],d=s.isWebGL2,h=s.logarithmicDepthBuffer,f=s.vertexTextures;let p=s.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function v(b){return b===1?"uv1":b===2?"uv2":b===3?"uv3":"uv"}function _(b,w,oe,X,z){const T=X.fog,G=z.geometry,re=b.isMeshStandardMaterial?X.environment:null,ae=(b.isMeshStandardMaterial?t:e).get(b.envMap||re),C=!!ae&&ae.mapping===Gl?ae.image.height:null,J=g[b.type];b.precision!==null&&(p=s.getMaxPrecision(b.precision),p!==b.precision&&console.warn("THREE.WebGLProgram.getParameters:",b.precision,"not supported, using",p,"instead."));const $=G.morphAttributes.position||G.morphAttributes.normal||G.morphAttributes.color,ee=$!==void 0?$.length:0;let U=0;G.morphAttributes.position!==void 0&&(U=1),G.morphAttributes.normal!==void 0&&(U=2),G.morphAttributes.color!==void 0&&(U=3);let N,le,Y,ce;if(J){const wt=Ii[J];N=wt.vertexShader,le=wt.fragmentShader}else N=b.vertexShader,le=b.fragmentShader,l.update(b),Y=l.getVertexShaderID(b),ce=l.getFragmentShaderID(b);const O=n.getRenderTarget(),Fe=z.isInstancedMesh===!0,Oe=!!b.map,Pe=!!b.matcap,Ne=!!ae,P=!!b.aoMap,k=!!b.lightMap,ue=!!b.bumpMap,fe=!!b.normalMap,be=!!b.displacementMap,De=!!b.emissiveMap,Ie=!!b.metalnessMap,Ae=!!b.roughnessMap,Re=b.clearcoat>0,Te=b.iridescence>0,D=b.sheen>0,S=b.transmission>0,se=Re&&!!b.clearcoatMap,ve=Re&&!!b.clearcoatNormalMap,xe=Re&&!!b.clearcoatRoughnessMap,Le=Te&&!!b.iridescenceMap,W=Te&&!!b.iridescenceThicknessMap,ye=D&&!!b.sheenColorMap,pe=D&&!!b.sheenRoughnessMap,ze=!!b.specularMap,Ke=!!b.specularColorMap,et=!!b.specularIntensityMap,qe=S&&!!b.transmissionMap,We=S&&!!b.thicknessMap,rt=!!b.gradientMap,ft=!!b.alphaMap,Gt=b.alphaTest>0,ie=!!b.extensions,Ee=!!G.attributes.uv1,Be=!!G.attributes.uv2,Ze=!!G.attributes.uv3;return{isWebGL2:d,shaderID:J,shaderName:b.type,vertexShader:N,fragmentShader:le,defines:b.defines,customVertexShaderID:Y,customFragmentShaderID:ce,isRawShaderMaterial:b.isRawShaderMaterial===!0,glslVersion:b.glslVersion,precision:p,instancing:Fe,instancingColor:Fe&&z.instanceColor!==null,supportsVertexTextures:f,outputColorSpace:O===null?n.outputColorSpace:O.isXRRenderTarget===!0?O.texture.colorSpace:ki,map:Oe,matcap:Pe,envMap:Ne,envMapMode:Ne&&ae.mapping,envMapCubeUVHeight:C,aoMap:P,lightMap:k,bumpMap:ue,normalMap:fe,displacementMap:f&&be,emissiveMap:De,normalMapObjectSpace:fe&&b.normalMapType===g2,normalMapTangentSpace:fe&&b.normalMapType===h0,metalnessMap:Ie,roughnessMap:Ae,clearcoat:Re,clearcoatMap:se,clearcoatNormalMap:ve,clearcoatRoughnessMap:xe,iridescence:Te,iridescenceMap:Le,iridescenceThicknessMap:W,sheen:D,sheenColorMap:ye,sheenRoughnessMap:pe,specularMap:ze,specularColorMap:Ke,specularIntensityMap:et,transmission:S,transmissionMap:qe,thicknessMap:We,gradientMap:rt,opaque:b.transparent===!1&&b.blending===Qr,alphaMap:ft,alphaTest:Gt,combine:b.combine,mapUv:Oe&&v(b.map.channel),aoMapUv:P&&v(b.aoMap.channel),lightMapUv:k&&v(b.lightMap.channel),bumpMapUv:ue&&v(b.bumpMap.channel),normalMapUv:fe&&v(b.normalMap.channel),displacementMapUv:be&&v(b.displacementMap.channel),emissiveMapUv:De&&v(b.emissiveMap.channel),metalnessMapUv:Ie&&v(b.metalnessMap.channel),roughnessMapUv:Ae&&v(b.roughnessMap.channel),clearcoatMapUv:se&&v(b.clearcoatMap.channel),clearcoatNormalMapUv:ve&&v(b.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:xe&&v(b.clearcoatRoughnessMap.channel),iridescenceMapUv:Le&&v(b.iridescenceMap.channel),iridescenceThicknessMapUv:W&&v(b.iridescenceThicknessMap.channel),sheenColorMapUv:ye&&v(b.sheenColorMap.channel),sheenRoughnessMapUv:pe&&v(b.sheenRoughnessMap.channel),specularMapUv:ze&&v(b.specularMap.channel),specularColorMapUv:Ke&&v(b.specularColorMap.channel),specularIntensityMapUv:et&&v(b.specularIntensityMap.channel),transmissionMapUv:qe&&v(b.transmissionMap.channel),thicknessMapUv:We&&v(b.thicknessMap.channel),alphaMapUv:ft&&v(b.alphaMap.channel),vertexTangents:fe&&!!G.attributes.tangent,vertexColors:b.vertexColors,vertexAlphas:b.vertexColors===!0&&!!G.attributes.color&&G.attributes.color.itemSize===4,vertexUv1s:Ee,vertexUv2s:Be,vertexUv3s:Ze,pointsUvs:z.isPoints===!0&&!!G.attributes.uv&&(Oe||ft),fog:!!T,useFog:b.fog===!0,fogExp2:T&&T.isFogExp2,flatShading:b.flatShading===!0,sizeAttenuation:b.sizeAttenuation===!0,logarithmicDepthBuffer:h,skinning:z.isSkinnedMesh===!0,morphTargets:G.morphAttributes.position!==void 0,morphNormals:G.morphAttributes.normal!==void 0,morphColors:G.morphAttributes.color!==void 0,morphTargetsCount:ee,morphTextureStride:U,numDirLights:w.directional.length,numPointLights:w.point.length,numSpotLights:w.spot.length,numSpotLightMaps:w.spotLightMap.length,numRectAreaLights:w.rectArea.length,numHemiLights:w.hemi.length,numDirLightShadows:w.directionalShadowMap.length,numPointLightShadows:w.pointShadowMap.length,numSpotLightShadows:w.spotShadowMap.length,numSpotLightShadowsWithMaps:w.numSpotLightShadowsWithMaps,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:b.dithering,shadowMapEnabled:n.shadowMap.enabled&&oe.length>0,shadowMapType:n.shadowMap.type,toneMapping:b.toneMapped?n.toneMapping:rs,useLegacyLights:n.useLegacyLights,premultipliedAlpha:b.premultipliedAlpha,doubleSided:b.side===Sn,flipSided:b.side===Yn,useDepthPacking:b.depthPacking>=0,depthPacking:b.depthPacking||0,index0AttributeName:b.index0AttributeName,extensionDerivatives:ie&&b.extensions.derivatives===!0,extensionFragDepth:ie&&b.extensions.fragDepth===!0,extensionDrawBuffers:ie&&b.extensions.drawBuffers===!0,extensionShaderTextureLOD:ie&&b.extensions.shaderTextureLOD===!0,rendererExtensionFragDepth:d||i.has("EXT_frag_depth"),rendererExtensionDrawBuffers:d||i.has("WEBGL_draw_buffers"),rendererExtensionShaderTextureLod:d||i.has("EXT_shader_texture_lod"),customProgramCacheKey:b.customProgramCacheKey()}}function m(b){const w=[];if(b.shaderID?w.push(b.shaderID):(w.push(b.customVertexShaderID),w.push(b.customFragmentShaderID)),b.defines!==void 0)for(const oe in b.defines)w.push(oe),w.push(b.defines[oe]);return b.isRawShaderMaterial===!1&&(E(w,b),y(w,b),w.push(n.outputColorSpace)),w.push(b.customProgramCacheKey),w.join()}function E(b,w){b.push(w.precision),b.push(w.outputColorSpace),b.push(w.envMapMode),b.push(w.envMapCubeUVHeight),b.push(w.mapUv),b.push(w.alphaMapUv),b.push(w.lightMapUv),b.push(w.aoMapUv),b.push(w.bumpMapUv),b.push(w.normalMapUv),b.push(w.displacementMapUv),b.push(w.emissiveMapUv),b.push(w.metalnessMapUv),b.push(w.roughnessMapUv),b.push(w.clearcoatMapUv),b.push(w.clearcoatNormalMapUv),b.push(w.clearcoatRoughnessMapUv),b.push(w.iridescenceMapUv),b.push(w.iridescenceThicknessMapUv),b.push(w.sheenColorMapUv),b.push(w.sheenRoughnessMapUv),b.push(w.specularMapUv),b.push(w.specularColorMapUv),b.push(w.specularIntensityMapUv),b.push(w.transmissionMapUv),b.push(w.thicknessMapUv),b.push(w.combine),b.push(w.fogExp2),b.push(w.sizeAttenuation),b.push(w.morphTargetsCount),b.push(w.morphAttributeCount),b.push(w.numDirLights),b.push(w.numPointLights),b.push(w.numSpotLights),b.push(w.numSpotLightMaps),b.push(w.numHemiLights),b.push(w.numRectAreaLights),b.push(w.numDirLightShadows),b.push(w.numPointLightShadows),b.push(w.numSpotLightShadows),b.push(w.numSpotLightShadowsWithMaps),b.push(w.shadowMapType),b.push(w.toneMapping),b.push(w.numClippingPlanes),b.push(w.numClipIntersection),b.push(w.depthPacking)}function y(b,w){a.disableAll(),w.isWebGL2&&a.enable(0),w.supportsVertexTextures&&a.enable(1),w.instancing&&a.enable(2),w.instancingColor&&a.enable(3),w.matcap&&a.enable(4),w.envMap&&a.enable(5),w.normalMapObjectSpace&&a.enable(6),w.normalMapTangentSpace&&a.enable(7),w.clearcoat&&a.enable(8),w.iridescence&&a.enable(9),w.alphaTest&&a.enable(10),w.vertexColors&&a.enable(11),w.vertexAlphas&&a.enable(12),w.vertexUv1s&&a.enable(13),w.vertexUv2s&&a.enable(14),w.vertexUv3s&&a.enable(15),w.vertexTangents&&a.enable(16),b.push(a.mask),a.disableAll(),w.fog&&a.enable(0),w.useFog&&a.enable(1),w.flatShading&&a.enable(2),w.logarithmicDepthBuffer&&a.enable(3),w.skinning&&a.enable(4),w.morphTargets&&a.enable(5),w.morphNormals&&a.enable(6),w.morphColors&&a.enable(7),w.premultipliedAlpha&&a.enable(8),w.shadowMapEnabled&&a.enable(9),w.useLegacyLights&&a.enable(10),w.doubleSided&&a.enable(11),w.flipSided&&a.enable(12),w.useDepthPacking&&a.enable(13),w.dithering&&a.enable(14),w.transmission&&a.enable(15),w.sheen&&a.enable(16),w.opaque&&a.enable(17),w.pointsUvs&&a.enable(18),b.push(a.mask)}function x(b){const w=g[b.type];let oe;if(w){const X=Ii[w];oe=Y2.clone(X.uniforms)}else oe=b.uniforms;return oe}function M(b,w){let oe;for(let X=0,z=u.length;X<z;X++){const T=u[X];if(T.cacheKey===w){oe=T,++oe.usedTimes;break}}return oe===void 0&&(oe=new iS(n,w,b,r),u.push(oe)),oe}function A(b){if(--b.usedTimes===0){const w=u.indexOf(b);u[w]=u[u.length-1],u.pop(),b.destroy()}}function F(b){l.remove(b)}function I(){l.dispose()}return{getParameters:_,getProgramCacheKey:m,getUniforms:x,acquireProgram:M,releaseProgram:A,releaseShaderCache:F,programs:u,dispose:I}}function lS(){let n=new WeakMap;function e(r){let o=n.get(r);return o===void 0&&(o={},n.set(r,o)),o}function t(r){n.delete(r)}function i(r,o,a){n.get(r)[o]=a}function s(){n=new WeakMap}return{get:e,remove:t,update:i,dispose:s}}function uS(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.z!==e.z?n.z-e.z:n.id-e.id}function Gf(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function Wf(){const n=[];let e=0;const t=[],i=[],s=[];function r(){e=0,t.length=0,i.length=0,s.length=0}function o(h,f,p,g,v,_){let m=n[e];return m===void 0?(m={id:h.id,object:h,geometry:f,material:p,groupOrder:g,renderOrder:h.renderOrder,z:v,group:_},n[e]=m):(m.id=h.id,m.object=h,m.geometry=f,m.material=p,m.groupOrder=g,m.renderOrder=h.renderOrder,m.z=v,m.group=_),e++,m}function a(h,f,p,g,v,_){const m=o(h,f,p,g,v,_);p.transmission>0?i.push(m):p.transparent===!0?s.push(m):t.push(m)}function l(h,f,p,g,v,_){const m=o(h,f,p,g,v,_);p.transmission>0?i.unshift(m):p.transparent===!0?s.unshift(m):t.unshift(m)}function u(h,f){t.length>1&&t.sort(h||uS),i.length>1&&i.sort(f||Gf),s.length>1&&s.sort(f||Gf)}function d(){for(let h=e,f=n.length;h<f;h++){const p=n[h];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:t,transmissive:i,transparent:s,init:r,push:a,unshift:l,finish:d,sort:u}}function cS(){let n=new WeakMap;function e(i,s){const r=n.get(i);let o;return r===void 0?(o=new Wf,n.set(i,[o])):s>=r.length?(o=new Wf,r.push(o)):o=r[s],o}function t(){n=new WeakMap}return{get:e,dispose:t}}function dS(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new L,color:new ut};break;case"SpotLight":t={position:new L,direction:new L,color:new ut,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new L,color:new ut,distance:0,decay:0};break;case"HemisphereLight":t={direction:new L,skyColor:new ut,groundColor:new ut};break;case"RectAreaLight":t={color:new ut,position:new L,halfWidth:new L,halfHeight:new L};break}return n[e.id]=t,t}}}function hS(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ue};break;case"SpotLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ue};break;case"PointLight":t={shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ue,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}let fS=0;function pS(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function mS(n,e){const t=new dS,i=hS(),s={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0};for(let d=0;d<9;d++)s.probe.push(new L);const r=new L,o=new xt,a=new xt;function l(d,h){let f=0,p=0,g=0;for(let oe=0;oe<9;oe++)s.probe[oe].set(0,0,0);let v=0,_=0,m=0,E=0,y=0,x=0,M=0,A=0,F=0,I=0;d.sort(pS);const b=h===!0?Math.PI:1;for(let oe=0,X=d.length;oe<X;oe++){const z=d[oe],T=z.color,G=z.intensity,re=z.distance,ae=z.shadow&&z.shadow.map?z.shadow.map.texture:null;if(z.isAmbientLight)f+=T.r*G*b,p+=T.g*G*b,g+=T.b*G*b;else if(z.isLightProbe)for(let C=0;C<9;C++)s.probe[C].addScaledVector(z.sh.coefficients[C],G);else if(z.isDirectionalLight){const C=t.get(z);if(C.color.copy(z.color).multiplyScalar(z.intensity*b),z.castShadow){const J=z.shadow,$=i.get(z);$.shadowBias=J.bias,$.shadowNormalBias=J.normalBias,$.shadowRadius=J.radius,$.shadowMapSize=J.mapSize,s.directionalShadow[v]=$,s.directionalShadowMap[v]=ae,s.directionalShadowMatrix[v]=z.shadow.matrix,x++}s.directional[v]=C,v++}else if(z.isSpotLight){const C=t.get(z);C.position.setFromMatrixPosition(z.matrixWorld),C.color.copy(T).multiplyScalar(G*b),C.distance=re,C.coneCos=Math.cos(z.angle),C.penumbraCos=Math.cos(z.angle*(1-z.penumbra)),C.decay=z.decay,s.spot[m]=C;const J=z.shadow;if(z.map&&(s.spotLightMap[F]=z.map,F++,J.updateMatrices(z),z.castShadow&&I++),s.spotLightMatrix[m]=J.matrix,z.castShadow){const $=i.get(z);$.shadowBias=J.bias,$.shadowNormalBias=J.normalBias,$.shadowRadius=J.radius,$.shadowMapSize=J.mapSize,s.spotShadow[m]=$,s.spotShadowMap[m]=ae,A++}m++}else if(z.isRectAreaLight){const C=t.get(z);C.color.copy(T).multiplyScalar(G),C.halfWidth.set(z.width*.5,0,0),C.halfHeight.set(0,z.height*.5,0),s.rectArea[E]=C,E++}else if(z.isPointLight){const C=t.get(z);if(C.color.copy(z.color).multiplyScalar(z.intensity*b),C.distance=z.distance,C.decay=z.decay,z.castShadow){const J=z.shadow,$=i.get(z);$.shadowBias=J.bias,$.shadowNormalBias=J.normalBias,$.shadowRadius=J.radius,$.shadowMapSize=J.mapSize,$.shadowCameraNear=J.camera.near,$.shadowCameraFar=J.camera.far,s.pointShadow[_]=$,s.pointShadowMap[_]=ae,s.pointShadowMatrix[_]=z.shadow.matrix,M++}s.point[_]=C,_++}else if(z.isHemisphereLight){const C=t.get(z);C.skyColor.copy(z.color).multiplyScalar(G*b),C.groundColor.copy(z.groundColor).multiplyScalar(G*b),s.hemi[y]=C,y++}}E>0&&(e.isWebGL2||n.has("OES_texture_float_linear")===!0?(s.rectAreaLTC1=Xe.LTC_FLOAT_1,s.rectAreaLTC2=Xe.LTC_FLOAT_2):n.has("OES_texture_half_float_linear")===!0?(s.rectAreaLTC1=Xe.LTC_HALF_1,s.rectAreaLTC2=Xe.LTC_HALF_2):console.error("THREE.WebGLRenderer: Unable to use RectAreaLight. Missing WebGL extensions.")),s.ambient[0]=f,s.ambient[1]=p,s.ambient[2]=g;const w=s.hash;(w.directionalLength!==v||w.pointLength!==_||w.spotLength!==m||w.rectAreaLength!==E||w.hemiLength!==y||w.numDirectionalShadows!==x||w.numPointShadows!==M||w.numSpotShadows!==A||w.numSpotMaps!==F)&&(s.directional.length=v,s.spot.length=m,s.rectArea.length=E,s.point.length=_,s.hemi.length=y,s.directionalShadow.length=x,s.directionalShadowMap.length=x,s.pointShadow.length=M,s.pointShadowMap.length=M,s.spotShadow.length=A,s.spotShadowMap.length=A,s.directionalShadowMatrix.length=x,s.pointShadowMatrix.length=M,s.spotLightMatrix.length=A+F-I,s.spotLightMap.length=F,s.numSpotLightShadowsWithMaps=I,w.directionalLength=v,w.pointLength=_,w.spotLength=m,w.rectAreaLength=E,w.hemiLength=y,w.numDirectionalShadows=x,w.numPointShadows=M,w.numSpotShadows=A,w.numSpotMaps=F,s.version=fS++)}function u(d,h){let f=0,p=0,g=0,v=0,_=0;const m=h.matrixWorldInverse;for(let E=0,y=d.length;E<y;E++){const x=d[E];if(x.isDirectionalLight){const M=s.directional[f];M.direction.setFromMatrixPosition(x.matrixWorld),r.setFromMatrixPosition(x.target.matrixWorld),M.direction.sub(r),M.direction.transformDirection(m),f++}else if(x.isSpotLight){const M=s.spot[g];M.position.setFromMatrixPosition(x.matrixWorld),M.position.applyMatrix4(m),M.direction.setFromMatrixPosition(x.matrixWorld),r.setFromMatrixPosition(x.target.matrixWorld),M.direction.sub(r),M.direction.transformDirection(m),g++}else if(x.isRectAreaLight){const M=s.rectArea[v];M.position.setFromMatrixPosition(x.matrixWorld),M.position.applyMatrix4(m),a.identity(),o.copy(x.matrixWorld),o.premultiply(m),a.extractRotation(o),M.halfWidth.set(x.width*.5,0,0),M.halfHeight.set(0,x.height*.5,0),M.halfWidth.applyMatrix4(a),M.halfHeight.applyMatrix4(a),v++}else if(x.isPointLight){const M=s.point[p];M.position.setFromMatrixPosition(x.matrixWorld),M.position.applyMatrix4(m),p++}else if(x.isHemisphereLight){const M=s.hemi[_];M.direction.setFromMatrixPosition(x.matrixWorld),M.direction.transformDirection(m),_++}}}return{setup:l,setupView:u,state:s}}function Xf(n,e){const t=new mS(n,e),i=[],s=[];function r(){i.length=0,s.length=0}function o(h){i.push(h)}function a(h){s.push(h)}function l(h){t.setup(i,h)}function u(h){t.setupView(i,h)}return{init:r,state:{lightsArray:i,shadowsArray:s,lights:t},setupLights:l,setupLightsView:u,pushLight:o,pushShadow:a}}function gS(n,e){let t=new WeakMap;function i(r,o=0){const a=t.get(r);let l;return a===void 0?(l=new Xf(n,e),t.set(r,[l])):o>=a.length?(l=new Xf(n,e),a.push(l)):l=a[o],l}function s(){t=new WeakMap}return{get:i,dispose:s}}class _S extends wi{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=p2,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class vS extends wi{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const yS=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,ES=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function xS(n,e,t){let i=new cd;const s=new Ue,r=new Ue,o=new Ot,a=new _S({depthPacking:m2}),l=new vS,u={},d=t.maxTextureSize,h={[Oi]:Yn,[Yn]:Oi,[Sn]:Sn},f=new fr({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Ue},radius:{value:4}},vertexShader:yS,fragmentShader:ES}),p=f.clone();p.defines.HORIZONTAL_PASS=1;const g=new Zt;g.setAttribute("position",new In(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const v=new je(g,f),_=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=i0;let m=this.type;this.render=function(M,A,F){if(_.enabled===!1||_.autoUpdate===!1&&_.needsUpdate===!1||M.length===0)return;const I=n.getRenderTarget(),b=n.getActiveCubeFace(),w=n.getActiveMipmapLevel(),oe=n.state;oe.setBlending(Is),oe.buffers.color.setClear(1,1,1,1),oe.buffers.depth.setTest(!0),oe.setScissorTest(!1);const X=m!==ts&&this.type===ts,z=m===ts&&this.type!==ts;for(let T=0,G=M.length;T<G;T++){const re=M[T],ae=re.shadow;if(ae===void 0){console.warn("THREE.WebGLShadowMap:",re,"has no shadow.");continue}if(ae.autoUpdate===!1&&ae.needsUpdate===!1)continue;s.copy(ae.mapSize);const C=ae.getFrameExtents();if(s.multiply(C),r.copy(ae.mapSize),(s.x>d||s.y>d)&&(s.x>d&&(r.x=Math.floor(d/C.x),s.x=r.x*C.x,ae.mapSize.x=r.x),s.y>d&&(r.y=Math.floor(d/C.y),s.y=r.y*C.y,ae.mapSize.y=r.y)),ae.map===null||X===!0||z===!0){const $=this.type!==ts?{minFilter:pn,magFilter:pn}:{};ae.map!==null&&ae.map.dispose(),ae.map=new hr(s.x,s.y,$),ae.map.texture.name=re.name+".shadowMap",ae.camera.updateProjectionMatrix()}n.setRenderTarget(ae.map),n.clear();const J=ae.getViewportCount();for(let $=0;$<J;$++){const ee=ae.getViewport($);o.set(r.x*ee.x,r.y*ee.y,r.x*ee.z,r.y*ee.w),oe.viewport(o),ae.updateMatrices(re,$),i=ae.getFrustum(),x(A,F,ae.camera,re,this.type)}ae.isPointLightShadow!==!0&&this.type===ts&&E(ae,F),ae.needsUpdate=!1}m=this.type,_.needsUpdate=!1,n.setRenderTarget(I,b,w)};function E(M,A){const F=e.update(v);f.defines.VSM_SAMPLES!==M.blurSamples&&(f.defines.VSM_SAMPLES=M.blurSamples,p.defines.VSM_SAMPLES=M.blurSamples,f.needsUpdate=!0,p.needsUpdate=!0),M.mapPass===null&&(M.mapPass=new hr(s.x,s.y)),f.uniforms.shadow_pass.value=M.map.texture,f.uniforms.resolution.value=M.mapSize,f.uniforms.radius.value=M.radius,n.setRenderTarget(M.mapPass),n.clear(),n.renderBufferDirect(A,null,F,f,v,null),p.uniforms.shadow_pass.value=M.mapPass.texture,p.uniforms.resolution.value=M.mapSize,p.uniforms.radius.value=M.radius,n.setRenderTarget(M.map),n.clear(),n.renderBufferDirect(A,null,F,p,v,null)}function y(M,A,F,I){let b=null;const w=F.isPointLight===!0?M.customDistanceMaterial:M.customDepthMaterial;if(w!==void 0)b=w;else if(b=F.isPointLight===!0?l:a,n.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0){const oe=b.uuid,X=A.uuid;let z=u[oe];z===void 0&&(z={},u[oe]=z);let T=z[X];T===void 0&&(T=b.clone(),z[X]=T),b=T}if(b.visible=A.visible,b.wireframe=A.wireframe,I===ts?b.side=A.shadowSide!==null?A.shadowSide:A.side:b.side=A.shadowSide!==null?A.shadowSide:h[A.side],b.alphaMap=A.alphaMap,b.alphaTest=A.alphaTest,b.map=A.map,b.clipShadows=A.clipShadows,b.clippingPlanes=A.clippingPlanes,b.clipIntersection=A.clipIntersection,b.displacementMap=A.displacementMap,b.displacementScale=A.displacementScale,b.displacementBias=A.displacementBias,b.wireframeLinewidth=A.wireframeLinewidth,b.linewidth=A.linewidth,F.isPointLight===!0&&b.isMeshDistanceMaterial===!0){const oe=n.properties.get(b);oe.light=F}return b}function x(M,A,F,I,b){if(M.visible===!1)return;if(M.layers.test(A.layers)&&(M.isMesh||M.isLine||M.isPoints)&&(M.castShadow||M.receiveShadow&&b===ts)&&(!M.frustumCulled||i.intersectsObject(M))){M.modelViewMatrix.multiplyMatrices(F.matrixWorldInverse,M.matrixWorld);const X=e.update(M),z=M.material;if(Array.isArray(z)){const T=X.groups;for(let G=0,re=T.length;G<re;G++){const ae=T[G],C=z[ae.materialIndex];if(C&&C.visible){const J=y(M,C,I,b);n.renderBufferDirect(F,null,X,J,M,ae)}}}else if(z.visible){const T=y(M,z,I,b);n.renderBufferDirect(F,null,X,T,M,null)}}const oe=M.children;for(let X=0,z=oe.length;X<z;X++)x(oe[X],A,F,I,b)}}function bS(n,e,t){const i=t.isWebGL2;function s(){let ie=!1;const Ee=new Ot;let Be=null;const Ze=new Ot(0,0,0,0);return{setMask:function(nt){Be!==nt&&!ie&&(n.colorMask(nt,nt,nt,nt),Be=nt)},setLocked:function(nt){ie=nt},setClear:function(nt,wt,Ct,tn,Qn){Qn===!0&&(nt*=tn,wt*=tn,Ct*=tn),Ee.set(nt,wt,Ct,tn),Ze.equals(Ee)===!1&&(n.clearColor(nt,wt,Ct,tn),Ze.copy(Ee))},reset:function(){ie=!1,Be=null,Ze.set(-1,0,0,0)}}}function r(){let ie=!1,Ee=null,Be=null,Ze=null;return{setTest:function(nt){nt?O(n.DEPTH_TEST):Fe(n.DEPTH_TEST)},setMask:function(nt){Ee!==nt&&!ie&&(n.depthMask(nt),Ee=nt)},setFunc:function(nt){if(Be!==nt){switch(nt){case Ox:n.depthFunc(n.NEVER);break;case kx:n.depthFunc(n.ALWAYS);break;case zx:n.depthFunc(n.LESS);break;case fc:n.depthFunc(n.LEQUAL);break;case Hx:n.depthFunc(n.EQUAL);break;case $x:n.depthFunc(n.GEQUAL);break;case Vx:n.depthFunc(n.GREATER);break;case Gx:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}Be=nt}},setLocked:function(nt){ie=nt},setClear:function(nt){Ze!==nt&&(n.clearDepth(nt),Ze=nt)},reset:function(){ie=!1,Ee=null,Be=null,Ze=null}}}function o(){let ie=!1,Ee=null,Be=null,Ze=null,nt=null,wt=null,Ct=null,tn=null,Qn=null;return{setTest:function(Ht){ie||(Ht?O(n.STENCIL_TEST):Fe(n.STENCIL_TEST))},setMask:function(Ht){Ee!==Ht&&!ie&&(n.stencilMask(Ht),Ee=Ht)},setFunc:function(Ht,xn,hn){(Be!==Ht||Ze!==xn||nt!==hn)&&(n.stencilFunc(Ht,xn,hn),Be=Ht,Ze=xn,nt=hn)},setOp:function(Ht,xn,hn){(wt!==Ht||Ct!==xn||tn!==hn)&&(n.stencilOp(Ht,xn,hn),wt=Ht,Ct=xn,tn=hn)},setLocked:function(Ht){ie=Ht},setClear:function(Ht){Qn!==Ht&&(n.clearStencil(Ht),Qn=Ht)},reset:function(){ie=!1,Ee=null,Be=null,Ze=null,nt=null,wt=null,Ct=null,tn=null,Qn=null}}}const a=new s,l=new r,u=new o,d=new WeakMap,h=new WeakMap;let f={},p={},g=new WeakMap,v=[],_=null,m=!1,E=null,y=null,x=null,M=null,A=null,F=null,I=null,b=!1,w=null,oe=null,X=null,z=null,T=null;const G=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let re=!1,ae=0;const C=n.getParameter(n.VERSION);C.indexOf("WebGL")!==-1?(ae=parseFloat(/^WebGL (\d)/.exec(C)[1]),re=ae>=1):C.indexOf("OpenGL ES")!==-1&&(ae=parseFloat(/^OpenGL ES (\d)/.exec(C)[1]),re=ae>=2);let J=null,$={};const ee=n.getParameter(n.SCISSOR_BOX),U=n.getParameter(n.VIEWPORT),N=new Ot().fromArray(ee),le=new Ot().fromArray(U);function Y(ie,Ee,Be,Ze){const nt=new Uint8Array(4),wt=n.createTexture();n.bindTexture(ie,wt),n.texParameteri(ie,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(ie,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let Ct=0;Ct<Be;Ct++)i&&(ie===n.TEXTURE_3D||ie===n.TEXTURE_2D_ARRAY)?n.texImage3D(Ee,0,n.RGBA,1,1,Ze,0,n.RGBA,n.UNSIGNED_BYTE,nt):n.texImage2D(Ee+Ct,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,nt);return wt}const ce={};ce[n.TEXTURE_2D]=Y(n.TEXTURE_2D,n.TEXTURE_2D,1),ce[n.TEXTURE_CUBE_MAP]=Y(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),i&&(ce[n.TEXTURE_2D_ARRAY]=Y(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),ce[n.TEXTURE_3D]=Y(n.TEXTURE_3D,n.TEXTURE_3D,1,1)),a.setClear(0,0,0,1),l.setClear(1),u.setClear(0),O(n.DEPTH_TEST),l.setFunc(fc),be(!1),De(Rh),O(n.CULL_FACE),ue(Is);function O(ie){f[ie]!==!0&&(n.enable(ie),f[ie]=!0)}function Fe(ie){f[ie]!==!1&&(n.disable(ie),f[ie]=!1)}function Oe(ie,Ee){return p[ie]!==Ee?(n.bindFramebuffer(ie,Ee),p[ie]=Ee,i&&(ie===n.DRAW_FRAMEBUFFER&&(p[n.FRAMEBUFFER]=Ee),ie===n.FRAMEBUFFER&&(p[n.DRAW_FRAMEBUFFER]=Ee)),!0):!1}function Pe(ie,Ee){let Be=v,Ze=!1;if(ie)if(Be=g.get(Ee),Be===void 0&&(Be=[],g.set(Ee,Be)),ie.isWebGLMultipleRenderTargets){const nt=ie.texture;if(Be.length!==nt.length||Be[0]!==n.COLOR_ATTACHMENT0){for(let wt=0,Ct=nt.length;wt<Ct;wt++)Be[wt]=n.COLOR_ATTACHMENT0+wt;Be.length=nt.length,Ze=!0}}else Be[0]!==n.COLOR_ATTACHMENT0&&(Be[0]=n.COLOR_ATTACHMENT0,Ze=!0);else Be[0]!==n.BACK&&(Be[0]=n.BACK,Ze=!0);Ze&&(t.isWebGL2?n.drawBuffers(Be):e.get("WEBGL_draw_buffers").drawBuffersWEBGL(Be))}function Ne(ie){return _!==ie?(n.useProgram(ie),_=ie,!0):!1}const P={[qr]:n.FUNC_ADD,[Tx]:n.FUNC_SUBTRACT,[Cx]:n.FUNC_REVERSE_SUBTRACT};if(i)P[Lh]=n.MIN,P[Ih]=n.MAX;else{const ie=e.get("EXT_blend_minmax");ie!==null&&(P[Lh]=ie.MIN_EXT,P[Ih]=ie.MAX_EXT)}const k={[Dx]:n.ZERO,[Rx]:n.ONE,[Fx]:n.SRC_COLOR,[s0]:n.SRC_ALPHA,[Nx]:n.SRC_ALPHA_SATURATE,[Bx]:n.DST_COLOR,[Lx]:n.DST_ALPHA,[Px]:n.ONE_MINUS_SRC_COLOR,[r0]:n.ONE_MINUS_SRC_ALPHA,[Ux]:n.ONE_MINUS_DST_COLOR,[Ix]:n.ONE_MINUS_DST_ALPHA};function ue(ie,Ee,Be,Ze,nt,wt,Ct,tn){if(ie===Is){m===!0&&(Fe(n.BLEND),m=!1);return}if(m===!1&&(O(n.BLEND),m=!0),ie!==wx){if(ie!==E||tn!==b){if((y!==qr||A!==qr)&&(n.blendEquation(n.FUNC_ADD),y=qr,A=qr),tn)switch(ie){case Qr:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case hc:n.blendFunc(n.ONE,n.ONE);break;case Fh:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Ph:n.blendFuncSeparate(n.ZERO,n.SRC_COLOR,n.ZERO,n.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",ie);break}else switch(ie){case Qr:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case hc:n.blendFunc(n.SRC_ALPHA,n.ONE);break;case Fh:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Ph:n.blendFunc(n.ZERO,n.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",ie);break}x=null,M=null,F=null,I=null,E=ie,b=tn}return}nt=nt||Ee,wt=wt||Be,Ct=Ct||Ze,(Ee!==y||nt!==A)&&(n.blendEquationSeparate(P[Ee],P[nt]),y=Ee,A=nt),(Be!==x||Ze!==M||wt!==F||Ct!==I)&&(n.blendFuncSeparate(k[Be],k[Ze],k[wt],k[Ct]),x=Be,M=Ze,F=wt,I=Ct),E=ie,b=!1}function fe(ie,Ee){ie.side===Sn?Fe(n.CULL_FACE):O(n.CULL_FACE);let Be=ie.side===Yn;Ee&&(Be=!Be),be(Be),ie.blending===Qr&&ie.transparent===!1?ue(Is):ue(ie.blending,ie.blendEquation,ie.blendSrc,ie.blendDst,ie.blendEquationAlpha,ie.blendSrcAlpha,ie.blendDstAlpha,ie.premultipliedAlpha),l.setFunc(ie.depthFunc),l.setTest(ie.depthTest),l.setMask(ie.depthWrite),a.setMask(ie.colorWrite);const Ze=ie.stencilWrite;u.setTest(Ze),Ze&&(u.setMask(ie.stencilWriteMask),u.setFunc(ie.stencilFunc,ie.stencilRef,ie.stencilFuncMask),u.setOp(ie.stencilFail,ie.stencilZFail,ie.stencilZPass)),Ae(ie.polygonOffset,ie.polygonOffsetFactor,ie.polygonOffsetUnits),ie.alphaToCoverage===!0?O(n.SAMPLE_ALPHA_TO_COVERAGE):Fe(n.SAMPLE_ALPHA_TO_COVERAGE)}function be(ie){w!==ie&&(ie?n.frontFace(n.CW):n.frontFace(n.CCW),w=ie)}function De(ie){ie!==Ax?(O(n.CULL_FACE),ie!==oe&&(ie===Rh?n.cullFace(n.BACK):ie===Sx?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):Fe(n.CULL_FACE),oe=ie}function Ie(ie){ie!==X&&(re&&n.lineWidth(ie),X=ie)}function Ae(ie,Ee,Be){ie?(O(n.POLYGON_OFFSET_FILL),(z!==Ee||T!==Be)&&(n.polygonOffset(Ee,Be),z=Ee,T=Be)):Fe(n.POLYGON_OFFSET_FILL)}function Re(ie){ie?O(n.SCISSOR_TEST):Fe(n.SCISSOR_TEST)}function Te(ie){ie===void 0&&(ie=n.TEXTURE0+G-1),J!==ie&&(n.activeTexture(ie),J=ie)}function D(ie,Ee,Be){Be===void 0&&(J===null?Be=n.TEXTURE0+G-1:Be=J);let Ze=$[Be];Ze===void 0&&(Ze={type:void 0,texture:void 0},$[Be]=Ze),(Ze.type!==ie||Ze.texture!==Ee)&&(J!==Be&&(n.activeTexture(Be),J=Be),n.bindTexture(ie,Ee||ce[ie]),Ze.type=ie,Ze.texture=Ee)}function S(){const ie=$[J];ie!==void 0&&ie.type!==void 0&&(n.bindTexture(ie.type,null),ie.type=void 0,ie.texture=void 0)}function se(){try{n.compressedTexImage2D.apply(n,arguments)}catch(ie){console.error("THREE.WebGLState:",ie)}}function ve(){try{n.compressedTexImage3D.apply(n,arguments)}catch(ie){console.error("THREE.WebGLState:",ie)}}function xe(){try{n.texSubImage2D.apply(n,arguments)}catch(ie){console.error("THREE.WebGLState:",ie)}}function Le(){try{n.texSubImage3D.apply(n,arguments)}catch(ie){console.error("THREE.WebGLState:",ie)}}function W(){try{n.compressedTexSubImage2D.apply(n,arguments)}catch(ie){console.error("THREE.WebGLState:",ie)}}function ye(){try{n.compressedTexSubImage3D.apply(n,arguments)}catch(ie){console.error("THREE.WebGLState:",ie)}}function pe(){try{n.texStorage2D.apply(n,arguments)}catch(ie){console.error("THREE.WebGLState:",ie)}}function ze(){try{n.texStorage3D.apply(n,arguments)}catch(ie){console.error("THREE.WebGLState:",ie)}}function Ke(){try{n.texImage2D.apply(n,arguments)}catch(ie){console.error("THREE.WebGLState:",ie)}}function et(){try{n.texImage3D.apply(n,arguments)}catch(ie){console.error("THREE.WebGLState:",ie)}}function qe(ie){N.equals(ie)===!1&&(n.scissor(ie.x,ie.y,ie.z,ie.w),N.copy(ie))}function We(ie){le.equals(ie)===!1&&(n.viewport(ie.x,ie.y,ie.z,ie.w),le.copy(ie))}function rt(ie,Ee){let Be=h.get(Ee);Be===void 0&&(Be=new WeakMap,h.set(Ee,Be));let Ze=Be.get(ie);Ze===void 0&&(Ze=n.getUniformBlockIndex(Ee,ie.name),Be.set(ie,Ze))}function ft(ie,Ee){const Ze=h.get(Ee).get(ie);d.get(Ee)!==Ze&&(n.uniformBlockBinding(Ee,Ze,ie.__bindingPointIndex),d.set(Ee,Ze))}function Gt(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),i===!0&&(n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null)),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),f={},J=null,$={},p={},g=new WeakMap,v=[],_=null,m=!1,E=null,y=null,x=null,M=null,A=null,F=null,I=null,b=!1,w=null,oe=null,X=null,z=null,T=null,N.set(0,0,n.canvas.width,n.canvas.height),le.set(0,0,n.canvas.width,n.canvas.height),a.reset(),l.reset(),u.reset()}return{buffers:{color:a,depth:l,stencil:u},enable:O,disable:Fe,bindFramebuffer:Oe,drawBuffers:Pe,useProgram:Ne,setBlending:ue,setMaterial:fe,setFlipSided:be,setCullFace:De,setLineWidth:Ie,setPolygonOffset:Ae,setScissorTest:Re,activeTexture:Te,bindTexture:D,unbindTexture:S,compressedTexImage2D:se,compressedTexImage3D:ve,texImage2D:Ke,texImage3D:et,updateUBOMapping:rt,uniformBlockBinding:ft,texStorage2D:pe,texStorage3D:ze,texSubImage2D:xe,texSubImage3D:Le,compressedTexSubImage2D:W,compressedTexSubImage3D:ye,scissor:qe,viewport:We,reset:Gt}}function MS(n,e,t,i,s,r,o){const a=s.isWebGL2,l=s.maxTextures,u=s.maxCubemapSize,d=s.maxTextureSize,h=s.maxSamples,f=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,p=typeof navigator=="undefined"?!1:/OculusBrowser/g.test(navigator.userAgent),g=new WeakMap;let v;const _=new WeakMap;let m=!1;try{m=typeof OffscreenCanvas!="undefined"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function E(D,S){return m?new OffscreenCanvas(D,S):da("canvas")}function y(D,S,se,ve){let xe=1;if((D.width>ve||D.height>ve)&&(xe=ve/Math.max(D.width,D.height)),xe<1||S===!0)if(typeof HTMLImageElement!="undefined"&&D instanceof HTMLImageElement||typeof HTMLCanvasElement!="undefined"&&D instanceof HTMLCanvasElement||typeof ImageBitmap!="undefined"&&D instanceof ImageBitmap){const Le=S?m0:Math.floor,W=Le(xe*D.width),ye=Le(xe*D.height);v===void 0&&(v=E(W,ye));const pe=se?E(W,ye):v;return pe.width=W,pe.height=ye,pe.getContext("2d").drawImage(D,0,0,W,ye),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+D.width+"x"+D.height+") to ("+W+"x"+ye+")."),pe}else return"data"in D&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+D.width+"x"+D.height+")."),D;return D}function x(D){return yc(D.width)&&yc(D.height)}function M(D){return a?!1:D.wrapS!==hi||D.wrapT!==hi||D.minFilter!==pn&&D.minFilter!==qn}function A(D,S){return D.generateMipmaps&&S&&D.minFilter!==pn&&D.minFilter!==qn}function F(D){n.generateMipmap(D)}function I(D,S,se,ve,xe=!1){if(a===!1)return S;if(D!==null){if(n[D]!==void 0)return n[D];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+D+"'")}let Le=S;return S===n.RED&&(se===n.FLOAT&&(Le=n.R32F),se===n.HALF_FLOAT&&(Le=n.R16F),se===n.UNSIGNED_BYTE&&(Le=n.R8)),S===n.RG&&(se===n.FLOAT&&(Le=n.RG32F),se===n.HALF_FLOAT&&(Le=n.RG16F),se===n.UNSIGNED_BYTE&&(Le=n.RG8)),S===n.RGBA&&(se===n.FLOAT&&(Le=n.RGBA32F),se===n.HALF_FLOAT&&(Le=n.RGBA16F),se===n.UNSIGNED_BYTE&&(Le=ve===dt&&xe===!1?n.SRGB8_ALPHA8:n.RGBA8),se===n.UNSIGNED_SHORT_4_4_4_4&&(Le=n.RGBA4),se===n.UNSIGNED_SHORT_5_5_5_1&&(Le=n.RGB5_A1)),(Le===n.R16F||Le===n.R32F||Le===n.RG16F||Le===n.RG32F||Le===n.RGBA16F||Le===n.RGBA32F)&&e.get("EXT_color_buffer_float"),Le}function b(D,S,se){return A(D,se)===!0||D.isFramebufferTexture&&D.minFilter!==pn&&D.minFilter!==qn?Math.log2(Math.max(S.width,S.height))+1:D.mipmaps!==void 0&&D.mipmaps.length>0?D.mipmaps.length:D.isCompressedTexture&&Array.isArray(D.image)?S.mipmaps.length:1}function w(D){return D===pn||D===gc||D===dl?n.NEAREST:n.LINEAR}function oe(D){const S=D.target;S.removeEventListener("dispose",oe),z(S),S.isVideoTexture&&g.delete(S)}function X(D){const S=D.target;S.removeEventListener("dispose",X),G(S)}function z(D){const S=i.get(D);if(S.__webglInit===void 0)return;const se=D.source,ve=_.get(se);if(ve){const xe=ve[S.__cacheKey];xe.usedTimes--,xe.usedTimes===0&&T(D),Object.keys(ve).length===0&&_.delete(se)}i.remove(D)}function T(D){const S=i.get(D);n.deleteTexture(S.__webglTexture);const se=D.source,ve=_.get(se);delete ve[S.__cacheKey],o.memory.textures--}function G(D){const S=D.texture,se=i.get(D),ve=i.get(S);if(ve.__webglTexture!==void 0&&(n.deleteTexture(ve.__webglTexture),o.memory.textures--),D.depthTexture&&D.depthTexture.dispose(),D.isWebGLCubeRenderTarget)for(let xe=0;xe<6;xe++)n.deleteFramebuffer(se.__webglFramebuffer[xe]),se.__webglDepthbuffer&&n.deleteRenderbuffer(se.__webglDepthbuffer[xe]);else{if(n.deleteFramebuffer(se.__webglFramebuffer),se.__webglDepthbuffer&&n.deleteRenderbuffer(se.__webglDepthbuffer),se.__webglMultisampledFramebuffer&&n.deleteFramebuffer(se.__webglMultisampledFramebuffer),se.__webglColorRenderbuffer)for(let xe=0;xe<se.__webglColorRenderbuffer.length;xe++)se.__webglColorRenderbuffer[xe]&&n.deleteRenderbuffer(se.__webglColorRenderbuffer[xe]);se.__webglDepthRenderbuffer&&n.deleteRenderbuffer(se.__webglDepthRenderbuffer)}if(D.isWebGLMultipleRenderTargets)for(let xe=0,Le=S.length;xe<Le;xe++){const W=i.get(S[xe]);W.__webglTexture&&(n.deleteTexture(W.__webglTexture),o.memory.textures--),i.remove(S[xe])}i.remove(S),i.remove(D)}let re=0;function ae(){re=0}function C(){const D=re;return D>=l&&console.warn("THREE.WebGLTextures: Trying to use "+D+" texture units while this GPU supports only "+l),re+=1,D}function J(D){const S=[];return S.push(D.wrapS),S.push(D.wrapT),S.push(D.wrapR||0),S.push(D.magFilter),S.push(D.minFilter),S.push(D.anisotropy),S.push(D.internalFormat),S.push(D.format),S.push(D.type),S.push(D.generateMipmaps),S.push(D.premultiplyAlpha),S.push(D.flipY),S.push(D.unpackAlignment),S.push(D.colorSpace),S.join()}function $(D,S){const se=i.get(D);if(D.isVideoTexture&&Re(D),D.isRenderTargetTexture===!1&&D.version>0&&se.__version!==D.version){const ve=D.image;if(ve===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(ve.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Fe(se,D,S);return}}t.bindTexture(n.TEXTURE_2D,se.__webglTexture,n.TEXTURE0+S)}function ee(D,S){const se=i.get(D);if(D.version>0&&se.__version!==D.version){Fe(se,D,S);return}t.bindTexture(n.TEXTURE_2D_ARRAY,se.__webglTexture,n.TEXTURE0+S)}function U(D,S){const se=i.get(D);if(D.version>0&&se.__version!==D.version){Fe(se,D,S);return}t.bindTexture(n.TEXTURE_3D,se.__webglTexture,n.TEXTURE0+S)}function N(D,S){const se=i.get(D);if(D.version>0&&se.__version!==D.version){Oe(se,D,S);return}t.bindTexture(n.TEXTURE_CUBE_MAP,se.__webglTexture,n.TEXTURE0+S)}const le={[ur]:n.REPEAT,[hi]:n.CLAMP_TO_EDGE,[xl]:n.MIRRORED_REPEAT},Y={[pn]:n.NEAREST,[gc]:n.NEAREST_MIPMAP_NEAREST,[dl]:n.NEAREST_MIPMAP_LINEAR,[qn]:n.LINEAR,[l0]:n.LINEAR_MIPMAP_NEAREST,[cr]:n.LINEAR_MIPMAP_LINEAR};function ce(D,S,se){if(se?(n.texParameteri(D,n.TEXTURE_WRAP_S,le[S.wrapS]),n.texParameteri(D,n.TEXTURE_WRAP_T,le[S.wrapT]),(D===n.TEXTURE_3D||D===n.TEXTURE_2D_ARRAY)&&n.texParameteri(D,n.TEXTURE_WRAP_R,le[S.wrapR]),n.texParameteri(D,n.TEXTURE_MAG_FILTER,Y[S.magFilter]),n.texParameteri(D,n.TEXTURE_MIN_FILTER,Y[S.minFilter])):(n.texParameteri(D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE),(D===n.TEXTURE_3D||D===n.TEXTURE_2D_ARRAY)&&n.texParameteri(D,n.TEXTURE_WRAP_R,n.CLAMP_TO_EDGE),(S.wrapS!==hi||S.wrapT!==hi)&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to THREE.ClampToEdgeWrapping."),n.texParameteri(D,n.TEXTURE_MAG_FILTER,w(S.magFilter)),n.texParameteri(D,n.TEXTURE_MIN_FILTER,w(S.minFilter)),S.minFilter!==pn&&S.minFilter!==qn&&console.warn("THREE.WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to THREE.NearestFilter or THREE.LinearFilter.")),e.has("EXT_texture_filter_anisotropic")===!0){const ve=e.get("EXT_texture_filter_anisotropic");if(S.magFilter===pn||S.minFilter!==dl&&S.minFilter!==cr||S.type===Ds&&e.has("OES_texture_float_linear")===!1||a===!1&&S.type===ua&&e.has("OES_texture_half_float_linear")===!1)return;(S.anisotropy>1||i.get(S).__currentAnisotropy)&&(n.texParameterf(D,ve.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(S.anisotropy,s.getMaxAnisotropy())),i.get(S).__currentAnisotropy=S.anisotropy)}}function O(D,S){let se=!1;D.__webglInit===void 0&&(D.__webglInit=!0,S.addEventListener("dispose",oe));const ve=S.source;let xe=_.get(ve);xe===void 0&&(xe={},_.set(ve,xe));const Le=J(S);if(Le!==D.__cacheKey){xe[Le]===void 0&&(xe[Le]={texture:n.createTexture(),usedTimes:0},o.memory.textures++,se=!0),xe[Le].usedTimes++;const W=xe[D.__cacheKey];W!==void 0&&(xe[D.__cacheKey].usedTimes--,W.usedTimes===0&&T(S)),D.__cacheKey=Le,D.__webglTexture=xe[Le].texture}return se}function Fe(D,S,se){let ve=n.TEXTURE_2D;(S.isDataArrayTexture||S.isCompressedArrayTexture)&&(ve=n.TEXTURE_2D_ARRAY),S.isData3DTexture&&(ve=n.TEXTURE_3D);const xe=O(D,S),Le=S.source;t.bindTexture(ve,D.__webglTexture,n.TEXTURE0+se);const W=i.get(Le);if(Le.version!==W.__version||xe===!0){t.activeTexture(n.TEXTURE0+se),n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,S.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,S.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,n.NONE);const ye=M(S)&&x(S.image)===!1;let pe=y(S.image,ye,!1,d);pe=Te(S,pe);const ze=x(pe)||a,Ke=r.convert(S.format,S.colorSpace);let et=r.convert(S.type),qe=I(S.internalFormat,Ke,et,S.colorSpace);ce(ve,S,ze);let We;const rt=S.mipmaps,ft=a&&S.isVideoTexture!==!0,Gt=W.__version===void 0||xe===!0,ie=b(S,pe,ze);if(S.isDepthTexture)qe=n.DEPTH_COMPONENT,a?S.type===Ds?qe=n.DEPTH_COMPONENT32F:S.type===nr?qe=n.DEPTH_COMPONENT24:S.type===eo?qe=n.DEPTH24_STENCIL8:qe=n.DEPTH_COMPONENT16:S.type===Ds&&console.error("WebGLRenderer: Floating point depth texture requires WebGL2."),S.format===rr&&qe===n.DEPTH_COMPONENT&&S.type!==u0&&S.type!==nr&&(console.warn("THREE.WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture."),S.type=nr,et=r.convert(S.type)),S.format===ho&&qe===n.DEPTH_COMPONENT&&(qe=n.DEPTH_STENCIL,S.type!==eo&&(console.warn("THREE.WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture."),S.type=eo,et=r.convert(S.type))),Gt&&(ft?t.texStorage2D(n.TEXTURE_2D,1,qe,pe.width,pe.height):t.texImage2D(n.TEXTURE_2D,0,qe,pe.width,pe.height,0,Ke,et,null));else if(S.isDataTexture)if(rt.length>0&&ze){ft&&Gt&&t.texStorage2D(n.TEXTURE_2D,ie,qe,rt[0].width,rt[0].height);for(let Ee=0,Be=rt.length;Ee<Be;Ee++)We=rt[Ee],ft?t.texSubImage2D(n.TEXTURE_2D,Ee,0,0,We.width,We.height,Ke,et,We.data):t.texImage2D(n.TEXTURE_2D,Ee,qe,We.width,We.height,0,Ke,et,We.data);S.generateMipmaps=!1}else ft?(Gt&&t.texStorage2D(n.TEXTURE_2D,ie,qe,pe.width,pe.height),t.texSubImage2D(n.TEXTURE_2D,0,0,0,pe.width,pe.height,Ke,et,pe.data)):t.texImage2D(n.TEXTURE_2D,0,qe,pe.width,pe.height,0,Ke,et,pe.data);else if(S.isCompressedTexture)if(S.isCompressedArrayTexture){ft&&Gt&&t.texStorage3D(n.TEXTURE_2D_ARRAY,ie,qe,rt[0].width,rt[0].height,pe.depth);for(let Ee=0,Be=rt.length;Ee<Be;Ee++)We=rt[Ee],S.format!==fi?Ke!==null?ft?t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,Ee,0,0,0,We.width,We.height,pe.depth,Ke,We.data,0,0):t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,Ee,qe,We.width,We.height,pe.depth,0,We.data,0,0):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):ft?t.texSubImage3D(n.TEXTURE_2D_ARRAY,Ee,0,0,0,We.width,We.height,pe.depth,Ke,et,We.data):t.texImage3D(n.TEXTURE_2D_ARRAY,Ee,qe,We.width,We.height,pe.depth,0,Ke,et,We.data)}else{ft&&Gt&&t.texStorage2D(n.TEXTURE_2D,ie,qe,rt[0].width,rt[0].height);for(let Ee=0,Be=rt.length;Ee<Be;Ee++)We=rt[Ee],S.format!==fi?Ke!==null?ft?t.compressedTexSubImage2D(n.TEXTURE_2D,Ee,0,0,We.width,We.height,Ke,We.data):t.compressedTexImage2D(n.TEXTURE_2D,Ee,qe,We.width,We.height,0,We.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):ft?t.texSubImage2D(n.TEXTURE_2D,Ee,0,0,We.width,We.height,Ke,et,We.data):t.texImage2D(n.TEXTURE_2D,Ee,qe,We.width,We.height,0,Ke,et,We.data)}else if(S.isDataArrayTexture)ft?(Gt&&t.texStorage3D(n.TEXTURE_2D_ARRAY,ie,qe,pe.width,pe.height,pe.depth),t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,pe.width,pe.height,pe.depth,Ke,et,pe.data)):t.texImage3D(n.TEXTURE_2D_ARRAY,0,qe,pe.width,pe.height,pe.depth,0,Ke,et,pe.data);else if(S.isData3DTexture)ft?(Gt&&t.texStorage3D(n.TEXTURE_3D,ie,qe,pe.width,pe.height,pe.depth),t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,pe.width,pe.height,pe.depth,Ke,et,pe.data)):t.texImage3D(n.TEXTURE_3D,0,qe,pe.width,pe.height,pe.depth,0,Ke,et,pe.data);else if(S.isFramebufferTexture){if(Gt)if(ft)t.texStorage2D(n.TEXTURE_2D,ie,qe,pe.width,pe.height);else{let Ee=pe.width,Be=pe.height;for(let Ze=0;Ze<ie;Ze++)t.texImage2D(n.TEXTURE_2D,Ze,qe,Ee,Be,0,Ke,et,null),Ee>>=1,Be>>=1}}else if(rt.length>0&&ze){ft&&Gt&&t.texStorage2D(n.TEXTURE_2D,ie,qe,rt[0].width,rt[0].height);for(let Ee=0,Be=rt.length;Ee<Be;Ee++)We=rt[Ee],ft?t.texSubImage2D(n.TEXTURE_2D,Ee,0,0,Ke,et,We):t.texImage2D(n.TEXTURE_2D,Ee,qe,Ke,et,We);S.generateMipmaps=!1}else ft?(Gt&&t.texStorage2D(n.TEXTURE_2D,ie,qe,pe.width,pe.height),t.texSubImage2D(n.TEXTURE_2D,0,0,0,Ke,et,pe)):t.texImage2D(n.TEXTURE_2D,0,qe,Ke,et,pe);A(S,ze)&&F(ve),W.__version=Le.version,S.onUpdate&&S.onUpdate(S)}D.__version=S.version}function Oe(D,S,se){if(S.image.length!==6)return;const ve=O(D,S),xe=S.source;t.bindTexture(n.TEXTURE_CUBE_MAP,D.__webglTexture,n.TEXTURE0+se);const Le=i.get(xe);if(xe.version!==Le.__version||ve===!0){t.activeTexture(n.TEXTURE0+se),n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,S.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,S.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,n.NONE);const W=S.isCompressedTexture||S.image[0].isCompressedTexture,ye=S.image[0]&&S.image[0].isDataTexture,pe=[];for(let Ee=0;Ee<6;Ee++)!W&&!ye?pe[Ee]=y(S.image[Ee],!1,!0,u):pe[Ee]=ye?S.image[Ee].image:S.image[Ee],pe[Ee]=Te(S,pe[Ee]);const ze=pe[0],Ke=x(ze)||a,et=r.convert(S.format,S.colorSpace),qe=r.convert(S.type),We=I(S.internalFormat,et,qe,S.colorSpace),rt=a&&S.isVideoTexture!==!0,ft=Le.__version===void 0||ve===!0;let Gt=b(S,ze,Ke);ce(n.TEXTURE_CUBE_MAP,S,Ke);let ie;if(W){rt&&ft&&t.texStorage2D(n.TEXTURE_CUBE_MAP,Gt,We,ze.width,ze.height);for(let Ee=0;Ee<6;Ee++){ie=pe[Ee].mipmaps;for(let Be=0;Be<ie.length;Be++){const Ze=ie[Be];S.format!==fi?et!==null?rt?t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Ee,Be,0,0,Ze.width,Ze.height,et,Ze.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Ee,Be,We,Ze.width,Ze.height,0,Ze.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):rt?t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Ee,Be,0,0,Ze.width,Ze.height,et,qe,Ze.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Ee,Be,We,Ze.width,Ze.height,0,et,qe,Ze.data)}}}else{ie=S.mipmaps,rt&&ft&&(ie.length>0&&Gt++,t.texStorage2D(n.TEXTURE_CUBE_MAP,Gt,We,pe[0].width,pe[0].height));for(let Ee=0;Ee<6;Ee++)if(ye){rt?t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Ee,0,0,0,pe[Ee].width,pe[Ee].height,et,qe,pe[Ee].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Ee,0,We,pe[Ee].width,pe[Ee].height,0,et,qe,pe[Ee].data);for(let Be=0;Be<ie.length;Be++){const nt=ie[Be].image[Ee].image;rt?t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Ee,Be+1,0,0,nt.width,nt.height,et,qe,nt.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Ee,Be+1,We,nt.width,nt.height,0,et,qe,nt.data)}}else{rt?t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Ee,0,0,0,et,qe,pe[Ee]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Ee,0,We,et,qe,pe[Ee]);for(let Be=0;Be<ie.length;Be++){const Ze=ie[Be];rt?t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Ee,Be+1,0,0,et,qe,Ze.image[Ee]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+Ee,Be+1,We,et,qe,Ze.image[Ee])}}}A(S,Ke)&&F(n.TEXTURE_CUBE_MAP),Le.__version=xe.version,S.onUpdate&&S.onUpdate(S)}D.__version=S.version}function Pe(D,S,se,ve,xe){const Le=r.convert(se.format,se.colorSpace),W=r.convert(se.type),ye=I(se.internalFormat,Le,W,se.colorSpace);i.get(S).__hasExternalTextures||(xe===n.TEXTURE_3D||xe===n.TEXTURE_2D_ARRAY?t.texImage3D(xe,0,ye,S.width,S.height,S.depth,0,Le,W,null):t.texImage2D(xe,0,ye,S.width,S.height,0,Le,W,null)),t.bindFramebuffer(n.FRAMEBUFFER,D),Ae(S)?f.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,ve,xe,i.get(se).__webglTexture,0,Ie(S)):(xe===n.TEXTURE_2D||xe>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&xe<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,ve,xe,i.get(se).__webglTexture,0),t.bindFramebuffer(n.FRAMEBUFFER,null)}function Ne(D,S,se){if(n.bindRenderbuffer(n.RENDERBUFFER,D),S.depthBuffer&&!S.stencilBuffer){let ve=n.DEPTH_COMPONENT16;if(se||Ae(S)){const xe=S.depthTexture;xe&&xe.isDepthTexture&&(xe.type===Ds?ve=n.DEPTH_COMPONENT32F:xe.type===nr&&(ve=n.DEPTH_COMPONENT24));const Le=Ie(S);Ae(S)?f.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Le,ve,S.width,S.height):n.renderbufferStorageMultisample(n.RENDERBUFFER,Le,ve,S.width,S.height)}else n.renderbufferStorage(n.RENDERBUFFER,ve,S.width,S.height);n.framebufferRenderbuffer(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.RENDERBUFFER,D)}else if(S.depthBuffer&&S.stencilBuffer){const ve=Ie(S);se&&Ae(S)===!1?n.renderbufferStorageMultisample(n.RENDERBUFFER,ve,n.DEPTH24_STENCIL8,S.width,S.height):Ae(S)?f.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,ve,n.DEPTH24_STENCIL8,S.width,S.height):n.renderbufferStorage(n.RENDERBUFFER,n.DEPTH_STENCIL,S.width,S.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.RENDERBUFFER,D)}else{const ve=S.isWebGLMultipleRenderTargets===!0?S.texture:[S.texture];for(let xe=0;xe<ve.length;xe++){const Le=ve[xe],W=r.convert(Le.format,Le.colorSpace),ye=r.convert(Le.type),pe=I(Le.internalFormat,W,ye,Le.colorSpace),ze=Ie(S);se&&Ae(S)===!1?n.renderbufferStorageMultisample(n.RENDERBUFFER,ze,pe,S.width,S.height):Ae(S)?f.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,ze,pe,S.width,S.height):n.renderbufferStorage(n.RENDERBUFFER,pe,S.width,S.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function P(D,S){if(S&&S.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(n.FRAMEBUFFER,D),!(S.depthTexture&&S.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!i.get(S.depthTexture).__webglTexture||S.depthTexture.image.width!==S.width||S.depthTexture.image.height!==S.height)&&(S.depthTexture.image.width=S.width,S.depthTexture.image.height=S.height,S.depthTexture.needsUpdate=!0),$(S.depthTexture,0);const ve=i.get(S.depthTexture).__webglTexture,xe=Ie(S);if(S.depthTexture.format===rr)Ae(S)?f.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,ve,0,xe):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,ve,0);else if(S.depthTexture.format===ho)Ae(S)?f.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,ve,0,xe):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,ve,0);else throw new Error("Unknown depthTexture format")}function k(D){const S=i.get(D),se=D.isWebGLCubeRenderTarget===!0;if(D.depthTexture&&!S.__autoAllocateDepthBuffer){if(se)throw new Error("target.depthTexture not supported in Cube render targets");P(S.__webglFramebuffer,D)}else if(se){S.__webglDepthbuffer=[];for(let ve=0;ve<6;ve++)t.bindFramebuffer(n.FRAMEBUFFER,S.__webglFramebuffer[ve]),S.__webglDepthbuffer[ve]=n.createRenderbuffer(),Ne(S.__webglDepthbuffer[ve],D,!1)}else t.bindFramebuffer(n.FRAMEBUFFER,S.__webglFramebuffer),S.__webglDepthbuffer=n.createRenderbuffer(),Ne(S.__webglDepthbuffer,D,!1);t.bindFramebuffer(n.FRAMEBUFFER,null)}function ue(D,S,se){const ve=i.get(D);S!==void 0&&Pe(ve.__webglFramebuffer,D,D.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D),se!==void 0&&k(D)}function fe(D){const S=D.texture,se=i.get(D),ve=i.get(S);D.addEventListener("dispose",X),D.isWebGLMultipleRenderTargets!==!0&&(ve.__webglTexture===void 0&&(ve.__webglTexture=n.createTexture()),ve.__version=S.version,o.memory.textures++);const xe=D.isWebGLCubeRenderTarget===!0,Le=D.isWebGLMultipleRenderTargets===!0,W=x(D)||a;if(xe){se.__webglFramebuffer=[];for(let ye=0;ye<6;ye++)se.__webglFramebuffer[ye]=n.createFramebuffer()}else{if(se.__webglFramebuffer=n.createFramebuffer(),Le)if(s.drawBuffers){const ye=D.texture;for(let pe=0,ze=ye.length;pe<ze;pe++){const Ke=i.get(ye[pe]);Ke.__webglTexture===void 0&&(Ke.__webglTexture=n.createTexture(),o.memory.textures++)}}else console.warn("THREE.WebGLRenderer: WebGLMultipleRenderTargets can only be used with WebGL2 or WEBGL_draw_buffers extension.");if(a&&D.samples>0&&Ae(D)===!1){const ye=Le?S:[S];se.__webglMultisampledFramebuffer=n.createFramebuffer(),se.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,se.__webglMultisampledFramebuffer);for(let pe=0;pe<ye.length;pe++){const ze=ye[pe];se.__webglColorRenderbuffer[pe]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,se.__webglColorRenderbuffer[pe]);const Ke=r.convert(ze.format,ze.colorSpace),et=r.convert(ze.type),qe=I(ze.internalFormat,Ke,et,ze.colorSpace,D.isXRRenderTarget===!0),We=Ie(D);n.renderbufferStorageMultisample(n.RENDERBUFFER,We,qe,D.width,D.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+pe,n.RENDERBUFFER,se.__webglColorRenderbuffer[pe])}n.bindRenderbuffer(n.RENDERBUFFER,null),D.depthBuffer&&(se.__webglDepthRenderbuffer=n.createRenderbuffer(),Ne(se.__webglDepthRenderbuffer,D,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(xe){t.bindTexture(n.TEXTURE_CUBE_MAP,ve.__webglTexture),ce(n.TEXTURE_CUBE_MAP,S,W);for(let ye=0;ye<6;ye++)Pe(se.__webglFramebuffer[ye],D,S,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+ye);A(S,W)&&F(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Le){const ye=D.texture;for(let pe=0,ze=ye.length;pe<ze;pe++){const Ke=ye[pe],et=i.get(Ke);t.bindTexture(n.TEXTURE_2D,et.__webglTexture),ce(n.TEXTURE_2D,Ke,W),Pe(se.__webglFramebuffer,D,Ke,n.COLOR_ATTACHMENT0+pe,n.TEXTURE_2D),A(Ke,W)&&F(n.TEXTURE_2D)}t.unbindTexture()}else{let ye=n.TEXTURE_2D;(D.isWebGL3DRenderTarget||D.isWebGLArrayRenderTarget)&&(a?ye=D.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY:console.error("THREE.WebGLTextures: THREE.Data3DTexture and THREE.DataArrayTexture only supported with WebGL2.")),t.bindTexture(ye,ve.__webglTexture),ce(ye,S,W),Pe(se.__webglFramebuffer,D,S,n.COLOR_ATTACHMENT0,ye),A(S,W)&&F(ye),t.unbindTexture()}D.depthBuffer&&k(D)}function be(D){const S=x(D)||a,se=D.isWebGLMultipleRenderTargets===!0?D.texture:[D.texture];for(let ve=0,xe=se.length;ve<xe;ve++){const Le=se[ve];if(A(Le,S)){const W=D.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:n.TEXTURE_2D,ye=i.get(Le).__webglTexture;t.bindTexture(W,ye),F(W),t.unbindTexture()}}}function De(D){if(a&&D.samples>0&&Ae(D)===!1){const S=D.isWebGLMultipleRenderTargets?D.texture:[D.texture],se=D.width,ve=D.height;let xe=n.COLOR_BUFFER_BIT;const Le=[],W=D.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ye=i.get(D),pe=D.isWebGLMultipleRenderTargets===!0;if(pe)for(let ze=0;ze<S.length;ze++)t.bindFramebuffer(n.FRAMEBUFFER,ye.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ze,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,ye.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+ze,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,ye.__webglMultisampledFramebuffer),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,ye.__webglFramebuffer);for(let ze=0;ze<S.length;ze++){Le.push(n.COLOR_ATTACHMENT0+ze),D.depthBuffer&&Le.push(W);const Ke=ye.__ignoreDepthValues!==void 0?ye.__ignoreDepthValues:!1;if(Ke===!1&&(D.depthBuffer&&(xe|=n.DEPTH_BUFFER_BIT),D.stencilBuffer&&(xe|=n.STENCIL_BUFFER_BIT)),pe&&n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,ye.__webglColorRenderbuffer[ze]),Ke===!0&&(n.invalidateFramebuffer(n.READ_FRAMEBUFFER,[W]),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[W])),pe){const et=i.get(S[ze]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,et,0)}n.blitFramebuffer(0,0,se,ve,0,0,se,ve,xe,n.NEAREST),p&&n.invalidateFramebuffer(n.READ_FRAMEBUFFER,Le)}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),pe)for(let ze=0;ze<S.length;ze++){t.bindFramebuffer(n.FRAMEBUFFER,ye.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ze,n.RENDERBUFFER,ye.__webglColorRenderbuffer[ze]);const Ke=i.get(S[ze]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,ye.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+ze,n.TEXTURE_2D,Ke,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,ye.__webglMultisampledFramebuffer)}}function Ie(D){return Math.min(h,D.samples)}function Ae(D){const S=i.get(D);return a&&D.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&S.__useRenderToTexture!==!1}function Re(D){const S=o.render.frame;g.get(D)!==S&&(g.set(D,S),D.update())}function Te(D,S){const se=D.colorSpace,ve=D.format,xe=D.type;return D.isCompressedTexture===!0||D.format===vc||se!==ki&&se!==ar&&(se===dt?a===!1?e.has("EXT_sRGB")===!0&&ve===fi?(D.format=vc,D.minFilter=qn,D.generateMipmaps=!1):S=_0.sRGBToLinear(S):(ve!==fi||xe!==dr)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",se)),S}this.allocateTextureUnit=C,this.resetTextureUnits=ae,this.setTexture2D=$,this.setTexture2DArray=ee,this.setTexture3D=U,this.setTextureCube=N,this.rebindTextures=ue,this.setupRenderTarget=fe,this.updateRenderTargetMipmap=be,this.updateMultisampleRenderTarget=De,this.setupDepthRenderbuffer=k,this.setupFrameBufferTexture=Pe,this.useMultisampledRTT=Ae}function AS(n,e,t){const i=t.isWebGL2;function s(r,o=ar){let a;if(r===dr)return n.UNSIGNED_BYTE;if(r===e2)return n.UNSIGNED_SHORT_4_4_4_4;if(r===t2)return n.UNSIGNED_SHORT_5_5_5_1;if(r===Jx)return n.BYTE;if(r===Zx)return n.SHORT;if(r===u0)return n.UNSIGNED_SHORT;if(r===Qx)return n.INT;if(r===nr)return n.UNSIGNED_INT;if(r===Ds)return n.FLOAT;if(r===ua)return i?n.HALF_FLOAT:(a=e.get("OES_texture_half_float"),a!==null?a.HALF_FLOAT_OES:null);if(r===n2)return n.ALPHA;if(r===fi)return n.RGBA;if(r===i2)return n.LUMINANCE;if(r===s2)return n.LUMINANCE_ALPHA;if(r===rr)return n.DEPTH_COMPONENT;if(r===ho)return n.DEPTH_STENCIL;if(r===vc)return a=e.get("EXT_sRGB"),a!==null?a.SRGB_ALPHA_EXT:null;if(r===r2)return n.RED;if(r===o2)return n.RED_INTEGER;if(r===a2)return n.RG;if(r===l2)return n.RG_INTEGER;if(r===u2)return n.RGBA_INTEGER;if(r===cu||r===du||r===hu||r===fu)if(o===dt)if(a=e.get("WEBGL_compressed_texture_s3tc_srgb"),a!==null){if(r===cu)return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(r===du)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(r===hu)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(r===fu)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(a=e.get("WEBGL_compressed_texture_s3tc"),a!==null){if(r===cu)return a.COMPRESSED_RGB_S3TC_DXT1_EXT;if(r===du)return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(r===hu)return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(r===fu)return a.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(r===Bh||r===Uh||r===Nh||r===Oh)if(a=e.get("WEBGL_compressed_texture_pvrtc"),a!==null){if(r===Bh)return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(r===Uh)return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(r===Nh)return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(r===Oh)return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(r===c2)return a=e.get("WEBGL_compressed_texture_etc1"),a!==null?a.COMPRESSED_RGB_ETC1_WEBGL:null;if(r===kh||r===zh)if(a=e.get("WEBGL_compressed_texture_etc"),a!==null){if(r===kh)return o===dt?a.COMPRESSED_SRGB8_ETC2:a.COMPRESSED_RGB8_ETC2;if(r===zh)return o===dt?a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:a.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(r===Hh||r===$h||r===Vh||r===Gh||r===Wh||r===Xh||r===jh||r===qh||r===Kh||r===Yh||r===Jh||r===Zh||r===Qh||r===ef)if(a=e.get("WEBGL_compressed_texture_astc"),a!==null){if(r===Hh)return o===dt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:a.COMPRESSED_RGBA_ASTC_4x4_KHR;if(r===$h)return o===dt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:a.COMPRESSED_RGBA_ASTC_5x4_KHR;if(r===Vh)return o===dt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:a.COMPRESSED_RGBA_ASTC_5x5_KHR;if(r===Gh)return o===dt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:a.COMPRESSED_RGBA_ASTC_6x5_KHR;if(r===Wh)return o===dt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:a.COMPRESSED_RGBA_ASTC_6x6_KHR;if(r===Xh)return o===dt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:a.COMPRESSED_RGBA_ASTC_8x5_KHR;if(r===jh)return o===dt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:a.COMPRESSED_RGBA_ASTC_8x6_KHR;if(r===qh)return o===dt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:a.COMPRESSED_RGBA_ASTC_8x8_KHR;if(r===Kh)return o===dt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:a.COMPRESSED_RGBA_ASTC_10x5_KHR;if(r===Yh)return o===dt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:a.COMPRESSED_RGBA_ASTC_10x6_KHR;if(r===Jh)return o===dt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:a.COMPRESSED_RGBA_ASTC_10x8_KHR;if(r===Zh)return o===dt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:a.COMPRESSED_RGBA_ASTC_10x10_KHR;if(r===Qh)return o===dt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:a.COMPRESSED_RGBA_ASTC_12x10_KHR;if(r===ef)return o===dt?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:a.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(r===pu)if(a=e.get("EXT_texture_compression_bptc"),a!==null){if(r===pu)return o===dt?a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:a.COMPRESSED_RGBA_BPTC_UNORM_EXT}else return null;if(r===d2||r===tf||r===nf||r===sf)if(a=e.get("EXT_texture_compression_rgtc"),a!==null){if(r===pu)return a.COMPRESSED_RED_RGTC1_EXT;if(r===tf)return a.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(r===nf)return a.COMPRESSED_RED_GREEN_RGTC2_EXT;if(r===sf)return a.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return r===eo?i?n.UNSIGNED_INT_24_8:(a=e.get("WEBGL_depth_texture"),a!==null?a.UNSIGNED_INT_24_8_WEBGL:null):n[r]!==void 0?n[r]:null}return{convert:s}}class SS extends Fn{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class vt extends Vt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const wS={type:"move"};class Nu{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new vt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new vt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new L,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new L),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new vt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new L,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new L),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let s=null,r=null,o=null;const a=this._targetRay,l=this._grip,u=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(u&&e.hand){o=!0;for(const v of e.hand.values()){const _=t.getJointPose(v,i),m=this._getHandJoint(u,v);_!==null&&(m.matrix.fromArray(_.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=_.radius),m.visible=_!==null}const d=u.joints["index-finger-tip"],h=u.joints["thumb-tip"],f=d.position.distanceTo(h.position),p=.02,g=.005;u.inputState.pinching&&f>p+g?(u.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!u.inputState.pinching&&f<=p-g&&(u.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,i),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(s=t.getPose(e.targetRaySpace,i),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(wS)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),u!==null&&(u.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const i=new vt;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}}class TS extends vn{constructor(e,t,i,s,r,o,a,l,u,d){if(d=d!==void 0?d:rr,d!==rr&&d!==ho)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");i===void 0&&d===rr&&(i=nr),i===void 0&&d===ho&&(i=eo),super(null,s,r,o,a,l,d,i,u),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=a!==void 0?a:pn,this.minFilter=l!==void 0?l:pn,this.flipY=!1,this.generateMipmaps=!1}}class CS extends zs{constructor(e,t){super();const i=this;let s=null,r=1,o=null,a="local-floor",l=1,u=null,d=null,h=null,f=null,p=null,g=null;const v=t.getContextAttributes();let _=null,m=null;const E=[],y=[],x=new Set,M=new Map,A=new Fn;A.layers.enable(1),A.viewport=new Ot;const F=new Fn;F.layers.enable(2),F.viewport=new Ot;const I=[A,F],b=new SS;b.layers.enable(1),b.layers.enable(2);let w=null,oe=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(N){let le=E[N];return le===void 0&&(le=new Nu,E[N]=le),le.getTargetRaySpace()},this.getControllerGrip=function(N){let le=E[N];return le===void 0&&(le=new Nu,E[N]=le),le.getGripSpace()},this.getHand=function(N){let le=E[N];return le===void 0&&(le=new Nu,E[N]=le),le.getHandSpace()};function X(N){const le=y.indexOf(N.inputSource);if(le===-1)return;const Y=E[le];Y!==void 0&&(Y.update(N.inputSource,N.frame,u||o),Y.dispatchEvent({type:N.type,data:N.inputSource}))}function z(){s.removeEventListener("select",X),s.removeEventListener("selectstart",X),s.removeEventListener("selectend",X),s.removeEventListener("squeeze",X),s.removeEventListener("squeezestart",X),s.removeEventListener("squeezeend",X),s.removeEventListener("end",z),s.removeEventListener("inputsourceschange",T);for(let N=0;N<E.length;N++){const le=y[N];le!==null&&(y[N]=null,E[N].disconnect(le))}w=null,oe=null,e.setRenderTarget(_),p=null,f=null,h=null,s=null,m=null,U.stop(),i.isPresenting=!1,i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(N){r=N,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(N){a=N,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return u||o},this.setReferenceSpace=function(N){u=N},this.getBaseLayer=function(){return f!==null?f:p},this.getBinding=function(){return h},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(N){if(s=N,s!==null){if(_=e.getRenderTarget(),s.addEventListener("select",X),s.addEventListener("selectstart",X),s.addEventListener("selectend",X),s.addEventListener("squeeze",X),s.addEventListener("squeezestart",X),s.addEventListener("squeezeend",X),s.addEventListener("end",z),s.addEventListener("inputsourceschange",T),v.xrCompatible!==!0&&await t.makeXRCompatible(),s.renderState.layers===void 0||e.capabilities.isWebGL2===!1){const le={antialias:s.renderState.layers===void 0?v.antialias:!0,alpha:!0,depth:v.depth,stencil:v.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(s,t,le),s.updateRenderState({baseLayer:p}),m=new hr(p.framebufferWidth,p.framebufferHeight,{format:fi,type:dr,colorSpace:e.outputColorSpace,stencilBuffer:v.stencil})}else{let le=null,Y=null,ce=null;v.depth&&(ce=v.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,le=v.stencil?ho:rr,Y=v.stencil?eo:nr);const O={colorFormat:t.RGBA8,depthFormat:ce,scaleFactor:r};h=new XRWebGLBinding(s,t),f=h.createProjectionLayer(O),s.updateRenderState({layers:[f]}),m=new hr(f.textureWidth,f.textureHeight,{format:fi,type:dr,depthTexture:new TS(f.textureWidth,f.textureHeight,Y,void 0,void 0,void 0,void 0,void 0,void 0,le),stencilBuffer:v.stencil,colorSpace:e.outputColorSpace,samples:v.antialias?4:0});const Fe=e.properties.get(m);Fe.__ignoreDepthValues=f.ignoreDepthValues}m.isXRRenderTarget=!0,this.setFoveation(l),u=null,o=await s.requestReferenceSpace(a),U.setContext(s),U.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode};function T(N){for(let le=0;le<N.removed.length;le++){const Y=N.removed[le],ce=y.indexOf(Y);ce>=0&&(y[ce]=null,E[ce].disconnect(Y))}for(let le=0;le<N.added.length;le++){const Y=N.added[le];let ce=y.indexOf(Y);if(ce===-1){for(let Fe=0;Fe<E.length;Fe++)if(Fe>=y.length){y.push(Y),ce=Fe;break}else if(y[Fe]===null){y[Fe]=Y,ce=Fe;break}if(ce===-1)break}const O=E[ce];O&&O.connect(Y)}}const G=new L,re=new L;function ae(N,le,Y){G.setFromMatrixPosition(le.matrixWorld),re.setFromMatrixPosition(Y.matrixWorld);const ce=G.distanceTo(re),O=le.projectionMatrix.elements,Fe=Y.projectionMatrix.elements,Oe=O[14]/(O[10]-1),Pe=O[14]/(O[10]+1),Ne=(O[9]+1)/O[5],P=(O[9]-1)/O[5],k=(O[8]-1)/O[0],ue=(Fe[8]+1)/Fe[0],fe=Oe*k,be=Oe*ue,De=ce/(-k+ue),Ie=De*-k;le.matrixWorld.decompose(N.position,N.quaternion,N.scale),N.translateX(Ie),N.translateZ(De),N.matrixWorld.compose(N.position,N.quaternion,N.scale),N.matrixWorldInverse.copy(N.matrixWorld).invert();const Ae=Oe+De,Re=Pe+De,Te=fe-Ie,D=be+(ce-Ie),S=Ne*Pe/Re*Ae,se=P*Pe/Re*Ae;N.projectionMatrix.makePerspective(Te,D,S,se,Ae,Re),N.projectionMatrixInverse.copy(N.projectionMatrix).invert()}function C(N,le){le===null?N.matrixWorld.copy(N.matrix):N.matrixWorld.multiplyMatrices(le.matrixWorld,N.matrix),N.matrixWorldInverse.copy(N.matrixWorld).invert()}this.updateCamera=function(N){if(s===null)return;b.near=F.near=A.near=N.near,b.far=F.far=A.far=N.far,(w!==b.near||oe!==b.far)&&(s.updateRenderState({depthNear:b.near,depthFar:b.far}),w=b.near,oe=b.far);const le=N.parent,Y=b.cameras;C(b,le);for(let ce=0;ce<Y.length;ce++)C(Y[ce],le);Y.length===2?ae(b,A,F):b.projectionMatrix.copy(A.projectionMatrix),J(N,b,le)};function J(N,le,Y){Y===null?N.matrix.copy(le.matrixWorld):(N.matrix.copy(Y.matrixWorld),N.matrix.invert(),N.matrix.multiply(le.matrixWorld)),N.matrix.decompose(N.position,N.quaternion,N.scale),N.updateMatrixWorld(!0);const ce=N.children;for(let O=0,Fe=ce.length;O<Fe;O++)ce[O].updateMatrixWorld(!0);N.projectionMatrix.copy(le.projectionMatrix),N.projectionMatrixInverse.copy(le.projectionMatrixInverse),N.isPerspectiveCamera&&(N.fov=po*2*Math.atan(1/N.projectionMatrix.elements[5]),N.zoom=1)}this.getCamera=function(){return b},this.getFoveation=function(){if(!(f===null&&p===null))return l},this.setFoveation=function(N){l=N,f!==null&&(f.fixedFoveation=N),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=N)},this.getPlanes=function(){return x};let $=null;function ee(N,le){if(d=le.getViewerPose(u||o),g=le,d!==null){const Y=d.views;p!==null&&(e.setRenderTargetFramebuffer(m,p.framebuffer),e.setRenderTarget(m));let ce=!1;Y.length!==b.cameras.length&&(b.cameras.length=0,ce=!0);for(let O=0;O<Y.length;O++){const Fe=Y[O];let Oe=null;if(p!==null)Oe=p.getViewport(Fe);else{const Ne=h.getViewSubImage(f,Fe);Oe=Ne.viewport,O===0&&(e.setRenderTargetTextures(m,Ne.colorTexture,f.ignoreDepthValues?void 0:Ne.depthStencilTexture),e.setRenderTarget(m))}let Pe=I[O];Pe===void 0&&(Pe=new Fn,Pe.layers.enable(O),Pe.viewport=new Ot,I[O]=Pe),Pe.matrix.fromArray(Fe.transform.matrix),Pe.matrix.decompose(Pe.position,Pe.quaternion,Pe.scale),Pe.projectionMatrix.fromArray(Fe.projectionMatrix),Pe.projectionMatrixInverse.copy(Pe.projectionMatrix).invert(),Pe.viewport.set(Oe.x,Oe.y,Oe.width,Oe.height),O===0&&(b.matrix.copy(Pe.matrix),b.matrix.decompose(b.position,b.quaternion,b.scale)),ce===!0&&b.cameras.push(Pe)}}for(let Y=0;Y<E.length;Y++){const ce=y[Y],O=E[Y];ce!==null&&O!==void 0&&O.update(ce,le,u||o)}if($&&$(N,le),le.detectedPlanes){i.dispatchEvent({type:"planesdetected",data:le.detectedPlanes});let Y=null;for(const ce of x)le.detectedPlanes.has(ce)||(Y===null&&(Y=[]),Y.push(ce));if(Y!==null)for(const ce of Y)x.delete(ce),M.delete(ce),i.dispatchEvent({type:"planeremoved",data:ce});for(const ce of le.detectedPlanes)if(!x.has(ce))x.add(ce),M.set(ce,le.lastChangedTime),i.dispatchEvent({type:"planeadded",data:ce});else{const O=M.get(ce);ce.lastChangedTime>O&&(M.set(ce,ce.lastChangedTime),i.dispatchEvent({type:"planechanged",data:ce}))}}g=null}const U=new w0;U.setAnimationLoop(ee),this.setAnimationLoop=function(N){$=N},this.dispose=function(){}}}function DS(n,e){function t(_,m){_.matrixAutoUpdate===!0&&_.updateMatrix(),m.value.copy(_.matrix)}function i(_,m){m.color.getRGB(_.fogColor.value,M0(n)),m.isFog?(_.fogNear.value=m.near,_.fogFar.value=m.far):m.isFogExp2&&(_.fogDensity.value=m.density)}function s(_,m,E,y,x){m.isMeshBasicMaterial||m.isMeshLambertMaterial?r(_,m):m.isMeshToonMaterial?(r(_,m),h(_,m)):m.isMeshPhongMaterial?(r(_,m),d(_,m)):m.isMeshStandardMaterial?(r(_,m),f(_,m),m.isMeshPhysicalMaterial&&p(_,m,x)):m.isMeshMatcapMaterial?(r(_,m),g(_,m)):m.isMeshDepthMaterial?r(_,m):m.isMeshDistanceMaterial?(r(_,m),v(_,m)):m.isMeshNormalMaterial?r(_,m):m.isLineBasicMaterial?(o(_,m),m.isLineDashedMaterial&&a(_,m)):m.isPointsMaterial?l(_,m,E,y):m.isSpriteMaterial?u(_,m):m.isShadowMaterial?(_.color.value.copy(m.color),_.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function r(_,m){_.opacity.value=m.opacity,m.color&&_.diffuse.value.copy(m.color),m.emissive&&_.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(_.map.value=m.map,t(m.map,_.mapTransform)),m.alphaMap&&(_.alphaMap.value=m.alphaMap,t(m.alphaMap,_.alphaMapTransform)),m.bumpMap&&(_.bumpMap.value=m.bumpMap,t(m.bumpMap,_.bumpMapTransform),_.bumpScale.value=m.bumpScale,m.side===Yn&&(_.bumpScale.value*=-1)),m.normalMap&&(_.normalMap.value=m.normalMap,t(m.normalMap,_.normalMapTransform),_.normalScale.value.copy(m.normalScale),m.side===Yn&&_.normalScale.value.negate()),m.displacementMap&&(_.displacementMap.value=m.displacementMap,t(m.displacementMap,_.displacementMapTransform),_.displacementScale.value=m.displacementScale,_.displacementBias.value=m.displacementBias),m.emissiveMap&&(_.emissiveMap.value=m.emissiveMap,t(m.emissiveMap,_.emissiveMapTransform)),m.specularMap&&(_.specularMap.value=m.specularMap,t(m.specularMap,_.specularMapTransform)),m.alphaTest>0&&(_.alphaTest.value=m.alphaTest);const E=e.get(m).envMap;if(E&&(_.envMap.value=E,_.flipEnvMap.value=E.isCubeTexture&&E.isRenderTargetTexture===!1?-1:1,_.reflectivity.value=m.reflectivity,_.ior.value=m.ior,_.refractionRatio.value=m.refractionRatio),m.lightMap){_.lightMap.value=m.lightMap;const y=n.useLegacyLights===!0?Math.PI:1;_.lightMapIntensity.value=m.lightMapIntensity*y,t(m.lightMap,_.lightMapTransform)}m.aoMap&&(_.aoMap.value=m.aoMap,_.aoMapIntensity.value=m.aoMapIntensity,t(m.aoMap,_.aoMapTransform))}function o(_,m){_.diffuse.value.copy(m.color),_.opacity.value=m.opacity,m.map&&(_.map.value=m.map,t(m.map,_.mapTransform))}function a(_,m){_.dashSize.value=m.dashSize,_.totalSize.value=m.dashSize+m.gapSize,_.scale.value=m.scale}function l(_,m,E,y){_.diffuse.value.copy(m.color),_.opacity.value=m.opacity,_.size.value=m.size*E,_.scale.value=y*.5,m.map&&(_.map.value=m.map,t(m.map,_.uvTransform)),m.alphaMap&&(_.alphaMap.value=m.alphaMap),m.alphaTest>0&&(_.alphaTest.value=m.alphaTest)}function u(_,m){_.diffuse.value.copy(m.color),_.opacity.value=m.opacity,_.rotation.value=m.rotation,m.map&&(_.map.value=m.map,t(m.map,_.mapTransform)),m.alphaMap&&(_.alphaMap.value=m.alphaMap),m.alphaTest>0&&(_.alphaTest.value=m.alphaTest)}function d(_,m){_.specular.value.copy(m.specular),_.shininess.value=Math.max(m.shininess,1e-4)}function h(_,m){m.gradientMap&&(_.gradientMap.value=m.gradientMap)}function f(_,m){_.metalness.value=m.metalness,m.metalnessMap&&(_.metalnessMap.value=m.metalnessMap,t(m.metalnessMap,_.metalnessMapTransform)),_.roughness.value=m.roughness,m.roughnessMap&&(_.roughnessMap.value=m.roughnessMap,t(m.roughnessMap,_.roughnessMapTransform)),e.get(m).envMap&&(_.envMapIntensity.value=m.envMapIntensity)}function p(_,m,E){_.ior.value=m.ior,m.sheen>0&&(_.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),_.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(_.sheenColorMap.value=m.sheenColorMap,t(m.sheenColorMap,_.sheenColorMapTransform)),m.sheenRoughnessMap&&(_.sheenRoughnessMap.value=m.sheenRoughnessMap,t(m.sheenRoughnessMap,_.sheenRoughnessMapTransform))),m.clearcoat>0&&(_.clearcoat.value=m.clearcoat,_.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(_.clearcoatMap.value=m.clearcoatMap,t(m.clearcoatMap,_.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(_.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,t(m.clearcoatRoughnessMap,_.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(_.clearcoatNormalMap.value=m.clearcoatNormalMap,t(m.clearcoatNormalMap,_.clearcoatNormalMapTransform),_.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===Yn&&_.clearcoatNormalScale.value.negate())),m.iridescence>0&&(_.iridescence.value=m.iridescence,_.iridescenceIOR.value=m.iridescenceIOR,_.iridescenceThicknessMinimum.value=m.iridescenceThicknessRange[0],_.iridescenceThicknessMaximum.value=m.iridescenceThicknessRange[1],m.iridescenceMap&&(_.iridescenceMap.value=m.iridescenceMap,t(m.iridescenceMap,_.iridescenceMapTransform)),m.iridescenceThicknessMap&&(_.iridescenceThicknessMap.value=m.iridescenceThicknessMap,t(m.iridescenceThicknessMap,_.iridescenceThicknessMapTransform))),m.transmission>0&&(_.transmission.value=m.transmission,_.transmissionSamplerMap.value=E.texture,_.transmissionSamplerSize.value.set(E.width,E.height),m.transmissionMap&&(_.transmissionMap.value=m.transmissionMap,t(m.transmissionMap,_.transmissionMapTransform)),_.thickness.value=m.thickness,m.thicknessMap&&(_.thicknessMap.value=m.thicknessMap,t(m.thicknessMap,_.thicknessMapTransform)),_.attenuationDistance.value=m.attenuationDistance,_.attenuationColor.value.copy(m.attenuationColor)),_.specularIntensity.value=m.specularIntensity,_.specularColor.value.copy(m.specularColor),m.specularColorMap&&(_.specularColorMap.value=m.specularColorMap,t(m.specularColorMap,_.specularColorMapTransform)),m.specularIntensityMap&&(_.specularIntensityMap.value=m.specularIntensityMap,t(m.specularIntensityMap,_.specularIntensityMapTransform))}function g(_,m){m.matcap&&(_.matcap.value=m.matcap)}function v(_,m){const E=e.get(m).light;_.referencePosition.value.setFromMatrixPosition(E.matrixWorld),_.nearDistance.value=E.shadow.camera.near,_.farDistance.value=E.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function RS(n,e,t,i){let s={},r={},o=[];const a=t.isWebGL2?n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS):0;function l(E,y){const x=y.program;i.uniformBlockBinding(E,x)}function u(E,y){let x=s[E.id];x===void 0&&(g(E),x=d(E),s[E.id]=x,E.addEventListener("dispose",_));const M=y.program;i.updateUBOMapping(E,M);const A=e.render.frame;r[E.id]!==A&&(f(E),r[E.id]=A)}function d(E){const y=h();E.__bindingPointIndex=y;const x=n.createBuffer(),M=E.__size,A=E.usage;return n.bindBuffer(n.UNIFORM_BUFFER,x),n.bufferData(n.UNIFORM_BUFFER,M,A),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,y,x),x}function h(){for(let E=0;E<a;E++)if(o.indexOf(E)===-1)return o.push(E),E;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(E){const y=s[E.id],x=E.uniforms,M=E.__cache;n.bindBuffer(n.UNIFORM_BUFFER,y);for(let A=0,F=x.length;A<F;A++){const I=x[A];if(p(I,A,M)===!0){const b=I.__offset,w=Array.isArray(I.value)?I.value:[I.value];let oe=0;for(let X=0;X<w.length;X++){const z=w[X],T=v(z);typeof z=="number"?(I.__data[0]=z,n.bufferSubData(n.UNIFORM_BUFFER,b+oe,I.__data)):z.isMatrix3?(I.__data[0]=z.elements[0],I.__data[1]=z.elements[1],I.__data[2]=z.elements[2],I.__data[3]=z.elements[0],I.__data[4]=z.elements[3],I.__data[5]=z.elements[4],I.__data[6]=z.elements[5],I.__data[7]=z.elements[0],I.__data[8]=z.elements[6],I.__data[9]=z.elements[7],I.__data[10]=z.elements[8],I.__data[11]=z.elements[0]):(z.toArray(I.__data,oe),oe+=T.storage/Float32Array.BYTES_PER_ELEMENT)}n.bufferSubData(n.UNIFORM_BUFFER,b,I.__data)}}n.bindBuffer(n.UNIFORM_BUFFER,null)}function p(E,y,x){const M=E.value;if(x[y]===void 0){if(typeof M=="number")x[y]=M;else{const A=Array.isArray(M)?M:[M],F=[];for(let I=0;I<A.length;I++)F.push(A[I].clone());x[y]=F}return!0}else if(typeof M=="number"){if(x[y]!==M)return x[y]=M,!0}else{const A=Array.isArray(x[y])?x[y]:[x[y]],F=Array.isArray(M)?M:[M];for(let I=0;I<A.length;I++){const b=A[I];if(b.equals(F[I])===!1)return b.copy(F[I]),!0}}return!1}function g(E){const y=E.uniforms;let x=0;const M=16;let A=0;for(let F=0,I=y.length;F<I;F++){const b=y[F],w={boundary:0,storage:0},oe=Array.isArray(b.value)?b.value:[b.value];for(let X=0,z=oe.length;X<z;X++){const T=oe[X],G=v(T);w.boundary+=G.boundary,w.storage+=G.storage}if(b.__data=new Float32Array(w.storage/Float32Array.BYTES_PER_ELEMENT),b.__offset=x,F>0){A=x%M;const X=M-A;A!==0&&X-w.boundary<0&&(x+=M-A,b.__offset=x)}x+=w.storage}return A=x%M,A>0&&(x+=M-A),E.__size=x,E.__cache={},this}function v(E){const y={boundary:0,storage:0};return typeof E=="number"?(y.boundary=4,y.storage=4):E.isVector2?(y.boundary=8,y.storage=8):E.isVector3||E.isColor?(y.boundary=16,y.storage=12):E.isVector4?(y.boundary=16,y.storage=16):E.isMatrix3?(y.boundary=48,y.storage=48):E.isMatrix4?(y.boundary=64,y.storage=64):E.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",E),y}function _(E){const y=E.target;y.removeEventListener("dispose",_);const x=o.indexOf(y.__bindingPointIndex);o.splice(x,1),n.deleteBuffer(s[y.id]),delete s[y.id],delete r[y.id]}function m(){for(const E in s)n.deleteBuffer(s[E]);o=[],s={},r={}}return{bind:l,update:u,dispose:m}}function FS(){const n=da("canvas");return n.style.display="block",n}class fd{constructor(e={}){const{canvas:t=FS(),context:i=null,depth:s=!0,stencil:r=!0,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:u=!1,powerPreference:d="default",failIfMajorPerformanceCaveat:h=!1}=e;this.isWebGLRenderer=!0;let f;i!==null?f=i.getContextAttributes().alpha:f=o;let p=null,g=null;const v=[],_=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.outputColorSpace=dt,this.useLegacyLights=!0,this.toneMapping=rs,this.toneMappingExposure=1;const m=this;let E=!1,y=0,x=0,M=null,A=-1,F=null;const I=new Ot,b=new Ot;let w=null,oe=t.width,X=t.height,z=1,T=null,G=null;const re=new Ot(0,0,oe,X),ae=new Ot(0,0,oe,X);let C=!1;const J=new cd;let $=!1,ee=!1,U=null;const N=new xt,le=new L,Y={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};function ce(){return M===null?z:1}let O=i;function Fe(R,de){for(let te=0;te<R.length;te++){const ne=R[te],Me=t.getContext(ne,de);if(Me!==null)return Me}return null}try{const R={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:u,powerPreference:d,failIfMajorPerformanceCaveat:h};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${rd}`),t.addEventListener("webglcontextlost",We,!1),t.addEventListener("webglcontextrestored",rt,!1),t.addEventListener("webglcontextcreationerror",ft,!1),O===null){const de=["webgl2","webgl","experimental-webgl"];if(m.isWebGL1Renderer===!0&&de.shift(),O=Fe(de,R),O===null)throw Fe(de)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}O.getShaderPrecisionFormat===void 0&&(O.getShaderPrecisionFormat=function(){return{rangeMin:1,rangeMax:1,precision:1}})}catch(R){throw console.error("THREE.WebGLRenderer: "+R.message),R}let Oe,Pe,Ne,P,k,ue,fe,be,De,Ie,Ae,Re,Te,D,S,se,ve,xe,Le,W,ye,pe,ze,Ke;function et(){Oe=new $A(O),Pe=new UA(O,Oe,e),Oe.init(Pe),pe=new AS(O,Oe,Pe),Ne=new bS(O,Oe,Pe),P=new WA(O),k=new lS,ue=new MS(O,Oe,Ne,k,Pe,pe,P),fe=new OA(m),be=new HA(m),De=new ib(O,Pe),ze=new IA(O,Oe,De,Pe),Ie=new VA(O,De,P,ze),Ae=new KA(O,Ie,De,P),Le=new qA(O,Pe,ue),se=new NA(k),Re=new aS(m,fe,be,Oe,Pe,ze,se),Te=new DS(m,k),D=new cS,S=new gS(Oe,Pe),xe=new LA(m,fe,be,Ne,Ae,f,l),ve=new xS(m,Ae,Pe),Ke=new RS(O,P,Pe,Ne),W=new BA(O,Oe,P,Pe),ye=new GA(O,Oe,P,Pe),P.programs=Re.programs,m.capabilities=Pe,m.extensions=Oe,m.properties=k,m.renderLists=D,m.shadowMap=ve,m.state=Ne,m.info=P}et();const qe=new CS(m,O);this.xr=qe,this.getContext=function(){return O},this.getContextAttributes=function(){return O.getContextAttributes()},this.forceContextLoss=function(){const R=Oe.get("WEBGL_lose_context");R&&R.loseContext()},this.forceContextRestore=function(){const R=Oe.get("WEBGL_lose_context");R&&R.restoreContext()},this.getPixelRatio=function(){return z},this.setPixelRatio=function(R){R!==void 0&&(z=R,this.setSize(oe,X,!1))},this.getSize=function(R){return R.set(oe,X)},this.setSize=function(R,de,te=!0){if(qe.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}oe=R,X=de,t.width=Math.floor(R*z),t.height=Math.floor(de*z),te===!0&&(t.style.width=R+"px",t.style.height=de+"px"),this.setViewport(0,0,R,de)},this.getDrawingBufferSize=function(R){return R.set(oe*z,X*z).floor()},this.setDrawingBufferSize=function(R,de,te){oe=R,X=de,z=te,t.width=Math.floor(R*te),t.height=Math.floor(de*te),this.setViewport(0,0,R,de)},this.getCurrentViewport=function(R){return R.copy(I)},this.getViewport=function(R){return R.copy(re)},this.setViewport=function(R,de,te,ne){R.isVector4?re.set(R.x,R.y,R.z,R.w):re.set(R,de,te,ne),Ne.viewport(I.copy(re).multiplyScalar(z).floor())},this.getScissor=function(R){return R.copy(ae)},this.setScissor=function(R,de,te,ne){R.isVector4?ae.set(R.x,R.y,R.z,R.w):ae.set(R,de,te,ne),Ne.scissor(b.copy(ae).multiplyScalar(z).floor())},this.getScissorTest=function(){return C},this.setScissorTest=function(R){Ne.setScissorTest(C=R)},this.setOpaqueSort=function(R){T=R},this.setTransparentSort=function(R){G=R},this.getClearColor=function(R){return R.copy(xe.getClearColor())},this.setClearColor=function(){xe.setClearColor.apply(xe,arguments)},this.getClearAlpha=function(){return xe.getClearAlpha()},this.setClearAlpha=function(){xe.setClearAlpha.apply(xe,arguments)},this.clear=function(R=!0,de=!0,te=!0){let ne=0;R&&(ne|=O.COLOR_BUFFER_BIT),de&&(ne|=O.DEPTH_BUFFER_BIT),te&&(ne|=O.STENCIL_BUFFER_BIT),O.clear(ne)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",We,!1),t.removeEventListener("webglcontextrestored",rt,!1),t.removeEventListener("webglcontextcreationerror",ft,!1),D.dispose(),S.dispose(),k.dispose(),fe.dispose(),be.dispose(),Ae.dispose(),ze.dispose(),Ke.dispose(),Re.dispose(),qe.dispose(),qe.removeEventListener("sessionstart",nt),qe.removeEventListener("sessionend",wt),U&&(U.dispose(),U=null),Ct.stop()};function We(R){R.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),E=!0}function rt(){console.log("THREE.WebGLRenderer: Context Restored."),E=!1;const R=P.autoReset,de=ve.enabled,te=ve.autoUpdate,ne=ve.needsUpdate,Me=ve.type;et(),P.autoReset=R,ve.enabled=de,ve.autoUpdate=te,ve.needsUpdate=ne,ve.type=Me}function ft(R){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",R.statusMessage)}function Gt(R){const de=R.target;de.removeEventListener("dispose",Gt),ie(de)}function ie(R){Ee(R),k.remove(R)}function Ee(R){const de=k.get(R).programs;de!==void 0&&(de.forEach(function(te){Re.releaseProgram(te)}),R.isShaderMaterial&&Re.releaseShaderCache(R))}this.renderBufferDirect=function(R,de,te,ne,Me,Z){de===null&&(de=Y);const V=Me.isMesh&&Me.matrixWorld.determinant()<0,Q=ge(R,de,te,ne,Me);Ne.setMaterial(ne,V);let j=te.index,me=1;ne.wireframe===!0&&(j=Ie.getWireframeAttribute(te),me=2);const he=te.drawRange,_e=te.attributes.position;let Se=he.start*me,Ve=(he.start+he.count)*me;Z!==null&&(Se=Math.max(Se,Z.start*me),Ve=Math.min(Ve,(Z.start+Z.count)*me)),j!==null?(Se=Math.max(Se,0),Ve=Math.min(Ve,j.count)):_e!=null&&(Se=Math.max(Se,0),Ve=Math.min(Ve,_e.count));const Ye=Ve-Se;if(Ye<0||Ye===1/0)return;ze.setup(Me,ne,Q,te,j);let ke,Je=W;if(j!==null&&(ke=De.get(j),Je=ye,Je.setIndex(ke)),Me.isMesh)ne.wireframe===!0?(Ne.setLineWidth(ne.wireframeLinewidth*ce()),Je.setMode(O.LINES)):Je.setMode(O.TRIANGLES);else if(Me.isLine){let ot=ne.linewidth;ot===void 0&&(ot=1),Ne.setLineWidth(ot*ce()),Me.isLineSegments?Je.setMode(O.LINES):Me.isLineLoop?Je.setMode(O.LINE_LOOP):Je.setMode(O.LINE_STRIP)}else Me.isPoints?Je.setMode(O.POINTS):Me.isSprite&&Je.setMode(O.TRIANGLES);if(Me.isInstancedMesh)Je.renderInstances(Se,Ye,Me.count);else if(te.isInstancedBufferGeometry){const ot=te._maxInstanceCount!==void 0?te._maxInstanceCount:1/0,Un=Math.min(te.instanceCount,ot);Je.renderInstances(Se,Ye,Un)}else Je.render(Se,Ye)},this.compile=function(R,de){function te(ne,Me,Z){ne.transparent===!0&&ne.side===Sn&&ne.forceSinglePass===!1?(ne.side=Yn,ne.needsUpdate=!0,Ci(ne,Me,Z),ne.side=Oi,ne.needsUpdate=!0,Ci(ne,Me,Z),ne.side=Sn):Ci(ne,Me,Z)}g=S.get(R),g.init(),_.push(g),R.traverseVisible(function(ne){ne.isLight&&ne.layers.test(de.layers)&&(g.pushLight(ne),ne.castShadow&&g.pushShadow(ne))}),g.setupLights(m.useLegacyLights),R.traverse(function(ne){const Me=ne.material;if(Me)if(Array.isArray(Me))for(let Z=0;Z<Me.length;Z++){const V=Me[Z];te(V,R,ne)}else te(Me,R,ne)}),_.pop(),g=null};let Be=null;function Ze(R){Be&&Be(R)}function nt(){Ct.stop()}function wt(){Ct.start()}const Ct=new w0;Ct.setAnimationLoop(Ze),typeof self!="undefined"&&Ct.setContext(self),this.setAnimationLoop=function(R){Be=R,qe.setAnimationLoop(R),R===null?Ct.stop():Ct.start()},qe.addEventListener("sessionstart",nt),qe.addEventListener("sessionend",wt),this.render=function(R,de){if(de!==void 0&&de.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(E===!0)return;R.matrixWorldAutoUpdate===!0&&R.updateMatrixWorld(),de.parent===null&&de.matrixWorldAutoUpdate===!0&&de.updateMatrixWorld(),qe.enabled===!0&&qe.isPresenting===!0&&(qe.cameraAutoUpdate===!0&&qe.updateCamera(de),de=qe.getCamera()),R.isScene===!0&&R.onBeforeRender(m,R,de,M),g=S.get(R,_.length),g.init(),_.push(g),N.multiplyMatrices(de.projectionMatrix,de.matrixWorldInverse),J.setFromProjectionMatrix(N),ee=this.localClippingEnabled,$=se.init(this.clippingPlanes,ee),p=D.get(R,v.length),p.init(),v.push(p),tn(R,de,0,m.sortObjects),p.finish(),m.sortObjects===!0&&p.sort(T,G),$===!0&&se.beginShadows();const te=g.state.shadowsArray;if(ve.render(te,R,de),$===!0&&se.endShadows(),this.info.autoReset===!0&&this.info.reset(),xe.render(p,R),g.setupLights(m.useLegacyLights),de.isArrayCamera){const ne=de.cameras;for(let Me=0,Z=ne.length;Me<Z;Me++){const V=ne[Me];Qn(p,R,V,V.viewport)}}else Qn(p,R,de);M!==null&&(ue.updateMultisampleRenderTarget(M),ue.updateRenderTargetMipmap(M)),R.isScene===!0&&R.onAfterRender(m,R,de),ze.resetDefaultState(),A=-1,F=null,_.pop(),_.length>0?g=_[_.length-1]:g=null,v.pop(),v.length>0?p=v[v.length-1]:p=null};function tn(R,de,te,ne){if(R.visible===!1)return;if(R.layers.test(de.layers)){if(R.isGroup)te=R.renderOrder;else if(R.isLOD)R.autoUpdate===!0&&R.update(de);else if(R.isLight)g.pushLight(R),R.castShadow&&g.pushShadow(R);else if(R.isSprite){if(!R.frustumCulled||J.intersectsSprite(R)){ne&&le.setFromMatrixPosition(R.matrixWorld).applyMatrix4(N);const V=Ae.update(R),Q=R.material;Q.visible&&p.push(R,V,Q,te,le.z,null)}}else if((R.isMesh||R.isLine||R.isPoints)&&(!R.frustumCulled||J.intersectsObject(R))){R.isSkinnedMesh&&R.skeleton.frame!==P.render.frame&&(R.skeleton.update(),R.skeleton.frame=P.render.frame);const V=Ae.update(R),Q=R.material;if(ne&&(V.boundingSphere===null&&V.computeBoundingSphere(),le.copy(V.boundingSphere.center).applyMatrix4(R.matrixWorld).applyMatrix4(N)),Array.isArray(Q)){const j=V.groups;for(let me=0,he=j.length;me<he;me++){const _e=j[me],Se=Q[_e.materialIndex];Se&&Se.visible&&p.push(R,V,Se,te,le.z,_e)}}else Q.visible&&p.push(R,V,Q,te,le.z,null)}}const Z=R.children;for(let V=0,Q=Z.length;V<Q;V++)tn(Z[V],de,te,ne)}function Qn(R,de,te,ne){const Me=R.opaque,Z=R.transmissive,V=R.transparent;g.setupLightsView(te),$===!0&&se.setGlobalState(m.clippingPlanes,te),Z.length>0&&Ht(Me,Z,de,te),ne&&Ne.viewport(I.copy(ne)),Me.length>0&&xn(Me,de,te),Z.length>0&&xn(Z,de,te),V.length>0&&xn(V,de,te),Ne.buffers.depth.setTest(!0),Ne.buffers.depth.setMask(!0),Ne.buffers.color.setMask(!0),Ne.setPolygonOffset(!1)}function Ht(R,de,te,ne){if(U===null){const Q=Pe.isWebGL2;U=new hr(1024,1024,{generateMipmaps:!0,type:Oe.has("EXT_color_buffer_half_float")?ua:dr,minFilter:cr,samples:Q&&a===!0?4:0})}const Me=m.getRenderTarget();m.setRenderTarget(U),m.clear();const Z=m.toneMapping;m.toneMapping=rs,xn(R,te,ne),ue.updateMultisampleRenderTarget(U),ue.updateRenderTargetMipmap(U);let V=!1;for(let Q=0,j=de.length;Q<j;Q++){const me=de[Q],he=me.object,_e=me.geometry,Se=me.material,Ve=me.group;if(Se.side===Sn&&he.layers.test(ne.layers)){const Ye=Se.side;Se.side=Yn,Se.needsUpdate=!0,hn(he,te,ne,_e,Se,Ve),Se.side=Ye,Se.needsUpdate=!0,V=!0}}V===!0&&(ue.updateMultisampleRenderTarget(U),ue.updateRenderTargetMipmap(U)),m.setRenderTarget(Me),m.toneMapping=Z}function xn(R,de,te){const ne=de.isScene===!0?de.overrideMaterial:null;for(let Me=0,Z=R.length;Me<Z;Me++){const V=R[Me],Q=V.object,j=V.geometry,me=ne===null?V.material:ne,he=V.group;Q.layers.test(te.layers)&&hn(Q,de,te,j,me,he)}}function hn(R,de,te,ne,Me,Z){R.onBeforeRender(m,de,te,ne,Me,Z),R.modelViewMatrix.multiplyMatrices(te.matrixWorldInverse,R.matrixWorld),R.normalMatrix.getNormalMatrix(R.modelViewMatrix),Me.onBeforeRender(m,de,te,ne,R,Z),Me.transparent===!0&&Me.side===Sn&&Me.forceSinglePass===!1?(Me.side=Yn,Me.needsUpdate=!0,m.renderBufferDirect(te,de,ne,Me,R,Z),Me.side=Oi,Me.needsUpdate=!0,m.renderBufferDirect(te,de,ne,Me,R,Z),Me.side=Sn):m.renderBufferDirect(te,de,ne,Me,R,Z),R.onAfterRender(m,de,te,ne,Me,Z)}function Ci(R,de,te){de.isScene!==!0&&(de=Y);const ne=k.get(R),Me=g.state.lights,Z=g.state.shadowsArray,V=Me.state.version,Q=Re.getParameters(R,Me.state,Z,de,te),j=Re.getProgramCacheKey(Q);let me=ne.programs;ne.environment=R.isMeshStandardMaterial?de.environment:null,ne.fog=de.fog,ne.envMap=(R.isMeshStandardMaterial?be:fe).get(R.envMap||ne.environment),me===void 0&&(R.addEventListener("dispose",Gt),me=new Map,ne.programs=me);let he=me.get(j);if(he!==void 0){if(ne.currentProgram===he&&ne.lightsStateVersion===V)return we(R,Q),he}else Q.uniforms=Re.getUniforms(R),R.onBuild(te,Q,m),R.onBeforeCompile(Q,m),he=Re.acquireProgram(Q,j),me.set(j,he),ne.uniforms=Q.uniforms;const _e=ne.uniforms;(!R.isShaderMaterial&&!R.isRawShaderMaterial||R.clipping===!0)&&(_e.clippingPlanes=se.uniform),we(R,Q),ne.needsLights=Ft(R),ne.lightsStateVersion=V,ne.needsLights&&(_e.ambientLightColor.value=Me.state.ambient,_e.lightProbe.value=Me.state.probe,_e.directionalLights.value=Me.state.directional,_e.directionalLightShadows.value=Me.state.directionalShadow,_e.spotLights.value=Me.state.spot,_e.spotLightShadows.value=Me.state.spotShadow,_e.rectAreaLights.value=Me.state.rectArea,_e.ltc_1.value=Me.state.rectAreaLTC1,_e.ltc_2.value=Me.state.rectAreaLTC2,_e.pointLights.value=Me.state.point,_e.pointLightShadows.value=Me.state.pointShadow,_e.hemisphereLights.value=Me.state.hemi,_e.directionalShadowMap.value=Me.state.directionalShadowMap,_e.directionalShadowMatrix.value=Me.state.directionalShadowMatrix,_e.spotShadowMap.value=Me.state.spotShadowMap,_e.spotLightMatrix.value=Me.state.spotLightMatrix,_e.spotLightMap.value=Me.state.spotLightMap,_e.pointShadowMap.value=Me.state.pointShadowMap,_e.pointShadowMatrix.value=Me.state.pointShadowMatrix);const Se=he.getUniforms(),Ve=hl.seqWithValue(Se.seq,_e);return ne.currentProgram=he,ne.uniformsList=Ve,he}function we(R,de){const te=k.get(R);te.outputColorSpace=de.outputColorSpace,te.instancing=de.instancing,te.skinning=de.skinning,te.morphTargets=de.morphTargets,te.morphNormals=de.morphNormals,te.morphColors=de.morphColors,te.morphTargetsCount=de.morphTargetsCount,te.numClippingPlanes=de.numClippingPlanes,te.numIntersection=de.numClipIntersection,te.vertexAlphas=de.vertexAlphas,te.vertexTangents=de.vertexTangents,te.toneMapping=de.toneMapping}function ge(R,de,te,ne,Me){de.isScene!==!0&&(de=Y),ue.resetTextureUnits();const Z=de.fog,V=ne.isMeshStandardMaterial?de.environment:null,Q=M===null?m.outputColorSpace:M.isXRRenderTarget===!0?M.texture.colorSpace:ki,j=(ne.isMeshStandardMaterial?be:fe).get(ne.envMap||V),me=ne.vertexColors===!0&&!!te.attributes.color&&te.attributes.color.itemSize===4,he=!!ne.normalMap&&!!te.attributes.tangent,_e=!!te.morphAttributes.position,Se=!!te.morphAttributes.normal,Ve=!!te.morphAttributes.color,Ye=ne.toneMapped?m.toneMapping:rs,ke=te.morphAttributes.position||te.morphAttributes.normal||te.morphAttributes.color,Je=ke!==void 0?ke.length:0,ot=k.get(ne),Un=g.state.lights;if($===!0&&(ee===!0||R!==F)){const Jt=R===F&&ne.id===A;se.setState(ne,R,Jt)}let Ut=!1;ne.version===ot.__version?(ot.needsLights&&ot.lightsStateVersion!==Un.state.version||ot.outputColorSpace!==Q||Me.isInstancedMesh&&ot.instancing===!1||!Me.isInstancedMesh&&ot.instancing===!0||Me.isSkinnedMesh&&ot.skinning===!1||!Me.isSkinnedMesh&&ot.skinning===!0||ot.envMap!==j||ne.fog===!0&&ot.fog!==Z||ot.numClippingPlanes!==void 0&&(ot.numClippingPlanes!==se.numPlanes||ot.numIntersection!==se.numIntersection)||ot.vertexAlphas!==me||ot.vertexTangents!==he||ot.morphTargets!==_e||ot.morphNormals!==Se||ot.morphColors!==Ve||ot.toneMapping!==Ye||Pe.isWebGL2===!0&&ot.morphTargetsCount!==Je)&&(Ut=!0):(Ut=!0,ot.__version=ne.version);let Tn=ot.currentProgram;Ut===!0&&(Tn=Ci(ne,de,Me));let Di=!1,gi=!1,ds=!1;const Yt=Tn.getUniforms(),Nn=ot.uniforms;if(Ne.useProgram(Tn.program)&&(Di=!0,gi=!0,ds=!0),ne.id!==A&&(A=ne.id,gi=!0),Di||F!==R){if(Yt.setValue(O,"projectionMatrix",R.projectionMatrix),Pe.logarithmicDepthBuffer&&Yt.setValue(O,"logDepthBufFC",2/(Math.log(R.far+1)/Math.LN2)),F!==R&&(F=R,gi=!0,ds=!0),ne.isShaderMaterial||ne.isMeshPhongMaterial||ne.isMeshToonMaterial||ne.isMeshStandardMaterial||ne.envMap){const Jt=Yt.map.cameraPosition;Jt!==void 0&&Jt.setValue(O,le.setFromMatrixPosition(R.matrixWorld))}(ne.isMeshPhongMaterial||ne.isMeshToonMaterial||ne.isMeshLambertMaterial||ne.isMeshBasicMaterial||ne.isMeshStandardMaterial||ne.isShaderMaterial)&&Yt.setValue(O,"isOrthographic",R.isOrthographicCamera===!0),(ne.isMeshPhongMaterial||ne.isMeshToonMaterial||ne.isMeshLambertMaterial||ne.isMeshBasicMaterial||ne.isMeshStandardMaterial||ne.isShaderMaterial||ne.isShadowMaterial||Me.isSkinnedMesh)&&Yt.setValue(O,"viewMatrix",R.matrixWorldInverse)}if(Me.isSkinnedMesh){Yt.setOptional(O,Me,"bindMatrix"),Yt.setOptional(O,Me,"bindMatrixInverse");const Jt=Me.skeleton;Jt&&(Pe.floatVertexTextures?(Jt.boneTexture===null&&Jt.computeBoneTexture(),Yt.setValue(O,"boneTexture",Jt.boneTexture,ue),Yt.setValue(O,"boneTextureSize",Jt.boneTextureSize)):console.warn("THREE.WebGLRenderer: SkinnedMesh can only be used with WebGL 2. With WebGL 1 OES_texture_float and vertex textures support is required."))}const hs=te.morphAttributes;if((hs.position!==void 0||hs.normal!==void 0||hs.color!==void 0&&Pe.isWebGL2===!0)&&Le.update(Me,te,Tn),(gi||ot.receiveShadow!==Me.receiveShadow)&&(ot.receiveShadow=Me.receiveShadow,Yt.setValue(O,"receiveShadow",Me.receiveShadow)),ne.isMeshGouraudMaterial&&ne.envMap!==null&&(Nn.envMap.value=j,Nn.flipEnvMap.value=j.isCubeTexture&&j.isRenderTargetTexture===!1?-1:1),gi&&(Yt.setValue(O,"toneMappingExposure",m.toneMappingExposure),ot.needsLights&&Ge(Nn,ds),Z&&ne.fog===!0&&Te.refreshFogUniforms(Nn,Z),Te.refreshMaterialUniforms(Nn,ne,z,X,U),hl.upload(O,ot.uniformsList,Nn,ue)),ne.isShaderMaterial&&ne.uniformsNeedUpdate===!0&&(hl.upload(O,ot.uniformsList,Nn,ue),ne.uniformsNeedUpdate=!1),ne.isSpriteMaterial&&Yt.setValue(O,"center",Me.center),Yt.setValue(O,"modelViewMatrix",Me.modelViewMatrix),Yt.setValue(O,"normalMatrix",Me.normalMatrix),Yt.setValue(O,"modelMatrix",Me.matrixWorld),ne.isShaderMaterial||ne.isRawShaderMaterial){const Jt=ne.uniformsGroups;for(let Wn=0,fs=Jt.length;Wn<fs;Wn++)if(Pe.isWebGL2){const Wi=Jt[Wn];Ke.update(Wi,Tn),Ke.bind(Wi,Tn)}else console.warn("THREE.WebGLRenderer: Uniform Buffer Objects can only be used with WebGL 2.")}return Tn}function Ge(R,de){R.ambientLightColor.needsUpdate=de,R.lightProbe.needsUpdate=de,R.directionalLights.needsUpdate=de,R.directionalLightShadows.needsUpdate=de,R.pointLights.needsUpdate=de,R.pointLightShadows.needsUpdate=de,R.spotLights.needsUpdate=de,R.spotLightShadows.needsUpdate=de,R.rectAreaLights.needsUpdate=de,R.hemisphereLights.needsUpdate=de}function Ft(R){return R.isMeshLambertMaterial||R.isMeshToonMaterial||R.isMeshPhongMaterial||R.isMeshStandardMaterial||R.isShadowMaterial||R.isShaderMaterial&&R.lights===!0}this.getActiveCubeFace=function(){return y},this.getActiveMipmapLevel=function(){return x},this.getRenderTarget=function(){return M},this.setRenderTargetTextures=function(R,de,te){k.get(R.texture).__webglTexture=de,k.get(R.depthTexture).__webglTexture=te;const ne=k.get(R);ne.__hasExternalTextures=!0,ne.__hasExternalTextures&&(ne.__autoAllocateDepthBuffer=te===void 0,ne.__autoAllocateDepthBuffer||Oe.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),ne.__useRenderToTexture=!1))},this.setRenderTargetFramebuffer=function(R,de){const te=k.get(R);te.__webglFramebuffer=de,te.__useDefaultFramebuffer=de===void 0},this.setRenderTarget=function(R,de=0,te=0){M=R,y=de,x=te;let ne=!0,Me=null,Z=!1,V=!1;if(R){const j=k.get(R);j.__useDefaultFramebuffer!==void 0?(Ne.bindFramebuffer(O.FRAMEBUFFER,null),ne=!1):j.__webglFramebuffer===void 0?ue.setupRenderTarget(R):j.__hasExternalTextures&&ue.rebindTextures(R,k.get(R.texture).__webglTexture,k.get(R.depthTexture).__webglTexture);const me=R.texture;(me.isData3DTexture||me.isDataArrayTexture||me.isCompressedArrayTexture)&&(V=!0);const he=k.get(R).__webglFramebuffer;R.isWebGLCubeRenderTarget?(Me=he[de],Z=!0):Pe.isWebGL2&&R.samples>0&&ue.useMultisampledRTT(R)===!1?Me=k.get(R).__webglMultisampledFramebuffer:Me=he,I.copy(R.viewport),b.copy(R.scissor),w=R.scissorTest}else I.copy(re).multiplyScalar(z).floor(),b.copy(ae).multiplyScalar(z).floor(),w=C;if(Ne.bindFramebuffer(O.FRAMEBUFFER,Me)&&Pe.drawBuffers&&ne&&Ne.drawBuffers(R,Me),Ne.viewport(I),Ne.scissor(b),Ne.setScissorTest(w),Z){const j=k.get(R.texture);O.framebufferTexture2D(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_CUBE_MAP_POSITIVE_X+de,j.__webglTexture,te)}else if(V){const j=k.get(R.texture),me=de||0;O.framebufferTextureLayer(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0,j.__webglTexture,te||0,me)}A=-1},this.readRenderTargetPixels=function(R,de,te,ne,Me,Z,V){if(!(R&&R.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Q=k.get(R).__webglFramebuffer;if(R.isWebGLCubeRenderTarget&&V!==void 0&&(Q=Q[V]),Q){Ne.bindFramebuffer(O.FRAMEBUFFER,Q);try{const j=R.texture,me=j.format,he=j.type;if(me!==fi&&pe.convert(me)!==O.getParameter(O.IMPLEMENTATION_COLOR_READ_FORMAT)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}const _e=he===ua&&(Oe.has("EXT_color_buffer_half_float")||Pe.isWebGL2&&Oe.has("EXT_color_buffer_float"));if(he!==dr&&pe.convert(he)!==O.getParameter(O.IMPLEMENTATION_COLOR_READ_TYPE)&&!(he===Ds&&(Pe.isWebGL2||Oe.has("OES_texture_float")||Oe.has("WEBGL_color_buffer_float")))&&!_e){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}de>=0&&de<=R.width-ne&&te>=0&&te<=R.height-Me&&O.readPixels(de,te,ne,Me,pe.convert(me),pe.convert(he),Z)}finally{const j=M!==null?k.get(M).__webglFramebuffer:null;Ne.bindFramebuffer(O.FRAMEBUFFER,j)}}},this.copyFramebufferToTexture=function(R,de,te=0){const ne=Math.pow(2,-te),Me=Math.floor(de.image.width*ne),Z=Math.floor(de.image.height*ne);ue.setTexture2D(de,0),O.copyTexSubImage2D(O.TEXTURE_2D,te,0,0,R.x,R.y,Me,Z),Ne.unbindTexture()},this.copyTextureToTexture=function(R,de,te,ne=0){const Me=de.image.width,Z=de.image.height,V=pe.convert(te.format),Q=pe.convert(te.type);ue.setTexture2D(te,0),O.pixelStorei(O.UNPACK_FLIP_Y_WEBGL,te.flipY),O.pixelStorei(O.UNPACK_PREMULTIPLY_ALPHA_WEBGL,te.premultiplyAlpha),O.pixelStorei(O.UNPACK_ALIGNMENT,te.unpackAlignment),de.isDataTexture?O.texSubImage2D(O.TEXTURE_2D,ne,R.x,R.y,Me,Z,V,Q,de.image.data):de.isCompressedTexture?O.compressedTexSubImage2D(O.TEXTURE_2D,ne,R.x,R.y,de.mipmaps[0].width,de.mipmaps[0].height,V,de.mipmaps[0].data):O.texSubImage2D(O.TEXTURE_2D,ne,R.x,R.y,V,Q,de.image),ne===0&&te.generateMipmaps&&O.generateMipmap(O.TEXTURE_2D),Ne.unbindTexture()},this.copyTextureToTexture3D=function(R,de,te,ne,Me=0){if(m.isWebGL1Renderer){console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: can only be used with WebGL2.");return}const Z=R.max.x-R.min.x+1,V=R.max.y-R.min.y+1,Q=R.max.z-R.min.z+1,j=pe.convert(ne.format),me=pe.convert(ne.type);let he;if(ne.isData3DTexture)ue.setTexture3D(ne,0),he=O.TEXTURE_3D;else if(ne.isDataArrayTexture)ue.setTexture2DArray(ne,0),he=O.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}O.pixelStorei(O.UNPACK_FLIP_Y_WEBGL,ne.flipY),O.pixelStorei(O.UNPACK_PREMULTIPLY_ALPHA_WEBGL,ne.premultiplyAlpha),O.pixelStorei(O.UNPACK_ALIGNMENT,ne.unpackAlignment);const _e=O.getParameter(O.UNPACK_ROW_LENGTH),Se=O.getParameter(O.UNPACK_IMAGE_HEIGHT),Ve=O.getParameter(O.UNPACK_SKIP_PIXELS),Ye=O.getParameter(O.UNPACK_SKIP_ROWS),ke=O.getParameter(O.UNPACK_SKIP_IMAGES),Je=te.isCompressedTexture?te.mipmaps[0]:te.image;O.pixelStorei(O.UNPACK_ROW_LENGTH,Je.width),O.pixelStorei(O.UNPACK_IMAGE_HEIGHT,Je.height),O.pixelStorei(O.UNPACK_SKIP_PIXELS,R.min.x),O.pixelStorei(O.UNPACK_SKIP_ROWS,R.min.y),O.pixelStorei(O.UNPACK_SKIP_IMAGES,R.min.z),te.isDataTexture||te.isData3DTexture?O.texSubImage3D(he,Me,de.x,de.y,de.z,Z,V,Q,j,me,Je.data):te.isCompressedArrayTexture?(console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: untested support for compressed srcTexture."),O.compressedTexSubImage3D(he,Me,de.x,de.y,de.z,Z,V,Q,j,Je.data)):O.texSubImage3D(he,Me,de.x,de.y,de.z,Z,V,Q,j,me,Je),O.pixelStorei(O.UNPACK_ROW_LENGTH,_e),O.pixelStorei(O.UNPACK_IMAGE_HEIGHT,Se),O.pixelStorei(O.UNPACK_SKIP_PIXELS,Ve),O.pixelStorei(O.UNPACK_SKIP_ROWS,Ye),O.pixelStorei(O.UNPACK_SKIP_IMAGES,ke),Me===0&&ne.generateMipmaps&&O.generateMipmap(he),Ne.unbindTexture()},this.initTexture=function(R){R.isCubeTexture?ue.setTextureCube(R,0):R.isData3DTexture?ue.setTexture3D(R,0):R.isDataArrayTexture||R.isCompressedArrayTexture?ue.setTexture2DArray(R,0):ue.setTexture2D(R,0),Ne.unbindTexture()},this.resetState=function(){y=0,x=0,M=null,Ne.reset(),ze.reset()},typeof __THREE_DEVTOOLS__!="undefined"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get physicallyCorrectLights(){return console.warn("THREE.WebGLRenderer: the property .physicallyCorrectLights has been removed. Set renderer.useLegacyLights instead."),!this.useLegacyLights}set physicallyCorrectLights(e){console.warn("THREE.WebGLRenderer: the property .physicallyCorrectLights has been removed. Set renderer.useLegacyLights instead."),this.useLegacyLights=!e}get outputEncoding(){return console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace===dt?or:d0}set outputEncoding(e){console.warn("THREE.WebGLRenderer: Property .outputEncoding has been removed. Use .outputColorSpace instead."),this.outputColorSpace=e===or?dt:ki}}class PS extends fd{}PS.prototype.isWebGL1Renderer=!0;class jl{constructor(e,t=1,i=1e3){this.isFog=!0,this.name="",this.color=new ut(e),this.near=t,this.far=i}clone(){return new jl(this.color,this.near,this.far)}toJSON(){return{type:"Fog",color:this.color.getHex(),near:this.near,far:this.far}}}class F0 extends Vt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__!="undefined"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t}get autoUpdate(){return console.warn("THREE.Scene: autoUpdate was renamed to matrixWorldAutoUpdate in r144."),this.matrixWorldAutoUpdate}set autoUpdate(e){console.warn("THREE.Scene: autoUpdate was renamed to matrixWorldAutoUpdate in r144."),this.matrixWorldAutoUpdate=e}}class P0{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=bl,this.updateRange={offset:0,count:-1},this.version=0,this.uuid=Si()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,i){e*=this.stride,i*=t.stride;for(let s=0,r=this.stride;s<r;s++)this.array[e+s]=t.array[i+s];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Si()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(t,this.stride);return i.setUsage(this.usage),i}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Si()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const kn=new L;class ha{constructor(e,t,i,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=i,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,i=this.data.count;t<i;t++)kn.fromBufferAttribute(this,t),kn.applyMatrix4(e),this.setXYZ(t,kn.x,kn.y,kn.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)kn.fromBufferAttribute(this,t),kn.applyNormalMatrix(e),this.setXYZ(t,kn.x,kn.y,kn.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)kn.fromBufferAttribute(this,t),kn.transformDirection(e),this.setXYZ(t,kn.x,kn.y,kn.z);return this}setX(e,t){return this.normalized&&(t=Nt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=Nt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=Nt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=Nt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=is(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=is(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=is(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=is(t,this.array)),t}setXY(e,t,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=Nt(t,this.array),i=Nt(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this}setXYZ(e,t,i,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=Nt(t,this.array),i=Nt(i,this.array),s=Nt(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=s,this}setXYZW(e,t,i,s,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=Nt(t,this.array),i=Nt(i,this.array),s=Nt(s,this.array),r=Nt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=s,this.data.array[e+3]=r,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let i=0;i<this.count;i++){const s=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return new In(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new ha(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let i=0;i<this.count;i++){const s=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}class L0 extends wi{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new ut(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}let kr;const Po=new L,zr=new L,Hr=new L,$r=new Ue,Lo=new Ue,I0=new xt,ja=new L,Io=new L,qa=new L,jf=new Ue,Ou=new Ue,qf=new Ue;class LS extends Vt{constructor(e){if(super(),this.isSprite=!0,this.type="Sprite",kr===void 0){kr=new Zt;const t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),i=new P0(t,5);kr.setIndex([0,1,2,0,2,3]),kr.setAttribute("position",new ha(i,3,0,!1)),kr.setAttribute("uv",new ha(i,2,3,!1))}this.geometry=kr,this.material=e!==void 0?e:new L0,this.center=new Ue(.5,.5)}raycast(e,t){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),zr.setFromMatrixScale(this.matrixWorld),I0.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),Hr.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&zr.multiplyScalar(-Hr.z);const i=this.material.rotation;let s,r;i!==0&&(r=Math.cos(i),s=Math.sin(i));const o=this.center;Ka(ja.set(-.5,-.5,0),Hr,o,zr,s,r),Ka(Io.set(.5,-.5,0),Hr,o,zr,s,r),Ka(qa.set(.5,.5,0),Hr,o,zr,s,r),jf.set(0,0),Ou.set(1,0),qf.set(1,1);let a=e.ray.intersectTriangle(ja,Io,qa,!1,Po);if(a===null&&(Ka(Io.set(-.5,.5,0),Hr,o,zr,s,r),Ou.set(0,1),a=e.ray.intersectTriangle(ja,qa,Io,!1,Po),a===null))return;const l=e.ray.origin.distanceTo(Po);l<e.near||l>e.far||t.push({distance:l,point:Po.clone(),uv:di.getInterpolation(Po,ja,Io,qa,jf,Ou,qf,new Ue),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}}function Ka(n,e,t,i,s,r){$r.subVectors(n,t).addScalar(.5).multiply(i),s!==void 0?(Lo.x=r*$r.x-s*$r.y,Lo.y=s*$r.x+r*$r.y):Lo.copy($r),n.copy(e),n.x+=Lo.x,n.y+=Lo.y,n.applyMatrix4(I0)}const Kf=new L,Yf=new Ot,Jf=new Ot,IS=new L,Zf=new xt,Vr=new L;class BS extends je{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode="attached",this.bindMatrix=new xt,this.bindMatrixInverse=new xt,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){const e=this.geometry;this.boundingBox===null&&(this.boundingBox=new mn),this.boundingBox.makeEmpty();const t=e.getAttribute("position");for(let i=0;i<t.count;i++)Vr.fromBufferAttribute(t,i),this.applyBoneTransform(i,Vr),this.boundingBox.expandByPoint(Vr)}computeBoundingSphere(){const e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new ls),this.boundingSphere.makeEmpty();const t=e.getAttribute("position");for(let i=0;i<t.count;i++)Vr.fromBufferAttribute(t,i),this.applyBoneTransform(i,Vr),this.boundingSphere.expandByPoint(Vr)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,this}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){const e=new Ot,t=this.geometry.attributes.skinWeight;for(let i=0,s=t.count;i<s;i++){e.fromBufferAttribute(t,i);const r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(i,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode==="attached"?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode==="detached"?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){const i=this.skeleton,s=this.geometry;Yf.fromBufferAttribute(s.attributes.skinIndex,e),Jf.fromBufferAttribute(s.attributes.skinWeight,e),Kf.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let r=0;r<4;r++){const o=Jf.getComponent(r);if(o!==0){const a=Yf.getComponent(r);Zf.multiplyMatrices(i.bones[a].matrixWorld,i.boneInverses[a]),t.addScaledVector(IS.copy(Kf).applyMatrix4(Zf),o)}}return t.applyMatrix4(this.bindMatrixInverse)}boneTransform(e,t){return console.warn("THREE.SkinnedMesh: .boneTransform() was renamed to .applyBoneTransform() in r151."),this.applyBoneTransform(e,t)}}class B0 extends Vt{constructor(){super(),this.isBone=!0,this.type="Bone"}}class US extends vn{constructor(e=null,t=1,i=1,s,r,o,a,l,u=pn,d=pn,h,f){super(null,o,a,l,u,d,s,r,h,f),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const Qf=new xt,NS=new xt;class pd{constructor(e=[],t=[]){this.uuid=Si(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.boneTextureSize=0,this.frame=-1,this.init()}init(){const e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let i=0,s=this.bones.length;i<s;i++)this.boneInverses.push(new xt)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){const i=new xt;this.bones[e]&&i.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(i)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){const i=this.bones[e];i&&i.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){const i=this.bones[e];i&&(i.parent&&i.parent.isBone?(i.matrix.copy(i.parent.matrixWorld).invert(),i.matrix.multiply(i.matrixWorld)):i.matrix.copy(i.matrixWorld),i.matrix.decompose(i.position,i.quaternion,i.scale))}}update(){const e=this.bones,t=this.boneInverses,i=this.boneMatrices,s=this.boneTexture;for(let r=0,o=e.length;r<o;r++){const a=e[r]?e[r].matrixWorld:NS;Qf.multiplyMatrices(a,t[r]),Qf.toArray(i,r*16)}s!==null&&(s.needsUpdate=!0)}clone(){return new pd(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=p0(e),e=Math.max(e,4);const t=new Float32Array(e*e*4);t.set(this.boneMatrices);const i=new US(t,e,e,fi,Ds);return i.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=i,this.boneTextureSize=e,this}getBoneByName(e){for(let t=0,i=this.bones.length;t<i;t++){const s=this.bones[t];if(s.name===e)return s}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let i=0,s=e.bones.length;i<s;i++){const r=e.bones[i];let o=t[r];o===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",r),o=new B0),this.bones.push(o),this.boneInverses.push(new xt().fromArray(e.boneInverses[i]))}return this.init(),this}toJSON(){const e={metadata:{version:4.5,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;const t=this.bones,i=this.boneInverses;for(let s=0,r=t.length;s<r;s++){const o=t[s];e.bones.push(o.uuid);const a=i[s];e.boneInverses.push(a.toArray())}return e}}class ep extends In{constructor(e,t,i,s=1){super(e,t,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const Gr=new xt,tp=new xt,Ya=[],np=new mn,OS=new xt,Bo=new je,Uo=new ls;class fl extends je{constructor(e,t,i){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new ep(new Float32Array(i*16),16),this.instanceColor=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<i;s++)this.setMatrixAt(s,OS)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new mn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,Gr),np.copy(e.boundingBox).applyMatrix4(Gr),this.boundingBox.union(np)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new ls),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,Gr),Uo.copy(e.boundingSphere).applyMatrix4(Gr),this.boundingSphere.union(Uo)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}raycast(e,t){const i=this.matrixWorld,s=this.count;if(Bo.geometry=this.geometry,Bo.material=this.material,Bo.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Uo.copy(this.boundingSphere),Uo.applyMatrix4(i),e.ray.intersectsSphere(Uo)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Gr),tp.multiplyMatrices(i,Gr),Bo.matrixWorld=tp,Bo.raycast(e,Ya);for(let o=0,a=Ya.length;o<a;o++){const l=Ya[o];l.instanceId=r,l.object=this,t.push(l)}Ya.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new ep(new Float32Array(this.instanceMatrix.count*3),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"})}}class md extends wi{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new ut(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const ip=new L,sp=new L,rp=new xt,ku=new Wl,Ja=new ls;class gd extends Vt{constructor(e=new Zt,t=new md){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[0];for(let s=1,r=t.count;s<r;s++)ip.fromBufferAttribute(t,s-1),sp.fromBufferAttribute(t,s),i[s]=i[s-1],i[s]+=ip.distanceTo(sp);e.setAttribute("lineDistance",new bt(i,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const i=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Ja.copy(i.boundingSphere),Ja.applyMatrix4(s),Ja.radius+=r,e.ray.intersectsSphere(Ja)===!1)return;rp.copy(s).invert(),ku.copy(e.ray).applyMatrix4(rp);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,u=new L,d=new L,h=new L,f=new L,p=this.isLineSegments?2:1,g=i.index,_=i.attributes.position;if(g!==null){const m=Math.max(0,o.start),E=Math.min(g.count,o.start+o.count);for(let y=m,x=E-1;y<x;y+=p){const M=g.getX(y),A=g.getX(y+1);if(u.fromBufferAttribute(_,M),d.fromBufferAttribute(_,A),ku.distanceSqToSegment(u,d,f,h)>l)continue;f.applyMatrix4(this.matrixWorld);const I=e.ray.origin.distanceTo(f);I<e.near||I>e.far||t.push({distance:I,point:h.clone().applyMatrix4(this.matrixWorld),index:y,face:null,faceIndex:null,object:this})}}else{const m=Math.max(0,o.start),E=Math.min(_.count,o.start+o.count);for(let y=m,x=E-1;y<x;y+=p){if(u.fromBufferAttribute(_,y),d.fromBufferAttribute(_,y+1),ku.distanceSqToSegment(u,d,f,h)>l)continue;f.applyMatrix4(this.matrixWorld);const A=e.ray.origin.distanceTo(f);A<e.near||A>e.far||t.push({distance:A,point:h.clone().applyMatrix4(this.matrixWorld),index:y,face:null,faceIndex:null,object:this})}}}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}const op=new L,ap=new L;class U0 extends gd{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[];for(let s=0,r=t.count;s<r;s+=2)op.fromBufferAttribute(t,s),ap.fromBufferAttribute(t,s+1),i[s]=s===0?0:i[s-1],i[s+1]=i[s]+op.distanceTo(ap);e.setAttribute("lineDistance",new bt(i,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class kS extends gd{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}}class Ml extends wi{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new ut(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const lp=new xt,xc=new Wl,Za=new ls,Qa=new L;class bc extends Vt{constructor(e=new Zt,t=new Ml){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=e.material,this.geometry=e.geometry,this}raycast(e,t){const i=this.geometry,s=this.matrixWorld,r=e.params.Points.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Za.copy(i.boundingSphere),Za.applyMatrix4(s),Za.radius+=r,e.ray.intersectsSphere(Za)===!1)return;lp.copy(s).invert(),xc.copy(e.ray).applyMatrix4(lp);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,u=i.index,h=i.attributes.position;if(u!==null){const f=Math.max(0,o.start),p=Math.min(u.count,o.start+o.count);for(let g=f,v=p;g<v;g++){const _=u.getX(g);Qa.fromBufferAttribute(h,_),up(Qa,_,l,s,e,t,this)}}else{const f=Math.max(0,o.start),p=Math.min(h.count,o.start+o.count);for(let g=f,v=p;g<v;g++)Qa.fromBufferAttribute(h,g),up(Qa,g,l,s,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function up(n,e,t,i,s,r,o){const a=xc.distanceSqToPoint(n);if(a<t){const l=new L;xc.closestPointToPoint(n,l),l.applyMatrix4(i);const u=s.ray.origin.distanceTo(l);if(u<s.near||u>s.far)return;r.push({distance:u,distanceToRay:Math.sqrt(a),point:l,index:e,face:null,object:o})}}class el extends vn{constructor(e,t,i,s,r,o,a,l,u){super(e,t,i,s,r,o,a,l,u),this.isCanvasTexture=!0,this.needsUpdate=!0}}class Vi{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){const i=this.getUtoTmapping(e);return this.getPoint(i,t)}getPoints(e=5){const t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return t}getSpacedPoints(e=5){const t=[];for(let i=0;i<=e;i++)t.push(this.getPointAt(i/e));return t}getLength(){const e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const t=[];let i,s=this.getPoint(0),r=0;t.push(0);for(let o=1;o<=e;o++)i=this.getPoint(o/e),r+=i.distanceTo(s),t.push(r),s=i;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){const i=this.getLengths();let s=0;const r=i.length;let o;t?o=t:o=e*i[r-1];let a=0,l=r-1,u;for(;a<=l;)if(s=Math.floor(a+(l-a)/2),u=i[s]-o,u<0)a=s+1;else if(u>0)l=s-1;else{l=s;break}if(s=l,i[s]===o)return s/(r-1);const d=i[s],f=i[s+1]-d,p=(o-d)/f;return(s+p)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);const o=this.getPoint(s),a=this.getPoint(r),l=t||(o.isVector2?new Ue:new L);return l.copy(a).sub(o).normalize(),l}getTangentAt(e,t){const i=this.getUtoTmapping(e);return this.getTangent(i,t)}computeFrenetFrames(e,t){const i=new L,s=[],r=[],o=[],a=new L,l=new xt;for(let p=0;p<=e;p++){const g=p/e;s[p]=this.getTangentAt(g,new L)}r[0]=new L,o[0]=new L;let u=Number.MAX_VALUE;const d=Math.abs(s[0].x),h=Math.abs(s[0].y),f=Math.abs(s[0].z);d<=u&&(u=d,i.set(1,0,0)),h<=u&&(u=h,i.set(0,1,0)),f<=u&&i.set(0,0,1),a.crossVectors(s[0],i).normalize(),r[0].crossVectors(s[0],a),o[0].crossVectors(s[0],r[0]);for(let p=1;p<=e;p++){if(r[p]=r[p-1].clone(),o[p]=o[p-1].clone(),a.crossVectors(s[p-1],s[p]),a.length()>Number.EPSILON){a.normalize();const g=Math.acos(ln(s[p-1].dot(s[p]),-1,1));r[p].applyMatrix4(l.makeRotationAxis(a,g))}o[p].crossVectors(s[p],r[p])}if(t===!0){let p=Math.acos(ln(r[0].dot(r[e]),-1,1));p/=e,s[0].dot(a.crossVectors(r[0],r[e]))>0&&(p=-p);for(let g=1;g<=e;g++)r[g].applyMatrix4(l.makeRotationAxis(s[g],p*g)),o[g].crossVectors(s[g],r[g])}return{tangents:s,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){const e={metadata:{version:4.5,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}}class _d extends Vi{constructor(e=0,t=0,i=1,s=1,r=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=i,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(e,t){const i=t||new Ue,s=Math.PI*2;let r=this.aEndAngle-this.aStartAngle;const o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(o?r=0:r=s),this.aClockwise===!0&&!o&&(r===s?r=-s:r=r-s);const a=this.aStartAngle+e*r;let l=this.aX+this.xRadius*Math.cos(a),u=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){const d=Math.cos(this.aRotation),h=Math.sin(this.aRotation),f=l-this.aX,p=u-this.aY;l=f*d-p*h+this.aX,u=f*h+p*d+this.aY}return i.set(l,u)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){const e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}}class zS extends _d{constructor(e,t,i,s,r,o){super(e,t,i,i,s,r,o),this.isArcCurve=!0,this.type="ArcCurve"}}function vd(){let n=0,e=0,t=0,i=0;function s(r,o,a,l){n=r,e=a,t=-3*r+3*o-2*a-l,i=2*r-2*o+a+l}return{initCatmullRom:function(r,o,a,l,u){s(o,a,u*(a-r),u*(l-o))},initNonuniformCatmullRom:function(r,o,a,l,u,d,h){let f=(o-r)/u-(a-r)/(u+d)+(a-o)/d,p=(a-o)/d-(l-o)/(d+h)+(l-a)/h;f*=d,p*=d,s(o,a,f,p)},calc:function(r){const o=r*r,a=o*r;return n+e*r+t*o+i*a}}}const tl=new L,zu=new vd,Hu=new vd,$u=new vd;class yd extends Vi{constructor(e=[],t=!1,i="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=i,this.tension=s}getPoint(e,t=new L){const i=t,s=this.points,r=s.length,o=(r-(this.closed?0:1))*e;let a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:l===0&&a===r-1&&(a=r-2,l=1);let u,d;this.closed||a>0?u=s[(a-1)%r]:(tl.subVectors(s[0],s[1]).add(s[0]),u=tl);const h=s[a%r],f=s[(a+1)%r];if(this.closed||a+2<r?d=s[(a+2)%r]:(tl.subVectors(s[r-1],s[r-2]).add(s[r-1]),d=tl),this.curveType==="centripetal"||this.curveType==="chordal"){const p=this.curveType==="chordal"?.5:.25;let g=Math.pow(u.distanceToSquared(h),p),v=Math.pow(h.distanceToSquared(f),p),_=Math.pow(f.distanceToSquared(d),p);v<1e-4&&(v=1),g<1e-4&&(g=v),_<1e-4&&(_=v),zu.initNonuniformCatmullRom(u.x,h.x,f.x,d.x,g,v,_),Hu.initNonuniformCatmullRom(u.y,h.y,f.y,d.y,g,v,_),$u.initNonuniformCatmullRom(u.z,h.z,f.z,d.z,g,v,_)}else this.curveType==="catmullrom"&&(zu.initCatmullRom(u.x,h.x,f.x,d.x,this.tension),Hu.initCatmullRom(u.y,h.y,f.y,d.y,this.tension),$u.initCatmullRom(u.z,h.z,f.z,d.z,this.tension));return i.set(zu.calc(l),Hu.calc(l),$u.calc(l)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){const s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const s=e.points[t];this.points.push(new L().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}}function cp(n,e,t,i,s){const r=(i-e)*.5,o=(s-t)*.5,a=n*n,l=n*a;return(2*t-2*i+r+o)*l+(-3*t+3*i-2*r-o)*a+r*n+t}function HS(n,e){const t=1-n;return t*t*e}function $S(n,e){return 2*(1-n)*n*e}function VS(n,e){return n*n*e}function Jo(n,e,t,i){return HS(n,e)+$S(n,t)+VS(n,i)}function GS(n,e){const t=1-n;return t*t*t*e}function WS(n,e){const t=1-n;return 3*t*t*n*e}function XS(n,e){return 3*(1-n)*n*n*e}function jS(n,e){return n*n*n*e}function Zo(n,e,t,i,s){return GS(n,e)+WS(n,t)+XS(n,i)+jS(n,s)}class N0 extends Vi{constructor(e=new Ue,t=new Ue,i=new Ue,s=new Ue){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=i,this.v3=s}getPoint(e,t=new Ue){const i=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return i.set(Zo(e,s.x,r.x,o.x,a.x),Zo(e,s.y,r.y,o.y,a.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class qS extends Vi{constructor(e=new L,t=new L,i=new L,s=new L){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=i,this.v3=s}getPoint(e,t=new L){const i=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return i.set(Zo(e,s.x,r.x,o.x,a.x),Zo(e,s.y,r.y,o.y,a.y),Zo(e,s.z,r.z,o.z,a.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class Ed extends Vi{constructor(e=new Ue,t=new Ue){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new Ue){const i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new Ue){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class KS extends Vi{constructor(e=new L,t=new L){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new L){const i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new L){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class O0 extends Vi{constructor(e=new Ue,t=new Ue,i=new Ue){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new Ue){const i=t,s=this.v0,r=this.v1,o=this.v2;return i.set(Jo(e,s.x,r.x,o.x),Jo(e,s.y,r.y,o.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class k0 extends Vi{constructor(e=new L,t=new L,i=new L){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new L){const i=t,s=this.v0,r=this.v1,o=this.v2;return i.set(Jo(e,s.x,r.x,o.x),Jo(e,s.y,r.y,o.y),Jo(e,s.z,r.z,o.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class z0 extends Vi{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new Ue){const i=t,s=this.points,r=(s.length-1)*e,o=Math.floor(r),a=r-o,l=s[o===0?o:o-1],u=s[o],d=s[o>s.length-2?s.length-1:o+1],h=s[o>s.length-3?s.length-1:o+2];return i.set(cp(a,l.x,u.x,d.x,h.x),cp(a,l.y,u.y,d.y,h.y)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const s=e.points[t];this.points.push(s.clone())}return this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){const s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const s=e.points[t];this.points.push(new Ue().fromArray(s))}return this}}var H0=Object.freeze({__proto__:null,ArcCurve:zS,CatmullRomCurve3:yd,CubicBezierCurve:N0,CubicBezierCurve3:qS,EllipseCurve:_d,LineCurve:Ed,LineCurve3:KS,QuadraticBezierCurve:O0,QuadraticBezierCurve3:k0,SplineCurve:z0});class YS extends Vi{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){const e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);e.equals(t)||this.curves.push(new Ed(t,e))}getPoint(e,t){const i=e*this.getLength(),s=this.getCurveLengths();let r=0;for(;r<s.length;){if(s[r]>=i){const o=s[r]-i,a=this.curves[r],l=a.getLength(),u=l===0?0:1-o/l;return a.getPointAt(u,t)}r++}return null}getLength(){const e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const e=[];let t=0;for(let i=0,s=this.curves.length;i<s;i++)t+=this.curves[i].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){const t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){const t=[];let i;for(let s=0,r=this.curves;s<r.length;s++){const o=r[s],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,l=o.getPoints(a);for(let u=0;u<l.length;u++){const d=l[u];i&&i.equals(d)||(t.push(d),i=d)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){const s=e.curves[t];this.curves.push(s.clone())}return this.autoClose=e.autoClose,this}toJSON(){const e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,i=this.curves.length;t<i;t++){const s=this.curves[t];e.curves.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){const s=e.curves[t];this.curves.push(new H0[s.type]().fromJSON(s))}return this}}class JS extends YS{constructor(e){super(),this.type="Path",this.currentPoint=new Ue,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,i=e.length;t<i;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){const i=new Ed(this.currentPoint.clone(),new Ue(e,t));return this.curves.push(i),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,i,s){const r=new O0(this.currentPoint.clone(),new Ue(e,t),new Ue(i,s));return this.curves.push(r),this.currentPoint.set(i,s),this}bezierCurveTo(e,t,i,s,r,o){const a=new N0(this.currentPoint.clone(),new Ue(e,t),new Ue(i,s),new Ue(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(e){const t=[this.currentPoint.clone()].concat(e),i=new z0(t);return this.curves.push(i),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,i,s,r,o){const a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+a,t+l,i,s,r,o),this}absarc(e,t,i,s,r,o){return this.absellipse(e,t,i,i,s,r,o),this}ellipse(e,t,i,s,r,o,a,l){const u=this.currentPoint.x,d=this.currentPoint.y;return this.absellipse(e+u,t+d,i,s,r,o,a,l),this}absellipse(e,t,i,s,r,o,a,l){const u=new _d(e,t,i,s,r,o,a,l);if(this.curves.length>0){const h=u.getPoint(0);h.equals(this.currentPoint)||this.lineTo(h.x,h.y)}this.curves.push(u);const d=u.getPoint(1);return this.currentPoint.copy(d),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){const e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}}class ql extends Zt{constructor(e=[new Ue(0,-.5),new Ue(.5,0),new Ue(0,.5)],t=12,i=0,s=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:i,phiLength:s},t=Math.floor(t),s=ln(s,0,Math.PI*2);const r=[],o=[],a=[],l=[],u=[],d=1/t,h=new L,f=new Ue,p=new L,g=new L,v=new L;let _=0,m=0;for(let E=0;E<=e.length-1;E++)switch(E){case 0:_=e[E+1].x-e[E].x,m=e[E+1].y-e[E].y,p.x=m*1,p.y=-_,p.z=m*0,v.copy(p),p.normalize(),l.push(p.x,p.y,p.z);break;case e.length-1:l.push(v.x,v.y,v.z);break;default:_=e[E+1].x-e[E].x,m=e[E+1].y-e[E].y,p.x=m*1,p.y=-_,p.z=m*0,g.copy(p),p.x+=v.x,p.y+=v.y,p.z+=v.z,p.normalize(),l.push(p.x,p.y,p.z),v.copy(g)}for(let E=0;E<=t;E++){const y=i+E*d*s,x=Math.sin(y),M=Math.cos(y);for(let A=0;A<=e.length-1;A++){h.x=e[A].x*x,h.y=e[A].y,h.z=e[A].x*M,o.push(h.x,h.y,h.z),f.x=E/t,f.y=A/(e.length-1),a.push(f.x,f.y);const F=l[3*A+0]*x,I=l[3*A+1],b=l[3*A+0]*M;u.push(F,I,b)}}for(let E=0;E<t;E++)for(let y=0;y<e.length-1;y++){const x=y+E*e.length,M=x,A=x+e.length,F=x+e.length+1,I=x+1;r.push(M,A,I),r.push(F,I,A)}this.setIndex(r),this.setAttribute("position",new bt(o,3)),this.setAttribute("uv",new bt(a,2)),this.setAttribute("normal",new bt(u,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ql(e.points,e.segments,e.phiStart,e.phiLength)}}class Kl extends ql{constructor(e=1,t=1,i=4,s=8){const r=new JS;r.absarc(0,-t/2,e,Math.PI*1.5,0),r.absarc(0,t/2,e,0,Math.PI*.5),super(r.getPoints(i),s),this.type="CapsuleGeometry",this.parameters={radius:e,height:t,capSegments:i,radialSegments:s}}static fromJSON(e){return new Kl(e.radius,e.length,e.capSegments,e.radialSegments)}}class Al extends Zt{constructor(e=1,t=32,i=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:i,thetaLength:s},t=Math.max(3,t);const r=[],o=[],a=[],l=[],u=new L,d=new Ue;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let h=0,f=3;h<=t;h++,f+=3){const p=i+h/t*s;u.x=e*Math.cos(p),u.y=e*Math.sin(p),o.push(u.x,u.y,u.z),a.push(0,0,1),d.x=(o[f]/e+1)/2,d.y=(o[f+1]/e+1)/2,l.push(d.x,d.y)}for(let h=1;h<=t;h++)r.push(h,h+1,0);this.setIndex(r),this.setAttribute("position",new bt(o,3)),this.setAttribute("normal",new bt(a,3)),this.setAttribute("uv",new bt(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Al(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class Rt extends Zt{constructor(e=1,t=1,i=1,s=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};const u=this;s=Math.floor(s),r=Math.floor(r);const d=[],h=[],f=[],p=[];let g=0;const v=[],_=i/2;let m=0;E(),o===!1&&(e>0&&y(!0),t>0&&y(!1)),this.setIndex(d),this.setAttribute("position",new bt(h,3)),this.setAttribute("normal",new bt(f,3)),this.setAttribute("uv",new bt(p,2));function E(){const x=new L,M=new L;let A=0;const F=(t-e)/i;for(let I=0;I<=r;I++){const b=[],w=I/r,oe=w*(t-e)+e;for(let X=0;X<=s;X++){const z=X/s,T=z*l+a,G=Math.sin(T),re=Math.cos(T);M.x=oe*G,M.y=-w*i+_,M.z=oe*re,h.push(M.x,M.y,M.z),x.set(G,F,re).normalize(),f.push(x.x,x.y,x.z),p.push(z,1-w),b.push(g++)}v.push(b)}for(let I=0;I<s;I++)for(let b=0;b<r;b++){const w=v[b][I],oe=v[b+1][I],X=v[b+1][I+1],z=v[b][I+1];d.push(w,oe,z),d.push(oe,X,z),A+=6}u.addGroup(m,A,0),m+=A}function y(x){const M=g,A=new Ue,F=new L;let I=0;const b=x===!0?e:t,w=x===!0?1:-1;for(let X=1;X<=s;X++)h.push(0,_*w,0),f.push(0,w,0),p.push(.5,.5),g++;const oe=g;for(let X=0;X<=s;X++){const T=X/s*l+a,G=Math.cos(T),re=Math.sin(T);F.x=b*re,F.y=_*w,F.z=b*G,h.push(F.x,F.y,F.z),f.push(0,w,0),A.x=G*.5+.5,A.y=re*.5*w+.5,p.push(A.x,A.y),g++}for(let X=0;X<s;X++){const z=M+X,T=oe+X;x===!0?d.push(T,T+1,z):d.push(T+1,T,z),I+=3}u.addGroup(m,I,x===!0?1:2),m+=I}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Rt(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class fa extends Rt{constructor(e=1,t=1,i=32,s=1,r=!1,o=0,a=Math.PI*2){super(0,e,t,i,s,r,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:i,heightSegments:s,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(e){return new fa(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class xd extends Zt{constructor(e=[],t=[],i=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:i,detail:s};const r=[],o=[];a(s),u(i),d(),this.setAttribute("position",new bt(r,3)),this.setAttribute("normal",new bt(r.slice(),3)),this.setAttribute("uv",new bt(o,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function a(E){const y=new L,x=new L,M=new L;for(let A=0;A<t.length;A+=3)p(t[A+0],y),p(t[A+1],x),p(t[A+2],M),l(y,x,M,E)}function l(E,y,x,M){const A=M+1,F=[];for(let I=0;I<=A;I++){F[I]=[];const b=E.clone().lerp(x,I/A),w=y.clone().lerp(x,I/A),oe=A-I;for(let X=0;X<=oe;X++)X===0&&I===A?F[I][X]=b:F[I][X]=b.clone().lerp(w,X/oe)}for(let I=0;I<A;I++)for(let b=0;b<2*(A-I)-1;b++){const w=Math.floor(b/2);b%2===0?(f(F[I][w+1]),f(F[I+1][w]),f(F[I][w])):(f(F[I][w+1]),f(F[I+1][w+1]),f(F[I+1][w]))}}function u(E){const y=new L;for(let x=0;x<r.length;x+=3)y.x=r[x+0],y.y=r[x+1],y.z=r[x+2],y.normalize().multiplyScalar(E),r[x+0]=y.x,r[x+1]=y.y,r[x+2]=y.z}function d(){const E=new L;for(let y=0;y<r.length;y+=3){E.x=r[y+0],E.y=r[y+1],E.z=r[y+2];const x=_(E)/2/Math.PI+.5,M=m(E)/Math.PI+.5;o.push(x,1-M)}g(),h()}function h(){for(let E=0;E<o.length;E+=6){const y=o[E+0],x=o[E+2],M=o[E+4],A=Math.max(y,x,M),F=Math.min(y,x,M);A>.9&&F<.1&&(y<.2&&(o[E+0]+=1),x<.2&&(o[E+2]+=1),M<.2&&(o[E+4]+=1))}}function f(E){r.push(E.x,E.y,E.z)}function p(E,y){const x=E*3;y.x=e[x+0],y.y=e[x+1],y.z=e[x+2]}function g(){const E=new L,y=new L,x=new L,M=new L,A=new Ue,F=new Ue,I=new Ue;for(let b=0,w=0;b<r.length;b+=9,w+=6){E.set(r[b+0],r[b+1],r[b+2]),y.set(r[b+3],r[b+4],r[b+5]),x.set(r[b+6],r[b+7],r[b+8]),A.set(o[w+0],o[w+1]),F.set(o[w+2],o[w+3]),I.set(o[w+4],o[w+5]),M.copy(E).add(y).add(x).divideScalar(3);const oe=_(M);v(A,w+0,E,oe),v(F,w+2,y,oe),v(I,w+4,x,oe)}}function v(E,y,x,M){M<0&&E.x===1&&(o[y]=E.x-1),x.x===0&&x.z===0&&(o[y]=M/2/Math.PI+.5)}function _(E){return Math.atan2(E.z,-E.x)}function m(E){return Math.atan2(-E.y,Math.sqrt(E.x*E.x+E.z*E.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new xd(e.vertices,e.indices,e.radius,e.details)}}class bd extends xd{constructor(e=1,t=0){const i=(1+Math.sqrt(5))/2,s=[-1,i,0,1,i,0,-1,-i,0,1,-i,0,0,-1,i,0,1,i,0,-1,-i,0,1,-i,i,0,-1,i,0,1,-i,0,-1,-i,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new bd(e.radius,e.detail)}}class Md extends Zt{constructor(e=.5,t=1,i=32,s=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:i,phiSegments:s,thetaStart:r,thetaLength:o},i=Math.max(3,i),s=Math.max(1,s);const a=[],l=[],u=[],d=[];let h=e;const f=(t-e)/s,p=new L,g=new Ue;for(let v=0;v<=s;v++){for(let _=0;_<=i;_++){const m=r+_/i*o;p.x=h*Math.cos(m),p.y=h*Math.sin(m),l.push(p.x,p.y,p.z),u.push(0,0,1),g.x=(p.x/t+1)/2,g.y=(p.y/t+1)/2,d.push(g.x,g.y)}h+=f}for(let v=0;v<s;v++){const _=v*(i+1);for(let m=0;m<i;m++){const E=m+_,y=E,x=E+i+1,M=E+i+2,A=E+1;a.push(y,x,A),a.push(x,M,A)}}this.setIndex(a),this.setAttribute("position",new bt(l,3)),this.setAttribute("normal",new bt(u,3)),this.setAttribute("uv",new bt(d,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Md(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}class ci extends Zt{constructor(e=1,t=32,i=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));const l=Math.min(o+a,Math.PI);let u=0;const d=[],h=new L,f=new L,p=[],g=[],v=[],_=[];for(let m=0;m<=i;m++){const E=[],y=m/i;let x=0;m===0&&o===0?x=.5/t:m===i&&l===Math.PI&&(x=-.5/t);for(let M=0;M<=t;M++){const A=M/t;h.x=-e*Math.cos(s+A*r)*Math.sin(o+y*a),h.y=e*Math.cos(o+y*a),h.z=e*Math.sin(s+A*r)*Math.sin(o+y*a),g.push(h.x,h.y,h.z),f.copy(h).normalize(),v.push(f.x,f.y,f.z),_.push(A+x,1-y),E.push(u++)}d.push(E)}for(let m=0;m<i;m++)for(let E=0;E<t;E++){const y=d[m][E+1],x=d[m][E],M=d[m+1][E],A=d[m+1][E+1];(m!==0||o>0)&&p.push(y,x,A),(m!==i-1||l<Math.PI)&&p.push(x,M,A)}this.setIndex(p),this.setAttribute("position",new bt(g,3)),this.setAttribute("normal",new bt(v,3)),this.setAttribute("uv",new bt(_,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ci(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class Cs extends Zt{constructor(e=1,t=.4,i=12,s=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:i,tubularSegments:s,arc:r},i=Math.floor(i),s=Math.floor(s);const o=[],a=[],l=[],u=[],d=new L,h=new L,f=new L;for(let p=0;p<=i;p++)for(let g=0;g<=s;g++){const v=g/s*r,_=p/i*Math.PI*2;h.x=(e+t*Math.cos(_))*Math.cos(v),h.y=(e+t*Math.cos(_))*Math.sin(v),h.z=t*Math.sin(_),a.push(h.x,h.y,h.z),d.x=e*Math.cos(v),d.y=e*Math.sin(v),f.subVectors(h,d).normalize(),l.push(f.x,f.y,f.z),u.push(g/s),u.push(p/i)}for(let p=1;p<=i;p++)for(let g=1;g<=s;g++){const v=(s+1)*p+g-1,_=(s+1)*(p-1)+g-1,m=(s+1)*(p-1)+g,E=(s+1)*p+g;o.push(v,_,E),o.push(_,m,E)}this.setIndex(o),this.setAttribute("position",new bt(a,3)),this.setAttribute("normal",new bt(l,3)),this.setAttribute("uv",new bt(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Cs(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}class Yl extends Zt{constructor(e=new k0(new L(-1,-1,0),new L(-1,1,0),new L(1,1,0)),t=64,i=1,s=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:i,radialSegments:s,closed:r};const o=e.computeFrenetFrames(t,r);this.tangents=o.tangents,this.normals=o.normals,this.binormals=o.binormals;const a=new L,l=new L,u=new Ue;let d=new L;const h=[],f=[],p=[],g=[];v(),this.setIndex(g),this.setAttribute("position",new bt(h,3)),this.setAttribute("normal",new bt(f,3)),this.setAttribute("uv",new bt(p,2));function v(){for(let y=0;y<t;y++)_(y);_(r===!1?t:0),E(),m()}function _(y){d=e.getPointAt(y/t,d);const x=o.normals[y],M=o.binormals[y];for(let A=0;A<=s;A++){const F=A/s*Math.PI*2,I=Math.sin(F),b=-Math.cos(F);l.x=b*x.x+I*M.x,l.y=b*x.y+I*M.y,l.z=b*x.z+I*M.z,l.normalize(),f.push(l.x,l.y,l.z),a.x=d.x+i*l.x,a.y=d.y+i*l.y,a.z=d.z+i*l.z,h.push(a.x,a.y,a.z)}}function m(){for(let y=1;y<=t;y++)for(let x=1;x<=s;x++){const M=(s+1)*(y-1)+(x-1),A=(s+1)*y+(x-1),F=(s+1)*y+x,I=(s+1)*(y-1)+x;g.push(M,A,I),g.push(A,F,I)}}function E(){for(let y=0;y<=t;y++)for(let x=0;x<=s;x++)u.x=y/t,u.y=x/s,p.push(u.x,u.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new Yl(new H0[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}}class lt extends wi{constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new ut(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new ut(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=h0,this.normalScale=new Ue(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Kn extends lt{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new Ue(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return ln(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new ut(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new ut(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new ut(1,1,1),this.specularColorMap=null,this._sheen=0,this._clearcoat=0,this._iridescence=0,this._transmission=0,this.setValues(e)}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}function xs(n,e,t){return $0(n)?new n.constructor(n.subarray(e,t!==void 0?t:n.length)):n.slice(e,t)}function nl(n,e,t){return!n||!t&&n.constructor===e?n:typeof e.BYTES_PER_ELEMENT=="number"?new e(n):Array.prototype.slice.call(n)}function $0(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}function ZS(n){function e(s,r){return n[s]-n[r]}const t=n.length,i=new Array(t);for(let s=0;s!==t;++s)i[s]=s;return i.sort(e),i}function dp(n,e,t){const i=n.length,s=new n.constructor(i);for(let r=0,o=0;o!==i;++r){const a=t[r]*e;for(let l=0;l!==e;++l)s[o++]=n[a+l]}return s}function V0(n,e,t,i){let s=1,r=n[0];for(;r!==void 0&&r[i]===void 0;)r=n[s++];if(r===void 0)return;let o=r[i];if(o!==void 0)if(Array.isArray(o))do o=r[i],o!==void 0&&(e.push(r.time),t.push.apply(t,o)),r=n[s++];while(r!==void 0);else if(o.toArray!==void 0)do o=r[i],o!==void 0&&(e.push(r.time),o.toArray(t,t.length)),r=n[s++];while(r!==void 0);else do o=r[i],o!==void 0&&(e.push(r.time),t.push(o)),r=n[s++];while(r!==void 0)}class ya{constructor(e,t,i,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(i),this.sampleValues=t,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){const t=this.parameterPositions;let i=this._cachedIndex,s=t[i],r=t[i-1];n:{e:{let o;t:{i:if(!(e<s)){for(let a=i+2;;){if(s===void 0){if(e<r)break i;return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===a)break;if(r=s,s=t[++i],e<s)break e}o=t.length;break t}if(!(e>=r)){const a=t[1];e<a&&(i=2,r=a);for(let l=i-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(s=r,r=t[--i-1],e>=r)break e}o=i,i=0;break t}break n}for(;i<o;){const a=i+o>>>1;e<t[a]?o=a:i=a+1}if(s=t[i],r=t[i-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,r,s)}return this.interpolate_(i,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){const t=this.resultBuffer,i=this.sampleValues,s=this.valueSize,r=e*s;for(let o=0;o!==s;++o)t[o]=i[r+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}}class QS extends ya{constructor(e,t,i,s){super(e,t,i,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:rf,endingEnd:rf}}intervalChanged_(e,t,i){const s=this.parameterPositions;let r=e-2,o=e+1,a=s[r],l=s[o];if(a===void 0)switch(this.getSettings_().endingStart){case of:r=e,a=2*t-i;break;case af:r=s.length-2,a=t+s[r]-s[r+1];break;default:r=e,a=i}if(l===void 0)switch(this.getSettings_().endingEnd){case of:o=e,l=2*i-t;break;case af:o=1,l=i+s[1]-s[0];break;default:o=e-1,l=t}const u=(i-t)*.5,d=this.valueSize;this._weightPrev=u/(t-a),this._weightNext=u/(l-i),this._offsetPrev=r*d,this._offsetNext=o*d}interpolate_(e,t,i,s){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,u=l-a,d=this._offsetPrev,h=this._offsetNext,f=this._weightPrev,p=this._weightNext,g=(i-t)/(s-t),v=g*g,_=v*g,m=-f*_+2*f*v-f*g,E=(1+f)*_+(-1.5-2*f)*v+(-.5+f)*g+1,y=(-1-p)*_+(1.5+p)*v+.5*g,x=p*_-p*v;for(let M=0;M!==a;++M)r[M]=m*o[d+M]+E*o[u+M]+y*o[l+M]+x*o[h+M];return r}}class ew extends ya{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e,t,i,s){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,u=l-a,d=(i-t)/(s-t),h=1-d;for(let f=0;f!==a;++f)r[f]=o[u+f]*h+o[l+f]*d;return r}}class tw extends ya{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e){return this.copySampleValue_(e-1)}}class Gi{constructor(e,t,i,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=nl(t,this.TimeBufferType),this.values=nl(i,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){const t=e.constructor;let i;if(t.toJSON!==this.toJSON)i=t.toJSON(e);else{i={name:e.name,times:nl(e.times,Array),values:nl(e.values,Array)};const s=e.getInterpolation();s!==e.DefaultInterpolation&&(i.interpolation=s)}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new tw(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new ew(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new QS(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case ca:t=this.InterpolantFactoryMethodDiscrete;break;case fo:t=this.InterpolantFactoryMethodLinear;break;case mu:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){const i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return console.warn("THREE.KeyframeTrack:",i),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return ca;case this.InterpolantFactoryMethodLinear:return fo;case this.InterpolantFactoryMethodSmooth:return mu}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){const t=this.times;for(let i=0,s=t.length;i!==s;++i)t[i]+=e}return this}scale(e){if(e!==1){const t=this.times;for(let i=0,s=t.length;i!==s;++i)t[i]*=e}return this}trim(e,t){const i=this.times,s=i.length;let r=0,o=s-1;for(;r!==s&&i[r]<e;)++r;for(;o!==-1&&i[o]>t;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);const a=this.getValueSize();this.times=xs(i,r,o),this.values=xs(this.values,r*a,o*a)}return this}validate(){let e=!0;const t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);const i=this.times,s=this.values,r=i.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==r;a++){const l=i[a];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(s!==void 0&&$0(s))for(let a=0,l=s.length;a!==l;++a){const u=s[a];if(isNaN(u)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,u),e=!1;break}}return e}optimize(){const e=xs(this.times),t=xs(this.values),i=this.getValueSize(),s=this.getInterpolation()===mu,r=e.length-1;let o=1;for(let a=1;a<r;++a){let l=!1;const u=e[a],d=e[a+1];if(u!==d&&(a!==1||u!==e[0]))if(s)l=!0;else{const h=a*i,f=h-i,p=h+i;for(let g=0;g!==i;++g){const v=t[h+g];if(v!==t[f+g]||v!==t[p+g]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];const h=a*i,f=o*i;for(let p=0;p!==i;++p)t[f+p]=t[h+p]}++o}}if(r>0){e[o]=e[r];for(let a=r*i,l=o*i,u=0;u!==i;++u)t[l+u]=t[a+u];++o}return o!==e.length?(this.times=xs(e,0,o),this.values=xs(t,0,o*i)):(this.times=e,this.values=t),this}clone(){const e=xs(this.times,0),t=xs(this.values,0),i=this.constructor,s=new i(this.name,e,t);return s.createInterpolant=this.createInterpolant,s}}Gi.prototype.TimeBufferType=Float32Array;Gi.prototype.ValueBufferType=Float32Array;Gi.prototype.DefaultInterpolation=fo;class Mo extends Gi{}Mo.prototype.ValueTypeName="bool";Mo.prototype.ValueBufferType=Array;Mo.prototype.DefaultInterpolation=ca;Mo.prototype.InterpolantFactoryMethodLinear=void 0;Mo.prototype.InterpolantFactoryMethodSmooth=void 0;class G0 extends Gi{}G0.prototype.ValueTypeName="color";class pa extends Gi{}pa.prototype.ValueTypeName="number";class nw extends ya{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e,t,i,s){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(i-t)/(s-t);let u=e*a;for(let d=u+a;u!==d;u+=4)zi.slerpFlat(r,0,o,u-a,o,u,l);return r}}class pr extends Gi{InterpolantFactoryMethodLinear(e){return new nw(this.times,this.values,this.getValueSize(),e)}}pr.prototype.ValueTypeName="quaternion";pr.prototype.DefaultInterpolation=fo;pr.prototype.InterpolantFactoryMethodSmooth=void 0;class Ao extends Gi{}Ao.prototype.ValueTypeName="string";Ao.prototype.ValueBufferType=Array;Ao.prototype.DefaultInterpolation=ca;Ao.prototype.InterpolantFactoryMethodLinear=void 0;Ao.prototype.InterpolantFactoryMethodSmooth=void 0;class ma extends Gi{}ma.prototype.ValueTypeName="vector";class iw{constructor(e,t=-1,i,s=h2){this.name=e,this.tracks=i,this.duration=t,this.blendMode=s,this.uuid=Si(),this.duration<0&&this.resetDuration()}static parse(e){const t=[],i=e.tracks,s=1/(e.fps||1);for(let o=0,a=i.length;o!==a;++o)t.push(rw(i[o]).scale(s));const r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r}static toJSON(e){const t=[],i=e.tracks,s={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode};for(let r=0,o=i.length;r!==o;++r)t.push(Gi.toJSON(i[r]));return s}static CreateFromMorphTargetSequence(e,t,i,s){const r=t.length,o=[];for(let a=0;a<r;a++){let l=[],u=[];l.push((a+r-1)%r,a,(a+1)%r),u.push(0,1,0);const d=ZS(l);l=dp(l,1,d),u=dp(u,1,d),!s&&l[0]===0&&(l.push(r),u.push(u[0])),o.push(new pa(".morphTargetInfluences["+t[a].name+"]",l,u).scale(1/i))}return new this(e,-1,o)}static findByName(e,t){let i=e;if(!Array.isArray(e)){const s=e;i=s.geometry&&s.geometry.animations||s.animations}for(let s=0;s<i.length;s++)if(i[s].name===t)return i[s];return null}static CreateClipsFromMorphTargetSequences(e,t,i){const s={},r=/^([\w-]*?)([\d]+)$/;for(let a=0,l=e.length;a<l;a++){const u=e[a],d=u.name.match(r);if(d&&d.length>1){const h=d[1];let f=s[h];f||(s[h]=f=[]),f.push(u)}}const o=[];for(const a in s)o.push(this.CreateFromMorphTargetSequence(a,s[a],t,i));return o}static parseAnimation(e,t){if(!e)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;const i=function(h,f,p,g,v){if(p.length!==0){const _=[],m=[];V0(p,_,m,g),_.length!==0&&v.push(new h(f,_,m))}},s=[],r=e.name||"default",o=e.fps||30,a=e.blendMode;let l=e.length||-1;const u=e.hierarchy||[];for(let h=0;h<u.length;h++){const f=u[h].keys;if(!(!f||f.length===0))if(f[0].morphTargets){const p={};let g;for(g=0;g<f.length;g++)if(f[g].morphTargets)for(let v=0;v<f[g].morphTargets.length;v++)p[f[g].morphTargets[v]]=-1;for(const v in p){const _=[],m=[];for(let E=0;E!==f[g].morphTargets.length;++E){const y=f[g];_.push(y.time),m.push(y.morphTarget===v?1:0)}s.push(new pa(".morphTargetInfluence["+v+"]",_,m))}l=p.length*o}else{const p=".bones["+t[h].name+"]";i(ma,p+".position",f,"pos",s),i(pr,p+".quaternion",f,"rot",s),i(ma,p+".scale",f,"scl",s)}}return s.length===0?null:new this(r,l,s,a)}resetDuration(){const e=this.tracks;let t=0;for(let i=0,s=e.length;i!==s;++i){const r=this.tracks[i];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){const e=[];for(let t=0;t<this.tracks.length;t++)e.push(this.tracks[t].clone());return new this.constructor(this.name,this.duration,e,this.blendMode)}toJSON(){return this.constructor.toJSON(this)}}function sw(n){switch(n.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return pa;case"vector":case"vector2":case"vector3":case"vector4":return ma;case"color":return G0;case"quaternion":return pr;case"bool":case"boolean":return Mo;case"string":return Ao}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+n)}function rw(n){if(n.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");const e=sw(n.type);if(n.times===void 0){const t=[],i=[];V0(n.keys,t,i,"value"),n.times=t,n.values=i}return e.parse!==void 0?e.parse(n):new e(n.name,n.times,n.values,n.interpolation)}const _o={enabled:!1,files:{},add:function(n,e){this.enabled!==!1&&(this.files[n]=e)},get:function(n){if(this.enabled!==!1)return this.files[n]},remove:function(n){delete this.files[n]},clear:function(){this.files={}}};class ow{constructor(e,t,i){const s=this;let r=!1,o=0,a=0,l;const u=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=i,this.itemStart=function(d){a++,r===!1&&s.onStart!==void 0&&s.onStart(d,o,a),r=!0},this.itemEnd=function(d){o++,s.onProgress!==void 0&&s.onProgress(d,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(d){s.onError!==void 0&&s.onError(d)},this.resolveURL=function(d){return l?l(d):d},this.setURLModifier=function(d){return l=d,this},this.addHandler=function(d,h){return u.push(d,h),this},this.removeHandler=function(d){const h=u.indexOf(d);return h!==-1&&u.splice(h,2),this},this.getHandler=function(d){for(let h=0,f=u.length;h<f;h+=2){const p=u[h],g=u[h+1];if(p.global&&(p.lastIndex=0),p.test(d))return g}return null}}}const aw=new ow;class Ea{constructor(e){this.manager=e!==void 0?e:aw,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){const i=this;return new Promise(function(s,r){i.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}}const Qi={};class lw extends Error{constructor(e,t){super(e),this.response=t}}class W0 extends Ea{constructor(e){super(e)}load(e,t,i,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=_o.get(e);if(r!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0),r;if(Qi[e]!==void 0){Qi[e].push({onLoad:t,onProgress:i,onError:s});return}Qi[e]=[],Qi[e].push({onLoad:t,onProgress:i,onError:s});const o=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin"}),a=this.mimeType,l=this.responseType;fetch(o).then(u=>{if(u.status===200||u.status===0){if(u.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream=="undefined"||u.body===void 0||u.body.getReader===void 0)return u;const d=Qi[e],h=u.body.getReader(),f=u.headers.get("Content-Length")||u.headers.get("X-File-Size"),p=f?parseInt(f):0,g=p!==0;let v=0;const _=new ReadableStream({start(m){E();function E(){h.read().then(({done:y,value:x})=>{if(y)m.close();else{v+=x.byteLength;const M=new ProgressEvent("progress",{lengthComputable:g,loaded:v,total:p});for(let A=0,F=d.length;A<F;A++){const I=d[A];I.onProgress&&I.onProgress(M)}m.enqueue(x),E()}})}}});return new Response(_)}else throw new lw(`fetch for "${u.url}" responded with ${u.status}: ${u.statusText}`,u)}).then(u=>{switch(l){case"arraybuffer":return u.arrayBuffer();case"blob":return u.blob();case"document":return u.text().then(d=>new DOMParser().parseFromString(d,a));case"json":return u.json();default:if(a===void 0)return u.text();{const h=/charset="?([^;"\s]*)"?/i.exec(a),f=h&&h[1]?h[1].toLowerCase():void 0,p=new TextDecoder(f);return u.arrayBuffer().then(g=>p.decode(g))}}}).then(u=>{_o.add(e,u);const d=Qi[e];delete Qi[e];for(let h=0,f=d.length;h<f;h++){const p=d[h];p.onLoad&&p.onLoad(u)}}).catch(u=>{const d=Qi[e];if(d===void 0)throw this.manager.itemError(e),u;delete Qi[e];for(let h=0,f=d.length;h<f;h++){const p=d[h];p.onError&&p.onError(u)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}}class uw extends Ea{constructor(e){super(e)}load(e,t,i,s){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,o=_o.get(e);if(o!==void 0)return r.manager.itemStart(e),setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0),o;const a=da("img");function l(){d(),_o.add(e,this),t&&t(this),r.manager.itemEnd(e)}function u(h){d(),s&&s(h),r.manager.itemError(e),r.manager.itemEnd(e)}function d(){a.removeEventListener("load",l,!1),a.removeEventListener("error",u,!1)}return a.addEventListener("load",l,!1),a.addEventListener("error",u,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),r.manager.itemStart(e),a.src=e,a}}class cw extends Ea{constructor(e){super(e)}load(e,t,i,s){const r=new vn,o=new uw(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){r.image=a,r.needsUpdate=!0,t!==void 0&&t(r)},i,s),r}}class Jl extends Vt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new ut(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),t}}class X0 extends Jl{constructor(e,t,i){super(e,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Vt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new ut(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}}const Vu=new xt,hp=new L,fp=new L;class Ad{constructor(e){this.camera=e,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Ue(512,512),this.map=null,this.mapPass=null,this.matrix=new xt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new cd,this._frameExtents=new Ue(1,1),this._viewportCount=1,this._viewports=[new Ot(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,i=this.matrix;hp.setFromMatrixPosition(e.matrixWorld),t.position.copy(hp),fp.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(fp),t.updateMatrixWorld(),Vu.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Vu),i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(Vu)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class dw extends Ad{constructor(){super(new Fn(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1}updateMatrices(e){const t=this.camera,i=po*2*e.angle*this.focus,s=this.mapSize.width/this.mapSize.height,r=e.distance||t.far;(i!==t.fov||s!==t.aspect||r!==t.far)&&(t.fov=i,t.aspect=s,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class hw extends Jl{constructor(e,t,i=0,s=Math.PI/3,r=0,o=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(Vt.DEFAULT_UP),this.updateMatrix(),this.target=new Vt,this.distance=i,this.angle=s,this.penumbra=r,this.decay=o,this.map=null,this.shadow=new dw}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}const pp=new xt,No=new L,Gu=new L;class fw extends Ad{constructor(){super(new Fn(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new Ue(4,2),this._viewportCount=6,this._viewports=[new Ot(2,1,1,1),new Ot(0,1,1,1),new Ot(3,1,1,1),new Ot(1,1,1,1),new Ot(3,0,1,1),new Ot(1,0,1,1)],this._cubeDirections=[new L(1,0,0),new L(-1,0,0),new L(0,0,1),new L(0,0,-1),new L(0,1,0),new L(0,-1,0)],this._cubeUps=[new L(0,1,0),new L(0,1,0),new L(0,1,0),new L(0,1,0),new L(0,0,1),new L(0,0,-1)]}updateMatrices(e,t=0){const i=this.camera,s=this.matrix,r=e.distance||i.far;r!==i.far&&(i.far=r,i.updateProjectionMatrix()),No.setFromMatrixPosition(e.matrixWorld),i.position.copy(No),Gu.copy(i.position),Gu.add(this._cubeDirections[t]),i.up.copy(this._cubeUps[t]),i.lookAt(Gu),i.updateMatrixWorld(),s.makeTranslation(-No.x,-No.y,-No.z),pp.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse),this._frustum.setFromProjectionMatrix(pp)}}class pw extends Jl{constructor(e,t,i=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=s,this.shadow=new fw}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class mw extends Ad{constructor(){super(new dd(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Sd extends Jl{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Vt.DEFAULT_UP),this.updateMatrix(),this.target=new Vt,this.shadow=new mw}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class Mc{static decodeText(e){if(typeof TextDecoder!="undefined")return new TextDecoder().decode(e);let t="";for(let i=0,s=e.length;i<s;i++)t+=String.fromCharCode(e[i]);try{return decodeURIComponent(escape(t))}catch{return t}}static extractUrlBase(e){const t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}}class gw extends Ea{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap=="undefined"&&console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch=="undefined"&&console.warn("THREE.ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"}}setOptions(e){return this.options=e,this}load(e,t,i,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,o=_o.get(e);if(o!==void 0)return r.manager.itemStart(e),setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0),o;const a={};a.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",a.headers=this.requestHeader,fetch(e,a).then(function(l){return l.blob()}).then(function(l){return createImageBitmap(l,Object.assign(r.options,{colorSpaceConversion:"none"}))}).then(function(l){_o.add(e,l),t&&t(l),r.manager.itemEnd(e)}).catch(function(l){s&&s(l),r.manager.itemError(e),r.manager.itemEnd(e)}),r.manager.itemStart(e)}}class _w{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=mp(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const t=mp();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}}function mp(){return(typeof performance=="undefined"?Date:performance).now()}const wd="\\[\\]\\.:\\/",vw=new RegExp("["+wd+"]","g"),Td="[^"+wd+"]",yw="[^"+wd.replace("\\.","")+"]",Ew=/((?:WC+[\/:])*)/.source.replace("WC",Td),xw=/(WCOD+)?/.source.replace("WCOD",yw),bw=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Td),Mw=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Td),Aw=new RegExp("^"+Ew+xw+bw+Mw+"$"),Sw=["material","materials","bones","map"];class ww{constructor(e,t,i){const s=i||Lt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();const i=this._targetGroup.nCachedObjects_,s=this._bindings[i];s!==void 0&&s.getValue(e,t)}setValue(e,t){const i=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=i.length;s!==r;++s)i[s].setValue(e,t)}bind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].bind()}unbind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].unbind()}}class Lt{constructor(e,t,i){this.path=t,this.parsedPath=i||Lt.parseTrackName(t),this.node=Lt.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,i){return e&&e.isAnimationObjectGroup?new Lt.Composite(e,t,i):new Lt(e,t,i)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(vw,"")}static parseTrackName(e){const t=Aw.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);const i={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=i.nodeName&&i.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){const r=i.nodeName.substring(s+1);Sw.indexOf(r)!==-1&&(i.nodeName=i.nodeName.substring(0,s),i.objectName=r)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return i}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){const i=e.skeleton.getBoneByName(t);if(i!==void 0)return i}if(e.children){const i=function(r){for(let o=0;o<r.length;o++){const a=r[o];if(a.name===t||a.uuid===t)return a;const l=i(a.children);if(l)return l}return null},s=i(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){const i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)e[t++]=i[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){const i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){const i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){const i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node;const t=this.parsedPath,i=t.objectName,s=t.propertyName;let r=t.propertyIndex;if(e||(e=Lt.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.error("THREE.PropertyBinding: Trying to update node for track: "+this.path+" but it wasn't found.");return}if(i){let u=t.objectIndex;switch(i){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let d=0;d<e.length;d++)if(e[d].name===u){u=d;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[i]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[i]}if(u!==void 0){if(e[u]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[u]}}const o=e[s];if(o===void 0){const u=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+u+"."+s+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?a=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}Lt.Composite=ww;Lt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Lt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Lt.prototype.GetterByBindingType=[Lt.prototype._getValue_direct,Lt.prototype._getValue_array,Lt.prototype._getValue_arrayElement,Lt.prototype._getValue_toArray];Lt.prototype.SetterByBindingTypeAndVersioning=[[Lt.prototype._setValue_direct,Lt.prototype._setValue_direct_setNeedsUpdate,Lt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Lt.prototype._setValue_array,Lt.prototype._setValue_array_setNeedsUpdate,Lt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Lt.prototype._setValue_arrayElement,Lt.prototype._setValue_arrayElement_setNeedsUpdate,Lt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Lt.prototype._setValue_fromArray,Lt.prototype._setValue_fromArray_setNeedsUpdate,Lt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];class j0{constructor(e,t,i=0,s=1/0){this.ray=new Wl(e,t),this.near=i,this.far=s,this.camera=null,this.layers=new ud,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}intersectObject(e,t=!0,i=[]){return Ac(e,this,i,t),i.sort(gp),i}intersectObjects(e,t=!0,i=[]){for(let s=0,r=e.length;s<r;s++)Ac(e[s],this,i,t);return i.sort(gp),i}}function gp(n,e){return n.distance-e.distance}function Ac(n,e,t,i){if(n.layers.test(e.layers)&&n.raycast(e,t),i===!0){const s=n.children;for(let r=0,o=s.length;r<o;r++)Ac(s[r],e,t,!0)}}class _p{constructor(e=1,t=0,i=0){return this.radius=e,this.phi=t,this.theta=i,this}set(e,t,i){return this.radius=e,this.phi=t,this.theta=i,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=Math.max(1e-6,Math.min(Math.PI-1e-6,this.phi)),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,i){return this.radius=Math.sqrt(e*e+t*t+i*i),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,i),this.phi=Math.acos(ln(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}class Sc extends U0{constructor(e,t=16776960){const i=new Uint16Array([0,1,1,2,2,3,3,0,4,5,5,6,6,7,7,4,0,4,1,5,2,6,3,7]),s=[1,1,1,-1,1,1,-1,-1,1,1,-1,1,1,1,-1,-1,1,-1,-1,-1,-1,1,-1,-1],r=new Zt;r.setIndex(new In(i,1)),r.setAttribute("position",new bt(s,3)),super(r,new md({color:t,toneMapped:!1})),this.box=e,this.type="Box3Helper",this.geometry.computeBoundingSphere()}updateMatrixWorld(e){const t=this.box;t.isEmpty()||(t.getCenter(this.position),t.getSize(this.scale),this.scale.multiplyScalar(.5),super.updateMatrixWorld(e))}dispose(){this.geometry.dispose(),this.material.dispose()}}typeof __THREE_DEVTOOLS__!="undefined"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:rd}}));typeof window!="undefined"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=rd);const vp={type:"change"},Wu={type:"start"},yp={type:"end"};class q0 extends zs{constructor(e,t){super(),this.object=e,this.domElement=t,this.domElement.style.touchAction="none",this.enabled=!0,this.target=new L,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:xr.ROTATE,MIDDLE:xr.DOLLY,RIGHT:xr.PAN},this.touches={ONE:br.ROTATE,TWO:br.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this.getPolarAngle=function(){return a.phi},this.getAzimuthalAngle=function(){return a.theta},this.getDistance=function(){return this.object.position.distanceTo(this.target)},this.listenToKeyEvents=function(W){W.addEventListener("keydown",Re),this._domElementKeyEvents=W},this.stopListenToKeyEvents=function(){this._domElementKeyEvents.removeEventListener("keydown",Re),this._domElementKeyEvents=null},this.saveState=function(){i.target0.copy(i.target),i.position0.copy(i.object.position),i.zoom0=i.object.zoom},this.reset=function(){i.target.copy(i.target0),i.object.position.copy(i.position0),i.object.zoom=i.zoom0,i.object.updateProjectionMatrix(),i.dispatchEvent(vp),i.update(),r=s.NONE},this.update=function(){const W=new L,ye=new zi().setFromUnitVectors(e.up,new L(0,1,0)),pe=ye.clone().invert(),ze=new L,Ke=new zi,et=2*Math.PI;return function(){const We=i.object.position;W.copy(We).sub(i.target),W.applyQuaternion(ye),a.setFromVector3(W),i.autoRotate&&r===s.NONE&&b(F()),i.enableDamping?(a.theta+=l.theta*i.dampingFactor,a.phi+=l.phi*i.dampingFactor):(a.theta+=l.theta,a.phi+=l.phi);let rt=i.minAzimuthAngle,ft=i.maxAzimuthAngle;return isFinite(rt)&&isFinite(ft)&&(rt<-Math.PI?rt+=et:rt>Math.PI&&(rt-=et),ft<-Math.PI?ft+=et:ft>Math.PI&&(ft-=et),rt<=ft?a.theta=Math.max(rt,Math.min(ft,a.theta)):a.theta=a.theta>(rt+ft)/2?Math.max(rt,a.theta):Math.min(ft,a.theta)),a.phi=Math.max(i.minPolarAngle,Math.min(i.maxPolarAngle,a.phi)),a.makeSafe(),a.radius*=u,a.radius=Math.max(i.minDistance,Math.min(i.maxDistance,a.radius)),i.enableDamping===!0?i.target.addScaledVector(d,i.dampingFactor):i.target.add(d),W.setFromSpherical(a),W.applyQuaternion(pe),We.copy(i.target).add(W),i.object.lookAt(i.target),i.enableDamping===!0?(l.theta*=1-i.dampingFactor,l.phi*=1-i.dampingFactor,d.multiplyScalar(1-i.dampingFactor)):(l.set(0,0,0),d.set(0,0,0)),u=1,h||ze.distanceToSquared(i.object.position)>o||8*(1-Ke.dot(i.object.quaternion))>o?(i.dispatchEvent(vp),ze.copy(i.object.position),Ke.copy(i.object.quaternion),h=!1,!0):!1}}(),this.dispose=function(){i.domElement.removeEventListener("contextmenu",S),i.domElement.removeEventListener("pointerdown",ue),i.domElement.removeEventListener("pointercancel",be),i.domElement.removeEventListener("wheel",Ae),i.domElement.removeEventListener("pointermove",fe),i.domElement.removeEventListener("pointerup",be),i._domElementKeyEvents!==null&&(i._domElementKeyEvents.removeEventListener("keydown",Re),i._domElementKeyEvents=null)};const i=this,s={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6};let r=s.NONE;const o=1e-6,a=new _p,l=new _p;let u=1;const d=new L;let h=!1;const f=new Ue,p=new Ue,g=new Ue,v=new Ue,_=new Ue,m=new Ue,E=new Ue,y=new Ue,x=new Ue,M=[],A={};function F(){return 2*Math.PI/60/60*i.autoRotateSpeed}function I(){return Math.pow(.95,i.zoomSpeed)}function b(W){l.theta-=W}function w(W){l.phi-=W}const oe=function(){const W=new L;return function(pe,ze){W.setFromMatrixColumn(ze,0),W.multiplyScalar(-pe),d.add(W)}}(),X=function(){const W=new L;return function(pe,ze){i.screenSpacePanning===!0?W.setFromMatrixColumn(ze,1):(W.setFromMatrixColumn(ze,0),W.crossVectors(i.object.up,W)),W.multiplyScalar(pe),d.add(W)}}(),z=function(){const W=new L;return function(pe,ze){const Ke=i.domElement;if(i.object.isPerspectiveCamera){const et=i.object.position;W.copy(et).sub(i.target);let qe=W.length();qe*=Math.tan(i.object.fov/2*Math.PI/180),oe(2*pe*qe/Ke.clientHeight,i.object.matrix),X(2*ze*qe/Ke.clientHeight,i.object.matrix)}else i.object.isOrthographicCamera?(oe(pe*(i.object.right-i.object.left)/i.object.zoom/Ke.clientWidth,i.object.matrix),X(ze*(i.object.top-i.object.bottom)/i.object.zoom/Ke.clientHeight,i.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),i.enablePan=!1)}}();function T(W){i.object.isPerspectiveCamera?u/=W:i.object.isOrthographicCamera?(i.object.zoom=Math.max(i.minZoom,Math.min(i.maxZoom,i.object.zoom*W)),i.object.updateProjectionMatrix(),h=!0):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),i.enableZoom=!1)}function G(W){i.object.isPerspectiveCamera?u*=W:i.object.isOrthographicCamera?(i.object.zoom=Math.max(i.minZoom,Math.min(i.maxZoom,i.object.zoom/W)),i.object.updateProjectionMatrix(),h=!0):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),i.enableZoom=!1)}function re(W){f.set(W.clientX,W.clientY)}function ae(W){E.set(W.clientX,W.clientY)}function C(W){v.set(W.clientX,W.clientY)}function J(W){p.set(W.clientX,W.clientY),g.subVectors(p,f).multiplyScalar(i.rotateSpeed);const ye=i.domElement;b(2*Math.PI*g.x/ye.clientHeight),w(2*Math.PI*g.y/ye.clientHeight),f.copy(p),i.update()}function $(W){y.set(W.clientX,W.clientY),x.subVectors(y,E),x.y>0?T(I()):x.y<0&&G(I()),E.copy(y),i.update()}function ee(W){_.set(W.clientX,W.clientY),m.subVectors(_,v).multiplyScalar(i.panSpeed),z(m.x,m.y),v.copy(_),i.update()}function U(W){W.deltaY<0?G(I()):W.deltaY>0&&T(I()),i.update()}function N(W){let ye=!1;switch(W.code){case i.keys.UP:W.ctrlKey||W.metaKey||W.shiftKey?w(2*Math.PI*i.rotateSpeed/i.domElement.clientHeight):z(0,i.keyPanSpeed),ye=!0;break;case i.keys.BOTTOM:W.ctrlKey||W.metaKey||W.shiftKey?w(-2*Math.PI*i.rotateSpeed/i.domElement.clientHeight):z(0,-i.keyPanSpeed),ye=!0;break;case i.keys.LEFT:W.ctrlKey||W.metaKey||W.shiftKey?b(2*Math.PI*i.rotateSpeed/i.domElement.clientHeight):z(i.keyPanSpeed,0),ye=!0;break;case i.keys.RIGHT:W.ctrlKey||W.metaKey||W.shiftKey?b(-2*Math.PI*i.rotateSpeed/i.domElement.clientHeight):z(-i.keyPanSpeed,0),ye=!0;break}ye&&(W.preventDefault(),i.update())}function le(){if(M.length===1)f.set(M[0].pageX,M[0].pageY);else{const W=.5*(M[0].pageX+M[1].pageX),ye=.5*(M[0].pageY+M[1].pageY);f.set(W,ye)}}function Y(){if(M.length===1)v.set(M[0].pageX,M[0].pageY);else{const W=.5*(M[0].pageX+M[1].pageX),ye=.5*(M[0].pageY+M[1].pageY);v.set(W,ye)}}function ce(){const W=M[0].pageX-M[1].pageX,ye=M[0].pageY-M[1].pageY,pe=Math.sqrt(W*W+ye*ye);E.set(0,pe)}function O(){i.enableZoom&&ce(),i.enablePan&&Y()}function Fe(){i.enableZoom&&ce(),i.enableRotate&&le()}function Oe(W){if(M.length==1)p.set(W.pageX,W.pageY);else{const pe=Le(W),ze=.5*(W.pageX+pe.x),Ke=.5*(W.pageY+pe.y);p.set(ze,Ke)}g.subVectors(p,f).multiplyScalar(i.rotateSpeed);const ye=i.domElement;b(2*Math.PI*g.x/ye.clientHeight),w(2*Math.PI*g.y/ye.clientHeight),f.copy(p)}function Pe(W){if(M.length===1)_.set(W.pageX,W.pageY);else{const ye=Le(W),pe=.5*(W.pageX+ye.x),ze=.5*(W.pageY+ye.y);_.set(pe,ze)}m.subVectors(_,v).multiplyScalar(i.panSpeed),z(m.x,m.y),v.copy(_)}function Ne(W){const ye=Le(W),pe=W.pageX-ye.x,ze=W.pageY-ye.y,Ke=Math.sqrt(pe*pe+ze*ze);y.set(0,Ke),x.set(0,Math.pow(y.y/E.y,i.zoomSpeed)),T(x.y),E.copy(y)}function P(W){i.enableZoom&&Ne(W),i.enablePan&&Pe(W)}function k(W){i.enableZoom&&Ne(W),i.enableRotate&&Oe(W)}function ue(W){i.enabled!==!1&&(M.length===0&&(i.domElement.setPointerCapture(W.pointerId),i.domElement.addEventListener("pointermove",fe),i.domElement.addEventListener("pointerup",be)),se(W),W.pointerType==="touch"?Te(W):De(W))}function fe(W){i.enabled!==!1&&(W.pointerType==="touch"?D(W):Ie(W))}function be(W){ve(W),M.length===0&&(i.domElement.releasePointerCapture(W.pointerId),i.domElement.removeEventListener("pointermove",fe),i.domElement.removeEventListener("pointerup",be)),i.dispatchEvent(yp),r=s.NONE}function De(W){let ye;switch(W.button){case 0:ye=i.mouseButtons.LEFT;break;case 1:ye=i.mouseButtons.MIDDLE;break;case 2:ye=i.mouseButtons.RIGHT;break;default:ye=-1}switch(ye){case xr.DOLLY:if(i.enableZoom===!1)return;ae(W),r=s.DOLLY;break;case xr.ROTATE:if(W.ctrlKey||W.metaKey||W.shiftKey){if(i.enablePan===!1)return;C(W),r=s.PAN}else{if(i.enableRotate===!1)return;re(W),r=s.ROTATE}break;case xr.PAN:if(W.ctrlKey||W.metaKey||W.shiftKey){if(i.enableRotate===!1)return;re(W),r=s.ROTATE}else{if(i.enablePan===!1)return;C(W),r=s.PAN}break;default:r=s.NONE}r!==s.NONE&&i.dispatchEvent(Wu)}function Ie(W){switch(r){case s.ROTATE:if(i.enableRotate===!1)return;J(W);break;case s.DOLLY:if(i.enableZoom===!1)return;$(W);break;case s.PAN:if(i.enablePan===!1)return;ee(W);break}}function Ae(W){i.enabled===!1||i.enableZoom===!1||r!==s.NONE||(W.preventDefault(),i.dispatchEvent(Wu),U(W),i.dispatchEvent(yp))}function Re(W){i.enabled===!1||i.enablePan===!1||N(W)}function Te(W){switch(xe(W),M.length){case 1:switch(i.touches.ONE){case br.ROTATE:if(i.enableRotate===!1)return;le(),r=s.TOUCH_ROTATE;break;case br.PAN:if(i.enablePan===!1)return;Y(),r=s.TOUCH_PAN;break;default:r=s.NONE}break;case 2:switch(i.touches.TWO){case br.DOLLY_PAN:if(i.enableZoom===!1&&i.enablePan===!1)return;O(),r=s.TOUCH_DOLLY_PAN;break;case br.DOLLY_ROTATE:if(i.enableZoom===!1&&i.enableRotate===!1)return;Fe(),r=s.TOUCH_DOLLY_ROTATE;break;default:r=s.NONE}break;default:r=s.NONE}r!==s.NONE&&i.dispatchEvent(Wu)}function D(W){switch(xe(W),r){case s.TOUCH_ROTATE:if(i.enableRotate===!1)return;Oe(W),i.update();break;case s.TOUCH_PAN:if(i.enablePan===!1)return;Pe(W),i.update();break;case s.TOUCH_DOLLY_PAN:if(i.enableZoom===!1&&i.enablePan===!1)return;P(W),i.update();break;case s.TOUCH_DOLLY_ROTATE:if(i.enableZoom===!1&&i.enableRotate===!1)return;k(W),i.update();break;default:r=s.NONE}}function S(W){i.enabled!==!1&&W.preventDefault()}function se(W){M.push(W)}function ve(W){delete A[W.pointerId];for(let ye=0;ye<M.length;ye++)if(M[ye].pointerId==W.pointerId){M.splice(ye,1);return}}function xe(W){let ye=A[W.pointerId];ye===void 0&&(ye=new Ue,A[W.pointerId]=ye),ye.set(W.pageX,W.pageY)}function Le(W){const ye=W.pointerId===M[0].pointerId?M[1]:M[0];return A[ye.pointerId]}i.domElement.addEventListener("contextmenu",S),i.domElement.addEventListener("pointerdown",ue),i.domElement.addEventListener("pointercancel",be),i.domElement.addEventListener("wheel",Ae,{passive:!1}),this.update()}}const Wr=new va(0,0,0,"YXZ"),Xr=new L,Tw={type:"change"},Cw={type:"lock"},Dw={type:"unlock"},Ep=Math.PI/2;class Rw extends zs{constructor(e,t){super(),this.camera=e,this.domElement=t,this.isLocked=!1,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.pointerSpeed=1,this._onMouseMove=Fw.bind(this),this._onPointerlockChange=Pw.bind(this),this._onPointerlockError=Lw.bind(this),this.connect()}connect(){this.domElement.ownerDocument.addEventListener("mousemove",this._onMouseMove),this.domElement.ownerDocument.addEventListener("pointerlockchange",this._onPointerlockChange),this.domElement.ownerDocument.addEventListener("pointerlockerror",this._onPointerlockError)}disconnect(){this.domElement.ownerDocument.removeEventListener("mousemove",this._onMouseMove),this.domElement.ownerDocument.removeEventListener("pointerlockchange",this._onPointerlockChange),this.domElement.ownerDocument.removeEventListener("pointerlockerror",this._onPointerlockError)}dispose(){this.disconnect()}getObject(){return this.camera}getDirection(e){return e.set(0,0,-1).applyQuaternion(this.camera.quaternion)}moveForward(e){const t=this.camera;Xr.setFromMatrixColumn(t.matrix,0),Xr.crossVectors(t.up,Xr),t.position.addScaledVector(Xr,e)}moveRight(e){const t=this.camera;Xr.setFromMatrixColumn(t.matrix,0),t.position.addScaledVector(Xr,e)}lock(){this.domElement.requestPointerLock()}unlock(){this.domElement.ownerDocument.exitPointerLock()}}function Fw(n){if(this.isLocked===!1)return;const e=n.movementX||n.mozMovementX||n.webkitMovementX||0,t=n.movementY||n.mozMovementY||n.webkitMovementY||0,i=this.camera;Wr.setFromQuaternion(i.quaternion),Wr.y-=e*.002*this.pointerSpeed,Wr.x-=t*.002*this.pointerSpeed,Wr.x=Math.max(Ep-this.maxPolarAngle,Math.min(Ep-this.minPolarAngle,Wr.x)),i.quaternion.setFromEuler(Wr),this.dispatchEvent(Tw)}function Pw(){this.domElement.ownerDocument.pointerLockElement===this.domElement?(this.dispatchEvent(Cw),this.isLocked=!0):(this.dispatchEvent(Dw),this.isLocked=!1)}function Lw(){console.error("THREE.PointerLockControls: Unable to use Pointer Lock API")}function xp(n,e){if(e===f2)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),n;if(e===_c||e===c0){let t=n.getIndex();if(t===null){const o=[],a=n.getAttribute("position");if(a!==void 0){for(let l=0;l<a.count;l++)o.push(l);n.setIndex(o),t=n.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),n}const i=t.count-2,s=[];if(e===_c)for(let o=1;o<=i;o++)s.push(t.getX(0)),s.push(t.getX(o)),s.push(t.getX(o+1));else for(let o=0;o<i;o++)o%2===0?(s.push(t.getX(o)),s.push(t.getX(o+1)),s.push(t.getX(o+2))):(s.push(t.getX(o+2)),s.push(t.getX(o+1)),s.push(t.getX(o)));s.length/3!==i&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");const r=n.clone();return r.setIndex(s),r.clearGroups(),r}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),n}class K0 extends Ea{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new Ow(t)}),this.register(function(t){return new Ww(t)}),this.register(function(t){return new Xw(t)}),this.register(function(t){return new jw(t)}),this.register(function(t){return new zw(t)}),this.register(function(t){return new Hw(t)}),this.register(function(t){return new $w(t)}),this.register(function(t){return new Vw(t)}),this.register(function(t){return new Nw(t)}),this.register(function(t){return new Gw(t)}),this.register(function(t){return new kw(t)}),this.register(function(t){return new Bw(t)}),this.register(function(t){return new qw(t)}),this.register(function(t){return new Kw(t)})}load(e,t,i,s){const r=this;let o;this.resourcePath!==""?o=this.resourcePath:this.path!==""?o=this.path:o=Mc.extractUrlBase(e),this.manager.itemStart(e);const a=function(u){s?s(u):console.error(u),r.manager.itemError(e),r.manager.itemEnd(e)},l=new W0(this.manager);l.setPath(this.path),l.setResponseType("arraybuffer"),l.setRequestHeader(this.requestHeader),l.setWithCredentials(this.withCredentials),l.load(e,function(u){try{r.parse(u,o,function(d){t(d),r.manager.itemEnd(e)},a)}catch(d){a(d)}},i,a)}setDRACOLoader(e){return this.dracoLoader=e,this}setDDSLoader(){throw new Error('THREE.GLTFLoader: "MSFT_texture_dds" no longer supported. Please update to "KHR_texture_basisu".')}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,i,s){let r;const o={},a={},l=new TextDecoder;if(typeof e=="string")r=JSON.parse(e);else if(e instanceof ArrayBuffer)if(l.decode(new Uint8Array(e,0,4))===Y0){try{o[Tt.KHR_BINARY_GLTF]=new Yw(e)}catch(h){s&&s(h);return}r=JSON.parse(o[Tt.KHR_BINARY_GLTF].content)}else r=JSON.parse(l.decode(e));else r=e;if(r.asset===void 0||r.asset.version[0]<2){s&&s(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}const u=new uT(r,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});u.fileLoader.setRequestHeader(this.requestHeader);for(let d=0;d<this.pluginCallbacks.length;d++){const h=this.pluginCallbacks[d](u);a[h.name]=h,o[h.name]=!0}if(r.extensionsUsed)for(let d=0;d<r.extensionsUsed.length;++d){const h=r.extensionsUsed[d],f=r.extensionsRequired||[];switch(h){case Tt.KHR_MATERIALS_UNLIT:o[h]=new Uw;break;case Tt.KHR_DRACO_MESH_COMPRESSION:o[h]=new Jw(r,this.dracoLoader);break;case Tt.KHR_TEXTURE_TRANSFORM:o[h]=new Zw;break;case Tt.KHR_MESH_QUANTIZATION:o[h]=new Qw;break;default:f.indexOf(h)>=0&&a[h]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+h+'".')}}u.setExtensions(o),u.setPlugins(a),u.parse(i,s)}parseAsync(e,t){const i=this;return new Promise(function(s,r){i.parse(e,t,s,r)})}}function Iw(){let n={};return{get:function(e){return n[e]},add:function(e,t){n[e]=t},remove:function(e){delete n[e]},removeAll:function(){n={}}}}const Tt={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"};class Bw{constructor(e){this.parser=e,this.name=Tt.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){const e=this.parser,t=this.parser.json.nodes||[];for(let i=0,s=t.length;i<s;i++){const r=t[i];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(e){const t=this.parser,i="light:"+e;let s=t.cache.get(i);if(s)return s;const r=t.json,l=((r.extensions&&r.extensions[this.name]||{}).lights||[])[e];let u;const d=new ut(16777215);l.color!==void 0&&d.fromArray(l.color);const h=l.range!==void 0?l.range:0;switch(l.type){case"directional":u=new Sd(d),u.target.position.set(0,0,-1),u.add(u.target);break;case"point":u=new pw(d),u.distance=h;break;case"spot":u=new hw(d),u.distance=h,l.spot=l.spot||{},l.spot.innerConeAngle=l.spot.innerConeAngle!==void 0?l.spot.innerConeAngle:0,l.spot.outerConeAngle=l.spot.outerConeAngle!==void 0?l.spot.outerConeAngle:Math.PI/4,u.angle=l.spot.outerConeAngle,u.penumbra=1-l.spot.innerConeAngle/l.spot.outerConeAngle,u.target.position.set(0,0,-1),u.add(u.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+l.type)}return u.position.set(0,0,0),u.decay=2,Ts(u,l),l.intensity!==void 0&&(u.intensity=l.intensity),u.name=t.createUniqueName(l.name||"light_"+e),s=Promise.resolve(u),t.cache.add(i,s),s}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){const t=this,i=this.parser,r=i.json.nodes[e],a=(r.extensions&&r.extensions[this.name]||{}).light;return a===void 0?null:this._loadLight(a).then(function(l){return i._getNodeRef(t.cache,a,l)})}}class Uw{constructor(){this.name=Tt.KHR_MATERIALS_UNLIT}getMaterialType(){return Vn}extendParams(e,t,i){const s=[];e.color=new ut(1,1,1),e.opacity=1;const r=t.pbrMetallicRoughness;if(r){if(Array.isArray(r.baseColorFactor)){const o=r.baseColorFactor;e.color.fromArray(o),e.opacity=o[3]}r.baseColorTexture!==void 0&&s.push(i.assignTexture(e,"map",r.baseColorTexture,dt))}return Promise.all(s)}}class Nw{constructor(e){this.parser=e,this.name=Tt.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){const s=this.parser.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();const r=s.extensions[this.name].emissiveStrength;return r!==void 0&&(t.emissiveIntensity=r),Promise.resolve()}}class Ow{constructor(e){this.parser=e,this.name=Tt.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){const i=this.parser.json.materials[e];return!i.extensions||!i.extensions[this.name]?null:Kn}extendMaterialParams(e,t){const i=this.parser,s=i.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();const r=[],o=s.extensions[this.name];if(o.clearcoatFactor!==void 0&&(t.clearcoat=o.clearcoatFactor),o.clearcoatTexture!==void 0&&r.push(i.assignTexture(t,"clearcoatMap",o.clearcoatTexture)),o.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=o.clearcoatRoughnessFactor),o.clearcoatRoughnessTexture!==void 0&&r.push(i.assignTexture(t,"clearcoatRoughnessMap",o.clearcoatRoughnessTexture)),o.clearcoatNormalTexture!==void 0&&(r.push(i.assignTexture(t,"clearcoatNormalMap",o.clearcoatNormalTexture)),o.clearcoatNormalTexture.scale!==void 0)){const a=o.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new Ue(a,a)}return Promise.all(r)}}class kw{constructor(e){this.parser=e,this.name=Tt.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){const i=this.parser.json.materials[e];return!i.extensions||!i.extensions[this.name]?null:Kn}extendMaterialParams(e,t){const i=this.parser,s=i.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();const r=[],o=s.extensions[this.name];return o.iridescenceFactor!==void 0&&(t.iridescence=o.iridescenceFactor),o.iridescenceTexture!==void 0&&r.push(i.assignTexture(t,"iridescenceMap",o.iridescenceTexture)),o.iridescenceIor!==void 0&&(t.iridescenceIOR=o.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),o.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=o.iridescenceThicknessMinimum),o.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=o.iridescenceThicknessMaximum),o.iridescenceThicknessTexture!==void 0&&r.push(i.assignTexture(t,"iridescenceThicknessMap",o.iridescenceThicknessTexture)),Promise.all(r)}}class zw{constructor(e){this.parser=e,this.name=Tt.KHR_MATERIALS_SHEEN}getMaterialType(e){const i=this.parser.json.materials[e];return!i.extensions||!i.extensions[this.name]?null:Kn}extendMaterialParams(e,t){const i=this.parser,s=i.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();const r=[];t.sheenColor=new ut(0,0,0),t.sheenRoughness=0,t.sheen=1;const o=s.extensions[this.name];return o.sheenColorFactor!==void 0&&t.sheenColor.fromArray(o.sheenColorFactor),o.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=o.sheenRoughnessFactor),o.sheenColorTexture!==void 0&&r.push(i.assignTexture(t,"sheenColorMap",o.sheenColorTexture,dt)),o.sheenRoughnessTexture!==void 0&&r.push(i.assignTexture(t,"sheenRoughnessMap",o.sheenRoughnessTexture)),Promise.all(r)}}class Hw{constructor(e){this.parser=e,this.name=Tt.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){const i=this.parser.json.materials[e];return!i.extensions||!i.extensions[this.name]?null:Kn}extendMaterialParams(e,t){const i=this.parser,s=i.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();const r=[],o=s.extensions[this.name];return o.transmissionFactor!==void 0&&(t.transmission=o.transmissionFactor),o.transmissionTexture!==void 0&&r.push(i.assignTexture(t,"transmissionMap",o.transmissionTexture)),Promise.all(r)}}class $w{constructor(e){this.parser=e,this.name=Tt.KHR_MATERIALS_VOLUME}getMaterialType(e){const i=this.parser.json.materials[e];return!i.extensions||!i.extensions[this.name]?null:Kn}extendMaterialParams(e,t){const i=this.parser,s=i.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();const r=[],o=s.extensions[this.name];t.thickness=o.thicknessFactor!==void 0?o.thicknessFactor:0,o.thicknessTexture!==void 0&&r.push(i.assignTexture(t,"thicknessMap",o.thicknessTexture)),t.attenuationDistance=o.attenuationDistance||1/0;const a=o.attenuationColor||[1,1,1];return t.attenuationColor=new ut(a[0],a[1],a[2]),Promise.all(r)}}class Vw{constructor(e){this.parser=e,this.name=Tt.KHR_MATERIALS_IOR}getMaterialType(e){const i=this.parser.json.materials[e];return!i.extensions||!i.extensions[this.name]?null:Kn}extendMaterialParams(e,t){const s=this.parser.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();const r=s.extensions[this.name];return t.ior=r.ior!==void 0?r.ior:1.5,Promise.resolve()}}class Gw{constructor(e){this.parser=e,this.name=Tt.KHR_MATERIALS_SPECULAR}getMaterialType(e){const i=this.parser.json.materials[e];return!i.extensions||!i.extensions[this.name]?null:Kn}extendMaterialParams(e,t){const i=this.parser,s=i.json.materials[e];if(!s.extensions||!s.extensions[this.name])return Promise.resolve();const r=[],o=s.extensions[this.name];t.specularIntensity=o.specularFactor!==void 0?o.specularFactor:1,o.specularTexture!==void 0&&r.push(i.assignTexture(t,"specularIntensityMap",o.specularTexture));const a=o.specularColorFactor||[1,1,1];return t.specularColor=new ut(a[0],a[1],a[2]),o.specularColorTexture!==void 0&&r.push(i.assignTexture(t,"specularColorMap",o.specularColorTexture,dt)),Promise.all(r)}}class Ww{constructor(e){this.parser=e,this.name=Tt.KHR_TEXTURE_BASISU}loadTexture(e){const t=this.parser,i=t.json,s=i.textures[e];if(!s.extensions||!s.extensions[this.name])return null;const r=s.extensions[this.name],o=t.options.ktx2Loader;if(!o){if(i.extensionsRequired&&i.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,r.source,o)}}class Xw{constructor(e){this.parser=e,this.name=Tt.EXT_TEXTURE_WEBP,this.isSupported=null}loadTexture(e){const t=this.name,i=this.parser,s=i.json,r=s.textures[e];if(!r.extensions||!r.extensions[t])return null;const o=r.extensions[t],a=s.images[o.source];let l=i.textureLoader;if(a.uri){const u=i.options.manager.getHandler(a.uri);u!==null&&(l=u)}return this.detectSupport().then(function(u){if(u)return i.loadTextureImage(e,o.source,l);if(s.extensionsRequired&&s.extensionsRequired.indexOf(t)>=0)throw new Error("THREE.GLTFLoader: WebP required by asset but unsupported.");return i.loadTexture(e)})}detectSupport(){return this.isSupported||(this.isSupported=new Promise(function(e){const t=new Image;t.src="data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",t.onload=t.onerror=function(){e(t.height===1)}})),this.isSupported}}class jw{constructor(e){this.parser=e,this.name=Tt.EXT_TEXTURE_AVIF,this.isSupported=null}loadTexture(e){const t=this.name,i=this.parser,s=i.json,r=s.textures[e];if(!r.extensions||!r.extensions[t])return null;const o=r.extensions[t],a=s.images[o.source];let l=i.textureLoader;if(a.uri){const u=i.options.manager.getHandler(a.uri);u!==null&&(l=u)}return this.detectSupport().then(function(u){if(u)return i.loadTextureImage(e,o.source,l);if(s.extensionsRequired&&s.extensionsRequired.indexOf(t)>=0)throw new Error("THREE.GLTFLoader: AVIF required by asset but unsupported.");return i.loadTexture(e)})}detectSupport(){return this.isSupported||(this.isSupported=new Promise(function(e){const t=new Image;t.src="data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=",t.onload=t.onerror=function(){e(t.height===1)}})),this.isSupported}}class qw{constructor(e){this.name=Tt.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){const t=this.parser.json,i=t.bufferViews[e];if(i.extensions&&i.extensions[this.name]){const s=i.extensions[this.name],r=this.parser.getDependency("buffer",s.buffer),o=this.parser.options.meshoptDecoder;if(!o||!o.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return r.then(function(a){const l=s.byteOffset||0,u=s.byteLength||0,d=s.count,h=s.byteStride,f=new Uint8Array(a,l,u);return o.decodeGltfBufferAsync?o.decodeGltfBufferAsync(d,h,f,s.mode,s.filter).then(function(p){return p.buffer}):o.ready.then(function(){const p=new ArrayBuffer(d*h);return o.decodeGltfBuffer(new Uint8Array(p),d,h,f,s.mode,s.filter),p})})}else return null}}class Kw{constructor(e){this.name=Tt.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){const t=this.parser.json,i=t.nodes[e];if(!i.extensions||!i.extensions[this.name]||i.mesh===void 0)return null;const s=t.meshes[i.mesh];for(const u of s.primitives)if(u.mode!==ui.TRIANGLES&&u.mode!==ui.TRIANGLE_STRIP&&u.mode!==ui.TRIANGLE_FAN&&u.mode!==void 0)return null;const o=i.extensions[this.name].attributes,a=[],l={};for(const u in o)a.push(this.parser.getDependency("accessor",o[u]).then(d=>(l[u]=d,l[u])));return a.length<1?null:(a.push(this.parser.createNodeMesh(e)),Promise.all(a).then(u=>{const d=u.pop(),h=d.isGroup?d.children:[d],f=u[0].count,p=[];for(const g of h){const v=new xt,_=new L,m=new zi,E=new L(1,1,1),y=new fl(g.geometry,g.material,f);for(let x=0;x<f;x++)l.TRANSLATION&&_.fromBufferAttribute(l.TRANSLATION,x),l.ROTATION&&m.fromBufferAttribute(l.ROTATION,x),l.SCALE&&E.fromBufferAttribute(l.SCALE,x),y.setMatrixAt(x,v.compose(_,m,E));for(const x in l)x!=="TRANSLATION"&&x!=="ROTATION"&&x!=="SCALE"&&g.geometry.setAttribute(x,l[x]);Vt.prototype.copy.call(y,g),this.parser.assignFinalMaterial(y),p.push(y)}return d.isGroup?(d.clear(),d.add(...p),d):p[0]}))}}const Y0="glTF",Oo=12,bp={JSON:1313821514,BIN:5130562};class Yw{constructor(e){this.name=Tt.KHR_BINARY_GLTF,this.content=null,this.body=null;const t=new DataView(e,0,Oo),i=new TextDecoder;if(this.header={magic:i.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==Y0)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");const s=this.header.length-Oo,r=new DataView(e,Oo);let o=0;for(;o<s;){const a=r.getUint32(o,!0);o+=4;const l=r.getUint32(o,!0);if(o+=4,l===bp.JSON){const u=new Uint8Array(e,Oo+o,a);this.content=i.decode(u)}else if(l===bp.BIN){const u=Oo+o;this.body=e.slice(u,u+a)}o+=a}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}}class Jw{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=Tt.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){const i=this.json,s=this.dracoLoader,r=e.extensions[this.name].bufferView,o=e.extensions[this.name].attributes,a={},l={},u={};for(const d in o){const h=wc[d]||d.toLowerCase();a[h]=o[d]}for(const d in e.attributes){const h=wc[d]||d.toLowerCase();if(o[d]!==void 0){const f=i.accessors[e.attributes[d]],p=no[f.componentType];u[h]=p.name,l[h]=f.normalized===!0}}return t.getDependency("bufferView",r).then(function(d){return new Promise(function(h){s.decodeDracoFile(d,function(f){for(const p in f.attributes){const g=f.attributes[p],v=l[p];v!==void 0&&(g.normalized=v)}h(f)},a,u)})})}}class Zw{constructor(){this.name=Tt.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return(t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0||(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),e.needsUpdate=!0),e}}class Qw{constructor(){this.name=Tt.KHR_MESH_QUANTIZATION}}class J0 extends ya{constructor(e,t,i,s){super(e,t,i,s)}copySampleValue_(e){const t=this.resultBuffer,i=this.sampleValues,s=this.valueSize,r=e*s*3+s;for(let o=0;o!==s;o++)t[o]=i[r+o];return t}interpolate_(e,t,i,s){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=a*2,u=a*3,d=s-t,h=(i-t)/d,f=h*h,p=f*h,g=e*u,v=g-u,_=-2*p+3*f,m=p-f,E=1-_,y=m-f+h;for(let x=0;x!==a;x++){const M=o[v+x+a],A=o[v+x+l]*d,F=o[g+x+a],I=o[g+x]*d;r[x]=E*M+y*A+_*F+m*I}return r}}const eT=new zi;class tT extends J0{interpolate_(e,t,i,s){const r=super.interpolate_(e,t,i,s);return eT.fromArray(r).normalize().toArray(r),r}}const ui={FLOAT:5126,FLOAT_MAT3:35675,FLOAT_MAT4:35676,FLOAT_VEC2:35664,FLOAT_VEC3:35665,FLOAT_VEC4:35666,LINEAR:9729,REPEAT:10497,SAMPLER_2D:35678,POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,UNSIGNED_BYTE:5121,UNSIGNED_SHORT:5123},no={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},Mp={9728:pn,9729:qn,9984:gc,9985:l0,9986:dl,9987:cr},Ap={33071:hi,33648:xl,10497:ur},Xu={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},wc={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},bs={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},nT={CUBICSPLINE:void 0,LINEAR:fo,STEP:ca},ju={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function iT(n){return n.DefaultMaterial===void 0&&(n.DefaultMaterial=new lt({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:Oi})),n.DefaultMaterial}function ko(n,e,t){for(const i in t.extensions)n[i]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[i]=t.extensions[i])}function Ts(n,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(n.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function sT(n,e,t){let i=!1,s=!1,r=!1;for(let u=0,d=e.length;u<d;u++){const h=e[u];if(h.POSITION!==void 0&&(i=!0),h.NORMAL!==void 0&&(s=!0),h.COLOR_0!==void 0&&(r=!0),i&&s&&r)break}if(!i&&!s&&!r)return Promise.resolve(n);const o=[],a=[],l=[];for(let u=0,d=e.length;u<d;u++){const h=e[u];if(i){const f=h.POSITION!==void 0?t.getDependency("accessor",h.POSITION):n.attributes.position;o.push(f)}if(s){const f=h.NORMAL!==void 0?t.getDependency("accessor",h.NORMAL):n.attributes.normal;a.push(f)}if(r){const f=h.COLOR_0!==void 0?t.getDependency("accessor",h.COLOR_0):n.attributes.color;l.push(f)}}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(l)]).then(function(u){const d=u[0],h=u[1],f=u[2];return i&&(n.morphAttributes.position=d),s&&(n.morphAttributes.normal=h),r&&(n.morphAttributes.color=f),n.morphTargetsRelative=!0,n})}function rT(n,e){if(n.updateMorphTargets(),e.weights!==void 0)for(let t=0,i=e.weights.length;t<i;t++)n.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){const t=e.extras.targetNames;if(n.morphTargetInfluences.length===t.length){n.morphTargetDictionary={};for(let i=0,s=t.length;i<s;i++)n.morphTargetDictionary[t[i]]=i}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function oT(n){const e=n.extensions&&n.extensions[Tt.KHR_DRACO_MESH_COMPRESSION];let t;return e?t="draco:"+e.bufferView+":"+e.indices+":"+Sp(e.attributes):t=n.indices+":"+Sp(n.attributes)+":"+n.mode,t}function Sp(n){let e="";const t=Object.keys(n).sort();for(let i=0,s=t.length;i<s;i++)e+=t[i]+":"+n[t[i]]+";";return e}function Tc(n){switch(n){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function aT(n){return n.search(/\.jpe?g($|\?)/i)>0||n.search(/^data\:image\/jpeg/)===0?"image/jpeg":n.search(/\.webp($|\?)/i)>0||n.search(/^data\:image\/webp/)===0?"image/webp":"image/png"}const lT=new xt;class uT{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new Iw,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let i=!1,s=!1,r=-1;typeof navigator!="undefined"&&(i=/^((?!chrome|android).)*safari/i.test(navigator.userAgent)===!0,s=navigator.userAgent.indexOf("Firefox")>-1,r=s?navigator.userAgent.match(/Firefox\/([0-9]+)\./)[1]:-1),typeof createImageBitmap=="undefined"||i||s&&r<98?this.textureLoader=new cw(this.options.manager):this.textureLoader=new gw(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new W0(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){const i=this,s=this.json,r=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(o){return o._markDefs&&o._markDefs()}),Promise.all(this._invokeAll(function(o){return o.beforeRoot&&o.beforeRoot()})).then(function(){return Promise.all([i.getDependencies("scene"),i.getDependencies("animation"),i.getDependencies("camera")])}).then(function(o){const a={scene:o[0][s.scene||0],scenes:o[0],animations:o[1],cameras:o[2],asset:s.asset,parser:i,userData:{}};ko(r,a,s),Ts(a,s),Promise.all(i._invokeAll(function(l){return l.afterRoot&&l.afterRoot(a)})).then(function(){e(a)})}).catch(t)}_markDefs(){const e=this.json.nodes||[],t=this.json.skins||[],i=this.json.meshes||[];for(let s=0,r=t.length;s<r;s++){const o=t[s].joints;for(let a=0,l=o.length;a<l;a++)e[o[a]].isBone=!0}for(let s=0,r=e.length;s<r;s++){const o=e[s];o.mesh!==void 0&&(this._addNodeRef(this.meshCache,o.mesh),o.skin!==void 0&&(i[o.mesh].isSkinnedMesh=!0)),o.camera!==void 0&&this._addNodeRef(this.cameraCache,o.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,i){if(e.refs[t]<=1)return i;const s=i.clone(),r=(o,a)=>{const l=this.associations.get(o);l!=null&&this.associations.set(a,l);for(const[u,d]of o.children.entries())r(d,a.children[u])};return r(i,s),s.name+="_instance_"+e.uses[t]++,s}_invokeOne(e){const t=Object.values(this.plugins);t.push(this);for(let i=0;i<t.length;i++){const s=e(t[i]);if(s)return s}return null}_invokeAll(e){const t=Object.values(this.plugins);t.unshift(this);const i=[];for(let s=0;s<t.length;s++){const r=e(t[s]);r&&i.push(r)}return i}getDependency(e,t){const i=e+":"+t;let s=this.cache.get(i);if(!s){switch(e){case"scene":s=this.loadScene(t);break;case"node":s=this._invokeOne(function(r){return r.loadNode&&r.loadNode(t)});break;case"mesh":s=this._invokeOne(function(r){return r.loadMesh&&r.loadMesh(t)});break;case"accessor":s=this.loadAccessor(t);break;case"bufferView":s=this._invokeOne(function(r){return r.loadBufferView&&r.loadBufferView(t)});break;case"buffer":s=this.loadBuffer(t);break;case"material":s=this._invokeOne(function(r){return r.loadMaterial&&r.loadMaterial(t)});break;case"texture":s=this._invokeOne(function(r){return r.loadTexture&&r.loadTexture(t)});break;case"skin":s=this.loadSkin(t);break;case"animation":s=this._invokeOne(function(r){return r.loadAnimation&&r.loadAnimation(t)});break;case"camera":s=this.loadCamera(t);break;default:if(s=this._invokeOne(function(r){return r!=this&&r.getDependency&&r.getDependency(e,t)}),!s)throw new Error("Unknown type: "+e);break}this.cache.add(i,s)}return s}getDependencies(e){let t=this.cache.get(e);if(!t){const i=this,s=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(s.map(function(r,o){return i.getDependency(e,o)})),this.cache.add(e,t)}return t}loadBuffer(e){const t=this.json.buffers[e],i=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[Tt.KHR_BINARY_GLTF].body);const s=this.options;return new Promise(function(r,o){i.load(Mc.resolveURL(t.uri,s.path),r,void 0,function(){o(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){const t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(i){const s=t.byteLength||0,r=t.byteOffset||0;return i.slice(r,r+s)})}loadAccessor(e){const t=this,i=this.json,s=this.json.accessors[e];if(s.bufferView===void 0&&s.sparse===void 0){const o=Xu[s.type],a=no[s.componentType],l=s.normalized===!0,u=new a(s.count*o);return Promise.resolve(new In(u,o,l))}const r=[];return s.bufferView!==void 0?r.push(this.getDependency("bufferView",s.bufferView)):r.push(null),s.sparse!==void 0&&(r.push(this.getDependency("bufferView",s.sparse.indices.bufferView)),r.push(this.getDependency("bufferView",s.sparse.values.bufferView))),Promise.all(r).then(function(o){const a=o[0],l=Xu[s.type],u=no[s.componentType],d=u.BYTES_PER_ELEMENT,h=d*l,f=s.byteOffset||0,p=s.bufferView!==void 0?i.bufferViews[s.bufferView].byteStride:void 0,g=s.normalized===!0;let v,_;if(p&&p!==h){const m=Math.floor(f/p),E="InterleavedBuffer:"+s.bufferView+":"+s.componentType+":"+m+":"+s.count;let y=t.cache.get(E);y||(v=new u(a,m*p,s.count*p/d),y=new P0(v,p/d),t.cache.add(E,y)),_=new ha(y,l,f%p/d,g)}else a===null?v=new u(s.count*l):v=new u(a,f,s.count*l),_=new In(v,l,g);if(s.sparse!==void 0){const m=Xu.SCALAR,E=no[s.sparse.indices.componentType],y=s.sparse.indices.byteOffset||0,x=s.sparse.values.byteOffset||0,M=new E(o[1],y,s.sparse.count*m),A=new u(o[2],x,s.sparse.count*l);a!==null&&(_=new In(_.array.slice(),_.itemSize,_.normalized));for(let F=0,I=M.length;F<I;F++){const b=M[F];if(_.setX(b,A[F*l]),l>=2&&_.setY(b,A[F*l+1]),l>=3&&_.setZ(b,A[F*l+2]),l>=4&&_.setW(b,A[F*l+3]),l>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}}return _})}loadTexture(e){const t=this.json,i=this.options,r=t.textures[e].source,o=t.images[r];let a=this.textureLoader;if(o.uri){const l=i.manager.getHandler(o.uri);l!==null&&(a=l)}return this.loadTextureImage(e,r,a)}loadTextureImage(e,t,i){const s=this,r=this.json,o=r.textures[e],a=r.images[t],l=(a.uri||a.bufferView)+":"+o.sampler;if(this.textureCache[l])return this.textureCache[l];const u=this.loadImageSource(t,i).then(function(d){d.flipY=!1,d.name=o.name||a.name||"",d.name===""&&typeof a.uri=="string"&&a.uri.startsWith("data:image/")===!1&&(d.name=a.uri);const f=(r.samplers||{})[o.sampler]||{};return d.magFilter=Mp[f.magFilter]||qn,d.minFilter=Mp[f.minFilter]||cr,d.wrapS=Ap[f.wrapS]||ur,d.wrapT=Ap[f.wrapT]||ur,s.associations.set(d,{textures:e}),d}).catch(function(){return null});return this.textureCache[l]=u,u}loadImageSource(e,t){const i=this,s=this.json,r=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(h=>h.clone());const o=s.images[e],a=self.URL||self.webkitURL;let l=o.uri||"",u=!1;if(o.bufferView!==void 0)l=i.getDependency("bufferView",o.bufferView).then(function(h){u=!0;const f=new Blob([h],{type:o.mimeType});return l=a.createObjectURL(f),l});else if(o.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");const d=Promise.resolve(l).then(function(h){return new Promise(function(f,p){let g=f;t.isImageBitmapLoader===!0&&(g=function(v){const _=new vn(v);_.needsUpdate=!0,f(_)}),t.load(Mc.resolveURL(h,r.path),g,void 0,p)})}).then(function(h){return u===!0&&a.revokeObjectURL(l),h.userData.mimeType=o.mimeType||aT(o.uri),h}).catch(function(h){throw console.error("THREE.GLTFLoader: Couldn't load texture",l),h});return this.sourceCache[e]=d,d}assignTexture(e,t,i,s){const r=this;return this.getDependency("texture",i.index).then(function(o){if(!o)return null;if(i.texCoord!==void 0&&i.texCoord>0&&(o=o.clone(),o.channel=i.texCoord),r.extensions[Tt.KHR_TEXTURE_TRANSFORM]){const a=i.extensions!==void 0?i.extensions[Tt.KHR_TEXTURE_TRANSFORM]:void 0;if(a){const l=r.associations.get(o);o=r.extensions[Tt.KHR_TEXTURE_TRANSFORM].extendTexture(o,a),r.associations.set(o,l)}}return s!==void 0&&(o.colorSpace=s),e[t]=o,o})}assignFinalMaterial(e){const t=e.geometry;let i=e.material;const s=t.attributes.tangent===void 0,r=t.attributes.color!==void 0,o=t.attributes.normal===void 0;if(e.isPoints){const a="PointsMaterial:"+i.uuid;let l=this.cache.get(a);l||(l=new Ml,wi.prototype.copy.call(l,i),l.color.copy(i.color),l.map=i.map,l.sizeAttenuation=!1,this.cache.add(a,l)),i=l}else if(e.isLine){const a="LineBasicMaterial:"+i.uuid;let l=this.cache.get(a);l||(l=new md,wi.prototype.copy.call(l,i),l.color.copy(i.color),l.map=i.map,this.cache.add(a,l)),i=l}if(s||r||o){let a="ClonedMaterial:"+i.uuid+":";s&&(a+="derivative-tangents:"),r&&(a+="vertex-colors:"),o&&(a+="flat-shading:");let l=this.cache.get(a);l||(l=i.clone(),r&&(l.vertexColors=!0),o&&(l.flatShading=!0),s&&(l.normalScale&&(l.normalScale.y*=-1),l.clearcoatNormalScale&&(l.clearcoatNormalScale.y*=-1)),this.cache.add(a,l),this.associations.set(l,this.associations.get(i))),i=l}e.material=i}getMaterialType(){return lt}loadMaterial(e){const t=this,i=this.json,s=this.extensions,r=i.materials[e];let o;const a={},l=r.extensions||{},u=[];if(l[Tt.KHR_MATERIALS_UNLIT]){const h=s[Tt.KHR_MATERIALS_UNLIT];o=h.getMaterialType(),u.push(h.extendParams(a,r,t))}else{const h=r.pbrMetallicRoughness||{};if(a.color=new ut(1,1,1),a.opacity=1,Array.isArray(h.baseColorFactor)){const f=h.baseColorFactor;a.color.fromArray(f),a.opacity=f[3]}h.baseColorTexture!==void 0&&u.push(t.assignTexture(a,"map",h.baseColorTexture,dt)),a.metalness=h.metallicFactor!==void 0?h.metallicFactor:1,a.roughness=h.roughnessFactor!==void 0?h.roughnessFactor:1,h.metallicRoughnessTexture!==void 0&&(u.push(t.assignTexture(a,"metalnessMap",h.metallicRoughnessTexture)),u.push(t.assignTexture(a,"roughnessMap",h.metallicRoughnessTexture))),o=this._invokeOne(function(f){return f.getMaterialType&&f.getMaterialType(e)}),u.push(Promise.all(this._invokeAll(function(f){return f.extendMaterialParams&&f.extendMaterialParams(e,a)})))}r.doubleSided===!0&&(a.side=Sn);const d=r.alphaMode||ju.OPAQUE;if(d===ju.BLEND?(a.transparent=!0,a.depthWrite=!1):(a.transparent=!1,d===ju.MASK&&(a.alphaTest=r.alphaCutoff!==void 0?r.alphaCutoff:.5)),r.normalTexture!==void 0&&o!==Vn&&(u.push(t.assignTexture(a,"normalMap",r.normalTexture)),a.normalScale=new Ue(1,1),r.normalTexture.scale!==void 0)){const h=r.normalTexture.scale;a.normalScale.set(h,h)}return r.occlusionTexture!==void 0&&o!==Vn&&(u.push(t.assignTexture(a,"aoMap",r.occlusionTexture)),r.occlusionTexture.strength!==void 0&&(a.aoMapIntensity=r.occlusionTexture.strength)),r.emissiveFactor!==void 0&&o!==Vn&&(a.emissive=new ut().fromArray(r.emissiveFactor)),r.emissiveTexture!==void 0&&o!==Vn&&u.push(t.assignTexture(a,"emissiveMap",r.emissiveTexture,dt)),Promise.all(u).then(function(){const h=new o(a);return r.name&&(h.name=r.name),Ts(h,r),t.associations.set(h,{materials:e}),r.extensions&&ko(s,h,r),h})}createUniqueName(e){const t=Lt.sanitizeNodeName(e||"");let i=t;for(let s=1;this.nodeNamesUsed[i];++s)i=t+"_"+s;return this.nodeNamesUsed[i]=!0,i}loadGeometries(e){const t=this,i=this.extensions,s=this.primitiveCache;function r(a){return i[Tt.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(a,t).then(function(l){return wp(l,a,t)})}const o=[];for(let a=0,l=e.length;a<l;a++){const u=e[a],d=oT(u),h=s[d];if(h)o.push(h.promise);else{let f;u.extensions&&u.extensions[Tt.KHR_DRACO_MESH_COMPRESSION]?f=r(u):f=wp(new Zt,u,t),s[d]={primitive:u,promise:f},o.push(f)}}return Promise.all(o)}loadMesh(e){const t=this,i=this.json,s=this.extensions,r=i.meshes[e],o=r.primitives,a=[];for(let l=0,u=o.length;l<u;l++){const d=o[l].material===void 0?iT(this.cache):this.getDependency("material",o[l].material);a.push(d)}return a.push(t.loadGeometries(o)),Promise.all(a).then(function(l){const u=l.slice(0,l.length-1),d=l[l.length-1],h=[];for(let p=0,g=d.length;p<g;p++){const v=d[p],_=o[p];let m;const E=u[p];if(_.mode===ui.TRIANGLES||_.mode===ui.TRIANGLE_STRIP||_.mode===ui.TRIANGLE_FAN||_.mode===void 0)m=r.isSkinnedMesh===!0?new BS(v,E):new je(v,E),m.isSkinnedMesh===!0&&m.normalizeSkinWeights(),_.mode===ui.TRIANGLE_STRIP?m.geometry=xp(m.geometry,c0):_.mode===ui.TRIANGLE_FAN&&(m.geometry=xp(m.geometry,_c));else if(_.mode===ui.LINES)m=new U0(v,E);else if(_.mode===ui.LINE_STRIP)m=new gd(v,E);else if(_.mode===ui.LINE_LOOP)m=new kS(v,E);else if(_.mode===ui.POINTS)m=new bc(v,E);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+_.mode);Object.keys(m.geometry.morphAttributes).length>0&&rT(m,r),m.name=t.createUniqueName(r.name||"mesh_"+e),Ts(m,r),_.extensions&&ko(s,m,_),t.assignFinalMaterial(m),h.push(m)}for(let p=0,g=h.length;p<g;p++)t.associations.set(h[p],{meshes:e,primitives:p});if(h.length===1)return h[0];const f=new vt;t.associations.set(f,{meshes:e});for(let p=0,g=h.length;p<g;p++)f.add(h[p]);return f})}loadCamera(e){let t;const i=this.json.cameras[e],s=i[i.type];if(!s){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return i.type==="perspective"?t=new Fn(Ho.radToDeg(s.yfov),s.aspectRatio||1,s.znear||1,s.zfar||2e6):i.type==="orthographic"&&(t=new dd(-s.xmag,s.xmag,s.ymag,-s.ymag,s.znear,s.zfar)),i.name&&(t.name=this.createUniqueName(i.name)),Ts(t,i),Promise.resolve(t)}loadSkin(e){const t=this.json.skins[e],i=[];for(let s=0,r=t.joints.length;s<r;s++)i.push(this._loadNodeShallow(t.joints[s]));return t.inverseBindMatrices!==void 0?i.push(this.getDependency("accessor",t.inverseBindMatrices)):i.push(null),Promise.all(i).then(function(s){const r=s.pop(),o=s,a=[],l=[];for(let u=0,d=o.length;u<d;u++){const h=o[u];if(h){a.push(h);const f=new xt;r!==null&&f.fromArray(r.array,u*16),l.push(f)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[u])}return new pd(a,l)})}loadAnimation(e){const i=this.json.animations[e],s=i.name?i.name:"animation_"+e,r=[],o=[],a=[],l=[],u=[];for(let d=0,h=i.channels.length;d<h;d++){const f=i.channels[d],p=i.samplers[f.sampler],g=f.target,v=g.node,_=i.parameters!==void 0?i.parameters[p.input]:p.input,m=i.parameters!==void 0?i.parameters[p.output]:p.output;g.node!==void 0&&(r.push(this.getDependency("node",v)),o.push(this.getDependency("accessor",_)),a.push(this.getDependency("accessor",m)),l.push(p),u.push(g))}return Promise.all([Promise.all(r),Promise.all(o),Promise.all(a),Promise.all(l),Promise.all(u)]).then(function(d){const h=d[0],f=d[1],p=d[2],g=d[3],v=d[4],_=[];for(let m=0,E=h.length;m<E;m++){const y=h[m],x=f[m],M=p[m],A=g[m],F=v[m];if(y===void 0)continue;y.updateMatrix();let I;switch(bs[F.path]){case bs.weights:I=pa;break;case bs.rotation:I=pr;break;case bs.position:case bs.scale:default:I=ma;break}const b=y.name?y.name:y.uuid,w=A.interpolation!==void 0?nT[A.interpolation]:fo,oe=[];bs[F.path]===bs.weights?y.traverse(function(z){z.morphTargetInfluences&&oe.push(z.name?z.name:z.uuid)}):oe.push(b);let X=M.array;if(M.normalized){const z=Tc(X.constructor),T=new Float32Array(X.length);for(let G=0,re=X.length;G<re;G++)T[G]=X[G]*z;X=T}for(let z=0,T=oe.length;z<T;z++){const G=new I(oe[z]+"."+bs[F.path],x.array,X,w);A.interpolation==="CUBICSPLINE"&&(G.createInterpolant=function(ae){const C=this instanceof pr?tT:J0;return new C(this.times,this.values,this.getValueSize()/3,ae)},G.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0),_.push(G)}}return new iw(s,void 0,_)})}createNodeMesh(e){const t=this.json,i=this,s=t.nodes[e];return s.mesh===void 0?null:i.getDependency("mesh",s.mesh).then(function(r){const o=i._getNodeRef(i.meshCache,s.mesh,r);return s.weights!==void 0&&o.traverse(function(a){if(!!a.isMesh)for(let l=0,u=s.weights.length;l<u;l++)a.morphTargetInfluences[l]=s.weights[l]}),o})}loadNode(e){const t=this.json,i=this,s=t.nodes[e],r=i._loadNodeShallow(e),o=[],a=s.children||[];for(let u=0,d=a.length;u<d;u++)o.push(i.getDependency("node",a[u]));const l=s.skin===void 0?Promise.resolve(null):i.getDependency("skin",s.skin);return Promise.all([r,Promise.all(o),l]).then(function(u){const d=u[0],h=u[1],f=u[2];f!==null&&d.traverse(function(p){!p.isSkinnedMesh||p.bind(f,lT)});for(let p=0,g=h.length;p<g;p++)d.add(h[p]);return d})}_loadNodeShallow(e){const t=this.json,i=this.extensions,s=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];const r=t.nodes[e],o=r.name?s.createUniqueName(r.name):"",a=[],l=s._invokeOne(function(u){return u.createNodeMesh&&u.createNodeMesh(e)});return l&&a.push(l),r.camera!==void 0&&a.push(s.getDependency("camera",r.camera).then(function(u){return s._getNodeRef(s.cameraCache,r.camera,u)})),s._invokeAll(function(u){return u.createNodeAttachment&&u.createNodeAttachment(e)}).forEach(function(u){a.push(u)}),this.nodeCache[e]=Promise.all(a).then(function(u){let d;if(r.isBone===!0?d=new B0:u.length>1?d=new vt:u.length===1?d=u[0]:d=new Vt,d!==u[0])for(let h=0,f=u.length;h<f;h++)d.add(u[h]);if(r.name&&(d.userData.name=r.name,d.name=o),Ts(d,r),r.extensions&&ko(i,d,r),r.matrix!==void 0){const h=new xt;h.fromArray(r.matrix),d.applyMatrix4(h)}else r.translation!==void 0&&d.position.fromArray(r.translation),r.rotation!==void 0&&d.quaternion.fromArray(r.rotation),r.scale!==void 0&&d.scale.fromArray(r.scale);return s.associations.has(d)||s.associations.set(d,{}),s.associations.get(d).nodes=e,d}),this.nodeCache[e]}loadScene(e){const t=this.extensions,i=this.json.scenes[e],s=this,r=new vt;i.name&&(r.name=s.createUniqueName(i.name)),Ts(r,i),i.extensions&&ko(t,r,i);const o=i.nodes||[],a=[];for(let l=0,u=o.length;l<u;l++)a.push(s.getDependency("node",o[l]));return Promise.all(a).then(function(l){for(let d=0,h=l.length;d<h;d++)r.add(l[d]);const u=d=>{const h=new Map;for(const[f,p]of s.associations)(f instanceof wi||f instanceof vn)&&h.set(f,p);return d.traverse(f=>{const p=s.associations.get(f);p!=null&&h.set(f,p)}),h};return s.associations=u(r),r})}}function cT(n,e,t){const i=e.attributes,s=new mn;if(i.POSITION!==void 0){const a=t.json.accessors[i.POSITION],l=a.min,u=a.max;if(l!==void 0&&u!==void 0){if(s.set(new L(l[0],l[1],l[2]),new L(u[0],u[1],u[2])),a.normalized){const d=Tc(no[a.componentType]);s.min.multiplyScalar(d),s.max.multiplyScalar(d)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;const r=e.targets;if(r!==void 0){const a=new L,l=new L;for(let u=0,d=r.length;u<d;u++){const h=r[u];if(h.POSITION!==void 0){const f=t.json.accessors[h.POSITION],p=f.min,g=f.max;if(p!==void 0&&g!==void 0){if(l.setX(Math.max(Math.abs(p[0]),Math.abs(g[0]))),l.setY(Math.max(Math.abs(p[1]),Math.abs(g[1]))),l.setZ(Math.max(Math.abs(p[2]),Math.abs(g[2]))),f.normalized){const v=Tc(no[f.componentType]);l.multiplyScalar(v)}a.max(l)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}s.expandByVector(a)}n.boundingBox=s;const o=new ls;s.getCenter(o.center),o.radius=s.min.distanceTo(s.max)/2,n.boundingSphere=o}function wp(n,e,t){const i=e.attributes,s=[];function r(o,a){return t.getDependency("accessor",o).then(function(l){n.setAttribute(a,l)})}for(const o in i){const a=wc[o]||o.toLowerCase();a in n.attributes||s.push(r(i[o],a))}if(e.indices!==void 0&&!n.index){const o=t.getDependency("accessor",e.indices).then(function(a){n.setIndex(a)});s.push(o)}return Ts(n,e),cT(n,e,t),Promise.all(s).then(function(){return e.targets!==void 0?sT(n,e.targets,t):n})}const Zn=n=>(Qt("data-v-73097004"),n=n(),en(),n),dT={key:0,class:"loading"},hT={class:"loader-mark"},fT=Zn(()=>c("i",null,null,-1)),pT=Zn(()=>c("b",null,null,-1)),mT=Zn(()=>c("small",null,"\u6B63\u5728\u7EC4\u5408\u5730\u5F62\u3001\u6E29\u5BA4\u3001\u5EFA\u7B51\u4E0E\u519C\u4E1A\u8D44\u4EA7",-1)),gT={key:0,class:"tip"},_T=Zn(()=>c("span",null,"3D",-1)),vT=["onClick"],yT=Zn(()=>c("span",{class:"walk-icon","aria-hidden":"true"},[c("svg",{viewBox:"0 0 24 24"},[c("circle",{cx:"12",cy:"5",r:"2.4"}),c("path",{d:"M9.2 9.1 12 7.5l2.8 1.6 1.9 3.3M12 8v5.1m0 0-3.2 6.2m3.2-6.2 4.3 5.5M9.1 10.2l-2.8 3.2"})])],-1)),ET=Zn(()=>c("span",null,[c("b",null,"\u7B2C\u4E00\u4EBA\u79F0\u5DE1\u573A"),c("small",null,"\u6C89\u6D78\u5F0F\u7BA1\u7406\u519C\u573A")],-1)),xT=Zn(()=>c("kbd",null,"WASD",-1)),bT=[yT,ET,xT],MT={key:0,class:"walk-hud"},AT=Zn(()=>c("div",{class:"crosshair"},[c("i"),c("b")],-1)),ST=Zn(()=>c("b",null,"\u5DE1\u573A\u5DF2\u6682\u505C",-1)),wT=Zn(()=>c("span",null,"\u70B9\u51FB\u7EE7\u7EED \xB7 \u518D\u6309 Esc \u9000\u51FA",-1)),TT=[ST,wT],CT=Zn(()=>c("div",{class:"walk-guide"},[c("strong",null,"\u5DE1\u573A\u6A21\u5F0F"),c("span",null,[c("kbd",null,"WASD"),it(" \u79FB\u52A8")]),c("span",null,[c("kbd",null,"\u9F20\u6807"),it(" \u89C2\u5BDF")]),c("span",null,[c("kbd",null,"Shift"),it(" \u52A0\u901F")]),c("span",null,[c("kbd",null,"1\u20137"),it(" \u5207\u6362\u4E1A\u52A1")]),c("span",null,[c("kbd",null,"\u5DE6\u952E"),it(" \u9009\u62E9\u8BBE\u65BD")])],-1)),DT=Zn(()=>c("kbd",null,"Esc",-1)),RT={class:"world-time"},FT=Zn(()=>c("small",null,"\u771F\u5B9E\u65F6\u95F4\u540C\u6B65",-1)),PT=Zn(()=>c("div",{class:"quality"},[c("i"),it(" WEBGL \xB7 HIGH QUALITY")],-1)),LT=It({__name:"ThreeFarmScene",props:{activeModule:null,activeSubLayer:null,selectedId:null,drawerOpen:{type:Boolean},overlayOpen:{type:Boolean}},emits:["select","module","walk","enter-greenhouse"],setup(n,{expose:e,emit:t}){const i=n,s=Ce(),r=Ce(!0),o=Ce(0),a=Ce("\u6B63\u5728\u521D\u59CB\u5316\u6570\u5B57\u5B6A\u751F\u2026"),l=Ce(!1),u=Ce(!1),d=Ce("--:--:--"),h=Ce("\u540C\u6B65\u65F6\u95F4");let f,p,g,v,_,m=0,E=0,y=[];const x=[],M={},A=new Map;let F,I,b=null,w=!1,oe=0;const X=[];let z,T,G=42,re=!1;const ae=new _w;let C=0;const J=new Set,$=new L,ee=new L;let U,N,le,Y,ce,O,Fe,Oe=-1,Pe=-1,Ne=1;const P={"gh-01":"tomato","gh-02":"strawberry","gh-03":"cucumber","gh-04":"seedling","gh-05":"goldTomato","gh-06":"leafy"},k={Digit1:"overview",Digit2:"monitoring",Digit3:"environment",Digit4:"devices",Digit5:"irrigation",Digit6:"crops",Digit7:"alerts"},ue={stem:new Rt(.025,.035,.62,6),leaf:new ci(.13,7,5),fruit:new ci(.075,8,6),berry:new fa(.075,.12,8),cucumber:new Kl(.045,.2,4,7)},fe={stem:new lt({color:3764796,roughness:.9}),leaf:new lt({color:5613641,roughness:.88}),leafDark:new lt({color:3439933,roughness:.9}),tomato:new lt({color:14240309,roughness:.62}),goldTomato:new lt({color:15903028,roughness:.62}),strawberry:new lt({color:15288117,roughness:.72}),cucumber:new lt({color:5017916,roughness:.8}),seedling:new lt({color:7915608,roughness:.9})},be=[{url:"/platform/assets/models/small-farm.glb",position:[-26,0,-21],size:9,rotation:.08,id:"farm-house"},{url:"/platform/assets/models/big-barn.glb",position:[25,0,-20],size:9,rotation:-1.55,id:"warehouse-01"},{url:"/platform/assets/models/farm-building-a.glb",position:[26,0,-2],size:7,rotation:-1.55,id:"pump-room"},{url:"/platform/assets/models/farm-building-b.glb",position:[-26,0,-2],size:7,rotation:.05,id:"service-center"},{url:"/platform/assets/models/barn.glb",position:[23,0,20],size:7,rotation:Math.PI,id:"barn-01"},{url:"/platform/assets/models/silo.glb",position:[-25,0,22],size:5.5,rotation:0,id:"silo-01"},{url:"/platform/assets/models/round-rover.glb",position:[10,0,21],size:2.2,rotation:-Math.PI/2,id:"robot-01"}],De={"gh-01":[-12,0,6],"gh-02":[-8,0,0],"gh-03":[-4,0,-6],"gh-04":[0,0,-12],"gh-06":[4,0,-18],"gh-05":[8,0,6],"field-04":[-3,0,15],"field-05":[14,0,15],"weather-01":[-22,0,-11],"water-01":[-25,0,17],"fertilizer-01":[15,0,-8],"valve-02":[-10,0,23],"pump-02":[2,0,21],"camera-03":[17,0,21],"robot-01":[10,0,21]};function Ie(Z,V){var j;if(De[Z])return De[Z];const Q=(j=Xt.find(me=>me.id===Z))==null?void 0:j.position3D;return Q?[Q.x,Q.y,Q.z]:V}function Ae(Z,V,Q,j,me){const he=X.findIndex(Se=>Se.id===Z),_e={id:Z,minX:V,maxX:Q,minZ:j,maxZ:me};he>=0?X[he]=_e:X.push(_e)}function Re(Z,V,Q=.18){Ae(Z,V.min.x-Q,V.max.x+Q,V.min.z-Q,V.max.z+Q)}function Te(Z,V){return X.some(j=>Z+.38>j.minX&&Z-.38<j.maxX&&V+.38>j.minZ&&V-.38<j.maxZ)}function D(){if(T)return T;const Z=document.createElement("canvas");Z.width=Z.height=128;const V=Z.getContext("2d"),Q=V.createRadialGradient(64,52,6,64,58,58);return Q.addColorStop(0,"rgba(255,90,74,.72)"),Q.addColorStop(1,"rgba(255,45,35,0)"),V.fillStyle=Q,V.fillRect(0,0,128,128),V.fillStyle="#ff493d",V.strokeStyle="rgba(255,238,232,.95)",V.lineWidth=4,V.beginPath(),V.moveTo(64,104),V.lineTo(31,42),V.quadraticCurveTo(64,25,97,42),V.closePath(),V.fill(),V.stroke(),T=new el(Z),T.colorSpace=dt,T}function S(Z){const V=["gh-01","gh-02","gh-03","gh-04","gh-05","gh-06"],Q=["field-04","field-05"];return Z==="monitoring"?[...V,...Q,"camera-03"]:Z==="environment"?["weather-01",...Q]:Z==="devices"?["fertilizer-01","valve-02","pump-02","camera-03","robot-01"]:Z==="irrigation"?["water-01","valve-02","pump-02","fertilizer-01",...Q]:Z==="crops"?[...V,...Q]:Z==="alerts"?["field-04","gh-02","fertilizer-01"]:i.selectedId?[i.selectedId]:[]}function se(){!p||(z||(z=new vt,z.name="walk-selection-markers",p.add(z)),z.children.forEach(Z=>{var V;return(V=Z.material)==null?void 0:V.dispose()}),z.clear(),z.visible=l.value,l.value&&S(i.activeModule).forEach((Z,V)=>{const Q=A.get(Z);if(!Q)return;const j=new mn().setFromObject(Q);if(j.isEmpty())return;const me=new L0({map:D(),transparent:!0,depthTest:!1,depthWrite:!1,opacity:.92}),he=new LS(me),_e=Z===i.selectedId;he.scale.setScalar(.12),he.position.set((j.min.x+j.max.x)/2,j.max.y+(_e?.92:.68),(j.min.z+j.max.z)/2),he.userData.baseY=he.position.y,he.userData.seed=V*.7,he.userData.targetScale=_e?1.05:.78,he.renderOrder=20,z.add(he)}))}function ve(Z,V=1){const Q=document.createElement("canvas");Q.width=Q.height=512;const j=Q.getContext("2d");Z(j,512);const me=new el(Q);return me.wrapS=me.wrapT=ur,me.repeat.set(V,V),me.colorSpace=dt,me.anisotropy=(f==null?void 0:f.capabilities.getMaxAnisotropy())||1,me}function xe(Z,V=0){const Q=new vt,j=(he,_e,Se,Ve=1,Ye=fe.leaf)=>{const ke=new je(ue.leaf,Ye);ke.position.set(he,_e,Se),ke.scale.set(1.25*Ve,.42*Ve,.7*Ve),ke.rotation.y=Math.atan2(Se,he),ke.rotation.z=-.18+V%3*.1,Q.add(ke)};if(Z==="leafy"){for(let he=0;he<7;he++){const _e=he/7*Math.PI*2;j(Math.cos(_e)*.09,.13+he%2*.035,Math.sin(_e)*.09,.9,he%2?fe.leafDark:fe.leaf)}return Q.scale.setScalar(.92),Q}if(Z==="seedling"){const he=new je(ue.stem,fe.stem);return he.scale.set(.65,.34,.65),he.position.y=.11,Q.add(he),j(-.055,.22,0,.62,fe.seedling),j(.055,.22,0,.62,fe.seedling),Q.scale.setScalar(.72),Q}if(Z==="strawberry"){for(let _e=0;_e<5;_e++){const Se=_e/5*Math.PI*2;j(Math.cos(Se)*.06,.15,Math.sin(Se)*.06,.75,fe.leafDark)}const he=new je(ue.berry,fe.strawberry);return he.position.set((V%2?1:-1)*.08,.1,.08),he.rotation.z=Math.PI,Q.add(he),Q}const me=new je(ue.stem,fe.stem);if(me.position.y=.31,Q.add(me),j(-.1,.32,.02,.75),j(.1,.45,-.02,.8,fe.leafDark),Z==="cucumber"){const he=new je(ue.cucumber,fe.cucumber);he.position.set(V%2?-.09:.09,.28,.02),he.rotation.z=.18,Q.add(he)}else{const he=Z==="goldTomato"?fe.goldTomato:fe.tomato;for(let _e=0;_e<2;_e++){const Se=new je(ue.fruit,he);Se.position.set((_e?1:-1)*.075,.25+_e*.08,.04),Q.add(Se)}}return Q}function Le(Z,V,Q,j){const me=new Map;Q.forEach((he,_e)=>{const Se=xe(V,_e);Se.position.copy(he),Se.scale.multiplyScalar(j),Se.updateMatrixWorld(!0),Se.traverse(Ve=>{const Ye=Ve;if(!Ye.isMesh||Array.isArray(Ye.material))return;const ke=`${Ye.geometry.uuid}:${Ye.material.uuid}`,Je=me.get(ke)||{geometry:Ye.geometry,material:Ye.material,matrices:[]};Je.matrices.push(Ye.matrixWorld.clone()),me.set(ke,Je)})}),me.forEach(he=>{const _e=new fl(he.geometry,he.material,he.matrices.length);he.matrices.forEach((Se,Ve)=>_e.setMatrixAt(Ve,Se)),_e.instanceMatrix.setUsage(bl),_e.receiveShadow=!0,Z.add(_e)})}function W(Z){const V={tomato:"\u756A\u8304",strawberry:"\u8349\u8393",cucumber:"\u9EC4\u74DC",seedling:"\u80B2\u82D7",leafy:"\u53F6\u83DC",goldTomato:"\u751F\u6001\u756A\u8304"},Q=document.createElement("canvas");Q.width=Q.height=256;const j=Q.getContext("2d"),me=j.createRadialGradient(92,65,12,128,128,130);me.addColorStop(0,"#6ecb71"),me.addColorStop(1,"#194c32"),j.fillStyle=me,j.beginPath(),j.arc(128,128,124,0,Math.PI*2),j.fill(),j.save(),j.translate(128,104),j.lineCap="round",j.lineJoin="round";const he=(ke,Je,ot,Un)=>{j.save(),j.translate(ke,Je),j.rotate(Un),j.fillStyle="#78d66c",j.beginPath(),j.ellipse(0,0,ot,ot*.46,0,0,Math.PI*2),j.fill(),j.restore()};if(Z==="cucumber"){j.rotate(-.25),j.fillStyle="#75bc4e",j.beginPath(),j.roundRect(-25,-56,50,112,25),j.fill(),j.fillStyle="rgba(255,255,255,.25)";for(let ke=-34;ke<45;ke+=22)j.beginPath(),j.arc(-12,ke,3,0,Math.PI*2),j.fill()}else if(Z==="seedling")j.fillStyle="#b87346",j.beginPath(),j.moveTo(-34,24),j.lineTo(28,24),j.lineTo(20,66),j.lineTo(-25,66),j.closePath(),j.fill(),j.strokeStyle="#62bc58",j.lineWidth=8,j.beginPath(),j.moveTo(0,26),j.lineTo(0,-32),j.stroke(),he(-18,-24,24,-.4),he(18,-38,24,.35);else if(Z==="leafy"){for(let ke=0;ke<8;ke++){const Je=ke/8*Math.PI*2;he(Math.cos(Je)*19,Math.sin(Je)*19,34,Je)}j.fillStyle="#9ae27b",j.beginPath(),j.arc(0,0,23,0,Math.PI*2),j.fill()}else if(Z==="strawberry"){j.fillStyle="#ee5144",j.beginPath(),j.moveTo(-45,-30),j.bezierCurveTo(-47,20,-20,61,0,72),j.bezierCurveTo(25,52,48,15,44,-30),j.quadraticCurveTo(0,-54,-45,-30),j.fill();for(let ke=0;ke<10;ke++)j.fillStyle="#ffe27a",j.beginPath(),j.arc(-26+ke%4*17,-14+Math.floor(ke/4)*23,2.5,0,Math.PI*2),j.fill();he(-17,-39,24,-.45),he(17,-39,24,.45)}else{j.fillStyle=Z==="goldTomato"?"#f2a735":"#e84e3d",j.beginPath(),j.arc(0,4,58,0,Math.PI*2),j.fill();for(let ke=0;ke<5;ke++){const Je=ke/5*Math.PI*2;he(Math.cos(Je)*18,-48+Math.sin(Je)*10,21,Je)}}j.fillStyle="#173d2a",j.beginPath(),j.arc(-16,0,5,0,Math.PI*2),j.arc(16,0,5,0,Math.PI*2),j.fill(),j.strokeStyle="#173d2a",j.lineWidth=4,j.beginPath(),j.arc(0,10,20,.2,Math.PI-.2),j.stroke(),j.restore(),j.fillStyle="rgba(245,255,241,.94)",j.font="700 25px sans-serif",j.textAlign="center",j.fillText(V[Z],128,226);const _e=new el(Q);_e.colorSpace=dt;const Se=new vt;Se.position.set(4.12,1.48,0),Se.rotation.y=Math.PI/2;const Ve=new je(new Al(.47,36),new lt({map:_e,roughness:.55,metalness:.02,emissive:1456932,emissiveIntensity:.12})),Ye=new je(new Cs(.5,.045,8,32),new lt({color:14280144,metalness:.65,roughness:.25}));return Se.add(Ve,Ye),Se}function ye(){if(U)return;const Z=ve((V,Q)=>{V.fillStyle="#58605d",V.fillRect(0,0,Q,Q);let j=48271;for(let me=0;me<3600;me++){j=j*16807%2147483647;const he=j%Q;j=j*16807%2147483647;const _e=j%Q,Se=70+j%55;V.fillStyle=`rgba(${Se},${Se+2},${Se},${.08+j%12/100})`,V.fillRect(he,_e,1+j%3,1+j%2)}V.strokeStyle="rgba(38,43,41,.25)",V.lineWidth=1.2;for(let me=0;me<8;me++){const he=(me*71+43)%Q,_e=(me*117+29)%Q;V.beginPath(),V.moveTo(he,_e),V.lineTo(he+24,_e+8),V.lineTo(he+36,_e-6),V.stroke()}V.fillStyle="rgba(30,34,33,.09)",V.fillRect(Q*.22,0,7,Q),V.fillRect(Q*.72,0,6,Q)},4);U=new lt({map:Z,color:11449777,roughness:.92,metalness:.02}),N=new lt({color:12962493,roughness:.75}),le=new lt({color:15197123,roughness:.72,emissive:3881258,emissiveIntensity:.05})}function pe(){if(!p)return;const Z=ve((he,_e)=>{he.fillStyle="#5f843f",he.fillRect(0,0,_e,_e);let Se=7123;for(let Ve=0;Ve<9e3;Ve++){Se=Se*16807%2147483647;const Ye=Se%_e;Se=Se*16807%2147483647;const ke=Se%_e,Je=26+Se%18;he.fillStyle=`hsla(${88+Se%20},${30+Se%25}%,${Je}%,.22)`,he.fillRect(Ye,ke,1+Se%2,2+Se%3)}},7),V=new go(82,62,32,24),Q=V.attributes.position;for(let he=0;he<Q.count;he++){const _e=Q.getX(he),Se=Q.getY(he),Ve=Math.max(Math.abs(_e)/41,Math.abs(Se)/31),Ye=Math.max(0,Ve-.72)*8+Math.sin(_e*.18)*Math.cos(Se*.16)*.18;Q.setZ(he,Ye)}V.computeVertexNormals();const j=new je(V,new lt({map:Z,roughness:.98,color:11913110}));j.rotation.x=-Math.PI/2,j.receiveShadow=!0,j.name="terrain",p.add(j);const me=new je(new Rt(47,48,2.2,64),new lt({color:3362607,roughness:1}));me.position.y=-1.35,p.add(me)}function ze(){if(!p)return;const Z=document.createElement("canvas");Z.width=Z.height=128;const V=Z.getContext("2d"),Q=V.createRadialGradient(64,64,8,64,64,60);Q.addColorStop(0,"rgba(255,255,255,.95)"),Q.addColorStop(.55,"rgba(245,252,249,.72)"),Q.addColorStop(1,"rgba(255,255,255,0)"),V.fillStyle=Q,V.fillRect(0,0,128,128);const j=new el(Z),me=new Zt,he=[];for(let Ye=0;Ye<8;Ye++){const ke=-48+Ye*19%96,Je=17+Ye%4*2.4,ot=-42+Ye*29%78;he.push(ke,Je,ot,ke+3.8,Je+.45,ot+.2,ke-3.5,Je-.25,ot-.1)}me.setAttribute("position",new bt(he,3)),O=new bc(me,new Ml({map:j,size:9.5,transparent:!0,opacity:.64,depthWrite:!1,color:15858421,sizeAttenuation:!0})),p.add(O);const _e=[];let Se=31991;for(let Ye=0;Ye<280;Ye++){Se=Se*16807%2147483647;const ke=Se/2147483647*Math.PI*2;Se=Se*16807%2147483647;const Je=65+Se%1800/100;Se=Se*16807%2147483647;const ot=14+Se%3800/100;_e.push(Math.cos(ke)*Je,ot,Math.sin(ke)*Je)}const Ve=new Zt;Ve.setAttribute("position",new bt(_e,3)),Fe=new bc(Ve,new Ml({color:15267071,size:.22,transparent:!0,opacity:0,depthWrite:!1})),p.add(Fe)}function Ke(Z=!1){var ke;if(!p||!f||!ce||!Y)return;const V=new Date;if(!Z&&V.getSeconds()===Oe)return;Oe=V.getSeconds(),d.value=V.toLocaleTimeString("zh-CN",{hour12:!1,hour:"2-digit",minute:"2-digit",second:"2-digit"});const Q=V.getHours()+V.getMinutes()/60+V.getSeconds()/3600,j=Math.sin((Q-6)/12*Math.PI),me=Ho.smoothstep(Math.max(0,j),0,.78);h.value=Q<5?"\u6DF1\u591C":Q<7?"\u6668\u66E6":Q<17.5?"\u65E5\u95F4":Q<19.5?"\u9EC4\u660F":"\u591C\u95F4";const he=(Q-6)/12*Math.PI;ce.position.set(Math.cos(he)*42,Math.max(3,Math.sin(he)*43),Math.sin(he)*18),ce.intensity=.08+me*3.12,ce.color.set(Q>17&&Q<20?16757102:Q>5&&Q<8?16763014:16773845),Y.intensity=.3+me*1.95;const _e=new ut(464161),Se=new ut(10930639),Ve=new ut(9139822),Ye=_e.clone().lerp(Se,me);if((Q>5&&Q<7.3||Q>17.3&&Q<20)&&Ye.lerp(Ve,.28),p.background=Ye,(ke=p.fog)==null||ke.color.copy(Ye),f.toneMappingExposure=.62+me*.46,O){const Je=O.material;Je.opacity=.16+me*.52,Je.color.set(me>.15?15923957:5400181)}if(Fe){const Je=Fe.material;Je.opacity=Math.max(0,.9-me*1.6),Fe.visible=Je.opacity>.02}V.getMinutes()!==Pe&&(Pe=V.getMinutes(),f.shadowMap.needsUpdate=!0)}function et(Z,V,Q,j){if(!p)return;ye();const me=new je(new mt(Q,.09,j),U);if(me.position.set(Z,.05,V),me.receiveShadow=!0,p.add(me),Q>j){for(const he of[-1,1]){const _e=new je(new mt(Q,.18,.16),N);_e.position.set(Z,.09,V+he*j/2),p.add(_e)}for(let he=-Q/2+1;he<Q/2-.5;he+=2.4){const _e=new je(new mt(1.1,.025,.055),le);_e.position.set(Z+he,.112,V),p.add(_e)}}else{for(const he of[-1,1]){const _e=new je(new mt(.16,.18,j),N);_e.position.set(Z+he*Q/2,.09,V),p.add(_e)}for(let he=-j/2+1;he<j/2-.5;he+=2.4){const _e=new je(new mt(.055,.025,1.1),le);_e.position.set(Z,.112,V+he),p.add(_e)}}}function qe(Z,V,Q,j=0){if(!p)return;const me=new vt;me.position.set(Z,0,V),me.rotation.y=j,me.userData.id=Q;const he=new Kn({color:13168352,metalness:0,roughness:.08,transmission:.5,transparent:!0,opacity:.52,thickness:.08,side:Sn,depthWrite:!1}),_e=new lt({color:14542047,metalness:.75,roughness:.28}),Se=new je(new mt(8,1.8,3.6),he);Se.position.y=.95,Se.castShadow=!0,me.add(Se);const Ve=new je(new Rt(1.8,1.8,8,32,1,!1,0,Math.PI),he);Ve.rotation.z=Math.PI/2,Ve.position.y=1.82,Ve.castShadow=!0,me.add(Ve);for(let $t=-4;$t<=4;$t++){const Bt=new je(new Cs(1.81,.035,5,18,Math.PI),_e);Bt.rotation.y=Math.PI/2,Bt.position.set($t,1.82,0),me.add(Bt)}for(const $t of[-1,1]){const Bt=new je(new mt(8,.06,.06),_e);Bt.position.set(0,1.05,$t*1.82),me.add(Bt);for(let Cn=-4;Cn<=4;Cn++){const bn=new je(new mt(.045,1.8,.045),_e);bn.position.set(Cn,.92,$t*1.81),me.add(bn)}}for(const $t of[-1,1]){const Bt=new je(new mt(.06,1.8,3.62),_e);Bt.position.set($t*3.98,.92,0),me.add(Bt)}const Ye=new je(new mt(.08,1.45,1.05),_e);Ye.position.set(4.05,.75,0),me.add(Ye);const ke=new lt({color:5914407,roughness:1}),Je=P[Q]||"leafy",ot=[];for(const $t of[-.9,.9]){const Bt=new je(new mt(7.5,.15,.75),ke);Bt.position.set(0,.13,$t),me.add(Bt);for(let Cn=-7;Cn<=7;Cn++)ot.push(new L(Cn*.48,.2,$t))}Le(me,Je,ot,Je==="seedling"?.82:Je==="strawberry"?.9:.78);const Ut=new lt({color:2858418,metalness:.5,roughness:.25});for(const $t of[-1.35,1.35]){const Bt=new je(new Rt(.035,.035,7.5,8),Ut);Bt.rotation.z=Math.PI/2,Bt.position.set(0,.42,$t),me.add(Bt)}const Tn=new vt;Tn.position.set(-4.08,1.28,0),Tn.rotation.z=Math.PI/2;const Di=new vt,gi=new lt({color:3228994,metalness:.72,roughness:.26}),ds=new je(new Rt(.12,.12,.16,16),gi);Di.add(ds);for(let $t=0;$t<6;$t++){const Bt=$t*Math.PI/3,Cn=new je(new mt(.12,.06,.46),gi);Cn.position.set(Math.sin(Bt)*.23,0,Math.cos(Bt)*.23),Cn.rotation.y=Bt,Cn.rotation.z=.2,Di.add(Cn)}const Yt=new je(new Cs(.52,.025,7,28),_e);Yt.rotation.x=Math.PI/2,Tn.add(Di,Yt),me.add(Tn),x.push({object:Di,kind:"fan",seed:Object.keys(P).indexOf(Q)});const Nn=new vt;Nn.position.set(-4.1,.75,1.15);const hs=new je(new mt(.16,.52,.62),new lt({color:5464927,metalness:.38,roughness:.32})),Jt=new je(new mt(.175,.22,.34),new lt({color:1587508,emissive:2607225,emissiveIntensity:.38,roughness:.25}));Jt.position.y=.08;const Wn=new je(new ci(.035,8,6),new Vn({color:6616218}));Wn.position.set(-.1,-.15,.18);const fs=new je(new Rt(.025,.025,.72,7),new lt({color:3820103,metalness:.55,roughness:.35}));fs.position.set(0,-.58,0),Nn.add(hs,Jt,Wn,fs),me.add(Nn),x.push({object:Wn,kind:"signal",seed:Q.charCodeAt(Q.length-1)}),me.add(W(Je));const Wi=new lt({color:12110276,metalness:.7,roughness:.3});for(const $t of[-1,1]){const Bt=new je(new Rt(.045,.045,8.05,8),Wi);Bt.rotation.z=Math.PI/2,Bt.position.set(0,1.82,$t*1.8),me.add(Bt)}const _r=new je(new ci(.1,10,7),new lt({color:15269872,emissive:8126367,emissiveIntensity:.65}));return _r.position.set(4.16,2.12,.72),me.add(_r),me.traverse($t=>{$t.isMesh&&($t.userData.id=Q)}),y.push(Se,Ve),p.add(me),A.set(Q,me),Ae(Q,Z-4.28,Z+4.28,V-2.08,V+2.08),me}function We(Z,V,Q,j,me,he){if(!p)return;const _e=new vt;_e.position.set(Z,.08,V),_e.userData.id=me;const Se=new je(new mt(Q,.14,j),new lt({color:6309679,roughness:1}));Se.userData.id=me,_e.add(Se),y.push(Se);const Ve=[];for(let Ye=0;Ye<8;Ye++)for(let ke=0;ke<13;ke++)Ve.push(new L(-Q/2+.45+ke*(Q-.9)/12,.2,-j/2+.38+Ye*(j-.76)/7));Le(_e,he,Ve,.8),p.add(_e),A.set(me,_e),Ae(me,Z-Q/2-.15,Z+Q/2+.15,V-j/2-.15,V+j/2+.15)}function rt(){if(!p)return;const Z=150,V=new fl(new Rt(.08,.11,.65,6),new lt({color:6047535}),Z),Q=new fl(new bd(.42,1),new lt({color:3631926,roughness:.9}),Z),j=new Vt;let me=0;for(let he=0;he<Z;he++){const _e=he<80,Se=he%4;let Ve,Ye;if(_e?(Ve=(he%2?1:-1)*(31+he%7*.45),Ye=-25+he%40*1.25):(Ve=-27+he%35*1.6,Ye=[-18,-4,10,23][Se]+he%3*.25),Math.abs(Ve)<19&&Ye>-23&&Ye<22)continue;const ke=.75+he%5*.08;j.position.set(Ve,.35*ke,Ye),j.scale.set(ke,ke,ke),j.updateMatrix(),V.setMatrixAt(me,j.matrix),j.position.y=.95*ke,j.scale.set(ke,1.15*ke,ke),j.updateMatrix(),Q.setMatrixAt(me,j.matrix),me++}V.count=Q.count=me,V.castShadow=Q.castShadow=!0,p.add(V,Q)}function ft(){if(!p)return;const Z=new Kn({color:2071473,roughness:.1,metalness:.05,transmission:.08,transparent:!0,opacity:.92}),V=Ie("water-01",[-26,0,14]),Q=new je(new mt(10,.35,7),Z);Q.position.set(V[0],.02,V[2]),Q.userData.id="water-01",y.push(Q),p.add(Q),A.set("water-01",Q),Ae("water-01",V[0]-5.25,V[0]+5.25,V[2]-3.75,V[2]+3.75);const j=new lt({color:13027770,roughness:.75});for(const[bn,un,On,Zl]of[[-25,13.5,10.5,.3],[-25,20.5,10.5,.3],[-30,17,.3,7.3],[-20,17,.3,7.3]]){const vr=new je(new mt(On,.45,Zl),j);vr.position.set(bn,.12,un),p.add(vr)}const me=new vt,he=new lt({color:9544867,metalness:.75,roughness:.3}),_e=new je(new Rt(1.25,1.25,3,20),he);_e.position.y=5,me.add(_e);for(const[bn,un]of[[-.8,-.8],[.8,-.8],[-.8,.8],[.8,.8]]){const On=new je(new Rt(.08,.12,4,6),he);On.position.set(bn,2,un),me.add(On)}me.position.set(26,0,7),p.add(me);const Se=M.irrigation=new vt,Ve=new lt({color:3903393,metalness:.15,roughness:.62}),Ye=[[-22,17,6,.12],[-19,13.5,.12,7],[0,10,38,.12],[-12,8,.12,4],[-8,5,.12,10],[-4,2,.12,16],[0,-1,.12,22],[4,-4,.12,28],[8,8,.12,4]];for(const[bn,un,On,Zl]of Ye){const vr=new je(new mt(On,.11,Zl),Ve);vr.position.set(bn,.25,un),vr.userData.category="network",Se.add(vr)}for(const[bn,un]of[[-19,14],[0,10],[4,-8]]){const On=new je(new ci(.19,12,8),new Vn({color:12188671}));On.position.set(bn,.37,un),On.userData.category="flow",Se.add(On),x.push({object:On,kind:"flow",seed:bn})}for(const[bn,un]of[[-12,8],[-4,2],[8,8]]){const On=new je(new Rt(.26,.31,.25,16),new lt({color:16238427,emissive:7161872,emissiveIntensity:.4}));On.position.set(bn,.35,un),On.userData.category="plans",Se.add(On)}p.add(Se),Se.visible=!1,x.push({object:Q,kind:"water"});const ke=new lt({color:8230549,metalness:.72,roughness:.28}),Je=new lt({color:2654106,metalness:.36,roughness:.35}),ot=new lt({color:2505531,metalness:.55,roughness:.3}),Un=Ie("valve-02",[-10,0,23]),Ut=new vt;Ut.position.set(...Un),Ut.userData.id="valve-02";const Tn=new je(new mt(2.5,.22,1.35),new lt({color:11188402,roughness:.72}));Tn.position.y=.12;const Di=new je(new mt(1.55,.1,1.38),Z);Di.position.y=.25;const gi=new je(new mt(1.7,1.15,.12),ke);gi.position.set(0,.82,0);const ds=new je(new Rt(.045,.045,1.2,10),ke);ds.position.y=1.72;const Yt=new je(new Cs(.36,.055,8,24),new lt({color:15115066,metalness:.45,roughness:.32}));Yt.rotation.x=Math.PI/2,Yt.position.y=2.25;const Nn=new je(new mt(.48,.64,.28),ot);Nn.position.set(.86,1.42,.3);const hs=new je(new mt(.32,.2,.03),new lt({color:1326395,emissive:4318107,emissiveIntensity:.55}));hs.position.set(.86,1.52,.455),Ut.add(Tn,Di,gi,ds,Yt,Nn,hs),Ut.traverse(bn=>{const un=bn;un.isMesh&&(un.castShadow=!0,un.receiveShadow=!0,un.userData.id="valve-02")}),y.push(Tn,Nn),p.add(Ut),A.set("valve-02",Ut),Ae("valve-02",Un[0]-1.45,Un[0]+1.45,Un[2]-.9,Un[2]+.9);const Jt=Ie("pump-02",[2,0,21]),Wn=new vt;Wn.position.set(...Jt),Wn.userData.id="pump-02";const fs=new je(new mt(2.6,.18,1.7),new lt({color:10398373,roughness:.75}));fs.position.y=.09;const Wi=new je(new Rt(.48,.48,1.25,20),Je);Wi.rotation.z=Math.PI/2,Wi.position.set(-.35,.65,0);const _r=new je(new Rt(.32,.4,.3,18),ot);_r.rotation.z=Math.PI/2,_r.position.set(.43,.65,0);const $t=new je(new Cs(.43,.12,10,22,Math.PI*1.5),ke);$t.rotation.y=Math.PI/2,$t.position.set(.72,.75,.38);const Bt=new je(new mt(.6,1,.4),ot);Bt.position.set(-.9,.7,.55);const Cn=new je(new ci(.055,9,7),new Vn({color:6225806}));Cn.position.set(-.9,.87,.765),Wn.add(fs,Wi,_r,$t,Bt,Cn),Wn.traverse(bn=>{const un=bn;un.isMesh&&(un.castShadow=!0,un.receiveShadow=!0,un.userData.id="pump-02")}),y.push(fs,Wi,Bt),x.push({object:Cn,kind:"signal",seed:4}),p.add(Wn),A.set("pump-02",Wn),Ae("pump-02",Jt[0]-1.5,Jt[0]+1.5,Jt[2]-1.05,Jt[2]+1.05)}function Gt(){if(!p)return;const Z=M.environment=new vt,V=new Al(6,48),Q=[16740418,16045640,5102729];[[-2,-3],[10,10],[-12,9]].forEach(([_e,Se],Ve)=>{const Ye=new je(V,new Vn({color:Q[Ve],transparent:!0,opacity:.18,depthWrite:!1,blending:hc}));Ye.rotation.x=-Math.PI/2,Ye.position.set(_e,.32,Se),Z.add(Ye)}),Z.visible=!1,p.add(Z);const j=M.alerts=new vt,me=new je(new Md(.55,.75,32),new Vn({color:16749103,transparent:!0,opacity:.9,side:Sn}));me.rotation.x=-Math.PI/2;const he=Ie("field-04",[4,0,12]);me.position.set(he[0],.45,he[2]),j.add(me),j.visible=!1,p.add(j),x.push({object:me,kind:"pulse"})}function ie(){if(!p)return;const Z=M.monitoring=new vt,V=M.devices=new vt,Q=M.crops=new vt,j=new lt({color:13556181,metalness:.7,roughness:.3}),me=new lt({color:2570810,metalness:.35,roughness:.18});[Ie("camera-03",[15,0,18]),[-3,0,-1],[12,0,-7]].forEach((_e,Se)=>{const Ve=Se===0?"camera-03":`camera-0${Se+4}`,Ye=new vt,ke=new je(new Rt(.06,.08,2.4,8),j);ke.position.y=1.2;const Je=new je(new mt(.55,.3,.3),me);Je.position.set(.18,2.35,0),Je.rotation.y=-.5;const ot=new je(new fa(3.4,7,32,1,!0),new Vn({color:5629600,transparent:!0,opacity:.1,side:Sn,depthWrite:!1}));ot.rotation.z=-Math.PI/2,ot.position.set(3.5,1.6,0),Ye.add(ke,Je,ot),Ye.position.set(..._e),Ye.userData.category=Se===0?"ai-events":"coverage",Ye.userData.id=Ve;for(const Un of[ke,Je])Un.userData.id=Ve,y.push(Un);Z.add(Ye),Se===0&&A.set(Ve,Ye)}),Z.visible=!1,p.add(Z),Xt.filter(_e=>["device","station","robot"].includes(_e.type)&&_e.position3D&&!["robot-01","valve-02","pump-02"].includes(_e.id)).forEach((_e,Se)=>{const Ve=new vt,Ye=new je(new Rt(.3,.36,.18,16),new lt({color:_e.status==="offline"?12080974:4957802,emissive:_e.status==="offline"?6230284:1195552,emissiveIntensity:.45,metalness:.35,roughness:.32})),ke=new je(new Rt(.08,.1,.9,8),j);ke.position.y=.52;const Je=new je(new ci(.13,12,8),new Vn({color:_e.status==="offline"?16737874:7795866}));Je.position.y=1,Ve.add(Ye,ke,Je),Ve.position.set(_e.position3D.x,.12,_e.position3D.z),Ve.userData.category=Se%2?"actuators":"sensors",Ve.userData.offline=_e.status==="offline",Ve.userData.id=_e.id;for(const ot of[Ye,ke,Je])ot.userData.id=_e.id,y.push(ot);V.add(Ve),A.has(_e.id)||A.set(_e.id,Ve),x.push({object:Je,kind:"signal",seed:Se})}),V.visible=!1,p.add(V);for(const _e of["field-04","field-05"]){const Se=Ie(_e,[0,0,0]);for(const[Ve,Ye,ke]of[["health",_e==="field-04"?15774268:6676354,1],["stage",5618152,.94],["maturity",15254613,.88],["risk",16739144,.8]]){if(Ve==="risk"&&_e!=="field-04")continue;const Je=new je(new mt((_e==="field-04"?11:9)*ke,.07,(_e==="field-04"?8:6)*ke),new Vn({color:Ye,transparent:!0,opacity:Ve==="risk"?.34:.2}));Je.position.set(Se[0],.31+(1-ke)*.1,Se[2]),Je.userData.category=Ve,Q.add(Je)}}Q.visible=!1,p.add(Q)}async function Ee(Z){if(!p)return;const j=(await new K0().loadAsync(Z.url)).scene;j.updateMatrixWorld(!0);const me=new mn().setFromObject(j),he=me.getSize(new L),_e=me.getCenter(new L),Se=Z.size/Math.max(he.x,he.z,.001);j.scale.setScalar(Se),j.position.set(-_e.x*Se,-me.min.y*Se,-_e.z*Se);const Ve=new vt;Ve.position.set(Z.position[0],Z.position[1],Z.position[2]),Ve.rotation.y=Z.rotation,Ve.userData.id=Z.id,Ve.add(j),j.traverse(Ye=>{const ke=Ye;ke.isMesh&&(ke.castShadow=!0,ke.receiveShadow=!0,ke.userData.id=Z.id,y.push(ke),Array.isArray(ke.material)&&ke.material.forEach(Je=>Je.side=Oi))}),p.add(Ve),A.set(Z.id,Ve),Ve.updateMatrixWorld(!0),Re(Z.id,new mn().setFromObject(Ve),Z.id==="robot-01"?.12:.22)}async function Be(){let Z=0;await Promise.allSettled(be.map(async V=>{await Ee(V),Z++,o.value=Math.round(Z/be.length*100),a.value=`\u6B63\u5728\u52A0\u8F7D\u519C\u573A\u516C\u6A21 ${Z}/${be.length}`})),f&&(f.shadowMap.autoUpdate=!1,f.shadowMap.needsUpdate=!0),se(),r.value=!1}function Ze(){if(!s.value)return;p=new F0,p.background=new ut(10930639),p.fog=new jl(11127240,38,88),g=new Fn(42,s.value.clientWidth/s.value.clientHeight,.1,180),g.position.set(31,31,39),f=new fd({antialias:!0,alpha:!1,powerPreference:"high-performance"}),Ne=Math.min(devicePixelRatio,1.45),f.setPixelRatio(Ne),f.setSize(s.value.clientWidth,s.value.clientHeight),f.shadowMap.enabled=!0,f.shadowMap.type=od,f.outputColorSpace=dt,f.toneMapping=ad,f.toneMappingExposure=1.08,s.value.appendChild(f.domElement),v=new q0(g,f.domElement),v.enableDamping=!0,v.dampingFactor=.065,v.target.set(0,0,1),v.maxPolarAngle=Math.PI/2.18,v.minPolarAngle=.28,v.minDistance=17,v.maxDistance=72,v.enablePan=!0,_=new Rw(g,f.domElement),_.pointerSpeed=.72,_.addEventListener("lock",Ft),_.addEventListener("unlock",R),Y=new X0(15399679,4347962,2.25),p.add(Y),ce=new Sd(16773845,3.2),ce.position.set(-24,42,18),ce.castShadow=!0,ce.shadow.mapSize.set(1024,1024),ce.shadow.camera.left=-38,ce.shadow.camera.right=38,ce.shadow.camera.top=32,ce.shadow.camera.bottom=-32,ce.shadow.bias=-25e-5,p.add(ce),ze(),pe(),[-22,-15,-9,-3,3,10,24].forEach(Q=>et(0,Q,38,1.45)),[-19,19].forEach(Q=>et(Q,2,1.6,48)),rt(),ft(),Gt(),ie(),["gh-01","gh-02","gh-03","gh-04","gh-06","gh-05"].forEach((Q,j)=>{const me=Ie(Q,[j*8-16,0,0]);qe(me[0],me[2],Q)});const Z=Ie("field-04",[-3,0,15]),V=Ie("field-05",[14,0,15]);We(Z[0],Z[2],11,8,"field-04","leafy"),We(V[0],V[2],9,7,"field-05","leafy"),f.domElement.addEventListener("click",tn),f.domElement.addEventListener("dblclick",Qn),f.domElement.addEventListener("pointermove",xn),f.domElement.addEventListener("pointerleave",hn),window.addEventListener("resize",wt),window.addEventListener("keydown",de),window.addEventListener("keyup",te),Ke(!0),Be(),nt(),Me(),we(i.selectedId)}function nt(){m=requestAnimationFrame(nt);const Z=Math.min(ae.getDelta(),.05);if(C+=Z,l.value&&(_==null?void 0:_.isLocked)&&g){let V=(J.has("KeyW")?1:0)-(J.has("KeyS")?1:0),Q=(J.has("KeyD")?1:0)-(J.has("KeyA")?1:0);const j=Math.hypot(V,Q)||1;V/=j,Q/=j;const me=J.has("ShiftLeft")||J.has("ShiftRight")?9.5:5.2,he=g.position.clone();_.moveForward(V*me*Z),_.moveRight(Q*me*Z);const _e=g.position.clone();g.position.copy(he);const Se=Ho.clamp(_e.x,-34,34);Te(Se,he.z)||(g.position.x=Se);const Ve=Ho.clamp(_e.z,-27,27);Te(g.position.x,Ve)||(g.position.z=Ve),g.position.y=1.7}else v==null||v.update();Ke(),O&&(O.rotation.y+=Z*.0025);for(const V of x)if(V.kind==="pulse"){const Q=1+(Math.sin(C*3)+1)*.35;V.object.scale.setScalar(Q);const j=V.object.material;j&&!Array.isArray(j)&&(j.opacity=.72-(Q-1)*.55)}else if(V.kind==="water")V.object.position.y=.04+Math.sin(C*1.5)*.015;else if(V.kind==="signal"){const Q=.82+(Math.sin(C*3+(V.seed||0))+1)*.18;V.object.scale.setScalar(Q)}else V.kind==="flow"?V.object.position.y=.37+(Math.sin(C*2.5+(V.seed||0))+.8)*.09:V.kind==="fan"&&(V.object.rotation.y-=Z*(5.5+(V.seed||0)*.22));z!=null&&z.visible&&z.children.forEach(V=>{const Q=V.userData.targetScale||.78,j=1+Math.sin(C*3.2+(V.userData.seed||0))*.07;V.scale.setScalar(Ho.lerp(V.scale.x,Q*j,.12)),V.position.y=V.userData.baseY+Math.sin(C*2.4+(V.userData.seed||0))*.1}),p&&g&&(f==null||f.render(p,g))}function wt(){!s.value||!g||!f||(g.aspect=s.value.clientWidth/s.value.clientHeight,g.updateProjectionMatrix(),f.setSize(s.value.clientWidth,s.value.clientHeight))}function Ct(Z){if(!g)return;const V=new j0;return V.far=l.value?14:180,V.setFromCamera(Z,g),V.intersectObjects(y,!1)[0]}function tn(Z){var me;if(!f||!g)return;if(l.value&&!(_!=null&&_.isLocked)){_==null||_.lock();return}const V=f.domElement.getBoundingClientRect(),Q=l.value?new Ue(0,0):new Ue((Z.clientX-V.left)/V.width*2-1,-((Z.clientY-V.top)/V.height)*2+1),j=((me=Ct(Q))==null?void 0:me.object.userData.id)||null;if(l.value){t("select",j);return}window.clearTimeout(E),E=window.setTimeout(()=>t("select",j),220)}function Qn(Z){var me;if(!f||!g||l.value)return;window.clearTimeout(E);const V=f.domElement.getBoundingClientRect(),Q=new Ue((Z.clientX-V.left)/V.width*2-1,-((Z.clientY-V.top)/V.height)*2+1),j=(me=Ct(Q))==null?void 0:me.object.userData.id;j&&Xt.some(he=>he.id===j&&he.type==="greenhouse")&&t("enter-greenhouse",j)}function Ht(Z){var j;if(!f||!g)return null;const V=f.domElement.getBoundingClientRect(),Q=l.value?new Ue(0,0):new Ue((Z.clientX-V.left)/V.width*2-1,-((Z.clientY-V.top)/V.height)*2+1);return(j=Ct(Q))==null?void 0:j.object.userData.id}function xn(Z){const V=performance.now();if(w||l.value&&V-oe<90)return;l.value&&(oe=V),w=!0;const Q=Z.clientX,j=Z.clientY;requestAnimationFrame(()=>{if(w=!1,!f)return;const he=Ht({clientX:Q,clientY:j})||null;f.domElement.style.cursor=l.value?"crosshair":he?"pointer":"grab",Ci(he)})}function hn(){Ci(null)}function Ci(Z){if(b===Z)return;b=Z,F&&(p==null||p.remove(F),F.dispose(),F=void 0);const V=Z?A.get(Z):void 0;V&&p&&(F=new Sc(new mn().setFromObject(V),new ut(8257434)),p.add(F))}function we(Z){I&&(p==null||p.remove(I),I.dispose(),I=void 0);const V=Z?A.get(Z):void 0;V&&p&&(I=new Sc(new mn().setFromObject(V),new ut(12713930)),p.add(I))}function ge(){!g||!v||!_||($.copy(g.position),ee.copy(v.target),G=g.fov,re=!1,l.value=!0,v.enabled=!1,hn(),f==null||f.setPixelRatio(Math.min(devicePixelRatio,1.12)),g.fov=58,g.updateProjectionMatrix(),wt(),g.position.set(-18,1.7,13),g.lookAt(-11,1.15,6),_.pointerSpeed=.88,se(),t("walk",!0),_.lock())}function Ge(Z=!0){!l.value||(l.value=!1,u.value=!1,re=!1,J.clear(),hn(),se(),t("walk",!1),Z&&(_==null?void 0:_.isLocked)&&_.unlock(),f==null||f.setPixelRatio(Ne),g&&(g.fov=G),wt(),g&&v&&(g.position.copy($),v.target.copy(ee),v.enabled=!0,v.update()))}function Ft(){u.value=!0}function R(){if(u.value=!1,!!l.value){if(re||i.overlayOpen){re=!1,J.clear();return}Ge(!1)}}function de(Z){if(!l.value)return;const V=k[Z.code];if(V){Z.preventDefault(),t("module",V);return}["KeyW","KeyA","KeyS","KeyD","ShiftLeft","ShiftRight"].includes(Z.code)&&(Z.preventDefault(),J.add(Z.code))}function te(Z){J.delete(Z.code)}function ne(){l.value&&!(_!=null&&_.isLocked)&&(re=!1,_==null||_.lock())}e({resumeAfterOverlay:ne});function Me(){Object.entries(M).forEach(([Z,V])=>{!V||(V.visible=Z===i.activeModule&&Z!=="environment",V.visible&&(["devices","monitoring"].includes(Z)&&V.children.forEach(Q=>Q.visible=!0),Z==="crops"&&V.children.forEach(Q=>Q.visible=Q.userData.category==="health"),Z==="irrigation"&&V.children.forEach(Q=>Q.visible=!0)))}),i.activeModule==="overview"&&Object.values(M).forEach(Z=>Z&&(Z.visible=!1)),se()}return _n(()=>[i.activeModule,i.activeSubLayer],Me),_n(()=>i.selectedId,Z=>{we(Z),se()},{immediate:!0}),_n(()=>i.overlayOpen,Z=>{if(!(!l.value||!_)){if(Z&&_.isLocked){re=!0,J.clear(),_.unlock();return}!Z&&!_.isLocked&&requestAnimationFrame(()=>{l.value&&!i.overlayOpen&&!(_!=null&&_.isLocked)&&(_==null||_.lock())})}}),ks(Ze),$i(()=>{cancelAnimationFrame(m),l.value&&t("walk",!1),window.removeEventListener("resize",wt),window.removeEventListener("keydown",de),window.removeEventListener("keyup",te),window.clearTimeout(E),f==null||f.domElement.removeEventListener("click",tn),f==null||f.domElement.removeEventListener("dblclick",Qn),f==null||f.domElement.removeEventListener("pointermove",xn),f==null||f.domElement.removeEventListener("pointerleave",hn),_!=null&&_.isLocked&&_.unlock(),_==null||_.removeEventListener("lock",Ft),_==null||_.removeEventListener("unlock",R),_==null||_.dispose(),v==null||v.dispose(),p==null||p.traverse(Z=>{const V=Z;V.geometry&&V.geometry.dispose(),V.material&&(Array.isArray(V.material)?V.material:[V.material]).forEach(j=>j.dispose())}),f==null||f.dispose(),f==null||f.domElement.remove(),y=[],A.clear(),X.length=0}),(Z,V)=>(H(),q("div",{ref_key:"host",ref:s,class:"three-scene"},[tt(Kt,{name:"loading"},{default:qt(()=>[r.value?(H(),q("div",dT,[c("div",hT,[fT,pT,c("span",null,B(o.value)+"%",1)]),mT,tt(Ns,{class:"model-progress",value:o.value,label:a.value,"pending-label":"\u51C6\u5907\u8D44\u6E90","complete-label":"\u6570\u5B57\u5B6A\u751F\u52A0\u8F7D\u5B8C\u6210",tone:"dark"},null,8,["value","label"])])):at("",!0)]),_:1}),l.value?at("",!0):(H(),q("div",gT,[_T,it(" \u5DE6\u952E\u65CB\u8F6C \xB7 \u53F3\u952E\u5E73\u79FB \xB7 \u6EDA\u8F6E\u7F29\u653E \xB7 \u5355\u51FB\u9009\u62E9 \xB7 \u53CC\u51FB\u5927\u68DA\u8FDB\u5165")])),tt(Kt,{name:"walk-control"},{default:qt(()=>[!l.value&&!r.value?(H(),q("button",{key:0,class:$e(["walk-toggle",{"drawer-open":n.drawerOpen}]),type:"button",onClick:nn(ge,["stop"])},bT,10,vT)):at("",!0)]),_:1}),tt(Kt,{name:"walk-hud"},{default:qt(()=>[l.value?(H(),q("div",MT,[AT,!u.value&&!n.overlayOpen?(H(),q("div",{key:0,class:"resume-hint",onClick:V[0]||(V[0]=Q=>{var j;return(j=K(_))==null?void 0:j.lock()})},TT)):at("",!0),CT,c("button",{class:"walk-exit",type:"button",onClick:V[1]||(V[1]=nn(Q=>Ge(),["stop"]))},[it("\u9000\u51FA\u5DE1\u573A "),DT])])):at("",!0)]),_:1}),c("div",RT,[c("i",{class:$e(h.value)},null,2),c("span",null,B(h.value),1),c("b",null,B(d.value),1),FT]),PT],512))}});var IT=zt(LT,[["__scopeId","data-v-73097004"]]);const BT=It({__name:"ViewSwitcher",props:{modelValue:null,drawerOpen:{type:Boolean}},setup(n){return(e,t)=>(H(),q("div",{class:$e(["view-switch",{shifted:n.drawerOpen}])},[c("button",{class:$e({active:n.modelValue==="aerial"}),onClick:t[0]||(t[0]=i=>e.$emit("update:modelValue","aerial"))},"\u5B9E\u666F",2),c("button",{class:$e({active:n.modelValue==="digital-twin"}),onClick:t[1]||(t[1]=i=>e.$emit("update:modelValue","digital-twin"))},"3D",2)],2))}});var UT=zt(BT,[["__scopeId","data-v-15c29169"]]);const us=n=>(Qt("data-v-023b1e5b"),n=n(),en(),n),NT={class:"toolbar"},OT=us(()=>c("span",{class:"compass"},"N",-1)),kT=us(()=>c("svg",{viewBox:"0 0 24 24"},[c("circle",{cx:"12",cy:"12",r:"8"}),c("path",{d:"m14.8 9.2-1.5 4.1-4.1 1.5 1.5-4.1 4.1-1.5Z"})],-1)),zT=[OT,kT],HT=us(()=>c("svg",{viewBox:"0 0 24 24"},[c("path",{d:"M4 12a8 8 0 1 0 2.3-5.7L4 8.6"}),c("path",{d:"M4 4v4.6h4.6"}),c("circle",{cx:"12",cy:"12",r:"2"})],-1)),$T=[HT],VT=us(()=>c("svg",{viewBox:"0 0 24 24"},[c("path",{d:"m12 4 8 4-8 4-8-4 8-4Z"}),c("path",{d:"m5 12 7 3.5 7-3.5M5 16l7 3.5 7-3.5"})],-1)),GT=[VT],WT=us(()=>c("i",null,null,-1)),XT=us(()=>c("svg",{viewBox:"0 0 24 24"},[c("path",{d:"M12 6v12M6 12h12"})],-1)),jT=[XT],qT=us(()=>c("svg",{viewBox:"0 0 24 24"},[c("path",{d:"M6 12h12"})],-1)),KT=[qT],YT=us(()=>c("i",null,null,-1)),JT=us(()=>c("svg",{viewBox:"0 0 24 24"},[c("path",{d:"m7 18 10-12M5 15l4 4M15 5l4 4M9.5 13.5l1.6 1.6M12 10.8l1.6 1.6"})],-1)),ZT=[JT],QT=It({__name:"SceneToolbar",setup(n){return(e,t)=>(H(),q("aside",NT,[c("button",{"aria-label":"\u6307\u5357\u9488",title:"\u6307\u5317\u5E76\u590D\u4F4D",onClick:t[0]||(t[0]=i=>e.$emit("reset"))},zT),c("button",{"aria-label":"\u590D\u4F4D\u89C6\u89D2",title:"\u590D\u4F4D\u89C6\u89D2",onClick:t[1]||(t[1]=i=>e.$emit("reset"))},$T),c("button",{"aria-label":"\u56FE\u5C42",title:"\u56FE\u5C42\u7BA1\u7406",onClick:t[2]||(t[2]=i=>e.$emit("layers"))},GT),WT,c("button",{"aria-label":"\u653E\u5927",title:"\u653E\u5927",onClick:t[3]||(t[3]=i=>e.$emit("zoomIn"))},jT),c("button",{"aria-label":"\u7F29\u5C0F",title:"\u7F29\u5C0F",onClick:t[4]||(t[4]=i=>e.$emit("zoomOut"))},KT),YT,c("button",{"aria-label":"\u6D4B\u91CF",title:"\u8DDD\u79BB\u6D4B\u91CF",onClick:t[5]||(t[5]=i=>e.$emit("measure"))},ZT)]))}});var e3=zt(QT,[["__scopeId","data-v-023b1e5b"]]);const t3=n=>(Qt("data-v-bc6d56aa"),n=n(),en(),n),n3={class:"dock","aria-label":"\u519C\u573A\u4E1A\u52A1\u56FE\u5C42"},i3=["aria-pressed","onClick"],s3={key:0,class:"shortcut"},r3={class:"tooltip"},o3={class:"icon"},a3={viewBox:"0 0 24 24","aria-hidden":"true"},l3=["d"],u3={key:0},c3={class:"label"},d3=t3(()=>c("em",null,null,-1)),h3=It({__name:"FarmBusinessDock",props:{active:null,showShortcuts:{type:Boolean}},emits:["change"],setup(n){const e={overview:["M3.5 11.5 12 4l8.5 7.5","M5.5 10v9.5h13V10","M9.5 19.5v-6h5v6"],monitoring:["M4 7.5h11a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2Z","m17 10 3-2v8l-3-2","M7 7.5l1-2h4l1 2","M7 12a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0Z"],environment:["M12 3a3 3 0 0 0-3 3v7.2a4.5 4.5 0 1 0 6 0V6a3 3 0 0 0-3-3Z","M12 8v7","M18.5 7h2M18.5 11h2M18.5 15h2"],devices:["M9 4h6l.6 2.1 1.6.9 2.1-.6 2 3.4-1.5 1.6v1.8l1.5 1.6-2 3.4-2.1-.6-1.6.9L15 20H9l-.6-2.1-1.6-.9-2.1.6-2-3.4 1.5-1.6v-1.8L2.7 9.2l2-3.4 2.1.6 1.6-.9L9 4Z","M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z"],irrigation:["M12 3c3.5 4.6 5.5 7.3 5.5 10.4a5.5 5.5 0 1 1-11 0C6.5 10.3 8.5 7.6 12 3Z","M9 15c.7 1.1 1.7 1.6 3 1.6","M3 20h18"],crops:["M19.5 4.5C13 4.5 8.6 7.2 7 11.6c-.8 2.4-.3 5.3 1.4 7.9 1-5.7 3.8-9.5 8.4-12","M7.4 13C5.2 12.6 3.6 13.4 2.5 15c2.3-.8 4.2-.5 5.6.8","M8.5 19.5c2.6-1.6 4.4-3.8 5.4-6.6 3.7-.8 5.8-3.6 5.6-8.4"],alerts:["M12 3 2.5 20h19L12 3Z","M12 9v5","M12 17h.01"]};return(t,i)=>(H(),q("nav",n3,[(H(!0),q(He,null,pt(K(cl),(s,r)=>(H(),q("button",{key:s.key,class:$e({active:n.active===s.key}),"aria-pressed":n.active===s.key,onClick:o=>t.$emit("change",s.key)},[tt(Kt,{name:"keycap"},{default:qt(()=>[n.showShortcuts?(H(),q("kbd",s3,B(r+1),1)):at("",!0)]),_:2},1024),c("span",r3,[c("strong",null,B(s.label),1),c("small",null,B(s.description),1)]),c("span",o3,[(H(),q("svg",a3,[(H(!0),q(He,null,pt(e[s.key],o=>(H(),q("path",{key:o,d:o},null,8,l3))),128))])),s.badge?(H(),q("i",u3,B(s.badge),1)):at("",!0)]),c("small",c3,B(s.label),1),d3],10,i3))),128))]))}});var f3=zt(h3,[["__scopeId","data-v-bc6d56aa"]]);async function So(n,e={}){const t=await fetch(`/api${n}`,{...e,headers:{"Content-Type":"application/json",Authorization:`Bearer ${gr()}`,...e.headers||{}}}),i=await t.json().catch(()=>({}));if(!t.ok)throw t.status===401&&(Vl(),window.location.replace("/#/sign-in")),new Error(i.message||`\u8BF7\u6C42\u5931\u8D25\uFF08${t.status}\uFF09`);return i}function p3(n="farm-01"){return So(`/farms/${n}/dashboard`)}function m3(n,e="farm-01"){return So(`/farms/${e}/greenhouses/${n}`)}function Z0(n,e,t="farm-01"){return So(`/farms/${t}/devices/${n}`,{method:"PATCH",body:JSON.stringify({enabled:e})})}function Cc(n,e,t,i="farm-01"){return So(`/farms/${i}/irrigation/${n}`,{method:"PATCH",body:JSON.stringify({enabled:e,durationMinutes:t})})}function g3(n,e="farm-01"){return So(`/farms/${e}/devices/${n}/self-test`,{method:"POST"})}function Q0(n,e="farm-01"){return So(`/farms/${e}/alerts/${n}/handle`,{method:"PATCH"})}const ht=n=>(Qt("data-v-cb3d782a"),n=n(),en(),n),_3=ht(()=>c("span",{class:"sync"},[c("i"),it("\u6570\u636E\u5B9E\u65F6\u540C\u6B65")],-1)),v3={key:0,class:"greenhouse-entry"},y3=ht(()=>c("span",null,[c("b",null,"\u8FDB\u5165\u5927\u68DA"),c("small",null,"\u5B9E\u666F\u76D1\u63A7 \xB7 \u6570\u5B57\u5B6A\u751F \xB7 \u690D\u682A\u6570\u636E")],-1)),E3=ht(()=>c("strong",null,"\u2192",-1)),x3=[y3,E3],b3={key:1,class:"content environment-panel"},M3={class:"hero-card"},A3=ht(()=>c("span",null,"\u7EFC\u5408\u73AF\u5883\u8BC4\u5206",-1)),S3=ht(()=>c("strong",null,[it("92"),c("small",null,"\u5206")],-1)),w3=ht(()=>c("em",null,"\u9002\u5B9C\u4F5C\u7269\u751F\u957F",-1)),T3={class:"trend"},C3=ht(()=>c("div",{class:"section-title"},[c("h3",null,"\u5B9E\u65F6\u73AF\u5883"),c("small",null,"\u865A\u62DF\u6570\u636E \xB7 30\u79D2\u66F4\u65B0")],-1)),D3={class:"metric-grid"},R3={class:"metric-icon"},F3={viewBox:"0 0 24 24"},P3=["d"],L3=ht(()=>c("section",null,[c("div",{class:"section-title"},[c("h3",null,"24 \u5C0F\u65F6\u8D8B\u52BF"),c("small",null,"\u6E29\u6E7F\u5EA6")]),c("div",{class:"line-chart"},[c("svg",{viewBox:"0 0 320 100",preserveAspectRatio:"none"},[c("path",{class:"area",d:"M0 79 C35 75 42 61 72 65 S112 43 145 51 S193 31 227 40 S278 20 320 25 L320 100H0Z"}),c("path",{d:"M0 79 C35 75 42 61 72 65 S112 43 145 51 S193 31 227 40 S278 20 320 25"})]),c("div",null,[c("span",null,"00:00"),c("span",null,"06:00"),c("span",null,"12:00"),c("span",null,"18:00"),c("span",null,"\u73B0\u5728")])])],-1)),I3=ht(()=>c("section",{class:"advice"},[c("span",null,"AI"),c("div",null,[c("b",null,"\u73AF\u5883\u8C03\u63A7\u5EFA\u8BAE"),c("p",null,"4\u53F7\u79CD\u690D\u533A\u571F\u58E4\u6E7F\u5EA6\u504F\u4F4E\uFF0C\u5EFA\u8BAE\u5728 17:20 \u5F00\u542F\u6EF4\u704C 18 \u5206\u949F\uFF1B\u5176\u4F59\u6307\u6807\u5904\u4E8E\u9002\u5B9C\u8303\u56F4\u3002")])],-1)),B3={key:2,class:"content device-panel"},U3={class:"summary-row"},N3=ht(()=>c("small",null,"\u8BBE\u5907\u603B\u6570",-1)),O3=ht(()=>c("small",null,"\u5728\u7EBF",-1)),k3={class:"green"},z3=ht(()=>c("small",null,"\u8FD0\u884C\u4E2D",-1)),H3=ht(()=>c("small",null,"\u5F02\u5E38",-1)),$3={class:"orange"},V3=ht(()=>c("div",{class:"section-title"},[c("h3",null,"\u8BBE\u5907\u5217\u8868"),c("small",null,"\u6BCF30\u79D2\u81EA\u52A8\u540C\u6B65")],-1)),G3={class:"device-list"},W3=["onClick"],X3={class:"control-card"},j3={class:"control-head"},q3=ht(()=>c("small",null,"\u5F53\u524D\u8BBE\u5907",-1)),K3={class:"switch"},Y3=["checked"],J3=ht(()=>c("span",null,null,-1)),Z3=ht(()=>c("dt",null,"\u8FD0\u884C\u72B6\u6001",-1)),Q3=ht(()=>c("dt",null,"\u5B9E\u65F6\u6570\u636E",-1)),eC=ht(()=>c("dt",null,"\u6700\u540E\u901A\u4FE1",-1)),tC=ht(()=>c("div",null,[c("dt",null,"\u63A7\u5236\u6A21\u5F0F"),c("dd",null,"\u81EA\u52A8")],-1)),nC={key:3,class:"content irrigation-panel"},iC={class:"water-summary"},sC={class:"water-ring"},rC=ht(()=>c("small",null,"\u84C4\u6C34\u91CF",-1)),oC=ht(()=>c("div",null,[c("dt",null,"\u4E3B\u7BA1\u6D41\u91CF"),c("dd",null,"12.6 m\xB3/h")],-1)),aC=ht(()=>c("dt",null,"\u4ECA\u65E5\u7528\u6C34",-1)),lC=ht(()=>c("dt",null,"\u8FD0\u884C\u5355\u5143",-1)),uC=ht(()=>c("div",{class:"section-title"},[c("h3",null,"\u704C\u6E89\u63A7\u5236\u5355\u5143"),c("small",null,"\u70B9\u51FB\u5730\u56FE\u6216\u5217\u8868\u9009\u62E9")],-1)),cC={class:"unit-list"},dC=["onClick"],hC={class:"irrigation-control"},fC={class:"control-head"},pC=ht(()=>c("small",null,"\u9009\u4E2D\u5355\u5143",-1)),mC={class:"switch water"},gC=["checked"],_C=ht(()=>c("span",null,null,-1)),vC={class:"duration"},yC=ht(()=>c("span",null,"\u672C\u6B21\u704C\u6E89\u65F6\u957F",-1)),EC=ht(()=>c("dt",null,"\u704C\u6E89\u5BF9\u8C61",-1)),xC=ht(()=>c("dt",null,"\u5F53\u524D\u6D41\u91CF",-1)),bC=ht(()=>c("div",null,[c("dt",null,"\u63A7\u5236\u7B56\u7565"),c("dd",null,"\u571F\u58E4\u5892\u60C5\u8054\u52A8")],-1)),MC={key:4,class:"content crop-panel"},AC={class:"crop-hero"},SC=ht(()=>c("div",{class:"leaf"},[c("svg",{viewBox:"0 0 24 24"},[c("path",{d:"M19.5 4.5C13 4.5 8.6 7.2 7 11.6c-.8 2.4-.3 5.3 1.4 7.9 1-5.7 3.8-9.5 8.4-12M7.4 13C5.2 12.6 3.6 13.4 2.5 15c2.3-.8 4.2-.5 5.6.8"})])],-1)),wC={class:"score"},TC=ht(()=>c("small",null,"\u5065\u5EB7\u5EA6",-1)),CC=ht(()=>c("section",null,[c("div",{class:"section-title"},[c("h3",null,"\u751F\u957F\u72B6\u6001"),c("small",null,"AI \u8BC6\u522B")]),c("div",{class:"growth"},[c("article",null,[c("span",null,"\u682A\u9AD8"),c("b",null,"32.6 cm"),c("em",null,"\u6B63\u5E38")]),c("article",null,[c("span",null,"\u53F6\u9762\u79EF\u6307\u6570"),c("b",null,"3.8 LAI"),c("em",null,"\u826F\u597D")]),c("article",null,[c("span",null,"\u75C5\u866B\u5BB3\u98CE\u9669"),c("b",null,"\u4F4E"),c("em",null,"\u65E0\u5F02\u5E38")]),c("article",null,[c("span",null,"\u9884\u8BA1\u91C7\u6536"),c("b",null,"18 \u5929"),c("em",null,"8\u670821\u65E5")])])],-1)),DC=ht(()=>c("div",{class:"section-title"},[c("h3",null,"\u751F\u80B2\u8FDB\u5EA6"),c("small",null,"\u7B2C 34 \u5929")],-1)),RC={class:"stages"},FC=ht(()=>c("i",{class:"done"},null,-1)),PC=ht(()=>c("i",{class:"done"},null,-1)),LC=ht(()=>c("i",{class:"current"},null,-1)),IC=ht(()=>c("i",null,null,-1)),BC=ht(()=>c("span",null,"\u5B9A\u690D",-1)),UC=ht(()=>c("span",null,"\u8425\u517B\u751F\u957F",-1)),NC=ht(()=>c("span",null,"\u91C7\u6536",-1)),OC=ht(()=>c("section",null,[c("div",{class:"section-title"},[c("h3",null,"\u4ECA\u65E5\u519C\u4E8B")]),c("div",{class:"task"},[c("i",null,"\u2713"),c("span",null,[c("b",null,"\u5B8C\u6210\u53F6\u9762\u5DE1\u68C0"),c("small",null,"\u673A\u5668\u4EBA\u5DE1\u68C0 \xB7 10:30")]),c("em",null,"\u5DF2\u5B8C\u6210")]),c("div",{class:"task"},[c("i",null,"\u25CB"),c("span",null,[c("b",null,"\u68C0\u67E5\u6EF4\u704C\u538B\u529B"),c("small",null,"\u8BA1\u5212\u6267\u884C \xB7 17:20")]),c("em",null,"\u5F85\u6267\u884C")])],-1)),kC={key:5,class:"content overview-panel"},zC={class:"summary-row"},HC=ht(()=>c("small",null,"\u519C\u573A\u5065\u5EB7",-1)),$C={class:"green"},VC=ht(()=>c("small",null,"\u5728\u7EBF\u8BBE\u5907",-1)),GC=ht(()=>c("article",null,[c("small",null,"\u4ECA\u65E5\u4EFB\u52A1"),c("b",null,"12")],-1)),WC=ht(()=>c("small",null,"\u5F85\u5904\u7406",-1)),XC={class:"orange"},jC={class:"section-title"},qC={key:0,class:"overview-card"},KC=ht(()=>c("div",{class:"leaf"},[c("svg",{viewBox:"0 0 24 24"},[c("path",{d:"M19.5 4.5C13 4.5 8.6 7.2 7 11.6c-.8 2.4-.3 5.3 1.4 7.9 1-5.7 3.8-9.5 8.4-12M7.4 13C5.2 12.6 3.6 13.4 2.5 15c2.3-.8 4.2-.5 5.6.8"})])],-1)),YC={key:1,class:"overview-card object-card"},JC={class:"object-glyph"},ZC={viewBox:"0 0 24 24"},QC={key:0,d:"M12 3c3.5 4.7 5.5 7.3 5.5 10.5a5.5 5.5 0 0 1-11 0C6.5 10.3 8.5 7.7 12 3Z"},e6={key:1,d:"M4 8h11v9H4zM15 11l5-2v7l-5-2zM8 12.5a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z"},t6={key:2,d:"M5 7h14v10H5zM12 7V4M8 20v-3M16 20v-3M9 12h.1M15 12h.1"},n6={key:3,d:"M9 4h6l.6 2.2 1.5.8 2.2-.6 2 3.5-1.6 1.6v1.7l1.6 1.6-2 3.5-2.2-.6-1.5.8L15 20H9l-.6-2.1-1.5-.8-2.2.6-2-3.5 1.6-1.6v-1.7L2.7 9.9l2-3.5 2.2.6 1.5-.8L9 4Zm0 8a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z"},i6={class:"object-state"},s6=ht(()=>c("div",{class:"section-title"},[c("h3",null,"\u6700\u65B0\u544A\u8B66")],-1)),r6=ht(()=>c("span",null,"!",-1)),o6=["disabled","onClick"],a6=It({__name:"FarmContextDrawer",props:{entity:null,open:{type:Boolean},module:null},emits:["close","select","action","enter-greenhouse"],setup(n,{emit:e}){const t=n,i=Bn(Object.fromEntries(An.map(E=>[E.entityId,E.enabled]))),s=Bn(Object.fromEntries($n.map(E=>[E.entityId,E.enabled])));tu(()=>An.forEach(E=>{i[E.entityId]=E.enabled})),tu(()=>$n.forEach(E=>{s[E.entityId]=E.enabled}));const r=Ce(18),o=Ce(null),a=Qe(()=>An.find(E=>{var y;return E.entityId===((y=t.entity)==null?void 0:y.id)})||An[0]),l=Qe(()=>$n.find(E=>{var y;return E.entityId===((y=t.entity)==null?void 0:y.id)})||$n[0]);tu(()=>{var E;r.value=((E=l.value)==null?void 0:E.durationMinutes)||18});const u=Qe(()=>Ni.find(E=>{var y;return E.entityId===((y=t.entity)==null?void 0:y.id)})),d=Qe(()=>u.value||Ni[0]),h=["M12 3a3 3 0 0 0-3 3v7.2a4.5 4.5 0 1 0 6 0V6a3 3 0 0 0-3-3Zm0 5v7","M12 3C8.7 7.4 7 10 7 13a5 5 0 0 0 10 0c0-3-1.7-5.6-5-10Zm-2.5 11.5c.6 1 1.4 1.5 2.7 1.5","M4 17c4-6 9-9 16-10M6 12c3 0 5 1 7 4M12 9c2 0 4 .8 6 3M4 20h16","M12 4v2M12 18v2M4 12h2M18 12h2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M17.7 6.3l-1.4 1.4M7.7 16.3l-1.4 1.4M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z","M7 17c-2-1-3-2.7-3-5 0-3.3 2.7-6 6-6 .7-1.8 2.4-3 4.5-3C17.5 3 20 5.5 20 9c0 2.1-1.1 4-2.8 5M8 20h8M10 16h4"],f=Qe(()=>{var E,y;return{overview:((E=t.entity)==null?void 0:E.name)||"\u519C\u573A\u8FD0\u884C\u603B\u89C8",environment:"\u519C\u573A\u73AF\u5883\u4E2D\u5FC3",devices:"\u8BBE\u5907\u7BA1\u7406\u4E2D\u5FC3",irrigation:"\u667A\u6167\u704C\u6E89\u63A7\u5236",crops:((y=t.entity)==null?void 0:y.name)||"\u4F5C\u7269\u751F\u957F\u6863\u6848",alerts:"\u519C\u573A\u544A\u8B66\u4E2D\u5FC3",monitoring:"\u56ED\u533A\u76D1\u63A7"}[t.module]});async function p(E){const y=i[E];i[E]=!y;try{const x=await Z0(E,i[E]),M=An.find(A=>A.entityId===E);M&&Object.assign(M,x),yt.runningDevices=An.filter(A=>A.online&&A.enabled).length,e("action",`${x.name}${x.enabled?"\u5DF2\u5F00\u542F":"\u5DF2\u5173\u95ED"}`)}catch(x){i[E]=y,e("action",x instanceof Error?x.message:"\u8BBE\u5907\u63A7\u5236\u5931\u8D25")}}async function g(E){const y=$n.find(M=>M.entityId===E);if(!y)return;const x=s[E];s[E]=!x;try{const M=await Cc(y.id,s[E],Number(r.value));Object.assign(y,M),e("action",`${M.name}${M.enabled?"\u5F00\u59CB\u704C\u6E89":"\u505C\u6B62\u704C\u6E89"}`)}catch(M){s[E]=x,e("action",M instanceof Error?M.message:"\u704C\u6E89\u63A7\u5236\u5931\u8D25")}}async function v(){const E=l.value;try{const y=await Cc(E.id,s[E.entityId],Number(r.value));Object.assign(E,y),e("action",`${y.name}\u704C\u6E89\u8BA1\u5212\u5DF2\u4FDD\u5B58\uFF08${y.durationMinutes}\u5206\u949F\uFF09`)}catch(y){e("action",y instanceof Error?y.message:"\u8BA1\u5212\u4FDD\u5B58\u5931\u8D25")}}async function _(){try{const E=await g3(a.value.entityId);Object.assign(a.value,E),e("action",`${E.name}\u81EA\u68C0\u901A\u8FC7\uFF0C\u901A\u4FE1\u6B63\u5E38`)}catch(E){e("action",E instanceof Error?E.message:"\u8BBE\u5907\u81EA\u68C0\u5931\u8D25")}}async function m(E){if(!!E){o.value=E;try{const y=await Q0(E),x=Ln.find(M=>M.id===E);if(x&&Object.assign(x,y),(x==null?void 0:x.entityId)&&!Ln.some(M=>M.entityId===x.entityId&&!["\u5DF2\u5904\u7406","\u5DF2\u6062\u590D"].includes(M.status))){const M=Xt.find(A=>A.id===x.entityId);M&&(M.status="normal")}yt.openAlerts=Ln.filter(M=>!["\u5DF2\u5904\u7406","\u5DF2\u6062\u590D"].includes(M.status)).length,e("action","\u544A\u8B66\u5DF2\u5904\u7406\u5E76\u5199\u5165\u6570\u636E\u5E93")}catch(y){e("action",y instanceof Error?y.message:"\u544A\u8B66\u5904\u7406\u5931\u8D25")}finally{o.value=null}}}return(E,y)=>(H(),gn(Kt,{name:"drawer"},{default:qt(()=>{var x,M,A,F,I,b,w,oe,X,z,T,G,re,ae;return[n.open?(H(),q("aside",{key:0,class:$e(["drawer",`theme-${n.module}`]),onClick:y[5]||(y[5]=nn(()=>{},["stop"]))},[c("header",null,[c("div",null,[c("small",null,B(n.module.toUpperCase())+" CENTER",1),c("h2",null,B(K(f)),1)]),_3,c("button",{"aria-label":"\u5173\u95ED",onClick:y[0]||(y[0]=C=>E.$emit("close"))},"\xD7")]),((x=n.entity)==null?void 0:x.type)==="greenhouse"?(H(),q("div",v3,[c("button",{onClick:y[1]||(y[1]=C=>{var J;return E.$emit("enter-greenhouse",((J=n.entity)==null?void 0:J.id)||"")})},x3)])):at("",!0),n.module==="environment"?(H(),q("div",b3,[c("section",M3,[A3,S3,w3,c("div",T3,[(H(),q(He,null,pt([34,42,39,51,48,62,58,70,68,79,75,86],C=>c("i",{key:C,style:Gn({height:C+"%"})},null,4)),64))])]),c("section",null,[C3,c("div",D3,[(H(!0),q(He,null,pt(K(Os),(C,J)=>(H(),q("article",{key:C.label,class:$e(C.tone)},[c("span",R3,[(H(),q("svg",F3,[c("path",{d:h[J]},null,8,P3)]))]),c("div",null,[c("small",null,B(C.label),1),c("b",null,B(C.value),1),c("em",null,B(C.delta),1)])],2))),128))])]),L3,I3])):n.module==="devices"?(H(),q("div",B3,[c("section",U3,[c("article",null,[N3,c("b",null,B(K(yt).totalDevices),1)]),c("article",null,[O3,c("b",k3,B(K(yt).onlineDevices),1)]),c("article",null,[z3,c("b",null,B(K(yt).runningDevices),1)]),c("article",null,[H3,c("b",$3,B(K(yt).totalDevices-K(yt).onlineDevices),1)])]),c("section",null,[V3,c("div",G3,[(H(!0),q(He,null,pt(K(An),C=>(H(),q("button",{key:C.id,class:$e({active:K(a).entityId===C.entityId}),onClick:J=>E.$emit("select",C.entityId)},[c("span",{class:$e(["device-symbol",C.category])},B(C.category==="sensor"?"S":C.category==="camera"?"C":C.category==="robot"?"R":"A"),3),c("div",null,[c("b",null,B(C.name),1),c("small",null,B(C.location)+" \xB7 "+B(C.value),1)]),c("i",{class:$e({online:C.online})},null,2)],10,W3))),128))])]),c("section",X3,[c("div",j3,[c("div",null,[q3,c("h3",null,B(K(a).name),1)]),c("label",K3,[c("input",{type:"checkbox",checked:i[K(a).entityId],onChange:y[2]||(y[2]=C=>p(K(a).entityId))},null,40,Y3),J3])]),c("dl",null,[c("div",null,[Z3,c("dd",{class:$e({green:i[K(a).entityId]})},B(i[K(a).entityId]?"\u6B63\u5E38\u8FD0\u884C":"\u5DF2\u5173\u95ED"),3)]),c("div",null,[Q3,c("dd",null,B(K(a).value),1)]),c("div",null,[eC,c("dd",null,B(K(a).lastSeen),1)]),tC]),c("div",{class:"actions"},[c("button",{onClick:_},"\u8BBE\u5907\u81EA\u68C0")])])])):n.module==="irrigation"?(H(),q("div",nC,[c("section",iC,[c("div",sC,[c("b",null,B(K(yt).waterLevel)+"%",1),rC]),c("dl",null,[oC,c("div",null,[aC,c("dd",null,B(K(yt).todayWaterUsage)+" m\xB3",1)]),c("div",null,[lC,c("dd",null,B(K($n).filter(C=>C.enabled).length)+" / "+B(K($n).length),1)])])]),c("section",null,[uC,c("div",cC,[(H(!0),q(He,null,pt(K($n),C=>(H(),q("button",{key:C.id,class:$e({active:K(l).entityId===C.entityId}),onClick:J=>E.$emit("select",C.entityId)},[c("i",{class:$e({running:s[C.entityId]})},null,2),c("span",null,[c("b",null,B(C.name),1),c("small",null,B(C.target),1)]),c("em",null,B(s[C.entityId]?"\u8FD0\u884C":"\u5173\u95ED"),1)],10,dC))),128))])]),c("section",hC,[c("div",fC,[c("div",null,[pC,c("h3",null,B(K(l).name),1)]),c("label",mC,[c("input",{type:"checkbox",checked:s[K(l).entityId],onChange:y[3]||(y[3]=C=>g(K(l).entityId))},null,40,gC),_C])]),c("div",vC,[yC,c("b",null,B(r.value)+" \u5206\u949F",1),ss(c("input",{"onUpdate:modelValue":y[4]||(y[4]=C=>r.value=C),type:"range",min:"5",max:"60"},null,512),[[Ls,r.value]])]),c("dl",null,[c("div",null,[EC,c("dd",null,B(K(l).target),1)]),c("div",null,[xC,c("dd",null,B(K(l).flow),1)]),bC]),c("button",{class:"schedule",onClick:v},"\u4FDD\u5B58\u704C\u6E89\u8BA1\u5212")])])):n.module==="crops"?(H(),q("div",MC,[c("section",AC,[SC,c("div",null,[c("small",null,B(K(d).area),1),c("h3",null,B(K(d).crop),1),c("span",null,B(K(d).stage),1)]),c("div",wC,[c("b",null,B(((M=n.entity)==null?void 0:M.health)||94),1),TC])]),CC,c("section",null,[DC,c("div",RC,[FC,PC,LC,IC,c("div",null,[BC,UC,c("span",null,B(K(d).stage),1),NC])])]),OC])):(H(),q("div",kC,[c("section",zC,[c("article",null,[HC,c("b",$C,B(K(yt).health),1)]),c("article",null,[VC,c("b",null,B(Math.round(K(yt).onlineDevices/Math.max(1,K(yt).totalDevices)*100))+"%",1)]),GC,c("article",null,[WC,c("b",XC,B(K(yt).openAlerts),1)])]),c("section",null,[c("div",jC,[c("h3",null,B(((A=n.entity)==null?void 0:A.name)||"\u91CD\u70B9\u5BF9\u8C61"),1),c("small",null,B((F=n.entity)==null?void 0:F.metric),1)]),K(u)?(H(),q("div",qC,[KC,c("div",null,[c("b",null,B(K(u).crop),1),c("small",null,B(K(u).area)+" \xB7 "+B(K(u).stage),1),c("p",null,B(K(u).environment),1)]),c("strong",null,B(((I=n.entity)==null?void 0:I.health)||92),1)])):(H(),q("div",YC,[c("div",JC,[(H(),q("svg",ZC,[((b=n.entity)==null?void 0:b.type)==="water"?(H(),q("path",QC)):((w=n.entity)==null?void 0:w.type)==="camera"?(H(),q("path",e6)):((oe=n.entity)==null?void 0:oe.type)==="robot"?(H(),q("path",t6)):(H(),q("path",n6))]))]),c("div",null,[c("b",null,B(((X=n.entity)==null?void 0:X.name)||"\u519C\u573A\u5BF9\u8C61"),1),c("small",null,B(((z=n.entity)==null?void 0:z.type)==="water"?"\u519C\u4E1A\u6C34\u6E90\u8BBE\u65BD":((T=n.entity)==null?void 0:T.type)==="camera"?"\u89C6\u9891\u76D1\u63A7\u8BBE\u5907":((G=n.entity)==null?void 0:G.type)==="robot"?"\u667A\u80FD\u5DE1\u68C0\u8BBE\u5907":"\u519C\u4E1A\u7269\u8054\u7F51\u8BBE\u5907"),1),c("p",null,B(((re=n.entity)==null?void 0:re.metric)||"\u8FD0\u884C\u72B6\u6001\u6B63\u5E38"),1)]),c("strong",i6,B(((ae=n.entity)==null?void 0:ae.status)==="offline"?"\u79BB\u7EBF":"\u5728\u7EBF"),1)]))]),c("section",null,[s6,(H(!0),q(He,null,pt(K(Ln),C=>(H(),q("article",{key:C.id||C.time,class:"alert-item"},[r6,c("div",null,[c("b",null,B(C.title),1),c("small",null,B(C.time)+" \xB7 "+B(C.status),1)]),C.id&&!["\u5DF2\u5904\u7406","\u5DF2\u6062\u590D"].includes(C.status)?(H(),q("button",{key:0,class:"resolve-alert",disabled:o.value===C.id,onClick:J=>m(C.id)},[c("i",null,B(o.value===C.id?"\xB7\xB7\xB7":"\u2713"),1),it(B(o.value===C.id?"\u5904\u7406\u4E2D":"\u6807\u8BB0\u5904\u7406"),1)],8,o6)):at("",!0)]))),128))])]))],2)):at("",!0)]}),_:1}))}});var l6=zt(a6,[["__scopeId","data-v-cb3d782a"]]);const jt=n=>(Qt("data-v-decbb422"),n=n(),en(),n),u6=["onClick"],c6={class:"modal"},d6=jt(()=>c("small",null,"LIVE MONITORING \xB7 YOLO VISION",-1)),h6=jt(()=>c("span",null,"2 \u7C7B\u8BC6\u522B",-1)),f6=jt(()=>c("div",{class:"live"},[c("i"),it("\u5B9E\u65F6\u753B\u9762")],-1)),p6={class:"body"},m6={class:"video-stage"},g6=jt(()=>c("div",{class:"video-shade"},null,-1)),_6=jt(()=>c("div",{class:"scan"},null,-1)),v6={class:"camera-meta"},y6=jt(()=>c("i",null,null,-1)),E6=jt(()=>c("i",null,null,-1)),x6=jt(()=>c("i",{class:"corner tl"},null,-1)),b6=jt(()=>c("i",{class:"corner tr"},null,-1)),M6=jt(()=>c("i",{class:"corner bl"},null,-1)),A6=jt(()=>c("i",{class:"corner br"},null,-1)),S6={class:"legend"},w6={class:"person"},T6=jt(()=>c("i",null,null,-1)),C6={class:"crop"},D6=jt(()=>c("i",null,null,-1)),R6={class:"video-actions"},F6={class:"camera-tabs"},P6=["onClick"],L6=jt(()=>c("span",{class:"camera-icon"},[c("svg",{viewBox:"0 0 24 24"},[c("path",{d:"M4 7.5h11a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2Zm13 3 5-2v7l-5-2"})])],-1)),I6=jt(()=>c("small",null,[c("i"),it("\u5728\u7EBF \xB7 1080P")],-1)),B6={class:"monitor-info"},U6={class:"info-title"},N6=jt(()=>c("h3",null,"AI \u5B9E\u65F6\u5206\u6790",-1)),O6={class:"stat-grid"},k6=jt(()=>c("small",null,"\u4EBA\u5458",-1)),z6=jt(()=>c("small",null,"\u4F5C\u7269\u7F6E\u4FE1\u5EA6",-1)),H6=jt(()=>c("dt",null,"\u5F53\u524D\u4F5C\u7269",-1)),$6=jt(()=>c("dt",null,"\u751F\u957F\u9636\u6BB5",-1)),V6=jt(()=>c("div",null,[c("dt",null,"\u73AF\u5883\u72B6\u6001"),c("dd",{class:"normal"},"\u6B63\u5E38")],-1)),G6=jt(()=>c("div",null,[c("dt",null,"\u5F02\u5E38\u4E8B\u4EF6"),c("dd",null,"0 \u6761")],-1)),W6=jt(()=>c("span",null,"Y",-1)),X6=jt(()=>c("b",null,"\u76EE\u6807\u68C0\u6D4B\u670D\u52A1",-1)),j6=jt(()=>c("span",null,"\u2192",-1)),q6=It({__name:"GreenhouseMonitorModal",props:{open:{type:Boolean},entity:null,zone:null},emits:["close","action"],setup(n,{emit:e}){const t=n,i=Ce(0),s=Ce(),r=Ce(0),o=Ce(),a=Ce("loading"),l=["\u5165\u53E3\u5168\u666F","\u79CD\u690D\u533A A","\u79CD\u690D\u533A B"],u="/platform/assets/media/greenhouse-monitor.mp4",d="/platform/assets/media/greenhouse-monitor.detections.json",h=Ce(Date.now()),f=Ce(!1);let p,g=[],v=0;const _=Qe(()=>{var C,J;return((C=t.zone)==null?void 0:C.crop)||(((J=t.entity)==null?void 0:J.type)==="field"?"\u9732\u5929\u4F5C\u7269":"\u6E29\u5BA4\u4F5C\u7269")}),m=Qe(()=>new Intl.DateTimeFormat("zh-CN",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1}).format(new Date(h.value+r.value*1e3)).replaceAll("/","-")),E=Qe(()=>{var C;return((C=o.value)==null?void 0:C.video.fps)||25}),y=Qe(()=>{var C;return((C=o.value)==null?void 0:C.video.frameCount)||38}),x=Qe(()=>Math.min(Math.max(0,y.value-1),Math.floor(r.value*E.value))),M=Qe(()=>{var C,J;return((J=(C=o.value)==null?void 0:C.frames[x.value])==null?void 0:J.detections)||[]}),A=Qe(()=>a.value==="ready"),F=Qe(()=>M.value.filter(C=>C.kind==="person").length),I=Qe(()=>Math.round(M.value.filter(C=>C.kind==="crop").reduce((C,J)=>Math.max(C,J.confidence),0)*100));async function b(){a.value="loading";try{const C=await fetch(d,{cache:"no-store"});if(!C.ok)throw new Error(`HTTP ${C.status}`);const J=await C.json();if(J.schemaVersion!==1||!Array.isArray(J.frames))throw new Error("invalid detection schema");o.value=J,a.value=J.frames.length?"ready":"pending"}catch(C){console.warn("YOLO detection data unavailable",C),a.value="error"}}function w(){!s.value||(r.value=s.value.currentTime,v=requestAnimationFrame(w))}async function oe(){b(),await jn(),s.value&&(cancelAnimationFrame(v),h.value=Date.now(),s.value.currentTime=0,s.value.play().catch(()=>{}),w())}function X(){var C;(C=s.value)==null||C.pause(),cancelAnimationFrame(v),e("close")}async function z(C){i.value=C,await oe()}async function T(){var J;const C=(J=s.value)==null?void 0:J.closest(".video-stage");if(!!C)try{document.fullscreenElement?await document.exitFullscreen():await C.requestFullscreen()}catch{e("action","\u6D4F\u89C8\u5668\u672A\u5141\u8BB8\u8FDB\u5165\u5168\u5C4F")}}function G(){var ee;const C=s.value;if(!C||!C.videoWidth)return e("action","\u753B\u9762\u5C1A\u672A\u52A0\u8F7D\u5B8C\u6210");const J=document.createElement("canvas");J.width=C.videoWidth,J.height=C.videoHeight,(ee=J.getContext("2d"))==null||ee.drawImage(C,0,0);const $=document.createElement("a");$.download=`farm-camera-${Date.now()}.jpg`,$.href=J.toDataURL("image/jpeg",.92),$.click(),e("action","\u5F53\u524D\u76D1\u63A7\u753B\u9762\u5DF2\u4FDD\u5B58")}function re(){var J,$;const C=($=(J=s.value)==null?void 0:J.captureStream)==null?void 0:$.call(J);if(!C||typeof MediaRecorder=="undefined")return e("action","\u5F53\u524D\u6D4F\u89C8\u5668\u4E0D\u652F\u6301\u89C6\u9891\u5F55\u5236");if(f.value){p==null||p.stop();return}g=[],p=new MediaRecorder(C,{mimeType:MediaRecorder.isTypeSupported("video/webm")?"video/webm":""}),p.ondataavailable=ee=>{ee.data.size&&g.push(ee.data)},p.onstop=()=>{const ee=document.createElement("a"),U=URL.createObjectURL(new Blob(g,{type:"video/webm"}));ee.href=U,ee.download=`farm-recording-${Date.now()}.webm`,ee.click(),URL.revokeObjectURL(U),f.value=!1,e("action","\u76D1\u63A7\u5F55\u50CF\u5DF2\u4FDD\u5B58")},p.start(),f.value=!0,e("action","\u5F55\u50CF\u5DF2\u5F00\u59CB\uFF0C\u518D\u6B21\u70B9\u51FB\u5373\u53EF\u7ED3\u675F\u5E76\u4FDD\u5B58")}function ae(){!s.value||(s.value.controls=!0,s.value.currentTime=0,s.value.pause(),e("action","\u5DF2\u8FDB\u5165\u5F55\u50CF\u56DE\u653E\uFF0C\u53EF\u62D6\u52A8\u8FDB\u5EA6\u6761\u64AD\u653E"))}return _n(()=>{var C;return(C=t.entity)==null?void 0:C.id},()=>{i.value=0}),_n(()=>t.open,C=>C?oe():cancelAnimationFrame(v)),$i(()=>{cancelAnimationFrame(v),(p==null?void 0:p.state)==="recording"&&p.stop()}),(C,J)=>(H(),gn(Kt,{name:"monitor"},{default:qt(()=>{var $,ee,U,N;return[n.open?(H(),q("div",{key:0,class:"mask",onClick:nn(X,["self"])},[c("section",c6,[c("header",null,[c("div",null,[d6,c("h2",null,B((($=n.entity)==null?void 0:$.name)||"\u56ED\u533A\u76D1\u63A7"),1)]),c("div",{class:$e(["model-state",{pending:!K(A)}])},[h6,c("b",null,B(K(A)?"YOLO":"\u5F85\u8BAD\u7EC3"),1)],2),f6,c("button",{"aria-label":"\u5173\u95ED",onClick:X},"\xD7")]),c("div",p6,[c("div",m6,[c("video",{ref_key:"videoRef",ref:s,src:u,autoplay:"",muted:"",loop:"",playsinline:"",preload:"auto"},null,512),g6,_6,c("div",v6,[c("span",null,[y6,it("CAM-0"+B(i.value+1),1)]),c("time",null,B(K(m)),1)]),c("div",{class:$e(["recognition-state",{pending:!K(A)}])},[E6,it(B(a.value==="loading"?"\u52A0\u8F7D\u68C0\u6D4B\u6570\u636E":K(A)?"AI \u5206\u6790\u4E2D":"\u7B49\u5F85 YOLO \u7ED3\u679C")+" ",1),c("span",null,B(K(x)+1)+"/"+B(K(y))+" FRAME",1)],2),a.value==="loading"?(H(),gn(Ns,{key:0,class:"detection-progress",value:null,label:"\u8F7D\u5165 YOLO \u68C0\u6D4B\u7ED3\u679C","pending-label":"\u89E3\u6790\u5E27\u6570\u636E",tone:"dark",compact:""})):at("",!0),(H(!0),q(He,null,pt(K(M),le=>(H(),q("div",{key:le.id,class:$e(["detection-box",le.kind]),style:Gn({left:`${le.x}%`,top:`${le.y}%`,width:`${le.width}%`,height:`${le.height}%`})},[c("span",null,B(le.kind==="person"?"\u4EBA\u5458":"\u4F5C\u7269")+" "+B(Math.round(le.confidence*100))+"%",1),x6,b6,M6,A6],6))),128)),c("div",S6,[c("span",w6,[T6,it("\u4EBA\u5458 "+B(K(A)?K(F):"--"),1)]),c("span",C6,[D6,it("\u4F5C\u7269 "+B(K(A)?`${K(I)}%`:"--"),1)])]),c("div",R6,[c("button",{onClick:G},"\u622A\u56FE"),c("button",{onClick:re},B(f.value?"\u7ED3\u675F\u5F55\u50CF":"\u5F55\u50CF"),1),c("button",{onClick:T},"\u5168\u5C4F")])]),c("aside",null,[c("div",F6,[(H(),q(He,null,pt(l,(le,Y)=>c("button",{key:le,class:$e({active:i.value===Y}),onClick:ce=>z(Y)},[L6,c("span",null,[c("b",null,B(le),1),I6]),c("em",null,"0"+B(Y+1),1)],10,P6)),64))]),c("div",B6,[c("div",U6,[N6,c("span",null,B(K(E))+" FPS",1)]),c("div",O6,[c("div",null,[k6,c("strong",null,B(K(A)?K(F):"--"),1)]),c("div",null,[z6,c("strong",null,B(K(A)?`${K(I)}%`:"--"),1)])]),c("dl",null,[c("div",null,[H6,c("dd",null,B(K(_)),1)]),c("div",null,[$6,c("dd",null,B(((ee=n.zone)==null?void 0:ee.stage)||"\u751F\u957F\u671F"),1)]),V6,G6])]),c("div",{class:$e(["model-card",{pending:!K(A)}])},[W6,c("div",null,[X6,c("small",null,B(K(A)?`${(U=o.value)==null?void 0:U.model.file} \xB7 ${(N=o.value)==null?void 0:N.model.tracker}`:"\u8BF7\u5148\u8BAD\u7EC3\u5E76\u5BFC\u51FA\u68C0\u6D4B\u7ED3\u679C"),1)]),c("i",null,B(K(A)?"\u5DF2\u63A5\u5165":"\u5F85\u90E8\u7F72"),1)],2),c("button",{class:"playback",onClick:ae},[it("\u67E5\u770B\u5F55\u50CF\u56DE\u653E "),j6])])])])],8,u6)):at("",!0)]}),_:1}))}});var K6=zt(q6,[["__scopeId","data-v-decbb422"]]);const eg=n=>(Qt("data-v-3921517f"),n=n(),en(),n),Y6={key:0,class:"layers"},J6=eg(()=>c("strong",null,"\u573A\u666F\u56FE\u5C42",-1)),Z6=["onUpdate:modelValue","onChange"],Q6=eg(()=>c("i",null,null,-1)),e4=It({__name:"LayerPopover",props:{open:{type:Boolean}},emits:["change"],setup(n,{emit:e}){const t=Ce([{key:"zones",label:"\u5730\u5757\u8FB9\u754C",on:!0},{key:"devices",label:"\u8BBE\u5907\u6807\u7B7E",on:!0},{key:"cameras",label:"\u6444\u50CF\u5934\u8986\u76D6",on:!1},{key:"irrigation",label:"\u704C\u6E89\u7BA1\u7F51",on:!1},{key:"alerts",label:"\u544A\u8B66\u4F4D\u7F6E",on:!0}]);return(i,s)=>(H(),gn(Kt,{name:"pop"},{default:qt(()=>[n.open?(H(),q("div",Y6,[J6,(H(!0),q(He,null,pt(t.value,r=>(H(),q("label",{key:r.key},[c("span",null,B(r.label),1),ss(c("input",{"onUpdate:modelValue":o=>r.on=o,type:"checkbox",onChange:o=>e("change",r.key,r.on)},null,40,Z6),[[Ov,r.on]]),Q6]))),128))])):at("",!0)]),_:1}))}});var t4=zt(e4,[["__scopeId","data-v-3921517f"]]);const n4=n=>(Qt("data-v-beda78ca"),n=n(),en(),n),i4={key:0,class:"toast"},s4=n4(()=>c("span",null,"\u2713",-1)),r4=It({__name:"ToastMessage",props:{message:null,show:{type:Boolean}},setup(n){return(e,t)=>(H(),gn(Kt,{name:"toast"},{default:qt(()=>[n.show?(H(),q("div",i4,[s4,it(B(n.message),1)])):at("",!0)]),_:1}))}});var o4=zt(r4,[["__scopeId","data-v-beda78ca"]]);async function tg(n={}){const e=await fetch("/api/assistant/state",{...n,headers:{"Content-Type":"application/json",Authorization:`Bearer ${gr()}`,...n.headers||{}}}),t=await e.json().catch(()=>({}));if(!e.ok)throw new Error(t.message||`\u7528\u6237\u5DE5\u4F5C\u53F0\u540C\u6B65\u5931\u8D25\uFF08${e.status}\uFF09`);return t}function a4(){return tg()}function l4(n,e){return tg({method:"PUT",body:JSON.stringify({workbenchesJson:JSON.stringify(n),conversationsJson:JSON.stringify(e)})})}async function ng(n,e="",t){const i=gr(),s=await fetch("/api/assistant/chat",{method:"POST",headers:{"Content-Type":"application/json",...i?{Authorization:`Bearer ${i}`}:{}},signal:t,body:JSON.stringify({messages:n.slice(-12),context:e})}),r=await s.json().catch(()=>({}));if(!s.ok)throw s.status===401&&(Vl(),window.location.replace("/#/sign-in")),new Error(r.message||`\u8BF7\u6C42\u5931\u8D25\uFF08${s.status}\uFF09`);return{reply:r.reply||"\u6682\u65F6\u6CA1\u6709\u83B7\u5F97\u6709\u6548\u56DE\u7B54\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002",model:r.model||"DeepSeek"}}const cs=n=>(Qt("data-v-ede065c6"),n=n(),en(),n),u4={key:0,class:"assistant-panel","aria-label":"\u5C0F\u7530 AI \u519C\u4E1A\u52A9\u624B"},c4=cs(()=>c("div",{class:"assistant-avatar"},[c("span",null,"\u7530"),c("i")],-1)),d4=cs(()=>c("div",null,[c("small",null,"DEEPSEEK \xB7 \u519C\u4E1A\u667A\u80FD\u4F53"),c("h2",null,"\u5C0F\u7530\u52A9\u624B")],-1)),h4=cs(()=>c("span",{class:"online"},[c("i"),it("\u5728\u7EBF")],-1)),f4=cs(()=>c("svg",{viewBox:"0 0 24 24"},[c("path",{d:"M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v5m4-5v5"})],-1)),p4=[f4],m4={class:"context-chip"},g4=cs(()=>c("i",null,null,-1)),_4={key:0,class:"message-avatar"},v4={key:0,class:"assistant progress-reply"},y4=cs(()=>c("span",{class:"message-avatar"},"\u7530",-1)),E4={key:0,class:"quick-questions"},x4=["onClick"],b4=cs(()=>c("span",null,"\u2197",-1)),M4=["disabled"],A4=cs(()=>c("svg",{viewBox:"0 0 24 24"},[c("path",{d:"m4 12 16-8-6 16-2.5-6.5L4 12Zm7.5 1.5L20 4"})],-1)),S4=[A4],w4=cs(()=>c("small",null,"Enter \u53D1\u9001 \xB7 Shift + Enter \u6362\u884C",-1)),T4=["aria-expanded"],C4=It({__name:"FarmAiAssistant",props:{open:{type:Boolean},context:null},emits:["update:open"],setup(n,{emit:e}){const t=n,i=Ce(""),s=Ce(!1),r=Ce(),o=Ce(),a=Ce([{role:"assistant",content:"\u4F60\u597D\uFF0C\u6211\u662F\u5C0F\u7530\u3002\u53EF\u4EE5\u95EE\u6211\u519C\u573A\u8FD0\u884C\u3001\u8BBE\u5907\u72B6\u6001\u3001\u73AF\u5883\u8C03\u63A7\u6216\u4F5C\u7269\u7BA1\u7406\u95EE\u9898\u3002"}]),l=["\u603B\u7ED3\u4ECA\u65E5\u519C\u573A\u72B6\u6001","\u54EA\u4E9B\u8BBE\u5907\u9700\u8981\u5173\u6CE8\uFF1F","\u7ED9\u51FA\u5F53\u524D\u704C\u6E89\u5EFA\u8BAE"],u="/platform/assets/assistant/normal.png",d="/platform/assets/assistant/wave.png";let h;function f(){e("update:open",!t.open)}function p(){e("update:open",!1)}function g(){a.value=[{role:"assistant",content:"\u5BF9\u8BDD\u5DF2\u6E05\u7A7A\u3002\u73B0\u5728\u60F3\u4E86\u89E3\u519C\u573A\u7684\u54EA\u4E00\u90E8\u5206\uFF1F"}]}async function v(){await jn(),r.value&&(r.value.scrollTop=r.value.scrollHeight)}async function _(E){const y=(E||i.value).trim();if(!(!y||s.value)){i.value="",a.value.push({role:"user",content:y}),s.value=!0,await v(),h=new AbortController;try{const x=await ng(a.value,t.context,h.signal);a.value.push({role:"assistant",content:x.reply})}catch(x){x.name!=="AbortError"&&a.value.push({role:"assistant",content:`\u8FDE\u63A5 DeepSeek \u5931\u8D25\uFF1A${x.message}`})}finally{s.value=!1,h=void 0,await v()}}}function m(E){E.key==="Enter"&&!E.shiftKey&&(E.preventDefault(),_())}return _n(()=>t.open,async E=>{var y;E&&(await v(),(y=o.value)==null||y.focus())}),$i(()=>h==null?void 0:h.abort()),(E,y)=>(H(),q("div",{class:$e(["farm-ai",{opened:n.open}])},[tt(Kt,{name:"assistant-panel"},{default:qt(()=>[n.open?(H(),q("section",u4,[c("header",null,[c4,d4,h4,c("button",{class:"clear",title:"\u6E05\u7A7A\u5BF9\u8BDD","aria-label":"\u6E05\u7A7A\u5BF9\u8BDD",onClick:g},p4),c("button",{class:"close","aria-label":"\u5173\u95ED\u52A9\u624B",onClick:p},"\xD7")]),c("div",{ref_key:"listRef",ref:r,class:"messages"},[c("div",m4,[g4,it(B(n.context),1)]),(H(!0),q(He,null,pt(a.value,(x,M)=>(H(),q("article",{key:M,class:$e(x.role)},[x.role==="assistant"?(H(),q("span",_4,"\u7530")):at("",!0),c("p",null,B(x.content),1)],2))),128)),s.value?(H(),q("article",v4,[y4,tt(Ns,{value:null,label:"\u5206\u6790\u5F53\u524D\u573A\u666F","pending-label":"\u751F\u6210\u56DE\u7B54",tone:"dark",compact:""})])):at("",!0)],512),a.value.length<3?(H(),q("div",E4,[(H(),q(He,null,pt(l,x=>c("button",{key:x,onClick:M=>_(x)},[it(B(x),1),b4],8,x4)),64))])):at("",!0),c("footer",null,[ss(c("textarea",{ref_key:"inputRef",ref:o,"onUpdate:modelValue":y[0]||(y[0]=x=>i.value=x),rows:"1",maxlength:"1200",placeholder:"\u95EE\u95EE\u5C0F\u7530\uFF0C\u4F8B\u5982\uFF1A\u4ECA\u5929\u9700\u8981\u704C\u6E89\u5417\uFF1F",onKeydown:m},null,544),[[Ls,i.value]]),c("button",{disabled:!i.value.trim()||s.value,"aria-label":"\u53D1\u9001\u6D88\u606F",onClick:y[1]||(y[1]=x=>_())},S4,8,M4),w4])])):at("",!0)]),_:1}),c("button",{class:"assistant-trigger","aria-expanded":n.open,"aria-label":"\u6253\u5F00\u5C0F\u7530 AI \u52A9\u624B",onClick:f},[c("span",{class:"character-stage"},[c("img",{class:"character normal",src:u,alt:"\u5C0F\u7530\u519C\u4E1A\u52A9\u624B"}),c("img",{class:"character wave",src:d,alt:"\u5C0F\u7530\u6325\u624B\u95EE\u5019"})])],8,T4)],2))}});var D4=zt(C4,[["__scopeId","data-v-ede065c6"]]);const R4=e1("workspace",()=>{const n=Ce("aerial"),e=Ce("overview"),t=Ce("field-04"),i=Ce(!0),s=Ce("soilMoisture"),r=Ce(!1),o=Ce("health"),a=Ce(!1),l=Ce(""),u=Ce(null),d=Qe(()=>Xt.find(g=>g.id===t.value));function h(g){t.value=g,i.value=Boolean(g)}function f(g){e.value=g;const v={overview:"health",monitoring:"all-cameras",environment:"soilMoisture",devices:"all-devices",irrigation:"network",crops:"health",alerts:"all-alerts"};o.value=v[g],g==="alerts"&&h("field-04")}async function p(g=!1){if(!(a.value||u.value&&!g)){a.value=!0,l.value="";try{const v=await p3("farm-01");hE(v),u.value=v.generatedAt}catch(v){throw l.value=v instanceof Error?v.message:"\u6570\u636E\u52A0\u8F7D\u5931\u8D25",v}finally{a.value=!1}}}return{viewMode:n,activeModule:e,selectedEntityId:t,selectedEntity:d,drawerOpen:i,environmentMetric:s,layersOpen:r,activeSubLayer:o,loading:a,loadError:l,lastSyncedAt:u,selectEntity:h,selectModule:f,loadDashboard:p}});const ig=n=>(Qt("data-v-52b148bc"),n=n(),en(),n),F4={key:0,class:"data-loading-card"},P4={class:"scene-name"},L4=ig(()=>c("span",{class:"status-dot"},null,-1)),I4={key:0,class:"notifications"},B4=ig(()=>c("strong",null,"\u6D88\u606F\u901A\u77E5",-1)),U4=It({__name:"FarmWorkspaceView",setup(n){const e=R4(),t=Jc(),i=_a();let s=0;ks(()=>{e.loadDashboard().catch(C=>A(C instanceof Error?C.message:"\u865A\u62DF\u6570\u636E\u52A0\u8F7D\u5931\u8D25")),s=window.setInterval(()=>e.loadDashboard(!0).catch(()=>{}),3e4)}),Ul(()=>window.clearInterval(s));const r=Ce(1),o=Ce(0),a=Ce(0),l=Ce(""),u=Ce(!1),d=Ce(!1),h=Ce(!1),f=Ce(!1),p=Ce(!1),g=Ce(!1),v=Ce(null),_=Ce({zones:!0,devices:!0,cameras:!1,irrigation:!1,alerts:!0}),m=Ce(null);let E=0;const y=Qe(()=>e.viewMode==="aerial"?"\u667A\u6167\u519C\u573A01 \xB7 \u5B9E\u666F\u603B\u89C8":"\u667A\u6167\u519C\u573A01 \xB7 \u6570\u5B57\u5B6A\u751F"),x=Qe(()=>Ni.find(C=>C.entityId===e.selectedEntityId)),M=Qe(()=>{const C={overview:"\u603B\u89C8",monitoring:"\u76D1\u63A7",environment:"\u73AF\u5883",devices:"\u8BBE\u5907",irrigation:"\u704C\u6E89",crops:"\u4F5C\u7269",alerts:"\u544A\u8B66"},J=e.selectedEntity;return`${y.value} \xB7 ${C[e.activeModule]}${J?` \xB7 \u5F53\u524D\u5BF9\u8C61\uFF1A${J.name}\uFF08${J.metric}\uFF09`:""}`});function A(C){l.value=C,u.value=!0,window.clearTimeout(E),E=window.setTimeout(()=>u.value=!1,2200)}function F(){r.value=1,o.value=0,a.value=0,A("\u5DF2\u6062\u590D\u519C\u573A\u5168\u666F\u89C6\u89D2")}function I(C){e.selectEntity(C),r.value=1.18,o.value=C==="field-04"?-35:15,a.value=-12,A("\u5DF2\u805A\u7126\u9009\u4E2D\u5BF9\u8C61")}function b(C){if(g.value&&C){if(!v.value){v.value=C,A("\u5DF2\u9009\u62E9\u8D77\u70B9\uFF0C\u8BF7\u9009\u62E9\u7EC8\u70B9");return}const J=Xt.find(ee=>ee.id===v.value),$=Xt.find(ee=>ee.id===C);if((J==null?void 0:J.position3D)&&($==null?void 0:$.position3D)){const ee=J.position3D.x-$.position3D.x,U=J.position3D.y-$.position3D.y,N=J.position3D.z-$.position3D.z;A(`${J.name} \u81F3 ${$.name}\uFF1A${Math.sqrt(ee*ee+U*U+N*N).toFixed(1)} \u7C73`)}else A("\u6240\u9009\u5BF9\u8C61\u7F3A\u5C11\u7A7A\u95F4\u5750\u6807");g.value=!1,v.value=null;return}if(e.activeModule==="monitoring"&&C&&Ni.some(J=>J.entityId===C)){e.selectedEntityId=C,e.drawerOpen=!1,h.value=!0;return}e.selectEntity(C)}function w(C){const J=C.toLowerCase(),$=Xt.find(ee=>`${ee.name} ${ee.metric} ${ee.type}`.toLowerCase().includes(J));if(!$)return A(`\u672A\u627E\u5230\u201C${C}\u201D`);I($.id)}function oe(){g.value=!0,v.value=null,e.drawerOpen=!1,A("\u6D4B\u8DDD\u6A21\u5F0F\uFF1A\u8BF7\u9009\u62E9\u4E24\u4E2A\u5730\u56FE\u5BF9\u8C61")}function X(){d.value=!1,z("alerts")}function z(C){const J={overview:"\u603B\u89C8",monitoring:"\u76D1\u63A7",environment:"\u73AF\u5883",devices:"\u8BBE\u5907",irrigation:"\u704C\u6E89",crops:"\u4F5C\u7269",alerts:"\u544A\u8B66"};h.value=!1,e.selectModule(C),C==="monitoring"?(e.selectedEntityId=null,e.drawerOpen=!1):C==="environment"?(e.selectedEntityId=null,e.drawerOpen=!0):C==="devices"?e.selectEntity("fertilizer-01"):C==="irrigation"?e.selectEntity("water-01"):C==="crops"?e.selectEntity("gh-01"):e.drawerOpen=!0,A(`\u5DF2\u8FDB\u5165\u201C${J[C]}\u201D\u4E1A\u52A1\u4E2D\u5FC3`)}function T(){var C;e.drawerOpen=!1,(C=m.value)==null||C.resumeAfterOverlay()}function G(){var C;h.value=!1,(C=m.value)==null||C.resumeAfterOverlay()}function re(C){i.push(`/workspaces/${String(t.params.id||"farm-01")}/greenhouses/${C}`)}function ae(C){var J;p.value=C,C||(J=m.value)==null||J.resumeAfterOverlay()}return(C,J)=>(H(),q("main",{class:$e(["workspace",{"drawer-open":K(e).drawerOpen}])},[tt(Kt,{name:"scene",mode:"out-in"},{default:qt(()=>[K(e).viewMode==="aerial"?(H(),gn(Mx,{key:"aerial","selected-id":K(e).selectedEntityId,"active-module":K(e).activeModule,"active-sub-layer":K(e).activeSubLayer,scale:r.value,"offset-x":o.value,"offset-y":a.value,layers:_.value,onSelect:b,onFocus:I},null,8,["selected-id","active-module","active-sub-layer","scale","offset-x","offset-y","layers"])):(H(),gn(IT,{ref_key:"threeScene",ref:m,key:"three","active-module":K(e).activeModule,"active-sub-layer":K(e).activeSubLayer,"selected-id":K(e).selectedEntityId,"drawer-open":K(e).drawerOpen,"overlay-open":K(e).drawerOpen||h.value||p.value,onSelect:b,onModule:z,onWalk:J[0]||(J[0]=$=>f.value=$),onEnterGreenhouse:re},null,8,["active-module","active-sub-layer","selected-id","drawer-open","overlay-open"]))]),_:1}),tt(Kt,{name:"data-loading"},{default:qt(()=>[K(e).loading&&!K(e).lastSyncedAt?(H(),q("div",F4,[tt(Ns,{value:null,label:"\u540C\u6B65\u667A\u6167\u519C\u573A\u6570\u636E","pending-label":"\u8FDE\u63A5\u6570\u636E\u4E2D\u5FC3"})])):at("",!0)]),_:1}),tt(dE,{"notification-count":K(yt).openAlerts,onSearch:w,onNotify:J[1]||(J[1]=$=>d.value=!d.value)},null,8,["notification-count"]),tt(xE,{class:$e({"detail-mode-hidden":K(e).drawerOpen}),onDetail:J[2]||(J[2]=$=>z("environment"))},null,8,["class"]),c("div",P4,[L4,it(B(K(y)),1)]),tt(UT,{modelValue:K(e).viewMode,"onUpdate:modelValue":J[3]||(J[3]=$=>K(e).viewMode=$),"drawer-open":K(e).drawerOpen},null,8,["modelValue","drawer-open"]),tt(e3,{class:$e({"drawer-closed":!K(e).drawerOpen}),onZoomIn:J[4]||(J[4]=$=>r.value=Math.min(1.4,r.value+.1)),onZoomOut:J[5]||(J[5]=$=>r.value=Math.max(.85,r.value-.1)),onReset:F,onLayers:J[6]||(J[6]=$=>K(e).layersOpen=!K(e).layersOpen),onMeasure:oe},null,8,["class"]),tt(t4,{open:K(e).layersOpen,onChange:J[7]||(J[7]=($,ee)=>_.value[$]=ee)},null,8,["open"]),tt(Kt,{name:"notice-panel"},{default:qt(()=>[d.value?(H(),q("aside",I4,[c("header",null,[B4,c("button",{onClick:J[8]||(J[8]=$=>d.value=!1)},"\xD7")]),(H(!0),q(He,null,pt(K(Ln).slice(0,3),$=>(H(),q("article",{key:$.id||$.time},[c("i",{class:$e({warning:$.status!=="\u5DF2\u5904\u7406"&&$.status!=="\u5DF2\u6062\u590D"})},"\u25B3",2),c("div",null,[c("b",null,B($.title),1),c("small",null,B($.time)+" \xB7 "+B($.status),1)])]))),128)),c("button",{class:"all",onClick:X},"\u67E5\u770B\u5168\u90E8\u6D88\u606F")])):at("",!0)]),_:1}),tt(l6,{entity:K(e).selectedEntity,open:K(e).drawerOpen,module:K(e).activeModule,onClose:T,onSelect:b,onAction:J[9]||(J[9]=$=>A($)),onEnterGreenhouse:re},null,8,["entity","open","module"]),tt(f3,{active:K(e).activeModule,"show-shortcuts":f.value,onChange:z},null,8,["active","show-shortcuts"]),tt(K6,{open:h.value,entity:K(e).selectedEntity,zone:K(x),onClose:G,onAction:J[10]||(J[10]=$=>A($))},null,8,["open","entity","zone"]),tt(D4,{open:p.value,context:K(M),"onUpdate:open":ae},null,8,["open","context"]),tt(o4,{show:u.value,message:l.value},null,8,["show","message"])],2))}});var Tp=zt(U4,[["__scopeId","data-v-52b148bc"]]);const wn=n=>(Qt("data-v-82850ef2"),n=n(),en(),n),N4={viewBox:"0 0 24 24","aria-hidden":"true"},O4=wn(()=>c("path",{d:"M12 3c3.4 4.5 5.3 7 5.3 10.1a5.3 5.3 0 1 1-10.6 0C6.7 10 8.6 7.5 12 3Z"},null,-1)),k4=wn(()=>c("path",{d:"M9.5 15.2c.6.9 1.4 1.3 2.5 1.3"},null,-1)),z4=wn(()=>c("path",{d:"M4 18V6M4 18h16"},null,-1)),H4=wn(()=>c("path",{d:"m7 14 3-4 3 2 5-6"},null,-1)),$4=wn(()=>c("path",{d:"m15 6h3v3"},null,-1)),V4={key:2,d:"M4 19V9M10 19V5M16 19v-7M22 19V8"},G4=wn(()=>c("path",{d:"M12 3a3 3 0 0 0-3 3v7.2a4.5 4.5 0 1 0 6 0V6a3 3 0 0 0-3-3Z"},null,-1)),W4=wn(()=>c("path",{d:"M12 8v7"},null,-1)),X4=wn(()=>c("path",{d:"M9 4h6l.6 2.1 1.7 1 2.1-.6 2 3.5-1.6 1.6v1.8l1.6 1.6-2 3.5-2.1-.6-1.7 1L15 20H9l-.6-2.1-1.7-1-2.1.6-2-3.5 1.6-1.6v-1.8L2.6 10l2-3.5 2.1.6 1.7-1L9 4Z"},null,-1)),j4=wn(()=>c("circle",{cx:"12",cy:"12",r:"3"},null,-1)),q4=wn(()=>c("path",{d:"M12 3 2.8 20h18.4L12 3Z"},null,-1)),K4=wn(()=>c("path",{d:"M12 9v5M12 17h.01"},null,-1)),Y4={key:6,d:"M3 20V9l9-6 9 6v11M3 9h18M8 20V9M16 20V9M3 15h18"},J4=wn(()=>c("rect",{x:"5",y:"3",width:"14",height:"18",rx:"2"},null,-1)),Z4=wn(()=>c("path",{d:"M9 8h6M9 12h6M9 16h4"},null,-1)),Q4=wn(()=>c("path",{d:"m6.5 12 .8.8 1.6-1.7"},null,-1)),eD=wn(()=>c("path",{d:"M12 3a6 6 0 0 0-3.8 10.6c.8.7 1.3 1.5 1.4 2.4h4.8c.1-.9.6-1.7 1.4-2.4A6 6 0 0 0 12 3Z"},null,-1)),tD=wn(()=>c("path",{d:"M9.5 19h5M10.5 22h3"},null,-1)),nD=wn(()=>c("path",{d:"M12 7v5M9.5 9.5h5"},null,-1)),iD=It({__name:"WorkbenchWidgetIcon",props:{type:null},setup(n){return(e,t)=>(H(),q("span",{class:$e(["widget-icon",`icon-${n.type}`])},[(H(),q("svg",N4,[n.type==="irrigation"||n.type==="irrigation-schedule"?(H(),q(He,{key:0},[O4,k4],64)):n.type==="trend"?(H(),q(He,{key:1},[z4,H4,$4],64)):n.type==="metric"||n.type==="summary"?(H(),q("path",V4)):n.type==="environment"?(H(),q(He,{key:3},[G4,W4],64)):n.type==="devices"?(H(),q(He,{key:4},[X4,j4],64)):n.type==="alerts"?(H(),q(He,{key:5},[q4,K4],64)):n.type==="greenhouse"?(H(),q("path",Y4)):n.type==="crop-tasks"?(H(),q(He,{key:7},[J4,Z4,Q4],64)):(H(),q(He,{key:8},[eD,tD,nD],64))]))],2))}});var li=zt(iD,[["__scopeId","data-v-82850ef2"]]);const st=n=>(Qt("data-v-ea4d5d80"),n=n(),en(),n),sD={class:"workbench-head"},rD=st(()=>c("span",{class:"daisy-badge daisy-badge-success daisy-badge-outline"},"\u4E2A\u6027\u5316\u5DE5\u4F5C\u53F0",-1)),oD=["onKeydown"],aD={key:1},lD={class:"head-actions"},uD={key:1,class:"daisy-dropdown daisy-dropdown-end"},cD=st(()=>c("button",{tabindex:"0",class:"daisy-btn daisy-btn-sm daisy-btn-ghost"},"\u7BA1\u7406 \u25BE",-1)),dD={tabindex:"0",class:"daisy-dropdown-content daisy-menu management-menu"},hD=["draggable","onDragstart","onDrop","onClick"],fD={key:0,class:"widget-editor-actions"},pD=["value","onChange"],mD=st(()=>c("option",{value:"small"},"\u5C0F",-1)),gD=st(()=>c("option",{value:"medium"},"\u4E2D",-1)),_D=st(()=>c("option",{value:"wide"},"\u901A\u680F",-1)),vD=[mD,gD,_D],yD=["onClick"],ED={class:"widget-title"},xD=st(()=>c("small",null,"\u4F8B\u884C\u5DE1\u68C0",-1)),bD=st(()=>c("span",{class:"sync-badge"},[c("i"),it("\u5B9E\u65F6\u540C\u6B65")],-1)),MD={class:"irrigation-table"},AD=st(()=>c("small",null,"\u571F\u58E4\u6E7F\u5EA6",-1)),SD=["value"],wD=st(()=>c("small",null,"\u6301\u7EED\u65F6\u95F4",-1)),TD=st(()=>c("small",null,"\u5B9E\u65F6\u6D41\u91CF",-1)),CD={class:"widget-title"},DD=st(()=>c("small",null,"\u667A\u6167\u519C\u573A01",-1)),RD={class:"summary-layout"},FD=st(()=>c("small",null,"\u7EFC\u5408\u5065\u5EB7",-1)),PD={class:"daisy-stats summary-stats"},LD={class:"daisy-stat"},ID=st(()=>c("div",{class:"daisy-stat-title"},"\u5065\u5EB7\u5EA6",-1)),BD={class:"daisy-stat-value"},UD=st(()=>c("div",{class:"daisy-stat-desc"},"\u8FD0\u884C\u72B6\u6001\u826F\u597D",-1)),ND={class:"daisy-stat"},OD=st(()=>c("div",{class:"daisy-stat-title"},"\u5728\u7EBF\u8BBE\u5907",-1)),kD={class:"daisy-stat-value small-value"},zD={class:"daisy-stat-desc"},HD={class:"daisy-stat"},$D=st(()=>c("div",{class:"daisy-stat-title"},"\u4ECA\u65E5\u7528\u6C34",-1)),VD={class:"daisy-stat-value small-value"},GD=st(()=>c("div",{class:"daisy-stat-desc"},"\u7ACB\u65B9\u7C73",-1)),WD={class:"widget-title"},XD=st(()=>c("small",null,"\u5B9E\u65F6\u4F20\u611F\u5668",-1)),jD={class:"metric-cards"},qD={class:"widget-title"},KD=st(()=>c("small",null,"\u7269\u8054\u7F51\u8BBE\u5907",-1)),YD={class:"status-pill warning"},JD={class:"device-list"},ZD=["disabled","onClick"],QD=st(()=>c("b",null,null,-1)),eR=[QD],tR={class:"widget-title"},nR=st(()=>c("small",null,"\u98CE\u9669\u4E2D\u5FC3",-1)),iR={class:"status-pill warning"},sR={class:"alert-list"},rR=st(()=>c("span",null,"!",-1)),oR=["disabled","onClick"],aR={class:"widget-title"},lR=st(()=>c("small",null,"\u91CD\u70B9\u5173\u6CE8",-1)),uR={class:"daisy-badge daisy-badge-success daisy-badge-outline"},cR={class:"widget-title atomic-title"},dR=st(()=>c("span",{class:"live-dot"},"\u5B9E\u65F6",-1)),hR={class:"single-metric"},fR={class:"metric-value"},pR={viewBox:"0 0 264 58",preserveAspectRatio:"none"},mR=["id"],gR=st(()=>c("stop",{offset:"0","stop-color":"#4b9a61","stop-opacity":".22"},null,-1)),_R=st(()=>c("stop",{offset:"1","stop-color":"#4b9a61","stop-opacity":"0"},null,-1)),vR=[gR,_R],yR=["fill","points"],ER=["points"],xR=["value"],bR={class:"widget-title"},MR={class:"trend-current"},AR={class:"atomic-trend"},SR={viewBox:"0 0 264 92",preserveAspectRatio:"none"},wR=st(()=>c("path",{d:"M0 22H264M0 46H264M0 70H264"},null,-1)),TR=["points"],CR=st(()=>c("footer",null,[c("span",null,"00:00"),c("span",null,"06:00"),c("span",null,"12:00"),c("span",null,"\u73B0\u5728")],-1)),DR={class:"widget-title"},RR=st(()=>c("small",null,"\u81EA\u52A8\u704C\u6E89",-1)),FR=st(()=>c("span",{class:"status-pill info"},"3/6 \u5DF2\u5B8C\u6210",-1)),PR={class:"schedule-list"},LR=["disabled","onClick"],IR={class:"widget-title"},BR=st(()=>c("small",null,"\u751F\u4EA7\u8BA1\u5212",-1)),UR=st(()=>c("span",{class:"status-pill"},"4 \u9879\u4EFB\u52A1",-1)),NR={class:"task-list"},OR=["checked"],kR={class:"widget-title"},zR=st(()=>c("small",null,"\u57FA\u4E8E\u5F53\u524D\u5DE5\u4F5C\u53F0",-1)),HR=st(()=>c("span",{class:"ai-chip"},"\u2726 AI \u5206\u6790",-1)),$R=st(()=>c("div",{class:"insight-card"},[c("strong",null,"\u5F53\u524D\u704C\u6E89\u8282\u594F\u6574\u4F53\u5408\u7406"),c("p",null,"02\u53F7\u68DA\u571F\u58E4\u6E7F\u5EA6\u4E0B\u964D\u901F\u5EA6\u9AD8\u4E8E\u5176\u4ED6\u5927\u68DA\uFF0C\u5EFA\u8BAE\u5C06\u4E0B\u4E00\u8F6E\u704C\u6E89\u63D0\u524D\u7EA6 20 \u5206\u949F\uFF1B\u84C4\u6C34\u6C60\u6C34\u4F4D\u8DB3\u4EE5\u8986\u76D6\u4ECA\u65E5\u5269\u4F59\u8BA1\u5212\u3002"),c("div",null,[c("span",null,"\u98CE\u9669\u7F6E\u4FE1\u5EA6 86%"),c("button",{class:"daisy-btn daisy-btn-xs daisy-btn-success daisy-btn-outline"},"\u751F\u6210\u8C03\u6574\u65B9\u6848")])],-1)),VR=st(()=>c("span",null,"\uFF0B",-1)),GR=st(()=>c("strong",null,"\u8FD9\u662F\u4E00\u4E2A\u7A7A\u767D\u5DE5\u4F5C\u53F0",-1)),WR=st(()=>c("small",null,"\u4ECE DaisyUI \u519C\u4E1A\u7EC4\u4EF6\u5E93\u6DFB\u52A0\u7B2C\u4E00\u5F20\u5361\u7247",-1)),XR=[VR,GR,WR],jR=["onPointerdown"],qR=st(()=>c("small",null,"\u7EC4\u4EF6\u5C5E\u6027 \xB7 \u62D6\u52A8\u8C03\u6574\u4F4D\u7F6E",-1)),KR=st(()=>c("span",null,"\u6807\u9898",-1)),YR=["value"],JR=st(()=>c("span",null,"\u5361\u7247\u5C3A\u5BF8",-1)),ZR=["value"],QR=st(()=>c("option",{value:"small"},"\u5C0F\u5361\u7247",-1)),eF=st(()=>c("option",{value:"medium"},"\u4E2D\u5361\u7247",-1)),tF=st(()=>c("option",{value:"wide"},"\u901A\u680F\u5361\u7247",-1)),nF=[QR,eF,tF],iF=st(()=>c("span",null,"\u5237\u65B0\u9891\u7387",-1)),sF=["value"],rF=st(()=>c("option",{value:15},"15 \u79D2",-1)),oF=st(()=>c("option",{value:30},"30 \u79D2",-1)),aF=st(()=>c("option",{value:60},"1 \u5206\u949F",-1)),lF=st(()=>c("option",{value:300},"5 \u5206\u949F",-1)),uF=[rF,oF,aF,lF],cF={key:0},dF=st(()=>c("span",null,"\u7ED1\u5B9A\u6307\u6807",-1)),hF=["value"],fF=["value"],pF=st(()=>c("span",null,"\u5185\u5BB9\u5BC6\u5EA6",-1)),mF=["value"],gF=st(()=>c("option",{value:"comfortable"},"\u8212\u9002",-1)),_F=st(()=>c("option",{value:"compact"},"\u7D27\u51D1",-1)),vF=[gF,_F],yF={key:1},EF=st(()=>c("span",null,"\u9884\u8B66\u9608\u503C",-1)),xF=["value"],bF=st(()=>c("legend",null,"\u5F3A\u8C03\u8272",-1)),MF={class:"accent-options"},AF=["onClick"],SF={key:2},wF=st(()=>c("legend",null,"\u663E\u793A\u5927\u68DA",-1)),TF={class:"entity-options"},CF=["checked","onChange"],DF=st(()=>c("p",null,"\u62D6\u52A8\u767D\u677F\u4E2D\u7684\u5361\u7247\u53EF\u4EE5\u8C03\u6574\u987A\u5E8F\uFF0C\u4FEE\u6539\u4F1A\u81EA\u52A8\u4FDD\u5B58\u3002",-1)),RF=["checked"],FF={class:"daisy-drawer-side library-panel"},PF=st(()=>c("div",null,[c("small",null,"DaisyUI \u7EC4\u4EF6\u5E93"),c("h3",null,"\u6DFB\u52A0\u519C\u4E1A\u7EC4\u4EF6")],-1)),LF=st(()=>c("p",null,"\u9009\u62E9\u7EC4\u4EF6\u540E\u52A0\u5165\u5F53\u524D\u767D\u677F\uFF0C\u53EF\u7EE7\u7EED\u8C03\u6574\u5C3A\u5BF8\u548C\u5185\u5BB9\u3002",-1)),IF={class:"library-grid"},BF=["onClick"],UF=st(()=>c("em",null,[it("\u6DFB\u52A0\u5230\u753B\u5E03 "),c("b",null,"\uFF0B")],-1)),NF=It({__name:"PersonalizedWorkbench",props:{workbench:null,initialLibraryOpen:{type:Boolean}},emits:["add","remove","update","rename","move","duplicate","delete","clear","toggle-pin"],setup(n,{emit:e}){const t=n,i=Ce(!1),s=Ce(Boolean(t.initialLibraryOpen)),r=Ce(null),o=Ce(t.workbench.name),a=Qe(()=>t.workbench.widgets.find($=>$.id===r.value)),l=Ce(null),u=Ce(new Set),d=Ce(null),h=Ce(null);let f={x:0,y:0};const p=Qe(()=>h.value?{left:`${h.value.x}px`,top:`${h.value.y}px`,right:"auto",bottom:"auto"}:void 0),g=[{type:"summary",name:"\u519C\u573A\u603B\u89C8",description:"\u5065\u5EB7\u5EA6\u3001\u8BBE\u5907\u4E0E\u4ECA\u65E5\u7528\u6C34",icon:"\u89C8"},{type:"irrigation",name:"\u5927\u68DA\u704C\u6E89",description:"01\u201406\u53F7\u5927\u68DA\u6A2A\u5411\u5DE1\u68C0",icon:"\u6C34"},{type:"environment",name:"\u73AF\u5883\u6307\u6807",description:"\u6E29\u6E7F\u5EA6\u3001\u5149\u7167\u4E0E CO\u2082",icon:"\u73AF"},{type:"devices",name:"\u8BBE\u5907\u72B6\u6001",description:"\u5728\u7EBF\u7387\u4E0E\u8FD0\u884C\u8BBE\u5907",icon:"\u8BBE"},{type:"alerts",name:"\u544A\u8B66\u5217\u8868",description:"\u96C6\u4E2D\u663E\u793A\u5F85\u5904\u7406\u98CE\u9669",icon:"\u8B66"},{type:"greenhouse",name:"\u5355\u68DA\u5361\u7247",description:"\u5173\u6CE8\u4E00\u4E2A\u6307\u5B9A\u5927\u68DA",icon:"\u68DA"},{type:"metric",name:"\u5355\u6307\u6807",description:"\u81EA\u7531\u9009\u62E9\u4E00\u4E2A\u6838\u5FC3\u6307\u6807",icon:"\u6570"},{type:"trend",name:"\u6307\u6807\u8D8B\u52BF",description:"\u5355\u6307\u6807 24 \u5C0F\u65F6\u8D8B\u52BF",icon:"\u8D8B"},{type:"irrigation-schedule",name:"\u704C\u6E89\u8BA1\u5212",description:"\u4ECA\u65E5\u4EFB\u52A1\u3001\u65F6\u95F4\u548C\u8FDB\u5EA6",icon:"\u8BA1"},{type:"crop-tasks",name:"\u519C\u4E8B\u4EFB\u52A1",description:"\u5206\u68DA\u5C55\u793A\u5F85\u529E\u4E8B\u9879",icon:"\u4E8B"},{type:"ai-insight",name:"AI \u6D1E\u5BDF",description:"\u98CE\u9669\u5F52\u56E0\u548C\u884C\u52A8\u5EFA\u8BAE",icon:"\u667A"}],v=[{key:"health",label:"\u519C\u573A\u5065\u5EB7\u5EA6"},{key:"onlineDevices",label:"\u5728\u7EBF\u8BBE\u5907"},{key:"waterLevel",label:"\u84C4\u6C34\u6C60\u6C34\u4F4D"},{key:"todayWaterUsage",label:"\u4ECA\u65E5\u7528\u6C34"},{key:"temperature",label:"\u7A7A\u6C14\u6E29\u5EA6"},{key:"humidity",label:"\u7A7A\u6C14\u6E7F\u5EA6"},{key:"soilMoisture",label:"\u571F\u58E4\u6E7F\u5EA6"},{key:"light",label:"\u5149\u7167\u5F3A\u5EA6"},{key:"co2",label:"CO\u2082"}],_={health:[86,87,88,89,91,90,92,92,91,92,93,92],onlineDevices:[25,26,26,27,27,27,26,27,27,27,27,27],waterLevel:[91,90,89,88,87,86,85,84,84,83,82,82],todayWaterUsage:[2,5,8,11,14,18,21,25,29,32,35,38],temperature:[22,22,23,24,26,27,28,29,29,28,28,28],humidity:[68,66,64,62,60,58,57,55,54,55,56,56],soilMoisture:[51,49,48,46,45,44,42,41,44,43,42,42],light:[120,180,300,440,580,680,720,690,560,390,240,130],co2:[640,630,620,610,600,590,580,570,575,580,580,580]};function m($="health"){const ee={temperature:0,humidity:1,soilMoisture:2,light:3,co2:4};if($ in ee){const N=Os[ee[$]||0],le=Number.parseFloat(N.value),Y={temperature:le/40*100,humidity:le,soilMoisture:le,light:le/1e3*100,co2:le/1e3*100};return{label:N.label,value:N.value,delta:N.delta||"\u7A33\u5B9A",progress:Y[$]||le}}const U={health:{label:"\u519C\u573A\u5065\u5EB7\u5EA6",value:`${yt.health} \u5206`,delta:"+2 \u5206",progress:yt.health},onlineDevices:{label:"\u5728\u7EBF\u8BBE\u5907",value:`${yt.onlineDevices}/${yt.totalDevices}`,delta:"\u5728\u7EBF\u7387 96%",progress:yt.onlineDevices/yt.totalDevices*100},waterLevel:{label:"\u84C4\u6C34\u6C60\u6C34\u4F4D",value:`${yt.waterLevel}%`,delta:"-3% \u4ECA\u65E5",progress:yt.waterLevel},todayWaterUsage:{label:"\u4ECA\u65E5\u7528\u6C34",value:`${yt.todayWaterUsage} m\xB3`,delta:"\u8F83\u6628\u65E5 -6.4%",progress:64}};return U[$]||U.health}function E($){const ee=_[$.metricKey||"soilMoisture"],U=Math.min(...ee),N=Math.max(...ee),le=Math.max(1,N-U);return ee.map((Y,ce)=>`${ce*24},${82-(Y-U)/le*62}`).join(" ")}function y($){const ee=_[$.metricKey||"health"],U=Math.min(...ee),N=Math.max(...ee),le=Math.max(1,N-U);return ee.map((Y,ce)=>`${ce*24},${52-(Y-U)/le*38}`).join(" ")}function x($){return $.entityIds.map((ee,U)=>{const N=Xt.find(Y=>Y.id===ee),le=(N==null?void 0:N.status)==="normal"&&U%3!==1;return{id:ee,name:`${Number(ee.slice(-2))}\u53F7\u5927\u68DA`,running:le,moisture:N!=null&&N.health?Math.round(N.health*.62):58,duration:le?`${12+U*2} min`:"\u5F85\u673A",flow:le?`${(2.8+U*.4).toFixed(1)} m\xB3/h`:"0 m\xB3/h"}})}function M($){e("add",$),s.value=!1}function A(){e("rename",o.value),i.value=!1}function F($){return`widget-${$}`}function I($,ee){!i.value||(l.value=$,ee.dataTransfer&&(ee.dataTransfer.effectAllowed="move"))}function b($){l.value&&e("move",l.value,$),l.value=null}function w($,ee){if(!a.value)return;const U=new Set(a.value.entityIds);ee?U.add($):U.delete($),e("update",a.value.id,{entityIds:[...U]})}function oe($){a.value&&e("update",a.value.id,$)}function X($){if($.button!==0||$.target.closest("button, input, select"))return;const ee=d.value;if(!ee)return;const U=ee.getBoundingClientRect();h.value={x:U.left,y:U.top},f={x:$.clientX-U.left,y:$.clientY-U.top},document.body.classList.add("property-panel-dragging"),window.addEventListener("pointermove",z),window.addEventListener("pointerup",T,{once:!0}),window.addEventListener("pointercancel",T,{once:!0}),$.preventDefault()}function z($){const ee=d.value;if(!ee)return;const U=10,N=Math.max(U,window.innerWidth-ee.offsetWidth-U),le=Math.max(U,window.innerHeight-ee.offsetHeight-U);h.value={x:Math.min(N,Math.max(U,$.clientX-f.x)),y:Math.min(le,Math.max(U,$.clientY-f.y))}}function T(){document.body.classList.remove("property-panel-dragging"),window.removeEventListener("pointermove",z),window.removeEventListener("pointerup",T),window.removeEventListener("pointercancel",T)}function G(){const $=new Blob([JSON.stringify(t.workbench,null,2)],{type:"application/json;charset=utf-8"}),ee=URL.createObjectURL($),U=document.createElement("a");U.href=ee,U.download=`${t.workbench.name}.workbench.json`,U.click(),URL.revokeObjectURL(ee)}function re($,ee){if(ee==="delete"){e("delete");return}!window.confirm($)||e("clear")}async function ae($,ee){u.value.add($);try{const U=await Z0($,ee),N=An.find(le=>le.entityId===$);N&&Object.assign(N,U)}finally{u.value.delete($)}}async function C($,ee){u.value.add($);try{const U=$n.find(le=>le.id===$),N=await Cc($,ee,(U==null?void 0:U.durationMinutes)||15);U&&Object.assign(U,N)}finally{u.value.delete($)}}async function J($){if(!!$){u.value.add(`alert-${$}`);try{const ee=await Q0($),U=Ln.find(N=>N.id===$);U&&Object.assign(U,ee)}finally{u.value.delete(`alert-${$}`)}}}return _n(()=>t.workbench.id,()=>{o.value=t.workbench.name,r.value=null}),$i(T),($,ee)=>(H(),q("section",{class:$e(["personal-workbench",{editing:i.value}])},[c("header",sD,[c("div",null,[rD,i.value?ss((H(),q("input",{key:0,"onUpdate:modelValue":ee[0]||(ee[0]=U=>o.value=U),class:"daisy-input daisy-input-bordered daisy-input-sm title-input",maxlength:"18",onKeydown:Vv(A,["enter"])},null,40,oD)),[[Ls,o.value]]):(H(),q("h2",aD,B(n.workbench.name),1)),c("small",null,B(n.workbench.widgets.length)+" \u4E2A\u7EC4\u4EF6 \xB7 \u6570\u636E\u5B9E\u65F6\u540C\u6B65",1)]),c("div",lD,[i.value?(H(),q("button",{key:0,class:"daisy-btn daisy-btn-sm daisy-btn-ghost",onClick:ee[1]||(ee[1]=U=>s.value=!0)},"\uFF0B \u6DFB\u52A0\u7EC4\u4EF6")):at("",!0),i.value?(H(),q("div",uD,[cD,c("ul",dD,[c("li",null,[c("button",{onClick:ee[2]||(ee[2]=U=>e("toggle-pin"))},B(n.workbench.pinned?"\u4ECE Dock \u53D6\u6D88\u56FA\u5B9A":"\u56FA\u5B9A\u5230 Dock"),1)]),c("li",null,[c("button",{onClick:ee[3]||(ee[3]=U=>e("duplicate"))},"\u521B\u5EFA\u5DE5\u4F5C\u53F0\u526F\u672C")]),c("li",null,[c("button",{onClick:G},"\u5BFC\u51FA JSON")]),c("li",null,[c("button",{onClick:ee[4]||(ee[4]=U=>re("\u786E\u5B9A\u6E05\u7A7A\u5F53\u524D\u5DE5\u4F5C\u53F0\u7684\u5168\u90E8\u7EC4\u4EF6\u5417\uFF1F","clear"))},"\u6E05\u7A7A\u7EC4\u4EF6")]),c("li",null,[c("button",{class:"danger",onClick:ee[5]||(ee[5]=U=>re("\u786E\u5B9A\u5220\u9664\u5F53\u524D\u5DE5\u4F5C\u53F0\u5417\uFF1F\u6B64\u64CD\u4F5C\u65E0\u6CD5\u64A4\u9500\u3002","delete"))},"\u5220\u9664\u5DE5\u4F5C\u53F0")])])])):at("",!0),c("button",{class:$e(["daisy-btn daisy-btn-sm",i.value?"daisy-btn-success":"daisy-btn-ghost"]),onClick:ee[6]||(ee[6]=U=>i.value?A():i.value=!0)},B(i.value?"\u5B8C\u6210":"\u7F16\u8F91\u5DE5\u4F5C\u53F0"),3)])]),n.workbench.widgets.length?(H(),gn(Pv,{key:0,name:"widget",tag:"div",class:"widget-grid"},{default:qt(()=>[(H(!0),q(He,null,pt(n.workbench.widgets,U=>(H(),q("article",{key:U.id,class:$e(["daisy-card widget-card",[F(U.size),`widget-type-${U.type}`,`accent-${U.accent||"green"}`,`density-${U.density||"comfortable"}`,{selected:r.value===U.id,dragging:l.value===U.id}]]),draggable:i.value,onDragstart:N=>I(U.id,N),onDragover:ee[7]||(ee[7]=nn(()=>{},["prevent"])),onDrop:nn(N=>b(U.id),["prevent"]),onDragend:ee[8]||(ee[8]=N=>l.value=null),onClick:N=>i.value&&(r.value=U.id)},[i.value?(H(),q("div",fD,[c("select",{value:U.size,class:"daisy-select daisy-select-bordered daisy-select-xs",onChange:N=>e("update",U.id,{size:N.target.value})},vD,40,pD),c("button",{class:"daisy-btn daisy-btn-xs daisy-btn-circle daisy-btn-error daisy-btn-outline",onClick:nn(N=>e("remove",U.id),["stop"])},"\xD7",8,yD)])):at("",!0),U.type==="irrigation"?(H(),q(He,{key:1},[c("header",ED,[c("div",null,[tt(li,{type:"irrigation"}),c("div",null,[xD,c("h3",null,B(U.title),1)])]),bD]),c("div",MD,[(H(!0),q(He,null,pt(x(U),N=>(H(),q("div",{key:N.id,class:"irrigation-row"},[c("strong",null,B(N.name),1),c("span",{class:$e(["daisy-badge",N.running?"daisy-badge-success":"daisy-badge-ghost"])},B(N.running?"\u704C\u6E89\u4E2D":"\u5F85\u673A"),3),c("div",null,[AD,c("b",null,B(N.moisture)+"%",1),c("progress",{class:"daisy-progress daisy-progress-success",value:N.moisture,max:"100"},null,8,SD)]),c("div",null,[wD,c("b",null,B(N.duration),1)]),c("div",null,[TD,c("b",null,B(N.flow),1)])]))),128))])],64)):U.type==="summary"?(H(),q(He,{key:2},[c("header",CD,[c("div",null,[tt(li,{type:"summary"}),c("div",null,[DD,c("h3",null,B(U.title),1)])])]),c("div",RD,[c("div",{class:"health-donut",style:Gn(`--health:${K(yt).health*3.6}deg`)},[c("span",null,[c("strong",null,B(K(yt).health),1),FD])],4),c("div",PD,[c("div",LD,[ID,c("div",BD,B(K(yt).health),1),UD]),c("div",ND,[OD,c("div",kD,B(K(yt).onlineDevices)+"/"+B(K(yt).totalDevices),1),c("div",zD,B(K(yt).runningDevices)+" \u53F0\u8FD0\u884C\u4E2D",1)]),c("div",HD,[$D,c("div",VD,B(K(yt).todayWaterUsage),1),GD])])])],64)):U.type==="environment"?(H(),q(He,{key:3},[c("header",WD,[c("div",null,[tt(li,{type:"environment"}),c("div",null,[XD,c("h3",null,B(U.title),1)])])]),c("div",jD,[(H(!0),q(He,null,pt(K(Os),N=>(H(),q("div",{key:N.label,class:"daisy-stat"},[c("span",null,B(N.label),1),c("strong",null,B(N.value),1),c("small",null,B(N.delta),1)]))),128))])],64)):U.type==="devices"?(H(),q(He,{key:4},[c("header",qD,[c("div",null,[tt(li,{type:"devices"}),c("div",null,[KD,c("h3",null,B(U.title),1)])]),c("span",YD,B(K(An).filter(N=>!N.online).length)+" \u53F0\u79BB\u7EBF",1)]),c("div",JD,[(H(!0),q(He,null,pt(K(An).slice(0,5),N=>(H(),q("div",{key:N.id},[c("i",{class:$e({online:N.online})},null,2),c("span",null,[c("strong",null,B(N.name),1),c("small",null,B(N.location)+" \xB7 "+B(N.value),1)]),c("button",{class:$e(["device-switch",{on:N.enabled}]),disabled:!N.online||u.value.has(N.entityId),onClick:nn(le=>ae(N.entityId,!N.enabled),["stop"])},eR,10,ZD)]))),128))])],64)):U.type==="alerts"?(H(),q(He,{key:5},[c("header",tR,[c("div",null,[tt(li,{type:"alerts"}),c("div",null,[nR,c("h3",null,B(U.title),1)])]),c("span",iR,B(K(Ln).filter(N=>N.status!=="\u5DF2\u6062\u590D").length)+" \u9879\u5F85\u529E",1)]),c("div",sR,[(H(!0),q(He,null,pt(K(Ln),N=>(H(),q("div",{key:`${N.time}-${N.title}`,class:$e(["daisy-alert",N.status==="\u5DF2\u6062\u590D"||N.status==="\u5DF2\u5904\u7406"?"daisy-alert-success":"daisy-alert-warning"])},[rR,c("div",null,[c("strong",null,B(N.title),1),c("small",null,B(N.time)+" \xB7 "+B(N.status),1)]),N.id&&N.status!=="\u5DF2\u6062\u590D"&&N.status!=="\u5DF2\u5904\u7406"?(H(),q("button",{key:0,disabled:u.value.has(`alert-${N.id}`),onClick:nn(le=>J(N.id),["stop"])},"\u5904\u7406",8,oR)):at("",!0)],2))),128))])],64)):U.type==="greenhouse"?(H(),q(He,{key:6},[c("header",aR,[c("div",null,[tt(li,{type:"greenhouse"}),c("div",null,[lR,c("h3",null,B(U.title),1)])])]),(H(!0),q(He,null,pt(K(Xt).filter(N=>U.entityIds.includes(N.id)),N=>(H(),q("div",{class:"greenhouse-focus",key:N.id},[c("div",{class:"daisy-radial-progress daisy-text-success",style:Gn(`--value:${N.health||0};--size:5.5rem`)},B(N.health),5),c("div",null,[c("h4",null,B(N.name),1),c("p",null,B(N.metric),1),c("span",uR,B(N.status==="normal"?"\u72B6\u6001\u826F\u597D":"\u9700\u8981\u5173\u6CE8"),1)])]))),128))],64)):U.type==="metric"?(H(),q(He,{key:7},[c("header",cR,[c("div",null,[tt(li,{type:"metric"}),c("div",null,[c("small",null,B(m(U.metricKey).label),1),c("h3",null,B(U.title),1)])]),dR]),c("div",hR,[c("div",fR,[c("strong",null,B(m(U.metricKey).value),1),c("span",{class:$e({down:m(U.metricKey).delta.includes("-")})},B(m(U.metricKey).delta),3)]),(H(),q("svg",pR,[c("defs",null,[c("linearGradient",{id:`metric-fill-${U.id}`,x1:"0",y1:"0",x2:"0",y2:"1"},vR,8,mR)]),c("polygon",{fill:`url(#metric-fill-${U.id})`,points:`0,58 ${y(U)} 264,58`},null,8,yR),c("polyline",{points:y(U)},null,8,ER)])),c("progress",{class:"daisy-progress daisy-progress-success",value:m(U.metricKey).progress,max:"100"},null,8,xR),c("footer",null,[c("small",null,"\u9608\u503C "+B(U.threshold||40),1),c("small",null,"\u6BCF "+B(U.refreshSeconds||30)+" \u79D2\u5237\u65B0",1)])])],64)):U.type==="trend"?(H(),q(He,{key:8},[c("header",bR,[c("div",null,[tt(li,{type:"trend"}),c("div",null,[c("small",null,B(m(U.metricKey).label),1),c("h3",null,B(U.title),1)])]),c("strong",MR,B(m(U.metricKey).value),1)]),c("div",AR,[(H(),q("svg",SR,[wR,c("polyline",{points:E(U)},null,8,TR)])),CR])],64)):U.type==="irrigation-schedule"?(H(),q(He,{key:9},[c("header",DR,[c("div",null,[tt(li,{type:"irrigation-schedule"}),c("div",null,[RR,c("h3",null,B(U.title),1)])]),FR]),c("div",PR,[(H(!0),q(He,null,pt(K($n).slice(0,6),(N,le)=>(H(),q("div",{key:N.id},[c("time",null,B(String(7+le).padStart(2,"0"))+":"+B(le%2?"30":"00"),1),c("i",{class:$e({done:!N.enabled&&le<2,running:N.enabled})},null,2),c("span",null,[c("strong",null,B(N.name),1),c("small",null,B(N.target)+" \xB7 "+B(N.flow),1)]),c("button",{class:$e(["schedule-action",{stop:N.enabled}]),disabled:u.value.has(N.id),onClick:nn(Y=>C(N.id,!N.enabled),["stop"])},B(N.enabled?"\u505C\u6B62":"\u542F\u52A8"),11,LR)]))),128))])],64)):U.type==="crop-tasks"?(H(),q(He,{key:10},[c("header",IR,[c("div",null,[tt(li,{type:"crop-tasks"}),c("div",null,[BR,c("h3",null,B(U.title),1)])]),UR]),c("div",NR,[(H(),q(He,null,pt(["02\u53F7\u68DA\u8865\u5145\u6EF4\u704C","04\u53F7\u68DA\u68C0\u67E5\u82D7\u5E8A","05\u53F7\u68DA\u8BB0\u5F55\u957F\u52BF","06\u53F7\u68DA\u6E05\u6D17\u8FC7\u6EE4\u5668"],(N,le)=>c("label",{key:N},[c("input",{type:"checkbox",class:"daisy-checkbox daisy-checkbox-success daisy-checkbox-sm",checked:le===2},null,8,OR),c("span",null,[c("strong",null,B(N),1),c("small",null,B(le<2?"\u9AD8\u4F18\u5148\u7EA7":"\u4ECA\u65E5\u5B8C\u6210")+" \xB7 \u8D1F\u8D23\u4EBA "+B(["\u674E\u660E","\u738B\u82B3","\u8D75\u5F3A","\u9648\u9759"][le]),1)])])),64))])],64)):(H(),q(He,{key:11},[c("header",kR,[c("div",null,[tt(li,{type:"ai-insight"}),c("div",null,[zR,c("h3",null,B(U.title),1)])]),HR]),$R],64))],42,hD))),128))]),_:1})):(H(),q("button",{key:1,class:"empty-canvas",onClick:ee[9]||(ee[9]=U=>s.value=!0)},XR)),tt(Kt,{name:"property-panel"},{default:qt(()=>[i.value&&K(a)?(H(),q("aside",{key:0,ref_key:"propertyPanelRef",ref:d,class:"property-panel",style:Gn(K(p))},[c("header",{class:"property-panel-handle",title:"\u62D6\u52A8\u5C5E\u6027\u9762\u677F",onPointerdown:nn(X,["stop"])},[c("div",null,[qR,c("strong",null,B(K(a).type),1)]),c("button",{class:"daisy-btn daisy-btn-xs daisy-btn-circle daisy-btn-ghost",onClick:ee[10]||(ee[10]=U=>r.value=null)},"\xD7")],40,jR),c("label",null,[KR,c("input",{value:K(a).title,class:"daisy-input daisy-input-bordered daisy-input-sm",maxlength:"24",onInput:ee[11]||(ee[11]=U=>oe({title:U.target.value}))},null,40,YR)]),c("label",null,[JR,c("select",{value:K(a).size,class:"daisy-select daisy-select-bordered daisy-select-sm",onChange:ee[12]||(ee[12]=U=>oe({size:U.target.value}))},nF,40,ZR)]),c("label",null,[iF,c("select",{value:K(a).refreshSeconds||30,class:"daisy-select daisy-select-bordered daisy-select-sm",onChange:ee[13]||(ee[13]=U=>oe({refreshSeconds:Number(U.target.value)}))},uF,40,sF)]),K(a).type==="metric"||K(a).type==="trend"?(H(),q("label",cF,[dF,c("select",{value:K(a).metricKey||"health",class:"daisy-select daisy-select-bordered daisy-select-sm",onChange:ee[14]||(ee[14]=U=>oe({metricKey:U.target.value}))},[(H(),q(He,null,pt(v,U=>c("option",{key:U.key,value:U.key},B(U.label),9,fF)),64))],40,hF)])):at("",!0),c("label",null,[pF,c("select",{value:K(a).density||"comfortable",class:"daisy-select daisy-select-bordered daisy-select-sm",onChange:ee[15]||(ee[15]=U=>oe({density:U.target.value}))},vF,40,mF)]),K(a).type==="metric"?(H(),q("label",yF,[EF,c("input",{value:K(a).threshold||40,type:"number",min:"0",max:"100",class:"daisy-input daisy-input-bordered daisy-input-sm",onInput:ee[16]||(ee[16]=U=>oe({threshold:Number(U.target.value)}))},null,40,xF)])):at("",!0),c("fieldset",null,[bF,c("div",MF,[(H(),q(He,null,pt(["green","blue","amber"],U=>{var N;return c("button",{key:U,class:$e([U,{active:((N=K(a))==null?void 0:N.accent)===U}]),onClick:le=>oe({accent:U})},null,10,AF)}),64))])]),K(a).type==="irrigation"||K(a).type==="greenhouse"?(H(),q("fieldset",SF,[wF,c("div",TF,[(H(!0),q(He,null,pt(K(Xt).filter(U=>U.type==="greenhouse"),U=>(H(),q("label",{key:U.id},[c("input",{type:"checkbox",class:"daisy-checkbox daisy-checkbox-success daisy-checkbox-xs",checked:K(a).entityIds.includes(U.id),onChange:N=>w(U.id,N.target.checked)},null,40,CF),it(B(Number(U.id.slice(-2)))+"\u53F7",1)]))),128))])])):at("",!0),DF],4)):at("",!0)]),_:1}),c("div",{class:$e(["daisy-drawer daisy-drawer-end component-drawer",{open:s.value}])},[c("input",{type:"checkbox",class:"daisy-drawer-toggle",checked:s.value},null,8,RF),s.value?(H(),q("div",{key:0,class:"drawer-mask",onClick:ee[17]||(ee[17]=U=>s.value=!1)})):at("",!0),c("aside",FF,[c("header",null,[PF,c("button",{class:"daisy-btn daisy-btn-sm daisy-btn-circle daisy-btn-ghost",onClick:ee[18]||(ee[18]=U=>s.value=!1)},"\xD7")]),LF,c("div",IF,[(H(),q(He,null,pt(g,U=>c("button",{key:U.type,class:"daisy-card daisy-card-bordered",onClick:N=>M(U.type)},[tt(li,{type:U.type},null,8,["type"]),c("strong",null,B(U.name),1),c("small",null,B(U.description),1),UF],8,BF)),64))])])],2)],2))}});var OF=zt(NF,[["__scopeId","data-v-ea4d5d80"]]);const sg=n=>(Qt("data-v-53833031"),n=n(),en(),n),kF=["aria-label"],zF={class:"reader-header"},HF=sg(()=>c("svg",{viewBox:"0 0 24 24"},[c("path",{d:"m15 18-6-6 6-6"})],-1)),$F={class:"reader-layout"},VF={class:"reader-toc"},GF=sg(()=>c("svg",{viewBox:"0 0 24 24"},[c("circle",{cx:"11",cy:"11",r:"7"}),c("path",{d:"m16 16 4 4"})],-1)),WF={"aria-label":"\u6587\u6863\u76EE\u5F55"},XF=["onClick"],jF={key:0},qF=["innerHTML"],KF=It({__name:"MarkdownDocumentViewer",props:{title:null,content:null,updatedAt:null,imageMap:null},emits:["close","attach"],setup(n,{emit:e}){const t=n,i=Ce(),s=Ce("");function r(h){return h.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function o(h){return h.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,(f,p,g)=>{var _;const v=((_=t.imageMap)==null?void 0:_[g])||g;return`<figure><img src="${r(v)}" alt="${p}" loading="lazy"><figcaption>${p}</figcaption></figure>`}).replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" rel="noreferrer">$1</a>').replace(/`([^`]+)`/g,"<code>$1</code>").replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>").replace(/\*([^*]+)\*/g,"<em>$1</em>")}function a(h,f){return`section-${f}-${h.replace(/[^\p{L}\p{N}]+/gu,"-").replace(/^-|-$/g,"").toLowerCase()}`}const l=Qe(()=>{var F;const f=t.content.replace(/\r\n/g,`
`).split(`
`),p=[],g=[];let v=0,_=!1,m="",E=[],y=null,x=!1;const M=()=>{y&&g.push(`</${y}>`),y=null},A=()=>{x&&g.push("</blockquote>"),x=!1};for(;v<f.length;){const I=f[v],b=I.trim();if(b.startsWith("```")){M(),A(),_?(g.push(`<pre data-language="${r(m||"text")}"><code>${r(E.join(`
`))}</code></pre>`),_=!1):(_=!0,m=b.slice(3).trim(),E=[]),v+=1;continue}if(_){E.push(I),v+=1;continue}const w=I.match(/^(#{1,6})\s+(.+)$/);if(w){M(),A();const z=w[1].length,T=w[2].replace(/[*`]/g,""),G=a(T,p.length);p.push({id:G,text:T,level:z}),g.push(`<h${z} id="${G}">${o(r(w[2]))}</h${z}>`),v+=1;continue}if(b.startsWith("|")&&((F=f[v+1])==null?void 0:F.trim().match(/^\|?\s*:?-+/))){M(),A();const z=[],T=b.split("|").slice(1,-1).map(G=>G.trim());for(v+=2;v<f.length&&f[v].trim().startsWith("|");)z.push(f[v].trim().split("|").slice(1,-1).map(G=>G.trim())),v+=1;g.push('<div class="table-scroll"><table><thead><tr>',...T.map(G=>`<th>${o(r(G))}</th>`),"</tr></thead><tbody>"),z.forEach(G=>g.push("<tr>",...G.map(re=>`<td>${o(r(re))}</td>`),"</tr>")),g.push("</tbody></table></div>");continue}const oe=I.match(/^\s*[-*]\s+(.+)$/),X=I.match(/^\s*\d+[.)]\s+(.+)$/);if(oe||X){A();const z=oe?"ul":"ol";y!==z&&(M(),y=z,g.push(`<${z}>`)),g.push(`<li>${o(r((oe||X)[1]))}</li>`),v+=1;continue}if(b.startsWith(">")){M(),x||(x=!0,g.push("<blockquote>")),g.push(`<p>${o(r(b.replace(/^>\s?/,"")))}</p>`),v+=1;continue}if(!b||b==="---"){M(),A(),b==="---"&&g.push("<hr>"),v+=1;continue}M(),A(),g.push(`<p>${o(r(b))}</p>`),v+=1}return M(),A(),_&&g.push(`<pre data-language="${r(m||"text")}"><code>${r(E.join(`
`))}</code></pre>`),{html:g.join(""),headings:p.filter(I=>I.level<=3)}}),u=Qe(()=>{const h=s.value.trim().toLowerCase();return h?l.value.headings.filter(f=>f.text.toLowerCase().includes(h)):l.value.headings});function d(h){var f,p;(p=(f=i.value)==null?void 0:f.querySelector(`#${CSS.escape(h)}`))==null||p.scrollIntoView({behavior:"smooth",block:"start"})}return _n(()=>t.content,async()=>{s.value="",await jn(),i.value&&(i.value.scrollTop=0)}),(h,f)=>(H(),q("section",{class:"document-reader",role:"dialog","aria-modal":"true","aria-label":n.title},[c("header",zF,[c("button",{class:"reader-back",onClick:f[0]||(f[0]=p=>e("close")),"aria-label":"\u8FD4\u56DE\u6587\u4EF6\u5E93"},[HF,it(" \u6587\u4EF6\u5E93 ")]),c("div",null,[c("h2",null,B(n.title),1),c("p",null,"\u9879\u76EE\u5185\u7F6E\u6587\u6863 \xB7 \u66F4\u65B0\u4E8E "+B(n.updatedAt),1)]),c("button",{class:"reader-attach",onClick:f[1]||(f[1]=p=>e("attach"))},"\u52A0\u5165\u5F53\u524D\u95EE\u519C\u4E0A\u4E0B\u6587")]),c("div",$F,[c("aside",VF,[c("label",null,[GF,ss(c("input",{"onUpdate:modelValue":f[2]||(f[2]=p=>s.value=p),placeholder:"\u641C\u7D22\u7AE0\u8282"},null,512),[[Ls,s.value]])]),c("nav",WF,[(H(!0),q(He,null,pt(K(u),p=>(H(),q("button",{key:p.id,class:$e(`level-${p.level}`),onClick:g=>d(p.id)},B(p.text),11,XF))),128)),K(u).length?at("",!0):(H(),q("p",jF,"\u6CA1\u6709\u5339\u914D\u7684\u7AE0\u8282"))])]),c("article",{ref_key:"articleRef",ref:i,class:"reader-article markdown-body",innerHTML:K(l).html},null,8,qF)])],8,kF))}});var YF=zt(KF,[["__scopeId","data-v-53833031"]]);const io=["gh-01","gh-02","gh-03","gh-04","gh-05","gh-06"],rg=[{id:"daily-irrigation",name:"\u6BCF\u65E5\u704C\u6E89\u5DE1\u68C0",icon:"\u6C34",pinned:!0,updatedAt:new Date().toISOString(),widgets:[{id:"daily-irrigation-grid",type:"irrigation",title:"01\u201406\u53F7\u5927\u68DA\u704C\u6E89\u72B6\u6001",size:"wide",entityIds:io,refreshSeconds:30,accent:"blue"},{id:"daily-water",type:"metric",title:"\u4ECA\u65E5\u7528\u6C34",size:"small",entityIds:[],metricKey:"todayWaterUsage",refreshSeconds:30,accent:"blue",showTrend:!0},{id:"daily-moisture",type:"metric",title:"\u5E73\u5747\u571F\u58E4\u6E7F\u5EA6",size:"small",entityIds:io,metricKey:"soilMoisture",refreshSeconds:30,accent:"green",threshold:40},{id:"daily-schedule",type:"irrigation-schedule",title:"\u4ECA\u65E5\u704C\u6E89\u8BA1\u5212",size:"medium",entityIds:io,refreshSeconds:60,accent:"blue"},{id:"daily-alerts",type:"alerts",title:"\u9700\u8981\u5173\u6CE8",size:"medium",entityIds:[],refreshSeconds:30,accent:"amber",density:"compact"}]}],Mn=Ce(JSON.parse(JSON.stringify(rg)));var Fp;const Pi=Ce(((Fp=Mn.value[0])==null?void 0:Fp.id)||"");function JF(){const n=Qe(()=>Mn.value.find(E=>E.id===Pi.value)||Mn.value[0]),e=Qe(()=>Mn.value.filter(E=>E.pinned));function t(E){var y;Mn.value=Array.isArray(E)?E:JSON.parse(JSON.stringify(rg)),Pi.value=((y=Mn.value[0])==null?void 0:y.id)||""}function i(E){Mn.value.some(y=>y.id===E)&&(Pi.value=E)}function s(E="\u6211\u7684\u519C\u4E1A\u5DE5\u4F5C\u53F0"){const y=`workbench-${Date.now()}`;return Mn.value.push({id:y,name:E,icon:"\u7530",widgets:[],pinned:!0,updatedAt:new Date().toISOString()}),Pi.value=y,y}function r(E,y){const x=Mn.value.find(A=>A.name===E);if(x)return Pi.value=x.id,x.id;const M=s(E);return y.forEach(A=>a(A.type,A.options)),M}function o(E){!n.value||!E.trim()||(n.value.name=E.trim().slice(0,18),n.value.updatedAt=new Date().toISOString())}function a(E,y={}){n.value||s();const x=n.value;if(!x)return;const A={summary:{title:"\u519C\u573A\u5B9E\u65F6\u603B\u89C8",size:"medium",entityIds:[]},irrigation:{title:"01\u201406\u53F7\u5927\u68DA\u704C\u6E89\u72B6\u6001",size:"wide",entityIds:io},environment:{title:"\u73AF\u5883\u5B9E\u65F6\u6307\u6807",size:"medium",entityIds:[]},devices:{title:"\u8BBE\u5907\u8FD0\u884C\u72B6\u6001",size:"medium",entityIds:[]},alerts:{title:"\u5F85\u5904\u7406\u544A\u8B66",size:"medium",entityIds:[]},greenhouse:{title:"\u5927\u68DA\u72B6\u6001\u5361",size:"small",entityIds:y.entityIds||["gh-01"]},metric:{title:"\u519C\u573A\u5173\u952E\u6307\u6807",size:"small",entityIds:[]},trend:{title:"24\u5C0F\u65F6\u53D8\u5316\u8D8B\u52BF",size:"medium",entityIds:[]},"irrigation-schedule":{title:"\u4ECA\u65E5\u704C\u6E89\u8BA1\u5212",size:"medium",entityIds:io},"crop-tasks":{title:"\u4ECA\u65E5\u519C\u4E8B\u4EFB\u52A1",size:"medium",entityIds:io},"ai-insight":{title:"AI \u519C\u60C5\u6D1E\u5BDF",size:"medium",entityIds:[]}}[E];x.widgets.push({id:`widget-${Date.now()}-${Math.random().toString(16).slice(2)}`,type:E,refreshSeconds:30,accent:E.includes("irrigation")?"blue":E==="alerts"?"amber":"green",density:"comfortable",showTrend:!0,metricKey:E==="trend"?"soilMoisture":E==="metric"?"health":void 0,...A,...y}),x.updatedAt=new Date().toISOString()}function l(E,y={}){var F,I;const x=n.value,M=y.entityIds||[],A=x==null?void 0:x.widgets.find(b=>b.type===E&&(!M.length||M.every(w=>b.entityIds.includes(w))));return A?(y.title&&(A.title=y.title),A.id):(a(E,y),(I=(F=n.value)==null?void 0:F.widgets.at(-1))==null?void 0:I.id)}function u(E){!n.value||(n.value.widgets=n.value.widgets.filter(y=>y.id!==E))}function d(E,y){var M;const x=(M=n.value)==null?void 0:M.widgets.find(A=>A.id===E);x&&Object.assign(x,y)}function h(E,y){var I;const x=(I=n.value)==null?void 0:I.widgets;if(!x||E===y)return;const M=x.findIndex(b=>b.id===E),A=x.findIndex(b=>b.id===y);if(M<0||A<0)return;const[F]=x.splice(M,1);x.splice(A,0,F),n.value&&(n.value.updatedAt=new Date().toISOString())}function f(){if(!n.value)return;const E=JSON.parse(JSON.stringify(n.value));E.id=`workbench-${Date.now()}`,E.name=`${E.name} \u526F\u672C`.slice(0,18),E.updatedAt=new Date().toISOString(),E.widgets.forEach((y,x)=>{y.id=`widget-${Date.now()}-${x}`}),Mn.value.push(E),Pi.value=E.id}function p(E){var x;const y=Mn.value.findIndex(M=>M.id===E);y<0||(Mn.value=Mn.value.filter(M=>M.id!==E),Pi.value===E&&(Pi.value=((x=Mn.value[Math.min(y,Mn.value.length-1)])==null?void 0:x.id)||""))}function g(){n.value&&p(n.value.id)}function v(){n.value&&(n.value.widgets=[])}function _(){n.value&&(n.value.pinned=!n.value.pinned)}function m(E){const y=E;if(!y||typeof y.name!="string"||!Array.isArray(y.widgets))throw new Error("\u5DE5\u4F5C\u53F0\u6587\u4EF6\u683C\u5F0F\u4E0D\u6B63\u786E");const x=["summary","irrigation","environment","devices","alerts","greenhouse","metric","trend","irrigation-schedule","crop-tasks","ai-insight"],M=y.widgets.filter(F=>F&&x.includes(F.type)).map((F,I)=>({...F,id:`widget-${Date.now()}-${I}`,title:String(F.title||"\u519C\u4E1A\u7EC4\u4EF6").slice(0,24),size:["small","medium","wide"].includes(F.size)?F.size:"medium",entityIds:Array.isArray(F.entityIds)?F.entityIds.filter(b=>typeof b=="string"):[]})),A=`workbench-${Date.now()}`;Mn.value.push({id:A,name:`${y.name}\uFF08\u5BFC\u5165\uFF09`.slice(0,18),icon:String(y.icon||"\u7530").slice(0,1),pinned:!0,widgets:M,updatedAt:new Date().toISOString()}),Pi.value=A}return{workbenches:Mn,activeWorkbenchId:Pi,activeWorkbench:n,pinnedWorkbenches:e,replaceWorkbenches:t,selectWorkbench:i,createWorkbench:s,createRoutineWorkbench:r,renameActiveWorkbench:o,addWidget:a,ensureWidget:l,removeWidget:u,updateWidget:d,moveWidget:h,duplicateActiveWorkbench:f,deleteWorkbench:p,deleteActiveWorkbench:g,clearActiveWorkbench:v,toggleActivePinned:_,importWorkbench:m}}var qu="/platform/assets/xiaotian-avatar.b61449d1.png",ZF=`# \u7530\u8A00\u8015\u667A\u7528\u6237\u4F7F\u7528\u624B\u518C

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
`,QF=`# \u7530\u8A00\u8015\u667A\u667A\u6167\u519C\u4E1A\u5E73\u53F0\u6280\u672F\u8BF4\u660E\u624B\u518C

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
`,eP="/platform/assets/\u5B98\u7F51.764c6a69.png",tP="/platform/assets/\u767B\u9646.44fb3e72.png",nP="/platform/assets/\u4E3B\u754C\u9762.f79aa29d.png",iP="/platform/assets/3D.d6b3b6c3.png",sP="/platform/assets/\u7B2C\u4E00\u4EBA\u79F0.310a9d6e.png",rP="/platform/assets/\u95EE\u519C.9f2adea9.png",oP="/platform/assets/\u81EA\u5B9A\u4E49\u5DE5\u4F5C\u53F0.1e5572e7.png",aP="/platform/assets/\u5927\u68DA\u5185\u90E8.0a1439ce.png";const gt=n=>(Qt("data-v-fa10c7b0"),n=n(),en(),n),lP=gt(()=>c("svg",{viewBox:"0 0 24 24"},[c("path",{d:"M4 7h16M4 12h16M4 17h16"})],-1)),uP=[lP],cP={class:"sidebar-head"},dP=gt(()=>c("svg",{viewBox:"0 0 24 24"},[c("path",{d:"m14 6-6 6 6 6"})],-1)),hP=[dP],fP=gt(()=>c("svg",{viewBox:"0 0 24 24"},[c("path",{d:"M12 5v14M5 12h14"})],-1)),pP={class:"library-nav","aria-label":"\u667A\u80FD\u95EE\u519C\u529F\u80FD"},mP=gt(()=>c("svg",{viewBox:"0 0 24 24"},[c("path",{d:"M5 3h10l4 4v14H5zM15 3v5h5M8 13h8M8 17h6"})],-1)),gP=gt(()=>c("svg",{viewBox:"0 0 24 24"},[c("path",{d:"M4 6h6l2 2h8v11H4z"})],-1)),_P=gt(()=>c("svg",{viewBox:"0 0 24 24"},[c("circle",{cx:"5",cy:"12",r:"1"}),c("circle",{cx:"12",cy:"12",r:"1"}),c("circle",{cx:"19",cy:"12",r:"1"})],-1)),vP=gt(()=>c("span",null,"\u5168\u90E8\u5E94\u7528",-1)),yP={class:"recent"},EP={class:"recent-head"},xP=gt(()=>c("h2",null,"\u6700\u8FD1\u804A\u5929",-1)),bP=["onClick"],MP=gt(()=>c("svg",{viewBox:"0 0 24 24"},[c("path",{d:"M20 15a3 3 0 0 1-3 3H9l-5 3v-14a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3z"})],-1)),AP=["onClick"],SP={class:"sidebar-user"},wP={class:"workspace"},TP={class:"topbar"},CP={key:"welcome",class:"welcome"},DP=gt(()=>c("em",null,"\u{1F331}",-1)),RP=gt(()=>c("p",null,"\u6211\u662F\u7530\u8A00\u8015\u667A\u667A\u80FD\u52A9\u624B\uFF0C\u968F\u65F6\u4E3A\u60A8\u63D0\u4F9B\u519C\u573A\u6570\u636E\u5206\u6790\u548C\u7BA1\u7406\u5EFA\u8BAE",-1)),FP={class:"composer welcome-composer"},PP={class:"composer-tools"},LP=gt(()=>c("svg",{viewBox:"0 0 24 24"},[c("path",{d:"M12 5v14M5 12h14"})],-1)),IP=[LP],BP={key:0,class:"attachment-chip"},UP={key:1},NP=gt(()=>c("svg",{viewBox:"0 0 24 24"},[c("rect",{x:"9",y:"3",width:"6",height:"12",rx:"3"}),c("path",{d:"M5 11a7 7 0 0 0 14 0M12 18v3"})],-1)),OP=[NP],kP=["disabled"],zP=gt(()=>c("svg",{viewBox:"0 0 24 24"},[c("path",{d:"m4 12 16-8-6 16-2.5-6.5L4 12Zm7.5 1.5L20 4"})],-1)),HP=[zP],$P={class:"quick-buttons"},VP=["onClick"],GP={key:"workbench",class:"conversation personalized-conversation"},WP={class:"chat-dock-head"},XP=["src"],jP=gt(()=>c("strong",null,"\u5C0F\u7530\u52A9\u624B",-1)),qP=gt(()=>c("i",null,null,-1)),KP={viewBox:"0 0 24 24"},YP=["d"],JP=["src"],ZP={key:0,class:"assistant progress-message"},QP=["src"],e8={class:"conversation-composer"},t8={key:0,class:"context-strip"},n8=gt(()=>c("i",null,"\u9644\u4EF6",-1)),i8={class:"composer-tools"},s8={class:"context-meter",title:"\u5F53\u524D\u4F1A\u8BDD\u4F30\u7B97\u7528\u91CF"},r8=gt(()=>c("svg",{viewBox:"0 0 24 24"},[c("path",{d:"m9 12 5-5a3 3 0 0 1 4 4l-7 7a5 5 0 0 1-7-7l7-7"})],-1)),o8=gt(()=>c("span",null,"\u9644\u4EF6",-1)),a8=[r8,o8],l8=gt(()=>c("svg",{viewBox:"0 0 24 24"},[c("rect",{x:"9",y:"3",width:"6",height:"12",rx:"3"}),c("path",{d:"M5 11a7 7 0 0 0 14 0M12 18v3"})],-1)),u8=gt(()=>c("span",{class:"model-chip"},"DeepSeek \xB7 \u519C\u4E1A\u667A\u80FD\u4F53",-1)),c8=["disabled"],d8=gt(()=>c("svg",{viewBox:"0 0 24 24"},[c("path",{d:"m5 12 14-7-5 14-2.5-5.5L5 12Zm6.5 1.5L19 5"})],-1)),h8=[d8],f8=gt(()=>c("svg",{viewBox:"0 0 24 24"},[c("path",{d:"M12 5v14M5 12h14"})],-1)),p8=gt(()=>c("span",null,"\u81EA\u5B9A\u4E49\u9762\u677F",-1)),m8=[f8,p8],g8=gt(()=>c("svg",{viewBox:"0 0 24 24"},[c("path",{d:"M12 3v13M7 11l5 5 5-5M5 20h14"})],-1)),_8=gt(()=>c("span",null,"\u5BFC\u5165\u9762\u677F",-1)),v8=[g8,_8],y8=gt(()=>c("svg",{viewBox:"0 0 24 24"},[c("path",{d:"m8 5 11 7-11 7z"})],-1)),E8=gt(()=>c("span",null,"\u6F14\u793A\u6A21\u5F0F",-1)),x8=[y8,E8],b8=Tm('<svg viewBox="0 0 24 24" data-v-fa10c7b0><rect x="4" y="4" width="6" height="6" data-v-fa10c7b0></rect><rect x="14" y="4" width="6" height="6" data-v-fa10c7b0></rect><rect x="4" y="14" width="6" height="6" data-v-fa10c7b0></rect><rect x="14" y="14" width="6" height="6" data-v-fa10c7b0></rect></svg><span data-v-fa10c7b0>\u5168\u90E8\u5E94\u7528</span>',2),M8=[b8],A8={key:0,class:"saved-workbenches","aria-label":"\u81EA\u5B9A\u4E49\u9762\u677F"},S8=gt(()=>c("small",null,"\u6211\u7684\u9762\u677F",-1)),w8={key:0,class:"shelf-empty"},T8=["onClick"],C8=["aria-label","title","onClick"],D8=gt(()=>c("small",null,"\u5E73\u53F0\u77E5\u8BC6\u5E93",-1)),R8=gt(()=>c("h2",null,"\u6587\u4EF6\u5E93",-1)),F8=gt(()=>c("p",null,"\u9605\u8BFB\u9879\u76EE\u624B\u518C\uFF0C\u6216\u5C06\u6587\u6863\u52A0\u5165\u5F53\u524D\u95EE\u519C\u4E0A\u4E0B\u6587\u3002\u4F60\u4E5F\u53EF\u4EE5\u4E0A\u4F20\u81EA\u5DF1\u7684\u6587\u672C\u8D44\u6599\u3002",-1)),P8={class:"built-in-documents"},L8=["onClick"],I8=gt(()=>c("span",{class:"document-mark"},[c("svg",{viewBox:"0 0 24 24"},[c("path",{d:"M6 3h9l4 4v14H6zM15 3v5h5M9 12h7M9 16h7"})])],-1)),B8={class:"document-copy"},U8=gt(()=>c("span",{class:"document-open"},[it("\u9605\u8BFB "),c("svg",{viewBox:"0 0 24 24"},[c("path",{d:"m9 18 6-6-6-6"})])],-1)),N8={key:0,class:"file-row"},O8=gt(()=>c("small",null,"\u5F53\u524D\u4F1A\u8BDD\u9644\u4EF6",-1)),k8=gt(()=>c("svg",{viewBox:"0 0 24 24"},[c("path",{d:"M12 5v14M5 12h14"})],-1)),z8=gt(()=>c("small",null,"\u4F1A\u8BDD\u9879\u76EE",-1)),H8=gt(()=>c("h2",null,"\u667A\u6167\u519C\u573A01",-1)),$8=gt(()=>c("small",null,"\u9762\u677F\u7B5B\u9009",-1)),V8=gt(()=>c("h2",null,"\u9009\u62E9\u6570\u636E\u4E2D\u5FC3",-1)),G8={class:"app-grid"},W8=["onClick"],X8=gt(()=>c("small",null,"\u7530\u8A00\u8015\u667A",-1)),j8=gt(()=>c("h2",null,"\u5168\u90E8\u5E94\u7528",-1)),q8={class:"app-grid"},K8=It({__name:"AssistantPreviewView",setup(n){const e=_a(),t=t0(),i=Ce(""),s=Ce(!1),r=Ce(!1),o=Ce(),a=Ce(),l=Ce(),u=Ce(1),d=Ce(null),h=Ce(null),f=Ce(""),p=Ce(null),g=Ce(null),v=Ce(null),_=Ce(!1),m=Ce(!1),E=Ce(!1),y=Ce(!1),x=Ce(!1),M=Ce(!1),A=Ce(null),F=Ce(),I=Ce(),b=Ce(!1),w=Ce(!1),oe=Ce("");let X,z;const T=Ce([{id:1,title:"\u65B0\u7684\u95EE\u519C\u4F1A\u8BDD",time:"\u521A\u521A",messages:[]}]),G=["\u5206\u6790\u4ECA\u65E5\u72B6\u6001","\u67E5\u770B\u5F02\u5E38\u5730\u5757","\u751F\u6210\u704C\u6E89\u65B9\u6848","\u5BF9\u6BD4\u6E29\u5BA4\u6570\u636E"],re=[{id:"user-manual",title:"\u7528\u6237\u4F7F\u7528\u624B\u518C",description:"\u4ECE\u6CE8\u518C\u767B\u5F55\u5230\u519C\u573A\u5DE5\u4F5C\u53F0\u30013D \u5DE1\u573A\u3001\u5927\u68DA\u5185\u90E8\u4E0E\u667A\u80FD\u95EE\u519C\u7684\u5B8C\u6574\u64CD\u4F5C\u6307\u5357\u3002",audience:"\u5E73\u53F0\u7528\u6237",pages:"19 \u4E2A\u7AE0\u8282",updatedAt:"2026-08-05",content:ZF},{id:"technical-manual",title:"\u6280\u672F\u8BF4\u660E\u624B\u518C",description:"\u7CFB\u7EDF\u67B6\u6784\u3001\u90E8\u7F72\u3001\u63A5\u53E3\u3001\u6570\u636E\u6A21\u578B\uFF0C\u4EE5\u53CA LingBot-Map\u3001\u673A\u5668\u4EBA\u5BFC\u822A\u548C\u89C6\u89C9\u8BC6\u522B\u89C4\u5212\u3002",audience:"\u5F00\u53D1\u4E0E\u8FD0\u7EF4",pages:"27 \u4E2A\u7AE0\u8282",updatedAt:"2026-08-05",content:QF}],ae={"./\u622A\u56FE/\u5B98\u7F51.png":eP,"./\u622A\u56FE/\u767B\u9646.png":tP,"./\u622A\u56FE/\u4E3B\u754C\u9762.png":nP,"./\u622A\u56FE/3D.png":iP,"./\u622A\u56FE/\u7B2C\u4E00\u4EBA\u79F0.png":sP,"./\u622A\u56FE/\u95EE\u519C.png":rP,"./\u622A\u56FE/\u81EA\u5B9A\u4E49\u5DE5\u4F5C\u53F0.png":oP,"./\u622A\u56FE/\u5927\u68DA\u5185\u90E8.png":aP},C=Qe(()=>T.value.find(we=>we.id===u.value)||T.value[0]),J=Qe(()=>{var we;return((we=C.value)==null?void 0:we.messages)||[]}),$=Qe(()=>y.value||J.value.length>0),ee=Qe(()=>E.value?J.value:J.value.slice(-2)),U=Qe(()=>{var we,ge;return`${((we=Y.value)==null?void 0:we.name)||"\u5F53\u524D\u5DE5\u4F5C\u53F0"} \xB7 ${((ge=Y.value)==null?void 0:ge.widgets.length)||0} \u4E2A\u7EC4\u4EF6${d.value?` \xB7 ${d.value.name}`:""}`}),N=Qe(()=>{const we=J.value.reduce((Ge,Ft)=>Ge+Ft.content.length,0)+nt().length;return`${Math.max(.1,we/3.5/1e3).toFixed(1)}K / 64K \u4E0A\u4E0B\u6587`}),{workbenches:le,activeWorkbench:Y,replaceWorkbenches:ce,selectWorkbench:O,createWorkbench:Fe,createRoutineWorkbench:Oe,renameActiveWorkbench:Pe,addWidget:Ne,ensureWidget:P,removeWidget:k,updateWidget:ue,moveWidget:fe,duplicateActiveWorkbench:be,deleteWorkbench:De,clearActiveWorkbench:Ie,toggleActivePinned:Ae,importWorkbench:Re}=JF(),Te=Qe(()=>T.value.filter(we=>we.title.toLowerCase().includes(f.value.trim().toLowerCase()))),D=Qe(()=>Ni.find(we=>{var ge;return we.entityId===((ge=d.value)==null?void 0:ge.id)})),S=Qe(()=>{if(h.value==="overview")return[{label:"\u519C\u573A\u5065\u5EB7\u5EA6",value:`${yt.health} \u5206`,tone:"normal"},{label:"\u5728\u7EBF\u8BBE\u5907",value:`${yt.onlineDevices}/${yt.totalDevices}`,tone:"normal"},{label:"\u8FD0\u884C\u8BBE\u5907",value:`${yt.runningDevices} \u53F0`,tone:"normal"},{label:"\u5F85\u5904\u7406\u544A\u8B66",value:`${yt.openAlerts} \u6761`,tone:yt.openAlerts?"warning":"normal"}];if(h.value==="environment")return Os.slice(0,4).map(Ge=>({label:Ge.label,value:Ge.value,tone:Ge.tone||"normal"}));if(h.value==="devices")return[{label:"\u8BBE\u5907\u603B\u6570",value:`${An.length} \u53F0`,tone:"normal"},{label:"\u5728\u7EBF\u8BBE\u5907",value:`${An.filter(Ge=>Ge.online).length} \u53F0`,tone:"normal"},{label:"\u8FD0\u884C\u8BBE\u5907",value:`${An.filter(Ge=>Ge.enabled).length} \u53F0`,tone:"normal"},{label:"\u79BB\u7EBF\u8BBE\u5907",value:`${An.filter(Ge=>!Ge.online).length} \u53F0`,tone:An.some(Ge=>!Ge.online)?"warning":"normal"}];if(h.value==="irrigation")return[{label:"\u4F9B\u6C34\u6C34\u4F4D",value:`${yt.waterLevel}%`,tone:"normal"},{label:"\u4ECA\u65E5\u7528\u6C34",value:`${yt.todayWaterUsage} m\xB3`,tone:"normal"},{label:"\u704C\u6E89\u5355\u5143",value:`${$n.length} \u4E2A`,tone:"normal"},{label:"\u8FD0\u884C\u5355\u5143",value:`${$n.filter(Ge=>Ge.enabled).length} \u4E2A`,tone:"normal"}];if(h.value==="alerts")return[{label:"\u5168\u90E8\u544A\u8B66",value:`${Ln.length} \u6761`,tone:"normal"},{label:"\u5F85\u5904\u7406",value:`${Ln.filter(Ge=>Ge.status!=="\u5DF2\u5904\u7406"&&Ge.status!=="\u5DF2\u6062\u590D").length} \u6761`,tone:"warning"},{label:"\u9884\u8B66",value:`${Ln.filter(Ge=>Ge.level==="\u9884\u8B66").length} \u6761`,tone:"warning"},{label:"\u5DF2\u6062\u590D",value:`${Ln.filter(Ge=>Ge.status==="\u5DF2\u6062\u590D").length} \u6761`,tone:"normal"}];if(h.value==="crops")return Ni.slice(0,4).map(Ge=>({label:Ge.crop,value:Ge.stage,tone:"normal"}));if(!d.value)return[];const we=d.value,ge=D.value;return[{label:"\u8FD0\u884C\u72B6\u6001",value:we.status==="normal"?"\u6B63\u5E38":we.status==="attention"?"\u9700\u5173\u6CE8":"\u9884\u8B66",tone:we.status},{label:"\u5B9E\u65F6\u6307\u6807",value:we.metric,tone:"normal"},{label:"\u79CD\u690D\u4F5C\u7269",value:(ge==null?void 0:ge.crop)||"\u8BBE\u65BD\u519C\u4E1A",tone:"normal"},{label:"\u751F\u957F\u9636\u6BB5",value:(ge==null?void 0:ge.stage)||`\u5065\u5EB7\u5EA6 ${we.health||"--"}`,tone:"normal"}]}),se=Qe(()=>{var we;return((we=d.value)==null?void 0:we.name)||{overview:"\u667A\u6167\u519C\u573A01\u603B\u89C8",environment:"\u519C\u573A\u73AF\u5883\u4E2D\u5FC3",devices:"\u8BBE\u5907\u8FD0\u884C\u4E2D\u5FC3",irrigation:"\u667A\u80FD\u704C\u6E89\u4E2D\u5FC3",alerts:"\u519C\u573A\u544A\u8B66\u4E2D\u5FC3",crops:"\u4F5C\u7269\u751F\u957F\u4E2D\u5FC3"}[h.value||""]||"AI \u6570\u636E\u9762\u677F"}),ve=Qe(()=>{var we,ge;return(ge=(we=d.value)==null?void 0:we.health)!=null?ge:h.value==="alerts"?78:h.value==="devices"?96:yt.health}),xe=Qe(()=>({environment:[42,48,45,57,54,62,66,63,72,70,76,74],irrigation:[35,42,38,52,48,60,57,68,64,72,69,78],devices:[84,86,87,90,88,92,94,93,96,95,96,96],alerts:[72,66,70,58,62,54,48,52,44,40,36,32],crops:[51,54,58,61,65,68,72,76,79,83,86,90]})[h.value||""]||[58,62,60,67,65,72,76,74,82,86,84,ve.value]);Qe(()=>xe.value.map((we,ge)=>`${ge*24},${92-we*.72}`).join(" ")),Qe(()=>S.value.map((we,ge)=>({label:we.label.slice(0,4),value:Math.max(28,Math.min(96,[ve.value,72,86,64][ge]||55))}))),Qe(()=>h.value==="alerts"?"\u98CE\u9669\u6570\u91CF\u6301\u7EED\u56DE\u843D\uFF0C\u5EFA\u8BAE\u4F18\u5148\u68C0\u67E5\u672A\u5904\u7406\u9884\u8B66\u3002":h.value==="irrigation"?"\u4F9B\u6C34\u538B\u529B\u7A33\u5B9A\uFF0C\u5F53\u524D\u8FD0\u884C\u5355\u5143\u5904\u4E8E\u5408\u7406\u533A\u95F4\u3002":h.value==="devices"?"\u8BBE\u5907\u5728\u7EBF\u7387\u826F\u597D\uFF0C\u79BB\u7EBF\u8282\u70B9\u9700\u8981\u5B89\u6392\u73B0\u573A\u6392\u67E5\u3002":d.value?`${d.value.name}\u6574\u4F53\u72B6\u6001${d.value.status==="normal"?"\u826F\u597D":"\u9700\u8981\u5173\u6CE8"}\uFF0C\u8D8B\u52BF\u4FDD\u6301\u7A33\u5B9A\u3002`:"\u7EFC\u5408\u6307\u6807\u8FD0\u884C\u5E73\u7A33\uFF0C\u6682\u65E0\u7A81\u53D1\u6027\u6CE2\u52A8\u3002");const Le=Qe(()=>{const we=new Date().getHours();return we<6?"\u591C\u6DF1\u4E86":we<12?"\u65E9\u4E0A\u597D":we<18?"\u4E0B\u5348\u597D":"\u665A\u4E0A\u597D"});function W(){var ge;(ge=l.value)==null||ge.abort();const we=Date.now();T.value.unshift({id:we,title:"\u65B0\u7684\u95EE\u519C\u4F1A\u8BDD",time:"\u521A\u521A",messages:[]}),u.value=we,i.value="",s.value=!1,d.value=null,h.value=null,y.value=!1,r.value=!1,jn(()=>{var Ge;return(Ge=a.value)==null?void 0:Ge.focus()})}function ye(){x.value=!x.value}async function pe(){const we=le.value.length+1;Fe(`\u6211\u7684\u5DE5\u4F5C\u53F0 ${we}`),y.value=!0,x.value=!0,M.value=!0,E.value=!1,await jn(),M.value=!1}function ze(we){O(we),y.value=!0}function Ke(we){!le.value.find(Ge=>Ge.id===we)||(De(we),A.value=null,le.value.length||(y.value=!1,E.value=!1))}function et(we){if(window.clearTimeout(z),A.value===we)return Ke(we);A.value=we,z=window.setTimeout(()=>{A.value=null},3500)}function qe(){Y.value&&Ke(Y.value.id)}function We(we,ge){if(ge){P("greenhouse",{title:ge.name,entityIds:[ge.id],size:"small"});return}const Ft=we?{overview:"summary",environment:"environment",devices:"devices",irrigation:"irrigation",alerts:"alerts",crops:"greenhouse"}[we]:void 0;Ft&&P(Ft)}function rt(we){const ge=/(?:0?1|一).*(?:0?6|六).*(?:大棚|温室)|(?:大棚|温室).*(?:0?1|一).*(?:0?6|六)/.test(we),Ge=/每天|每日|例行|固定|常用|巡检/.test(we);return!ge||!/灌溉|用水|水分|阀门/.test(we)?!1:(Oe(Ge?"\u6BCF\u65E5\u704C\u6E89\u5DE1\u68C0":"\u516D\u68DA\u704C\u6E89\u5BF9\u6BD4",[{type:"irrigation",options:{title:"01\u201406\u53F7\u5927\u68DA\u704C\u6E89\u72B6\u6001",size:"wide"}},{type:"metric",options:{title:"\u4ECA\u65E5\u7528\u6C34",metricKey:"todayWaterUsage",size:"small",accent:"blue"}},{type:"metric",options:{title:"\u5E73\u5747\u571F\u58E4\u6E7F\u5EA6",metricKey:"soilMoisture",size:"small",threshold:40}},{type:"irrigation-schedule",options:{title:"\u4ECA\u65E5\u704C\u6E89\u8BA1\u5212"}},{type:"ai-insight",options:{title:"AI \u704C\u6E89\u6D1E\u5BDF"}}]),h.value="irrigation",d.value=null,!0)}function ft(we){u.value=we;const ge=T.value.find(Ge=>Ge.id===we);h.value=(ge==null?void 0:ge.panelMode)||null,d.value=Xt.find(Ge=>Ge.id===(ge==null?void 0:ge.panelEntityId))||null,r.value=!1,jn(ie)}function Gt(we){if(T.value=T.value.filter(ge=>ge.id!==we),!T.value.length)return W();u.value===we&&ft(T.value[0].id)}async function ie(){await jn(),o.value&&(o.value.scrollTop=o.value.scrollHeight)}async function Ee(we){var de;const ge=(we||i.value).trim();if(!ge||s.value||!C.value)return;y.value=!0,i.value="";const Ge=rt(ge),Ft=Ge?null:Be(ge);if(Ft)d.value=Ft,h.value="entity";else{const te=Ze(ge);te?(h.value=te,d.value=null):h.value=h.value||"overview"}!Ge&&/创建|打开|查看|生成|对比|面板|工作台|灌溉|环境|设备|告警/.test(ge)&&We(h.value,d.value);const R=C.value;R.panelMode=h.value,R.panelEntityId=((de=d.value)==null?void 0:de.id)||null,R.messages.push({role:"user",content:ge}),R.messages.length===1&&(R.title=ge.slice(0,18)),R.time="\u521A\u521A",s.value=!0,await ie(),l.value=new AbortController;try{const te=await ng(R.messages,nt(),l.value.signal);R.messages.push({role:"assistant",content:te.reply})}catch(te){te.name!=="AbortError"&&R.messages.push({role:"assistant",content:`\u6682\u65F6\u65E0\u6CD5\u5B8C\u6210\u56DE\u7B54\uFF1A${te.message}`})}finally{s.value=!1,l.value=void 0,await ie()}}function Be(we){const ge=we.replace(/零/g,"0").replace(/一/g,"1").replace(/二/g,"2").replace(/三/g,"3").replace(/四/g,"4").replace(/五/g,"5").replace(/六/g,"6"),Ge=Xt.find(te=>we.includes(te.name)||we.includes(te.id));if(Ge)return Ge;const Ft=ge.match(/0?([1-6])\s*号?\s*(?:大棚|温室)/);if(Ft)return Xt.find(te=>te.id===`gh-0${Ft[1]}`)||null;const R=ge.match(/0?([4-5])\s*号?\s*(?:地块|种植区)/);if(R)return Xt.find(te=>te.id===`field-0${R[1]}`)||null;const de=ge.match(/(?:那|再看|看看|切换到|换到|查看)?\s*0?([1-6])\s*号(?:呢|怎么样|如何|的情况|的状况)?/);if(de&&d.value){const te=d.value.type==="greenhouse"?"gh":d.value.type==="field"?"field":null;if(te)return Xt.find(ne=>ne.id===`${te}-0${de[1]}`)||null}return null}function Ze(we){return/告警|异常|风险|故障/.test(we)?"alerts":/灌溉|用水|水位|阀门/.test(we)?"irrigation":/设备|在线|离线|机器/.test(we)?"devices":/环境|温度|湿度|光照|二氧化碳|CO₂/.test(we)?"environment":/作物|长势|生长|温室数据|对比/.test(we)?"crops":/今日|全场|概览|总览|状态|快照/.test(we)?"overview":null}function nt(){var Ft;const we="\u667A\u6167\u519C\u573A01 \xB7 \u667A\u80FD\u95EE\u519C\u6570\u636E\u9762\u677F\u3002\u8BF7\u4F9D\u636E\u63D0\u4F9B\u7684\u6570\u636E\u56DE\u7B54\uFF0C\u7F3A\u5C11\u6570\u636E\u65F6\u660E\u786E\u8BF4\u660E\u3002",ge=g.value?`\u7528\u6237\u9644\u4EF6\u201C${g.value.name}\u201D\u5185\u5BB9\uFF1A${g.value.content.slice(0,1200)}\u3002`:"";if(h.value!=="entity"||!d.value)return`${we} \u5F53\u524D\u9762\u677F\uFF1A${se.value}\uFF1B\u9762\u677F\u6307\u6807\uFF1A${S.value.map(R=>`${R.label}${R.value}`).join("\u3001")}\uFF1B\u5F53\u524D\u5168\u573A\u73AF\u5883\uFF1A${Os.map(R=>`${R.label}${R.value}`).join("\u3001")}\u3002${ge}`;const Ge=D.value;return`${we} \u5F53\u524D\u9762\u677F\u5BF9\u8C61\uFF1A${d.value.name}\uFF1B\u72B6\u6001\uFF1A${d.value.status}\uFF1B\u6307\u6807\uFF1A${d.value.metric}\uFF1B\u5065\u5EB7\u5EA6\uFF1A${(Ft=d.value.health)!=null?Ft:"\u6682\u65E0"}\uFF1B\u4F5C\u7269\uFF1A${(Ge==null?void 0:Ge.crop)||"\u6682\u65E0"}\uFF1B\u9762\u79EF\uFF1A${(Ge==null?void 0:Ge.area)||"\u6682\u65E0"}\uFF1B\u751F\u957F\u9636\u6BB5\uFF1A${(Ge==null?void 0:Ge.stage)||"\u6682\u65E0"}\uFF1B\u73AF\u5883\uFF1A${(Ge==null?void 0:Ge.environment)||"\u6682\u65E0"}\uFF1B\u76F8\u5173\u672A\u5904\u7406\u544A\u8B66\uFF1A${Ln.filter(R=>{var de;return R.entityId===((de=d.value)==null?void 0:de.id)&&R.status!=="\u5DF2\u5904\u7406"}).map(R=>R.title).join("\u3001")||"\u65E0"}\u3002${ge}`}async function wt(we){var Ge;const ge=(Ge=we.target.files)==null?void 0:Ge[0];if(!!ge){if(ge.size>1024*1024){window.alert("\u6587\u4EF6\u4E0D\u80FD\u8D85\u8FC7 1MB");return}g.value={name:ge.name,content:await ge.text()},p.value=null,i.value=`\u8BF7\u5206\u6790\u9644\u4EF6 ${ge.name}`,await jn(()=>{var Ft;return(Ft=a.value)==null?void 0:Ft.focus()})}}function Ct(we){v.value=we}function tn(we){!we||(g.value={name:`${we.title}.md`,content:we.content},v.value=null,p.value=null,i.value=`\u8BF7\u7ED3\u5408\u300A${we.title}\u300B\u56DE\u7B54\u6211\u7684\u95EE\u9898\uFF1A`,jn(()=>{var ge;return(ge=a.value)==null?void 0:ge.focus()}))}async function Qn(we){var Ft;const ge=we.target,Ge=(Ft=ge.files)==null?void 0:Ft[0];if(!!Ge)try{Re(JSON.parse(await Ge.text())),y.value=!0}catch(R){window.alert(R instanceof Error?R.message:"\u5DE5\u4F5C\u53F0\u5BFC\u5165\u5931\u8D25")}finally{ge.value=""}}function Ht(){const we=window.SpeechRecognition||window.webkitSpeechRecognition;if(!we){window.alert("\u5F53\u524D\u6D4F\u89C8\u5668\u4E0D\u652F\u6301\u8BED\u97F3\u8BC6\u522B\uFF0C\u8BF7\u4F7F\u7528 Chrome \u6216 Edge");return}const ge=new we;ge.lang="zh-CN",ge.interimResults=!1,m.value=!0,ge.onresult=Ge=>{var Ft;i.value=Ge.results[0][0].transcript,m.value=!1,(Ft=a.value)==null||Ft.focus()},ge.onerror=()=>{m.value=!1},ge.onend=()=>{m.value=!1},ge.start()}async function xn(){if(_.value)return;_.value=!0,W();const we=["\u5206\u6790\u4ECA\u65E5\u519C\u573A\u72B6\u6001","\u6211\u60F3\u67E5\u770B01\u53F7\u5927\u68DA\u7684\u72B6\u51B5"];for(const ge of we)i.value=ge,await new Promise(Ge=>window.setTimeout(Ge,700)),await Ee(ge);_.value=!1}function hn(we){we.key==="Enter"&&!we.shiftKey&&(we.preventDefault(),Ee())}function Ci(){!b.value||(window.clearTimeout(X),X=window.setTimeout(async()=>{w.value=!0,oe.value="";try{await l4(le.value,T.value.slice(0,30))}catch(we){oe.value=we instanceof Error?we.message:"\u540C\u6B65\u5931\u8D25"}finally{w.value=!1}},650))}return _n([le,T],Ci,{deep:!0}),ks(async()=>{try{const we=await a4(),ge=JSON.parse(we.workbenchesJson||"[]"),Ge=JSON.parse(we.conversationsJson||"[]");(we.updatedAt||ge.length)&&ce(ge),Ge.length&&(T.value=Ge,u.value=Ge[0].id)}catch(we){oe.value=we instanceof Error?we.message:"\u7528\u6237\u6570\u636E\u52A0\u8F7D\u5931\u8D25"}finally{b.value=!0,Ci()}}),$i(()=>{var we;(we=l.value)==null||we.abort(),window.clearTimeout(X),window.clearTimeout(z)}),(we,ge)=>{var Ge,Ft,R,de;return H(),q("main",{class:$e(["ask-farm",{chatting:K($)}])},[c("button",{class:"mobile-menu","aria-label":"\u6253\u5F00\u4F1A\u8BDD\u5217\u8868",onClick:ge[0]||(ge[0]=te=>r.value=!0)},uP),r.value?(H(),q("div",{key:0,class:"sidebar-mask",onClick:ge[1]||(ge[1]=te=>r.value=!1)})):at("",!0),c("aside",{class:$e(["sidebar",{open:r.value}])},[c("div",cP,[tt(Zc),c("button",{class:"collapse","aria-label":"\u6536\u8D77\u4FA7\u680F",onClick:ge[2]||(ge[2]=te=>r.value=!1)},hP)]),c("button",{class:"new-chat",onClick:W},[fP,it("\u65B0\u804A\u5929 ")]),c("nav",pP,[c("button",{onClick:ge[3]||(ge[3]=te=>{p.value="files",v.value=null})},[mP,it("\u6587\u4EF6\u5E93"),c("span",null,B(re.length)+" \u672C\u624B\u518C",1)]),c("button",{onClick:ge[4]||(ge[4]=te=>p.value="projects")},[gP,it("\u9879\u76EE"),c("span",null,B(T.value.length)+" \u4E2A\u4F1A\u8BDD",1)]),c("button",{onClick:ge[5]||(ge[5]=te=>p.value="apps")},[_P,it("\u66F4\u591A"),vP])]),c("section",yP,[c("div",EP,[xP,ss(c("input",{"onUpdate:modelValue":ge[6]||(ge[6]=te=>f.value=te),placeholder:"\u641C\u7D22","aria-label":"\u641C\u7D22\u4F1A\u8BDD"},null,512),[[Ls,f.value]])]),(H(!0),q(He,null,pt(K(Te),te=>(H(),q("button",{key:te.id,class:$e({active:te.id===u.value}),onClick:ne=>ft(te.id)},[MP,c("span",null,B(te.title),1),c("small",null,B(te.time),1),c("i",{title:"\u5220\u9664\u4F1A\u8BDD",onClick:nn(ne=>Gt(te.id),["stop"])},"\xD7",8,AP)],10,bP))),128))]),c("div",SP,[c("span",null,B(((Ft=(Ge=K(t))==null?void 0:Ge.name)==null?void 0:Ft.slice(0,1))||"\u7530"),1),c("div",null,[c("strong",null,B(((R=K(t))==null?void 0:R.name)||"\u519C\u573A\u7528\u6237"),1),c("small",null,B(((de=K(t))==null?void 0:de.email)||"\u5DF2\u767B\u5F55"),1)])])],2),c("section",wP,[c("header",TP,[tt(id)]),tt(Kt,{name:"workspace-swap",mode:"out-in"},{default:qt(()=>{var te;return[K($)?(H(),q("section",GP,[K(Y)?(H(),gn(OF,{key:K(Y).id,workbench:K(Y),"initial-library-open":M.value,onAdd:K(Ne),onRemove:K(k),onUpdate:K(ue),onMove:K(fe),onRename:K(Pe),onDuplicate:K(be),onDelete:qe,onClear:K(Ie),onTogglePin:K(Ae)},null,8,["workbench","initial-library-open","onAdd","onRemove","onUpdate","onMove","onRename","onDuplicate","onClear","onTogglePin"])):at("",!0),c("section",{class:$e(["compact-chat",{expanded:E.value}])},[c("header",WP,[c("button",{class:"chat-toggle",onClick:ge[11]||(ge[11]=ne=>E.value=!E.value)},[c("img",{class:"bot-orb",src:K(qu),alt:"\u5C0F\u7530\u52A9\u624B\u5934\u50CF"},null,8,XP),c("div",null,[jP,c("small",null,B(K(U)),1)])]),c("div",{class:$e(["sync-state",{error:oe.value}])},[qP,it(B(w.value?"\u6B63\u5728\u540C\u6B65":oe.value||"\u5DF2\u4FDD\u5B58\u5230\u4E2A\u4EBA\u4E91\u7AEF"),1)],2),c("button",{class:"expand-chat",onClick:ge[12]||(ge[12]=ne=>E.value=!E.value)},[(H(),q("svg",KP,[c("path",{d:E.value?"m7 14 5-5 5 5":"m7 10 5 5 5-5"},null,8,YP)]))])]),c("div",{ref_key:"listRef",ref:o,class:"message-list"},[(H(!0),q(He,null,pt(K(ee),(ne,Me)=>{var Z;return H(),q("article",{key:Me,class:$e(ne.role)},[ne.role==="assistant"?(H(),q("img",{key:0,class:"bot-avatar",src:K(qu),alt:"\u5C0F\u7530\u52A9\u624B\u5934\u50CF"},null,8,JP)):at("",!0),c("div",null,[c("small",null,B(ne.role==="assistant"?"\u5C0F\u7530\u52A9\u624B":((Z=K(t))==null?void 0:Z.name)||"\u6211"),1),c("p",null,B(ne.content),1)])],2)}),128)),s.value?(H(),q("article",ZP,[c("img",{class:"bot-avatar",src:K(qu),alt:"\u5C0F\u7530\u52A9\u624B\u5934\u50CF"},null,8,QP),c("div",null,[tt(Ns,{value:null,label:"\u5C0F\u7530\u6B63\u5728\u5206\u6790\u519C\u573A\u6570\u636E","pending-label":"\u751F\u6210\u56DE\u7B54"})])])):at("",!0)],512),c("div",e8,[g.value?(H(),q("div",t8,[c("span",null,[n8,it(B(g.value.name),1),c("button",{onClick:ge[13]||(ge[13]=ne=>g.value=null)},"\xD7")])])):at("",!0),ss(c("textarea",{ref_key:"inputRef",ref:a,"onUpdate:modelValue":ge[14]||(ge[14]=ne=>i.value=ne),rows:"1",maxlength:"1200",placeholder:"\u8BE2\u95EE\u6570\u636E\u3001\u8C03\u6574\u9762\u677F\u6216\u63A7\u5236\u519C\u573A\u8BBE\u5907\u2026\u2026",onKeydown:hn},null,544),[[Ls,i.value]]),c("footer",i8,[c("div",null,[c("span",s8,B(K(N)),1),c("button",{class:"composer-tool",title:"\u6DFB\u52A0\u9644\u4EF6",onClick:ge[15]||(ge[15]=ne=>{var Me;return(Me=F.value)==null?void 0:Me.click()})},a8),c("button",{class:$e(["composer-tool",{recording:m.value}]),title:"\u8BED\u97F3\u8F93\u5165",onClick:Ht},[l8,c("span",null,B(m.value?"\u8046\u542C\u4E2D":"\u8BED\u97F3"),1)],2)]),u8,c("button",{class:"send send-rich",disabled:!i.value.trim()||s.value,"aria-label":"\u53D1\u9001",onClick:ge[16]||(ge[16]=ne=>Ee())},h8,8,c8)])])],2)])):(H(),q("div",CP,[c("h1",null,[it(B(K(Le))+"\uFF0C"+B(((te=K(t))==null?void 0:te.name)||"\u519C\u573A\u7BA1\u7406\u8005")+" ",1),DP]),RP,c("div",FP,[ss(c("textarea",{ref_key:"inputRef",ref:a,"onUpdate:modelValue":ge[7]||(ge[7]=ne=>i.value=ne),rows:"2",maxlength:"1200",placeholder:"\u8BE2\u95EE\u519C\u573A\uFF0C\u83B7\u53D6\u6570\u636E\u6216\u751F\u6210\u7BA1\u7406\u5EFA\u8BAE\u2026\u2026",onKeydown:hn},null,544),[[Ls,i.value]]),c("div",PP,[c("button",{class:"tool",title:"\u6DFB\u52A0\u6587\u4EF6",onClick:ge[8]||(ge[8]=ne=>{var Me;return(Me=F.value)==null?void 0:Me.click()})},IP),g.value?(H(),q("span",BP,[it(B(g.value.name)+" ",1),c("button",{onClick:ge[9]||(ge[9]=ne=>g.value=null)},"\xD7")])):(H(),q("span",UP,"DeepSeek \u519C\u4E1A\u667A\u80FD\u4F53")),c("button",{class:$e(["voice",{recording:m.value}]),title:"\u8BED\u97F3\u8F93\u5165",onClick:Ht},OP,2),c("button",{class:"send",disabled:!i.value.trim()||s.value,"aria-label":"\u53D1\u9001",onClick:ge[10]||(ge[10]=ne=>Ee())},HP,8,kP)])]),c("div",$P,[(H(),q(He,null,pt(G,ne=>c("button",{key:ne,onClick:Me=>Ee(ne)},B(ne),9,VP)),64))])]))]}),_:1}),c("footer",{class:$e(["action-dock",{compact:K($)}])},[c("button",{class:$e({active:x.value}),onClick:ye},m8,2),c("button",{onClick:ge[17]||(ge[17]=te=>{var ne;return(ne=I.value)==null?void 0:ne.click()})},v8),c("button",{class:$e({active:_.value}),onClick:xn},x8,2),c("button",{onClick:ge[18]||(ge[18]=te=>p.value="apps")},M8)],2),tt(Kt,{name:"shelf"},{default:qt(()=>[x.value?(H(),q("nav",A8,[c("button",{class:"shelf-add",title:"\u65B0\u5EFA\u9762\u677F","aria-label":"\u65B0\u5EFA\u9762\u677F",onClick:pe},"\uFF0B"),S8,K(le).length?at("",!0):(H(),q("span",w8,"\u8FD8\u6CA1\u6709\u9762\u677F")),(H(!0),q(He,null,pt(K(le),te=>{var ne;return H(),q("div",{key:te.id,class:$e(["shelf-item",{active:((ne=K(Y))==null?void 0:ne.id)===te.id&&K($)}])},[c("button",{class:"shelf-open",onClick:Me=>ze(te.id)},[c("span",null,B(te.icon),1),c("b",null,B(te.name),1)],8,T8),c("button",{class:$e(["shelf-delete",{confirming:A.value===te.id}]),"aria-label":A.value===te.id?`\u786E\u8BA4\u5220\u9664${te.name}`:`\u5220\u9664${te.name}`,title:A.value===te.id?"\u518D\u6B21\u70B9\u51FB\u786E\u8BA4\u5220\u9664":"\u5220\u9664\u9762\u677F",onClick:Me=>et(te.id)},B(A.value===te.id?"\u786E\u8BA4":"\xD7"),11,C8)],2)}),128))])):at("",!0)]),_:1}),c("input",{ref_key:"fileInput",ref:F,class:"sr-only",type:"file",accept:".txt,.md,.csv,.json",onChange:wt},null,544),c("input",{ref_key:"workbenchFileInput",ref:I,class:"sr-only",type:"file",accept:".json",onChange:Qn},null,544),tt(Kt,{name:"overlay"},{default:qt(()=>[p.value?(H(),q("div",{key:0,class:"feature-overlay",onClick:ge[31]||(ge[31]=nn(te=>p.value=null,["self"]))},[p.value==="files"&&v.value?(H(),gn(YF,{key:0,title:v.value.title,content:v.value.content,"updated-at":v.value.updatedAt,"image-map":ae,onClose:ge[19]||(ge[19]=te=>v.value=null),onAttach:ge[20]||(ge[20]=te=>tn(v.value))},null,8,["title","content","updated-at"])):(H(),q("section",{key:1,class:$e(["feature-card",{"library-card":p.value==="files"}])},[c("button",{class:"feature-close",onClick:ge[21]||(ge[21]=te=>p.value=null)},"\xD7"),p.value==="files"?(H(),q(He,{key:0},[D8,R8,F8,c("div",P8,[(H(),q(He,null,pt(re,te=>c("button",{key:te.id,class:"document-row",onClick:ne=>Ct(te)},[I8,c("span",B8,[c("strong",null,B(te.title),1),c("small",null,B(te.description),1),c("em",null,B(te.audience)+" \xB7 "+B(te.pages)+" \xB7 "+B(te.updatedAt),1)]),U8],8,L8)),64))]),g.value?(H(),q("div",N8,[c("div",null,[O8,c("strong",null,B(g.value.name),1)]),c("button",{onClick:ge[22]||(ge[22]=te=>g.value=null)},"\u79FB\u9664")])):at("",!0),c("button",{class:"secondary-action",onClick:ge[23]||(ge[23]=te=>{var ne;return(ne=F.value)==null?void 0:ne.click()})},[k8,it("\u4E0A\u4F20\u81EA\u5DF1\u7684\u6587\u4EF6")])],64)):p.value==="projects"?(H(),q(He,{key:1},[z8,H8,c("p",null,"\u5F53\u524D\u9879\u76EE\u5305\u542B "+B(T.value.length)+" \u4E2A\u95EE\u519C\u4F1A\u8BDD\uFF0C\u5DF2\u81EA\u52A8\u4FDD\u5B58\u5728\u672C\u673A\u6D4F\u89C8\u5668\u3002",1),c("button",{class:"primary-action",onClick:ge[24]||(ge[24]=te=>{W(),p.value=null})},"\u65B0\u5EFA\u9879\u76EE\u4F1A\u8BDD")],64)):p.value==="filters"?(H(),q(He,{key:2},[$8,V8,c("div",G8,[(H(),q(He,null,pt([{m:"overview",n:"\u519C\u573A\u603B\u89C8"},{m:"environment",n:"\u73AF\u5883\u4E2D\u5FC3"},{m:"devices",n:"\u8BBE\u5907\u4E2D\u5FC3"},{m:"irrigation",n:"\u704C\u6E89\u4E2D\u5FC3"},{m:"crops",n:"\u4F5C\u7269\u4E2D\u5FC3"},{m:"alerts",n:"\u544A\u8B66\u4E2D\u5FC3"}],te=>c("button",{key:te.m,onClick:ne=>{Ee(`\u6253\u5F00${te.n}`),p.value=null}},B(te.n),9,W8)),64))])],64)):(H(),q(He,{key:3},[X8,j8,c("div",q8,[c("button",{onClick:ge[25]||(ge[25]=te=>{Ee("\u5206\u6790\u4ECA\u65E5\u519C\u573A\u72B6\u6001"),p.value=null})},"\u667A\u80FD\u603B\u89C8"),c("button",{onClick:ge[26]||(ge[26]=te=>{Ee("\u67E5\u770B\u519C\u573A\u73AF\u5883"),p.value=null})},"\u73AF\u5883\u76D1\u6D4B"),c("button",{onClick:ge[27]||(ge[27]=te=>{Ee("\u67E5\u770B\u8BBE\u5907\u72B6\u6001"),p.value=null})},"\u8BBE\u5907\u7BA1\u7406"),c("button",{onClick:ge[28]||(ge[28]=te=>{Ee("\u751F\u6210\u704C\u6E89\u65B9\u6848"),p.value=null})},"\u667A\u80FD\u704C\u6E89"),c("button",{onClick:ge[29]||(ge[29]=te=>K(e).push("/workspaces/farm-01"))},"\u6570\u5B57\u5B6A\u751F"),c("button",{onClick:ge[30]||(ge[30]=te=>{Ee("\u67E5\u770B\u5168\u90E8\u544A\u8B66"),p.value=null})},"\u544A\u8B66\u4E2D\u5FC3")])],64))],2))])):at("",!0)]),_:1})])],2)}}});var Y8=zt(K8,[["__scopeId","data-v-fa10c7b0"]]);const yn={stem:new lt({color:3500604,roughness:.82}),youngStem:new lt({color:6000973,roughness:.78}),tomatoRed:new Kn({color:13123378,roughness:.42,clearcoat:.24}),tomatoOrange:new Kn({color:14912820,roughness:.46,clearcoat:.2}),berryRed:new Kn({color:12136245,roughness:.5,clearcoat:.18}),berryYoung:new lt({color:15193197,roughness:.68}),cucumber:new Kn({color:3897660,roughness:.62,clearcoat:.08}),flowerWhite:new lt({color:15855329,roughness:.75,side:Sn}),flowerYellow:new lt({color:15056181,roughness:.7,side:Sn}),tray:new lt({color:2436393,roughness:.72}),substrate:new lt({color:3417628,roughness:1})},J8=new ci(.085,18,14),og=new ci(.064,16,12),ag=new fa(.078,.045,5),Z8=new Kl(.062,.36,8,16),Q8=new ci(.055,10,6),eL=new Rt(.055,.045,.055,10);function tL(n){let e=n>>>0;return()=>{e+=1831565813;let t=e;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}}function Hi(n,e,t){const i=new je(n,e);return i.position.copy(t),i.castShadow=!0,i.receiveShadow=!0,i}function lr(n,e,t=yn.stem){return Hi(new Yl(new yd(n),Math.max(8,n.length*7),e,7,!1),t,new L)}function nL(n){n.traverse(e=>{var i;const t=e;if(!!t.isMesh){if(Array.isArray(t.material))t.material=t.material.map(s=>{var o;const r=s.clone();return(o=r.color)==null||o.multiply(new ut(11704920)),r});else if(t.material){const s=t.material.clone();(i=s.color)==null||i.multiply(new ut(11704920)),t.material=s}}})}function vo(n,e,t,i){const s=n.clone(!0);return s.scale.copy(e),s.rotation.y=t,s.traverse(r=>{const o=r;if(!o.isMesh)return;o.castShadow=!0,o.receiveShadow=!0,(Array.isArray(o.material)?o.material:[o.material]).forEach(l=>{var d;const u=l;u.side=Sn,u.alphaTest=.18,(d=u.color)==null||d.set(8894335),u.roughness=.72})}),i!=="normal"&&nL(s),s}function Cd(n,e=1){const t=new vt,i=n==="white"?yn.flowerWhite:yn.flowerYellow;for(let r=0;r<5;r++){const o=r/5*Math.PI*2,a=Hi(Q8,i,new L(Math.cos(o)*.055,Math.sin(o)*.055,0));a.scale.set(1.35,.58,.25),a.rotation.z=o,t.add(a)}const s=Hi(og,yn.flowerYellow,new L(0,0,.018));return s.scale.setScalar(.38),t.add(s),t.scale.setScalar(e),t}function iL(n,e){const t=new vt,i=Hi(n<.08?og:J8,e?yn.tomatoRed:yn.tomatoOrange,new L);i.scale.setScalar(n/.085);const s=Hi(ag,yn.youngStem,new L(0,n*.88,0));return s.rotation.x=Math.PI,s.scale.setScalar(n/.085),t.add(i,s),t}function sL(n){const e=[new Ue(.012,-.13),new Ue(.075,-.08),new Ue(.098,.01),new Ue(.082,.1),new Ue(.026,.145),new Ue(0,.15)],t=new vt,i=Hi(new ql(e,20),n?yn.berryRed:yn.berryYoung,new L);i.rotation.z=Math.PI;const s=Hi(ag,yn.youngStem,new L(0,.145,0));return s.rotation.x=Math.PI,t.add(i,s),t}function Cp(n,e,t,i=!1){const s=new vt,r=i?1.25:2.5,o=(e()-.5)*.16;s.add(lr([new L(0,0,0),new L(o*.35,r*.34,0),new L(-o*.4,r*.7,.04),new L(o,r,0)],i?.032:.025));const a=vo(n,i?new L(.9,1.15,.9):new L(.66,2.05,.66),e()*Math.PI*2,t);a.position.y=i?.1:.12,s.add(a);const l=i?4:5;for(let u=0;u<l;u++){const d=u%2?1:-1,h=.38+u*(i?.19:.39),f=new L(d*(.24+e()*.08),h-.05,(e()-.5)*.16);s.add(lr([new L(0,h+.08,0),f],.012,yn.youngStem));const p=i?3:4;for(let g=0;g<p;g++){const v=iL(i?.095:.072,u+g>1);v.position.copy(f).add(new L((g-1.5)*.075,-.06-g%2*.06,(g%2?1:-1)*.05)),v.rotation.set(e()*.3,e()*Math.PI,e()*.2),s.add(v)}if(!i&&u%2===0){const g=Cd("yellow",.65);g.position.set(-d*.18,h+.15,.08),g.rotation.y=d*Math.PI/2,s.add(g)}}return i||s.add(lr([new L(0,0,0),new L(0,3.55,0)],.006,yn.flowerWhite)),s}function rL(n,e,t){const i=new vt,s=vo(n,new L(.72,.48,.72),e()*Math.PI*2,t);s.position.y=.04,i.add(s);for(let r=0;r<7;r++){const o=r/7*Math.PI*2+e()*.22,a=.2+e()*.18,l=new L(Math.cos(o)*a*.58,.28+e()*.12,Math.sin(o)*a*.58),u=new L(Math.cos(o)*a,.08+e()*.12,Math.sin(o)*a);if(i.add(lr([new L(0,.14,0),l,u],.009,yn.youngStem)),r<5){const d=sL(r!==0);d.position.copy(u),d.scale.setScalar(.72+e()*.18),d.rotation.z=(e()-.5)*.25,i.add(d)}else{const d=Cd("white",.72);d.position.copy(u),d.rotation.x=-Math.PI/2+.25,i.add(d)}}return i}function oL(n,e,t){const i=new vt,s=(e()-.5)*.2;i.add(lr([new L(0,0,0),new L(.06,.75,0),new L(-.05,1.5,.04),new L(s,2.65,0)],.026));const r=vo(n,new L(.8,2.28,.8),e()*Math.PI*2,t);r.position.y=.08,i.add(r);for(let o=0;o<5;o++){const a=o%2?1:-1,l=.48+o*.42,u=new L(a*(.2+e()*.13),l,(e()-.5)*.12);i.add(lr([new L(0,l+.12,0),u],.012,yn.youngStem));const d=Hi(Z8,yn.cucumber,u.clone().add(new L(0,-.2,.03)));if(d.rotation.z=.08*a,d.scale.setScalar(.85+e()*.25),i.add(d),o>2){const h=Cd("yellow",.72);h.position.copy(u).add(new L(a*.08,.08,0)),h.rotation.y=a*Math.PI/2,i.add(h)}}return i.add(lr([new L(0,0,0),new L(0,3.55,0)],.006,yn.flowerWhite)),i}function aL(n,e,t){const i=new vt,s=Hi(new mt(1.02,.09,.78,2,1,2),yn.tray,new L(0,.045,0));i.add(s);for(let r=-2;r<=2;r++)for(let o=-1;o<=1;o++){const a=new L(r*.19,.1,o*.23);i.add(Hi(eL,yn.substrate,a))}for(let r=-1;r<=1;r++){const o=vo(n,new L(.18,.2+e()*.045,.22),e()*Math.PI*2,t);o.position.set(r*.3,.115,0),i.add(o)}return i}function Dp(n,e,t){const i=new vt,s=vo(n,new L(.72,.58,.72),e()*Math.PI*2,t),r=vo(n,new L(.58,.44,.58),e()*Math.PI*2,t);return r.rotation.z=.18,r.position.set(.03,.03,-.02),i.add(s,r),i}async function lL(n){var a;const t=(a=(await new K0().loadAsync(n)).scene.getObjectByName("potted_plant_02_leaves"))==null?void 0:a.clone(!0);if(!t)throw new Error("\u9AD8\u7CBE\u5EA6\u53F6\u7247\u8282\u70B9\u4E0D\u5B58\u5728");const i=new vt;i.add(t),i.updateMatrixWorld(!0);const s=new mn().setFromObject(i),r=s.getCenter(new L);t.position.x-=r.x,t.position.z-=r.z,t.position.y-=s.min.y,i.updateMatrixWorld(!0);const o=new mn().setFromObject(i).getSize(new L);return i.scale.setScalar(1/Math.max(o.y,.001)),i.updateMatrixWorld(!0),i}function Rp(n,e,t,i="normal"){const s=tL(t),r=(()=>{switch(n){case"tomato-vine":return Cp(e,s,i);case"strawberry":return rL(e,s,i);case"cucumber-vine":return oL(e,s,i);case"seedling-tray":return aL(e,s,i);case"bush-tomato":return Cp(e,s,i,!0);case"leafy-hydroponic":return Dp(e,s,i);default:return Dp(e,s,i)}})(),o=.92+s()*.16;return r.scale.multiplyScalar(o),r.rotation.y=(s()-.5)*.24,r}const Dd=n=>(Qt("data-v-b81f1514"),n=n(),en(),n),uL={key:0,class:"loading"},cL=Dd(()=>c("i",null,null,-1)),dL=Dd(()=>c("span",null,"\u6B63\u5728\u8F7D\u5165\u4E07\u9762\u7EA7 PBR \u4F5C\u7269\u8D44\u4EA7",-1)),hL=[cL,dL],fL={key:1,class:"loading error"},pL={class:"scene-meta"},mL=Dd(()=>c("div",{class:"hint"},"\u62D6\u62FD\u65CB\u8F6C\u3000\u6EDA\u8F6E\u7F29\u653E\u3000\u70B9\u51FB\u690D\u682A\u67E5\u770B\u6863\u6848",-1)),gL=It({__name:"GreenhouseTwinScene",props:{detail:null,selectedId:null},emits:["select"],setup(n,{emit:e}){const t=n,i=Ce(),s=Ce(!0),r=Ce("");let o,a,l,u,d=0,h;const f=window.matchMedia("(prefers-reduced-motion: reduce)").matches,p=[],g=new Map,v=[];let _,m,E;const y=(T,G=.72,re=0)=>new lt({color:T,roughness:G,metalness:re});function x(T,G,re=0,ae=0,C=0){const J=new je(T,G);return J.position.set(re,ae,C),J.castShadow=!0,J.receiveShadow=!0,J}function M(){if(!o)return;const T=t.detail.scene,G=T.cropModel==="leafy-hydroponic"?7439993:5335370,re=x(new go(18,14),y(G,.96));re.rotation.x=-Math.PI/2,o.add(re);const ae=x(new go(1.75,13.5),y(11971990,1),0,.014,0);ae.rotation.x=-Math.PI/2,o.add(ae);const C=y(11454397,.25,.72);for(let ee=-6;ee<=6;ee+=1.5){const U=new yd([new L(-8,0,ee),new L(-6.6,3.35,ee),new L(0,5.2,ee),new L(6.6,3.35,ee),new L(8,0,ee)]);o.add(x(new Yl(U,32,.032,7,!1),C))}for(const ee of[-7.95,0,7.95]){const U=x(new Rt(.028,.028,12.3,7),C,ee,ee===0?5.16:.15,0);U.rotation.x=Math.PI/2,o.add(U)}const J=x(new mt(16.15,4.8,13.05),new Kn({color:14283496,transparent:!0,opacity:.1,roughness:.15,transmission:.3,side:Sn,depthWrite:!1}),0,2.38,0);o.add(J);const $=T.bedCount>4?1.25:1.65;for(let ee=0;ee<T.bedCount;ee++){const U=T.bedCount===1?0:-6.2+ee*(12.4/(T.bedCount-1)),N=T.cropModel==="leafy-hydroponic",le=T.cropModel==="seedling-tray",Y=x(new mt($,N?.62:le?.72:.32,11.5),y(N?14936031:le?8031105:5912610,N?.35:.92,N?.14:0),U,N?.52:le?.58:.17,0);if(o.add(Y),!le){const ce=x(new Rt(.032,.032,11.35,7),y(N?6195320:1780519,.6),U,N?.84:.37,0);ce.rotation.x=Math.PI/2,o.add(ce)}}if(["tomato-vine","cucumber-vine"].includes(T.cropModel))for(let ee=0;ee<T.bedCount;ee++){const U=-6.2+ee*(12.4/Math.max(1,T.bedCount-1)),N=x(new Rt(.018,.018,11.6,6),y(8163720,.35,.6),U,3.7,0);N.rotation.x=Math.PI/2,o.add(N)}}function A(){return t.detail.scene.cropModel==="leafy-hydroponic"?.86:t.detail.scene.cropModel==="seedling-tray"?.96:.34}async function F(){if(!(!o||!l))try{const T=await lL("/platform/assets/models/potted-plant-02.glb"),G=Math.min(8,l.capabilities.getMaxAnisotropy());T.traverse($=>{const ee=$;(ee.isMesh?Array.isArray(ee.material)?ee.material:[ee.material]:[]).forEach(N=>{const le=N;for(const Y of[le.map,le.normalMap,le.roughnessMap])Y&&(Y.anisotropy=G)})}),t.detail.plants.forEach(($,ee)=>{const U=new vt,N=Rp(t.detail.scene.cropModel,T,ee*97+31,$.status);U.add(N),U.position.set($.positionX,A(),$.positionZ),U.userData.id=$.id,U.traverse(le=>{le.userData.id=$.id,le.isMesh&&p.push(le)}),g.set($.id,U),o.add(U)});const re=t.detail.plants.map($=>new Ue($.positionX,$.positionZ)),ae=t.detail.scene.bedCount,C=ae>4?[-3.1,-1.55,0,1.55,3.1]:[-3.15,-1.55,1.55,3.15];let J=0;for(let $=0;$<ae;$++){const ee=ae===1?0:-6.2+$*(12.4/(ae-1));for(const U of C){if(re.some(le=>le.distanceTo(new Ue(ee,U))<.62))continue;const N=Rp(t.detail.scene.cropModel,T,1e3+J*131,"normal");N.position.set(ee,A(),U),N.traverse(le=>{const Y=le;Y.isMesh&&(Y.castShadow=J%2===0)}),o.add(N),J++}}s.value=!1,X(!1)}catch(T){s.value=!1,r.value=T instanceof Error?T.message:"\u9AD8\u7CBE\u5EA6\u4F5C\u7269\u8D44\u4EA7\u52A0\u8F7D\u5931\u8D25"}}function I(){const T=new vt,G=x(new Cs(.42,.05,8,26),y(9414815,.3,.7)),re=new vt;for(let ae=0;ae<4;ae++){const C=x(new mt(.28,.055,.09),y(4684645,.48),.17,0,0);C.rotation.z=ae*Math.PI/2,re.add(C)}return re.add(x(new Rt(.07,.07,.1,10),y(2971976,.4),0,0,0)),G.rotation.y=Math.PI/2,re.rotation.y=Math.PI/2,T.add(G,re),v.push(re),T}function b(T){const G=new vt,re=y(9546401,.3,.65);if(T==="fan")return I();if(T==="fertigation"||T==="oxygenator"||T==="dehumidifier")return G.add(x(new Rt(.38,.44,1.15,18),re,0,.58,0)),G.add(x(new mt(.48,.48,.46),y(3235148,.4),.52,.3,0)),G.add(x(new Rt(.035,.035,1.05,7),y(2648920,.45),.24,.2,0)),G;if(T==="irrigation"){G.add(x(new Rt(.08,.08,1.1,9),re,0,.3,0)),G.children[0].rotation.z=Math.PI/2;for(let ae=-2;ae<=2;ae++)G.add(x(new Rt(.055,.055,.45,8),y(ae===0?13671234:4684905,.5),ae*.2,.3,0));return G}if(T==="grow-light"){for(let ae=-2;ae<=2;ae++)G.add(x(new mt(1.6,.05,.08),new lt({color:14542039,emissive:14988227,emissiveIntensity:.9}),0,ae*.22,0));return G}if(T==="camera"){G.add(x(new mt(.36,.23,.28),y(14147546,.3),0,0,0));const ae=x(new Rt(.08,.08,.08,12),y(1584167,.2),0,0,.17);return ae.rotation.x=Math.PI/2,G.add(ae),G}return T==="vent"?(G.add(x(new mt(.7,1.1,.35),y(7310720,.35,.4),0,.55,0)),G):T==="trap"?(G.add(x(new mt(.48,.62,.025),new lt({color:14993742,emissive:7035666,emissiveIntensity:.3}),0,.32,0)),G):(G.add(x(new Rt(.025,.035,1.8,7),re,0,.9,0)),G.add(x(new mt(.28,.38,.22),y(3235661,.35),0,1.65,0)),G)}function w(){!o||t.detail.devices.forEach(T=>{const G=b(T.category);G.position.set(T.positionX,T.positionY,T.positionZ),G.traverse(re=>{re.isMesh&&(re.castShadow=!0,re.receiveShadow=!0)}),o.add(G)})}function oe(T){if(!a||!u)return;const G=new mn().setFromObject(T),re=G.getCenter(new L);re.y=Math.max(.6,re.y);const ae=a.position.clone().sub(u.target).normalize(),C=Math.max(3.8,G.getSize(new L).length()*2.2);m=re,E=re.clone().add(ae.multiplyScalar(C)),f&&(u.target.copy(m),a.position.copy(E),m=void 0,E=void 0)}function X(T=!1){if(!o)return;_&&(o.remove(_),_.geometry.dispose());const G=t.selectedId?g.get(t.selectedId):void 0;G&&(_=new Sc(new mn().setFromObject(G).expandByScalar(.08),new ut(6942095)),o.add(_),T&&oe(G))}function z(){if(!i.value)return;o=new F0,o.background=new ut(11324354),o.fog=new jl(11324354,20,43),a=new Fn(43,i.value.clientWidth/i.value.clientHeight,.1,80),a.position.set(13.5,9.5,16.5),l=new fd({antialias:!0,powerPreference:"high-performance"}),l.setPixelRatio(Math.min(devicePixelRatio,1.5)),l.setSize(i.value.clientWidth,i.value.clientHeight),l.shadowMap.enabled=!0,l.shadowMap.type=od,l.outputColorSpace=dt,l.toneMapping=ad,l.toneMappingExposure=1.08,i.value.appendChild(l.domElement),u=new q0(a,l.domElement),u.enableDamping=!0,u.target.set(0,1.45,0),u.maxPolarAngle=Math.PI/2.03,u.minDistance=7,u.maxDistance=30,o.add(new X0(16056312,3492658,2.2));const T=new Sd(16774364,3.1);T.position.set(-8,15,8),T.castShadow=!0,T.shadow.mapSize.set(1024,1024),o.add(T),M(),F(),w();const G=new j0,re=new Ue;l.domElement.addEventListener("click",C=>{const J=l.domElement.getBoundingClientRect();re.set((C.clientX-J.left)/J.width*2-1,-(C.clientY-J.top)/J.height*2+1),G.setFromCamera(re,a);const $=G.intersectObjects(p,!0)[0];if($!=null&&$.object.userData.id){const ee=$.object.userData.id,U=g.get(ee);U&&oe(U),e("select",ee)}}),h=new ResizeObserver(()=>{!i.value||!l||!a||(l.setSize(i.value.clientWidth,i.value.clientHeight),a.aspect=i.value.clientWidth/i.value.clientHeight,a.updateProjectionMatrix())}),h.observe(i.value);const ae=()=>{d=requestAnimationFrame(ae),f||v.forEach(C=>{C.rotation.x+=.025}),m&&E&&a&&u&&(u.target.lerp(m,.09),a.position.lerp(E,.09),u.target.distanceTo(m)<.015&&a.position.distanceTo(E)<.02&&(m=void 0,E=void 0)),u==null||u.update(),l==null||l.render(o,a)};ae()}return _n(()=>t.selectedId,()=>X(!0)),ks(z),$i(()=>{cancelAnimationFrame(d),h==null||h.disconnect(),u==null||u.dispose(),l==null||l.dispose(),l==null||l.domElement.remove(),o==null||o.traverse(T=>{var re,ae,C,J;const G=T;(ae=(re=G.geometry)==null?void 0:re.dispose)==null||ae.call(re),Array.isArray(G.material)?G.material.forEach($=>$.dispose()):(J=(C=G.material)==null?void 0:C.dispose)==null||J.call(C)})}),(T,G)=>(H(),q("div",{ref_key:"host",ref:i,class:"twin-host"},[s.value?(H(),q("div",uL,hL)):r.value?(H(),q("div",fL,[c("span",null,B(r.value),1)])):at("",!0),c("div",pL,[c("b",null,B(n.detail.scene.structure),1),c("span",null,"\u9AD8\u7CBE\u5EA6 PBR / "+B(n.detail.scene.bedCount)+" \u5E8A\u4F4D / "+B(n.detail.scene.nominalPlantCount.toLocaleString())+" \u682A",1)]),mL],512))}});var _L=zt(gL,[["__scopeId","data-v-b81f1514"]]);const St=n=>(Qt("data-v-427d6fb7"),n=n(),en(),n),vL={class:"greenhouse-page"},yL={class:"topbar"},EL={class:"brand"},xL=St(()=>c("span",null,"\u8FD4\u56DE\u519C\u573A",-1)),bL=St(()=>c("i",null,null,-1)),ML=St(()=>c("small",null,"GREENHOUSE DIGITAL TWIN",-1)),AL={class:"top-actions"},SL={class:"view-toggle"},wL=St(()=>c("span",{class:"live"},[c("i"),it("\u6570\u636E\u5B9E\u65F6\u540C\u6B65")],-1)),TL={class:"scene"},CL={key:"real",class:"real-view"},DL=["poster"],RL=["src"],FL=St(()=>c("i",null,null,-1)),PL=St(()=>c("div",{class:"scan-line"},null,-1)),LL={class:"environment-strip"},IL={class:"data-sidebar","aria-label":"\u5927\u68DA\u6570\u636E\u4FA7\u680F"},BL=["aria-expanded","aria-label","title"],UL=St(()=>c("span",{"aria-hidden":"true"},null,-1)),NL=[UL],OL={class:"sidebar-scroll"},kL={class:"summary"},zL={class:"summary-copy"},HL=St(()=>c("small",null,"\u5065\u5EB7\u5EA6",-1)),$L=St(()=>c("dt",null,"\u683D\u57F9",-1)),VL=St(()=>c("dt",null,"\u89C4\u6A21",-1)),GL=St(()=>c("dt",null,"\u540C\u6B65",-1)),WL={class:"sidebar-tabs","aria-label":"\u5927\u68DA\u6570\u636E\u89C6\u56FE",role:"tablist"},XL=["aria-selected","tabindex"],jL=["aria-selected","tabindex"],qL=["aria-selected","tabindex"],KL={key:0,id:"greenhouse-panel-overview",class:"panel overview-panel",role:"tabpanel","aria-labelledby":"greenhouse-tab-overview"},YL={class:"profile-section"},JL=St(()=>c("header",null,[c("div",null,[c("h3",null,"\u751F\u4EA7\u753B\u50CF"),c("small",null,"\u7A7A\u95F4\u5EFA\u6A21\u53C2\u6570\u4E0E\u5F53\u524D\u4F5C\u4E1A")])],-1)),ZL={class:"profile-grid"},QL=St(()=>c("span",null,"\u68DA\u578B",-1)),e7=St(()=>c("span",null,"\u5E8A\u4F4D / \u884C\u6570",-1)),t7=St(()=>c("span",null,"\u704C\u6E89\u7CFB\u7EDF",-1)),n7=St(()=>c("span",null,"\u5728\u7EBF\u8BBE\u5907",-1)),i7={class:"trend-section"},s7=St(()=>c("h3",null,"\u5E73\u5747\u682A\u9AD8",-1)),r7=St(()=>c("em",null," cm",-1)),o7={class:"chart"},a7={viewBox:"0 0 300 92",preserveAspectRatio:"none"},l7=["d"],u7=["d"],c7={class:"zones-section"},d7=St(()=>c("header",null,[c("div",null,[c("h3",null,"\u5206\u533A\u4F5C\u4E1A"),c("small",null,"\u8986\u76D6\u7387\u6309\u5F53\u524D\u79CD\u690D\u9762\u79EF\u8BA1\u7B97")])],-1)),h7={class:"zones"},f7={class:"ai"},p7=St(()=>c("span",null,"AI",-1)),m7=St(()=>c("b",null,"\u4ECA\u65E5\u8C03\u63A7\u5EFA\u8BAE",-1)),g7={class:"alert-section"},_7=St(()=>c("h3",null,"\u6700\u8FD1\u544A\u8B66",-1)),v7={key:0,class:"alerts"},y7=St(()=>c("i",null,"!",-1)),E7={key:1,class:"empty"},x7={key:1,id:"greenhouse-panel-devices",class:"panel device-panel",role:"tabpanel","aria-labelledby":"greenhouse-tab-devices"},b7={class:"panel-heading"},M7=St(()=>c("div",null,[c("h3",null,"\u68DA\u5185\u8BBE\u5907"),c("p",null,"\u8BBE\u5907\u5750\u6807\u5DF2\u540C\u6B65\u5230\u6570\u5B57\u5B6A\u751F\u6A21\u578B\u3002")],-1)),A7={class:"devices"},S7={class:"device-index"},w7={class:"device-copy"},T7=["title"],C7={key:2,id:"greenhouse-panel-plants",class:"panel plant-panel",role:"tabpanel","aria-labelledby":"greenhouse-tab-plants"},D7={class:"panel-heading"},R7=St(()=>c("div",null,[c("h3",null,"\u690D\u682A\u5DE1\u68C0"),c("p",null,"\u9009\u62E9\u6837\u672C\u540E\uFF0C\u6A21\u578B\u5C06\u5B9A\u4F4D\u5230\u5BF9\u5E94\u690D\u682A\u3002")],-1)),F7={key:0,class:"selected-profile"},P7={class:"profile-title"},L7={class:"profile-values"},I7=St(()=>c("span",null,"\u5065\u5EB7\u5EA6",-1)),B7=St(()=>c("span",null,"\u682A\u9AD8",-1)),U7=St(()=>c("small",null,"cm",-1)),N7=St(()=>c("span",null,"\u57FA\u8D28\u542B\u6C34",-1)),O7=St(()=>c("small",null,"%",-1)),k7=St(()=>c("span",null,"\u682A\u9F84",-1)),z7=St(()=>c("small",null," \u5929",-1)),H7=St(()=>c("span",null,"\u53F6\u9762\u79EF\u6307\u6570",-1)),$7=St(()=>c("span",null,"\u5EFA\u6A21\u5750\u6807",-1)),V7={class:"zone-strip"},G7={class:"plants"},W7=["aria-label","aria-pressed","onClick"],X7={key:1,class:"state-card"},j7={key:2,class:"state-card error"},q7=St(()=>c("b",null,"\u65E0\u6CD5\u8FDB\u5165\u5927\u68DA",-1)),K7=It({__name:"GreenhouseInteriorView",setup(n){const e=Jc(),t=_a(),i=Ce(),s=Ce(!0),r=Ce(""),o=Ce("real"),a=Ce(null),l=Ce(!0),u=Ce("overview"),d=Ce(),h=Ce("loading");let f=0;const p=Qe(()=>String(e.params.id||"farm-01")),g=Qe(()=>String(e.params.greenhouseId||"gh-01")),v=Qe(()=>{var b;return(b=i.value)==null?void 0:b.plants.find(w=>w.id===a.value)}),_=Qe(()=>{var b;return((b=i.value)==null?void 0:b.devices.filter(w=>w.online).length)||0}),m=Qe(()=>{var b;return((b=i.value)==null?void 0:b.plants.filter(w=>w.status!=="normal").length)||0}),E=Qe(()=>i.value?new Date(i.value.generatedAt).toLocaleTimeString("zh-CN",{hour:"2-digit",minute:"2-digit",second:"2-digit"}):""),y=Qe(()=>{var z;const b=((z=i.value)==null?void 0:z.heightTrend)||[];if(!b.length)return"";const w=b.map(T=>T.height),oe=Math.min(...w)-2,X=Math.max(...w)+2;return b.map((T,G)=>`${G?"L":"M"}${10+G*46},${82-(T.height-oe)/Math.max(1,X-oe)*65}`).join(" ")});async function x(b=!1){var w;b||(s.value=!0);try{i.value=await m3(g.value,p.value),r.value="",a.value||(a.value=((w=i.value.plants[0])==null?void 0:w.id)||null),await jn(),o.value==="real"&&F()}catch(oe){r.value=oe instanceof Error?oe.message:"\u5927\u68DA\u6570\u636E\u52A0\u8F7D\u5931\u8D25"}finally{s.value=!1}}function M(){t.push(`/workspaces/${p.value}`)}function A(b){a.value=b,u.value="plants"}async function F(){await jn();const b=d.value;if(!!b){b.muted=!0,b.defaultMuted=!0,b.playsInline=!0,h.value="loading";try{await b.play(),h.value="playing"}catch{h.value="paused"}}}function I(){h.value="error"}return _n(g,()=>x()),_n(o,b=>{b==="real"&&F()}),ks(()=>{x(),f=window.setInterval(()=>x(!0),3e4)}),Ul(()=>window.clearInterval(f)),(b,w)=>{var oe,X,z;return H(),q("main",vL,[c("header",yL,[c("div",EL,[c("button",{class:"back",onClick:M},[it("\u2190"),xL]),tt(Zc,{compact:""}),bL,c("div",null,[ML,c("strong",null,B(((oe=i.value)==null?void 0:oe.greenhouse.name)||"\u5927\u68DA\u5185\u90E8"),1)])]),c("div",AL,[c("div",SL,[c("button",{class:$e({active:o.value==="real"}),onClick:w[0]||(w[0]=T=>o.value="real")},"\u5B9E\u666F",2),c("button",{class:$e({active:o.value==="twin"}),onClick:w[1]||(w[1]=T=>o.value="twin")},"\u6570\u5B57\u5B6A\u751F",2)]),wL,tt(id)])]),i.value?(H(),q("section",{key:0,class:$e(["workspace",{"sidebar-closed":!l.value}])},[c("div",TL,[tt(Kt,{name:"scene",mode:"out-in"},{default:qt(()=>[o.value==="real"?(H(),q("div",CL,[c("video",{ref_key:"realVideo",ref:d,autoplay:"",muted:"",loop:"",playsinline:"",preload:"auto",poster:`${b.$router.options.history.base}assets/media/greenhouse-monitor-poster.jpg`,onPlaying:w[2]||(w[2]=T=>h.value="playing"),onPause:w[3]||(w[3]=T=>h.value="paused"),onError:I},[c("source",{src:`${b.$router.options.history.base}assets/media/greenhouse-monitor.mp4`,type:"video/mp4"},null,8,RL)],40,DL),h.value==="paused"?(H(),q("button",{key:0,class:"video-play",onClick:F},"\u25B6 \u64AD\u653E\u68DA\u5185\u5B9E\u666F")):at("",!0),c("div",{class:$e(["camera-status",h.value])},[FL,it(B(h.value==="error"?"\u5B9E\u666F\u89C6\u9891\u6682\u4E0D\u53EF\u7528 \xB7 \u5DF2\u663E\u793A\u6700\u8FD1\u753B\u9762":h.value==="playing"?"\u68DA\u5185\u6444\u50CF\u5934 \xB7 AI \u8BC6\u522B\u5728\u7EBF":"\u6B63\u5728\u8FDE\u63A5\u68DA\u5185\u6444\u50CF\u5934"),1)],2),PL])):(H(),gn(_L,{key:`twin-${i.value.greenhouse.id}`,detail:i.value,"selected-id":a.value,onSelect:A},null,8,["detail","selected-id"]))]),_:1}),c("div",LL,[(H(!0),q(He,null,pt(i.value.metrics,T=>(H(),q("article",{key:T.key,class:$e(T.tone)},[c("small",null,B(T.label),1),c("b",null,[it(B(T.value),1),c("em",null,B(T.unit),1)]),c("span",null,B(T.note),1)],2))),128))])]),c("aside",IL,[c("button",{class:"collapse","aria-expanded":l.value,"aria-label":l.value?"\u6536\u8D77\u5927\u68DA\u6570\u636E\u4FA7\u680F":"\u5C55\u5F00\u5927\u68DA\u6570\u636E\u4FA7\u680F",title:l.value?"\u6536\u8D77\u6570\u636E\u4FA7\u680F":"\u5C55\u5F00\u6570\u636E\u4FA7\u680F",onClick:w[4]||(w[4]=T=>l.value=!l.value)},NL,8,BL),c("div",OL,[c("div",kL,[c("div",zL,[c("span",null,B(i.value.greenhouse.area)+" / "+B(i.value.scene.structure),1),c("h2",null,B(i.value.greenhouse.crop),1),c("p",null,B(i.value.greenhouse.stage)+"\u3000"+B(i.value.greenhouse.environment),1)]),c("div",{class:"health",style:Gn({"--health":i.value.greenhouse.health})},[c("b",null,B(i.value.greenhouse.health),1),HL],4),c("dl",null,[c("div",null,[$L,c("dd",null,B(i.value.scene.cultivationMode),1)]),c("div",null,[VL,c("dd",null,B(i.value.scene.nominalPlantCount.toLocaleString())+" \u682A",1)]),c("div",null,[GL,c("dd",null,B(K(E)),1)])])]),c("nav",WL,[c("button",{id:"greenhouse-tab-overview",role:"tab","aria-controls":"greenhouse-panel-overview","aria-selected":u.value==="overview",tabindex:u.value==="overview"?0:-1,class:$e({active:u.value==="overview"}),onClick:w[5]||(w[5]=T=>u.value="overview")},"\u603B\u89C8",10,XL),c("button",{id:"greenhouse-tab-devices",role:"tab","aria-controls":"greenhouse-panel-devices","aria-selected":u.value==="devices",tabindex:u.value==="devices"?0:-1,class:$e({active:u.value==="devices"}),onClick:w[6]||(w[6]=T=>u.value="devices")},[it("\u8BBE\u5907 "),c("span",null,B(K(_))+"/"+B(i.value.devices.length),1)],10,jL),c("button",{id:"greenhouse-tab-plants",role:"tab","aria-controls":"greenhouse-panel-plants","aria-selected":u.value==="plants",tabindex:u.value==="plants"?0:-1,class:$e({active:u.value==="plants"}),onClick:w[7]||(w[7]=T=>u.value="plants")},[it("\u690D\u682A "),c("span",null,B(i.value.plants.length),1)],10,qL)]),u.value==="overview"?(H(),q("div",KL,[c("section",YL,[JL,c("div",ZL,[c("div",null,[QL,c("b",null,B(i.value.scene.structure),1)]),c("div",null,[e7,c("b",null,B(i.value.scene.bedCount)+" / "+B(i.value.scene.rowCount),1)]),c("div",null,[t7,c("b",null,B(i.value.scene.irrigationMode),1)]),c("div",null,[n7,c("b",null,B(K(_))+"/"+B(i.value.devices.length),1)])])]),c("section",i7,[c("header",null,[c("div",null,[s7,c("small",null,B((X=i.value.plants[0])==null?void 0:X.cultivar)+"\uFF0C\u8FD1 7 \u65E5",1)]),c("b",null,[it(B((z=i.value.heightTrend[i.value.heightTrend.length-1])==null?void 0:z.height),1),r7])]),c("div",o7,[(H(),q("svg",a7,[c("path",{class:"area",d:`${K(y)} L286,92 L10,92Z`},null,8,l7),c("path",{d:K(y)},null,8,u7)])),c("div",null,[(H(!0),q(He,null,pt(i.value.heightTrend,T=>(H(),q("span",{key:T.date},B(T.date),1))),128))])])]),c("section",c7,[d7,c("div",h7,[(H(!0),q(He,null,pt(i.value.zones,T=>(H(),q("article",{key:T.id},[c("b",null,B(T.name),1),c("div",null,[c("span",null,B(T.task),1),c("em",null,B(T.health),1)]),c("small",null,B(T.crop)+"\u3000"+B(T.coverage)+"%",1)]))),128))])]),c("section",f7,[p7,c("div",null,[m7,c("p",null,B(i.value.aiSuggestion),1)])]),c("section",g7,[c("header",null,[c("div",null,[_7,c("small",null,B(i.value.alerts.length?"\u9700\u8981\u5728\u672C\u73ED\u6B21\u5185\u786E\u8BA4":"\u5F53\u524D\u8FD0\u884C\u5E73\u7A33"),1)]),c("b",null,B(i.value.alerts.length),1)]),i.value.alerts.length?(H(),q("div",v7,[(H(!0),q(He,null,pt(i.value.alerts,T=>(H(),q("article",{key:T.id},[y7,c("div",null,[c("b",null,B(T.title),1),c("small",null,B(T.time)+"\u3000"+B(T.status),1)])]))),128))])):(H(),q("p",E7,"\u5F53\u524D\u5927\u68DA\u6CA1\u6709\u672A\u5F52\u6863\u544A\u8B66"))])])):u.value==="devices"?(H(),q("div",x7,[c("header",b7,[M7,c("strong",null,[it(B(K(_)),1),c("small",null,"/"+B(i.value.devices.length)+" \u5728\u7EBF",1)])]),c("div",A7,[(H(!0),q(He,null,pt(i.value.devices,(T,G)=>(H(),q("article",{key:T.id},[c("div",S7,B(String(G+1).padStart(2,"0")),1),c("div",w7,[c("div",null,[c("b",null,B(T.name),1),c("span",{class:$e({running:T.enabled})},B(T.enabled?"\u8FD0\u884C":"\u5F85\u673A"),3)]),c("p",null,B(T.location)+"\u3000"+B(T.responsibility),1),c("small",null,B(T.value),1)]),c("i",{class:$e({online:T.online}),title:T.online?"\u5728\u7EBF":"\u79BB\u7EBF"},null,10,T7)]))),128))])])):(H(),q("div",C7,[c("header",D7,[R7,c("strong",null,[it(B(i.value.plants.length),1),c("small",null,B(K(m)?`${K(m)} \u682A\u9700\u5173\u6CE8`:"\u5168\u90E8\u6B63\u5E38"),1)])]),K(v)?(H(),q("div",F7,[c("div",P7,[c("span",null,B(K(v).id)+" / "+B(K(v).zone)+" \u533A",1),c("button",{"aria-label":"\u53D6\u6D88\u690D\u682A\u5B9A\u4F4D",onClick:w[8]||(w[8]=T=>a.value=null)},"\u53D6\u6D88\u5B9A\u4F4D")]),c("h3",null,B(K(v).cultivar),1),c("div",L7,[c("div",null,[I7,c("b",null,B(K(v).health),1)]),c("div",null,[B7,c("b",null,[it(B(K(v).height)+" ",1),U7])]),c("div",null,[N7,c("b",null,[it(B(K(v).soilMoisture),1),O7])]),c("div",null,[k7,c("b",null,[it(B(K(v).ageDays),1),z7])]),c("div",null,[H7,c("b",null,B(K(v).leafAreaIndex),1)]),c("div",null,[$7,c("b",null,B(K(v).positionX)+", "+B(K(v).positionZ),1)])])])):at("",!0),c("div",V7,[(H(!0),q(He,null,pt(i.value.zones,T=>(H(),q("div",{key:T.id},[c("b",null,B(T.id)+" \u533A",1),c("span",null,B(T.task),1),c("em",null,B(T.health),1)]))),128))]),c("div",G7,[(H(!0),q(He,null,pt(i.value.plants,T=>(H(),q("button",{key:T.id,"aria-label":`${T.id}\uFF0C${T.zone} \u533A\uFF0C\u5065\u5EB7\u5EA6 ${T.health}${T.status!=="normal"?"\uFF0C\u9700\u5173\u6CE8":""}`,"aria-pressed":a.value===T.id,class:$e({active:a.value===T.id,attention:T.status!=="normal"}),onClick:G=>{o.value="twin",A(T.id)}},[c("b",null,B(T.id),1),c("span",null,B(T.zone)+" \u533A",1),c("em",null,B(T.health),1)],10,W7))),128))])]))])])],2)):s.value?(H(),q("div",X7,[tt(Ns,{value:null,label:"\u540C\u6B65\u5927\u68DA\u6570\u636E","pending-label":"\u8FDE\u63A5\u6E29\u5BA4\u6570\u636E\u4E2D\u5FC3"})])):(H(),q("div",j7,[q7,c("p",null,B(r.value),1),c("button",{onClick:w[9]||(w[9]=T=>x())},"\u91CD\u65B0\u52A0\u8F7D"),c("button",{onClick:M},"\u8FD4\u56DE\u519C\u573A")]))])}}});var Y7=zt(K7,[["__scopeId","data-v-427d6fb7"]]);const Rd=ty({history:v1("/platform/"),routes:[{path:"/",redirect:"/workspaces/farm-01"},{path:"/assistant",component:Y8,meta:{title:"\u667A\u80FD\u95EE\u519C"}},{path:"/workspaces/:id",component:Tp,meta:{title:"\u6570\u636E\u5DE5\u4F5C\u53F0"}},{path:"/workspaces/:id/greenhouses/:greenhouseId",component:Y7,meta:{title:"\u5927\u68DA\u5185\u90E8"}},{path:"/digital-twin",component:Tp,meta:{title:"\u6570\u5B57\u5B6A\u751F"}},{path:"/:pathMatch(.*)*",redirect:"/workspaces/farm-01"}]});Rd.beforeEach(async()=>{const n=gr();if(!n)return window.location.replace("/#/sign-in"),!1;try{return ul(await n0(n)),!0}catch{return!1}});Rd.afterEach(n=>{document.title=`${String(n.meta.title||"\u6570\u636E\u5DE5\u4F5C\u53F0")} \xB7 \u7530\u8A00\u8015\u667A`});Xv(uy).use(Kv()).use(Rd).mount("#app");
