I have being living in this city calld 'Chongqing' for about 4 years, Here is some places that near me and I think they all are very interesting. 

##Usage

### About this app
1. The index.html file is html file which structured the web page. To run this app you can open that file directly or host it on your localhost, to run an localhost serve I choosed [browsersync](https://www.browsersync.io/) for test convenience.
2. The map comes from [Google Maps API](https://developers.google.com/maps/).
3. The map infowindow data comes from [wikipedia API](https://www.mediawiki.org/w/api.php), include the image and sentences.
4. [Bootstrap](http://getbootstrap.com/) is used to make the page responsive.
3. I choosed a MVVM style library called [Knockout](http://knockoutjs.com/) to separate my view and data. It has a lot features that help me a lot, such as updating the view automatically and bingding data, it has utilities like filtering a list.

### About the web page
1. Open the web [page](https://mogen2014.github.io/Udacity-course/assn-neighborhood-map/) you will find a few markers in a Google map.
2. You can click on the markers to get more infomation on that location, will show a image and a few sentences, all that window showing comes from Wikipedia page.
3. On the left side there is a location list and an input box that you can input some text to narrow down the list. You can click on the location on that list, it will trigger the selected marker to show detail infomation window.