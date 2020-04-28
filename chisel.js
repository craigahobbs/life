// Licensed under the MIT License
// https://github.com/craigahobbs/chisel/blob/master/LICENSE

export const nbsp = String.fromCharCode(160);
export const endash = String.fromCharCode(8211);

export function render(parent, elems, clear = true) {
    if (clear) {
        parent.innerHTML = '';
    }
    return appendElements(parent, elems);
}

export function createElement(elem) {
    const element = elem.text ? document.createTextNode(elem.text) : document.createElementNS(elem.ns, elem.tag);
    let attrs = elem.attrs;
    if (attrs) {
        const callback = attrs._callback;
        if (callback !== undefined) {
            attrs = {...attrs, '_callback': undefined};
        }
        for (const attr in attrs) {
            const value = attrs[attr];
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
    const attrs = isDict(attrsOrElems) ? attrsOrElems : undefined;
    return {
        'tag': tag,
        'attrs': attrs || {},
        'elems': (attrs ? elems : attrsOrElems) || [],
        'ns': ns || 'http://www.w3.org/1999/xhtml'
    };
}

export function svgElem(tag, attrsOrElems, elems) {
    return elem(tag, attrsOrElems, elems, 'http://www.w3.org/2000/svg');
}

export function text(text_) {
    return {
        'text': text_
    };
}

export function href(hashParams, params, path) {
    hashParams = encodeParams(hashParams);
    params = encodeParams(params);
    path = path ? path : window.location.pathname;
    if (hashParams === null && params === null) {
        return `${path}#`;
    } else if (hashParams === null && params !== null) {
        return `${path}?${params}`;
    } else if (hashParams !== null && params === null) {
        return `${path}#${hashParams}`;
    }
    return `${path}?${params}#${hashParams}`;
}

export function encodeParams(params) {
    const items = [];
    if (undefined !== params) {
        const names = Object.keys(params).sort();
        names.forEach((name) => {
            if (params[name] !== null && params[name] !== undefined) {
                items.push(`${encodeURIComponent(name)}=${encodeURIComponent(params[name])}`);
            }
        });
        names.forEach((name) => {
            if (params[name] === null) {
                items.push(encodeURIComponent(name));
            }
        });
    }
    return items.length ? items.join('&') : null;
}

export function decodeParams(paramString) {
    const params = {};
    const r = /([^&;=]+)=?([^&;]*)/g;
    const d = (s) => decodeURIComponent(s.replace(/\+/g, ' '));
    const q = paramString || window.location.hash.substring(1);

    let e;
    while ((e = r.exec(q)) !== null) {
        params[d(e[1])] = d(e[2]);
    }

    return params;
}

export function xhr(method, url, args) {
    args = args || {};
    const xhr_ = new XMLHttpRequest();
    xhr_.open(method, href(undefined, args.params, url));
    xhr_.responseType = args.responseType || 'json';
    xhr_.onreadystatechange = () => {
        if (XMLHttpRequest.DONE === xhr_.readyState) {
            if (xhr_.status === 200) {
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
    return !!obj && obj.constructor === Object;
}
