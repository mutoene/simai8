import { Graphics } from "pixi.js";
import { LinePointInfo } from "src/objects/Lane";
import { Note } from "src/objects/Note";
import CustomRendererUtility from "../../../../src/utils/CustomRendererUtility";

export default function customRender(
  graphics: Graphics,
  note: Note,
  area: LinePointInfo
) {
  const height = 6;
  var lineColor = note.customProps.EX === "ex" || note.customProps.hanabi === 'hanabi' ? 0xff0000 : 0xffffff;
  var lineWidth = note.customProps.EX === "ex" || note.customProps.hanabi === 'hanabi' ? 2 : 1;
  const pixi = CustomRendererUtility.Pixi;
  if (!pixi){
    return;
  }
  graphics
    .lineStyle(lineWidth, lineColor)
    .beginFill(note.color, 1)
    .drawRect(area.point.x, area.point.y - height / 2, area.width, height)
    .endFill();
    pixi.drawText(
      note.type,
      area.point.x + area.width / 2,
      area.point.y
    );
}
