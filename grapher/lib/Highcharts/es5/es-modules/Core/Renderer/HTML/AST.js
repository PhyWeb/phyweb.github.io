/* *
 *
 *  (c) 2010-2025 Torstein Honsi
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */
'use strict';
import H from '../../Globals.js';
var SVG_NS = H.SVG_NS, win = H.win;
import U from '../../Utilities.js';
var attr = U.attr, createElement = U.createElement, css = U.css, error = U.error, isFunction = U.isFunction, isString = U.isString, objectEach = U.objectEach, splat = U.splat;
var trustedTypes = win.trustedTypes;
/* *
 *
 *  Constants
 *
 * */
// Create the trusted type policy. This should not be exposed.
var trustedTypesPolicy = (trustedTypes &&
    isFunction(trustedTypes.createPolicy) &&
    trustedTypes.createPolicy('highcharts', {
        createHTML: function (s) { return s; }
    }));
var emptyHTML = trustedTypesPolicy ?
    trustedTypesPolicy.createHTML('') :
    '';
/* *
 *
 *  Class
 *
 * */
/**
 * The AST class represents an abstract syntax tree of HTML or SVG content. It
 * can take HTML as an argument, parse it, optionally transform it to SVG, then
 * perform sanitation before inserting it into the DOM.
 *
 * @class
 * @name Highcharts.AST
 *
 * @param {string|Array<Highcharts.ASTNode>} source
 * Either an HTML string or an ASTNode list to populate the tree.
 */
var AST = /** @class */ (function () {
    /* *
     *
     *  Constructor
     *
     * */
    // Construct an AST from HTML markup, or wrap an array of existing AST nodes
    function AST(source) {
        this.nodes = typeof source === 'string' ?
            this.parseMarkup(source) : source;
    }
    /* *
     *
     *  Static Functions
     *
     * */
    /**
     * Filter an object of SVG or HTML attributes against the allow list.
     *
     * @static
     *
     * @function Highcharts.AST#filterUserAttributes
     *
     * @param {Highcharts.SVGAttributes} attributes The attributes to filter
     *
     * @return {Highcharts.SVGAttributes}
     * The filtered attributes
     */
    AST.filterUserAttributes = function (attributes) {
        objectEach(attributes, function (val, key) {
            var valid = true;
            if (AST.allowedAttributes.indexOf(key) === -1) {
                valid = false;
            }
            if (['background', 'dynsrc', 'href', 'lowsrc', 'src']
                .indexOf(key) !== -1) {
                valid = isString(val) && AST.allowedReferences.some(function (ref) { return val.indexOf(ref) === 0; });
            }
            if (!valid) {
                error(33, false, void 0, {
                    'Invalid attribute in config': "".concat(key)
                });
                delete attributes[key];
            }
            // #17753, < is not allowed in SVG attributes
            if (isString(val) && attributes[key]) {
                attributes[key] = val.replace(/</g, '&lt;');
            }
        });
        return attributes;
    };
    AST.parseStyle = function (style) {
        return style
            .split(';')
            .reduce(function (styles, line) {
            var pair = line.split(':').map(function (s) { return s.trim(); }), key = pair.shift();
            if (key && pair.length) {
                styles[key.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); })] = pair.join(':'); // #17146
            }
            return styles;
        }, {});
    };
    /**
     * Utility function to set html content for an element by passing in a
     * markup string. The markup is safely parsed by the AST class to avoid
     * XSS vulnerabilities. This function should be used instead of setting
     * `innerHTML` in all cases where the content is not fully trusted.
     *
     * @static
     * @function Highcharts.AST#setElementHTML
     *
     * @param {SVGDOMElement|HTMLDOMElement} el
     * Node to set content of.
     *
     * @param {string} html
     * Markup string
     */
    AST.setElementHTML = function (el, html) {
        el.innerHTML = AST.emptyHTML; // Clear previous
        if (html) {
            var ast = new AST(html);
            ast.addToDOM(el);
        }
    };
    /* *
     *
     *  Functions
     *
     * */
    /**
     * Add the tree defined as a hierarchical JS structure to the DOM
     *
     * @function Highcharts.AST#addToDOM
     *
     * @param {Highcharts.HTMLDOMElement|Highcharts.SVGDOMElement} parent
     * The node where it should be added
     *
     * @return {Highcharts.HTMLDOMElement|Highcharts.SVGDOMElement}
     * The inserted node.
     */
    AST.prototype.addToDOM = function (parent) {
        /**
         * @private
         * @param {Highcharts.ASTNode} subtree
         * HTML/SVG definition
         * @param {Element} [subParent]
         * parent node
         * @return {Highcharts.SVGDOMElement|Highcharts.HTMLDOMElement}
         * The inserted node.
         */
        function recurse(subtree, subParent) {
            var ret;
            splat(subtree).forEach(function (item) {
                var tagName = item.tagName;
                var textNode = item.textContent ?
                    H.doc.createTextNode(item.textContent) :
                    void 0;
                // Whether to ignore the AST filtering totally, #15345
                var bypassHTMLFiltering = AST.bypassHTMLFiltering;
                var node;
                if (tagName) {
                    if (tagName === '#text') {
                        node = textNode;
                    }
                    else if (AST.allowedTags.indexOf(tagName) !== -1 ||
                        bypassHTMLFiltering) {
                        var NS = tagName === 'svg' ?
                            SVG_NS :
                            (subParent.namespaceURI || SVG_NS);
                        var element = H.doc.createElementNS(NS, tagName);
                        var attributes_1 = item.attributes || {};
                        // Apply attributes from root of AST node, legacy from
                        // from before TextBuilder
                        objectEach(item, function (val, key) {
                            if (key !== 'tagName' &&
                                key !== 'attributes' &&
                                key !== 'children' &&
                                key !== 'style' &&
                                key !== 'textContent') {
                                attributes_1[key] = val;
                            }
                        });
                        attr(element, bypassHTMLFiltering ?
                            attributes_1 :
                            AST.filterUserAttributes(attributes_1));
                        if (item.style) {
                            css(element, item.style);
                        }
                        // Add text content
                        if (textNode) {
                            element.appendChild(textNode);
                        }
                        // Recurse
                        recurse(item.children || [], element);
                        node = element;
                    }
                    else {
                        error(33, false, void 0, {
                            'Invalid tagName in config': tagName
                        });
                    }
                }
                // Add to the tree
                if (node) {
                    subParent.appendChild(node);
                }
                ret = node;
            });
            // Return last node added (on top level it's the only one)
            return ret;
        }
        return recurse(this.nodes, parent);
    };
    /**
     * Parse HTML/SVG markup into AST Node objects. Used internally from the
     * constructor.
     *
     * @private
     *
     * @function Highcharts.AST#getNodesFromMarkup
     *
     * @param {string} markup The markup string.
     *
     * @return {Array<Highcharts.ASTNode>} The parsed nodes.
     */
    AST.prototype.parseMarkup = function (markup) {
        var nodes = [];
        markup = markup
            .trim()
            // The style attribute throws a warning when parsing when CSP is
            // enabled (#6884), so use an alias and pick it up below
            // Make all quotation marks parse correctly to DOM (#17627)
            .replace(/ style=(["'])/g, ' data-style=$1');
        var doc;
        try {
            doc = new DOMParser().parseFromString(trustedTypesPolicy ?
                trustedTypesPolicy.createHTML(markup) :
                markup, 'text/html');
        }
        catch (e) {
            // There are two cases where this fails:
            // 1. IE9 and PhantomJS, where the DOMParser only supports parsing
            //    XML
            // 2. Due to a Chromium issue where chart redraws are triggered by
            //    a `beforeprint` event (#16931),
            //    https://issues.chromium.org/issues/40222135
        }
        if (!doc) {
            var body = createElement('div');
            body.innerHTML = markup;
            doc = { body: body };
        }
        var appendChildNodes = function (node, addTo) {
            var tagName = node.nodeName.toLowerCase();
            // Add allowed tags
            var astNode = {
                tagName: tagName
            };
            if (tagName === '#text') {
                astNode.textContent = node.textContent || '';
            }
            var parsedAttributes = node.attributes;
            // Add attributes
            if (parsedAttributes) {
                var attributes_2 = {};
                [].forEach.call(parsedAttributes, function (attrib) {
                    if (attrib.name === 'data-style') {
                        astNode.style = AST.parseStyle(attrib.value);
                    }
                    else {
                        attributes_2[attrib.name] = attrib.value;
                    }
                });
                astNode.attributes = attributes_2;
            }
            // Handle children
            if (node.childNodes.length) {
                var children_1 = [];
                [].forEach.call(node.childNodes, function (childNode) {
                    appendChildNodes(childNode, children_1);
                });
                if (children_1.length) {
                    astNode.children = children_1;
                }
            }
            addTo.push(astNode);
        };
        [].forEach.call(doc.body.childNodes, function (childNode) { return appendChildNodes(childNode, nodes); });
        return nodes;
    };
    /* *
     *
     *  Static Properties
     *
     * */
    /**
     * The list of allowed SVG or HTML attributes, used for sanitizing
     * potentially harmful content from the chart configuration before adding to
     * the DOM.
     *
     * @see [Source code with default values](
     * https://github.com/highcharts/highcharts/blob/master/ts/Core/Renderer/HTML/AST.ts#:~:text=public%20static%20allowedAttributes)
     *
     * @example
     * // Allow a custom, trusted attribute
     * Highcharts.AST.allowedAttributes.push('data-value');
     *
     * @name Highcharts.AST.allowedAttributes
     * @type {Array<string>}
     */
    AST.allowedAttributes = [
        'alt',
        'aria-controls',
        'aria-describedby',
        'aria-expanded',
        'aria-haspopup',
        'aria-hidden',
        'aria-label',
        'aria-labelledby',
        'aria-live',
        'aria-pressed',
        'aria-readonly',
        'aria-roledescription',
        'aria-selected',
        'class',
        'clip-path',
        'color',
        'colspan',
        'cx',
        'cy',
        'd',
        'disabled',
        'dx',
        'dy',
        'fill',
        'filterUnits',
        'flood-color',
        'flood-opacity',
        'height',
        'href',
        'id',
        'in',
        'in2',
        'markerHeight',
        'markerWidth',
        'offset',
        'opacity',
        'operator',
        'orient',
        'padding',
        'paddingLeft',
        'paddingRight',
        'patternUnits',
        'r',
        'radius',
        'refX',
        'refY',
        'result',
        'role',
        'rowspan',
        'scope',
        'slope',
        'src',
        'startOffset',
        'stdDeviation',
        'stroke-linecap',
        'stroke-width',
        'stroke',
        'style',
        'summary',
        'tabindex',
        'tableValues',
        'target',
        'text-align',
        'text-anchor',
        'textAnchor',
        'textLength',
        'title',
        'type',
        'valign',
        'width',
        'x',
        'x1',
        'x2',
        'xlink:href',
        'y',
        'y1',
        'y2',
        'zIndex'
    ];
    /**
     * The list of allowed references for referring attributes like `href` and
     * `src`. Attribute values will only be allowed if they start with one of
     * these strings.
     *
     * @see [Source code with default values](
     * https://github.com/highcharts/highcharts/blob/master/ts/Core/Renderer/HTML/AST.ts#:~:text=public%20static%20allowedReferences)
     *
     * @example
     * // Allow tel:
     * Highcharts.AST.allowedReferences.push('tel:');
     *
     * @name    Highcharts.AST.allowedReferences
     * @type    {Array<string>}
     */
    AST.allowedReferences = [
        'https://',
        'http://',
        'mailto:',
        '/',
        '../',
        './',
        '#'
    ];
    /**
     * The list of allowed SVG or HTML tags, used for sanitizing potentially
     * harmful content from the chart configuration before adding to the DOM.
     *
     * @see [Source code with default values](
     * https://github.com/highcharts/highcharts/blob/master/ts/Core/Renderer/HTML/AST.ts#:~:text=public%20static%20allowedTags)
     *
     * @example
     * // Allow a custom, trusted tag
     * Highcharts.AST.allowedTags.push('blink'); // ;)
     *
     * @name    Highcharts.AST.allowedTags
     * @type    {Array<string>}
     */
    AST.allowedTags = [
        '#text',
        'a',
        'abbr',
        'b',
        'br',
        'button',
        'caption',
        'circle',
        'clipPath',
        'code',
        'dd',
        'defs',
        'div',
        'dl',
        'dt',
        'em',
        'feComponentTransfer',
        'feComposite',
        'feDropShadow',
        'feFlood',
        'feFuncA',
        'feFuncB',
        'feFuncG',
        'feFuncR',
        'feGaussianBlur',
        'feMerge',
        'feMergeNode',
        'feMorphology',
        'feOffset',
        'filter',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'hr',
        'i',
        'img',
        'li',
        'linearGradient',
        'marker',
        'ol',
        'p',
        'path',
        'pattern',
        'pre',
        'rect',
        'small',
        'span',
        'stop',
        'strong',
        'style',
        'sub',
        'sup',
        'svg',
        'table',
        'tbody',
        'td',
        'text',
        'textPath',
        'th',
        'thead',
        'title',
        'tr',
        'tspan',
        'u',
        'ul'
    ];
    AST.emptyHTML = emptyHTML;
    /**
     * Allow all custom SVG and HTML attributes, references and tags (together
     * with potentially harmful ones) to be added to the DOM from the chart
     * configuration. In other words, disable the allow-listing which is the
     * primary functionality of the AST.
     *
     * WARNING: Setting this property to `true` while allowing untrusted user
     * data in the chart configuration will expose your application to XSS
     * security risks!
     *
     * Note that in case you want to allow a known set of tags or attributes,
     * you should allow-list them instead of disabling the filtering totally.
     * See [allowedAttributes](Highcharts.AST#.allowedAttributes),
     * [allowedReferences](Highcharts.AST#.allowedReferences) and
     * [allowedTags](Highcharts.AST#.allowedTags). The `bypassHTMLFiltering`
     * setting is intended only for those cases where allow-listing is not
     * practical, and the chart configuration already comes from a secure
     * source.
     *
     * @example
     * // Allow all custom attributes, references and tags (disable DOM XSS
     * // filtering)
     * Highcharts.AST.bypassHTMLFiltering = true;
     *
     * @name Highcharts.AST.bypassHTMLFiltering
     * @static
     */
    AST.bypassHTMLFiltering = false;
    return AST;
}());
/* *
 *
 *  Default Export
 *
 * */
export default AST;
/* *
 *
 *  API Declarations
 *
 * */
/**
 * Serialized form of an SVG/HTML definition, including children.
 *
 * @interface Highcharts.ASTNode
 */ /**
* @name Highcharts.ASTNode#attributes
* @type {Highcharts.SVGAttributes|undefined}
*/ /**
* @name Highcharts.ASTNode#children
* @type {Array<Highcharts.ASTNode>|undefined}
*/ /**
* @name Highcharts.ASTNode#tagName
* @type {string|undefined}
*/ /**
* @name Highcharts.ASTNode#textContent
* @type {string|undefined}
*/
(''); // Keeps doclets above in file
