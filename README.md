#Read this before you commit

The repository is set up you use gulpJS. This is done so we can  done stuff like keep styling in modules using sass, so we can uglify and minify automatically and to reload the browser when we change files.

if you have nodeJS installed run 
```
  npm install
```
to install dependencies.

then run
```
  gulp
```

to copy all necessary file to the dist folder and run a server on http://localhost:8080. Now every time you make changes to a html, css or js file in the src subfolders the browser will reload.

to install icons install Bower
```
  npm install bower -g

```
then run

```
  bower install
```
in the repo directory
