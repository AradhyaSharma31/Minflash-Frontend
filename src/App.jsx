import "./App.css";
import Navbar from "./Components/Navigation/Navbar";
import { Routers } from "./Components/Routers/Routers";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { DeckProvider } from "./Context/DeckProvider";
import { Footer } from "./Components/Footer/Footer";

function App() {
  return (
    <>
      <Toaster />
      <BrowserRouter>
        <DeckProvider>
          <Navbar />
          <div className="flex flex-col min-h-screen">
            <main className="flex-grow">
              <Routers />
            </main>
            <Footer />
          </div>
        </DeckProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
