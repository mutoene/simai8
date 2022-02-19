import Chart from "src/stores/Chart";
import IMusicGameSystemEventListener from "src/stores/musicGameSystem/eventListener";
import { GuiUtility } from "src/utils/GuiUtility";

const eventListener: IMusicGameSystemEventListener = {
  onRenderInspector(chart: Chart, guiUtil: GuiUtility) {
    guiUtil.update();

    guiUtil.addButton("ConsoleLog", () => {
      console.log(JSON.parse(chart.toJSON()));
    });
  }
};

export default eventListener;
