<script>
  import { redirect } from "@sveltejs/kit";
  import { goto } from "$app/navigation";
  import { user, userName } from "../stores"

  let email = "";

  async function connect() {
    let quer = `query($email: String) {
      userByEmail(email: $email) {
        name
        email
      }
    }`;
    if (email != "") {
      const res = await fetch("http://localhost:4000", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: quer,
          variables: {
            email: email,
          },
        }),
      });
      let result = "";
      // @ts-ignore
      for await (const chunk of res.body) {
        const decoded = new TextDecoder().decode(chunk);
        result += decoded;
      }
      const response = JSON.parse(result);
      if (response.data.userByEmail) {
        user.update((name) => name = response.data.userByEmail.email)
        userName.update((name) => name = response.data.userByEmail.name)
        goto("/forum")
      }
      else
        alert('Wrong email')
    }
  }
</script>

<div class="flex flex-col items-center justify-center">
  <div class="flex w-2/4 mt-5 flex-col items-center">
    <label for="email">Email</label>
    <input
      class="bg-gray-700 rounded-lg"
      id="email"
      type="text"
      bind:value={email}
    />
  </div>
  <div class="mt-5 mb-5">
    <button
      class="bg-gray-800 rounded-lg w-28 h-8 hover:bg-gray-700 duration-300"
      on:click={connect}>Connect</button
    >
  </div>
</div>
