import "./App.css";
import Navbar from "./Components/Navigation/Navbar";
import { Routers } from "./Components/Routers/Routers";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { DeckProvider } from "./Context/DeckProvider";

function App() {
  return (
    <>
      <Toaster />
      <BrowserRouter>
        <DeckProvider>
          <Navbar />
          <Routers />
        </DeckProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
