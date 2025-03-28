import { Contact } from "./contact";
import { Footer } from "./footer";
import { Hero } from "./hero";
import { Projects } from "./projects";
import { Self } from "./self";
import { Services } from "./services";
import { Skills } from "./skills";

export const Home: React.FC = () => {
  return (
    <>
      <Hero />
      <Self />
      <Services />
      <Skills />
      <Contact />
      <Projects />
      <Footer />
    </>
  );
};
