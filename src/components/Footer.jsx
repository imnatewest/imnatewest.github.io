import { containerClass } from "../constants/layout";

function Footer({ heroName }) {
  return (
    <footer className="border-t border-slate-200/60 bg-white/80 dark:border-slate-700/60 dark:bg-nightSurface/80">
      <div
        className={`${containerClass} py-8 text-center text-sm text-mist dark:text-nightMuted`}
      >
        © {new Date().getFullYear()} {heroName}.
      </div>
    </footer>
  );
}

export default Footer;
