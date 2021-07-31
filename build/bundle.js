
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
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
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
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
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
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
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
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
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
        flushing = false;
        seen_callbacks.clear();
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
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.41.0' }, detail), true));
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
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
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

    /*!
    * Library for making Minesweeper clones
    * https://github.com/binaryluke/Minesweeper
    *
    * Copyright 2015, Luke Howard (@binaryluke)
    *
    * Released under the MIT license
    * http://lukehoward.name/project/minesweeper/license
    */

    /**
     *  CellStateEnum
     */

    var CellStateEnum = {
      CLOSED: 0,
      OPEN: 1
    };

    /**
     *  CellFlagEnum
     */

    var CellFlagEnum = {
      NONE: 0,
      EXCLAMATION: 1,
      QUESTION: 2
    };

    /**
     *  BoardStateEnum
     */

    var BoardStateEnum = {
      PRISTINE: 0,
      IN_PROGRESS: 1,
      LOST: 2,
      WON: 3
    };

    /**
     *  Cell
     */
      
    var Cell = function (x, y, isMine, numAdjacentMines) {
      this.x = x || 0;
      this.y = y || 0;
      this.isMine = isMine ? true : false;
      this.numAdjacentMines = numAdjacentMines || 0;
      this.state = CellStateEnum.CLOSED;
      this.flag = CellFlagEnum.NONE;
    };

    /**
     *  Board
     */

    var Board = function (mineArray) {
      var isValid;

      try {
        isValid = isMineArrayValid(mineArray);
      } catch (e) {
        isValid = false;
      }
      
      if (!isValid) {
        throw new Error('The mine array supplied to Board constructor was not valid');
      }

      this._state = BoardStateEnum.PRISTINE;
      this._numRows = mineArray.length;
      this._numCols = mineArray[0].length;
      this._numMines = getNumMinesFromMineArray(mineArray, this._numRows, this._numCols);
      this._grid = generateGridFromMineArray(mineArray, this._numRows, this._numCols);
    };

    Board.prototype.state = function () {
      return this._state;
    };

    Board.prototype.numRows = function () {
      return this._numRows;
    };

    Board.prototype.numCols = function () {
      return this._numCols;
    };

    Board.prototype.numMines = function () {
      return this._numMines;
    };

    Board.prototype.grid = function () {
      var i, j, clone = [];

      for (i = 0; i < this._numRows; i++) {
        clone.push([]);
        for (j = 0; j < this._numCols; j++) {
          // push a copy of the grid cell
          clone[i].push(this.cell(j, i));
        }
      }

      return this._grid;
    };

    Board.prototype._cell = function (x, y) {
      if (x >= 0 && y >= 0 && y < this._numRows && x < this._numCols) {
        return this._grid[y][x];
      }
    };

    Board.prototype.cell = function (x, y) {
      return extend({}, this._cell(+x, +y));
    };

    Board.prototype.cycleCellFlag = function (x, y) {
      var cell = this._cell(+x, +y), updated = true;

      if (!cell || cell.state === CellStateEnum.OPEN || 
            this._state === BoardStateEnum.WON || this._state === BoardStateEnum.LOST) {
        return;
      }
      
      if (cell.flag === CellFlagEnum.NONE) {
        cell.flag = CellFlagEnum.EXCLAMATION;
      } else if (cell.flag === CellFlagEnum.EXCLAMATION) {
        cell.flag = CellFlagEnum.QUESTION;
      } else if (cell.flag === CellFlagEnum.QUESTION) {
        cell.flag = CellFlagEnum.NONE;
      } else {
        updated = false;
      }

      // change board state to IN_PROGRESS if we were on a PRISTINE board
      if (updated && this._state === BoardStateEnum.PRISTINE) {
        this._state = BoardStateEnum.IN_PROGRESS;
      }

      // and check if we've entered a WIN / LOSE scenario
      this._updateState();
    };

    Board.prototype.openCell = function (x, y) {
      var cell = this._cell(x, y);

      if (!cell || cell.state === CellStateEnum.OPEN || cell.flag !== CellFlagEnum.NONE ||
            this._state === BoardStateEnum.WON || this._state === BoardStateEnum.LOST) {
        return;
      }

      cell.state = CellStateEnum.OPEN;

      // flood-fill the board
      if (!cell.isMine) {
        this._floodFill(x + 1, y);
        this._floodFill(x - 1, y);
        this._floodFill(x, y + 1);
        this._floodFill(x, y - 1);
        this._floodFill(x + 1, y + 1);
        this._floodFill(x - 1, y - 1);
        this._floodFill(x - 1, y + 1);
        this._floodFill(x + 1, y - 1);
      }

      // change board state to IN_PROGRESS if we were on a PRISTINE board
      if (this._state === BoardStateEnum.PRISTINE) {
        this._state = BoardStateEnum.IN_PROGRESS;
      }

      // and check if we've entered a WIN / LOSE scenario
      this._updateState();
    };

    // open-up the board using four-way flood-fill algorithm
    // https://en.wikipedia.org/wiki/Flood_fill
    Board.prototype._floodFill = function (x, y) {
      var cell = this._cell(x, y);

      if (cell && !cell.isMine && cell.state === CellStateEnum.CLOSED && cell.flag === CellFlagEnum.NONE) {
        cell.state = CellStateEnum.OPEN;

        if (cell.numAdjacentMines === 0) {
          this._floodFill(x + 1, y);
          this._floodFill(x - 1, y);
          this._floodFill(x, y + 1);
          this._floodFill(x, y - 1);
          this._floodFill(x + 1, y + 1);
          this._floodFill(x - 1, y - 1);
          this._floodFill(x - 1, y + 1);
          this._floodFill(x + 1, y - 1);
        }
      }
    };

    Board.prototype._updateState = function () {
      var x, y, cell, isWin = true;

      for (y = 0; y < this._numRows; y++) {
        for (x = 0; x < this._numCols; x++) {
          cell = this._cell(x,y);

          if(cell.state === CellStateEnum.OPEN) {
            if (cell.isMine) {
              this._state = BoardStateEnum.LOST;
              return;
            }
          } else if (cell.state === CellStateEnum.CLOSED) {
            if (cell.isMine) {
              if(cell.flag !== CellFlagEnum.EXCLAMATION) {
                isWin = false;
              }
            } else {
              isWin = false;
            }
          }
        }
      }

      if (isWin) {
        this._state = BoardStateEnum.WON;
      }
    };

    /**
     *  generateMineArray
     */

    var generateMineArray = function (options) {
      var i, length, rows, cols, mines, mineArray = [];

      options = options || {};
      rows = options.rows || 10;
      cols = options.cols || options.rows || 10;
      mines = options.mines || parseInt((rows * cols) * 0.15, 10) || 0;
      length = rows * cols;

      for (i = 0; i < length; i++) {
        if (i < mines) {
          mineArray.push(1);
        } else {
          mineArray.push(0);
        }
      }

      mineArray = fisherYatesShuffle(mineArray);
      mineArray = singleToMultiDimensionalArray(mineArray, cols);
      
      return mineArray;
    };

    /**
     *  Helpers
     */

    var generateGridFromMineArray = function (mineArray, numRows, numCols) {
      var x,
          y,
          grid = [];

      for (y = 0; y < numRows; y++) {
        grid[y] = [];
        for (x = 0; x < numCols; x++) {
          grid[y][x] = new Cell(
            x,
            y,
            mineArray[y][x] === 1 ? true : false,
            getNumAdjacentMineCount(mineArray, x, y)
          );
        }
      }

      return grid;
    };

    var getNumMinesFromMineArray = function (mineArray, numRows, numCols) {
      var x,
          y,
          mineCount = 0;

      for (y = 0; y < numRows; y++) {
        for (x = 0; x < numCols; x++) {
          if (mineArray[y][x] === 1) {
            mineCount++;
          }
        }
      }

      return mineCount;
    };

    var getNumAdjacentMineCount = function (mineArray, x, y) {
      var idxX,
          idxY,
          endX = x + 1,
          endY = y + 1,
          maxX = mineArray[0].length,
          maxY = mineArray.length,
          mineCount = 0;

      for (idxY = y - 1; idxY <= endY; idxY++) {
        for (idxX = x - 1; idxX <= endX; idxX++) {
          if (idxY !== y || idxX !== x) {
            if (idxY >= 0 && idxX >= 0 && idxY < maxY && idxX < maxX) {
              if (mineArray[idxY][idxX] === 1) {
                mineCount++;
              }
            }
          }
        }
      }

      return mineCount;
    };

    var isMineArrayValid = function (mineArray) {
      var rowIdx, colIdx, rows, columns, isValid = true;

      if (mineArray && mineArray.length) {
        rows = mineArray.length;
        columns = mineArray[0] ? mineArray[0].length : 0;

        if (columns === 0) {
          isValid = false;
        }
        
        for (rowIdx = 0; rowIdx < rows; rowIdx++) {
          if (mineArray[rowIdx].length !== columns) {
            isValid = false;
          } else {
            for (colIdx = 0; colIdx < columns; colIdx++) {
              if (mineArray[rowIdx][colIdx] !== 0 && mineArray[rowIdx][colIdx] !== 1) {
                isValid = false;
              }
            }
          }
        }  
      } else {
        isValid = false;
      }
      
      return isValid;
    };

    // Credit:
    // http://bost.ocks.org/mike/shuffle/
    var fisherYatesShuffle = function (array) {
      var m = array.length, t, i;

      // While there remain elements to shuffle…
      while (m) {

        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
      }

      return array;
    };

    var singleToMultiDimensionalArray = function (array, numCols) {
      var i,
          rows = array.length / numCols,
          multi = [];

      for (i = 0; i < rows; i++) {
        multi.push(array.splice(0, numCols));
      }

      return multi;
    };

    var extend = function ( defaults, options ) {
      var extended = {};
      var prop;
      for (prop in defaults) {
        if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
          extended[prop] = defaults[prop];
        }
      }
      for (prop in options) {
        if (Object.prototype.hasOwnProperty.call(options, prop)) {
          extended[prop] = options[prop];
        }
      }
      return extended;
    };

    /**
     *  Create exportable object
     */

    var minesweeper = {
      Cell: Cell,
      CellStateEnum: CellStateEnum,
      CellFlagEnum: CellFlagEnum,
      Board: Board,
      BoardStateEnum: BoardStateEnum,
      generateMineArray: generateMineArray
    };

    /* src/minesweeper.svelte generated by Svelte v3.41.0 */
    const file$8 = "src/minesweeper.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    // (90:16) {#each row as cell}
    function create_each_block_1$1(ctx) {
    	let div;
    	let t_value = /*getCellText*/ ctx[4](/*cell*/ ctx[13]) + "";
    	let t;
    	let div_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", div_class_value = "cell " + /*getCellClasses*/ ctx[2](/*cell*/ ctx[13]) + " svelte-usi40m");
    			add_location(div, file$8, 90, 20, 2703);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);

    			if (!mounted) {
    				dispose = [
    					listen_dev(
    						div,
    						"click",
    						function () {
    							if (is_function(/*clickCell*/ ctx[3](/*cell*/ ctx[13]))) /*clickCell*/ ctx[3](/*cell*/ ctx[13]).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						div,
    						"contextmenu",
    						prevent_default(function () {
    							if (is_function(/*toggleMineFlag*/ ctx[5](/*cell*/ ctx[13]))) /*toggleMineFlag*/ ctx[5](/*cell*/ ctx[13]).apply(this, arguments);
    						}),
    						false,
    						true,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*gridRows*/ 1 && t_value !== (t_value = /*getCellText*/ ctx[4](/*cell*/ ctx[13]) + "")) set_data_dev(t, t_value);

    			if (dirty & /*gridRows*/ 1 && div_class_value !== (div_class_value = "cell " + /*getCellClasses*/ ctx[2](/*cell*/ ctx[13]) + " svelte-usi40m")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(90:16) {#each row as cell}",
    		ctx
    	});

    	return block;
    }

    // (88:8) {#each gridRows as row}
    function create_each_block$1(ctx) {
    	let div;
    	let t;
    	let each_value_1 = /*row*/ ctx[10];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(div, "class", "row");
    			add_location(div, file$8, 88, 12, 2629);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*getCellClasses, gridRows, clickCell, toggleMineFlag, getCellText*/ 61) {
    				each_value_1 = /*row*/ ctx[10];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(88:8) {#each gridRows as row}",
    		ctx
    	});

    	return block;
    }

    // (101:8) {:else}
    function create_else_block(ctx) {
    	let t;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			t = text("YOU LOSE ");
    			input = element("input");
    			attr_dev(input, "class", "rematch svelte-usi40m");
    			attr_dev(input, "type", "button");
    			input.value = "try again?";
    			add_location(input, file$8, 101, 21, 3280);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, input, anchor);

    			if (!mounted) {
    				dispose = listen_dev(input, "click", /*rematch*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(101:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (99:58) 
    function create_if_block_1(ctx) {
    	let t;
    	let br;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			t = text("🎉🎉🎉 YOU WIN");
    			br = element("br");
    			input = element("input");
    			add_location(br, file$8, 99, 26, 3162);
    			attr_dev(input, "class", "rematch svelte-usi40m");
    			attr_dev(input, "type", "button");
    			input.value = "play again?";
    			add_location(input, file$8, 99, 30, 3166);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    			insert_dev(target, br, anchor);
    			insert_dev(target, input, anchor);

    			if (!mounted) {
    				dispose = listen_dev(input, "click", /*rematch*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(99:58) ",
    		ctx
    	});

    	return block;
    }

    // (97:8) {#if state == minesweeper.BoardStateEnum.PRISTINE || state == minesweeper.BoardStateEnum.IN_PROGRESS}
    function create_if_block$1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("MINESWEEPER");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(97:8) {#if state == minesweeper.BoardStateEnum.PRISTINE || state == minesweeper.BoardStateEnum.IN_PROGRESS}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div3;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let br0;
    	let span;
    	let br1;
    	let a;
    	let t4;
    	let div2;
    	let each_value = /*gridRows*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	function select_block_type(ctx, dirty) {
    		if (/*state*/ ctx[1] == minesweeper.BoardStateEnum.PRISTINE || /*state*/ ctx[1] == minesweeper.BoardStateEnum.IN_PROGRESS) return create_if_block$1;
    		if (/*state*/ ctx[1] == minesweeper.BoardStateEnum.WON) return create_if_block_1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			div1 = element("div");
    			if_block.c();
    			t1 = space();
    			br0 = element("br");
    			span = element("span");
    			span.textContent = "7 MINES";
    			br1 = element("br");
    			a = element("a");
    			a.textContent = "Minesweeper code by binaryluke";
    			t4 = space();
    			div2 = element("div");
    			attr_dev(div0, "class", "board");
    			add_location(div0, file$8, 86, 4, 2565);
    			add_location(br0, file$8, 103, 8, 3378);
    			attr_dev(span, "class", "mines-remaining svelte-usi40m");
    			add_location(span, file$8, 103, 12, 3382);
    			add_location(br1, file$8, 103, 56, 3426);
    			attr_dev(a, "class", "by svelte-usi40m");
    			attr_dev(a, "href", "https://github.com/binaryluke/Minesweeper");
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$8, 103, 60, 3430);
    			attr_dev(div1, "class", "text svelte-usi40m");
    			add_location(div1, file$8, 95, 4, 2924);
    			attr_dev(div2, "class", "back back-1 svelte-usi40m");
    			add_location(div2, file$8, 105, 4, 3559);
    			attr_dev(div3, "class", "minesweeper svelte-usi40m");
    			add_location(div3, file$8, 85, 0, 2535);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			if_block.m(div1, null);
    			append_dev(div1, t1);
    			append_dev(div1, br0);
    			append_dev(div1, span);
    			append_dev(div1, br1);
    			append_dev(div1, a);
    			append_dev(div3, t4);
    			append_dev(div3, div2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*gridRows, getCellClasses, clickCell, toggleMineFlag, getCellText*/ 61) {
    				each_value = /*gridRows*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div1, t1);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks, detaching);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Minesweeper', slots, []);
    	let mineArray = minesweeper.generateMineArray({ rows: 5, cols: 5, mines: 7 });
    	let board = new minesweeper.Board(mineArray);
    	let gridRows = board.grid();
    	let state = board.state();

    	const getCellClasses = cell => {
    		if (cell.state == minesweeper.CellStateEnum.CLOSED) return "hidden"; else {
    			let text = "open";
    			return text;
    		}
    	};

    	const checkSetWin = () => {
    		let numClosed = 0;

    		for (let row of gridRows) {
    			for (let cell of row) {
    				if (cell.state == minesweeper.CellStateEnum.CLOSED) numClosed += 1;
    			}
    		}

    		// if only 7 remain, then the user has won, but the minesweeper.js code is faulty, so we've to
    		// mark everything as "flagged" in order to show the user has won
    		if (numClosed == 7) {
    			for (let row of gridRows) {
    				for (let cell of row) {
    					if (cell.state == minesweeper.CellStateEnum.CLOSED) {
    						while (cell.flag != minesweeper.CellFlagEnum.EXCLAMATION) {
    							board.cycleCellFlag(cell.x, cell.y);
    						}
    					}
    				}
    			}
    		}
    	};

    	const clickCell = cell => {
    		const prevState = board.state();
    		board.openCell(cell.x, cell.y);

    		// ensure that nobody can ever lose the game on the first click
    		if (prevState == minesweeper.BoardStateEnum.PRISTINE && board.state() == minesweeper.BoardStateEnum.LOST) {
    			mineArray = minesweeper.generateMineArray({ rows: 5, cols: 5, mines: 7 });
    			board = new minesweeper.Board(mineArray);
    			$$invalidate(0, gridRows = board.grid());
    			clickCell(gridRows[cell.y][cell.x]);
    			return;
    		}

    		$$invalidate(0, gridRows);
    		checkSetWin();
    		$$invalidate(1, state = board.state());
    	};

    	const getCellText = cell => {
    		if (board.state() == minesweeper.BoardStateEnum.LOST && cell.isMine) return "💥";

    		if (cell.flag != minesweeper.CellFlagEnum.NONE) {
    			if (cell.flag == minesweeper.CellFlagEnum.EXCLAMATION) return "!"; else return "?";
    		}

    		if (cell.state == minesweeper.CellStateEnum.CLOSED) return "";
    		if (cell.isMine) return "💥"; else if (cell.numAdjacentMines > 0) return cell.numAdjacentMines;
    		if (cell.numAdjacentMines == 0) return "";
    	};

    	const toggleMineFlag = cell => {
    		board.cycleCellFlag(cell.x, cell.y);
    		$$invalidate(0, gridRows);
    	};

    	const rematch = () => {
    		mineArray = minesweeper.generateMineArray({ rows: 5, cols: 5, mines: 7 });
    		board = new minesweeper.Board(mineArray);
    		$$invalidate(0, gridRows = board.grid());
    		$$invalidate(1, state = board.state());
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Minesweeper> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		minesweeper,
    		mineArray,
    		board,
    		gridRows,
    		state,
    		getCellClasses,
    		checkSetWin,
    		clickCell,
    		getCellText,
    		toggleMineFlag,
    		rematch
    	});

    	$$self.$inject_state = $$props => {
    		if ('mineArray' in $$props) mineArray = $$props.mineArray;
    		if ('board' in $$props) board = $$props.board;
    		if ('gridRows' in $$props) $$invalidate(0, gridRows = $$props.gridRows);
    		if ('state' in $$props) $$invalidate(1, state = $$props.state);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		gridRows,
    		state,
    		getCellClasses,
    		clickCell,
    		getCellText,
    		toggleMineFlag,
    		rematch
    	];
    }

    class Minesweeper extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Minesweeper",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/games.svelte generated by Svelte v3.41.0 */
    const file$7 = "src/games.svelte";

    function create_fragment$7(ctx) {
    	let div;
    	let minesweeper;
    	let current;
    	minesweeper = new Minesweeper({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(minesweeper.$$.fragment);
    			attr_dev(div, "class", "main svelte-jl7t64");
    			add_location(div, file$7, 4, 0, 71);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(minesweeper, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(minesweeper.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(minesweeper.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(minesweeper);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Games', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Games> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Minesweeper });
    	return [];
    }

    class Games extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Games",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/head.svelte generated by Svelte v3.41.0 */
    const file$6 = "src/head.svelte";

    function create_fragment$6(ctx) {
    	let div4;
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let t1;
    	let div3;
    	let h1;
    	let t3;
    	let p;
    	let t5;
    	let div2;
    	let t6;
    	let games;
    	let current;
    	games = new Games({ $$inline: true });

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			t1 = space();
    			div3 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Aditya Shankar";
    			t3 = space();
    			p = element("p");
    			p.textContent = "WEBMASTER";
    			t5 = space();
    			div2 = element("div");
    			t6 = space();
    			create_component(games.$$.fragment);
    			if (!src_url_equal(img.src, img_src_value = "./my_face.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "its me!, I've my hands in faced like I'm explaining something");
    			attr_dev(img, "width", "200");
    			attr_dev(img, "class", "svelte-1dp1d9h");
    			add_location(img, file$6, 6, 2, 101);
    			attr_dev(div0, "class", "background svelte-1dp1d9h");
    			add_location(div0, file$6, 7, 2, 207);
    			attr_dev(div1, "class", "my-face svelte-1dp1d9h");
    			add_location(div1, file$6, 5, 1, 77);
    			attr_dev(h1, "class", "svelte-1dp1d9h");
    			add_location(h1, file$6, 10, 8, 285);
    			attr_dev(p, "class", "svelte-1dp1d9h");
    			add_location(p, file$6, 11, 8, 317);
    			attr_dev(div2, "class", "background svelte-1dp1d9h");
    			add_location(div2, file$6, 12, 8, 342);
    			attr_dev(div3, "class", "heading-name svelte-1dp1d9h");
    			add_location(div3, file$6, 9, 4, 250);
    			attr_dev(div4, "class", "head svelte-1dp1d9h");
    			add_location(div4, file$6, 4, 0, 57);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div1);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div4, t1);
    			append_dev(div4, div3);
    			append_dev(div3, h1);
    			append_dev(div3, t3);
    			append_dev(div3, p);
    			append_dev(div3, t5);
    			append_dev(div3, div2);
    			append_dev(div4, t6);
    			mount_component(games, div4, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(games.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(games.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(games);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Head', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Head> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Games });
    	return [];
    }

    class Head extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Head",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/skills.svelte generated by Svelte v3.41.0 */

    const file$5 = "src/skills.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    // (93:8) {#each [...allCategories] as category}
    function create_each_block_1(ctx) {
    	let input;
    	let input_class_value;
    	let input_value_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "button");
    			attr_dev(input, "class", input_class_value = "category " + (/*category*/ ctx[10].selected ? "selected" : "") + " svelte-r3ltbp");
    			input.value = input_value_value = /*category*/ ctx[10].name;
    			add_location(input, file$5, 93, 12, 2978);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);

    			if (!mounted) {
    				dispose = listen_dev(
    					input,
    					"click",
    					function () {
    						if (is_function(/*selectCategory*/ ctx[2](/*category*/ ctx[10].name))) /*selectCategory*/ ctx[2](/*category*/ ctx[10].name).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*allCategories*/ 2 && input_class_value !== (input_class_value = "category " + (/*category*/ ctx[10].selected ? "selected" : "") + " svelte-r3ltbp")) {
    				attr_dev(input, "class", input_class_value);
    			}

    			if (dirty & /*allCategories*/ 2 && input_value_value !== (input_value_value = /*category*/ ctx[10].name)) {
    				prop_dev(input, "value", input_value_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(93:8) {#each [...allCategories] as category}",
    		ctx
    	});

    	return block;
    }

    // (107:16) {#if skill.bottomText}
    function create_if_block(ctx) {
    	let div;
    	let t_value = /*skill*/ ctx[7].bottomText + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "skill-text");
    			add_location(div, file$5, 107, 20, 3526);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*skills*/ 1 && t_value !== (t_value = /*skill*/ ctx[7].bottomText + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(107:16) {#if skill.bottomText}",
    		ctx
    	});

    	return block;
    }

    // (103:8) {#each skills as skill}
    function create_each_block(ctx) {
    	let div2;
    	let h3;
    	let t0_value = /*skill*/ ctx[7].name + "";
    	let t0;
    	let t1;
    	let div0;
    	let t2_value = ("🌟").repeat(/*skill*/ ctx[7].ranking) + "";
    	let t2;
    	let t3;
    	let t4;
    	let div1;
    	let t5;
    	let div2_class_value;
    	let if_block = /*skill*/ ctx[7].bottomText && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			div0 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			if (if_block) if_block.c();
    			t4 = space();
    			div1 = element("div");
    			t5 = space();
    			add_location(h3, file$5, 104, 16, 3373);
    			attr_dev(div0, "class", "ranking svelte-r3ltbp");
    			add_location(div0, file$5, 105, 16, 3411);
    			attr_dev(div1, "class", "background svelte-r3ltbp");
    			add_location(div1, file$5, 109, 16, 3613);
    			attr_dev(div2, "class", div2_class_value = "skill " + (/*skill*/ ctx[7].shown ? "" : "hidden") + " " + /*getRandomSkillType*/ ctx[3]() + " svelte-r3ltbp");
    			add_location(div2, file$5, 103, 12, 3288);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, h3);
    			append_dev(h3, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div0);
    			append_dev(div0, t2);
    			append_dev(div2, t3);
    			if (if_block) if_block.m(div2, null);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			append_dev(div2, t5);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*skills*/ 1 && t0_value !== (t0_value = /*skill*/ ctx[7].name + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*skills*/ 1 && t2_value !== (t2_value = ("🌟").repeat(/*skill*/ ctx[7].ranking) + "")) set_data_dev(t2, t2_value);

    			if (/*skill*/ ctx[7].bottomText) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div2, t4);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*skills*/ 1 && div2_class_value !== (div2_class_value = "skill " + (/*skill*/ ctx[7].shown ? "" : "hidden") + " " + /*getRandomSkillType*/ ctx[3]() + " svelte-r3ltbp")) {
    				attr_dev(div2, "class", div2_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(103:8) {#each skills as skill}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div2;
    	let h1;
    	let t1;
    	let div0;
    	let t2;
    	let div1;
    	let each_value_1 = [.../*allCategories*/ ctx[1]];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*skills*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Stuff I have worked with / skills I have";
    			t1 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h1, "class", "svelte-r3ltbp");
    			add_location(h1, file$5, 90, 4, 2836);
    			attr_dev(div0, "class", "all-categories svelte-r3ltbp");
    			add_location(div0, file$5, 91, 4, 2890);
    			attr_dev(div1, "class", "all-skills svelte-r3ltbp");
    			add_location(div1, file$5, 101, 4, 3219);
    			attr_dev(div2, "class", "skills svelte-r3ltbp");
    			attr_dev(div2, "id", "skills");
    			add_location(div2, file$5, 89, 0, 2799);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, h1);
    			append_dev(div2, t1);
    			append_dev(div2, div0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			append_dev(div2, t2);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*allCategories, selectCategory*/ 6) {
    				each_value_1 = [.../*allCategories*/ ctx[1]];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*skills, getRandomSkillType*/ 9) {
    				each_value = /*skills*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
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

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Skills', slots, []);

    	const allSkillsText = `
    skill:{ability out of 5}:{categories it falls under, seperated by commas}:{extra text to add in the bottom}

    HTML:5:{Frontend}
    CSS:3:{Frontend}
    JavaScript:5:{Languages,Frontend}
    GitHub:4:{All Encompassing}
    Svelte:3:{Frontend}:{this website is made in it}
    Python:5:{Languages,Backend}
    Flask:5:{Backend}
    OAuth:3:{Backend,Frontend,Services}
    Stripe:4:{Backend,Frontend,Services}:{for end user payments}
    Twilio:3:{Backend,Services}:{for sending SMSs to users}
    SendGrid:3:{Backend,Services}:{for sending Emails}
    User Authentication and Password management:4:{Backend,Frontend,Services}
    SQL:4:{Backend,Databases,Languages}
    Running Unix and Shell commands:3:{Backend, Services}
    Firestore:4:{Backend,Databases}
    MongoDB:2:{Backend,Databases}
    GIMP:3:{Graphic Design}
    InkScape:3:{Graphic Design}
    Slack's API:3:{Backend,Services}:{for automated messaging important notifications}
    Google Cloud Console:3:{Backend}
    Google App Engine:4:{Backend}
    Pull ups:1:{Physical}:{like 3}
    Push ups:2:{Physical}:{like 15, 20 if I'm determined}
    Collaboration with different developers and teams:3:{Soft Skills, Physical}
    Google Ads:2:{All Encompassing}`;

    	let allCategoryNames = new Set(["All"]);

    	const parseComponent = component => {
    		const details = component.split(":");
    		const name = details[0];
    		const ranking = Number.parseFloat(details[1]);
    		const categories = details[2].slice(1, details[2].length - 1).split(",").map(el => el.trim());
    		let bottomText = null;

    		if (details[3]) {
    			bottomText = details[3].slice(1, details[3].length - 1);
    		}

    		categories.forEach(category => allCategoryNames.add(category));
    		let shown = true;

    		return {
    			name,
    			ranking,
    			categories,
    			bottomText,
    			shown
    		};
    	};

    	let skills = allSkillsText.split("\n").slice(3).map(text => text.trim()).map(parseComponent);
    	allCategoryNames = [...allCategoryNames];

    	let allCategories = allCategoryNames.map(name => {
    		if (name == "All") return { name, selected: true };
    		return { name, selected: false };
    	});

    	const selectCategory = category => {
    		$$invalidate(1, allCategories = allCategoryNames.map(name => {
    			if (name == category) return { name, selected: true };
    			return { name, selected: false };
    		}));

    		if (category == "All") {
    			skills.forEach(skill => skill.shown = true);
    		} else {
    			for (let skill of skills) {
    				skill.shown = skill.categories.includes(category);
    			}
    		}

    		$$invalidate(0, skills);
    	};

    	const getRandomSkillType = () => {
    		const rand = Math.random();
    		if (rand < 0.25) return ""; else if (rand < 0.5) return "type-2"; else if (rand < 0.75) return "type-3"; else return "type-4";
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Skills> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		allSkillsText,
    		allCategoryNames,
    		parseComponent,
    		skills,
    		allCategories,
    		selectCategory,
    		getRandomSkillType
    	});

    	$$self.$inject_state = $$props => {
    		if ('allCategoryNames' in $$props) allCategoryNames = $$props.allCategoryNames;
    		if ('skills' in $$props) $$invalidate(0, skills = $$props.skills);
    		if ('allCategories' in $$props) $$invalidate(1, allCategories = $$props.allCategories);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [skills, allCategories, selectCategory, getRandomSkillType];
    }

    class Skills extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Skills",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/work.svelte generated by Svelte v3.41.0 */

    const file$4 = "src/work.svelte";

    function create_fragment$4(ctx) {
    	let div8;
    	let h1;
    	let t1;
    	let div3;
    	let div0;
    	let h30;
    	let t3;
    	let p0;
    	let t4;
    	let br0;
    	let t5;
    	let br1;
    	let t6;
    	let br2;
    	let t7;
    	let t8;
    	let p1;
    	let t10;
    	let div1;
    	let t11;
    	let div2;
    	let t12;
    	let div7;
    	let div4;
    	let h31;
    	let t14;
    	let p2;
    	let t16;
    	let div5;
    	let t17;
    	let div6;

    	const block = {
    		c: function create() {
    			div8 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Professional Work I've done";
    			t1 = space();
    			div3 = element("div");
    			div0 = element("div");
    			h30 = element("h3");
    			h30.textContent = "Tutor / Full Stack Web Developer at TypeCodeLearn";
    			t3 = space();
    			p0 = element("p");
    			t4 = text("Responsible for the creation of https://www.TypeCodeLearn.com");
    			br0 = element("br");
    			t5 = text("\n            managed backend enterprise databases, sending timely emails and SMSs,");
    			br1 = element("br");
    			t6 = text("\n            class purchases, course data management and user authentication and");
    			br2 = element("br");
    			t7 = text("\n            data management of online course material and assignments");
    			t8 = space();
    			p1 = element("p");
    			p1.textContent = "2 years";
    			t10 = space();
    			div1 = element("div");
    			t11 = space();
    			div2 = element("div");
    			t12 = space();
    			div7 = element("div");
    			div4 = element("div");
    			h31 = element("h3");
    			h31.textContent = "Undergraduate Teaching Assistant at Arizona State University";
    			t14 = space();
    			p2 = element("p");
    			p2.textContent = "4 months/2 semesters";
    			t16 = space();
    			div5 = element("div");
    			t17 = space();
    			div6 = element("div");
    			attr_dev(h1, "class", "svelte-1lm2zru");
    			add_location(h1, file$4, 1, 4, 23);
    			add_location(h30, file$4, 5, 12, 129);
    			add_location(br0, file$4, 6, 76, 265);
    			add_location(br1, file$4, 7, 81, 351);
    			add_location(br2, file$4, 8, 79, 435);
    			add_location(p0, file$4, 6, 12, 201);
    			add_location(p1, file$4, 10, 12, 526);
    			attr_dev(div0, "class", "content");
    			add_location(div0, file$4, 4, 8, 95);
    			attr_dev(div1, "class", "background-1 svelte-1lm2zru");
    			add_location(div1, file$4, 12, 8, 564);
    			attr_dev(div2, "class", "background-2 svelte-1lm2zru");
    			add_location(div2, file$4, 13, 8, 605);
    			attr_dev(div3, "class", "to-show svelte-1lm2zru");
    			add_location(div3, file$4, 3, 4, 65);
    			add_location(h31, file$4, 18, 12, 728);
    			add_location(p2, file$4, 19, 12, 810);
    			attr_dev(div4, "class", "content");
    			add_location(div4, file$4, 17, 8, 694);
    			attr_dev(div5, "class", "background-1 svelte-1lm2zru");
    			add_location(div5, file$4, 21, 8, 861);
    			attr_dev(div6, "class", "background-2 svelte-1lm2zru");
    			add_location(div6, file$4, 22, 8, 902);
    			attr_dev(div7, "class", "to-show to-show-2 svelte-1lm2zru");
    			add_location(div7, file$4, 16, 4, 654);
    			attr_dev(div8, "class", "work svelte-1lm2zru");
    			add_location(div8, file$4, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div8, anchor);
    			append_dev(div8, h1);
    			append_dev(div8, t1);
    			append_dev(div8, div3);
    			append_dev(div3, div0);
    			append_dev(div0, h30);
    			append_dev(div0, t3);
    			append_dev(div0, p0);
    			append_dev(p0, t4);
    			append_dev(p0, br0);
    			append_dev(p0, t5);
    			append_dev(p0, br1);
    			append_dev(p0, t6);
    			append_dev(p0, br2);
    			append_dev(p0, t7);
    			append_dev(div0, t8);
    			append_dev(div0, p1);
    			append_dev(div3, t10);
    			append_dev(div3, div1);
    			append_dev(div3, t11);
    			append_dev(div3, div2);
    			append_dev(div8, t12);
    			append_dev(div8, div7);
    			append_dev(div7, div4);
    			append_dev(div4, h31);
    			append_dev(div4, t14);
    			append_dev(div4, p2);
    			append_dev(div7, t16);
    			append_dev(div7, div5);
    			append_dev(div7, t17);
    			append_dev(div7, div6);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div8);
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
    	validate_slots('Work', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Work> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Work extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Work",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/projects.svelte generated by Svelte v3.41.0 */
    const file$3 = "src/projects.svelte";

    function create_fragment$3(ctx) {
    	let div8;
    	let h1;
    	let t1;
    	let div3;
    	let h20;
    	let t3;
    	let p0;
    	let a0;
    	let t5;
    	let div2;
    	let div0;
    	let t6;
    	let div1;
    	let t7;
    	let div7;
    	let h21;
    	let t9;
    	let div4;
    	let p1;
    	let t11;
    	let p2;
    	let a1;
    	let t13;
    	let div5;
    	let t14;
    	let div6;

    	const block = {
    		c: function create() {
    			div8 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Projects I've worked on";
    			t1 = space();
    			div3 = element("div");
    			h20 = element("h2");
    			h20.textContent = "wc-code, a way to write and run code online";
    			t3 = space();
    			p0 = element("p");
    			a0 = element("a");
    			a0.textContent = "https://github.com/vanillawc/wc-code";
    			t5 = space();
    			div2 = element("div");
    			div0 = element("div");
    			t6 = space();
    			div1 = element("div");
    			t7 = space();
    			div7 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Flask Value Checker";
    			t9 = space();
    			div4 = element("div");
    			p1 = element("p");
    			p1.textContent = "An alternative to WTForms in flask for easy type checking in forms";
    			t11 = space();
    			p2 = element("p");
    			a1 = element("a");
    			a1.textContent = "https://github.com/therealadityashankar/flask-value-checker";
    			t13 = space();
    			div5 = element("div");
    			t14 = space();
    			div6 = element("div");
    			attr_dev(h1, "class", "svelte-mp2s69");
    			add_location(h1, file$3, 11, 4, 287);
    			add_location(h20, file$3, 13, 8, 354);
    			attr_dev(a0, "href", "https://github.com/vanillawc/wc-code");
    			attr_dev(a0, "target", "_blank");
    			add_location(a0, file$3, 14, 11, 418);
    			add_location(p0, file$3, 14, 8, 415);
    			attr_dev(div0, "class", "back back-1 svelte-mp2s69");
    			add_location(div0, file$3, 16, 12, 571);
    			attr_dev(div1, "class", "back back-2 svelte-mp2s69");
    			add_location(div1, file$3, 17, 12, 615);
    			attr_dev(div2, "id", "coding-thingy");
    			attr_dev(div2, "class", "svelte-mp2s69");
    			add_location(div2, file$3, 15, 8, 534);
    			attr_dev(div3, "class", "project svelte-mp2s69");
    			add_location(div3, file$3, 12, 4, 324);
    			add_location(h21, file$3, 22, 8, 718);
    			add_location(p1, file$3, 24, 12, 773);
    			attr_dev(a1, "href", "https://github.com/therealadityashankar/flask-value-checker");
    			attr_dev(a1, "target", "_blank");
    			add_location(a1, file$3, 25, 15, 862);
    			add_location(p2, file$3, 25, 12, 859);
    			add_location(div4, file$3, 23, 8, 755);
    			attr_dev(div5, "class", "back back-1 svelte-mp2s69");
    			add_location(div5, file$3, 27, 8, 1039);
    			attr_dev(div6, "class", "back back-2 svelte-mp2s69");
    			add_location(div6, file$3, 28, 8, 1079);
    			attr_dev(div7, "class", "project project-2 svelte-mp2s69");
    			add_location(div7, file$3, 21, 4, 678);
    			attr_dev(div8, "class", "projects svelte-mp2s69");
    			add_location(div8, file$3, 10, 0, 260);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div8, anchor);
    			append_dev(div8, h1);
    			append_dev(div8, t1);
    			append_dev(div8, div3);
    			append_dev(div3, h20);
    			append_dev(div3, t3);
    			append_dev(div3, p0);
    			append_dev(p0, a0);
    			append_dev(div3, t5);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t6);
    			append_dev(div2, div1);
    			append_dev(div8, t7);
    			append_dev(div8, div7);
    			append_dev(div7, h21);
    			append_dev(div7, t9);
    			append_dev(div7, div4);
    			append_dev(div4, p1);
    			append_dev(div4, t11);
    			append_dev(div4, p2);
    			append_dev(p2, a1);
    			append_dev(div7, t13);
    			append_dev(div7, div5);
    			append_dev(div7, t14);
    			append_dev(div7, div6);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div8);
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

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Projects', slots, []);

    	onMount(() => {
    		const codeStuff = document.getElementById("code-stuff");
    		document.getElementById("coding-thingy").appendChild(codeStuff);
    		codeStuff.style.display = "";
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Projects> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ onMount });
    	return [];
    }

    class Projects extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Projects",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/certifications.svelte generated by Svelte v3.41.0 */

    const file$2 = "src/certifications.svelte";

    function create_fragment$2(ctx) {
    	let div16;
    	let h1;
    	let t1;
    	let div15;
    	let div4;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t2;
    	let div1;
    	let h20;
    	let t4;
    	let p0;
    	let t6;
    	let p1;
    	let t7;
    	let a0;
    	let t9;
    	let div2;
    	let t10;
    	let div3;
    	let t11;
    	let div9;
    	let div5;
    	let h21;
    	let t13;
    	let p2;
    	let t15;
    	let p3;
    	let t16;
    	let a1;
    	let t18;
    	let div6;
    	let img1;
    	let img1_src_value;
    	let t19;
    	let div7;
    	let t20;
    	let div8;
    	let t21;
    	let div14;
    	let div10;
    	let img2;
    	let img2_src_value;
    	let t22;
    	let div11;
    	let h22;
    	let t24;
    	let p4;
    	let t26;
    	let p5;
    	let t27;
    	let a2;
    	let t29;
    	let div12;
    	let t30;
    	let div13;

    	const block = {
    		c: function create() {
    			div16 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Certifications";
    			t1 = space();
    			div15 = element("div");
    			div4 = element("div");
    			div0 = element("div");
    			img0 = element("img");
    			t2 = space();
    			div1 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Full Stack Web Developer Nanodegree";
    			t4 = space();
    			p0 = element("p");
    			p0.textContent = "from Udacity";
    			t6 = space();
    			p1 = element("p");
    			t7 = text("confirmation : ");
    			a0 = element("a");
    			a0.textContent = "https://confirm.udacity.com/HECTVT9L";
    			t9 = space();
    			div2 = element("div");
    			t10 = space();
    			div3 = element("div");
    			t11 = space();
    			div9 = element("div");
    			div5 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Python foundation Nanodegree";
    			t13 = space();
    			p2 = element("p");
    			p2.textContent = "from Udacity";
    			t15 = space();
    			p3 = element("p");
    			t16 = text("confirmation : ");
    			a1 = element("a");
    			a1.textContent = "https://confirm.udacity.com/7DHS7GLD";
    			t18 = space();
    			div6 = element("div");
    			img1 = element("img");
    			t19 = space();
    			div7 = element("div");
    			t20 = space();
    			div8 = element("div");
    			t21 = space();
    			div14 = element("div");
    			div10 = element("div");
    			img2 = element("img");
    			t22 = space();
    			div11 = element("div");
    			h22 = element("h2");
    			h22.textContent = "Algorithmic Trading & Quantitative Analysis Using Python";
    			t24 = space();
    			p4 = element("p");
    			p4.textContent = "from Udemy";
    			t26 = space();
    			p5 = element("p");
    			t27 = text("confirmation : ");
    			a2 = element("a");
    			a2.textContent = "https://www.udemy.com/certificate/UC-7fc8cb80-a47b-494e-baa2-7a45c7deb2dd/";
    			t29 = space();
    			div12 = element("div");
    			t30 = space();
    			div13 = element("div");
    			attr_dev(h1, "class", "svelte-1rysfkq");
    			add_location(h1, file$2, 1, 4, 30);
    			if (!src_url_equal(img0.src, img0_src_value = "./udacityLogo.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "udacity logo");
    			attr_dev(img0, "height", "75");
    			add_location(img0, file$2, 5, 16, 167);
    			attr_dev(div0, "class", "by svelte-1rysfkq");
    			add_location(div0, file$2, 4, 12, 133);
    			add_location(h20, file$2, 8, 16, 295);
    			attr_dev(p0, "class", "from");
    			add_location(p0, file$2, 9, 16, 356);
    			attr_dev(a0, "href", "https://confirm.udacity.com/HECTVT9L");
    			attr_dev(a0, "target", "_blank");
    			attr_dev(a0, "class", "svelte-1rysfkq");
    			add_location(a0, file$2, 10, 62, 451);
    			attr_dev(p1, "class", "proof-of-completion");
    			add_location(p1, file$2, 10, 16, 405);
    			attr_dev(div1, "class", "content svelte-1rysfkq");
    			add_location(div1, file$2, 7, 12, 257);
    			attr_dev(div2, "class", "background svelte-1rysfkq");
    			add_location(div2, file$2, 12, 12, 590);
    			attr_dev(div3, "class", "background-2 svelte-1rysfkq");
    			add_location(div3, file$2, 13, 12, 633);
    			attr_dev(div4, "class", "certificate svelte-1rysfkq");
    			add_location(div4, file$2, 3, 8, 95);
    			add_location(h21, file$2, 18, 16, 788);
    			attr_dev(p2, "class", "from");
    			add_location(p2, file$2, 19, 16, 842);
    			attr_dev(a1, "href", "https://confirm.udacity.com/7DHS7GLD");
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "class", "svelte-1rysfkq");
    			add_location(a1, file$2, 20, 62, 937);
    			attr_dev(p3, "class", "proof-of-completion");
    			add_location(p3, file$2, 20, 16, 891);
    			attr_dev(div5, "class", "content svelte-1rysfkq");
    			add_location(div5, file$2, 17, 12, 750);
    			if (!src_url_equal(img1.src, img1_src_value = "./udacityLogo.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "udacity logo");
    			attr_dev(img1, "height", "75");
    			add_location(img1, file$2, 23, 16, 1110);
    			attr_dev(div6, "class", "by svelte-1rysfkq");
    			add_location(div6, file$2, 22, 12, 1076);
    			attr_dev(div7, "class", "background svelte-1rysfkq");
    			add_location(div7, file$2, 25, 12, 1200);
    			attr_dev(div8, "class", "background-2 svelte-1rysfkq");
    			add_location(div8, file$2, 26, 12, 1243);
    			attr_dev(div9, "class", "certificate certificate-2 reverse svelte-1rysfkq");
    			add_location(div9, file$2, 16, 8, 690);
    			if (!src_url_equal(img2.src, img2_src_value = "./udemyLogo.svg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "udemy logo");
    			attr_dev(img2, "height", "75");
    			add_location(img2, file$2, 31, 16, 1372);
    			attr_dev(div10, "class", "by svelte-1rysfkq");
    			add_location(div10, file$2, 30, 12, 1338);
    			add_location(h22, file$2, 34, 16, 1496);
    			attr_dev(p4, "class", "from");
    			add_location(p4, file$2, 35, 16, 1578);
    			attr_dev(a2, "href", "https://www.udemy.com/certificate/UC-7fc8cb80-a47b-494e-baa2-7a45c7deb2dd/");
    			attr_dev(a2, "target", "_blank");
    			attr_dev(a2, "class", "svelte-1rysfkq");
    			add_location(a2, file$2, 36, 62, 1671);
    			attr_dev(p5, "class", "proof-of-completion");
    			add_location(p5, file$2, 36, 16, 1625);
    			attr_dev(div11, "class", "content svelte-1rysfkq");
    			add_location(div11, file$2, 33, 12, 1458);
    			attr_dev(div12, "class", "background svelte-1rysfkq");
    			add_location(div12, file$2, 38, 12, 1886);
    			attr_dev(div13, "class", "background-2 svelte-1rysfkq");
    			add_location(div13, file$2, 39, 12, 1929);
    			attr_dev(div14, "class", "certificate svelte-1rysfkq");
    			add_location(div14, file$2, 29, 8, 1300);
    			attr_dev(div15, "class", "certifications");
    			add_location(div15, file$2, 2, 4, 58);
    			attr_dev(div16, "id", "certifications");
    			attr_dev(div16, "class", "svelte-1rysfkq");
    			add_location(div16, file$2, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div16, anchor);
    			append_dev(div16, h1);
    			append_dev(div16, t1);
    			append_dev(div16, div15);
    			append_dev(div15, div4);
    			append_dev(div4, div0);
    			append_dev(div0, img0);
    			append_dev(div4, t2);
    			append_dev(div4, div1);
    			append_dev(div1, h20);
    			append_dev(div1, t4);
    			append_dev(div1, p0);
    			append_dev(div1, t6);
    			append_dev(div1, p1);
    			append_dev(p1, t7);
    			append_dev(p1, a0);
    			append_dev(div4, t9);
    			append_dev(div4, div2);
    			append_dev(div4, t10);
    			append_dev(div4, div3);
    			append_dev(div15, t11);
    			append_dev(div15, div9);
    			append_dev(div9, div5);
    			append_dev(div5, h21);
    			append_dev(div5, t13);
    			append_dev(div5, p2);
    			append_dev(div5, t15);
    			append_dev(div5, p3);
    			append_dev(p3, t16);
    			append_dev(p3, a1);
    			append_dev(div9, t18);
    			append_dev(div9, div6);
    			append_dev(div6, img1);
    			append_dev(div9, t19);
    			append_dev(div9, div7);
    			append_dev(div9, t20);
    			append_dev(div9, div8);
    			append_dev(div15, t21);
    			append_dev(div15, div14);
    			append_dev(div14, div10);
    			append_dev(div10, img2);
    			append_dev(div14, t22);
    			append_dev(div14, div11);
    			append_dev(div11, h22);
    			append_dev(div11, t24);
    			append_dev(div11, p4);
    			append_dev(div11, t26);
    			append_dev(div11, p5);
    			append_dev(p5, t27);
    			append_dev(p5, a2);
    			append_dev(div14, t29);
    			append_dev(div14, div12);
    			append_dev(div14, t30);
    			append_dev(div14, div13);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div16);
    		}
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
    	validate_slots('Certifications', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Certifications> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Certifications extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Certifications",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/reviews.svelte generated by Svelte v3.41.0 */

    const file$1 = "src/reviews.svelte";

    function create_fragment$1(ctx) {
    	let div7;
    	let h1;
    	let t1;
    	let div6;
    	let div2;
    	let div0;
    	let p0;
    	let t3;
    	let div1;
    	let p1;
    	let t5;
    	let p2;
    	let t6;
    	let a;
    	let t8;
    	let div5;
    	let div3;
    	let p3;
    	let t10;
    	let div4;
    	let p4;
    	let t12;
    	let p5;
    	let t13;
    	let br;
    	let t14;

    	const block = {
    		c: function create() {
    			div7 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Reviews";
    			t1 = space();
    			div6 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = "\"Learning Python with him is a great experience. He has complete knowledge about what he is teaching. He is teaching Python with flavor of my needs. That is what I wanted. If i describe in 3 words: A good teacher, Knowledgeable, A good human being. Thumbs up for him. \"";
    			t3 = space();
    			div1 = element("div");
    			p1 = element("p");
    			p1.textContent = "Karthik Trivedi";
    			t5 = space();
    			p2 = element("p");
    			t6 = text("Attended python coaching ");
    			a = element("a");
    			a.textContent = "(proof of review)";
    			t8 = space();
    			div5 = element("div");
    			div3 = element("div");
    			p3 = element("p");
    			p3.textContent = "\"Taught every topic in a very interesting manner. His teaching was very clear, detailed and easy to absorb. He was a constant motivator, a great teacher and am amazing person! Would definitely love to learn more and more from him\"";
    			t10 = space();
    			div4 = element("div");
    			p4 = element("p");
    			p4.textContent = "Yashasvi Kotra";
    			t12 = space();
    			p5 = element("p");
    			t13 = text("Attended Python, JavaScript and ");
    			br = element("br");
    			t14 = text("HTML Basics training");
    			attr_dev(h1, "class", "svelte-p75m8o");
    			add_location(h1, file$1, 1, 4, 23);
    			add_location(p0, file$1, 6, 16, 142);
    			attr_dev(div0, "class", "content svelte-p75m8o");
    			add_location(div0, file$1, 5, 12, 104);
    			attr_dev(p1, "class", "person svelte-p75m8o");
    			add_location(p1, file$1, 9, 16, 485);
    			attr_dev(a, "href", "https://www.urbanpro.com/adityashankar#reviews");
    			add_location(a, file$1, 10, 56, 579);
    			attr_dev(p2, "class", "for");
    			add_location(p2, file$1, 10, 16, 539);
    			attr_dev(div1, "class", "from svelte-p75m8o");
    			add_location(div1, file$1, 8, 12, 450);
    			attr_dev(div2, "class", "review svelte-p75m8o");
    			add_location(div2, file$1, 4, 8, 71);
    			add_location(p3, file$1, 16, 16, 783);
    			attr_dev(div3, "class", "content svelte-p75m8o");
    			add_location(div3, file$1, 15, 12, 745);
    			attr_dev(p4, "class", "person svelte-p75m8o");
    			add_location(p4, file$1, 19, 16, 1087);
    			add_location(br, file$1, 20, 63, 1187);
    			attr_dev(p5, "class", "for");
    			add_location(p5, file$1, 20, 16, 1140);
    			attr_dev(div4, "class", "from svelte-p75m8o");
    			add_location(div4, file$1, 18, 12, 1052);
    			attr_dev(div5, "class", "review r2 svelte-p75m8o");
    			add_location(div5, file$1, 14, 8, 709);
    			attr_dev(div6, "class", "all svelte-p75m8o");
    			add_location(div6, file$1, 3, 4, 45);
    			attr_dev(div7, "id", "reviews");
    			attr_dev(div7, "class", "svelte-p75m8o");
    			add_location(div7, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div7, anchor);
    			append_dev(div7, h1);
    			append_dev(div7, t1);
    			append_dev(div7, div6);
    			append_dev(div6, div2);
    			append_dev(div2, div0);
    			append_dev(div0, p0);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div1, p1);
    			append_dev(div1, t5);
    			append_dev(div1, p2);
    			append_dev(p2, t6);
    			append_dev(p2, a);
    			append_dev(div6, t8);
    			append_dev(div6, div5);
    			append_dev(div5, div3);
    			append_dev(div3, p3);
    			append_dev(div5, t10);
    			append_dev(div5, div4);
    			append_dev(div4, p4);
    			append_dev(div4, t12);
    			append_dev(div4, p5);
    			append_dev(p5, t13);
    			append_dev(p5, br);
    			append_dev(p5, t14);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div7);
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
    	validate_slots('Reviews', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Reviews> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Reviews extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Reviews",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.41.0 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let link;
    	let t0;
    	let main;
    	let head;
    	let t1;
    	let div12;
    	let a0;
    	let div2;
    	let t2;
    	let div0;
    	let t3;
    	let div1;
    	let t4;
    	let a1;
    	let div5;
    	let t5;
    	let div3;
    	let t6;
    	let div4;
    	let t7;
    	let a2;
    	let div8;
    	let t8;
    	let div6;
    	let t9;
    	let div7;
    	let t10;
    	let a3;
    	let div11;
    	let t11;
    	let div9;
    	let t12;
    	let div10;
    	let t13;
    	let div13;
    	let work;
    	let t14;
    	let projects;
    	let t15;
    	let skills;
    	let t16;
    	let certifications;
    	let t17;
    	let reviews;
    	let current;
    	head = new Head({ $$inline: true });
    	work = new Work({ $$inline: true });
    	projects = new Projects({ $$inline: true });
    	skills = new Skills({ $$inline: true });
    	certifications = new Certifications({ $$inline: true });
    	reviews = new Reviews({ $$inline: true });

    	const block = {
    		c: function create() {
    			link = element("link");
    			t0 = space();
    			main = element("main");
    			create_component(head.$$.fragment);
    			t1 = space();
    			div12 = element("div");
    			a0 = element("a");
    			div2 = element("div");
    			t2 = text("Work\n\t\t\t\t");
    			div0 = element("div");
    			t3 = space();
    			div1 = element("div");
    			t4 = space();
    			a1 = element("a");
    			div5 = element("div");
    			t5 = text("Skills\n\t\t\t\t");
    			div3 = element("div");
    			t6 = space();
    			div4 = element("div");
    			t7 = space();
    			a2 = element("a");
    			div8 = element("div");
    			t8 = text("Certifications\n\t\t\t\t");
    			div6 = element("div");
    			t9 = space();
    			div7 = element("div");
    			t10 = space();
    			a3 = element("a");
    			div11 = element("div");
    			t11 = text("Reviews\n\t\t\t\t");
    			div9 = element("div");
    			t12 = space();
    			div10 = element("div");
    			t13 = space();
    			div13 = element("div");
    			create_component(work.$$.fragment);
    			t14 = space();
    			create_component(projects.$$.fragment);
    			t15 = space();
    			create_component(skills.$$.fragment);
    			t16 = space();
    			create_component(certifications.$$.fragment);
    			t17 = space();
    			create_component(reviews.$$.fragment);
    			attr_dev(link, "href", "https://fonts.googleapis.com/css2?family=Josefin+Sans&display=swap");
    			attr_dev(link, "rel", "stylesheet");
    			add_location(link, file, 0, 0, 0);
    			attr_dev(div0, "class", "back-before svelte-w7thyw");
    			add_location(div0, file, 17, 4, 471);
    			attr_dev(div1, "class", "back svelte-w7thyw");
    			add_location(div1, file, 18, 4, 507);
    			attr_dev(div2, "class", "navpoint svelte-w7thyw");
    			add_location(div2, file, 15, 3, 435);
    			attr_dev(a0, "href", "#work");
    			attr_dev(a0, "class", "svelte-w7thyw");
    			add_location(a0, file, 14, 2, 415);
    			attr_dev(div3, "class", "back-before svelte-w7thyw");
    			add_location(div3, file, 25, 4, 621);
    			attr_dev(div4, "class", "back svelte-w7thyw");
    			add_location(div4, file, 26, 4, 657);
    			attr_dev(div5, "class", "navpoint skills svelte-w7thyw");
    			add_location(div5, file, 23, 3, 576);
    			attr_dev(a1, "href", "#skills");
    			attr_dev(a1, "class", "svelte-w7thyw");
    			add_location(a1, file, 22, 2, 554);
    			attr_dev(div6, "class", "back-before svelte-w7thyw");
    			add_location(div6, file, 33, 4, 793);
    			attr_dev(div7, "class", "back svelte-w7thyw");
    			add_location(div7, file, 34, 4, 829);
    			attr_dev(div8, "class", "navpoint certifications svelte-w7thyw");
    			add_location(div8, file, 31, 3, 732);
    			attr_dev(a2, "href", "#certifications");
    			attr_dev(a2, "class", "svelte-w7thyw");
    			add_location(a2, file, 30, 2, 702);
    			attr_dev(div9, "class", "back-before svelte-w7thyw");
    			add_location(div9, file, 41, 4, 944);
    			attr_dev(div10, "class", "back svelte-w7thyw");
    			add_location(div10, file, 42, 4, 980);
    			attr_dev(div11, "class", "navpoint reviews svelte-w7thyw");
    			add_location(div11, file, 39, 3, 897);
    			attr_dev(a3, "href", "#reviews");
    			attr_dev(a3, "class", "svelte-w7thyw");
    			add_location(a3, file, 38, 2, 874);
    			attr_dev(div12, "class", "navigation svelte-w7thyw");
    			add_location(div12, file, 13, 1, 388);
    			attr_dev(div13, "class", "ability svelte-w7thyw");
    			attr_dev(div13, "id", "work");
    			add_location(div13, file, 47, 1, 1032);
    			attr_dev(main, "class", "svelte-w7thyw");
    			add_location(main, file, 10, 0, 370);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, link, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);
    			mount_component(head, main, null);
    			append_dev(main, t1);
    			append_dev(main, div12);
    			append_dev(div12, a0);
    			append_dev(a0, div2);
    			append_dev(div2, t2);
    			append_dev(div2, div0);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div12, t4);
    			append_dev(div12, a1);
    			append_dev(a1, div5);
    			append_dev(div5, t5);
    			append_dev(div5, div3);
    			append_dev(div5, t6);
    			append_dev(div5, div4);
    			append_dev(div12, t7);
    			append_dev(div12, a2);
    			append_dev(a2, div8);
    			append_dev(div8, t8);
    			append_dev(div8, div6);
    			append_dev(div8, t9);
    			append_dev(div8, div7);
    			append_dev(div12, t10);
    			append_dev(div12, a3);
    			append_dev(a3, div11);
    			append_dev(div11, t11);
    			append_dev(div11, div9);
    			append_dev(div11, t12);
    			append_dev(div11, div10);
    			append_dev(main, t13);
    			append_dev(main, div13);
    			mount_component(work, div13, null);
    			append_dev(div13, t14);
    			mount_component(projects, div13, null);
    			append_dev(main, t15);
    			mount_component(skills, main, null);
    			append_dev(main, t16);
    			mount_component(certifications, main, null);
    			append_dev(main, t17);
    			mount_component(reviews, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(head.$$.fragment, local);
    			transition_in(work.$$.fragment, local);
    			transition_in(projects.$$.fragment, local);
    			transition_in(skills.$$.fragment, local);
    			transition_in(certifications.$$.fragment, local);
    			transition_in(reviews.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(head.$$.fragment, local);
    			transition_out(work.$$.fragment, local);
    			transition_out(projects.$$.fragment, local);
    			transition_out(skills.$$.fragment, local);
    			transition_out(certifications.$$.fragment, local);
    			transition_out(reviews.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(link);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			destroy_component(head);
    			destroy_component(work);
    			destroy_component(projects);
    			destroy_component(skills);
    			destroy_component(certifications);
    			destroy_component(reviews);
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
    		Head,
    		Skills,
    		Work,
    		Projects,
    		Certifications,
    		Reviews
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

}());
//# sourceMappingURL=bundle.js.map
