export const nodeOps = {
  createElement: tagName => document.createElement(tagName),
  remove: child => child.parentNode && child.parentNode.removeChild(child),
  insert: (child, parent, anchor = null) => parent.insertBefore(child, anchor),
  querySelector: selector => document.querySelector(selector),
  setElementText: (el, text) => el.textContent = text,
  createText: text => document.createTextNode(text),
  setText: (node, text) => node.nodeValue = text,
  getParent: node => node.parentNode,
  getNextSibling: node => node.nextElementSibling
}