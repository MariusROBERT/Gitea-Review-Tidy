import { mount } from "svelte";
import App from "./App.svelte";
import "./options.css";

function start() {
  const target = document.getElementById("app");
  if (target) mount(App, { target });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
  start();
}
