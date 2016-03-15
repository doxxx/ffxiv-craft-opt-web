# -*- coding: utf-8 -*-
from __future__ import print_function
import json
import itertools
import operator
import urllib.request 
import requests
import sys
import threading

url = "http://api.xivdb.com/search?one=recipes"
r = requests.get(url)
data = r.json()

global recipes
recipes = list()

def chunks(l, n):
    """Yield successive n-sized chunks from l."""
    for i in range(0, len(l), n):
        yield l[i:i+n]

def makeRecipe(id):
	id_str = str(id)
	r_url = "http://api.xivdb.com/recipe/" + id_str
	r = requests.get(r_url)
	data = r.json()
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

def scanChunk(range):
	for id in range:
		id_str = str(id)
		try:
			recipe = makeRecipe(id)
			recipes.append(recipe)
			sys.stdout.flush()
			sys.stdout.write("\r" + id_str + " - DONE ")
		except ValueError:
			sys.stdout.flush()
			sys.stdout.write("\r" + id_str+ " - FALSE")
		
maxId = data['recipes']['results'][0]['id']
allRecipeIds = range(1,maxId+1)

threads = []

for c in chunks(allRecipeIds, 500):
	print ("Start thread - " + str(c))
	thread = threading.Thread(target=scanChunk,args=(c,))
	thread.daemon = True
	thread.start()
	threads.append(thread)
	
# Wait for all threads to complete
for t in threads:
    t.join()

		
#recipes = [makeRecipe(id) for id in allRecipeIds]

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
	
	
