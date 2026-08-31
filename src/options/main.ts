import { mount } from "svelte";
import App from "./App.svelte";
import "./options.css";

mount(App, { target: document.getElementById("app")! });
