Showing your favorate movies in a static web pages, it's a simple way to show it to your friends.
You can get take a look at my example page [here](https://mogen2014.github.io/Udacity-course/assn-movie-trailer/fresh_tomatoes.html), and the source code is [here](https://github.com/mogen2014/Udacity-course/tree/gh-pages/assn-movie-trailer).

## Dependencies

#### Python2

To run this program you need to have the [python](https://www.python.org/downloads/) environment, I'm using python2 and it works well, but I have not tested it in python3 environment yet :)

#### Web page

Some web related lib is used to make the web page looks nicer and  easily created, all of them are included in html header, so you need to make sure your network is good to get those resource. They are:

- [bootstrap](http://getbootstrap.com)
- [jQuery](jquery.com)


## Usage

### Files explanation

- The `media.py` file contains a class called Movie which is the construct class to create movie objects, to creat an movie object you need provide three arguments: movie title, movie poster and an trailer URL.
- The `fres_tomatoes.py` file is the file which contains a `open_movies_page()` function which accept an argument that is a list of movie objects, then it will create a html file and open it in a browser. 
- The `entertainment_center.py` is the actually file you add some of your favorate movie objects through Movie class, then put all the objects in a list, then pass it to function `open_movies_page()`

### Running it

Go to you terminal, `cd` to the project's directory `python entertainment_center.py`