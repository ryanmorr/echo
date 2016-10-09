/**
 * Common variables
 */
let frame;
const batch = [];

/**
 * Resolve a DOM node to return
 * an element node
 *
 * @param {Node} node
 * @return {Node}
 * @api private
 */
export function getNode(node) {
    return node.nodeType === 9 ? node.documentElement : node;
}

/**
 * Search an array for the first item
 * that satisfies a given condition and
 * return its index
 *
 * @param {Array} arr
 * @param {Function} fn
 * @return {Number}
 * @api public
 */
export function findIndex(arr, fn) {
    if ('findIndex' in arr) {
        return arr.findIndex(fn);
    }
    for (let i = 0, len = arr.length; i < len; i++) {
        if (fn.call(arr[i], arr[i], i, arr)) {
            return i;
        }
    }
    return -1;
}

/**
 * Does the provided root element contain
 * the provided node
 *
 * @param {Element} root
 * @param {Element} el
 * @return {Boolean}
 * @api private
 */
export function contains(root, el) {
    if ('contains' in root) {
        return root.contains(el);
    }
    return !!(root.compareDocumentPosition(el) & 16);
}

/**
 * Use `requestAnimationFrame` to
 * batch DOM updates to boost
 * performance
 *
 * @param {Function} fn
 * @api private
 */
export function updateDOM(fn) {
    if (frame) {
        cancelAnimationFrame(frame);
    }
    batch.push(fn);
    frame = requestAnimationFrame(() => {
        frame = null;
        let render;
        while ((render = batch.shift())) {
            render();
        }
    });
}