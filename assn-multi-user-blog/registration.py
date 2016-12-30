# Copyright 2016 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import os
import webapp2
import jinja2
import re
import random
import hashlib
import hmac
import string
from google.appengine.ext import db

SECRET = 'jojojoe'


# Cookie helper methods
def create_cookie(uid):
    hash_user_db_id = hmac.new(uid, SECRET).hexdigest()
    return'%s|%s' % (uid, str(hash_user_db_id))
# this method take an cookie as argument, then return an user boject
# if cookie is valid
def varify_uid_cookie(cc):
    cc = cc.encode('utf8')
    cookie = cc.split('|')
    if cc == create_cookie(cookie[0]):
        # if userid is valid
        user = User.get_by_id(int(cookie[0]))
        return user

# password helper methods
# this method return a 5 length random letters
def make_salt():
    return ''.join(random.choice(string.letters) for x in xrange(5))
# use sha256 method to make a password with it's salt
def make_pw_hash(name, pw, salt):
    if not salt:
        salt = make_salt()
    h = hashlib.sha256(name + pw + salt).hexdigest()
    return '%s,%s' % (h, salt)
# validate if the password is valid by the same name password and salt
def valid_pw(name, pw, h):
    salt = h.split(',')[1]
    old_hash = hashlib.sha256(name + pw + salt).hexdigest()
    if h == (old_hash + ',' + salt):
        return True

# help method got from the course, it's very handy to render templates. :)
template_dir = os.path.join(os.path.dirname(__file__), 'templates')
jinja_env = jinja2.Environment(loader = jinja2.FileSystemLoader(template_dir), autoescape=True)
class Handler(webapp2.RequestHandler):
    def write(self, *a, **kw):
        self.response.write(*a, **kw)

    def render_str(self, template, **params):
        t = jinja_env.get_template(template)
        return t.render(params)

    def render(self, template, **kw):
        self.write(self.render_str(template, **kw))

# create a User database from google apple engine datastore
class User(db.Model):
    username = db.StringProperty(required = True)
    password = db.TextProperty(required = True)
    email = db.StringProperty()

    @classmethod
    def register(cls, username, password, email):
        # store to database
        newuser = User(username=username, password=password, email=email)
        newuser.put()
        return newuser

    @classmethod
    def get_uid(cls, user):
        return str(user.key().id())

    @classmethod
    def login(cls, username, password):
        db_user = db.GqlQuery("select * from User where username = '%s'" % username).get()
        if db_user:
            user_pw_db = db_user.password
            user_salt_db = user_pw_db.split(',')[1]
            hash_pw = make_pw_hash(username, password, user_salt_db)
            if user_pw_db == hash_pw:
                return db_user

    @classmethod
    def get_user_cookie(cls, user):
        user_db_id = User.get_uid(user)
        user_id_cookie = create_cookie(user_db_id)
        return user_id_cookie

# if user logged in or signed up successfully 
# redirect to this welcome page
class Welcome(Handler):
    def get(self):
        user_id_cookie = self.request.cookies.get('user_id').encode('utf8')
        # check if user logged in or signed up
        if user_id_cookie:
            user = varify_uid_cookie(user_id_cookie)
            if user:
                self.render('welcome.html', cookie_name = user.username)
            else:
                self.redirect('/signup')
        else:
            self.redirect('/signup')
# sign up page
class Signup(Handler):
    username_error = ''
    password_error = ''
    varify_error = ''
    email_error = ''

    def get(self):
        user_id = self.request.cookies.get('user_id')
        # first check if is logged in
        if user_id:
            user_id = user_id.encode('utf8')
            user = varify_uid_cookie(user_id)
            if user:
                self.render('welcome.html', username = user.username)
            else:
                self.render('signup.html',
                            username_error='',
                            password_error='',
                            varify_error = '',
                            email_error='')
        # if not logged in render signup page for sign up or login
        else:
            self.render('signup.html', username_error='', password_error='', varify_error = '', email_error='')

    # this method take a username as argument look up 
    # if user name has been existed in database
    # and check if it is a valid username for us
    def verify_username_input(self, username):
        q = db.GqlQuery("SELECT * FROM User WHERE username = '%s'" % username)
        if q.get():
            self.username_error = 'Username already exists!'
            return None
        else:
            self.username_error = 'Username not valid!'
            return (re.compile(r"^[a-zA-Z0-9_-]{3,20}$")).match(username)
    # varify users password
    def verify_password_input(self, password):
        return (re.compile(r"^.{3,20}$")).match(password)
    # when signing up, make sure the two passwords user typed in 
    # are the same
    def verify_same_pw_input(self, pw1, pw2):
        return pw1 == pw2
    # user regular expression to varify an email address
    def verify_email_input(self, email):
        return (re.compile(r"^[\S]+@[\S]+.[\S]+$")).match(email)

    def post(self):
        # get user input
        username = self.request.get('username').encode('utf8')
        password = self.request.get('password').encode('utf8')
        verify = self.request.get('verify').encode('utf8')
        email = self.request.get('email').encode('utf8')
        # verify password email  username
        if self.verify_password_input(password) == None:
            self.password_error = 'Password is not valid'

        if not self.verify_same_pw_input(password, verify):
            self.varify_error = 'Passwords are not matched'

        if self.verify_email_input(email) == None:
            self.email_error = 'Email is not valid'

        if self.verify_username_input(username) != None and \
           self.verify_password_input(password) != None and \
           self.verify_same_pw_input(password, verify) == True:
            hash_pw = make_pw_hash(username, password,'')
            user = User.register(username, hash_pw, email)
            user_id_cookie = User.get_user_cookie(user)
            # if all is valid then set a cookie for user and redirect to welcome page
            self.response.headers.add_header('Set-Cookie','user_id=%s; Path=/' % user_id_cookie)
            self.redirect('/welcome')
        else:
            self.render('signup.html',
                         username=username,
                         password=password,
                         verify=verify,
                         email=email,
                         username_error=self.username_error,
                         password_error=self.password_error,
                         varify_error = self.varify_error,
                         email_error=self.email_error)
            print self.username_error, self.varify_error, self.email_error
            
# login page
class Login(Handler):
    def get(self):
        # check if already logged in
        user_id_cookie = self.request.cookies.get('user_id')
        if user_id_cookie:
            user = varify_uid_cookie(user_id_cookie)
            # if user is logged in redirect to welcome page
            if user:
                self.redirect('welcome')
            else:
                self.render('login.html')
        else:
            self.render('login.html')

    def post(self):
        # varify username and password
        username = self.request.get('username').encode('utf8')
        password = self.request.get('password').encode('utf8')
        db_user = User.login(username,password)
        # if user is valid set a cookie and redirect to welcome page
        if db_user:
            user_id_cookie = User.get_user_cookie(db_user)
            self.response.headers.add_header('Set-Cookie','user_id=%s; Path=/' % user_id_cookie)
            self.redirect('welcome')
        else:
            self.render('login.html',login_error = 'Username or password not valid')

# logout page
class Logout(Handler):
    def get(self):
        self.response.headers.add_header('Set-Cookie','user_id=%s; Path=/' % '')
        self.redirect('/')
