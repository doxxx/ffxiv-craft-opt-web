# -*- coding: utf-8 -*-
from __future__ import print_function
import json
import itertools
import operator
import urllib.request 
import requests
import sys

url = "http://api.xivdb.com/search?one=recipes"
r = requests.get(url)
data = r.json()

def makeRecipe(id):
	id_str = str(id)
	r_url = "http://api.xivdb.com/recipe/" + id_str
	r = requests.get(r_url)
	data = r.json()
	sys.stdout.flush()
	sys.stdout.write("\r" + id_str)
	name =  {
	    'de': data['name_de'],
		'en': data['name_en'],
		'fr': data['name_fr'],
		'ja': data['name_ja'],
	}	
	r = {
		'cls': data['class_name'],
		'baselevel': int(data['level_view']),
		'difficulty': int(data['difficulty']),
		'durability': int(data['durability']),
		'level': int(data['level']),
		'maxQuality': int(data['quality']),
		'name': name,		
		'stars': int(data['stars']),
	}
    
	return r
maxId = data['recipes']['results'][0]['id']
allRecipeIds = range(1,maxId)
recipes = [makeRecipe(id)
           for id
           in allRecipeIds]
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

for cls in recipesByClass:
	file = open(cls+'.json','w')
	json.dump(recipesByClass[cls],file)
	file.close()
	
	
