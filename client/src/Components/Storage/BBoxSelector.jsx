import React from 'react';
import { createUseStyles } from 'react-jss';

var useStyles = createUseStyles({
    bboxSelector: {
        border: function (props) { return (props.borderWidth || 2) + "px dotted rgb(127,255,127)"; },
        borderWidth: function (props) { return (props.borderWidth || 2) + "px"; },
        position: 'absolute',
    },
});

var BBoxSelector = function (_a) {
    var rectangle = _a.rectangle, _b = _a.borderWidth, borderWidth = _b === void 0 ? 2 : _b;
    var classes = useStyles({ borderWidth: borderWidth });
    return (React.createElement("div", { className: classes.bboxSelector, style: {
            left: rectangle.left - borderWidth + "px",
            top: rectangle.top - borderWidth + "px",
            width: rectangle.width + "px",
            height: rectangle.height + "px",
        } }));
};

export default BBoxSelector;