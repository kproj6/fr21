#Read this before you commit

**All changes must be made in the ```src``` folder**

The repository is set up you use gulpJS. This is done so we can  done stuff like keep styling in modules using sass, so we can uglify and minify automatically and to reload the browser when we change files.

This requires that you have [NodeJS](www.nodejs.org) installed.

In the repository folder:

to install dependencies run.
```
  npm install
```

then, to copy all necessary file to the dist folder and run a server on http://localhost:8080. Now every time you make changes to a html, css or js file in the src subfolders the browser will reload run. 
```
  gulp
```



to install icons install Bower
```
  npm install bower -g

```
then run

```
  bower install
```

##other gulp stuff
```gulp build```
will copy files from the src folder and bomwer_components folder to the dist folder.

When running the local server on localhost:8080 it's root dir is dist/

see ```gulpfile.js``` for all commands and setup.
