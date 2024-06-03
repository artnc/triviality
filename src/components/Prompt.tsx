import * as styles from "./Prompt.module.scss";

export const Prompt = ({ children }: { children: React.ReactNode }) => (
  <p className={styles.prompt}>{children}</p>
);
