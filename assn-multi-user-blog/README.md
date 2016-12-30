This is an pretty clean web page can used as multi users blog, it looks simple and so as using it.
You can open directly [here](https://simpleblog-154108.appspot.com/joe/blog), or you can download this project from [Github](https://github.com/mogen2014/Udacity-course/tree/gh-pages/assn-multi-user-blog).

## Dependencies

#### Python2

To run this program you need to have the [python](https://www.python.org/downloads/) environment, I'm using python2 and it works well, but I have not tested it in python3 environment yet :)

#### Web page

Some web related lib is used to make the web page looks nicer and  easily created, all of them are included in html header, so you need to make sure your network is good to get those resource. They are:

- [bootstrap](http://getbootstrap.com)
- [jQuery](jquery.com)

#### Google app engine

I host the whole project on [Google app engine](https://cloud.google.com/appengine), database and server is all based on it. If you want it run on your local machine, you should install it first.

#### jinja2

Jinja2 is used for handling HTML templates, it's very easy to use, such as HTML escaping. I used it mainly for minimizing my code and keep them more structued and easily to maintaine.

## Usage

### Files or folders

- The "stylesheet" folder contains static files mainly are CSS files.
- The "templates" folder contains HTML templates.
- The "main.py" is the file that contains the most part for this program, it contains the blog part. If you want run this program locally, try `dev_appserver.py .`.
- The "registration.py" contains signup and login part, it's been import in "main.py" file.

### Running

- First make sure you have installed Google app engine locally.
- Got to you terminal `cd` into the project's dirctory `dev_appserver.py .`.

