import { createSignal, onCleanup, onMount } from "solid-js";
import "./App.css";
import * as BABYLON from "@babylonjs/core";

function App() {
  let canvasRef: HTMLCanvasElement | undefined;
  let inputRef: HTMLInputElement | undefined;

  let engine: BABYLON.Engine | undefined;

  const click = async () => {
    const text = await fetch(
      "http://127.0.0.1:5000/runs/segment/predict7/labels/test3.txt"
    ).then((res) => res.text());
    const strArr = text.split("\r\n");

    for (const str of strArr) {
      const arr = str.split(" ");
      const t = arr.shift();
      // if (t !== "9") continue;
      const pts: BABYLON.Vector3[] = [];
      for (let i = 0; i < arr.length; i += 2) {
        const sx = arr[i];
        const sy = arr[i + 1];
        const x = parseFloat(sx) * 100;
        const y = parseFloat(sy) * 100;
        const pt = new BABYLON.Vector3(x, 0, y);

        pts.push(pt);
      }

      pts.push(pts[0].clone());

      const line = BABYLON.MeshBuilder.CreateLines("line", { points: pts });

      let extruded = BABYLON.MeshBuilder.ExtrudePolygon("ext", {
        shape: pts, //vec3 array with z = 0,
        depth: 20,
        updatable: true,
        sideOrientation: BABYLON.Mesh.DOUBLESIDE,
      });
      extruded.position.y = 20;
    }
  };

  const handleChange = (evt) => {
    const input = inputRef;
    if (!input?.files?.[0]) {
      return;
    }

    const formData = new FormData();
    formData.append("file", input.files[0]);

    fetch("http://127.0.0.1:5000/render", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("data: ", data);
        //
      })
      .catch((error) => {
        console.error("Error:", error);
        //
      });
  };

  onMount(() => {
    console.log(canvasRef);
    if (canvasRef) {
      canvasRef.width = window.innerWidth;
      canvasRef.height = window.innerHeight;
      engine = new BABYLON.Engine(canvasRef);
      // Creates a basic Babylon Scene object
      const scene = new BABYLON.Scene(engine);
      // Creates and positions a free camera
      const camera = new BABYLON.ArcRotateCamera(
        "camera1",
        0,
        0,
        100,
        new BABYLON.Vector3(0),
        scene
      );
      // Targets the camera to scene origin
      camera.setTarget(BABYLON.Vector3.Zero());
      // Attaches the camera to the canvas
      camera.attachControl(canvasRef, true);
      // Creates a light, aiming 0,1,0
      const light = new BABYLON.HemisphericLight(
        "light",
        new BABYLON.Vector3(0, 1, 0),
        scene
      );
      // Dim the light a small amount 0 - 1
      light.intensity = 0.7;

      engine.runRenderLoop(() => {
        scene.render();
      });
    }
  });

  onCleanup(() => {
    if (engine) {
      engine.dispose();
    }
  });

  return (
    <div>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      <div
        style={{
          position: "fixed",
          right: "40px",
          top: 0,
        }}
      >
        <button onClick={click}>调试</button>
        <input type="file" ref={inputRef} onChange={handleChange} />
      </div>
    </div>
  );
}

export default App;
