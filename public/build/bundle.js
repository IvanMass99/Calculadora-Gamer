
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.49.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    var stores = [
    	{
    		id: 0,
    		name: "Steam",
    		icono: "bi bi-steam",
    		precio: "",
    		impuesto: 1.75,
    		moneda: 0
    	},
    	{
    		id: 1,
    		name: "Xbox",
    		icono: "bi bi-xbox",
    		precio: "",
    		impuesto: 1.75,
    		moneda: 0
    	},
    	{
    		id: 2,
    		name: "Ubisoft",
    		icono: "bi bi-controller",
    		precio: "",
    		impuesto: 1.27,
    		moneda: 0
    	},
    	{
    		id: 3,
    		name: "Nintendo",
    		icono: "bi bi-nintendo-switch",
    		precio: "",
    		impuesto: 1.75,
    		moneda: 1
    	},
    	{
    		id: 4,
    		name: "Play Station",
    		icono: "bi bi-playstation",
    		precio: "",
    		impuesto: 1.75,
    		moneda: 1
    	},
    	{
    		id: 5,
    		name: "Epic store",
    		icono: "bi bi-controller",
    		precio: "",
    		impuesto: 1.75,
    		moneda: 1
    	},
    	{
    		id: 6,
    		name: "Google Play",
    		icono: "bi bi-google-play",
    		precio: "",
    		impuesto: 1.75,
    		moneda: 1
    	}
    ];

    /* src\calculadora.svelte generated by Svelte v3.49.0 */

    const { console: console_1 } = globals;
    const file$4 = "src\\calculadora.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[5] = list;
    	child_ctx[6] = i;
    	return child_ctx;
    }

    // (40:50) 
    function create_if_block_1(ctx) {
    	let input;
    	let t0;
    	let h3;
    	let t1;
    	let t2_value = parseFloat(/*store*/ ctx[4].precio * /*store*/ ctx[4].impuesto * /*dolar*/ ctx[1]).toFixed(2) + "";
    	let t2;
    	let t3;
    	let mounted;
    	let dispose;

    	function input_input_handler_1() {
    		/*input_input_handler_1*/ ctx[3].call(input, /*each_value*/ ctx[5], /*store_index*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			t0 = space();
    			h3 = element("h3");
    			t1 = text("$");
    			t2 = text(t2_value);
    			t3 = text(" ARS");
    			attr_dev(input, "class", "w-50 text-center m-auto mb-3 svelte-17qcrh6");
    			attr_dev(input, "type", "number");
    			attr_dev(input, "placeholder", "$0 USD");
    			add_location(input, file$4, 40, 24, 1365);
    			attr_dev(h3, "class", "m-4 pb-4 text-center svelte-17qcrh6");
    			add_location(h3, file$4, 41, 24, 1497);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*store*/ ctx[4].precio);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t1);
    			append_dev(h3, t2);
    			append_dev(h3, t3);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", input_input_handler_1);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*stores*/ 1 && to_number(input.value) !== /*store*/ ctx[4].precio) {
    				set_input_value(input, /*store*/ ctx[4].precio);
    			}

    			if (dirty & /*stores, dolar*/ 3 && t2_value !== (t2_value = parseFloat(/*store*/ ctx[4].precio * /*store*/ ctx[4].impuesto * /*dolar*/ ctx[1]).toFixed(2) + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(h3);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(40:50) ",
    		ctx
    	});

    	return block;
    }

    // (37:24) {#if store.moneda<1}
    function create_if_block(ctx) {
    	let input;
    	let t0;
    	let h3;
    	let t1_value = parseFloat(/*store*/ ctx[4].precio * /*store*/ ctx[4].impuesto).toFixed(2) + "";
    	let t1;
    	let t2;
    	let mounted;
    	let dispose;

    	function input_input_handler() {
    		/*input_input_handler*/ ctx[2].call(input, /*each_value*/ ctx[5], /*store_index*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			input = element("input");
    			t0 = space();
    			h3 = element("h3");
    			t1 = text(t1_value);
    			t2 = text(" ARS");
    			attr_dev(input, "class", "w-50 text-center m-auto mb-3 svelte-17qcrh6");
    			attr_dev(input, "type", "number");
    			attr_dev(input, "placeholder", "$0 ARS");
    			add_location(input, file$4, 37, 24, 1061);
    			attr_dev(h3, "class", "m-4 pb-4 text-center svelte-17qcrh6");
    			add_location(h3, file$4, 38, 24, 1193);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*store*/ ctx[4].precio);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, h3, anchor);
    			append_dev(h3, t1);
    			append_dev(h3, t2);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", input_input_handler);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*stores*/ 1 && to_number(input.value) !== /*store*/ ctx[4].precio) {
    				set_input_value(input, /*store*/ ctx[4].precio);
    			}

    			if (dirty & /*stores*/ 1 && t1_value !== (t1_value = parseFloat(/*store*/ ctx[4].precio * /*store*/ ctx[4].impuesto).toFixed(2) + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(h3);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(37:24) {#if store.moneda<1}",
    		ctx
    	});

    	return block;
    }

    // (28:8) {#each stores as store (store.id) }
    function create_each_block(key_1, ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let i;
    	let i_class_value;
    	let t0;
    	let h2;
    	let t1_value = /*store*/ ctx[4].name + "";
    	let t1;
    	let t2;
    	let t3;

    	function select_block_type(ctx, dirty) {
    		if (/*store*/ ctx[4].moneda < 1) return create_if_block;
    		if (/*store*/ ctx[4].moneda > 0) return create_if_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			i = element("i");
    			t0 = space();
    			h2 = element("h2");
    			t1 = text(t1_value);
    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();
    			set_style(i, "font-size", "65px");
    			attr_dev(i, "class", i_class_value = "" + (/*store*/ ctx[4].icono + " text-light text-center m-3" + " svelte-17qcrh6"));
    			add_location(i, file$4, 32, 24, 784);
    			attr_dev(h2, "class", "text-center mb-4");
    			add_location(h2, file$4, 33, 24, 890);
    			attr_dev(div0, "class", "card m-5 rounded w-90 svelte-17qcrh6");
    			add_location(div0, file$4, 30, 20, 697);
    			attr_dev(div1, "class", "");
    			add_location(div1, file$4, 29, 16, 661);
    			attr_dev(div2, "class", "");
    			add_location(div2, file$4, 28, 12, 629);
    			this.first = div2;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, i);
    			append_dev(div0, t0);
    			append_dev(div0, h2);
    			append_dev(h2, t1);
    			append_dev(div0, t2);
    			if (if_block) if_block.m(div0, null);
    			append_dev(div2, t3);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*stores*/ 1 && i_class_value !== (i_class_value = "" + (/*store*/ ctx[4].icono + " text-light text-center m-3" + " svelte-17qcrh6"))) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if (dirty & /*stores*/ 1 && t1_value !== (t1_value = /*store*/ ctx[4].name + "")) set_data_dev(t1, t1_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);

    			if (if_block) {
    				if_block.d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(28:8) {#each stores as store (store.id) }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let main;
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_value = /*stores*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*store*/ ctx[4].id;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "card-group justify-content-center");
    			add_location(div, file$4, 26, 4, 523);
    			attr_dev(main, "id", "calculadora");
    			add_location(main, file$4, 24, 4, 488);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*parseFloat, stores, dolar*/ 3) {
    				each_value = /*stores*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, destroy_block, create_each_block, null, get_each_context);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const url = 'https://www.dolarsi.com/api/api.php?type=valoresprincipales';

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Calculadora', slots, []);
    	var dolar = "";

    	fetch(url).then(response => response.json()).then(casa => {
    		$$invalidate(1, dolar = parseFloat([casa[0].casa.venta]));
    		console.log(casa[0].casa.venta);
    	}).catch(err => console.log(err));

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Calculadora> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler(each_value, store_index) {
    		each_value[store_index].precio = to_number(this.value);
    		$$invalidate(0, stores);
    	}

    	function input_input_handler_1(each_value, store_index) {
    		each_value[store_index].precio = to_number(this.value);
    		$$invalidate(0, stores);
    	}

    	$$self.$capture_state = () => ({ stores, dolar, url });

    	$$self.$inject_state = $$props => {
    		if ('dolar' in $$props) $$invalidate(1, dolar = $$props.dolar);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [stores, dolar, input_input_handler, input_input_handler_1];
    }

    class Calculadora extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Calculadora",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\navbar.svelte generated by Svelte v3.49.0 */

    const file$3 = "src\\navbar.svelte";

    function create_fragment$4(ctx) {
    	let main;
    	let nav;
    	let div1;
    	let button;
    	let span;
    	let t0;
    	let div0;
    	let ul;
    	let li0;
    	let a0;
    	let t2;
    	let li1;
    	let a1;
    	let t4;
    	let li2;
    	let a2;
    	let t6;
    	let li3;
    	let a3;

    	const block = {
    		c: function create() {
    			main = element("main");
    			nav = element("nav");
    			div1 = element("div");
    			button = element("button");
    			span = element("span");
    			t0 = space();
    			div0 = element("div");
    			ul = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			a0.textContent = "inicio";
    			t2 = space();
    			li1 = element("li");
    			a1 = element("a");
    			a1.textContent = "calculadora";
    			t4 = space();
    			li2 = element("li");
    			a2 = element("a");
    			a2.textContent = "contacto";
    			t6 = space();
    			li3 = element("li");
    			a3 = element("a");
    			a3.textContent = "donar";
    			attr_dev(span, "class", "navbar-toggler-icon");
    			add_location(span, file$3, 9, 12, 435);
    			set_style(button, "background-color", "salmon");
    			set_style(button, "border-radius", "10%");
    			attr_dev(button, "class", "navbar-toggler text-center m-auto mt-2");
    			attr_dev(button, "type", "button");
    			attr_dev(button, "data-bs-toggle", "collapse");
    			attr_dev(button, "data-bs-target", "#navbarNav");
    			attr_dev(button, "aria-controls", "navbarNav");
    			attr_dev(button, "aria-expanded", "false");
    			attr_dev(button, "aria-label", "Toggle navigation");
    			add_location(button, file$3, 8, 10, 166);
    			attr_dev(a0, "class", "nav-link mx-5 svelte-1g7nwb3");
    			attr_dev(a0, "aria-current", "page");
    			attr_dev(a0, "href", "#inicio");
    			add_location(a0, file$3, 16, 16, 718);
    			attr_dev(li0, "class", "nav-item hvr-float svelte-1g7nwb3");
    			add_location(li0, file$3, 15, 14, 669);
    			attr_dev(a1, "class", "nav-link mx-5 svelte-1g7nwb3");
    			attr_dev(a1, "href", "#calculadora");
    			add_location(a1, file$3, 20, 16, 880);
    			attr_dev(li1, "class", "nav-item hvr-float svelte-1g7nwb3");
    			add_location(li1, file$3, 19, 14, 831);
    			attr_dev(a2, "class", "nav-link mx-5 svelte-1g7nwb3");
    			attr_dev(a2, "href", "#contacto");
    			add_location(a2, file$3, 24, 16, 1033);
    			attr_dev(li2, "class", "nav-item hvr-float svelte-1g7nwb3");
    			add_location(li2, file$3, 23, 14, 984);
    			attr_dev(a3, "class", "nav-link mx-5 svelte-1g7nwb3");
    			attr_dev(a3, "target", "_blank");
    			attr_dev(a3, "href", "https://link.mercadopago.com.ar/ivanmass");
    			add_location(a3, file$3, 28, 16, 1180);
    			attr_dev(li3, "class", "nav-item hvr-float svelte-1g7nwb3");
    			add_location(li3, file$3, 27, 14, 1131);
    			attr_dev(ul, "class", "navbar-nav text-center");
    			add_location(ul, file$3, 13, 12, 612);
    			attr_dev(div0, "class", "collapse navbar-collapse justify-content-center mt-5 ");
    			attr_dev(div0, "id", "navbarNav");
    			add_location(div0, file$3, 12, 10, 515);
    			attr_dev(div1, "class", "container-fluid");
    			add_location(div1, file$3, 6, 8, 114);
    			attr_dev(nav, "class", "navbar navbar-expand-lg bg-trasparent");
    			add_location(nav, file$3, 4, 4, 47);
    			attr_dev(main, "id", "inicio");
    			add_location(main, file$3, 2, 0, 21);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, nav);
    			append_dev(nav, div1);
    			append_dev(div1, button);
    			append_dev(button, span);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, ul);
    			append_dev(ul, li0);
    			append_dev(li0, a0);
    			append_dev(ul, t2);
    			append_dev(ul, li1);
    			append_dev(li1, a1);
    			append_dev(ul, t4);
    			append_dev(ul, li2);
    			append_dev(li2, a2);
    			append_dev(ul, t6);
    			append_dev(ul, li3);
    			append_dev(li3, a3);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Navbar', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\bienvenida.svelte generated by Svelte v3.49.0 */

    const file$2 = "src\\bienvenida.svelte";

    function create_fragment$3(ctx) {
    	let main;
    	let div2;
    	let h1;
    	let t1;
    	let h4;
    	let t3;
    	let p;
    	let t5;
    	let h5;
    	let t6;
    	let div0;
    	let i0;
    	let t7;
    	let i1;
    	let t8;
    	let i2;
    	let t9;
    	let i3;
    	let t10;
    	let i4;
    	let t11;
    	let i5;
    	let t12;
    	let div1;
    	let span1;
    	let span0;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div2 = element("div");
    			h1 = element("h1");
    			h1.textContent = "CALCULADORA GAMER";
    			t1 = space();
    			h4 = element("h4");
    			h4.textContent = "Calcula el precio final con impuestos incluidos de diversas tiendas de videojuegos.";
    			t3 = space();
    			p = element("p");
    			p.textContent = "¡Actualizada a los ultimos impuestos agregados!";
    			t5 = space();
    			h5 = element("h5");
    			t6 = space();
    			div0 = element("div");
    			i0 = element("i");
    			t7 = space();
    			i1 = element("i");
    			t8 = space();
    			i2 = element("i");
    			t9 = space();
    			i3 = element("i");
    			t10 = space();
    			i4 = element("i");
    			t11 = space();
    			i5 = element("i");
    			t12 = space();
    			div1 = element("div");
    			span1 = element("span");
    			span0 = element("span");
    			attr_dev(h1, "class", "");
    			set_style(h1, "color", "salmon");
    			add_location(h1, file$2, 7, 8, 85);
    			attr_dev(h4, "class", "mt-5 mb-3 text-light");
    			add_location(h4, file$2, 9, 8, 159);
    			attr_dev(p, "class", "text-secondary");
    			add_location(p, file$2, 11, 8, 293);
    			attr_dev(h5, "class", "text-secondary");
    			add_location(h5, file$2, 13, 8, 386);
    			attr_dev(i0, "class", "bi bi-steam svelte-1vr1gzs");
    			add_location(i0, file$2, 18, 12, 489);
    			attr_dev(i1, "class", "bi bi-playstation svelte-1vr1gzs");
    			add_location(i1, file$2, 19, 12, 530);
    			attr_dev(i2, "class", "bi bi-xbox svelte-1vr1gzs");
    			add_location(i2, file$2, 20, 12, 577);
    			attr_dev(i3, "class", "bi bi-nintendo-switch svelte-1vr1gzs");
    			add_location(i3, file$2, 21, 12, 617);
    			attr_dev(i4, "class", "bi bi-google-play svelte-1vr1gzs");
    			add_location(i4, file$2, 22, 12, 668);
    			attr_dev(i5, "class", "bi bi-three-dots svelte-1vr1gzs");
    			add_location(i5, file$2, 23, 12, 717);
    			attr_dev(div0, "class", "text-light mt-5");
    			add_location(div0, file$2, 16, 8, 440);
    			attr_dev(span0, "class", "mouse-scroll svelte-1vr1gzs");
    			add_location(span0, file$2, 29, 16, 879);
    			attr_dev(span1, "class", "mouse-btn svelte-1vr1gzs");
    			add_location(span1, file$2, 28, 12, 837);
    			attr_dev(div1, "class", "container_mouse mt-5");
    			add_location(div1, file$2, 27, 8, 789);
    			attr_dev(div2, "class", "bienvenida text-center svelte-1vr1gzs");
    			add_location(div2, file$2, 5, 4, 37);
    			add_location(main, file$2, 3, 0, 23);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div2);
    			append_dev(div2, h1);
    			append_dev(div2, t1);
    			append_dev(div2, h4);
    			append_dev(div2, t3);
    			append_dev(div2, p);
    			append_dev(div2, t5);
    			append_dev(div2, h5);
    			append_dev(div2, t6);
    			append_dev(div2, div0);
    			append_dev(div0, i0);
    			append_dev(div0, t7);
    			append_dev(div0, i1);
    			append_dev(div0, t8);
    			append_dev(div0, i2);
    			append_dev(div0, t9);
    			append_dev(div0, i3);
    			append_dev(div0, t10);
    			append_dev(div0, i4);
    			append_dev(div0, t11);
    			append_dev(div0, i5);
    			append_dev(div2, t12);
    			append_dev(div2, div1);
    			append_dev(div1, span1);
    			append_dev(span1, span0);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Bienvenida', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Bienvenida> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Bienvenida extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Bienvenida",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\preguntas.svelte generated by Svelte v3.49.0 */

    function create_fragment$2(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Preguntas', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Preguntas> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Preguntas extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Preguntas",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\footer.svelte generated by Svelte v3.49.0 */

    const file$1 = "src\\footer.svelte";

    function create_fragment$1(ctx) {
    	let footer;
    	let h30;
    	let t1;
    	let h40;
    	let t3;
    	let br;
    	let t4;
    	let h31;
    	let t6;
    	let h41;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			h30 = element("h3");
    			h30.textContent = "Calculadora Gamer";
    			t1 = space();
    			h40 = element("h4");
    			h40.textContent = "Creada por Ivan Massimino";
    			t3 = space();
    			br = element("br");
    			t4 = space();
    			h31 = element("h3");
    			h31.textContent = "Datos de contacto";
    			t6 = space();
    			h41 = element("h4");
    			h41.textContent = "ivaanmass@gmail.com";
    			set_style(h30, "color", "salmon");
    			add_location(h30, file$1, 6, 0, 111);
    			add_location(h40, file$1, 7, 0, 161);
    			add_location(br, file$1, 8, 0, 197);
    			set_style(h31, "color", "salmon");
    			add_location(h31, file$1, 9, 0, 203);
    			add_location(h41, file$1, 10, 0, 253);
    			attr_dev(footer, "id", "contacto");
    			attr_dev(footer, "class", "p-5 text-center text-light svelte-z15sz5");
    			set_style(footer, "margin-top", "15%");
    			add_location(footer, file$1, 4, 0, 25);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, h30);
    			append_dev(footer, t1);
    			append_dev(footer, h40);
    			append_dev(footer, t3);
    			append_dev(footer, br);
    			append_dev(footer, t4);
    			append_dev(footer, h31);
    			append_dev(footer, t6);
    			append_dev(footer, h41);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.49.0 */
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let navbar;
    	let t0;
    	let bienvenida;
    	let t1;
    	let calculadora;
    	let t2;
    	let preguntas;
    	let t3;
    	let footer;
    	let current;
    	navbar = new Navbar({ $$inline: true });
    	bienvenida = new Bienvenida({ $$inline: true });
    	calculadora = new Calculadora({ $$inline: true });
    	preguntas = new Preguntas({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			create_component(bienvenida.$$.fragment);
    			t1 = space();
    			create_component(calculadora.$$.fragment);
    			t2 = space();
    			create_component(preguntas.$$.fragment);
    			t3 = space();
    			create_component(footer.$$.fragment);
    			add_location(main, file, 11, 0, 248);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(navbar, main, null);
    			append_dev(main, t0);
    			mount_component(bienvenida, main, null);
    			append_dev(main, t1);
    			mount_component(calculadora, main, null);
    			append_dev(main, t2);
    			mount_component(preguntas, main, null);
    			append_dev(main, t3);
    			mount_component(footer, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(bienvenida.$$.fragment, local);
    			transition_in(calculadora.$$.fragment, local);
    			transition_in(preguntas.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(bienvenida.$$.fragment, local);
    			transition_out(calculadora.$$.fragment, local);
    			transition_out(preguntas.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(navbar);
    			destroy_component(bienvenida);
    			destroy_component(calculadora);
    			destroy_component(preguntas);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Calculadora,
    		Navbar,
    		Bienvenida,
    		Preguntas,
    		Footer
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
