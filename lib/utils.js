"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.flatMap = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.normRef = normRef;
exports.selectRef = selectRef;
exports.isObject = isObject;
exports.isDevelopment = isDevelopment;
exports.toArray = toArray;
exports.toError = toError;
exports.isRefArray = isRefArray;
exports.extractRefSchema = extractRefSchema;

var _selectn = require("selectn");

var _selectn2 = _interopRequireDefault(_selectn);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function normRef(ref) {
  return ref.replace(/\$/g, ".");
}

function selectRef(field, formData) {
  var ref = normRef(field);
  return (0, _selectn2.default)(ref, formData);
}

function isObject(obj) {
  return (typeof obj === "undefined" ? "undefined" : _typeof(obj)) === "object" && obj !== null;
}

function isDevelopment() {
  return process.env.NODE_ENV !== "production";
}

function toArray(event) {
  if (Array.isArray(event)) {
    return event;
  } else {
    return [event];
  }
}

function toError(message) {
  if (isDevelopment()) {
    throw new ReferenceError(message);
  } else {
    console.error(message);
  }
}

function isRefArray(field, schema) {
  return schema.properties[field] && schema.properties[field].type === "array" && schema.properties[field].items && schema.properties[field].items["$ref"];
}

function fetchSchema(ref, schema) {
  if (ref.startsWith("#/")) {
    return ref.substr(2).split("/").reduce(function (schema, field) {
      return schema[field];
    }, schema);
  } else {
    toError("Only local references supported at this point use json-schema-deref");
    return undefined;
  }
}

function extractRefSchema(field, schema) {
  var properties = schema.properties;

  if (!properties || !properties[field]) {
    toError(field + " not defined in properties");
    return undefined;
  } else if (properties[field].type === "array") {
    if (isRefArray(field, schema)) {
      return fetchSchema(properties[field].items["$ref"], schema);
    } else {
      return properties[field].items;
    }
  } else if (properties[field] && properties[field]["$ref"]) {
    return fetchSchema(properties[field]["$ref"], schema);
  } else if (properties[field] && properties[field].type === "object") {
    return properties[field];
  } else {
    toError(field + " has no $ref field ref schema extraction is impossible");
    return undefined;
  }
}

var concat = function concat(x, y) {
  return x.concat(y);
};
var flatMap = exports.flatMap = function flatMap(xs, f) {
  return xs.map(f).reduce(concat, []);
};