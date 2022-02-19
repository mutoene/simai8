"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function customRender(graphics, note, area) {
    var height = 6;
    var lineColor = note.customProps.EX === "ex" || note.customProps.hanabi === 'hanabi' ? 0xff0000 : 0xffffff;
    var lineWidth = note.customProps.EX === "ex" || note.customProps.hanabi === 'hanabi' ? 2 : 1;
    var pixi = CustomRendererUtility.Pixi;
    if (!pixi) {
        return;
    }
    graphics
        .lineStyle(lineWidth, lineColor)
        .beginFill(note.color, 1)
        .drawRect(area.point.x, area.point.y - height / 2, area.width, height)
        .endFill();
    pixi.drawText(note.type, area.point.x + area.width / 2, area.point.y);
}
exports.default = customRender;
