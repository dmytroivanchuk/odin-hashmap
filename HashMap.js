import Node from "./Node.js";

export default class HashMap {
  static #defaultCapacity = 16;
  static #loadfactor = 0.75;
  #capacity = 16;
  #length = 0;
  #buckets = Array(HashMap.#defaultCapacity);
  #entries = [];

  #hash(key) {
    let hashCode = 0;

    const primeNumber = 31;
    for (let i = 0; i < key.length; i++) {
      hashCode = (primeNumber * hashCode + key.charCodeAt(i)) % this.#capacity;
    }

    return hashCode;
  }

  #traverseNode(
    node,
    key,
    undefinedCallback,
    nullCallback,
    keyMatchCallback,
    parentNode
  ) {
    if (node === undefined) {
      return undefinedCallback();
    } else if (node === null) {
      return nullCallback(parentNode);
    } else if (node.data.key === key) {
      return keyMatchCallback(node, parentNode);
    } else {
      return this.#traverseNode(
        node.nextNode,
        key,
        undefinedCallback,
        nullCallback,
        keyMatchCallback,
        node
      );
    }
  }

  #operate(index, key, undefinedCallback, nullCallback, keyMatchCallback) {
    if (index < 0 || index >= this.#buckets.length) {
      throw new Error("Trying to access index out of bounds");
    }

    const node = this.#buckets[index];
    return this.#traverseNode(
      node,
      key,
      undefinedCallback,
      nullCallback,
      keyMatchCallback
    );
  }

  #doubleCapacityIfNecessary() {
    if (this.#length >= this.#capacity * HashMap.#loadfactor) {
      const oldBuckets = this.#buckets;
      this.#capacity *= 2;
      this.#length = 0;
      this.#buckets = Array(this.#capacity);
      this.#entries = [];

      oldBuckets.forEach((bucket) => {
        let node = bucket;
        while (node) {
          const { key, value } = node.data;
          this.set(key, value);
          node = node.nextNode;
        }
      });
    }
  }

  set(key, value) {
    this.#doubleCapacityIfNecessary();
    const index = this.#hash(key);

    const undefinedCallback = () => {
      this.#buckets[index] = new Node({ key, value });
      this.#entries.push([key, value]);
      this.#length += 1;
    };

    const nullCallback = (parentNode) => {
      parentNode.nextNode = new Node({ key, value });
      this.#entries.push([key, value]);
      this.#length += 1;
    };

    const keyMatchCallback = (node) => {
      node.data.value = value;
      const entryIndex = this.#entries.findIndex((entry) => entry[0] === key);
      this.#entries[entryIndex][1] = value;
    };

    return this.#operate(
      index,
      key,
      undefinedCallback,
      nullCallback,
      keyMatchCallback
    );
  }

  get(key) {
    const index = this.#hash(key);

    const undefinedCallback = () => null;
    const nullCallback = () => null;
    const keyMatchCallback = (node) => node.data.value;
    return this.#operate(
      index,
      key,
      undefinedCallback,
      nullCallback,
      keyMatchCallback
    );
  }

  has(key) {
    const index = this.#hash(key);

    const undefinedCallback = () => false;
    const nullCallback = () => false;
    const keyMatchCallback = () => true;
    return this.#operate(
      index,
      key,
      undefinedCallback,
      nullCallback,
      keyMatchCallback
    );
  }

  remove(key) {
    const index = this.#hash(key);

    const undefinedCallback = () => false;
    const nullCallback = () => false;
    const keyMatchCallback = (node, parentNode) => {
      if (node === this.#buckets[index]) {
        if (this.#buckets[index].nextNode === null) {
          this.#buckets[index] = undefined;
        } else {
          this.#buckets[index] = this.#buckets[index].nextNode;
        }
      } else {
        parentNode.nextNode = node.nextNode;
      }

      const entryIndex = this.#entries.findIndex((entry) => entry[0] === key);
      this.#entries.splice(entryIndex, 1);
      this.#length -= 1;
      return true;
    };

    return this.#operate(
      index,
      key,
      undefinedCallback,
      nullCallback,
      keyMatchCallback
    );
  }

  length() {
    return this.#length;
  }

  clear() {
    this.#capacity = HashMap.#defaultCapacity;
    this.#length = 0;
    this.#buckets = Array(HashMap.#defaultCapacity);
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
