# cycle-hot-reloading-example
A Cycle.js starter project with hot reloading using browserify and browserify-hmr.

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

This is made possible by [AgentME/browserify-hmr](http://www.github.com/AgentME/browserify-hmr), along with mattdesl's excellent [budo](http://www.github.com/mattdesl/budo) development server. All of the hot reloading configuration is done in `index.js`. The key part is that the old Cycle application is diposed every time the code changes.


Deployment
---

To get your project online, if you don't need a backend server, you can deploy to Github pages:

```bash
git checkout -b gh-pages

npm run bundle

git add .

git commit -m "Update bundle"

git push
```

Then visit http://**username**.github.io/**repository**. Your site should be online within 5 minutes or so.

To update your site in future, just checkout back to the branch and repeat the process:
```bash
git checkout gh-pages

npm run bundle

git add .

git commit -m "Update bundle"

git push
```

