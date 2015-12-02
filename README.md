# cycle-hot-reloading-example
A Cycle.js starter project with hot reloading using browserify and browserify-hmr

Usage
---

To get set up:

```bash
git clone https://github.com/Widdershin/cycle-hot-reloading-example.git
cd cycle-hot-reloading-example
npm install
npm start
```

You should then be able to visit localhost:8000 and you'll see the text 'Change me!'.

You can then go into `src/app.js` and change that text, and you should see the result straight away without the page reloading.

You can also change the styles in `styles.css` and it will live reload.

This is made possible by [AgentME/browserify-hmr](/AgentME/browserify-hmr), along with mattdesl's excellent [budo](/mattdesl/budo) development server. All of the hot reloading configuration is done in `index.js`, and the key part is that the old Cycle application is diposed every time the code changes.


