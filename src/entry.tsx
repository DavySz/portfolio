import { PageTemplate } from "./components/page-template";
import { Home } from "./pages/home";
import { useLog } from "./hooks";
import {
  WELCOME_LOG_MESSAGE,
  WELCOME_LOG_MESSAGE_STYLES,
} from "./shared/constants";

function Entry() {
  useLog({
    styles: WELCOME_LOG_MESSAGE_STYLES,
    text: WELCOME_LOG_MESSAGE,
  });

  return (
    <PageTemplate>
      <Home />
    </PageTemplate>
  );
}

export default Entry;
