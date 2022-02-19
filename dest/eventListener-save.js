"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createAutoNote(chart, extensionUtility, horizontalSize, horizontalPosition, measureIndex, measurePosition, targetNoteLineGuid, autoNoteLayerGuid) {
    var NoteRecord = extensionUtility.NoteRecord, guid = extensionUtility.guid, Fraction = extensionUtility.Fraction;
    // 同じロングの同じ位置に配置されているノートを探す
    var oNote = chart.timeline.notes.find(function (note) {
        return note.type == "auto" &&
            note.customProps.targetNoteLine == targetNoteLineGuid &&
            note.measureIndex == measureIndex &&
            Fraction.equal(note.measurePosition, measurePosition);
    });
    // 既に配置されているノートにマージする
    if (oNote) {
        oNote.horizontalPosition.numerator = Math.min(oNote.horizontalPosition.numerator, horizontalPosition.numerator);
        oNote.horizontalSize =
            Math.max(oNote.horizontalPosition.numerator + oNote.horizontalSize, horizontalPosition.numerator + horizontalSize) - oNote.horizontalPosition.numerator;
        return;
    }
    chart.timeline.addNote(NoteRecord.new({
        guid: guid(),
        horizontalSize: horizontalSize,
        horizontalPosition: horizontalPosition,
        measureIndex: measureIndex,
        measurePosition: measurePosition,
        type: "auto",
        lane: chart.timeline.lanes.find(function (lane) { return lane.templateName === "24-divisions"; }).guid,
        layer: autoNoteLayerGuid,
        speed: 1,
        editorProps: {
            time: 0,
        },
        customProps: {
            targetNoteLine: targetNoteLineGuid,
        },
    }, chart), false);
}
function updateAutoNote(chart) {
    return;
    /*
    const { lerp, inverseLerp, Fraction, getEditor } = (window as any)
      .extensionUtility as ExtensionUtility;
  
    const autoNoteLayerName = "@autoNotes";
  
    // 既存の autoNote を削除する
    for (const note of chart.timeline.notes.filter(
      (note) => note.type === "auto"
    )) {
      chart.timeline.removeNote(note, false);
    }
    chart.timeline.updateNoteMap();
  
    let autoNoteLayer = chart.layers.find(
      (layer) => layer.name === autoNoteLayerName
    );
  
    // @autoNotes レイヤーが存在しないなら追加する
    if (!autoNoteLayer) {
      const { currentLayerIndex } = chart;
  
      chart.addLayer({
        name: autoNoteLayerName,
        visible: false,
        lock: true,
        layerIndex: 0,
      });
  
      // 現在選択しているレイヤーのインデックスを維持する
      chart.selectLayer(currentLayerIndex + 1);
  
      // TODO: chart.addLayer の戻り値を生成したレイヤーにする
      autoNoteLayer = chart.layers.find(
        (layer) => layer.name === autoNoteLayerName
      );
    }
  
    const autoNoteLayerGuid = autoNoteLayer!.guid;
  
    // 終端ノート
    const endNotes = chart.timeline.notes.filter(
      (note) => note.customProps.type === "end" && note.type !== "hide-lane"
    );
  
    interface A {
      note: Note;
      line: GUID;
    }
  
    const noteLineGroup: A[][] = [];
  
    function itrHead(note: Note, arr: A[]) {
      // 自分を終端にしているノートライン
      const noteLines = chart.timeline.noteLines.filter(
        (noteLine) => noteLine.tail === note.guid
      );
  
      if (!noteLines.length) {
        noteLineGroup.push(arr);
      }
  
      for (const noteLine of noteLines) {
        const head = chart.timeline.noteMap.get(noteLine.head);
  
        itrHead(head!, [...arr, { note: head, line: noteLine.guid } as A]);
      }
    }
  
    for (const note of endNotes) {
      itrHead(note, [{ note, line: "" }]);
    }
  
    for (const _notes of noteLineGroup) {
      const notes = _notes.map((n) => n.note);
  
      // 直角チェック
      var previousMeasureIndex = -1;
      var previousMeasurePosition = new Fraction(0, 0);
      for (const n of notes) {
        // 直角判定
        if (
          previousMeasureIndex === n.measureIndex &&
          Fraction.equal(previousMeasurePosition, n.measurePosition)
        ) {
          getEditor().notify(
            `直角ロングを検出しました\n位置: ${n.getMeasurePosition()}`,
            "warning"
          );
          console.error("直角ロングを検出しました", n);
        }
  
        previousMeasureIndex = n.measureIndex;
        previousMeasurePosition = n.measurePosition;
      }
  
      const normalNotes = _notes.filter(
        (note) =>
          note.note.type !== "auto" && note.note.type !== "slide-invisible"
      );
  
      // 対象のノートラインリスト
      const noteLines = _notes
        .map((n) =>
          chart.timeline.noteLines.find((noteLine) => noteLine.guid === n.line)
        )
        .filter((l) => l) as NoteLine[];
  
      const beginNote = _.last(notes) as Note;
      const endNote = notes[0];
  
      const beginMeasureIndex = beginNote.measureIndex;
      const endMeasureIndex = endNote.measureIndex;
  
      const beginPos = beginNote.getMeasurePosition();
      const endPos = endNote.getMeasurePosition();
  
      // 自動ノートを何分で配置するか
      const autoNoteMeasureDivision = 16;
  
      function getAutoNoteMeasureDivision(currentBpm: number): 4 | 8 | 16 {
        if (currentBpm >= 240) {
          return 4;
        } else if (currentBpm >= 120) {
          return 8;
        } else {
          return 16;
        }
      }
  
      let prevPosition = -999;
      // ロンググループの範囲内の小節を全て回す
      for (
        let measureIndex = beginMeasureIndex;
        measureIndex <= endMeasureIndex;
        measureIndex++
      ) {
        // 判定用の自動ノートを生成する
        for (let i = 0; i < autoNoteMeasureDivision; i++) {
          const currentPosition =
            measureIndex + (1 / autoNoteMeasureDivision) * i;
  
          const currentBpm = chart.timeline.timeCalculator.getBpm(
            currentPosition
          );
  
          const division = getAutoNoteMeasureDivision(currentBpm);
  
          if (division === 8 && i % 2 !== 0) {
            continue;
          }
  
          if (division === 4 && i % 4 !== 0) {
            continue;
          }
  
          const currentNoteLine = noteLines.find(
            (noteLine) =>
              chart.timeline.noteMap.get(noteLine.head)!.getMeasurePosition() <=
              currentPosition
          );
  
          // ロングの範囲外
          if (currentPosition <= beginPos || currentPosition >= endPos) continue;
  
          const prevNotes = notes.filter(
            (note: Note) =>
              note.getMeasurePosition() > prevPosition &&
              note.getMeasurePosition() <= currentPosition
          );
  
          const fI = notes.findIndex(
            (note: Note) => note.getMeasurePosition() < currentPosition
          );
  
          const b = notes[fI - 1];
          const e = notes[fI];
  
          const bSizeScale = b.horizontalPosition.denominator === 6 ? 4 : 1;
          const eSizeScale = e.horizontalPosition.denominator === 6 ? 4 : 1;
  
          const pp = inverseLerp(
            b.getMeasurePosition(),
            e.getMeasurePosition(),
            currentPosition
          );
  
          const pos = lerp(
            b.horizontalPosition.numerator * bSizeScale,
            e.horizontalPosition.numerator * eSizeScale,
            pp
          );
  
          const right = lerp(
            (b.horizontalPosition.numerator + b.horizontalSize) * bSizeScale,
            (e.horizontalPosition.numerator + e.horizontalSize) * eSizeScale,
            pp
          );
  
          if (!prevNotes.length) {
            const l = Math.floor(pos);
            const r = Math.ceil(right);
  
            createAutoNote(
              chart,
              (window as any).extensionUtility as ExtensionUtility,
              r - l,
              new Fraction(l, 24),
              measureIndex,
              new Fraction(i, autoNoteMeasureDivision),
              currentNoteLine!.guid,
              autoNoteLayerGuid
            );
  
            prevPosition = currentPosition;
  
            continue;
          }
          const minPos = Math.min(
            ...prevNotes.map((note: Note) => {
              const bSizeScale =
                note.horizontalPosition.denominator === 6 ? 4 : 1;
              return note.horizontalPosition.numerator * bSizeScale;
            }),
            pos
          );
  
          const maxPos = Math.max(
            ...prevNotes.map((note: Note) => {
              const bSizeScale =
                note.horizontalPosition.denominator === 6 ? 4 : 1;
              const pos = note.horizontalPosition.numerator * bSizeScale;
              const size = note.horizontalSize * bSizeScale;
              return pos + size;
            }),
            right
          );
  
          const l = Math.floor(minPos);
          const r = Math.ceil(maxPos);
  
          // 通常ノートに重ならないようにする
          if (
            !normalNotes.find(
              (a) =>
                a.line === currentNoteLine!.guid &&
                measureIndex === a.note.measureIndex &&
                Fraction.equal(
                  a.note.measurePosition,
                  new Fraction(i, autoNoteMeasureDivision)
                )
            )
          ) {
            createAutoNote(
              chart,
              (window as any).extensionUtility as ExtensionUtility,
              r - l,
              new Fraction(l, 24),
              measureIndex,
              new Fraction(i, autoNoteMeasureDivision),
              currentNoteLine!.guid,
              autoNoteLayerGuid
            );
          }
  
          prevPosition = currentPosition;
        }
      }
    }
  
    chart.timeline.updateNoteMap();
    */
}
var eventListener = {
    onSerialize: function (chart) {
        var getHead = CustomRendererUtility.getHead, getTail = CustomRendererUtility.getTail;
        for (var _i = 0, _a = chart.timeline.notes; _i < _a.length; _i++) {
            var note = _a[_i];
            var headhead = Array.from(getHead(note)).length;
            // 中間ノートか末尾ノート
            if (headhead) {
                var tail = Array.from(getTail(note)).length;
                note.customProps.type = tail ? "middle" : "end";
                continue;
            }
            note.customProps.type = "start";
        }
        updateAutoNote(chart);
        return "";
    },
};
exports.default = eventListener;
