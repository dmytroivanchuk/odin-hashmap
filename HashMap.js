import Node from "./Node.js";

export default class HashMap {
  #loadfactor = 0.75;
  #capacity = 16;
  #length = 0;
  #buckets = [];
  #entries = [];

  #hash(key) {
    let hashCode = 0;

    const primeNumber = 31;
    for (let i = 0; i < key.length; i++) {
      hashCode = (primeNumber * hashCode + key.charCodeAt(i)) % this.#capacity;
    }

    return hashCode;
  }

  #checkNodes(node, nodeParent, key, value) {
    if (node === null) {
      nodeParent.nextNode = new Node({ key, value });
      this.#entries.push([key, value]);
      this.#length += 1;
    }

    if (node.data.key === key) {
      node.data.value = value;
      const entryIndex = this.#entries.findIndex([key, value]);
      this.#entries[entryIndex][1] = value;
    } else {
      this.#checkNodes(node.nextNode, node, key, value);
    }
  }

  #doubleCapacityIfNecessary() {
    if (this.#length >= this.#capacity * this.#loadfactor) {
      this.#capacity *= 2;
    }
  }

  set(key, value) {
    this.#doubleCapacityIfNecessary();

    const index = this.#hash(key);

    if (index < 0 || index >= this.#buckets.length) {
      throw new Error("Trying to access index out of bounds");
    }

    const node = this.#buckets[index];

    if (!node) {
      this.#buckets[index] = new Node({ key: value });
      this.#entries.push([key, value]);
      this.#length += 1;
    } else {
      this.#checkNodes(node.nextNode, node, key, value);
    }
  }

  #checkNodesGet(node, key) {
    if (node === null) {
      return null;
    }

    if (node.data.key === key) {
      return node.data.value;
    } else {
      return this.#checkNodesGet(node.nextNode, key);
    }
  }

  get(key) {
    const index = this.#hash(key);

    if (index < 0 || index >= this.#buckets.length) {
      throw new Error("Trying to access index out of bounds");
    }

    const node = this.#buckets[index];

    if (!node) {
      return null;
    }

    return this.#checkNodesGet(node, key);
  }

  #checkNodesHas(node, key) {
    if (node === null) {
      return false;
    }

    if (node.data.key === key) {
      return true;
    } else {
      return this.#checkNodesHas(node.nextNode, key);
    }
  }

  has(key) {
    const index = this.#hash(key);

    if (index < 0 || index >= this.#buckets.length) {
      throw new Error("Trying to access index out of bounds");
    }

    const node = this.#buckets[index];

    if (!node) {
      return false;
    }

    return this.#checkNodesHas(node, key);
  }

  #checkNodesRemove(node, nodeParent, key) {
    if (node === null) {
      return false;
    }

    if (node.data.key === key) {
      nodeParent.nextNode = node.nextNode;
      const entryIndex = this.#entries.findIndex((entry) => entry[0] === key);
      this.#entries.splice(entryIndex, 1);
      this.#length -= 1;
      return true;
    } else {
      return this.#checkNodesRemove(node.nextNode, node, key);
    }
  }

  remove(key) {
    const index = this.#hash(key);

    if (index < 0 || index >= this.#buckets.length) {
      throw new Error("Trying to access index out of bounds");
    }

    const node = this.#buckets[index];

    if (!node) {
      return false;
    }

    if (node.data.key === key) {
      if (node.nextNode === null) {
        this.#buckets[index] = undefined;
      } else {
        this.#buckets[index] = node.nextNode;
      }

      const entryIndex = this.#entries.findIndex((entry) => entry[0] === key);
      this.#entries.splice(entryIndex, 1);
      this.#length -= 1;
      return true;
    }

    return this.#checkNodesRemove(node.nextNode, node, key);
  }

  length() {
    return this.#length;
  }

  clear() {
    this.#capacity = 16;
    this.#length = 0;
    this.#buckets = [];
    this.#entries = [];
  }

  keys() {
    return this.#entries.map((entry) => entry[0]);
  }

  values() {
    return this.#entries.map((entry) => entry[1]);
  }

  entries() {
    return this.#entries;
  }
}
