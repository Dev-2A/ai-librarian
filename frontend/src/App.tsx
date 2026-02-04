import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout";
import MyLibrary from "./pages/MyLibrary";
import Recommend from "./pages/Recommend";
import SearchBooks from "./pages/SearchBooks";
import AddBook from "./pages/AddBook";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: "0.75rem", fontSize: "0.875rem" },
        }}
      />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<MyLibrary />} />
          <Route path="/recommend" element={<Recommend />} />
          <Route path="/search" element={<SearchBooks />} />
          <Route path="/add" element={<AddBook />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
