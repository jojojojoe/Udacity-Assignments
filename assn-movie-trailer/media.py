import webbrowser

# create a Movie class to construct movies, it has 3
# properties movie title movie poster and a trailer url
class Movie():
    'Hey this is a class to create my fav movies i wathced before'
    def __init__(self, movie_title, movie_img, movie_trailer_url):
        self.title = movie_title
        self.poster_image_url = movie_img
        self.trailer_youtube_url = movie_trailer_url

    def show_trailer(self):
        webbrowser.open(self.trailer)

