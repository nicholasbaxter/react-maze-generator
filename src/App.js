import React, { useState, useRef, useCallback } from "react";
import "./App.css";
import { produce } from "immer";

//needs to be odd if algo moving in multiples of two
const numRows = 51;
const numCols = 51;
const cellWidth = 12;

let coords = [0, 0];
let wallCoords = [0, 0];
// let count = numRows * numCols - 1;

const operations = [
  [0, 2],
  [0, -2],
  [2, 0],
  [-2, 0]
];

function App() {
  const [mousePressed, setMousePressed] = useState(false);
  const [speed, setSpeed] = useState(1);
  let stack = [];
  let wallStack = [];

  const generateEmptyGrid = () => {
    const rows = [];
    for (let i = 0; i < numRows; i++) {
      rows.push(Array.from(Array(numCols), () => 0));
    }
    return rows;
  };

  const [grid, setGrid] = useState(() => {
    return generateEmptyGrid();
  });
  const [running, setRunning] = useState(false);
  //This way you can use the current value in a callback
  const runningRef = useRef();

  runningRef.current = running;

  const runSimulation = useCallback(() => {
    if (!runningRef.current) {
      return;
    }

    const convertCoords = coord => {
      if (coord === 2) {
        return 1;
      }
      if (coord === -2) {
        return -1;
      }
      if (coord === 0) {
        return 0;
      }
    };

    setGrid(g => {
      return produce(g, gridCopy => {
        let neighbours = [];
        let wallNeighbours = [];
        stack.push([...coords]);
        wallStack.push([...wallCoords]);
        gridCopy[coords[0]][coords[1]] = 1;
        // Checking for neighbours
        operations.forEach(([x, y]) => {
          const newI = coords[0] + x;
          const newJ = coords[1] + y;
          const wallI = coords[0] + convertCoords(x);
          const wallJ = coords[1] + convertCoords(y);
          // If new coordinates are within parameters
          if (newI >= 0 && newI < numRows && newJ >= 0 && newJ < numCols) {
            // If an empty cell, push to neighbours array
            if (g[newI][newJ] === 0) {
              neighbours.push([newI, newJ]);
              wallNeighbours.push([wallI, wallJ]);
            }
          }
        });
        if (neighbours.length === 1) {
          [...coords] = [neighbours[0][0], neighbours[0][1]];
          [...wallCoords] = [wallNeighbours[0][0], wallNeighbours[0][1]];
          gridCopy[neighbours[0][0]][neighbours[0][1]] = 1;
          gridCopy[wallNeighbours[0][0]][wallNeighbours[0][1]] = 1;
          // count--;
        } else if (neighbours.length > 0) {
          const random = Math.round(Math.random(0, neighbours.length));
          gridCopy[neighbours[random][0]][neighbours[random][1]] = 1;
          gridCopy[wallNeighbours[random][0]][wallNeighbours[random][1]] = 1;
          // count--;
          [...coords] = [neighbours[random][0], neighbours[random][1]];
          [...wallCoords] = [
            wallNeighbours[random][0],
            wallNeighbours[random][1]
          ];
        } else if (neighbours.length === 0 && stack.length > 1) {
          stack.pop();
          wallStack.pop();
          let temp = stack.pop();
          let wallTemp = wallStack.pop();
          [...coords] = [temp[0], temp[1]];
          [...wallCoords] = [wallTemp[0], wallTemp[1]];
        } else if (stack.length === 1) {
          setRunning(false);
        }
      });
    });

    setTimeout(runSimulation, speed);
  }, [speed, coords, stack, running]);

  return (
    <>
      <div
        style={{
          height: "100vh",
          background: "rgb(255,178,74)",
          background:
            "linear-gradient(90deg, rgba(255,178,74,1) 0%, rgba(255,90,103,1) 100%)"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            backgroundColor: "transparent",
            padding: "5px",
            marginBottom: "2rem"
          }}
        >
          <h1
            style={{
              fontFamily: '"Press Start 2P", cursive',
              color: "white",
              justifySelf: "center"
            }}
          >
            Maze Generator
          </h1>
          <div>
            <button
              onClick={() => {
                setRunning(!running);
                if (!running) {
                  runningRef.current = true;
                  runSimulation();
                }
              }}
            >
              {running ? "Stop" : "Start"}
            </button>
            <button
              onClick={() => {
                setGrid(generateEmptyGrid());
              }}
            >
              Clear
            </button>
          </div>
        </div>
        <div
          style={{
            alignContent: "center",
            alignItems: "center",
            alignSelf: "center"
          }}
        >
          <div
            style={{
              justifyContent: "center",

              display: "grid",
              gridTemplateColumns: `repeat(${numCols}, ${cellWidth}px)`,
              width: "100%",
              gridGap: "0px"
            }}
            onMouseDown={() => setMousePressed(true)}
            onMouseUp={() => setMousePressed(false)}
          >
            {grid.map((row, i) =>
              row.map((col, j) => (
                <div
                  key={`${i}-${j}`}
                  onMouseDown={() => {
                    const newGrid = produce(grid, gridCopy => {
                      gridCopy[i][j] = grid[i][j] ? 0 : 1;
                    });
                    setGrid(newGrid);
                  }}
                  onMouseOver={() => {
                    if (mousePressed) {
                      const newGrid = produce(grid, gridCopy => {
                        gridCopy[i][j] = grid[i][j] ? 0 : 1;
                      });
                      setGrid(newGrid);
                    }
                  }}
                  className={grid[i][j] ? "cell-visited" : ""}
                  style={{
                    width: `${cellWidth - 0}px`,
                    height: `${cellWidth - 0}px`,
                    backgroundColor:
                      // i === currentI && j === currentJ
                      //  ? "yellow"
                      //  :
                      grid[i][j] ? "blue" : "rgba(255,178,74, 0.3)",
                    gridGap: "0px"
                  }}
                ></div>
              ))
            )}
          </div>
        </div>
      </div>
      <div
        style={{
          position: "fixed",
          right: "0px",
          bottom: "0px",
          textAlign: "center",
          backgroundColor: "rgba(255,255,255,0.0)",
          padding: "0.5rem 0.3rem 0.2rem 0.8rem",
          borderTopLeftRadius: "16px",
          color: "white"
        }}
      >
        <a
          style={{ textDecoration: "none", color: "white" }}
          href="https://lab.eyecandycode.com"
        >
          Back to EyeCandyCode...
        </a>
      </div>
    </>
  );
}

export default App;
