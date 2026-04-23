import { Routes, Route } from "react-router-dom";
import MockGame from './components/MockGame'; 
import Store from './components/Store'; 
import "./index.css";

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Home Page Route */}
        <Route path="/" element={<MockGame />} />
        
        {/* Full Page Store Route */}
        <Route path="/store" element={<Store />} />
      </Routes>
    </div>
  );
}

export default App;