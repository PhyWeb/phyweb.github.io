/* *
 *
 *  (c) 2010-2025 Pawel Lysy Grzegorz Blachlinski
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */
'use strict';
import TreegraphNode from './TreegraphNode.js';
/* *
 *
 *  Class
 *
 * */
/**
 * @private
 * @class
 */
var TreegraphLayout = /** @class */ (function () {
    function TreegraphLayout() {
    }
    /* *
     *
     *  Functions
     *
     * */
    /**
     * Create dummy node, which allows to manually set the level of the node.
     *
     * @param {TreegraphNode} parent
     *        Parent node, to which the dummyNode should be connected.
     * @param {TreegraphNode} child
     *        Child node, which should be connected to dummyNode.
     * @param {number} gapSize
     *        Remaining gap size.
     *
     * @return {TreegraphNode}
     *         DummyNode as a parent of nodes, which column changes.
     */
    TreegraphLayout.createDummyNode = function (parent, child, gapSize) {
        // Initialise dummy node.
        var dummyNode = new TreegraphNode();
        dummyNode.id = parent.id + '-' + gapSize;
        dummyNode.ancestor = parent;
        // Add connection from new node to the previous points.
        // First connection to itself.
        dummyNode.children.push(child);
        dummyNode.parent = parent.id;
        dummyNode.parentNode = parent;
        dummyNode.point = child.point;
        dummyNode.level = child.level - gapSize;
        dummyNode.relativeXPosition = child.relativeXPosition;
        dummyNode.visible = child.visible;
        // Then connection from parent to dummyNode.
        parent.children[child.relativeXPosition] = dummyNode;
        child.oldParentNode = parent;
        child.relativeXPosition = 0;
        // Then connection from child to dummyNode.
        child.parentNode = dummyNode;
        child.parent = dummyNode.id;
        return dummyNode;
    };
    /**
     * Walker algorithm of positioning the nodes in the treegraph improved by
     * Buchheim to run in the linear time. Basic algorithm consists of post
     * order traversal, which starts from going bottom up (first walk), and then
     * pre order traversal top to bottom (second walk) where adding all of the
     * modifiers is performed.
     * link to the paper: http://dirk.jivas.de/papers/buchheim02improving.pdf
     *
     * @param {TreegraphSeries} series the Treegraph series
     */
    TreegraphLayout.prototype.calculatePositions = function (series) {
        var treeLayout = this;
        var nodes = series.nodeList;
        this.resetValues(nodes);
        var root = series.tree;
        if (root) {
            treeLayout.calculateRelativeX(root, 0);
            treeLayout.beforeLayout(nodes);
            treeLayout.firstWalk(root);
            treeLayout.secondWalk(root, -root.preX);
            treeLayout.afterLayout(nodes);
        }
    };
    /**
     * Create dummyNodes as parents for nodes, which column is changed.
     *
     * @param {Array<TreegraphNode>} nodes
     *        All of the nodes.
     */
    TreegraphLayout.prototype.beforeLayout = function (nodes) {
        for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
            var node = nodes_1[_i];
            for (var _a = 0, _b = node.children; _a < _b.length; _a++) {
                var child = _b[_a];
                // Support for children placed in distant columns.
                if (child && child.level - node.level > 1) {
                    // For further columns treat the nodes as a
                    // single parent-child pairs till the column is achieved.
                    var gapSize = child.level - node.level - 1;
                    // Parent -> dummyNode -> child
                    while (gapSize > 0) {
                        child = TreegraphLayout.createDummyNode(node, child, gapSize);
                        gapSize--;
                    }
                }
            }
        }
    };
    /**
     * Reset the calculated values from the previous run.
     * @param {TreegraphNode[]} nodes all of the nodes.
     */
    TreegraphLayout.prototype.resetValues = function (nodes) {
        for (var _i = 0, nodes_2 = nodes; _i < nodes_2.length; _i++) {
            var node = nodes_2[_i];
            node.mod = 0;
            node.ancestor = node;
            node.shift = 0;
            node.thread = void 0;
            node.change = 0;
            node.preX = 0;
        }
    };
    /**
     * Assigns the value to each node, which indicates, what is his sibling
     * number.
     *
     * @param {TreegraphNode} node
     *        Root node
     * @param {number} index
     *        Index to which the nodes position should be set
     */
    TreegraphLayout.prototype.calculateRelativeX = function (node, index) {
        var treeLayout = this, children = node.children;
        for (var i = 0, iEnd = children.length; i < iEnd; ++i) {
            treeLayout.calculateRelativeX(children[i], i);
        }
        node.relativeXPosition = index;
    };
    /**
     * Recursive post order traversal of the tree, where the initial position
     * of the nodes is calculated.
     *
     * @param {TreegraphNode} node
     *        The node for which the position should be calculated.
     */
    TreegraphLayout.prototype.firstWalk = function (node) {
        var treeLayout = this, 
        // Arbitrary value used to position nodes in respect to each other.
        siblingDistance = 1;
        var leftSibling;
        // If the node is a leaf, set it's position based on the left siblings.
        if (!node.hasChildren()) {
            leftSibling = node.getLeftSibling();
            if (leftSibling) {
                node.preX = leftSibling.preX + siblingDistance;
                node.mod = node.preX;
            }
            else {
                node.preX = 0;
            }
        }
        else {
            // If the node has children, perform the recursive first walk for
            // its children, and then calculate its shift in the apportion
            // function (most crucial part of the algorithm).
            var defaultAncestor = node.getLeftMostChild();
            for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
                var child = _a[_i];
                treeLayout.firstWalk(child);
                defaultAncestor = treeLayout.apportion(child, defaultAncestor);
            }
            treeLayout.executeShifts(node);
            var leftChild = node.getLeftMostChild(), rightChild = node.getRightMostChild(), 
            // Set the position of the parent as a middle point of its
            // children and move it by the value of the leftSibling (if it
            // exists).
            midPoint = (leftChild.preX + rightChild.preX) / 2;
            leftSibling = node.getLeftSibling();
            if (leftSibling) {
                node.preX = leftSibling.preX + siblingDistance;
                node.mod = node.preX - midPoint;
            }
            else {
                node.preX = midPoint;
            }
        }
    };
    /**
     * Pre order traversal of the tree, which sets the final xPosition of the
     * node as its preX value and sum of all if it's parents' modifiers.
     *
     * @param {TreegraphNode} node
     *        The node, for which the final position should be calculated.
     * @param {number} modSum
     *        The sum of modifiers of all of the parents.
     */
    TreegraphLayout.prototype.secondWalk = function (node, modSum) {
        var treeLayout = this;
        // When the chart is not inverted we want the tree to be positioned from
        // left to right with root node close to the chart border, this is why
        // x and y positions are switched.
        node.yPosition = node.preX + modSum;
        node.xPosition = node.level;
        for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
            var child = _a[_i];
            treeLayout.secondWalk(child, modSum + node.mod);
        }
    };
    /**
     *  Shift all children of the current node from right to left.
     *
     * @param {TreegraphNode} node
     *        The parent node.
     */
    TreegraphLayout.prototype.executeShifts = function (node) {
        var shift = 0, change = 0;
        for (var i = node.children.length - 1; i >= 0; i--) {
            var childNode = node.children[i];
            childNode.preX += shift;
            childNode.mod += shift;
            change += childNode.change;
            shift += childNode.shift + change;
        }
    };
    /**
     * The core of the algorithm. The new subtree is combined with the previous
     * subtrees. Threads are used to traverse the inside and outside contours of
     * the left and right subtree up to the highest common level. The vertecies
     * are left(right)Int(Out)node where Int means internal and Out means
     * outernal. For summing up the modifiers along the contour we use the
     * `left(right)Int(Out)mod` variable. Whenever two nodes of the inside
     * contours are in conflict we commute the left one of the greatest uncommon
     * ancestors using the getAncestor function and we call the moveSubtree
     * method to shift the subtree and prepare the shifts of smaller subtrees.
     * Finally we add a new thread (if necessary) and we adjust ancestor of
     * right outernal node or defaultAncestor.
     *
     * @param {TreegraphNode} node
     * @param {TreegraphNode} defaultAncestor
     *        The default ancestor of the passed node.
     */
    TreegraphLayout.prototype.apportion = function (node, defaultAncestor) {
        var treeLayout = this, leftSibling = node.getLeftSibling();
        if (leftSibling) {
            var rightIntNode = node, rightOutNode = node, leftIntNode = leftSibling, leftOutNode = rightIntNode.getLeftMostSibling(), rightIntMod = rightIntNode.mod, rightOutMod = rightOutNode.mod, leftIntMod = leftIntNode.mod, leftOutMod = leftOutNode.mod;
            while (leftIntNode &&
                leftIntNode.nextRight() &&
                rightIntNode &&
                rightIntNode.nextLeft()) {
                leftIntNode = leftIntNode.nextRight();
                leftOutNode = leftOutNode.nextLeft();
                rightIntNode = rightIntNode.nextLeft();
                rightOutNode = rightOutNode.nextRight();
                rightOutNode.ancestor = node;
                var siblingDistance = 1, shift = leftIntNode.preX +
                    leftIntMod -
                    (rightIntNode.preX + rightIntMod) +
                    siblingDistance;
                if (shift > 0) {
                    treeLayout.moveSubtree(node.getAncestor(leftIntNode, defaultAncestor), node, shift);
                    rightIntMod += shift;
                    rightOutMod += shift;
                }
                leftIntMod += leftIntNode.mod;
                rightIntMod += rightIntNode.mod;
                leftOutMod += leftOutNode.mod;
                rightOutMod += rightOutNode.mod;
            }
            if (leftIntNode &&
                leftIntNode.nextRight() &&
                !rightOutNode.nextRight()) {
                rightOutNode.thread = leftIntNode.nextRight();
                rightOutNode.mod += leftIntMod - rightOutMod;
            }
            if (rightIntNode &&
                rightIntNode.nextLeft() &&
                !leftOutNode.nextLeft()) {
                leftOutNode.thread = rightIntNode.nextLeft();
                leftOutNode.mod += rightIntMod - leftOutMod;
            }
            defaultAncestor = node;
        }
        return defaultAncestor;
    };
    /**
     * Shifts the subtree from leftNode to rightNode.
     *
     * @param {TreegraphNode} leftNode
     * @param {TreegraphNode} rightNode
     * @param {number} shift
     *        The value, by which the subtree should be moved.
     */
    TreegraphLayout.prototype.moveSubtree = function (leftNode, rightNode, shift) {
        var subtrees = rightNode.relativeXPosition - leftNode.relativeXPosition;
        rightNode.change -= shift / subtrees;
        rightNode.shift += shift;
        rightNode.preX += shift;
        rightNode.mod += shift;
        leftNode.change += shift / subtrees;
    };
    /**
     * Clear values created in a beforeLayout.
     *
     * @param {TreegraphNode[]} nodes
     *        All of the nodes of the Treegraph Series.
     */
    TreegraphLayout.prototype.afterLayout = function (nodes) {
        for (var _i = 0, nodes_3 = nodes; _i < nodes_3.length; _i++) {
            var node = nodes_3[_i];
            if (node.oldParentNode) {
                // Restore default connections
                node.relativeXPosition = node.parentNode.relativeXPosition;
                node.parent = node.oldParentNode.parent;
                node.parentNode = node.oldParentNode;
                // Delete dummyNode
                delete node.oldParentNode.children[node.relativeXPosition];
                node.oldParentNode.children[node.relativeXPosition] = node;
                node.oldParentNode = void 0;
            }
        }
    };
    return TreegraphLayout;
}());
/* *
 *
 *  Default Export
 *
 * */
export default TreegraphLayout;
