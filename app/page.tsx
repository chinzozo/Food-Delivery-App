/* eslint-disable @next/next/no-img-element */
import { Container } from "./components/Container";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { Hero } from "./components/Hero";
import { Menu } from "./components/Menu";

export default function Home() {
  return (
    <div className="bg-[#18181b] overflow-x-hidden">
      <Header></Header>
      <Hero></Hero>
      <Menu></Menu>
      <Footer></Footer>
    </div>
  );
}
