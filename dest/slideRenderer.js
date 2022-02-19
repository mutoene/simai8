"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Vector2 = CustomRendererUtility.Vector2, drawQuad = CustomRendererUtility.drawQuad;
function customRender(graphics, lines, head, tail) {
    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
        var line = lines_1[_i];
        drawQuad(graphics, line.start.point, Vector2.add(line.start.point, new Vector2(line.start.width, 0)), Vector2.add(line.end.point, new Vector2(line.end.width, 0)), line.end.point, 0x0099ff);
        graphics
            .lineStyle(1, 0x0099ff, 1)
            .moveTo(line.start.point.x, line.start.point.y)
            .lineTo(line.end.point.x, line.end.point.y);
        graphics
            .lineStyle(1, 0x0099ff, 1)
            .moveTo(line.start.point.x + line.start.width, line.start.point.y)
            .lineTo(line.end.point.x + line.end.width, line.end.point.y);
    }
}
exports.default = customRender;
