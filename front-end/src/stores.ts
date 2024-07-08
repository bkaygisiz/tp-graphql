import { writable, type Writable } from "svelte/store";

export const user  = writable('')
export const userName = writable('')
export const posts: Writable<any> = writable([])