import { Graphics } from "pixi.js";
import { LineInfo } from "src/objects/Lane";
import { Note } from "src/objects/Note";
import CustomRendererUtility from "src/utils/CustomRendererUtility";

const { Vector2, drawQuad } = CustomRendererUtility;

export default function customRender(
  graphics: Graphics,
  lines: LineInfo[],
  head: Note,
  tail: Note
) {
  for (const line of lines) {
    drawQuad(
      graphics,
      line.start.point,
      Vector2.add(line.start.point, new Vector2(line.start.width, 0)),
      Vector2.add(line.end.point, new Vector2(line.end.width, 0)),
      line.end.point,

      0x0099ff
    );

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
