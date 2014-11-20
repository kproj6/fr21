
#Front-end README

**Deploying the front-end**

To deploy the front-end to a web server, you need to first clone the repository to the server by running the following command:
```
$ git clone git@github.com:kproj6/front-end.git
```
The front-end has been developed using NodeJS 4 modules installed via NodeJS Package Manager (npm). This allows us to define a number of development and production dependencies in a file called package.json. The content of package.json is:

```
{
  "name": "Sintef Ocean Forecast",
  "version": "0.0.0",
  "description": "web app for accessing Sintef ocean forecast data",
  "main": "script.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "NTNU, Kundestyrt projekt 2014 Gruppe 6",
  "license": "BSD-2-Clause",
  "devDependencies": {
    "gulp": "^3.8.8",
    "gulp-connect": "~2.0.6",
    "gulp-sass": "^1.1.0"
  }
}
```

We recommend installing and using NodeJS as it will make development and deployment easier. Assuming NodeJS is installed you can use npm by simply running the following command from the repository folder todownload all dependencies to a folder called node modules.
```
npm install
```
The icon font used in the GUI is managed with the package manager Bower5. After installing the dependencies with npm you can run the following command to download the icon font.
```
$ bower install
```
**Developing in the front-end** 
Now all dependencies are installed we can use the build system Gulp.js 6 other helpful features for development. These scripts are defined in gulp-fils.js. Gulp can easily be extended with packages which are also defined in package.json. We have used gulp-connect and gulp-sass. 

**Gulp-connect** 
Gulp-connect is used to run a web server locally. This makes it easier to test the web app. It is set up to automatically reload the browser when. This allows automated build scripts and changes are made in the source files meaning to will not have to update it each time you edit HTML, CSS or JavaScript in the source.

**Gulp-sass** compiles the SASS files into CSS
By running the following command gulp will watch all the source files in the src folder. If any changes are made, the necessary compiling will be done automatically and the relevant files will be copied into its respective folders in the dist folder.
```
$ gulp
```
Note: Since the URL address of the back-end server may change according to the machine on which it is deployed, changing it may be needed front-end as well. This can be done in the file src/js/script.js in the first line of the buildurl() function. 

**Building the front-end**
In gulpfile.js we have defined a build task which compiles all SASS files and copies all HTML, CSS, javaScript and fonts into a directory called /dist.
Thus the webapp should be served from the dist directory and all development must be done in the src directory and applied to the dist directory by running
```
$ gulp build
```




#Read this before you commit

**All changes must be made in the ```src``` folder**

The repository is set up you use gulpJS. This is done so we can  do stuff like keep styling in modules using sass, so we can uglify and minify automatically and to reload the browser when we change files.

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

##other gulp stuff
```gulp build```
will copy files from the src folder and bower_components folder to the dist folder.

When running the local server on localhost:8080 it's root dir is dist/

see ```gulpfile.js``` for all commands and setup.

