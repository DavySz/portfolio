import { Contact } from "./contact";
import { Hero } from "./hero";
import { Self } from "./self";
import { Services } from "./services";
import { Skills } from "./skills";
import { Statistics } from "./statistics";

export const Home: React.FC = () => {
  return (
    <>
      <Hero />
      <Statistics />
      <Self />
      <Services />
      <Skills />
      <Contact />
    </>
  );
};
