import { writable } from "svelte/store";

export const user  = writable('')
export const userName = writable('')
export const posts = writable([])