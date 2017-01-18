import fresh_tomatoes
from media import Movie

# create some movie object by Movie class
life_of_pi = Movie('Life Of Pi',
                    'https://upload.wikimedia.org/wikipedia/en/4/45/Life_of_Pi_cover.png',
                    'https://www.youtube.com/watch?v=j9Hjrs6WQ8M')
crounching_tiger = Movie('Crouching Tiger',
                        'https://upload.wikimedia.org/wikipedia/en/9/97/Crouching_tiger_hidden_dragon_poster.jpg',
                    'https://www.youtube.com/watch?v=gLpZ_5bHmo8')


mood_for_love = Movie('In the Mood for Love',
                    'https://upload.wikimedia.org/wikipedia/zh/7/77/In_the_mood_for_love_poster.jpg',
                    'https://www.youtube.com/watch?v=iixUc63lfGc')
blueberry_nights = Movie('My Blueberry Nights',
                    'https://upload.wikimedia.org/wikipedia/en/9/95/My_Blueberry_Nights_poster.jpg',
                    'https://www.youtube.com/watch?v=NTmE8llN1QA')
inside_out = Movie('Inside Out',
                    'https://upload.wikimedia.org/wikipedia/en/thumb/0/0a/Inside_Out_%282015_film%29_poster.jpg/220px-Inside_Out_%282015_film%29_poster.jpg',
                    'https://www.youtube.com/watch?v=yRUAzGQ3nSY')


toy_story = Movie('Toy Story',
                'https://upload.wikimedia.org/wikipedia/zh/d/dc/Movie_poster_toy_story.jpg',
                'https://www.youtube.com/watch?v=KYz2wyBy3kc')

# put all movie objects in a list
movies = [life_of_pi, crounching_tiger, mood_for_love, blueberry_nights, inside_out, toy_story]

# This function call opens the web browser using an array of movie instances.
fresh_tomatoes.open_movies_page(movies)


