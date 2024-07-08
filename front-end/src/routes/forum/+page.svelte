<script lang="ts">
  import { Card } from "flowbite-svelte";
  import { user, posts, userName } from "../../stores";
  import { onMount } from "svelte";
  let title = "";
  let content = "";
  let username = "";
  /**
   * @type {any[]}
   */
  let postList: any[] = [];

  onMount(() => {
    getPosts();
    posts.subscribe((list) => {
      postList = list;
    });
    user.subscribe((name) => {
      username = name;
    });
  });

  async function getPosts() {
    const res = await fetch("http://localhost:4000", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `query Query {
                feed {
                    id
                    title
                    content
                    author {
                        name
                    }
                }
            }`,
      }),
    });
    let result = "";
    // @ts-ignore
    for await (const chunk of res.body) {
      const decoded = new TextDecoder().decode(chunk);
      result += decoded;
    }
    const response = JSON.parse(result);
    // @ts-ignore
    posts.update((posts) => (posts = [...response.data.feed]));
  }
  async function send() {
    console.log($userName, $user);
    const postCreateInput = {
      title,
      content,
      author: {
        name: $userName,
        email: $user,
      },
    };
    const quer = `mutation Mutation($postCreateInput: PostCreateInput!) {
            createPost(postCreateInput: $postCreateInput) {
                id
                title
                content
                author {
                    name
                    email
                }
            }
        }`;
    if (title != "" && content != "" && $userName != "" && $user != "") {
      const post = await fetch("http://localhost:4000", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: quer,
          variables: {
            postCreateInput: postCreateInput,
          },
        }),
      });
      let result = "";
      // @ts-ignore
      for await (const chunk of post.body) {
        const decoded = new TextDecoder().decode(chunk);
        result += decoded;
      }
      const response = JSON.parse(result);
      console.log(response);
      getPosts();
      // @ts-ignore
    } else alert("Please fill title and content, or relogin");
  }

  async function deletePost(id: number) {
    const quer = `mutation Mutation($id: Int!) {
            deletePost(id: $id) {
                id
            }
        }`;
    const post = await fetch("http://localhost:4000", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: quer,
        variables: {
          id: id,
        },
      }),
    });
    let result = "";
    // @ts-ignore
    for await (const chunk of post.body) {
      const decoded = new TextDecoder().decode(chunk);
      result += decoded;
    }
    const response = JSON.parse(result);
    console.log(id)
    console.log(response);
    getPosts();
  }
</script>

<div class=" h-screen w-screen flex flex-col justify-center items-start">
  <div
    class="w-full basis-3/5 border-solid border border-gray-600 overflow-scroll"
  >
    {#each postList as post (post.id)}
      <Card class="bg-gray-900 mt-5 ml-5 mb-5 w-2/5">
        <h1 class="font-bold text-gray-200">{post.author?.name}</h1>
        <h1 class="font-bold text-gray-200">{post.title}</h1>
        <p class="text-gray-400">{post.content}</p>
        {#if post.author?.name == $userName}
          <button
            class="text-gray-400 font-bold hover:bg-gray-600 duration-300"
            on:click={() => deletePost(post.id)}
          >
            Delete
          </button>
        {/if}
      </Card>
    {/each}
  </div>
  <div
    class="w-full flex flex-col basis-2/5 border-solid border border-gray-600"
  >
    <label class="mt-5 bg-gray-900 text-gray-400 font-bold" for="title"
      >Title</label
    >
    <input
      id="title"
      class="mt-5 bg-gray-900 text-gray-400"
      type="text"
      bind:value={title}
    />
    <label class="mt-5 bg-gray-900 text-gray-400 font-bold" for="content"
      >Message</label
    >
    <textarea
      name="content"
      id="content"
      class="mt-5 h-full bg-gray-900 text-gray-400"
      bind:value={content}
    />
    <button
      class="text-gray-400 font-bold hover:bg-gray-600 duration-300"
      on:click={send}>Send</button
    >
  </div>
</div>
