import { Layer, Line, Stage, Text } from "react-konva";
import { useEffect, useRef, useState } from "react";

function getConnectorPoints(from: any, to: any): number[] {
  const textHeight = 30;
  const charWidth = 8;

  return [
    from.x + from.text.length * charWidth,
    from.y + textHeight * (from.y < to.y ? 1 : -1),
    to.x + to.text.length * charWidth,
    to.y + textHeight * (to.y < from.y ? 1 : -1),
  ];
}

const getConnectedLines = (posTexts: any[]): number[] => {
  const result: number[] = [];
  posTexts.forEach((txt: any, index: number) => {
    if (index < posTexts.length - 1) {
      const connection: number[] = getConnectorPoints(txt, posTexts[index + 1]);
      result.push(...connection);
    }
  });
  return result;
};

function App() {
  const [dragText, setDragText] = useState<string>();
  const [activeElement, setActiveElement] = useState<string>();
  const [texts, setTexts] = useState<string[]>([
    "Test1",
    "Bla2",
    "XX",
    "sadsa",
    "cxv",
    "ewfw",
  ]);
  const [posTexts, setPosTexts] = useState<any[]>([]);
  const stageRef = useRef();
  const textLayerRef = useRef();

  const setCursor = (cursorStyle: string) => {
    if (stageRef.current) {
      (stageRef.current as any).container().style.cursor = cursorStyle;
    }
  };

  const handleMouseOver = (e: any, start: boolean) => {
    setCursor(start ? "pointer" : "default");
  };

  useEffect(() => {
    if (stageRef.current) {
      const layer = stageRef.current as any;
      layer.setZIndex(1);
    }
  }, [stageRef]);

  return (
    <div className="flex">
      <div className="flex flex-col gap-2 w-1/6">
        {texts.map((text) => (
          <span
            key={text}
            draggable={true}
            onDragStart={() => {
              setDragText(text);
            }}
            onDragEnd={() => {
              setDragText(undefined);
            }}
          >
            {text}
          </span>
        ))}
      </div>
      <div
        className="w-5/6"
        onDrop={(e) => {
          e.preventDefault();
          if (stageRef && stageRef.current) {
            // @ts-ignore
            stageRef.current.setPointersPositions(e);
            setPosTexts([
              ...posTexts,
              {
                // @ts-ignore
                ...stageRef.current.getPointerPosition(),
                text: dragText,
              },
            ]);
            setTexts(texts.filter((txt) => txt !== dragText));
          }
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        <Stage
          width={window.innerWidth}
          height={window.innerHeight}
          style={{ border: "1px solid grey" }}
          // @ts-ignore
          ref={stageRef}
        >
          <Layer>
            {posTexts?.length > 1 && (
              <Line
                stroke="indianred"
                strokeWidth={activeElement === "line" ? 16 : 8}
                points={getConnectedLines(posTexts)}
                onClick={() => setActiveElement("line")}
                onMouseOver={(evt) => handleMouseOver(evt, true)}
                onMouseLeave={(evt) => handleMouseOver(evt, false)}
              />
            )}
          </Layer>
          <Layer
            // @ts-ignore
            ref={textLayerRef}
          >
            {posTexts.map((txt) => (
              <Text
                id={txt.text}
                key={txt.text}
                text={txt.text}
                x={txt.x}
                y={txt.y}
                fontSize={30}
                scale={
                  activeElement === txt.text
                    ? { x: 1.5, y: 1.5 }
                    : { x: 1, y: 1 }
                }
                draggable
                onClick={() => setActiveElement(txt.text)}
                onMouseDown={() => setCursor("grabbing")}
                onMouseUp={() => setCursor("pointer")}
                onDragEnd={(event) => {
                  setPosTexts(
                    posTexts.map((posText) => {
                      if (posText.text === txt.text) {
                        return {
                          ...posText,
                          x: event.target._lastPos.x,
                          y: event.target._lastPos.y,
                        };
                      }
                      return posText;
                    })
                  );
                }}
                onMouseOver={(evt) => handleMouseOver(evt, true)}
                onMouseLeave={(evt) => handleMouseOver(evt, false)}
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}

export default App;
