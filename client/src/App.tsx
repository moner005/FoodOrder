import { BrowserRouter } from "react-router-dom";
import Cart from "./pages/Cart/Cart";
import Profile from "./pages/Profile/Profile";
import Restaurants from "./pages/Restaurants/Restaurants";
import CustomerHome from "./pages/Home";
function App() {
  return (
    <BrowserRouter>

     <CustomerHome />
        {/* <Restaurants/> */}
      {/* <Profile /> */}
    {/* <Cart /> */}
   
    </BrowserRouter>
  );
}

export default App;