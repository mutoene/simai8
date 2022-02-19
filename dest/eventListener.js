"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var eventListener = {
    onRenderInspector: function (chart, guiUtil) {
        guiUtil.update();
        guiUtil.addButton("ConsoleLog", function () {
            console.log(JSON.parse(chart.toJSON()));
        });
    }
};
exports.default = eventListener;
