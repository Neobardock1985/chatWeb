import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChatList from './pages/chatList';


function App() {
  return (
    <BrowserRouter>
      <div style={{ display: "flex", flexDirection: "row" }}>
        {/*     <h1>App</h1> */}
        <Routes>
          <Route path="/chatList" element={<ChatList />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}


export default App;
