from google.appengine.ext import db


class Article(db.Model):
    "Article database"
    subject = db.StringProperty(required=True)
    content = db.TextProperty(required=True)
    created = db.DateTimeProperty(auto_now_add=True)
    username = db.StringProperty(required=True)


class Comment(db.Model):
    "User Comments database"
    comment_content = db.StringProperty(required=True, multiline=True)
    username = db.StringProperty(required=True)
    articleid = db.StringProperty(required=True)


class LikeArticle(db.Model):
    "User Liks db"
    username = db.StringProperty(required=True)
    articleid = db.StringProperty(required=True)