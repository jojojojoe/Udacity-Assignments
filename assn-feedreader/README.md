This project is using [Jasmine framework](https://jasmine.github.io/) to practice TDD in Javascript.

## Usage

1. To run this app you can just open the index.html file in a browser or open this [link](https://mogen2014.github.io/Udacity-course/assn-feedreader/) directly. Or, serve this app on localhost, I choosed one called [browsersync](https://www.browsersync.io/), after it, you can just open the index.html file on localhost.
2. The testings fully depend on [Jasmine](https://jasmine.github.io/), and the app's function is heavily depend on [Jquery](https://jquery.com). Be carefull with the order of the dependencies listed in `index.html` file, keep in mind that the test file `feedreader.js` must be at the bottom before all other source files.
3. Testing file are in `jasmine/spec`.