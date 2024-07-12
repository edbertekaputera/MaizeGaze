var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import React, { useState } from 'react';
import { createUseStyles } from 'react-jss';
var useStyles = createUseStyles({
    labelBox: {
        left: function (props) { return props.left + "px"; },
        top: function (props) { return props.top + "px"; },
        position: 'absolute',
    },
    labelInput: {},
});
var LabelBox = React.forwardRef(function (_a, forwardedRef) {
    var inputMethod = _a.inputMethod, props = __rest(_a, ["inputMethod"]);
    var classes = useStyles(props);
    var _b = useState(''), value = _b[0], setValue = _b[1];
    var changeHandler = function (e) {
        setValue(e.target.value);
        if (inputMethod === 'select') {
            props.onSubmit(e.target.value);
        }
    };
    var keyPressHandler = function (e) {
        if (e.which === 13) {
            props.onSubmit(value);
        }
        return e.which !== 13;
    };
    var _c = props.labels, labels = _c === void 0 ? ['object'] : _c;
    if (typeof labels === 'string') {
        labels = [labels];
    }
    var labelInput;
    switch (inputMethod) {
        case 'select':
            labelInput = (React.createElement("select", { className: classes.labelInput, name: "label", ref: forwardedRef, onChange: changeHandler, onMouseDown: function (e) { return e.stopPropagation(); } },
                React.createElement("option", null, "choose an item"),
                labels.map(function (label) { return (React.createElement("option", { key: label, value: label }, label)); })));
            break;
        case 'text':
            labelInput = (React.createElement("input", { className: classes.labelInput, name: "label", type: "text", value: value, ref: forwardedRef, onKeyPress: keyPressHandler, onChange: changeHandler, onMouseDown: function (e) { return e.stopPropagation(); } }));
            break;
        default:
            throw "Invalid labelInput parameter: " + inputMethod;
    }
    return React.createElement("div", { className: classes.labelBox }, labelInput);
});
LabelBox.displayName = 'LabelBox';
export default LabelBox;