// js/core/dom.js - Utilidades DOM
export function $(selector, parent = document) {
  return parent.querySelector(selector);
}

export function $$(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

export function createElement(tag, className = '', text = '') {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  return el;
}

export function setHtml(element, html) {
  if (typeof element === 'string') {
    element = $(element);
  }
  if (element) {
    element.innerHTML = html;
  }
}

export function on(element, event, handler, options = {}) {
  if (typeof element === 'string') {
    element = $(element);
  }
  if (element) {
    element.addEventListener(event, handler, options);
  }
}
