import { BrowserRouter } from "react-router-dom";
import Cart from "./pages/Cart/Cart";
import Profile from "./pages/Profile/Profile";
import Restaurants from "./pages/Restaurants/Restaurants";
import CustomerHome from "./pages/Home";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
function App() {
  return (
    <BrowserRouter>
<Header />
     <CustomerHome />
        {/* <Restaurants/> */}
      {/* <Profile /> */}
    {/* <Cart /> */}
   <Footer />
    </BrowserRouter>
  );
}

export default App;