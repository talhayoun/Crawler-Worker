class Node {
    constructor(value) {
        this.value = value;
        this.children = [];
    }
}

class Queue {
    constructor() {
        this.first = null;
        this.last = null;
        this.size = 0;
    }

    enqueue(newNode) {
        if (this.size === 0) {
            this.first = newNode;
        } else {
            this.last.next = newNode;
        }
        this.last = newNode;
        this.size++;
        return newNode;
    }

    dequeue() {
        if (this.size === 0) return;
        let currentNode = this.first;

        this.first = this.first.next;
        this.size--;
        if (this.size === 0) {
            this.last = this.first;
        }
        return currentNode
    }
}

class BinarySearchTree {
    constructor(root) {
        this.root = root;
    }

    bfsTraverse(stopID) {
        if (this.root == null) return [];
        const valuesArray = [];
        const q = new Queue();
        this.root.id = "0";
        q.enqueue(this.root);
        while (q.size > 0) {
            const currentNode = q.dequeue();
            console.log(currentNode);
            valuesArray.push(currentNode.id);
            if (currentNode.children.length > 0) {
                for (let i = 0; i < currentNode.children.length; i++) {
                    if (currentNode.children[i].id) {
                        q.enqueue(currentNode.children[i]);
                        if (currentNode.children[i].id == stopID) {
                            console.log("STOPPINGG", stopID, currentNode.children[i].id)
                            return valuesArray;
                        }
                    }
                }
            }
            // if (currentNode.left !== null) q.enqueue(currentNode.left);
            // if (currentNode.right !== null) q.enqueue(currentNode.right);
        }
        return valuesArray
    }
}

// let newBinary = new BinarySearchTree();
module.exports = { BinarySearchTree };
