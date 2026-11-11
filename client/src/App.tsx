import { BrowserRouter } from "react-router-dom";
import Cart from "./pages/Cart/Cart";
import Profile from "./pages/Profile/Profile";
import Restaurants from "./pages/Restaurants/Restaurants";
function App() {
  return (
    <BrowserRouter>
        <Restaurants/>
      <Profile />
    <Cart />
    </BrowserRouter>
  );
}

export default App;