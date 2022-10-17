
import os, json
import pandas as pd

path_to_json = 'info/'
json_files = [pos_json for pos_json in os.listdir(path_to_json) if pos_json.endswith('.json')]
print(json_files)  # for me this prints ['foo.json']

path = 'info/'

json_files = []

for root, dirs, files in os.walk(path):
	for file in files:
		json_files.append(os.path.join(root,file))

json_files = [j for j in json_files if j.endswith('.json')]

print(json_files)

jsons_data = pd.DataFrame(columns=['name', 'code', 'credit', 'quota', 'campus', 'classroom'])

for index, js in enumerate(json_files):
    with open(js) as json_file:
        json_text = json.load(json_file) # for json_text in json_array:
        name = json_text['name']
        code = json_text['code']
        code_check = ['UE', 'UG'] # UP:體育 UE: 師培 UA/UB:共同(中/英) UG:通識
        if code[2:4] not in code_check:
            continue
        print(code[2:4], end=' ')
        credit = json_text['credit']
        quota = json_text['quota']['limit'] + json_text['quota']['additional']
        campus = json_text['schedule'][0]['campus']
        classroom = json_text['schedule'][0]['classroom']
        # here I push a list of data into a pandas DataFrame at row given by 'index'
        jsons_data.loc[index] = [name, code, credit, quota, campus, classroom]

print(jsons_data)

jsons_data.to_csv('GU_EU.csv', sep=',', encoding='utf-8')