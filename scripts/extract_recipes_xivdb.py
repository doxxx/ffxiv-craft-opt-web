# -*- coding: utf8 -*-
from __future__ import print_function
import json
import itertools
import operator
import urllib.request 

patchNr = "24"
url = "http://api.xivdb.com/search?one=recipes&where=AND&order=DESC&by=main.id&filters=patch="+patchNr
response = urllib.request.urlopen(url).read()
data = json.loads(response.decode('utf-8'))


def makeRecipe(data):
	
	r_url = "http://api.xivdb.com/recipe/" + data['id']
	response = urllib.request.urlopen(r_url).read()
	data = json.loads(response.decode('utf-8'))
	
	name =  {
		'de': data['name_de'],
		'en': data['name_en'],
		'fr': data['name_fr'],
	}	
	r = {
		'cls': data['classjob']['name'],
		'name': name,
		'level': int(data['level_view']),
		'durability': int(data['durability']),
		'difficulty': int(data['difficulty']),
		'maxQuality': int(data['quality'])
	}
	return r

recipes = [makeRecipe(jdata)
           for jdata
           in data['recipes']['results']]
print(recipes)
recipeClassName = operator.itemgetter('cls')
recipes.sort(key=recipeClassName)
recipesByClass = {k:list(v) for k,v in itertools.groupby(recipes, recipeClassName)}
recipeLevel = operator.itemgetter('level')
for cls in recipesByClass:
    clsRecipes = recipesByClass[cls]
    clsRecipes.sort(key=recipeLevel)
    for recipe in clsRecipes:
        del recipe['cls']

recipeDbFile = open('recipedb.js', 'w')
try:
    recipeDbFile.write('FFXIV_Recipe_DB = ')
    json.dump(recipesByClass, recipeDbFile)
finally:
    recipeDbFile.close()
