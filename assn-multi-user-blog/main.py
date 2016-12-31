#!/usr/bin/python
# -*- coding: utf-8 -*-
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
import time
import string

# inport function and classes from registration module

from registration import Welcome, Signup, Login, Logout, User
from registration import verify_uid_cookie

from models import Article, Comment, LikeArticle

# help method from the course, it's very handy to render templates :)

template_dir = os.path.join(os.path.dirname(__file__), 'templates')
jinja_env = \
    jinja2.Environment(loader=jinja2.FileSystemLoader(template_dir),
                       autoescape=True)


class Handler(webapp2.RequestHandler):

    def write(self, *a, **kw):
        self.response.write(*a, **kw)

    def render_str(self, template, **params):
        t = jinja_env.get_template(template)
        return t.render(params)

    def render(self, template, **kw):
        self.write(self.render_str(template, **kw))


# these helper methods accept an object from Handler class,
# return an object if exists or None

def verify_blog(obj):
    articleid = obj.request.url.split('/')[5]
    blog = Article.get_by_id(int(articleid))
    return blog


# get one comment from url

def verify_comment(obj):
    comment_url_id = obj.request.url.split('/')[7]
    comment = Comment.get_by_id(int(comment_url_id))
    return comment


# get name from cookie

def verify_cookie_name(obj):
    if obj.request.cookies['user_id']:
        cookie = obj.request.cookies.get('user_id')
        cookie_name = verify_uid_cookie(cookie).username.encode('utf8')
    else:
        cookie_name = None
    return cookie_name


# this class will create a blog

class CreateArticle(Handler):

    def get(self):
        cookie_name = verify_cookie_name(self)
        self.response.headers['Content-Type'] = 'text/html'
        self.render('newpost.html', cookie_name=cookie_name, blog=None)

    def post(self):
        cookie_name = verify_cookie_name(self)
        username = self.request.url.split('/')[3]

        # make sure the url on user's browser is not screwed :)

        if cookie_name == username:

            # get user's inputs from newpost page

            subject = self.request.get('subject')
            content = self.request.get('content')

            # this if statement is to make sure both
            # subject and content are not empty

            if subject and content:
                blog = Article(subject=subject, content=content,
                               username=username)

                # put() method is to save all inputs into GAE database

                blog.put()

                # then redirect to the just created blog page

                redirect_url = '/' + username + '/blog/' \
                    + str(blog.key().id())
                self.redirect(redirect_url)
            else:

                # either the subject ot content is empty,
                # display an error message

                error = 'Both Title and content can not be empty'
                self.render(
                    'newpost.html',
                    subject=subject,
                    content=content,
                    error=error,
                    cookie_name=cookie_name,
                    blog=None,
                )
        else:

            self.redirect('/login')


# show all blogs of that logged in user

class ShowUserAllArticle(Handler):

    def get(self):

        # get the current user's cookie to make sure someone
        # else can not access the blogs that are not belongs to him

        cookie_name = verify_cookie_name(self)
        username = self.request.url.split('/')[3]
        if cookie_name == username:

            # this following comment line works fine on my local computer,
            # but after I deploy it on Google app engine, when I click
            # "Myblog" on "welcome page", return an 500 error. After a
            # painful debugging, the follow in line works seems fine
            # blogs = db.GqlQuery("SELECT * FROM Blog WHERE
            # username = :1 ORDER BY created DESC", username)

            # get username from url

            blogs = Article.all().filter('username =', cookie_name)
            self.response.headers['Content-Type'] = 'text/html'
            self.render('show-blogs.html', blogs=blogs,
                        cookie_name=cookie_name)
        else:

            self.write('<h1>URL is not valid<h2>')


# show all blogs in database

class ShowAllArticle(Handler):

    def get(self):
        cookie_name = verify_cookie_name(self)
        blogs = Article.all().order('-created')
        self.response.headers['Content-Type'] = 'text/html'
        self.render('show-blogs.html', blogs=blogs,
                    cookie_name=cookie_name)


class ShowSelctedArticle(Handler):

    def get(self):
        url_username = self.request.url.split('/')[3]

        # get the articleid from the url to query from database

        url_articleid = self.request.url.split('/')[-1]
        articleid = int(url_articleid)
        blog = verify_blog(self)
        cookie_name = verify_cookie_name(self)

        if blog and blog.username == url_username:

            # check if logged in user have liked this article

            liked = False
            logged_in_user_likes = LikeArticle.\
                all().\
                filter('username =',
                       cookie_name).filter('articleid =',
                                           url_articleid).count()
            if logged_in_user_likes > 0:
                liked = True

            # article's likes and comments

            likes = LikeArticle.all().filter('articleid =',
                                             url_articleid).count()
            comments = Comment.all().filter('articleid =',
                                            url_articleid)
            self.response.headers['Content-Type'] = 'text/html'
            self.render(
                'show-selected-blog.html',
                blog=blog,
                liked=liked,
                likes=likes,
                comments=comments,
                cookie_name=cookie_name,
            )
        else:

            # if user messed up url in browser

            self.write('<h1>URL is not valid<h2>')

    def post(self):
        blog = verify_blog(self)
        cookie_name = verify_cookie_name(self)
        if cookie_name != blog.username:
            like_article = LikeArticle(username=cookie_name,
                                       articleid=str(blog.key().id()))
            like_article.put()
            time.sleep(0.5)
            self.redirect('/' + blog.username + '/blog/' +
                          str(blog.key().id()))


class EditArticle(Handler):

    def get(self):
        cookie_name = verify_cookie_name(self)
        url_username = self.request.url.split('/')[3]
        blog = verify_blog(self)

        # after user click blog's edit link, we get blog and url_username
        # from browser's url, then verify if they are valid, in case of
        # user will edit the browser's url and make a GET request

        if blog and cookie_name and url_username == blog.username:
            self.response.headers['Content-Type'] = 'text/html'
            self.render('newpost.html', blog=verify_blog(
                self), error='', cookie_name=cookie_name)
        else:

            # if user messed up url in browser

            self.write('<h1>URL is not valid<h2>')

    def post(self):
        cookie_name = verify_cookie_name(self)
        url_username = self.request.url.split('/')[3]
        blog = verify_blog(self)

        # get content and subject from edted form

        if blog and cookie_name and cookie_name == blog.username:
            subject = self.request.get('subject')
            content = self.request.get('content')

            # only when subject and content is not empty then
            # can be stored in database

            if subject and content:
                blog.subject = subject
                blog.content = content

                # store edted blog to database

                blog.put()

                # get the edted blog url by cut the /edit

                blog_url = self.request.url.rstrip('/edit')

                # after store all data in database, redirect to
                # the edited blog page

                self.redirect(blog_url)
            else:

                # either subject or content is empty will been sent
                # an error msg to browser to display

                self.render('newpost.html',
                            subject=verify_blog(self).subject,
                            content=verify_blog(self).content,
                            cookie_name=cookie_name,
                            error='Boath subject and content should not be empty')
        else:

            # if user messed up url in browser

            self.write('<h1>URL is not valid<h2>')


class DeleteArticle(Handler):

    def get(self):
        cookie_name = verify_cookie_name(self)
        url_username = self.request.url.split('/')[3]
        blog = verify_blog(self)

        # get content and subject from edted form

        if blog and cookie_name and url_username == blog.username:
            self.response.headers['Content-Type'] = 'text/html'
            self.render('delete-blog.html', cookie_name=cookie_name,
                        blog=verify_blog(self))
        else:

            # if user messed up url in browser

            self.write('<h1>URL is not valid<h2>')

    def post(self):
        cookie_name = verify_cookie_name(self)
        blog = verify_blog(self)

        # get content and subject from edted form

        if blog and cookie_name and cookie_name == blog.username:
            blog.delete()

            # get all comments belongs to the deleting blog

            articleid = self.request.url.split('/')[5]
            comments = Comment.all().filter('articleid =', articleid)
            likes = LikeArticle.all().filter('articleid =', articleid)

            # when deleting a blog, it's comments and likes should been
            # deleted either

            for comment in comments:
                comment.delete()
            for like in likes:
                like.delete()

            # wait for database to update delete() method,
            # if redirect immedietly, the blog page will
            # not display the updated blogs

            time.sleep(0.5)
            user_blog_url = '/' + blog.username + '/blog'
            self.redirect(user_blog_url)
        else:

            # if user messed up url in browser

            self.write('<h1>URL is not valid<h2>')


class CommentArticle(Handler):

    def get(self):
        blog = verify_blog(self)
        url_username = self.request.url.split('/')[3]
        cookie_name = verify_cookie_name(self)

        # if blog is exists and the url request is valid,
        # user can create an comment on that blog

        if blog and blog.username == url_username:
            self.render('comment-blog.html', blog=blog,
                        cookie_name=cookie_name, comment=None)
        else:

            # if user messed up url in browser

            self.write('<h1>URL is not valid<h2>')

    def post(self):
        blog = verify_blog(self)
        cookie_name = verify_cookie_name(self)
        url_username = self.request.url.split('/')[3]
        if blog and blog.username == url_username:

            # the user himself should not comment his own blogs

            articleid = self.request.url.split('/')[5]
            comment_content = self.request.get('comment_content')

            # only if comment is not emmty will store comment
            # to database

            if comment_content:
                comment = Comment(comment_content=comment_content,
                                  articleid=articleid,
                                  username=cookie_name)
                comment.put()
                commented_blog_url = self.request.url.rstrip('/comment')

                # wait the data been saved in database

                time.sleep(0.5)
                self.redirect(commented_blog_url)
            else:

                # else send an erro msg to user

                self.render('comment-blog.html', blog=blog,
                            comment=None, cookie_name=cookie_name,
                            error='comment can not be empty.')
        else:

            # if user messed up url in browser

            self.write('<h1>URL is not valid<h2>')


class EditComment(Handler):

    def get(self):
        url_username = self.request.url.split('/')[3]
        cookie_name = verify_cookie_name(self)
        blog = verify_blog(self)
        comment = verify_comment(self)

        # if the request url is valid, then display the edit page

        if blog.username == url_username and comment.username \
                == cookie_name:
            self.render('comment-blog.html', comment=comment,
                        cookie_name=cookie_name, blog=blog)
        else:

            # if user messed up url in browser

            self.write('<h1>URL is not valid<h2>')

    def post(self):
        url_username = self.request.url.split('/')[3]
        cookie_name = verify_cookie_name(self)
        blog = verify_blog(self)
        comment = verify_comment(self)

        # in case user modified url in browser and then submit,
        # we must make sure both blog and comment are exist

        if blog.username == url_username:

            # who can only edit his own comment

            if cookie_name == comment.username:
                articleid = self.request.url.split('/')[5]

                # get content from user input

                comment_content = self.request.get('comment_content')

                # comment can not be empty

                if comment_content:
                    comment.comment_content = \
                        self.request.get('comment_content')
                    comment.put()

                    # wait the data been saved in database

                    time.sleep(0.5)

                    # redirect to that blog page

                    self.redirect('/' + blog.username + '/blog/' +
                                  comment.articleid)
                else:
                    self.write('<h1>comment cant be empty</h1>')
        else:
            self.write('<h1>blog or comment does not exist</h1>')


class DeleteComment(Handler):

    def get(self):
        url_username = self.request.url.split('/')[3]
        cookie_name = verify_cookie_name(self)
        blog = verify_blog(self)
        comment = verify_comment(self)

        # in case user modified url in browser and then submit,
        # we must make sure boath blog and comment are exist

        if comment and blog.username == url_username \
                and comment.username == cookie_name:
            self.render('delete-comment.html', cookie_name=cookie_name,
                        blog=blog)
        else:
            self.write('<h1>Comment does not exist</h1>')

    def post(self):
        url_username = self.request.url.split('/')[3]
        cookie_name = verify_cookie_name(self)
        blog = verify_blog(self)
        comment = verify_comment(self)

        # only logged in user can delete his comment

        if comment and cookie_name:
            if comment.username == cookie_name:

                # delete comment from database

                comment.delete()

                # wait a sec for database updating

                time.sleep(0.5)
                self.redirect('/' + blog.username + '/blog/' +
                              comment.articleid)
        else:

            self.write('<h1>URL is not valid<h2>')


app = webapp2.WSGIApplication([
    ('/.+/blog', ShowUserAllArticle),
    ('/.+/blog/newpost', CreateArticle),
    ('/blog/[0-9]+', ShowSelctedArticle),
    ('/.+/blog/[0-9]+', ShowSelctedArticle),
    ('/.+/blog/[0-9]+/edit', EditArticle),
    ('/.+/blog/[0-9]+/delete', DeleteArticle),
    ('/blogs', ShowAllArticle),
    ('/.+/blog/[0-9]+/comment', CommentArticle),
    ('/.+/blog/[0-9]+/comment/[0-9]+/edit', EditComment),
    ('/.+/blog/[0-9]+/comment/[0-9]+/delete', DeleteComment),
    ('/welcome', Welcome),
    ('/', Signup),
    ('/login', Login),
    ('/logout', Logout),
], debug=True)
