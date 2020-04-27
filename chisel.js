// Licensed under the MIT License
// https://github.com/craigahobbs/chisel/blob/master/LICENSE

export const nbsp = String.fromCharCode(160);
export const endash = String.fromCharCode(8211);

export function render(parent, elems, clear=true) {
    if (clear) {
        parent.innerHTML = '';
    }
    return appendElements(parent, elems);
}

export function createElement(elem) {
    let element = elem.text ? document.createTextNode(elem.text) : document.createElementNS(elem.ns, elem.tag);
    let attrs = elem.attrs;
    if (attrs) {
        let callback = attrs._callback;
        if (callback !== undefined) {
            attrs = {...attrs, '_callback': undefined};
        }
        for (let attr in attrs) {
            let value = attrs[attr];
            if (value !== undefined) {
                element.setAttribute(attr, value);
            }
        }
        if (callback !== undefined) {
            callback(element);
        }
    }
    return appendElements(element, elem.elems);
}

function appendElements(parent, elems) {
    if (Array.isArray(elems)) {
        for (let iElem = 0; iElem < elems.length; iElem++) {
            appendElements(parent, elems[iElem]);
        }
    } else if (elems) {
        parent.appendChild(createElement(elems));
    }
    return parent;
}

export function elem(tag, attrsOrElems, elems, ns) {
    let attrs = isDict(attrsOrElems) ? attrsOrElems : undefined;
    return {
        tag: tag,
        attrs: attrs || {},
        elems: (attrs ? elems : attrsOrElems) || [],
        ns: ns || 'http://www.w3.org/1999/xhtml'
    };
}

export function svgElem(tag, attrsOrElems, elems) {
    return elem(tag, attrsOrElems, elems, 'http://www.w3.org/2000/svg');
}

export function text(text_) {
    return {
        text: text_,
    };
}

export function href(hashParams, params, path) {
    hashParams = encodeParams(hashParams);
    params = encodeParams(params);
    path = path ? path : window.location.pathname;
    if (hashParams === null && params === null) {
        return path + '#';
    } else if (hashParams === null && params !== null) {
        return path + '?' + params;
    } else if (hashParams !== null && params === null) {
        return path + '#' + hashParams;
    }
    return path + '?' + params + '#' + hashParams;
}

export function encodeParams(params) {
    let items = [];
    if (undefined !== params) {
        let names = Object.keys(params).sort();
        names.forEach(function(name) {
            if (params[name] !== null && params[name] !== undefined) {
                items.push(encodeURIComponent(name) + '=' + encodeURIComponent(params[name]));
            }
        });
        names.forEach(function(name) {
            if (params[name] === null) {
                items.push(encodeURIComponent(name));
            }
        });
    }
    return items.length ? items.join('&') : null;
}

export function decodeParams(paramString) {
    let params = {},
        r = /([^&;=]+)=?([^&;]*)/g,
        d = function (s) { return decodeURIComponent(s.replace(/\+/g, " ")); },
        q = (paramString || window.location.hash.substring(1)),
        e;

    while ((e = r.exec(q)) !== null) {
        params[d(e[1])] = d(e[2]);
    }

    return params;
}

export function xhr(method, url, args) {
    args = args || {};
    let xhr_ = new XMLHttpRequest();
    xhr_.open(method, href(undefined, args.params, url));
    xhr_.responseType = args.responseType || 'json';
    xhr_.onreadystatechange = function () {
        if (XMLHttpRequest.DONE === xhr_.readyState) {
            if (200 === xhr_.status) {
                if (args.onok) {
                    args.onok(xhr_.response);
                }
            } else {
                if (args.onerror) {
                    args.onerror(xhr_.response);
                }
            }
        }
    };
    xhr_.send();
}

export function isDict(obj) {
    return !!obj && obj.constructor == Object;
}