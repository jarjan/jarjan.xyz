<template>
  <section itemscope itemtype="http://schema.org/Person">
    <logo />
    <h1 itemprop="name">Zharzhan Kulmyrza</h1>
    <p>Hi! I am <span itemprop="jobTitle">frontend developer</span>.</p>
    <p>Previously made frontend for <a href="http://petrel.ai">Petrel AI</a>, <a href="http://mycrm.kz">MyCRM</a>, <a href="http://nplus.tech">N+</a>, <a href="https://hipo.kz">HiPO</a> and <a href="https://chocomart.kz">Chocomart</a></p>
    <p>For more check <a href="https://linkedin.com/in/zharzhan">linkedin</a> or <a href="/cv.pdf">my cv</a>.</p>
    <p>Drop me email <a href="mailto:zharzhan@gmail.com" itemprop="email">zharzhan@gmail.com</a> or follow on internet:</p>
    <p>
      <a href="https://github.com/jarjan"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.414"><title>GitHub icon</title><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg></a>
      <a href="https://twitter.com/jarjanxyz"><svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.414"><title>Twitter icon</title><path d="M16 3.038c-.59.26-1.22.437-1.885.517.677-.407 1.198-1.05 1.443-1.816-.634.37-1.337.64-2.085.79-.598-.64-1.45-1.04-2.396-1.04-1.812 0-3.282 1.47-3.282 3.28 0 .26.03.51.085.75-2.728-.13-5.147-1.44-6.766-3.42C.83 2.58.67 3.14.67 3.75c0 1.14.58 2.143 1.46 2.732-.538-.017-1.045-.165-1.487-.41v.04c0 1.59 1.13 2.918 2.633 3.22-.276.074-.566.114-.865.114-.21 0-.41-.02-.61-.058.42 1.304 1.63 2.253 3.07 2.28-1.12.88-2.54 1.404-4.07 1.404-.26 0-.52-.015-.78-.045 1.46.93 3.18 1.474 5.04 1.474 6.04 0 9.34-5 9.34-9.33 0-.14 0-.28-.01-.42.64-.46 1.2-1.04 1.64-1.7z" fill-rule="nonzero"/></svg></a>
      <!-- <a href="https://t.me/zharzhan"><svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="1.414"><title>Telegram icon</title><path d="M12.793 10.69c.57-1.56 2.66-7.49 2.994-9.044.38-1.76-.414-1.93-2.22-1.34-1.805.59-6.435 2.305-7.215 2.582-.78.277-4.573 1.552-5.36 1.932-1.606.862-.825 2.177.97 2.86 5.37 2.577 3.845 1.264 6.242 6.032.493 1.218 1.656 3.293 2.77 1.724.586-.892 1.37-3.52 1.82-4.747z" fill-rule="nonzero"/></svg></a> -->
      <a href="https://medium.com/@jarjan"><svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg"><title>Medium icon</title><path d="M127.445 29.754c-.025-.02-.045-.045-.075-.06l-.043-.02-38.533-19.24c-.26-.13-.535-.22-.81-.29-.35-.09-.704-.144-1.06-.144-1.476 0-2.945.74-3.74 2.03L61 48.03l27.84 45.176 38.723-62.838c.128-.21.067-.468-.118-.614M49 40v41l36 18-36-59m42 61.79l29.945 14.993c3.896 1.95 7.055.585 7.055-3.05V41.59l-37 60.2M5.89 11.647l-1.174-.587c-.68-.34-1.327-.5-1.912-.5C1.154 10.56 0 11.833 0 13.97v81.14c0 2.172 1.59 4.743 3.537 5.715l32.568 16.33c.85.424 1.66.625 2.39.625 2.06 0 3.505-1.592 3.505-4.263V30c0-.156-.088-.3-.23-.37L5.89 11.648z" fill-rule="evenodd"/></svg></a>
    </p>
  </section>
</template>

<script>
import Logo from "./components/Logo.vue";

export default {
  components: {
    Logo
  }
};
</script>

<style>
body {
  height: calc(100vh - 4em);
  background-color: #060606;
  background-image: url(/img/dark.jpg);
  background-size: contain;
  background-position: center right;
  background-repeat: no-repeat;
  padding: 2em;
  position: relative;
}

body > section {
  position: relative;
  z-index: 1;
  margin: auto;
  max-width: 60em;
}

h1 {
  font-family: "PT Sans Caption", sans-serif;
}

h1,
p {
  color: #fff;
}

p,
small {
  font-family: "PT Serif", serif;
}

a {
  color: #4a90e2;
  display: inline-block;
  border-radius: 2px;
  padding: 0 0.1em;
  margin: 0 -0.1em;
}

a:hover {
  background: #fff;
  text-decoration: none;
}

a > svg {
  fill: #fff;
  padding: 0.2em;
  width: 1em;
  vertical-align: middle;
}

a:hover > svg {
  fill: #4a90e2;
}
</style>
