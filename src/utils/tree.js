class Node{
    constructor(url, depth, id){
        this.title = '';
        this.url = url;
        this.depth = depth;
        this.children = [];
        this.id = id;
    }
}

class Tree{
    constructor(node, maxTotalPages, maxDepth){
        this.maxTotalPages = maxTotalPages
        this.maxDepth = maxDepth
        this.root = node;
        this.currentDepth = 0;
        this.currentPage = 0;
        this.isComplete = false;
    }
}


module.exports = {Tree, Node};