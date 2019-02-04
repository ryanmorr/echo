/**
 * Import dependencies
 */
import patch from './patch';
import { getNode, findIndex, scheduleRender } from './util';

/**
 * Cache of all `Echo` instances
 */
const echos = [];

/**
 * MutationObserver options
 */
const observerOptions = {
    childList: true,
    attributes: true,
    characterData: true,
    subtree: true
};

/**
 * Virtual DOM class
 *
 * @class Echo
 * @api private
 */
class Echo {

    /**
     * Instantiate the class providing the
     * DOM node to create a virtual DOM clone
     * out of
     *
     * @constructor
     * @param {Node|String} node
     * @api private
     */
    constructor(node) {
        this.node = getNode(node);
        this.vnode = this.node.cloneNode(true);
        this.observer = new MutationObserver(this.onChange.bind(this));
        this.observer.observe(this.vnode, observerOptions);
    }

    /**
     * Disconnect the mutation observer
     * and nullify the properties
     *
     * @api private
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = this.node = this.vnode = null;
        }
    }

    /**
     * Get the source DOM node
     *
     * @return {Node}
     * @api private
     */
    getNode() {
        return this.node;
    }

    /**
     * Get the virtual DOM node
     *
     * @return {Node}
     * @api private
     */
    getVNode() {
        return this.vnode;
    }

    /**
     * Schedule a frame to update the
     * source DOM tree
     *
     * @api private
     */
    update() {
        if (!this.renderer) {
            this.renderer = this.render.bind(this);
            scheduleRender(this.renderer);
        }
    }

    /**
     * Render the changes of the virtual
     * DOM tree to the source DOM tree
     *
     * @api private
     */
    render() {
        this.renderer = null;
        patch(this.node, this.vnode);
        this.getNode().dispatchEvent(new CustomEvent('patch', {
            bubbles: false,
            cancelable: false
        }));
    }

    /**
     * Called anytime a change is made to
     * the virtual DOM tree
     *
     * @api private
     */
    onChange() {
        if (document.contains(this.getNode())) {
            this.update();
            return;
        }
        this.render();
    }
}

/**
 * Factory function for creating
 * `Echo` instances
 *
 * @param {Node|String} node (optional)
 * @return {Echo}
 * @api public
 */
export function echo(node = document) {
    node = getNode(node);
    const index = findIndex(echos, (dom) => dom.getNode() === node);
    if (index !== -1) {
        return echos[index].getVNode();
    }
    const dom = new Echo(node);
    echos.push(dom);
    return dom.getVNode();
}

/**
 * Stop future updates
 *
 * @param {Node} node
 * @api public
 */
export function destroy(node) {
    const index = findIndex(echos, (dom) => dom.getVNode() === node);
    if (index !== -1) {
        const dom = echos[index];
        dom.destroy();
        echos.splice(index, 1);
    }
}