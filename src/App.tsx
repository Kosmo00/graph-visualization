// import { useState } from "react";
import GraphSection from "./components/GraphSection";

function App() {
  // const [item, setItem] = useState("");
  

  return (
    <section className="h-screen w-screen gap-5 mr-5 bg-main-secondary">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2.5">
          <div className="flex justify-between items-center">
            <h4 className="text-2xl">Time Line</h4> 
          </div>
          <GraphSection  />
        </div>
      </div>
    </section>
  );
}

export default App;
